/**
 * AI Service for Frontend-V2 Agent
 * จัดการการเรียกใช้ OpenAI API
 */

import { config } from "dotenv";
import OpenAI from "openai";
import { UnsplashService, UnsplashImage } from "./unsplash-service";
import { BatchUnsplashService } from "./batch-unsplash-service";
import { generateCompatiblePrompt } from "../template-system/prompt-templates/integration";
import { BUSINESS_CATEGORIES } from "../template-system/business-categories";

// Load .env from root
config({ path: "../../../../.env" });

export interface AIGenerationRequest {
  businessCategory: string;
  keywords: string[];
  language: string;
  model?: string;
  temperature?: number;
  customPrompt?: string; // Add support for custom prompt
  customSystemPrompt?: string; // Add support for custom system prompt
  concreteManifest?: any; // Add support for concrete manifest
  variantInfo?: any; // Add support for variant info
}

export interface AIGenerationResponse {
  global: {
    palette: {
      primary: string;
      secondary: string;
      bgTone: string;
    };
    tokens: {
      radius: string;
      spacing: string;
    };
  };
  [key: string]: any; // Dynamic block data
}

export class AIService {
  private openai: OpenAI | null = null;
  private isInitialized = false;
  private unsplashService: UnsplashService;
  private batchUnsplashService: BatchUnsplashService;
  private lastTeamSearchQuery: string | null = null;
  // Simple in-memory cache for translated keywords
  private translationCache: Map<string, string> = new Map();

  constructor() {
    this.initialize();
    this.unsplashService = new UnsplashService();
    this.batchUnsplashService = new BatchUnsplashService();
  }

