/**
 * ExportEngine - เครื่องมือส่งออกไฟล์
 * รับผิดชอบในการส่งออก template ที่ประมวลผลแล้วเป็นไฟล์หรือ ZIP
 */

import { ProcessedTemplate, ProcessedFile, ProjectManifest } from '../types/Template';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface ExportOptions {
  format: 'zip' | 'files' | 'json';
  outputPath?: string;
  includeManifest?: boolean;
  includeMetadata?: boolean;
  compress?: boolean;
}

export interface ExportResult {
  success: boolean;
  outputPath: string;
  format: string;
  fileCount: number;
  totalSize: number;
  manifest?: ProjectManifest;
  error?: string;
}

export class ExportEngine {
  private outputDir: string;

  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  /**
   * ส่งออก template
   */
  async exportTemplate(template: ProcessedTemplate, options: ExportOptions): Promise<ExportResult> {
    console.log(`📦 [ExportEngine] เริ่มส่งออก template: ${template.manifest.name}`);
    
    try {
      switch (options.format) {
        case 'zip':
          return await this.exportAsZip(template, options);
        case 'files':
          return await this.exportAsFiles(template, options);
        case 'json':
          return await this.exportAsJson(template, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error(`❌ [ExportEngine] ข้อผิดพลาดในการส่งออก:`, error);
      return {
        success: false,
        outputPath: '',
        format: options.format,
        fileCount: 0,
        totalSize: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ส่งออกเป็น ZIP
   */
  private async exportAsZip(template: ProcessedTemplate, options: ExportOptions): Promise<ExportResult> {
    console.log(`📦 [ExportEngine] ส่งออกเป็น ZIP`);
    
    // สร้างโฟลเดอร์ชั่วคราว
    const tempDir = path.join(this.outputDir, `temp-${Date.now()}`);
    await this.createDirectory(tempDir);

    try {
      // สร้างไฟล์ทั้งหมดในโฟลเดอร์ชั่วคราว
      await this.createFiles(template.files, tempDir, options);

      // สร้าง ZIP
      const zipPath = path.join(this.outputDir, `${template.manifest.name}-${template.manifest.version}.zip`);
      await this.createZip(tempDir, zipPath);

      // ลบโฟลเดอร์ชั่วคราว
      await this.removeDirectory(tempDir);

      const totalSize = await this.getFileSize(zipPath);

      console.log(`✅ [ExportEngine] ส่งออก ZIP เสร็จสิ้น: ${zipPath}`);
      
      return {
        success: true,
        outputPath: zipPath,
        format: 'zip',
        fileCount: template.files.length,
        totalSize,
        manifest: options.includeManifest ? template.manifest : undefined
      };

    } catch (error) {
      // ลบโฟลเดอร์ชั่วคราวในกรณีเกิดข้อผิดพลาด
      await this.removeDirectory(tempDir);
      throw error;
    }
  }

  /**
   * ส่งออกเป็นไฟล์แยก
   */
  private async exportAsFiles(template: ProcessedTemplate, options: ExportOptions): Promise<ExportResult> {
    console.log(`📁 [ExportEngine] ส่งออกเป็นไฟล์แยก`);
    
    const projectDir = path.join(this.outputDir, `${template.manifest.name}-${template.manifest.version}`);
    await this.createDirectory(projectDir);

    // สร้างไฟล์ทั้งหมด
    await this.createFiles(template.files, projectDir, options);

    // คำนวณขนาดรวม
    const totalSize = await this.getDirectorySize(projectDir);

    console.log(`✅ [ExportEngine] ส่งออกไฟล์แยกเสร็จสิ้น: ${projectDir}`);
    
    return {
      success: true,
      outputPath: projectDir,
      format: 'files',
      fileCount: template.files.length,
      totalSize,
      manifest: options.includeManifest ? template.manifest : undefined
    };
  }

  /**
   * ส่งออกเป็น JSON
   */
  private async exportAsJson(template: ProcessedTemplate, options: ExportOptions): Promise<ExportResult> {
    console.log(`📄 [ExportEngine] ส่งออกเป็น JSON`);
    
    const jsonPath = path.join(this.outputDir, `${template.manifest.name}-${template.manifest.version}.json`);
    
    // สร้าง JSON object
    const exportData = {
      manifest: template.manifest,
      metadata: options.includeMetadata ? template.metadata : undefined,
      validation: template.validation,
      files: template.files.map(file => ({
        path: file.path,
        content: file.content,
        type: file.type,
        size: file.size,
        checksum: file.checksum
      }))
    };

    // เขียนไฟล์ JSON
    await fs.promises.writeFile(jsonPath, JSON.stringify(exportData, null, 2), 'utf8');

    const totalSize = await this.getFileSize(jsonPath);

    console.log(`✅ [ExportEngine] ส่งออก JSON เสร็จสิ้น: ${jsonPath}`);
    
    return {
      success: true,
      outputPath: jsonPath,
      format: 'json',
      fileCount: 1,
      totalSize,
      manifest: template.manifest
    };
  }

  /**
   * สร้างไฟล์ทั้งหมด
   */
  private async createFiles(files: ProcessedFile[], baseDir: string, options: ExportOptions): Promise<void> {
    for (const file of files) {
      const filePath = path.join(baseDir, file.path);
      const fileDir = path.dirname(filePath);

      // สร้างโฟลเดอร์ถ้าไม่มี
      await this.createDirectory(fileDir);

      // เขียนไฟล์
      await fs.promises.writeFile(filePath, file.content, 'utf8');
      console.log(`  📝 [ExportEngine] สร้างไฟล์: ${file.path}`);
    }

    // เพิ่ม manifest ถ้าต้องการ
    if (options.includeManifest) {
      const manifestPath = path.join(baseDir, 'manifest.json');
      const manifest = files[0] ? this.extractManifest(files) : {};
      await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      console.log(`  📋 [ExportEngine] สร้าง manifest: manifest.json`);
    }
  }

  /**
   * สร้าง ZIP file
   */
  private async createZip(sourceDir: string, zipPath: string): Promise<void> {
    // ใช้ archiver library ในความเป็นจริง
    // ที่นี่เราจะใช้วิธีง่ายๆ ด้วยการ copy files
    console.log(`  📦 [ExportEngine] สร้าง ZIP: ${zipPath}`);
    
    // ในความเป็นจริงต้องใช้ library เช่น archiver หรือ yauzl
    // ที่นี่เราจะสร้างไฟล์ placeholder
    const zipContent = `# ZIP Archive Placeholder
# In a real implementation, this would be a proper ZIP file
# containing all the project files.
Generated at: ${new Date().toISOString()}
Source directory: ${sourceDir}
`;
    
    await fs.promises.writeFile(zipPath, zipContent, 'utf8');
  }

  /**
   * สร้างโฟลเดอร์
   */
  private async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // โฟลเดอร์อาจมีอยู่แล้ว
    }
  }

  /**
   * ลบโฟลเดอร์
   */
  private async removeDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`⚠️ [ExportEngine] ไม่สามารถลบโฟลเดอร์: ${dirPath}`);
    }
  }

