import { GeneratedFile, ProjectStructure, GenerationOptions } from './types';
import { FileGenerator } from './file-generator';
import { CodeFormatter } from '../code-formatter';
import { CodeValidator } from '../code-validator';

export class EnhancedFileGenerator {
  
  /**
   * สร้างไฟล์พร้อม formatting และ validation
   */
  static async generateHighQualityFiles(
    finalJson: Record<string, unknown>,
    projectStructure: ProjectStructure,
    options: GenerationOptions
  ): Promise<{
    files: GeneratedFile[];
    quality: {
      score: number;
      issues: Array<{
        file: string;
        type: 'error' | 'warning' | 'info';
        message: string;
        line?: number;
      }>;
    };
  }> {
    console.log('🎯 Starting high-quality file generation...');
    
    // สร้างไฟล์
    const files = await FileGenerator.generateEssentialFilesOnly(finalJson, projectStructure, options);
    
    // จัดรูปแบบโค้ด
    const formattedFiles = await CodeFormatter.formatAllFiles(files);
    
    // ตรวจสอบคุณภาพ
    const quality = CodeValidator.validateCodeQuality(formattedFiles);
    
    // แก้ไข issues ที่แก้ไขได้อัตโนมัติ
    const improvedFiles = CodeValidator.autoFixIssues(formattedFiles);
    
    // ตรวจสอบคุณภาพอีกครั้ง
    const finalQuality = CodeValidator.validateCodeQuality(improvedFiles);
    
    console.log(`✅ Generated ${improvedFiles.length} files with quality score: ${finalQuality.score}/100`);
    
    return {
      files: improvedFiles,
      quality: finalQuality
    };
  }

  /**
   * สร้างไฟล์แบบ progressive (ทีละส่วน)
   */
  static async generateProgressiveFiles(
    finalJson: Record<string, unknown>,
    projectStructure: ProjectStructure,
    options: GenerationOptions,
    onProgress?: (progress: number, currentFile: string) => void
  ): Promise<GeneratedFile[]> {
    console.log('🔄 Starting progressive file generation...');
    
    const files: GeneratedFile[] = [];
    const essentialFiles = FileGenerator.getEssentialFilesByBusinessContext(
      await UserIntentAnalyzer.analyzeBusinessContext(finalJson), 
      projectStructure
    );
    
    for (let i = 0; i < essentialFiles.length; i++) {
      const fileConfig = essentialFiles[i];
      const progress = (i / essentialFiles.length) * 100;
      
      onProgress?.(progress, fileConfig.path);
      
      try {
        const file = await FileGenerator.generateEssentialFile(fileConfig, projectStructure, finalJson);
        const formattedFile = await CodeFormatter.formatCode(file);
        files.push(formattedFile);
        
        console.log(`✅ Generated ${fileConfig.path} (${i + 1}/${essentialFiles.length})`);
      } catch (error) {
        console.error(`❌ Failed to generate ${fileConfig.path}:`, error);
        // Continue with next file
      }
    }
    
    onProgress?.(100, 'Completed');
    console.log('✅ Progressive generation completed');
    
    return files;
  }

  /**
   * สร้างไฟล์พร้อม error handling ที่ดี
   */
  static async generateWithErrorHandling(
    finalJson: Record<string, unknown>,
    projectStructure: ProjectStructure,
    options: GenerationOptions
  ): Promise<{
    files: GeneratedFile[];
    errors: Array<{
      file: string;
      error: string;
    }>;
    quality: {
      score: number;
      issues: Array<{
        file: string;
        type: 'error' | 'warning' | 'info';
        message: string;
        line?: number;
      }>;
    };
  }> {
    console.log('🛡️ Starting generation with error handling...');
    
    const errors: Array<{ file: string; error: string }> = [];
    
    try {
      const result = await this.generateHighQualityFiles(finalJson, projectStructure, options);
      
      return {
        files: result.files,
        errors,
        quality: result.quality
      };
    } catch (error) {
      console.error('❌ Generation failed:', error);
      
      // สร้าง fallback files
      const fallbackFiles = await this.generateFallbackFiles(projectStructure);
      
      return {
        files: fallbackFiles,
        errors: [{ file: 'generation', error: error instanceof Error ? error.message : 'Unknown error' }],
        quality: { score: 0, issues: [] }
      };
    }
  }

  /**
   * สร้าง fallback files เมื่อ generation ล้มเหลว
   */
  private static async generateFallbackFiles(projectStructure: ProjectStructure): Promise<GeneratedFile[]> {
    console.log('🔄 Generating fallback files...');
    
    const fallbackFiles: GeneratedFile[] = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: projectStructure.name.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          dependencies: {
            'react': '^18.0.0',
            'react-dom': '^18.0.0'
          }
        }, null, 2),
        type: 'config',
        language: 'json'
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to ${projectStructure.name}</h1>
      <p>${projectStructure.description}</p>
    </div>
  );
}

export default App;`,
        type: 'component',
        language: 'typescript'
      },
      {
        path: 'src/index.css',
        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.App {
  text-align: center;
  padding: 2rem;
}`,
        type: 'style',
        language: 'css'
      }
    ];
    
    return fallbackFiles;
  }
}
