// Manifest Resolver
// รับผิดชอบการสร้าง Concrete Manifest จาก Business Category + Shared Blocks

import { 
  SharedBlock, 
  PlaceholderConfig 
} from '../shared-blocks';
import { 
  BusinessCategoryManifest, 
  BlockUsage, 
  CategoryOverrides 
} from '../business-categories';
import {
  ConcreteManifest,
  ConcreteBlock,
  ConcreteManifestMetadata,
  ConcreteBlockMetadata,
  ResolverConfig,
  ResolverResult,
  OverrideConfig,
  OverrideResult,
  ManifestResolutionError,
  ProcessingStats,
  ProcessingStep
} from './types';

export class ManifestResolver {
  private sharedBlocks: Map<string, SharedBlock>;
  private businessCategories: Map<string, BusinessCategoryManifest>;
  private processingStats: ProcessingStats;

  constructor(
    sharedBlocks: SharedBlock[],
    businessCategories: BusinessCategoryManifest[]
  ) {
    this.sharedBlocks = new Map(sharedBlocks.map(block => [block.id, block]));
    this.businessCategories = new Map(businessCategories.map(cat => [cat.id, cat]));
    this.processingStats = {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      steps: []
    };
  }

  /**
   * สร้าง Concrete Manifest จาก Business Category ID
   */
  resolveManifest(
    businessCategoryId: string,
    customOverrides: OverrideConfig[] = []
  ): ResolverResult {
    const startTime = Date.now();
    this.processingStats.startTime = startTime;

    try {
      // Step 1: Load Business Category
      const businessCategory = this.loadBusinessCategory(businessCategoryId);
      
      // Step 2: Process Blocks
      const concreteBlocks = this.processBlocks(
        businessCategory, 
        customOverrides
      );
      
      // Step 3: Create Concrete Manifest
      const concreteManifest = this.createConcreteManifest(
        businessCategory,
        concreteBlocks
      );
      
      // Step 4: Create Template Map
      const templateMap = this.createTemplateMap(concreteBlocks);
      
      // Step 5: Collect Applied Overrides
      const appliedOverrides = this.collectAppliedOverrides(concreteBlocks);
      
      this.processingStats.endTime = Date.now();
      this.processingStats.duration = this.processingStats.endTime - this.processingStats.startTime;

      return {
        concreteManifest,
        templateMap,
        appliedOverrides,
        processingTime: this.processingStats.duration
      };

    } catch (error) {
      this.processingStats.endTime = Date.now();
      this.processingStats.duration = this.processingStats.endTime - this.processingStats.startTime;
      
      throw new ManifestResolutionError(
        `Failed to resolve manifest for business category '${businessCategoryId}': ${error instanceof Error ? error.message : String(error)}`,
        businessCategoryId
      );
    }
  }

  /**
   * โหลด Business Category
   */
  private loadBusinessCategory(businessCategoryId: string): BusinessCategoryManifest {
    const stepStart = Date.now();
    
    const businessCategory = this.businessCategories.get(businessCategoryId);
    if (!businessCategory) {
      throw new Error(`Business category '${businessCategoryId}' not found`);
    }

    this.addProcessingStep('loadBusinessCategory', stepStart, true);
    return businessCategory;
  }

