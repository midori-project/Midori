/**
 * TemplateProcessor - ตัวประมวลผล Template หลัก
 * รับผิดชอบในการประมวลผล template และจัดการ workflow ทั้งหมด
 */

import { Template, ProcessedTemplate, UserData, SourceFile, ProcessedFile, ProjectManifest, TemplateMetadata, ValidationResult } from '../types/Template';
import { PlaceholderReplacer } from './PlaceholderReplacer';
import { AIContentGenerator } from './AIContentGenerator';
import { ThemeEngine } from './ThemeEngine';
import { SlotManager } from './SlotManager';
import { TemplateValidator } from './TemplateValidator';
import { createHash } from 'crypto';

export class TemplateProcessor {
  private placeholderReplacer: PlaceholderReplacer;
  private aiContentGenerator: AIContentGenerator;
  private themeEngine: ThemeEngine;
  private slotManager: SlotManager;
  private validator: TemplateValidator;

  constructor() {
    this.placeholderReplacer = new PlaceholderReplacer();
    this.aiContentGenerator = new AIContentGenerator();
    this.themeEngine = new ThemeEngine();
    this.slotManager = new SlotManager();
    this.validator = new TemplateValidator();
  }

  /**
   * ประมวลผล template หลัก
   */
  async processTemplate(template: Template, userData: UserData): Promise<ProcessedTemplate> {
    const startTime = Date.now();
    console.log(`🚀 [TemplateProcessor] เริ่มประมวลผล template: ${template.key}`);

    try {
      // 1. เตรียมข้อมูลและตรวจสอบ
      const validatedData = await this.prepareUserData(userData, template);
      console.log(`✅ [TemplateProcessor] เตรียมข้อมูลเสร็จสิ้น`);

      // 2. เตรียมข้อมูลสำหรับ AI (จะใช้ใน PlaceholderReplacer)
      console.log(`🤖 [TemplateProcessor] เตรียมข้อมูลสำหรับ AI placeholder generation`);

      // 3. เติมข้อมูลใน slots (ไม่ใช้ AI content generation แบบเก่า)
      const emptyAIContent = {
        text: '',
        heroTitle: '',
        heroSubtitle: '',
        features: [],
        aboutContent: { story: '', values: [], team: [] },
        contactInfo: { phone: '', email: '', address: '', hours: '' },
        productInfo: { categories: [], featuredProducts: [] },
        seoContent: { title: '', description: '', keywords: [] }
      };
      const filledSlots = await this.slotManager.fillSlots(template.initialVersion.slots, validatedData, emptyAIContent);
      console.log(`📊 [TemplateProcessor] เติม slots เสร็จสิ้น`);

      // 4. ประมวลผลไฟล์ต้นฉบับ (AI จะทำงานใน PlaceholderReplacer)
      const processedFiles = await this.processSourceFiles(template.initialVersion.sourceFiles, {
        ...validatedData,
        slots: filledSlots,
        useAI: true // เปิดใช้งาน AI
      }, template);
      console.log(`📁 [TemplateProcessor] ประมวลผลไฟล์เสร็จสิ้น: ${processedFiles.length} ไฟล์`);

      // 5. ตรวจสอบผลลัพธ์
      const validation = await this.validator.validateTemplate(processedFiles, template.initialVersion.constraints);
      console.log(`🔍 [TemplateProcessor] ตรวจสอบเสร็จสิ้น: ${validation.isValid ? 'ผ่าน' : 'ไม่ผ่าน'}`);

      // 6. สร้าง manifest และ metadata
      const manifest = this.generateManifest(template, validatedData, processedFiles);
      const metadata = this.generateMetadata(template, processedFiles, validation, Date.now() - startTime);

      const result: ProcessedTemplate = {
        files: processedFiles,
        manifest,
        metadata,
        validation
      };

      console.log(`🎉 [TemplateProcessor] ประมวลผลเสร็จสิ้นใน ${metadata.processingTime}ms`);
      return result;

    } catch (error) {
      console.error(`❌ [TemplateProcessor] เกิดข้อผิดพลาด:`, error);
      throw new Error(`Template processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * เตรียมและตรวจสอบข้อมูลผู้ใช้
   */
  private async prepareUserData(userData: UserData, template: Template): Promise<UserData> {
    const preparedData: UserData = {
      ...userData,
      brandName: userData.brandName || 'ร้านค้าออนไลน์',
      theme: userData.theme || 'modern',
      content: userData.content || {},
      images: userData.images || {},
      slots: userData.slots || {},
      customizations: userData.customizations || {}
    };

    // ตรวจสอบ theme ที่เลือก
    const availableThemes = Object.keys(template.placeholderConfig.themeMapping);
    if (!availableThemes.includes(preparedData.theme!)) {
      console.warn(`⚠️ [TemplateProcessor] Theme '${preparedData.theme}' ไม่พบ ใช้ 'modern' แทน`);
      preparedData.theme = 'modern';
    }

    return preparedData;
  }

  /**
   * ประมวลผลไฟล์ต้นฉบับ
   */
  private async processSourceFiles(sourceFiles: SourceFile[], data: any, template?: Template): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = [];

    for (const sourceFile of sourceFiles) {
      try {
        console.log(`📝 [TemplateProcessor] ประมวลผลไฟล์: ${sourceFile.path}`);
        
        let content = sourceFile.content;

        // แทนที่ placeholder (พร้อม AI)
        content = await this.placeholderReplacer.replacePlaceholders(content, data, template);

        // ใช้ theme engine
        content = this.themeEngine.applyTheme(content, data.theme, data.customizations);

        // สร้าง processed file
        const processedFile: ProcessedFile = {
          path: sourceFile.path,
          content,
          type: sourceFile.type,
          size: Buffer.byteLength(content, 'utf8'),
          checksum: this.generateChecksum(content)
        };

        processedFiles.push(processedFile);
        console.log(`✅ [TemplateProcessor] ประมวลผลไฟล์เสร็จ: ${sourceFile.path} (${processedFile.size} bytes)`);

      } catch (error) {
        console.error(`❌ [TemplateProcessor] ข้อผิดพลาดในการประมวลผลไฟล์ ${sourceFile.path}:`, error);
        throw error;
      }
    }

    return processedFiles;
  }

  /**
   * สร้าง manifest สำหรับโปรเจกต์
   */
  private generateManifest(template: Template, userData: UserData, files: ProcessedFile[]): ProjectManifest {
    return {
      name: userData.brandName || template.key,
      version: template.initialVersion.semver,
      description: template.meta.description,
      template: template.key,
      engine: template.meta.engine,
      files: files.length,
      generatedAt: new Date().toISOString(),
      theme: userData.theme || 'modern',
      slots: userData.slots || {}
    };
  }

  /**
   * สร้าง metadata สำหรับผลลัพธ์
   */
  private generateMetadata(template: Template, files: ProcessedFile[], validation: ValidationResult, processingTime: number): TemplateMetadata {
    const placeholderCount = files.reduce((count, file) => {
      const matches = file.content.match(/<[^>]*\/>/g) || [];
      return count + matches.length;
    }, 0);

    return {
      processingTime,
      placeholderCount,
      themeApplied: template.placeholderConfig.themeMapping.modern || 'modern',
      validationPassed: validation.isValid,
      warnings: validation.warnings
    };
  }

  /**
   * สร้าง checksum สำหรับไฟล์
   */
  private generateChecksum(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * ตรวจสอบ template ก่อนประมวลผล
   */
  async validateTemplate(template: Template): Promise<ValidationResult> {
    console.log(`🔍 [TemplateProcessor] ตรวจสอบ template: ${template.key}`);
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // ตรวจสอบโครงสร้าง template
    if (!template.key) errors.push('Template key is required');
    if (!template.initialVersion) errors.push('Template initialVersion is required');
    if (!template.initialVersion.sourceFiles || template.initialVersion.sourceFiles.length === 0) {
      errors.push('Template must have at least one source file');
    }

    // ตรวจสอบ placeholder config
    if (!template.placeholderConfig) {
      warnings.push('Template missing placeholderConfig');
    }

    // ตรวจสอบ constraints
    if (!template.initialVersion.constraints) {
      warnings.push('Template missing constraints');
    }

    const isValid = errors.length === 0;
    const score = isValid ? 100 - warnings.length * 10 : 0;

    console.log(`✅ [TemplateProcessor] ตรวจสอบเสร็จ: ${isValid ? 'ผ่าน' : 'ไม่ผ่าน'}`);
    
    return {
      isValid,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }
}
