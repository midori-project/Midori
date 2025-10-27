// Business Category Manifests
// Each business category defines which shared blocks to use and how to customize them

import { restaurantCategories } from "./categories/restaurants";
import { ecommerceCategories } from "./categories/ecommerce";
import { portfolioCategories } from "./categories/portfolio";
import { healthcareCategories } from "./categories/healthcare";
import { hotelCategories } from "./categories/hotels";
import { travelCategories } from "./categories/travel";
import { academyCategories } from "./categories/academy";
import { bookstoreCategories } from "./categories/bookstore";
import { bakeryCategories } from "./categories/bakery";
import { newsCategories } from "./categories/news";

export interface BusinessCategoryManifest {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  blocks: BlockUsage[];
  globalSettings: GlobalSettings;
  overrides: CategoryOverrides;
  variantPools: VariantPools;
}

export interface BlockUsage {
  blockId: string;
  variantId?: string;
  required: boolean;
  customizations: Record<string, any>;
}

export interface GlobalSettings {
  palette: {
    primary: string;
    secondary?: string;
    bgTone?: string;
  };
  tokens: {
    radius: string;
    spacing: string;
  };
  typography?: TypographyConfig;  // ⭐ Optional typography config
  tone?: string;
  reasoning?: string;
}

export interface TypographyConfig {
  fontFamily: string;
  googleFont?: string;
  fallback?: string[];
}

export interface CategoryOverrides {
  [blockId: string]: {
    placeholders: Record<string, PlaceholderOverride>;
    template?: string;
  };
}

export interface PlaceholderOverride {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  enum?: string[];
  defaultValue?: any;
  description?: string;
}

export interface VariantPools {
  [blockId: string]: {
    allowedVariants: string[];
    defaultVariant?: string;
    randomSelection?: boolean;
    constraints?: VariantConstraints;
  };
}

export interface VariantConstraints {
  minVariants?: number;
  maxVariants?: number;
  requiredVariants?: string[];
  excludedVariants?: string[];
  businessType?: string[];
  tone?: string[];
}

/**
 * Font Pool - Similar to VariantPools but for fonts
 */
export interface FontPool {
  allowedFonts: string[];  // Array of font preset keys
  defaultFont?: string;
  randomSelection?: boolean;
  constraints?: FontConstraints;
}

export interface FontConstraints {
  businessType?: string[];
  tone?: string[];
}

/**
 * Font Pool for each category
 */
export interface FontPools {
  [categoryId: string]: FontPool;
}

// Business Category Definitions
export const BUSINESS_CATEGORIES: BusinessCategoryManifest[] = [
  ...restaurantCategories,
  ...ecommerceCategories,
  ...portfolioCategories,
  ...healthcareCategories,
  ...hotelCategories,
  ...travelCategories,
  ...academyCategories,
  ...bookstoreCategories,
  ...bakeryCategories,
  ...newsCategories
];

// ===== Variant Pool Management Functions =====

/**
 * Get allowed variants for a specific block in a business category
 */
export function getAllowedVariants(
  categoryId: string, 
  blockId: string
): string[] {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category || !category.variantPools[blockId]) {
    return [];
  }
  return category.variantPools[blockId].allowedVariants;
}

/**
 * Get default variant for a specific block in a business category
 */
export function getDefaultVariant(
  categoryId: string, 
  blockId: string
): string | undefined {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category || !category.variantPools[blockId]) {
    return undefined;
  }
  return category.variantPools[blockId].defaultVariant;
}

/**
 * Check if a variant is allowed for a specific block in a business category
 */
export function isVariantAllowed(
  categoryId: string, 
  blockId: string, 
  variantId: string
): boolean {
  const allowedVariants = getAllowedVariants(categoryId, blockId);
  return allowedVariants.includes(variantId);
}

/**
 * Get a random variant from the allowed pool for a specific block
 */
export function getRandomVariantFromPool(
  categoryId: string, 
  blockId: string
): string | undefined {
  const allowedVariants = getAllowedVariants(categoryId, blockId);
  if (allowedVariants.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * allowedVariants.length);
  return allowedVariants[randomIndex];
}

/**
 * Validate variant selection for a business category
 */
export function validateVariantSelection(
  categoryId: string,
  blockId: string,
  variantId: string
): { valid: boolean; reason?: string } {
  if (!isVariantAllowed(categoryId, blockId, variantId)) {
    return {
      valid: false,
      reason: `Variant '${variantId}' is not allowed for block '${blockId}' in category '${categoryId}'`
    };
  }
  return { valid: true };
}

/**
 * Get all available variants for a business category
 */
export function getCategoryVariantPools(categoryId: string): VariantPools {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.variantPools || {};
}

/**
 * Detect style from keywords and return appropriate variant
 */
