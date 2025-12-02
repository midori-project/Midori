/**
 * Override System Integration
 * เชื่อมต่อ Prompt Template System กับ OverrideSystem
 */

import { TemplateManager } from './template-manager';
import { BusinessCategoryManifest } from '../business-categories';
import { ConcreteManifest } from '../override-system/types';
import { AIPromptConfig } from '../override-system/types';

export interface OptimizedAIPromptConfig extends AIPromptConfig {
  useOptimizedPrompt?: boolean;
  language?: string; // ✅ เพิ่ม language support
}

/**
 * Enhanced OverrideSystem with Template Integration
 */
export class OverrideSystemWithTemplates {
  private templateManager: TemplateManager;
  private useOptimizedPrompt: boolean;
  
  constructor(useOptimizedPrompt: boolean = true) {
    this.templateManager = TemplateManager.getInstance();
    this.useOptimizedPrompt = useOptimizedPrompt;
  }
  
  /**
   * Create AI Prompt using Template System
   */
  createOptimizedAIPrompt(config: OptimizedAIPromptConfig): {
    systemPrompt: string;
    userPrompt: string;
    metadata: {
      templateUsed: string;
      promptLength: number;
      isOptimized: boolean;
      generationTime: number;
      variantsUsed?: Record<string, string>;
      variantSpecificFields?: Record<string, string[]>;
    };
  } {
    const start = Date.now();
    
    // Extract color hint from keywords
    const colorHint = this.extractColorHint(config.keywords, config.businessCategory);
    
    // ✅ Extract variant information from concrete manifest
    const variantInfo = this.extractVariantInfo(config.concreteManifest);
    
    // Generate prompt using template system with variant support
    const result = this.templateManager.generatePrompt({
      businessCategory: config.businessCategory,
      keywords: config.keywords,
      colorHint,
      useOptimizedPrompt: this.useOptimizedPrompt,
      concreteManifest: config.concreteManifest,
      variantInfo,
      language: config.language || 'th' // Pass language to template
    });
    
    const generationTime = Date.now() - start;
    
    return {
      systemPrompt: result.systemPrompt,
      userPrompt: result.userPrompt,
      metadata: {
        templateUsed: result.templateUsed,
        promptLength: result.promptLength,
        isOptimized: result.isOptimized,
        generationTime,
        variantsUsed: result.variantsUsed || {},
        variantSpecificFields: result.variantSpecificFields || {}
      }
    };
  }
  
  /**
   * Extract color hint from keywords and business category
   */
  private extractColorHint(keywords: string[], businessCategory: BusinessCategoryManifest): string {
    // Extract color keywords
    const colorKeywords = this.extractColorKeywords(keywords);
    
    // Check if user specified colors or if context requires fallback
    const shouldUseAIFallback = this.shouldUseAIColorFallback(keywords, businessCategory);
    
    if (colorKeywords.length > 0) {
      return `\n\n🎨 COLOR OVERRIDE: User specifically requested ${colorKeywords.join(", ")} colors. 
- IGNORE business category base colors completely
- Use ONLY these user-specified colors: ${colorKeywords.join(", ")}
- Primary color: ${colorKeywords[0]}
- Secondary color: ${colorKeywords[1] || colorKeywords[0]}
- This overrides any default colors for the business category`;
    } else if (shouldUseAIFallback) {
      return `\n\n🎨 AI FALLBACK: Context requires different colors than default.
- Business category default: ${businessCategory.globalSettings.palette.primary} + ${businessCategory.globalSettings.palette.secondary}
- Context analysis suggests different colors would be more appropriate
- Generate colors that better match the specific context and keywords`;
    } else {
      return `\n\n🎨 DEFAULT COLORS: Use business category default colors.
- Primary: ${businessCategory.globalSettings.palette.primary}
- Secondary: ${businessCategory.globalSettings.palette.secondary}
- bgTone: ${businessCategory.globalSettings.palette.bgTone}
- DO NOT change these colors unless user specifically requests different colors`;
    }
  }
  
