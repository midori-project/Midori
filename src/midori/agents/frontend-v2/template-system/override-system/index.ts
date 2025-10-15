// Override System Main Export
// Export ทั้งหมดสำหรับระบบ Override

// ===== Core Classes =====
export { ManifestResolver } from "./resolver";
export { TemplateRenderer } from "./renderer";
export { SchemaValidator } from "./validation";

// ===== Error Handling =====
export {
  OverrideError,
  SchemaValidationError,
  TemplateRenderError,
  ManifestResolutionError,
  ValidationError,
  AIResponseError,
  FileGenerationError,
  ConfigurationError,
  ErrorFactory,
  ErrorHandler,
  ErrorRecovery,
} from "./errors";

// ===== Logging =====
export { OverrideLogger, LoggerFactory, logger } from "./logger";

// ===== Types =====
export type {
  ConcreteManifest,
  ConcreteBlock,
  ConcreteManifestMetadata,
  ConcreteBlockMetadata,
  ResolverConfig,
  ResolverResult,
  RendererConfig,
  RendererResult,
  OverrideConfig,
  OverrideResult,
  ValidationResult,
  ValidationError as ValidationErrorType,
  ValidationWarning,
  ValidationSummary,
  LogEntry,
  LoggerConfig,
  ProcessingStats,
  ProcessingStep,
  FileMapping,
  AIPromptConfig,
  AIResponse,
} from "./types";

// ===== Re-export from other modules =====
export type {
  SharedBlock,
  PlaceholderConfig,
  BlockVariant,
} from "../shared-blocks";

export type {
  BusinessCategoryManifest,
  BlockUsage,
  CategoryOverrides,
  GlobalSettings,
} from "../business-categories";

// ===== Main Override System Class =====

import { ManifestResolver } from "./resolver";
import { TemplateRenderer } from "./renderer";
import { SchemaValidator } from "./validation";
import { ErrorHandler } from "./errors";
import { OverrideLogger } from "./logger";
import { SharedBlock } from "../shared-blocks";
import { BusinessCategoryManifest } from "../business-categories";
import {
  ConcreteManifest,
  ResolverResult,
  RendererResult,
  OverrideConfig,
  AIPromptConfig,
  AIResponse,
} from "./types";

/**
 * Main Override System Class
 * จัดการทั้ง Resolver และ Renderer
 */
export class OverrideSystem {
  private resolver: ManifestResolver;
  private renderer: TemplateRenderer;
  private validator: SchemaValidator;
  private errorHandler: ErrorHandler;
  private logger: OverrideLogger;

  constructor(
    sharedBlocks: SharedBlock[],
    businessCategories: BusinessCategoryManifest[]
  ) {
    this.resolver = new ManifestResolver(sharedBlocks, businessCategories);
    this.renderer = new TemplateRenderer();
    this.validator = new SchemaValidator();
    this.errorHandler = ErrorHandler.getInstance();
    this.logger = OverrideLogger.getInstance();
  }

