/**
 * Component Adapter for Frontend-V2 Agent
 * ✅ Component-Based Generation (ใช้ Component Library แทน Template System)
 */

import { initializeComponentLibrary, getComponentSelector, ComponentRegistryManager } from '../component-library';
import { ComponentRenderer } from '../component-library/renderer';
import { LLMEnhancedSelector } from '../component-library/llm-selector';
import { persistFrontendV2Result } from '../services/persistence-service';
import { ThemePackGenerator } from '../theme-pack';
import { BlueprintSelector } from '../blueprint';
import { AIService } from '../services/ai-service';
import { ProjectStructureGenerator } from '../template-system/project-structure-generator';
import { categoryService } from '../services/category-service';
import type { FrontendTaskV2, ComponentResultV2 } from '../schemas/types';
import type { SelectionContext, ComponentSelection } from '../component-library/types';
import type { ThemePack, Blueprint } from '../../orchestrator/types/enhancedProjectContext';

export class ComponentAdapter {
  private aiService: AIService;
  private projectGenerator: ProjectStructureGenerator;
  private componentRenderer: ComponentRenderer;
  private llmSelector: LLMEnhancedSelector;
  private initialized: boolean = false;
  private categoryCache: Map<string, string> = new Map(); // Cache for category detection

  constructor() {
    this.aiService = new AIService();
    this.projectGenerator = new ProjectStructureGenerator();
    this.componentRenderer = ComponentRenderer.getInstance();
    this.llmSelector = new LLMEnhancedSelector();
  }

  /**
   * Initialize Component Library
   */
  private initializeIfNeeded(): void {
    if (!this.initialized) {
      initializeComponentLibrary();
      this.initialized = true;
    }
  }

