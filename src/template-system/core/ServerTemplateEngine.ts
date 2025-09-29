/**
 * 🖥️ Server-Side Template Engine
 * สำหรับใช้ใน API routes และ server-side operations
 */

import { Template, UserData, ProcessedTemplate } from '../types/Template';
import { TemplateProcessor } from './TemplateProcessor';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export interface ServerTemplateEngineOptions {
  outputDir: string;
  autoExport: boolean;
  exportFormat: 'json' | 'yaml' | 'zip';
}

export class ServerTemplateEngine {
  private processor: TemplateProcessor;
  private options: ServerTemplateEngineOptions;

  constructor(options: Partial<ServerTemplateEngineOptions> = {}) {
    this.options = {
      outputDir: options.outputDir || './output',
      autoExport: options.autoExport || false,
      exportFormat: options.exportFormat || 'json'
    };
    
    this.processor = new TemplateProcessor();
    this.ensureOutputDir();
  }

  /**
   * สร้าง output directory
   */
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
      console.log(`📁 [ServerTemplateEngine] สร้าง output directory: ${this.options.outputDir}`);
    }
  }

  /**
   * ประมวลผล template
   */
  async processTemplate(template: Template, userData: UserData): Promise<{
    success: boolean;
    processedTemplate?: ProcessedTemplate;
    finalJson?: any;
    error?: string;
    processingTime: number;
    outputPath?: string;
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 [ServerTemplateEngine] เริ่มประมวลผล template: ${template.label}`);
      
      // ประมวลผล template
      const processedTemplate = await this.processor.processTemplate(template, userData);
      
      // สร้าง finalJson ที่รวม options เข้าด้วยกัน
      const finalJson = {
        ...processedTemplate,
        options: {
          ...userData,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      };
      
      const processingTime = Date.now() - startTime;
      
      // บันทึกไฟล์ถ้าเปิด autoExport
      let outputPath: string | undefined;
      if (this.options.autoExport) {
        outputPath = await this.saveProcessedTemplate(processedTemplate);
      }
      
      console.log(`✅ [ServerTemplateEngine] ประมวลผลเสร็จสิ้น (${processingTime}ms)`);
      
      return {
        success: true,
        processedTemplate,
        finalJson,
        processingTime,
        outputPath
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ [ServerTemplateEngine] ข้อผิดพลาด:`, error);
      
      return {
        success: false,
        error: errorMessage,
        processingTime
      };
    }
  }

  /**
   * บันทึก template ที่ประมวลผลแล้ว
   */
  async saveProcessedTemplate(template: ProcessedTemplate, customPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = customPath || `${template.manifest.name}-${timestamp}.${this.options.exportFormat}`;
    const filePath = path.join(this.options.outputDir, filename);
    
    console.log(`💾 [ServerTemplateEngine] บันทึก template: ${filePath}`);
    
    try {
      let content: string;
      
      switch (this.options.exportFormat) {
        case 'json':
          content = JSON.stringify(template, null, 2);
          break;
        case 'yaml':
          const yaml = await import('js-yaml');
          content = yaml.dump(template);
          break;
        case 'zip':
          // สำหรับ zip format จะต้องใช้ library เพิ่มเติม
          content = JSON.stringify(template, null, 2);
          break;
        default:
          content = JSON.stringify(template, null, 2);
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ [ServerTemplateEngine] บันทึกเสร็จสิ้น: ${filePath}`);
      
      return filePath;
    } catch (error) {
      console.error(`❌ [ServerTemplateEngine] ข้อผิดพลาดในการบันทึก:`, error);
      throw error;
    }
  }

  /**
   * โหลด template ที่ประมวลผลแล้ว
   */
  async loadProcessedTemplate(filePath: string): Promise<ProcessedTemplate> {
    console.log(`📂 [ServerTemplateEngine] โหลด template: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const template = JSON.parse(content) as ProcessedTemplate;
      console.log(`✅ [ServerTemplateEngine] โหลดเสร็จสิ้น: ${template.manifest.name}`);
      return template;
    } catch (error) {
      console.error(`❌ [ServerTemplateEngine] ข้อผิดพลาดในการโหลด:`, error);
      throw error;
    }
  }

  /**
   * สร้าง template ใหม่จากข้อมูล
   */
  createTemplateFromData(data: any): Template {
    const templateId = createHash('md5').update(JSON.stringify(data)).digest('hex').substring(0, 8);
    
    return {
      key: `template-${templateId}`,
      label: data.label || 'Generated Template',
      category: data.category || 'general',
      meta: {
        description: data.description || 'Auto-generated template',
        engine: 'react-vite-tailwind',
        status: 'draft',
        author: 'ServerTemplateEngine',
        versioningPolicy: 'semver'
      },
      tags: data.tags || ['generated'],
      initialVersion: {
        version: 1,
        semver: '1.0.0',
        status: 'draft',
        sourceFiles: data.sourceFiles || [],
        slots: data.slots || {},
        constraints: data.constraints || {}
      },
      placeholderConfig: {
        hasPlaceholders: true,
        placeholderTypes: {
          text: 0,
          tw: 0,
          img: 0,
          data: 0
        },
        themeMapping: {}
      }
    };
  }

  /**
   * ตรวจสอบ template
   */
  async validateTemplate(template: Template): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!template.key) errors.push('Template key is required');
    if (!template.label) errors.push('Template label is required');
    if (!template.initialVersion) errors.push('Initial version is required');
    
    // ตรวจสอบ source files
    if (!template.initialVersion.sourceFiles || template.initialVersion.sourceFiles.length === 0) {
      warnings.push('No source files found');
    }
    
    // ตรวจสอบ placeholders
    if (template.placeholderConfig?.hasPlaceholders) {
      const totalPlaceholders = Object.values(template.placeholderConfig.placeholderTypes || {}).reduce((sum, count) => sum + count, 0);
      if (totalPlaceholders === 0) {
        warnings.push('Template has placeholders enabled but no placeholder types defined');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * สร้าง manifest สำหรับ template
   */
  createManifest(template: Template, userData: UserData): any {
    return {
      name: template.label,
      version: template.initialVersion.semver,
      description: template.meta.description,
      author: template.meta.author,
      category: template.category,
      tags: template.tags,
      createdAt: new Date().toISOString(),
      userData: {
        brandName: userData.brandName,
        theme: userData.theme
      },
      processingInfo: {
        engine: 'ServerTemplateEngine',
        timestamp: new Date().toISOString(),
        processingTime: 0 // จะถูกอัปเดตใน processTemplate
      }
    };
  }

  /**
   * รับข้อมูลสถิติ
   */
  getStats(): {
    outputDir: string;
    exportFormat: string;
    autoExport: boolean;
  } {
    return {
      outputDir: this.options.outputDir,
      exportFormat: this.options.exportFormat,
      autoExport: this.options.autoExport
    };
  }
}