  /**
   * สร้าง Concrete Manifest
   */
  async resolveManifest(
    businessCategoryId: string,
    customOverrides: OverrideConfig[] = []
  ): Promise<ResolverResult> {
    try {
      this.logger.logResolverStep("Starting manifest resolution", {
        businessCategoryId,
        customOverridesCount: customOverrides.length,
      });

      const result = this.resolver.resolveManifest(
        businessCategoryId,
        customOverrides
      );

      this.logger.logConcreteManifestCreation(result.concreteManifest);
      this.logger.logAppliedOverrides(result.appliedOverrides);

      return result;
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        businessCategoryId,
        customOverrides,
      });
      throw error;
    }
  }

  /**
   * Render Templates
   */
  async renderTemplates(
    concreteManifest: ConcreteManifest,
    userData: Record<string, any>,
    validationEnabled: boolean = true
  ): Promise<RendererResult> {
    try {
      this.logger.logRendererStep("Starting template rendering", {
        totalBlocks: concreteManifest.blocks.length,
        validationEnabled,
      });

      const result = this.renderer.render({
        concreteManifest,
        userData,
        validationEnabled,
      });

      this.logger.logGeneratedFiles(result.files);
      this.logger.logValidationResults(result.validationResults);

      return result;
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        concreteManifest,
        userData,
      });
      throw error;
    }
  }

  /**
   * สร้างเว็บไซต์แบบครบวงจร
   */
  async generateWebsite(
    businessCategoryId: string,
    userData: Record<string, any>,
    customOverrides: OverrideConfig[] = [],
    validationEnabled: boolean = true
  ): Promise<{
    files: Record<string, string>;
    concreteManifest: ConcreteManifest;
    appliedOverrides: string[];
    processingTime: number;
  }> {
    const startTime = Date.now();

    try {
      this.logger.logBusinessCategorySelection(
        businessCategoryId,
        userData.keywords || []
      );

      // Step 1: Resolve Manifest
      const resolverResult = await this.resolveManifest(
        businessCategoryId,
        customOverrides
      );

      // Step 2: Render Templates
      const rendererResult = await this.renderTemplates(
        resolverResult.concreteManifest,
        userData,
        validationEnabled
      );

      const totalTime = Date.now() - startTime;

      this.logger.logProcessingStats({
        startTime,
        endTime: Date.now(),
        duration: totalTime,
        steps: [],
      });

      return {
        files: rendererResult.files,
        concreteManifest: resolverResult.concreteManifest,
        appliedOverrides: [
          ...resolverResult.appliedOverrides,
          ...rendererResult.appliedOverrides,
        ],
        processingTime: totalTime,
      };
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        businessCategoryId,
        userData,
      });
      throw error;
    }
  }

  /**
   * สร้าง AI Prompt Config
   */
  createAIPromptConfig(
    businessCategoryId: string,
    concreteManifest: ConcreteManifest,
    keywords: string[],
    customInstructions?: string
  ): AIPromptConfig {
    const businessCategory = concreteManifest.businessCategory;

    this.logger.logAIInteraction("Creating AI prompt config", {
      businessCategoryId,
      keywords,
      totalBlocks: concreteManifest.blocks.length,
    });

    return {
      businessCategory,
      concreteManifest,
      keywords,
      customInstructions: customInstructions || "",
    };
  }

  /**
   * สร้าง AI Prompt โดยตรง (ใช้ Template System)
   */
  createAIPrompt(
    businessCategoryId: string,
    concreteManifest: ConcreteManifest,
    keywords: string[],
    customInstructions?: string
  ): string {
    // ใช้ Template System แทน prompt เดิม
    const { OverrideSystemWithTemplates } = require("../prompt-templates/override-integration");
    const templateSystem = new OverrideSystemWithTemplates(true);
    
    const config = this.createAIPromptConfig(
      businessCategoryId,
      concreteManifest,
      keywords,
      customInstructions
    );
    
    const result = templateSystem.createOptimizedAIPrompt(config);
    
    // Log performance metrics
    console.log(`🎯 Template System: ${result.metadata.templateUsed} (${result.metadata.promptLength} chars, ${result.metadata.generationTime}ms)`);
    
    return result.userPrompt;
  }

  /**
   * Validate User Data
   */
  validateUserData(
    userData: Record<string, any>,
    concreteManifest: ConcreteManifest
  ) {
    return this.validator.validateUserData(userData, concreteManifest);
  }

  /**
   * Get Processing Stats
   */
  getProcessingStats() {
    return {
      resolver: this.resolver.getProcessingStats(),
      renderer: this.renderer.getProcessingStats(),
      logger: this.logger.getLogStatistics(),
    };
  }

  /**
   * Get Error Log
   */
  getErrorLog() {
    return this.errorHandler.getErrorLog();
  }

  /**
   * Get Log Entries
   */
  getLogEntries() {
    return this.logger.getLogEntries();
  }

  /**
   * Clear All Logs
   */
  clearAllLogs() {
    this.logger.clearLogEntries();
    this.errorHandler.clearErrorLog();
  }

  /**
   * Reset Processing Stats
   */
  resetProcessingStats() {
    this.resolver.resetProcessingStats();
    this.renderer.resetProcessingStats();
  }
}

