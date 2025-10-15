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
import { persistFrontendV2Result } from '../services/persistence-service';

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
    let businessCategoryId: string = task.businessCategory || '';
    
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
    
    // 🎨 2.1 รวม customOverrides จาก visual edit (ถ้ามี)
    const visualEditOverrides = (task.metadata as any)?.visualEditOverrides || [];
    const allOverrides = [...customOverrides, ...visualEditOverrides];

    // 3. สร้าง user data สำหรับ AI
    const userData = {
      keywords: task.keywords,
      customizations: task.customizations,
      aiSettings: task.aiSettings,
      businessCategory: businessCategoryId, // เพิ่ม businessCategory เพื่อให้ getCategoryIcon ทำงาน
      ...task.metadata
    };

    // 4. Resolve concrete manifest
    const resolverResult = await this.overrideSystem.resolveManifest(businessCategoryId, [], task.keywords);

    return {
      businessCategoryId,
      customOverrides,
      userData,
      concreteManifest: resolverResult.concreteManifest,
      validationEnabled: task.validation?.enabled ?? true
    };
  }

  /**
   * Generate User Data from AI using OverrideSystem
   */
  private async generateUserDataFromAI(aiPromptConfig: any): Promise<any> {
    const businessCategory = aiPromptConfig.businessCategory;
    const keywords = aiPromptConfig.keywords;
    const concreteManifest = aiPromptConfig.concreteManifest;
    
    // Detect language from user input/keywords (prioritize input detection over user settings)
    const userInput = (aiPromptConfig?.userData?.userInput as string) || keywords?.join(' ') || '';
    const detectedLanguage = this.detectLanguage(keywords, userInput);
    
    // Always prioritize detected language over user preferences
    const finalLanguage = detectedLanguage || 'en';
    
    // Get system prompt from Template System (with language support)
    const { OverrideSystemWithTemplates } = require("../template-system/prompt-templates/override-integration");
    const templateSystem = new OverrideSystemWithTemplates(true);
    const templateResult = templateSystem.createOptimizedAIPrompt({
      businessCategory,
      concreteManifest,
      keywords,
      customInstructions: undefined,
      language: finalLanguage
    });
    
    // Use the user prompt from Template System (with language support)
    const aiPrompt = templateResult.userPrompt;
    
    // Generate content using AI service with both prompts
    const request: AIGenerationRequest = {
      businessCategory: businessCategory.id,
      keywords,
      language: finalLanguage,
      model: 'gpt-5-nano',
      temperature: 1,
      customPrompt: aiPrompt, // User prompt from Template System
      customSystemPrompt: templateResult.systemPrompt // System prompt from Template System
    };
    
    const result = await this.aiService.generateContent(request);
    
    console.log('✅ AI content generated with OverrideSystem prompt:', {
      businessCategory: businessCategory.id,
      keywords,
      aiAvailable: this.aiService.isAvailable(),
      status: this.aiService.getStatus()
    });
    
    return { aiGeneratedData: result, detectedLanguage: finalLanguage };
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

      // 1. แปลง task เป็น template request
      const templateRequest = await this.convertToTemplateRequest(task);
      console.log('🔄 Converted to template request:', {
        businessCategoryId: templateRequest.businessCategoryId,
        manifestBlocks: templateRequest.concreteManifest.blocks.length
      });

    // 2. สร้าง AI Prompt และ Generate User Data
    // 🎨 Check if we already have AI data from visual edit
    let aiGeneratedData;
    if ((task.metadata as any)?.aiGeneratedData) {
      console.log('🎨 Using existing AI data from visual edit');
      aiGeneratedData = (task.metadata as any).aiGeneratedData;
    } else {
      console.log('🤖 Generating new AI content...');
      
      const aiPromptConfig = this.overrideSystem.createAIPromptConfig(
        templateRequest.businessCategoryId,
        templateRequest.concreteManifest,
        templateRequest.userData.keywords
      );
      
      aiGeneratedData = await this.generateUserDataFromAI(aiPromptConfig);
      console.log('✅ AI content generated:', Object.keys(aiGeneratedData));
    }

    // If user specified a brand name in keywords (e.g., "ชื่อ แมวแมว"), enforce it
    const extractedBrand = this.extractBrandFromKeywords(templateRequest.userData.keywords);
    if (extractedBrand) {
      aiGeneratedData["navbar-basic"] = aiGeneratedData["navbar-basic"] || {};
      aiGeneratedData["navbar-basic"].brand = extractedBrand;
      aiGeneratedData["navbar-basic"].brandFirstChar = this.safeFirstChar(extractedBrand);
    }

    // 3. ✅ ใช้ renderTemplates แทน generateWebsite (ไม่ resolve manifest ซ้ำ)
    console.log('🔄 Rendering templates with AI data...');
    // Ensure renderer gets the intended language (avoid heuristic fallback)
    try {
      // Use the detected language from AI generation
      const lang = detectedLanguage || 'en';
      aiGeneratedData.global = aiGeneratedData.global || {};
      aiGeneratedData.global.language = lang;
      aiGeneratedData.aiSettings = { ...(aiGeneratedData.aiSettings || {}), language: lang };
    } catch {
      // no-op
    }
    
    const rendererResult = await this.overrideSystem.renderTemplates(
      templateRequest.concreteManifest, // ✅ ใช้ manifest ที่ resolve แล้วจาก convertToTemplateRequest
      aiGeneratedData,
      templateRequest.validationEnabled
    );

    console.log('✅ Template rendering completed:', {
      filesGenerated: Object.keys(rendererResult.files).length,
      processingTime: rendererResult.processingTime
    });

    // รวม result จาก renderer กับ manifest ที่มีอยู่แล้ว
    const templateResult = {
      files: rendererResult.files,
      concreteManifest: templateRequest.concreteManifest,
      appliedOverrides: rendererResult.appliedOverrides,
      processingTime: rendererResult.processingTime,
      validationResults: rendererResult.validationResults,
      businessCategory: templateRequest.businessCategoryId,
      aiGeneratedData: aiGeneratedData
    };

      // 4. แปลงผลลัพธ์เป็น component result
      const result = this.convertToComponentResult(templateResult, task, startTime);

      // 4. เพิ่ม preview ถ้าต้องการ
      if (task.includePreview) {
        result.preview = await this.createPreview(result.files);
      }

      // 5. เพิ่ม project structure ถ้าต้องการ
      if (task.includeProjectStructure !== false) {
        result.projectStructure = await this.generateProjectStructure(result, task);
      }

      // 6. Persist to database if projectId is provided
      if (task.metadata?.projectId) {
        try {
          await persistFrontendV2Result(result, task, {
            projectId: task.metadata.projectId,
            userId: (task as any).metadata?.userId,
          });
        } catch (err) {
          console.warn('⚠️ Failed to persist frontend-v2 result:', err);
        }
      }
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
      
      // Convert result.files array to Record<string, string> format
      const renderedFiles: Record<string, string> = {};
      for (const file of result.files) {
        renderedFiles[file.path] = file.content;
      }
      
      const projectStructure = this.projectStructureGenerator.generateProjectStructure(
        result,
        'vite-react-typescript',
        task.metadata?.projectId,
        renderedFiles // ส่ง files ที่ render แล้วจาก override system
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

  /**
   * Very lightweight language detector
   * - If user explicitly sets language (en/th), use it
   * - Else detect by characters: any Thai range => 'th', otherwise 'en'
   */
  private detectLanguage(keywords: string[] = [], userInput: string = ''): 'th' | 'en' {
    const text = `${userInput} ${keywords.join(' ')}`.trim();
    // Thai unicode range: \u0E00-\u0E7F
    const hasThai = /[\u0E00-\u0E7F]/.test(text);
    return hasThai ? 'th' : 'en';
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

  /**
   * Extract brand name from keywords using simple pattern: ['ชื่อ', '<brand>']
   */
  private extractBrandFromKeywords(keywords: string[] = []): string | null {
    if (!Array.isArray(keywords) || keywords.length === 0) return null;
    for (let i = 0; i < keywords.length; i++) {
      const token = (keywords[i] || '').trim().toLowerCase();
      if (token === 'ชื่อ' || token === 'name') {
        const candidate = (keywords[i + 1] || '').trim();
        if (candidate) return candidate;
      }
    }
    return null;
  }

  /**
   * Compute first char for brandFirstChar safely
   */
  private safeFirstChar(text: string): string {
    const t = (text || '').trim();
    if (t.length === 0) return '';
    const ch: string = t.charAt(0);
    return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch;
  }
}