  private initialize() {
    try {
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.isInitialized = true;
        console.log("✅ AI Service initialized with OpenAI");
      } else {
        console.warn(
          "⚠️ No OpenAI API key found, AI Service will use mock data"
        );
        this.isInitialized = false;
      }
    } catch (error) {
      console.error("❌ Failed to initialize AI Service:", error);
      this.isInitialized = false;
    }
  }

  /**
   * Get image for menu item using Unsplash API
   */
  async getImageForMenuItem(
    itemName: string,
    category: string,
    businessCategory: string
  ): Promise<{ image: string; imageAlt: string }> {
    try {
      // Translate itemName to English for better Unsplash results (if needed)
      const itemNameEn = await this.translateToEnglishIfThai(itemName, {
        category,
        businessCategory,
      });
      console.log(
        `📸 Menu item image search: "${itemName}" → query: "${itemNameEn}"`
      );

      const unsplashImage = await this.unsplashService.getImageForMenuItem(
        itemNameEn,
        category,
        businessCategory
      );

      const imageUrl = this.unsplashService.generateImageUrl(unsplashImage, {
        width: 400,
        height: 300,
        quality: 80,
      });

      return {
        image: imageUrl,
        imageAlt: unsplashImage.alt_description || itemName,
      };
    } catch (error) {
      console.error("❌ Error getting image for menu item:", error);
      return {
        image: "https://via.placeholder.com/400x300?text=Image+Not+Available",
        imageAlt: itemName,
      };
    }
  }

  /**
   * Phase 2: Batch processing for menu items
   * Process multiple menu items in batches for better performance
   */
  async getImagesForMenuItemsBatch(
    menuItems: Array<{
      name: string;
      category: string;
      businessCategory: string;
    }>
  ): Promise<Array<{ image: string; imageAlt: string; success: boolean; error?: string }>> {
    try {
      console.log(`🚀 Batch processing ${menuItems.length} menu items...`);
      
      // Translate all item names to English first
      const translatedItems = await Promise.all(
        menuItems.map(async (item) => ({
          ...item,
          name: await this.translateToEnglishIfThai(item.name, {
            category: item.category,
            businessCategory: item.businessCategory,
          })
        }))
      );

      // Process in batches
      const batchResults = await this.batchUnsplashService.getImagesForMenuItems(translatedItems);
      
      console.log(`✅ Batch processing completed: ${batchResults.filter(r => r.success).length}/${batchResults.length} successful`);
      return batchResults;
    } catch (error) {
      console.error("❌ Error in batch processing menu items:", error);
      // Fallback to individual processing
      console.log("🔄 Falling back to individual processing...");
      const fallbackResults = await Promise.all(
        menuItems.map(async (item) => {
          try {
            const result = await this.getImageForMenuItem(item.name, item.category, item.businessCategory);
            return { ...result, success: true };
          } catch (err) {
            return {
              image: "https://via.placeholder.com/400x300?text=Image+Not+Available",
              imageAlt: item.name,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error'
            };
          }
        })
      );
      return fallbackResults;
    }
  }

  /**
   * Get hero background image using Unsplash API
   */
  async getHeroImage(
    businessCategory: string,
    keywords: string[]
  ): Promise<{ heroImage: string; heroImageAlt: string }> {
    try {
      // Create search query based on business category and keywords
      const englishKeywords = await Promise.all(
        (keywords || []).map((k) => this.translateToEnglishIfThai(k))
      );
      const searchQuery = this.buildHeroSearchQuery(
        businessCategory,
        englishKeywords
      );

      const unsplashImage = await this.unsplashService.searchImages(
        searchQuery,
        {
          perPage: 5,
          orientation: "landscape",
          orderBy: "relevant",
        }
      );

      if (unsplashImage.length > 0) {
        // Randomly select an image for variety
        const randomIndex = Math.floor(Math.random() * unsplashImage.length);
        const selectedImage = unsplashImage[randomIndex];

        if (selectedImage) {
          const imageUrl = this.unsplashService.generateImageUrl(
            selectedImage,
            {
              width: 1920,
              height: 1080,
              quality: 85,
            }
          );

          return {
            heroImage: imageUrl,
            heroImageAlt:
              selectedImage.alt_description || `${businessCategory} hero image`,
          };
        }
      }

      // Fallback
      return {
        heroImage: "https://via.placeholder.com/1920x1080?text=Hero+Image",
        heroImageAlt: `${businessCategory} hero image`,
      };
    } catch (error) {
      console.error("❌ Error getting hero image:", error);
      return {
        heroImage: "https://via.placeholder.com/1920x1080?text=Hero+Image",
        heroImageAlt: `${businessCategory} hero image`,
      };
    }
  }

  /**
   * Get about section image
   */
  async getAboutImage(
    businessCategory: string,
    keywords: string[]
  ): Promise<{ aboutImage: string; aboutImageAlt: string }> {
    try {
      // Create search query based on business category and keywords
      const englishKeywords = await Promise.all(
        (keywords || []).map((k) => this.translateToEnglishIfThai(k))
      );
      const searchQuery = this.buildAboutSearchQuery(
        businessCategory,
        englishKeywords
      );

      const unsplashImage = await this.unsplashService.searchImages(
        searchQuery,
        {
          perPage: 5,
          orientation: "landscape",
          orderBy: "relevant",
        }
      );

      if (unsplashImage.length > 0) {
        // Randomly select an image for variety
        const randomIndex = Math.floor(Math.random() * unsplashImage.length);
        const selectedImage = unsplashImage[randomIndex];

        if (selectedImage) {
          const imageUrl = this.unsplashService.generateImageUrl(
            selectedImage,
            {
              width: 600,
              height: 400,
              quality: 85,
            }
          );

          return {
            aboutImage: imageUrl,
            aboutImageAlt:
              selectedImage.alt_description || `${businessCategory} about image`,
          };
        }
      }

      // Fallback
      return {
        aboutImage: "https://via.placeholder.com/600x400?text=About+Image",
        aboutImageAlt: `${businessCategory} about image`,
      };
    } catch (error) {
      console.error("❌ Error getting about image:", error);
      return {
        aboutImage: "https://via.placeholder.com/600x400?text=About+Image",
        aboutImageAlt: `${businessCategory} about image`,
      };
    }
  }

  /**
   * Get team member image from Unsplash
   */
  async getTeamMemberImage(
    memberName: string,
    memberRole: string,
    businessCategory: string
  ): Promise<{ image: string; imageAlt: string }> {
    try {
      // Create search query for team member
      const searchQuery = this.buildTeamMemberSearchQuery(
        memberName,
        memberRole,
        businessCategory
      );

      // Only log once per unique search query
      if (!this.lastTeamSearchQuery || this.lastTeamSearchQuery !== searchQuery) {
        console.log(`🔍 Searching for team member image: ${searchQuery}`);
        this.lastTeamSearchQuery = searchQuery;
      }

      const unsplashImage = await this.unsplashService.searchImages(
        searchQuery,
        { perPage: 1 }
      );

      if (unsplashImage.length > 0) {
        const selectedImage = unsplashImage[0];

        if (selectedImage) {
          const imageUrl = this.unsplashService.generateImageUrl(
            selectedImage,
            {
              width: 400,
              height: 400,
              quality: 85,
            }
          );

          return {
            image: imageUrl,
            imageAlt: selectedImage.alt_description || `${memberName} - ${memberRole}`,
          };
        }
      }

      // Fallback
      console.log(`⚠️ Using fallback image for: ${memberName} - ${memberRole}`);
      return {
        image: "https://via.placeholder.com/400x400?text=Team+Member",
        imageAlt: `${memberName} - ${memberRole}`,
      };
    } catch (error) {
      console.error("❌ Error getting team member image:", error);
      return {
        image: "https://via.placeholder.com/400x400?text=Team+Member",
        imageAlt: `${memberName} - ${memberRole}`,
      };
    }
  }

  /**
   * Build search query for team member image
   */
  private buildTeamMemberSearchQuery(
    memberName: string,
    memberRole: string,
    businessCategory: string
  ): string {
    // Map business categories to relevant team member search terms
    const categoryMap: Record<string, string[]> = {
      restaurant: ["chef", "cook", "kitchen staff", "restaurant team"],
      ecommerce: ["business professional", "team member", "office worker"],
      healthcare: ["doctor", "nurse", "medical professional", "healthcare team"],
      portfolio: ["designer", "developer", "creative professional"],
    };

    const categoryTerms = categoryMap[businessCategory] || ["professional", "team member"];
    
    // Use role if it's descriptive, otherwise use category terms
    const roleTerms = memberRole.toLowerCase().includes("chef") || 
                     memberRole.toLowerCase().includes("doctor") || 
                     memberRole.toLowerCase().includes("manager") 
                     ? [memberRole.toLowerCase()] 
                     : categoryTerms;

    return `${roleTerms.join(" ")} ${businessCategory} professional portrait`;
  }

  /**
   * Build focused search query for hero image: business type + style + color
   */
  private buildHeroSearchQuery(
    businessCategory: string,
    keywords: string[]
  ): string {
    // Extract business type from category (e.g., "restaurant-minimal" -> "restaurant")
    const businessType = businessCategory.split('-')[0];
    
    // Extract style from category (e.g., "restaurant-minimal" -> "minimal")
    const styleFromCategory = businessCategory.split('-').slice(1).join(' ');
    
    // Extract style and color from keywords
    const styleKeywords = this.extractStyleKeywords(keywords);
    const colorKeywords = this.extractColorKeywords(keywords);
    
    // Build focused search query: business type + style + color
    const searchTerms: string[] = [];
    
    // 1. Business type (essential)
    if (businessType) {
      searchTerms.push(businessType);
    }
    
    // 2. Style (from category or keywords)
    if (styleFromCategory) {
      searchTerms.push(styleFromCategory);
    }
    if (styleKeywords.length > 0) {
      searchTerms.push(...styleKeywords);
    }
    
    // 3. Color (if specified)
    if (colorKeywords.length > 0) {
      searchTerms.push(...colorKeywords);
    }
    
    // 4. Add "design" for better image results
    searchTerms.push("design");
    
    // Remove duplicates and join
    const uniqueTerms = [...new Set(searchTerms)];
    return uniqueTerms.join(" ");
  }

  /**
   * Build focused search query for about image: business type + interior + style
   */
  private buildAboutSearchQuery(
    businessCategory: string,
    keywords: string[]
  ): string {
    // Extract business type from category (e.g., "restaurant-minimal" -> "restaurant")
    const businessType = businessCategory.split('-')[0];
    
    // Extract style from category (e.g., "restaurant-minimal" -> "minimal")
    const styleFromCategory = businessCategory.split('-').slice(1).join(' ');
    
    // Extract style and color from keywords
    const styleKeywords = this.extractStyleKeywords(keywords);
    const colorKeywords = this.extractColorKeywords(keywords);
    
    // Build focused search query: business type + interior + style
    const searchTerms: string[] = [];
    
    // 1. Business type (essential)
    if (businessType) {
      searchTerms.push(businessType);
    }
    
    // 2. Interior context
    searchTerms.push('interior');
    
    // 3. Style (from category or keywords)
    if (styleFromCategory) {
      searchTerms.push(styleFromCategory);
    }
    if (styleKeywords.length > 0) {
      searchTerms.push(...styleKeywords);
    }
    
    // 4. Color (from keywords)
    if (colorKeywords.length > 0) {
      searchTerms.push(...colorKeywords);
    }
    
    // Remove duplicates and join
    const uniqueTerms = [...new Set(searchTerms)];
    return uniqueTerms.join(" ");
  }

  /**
   * Extract style keywords from user input
   */
  private extractStyleKeywords(keywords: string[]): string[] {
    const styleMap: Record<string, string> = {
      'มินิมอล': 'minimalist',
      'minimal': 'minimalist',
      'minimalist': 'minimalist',
      'เรียบง่าย': 'minimalist',
      'สะอาดตา': 'minimalist',
      'โมเดิร์น': 'modern',
      'modern': 'modern',
      'ทันสมัย': 'modern',
      'สมัยใหม่': 'modern',
      'หรูหรา': 'luxury',
      'luxury': 'luxury',
      'พรีเมียม': 'luxury',
      'ไฟน์ไดนิ่ง': 'luxury',
      'premium': 'luxury',
      'สบายๆ': 'casual',
      'casual': 'casual',
      'แคชชวล': 'casual',
      'เป็นกันเอง': 'casual',
      'friendly': 'casual',
      'cozy': 'casual'
    };
    
    const styles: string[] = [];
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      for (const [thai, english] of Object.entries(styleMap)) {
        if (lowerKeyword.includes(thai) || lowerKeyword.includes(english)) {
          styles.push(english);
        }
      }
    }
    
    return [...new Set(styles)];
  }

  /**
   * Extract color keywords from user input
   */
  private extractColorKeywords(keywords: string[]): string[] {
    const colorMap: Record<string, string> = {
      'เหลือง': 'yellow',
      'yellow': 'yellow',
      'เหลืองอ่อน': 'yellow',
      'ฟ้า': 'blue',
      'blue': 'blue',
      'น้ำเงิน': 'blue',
      'เขียว': 'green',
      'green': 'green',
      'เขียวอ่อน': 'green',
      'ม่วง': 'purple',
      'purple': 'purple',
      'ม่วงอ่อน': 'purple',
      'ชมพู': 'pink',
      'pink': 'pink',
      'โรส': 'pink',
      'ส้ม': 'orange',
      'orange': 'orange',
      'ส้มอ่อน': 'orange',
      'แดง': 'red',
      'red': 'red',
      'แดงเข้ม': 'red',
      'คราม': 'indigo',
      'indigo': 'indigo',
      'ครามอ่อน': 'indigo'
    };
    
    const colors: string[] = [];
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      for (const [thai, english] of Object.entries(colorMap)) {
        if (lowerKeyword.includes(thai) || lowerKeyword.includes(english)) {
          colors.push(english);
        }
      }
    }
    
    return [...new Set(colors)];
  }

  /**
   * Translate Thai text to English if Thai characters are present.
   * Uses OpenAI Responses API when available; otherwise returns original.
   */
  private async translateToEnglishIfThai(
    text: string,
    context?: { category?: string; businessCategory?: string }
  ): Promise<string> {
    if (!text) return text;
    // If contains no Thai chars, return as-is
    if (!/[\u0E00-\u0E7F]/.test(text)) return text;

    // Cache first
    const cached = this.translationCache.get(text);
    if (cached) return cached;

    try {
      // Deterministic mapping with context-aware scope
      const normalized = text.toLowerCase();
      const business = (context?.businessCategory || '').toString();

      // Strip filler tokens that should never enter image queries
      let cleaned = normalized
        .replace(/ชื่อ\s*[^\s]+/g, ' ')           // remove brand tokens like "ชื่อ โชกุน"
        .replace(/ธีมสี[^\s]+/g, ' ')              // remove theme color phrases
        .replace(/โทนสี[^\s]+/g, ' ')              // remove color tone phrases
        .replace(/\s{2,}/g, ' ')                    // collapse spaces
        .trim();

      const flowersRules: Array<{ pattern: RegExp; out: string }> = [
        { pattern: /กุหลาบ|rose/, out: "rose bouquet" },
        { pattern: /ลิลลี่|ลิลลี|lily/, out: "lily bouquet" },
        { pattern: /ทานตะวัน|sunflower/, out: "sunflower bouquet" },
        { pattern: /ช่อ(?!\w)|bouquet/, out: "flower bouquet" },
        { pattern: /กระเช้า|basket/, out: "flower basket" },
        { pattern: /ดอกไม้สด|ดอกไม้/, out: "fresh flowers" },
      ];

      const restaurantRules: Array<{ pattern: RegExp; out: string }> = [
        { pattern: /กะเพรา|กระเพรา|หมูกรอบ/, out: "crispy pork basil" },
        { pattern: /แกงเขียวหวาน/, out: "green curry chicken" },
        { pattern: /ต้มยำกุ้ง/, out: "tom yum shrimp" },
        { pattern: /ต้มข่า|tom\s*kha/, out: "tom kha soup" },
        { pattern: /ข้าวผัด/, out: "fried rice" },
        { pattern: /ข้าวหน้า/, out: "rice bowl" },
        { pattern: /ก๋วยเตี๋ยว|เส้น/, out: "noodle soup" },
        { pattern: /บะหมี่/, out: "egg noodles" },
        { pattern: /ลูกชิ้น/, out: "meatballs" },
        { pattern: /ปลากะพงทอดน้ำปลา/, out: "fried seabass" },
        { pattern: /สลัด|salad/, out: "salad" },
      ];

      const fruitRules: Array<{ pattern: RegExp; out: string }> = [
        { pattern: /สตรอว์เบอร์รี่|สตอเบอรี่|strawberry/, out: "strawberry fruit" },
        { pattern: /ส้ม(?!ตำ)|orange/, out: "orange fruit" },
        { pattern: /แอปเปิล|apple/, out: "apple fruit" },
        { pattern: /มะละกอ|papaya/, out: "papaya fruit" },
        { pattern: /กล้วย|banana/, out: "banana fruit" },
        { pattern: /องุ่น|grape/, out: "grape fruit" },
        { pattern: /มะม่วง|mango/, out: "mango fruit" },
        { pattern: /ทุเรียน|durian/, out: "durian fruit" },
        { pattern: /มังคุด|mangosteen/, out: "mangosteen fruit" },
        { pattern: /ลำไย|longan/, out: "longan fruit" },
        { pattern: /ลิ้นจี่|lychee/, out: "lychee fruit" },
        { pattern: /แตงโม|watermelon/, out: "watermelon fruit" },
        { pattern: /สับปะรด|pineapple/, out: "pineapple fruit" },
      ];

      // Build scoped rules by business category
      const domainRules: Array<{ pattern: RegExp; out: string }> = [
        ...(business === 'restaurant' ? restaurantRules : []),
        ...(business === 'ecommerce' ? flowersRules : []),
        ...fruitRules,
      ];

      for (const r of domainRules) {
        if (r.pattern.test(cleaned)) {
          console.log(`🔤 Domain mapping: "${text}" → "${r.out}"`);
          this.translationCache.set(text, r.out);
          return r.out;
        }
      }

      if (this.openai) {
        const categoryHint = (context?.category || "").toString();
        const businessHint = (context?.businessCategory || "").toString();
        const prompt = `You are a Thai-to-English translator for image search keywords. 

CRITICAL: You MUST output ONLY English words. NO Thai characters allowed.

Input: "${text}"
Business: ${businessHint}
Category: ${categoryHint}

Output format: 1-3 English keywords only, no punctuation, no Thai text.

Examples:
- "กุหลาบ" → "rose bouquet"
- "อาหารไทย" → "thai food" 
- "ร้านกาแฟ" → "coffee shop"
- "ยาลดไข้" → "medicine pills"
- "วิตามิน" → "vitamins"

Translate now:`;
        const model = process.env.FRONTEND_AI_MODEL || "gpt-5-nano";
        const res = await this.openai.responses.create({
          model,
          input: prompt,
          temperature: 1,
          // Responses API uses max_output_tokens
          max_output_tokens: 2000,
        } as any);
        const english = (res as any)?.output_text?.trim() || text;
        console.log(`🤖 LLM translation: "${text}" → "${english}"`);
        // Secondary fallback: if still contains Thai, map to generic by business/category
        if (/[\u0E00-\u0E7F]/.test(english)) {
          const fallbackByBusiness: Record<string, string> = {
            restaurant: "thai food",
            ecommerce: "retail product",
            healthcare: "medical healthcare",
            pharmacy: "pharmacy medicine",
            portfolio: "design creative",
          };
          const fallbackByCategory: Record<string, string> = {
            food: "food",
            rice: "rice",
            noodles: "noodles",
            soup: "soup",
            curry: "curry",
            product: "product",
            books: "books",
            stationery: "stationery",
            toys: "toy",
            clothing: "clothing",
            design: "design",
          };
          const combined = [
            fallbackByBusiness[businessHint] || "",
            fallbackByCategory[categoryHint] || "",
          ]
            .filter(Boolean)
            .join(" ")
            .trim();
          const safe = combined || "product";
          this.translationCache.set(text, safe);
          return safe;
        }
        this.translationCache.set(text, english);
        return english;
      }
    } catch (err) {
      console.warn("⚠️ Translate fallback for text:", text, err);
    }
    return text; // Fallback when no API
  }

  /**
   * Shuffle array for randomization
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
    return shuffled;
  }

  /**
   * Generate category based on item name
   */
  private generateCategory(itemName: string, businessCategory: string): string {
    const categoryMap: Record<string, string> = {
      restaurant: this.getFoodCategory(itemName),
      ecommerce: this.getProductCategory(itemName),
      healthcare: "health",
      pharmacy: "medicine",
      portfolio: "design",
    };

    return categoryMap[businessCategory] || "general";
  }

  private getFoodCategory(itemName: string): string {
    const name = itemName.toLowerCase();
    if (name.includes("ข้าว") || name.includes("rice")) return "rice";
    if (name.includes("ผัด") || name.includes("noodle")) return "noodles";
    if (name.includes("ต้ม") || name.includes("soup")) return "soup";
    if (name.includes("แกง") || name.includes("curry")) return "curry";
    if (name.includes("ทอด") || name.includes("fried")) return "fried";
    return "food";
  }

  private getProductCategory(itemName: string): string {
    const name = itemName.toLowerCase();
    if (name.includes("หนังสือ") || name.includes("book")) return "books";
    if (
      name.includes("ปากกา") ||
      name.includes("ดินสอ") ||
      name.includes("pen")
    )
      return "stationery";
    if (name.includes("ของเล่น") || name.includes("toy")) return "toys";
    if (name.includes("เสื้อ") || name.includes("shirt")) return "clothing";
    return "product";
  }

  /**
   * Generate content using AI with dynamic images
   */
  async generateContent(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    if (!this.isInitialized || !this.openai) {
      console.log(
        "🔄 AI Service not available, using mock data with dynamic images"
      );
      return this.getMockDataWithImages(request);
    }

    try {
      console.log("🤖 Generating content with AI...");
      
      // Use custom prompt if provided, otherwise use default prompt
      const prompt = request.customPrompt || this.createPrompt(request);
      
      const model = request.model || "gpt-5-nano";
      const isGpt5 = model.includes("gpt-5");
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: request.customSystemPrompt || this.getSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: request.temperature || 1,
        ...(isGpt5 ? { max_completion_tokens: 16000 } : { max_tokens: 16000 }),
      });

      const content = response.choices[0]?.message?.content;
      const finishReason = response.choices[0]?.finish_reason;
      
      console.log("🤖 AI Response content:", content);
      // console.log("🤖 AI Response choices:", response.choices); // muted noisy log
      console.log("🤖 Finish reason:", finishReason);
      console.log("🤖 Usage:", response.usage);
      
      if (!content) {
        console.error("❌ No content in AI response:", {
          choices: response.choices,
          usage: response.usage,
          model: response.model,
          finishReason: finishReason,
        });
        
        // Check if it's a length limit issue
        if (finishReason === "length") {
          console.log(
            "🔄 Response was truncated due to length limit, trying with shorter prompt"
          );
          // Fallback to mock data for now
          return this.getMockData(request);
        }
        
        throw new Error("No content generated by AI");
      }

      const aiResponse = this.parseAIResponse(
        content,
        request.businessCategory
      );

      // Debug: Only log if no team members found
      if (aiResponse["about-basic"]?.teamMembers?.length === 0) {
        console.log("⚠️ No team members found in AI response");
      }

      // Phase 3: Multi-section batch processing for better performance
      console.log("🚀 Processing all sections with batch approach...");
      
      // Prepare batch requests for all sections
      const batchRequests: any = {};
      
      // Hero section
      if (aiResponse["hero-basic"]) {
        batchRequests.hero = {
          businessCategory: request.businessCategory,
          keywords: request.keywords
        };
      }
      
      // About section
      if (aiResponse["about-basic"]) {
        batchRequests.about = {
          businessCategory: request.businessCategory,
          keywords: request.keywords
        };
      }
      
      // Menu items
      if (aiResponse["menu-basic"]?.menuItems) {
        batchRequests.menuItems = aiResponse["menu-basic"].menuItems.map((item: any) => ({
          name: item.name,
          category: this.generateCategory(item.name, request.businessCategory),
          businessCategory: request.businessCategory
        }));
      }

      // Process all sections in one batch
      const batchResults = await this.batchUnsplashService.getImagesForSections(batchRequests);
      
      // Apply results to respective sections
      if (batchResults.hero && aiResponse["hero-basic"]) {
        aiResponse["hero-basic"] = {
          ...aiResponse["hero-basic"],
          heroImage: batchResults.hero.heroImage,
          heroImageAlt: batchResults.hero.heroImageAlt,
        };
        console.log("✅ Hero section enhanced with dynamic image:", batchResults.hero.heroImage.substring(0, 80));
      }
      
      if (batchResults.about && aiResponse["about-basic"]) {
        aiResponse["about-basic"] = {
          ...aiResponse["about-basic"],
          aboutImage: batchResults.about.aboutImage,
          aboutImageAlt: batchResults.about.aboutImageAlt,
        };
        console.log("✅ About section enhanced with dynamic image:", batchResults.about.aboutImage.substring(0, 80));
      }
      
      if (batchResults.menuItems && aiResponse["menu-basic"]?.menuItems) {
        const enhancedMenuItems = aiResponse["menu-basic"].menuItems.map((item: any, index: number) => {
          const batchResult = batchResults.menuItems?.[index];
          return {
            ...item,
            image: batchResult?.image || "https://via.placeholder.com/400x300?text=Image+Not+Available",
            imageAlt: batchResult?.imageAlt || item.name,
            category: batchRequests.menuItems[index]?.category || "food",
          };
        });
        aiResponse["menu-basic"].menuItems = enhancedMenuItems;
        console.log("✅ Menu items enhanced with dynamic images");
      }
      
      console.log("✅ All sections enhanced with batch processing");

      // Enhance team members with dynamic images (for about-team variants)
      if (aiResponse["about-basic"]?.teamMembers) {
        console.log("🖼️ Enhancing team members with dynamic images...");
        const enhancedTeamMembers = await Promise.all(
          aiResponse["about-basic"].teamMembers.map(async (member: any) => {
            const imageData = await this.getTeamMemberImage(
              member.name || "Team Member",
              member.role || "Role",
              request.businessCategory
            );

            return {
              ...member,
              image: imageData.image,
              imageAlt: imageData.imageAlt,
            };
          })
        );

        aiResponse["about-basic"].teamMembers = enhancedTeamMembers;
        console.log("✅ Team members enhanced with dynamic images");
      }

      // Enhance about section with dynamic image (for about-split variant)
      if (aiResponse["about-basic"]) {
        console.log("🖼️ Enhancing about section with dynamic image...");
        const aboutImageData = await this.getAboutImage(
          request.businessCategory,
          request.keywords
        );
        aiResponse["about-basic"] = {
          ...aiResponse["about-basic"],
          aboutImage: aboutImageData.aboutImage,
          aboutImageAlt: aboutImageData.aboutImageAlt,
        };
        console.log("✅ About section enhanced with dynamic image:", aboutImageData.aboutImage.substring(0, 80));
      }

      // Enhance about section with hero image (for about-hero variant)
      if (aiResponse["about-basic"]) {
        console.log("🖼️ Enhancing about section with hero image...");
        const heroImageData = await this.getHeroImage(
          request.businessCategory,
          request.keywords
        );
        aiResponse["about-basic"] = {
          ...aiResponse["about-basic"],
          heroImage: heroImageData.heroImage,
          heroImageAlt: heroImageData.heroImageAlt,
        };
        console.log("✅ About section enhanced with hero image:", heroImageData.heroImage.substring(0, 80));
      }

      return aiResponse;
    } catch (error) {
      console.error("❌ AI generation failed:", error);
      console.log("🔄 Falling back to mock data");
      return this.getMockData(request);
    }
  }

  /**
   * Create prompt for AI using Template System
   */
  private createPrompt(request: AIGenerationRequest): string {
    const { businessCategory, keywords, language, concreteManifest, variantInfo } = request;
    
    // Find business category manifest
    const categoryManifest = BUSINESS_CATEGORIES.find(cat => cat.id === businessCategory);
    if (!categoryManifest) {
      console.warn(`⚠️ Business category '${businessCategory}' not found, using fallback prompt`);
      return this.createFallbackPrompt(request);
    }
    
    // Generate color hint from keywords
    const colorHint = this.generateColorHint(keywords);
    
    try {
      // Use Template System
      const templateResult = generateCompatiblePrompt(
        categoryManifest,
        keywords,
        colorHint,
        concreteManifest,
        variantInfo,
        language
      );
      
      console.log(`🎯 Using template system for '${businessCategory}' category`);
      return templateResult.userPrompt;
    } catch (error) {
      console.error(`❌ Template system failed for '${businessCategory}':`, error);
      return this.createFallbackPrompt(request);
    }
  }
  
  /**
   * Create fallback prompt (legacy system)
   */
  private createFallbackPrompt(request: AIGenerationRequest): string {
    const { businessCategory, keywords, language } = request;
    
    return `Generate website content for a ${businessCategory} business.

Keywords: ${keywords.join(", ")}
Language: ${language}

Respond with ONLY valid JSON:

{
  "global": {
    "palette": {
      "primary": "green",
      "secondary": "green", 
      "bgTone": "100"
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "hero-basic": {
    "badge": "Badge text (max 40 chars)",
    "heading": "Main heading", 
    "subheading": "Subheading text",
    "ctaLabel": "Primary CTA",
    "secondaryCta": "Secondary CTA",
    "heroImage": "https://via.placeholder.com/1920x1080?text=Hero+Image",
    "heroImageAlt": "Hero background image"
  },
  "navbar-basic": {
    "brand": "<your brand>",
    "brandFirstChar": "B",
    "ctaButton": "Action button",
    "menuItems": [
      {"label": "Menu item", "href": "/path"}
    ]
  },
  "about-basic": {
    "title": "About title",
    "description": "About description",
    "features": [
      {"title": "คุณสมบัติ 1", "description": "คำอธิบาย"},
      {"title": "คุณสมบัติ 2", "description": "คำอธิบาย"},
      {"title": "คุณสมบัติ 3", "description": "คำอธิบาย"}
    ],
    "stats": [
      {"number": "100+", "label": "ลูกค้า"},
      {"number": "5★", "label": "รีวิว"},
      {"number": "24/7", "label": "บริการ"},
      {"number": "100%", "label": "ความพึงพอใจ"}
    ]
  },
  "contact-basic": {
    "title": "Contact title",
    "subtitle": "Contact subtitle", 
    "address": "Full address",
    "phone": "Phone number",
    "email": "Email address",
    "businessHours": "Business hours"
  },
  "menu-basic": {
    "title": "Menu/Products/Services title",
    "menuItems": [
      {
        "name": "Food Item 1", 
        "price": "100", 
        "description": "Delicious food description",
        "image": "https://via.placeholder.com/400x300?text=Food+1",
        "imageAlt": "Food item 1",
        "category": "food"
      },
      {
        "name": "Product Item 1", 
        "price": "150", 
        "description": "Quality product description",
        "image": "https://via.placeholder.com/400x300?text=Product+1",
        "imageAlt": "Product item 1",
        "category": "product"
      },
      {
        "name": "Service Item 1", 
        "price": "200", 
        "description": "Professional service description",
        "image": "https://via.placeholder.com/400x300?text=Service+1",
        "imageAlt": "Service item 1",
        "category": "service"
      },
      {
        "name": "Creative Item 1", 
        "price": "250", 
        "description": "Creative work description",
        "image": "https://via.placeholder.com/400x300?text=Creative+1",
        "imageAlt": "Creative item 1",
        "category": "design"
      }
    ]
  },
  "footer-basic": {
    "companyName": "Company name",
    "description": "Company description",
    "socialLinks": [],
    "quickLinks": [],
    "address": "Address",
    "phone": "Phone",
    "email": "Email"
  },
  "theme-basic": {
    "primary": "green",
    "secondary": "green", 
    "bgTone": "100",
    "radius": "8px",
    "spacing": "1rem"
  }
}

Make the content relevant to ${businessCategory} business and use ${language} language.

IMPORTANT: 
- Use only these color names: blue, green, purple, pink, orange, red, yellow, indigo
- Do NOT use hex codes like #FFB300 or #D32F2F
- Keep badge text under 40 characters
- Make badge text short and catchy
- For menu items, include placeholder image URLs
- Image URLs should be: https://via.placeholder.com/400x300?text=Item+Name
- imageAlt should describe the item in ${language}
- category should be appropriate for the business type:
  * Restaurant: food, rice, noodles, soup, curry, meat, vegetarian
  * E-commerce: product, book, stationery, toy, clothing, electronics
  * Healthcare: medicine, health, medical, pharmacy, wellness
  * Portfolio: design, creative, development, art, professional
- IMPORTANT: Generate 4-6 menu items for a complete menu
- Color selection rules:
  * If keywords mention only ONE color (like "โทนสีเขียว"), use that color for BOTH primary and secondary (same color family)
  * If keywords mention TWO colors (like "ฟ้า เขียว"), use the first color as primary and second as secondary
  * If no specific colors mentioned, choose appropriate colors for the business type
  * For single color requests, use the SAME color for both primary and secondary (e.g., both "green")
  * This creates a cohesive monochromatic color scheme
- Brand name rules:
  * If keywords mention a specific brand name (like "ชื่อ เจได"), extract ONLY the brand name part (e.g., "เจได")
  * Do NOT include words like "ชื่อ" in the brand name
  * Keep the brand name simple and clean as requested
  * Examples: "ชื่อ เจได" → "เจได", "ชื่อ ครัวไทย" → "ครัวไทย"`;
  }

  /**
   * Get system prompt
   */
  private getSystemPrompt(): string {
    return `You are a professional website content generator. 
    Generate high-quality, relevant content for website templates.
    Always respond with valid JSON format ONLY - no markdown, no explanations.
    Use appropriate colors, text, and content for the business category.
    Make content engaging and professional.
    
    CRITICAL RULES:
    - If keywords mention a specific brand name (like "ชื่อ เจได"), extract ONLY the brand name part (e.g., "เจได")
    - Do NOT include words like "ชื่อ" in the brand name
    - Keep brand names simple and clean as requested
    
    IMPORTANT: Your response must be valid JSON that can be parsed directly.`;
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(
    content: string,
    businessCategory: string
  ): AIGenerationResponse {
    try {
      // Clean the response (remove markdown if present)
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      const parsed = JSON.parse(cleanContent);
      
      // Validate required fields - be more flexible with block names
      if (!parsed.global) {
        throw new Error("Invalid response structure: missing global section");
      }
      
      // Check if we have at least one block (hero, navbar, about, etc.)
      // Support both PascalCase and kebab-case
      const hasAnyBlock = Object.keys(parsed).some(key => {
        const lowerKey = key.toLowerCase();
        return lowerKey.includes('hero') || lowerKey.includes('navbar') || lowerKey.includes('about') || 
               lowerKey.includes('menu') || lowerKey.includes('contact') || lowerKey.includes('footer') ||
               lowerKey.includes('theme');
      });
      
      if (!hasAnyBlock) {
        throw new Error("Invalid response structure: no content blocks found");
      }
      
      // Normalize block names from PascalCase to kebab-case
      const normalizedResponse = { ...parsed };
      const blockMappings = {
        'Navbar': 'navbar-basic',
        'Hero': 'hero-basic', 
        'About': 'about-basic',        // ✅ เพิ่ม mapping สำหรับ 'About'
        'About-basic': 'about-basic',
        'Menu': 'menu-basic',          // ✅ เพิ่ม mapping สำหรับ 'Menu'
        'Menu-basic': 'menu-basic',
        'Contact': 'contact-basic',    // ✅ เพิ่ม mapping สำหรับ 'Contact'
        'Contact-basic': 'contact-basic',
        'Footer': 'footer-basic',
        'Theme': 'theme-basic'         // ✅ เพิ่ม mapping สำหรับ 'Theme'
      };
      
      for (const [pascalCase, kebabCase] of Object.entries(blockMappings)) {
        if (normalizedResponse[pascalCase]) {
          normalizedResponse[kebabCase] = normalizedResponse[pascalCase];
          delete normalizedResponse[pascalCase];
        }
      }
      
      // console.log("🔄 Normalized response keys:", Object.keys(normalizedResponse));
      
      return normalizedResponse as AIGenerationResponse;
    } catch (error) {
      console.error("❌ Failed to parse AI response:", error);
      console.log("🔄 Using mock data instead");
      return this.getMockData({
        businessCategory,
        keywords: [],
        language: "en",
      });
    }
  }

  /**
   * Get mock data with dynamic images as fallback
   */
  private async getMockDataWithImages(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    const mockData = this.getMockData(request);

    // Enhance hero section with dynamic image
    if (mockData["hero-basic"]) {
      const heroImageData = await this.getHeroImage(
        request.businessCategory,
        request.keywords
      );
      mockData["hero-basic"] = {
        ...mockData["hero-basic"],
        heroImage: heroImageData.heroImage,
        heroImageAlt: heroImageData.heroImageAlt,
      };
    }

    // Enhance menu items with dynamic images
    if (mockData["menu-basic"]?.menuItems) {
      const enhancedMenuItems = await Promise.all(
        mockData["menu-basic"].menuItems.map(async (item: any) => {
          const category = this.generateCategory(
            item.name,
            request.businessCategory
          );
          const imageData = await this.getImageForMenuItem(
            item.name,
            category,
            request.businessCategory
          );

          return {
            ...item,
            image: imageData.image,
            imageAlt: imageData.imageAlt,
            category: category,
          };
        })
      );

      mockData["menu-basic"].menuItems = enhancedMenuItems;
    }

    // Enhance team members with dynamic images
    if (mockData["about-basic"]?.teamMembers) {
      const enhancedTeamMembers = await Promise.all(
        mockData["about-basic"].teamMembers.map(async (member: any) => {
          const imageData = await this.getTeamMemberImage(
            member.name || "Team Member",
            member.role || "Role",
            request.businessCategory
          );

          return {
            ...member,
            image: imageData.image,
            imageAlt: imageData.imageAlt,
          };
        })
      );

      mockData["about-basic"].teamMembers = enhancedTeamMembers;
    }

    return mockData;
  }

  /**
   * Get mock data as fallback
   */
  private getMockData(request: AIGenerationRequest): AIGenerationResponse {
    const { businessCategory } = request;
    
    if (businessCategory === "restaurant") {
      return {
        global: {
          palette: { primary: "orange", secondary: "red", bgTone: "100" },
          tokens: { radius: "8px", spacing: "1rem" },
        },
        "hero-basic": {
          badge: "ร้านอาหารไทยยอดนิยม",
          heading: "ลิ้มรสอาหารไทยแท้",
          subheading: "ประสบการณ์ที่ไม่เหมือนใคร",
          ctaLabel: "ดูเมนู",
          secondaryCta: "จองโต๊ะ",
        },
        "navbar-basic": {
          brand: "ครัวไทย",
          brandFirstChar: "ค",
          ctaButton: "สั่งอาหาร",
          menuItems: [
            { label: "หน้าแรก", href: "/" },
            { label: "เมนู", href: "/menu" },
          ],
        },
        "about-basic": {
          title: "เกี่ยวกับเรา",
          description: "ร้านอาหารไทยแท้",
          features: [{ title: "สดใหม่", description: "ทุกวัน" }],
          stats: [{ number: "10+", label: "ปี" }],
          teamMembers: [
            {
              name: "John Doe",
              role: "Chef",
              image: "https://via.placeholder.com/400x400?text=Team+Member",
              bio: "Expert chef"
            }
          ],
        },
        "contact-basic": {
          title: "ติดต่อเรา",
          subtitle: "สอบถาม",
          address: "123 ถ.สุขุมวิท",
          phone: "02-123-4567",
          email: "info@kruathai.com",
          businessHours: "ทุกวัน 10:00-22:00",
        },
        "menu-basic": {
          title: "เมนูอาหาร",
          menuItems: [
            { name: "ข้าวผัดกุ้ง", price: "120", description: "ข้าวผัดกุ้งสด" },
            { name: "ผัดไทย", price: "80", description: "ผัดไทยแท้" },
            {
              name: "ต้มยำกุ้ง",
              price: "150",
              description: "ต้มยำกุ้งเผ็ดร้อน",
            },
          ],
        },
        "footer-basic": {
          companyName: "ครัวไทย",
          description: "ร้านอาหารไทย",
          socialLinks: [],
          quickLinks: [],
          address: "123 ถ.สุขุมวิท",
          phone: "02-123-4567",
          email: "info@kruathai.com",
        },
        "theme-basic": {
          primary: "orange",
          secondary: "red",
          bgTone: "100",
          radius: "8px",
          spacing: "1rem",
        },
      };
    }
    
    // Default fallback
    return {
      global: {
        palette: { primary: "blue", secondary: "green", bgTone: "100" },
        tokens: { radius: "8px", spacing: "1rem" },
      },
      "hero-basic": {
        badge: "Default Badge",
        heading: "Default Heading",
        subheading: "Default Subheading",
        ctaLabel: "Learn More",
        secondaryCta: "Contact Us",
      },
      "navbar-basic": {
        brand: "Default Brand",
        brandFirstChar: "D",
        ctaButton: "Action",
        menuItems: [],
      },
      "about-basic": {
        title: "Default About",
        description: "Default Description",
        features: [],
        stats: [],
        teamMembers: [
          {
            name: "John Doe",
            role: "Chef",
            image: "https://via.placeholder.com/400x400?text=Team+Member",
            bio: "Expert chef"
          }
        ],
      },
      "contact-basic": {
        title: "Default Contact",
        subtitle: "Default Subtitle",
        address: "Default Address",
        phone: "Default Phone",
        email: "Default Email",
        businessHours: "Default Hours",
      },
      "menu-basic": {
        title: "Default Menu",
        menuItems: [
          {
            name: "Default Item",
            price: "100",
            description: "Default description",
          },
          {
            name: "Default Item",
            price: "150",
            description: "Default description",
          },
        ],
      },
      "footer-basic": {
        companyName: "Default Company",
        description: "Default Footer Description",
        socialLinks: [],
        quickLinks: [],
        address: "Default Address",
        phone: "Default Phone",
        email: "Default Email",
      },
      "theme-basic": {
        primary: "blue",
        secondary: "green",
        bgTone: "100",
        radius: "8px",
        spacing: "1rem",
      },
    };
  }

  /**
   * Check if AI service is available
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
      model: process.env.OPENAI_MODEL || "gpt-5-nano",
      temperature: process.env.OPENAI_TEMPERATURE || "1.0",
    };
  }
  
  /**
   * Generate color hint from keywords
   */
  private generateColorHint(keywords: string[]): string {
    const colorKeywords = keywords.filter(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'orange', 'indigo', 'brown'].includes(lowerKeyword);
    });
    
    if (colorKeywords.length > 0) {
      return `Color preference: ${colorKeywords.join(', ')}`;
    }
    
    return 'Use appropriate colors for the business type';
  }
}