// ===== Factory Functions =====

/**
 * สร้าง Override System Instance
 */
export function createOverrideSystem(
  sharedBlocks: SharedBlock[],
  businessCategories: BusinessCategoryManifest[]
): OverrideSystem {
  return new OverrideSystem(sharedBlocks, businessCategories);
}

/**
 * สร้าง AI Prompt จาก Config
 */
export function createAIPrompt(config: AIPromptConfig): string {
  const { businessCategory, concreteManifest, keywords, customInstructions } =
    config;

  // Extract color preferences from keywords
  const colorKeywords = extractColorKeywords(keywords);
  console.log("Keywords:", keywords);
  console.log("Extracted colors:", colorKeywords);
  
  // Check if user specified colors or if context requires fallback
  const shouldUseAIFallback = shouldUseAIColorFallback(keywords, businessCategory);
  
  const colorHint = colorKeywords.length > 0
    ? `\n\n🎨 COLOR OVERRIDE: User specifically requested ${colorKeywords.join(", ")} colors. 
  - IGNORE business category base colors completely
  - Use ONLY these user-specified colors: ${colorKeywords.join(", ")}
  - Primary color: ${colorKeywords[0]}
  - Secondary color: ${colorKeywords[1] || colorKeywords[0]}
  - This overrides any default colors for the business category`
    : shouldUseAIFallback
    ? `\n\n🎨 AI FALLBACK: Context requires different colors than default.
  - Business category default: ${businessCategory.globalSettings.palette.primary} + ${businessCategory.globalSettings.palette.secondary}
  - Context analysis suggests different colors would be more appropriate
  - Generate colors that better match the specific context and keywords`
    : `\n\n🎨 DEFAULT COLORS: Use business category default colors.
  - Primary: ${businessCategory.globalSettings.palette.primary}
  - Secondary: ${businessCategory.globalSettings.palette.secondary}
  - bgTone: ${businessCategory.globalSettings.palette.bgTone}
  - DO NOT change these colors unless user specifically requests different colors`;

  // Debug logging
  console.log("🎨 Color selection debug:", {
    colorKeywords,
    shouldUseAIFallback,
    businessCategory: businessCategory.id,
    defaultPrimary: businessCategory.globalSettings.palette.primary,
    defaultSecondary: businessCategory.globalSettings.palette.secondary
  });

  let prompt = `You are a website content generator. Based on the keywords and business category, generate appropriate content.

Business Category: ${businessCategory.name}
Description: ${businessCategory.description}
Keywords: ${keywords.join(", ")}${colorHint}

Concrete Manifest (Complete Schema):
${JSON.stringify(concreteManifest, null, 2)}

Generate content that matches the schema exactly. Return JSON with the following structure:
{
  "global": {
    "palette": {
      "primary": "${colorKeywords.length > 0 ? colorKeywords[0] : (shouldUseAIFallback ? 'choose appropriate color based on context' : businessCategory.globalSettings.palette.primary)}",
      "secondary": "${colorKeywords.length > 0 ? (colorKeywords[1] || colorKeywords[0]) : (shouldUseAIFallback ? 'choose complementary color based on context' : businessCategory.globalSettings.palette.secondary)}", 
      "bgTone": "${colorKeywords.length > 0 ? 'choose appropriate background tone' : (shouldUseAIFallback ? 'choose appropriate background tone' : businessCategory.globalSettings.palette.bgTone)}"
    },
    "tokens": {
      "radius": "${businessCategory.globalSettings.tokens.radius}",
      "spacing": "${businessCategory.globalSettings.tokens.spacing}"
    }
  }`;

  // Add block-specific placeholders
  for (const block of concreteManifest.blocks) {
    const blockKey = getBlockDataKey(block.id);
    prompt += `,
  "${blockKey}": {`;

    for (const [placeholder, config] of Object.entries(block.placeholders)) {
      const description =
        config.description || `appropriate ${config.type} value`;
      const required = config.required ? " (REQUIRED)" : "";

      // Add specific instructions for array types
      if (config.type === "array") {
        prompt += `
    "${placeholder}": [${getArrayExample(placeholder, block.id)}]${required}`;
      } else {
        prompt += `
    "${placeholder}": "${description}${required}"`;
      }
    }

    prompt += `
  }`;
    
    // ✨ AUTO-DETECT: เพิ่ม AI instructions อัตโนมัติสำหรับ variant-specific required placeholders
    if (block.metadata?.variantId) {
      const variantInstructions = generateVariantInstructions(block, blockKey);
      if (variantInstructions) {
        prompt += variantInstructions;
      }
    }
  }

  prompt += `
}

IMPORTANT: You MUST include data for ALL components in your response:
- Navbar: brand, brandFirstChar, ctaButton, menuItems
- Hero: badge, heading, subheading, ctaLabel, secondaryCta, heroImage, heroImageAlt
- About: title, description, features (array), stats (array)
- Contact: title, subtitle, address, phone, email, businessHours
- Footer: companyName, description, socialLinks (array), quickLinks (array), address, phone, email
- Menu: title, menuItems (array with name, price, description, image, imageAlt, category)
- Theme: radius, spacing

Menu Items Rules:
- Each menu item MUST include: name, price, description, image, imageAlt, category
- image: Use placeholder URLs like "https://via.placeholder.com/400x300?text=Item+Name"
- imageAlt: Describe the item in Thai
- category: Choose appropriate category based on business type:
  * Restaurant: food, rice, noodles, soup, curry, meat, vegetarian
  * E-commerce: product, book, stationery, toy, clothing, electronics
  * Healthcare: medicine, health, medical, pharmacy, wellness
  * Portfolio: design, creative, development, art, professional
- Choose appropriate images that match the item name and business type
- For restaurant business: Use food-related images
- For e-commerce business: Use product-related images
- For healthcare business: Use health/wellness related images
- For portfolio business: Use design/creative related images
- IMPORTANT: Generate 4-6 menu items for a complete menu

Hero Image Rules:
- heroImage: Use placeholder URLs like "https://via.placeholder.com/1920x1080?text=Hero+Image"
- heroImageAlt: Describe the hero background image in Thai
- Choose images that represent the business type and keywords
- Images should be landscape orientation (1920x1080)
- Use descriptive alt text for accessibility

Image Guidelines:
- Use high-quality Unsplash images
- Images should be 400x300 pixels with crop=center for menu items
- Hero images should be 1920x1080 pixels for full background
- Choose images that represent the actual food/product/business
- Ensure images are appropriate for the business category
- Use descriptive alt text for accessibility

Rules:
- Use Thai language
- Follow the exact schema provided
- Respect maxLength, minLength, and enum constraints
- All required fields must be provided (marked with REQUIRED)
- Make content relevant to the keywords and business category
- Keep text concise and professional
- For Navbar.brand: Use a realistic business name related to the keywords
- For Navbar.ctaButton: Use appropriate call-to-action text for the business type
- For Hero fields: Create compelling, business-appropriate content
- For About fields: Create company/business information and features
- For Contact fields: Create realistic contact information
- For Footer fields: Create company info, social links, and quick links
- IMPORTANT: Generate actual content, not placeholder text like "Welcome" or "This is a description"
- IMPORTANT: For array fields, provide actual array data, not empty arrays
- IMPORTANT: Do NOT use "Default Value" in any field
- For restaurant business: Use food-related content, menu items, restaurant names
- For e-commerce business: Use product-related content, shop names, shopping actions
- For healthcare business: Use medical-related content, health services
- For portfolio business: Use creative/professional content, project showcases

Color Guidelines:
- Available colors: blue, green, purple, pink, orange, red, yellow, indigo
- Available bgTones: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- CRITICAL: bgTone must be a NUMBER (50-900), NOT a color name
- For blue theme: use bgTone "100" or "200" for light blue background
- For dark themes: use bgTone "700" or "800" for dark backgrounds
- Thai color keywords mapping:
  * ฟ้า, น้ำเงิน = blue
  * เขียว, เขียวอ่อน = green  
  * ม่วง, ม่วงอ่อน = purple
  * ชมพู, โรส = pink
  * ส้ม, ส้มอ่อน = orange
  * แดง, แดงเข้ม = red
  * เหลือง, เหลืองอ่อน = yellow
  * คราม, ครามอ่อน = indigo
- CRITICAL: Use business category default colors unless user specifies different colors or context requires fallback
- If user specifies colors in keywords (Thai or English), use ONLY those colors
- If context requires different colors (health, luxury, modern, etc.), generate appropriate colors
- If no special requirements, use business category default colors:
  * Restaurant: ${businessCategory.globalSettings.palette.primary} + ${businessCategory.globalSettings.palette.secondary}
  * E-commerce: blue + purple (professional, trustworthy)
  * Healthcare: green + blue (clean, trustworthy)
  * Portfolio: purple + indigo (creative, professional)
- CRITICAL: You MUST use ONLY English color names (blue, green, purple, pink, orange, red, yellow, indigo) in your response
- DO NOT use Thai color names (ฟ้า, ส้ม, เขียว, etc.) in the JSON response
- Primary color should be the main brand color
- Secondary color should complement the primary color
- bgTone should provide good contrast (lighter for dark text, darker for light text)`;

  if (customInstructions) {
    prompt += `\n\nAdditional Instructions:\n${customInstructions}`;
  }

  return prompt;
}