  /**
   * Generate Frontend using Component System
   */
  async generateFrontend(task: FrontendTaskV2): Promise<ComponentResultV2> {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting frontend generation with Component System...');
      console.log('📋 Task:', {
        taskId: task.taskId,
        taskType: task.taskType,
        businessCategory: task.businessCategory,
        keywords: task.keywords
      });

      // 1. Initialize Component Library
      this.initializeIfNeeded();

      // 2. Generate ThemePack
      const themePack = await this.generateThemePack(task);
      console.log('🎨 ThemePack generated:', themePack.name);

      // 3. Select Blueprint
      const blueprint = await this.selectBlueprint(task);
      console.log('🏗️ Blueprint selected:', blueprint.name);

      // 4. Create Selection Context
      const selectionContext = await this.createSelectionContext(task);
      console.log('🎯 Selection Context:', selectionContext);

      // 5. Select Components with LLM Enhancement
      console.log('🤖 Selecting components with LLM-enhanced selector...');
      const componentSelection = await this.llmSelector.selectComponentsWithLLM(selectionContext);
      console.log('✅ Components selected:', componentSelection.selectedComponents.length);
      console.log('📊 Selection Score:', (componentSelection.totalScore * 100).toFixed(1) + '%');
      console.log('🧠 LLM Enhanced:', componentSelection.reasoning.llmEnhanced ? 'Yes' : 'Fallback to traditional');

      // 6. Generate AI Content for components
      console.log('🤖 Generating AI content for components...');
      const aiGeneratedData = await this.generateContentForComponents(
        componentSelection,
        task
      );
      console.log('✅ AI content generated:', Object.keys(aiGeneratedData));

      // 7. Render Components to Code (using Renderer)
      console.log('🔄 Rendering components to code...');
      const renderedFiles = await this.renderComponentsWithRenderer(
        componentSelection,
        aiGeneratedData,
        themePack,
        task
      );
      console.log('✅ Files rendered:', Object.keys(renderedFiles).length);

      // 6. Generate Project Structure
      console.log('🏗️ Generating project structure...');
      const projectStructure = this.projectGenerator.generateProjectStructure(
        this.createComponentResult(task, componentSelection, renderedFiles, aiGeneratedData),
        'vite-react-typescript',
        undefined,
        renderedFiles
      );
      console.log('✅ Project structure generated:', projectStructure.files.length, 'files');

      // 8. Create Result first
      const result = this.createSuccessResult(
        task,
        componentSelection,
        projectStructure,
        aiGeneratedData,
        startTime
      );

      // 9. Persist to database using persistence-service (same as Template System)
      console.log('💾 Persisting component result to database...');
      // Use existing projectId from task or projectContext, fallback to generated one
      const projectId = task.projectId || `component_${task.taskId}_${Date.now()}`;
      console.log('📁 Using projectId:', projectId);
      
      if (projectId) {
        try {
          await persistFrontendV2Result(result, task, {
            projectId: projectId,
            userId: (task as any).metadata?.userId,
          });
          console.log('✅ Component result persisted to database successfully');
        } catch (err) {
          console.error('❌ Failed to persist component result:', err);
        }
      }

      console.log('✅ Component generation completed successfully');
      console.log('📊 Stats:', {
        totalFiles: result.files.length,
        totalComponents: componentSelection.selectedComponents.length,
        executionTime: result.metadata.executionTime,
        selectionScore: componentSelection.totalScore
      });

      return result;

    } catch (error) {
      console.error('❌ Component generation error:', error);
      return this.createErrorResult(error as Error, task, startTime);
    }
  }

  /**
   * Create Selection Context from Task
   */
  private async createSelectionContext(task: FrontendTaskV2): Promise<SelectionContext> {
    const businessCategory = task.businessCategory || await this.detectBusinessCategory(task.keywords || []);
    
    const context: SelectionContext = {
      businessCategory,
      userInput: task.keywords?.join(' ') || '',
      keywords: task.keywords || [],
      style: this.extractStyles(task),
      tone: this.detectTone(task),
      features: this.extractFeatures(task),
      preferences: {
        colorScheme: this.detectColorScheme(task),
        layoutStyle: this.detectLayoutStyle(task),
        complexity: this.detectComplexity(task),
        language: this.detectLanguage(task) === 'English' ? 'en' : 'th'
      }
    };
    
    return context;
  }

  /**
   * Extract styles from task
   */
  private extractStyles(task: FrontendTaskV2): string[] {
    const styles: string[] = [];
    const keywords = task.keywords.map(k => k.toLowerCase());

    const styleKeywords = {
      'modern': ['modern', 'ทันสมัย', 'โมเดิร์น'],
      'classic': ['classic', 'คลาสสิก', 'แบบเก่า'],
      'minimal': ['minimal', 'มินิมอล', 'เรียบง่าย', 'clean'],
      'luxury': ['luxury', 'หรูหรา', 'premium'],
      'creative': ['creative', 'สร้างสรรค์', 'unique']
    };

    for (const [style, keywords_list] of Object.entries(styleKeywords)) {
      if (keywords_list.some(kw => keywords.includes(kw))) {
        styles.push(style);
      }
    }

    // Default to modern if no style found
    if (styles.length === 0) {
      styles.push('modern');
    }

    return styles;
  }

  /**
   * Detect tone from task
   */
  private detectTone(task: FrontendTaskV2): string {
    const category = task.businessCategory?.toLowerCase() || '';

    const toneMapping: Record<string, string> = {
      'restaurant': 'friendly',
      'ecommerce': 'professional',
      'portfolio': 'creative',
      'healthcare': 'professional',
      'pharmacy': 'professional'
    };

    return toneMapping[category] || 'friendly';
  }

  /**
   * Extract features from task
   */
  private extractFeatures(task: FrontendTaskV2): string[] {
    const features: string[] = [];
    const keywords = task.keywords.map(k => k.toLowerCase());

    const featureKeywords = {
      'menu': ['menu', 'เมนู', 'products', 'สินค้า'],
      'contact': ['contact', 'ติดต่อ'],
      'about': ['about', 'เกี่ยวกับ'],
      'reservation': ['reservation', 'booking', 'จอง'],
      'cart': ['cart', 'ตะกร้า', 'checkout'],
      'gallery': ['gallery', 'แกลเลอรี่', 'portfolio']
    };

    for (const [feature, keywords_list] of Object.entries(featureKeywords)) {
      if (keywords_list.some(kw => keywords.includes(kw))) {
        features.push(feature);
      }
    }

    // Default features based on category
    if (features.length === 0) {
      const category = task.businessCategory?.toLowerCase() || '';
      const defaultFeatures: Record<string, string[]> = {
        'restaurant': ['menu', 'about', 'contact'],
        'ecommerce': ['products', 'cart', 'contact'],
        'portfolio': ['gallery', 'about', 'contact'],
        'healthcare': ['services', 'doctors', 'contact'],
        'pharmacy': ['products', 'services', 'contact']
      };
      features.push(...(defaultFeatures[category] || ['about', 'contact']));
    }

    return features;
  }

  /**
   * Detect color scheme
   */
  private detectColorScheme(task: FrontendTaskV2): 'warm' | 'cool' | 'neutral' | 'vibrant' {
    const keywords = task.keywords.map(k => k.toLowerCase());

    if (keywords.some(k => ['warm', 'อุ่น', 'orange', 'ส้ม', 'red', 'แดง'].includes(k))) {
      return 'warm';
    }
    if (keywords.some(k => ['cool', 'เย็น', 'blue', 'ฟ้า', 'green', 'เขียว'].includes(k))) {
      return 'cool';
    }
    if (keywords.some(k => ['vibrant', 'สดใส', 'colorful', 'สีสัน'].includes(k))) {
      return 'vibrant';
    }

    return 'neutral';
  }

  /**
   * Detect layout style
   */
  private detectLayoutStyle(task: FrontendTaskV2): 'modern' | 'classic' | 'minimal' {
    const styles = this.extractStyles(task);

    if (styles.includes('minimal')) return 'minimal';
    if (styles.includes('classic')) return 'classic';
    return 'modern';
  }

  /**
   * Detect complexity
   */
  private detectComplexity(task: FrontendTaskV2): 'simple' | 'moderate' | 'complex' {
    const features = this.extractFeatures(task);

    if (features.length <= 2) return 'simple';
    if (features.length <= 4) return 'moderate';
    return 'complex';
  }

  /**
   * Generate AI content for selected components
   */
  private async generateContentForComponents(
    componentSelection: ComponentSelection,
    task: FrontendTaskV2
  ): Promise<Record<string, any>> {
    // ใช้ AIService เดิมที่มีอยู่
    const aiRequest = this.createAIRequest(componentSelection, task);
    
    const aiResponse = await this.aiService.generateContent(aiRequest as any);

    return aiResponse;
  }

  /**
   * Detect language from keywords or user input
   */
  private detectLanguage(task: FrontendTaskV2): string {
    // If explicitly set and not 'auto', use that
    if (task.aiSettings?.language && task.aiSettings.language !== 'auto') {
      return task.aiSettings.language === 'en' ? 'English' : 'Thai';
    }

    // Detect from keywords
    const keywords = task.keywords || [];
    const allText = keywords.join(' ');
    
    // Check if contains Thai characters
    const hasThaiChars = /[\u0E00-\u0E7F]/.test(allText);
    
    // If has Thai characters, use Thai
    if (hasThaiChars) {
      return 'Thai';
    }
    
    // If all English (no Thai), use English
    return 'English';
  }

  /**
   * Create AI request
   */
  private createAIRequest(
    componentSelection: ComponentSelection,
    task: FrontendTaskV2
  ): {
    businessCategory: string;
    keywords: string[];
    language: string;
    model?: string | undefined;
    temperature?: number | undefined;
    selectedComponents?: Array<{
      id: string;
      name: string;
      category: string;
      propsSchema: Record<string, any>;
      template: string;
    }>;
    componentSelection?: {
      selectedComponents: Array<{
        componentId: string;
        variantId: string;
        props: Record<string, any>;
      }>;
    };
  } {
    const request: any = {
      businessCategory: task.businessCategory || 'business',
      keywords: task.keywords || [],
      language: this.detectLanguage(task)
    };
    
    if (task.aiSettings?.model) {
      request.model = task.aiSettings.model;
    }
    
    if (task.aiSettings?.temperature !== undefined) {
      request.temperature = task.aiSettings.temperature;
    }

    // Add component context for AI
    if (componentSelection?.selectedComponents) {
      request.componentSelection = {
        selectedComponents: componentSelection.selectedComponents.map(selected => ({
          componentId: selected.componentId,
          variantId: selected.variantId,
          props: selected.props || {}
        }))
      };
    }
    
    return request;
  }

  /**
   * Generate ThemePack from task
   */
  private async generateThemePack(task: FrontendTaskV2): Promise<ThemePack> {
    const styles = this.extractStyles(task);
    const style = styles[0] || 'modern';
    const tone = this.detectTone(task);
    
    // Detect business category from keywords if not provided
    const businessCategory = task.businessCategory || await this.detectBusinessCategory(task.keywords || []);
    
    return ThemePackGenerator.generate({
      businessCategory,
      keywords: task.keywords || [],
      userInput: task.keywords?.join(' ') || '',
      style: style as 'modern' | 'classic' | 'minimal' | 'creative',
      tone: tone as 'luxury' | 'friendly' | 'professional' | 'playful'
    });
  }

  /**
   * Select Blueprint from task
   */
  private async selectBlueprint(task: FrontendTaskV2): Promise<Blueprint> {
    const businessCategory = task.businessCategory || await this.detectBusinessCategory(task.keywords || []);
    
    return BlueprintSelector.select({
      businessCategory,
      features: this.extractFeatures(task),
      complexity: this.detectComplexity(task)
    });
  }

  /**
   * Detect business category using Category Service (LLM + Keyword matching) with caching
   */
  private async detectBusinessCategory(keywords: string[]): Promise<string> {
    try {
      const cacheKey = keywords.join('|');
      
      // Check cache first
      if (this.categoryCache.has(cacheKey)) {
        const cachedCategory = this.categoryCache.get(cacheKey)!;
        console.log(`✅ Category from cache: ${cachedCategory}`);
        return cachedCategory;
      }
      
      const userInput = keywords.join(' ');
      const category = await categoryService.detectCategory({
        keywords,
        userInput,
        useLLM: true, // ใช้ LLM detection
        fallbackToDefault: true
      });
      
      if (category) {
        // Cache the result
        this.categoryCache.set(cacheKey, category.id);
        console.log(`✅ Category detected: ${category.id}`);
        return category.id;
      }
      
      console.log('⚠️ No category detected, using default: business');
      return 'business';
    } catch (error) {
      console.error('❌ Category detection failed:', error);
      return 'business';
    }
  }

  /**
   * Render components using ComponentRenderer
   */
  private async renderComponentsWithRenderer(
    componentSelection: ComponentSelection,
    aiGeneratedData: Record<string, any>,
    themePack: ThemePack,
    task: FrontendTaskV2
  ): Promise<any> {
    console.log('🎨 Rendering components with ComponentRenderer...');
    
    // 1. Register components in renderer
    const registry = ComponentRegistryManager.getInstance();
    const allComponents = registry.getAllComponents();
    this.componentRenderer.registerComponents(allComponents);

    // 2. Generate blueprint and layout
    const blueprint = await this.selectBlueprint(task);
    const layout = this.generateLayoutConfig(blueprint);

    // 3. Apply AI generated data to component selection
    const enhancedSelection = this.applyAIDataToSelection(componentSelection, aiGeneratedData);

    // 4. Render components using ComponentRenderer
    const renderedFiles = this.componentRenderer.renderComponents(
      enhancedSelection,
      themePack,
      blueprint,
      layout,
      {
        projectType: task.projectType || 'vite-react-typescript',
        projectName: this.extractProjectName(task),
        includeDependencies: true,
        addComments: true
      },
      aiGeneratedData
    );

    console.log('✅ Components rendered:', {
      files: renderedFiles.metadata.totalFiles,
      size: `${Math.round(renderedFiles.metadata.totalSize / 1024)}KB`,
      components: renderedFiles.metadata.componentsUsed.length
    });

    // Return the full RenderedFiles object for database storage
    return renderedFiles;
  }
  
  /**
   * Legacy render method (for backward compatibility)
   */
  private async renderComponents(
    componentSelection: ComponentSelection,
    aiGeneratedData: Record<string, any>,
    task: FrontendTaskV2
  ): Promise<Record<string, string>> {
    // This method is now deprecated, use renderComponentsWithRenderer instead
    return {};
  }

  /**
   * Create component result for project structure generator
   */
  private createComponentResult(
    task: FrontendTaskV2,
    componentSelection: ComponentSelection,
    renderedFiles: any,
    aiGeneratedData: Record<string, any>
  ): ComponentResultV2 {
    // Handle both RenderedFiles object and legacy Record<string, string>
    const totalSize = renderedFiles.metadata?.totalSize || 
      Object.values(renderedFiles.files || renderedFiles).reduce((sum: number, content: any) => 
        sum + (typeof content === 'string' ? content.length : content.content?.length || 0), 0);
    
    return {
      success: true,
      result: {
        businessCategory: task.businessCategory || 'business',
        projectType: task.projectType || 'vite-react-typescript',
        templateUsed: 'component-based',
        blocksGenerated: componentSelection.selectedComponents.map(c => c.componentId),
        aiContentGenerated: true,
        customizationsApplied: [],
        overridesApplied: []
      },
      files: Object.entries(renderedFiles).map(([path, content]) => ({
        path,
        content: content as string,
        type: this.getFileType(path) as any,
        size: (content as string).length,
        blockId: 'component',
        customized: false
      })),
      performance: {
        generationTime: 0,
        templateRenderingTime: 0,
        aiGenerationTime: 0,
        totalFiles: Object.keys(renderedFiles).length,
        totalSize: this.formatBytes(totalSize)
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        accessibilityScore: 0.9,
        typescriptErrors: 0
      },
      metadata: {
        executionTime: 0,
        timestamp: new Date().toISOString(),
        agent: 'frontend-v2',
        version: '2.0.0',
        aiGeneratedData
      }
    };
  }

  /**
   * Create success result
   */
  private createSuccessResult(
    task: FrontendTaskV2,
    componentSelection: ComponentSelection,
    projectStructure: any,
    aiGeneratedData: Record<string, any>,
    startTime: number
  ): ComponentResultV2 {
    const files = projectStructure.files.map((file: any) => ({
      path: file.path,
      content: file.content,
      type: this.getFileType(file.path) as any,
      size: file.content.length,
      blockId: 'component',
      customized: false
    }));

    const totalSize = files.reduce((sum: number, f: any) => sum + f.size, 0);

    return {
      success: true,
      result: {
        businessCategory: task.businessCategory || 'business',
        projectType: task.projectType || 'vite-react-typescript',
        templateUsed: 'component-based',
        blocksGenerated: componentSelection.selectedComponents.map(c => c.componentId),
        aiContentGenerated: true,
        customizationsApplied: [],
        overridesApplied: []
      },
      files,
      performance: {
        generationTime: Date.now() - startTime,
        templateRenderingTime: 0,
        aiGenerationTime: 0,
        totalFiles: files.length,
        totalSize: this.formatBytes(totalSize)
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        accessibilityScore: 0.9,
        typescriptErrors: 0
      },
      metadata: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        agent: 'frontend-v2',
        version: '2.0.0',
        aiGeneratedData
      }
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(error: Error, task: FrontendTaskV2, startTime: number): ComponentResultV2 {
    return {
      success: false,
      result: {
        businessCategory: task.businessCategory || 'business',
        projectType: task.projectType || 'vite-react-typescript',
        templateUsed: 'component-based',
        blocksGenerated: [],
        aiContentGenerated: false,
        customizationsApplied: [],
        overridesApplied: []
      },
      files: [],
      performance: {
        generationTime: Date.now() - startTime,
        templateRenderingTime: 0,
        aiGenerationTime: 0,
        totalFiles: 0,
        totalSize: '0 B'
      },
      validation: {
        isValid: false,
        errors: [{
          type: 'generation_error',
          message: error.message,
          file: '',
          line: 0
        }],
        warnings: [],
        accessibilityScore: 0,
        typescriptErrors: 0
      },
      metadata: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        agent: 'frontend-v2',
        version: '2.0.0'
      },
      error: {
        message: error.message,
        code: 'COMPONENT_GENERATION_ERROR',
        details: error.stack || '',
        recoveryAttempted: false
      }
    };
  }

  /**
   * Get file type from path
   */
  private getFileType(path: string): string {
    if (path.endsWith('.tsx')) return 'component';
    if (path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.css')) return 'style';
    if (path.endsWith('.json')) return 'config';
    if (path.endsWith('.html')) return 'html';
    return 'other';
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Generate layout configuration from blueprint
   */
  private generateLayoutConfig(blueprint: Blueprint): any {
    return {
      id: blueprint.id,
      name: blueprint.name,
      sections: blueprint.sections || [],
      responsive: true,
      container: 'max-w-7xl mx-auto px-4'
    };
  }

  /**
   * Apply AI generated data to component selection
   */
  private applyAIDataToSelection(
    componentSelection: ComponentSelection,
    aiGeneratedData: Record<string, any>
  ): ComponentSelection {
    const enhancedSelection = { ...componentSelection };
    
    // Map component IDs to AI data keys
    const componentDataMap: Record<string, string> = {
      'navbar': 'navbar-basic',
      'hero': 'hero-basic',
      'about': 'about-basic',
      'contact': 'contact-basic',
      'footer': 'footer-basic',
      'menu': 'menu-basic'
    };
    
    enhancedSelection.selectedComponents = componentSelection.selectedComponents.map(comp => {
      const dataKey = componentDataMap[comp.componentId] || comp.componentId;
      const aiData = aiGeneratedData[dataKey] || aiGeneratedData.components?.[comp.componentId]?.props || {};
      
      return {
        ...comp,
        props: {
          ...comp.props,
          ...aiData
        }
      };
    });

    return enhancedSelection;
  }

  /**
   * Extract project name from task
   */
  private extractProjectName(task: FrontendTaskV2): string {
    // Try to extract from keywords
    const keywords = task.keywords || [];
    const nameKeywords = keywords.filter(k => 
      !k.includes('ร้าน') && 
      !k.includes('restaurant') && 
      !k.includes('ขาย') && 
      !k.includes('shop')
    );
    
    if (nameKeywords.length > 0) {
      return nameKeywords[0];
    }
    
    // Fallback to business category
    return task.businessCategory || 'My App';
  }


}

