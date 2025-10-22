// Business Category Manifests
// Each business category defines which shared blocks to use and how to customize them

import { restaurantCategories } from "./categories/restaurants";
import { ecommerceCategories } from "./categories/ecommerce";
import { portfolioCategories } from "./categories/portfolio";
import { healthcareCategories } from "./categories/healthcare";

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
  tone?: string;
  reasoning?: string;
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

// Business Category Definitions
export const BUSINESS_CATEGORIES: BusinessCategoryManifest[] = [
  ...restaurantCategories,
  ...ecommerceCategories,
  ...portfolioCategories,
  ...healthcareCategories
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
    'minimal': ['hero-minimal', 'about-minimal', 'contact-minimal', 'footer-minimal'],
    'modern': ['hero-split', 'about-team-showcase', 'contact-split', 'footer-minimal'],
    'luxury': ['hero-fullscreen', 'about-minimal', 'contact-fullscreen', 'footer-mega'],
    'casual': ['hero-cards', 'about-split', 'contact-cards', 'footer-centered']
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