/**
 * Get array example based on placeholder and block type
 */
function getArrayExample(placeholder: string, blockId: string): string {
  const examples: Record<string, Record<string, string>> = {
    "navbar-basic": {
      menuItems:
        '{ "label": "หน้าแรก", "href": "/" }, { "label": "เกี่ยวกับเรา", "href": "/about" }, { "label": "ติดต่อ", "href": "/contact" }',
      socialLinks:
        '{ "name": "Facebook", "url": "https://facebook.com", "icon": "📘" }, { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" }',
    },
    "about-basic": {
      features:
        '{ "title": "คุณสมบัติ 1", "description": "คำอธิบาย" }, { "title": "คุณสมบัติ 2", "description": "คำอธิบาย" }, { "title": "คุณสมบัติ 3", "description": "คำอธิบาย" }',
      stats:
        '{ "number": "100+", "label": "ลูกค้า" }, { "number": "5★", "label": "รีวิว" }, { "number": "24/7", "label": "บริการ" }, { "number": "100%", "label": "ความพึงพอใจ" }',
    },
    "menu-basic": {
      menuItems:
        '{ "name": "อาหารจาน 1", "price": "120", "description": "คำอธิบายอาหาร", "image": "https://via.placeholder.com/400x300?text=Food+1", "imageAlt": "อาหารจาน 1", "category": "food" }, { "name": "สินค้า 1", "price": "150", "description": "คำอธิบายสินค้า", "image": "https://via.placeholder.com/400x300?text=Product+1", "imageAlt": "สินค้า 1", "category": "product" }, { "name": "บริการ 1", "price": "200", "description": "คำอธิบายบริการ", "image": "https://via.placeholder.com/400x300?text=Service+1", "imageAlt": "บริการ 1", "category": "service" }, { "name": "งานสร้างสรรค์ 1", "price": "250", "description": "คำอธิบายงานสร้างสรรค์", "image": "https://via.placeholder.com/400x300?text=Creative+1", "imageAlt": "งานสร้างสรรค์ 1", "category": "design" }',
    },
    "footer-basic": {
      socialLinks:
        '{ "name": "Facebook", "url": "https://facebook.com", "icon": "📘" }, { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" }, { "name": "Line", "url": "https://line.me", "icon": "💬" }',
      quickLinks:
        '{ "label": "หน้าแรก", "href": "/" }, { "label": "เกี่ยวกับเรา", "href": "/about" }, { "label": "ติดต่อ", "href": "/contact" }',
    },
  };

  return examples[blockId]?.[placeholder] || "{}";
}