  /**
   * ประมวลผล Blocks ตาม Business Category
   */
  private processBlocks(
    businessCategory: BusinessCategoryManifest,
    customOverrides: OverrideConfig[]
  ): ConcreteBlock[] {
    const stepStart = Date.now();
    const concreteBlocks: ConcreteBlock[] = [];

    for (const blockUsage of businessCategory.blocks) {
      try {
        const concreteBlock = this.processBlock(
          blockUsage,
          businessCategory,
          customOverrides
        );
        concreteBlocks.push(concreteBlock);
      } catch (error) {
        throw new Error(
          `Failed to process block '${blockUsage.blockId}': ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.addProcessingStep('processBlocks', stepStart, true);
    return concreteBlocks;
  }

  /**
   * ประมวลผล Block เดียว
   */
  private processBlock(
    blockUsage: BlockUsage,
    businessCategory: BusinessCategoryManifest,
    customOverrides: OverrideConfig[]
  ): ConcreteBlock {
    const stepStart = Date.now();
    
    // 1. Load Shared Block
    const sharedBlock = this.sharedBlocks.get(blockUsage.blockId);
    if (!sharedBlock) {
      throw new Error(`Shared block '${blockUsage.blockId}' not found`);
    }

    // 2. Apply Business Category Overrides
    const categoryOverrides = businessCategory.overrides[blockUsage.blockId];
    let finalTemplate = sharedBlock.template;
    let finalPlaceholders = { ...sharedBlock.placeholders };
    const appliedOverrides: string[] = [];

    if (categoryOverrides) {
      // Apply placeholder overrides
      if (categoryOverrides.placeholders) {
        finalPlaceholders = this.mergePlaceholderConfigs(
          finalPlaceholders,
          categoryOverrides.placeholders
        );
        appliedOverrides.push('business-category-placeholders');
      }

      // Apply template overrides
      if (categoryOverrides.template) {
        finalTemplate = categoryOverrides.template;
        appliedOverrides.push('business-category-template');
      }
    }

    // 3. Apply Custom Overrides
    const customOverride = customOverrides.find(o => o.blockId === blockUsage.blockId);
    if (customOverride) {
      // Apply variant selection
      if (customOverride.variantId) {
        const variant = sharedBlock.variants?.find(v => v.id === customOverride.variantId);
        if (variant) {
          finalTemplate = variant.template;
          finalPlaceholders = this.mergePlaceholderConfigs(
            finalPlaceholders,
            variant.overrides
          );
          appliedOverrides.push(`variant-${customOverride.variantId}`);
        }
      }

      // Apply custom template overrides
      if (customOverride.templateOverrides) {
        for (const [placeholder, replacement] of Object.entries(customOverride.templateOverrides)) {
          finalTemplate = finalTemplate.replace(
            new RegExp(`\\{${placeholder}\\}`, 'g'),
            replacement
          );
        }
        appliedOverrides.push('custom-template');
      }

      // Apply custom placeholder overrides
      if (customOverride.placeholderOverrides) {
        finalPlaceholders = this.mergePlaceholderConfigs(
          finalPlaceholders,
          customOverride.placeholderOverrides
        );
        appliedOverrides.push('custom-placeholders');
      }
    }

    // 4. Create Concrete Block
    const concreteBlock: ConcreteBlock = {
      id: sharedBlock.id,
      name: sharedBlock.name,
      description: sharedBlock.description,
      category: sharedBlock.category,
      template: finalTemplate,
      placeholders: finalPlaceholders,
      appliedOverrides,
      dependencies: sharedBlock.dependencies || [],
      metadata: {
        sourceBlockId: sharedBlock.id,
        variantId: customOverride?.variantId || '',
        appliedOverrides,
        placeholderCount: Object.keys(finalPlaceholders).length,
        templateLength: finalTemplate.length
      }
    };

    this.addProcessingStep(`processBlock-${blockUsage.blockId}`, stepStart, true);
    return concreteBlock;
  }

  /**
   * สร้าง Concrete Manifest
   */
  private createConcreteManifest(
    businessCategory: BusinessCategoryManifest,
    concreteBlocks: ConcreteBlock[]
  ): ConcreteManifest {
    const stepStart = Date.now();

    const concreteManifest: ConcreteManifest = {
      businessCategory,
      blocks: concreteBlocks,
      globalSettings: businessCategory.globalSettings,
      metadata: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        businessCategoryId: businessCategory.id,
        totalBlocks: concreteBlocks.length,
        appliedOverrides: this.collectAppliedOverrides(concreteBlocks)
      }
    };

    this.addProcessingStep('createConcreteManifest', stepStart, true);
    return concreteManifest;
  }

  /**
   * สร้าง Template Map
   */
  private createTemplateMap(concreteBlocks: ConcreteBlock[]): Record<string, string> {
    const stepStart = Date.now();
    
    const templateMap: Record<string, string> = {};
    for (const block of concreteBlocks) {
      templateMap[block.id] = block.template;
    }

    this.addProcessingStep('createTemplateMap', stepStart, true);
    return templateMap;
  }

  /**
   * รวบรวม Applied Overrides
   */
  private collectAppliedOverrides(concreteBlocks: ConcreteBlock[]): string[] {
    const allOverrides = new Set<string>();
    for (const block of concreteBlocks) {
      block.appliedOverrides.forEach(override => allOverrides.add(override));
    }
    return Array.from(allOverrides);
  }

  /**
   * รวม Placeholder Configurations
   */
  private mergePlaceholderConfigs(
    base: Record<string, PlaceholderConfig>,
    overrides: Record<string, any>
  ): Record<string, PlaceholderConfig> {
    const merged = { ...base };
    
    for (const [key, value] of Object.entries(overrides)) {
      if (merged[key] && typeof merged[key] === 'object' && typeof value === 'object') {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }
    
    return merged;
  }

  /**
   * เพิ่ม Processing Step
   */
  private addProcessingStep(name: string, startTime: number, success: boolean, error?: string): void {
    const step: ProcessingStep = {
      name,
      startTime,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      success,
      error: error || ''
    };
    this.processingStats.steps.push(step);
  }

  /**
   * Get Processing Stats
   */
  getProcessingStats(): ProcessingStats {
    return { ...this.processingStats };
  }

  /**
   * Reset Processing Stats
   */
  resetProcessingStats(): void {
    this.processingStats = {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      steps: []
    };
  }
}
