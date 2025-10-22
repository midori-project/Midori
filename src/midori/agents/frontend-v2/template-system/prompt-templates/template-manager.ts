/**
 * Template Manager
 * จัดการ Prompt Templates แบบ centralized
 */

import { generateCompatiblePrompt, validateTemplateCompatibility, getTemplateStats } from './integration';

export interface TemplateConfig {
  businessCategory: any;
  keywords: string[];
  colorHint: string;
  useOptimizedPrompt?: boolean;
  concreteManifest?: any; // ✅ เพิ่มสำหรับ variant support
  variantInfo?: VariantInfo; // ✅ เพิ่มสำหรับ variant support
  language?: string; // ✅ เพิ่มสำหรับ language support
}

export interface VariantInfo {
  variantsUsed: Record<string, string>; // blockId -> variantId
  variantSpecificFields: Record<string, string[]>; // blockId -> required fields
}

export interface TemplateResult {
  systemPrompt: string;
  userPrompt: string;
  templateUsed: string;
  promptLength: number;
  isOptimized: boolean;
  variantsUsed?: Record<string, string>; // ✅ เพิ่มสำหรับ variant tracking
  variantSpecificFields?: Record<string, string[]>; // ✅ เพิ่มสำหรับ variant tracking
}

/**
 * Template Manager Class
 */
export class TemplateManager {
  private static instance: TemplateManager;
  private templateCache: Map<string, TemplateResult> = new Map();
  
  private constructor() {}
  