/**
 * Extract color keywords from input keywords
 */
function extractColorKeywords(keywords: string[]): string[] {
  const thaiColorMap: Record<string, string> = {
    ฟ้า: "blue",
    น้ำเงิน: "blue",
    เขียว: "green",
    เขียวอ่อน: "green",
    ม่วง: "purple",
    ม่วงอ่อน: "purple",
    ชมพู: "pink",
    โรส: "pink",
    ส้ม: "orange",
    ส้มอ่อน: "orange",
    แดง: "red",
    แดงเข้ม: "red",
    เหลือง: "yellow",
    เหลืองอ่อน: "yellow",
    คราม: "indigo",
    ครามอ่อน: "indigo",
  };

  const englishColors = [
    "blue",
    "green",
    "purple",
    "pink",
    "orange",
    "red",
    "yellow",
    "indigo",
  ];
  const foundColors: string[] = [];

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase().trim();

    // Check Thai color mapping (exact match)
    if (thaiColorMap[keywordLower]) {
      foundColors.push(thaiColorMap[keywordLower]);
    }

    // Check Thai color mapping (contains match)
    for (const [thaiColor, englishColor] of Object.entries(thaiColorMap)) {
      if (
        keywordLower.includes(thaiColor) ||
        thaiColor.includes(keywordLower)
      ) {
        foundColors.push(englishColor);
      }
    }

    // Check English colors
    if (englishColors.includes(keywordLower)) {
      foundColors.push(keywordLower);
    }
  }

  return [...new Set(foundColors)]; // Remove duplicates
}

