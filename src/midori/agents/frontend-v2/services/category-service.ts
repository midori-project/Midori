/**
 * Category Service for Frontend-V2 Agent
 * จัดการการ detect business category ทั้ง keyword matching และ LLM
 */

import { config } from 'dotenv';
import OpenAI from 'openai';
import { BUSINESS_CATEGORIES, BusinessCategoryManifest } from '../template-system/business-categories';

// Load .env from root
config({ path: '../../../../.env' });

export interface CategoryDetectionOptions {
  id?: string;
  keywords?: string[];
  userInput?: string;
  useLLM?: boolean;
  fallbackToDefault?: boolean;
}

export class CategoryService {
  private openai: OpenAI | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        this.isInitialized = true;
        console.log('✅ Category Service initialized with OpenAI');
      } else {
        console.warn('⚠️ No OpenAI API key found, Category Service will use keyword matching only');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Category Service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Universal Category Detection - All-in-one function
   * Supports multiple detection methods: ID, keywords, LLM, hybrid
   */
  async detectCategory(options: CategoryDetectionOptions): Promise<BusinessCategoryManifest | undefined> {
    const { id, keywords, userInput, useLLM = false, fallbackToDefault = true } = options;
    
    // console.log('🔍 Category detection:', options); // Reduced logging
    
    // 1. If ID provided, find by ID
    if (id) {
      const category = BUSINESS_CATEGORIES.find(cat => cat.id === id);
      if (category) {
        console.log(`✅ Found category by ID: ${category.id}`);
        return category;
      }
    }
    
    // 2. If keywords provided, try keyword matching
    if (keywords && keywords.length > 0) {
      const keywordResult = await this.detectCategoryByKeywords(keywords);
      if (keywordResult) {
        console.log(`✅ Found category by keywords: ${keywordResult.id}`);
        return keywordResult;
      }
    }
    
    // 3. If LLM enabled and userInput provided, try LLM detection
    if (useLLM && userInput) {
      const llmResult = await this.detectCategoryByLLM(userInput);
      if (llmResult) {
        console.log(`✅ Found category by LLM: ${llmResult.id}`);
        return llmResult;
      }
    }
    
    // 4. Fallback to default
    if (fallbackToDefault) {
      console.log('🔄 Using default category: ecommerce');
      return BUSINESS_CATEGORIES.find(c => c.id === 'ecommerce') || BUSINESS_CATEGORIES[0];
    }
    
    return undefined;
  }

  /**
   * Keyword-based category detection with scoring
   */
  private async detectCategoryByKeywords(keywords: string[]): Promise<BusinessCategoryManifest | undefined> {
    // console.log('Matching keywords:', keywords); // Reduced logging
    
    let bestMatch: { category: BusinessCategoryManifest; score: number } | null = null;
    
    for (const category of BUSINESS_CATEGORIES) {
      let score = 0;
      
      for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase().trim();
        
        // Exact match gets highest score
        if (category.keywords.some(catKeyword => 
          catKeyword.toLowerCase() === keywordLower
        )) {
          score += 5;
          continue;
        }
        
        // Context-aware partial match - avoid generic words
        const genericWords = ['ขาย', 'สร้าง', 'เว็บ', 'ไซต์', 'ชื่อ', 'ทำ', 'ต้องการ', 'อยาก', 'ให้', 'เป็น', 'แบบ'];
        if (!genericWords.includes(keywordLower)) {
          if (category.keywords.some(catKeyword => 
            catKeyword.toLowerCase().includes(keywordLower) ||
            keywordLower.includes(catKeyword.toLowerCase())
          )) {
            score += 2;
          }
        }
        
        // Special handling for food-related keywords
        const foodKeywords = ['หมูย่าง', 'อาหาร', 'ร้านอาหาร', 'restaurant', 'food', 'ecommerce', 'e-commerce'];
        if (foodKeywords.some(food => keywordLower.includes(food))) {
          if (category.id === 'restaurant' || category.id === 'ecommerce') {
            score += 3;
          }
        }
        
        // Special handling for book-related keywords
        const bookKeywords = ['หนังสือ', 'ขายหนังสือ', 'ร้านหนังสือ', 'bookstore', 'book'];
        if (bookKeywords.some(book => keywordLower.includes(book))) {
          if (category.id === 'ecommerce') {
            score += 4; // Higher score for book-related ecommerce
          }
        }
      }
      
      // console.log(`Category ${category.id} score: ${score}`); // Reduced logging
      
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { category, score };
      }
    }
    
    if (bestMatch && bestMatch.score >= 2) {
      console.log(`✅ Selected category: ${bestMatch.category.id} (score: ${bestMatch.score})`);
      return bestMatch.category;
    }
    
    return undefined;
  }

  /**
   * LLM-based category detection
   */
  private async detectCategoryByLLM(userInput: string): Promise<BusinessCategoryManifest | undefined> {
    try {
      if (!this.isInitialized || !this.openai) {
        console.log('⚠️ OpenAI not available, skipping LLM detection');
        return undefined;
      }
      
      // Simple LLM prompt for category detection
      const prompt = `Analyze this user input and determine the business category:

User Input: "${userInput}"

Available categories:
- restaurant: Food service, dining, cafe, restaurant
- ecommerce: Online store, shopping, products, books, retail
- portfolio: Personal portfolio, professional showcase
- healthcare: Medical, health, clinic, hospital
- pharmacy: Drugstore, medicine, pharmacy

Respond with ONLY the category ID (e.g., "ecommerce" or "restaurant"):`;

      console.log('🤖 Calling LLM for category detection...');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-nano', // Use cheaper model for simple classification
        messages: [
          {
            role: 'system',
            content: 'You are a business category classifier. Respond with only the category ID.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 16000,
        temperature: 1 // Low temperature for consistent results
      });
      
      const categoryId = response.choices[0]?.message?.content?.trim();
      console.log('🤖 LLM response:', categoryId);
      
      if (categoryId) {
        const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
        if (category) {
          console.log(`✅ LLM detected category: ${category.id}`);
          return category;
        } else {
          console.log(`⚠️ LLM returned unknown category: ${categoryId}`);
        }
      }
      
      return undefined;
      
    } catch (error) {
      console.error('❌ LLM category detection failed:', error);
      return undefined;
    }
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.openai !== null;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      model: 'gpt-5-nano',
      temperature: 1
    };
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
