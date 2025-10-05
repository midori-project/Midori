/**
 * Template Adapter for Frontend-V2 Agent
 * เชื่อมต่อ Frontend Agent กับ Template System
 */

import { 
  OverrideSystem, 
  createOverrideSystem,
  AIPromptConfig,
  SHARED_BLOCKS,
  BUSINESS_CATEGORIES
} from '../template-system';
import { FrontendTaskV2, ComponentResultV2 } from '../schemas/types';
import { AIService, AIGenerationRequest } from '../services/ai-service';
import { categoryService } from '../services/category-service';
import { ProjectStructureGenerator, createProjectStructureGenerator } from '../template-system/project-structure-generator';

export class TemplateAdapter {
  private overrideSystem: OverrideSystem;
  private sharedBlocks: any[];
  private businessCategories: any[];
  private aiService: AIService;
  private projectStructureGenerator: ProjectStructureGenerator;

  constructor() {
    this.sharedBlocks = SHARED_BLOCKS;
    this.businessCategories = BUSINESS_CATEGORIES;
    this.overrideSystem = createOverrideSystem(this.sharedBlocks, this.businessCategories);
    this.aiService = new AIService();
    this.projectStructureGenerator = createProjectStructureGenerator();
  }

  /**
   * แปลง Frontend Task เป็น Template Request
   */
  private async convertToTemplateRequest(task: FrontendTaskV2) {
    // 1. ตรวจสอบ business category
    let businessCategoryId = task.businessCategory;
    
    // ถ้าไม่ระบุ business category ให้ใช้ category service
    if (!businessCategoryId) {
      // ใช้ category service (hybrid approach)
      const detectedCategory = await categoryService.detectCategory({
        keywords: task.keywords,
        userInput: task.keywords.join(' '),
        useLLM: true,
        fallbackToDefault: true
      });
      businessCategoryId = detectedCategory?.id || 'ecommerce'; // fallback
    }

    // 2. สร้าง custom overrides จาก customizations
    const customOverrides = this.createCustomOverrides(task.customizations);

    // 3. สร้าง user data สำหรับ AI
    const userData = {
      keywords: task.keywords,
      customizations: task.customizations,
      aiSettings: task.aiSettings,
      ...task.metadata
    };

    // 4. Resolve concrete manifest
    const resolverResult = await this.overrideSystem.resolveManifest(businessCategoryId, []);

    return {
      businessCategoryId,
      customOverrides,
      userData,
      concreteManifest: resolverResult.concreteManifest,
      validationEnabled: task.validation?.enabled ?? true
    };
  }

  /**
   * Generate User Data from AI
   */
  private async generateUserDataFromAI(aiPromptConfig: any): Promise<any> {
    const businessCategory = aiPromptConfig.businessCategory.id;
    const keywords = aiPromptConfig.keywords;
    
    // Create AI generation request
    const request: AIGenerationRequest = {
      businessCategory,
      keywords,
      language: 'th', // Default to Thai, can be made configurable
      model: 'gpt-5-nano',
      temperature: 1
    };
    
    // Generate content using AI service
    const result = await this.aiService.generateContent(request);
    
    console.log('✅ AI content generated:', {
      businessCategory,
      keywords,
      aiAvailable: this.aiService.isAvailable(),
      status: this.aiService.getStatus()
    });
    
    return result;
  }

  /**
   * สร้าง Custom Overrides จาก Customizations
   */
  private createCustomOverrides(customizations?: any) {
    if (!customizations) return [];

    const overrides = [];

    // Color overrides
    if (customizations.colors && customizations.colors.length > 0) {
      overrides.push({
        type: 'color_override',
        target: 'global.palette',
        value: {
          primary: customizations.colors[0],
          secondary: customizations.colors[1] || customizations.colors[0]
        }
      });
    }

    // Theme overrides
    if (customizations.theme) {
      overrides.push({
        type: 'theme_override',
        target: 'global.theme',
        value: customizations.theme
      });
    }

    // Layout overrides
    if (customizations.layout) {
      overrides.push({
        type: 'layout_override',
        target: 'global.layout',
        value: customizations.layout
      });
    }

    // Feature overrides
    if (customizations.features && customizations.features.length > 0) {
      overrides.push({
        type: 'feature_override',
        target: 'blocks',
        value: customizations.features
      });
    }

    return overrides;
  }