/**
 * Check if AI color fallback should be used based on context
 */
function shouldUseAIColorFallback(keywords: string[], businessCategory: any): boolean {
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
 * ✨ AUTO-DETECT: สร้าง AI instructions สำหรับ variant-specific required placeholders
 * 
 * กฏ: ถ้า variant มี required placeholders ที่ไม่มีใน base block
 *      ระบบจะสร้าง instructions ให้ AI อัตโนมัติ
 */
function generateVariantInstructions(block: any, blockKey: string): string | null {
  const variantId = block.metadata?.variantId;
  if (!variantId) return null;
  
  // หา required placeholders ที่มาจาก variant (ไม่ใช่ base block)
  const variantSpecificRequired: Record<string, any> = {};
  
  for (const [placeholder, config] of Object.entries(block.placeholders)) {
    const configTyped = config as any;
    
    // เช็คว่า placeholder นี้:
    // 1. Required = true
    // 2. มาจาก variant (ไม่ใช่ base placeholders)
    if (configTyped.required && !isBasePlaceholder(placeholder)) {
      variantSpecificRequired[placeholder] = configTyped;
    }
  }
  
  // ถ้าไม่มี variant-specific required placeholders → ไม่ต้องเพิ่ม instructions
  if (Object.keys(variantSpecificRequired).length === 0) {
    return null;
  }
  
  // สร้าง instructions
  let instructions = `\n\n  ⚠️ IMPORTANT: This ${blockKey} block uses variant '${variantId}' which REQUIRES additional fields:\n`;
  
  // Group placeholders by pattern (เช่น stat1/stat1Label)
  const groups = groupPlaceholders(variantSpecificRequired);
  
  for (const [groupName, placeholders] of Object.entries(groups)) {
    instructions += `  - ${groupName}: `;
    
    // สร้างตัวอย่าง
    const examples = generateExamples(groupName, placeholders);
    instructions += examples + '\n';
  }
  
  instructions += `  You MUST include these in the ${blockKey} object above!`;
  
  return instructions;
}

/**
 * เช็คว่า placeholder เป็น base placeholder หรือไม่
 */
function isBasePlaceholder(placeholder: string): boolean {
  const basePlaceholders = [
    'badge', 'heading', 'subheading', 
    'ctaLabel', 'secondaryCta',
    'heroImage', 'heroImageAlt',
    'brand', 'brandFirstChar', 'ctaButton', 'menuItems',
    'title', 'description', 'features', 'stats',
    'address', 'phone', 'email', 'businessHours',
    'companyName', 'socialLinks', 'quickLinks',
    'radius', 'spacing'
  ];
  
  return basePlaceholders.includes(placeholder);
}

/**
 * จัดกลุ่ม placeholders ตามรูปแบบ (เช่น stat1/stat1Label → stats)
 */
function groupPlaceholders(placeholders: Record<string, any>): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  const processed = new Set<string>();
  
  for (const placeholder of Object.keys(placeholders)) {
    if (processed.has(placeholder)) continue;
    
    // Pattern: stat1, stat1Label, stat2, stat2Label, ...
    if (/^stat\d+$/.test(placeholder)) {
      if (!groups['stats']) groups['stats'] = [];
      
      const num = placeholder.match(/\d+/)?.[0];
      groups['stats'].push(placeholder);
      processed.add(placeholder);
      
      const labelKey = `stat${num}Label`;
      if (labelKey in placeholders) {
        groups['stats'].push(labelKey);
        processed.add(labelKey);
      }
    }
    // Pattern: testimonials (array)
    else if (placeholder === 'testimonials') {
      groups['testimonials'] = [placeholder];
      processed.add(placeholder);
    }
    // Pattern: อื่นๆ
    else {
      groups[placeholder] = [placeholder];
      processed.add(placeholder);
    }
  }
  
  return groups;
}