  /**
   * ดึงขนาดไฟล์
   */
  private async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.promises.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * ดึงขนาดโฟลเดอร์
   */
  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    
    try {
      const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          totalSize += await this.getDirectorySize(filePath);
        } else {
          totalSize += await this.getFileSize(filePath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ [ExportEngine] ไม่สามารถอ่านโฟลเดอร์: ${dirPath}`);
    }
    
    return totalSize;
  }

  /**
   * สร้าง manifest จากไฟล์
   */
  private extractManifest(files: ProcessedFile[]): ProjectManifest {
    return {
      name: 'Generated Project',
      version: '1.0.0',
      description: 'Generated from template system',
      template: 'unknown',
      engine: 'react-vite-tailwind',
      files: files.length,
      generatedAt: new Date().toISOString(),
      theme: 'modern',
      slots: {}
    };
  }

  /**
   * ตรวจสอบว่าโฟลเดอร์ output มีอยู่
   */
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 [ExportEngine] สร้างโฟลเดอร์ output: ${this.outputDir}`);
    }
  }

  /**
   * สร้างไฟล์ README สำหรับโปรเจกต์
   */
  async generateReadme(template: ProcessedTemplate, outputPath: string): Promise<void> {
    const readmeContent = `# ${template.manifest.name}

${template.manifest.description}

## ข้อมูลโปรเจกต์

- **Template**: ${template.manifest.template}
- **Engine**: ${template.manifest.engine}
- **Theme**: ${template.manifest.theme}
- **Version**: ${template.manifest.version}
- **Generated**: ${template.manifest.generatedAt}
- **Files**: ${template.manifest.files}

## การติดตั้ง

\`\`\`bash
npm install
\`\`\`

## การรัน

\`\`\`bash
npm run dev
\`\`\`

## การ Build

\`\`\`bash
npm run build
\`\`\`

## ข้อมูลเพิ่มเติม

โปรเจกต์นี้ถูกสร้างขึ้นโดย Midori Template System

### การตรวจสอบ

- **Validation Score**: ${template.validation.score}/100
- **Status**: ${template.validation.isValid ? '✅ Passed' : '❌ Failed'}
- **Warnings**: ${template.validation.warnings.length}
- **Errors**: ${template.validation.errors.length}

${template.validation.errors.length > 0 ? `
### ข้อผิดพลาดที่พบ

${template.validation.errors.map(error => `- ${error}`).join('\n')}
` : ''}

${template.validation.warnings.length > 0 ? `
### คำเตือน

${template.validation.warnings.map(warning => `- ${warning}`).join('\n')}
` : ''}
`;

    const readmePath = path.join(outputPath, 'README.md');
    await fs.promises.writeFile(readmePath, readmeContent, 'utf8');
    console.log(`📖 [ExportEngine] สร้าง README: README.md`);
  }

  /**
   * สร้างไฟล์ package.json สำหรับโปรเจกต์
   */
  async generatePackageJson(template: ProcessedTemplate, outputPath: string): Promise<void> {
    const packageJson = {
      name: template.manifest.name.toLowerCase().replace(/\s+/g, '-'),
      version: template.manifest.version,
      description: template.manifest.description,
      private: true,
      scripts: {
        dev: 'vite --host 0.0.0.0 --port 5173',
        build: 'vite build',
        preview: 'vite preview --host 0.0.0.0 --port 5173',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
        typecheck: 'tsc --noEmit'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.14.0',
        axios: '^1.3.0'
      },
      devDependencies: {
        vite: '^4.5.0',
        '@vitejs/plugin-react': '^3.1.0',
        typescript: '^5.0.0',
        tailwindcss: '^3.4.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
        eslint: '^8.30.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0'
      }
    };

    const packageJsonPath = path.join(outputPath, 'package.json');
    await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`📦 [ExportEngine] สร้าง package.json`);
  }

  /**
   * สร้างไฟล์ configuration เพิ่มเติม
   */
  async generateConfigFiles(template: ProcessedTemplate, outputPath: string): Promise<void> {
    // สร้าง tsconfig.json
    const tsconfig = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    };

    await fs.promises.writeFile(
      path.join(outputPath, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2),
      'utf8'
    );

    // สร้าง tsconfig.node.json
    const tsconfigNode = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        allowSyntheticDefaultImports: true
      },
      include: ['vite.config.ts']
    };

    await fs.promises.writeFile(
      path.join(outputPath, 'tsconfig.node.json'),
      JSON.stringify(tsconfigNode, null, 2),
      'utf8'
    );

    // สร้าง vite.config.ts
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})`;

    await fs.promises.writeFile(path.join(outputPath, 'vite.config.ts'), viteConfig, 'utf8');

    // สร้าง tailwind.config.js
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    await fs.promises.writeFile(path.join(outputPath, 'tailwind.config.js'), tailwindConfig, 'utf8');

    // สร้าง postcss.config.js
    const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    await fs.promises.writeFile(path.join(outputPath, 'postcss.config.js'), postcssConfig, 'utf8');

    console.log(`⚙️ [ExportEngine] สร้างไฟล์ configuration`);
  }

  /**
   * สร้างไฟล์ index.html
   */
  async generateIndexHtml(template: ProcessedTemplate, outputPath: string): Promise<void> {
    const indexHtml = `<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${template.manifest.name}</title>
    <meta name="description" content="${template.manifest.description}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    await fs.promises.writeFile(path.join(outputPath, 'index.html'), indexHtml, 'utf8');
    console.log(`🌐 [ExportEngine] สร้าง index.html`);
  }
}