  /**
   * Extract color keywords from user input
   */
  private extractColorKeywords(keywords: string[]): string[] {
    const thaiColorMap = {
      ฟ้า: "blue", น้ำเงิน: "blue", เขียว: "green", เขียวอ่อน: "green",
      ม่วง: "purple", ม่วงอ่อน: "purple", ชมพู: "pink", โรส: "pink",
      ส้ม: "orange", ส้มอ่อน: "orange", แดง: "red", แดงเข้ม: "red",
      เหลือง: "yellow", เหลืองอ่อน: "yellow", คราม: "indigo", ครามอ่อน: "indigo",
    };

    const englishColors = ["blue", "green", "purple", "pink", "orange", "red", "yellow", "indigo"];
    const foundColors = [];

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase().trim();

      if (thaiColorMap[keywordLower as keyof typeof thaiColorMap]) {
        foundColors.push(thaiColorMap[keywordLower as keyof typeof thaiColorMap]);
      }

      for (const [thaiColor, englishColor] of Object.entries(thaiColorMap)) {
        if (keywordLower.includes(thaiColor) || thaiColor.includes(keywordLower)) {
          foundColors.push(englishColor);
        }
      }

      if (englishColors.includes(keywordLower)) {
        foundColors.push(keywordLower);
      }
    }

    return Array.from(new Set(foundColors));
  }
  
  /**
   * Check if AI should override default colors
   */
  private shouldUseAIColorFallback(keywords: string[], businessCategory: BusinessCategoryManifest): boolean {
    const contextKeywords = [
      // Health/Wellness context
      'สุขภาพ', 'มังสวิรัติ', 'ออร์แกนิก', 'ธรรมชาติ', 'wellness', 'health', 'organic', 'natural',
      
      // Luxury/Premium context
      'ลักซ์ชัวรี่', 'หรูหรา', 'พรีเมียม', 'หรู', 'luxury', 'premium', 'sophisticated', 'elegant',
      
      // Modern/Tech context
      'โมเดิร์น', 'ทันสมัย', 'เทคโนโลยี', 'ดิจิทัล', 'modern', 'tech', 'digital', 'contemporary',
      
      // Minimal context
      'มินิมอล', 'เรียบง่าย', 'สะอาด', 'minimal', 'clean', 'simple', 'minimalist',
      
      // Nature/Eco context
      'ธรรมชาติ', 'สิ่งแวดล้อม', 'อีโค', 'nature', 'eco', 'environmental', 'green'
    ];

    // Check if any context keywords are present
    const hasContextKeywords = keywords.some(keyword => 
      contextKeywords.some(context => 
        keyword.toLowerCase().includes(context.toLowerCase())
      )
    );

    // Check for specific business type mismatches
    const businessType = businessCategory.id;
    const hasTypeMismatch = (
      (businessType === 'restaurant' && keywords.some(k => k.includes('สุขภาพ'))) ||
      (businessType === 'restaurant' && keywords.some(k => k.includes('ลักซ์ชัวรี่'))) ||
      (businessType === 'ecommerce' && keywords.some(k => k.includes('สุขภาพ'))) ||
      (businessType === 'healthcare' && keywords.some(k => k.includes('ลักซ์ชัวรี่')))
    );

    return hasContextKeywords || hasTypeMismatch;
  }
  
  /**
   * Get template statistics
   */
  getTemplateStats() {
    return this.templateManager.getStats();
  }
  
  /**
   * Validate all templates
   */
  validateTemplates(): boolean {
    return this.templateManager.validateAllTemplates();
  }
  
  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateManager.clearCache();
  }
  
  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.templateManager.getCacheSize();
  }

  /**
   * ✅ Extract variant information from concrete manifest
   */
  private extractVariantInfo(concreteManifest: any): any {
    if (!concreteManifest?.blocks) {
      return { variantsUsed: {}, variantSpecificFields: {} };
    }

    const variantsUsed: Record<string, string> = {};
    const variantSpecificFields: Record<string, string[]> = {};

    for (const block of concreteManifest.blocks) {
      if (block.metadata?.variantId) {
        variantsUsed[block.id] = block.metadata.variantId;
        
        // Extract variant-specific required fields
        const variantFields = Object.keys(block.placeholders || {})
          .filter(key => {
            const placeholder = block.placeholders[key];
            return placeholder.required && !this.isBaseField(key);
          });
        
        if (variantFields.length > 0) {
          variantSpecificFields[block.id] = variantFields;
        }
      }
    }

    return { variantsUsed, variantSpecificFields };
  }

  /**
   * ✅ Check if field is a base field (not variant-specific)
   */
  private isBaseField(fieldName: string): boolean {
    const baseFields = [
      'brand', 'brandFirstChar', 'ctaButton', 'menuItems',
      'badge', 'heading', 'subheading', 'ctaLabel', 'secondaryCta',
      'title', 'description', 'address', 'phone', 'email',
      'companyName', 'socialLinks', 'quickLinks'
    ];
    return baseFields.includes(fieldName);
  }
}