/**
 * สร้างตัวอย่างสำหรับแต่ละกลุ่ม
 */
function generateExamples(groupName: string, placeholders: string[]): string {
  const exampleMap: Record<string, string> = {
    'stats': 'stat1: "15+", stat1Label: "ปีประสบการณ์", stat2: "1000+", stat2Label: "ลูกค้าพึงพอใจ", stat3: "50+", stat3Label: "เมนูหลากหลาย"',
    'testimonials': '[{ name: "สมชาย ใจดี", quote: "อาหารอร่อยมาก", role: "ลูกค้าประจำ" }, { name: "สมหญิง สบายดี", quote: "บริการดีเยี่ยม", role: "ลูกค้า" }]',
    'videoUrl': '"https://example.com/video.mp4"',
    'gallery': '[{ image: "https://...", alt: "..." }, ...]'
  };
  
  return exampleMap[groupName] || placeholders.map(p => `${p}: "value"`).join(', ');
}

/**
 * แปลง Block ID เป็น Data Key
 */
function getBlockDataKey(blockId: string): string {
  const keyMap: Record<string, string> = {
    "hero-basic": "Hero",
    "navbar-basic": "Navbar", 
    "theme-basic": "Theme",
    "footer-basic": "Footer",
    "about-basic": "About",
    "contact-basic": "Contact",
    "menu-basic": "Menu"
  };

  return keyMap[blockId] || blockId.charAt(0).toUpperCase() + blockId.slice(1);
}

// ===== Default Export =====
export default OverrideSystem;