export function getStyleBasedVariant(
  categoryId: string,
  blockId: string,
  keywords: string[]
): string | undefined {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category || !category.variantPools[blockId]) {
    return getDefaultVariant(categoryId, blockId);
  }

  const pool = category.variantPools[blockId];
  const allowedVariants = pool.allowedVariants;
  
  // Style mapping
  const styleMap: Record<string, string[]> = {
    'minimal': ['hero-minimal', 'about-minimal', 'contact-minimal', 'footer-minimal', 'navbar-minimal'],
    'modern': ['hero-split', 'about-team-showcase', 'contact-split', 'footer-minimal', 'navbar-sticky'],
    'luxury': ['hero-fullscreen', 'about-minimal', 'contact-fullscreen', 'footer-mega', 'navbar-transparent'],
    'casual': ['hero-cards', 'about-split', 'contact-cards', 'footer-centered', 'navbar-centered'],
    'professional': ['hero-split', 'about-split', 'contact-split', 'footer-mega', 'navbar-minimal'],
    'warm': ['hero-split', 'about-split', 'contact-minimal', 'footer-centered', 'navbar-minimal'],
    'adventure': ['hero-fullscreen', 'about-split', 'contact-split', 'footer-centered', 'navbar-transparent'],
    'intellectual': ['hero-minimal', 'about-minimal', 'contact-minimal', 'footer-mega', 'navbar-minimal'],
    'serious': ['hero-minimal', 'about-minimal', 'contact-minimal', 'footer-mega', 'navbar-minimal']
  };

  // Extract style from keywords
  const detectedStyles: string[] = [];
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword.includes('minimal') || lowerKeyword.includes('มินิมอล') || lowerKeyword.includes('เรียบง่าย')) {
      detectedStyles.push('minimal');
    }
    if (lowerKeyword.includes('modern') || lowerKeyword.includes('โมเดิร์น') || lowerKeyword.includes('ทันสมัย')) {
      detectedStyles.push('modern');
    }
    if (lowerKeyword.includes('luxury') || lowerKeyword.includes('หรูหรา') || lowerKeyword.includes('พรีเมียม')) {
      detectedStyles.push('luxury');
    }
    if (lowerKeyword.includes('casual') || lowerKeyword.includes('สบายๆ') || lowerKeyword.includes('เป็นกันเอง')) {
      detectedStyles.push('casual');
    }
    if (lowerKeyword.includes('professional') || lowerKeyword.includes('มืออาชีพ') || lowerKeyword.includes('ธุรกิจ')) {
      detectedStyles.push('professional');
    }
    if (lowerKeyword.includes('warm') || lowerKeyword.includes('อบอุ่น') || lowerKeyword.includes('น่ารัก')) {
      detectedStyles.push('warm');
    }
    if (lowerKeyword.includes('adventure') || lowerKeyword.includes('ผจญภัย') || lowerKeyword.includes('ท่องเที่ยว')) {
      detectedStyles.push('adventure');
    }
    if (lowerKeyword.includes('intellectual') || lowerKeyword.includes('วิชาการ') || lowerKeyword.includes('ความรู้')) {
      detectedStyles.push('intellectual');
    }
    if (lowerKeyword.includes('serious') || lowerKeyword.includes('จริงจัง') || lowerKeyword.includes('ข่าว')) {
      detectedStyles.push('serious');
    }
  }

  // Find matching variant based on detected style
  for (const style of detectedStyles) {
    const styleVariants = styleMap[style] || [];
    for (const variant of styleVariants) {
      if (allowedVariants.includes(variant)) {
        return variant;
      }
    }
  }

  // Fallback to default or random
  if (pool.randomSelection) {
    return getRandomVariantFromPool(categoryId, blockId);
  }
  
  return pool.defaultVariant;
}

// ===== Font Pool Management Functions =====

/**
 * Font Pools for each business category
 * Define which fonts can be used for each category
 */
