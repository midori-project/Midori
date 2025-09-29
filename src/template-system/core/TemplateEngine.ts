/**
 * TemplateEngine - ตัวหลักของระบบ Template
 * รวมทุกส่วนเข้าด้วยกันและให้ API ที่ง่ายต่อการใช้งาน
 */

import { Template, UserData, ProcessedTemplate } from '../types/Template';
import { TemplateProcessor } from './TemplateProcessor';
import { ExportEngine, ExportOptions, ExportResult } from '../engines/ExportEngine';

export interface TemplateEngineOptions {
  outputDir?: string;
  autoExport?: boolean;
  exportFormat?: 'zip' | 'files' | 'json';
  includeManifest?: boolean;
  includeMetadata?: boolean;
}

export interface TemplateEngineResult {
  success: boolean;
  template: ProcessedTemplate;
  export?: ExportResult;
  error?: string;
  processingTime: number;
}

export class TemplateEngine {
  private processor: TemplateProcessor;
  private exportEngine: ExportEngine;
  private options: TemplateEngineOptions;

  constructor(options: TemplateEngineOptions = {}) {
    this.options = {
      outputDir: './output',
      autoExport: true,
      exportFormat: 'zip',
      includeManifest: true,
      includeMetadata: false,
      ...options
    };

    this.processor = new TemplateProcessor();
    this.exportEngine = new ExportEngine(this.options.outputDir);
  }

  /**
   * ประมวลผล template หลัก
   */
  async processTemplate(template: Template, userData: UserData): Promise<TemplateEngineResult> {
    const startTime = Date.now();
    console.log(`🚀 [TemplateEngine] เริ่มประมวลผล template: ${template.key}`);

    try {
      // 1. ประมวลผล template
      const processedTemplate = await this.processor.processTemplate(template, userData);
      console.log(`✅ [TemplateEngine] ประมวลผล template เสร็จสิ้น`);

      // 2. ส่งออกไฟล์ (ถ้าเปิดใช้งาน)
      let exportResult: ExportResult | undefined;
      if (this.options.autoExport) {
        console.log(`📦 [TemplateEngine] เริ่มส่งออกไฟล์`);
        
        const exportOptions: ExportOptions = {
          format: this.options.exportFormat!,
          includeManifest: this.options.includeManifest,
          includeMetadata: this.options.includeMetadata
        };

        exportResult = await this.exportEngine.exportTemplate(processedTemplate, exportOptions);
        console.log(`✅ [TemplateEngine] ส่งออกไฟล์เสร็จสิ้น: ${exportResult.outputPath}`);
      }

      const processingTime = Date.now() - startTime;
      console.log(`🎉 [TemplateEngine] ประมวลผลเสร็จสิ้นใน ${processingTime}ms`);

      return {
        success: true,
        template: processedTemplate,
        export: exportResult,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [TemplateEngine] ข้อผิดพลาด:`, error);
      
      return {
        success: false,
        template: {} as ProcessedTemplate,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      };
    }
  }

  /**
   * ประมวลผล template จากไฟล์ JSON
   */
  async processTemplateFromFile(templatePath: string, userData: UserData): Promise<TemplateEngineResult> {
    try {
      console.log(`📄 [TemplateEngine] โหลด template จากไฟล์: ${templatePath}`);
      
      const templateContent = await this.loadTemplateFile(templatePath);
      const template: Template = JSON.parse(templateContent);
      
      return await this.processTemplate(template, userData);
      
    } catch (error) {
      console.error(`❌ [TemplateEngine] ข้อผิดพลาดในการโหลด template:`, error);
      
      return {
        success: false,
        template: {} as ProcessedTemplate,
        error: `Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processingTime: 0
      };
    }
  }

  /**
   * ส่งออก template ที่ประมวลผลแล้ว
   */
  async exportProcessedTemplate(
    template: ProcessedTemplate, 
    options: ExportOptions
  ): Promise<ExportResult> {
    console.log(`📦 [TemplateEngine] ส่งออก template: ${template.manifest.name}`);
    
    return await this.exportEngine.exportTemplate(template, options);
  }