  static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }
  
  /**
   * Generate Prompt using Template System
   */
  generatePrompt(config: TemplateConfig): TemplateResult {
    const { businessCategory, keywords, colorHint, useOptimizedPrompt = true, concreteManifest, variantInfo, language } = config;
    
    // Create cache key (include variant info for proper caching)
    const variantKey = variantInfo ? Object.values(variantInfo.variantsUsed).join(',') : 'no-variants';
    const cacheKey = `${businessCategory.id}-${keywords.join(',')}-${useOptimizedPrompt}-${variantKey}`;
    
    // Check cache
    if (this.templateCache.has(cacheKey)) {
      console.log('📦 Using cached template');
      return this.templateCache.get(cacheKey)!;
    }
    
    let result: TemplateResult;
    
    if (useOptimizedPrompt) {
      // Use optimized template system with variant support
      const optimized = generateCompatiblePrompt(businessCategory, keywords, colorHint, concreteManifest, variantInfo, language);
      result = {
        systemPrompt: optimized.systemPrompt,
        userPrompt: optimized.userPrompt,
        templateUsed: businessCategory.id,
        promptLength: optimized.userPrompt.length,
        isOptimized: true,
        variantsUsed: variantInfo?.variantsUsed || {},
        variantSpecificFields: variantInfo?.variantSpecificFields || {}
      };
    } else {
      // Fallback to legacy system
      result = this.generateLegacyPrompt(config);
    }
    
    // Cache result
    this.templateCache.set(cacheKey, result);
    
    console.log(`🎯 Generated prompt using ${result.templateUsed} template (${result.promptLength} chars)`);
    return result;
  }
  
  /**
   * Generate Legacy Prompt (fallback)
   */
  private generateLegacyPrompt(config: TemplateConfig): TemplateResult {
    const { businessCategory, keywords, colorHint } = config;
    
    // Simple legacy prompt
    const systemPrompt = `You are a website content generator. Generate JSON content for business websites.
Rules:
- Use Thai language for all text content
- Use ONLY English color names: blue, green, purple, pink, orange, red, yellow, indigo
- bgTone must be a NUMBER (50-900)
- Generate realistic content based on keywords
- All fields are REQUIRED - provide actual content, not placeholders`;
    
    const userPrompt = `Keywords: ${keywords.join(", ")}
${colorHint}

Generate JSON with this structure:
{
  "global": {
    "palette": {
      "primary": "${businessCategory.globalSettings.palette.primary}",
      "secondary": "${businessCategory.globalSettings.palette.secondary}",
      "bgTone": ${businessCategory.globalSettings.palette.bgTone}
    },
    "tokens": {
      "radius": "${businessCategory.globalSettings.tokens.radius}",
      "spacing": "${businessCategory.globalSettings.tokens.spacing}"
    }
  },
  "Navbar": {
    "brand": "Business name",
    "brandFirstChar": "B",
    "ctaButton": "Contact us",
    "menuItems": [
      { "label": "หน้าแรก", "href": "/" },
      { "label": "เกี่ยวกับเรา", "href": "/about" },
      { "label": "ติดต่อ", "href": "/contact" }
    ]
  },
  "Hero": {
    "badge": "Quality service",
    "heading": "Main heading",
    "subheading": "Description",
    "ctaLabel": "Learn more",
    "secondaryCta": "Contact",
    "heroImage": "https://via.placeholder.com/1920x1080?text=Hero+Image",
    "heroImageAlt": "Hero background image",
    "stat1": "100+",
    "stat1Label": "Customers",
    "stat2": "5★",
    "stat2Label": "Reviews",
    "stat3": "24/7",
    "stat3Label": "Support"
  },
  "About": {
    "title": "About us",
    "description": "Company description",
    "features": [
      { "title": "Feature 1", "description": "Description" },
      { "title": "Feature 2", "description": "Description" },
      { "title": "Feature 3", "description": "Description" }
    ],
    "stats": [
      { "number": "100+", "label": "Customers" },
      { "number": "5★", "label": "Reviews" },
      { "number": "24/7", "label": "Support" },
      { "number": "100%", "label": "Satisfaction" }
    ],
    "aboutImage": "https://via.placeholder.com/400x300?text=About+Image",
    "aboutImageAlt": "About image"
  },
  "Menu": {
    "title": "Products/Services",
    "menuItems": [
      {
        "name": "Item 1",
        "price": "100",
        "description": "Description",
        "image": "https://via.placeholder.com/400x300?text=Item+1",
        "imageAlt": "Item 1",
        "category": "product"
      }
    ]
  },
  "Contact": {
    "title": "Contact us",
    "subtitle": "Get in touch",
    "address": "123 Main St, City 10110",
    "phone": "02-123-4567",
    "email": "info@company.com",
    "businessHours": "Mon-Sun 9:00-18:00",
    "contactFormTitle": "Send us a message",
    "contactFormCta": "Send Message"
  },
  "Footer": {
    "companyName": "Company name",
    "description": "Company description",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Line", "url": "https://line.me", "icon": "💬" }
    ],
    "quickLinks": [
      { "label": "หน้าแรก", "href": "/" },
      { "label": "เกี่ยวกับเรา", "href": "/about" },
      { "label": "ติดต่อ", "href": "/contact" }
    ],
    "address": "123 Main St, City 10110",
    "phone": "02-123-4567",
    "email": "info@company.com"
  },
  "Theme": {
    "radius": "${businessCategory.globalSettings.tokens.radius}",
    "spacing": "${businessCategory.globalSettings.tokens.spacing}"
  }
}`;
    
    return {
      systemPrompt,
      userPrompt,
      templateUsed: 'legacy',
      promptLength: userPrompt.length,
      isOptimized: false
    };
  }
  
  /**
   * Validate all templates
   */
  validateAllTemplates(): boolean {
    console.log('🔍 Validating all templates...');
    const isValid = validateTemplateCompatibility();
    
    if (isValid) {
      console.log('✅ All templates are valid');
    } else {
      console.error('❌ Some templates are invalid');
    }
    
    return isValid;
  }
  
  /**
   * Get template statistics
   */
  getStats() {
    return getTemplateStats();
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.templateCache.clear();
    console.log('🗑️ Template cache cleared');
  }
  
  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.templateCache.size;
  }
}