export const CATEGORY_FONT_POOLS: FontPools = {
  'restaurant': {
    allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter'],
    defaultFont: 'poppins',
    randomSelection: true,
    constraints: {
      businessType: ['restaurant', 'food-service', 'dining'],
      tone: ['warm', 'luxury', 'elegant', 'friendly', 'casual']
    }
  },
  'ecommerce': {
    allowedFonts: ['inter', 'roboto', 'poppins'],
    defaultFont: 'inter',
    randomSelection: false,
    constraints: {
      businessType: ['ecommerce', 'retail', 'online-store'],
      tone: ['professional', 'modern', 'minimal']
    }
  },
  'portfolio': {
    allowedFonts: ['montserrat', 'inter', 'poppins', 'playfair'],
    defaultFont: 'montserrat',
    randomSelection: true,
    constraints: {
      businessType: ['portfolio', 'creative', 'design'],
      tone: ['creative', 'modern', 'elegant', 'minimal']
    }
  },
  'healthcare': {
    allowedFonts: ['inter', 'roboto', 'poppins'],
    defaultFont: 'inter',
    randomSelection: false,
    constraints: {
      businessType: ['healthcare', 'medical', 'clinic'],
      tone: ['professional', 'trustworthy', 'warm']
    }
  },
  'news': {
    allowedFonts: ['lora', 'merriweather', 'inter'],
    defaultFont: 'lora',
    randomSelection: false,
    constraints: {
      businessType: ['news', 'media', 'content'],
      tone: ['serious', 'intellectual', 'professional']
    }
  },
  'hotels': {
    allowedFonts: ['playfair', 'montserrat', 'inter', 'poppins'],
    defaultFont: 'montserrat',
    randomSelection: true,
    constraints: {
      businessType: ['hotel', 'hospitality', 'accommodation'],
      tone: ['luxury', 'welcoming', 'elegant', 'modern']
    }
  },
  'travel': {
    allowedFonts: ['montserrat', 'poppins', 'playfair', 'inter'],
    defaultFont: 'montserrat',
    randomSelection: true,
    constraints: {
      businessType: ['travel', 'tourism', 'adventure'],
      tone: ['adventure', 'exciting', 'luxury', 'casual', 'modern']
    }
  },
  'academy': {
    allowedFonts: ['inter', 'roboto', 'lora'],
    defaultFont: 'inter',
    randomSelection: false,
    constraints: {
      businessType: ['academy', 'education', 'school'],
      tone: ['intellectual', 'professional', 'serious', 'modern']
    }
  },
  'bookstore': {
    allowedFonts: ['lora', 'merriweather', 'crimson', 'inter'],
    defaultFont: 'lora',
    randomSelection: true,
    constraints: {
      businessType: ['bookstore', 'books', 'literature'],
      tone: ['intellectual', 'traditional', 'warm', 'serious']
    }
  },
  'bakery': {
    allowedFonts: ['poppins', 'nunito', 'playfair', 'inter'],
    defaultFont: 'poppins',
    randomSelection: true,
    constraints: {
      businessType: ['bakery', 'cafe', 'food'],
      tone: ['warm', 'friendly', 'welcoming', 'casual']
    }
  }
};

/**
 * Get allowed fonts for a category
 */
export function getAllowedFonts(categoryId: string): string[] {
  return CATEGORY_FONT_POOLS[categoryId]?.allowedFonts || [];
}

/**
 * Get default font for a category
 */
export function getDefaultFont(categoryId: string): string | undefined {
  return CATEGORY_FONT_POOLS[categoryId]?.defaultFont;
}

/**
 * Check if a font is allowed for a category
 */
export function isFontAllowed(categoryId: string, fontKey: string): boolean {
  const allowedFonts = getAllowedFonts(categoryId);
  return allowedFonts.includes(fontKey);
}

/**
 * Get random font from allowed pool
 */
export function getRandomFontFromPool(categoryId: string): string | undefined {
  const pool = CATEGORY_FONT_POOLS[categoryId];
  if (!pool || pool.allowedFonts.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * pool.allowedFonts.length);
  return pool.allowedFonts[randomIndex];
}

/**
 * Validate font selection for a category
 */
export function validateFontSelection(
  categoryId: string,
  fontKey: string
): { valid: boolean; reason?: string } {
  if (!isFontAllowed(categoryId, fontKey)) {
    return {
      valid: false,
      reason: `Font '${fontKey}' is not allowed for category '${categoryId}'`
    };
  }
  return { valid: true };
}

/**
 * Get font pool for a category
 */
export function getCategoryFontPool(categoryId: string): FontPool | undefined {
  return CATEGORY_FONT_POOLS[categoryId];
}

/**
 * Select appropriate font based on tone and category
 */
export function selectFontForCategory(
  categoryId: string,
  tone?: string
): string {
  const pool = CATEGORY_FONT_POOLS[categoryId];
  if (!pool) return 'inter'; // Default fallback
  
  // If tone is specified, try to match with font presets
  if (tone) {
    const fontsByTone = pool.allowedFonts.filter(fontKey => {
      // Import font configs if needed
      // This would require importing from font-presets
      return true; // Simplified for now
    });
    
    if (fontsByTone.length > 0) {
      const selectedFont = pool.randomSelection 
        ? fontsByTone[Math.floor(Math.random() * fontsByTone.length)]
        : fontsByTone[0];
      return selectedFont || 'inter';
    }
  }
  
  // Default or random selection
  if (pool.randomSelection) {
    return getRandomFontFromPool(categoryId) || pool.defaultFont || 'inter';
  }
  
  return pool.defaultFont || 'inter';
}