  /**
   * สร้างโปรเจกต์พร้อมไฟล์ configuration
   */
  async createFullProject(template: ProcessedTemplate, outputPath: string): Promise<ExportResult> {
    console.log(`🏗️ [TemplateEngine] สร้างโปรเจกต์เต็มรูปแบบ: ${template.manifest.name}`);
    
    try {
      // ส่งออกไฟล์หลัก
      const exportResult = await this.exportEngine.exportTemplate(template, {
        format: 'files',
        outputPath,
        includeManifest: true,
        includeMetadata: true
      });

      if (!exportResult.success) {
        throw new Error(exportResult.error || 'Export failed');
      }

      // สร้างไฟล์ configuration เพิ่มเติม
      await this.exportEngine.generateReadme(template, outputPath);
      await this.exportEngine.generatePackageJson(template, outputPath);
      await this.exportEngine.generateConfigFiles(template, outputPath);
      await this.exportEngine.generateIndexHtml(template, outputPath);

      console.log(`✅ [TemplateEngine] สร้างโปรเจกต์เต็มรูปแบบเสร็จสิ้น: ${outputPath}`);
      
      return {
        ...exportResult,
        fileCount: exportResult.fileCount + 5 // เพิ่มไฟล์ config
      };

    } catch (error) {
      console.error(`❌ [TemplateEngine] ข้อผิดพลาดในการสร้างโปรเจกต์:`, error);
      
      return {
        success: false,
        outputPath: '',
        format: 'files',
        fileCount: 0,
        totalSize: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ตรวจสอบ template
   */
  async validateTemplate(template: Template): Promise<boolean> {
    console.log(`🔍 [TemplateEngine] ตรวจสอบ template: ${template.key}`);
    
    try {
      const validation = await this.processor.validateTemplate(template);
      console.log(`✅ [TemplateEngine] ตรวจสอบเสร็จ: ${validation.isValid ? 'ผ่าน' : 'ไม่ผ่าน'}`);
      
      if (!validation.isValid) {
        console.warn(`⚠️ [TemplateEngine] ข้อผิดพลาด:`, validation.errors);
      }
      
      if (validation.warnings.length > 0) {
        console.warn(`⚠️ [TemplateEngine] คำเตือน:`, validation.warnings);
      }
      
      return validation.isValid;
      
    } catch (error) {
      console.error(`❌ [TemplateEngine] ข้อผิดพลาดในการตรวจสอบ:`, error);
      return false;
    }
  }

  /**
   * รายการธีมที่มี
   */
  getAvailableThemes(): string[] {
    return this.processor['themeEngine'].listThemes();
  }

  /**
   * ตรวจสอบธีม
   */
  validateTheme(themeName: string): boolean {
    const theme = this.processor['themeEngine'].getTheme(themeName);
    return theme ? this.processor['themeEngine'].validateTheme(theme) : false;
  }

  /**
   * สร้างตัวอย่างข้อมูลผู้ใช้
   */
  generateSampleUserData(businessType: string = 'general'): UserData {
    const sampleData: Record<string, UserData> = {
      food: {
        brandName: 'ร้านหมูปิ้งอร่อย',
        theme: 'cozy',
        content: {
          heroTitle: 'ยินดีต้อนรับสู่ร้านหมูปิ้งอร่อย',
          heroSubtitle: 'หมูปิ้งสดใหม่ ปรุงรสแบบไทยแท้',
          ctaLabel: 'สั่งซื้อเลย'
        },
        customizations: {
          colors: {
            primary: '#10b981',
            secondary: '#f97316'
          }
        }
      },
      fashion: {
        brandName: 'Fashion Store',
        theme: 'modern',
        content: {
          heroTitle: 'สไตล์ที่ใช่ สำหรับคุณ',
          heroSubtitle: 'เสื้อผ้าแฟชั่นสไตล์ใหม่ ราคาเป็นมิตร',
          ctaLabel: 'ช้อปเลย'
        },
        customizations: {
          colors: {
            primary: '#3b82f6',
            secondary: '#f59e0b'
          }
        }
      },
      technology: {
        brandName: 'Tech Store',
        theme: 'minimal',
        content: {
          heroTitle: 'เทคโนโลยีที่ล้ำสมัย',
          heroSubtitle: 'เทคโนโลยีล้ำสมัย ราคาเป็นมิตร',
          ctaLabel: 'ดูสินค้า'
        },
        customizations: {
          colors: {
            primary: '#64748b',
            secondary: '#3b82f6'
          }
        }
      },
      general: {
        brandName: 'ร้านค้าออนไลน์',
        theme: 'modern',
        content: {
          heroTitle: 'ยินดีต้อนรับสู่ร้านค้าออนไลน์',
          heroSubtitle: 'บริการคุณภาพดี ราคาเป็นมิตร',
          ctaLabel: 'เริ่มช้อป'
        },
        customizations: {}
      }
    };

    return sampleData[businessType] || sampleData.general;
  }

  /**
   * ตั้งค่าตัวเลือก
   */
  setOptions(options: Partial<TemplateEngineOptions>): void {
    this.options = { ...this.options, ...options };
    
    // อัพเดท export engine ถ้า outputDir เปลี่ยน
    if (options.outputDir) {
      this.exportEngine = new ExportEngine(options.outputDir);
    }
  }

  /**
   * ดึงการตั้งค่าปัจจุบัน
   */
  getOptions(): TemplateEngineOptions {
    return { ...this.options };
  }

  /**
   * สถิติการใช้งาน
   */
  getStats(): {
    availableThemes: number;
    outputDirectory: string;
    autoExport: boolean;
    exportFormat: string;
  } {
    return {
      availableThemes: this.getAvailableThemes().length,
      outputDirectory: this.options.outputDir!,
      autoExport: this.options.autoExport!,
      exportFormat: this.options.exportFormat!
    };
  }

  /**
   * โหลดไฟล์ template
   */
  private async loadTemplateFile(templatePath: string): Promise<string> {
    // ตรวจสอบว่าเราอยู่ใน server-side หรือ client-side
    if (typeof window === 'undefined') {
      // Server-side: ใช้ fs
      try {
        const fs = await import('fs');
        return fs.readFileSync(templatePath, 'utf8');
      } catch (error) {
        console.warn(`⚠️ [TemplateEngine] ไม่สามารถโหลดไฟล์ ${templatePath}:`, error);
        return '';
      }
    } else {
      // Client-side: ใช้ fetch
      try {
        const response = await fetch(templatePath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
      } catch (error) {
        console.warn(`⚠️ [TemplateEngine] ไม่สามารถโหลดไฟล์ ${templatePath}:`, error);
        return '';
      }
    }
  }

  /**
   * บันทึก template ที่ประมวลผลแล้ว
   */
  async saveProcessedTemplate(template: ProcessedTemplate, filePath: string): Promise<void> {
    console.log(`💾 [TemplateEngine] บันทึก template: ${filePath}`);
    
    try {
      const content = JSON.stringify(template, null, 2);
      
      // ตรวจสอบว่าเราอยู่ใน server-side หรือ client-side
      if (typeof window === 'undefined') {
        // Server-side: ใช้ fs
        const fs = await import('fs');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ [TemplateEngine] บันทึกเสร็จสิ้น: ${filePath}`);
      } else {
        // Client-side: ใช้ Blob และ download
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop() || 'template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log(`✅ [TemplateEngine] ดาวน์โหลดไฟล์: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ [TemplateEngine] ข้อผิดพลาดในการบันทึก:`, error);
      throw error;
    }
  }

  /**
   * โหลด template ที่ประมวลผลแล้ว
   */
  async loadProcessedTemplate(filePath: string): Promise<ProcessedTemplate> {
    console.log(`📂 [TemplateEngine] โหลด template: ${filePath}`);
    
    try {
      let content: string;
      
      // ตรวจสอบว่าเราอยู่ใน server-side หรือ client-side
      if (typeof window === 'undefined') {
        // Server-side: ใช้ fs
        const fs = await import('fs');
        content = fs.readFileSync(filePath, 'utf8');
      } else {
        // Client-side: ใช้ fetch
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        content = await response.text();
      }
      
      const template = JSON.parse(content) as ProcessedTemplate;
      console.log(`✅ [TemplateEngine] โหลดเสร็จสิ้น: ${template.manifest.name}`);
      return template;
    } catch (error) {
      console.error(`❌ [TemplateEngine] ข้อผิดพลาดในการโหลด:`, error);
      throw error;
    }
  }

  /**
   * สร้าง template ใหม่จากข้อมูล
   */
  createTemplateFromData(
    key: string,
    label: string,
    category: string,
    sourceFiles: any[],
    slots: any,
    constraints: any
  ): Template {
    return {
      key,
      label,
      category,
      meta: {
        description: `${label} template`,
        engine: 'react-vite-tailwind',
        status: 'published',
        author: 'Midori Team',
        versioningPolicy: 'semver'
      },
      tags: [category, 'react', 'tailwind', 'placeholder', 'ai-ready'],
      initialVersion: {
        version: 1,
        semver: '1.0.0',
        status: 'published',
        sourceFiles,
        slots,
        constraints
      },
      placeholderConfig: {
        hasPlaceholders: true,
        placeholderTypes: {
          tw: 0,
          text: 0,
          img: 0,
          data: 0
        },
        themeMapping: {
          modern: 'primary:sky-600; accent:amber-400; radius:xl; elevation:lg',
          cozy: 'primary:emerald-600; accent:orange-400; radius:lg; elevation:md',
          minimal: 'primary:gray-600; accent:blue-400; radius:sm; elevation:sm'
        }
      }
    };
  }
}
