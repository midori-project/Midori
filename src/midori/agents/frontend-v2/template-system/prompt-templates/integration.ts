/**
 * Prompt Template Integration
 * เชื่อมต่อ Prompt Template System กับระบบเดิม
 */

import { restaurantPromptTemplate } from './restaurant-template';
import { ecommercePromptTemplate } from './ecommerce-template';
import { healthcarePromptTemplate } from './healthcare-template';
import { portfolioPromptTemplate } from './portfolio-template';

export interface OptimizedPromptResult {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Generate Optimized Prompt ที่เข้ากันได้กับระบบเดิม
 */
export function generateCompatiblePrompt(
  businessCategory: any,
  keywords: string[],
  colorHint: string,
  concreteManifest?: any, // ✅ เพิ่มสำหรับ variant support
  variantInfo?: any, // ✅ เพิ่มสำหรับ variant support
  language?: string // ✅ เพิ่มสำหรับ language support
): OptimizedPromptResult {
  
  // ใช้ template ตาม business category
  switch (businessCategory.id) {
    case 'restaurant':
      return restaurantPromptTemplate.getOptimizedPrompt(keywords, colorHint, concreteManifest, variantInfo, language);
    
    case 'ecommerce':
      return ecommercePromptTemplate.getOptimizedPrompt(keywords, colorHint);
    
    case 'healthcare':
      return healthcarePromptTemplate.getOptimizedPrompt(keywords, colorHint);
    
    case 'portfolio':
      return portfolioPromptTemplate.getOptimizedPrompt(keywords, colorHint);
    
    default:
      // Fallback to restaurant template
      return restaurantPromptTemplate.getOptimizedPrompt(keywords, colorHint, concreteManifest, variantInfo, language);
  }
}

/**
 * ตรวจสอบความเข้ากันได้ของ Prompt Template
 */
export function validateTemplateCompatibility(): boolean {
  // ตรวจสอบว่า template ใช้ PascalCase block names
  const template = restaurantPromptTemplate.generateVariantAwarePrompt([], '');
  
  const requiredBlocks = ['Navbar', 'Hero', 'About', 'Menu', 'Contact', 'Footer', 'Theme'];
  const hasAllBlocks = requiredBlocks.every(block => template.includes(`"${block}"`));
  
  if (!hasAllBlocks) {
    console.error('❌ Template compatibility check failed: Missing required blocks');
    return false;
  }
  
  console.log('✅ Template compatibility check passed');
  return true;
}

/**
 * Get Template Statistics
 */
export function getTemplateStats(): {
  totalTemplates: number;
  supportedCategories: string[];
  averagePromptLength: number;
} {
  const templates = [
    restaurantPromptTemplate,
    ecommercePromptTemplate,
    healthcarePromptTemplate,
    portfolioPromptTemplate
  ];
  
  const supportedCategories = ['restaurant', 'ecommerce', 'healthcare', 'portfolio'];
  
  const averagePromptLength = templates.reduce((sum, template) => {
    const prompt = template.getOptimizedPrompt([], '').userPrompt;
    return sum + prompt.length;
  }, 0) / templates.length;
  
  return {
    totalTemplates: templates.length,
    supportedCategories,
    averagePromptLength: Math.round(averagePromptLength)
  };
}