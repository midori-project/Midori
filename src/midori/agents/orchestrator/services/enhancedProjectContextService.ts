/**
 * Enhanced Project Context Service
 * Service for managing component-based project context
 */

import { prisma } from '@/libs/prisma/prisma';
import { ProjectContextService } from './projectContextService';
import { ThemePackGenerator } from '@/midori/agents/frontend-v2/theme-pack';
import { BlueprintSelector } from '@/midori/agents/frontend-v2/blueprint'; // NEW IMPORT
import type {
  EnhancedProjectContextData,
  CreateEnhancedProjectContextInput,
  UpdateEnhancedProjectContextInput,
  MigrationOptions,
  MigrationResult,
  ValidationResult,
  ComponentLibraryRef,
  ThemePack,
  Blueprint,
  LayoutConfig,
  ComponentSelection,
  PageSpec,
  QualityMetrics,
  LegacyTemplateData
} from '../types/enhancedProjectContext';
import type { ProjectContextData } from '../types/projectContext';

export class EnhancedProjectContextService {
  
  // ============================
  // Create Enhanced Project Context
  // ============================
  
  static async createEnhancedProjectContext(
    input: CreateEnhancedProjectContextInput
  ): Promise<EnhancedProjectContextData> {
    
    // 1. สร้าง base project context ก่อน
    const baseContext = await ProjectContextService.createProjectContext({
      projectId: input.projectId,
      specBundleId: `spec_${input.projectId}`,
      projectType: this.mapBusinessCategoryToProjectType(input.businessCategory),
      status: 'created',
      components: [],
      pages: [],
      styling: this.generateDefaultStyling(input.themePack),
      conversationHistory: {
        messages: [],
        currentContext: input.userInput,
        lastIntent: 'create_website',
        lastAction: 'initialize_project',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      userPreferences: {
        language: 'auto', // Auto-detect language from user input
        theme: 'light',
        autoSave: true,
        notifications: true,
        customSettings: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // 2. สร้าง ThemePack (ใช้ Generator ถ้าไม่มี input)
    const themePack = input.themePack || ThemePackGenerator.generate({
      businessCategory: input.businessCategory,
      keywords: [input.userInput, ...this.extractKeywordsFromInput(input.userInput)],
      userInput: input.userInput,
      style: 'modern',
      tone: 'friendly'
    });
    
    // 3. สร้าง Blueprint (ใช้ Selector ถ้าไม่มี input)
    const blueprint = input.blueprint || BlueprintSelector.select({
      businessCategory: input.businessCategory,
      features: this.extractFeaturesFromInput(input.userInput),
      complexity: 'moderate', // Default to moderate
      customRequirements: []
    });
    
    // 4. สร้าง enhanced context data
    const enhancedContext: EnhancedProjectContextData = {
      ...baseContext,
      
      // Component-based fields
      componentLibrary: input.componentSelection ? {
        libraryId: 'default-library',
        version: '1.0.0',
        components: input.componentSelection.selectedComponents.map(c => c.componentId)
      } : undefined,
      
      themePack,
      blueprint,
      layout: this.generateDefaultLayout(blueprint),
      componentSelection: input.componentSelection,
      
      // PageSpec integration
      pageSpec: this.generatePageSpec(input),
      
      // Migration status
      migrationStatus: input.migrationStatus || 'migrated',
      legacyData: input.legacyData,
      
      // Version control
      version: '1.0.0',
      schemaVersion: '2.0.0',
      
      // Quality metrics (initial)
      quality: this.initializeQualityMetrics()
    };
    
    // 3. บันทึก enhanced data ลง database (JSON field)
    await this.saveEnhancedData(input.projectId, enhancedContext);
    
    return enhancedContext;
  }
  
  // ============================
  // Get Enhanced Project Context
  // ============================
  
  static async getEnhancedProjectContext(
    projectId: string
  ): Promise<EnhancedProjectContextData | null> {
    
    // 1. ดึง base context
    const baseContext = await ProjectContextService.getProjectContext(projectId);
    if (!baseContext) return null;
    
    // 2. ดึง enhanced data
    const enhancedData = await this.loadEnhancedData(projectId);
    
    // 3. รวม data
    const enhancedContext: EnhancedProjectContextData = {
      ...baseContext,
      ...enhancedData,
      migrationStatus: enhancedData?.migrationStatus || 'legacy',
      version: enhancedData?.version || '1.0.0',
      schemaVersion: enhancedData?.schemaVersion || '2.0.0'
    };
    
    return enhancedContext;
  }
  
  // ============================
  // Update Enhanced Project Context
  // ============================
  
  static async updateEnhancedProjectContext(
    input: UpdateEnhancedProjectContextInput
  ): Promise<EnhancedProjectContextData> {
    
    // 1. ดึง context ปัจจุบัน
    const currentContext = await this.getEnhancedProjectContext(input.projectId);
    if (!currentContext) {
      throw new Error(`Project context not found: ${input.projectId}`);
    }
    
    // 2. อัปเดต fields
    const updatedContext: EnhancedProjectContextData = {
      ...currentContext,
      ...input.partialUpdate,
      themePack: input.themePack || currentContext.themePack,
      blueprint: input.blueprint || currentContext.blueprint,
      layout: input.layout || currentContext.layout,
      componentSelection: input.componentSelection || currentContext.componentSelection,
      quality: input.quality || currentContext.quality,
      lastModified: new Date(),
      version: this.incrementVersion(currentContext.version)
    };
    
    // 3. บันทึกลง database
    await this.saveEnhancedData(input.projectId, updatedContext);
    
    return updatedContext;
  }
  
  // ============================
  // Migration Methods
  // ============================
  
  static async migrateToComponentBased(
    projectId: string,
    options: MigrationOptions = {
      preserveLegacyData: true,
      validateAfterMigration: true,
      createBackup: true,
      dryRun: false
    }
  ): Promise<MigrationResult> {
    
    const startTime = new Date().toISOString();
    const warnings: string[] = [];
    const errors: string[] = [];
    
    try {
      // 1. ดึง legacy context
      const legacyContext = await ProjectContextService.getProjectContext(projectId);
      if (!legacyContext) {
        throw new Error(`Project not found: ${projectId}`);
      }
      
      // 2. สร้าง backup (ถ้าต้องการ)
      if (options.createBackup) {
        await this.createBackup(projectId, legacyContext);
      }
      
      // 3. แปลง legacy data เป็น component-based
      const migratedData = await this.convertLegacyToComponentBased(legacyContext);
      
      // 4. Validate (ถ้าต้องการ)
      if (options.validateAfterMigration) {
        const validation = await this.validateEnhancedContext(migratedData);
        if (!validation.isValid) {
          errors.push(...validation.errors.map(e => e.message));
          warnings.push(...validation.warnings.map(w => w.message));
        }
      }
      
      // 5. บันทึก (ถ้าไม่ใช่ dry run)
      if (!options.dryRun) {
        await this.saveEnhancedData(projectId, migratedData);
      }
      
      const endTime = new Date().toISOString();
      
      return {
        success: errors.length === 0,
        projectId,
        migratedData,
        warnings,
        errors,
        metrics: {
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
          dataSize: JSON.stringify(migratedData).length
        }
      };
      
    } catch (error) {
      const endTime = new Date().toISOString();
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      return {
        success: false,
        projectId,
        migratedData: {} as EnhancedProjectContextData,
        warnings,
        errors,
        metrics: {
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
          dataSize: 0
        }
      };
    }
  }
  
  // ============================
  // Helper Methods
  // ============================
  
  private static mapBusinessCategoryToProjectType(
    businessCategory: string
  ): 'e_commerce' | 'coffee_shop' | 'restaurant' | 'portfolio' | 'blog' | 'landing_page' | 'business' | 'personal' {
    const mapping: Record<string, any> = {
      'restaurant': 'restaurant',
      'ecommerce': 'e_commerce',
      'portfolio': 'portfolio',
      'healthcare': 'business',
      'pharmacy': 'business'
    };
    return mapping[businessCategory] || 'business';
  }
  
  /**
   * Extract keywords from user input
   */
  private static extractKeywordsFromInput(input: string): string[] {
    const keywords: string[] = [];
    
    // Color keywords
    const colorWords = ['ฟ้า', 'แดง', 'ส้ม', 'เหลือง', 'เขียว', 'ม่วง', 'ชมพู', 'น้ำตาล', 'เทา', 'ดำ', 'ขาว',
                        'blue', 'red', 'orange', 'yellow', 'green', 'purple', 'pink', 'brown', 'gray', 'black', 'white'];
    
    // Tone keywords  
    const toneWords = ['อุ่น', 'เย็น', 'สดใส', 'warm', 'cool', 'vibrant', 'colorful'];
    
    // Style keywords
    const styleWords = ['ทันสมัย', 'โมเดิร์น', 'คลาสสิก', 'มินิมอล', 'เรียบง่าย',
                        'modern', 'classic', 'minimal', 'creative'];
    
    const allKeywords = [...colorWords, ...toneWords, ...styleWords];
    const lowerInput = input.toLowerCase();
    
    for (const keyword of allKeywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        keywords.push(keyword);
      }
    }
    
    return keywords;
  }
  
  /**
   * Extract features from user input
   */
  private static extractFeaturesFromInput(input: string): string[] {
    const features: string[] = [];
    const lowerInput = input.toLowerCase();
    
    // Feature keywords map
    const featureMap: Record<string, string[]> = {
      'menu': ['เมนู', 'menu', 'อาหาร', 'food', 'รายการ', 'สินค้า'],
      'about': ['เกี่ยวกับ', 'about', 'เรื่องราว', 'story', 'ประวัติ'],
      'contact': ['ติดต่อ', 'contact', 'ที่อยู่', 'address', 'โทร', 'phone'],
      'reservation': ['จอง', 'reservation', 'booking', 'ที่นั่ง'],
      'cart': ['ตะกร้า', 'cart', 'ซื้อ', 'buy', 'สั่งซื้อ'],
      'gallery': ['รูปภาพ', 'gallery', 'ภาพ', 'image', 'photo'],
      'testimonial': ['รีวิว', 'review', 'testimonial', 'ความคิดเห็น'],
      'team': ['ทีม', 'team', 'สมาชิก', 'member', 'พนักงาน'],
      'blog': ['blog', 'บล็อก', 'article', 'บทความ'],
      'faq': ['faq', 'คำถาม', 'question', 'ถามตอบ']
    };
    
    // Check which features are mentioned
    for (const [feature, keywords] of Object.entries(featureMap)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        features.push(feature);
      }
    }
    
    // Default features if none found
    if (features.length === 0) {
      features.push('about', 'contact');
    }
    
    return features;
  }
  
  private static generateDefaultStyling(themePack?: ThemePack): any {
    if (themePack) {
      return {
        theme: {
          name: themePack.name,
          primary: themePack.colorPalette.primary[500],
          secondary: themePack.colorPalette.secondary[500],
          accent: themePack.colorPalette.accent[500],
          neutral: themePack.colorPalette.neutral[500],
          success: themePack.colorPalette.semantic.success,
          warning: themePack.colorPalette.semantic.warning,
          error: themePack.colorPalette.semantic.error
        },
        colors: themePack.colorPalette,
        fonts: themePack.typography.fontFamily,
        spacing: themePack.spacing,
        breakpoints: {}
      };
    }
    
    // Default styling
    return {
      theme: {
        name: 'default',
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#F59E0B',
        neutral: '#9CA3AF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      colors: {},
      fonts: {},
      spacing: {},
      breakpoints: {}
    };
  }
  
  private static generateDefaultLayout(blueprint?: Blueprint): LayoutConfig | undefined {
    if (!blueprint) return undefined;
    
    return {
      type: 'single-column',
      header: {
        slotId: 'header',
        componentId: 'navbar-basic',
        variantId: 'default',
        props: {},
        position: 0,
        visibility: 'always'
      },
      hero: {
        slotId: 'hero',
        componentId: 'hero-basic',
        variantId: 'default',
        props: {},
        position: 1,
        visibility: 'always'
      },
      sections: [],
      footer: {
        slotId: 'footer',
        componentId: 'footer-basic',
        variantId: 'default',
        props: {},
        position: 999,
        visibility: 'always'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
  
  private static generatePageSpec(input: CreateEnhancedProjectContextInput): PageSpec {
    return {
      domain: input.businessCategory,
      themePack: input.themePack?.id || 'default',
      blueprint: input.blueprint?.id || 'onepager-v1',
      slots: {
        header: {
          slotId: 'header',
          componentId: 'navbar-basic',
          variantId: 'default',
          props: {},
          position: 0,
          visibility: 'always'
        },
        hero: {
          slotId: 'hero',
          componentId: 'hero-basic',
          variantId: 'default',
          props: {},
          position: 1,
          visibility: 'always'
        },
        sections: [],
        footer: {
          slotId: 'footer',
          componentId: 'footer-basic',
          variantId: 'default',
          props: {},
          position: 999,
          visibility: 'always'
        }
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        author: 'system',
        status: 'draft'
      }
    };
  }
  
  private static initializeQualityMetrics(): QualityMetrics {
    return {
      accessibility: {
        score: 0,
        issues: [],
        warnings: [],
        passed: false
      },
      performance: {
        score: 0,
        metrics: {
          loadTime: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0
        },
        passed: false
      },
      seo: {
        score: 0,
        issues: [],
        warnings: [],
        passed: false
      },
      userExperience: {
        score: 0,
        factors: {
          navigation: 0,
          readability: 0,
          mobileResponsiveness: 0,
          visualHierarchy: 0
        },
        passed: false
      },
      overallScore: 0
    };
  }
  
  private static async saveEnhancedData(
    projectId: string,
    data: EnhancedProjectContextData
  ): Promise<void> {
    // บันทึก enhanced data ลง frontendV2Data field
    await prisma.projectContext.update({
      where: { projectId },
      data: {
        frontendV2Data: JSON.parse(JSON.stringify({
          componentLibrary: data.componentLibrary,
          themePack: data.themePack,
          blueprint: data.blueprint,
          layout: data.layout,
          componentSelection: data.componentSelection,
          pageSpec: data.pageSpec,
          migrationStatus: data.migrationStatus,
          legacyData: data.legacyData,
          version: data.version,
          schemaVersion: data.schemaVersion,
          quality: data.quality
        }))
      }
    });
  }
  
  private static async loadEnhancedData(
    projectId: string
  ): Promise<Partial<EnhancedProjectContextData> | null> {
    const projectContext = await prisma.projectContext.findUnique({
      where: { projectId },
      select: { frontendV2Data: true }
    });
    
    if (!projectContext?.frontendV2Data) return null;
    
    return projectContext.frontendV2Data as any;
  }
  
  private static async createBackup(
    projectId: string,
    data: ProjectContextData
  ): Promise<void> {
    // สร้าง backup ใน database หรือ file system
    console.log(`Creating backup for project ${projectId}`);
    // TODO: Implement backup logic
  }
  
  private static async convertLegacyToComponentBased(
    legacyContext: ProjectContextData
  ): Promise<EnhancedProjectContextData> {
    // แปลง legacy data เป็น component-based
    // TODO: Implement conversion logic
    
    return {
      ...legacyContext,
      migrationStatus: 'migrated',
      version: '1.0.0',
      schemaVersion: '2.0.0',
      quality: this.initializeQualityMetrics()
    } as EnhancedProjectContextData;
  }
  
  private static async validateEnhancedContext(
    context: EnhancedProjectContextData
  ): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // TODO: Implement validation logic
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalChecks: 10,
        passed: 10 - errors.length,
        failed: errors.length,
        warnings: warnings.length,
        successRate: ((10 - errors.length) / 10) * 100
      }
    };
  }
  
  private static incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2] || '0');
    return `${parts[0]}.${parts[1]}.${patch + 1}`;
  }
}