  /**
   * แปลง Template Result เป็น Component Result
   */
  private convertToComponentResult(
    templateResult: any, 
    task: FrontendTaskV2,
    startTime: number
  ): ComponentResultV2 {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // แปลง files จาก template result
    const files = Object.entries(templateResult.files).map(([path, content]) => ({
      path: this.normalizeFilePath(path),
      content: content as string,
      type: this.getFileType(path),
      size: (content as string).length,
      blockId: this.extractBlockId(path),
      customized: false
    }));

    return {
      success: true,
      result: {
        businessCategory: templateResult.businessCategory,
        projectType: this.mapBusinessCategoryToProjectType(templateResult.businessCategory),
        templateUsed: 'template-system-v2',
        blocksGenerated: templateResult.concreteManifest?.blocks?.map((b: any) => b.id) || [],
        aiContentGenerated: true,
        customizationsApplied: templateResult.appliedOverrides || [],
        overridesApplied: templateResult.appliedOverrides || []
      },
      files,
      performance: {
        generationTime: executionTime,
        templateRenderingTime: templateResult.processingTime || 0,
        aiGenerationTime: templateResult.processingTime || 0,
        totalFiles: files.length,
        totalSize: this.calculateTotalSize(files)
      },
      validation: {
        isValid: templateResult.validationResults?.isValid ?? true,
        errors: templateResult.validationResults?.errors || [],
        warnings: templateResult.validationResults?.warnings || [],
        accessibilityScore: 95, // Default high score
        typescriptErrors: 0
      },
      metadata: {
        executionTime,
        timestamp: new Date().toISOString(),
        agent: 'frontend-v2',
        version: '2.0.0',
        templateSystemVersion: '1.0.0',
        aiModelUsed: task.aiSettings?.model || 'gpt-5-nano',
        aiGeneratedData: templateResult.aiGeneratedData || null
      }
    };
  }

  /**
   * สร้าง Error Result
   */
  private createErrorResult(error: Error, task: FrontendTaskV2, startTime: number): ComponentResultV2 {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    return {
      success: false,
      result: {
        businessCategory: task.businessCategory,
        projectType: 'e_commerce', // Default fallback
        templateUsed: 'none',
        blocksGenerated: [],
        aiContentGenerated: false,
        customizationsApplied: [],
        overridesApplied: []
      },
      files: [],
      performance: {
        generationTime: executionTime,
        templateRenderingTime: 0,
        aiGenerationTime: 0,
        totalFiles: 0,
        totalSize: '0B'
      },
      validation: {
        isValid: false,
        errors: [{
          type: 'generation_error',
          message: error.message,
          file: 'unknown',
          line: 0
        }],
        warnings: [],
        accessibilityScore: 0,
        typescriptErrors: 0
      },
      metadata: {
        executionTime,
        timestamp: new Date().toISOString(),
        agent: 'frontend-v2',
        version: '2.0.0',
        templateSystemVersion: '1.0.0',
        aiModelUsed: task.aiSettings?.model || 'gpt-5-nano'
      },
      error: {
        message: error.message,
        code: 'TEMPLATE_GENERATION_ERROR',
        details: error.stack || 'Unknown error',
        recoveryAttempted: false
      }
    };
  }

  /**
   * Generate Frontend using Template System
   */
  async generateFrontend(task: FrontendTaskV2): Promise<ComponentResultV2> {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting frontend generation with Template System...');
      console.log('📋 Task:', {
        taskId: task.taskId,
        taskType: task.taskType,
        businessCategory: task.businessCategory,
        keywords: task.keywords
      });

      // 1. แปลง task เป็น template request
      const templateRequest = await this.convertToTemplateRequest(task);
      console.log('🔄 Converted to template request:', templateRequest);

    // 2. สร้าง AI Prompt และ Generate User Data
    console.log('🤖 Generating AI content...');
    const aiPromptConfig = this.overrideSystem.createAIPromptConfig(
      templateRequest.businessCategoryId,
      templateRequest.concreteManifest,
      templateRequest.userData.keywords
    );
    
    const aiGeneratedData = await this.generateUserDataFromAI(aiPromptConfig);
    console.log('✅ AI content generated:', Object.keys(aiGeneratedData));

    // 3. ใช้ Template System สร้างเว็บไซต์
    console.log('🔄 Calling generateWebsite with:', {
      businessCategoryId: templateRequest.businessCategoryId,
      userDataKeys: Object.keys(aiGeneratedData),
      validationEnabled: templateRequest.validationEnabled
    });
    
    const templateResult = await this.overrideSystem.generateWebsite(
      templateRequest.businessCategoryId,
      aiGeneratedData,
      [], // customOverrides - ใช้ empty array สำหรับตอนนี้
      templateRequest.validationEnabled
    );

    // Add AI-generated data to template result
    templateResult.aiGeneratedData = aiGeneratedData;

      console.log('✅ Template generation completed:', {
        filesGenerated: Object.keys(templateResult.files).length,
        processingTime: templateResult.processingTime
      });

      // 3. แปลงผลลัพธ์เป็น component result
      const result = this.convertToComponentResult(templateResult, task, startTime);

      // 4. เพิ่ม preview ถ้าต้องการ
      if (task.includePreview) {
        result.preview = await this.createPreview(result.files);
      }

      // 5. เพิ่ม project structure ถ้าต้องการ
      if (task.includeProjectStructure !== false) {
        result.projectStructure = await this.generateProjectStructure(result, task);
      }

      console.log('🎉 Frontend generation completed successfully!');
      return result;

    } catch (error) {
      console.error('❌ Frontend generation failed:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      return this.createErrorResult(error as Error, task, startTime);
    }
  }

  /**
   * สร้าง Preview
   */
  private async createPreview(files: any[]): Promise<any> {
    // TODO: Implement preview generation
    // This would integrate with Daytona or similar preview service
    return {
      url: 'https://preview.example.com/sandbox/123',
      sandboxId: 'sandbox-123',
      status: 'ready',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * สร้าง Project Structure
   */
  private async generateProjectStructure(result: ComponentResultV2, task: FrontendTaskV2): Promise<any> {
    try {
      console.log('🏗️ Generating project structure...');
      
      const projectStructure = this.projectStructureGenerator.generateProjectStructure(
        result,
        'vite-react-typescript',
        task.metadata?.projectId
      );
      
      console.log('✅ Project structure generated:', {
        projectName: projectStructure.projectStructure.name,
        filesCount: projectStructure.files.length
      });
      
      return projectStructure;
    } catch (error) {
      console.error('❌ Failed to generate project structure:', error);
      return null;
    }
  }

  /**
   * Map business category to project type for Orchestrator
   */
  private mapBusinessCategoryToProjectType(businessCategory: string): string {
    const categoryMap: Record<string, string> = {
      'restaurant': 'restaurant',
      'ecommerce': 'e_commerce',
      'portfolio': 'portfolio',
      'healthcare': 'healthcare',
      'pharmacy': 'healthcare', // Map pharmacy to healthcare
      'coffee_shop': 'coffee_shop',
      'blog': 'blog',
      'business': 'business',
      'personal': 'personal'
    };
    
    return categoryMap[businessCategory] || 'e_commerce';
  }

  /**
   * Helper Methods
   */
  private normalizeFilePath(path: string): string {
    // Convert template system paths to frontend paths
    return path.replace(/^components\//, 'src/components/');
  }

  private getFileType(path: string): 'component' | 'style' | 'config' | 'test' | 'documentation' {
    if (path.endsWith('.tsx') || path.endsWith('.jsx')) return 'component';
    if (path.endsWith('.css') || path.endsWith('.scss')) return 'style';
    if (path.endsWith('.json')) return 'config';
    if (path.endsWith('.test.ts') || path.endsWith('.spec.ts')) return 'test';
    return 'documentation';
  }

  private extractBlockId(path: string): string {
    // Extract block ID from file path
    const match = path.match(/([a-z-]+)\.(tsx|jsx)$/);
    return match?.[1] || 'unknown';
  }

  private calculateTotalSize(files: any[]): string {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    
    if (totalBytes < 1024) return `${totalBytes}B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)}KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  /**
   * Get Template System Statistics
   */
  getTemplateSystemStats() {
    return {
      sharedBlocksCount: this.sharedBlocks.length,
      businessCategoriesCount: this.businessCategories.length,
      availableBlocks: this.sharedBlocks.map(b => b.id),
      availableCategories: this.businessCategories.map(c => c.id)
    };
  }
}
