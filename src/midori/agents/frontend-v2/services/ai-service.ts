/**
 * AI Service for Frontend-V2 Agent
 * จัดการการเรียกใช้ OpenAI API
 */

import { config } from 'dotenv';
import OpenAI from 'openai';
import { UnsplashService, UnsplashImage } from './unsplash-service';

// Load .env from root
config({ path: '../../../../.env' });

export interface AIGenerationRequest {
  businessCategory: string;
  keywords: string[];
  language: string;
  model?: string;
  temperature?: number;
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

  constructor() {
    this.initialize();
    this.unsplashService = new UnsplashService();
  }

  private initialize() {
    try {
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        this.isInitialized = true;
        console.log('✅ AI Service initialized with OpenAI');
      } else {
        console.warn('⚠️ No OpenAI API key found, AI Service will use mock data');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error);
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
      const unsplashImage = await this.unsplashService.getImageForMenuItem(
        itemName, 
        category, 
        businessCategory
      );
      
      const imageUrl = this.unsplashService.generateImageUrl(unsplashImage, {
        width: 400,
        height: 300,
        quality: 80
      });
      
      return {
        image: imageUrl,
        imageAlt: unsplashImage.alt_description || itemName
      };
    } catch (error) {
      console.error('❌ Error getting image for menu item:', error);
      return {
        image: 'https://via.placeholder.com/400x300?text=Image+Not+Available',
        imageAlt: itemName
      };
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
      const searchQuery = this.buildHeroSearchQuery(businessCategory, keywords);
      
      const unsplashImage = await this.unsplashService.searchImages(searchQuery, {
        perPage: 5,
        orientation: 'landscape',
        orderBy: 'relevant'
      });

      if (unsplashImage.length > 0) {
        // Randomly select an image for variety
        const randomIndex = Math.floor(Math.random() * unsplashImage.length);
        const selectedImage = unsplashImage[randomIndex];
        
        if (selectedImage) {
          const imageUrl = this.unsplashService.generateImageUrl(selectedImage, {
            width: 1920,
            height: 1080,
            quality: 85
          });
          
          return {
            heroImage: imageUrl,
            heroImageAlt: selectedImage.alt_description || `${businessCategory} hero image`
          };
        }
      }

      // Fallback
      return {
        heroImage: 'https://via.placeholder.com/1920x1080?text=Hero+Image',
        heroImageAlt: `${businessCategory} hero image`
      };
    } catch (error) {
      console.error('❌ Error getting hero image:', error);
      return {
        heroImage: 'https://via.placeholder.com/1920x1080?text=Hero+Image',
        heroImageAlt: `${businessCategory} hero image`
      };
    }
  }

  /**
   * Build search query for hero image with randomization
   */
  private buildHeroSearchQuery(businessCategory: string, keywords: string[]): string {
    const businessKeywords: Record<string, string[]> = {
      restaurant: [
        'restaurant', 'food', 'dining', 'kitchen', 'chef', 'cuisine',
        'thai restaurant', 'asian food', 'street food', 'fine dining',
        'restaurant interior', 'dining room', 'food service', 'culinary',
        'restaurant kitchen', 'food preparation', 'restaurant staff'
      ],
      ecommerce: [
        'shopping', 'store', 'retail', 'products', 'marketplace', 'commerce',
        'online shopping', 'ecommerce', 'shopping mall', 'retail store',
        'product display', 'shopping cart', 'storefront', 'retail space'
      ],
      healthcare: [
        'health', 'medical', 'hospital', 'wellness', 'care', 'medicine',
        'healthcare', 'medical center', 'clinic', 'hospital interior',
        'medical equipment', 'healthcare professional', 'patient care'
      ],
      pharmacy: [
        'pharmacy', 'medicine', 'health', 'medical', 'drugs', 'wellness',
        'pharmaceutical', 'drugstore', 'pharmacy interior', 'medication',
        'healthcare products', 'medical supplies'
      ],
      portfolio: [
        'design', 'creative', 'art', 'professional', 'work', 'studio',
        'creative workspace', 'design studio', 'art studio', 'office',
        'professional work', 'creative environment', 'workspace'
      ]
    };

    const categoryKeywords = businessKeywords[businessCategory] || ['business', 'professional'];
    
    // Randomize keywords for variety
    const shuffledCategoryKeywords = this.shuffleArray([...categoryKeywords]);
    const shuffledUserKeywords = this.shuffleArray([...keywords]);
    
    // Combine and randomize all keywords
    const allKeywords = [...shuffledCategoryKeywords, ...shuffledUserKeywords];
    const shuffledAllKeywords = this.shuffleArray(allKeywords);
    
    // Use more keywords for better variety (5-7 keywords)
    return shuffledAllKeywords.slice(0, Math.min(7, shuffledAllKeywords.length)).join(' ');
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
      'restaurant': this.getFoodCategory(itemName),
      'ecommerce': this.getProductCategory(itemName),
      'healthcare': 'health',
      'pharmacy': 'medicine',
      'portfolio': 'design'
    };
    
    return categoryMap[businessCategory] || 'general';
  }

  private getFoodCategory(itemName: string): string {
    const name = itemName.toLowerCase();
    if (name.includes('ข้าว') || name.includes('rice')) return 'rice';
    if (name.includes('ผัด') || name.includes('noodle')) return 'noodles';
    if (name.includes('ต้ม') || name.includes('soup')) return 'soup';
    if (name.includes('แกง') || name.includes('curry')) return 'curry';
    if (name.includes('ทอด') || name.includes('fried')) return 'fried';
    return 'food';
  }

  private getProductCategory(itemName: string): string {
    const name = itemName.toLowerCase();
    if (name.includes('หนังสือ') || name.includes('book')) return 'books';
    if (name.includes('ปากกา') || name.includes('ดินสอ') || name.includes('pen')) return 'stationery';
    if (name.includes('ของเล่น') || name.includes('toy')) return 'toys';
    if (name.includes('เสื้อ') || name.includes('shirt')) return 'clothing';
    return 'product';
  }

  /**
   * Generate content using AI with dynamic images
   */
  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    if (!this.isInitialized || !this.openai) {
      console.log('🔄 AI Service not available, using mock data with dynamic images');
      return this.getMockDataWithImages(request);
    }

    try {
      console.log('🤖 Generating content with AI...');
      
      const prompt = this.createPrompt(request);
      
      const model = request.model || 'gpt-5-nano';
      const isGpt5 = model.includes('gpt-5');
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: request.temperature || 1,
        ...(isGpt5 ? { max_completion_tokens: 8000 } : { max_tokens: 8000 })
      });

      const content = response.choices[0]?.message?.content;
      const finishReason = response.choices[0]?.finish_reason;
      
      console.log('🤖 AI Response content:', content);
      console.log('🤖 AI Response choices:', response.choices);
      console.log('🤖 Finish reason:', finishReason);
      console.log('🤖 Usage:', response.usage);
      
      if (!content) {
        console.error('❌ No content in AI response:', {
          choices: response.choices,
          usage: response.usage,
          model: response.model,
          finishReason: finishReason
        });
        
        // Check if it's a length limit issue
        if (finishReason === 'length') {
          console.log('🔄 Response was truncated due to length limit, trying with shorter prompt');
          // Fallback to mock data for now
          return this.getMockData(request);
        }
        
        throw new Error('No content generated by AI');
      }

      const aiResponse = this.parseAIResponse(content, request.businessCategory);
      
      // Enhance hero section with dynamic image
      if (aiResponse['hero-basic']) {
        console.log('🖼️ Enhancing hero section with dynamic image...');
        const heroImageData = await this.getHeroImage(request.businessCategory, request.keywords);
        aiResponse['hero-basic'] = {
          ...aiResponse['hero-basic'],
          heroImage: heroImageData.heroImage,
          heroImageAlt: heroImageData.heroImageAlt
        };
        console.log('✅ Hero section enhanced with dynamic image');
      }
      
      // Enhance menu items with dynamic images
      if (aiResponse['menu-basic']?.menuItems) {
        console.log('🖼️ Enhancing menu items with dynamic images...');
        const enhancedMenuItems = await Promise.all(
          aiResponse['menu-basic'].menuItems.map(async (item: any) => {
            const category = this.generateCategory(item.name, request.businessCategory);
            const imageData = await this.getImageForMenuItem(item.name, category, request.businessCategory);
            
            return {
              ...item,
              image: imageData.image,
              imageAlt: imageData.imageAlt,
              category: category
            };
          })
        );
        
        aiResponse['menu-basic'].menuItems = enhancedMenuItems;
        console.log('✅ Menu items enhanced with dynamic images');
      }
      
      return aiResponse;
    } catch (error) {
      console.error('❌ AI generation failed:', error);
      console.log('🔄 Falling back to mock data');
      return this.getMockData(request);
    }
  }

  /**
   * Create prompt for AI
   */
  private createPrompt(request: AIGenerationRequest): string {
    const { businessCategory, keywords, language } = request;
    
    return `Generate website content for a ${businessCategory} business.

Keywords: ${keywords.join(', ')}
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
    "brand": "เจได",
    "brandFirstChar": "จ",
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
  private parseAIResponse(content: string, businessCategory: string): AIGenerationResponse {
    try {
      // Clean the response (remove markdown if present)
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanContent);
      
      // Validate required fields
      if (!parsed.global || !parsed['hero-basic']) {
        throw new Error('Invalid response structure');
      }
      
      return parsed as AIGenerationResponse;
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.log('🔄 Using mock data instead');
      return this.getMockData({ businessCategory, keywords: [], language: 'en' });
    }
  }

  /**
   * Get mock data with dynamic images as fallback
   */
  private async getMockDataWithImages(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const mockData = this.getMockData(request);
    
    // Enhance hero section with dynamic image
    if (mockData['hero-basic']) {
      const heroImageData = await this.getHeroImage(request.businessCategory, request.keywords);
      mockData['hero-basic'] = {
        ...mockData['hero-basic'],
        heroImage: heroImageData.heroImage,
        heroImageAlt: heroImageData.heroImageAlt
      };
    }
    
    // Enhance menu items with dynamic images
    if (mockData['menu-basic']?.menuItems) {
      const enhancedMenuItems = await Promise.all(
        mockData['menu-basic'].menuItems.map(async (item: any) => {
          const category = this.generateCategory(item.name, request.businessCategory);
          const imageData = await this.getImageForMenuItem(item.name, category, request.businessCategory);
          
          return {
            ...item,
            image: imageData.image,
            imageAlt: imageData.imageAlt,
            category: category
          };
        })
      );
      
      mockData['menu-basic'].menuItems = enhancedMenuItems;
    }
    
    return mockData;
  }

  /**
   * Get mock data as fallback
   */
  private getMockData(request: AIGenerationRequest): AIGenerationResponse {
    const { businessCategory } = request;
    
    if (businessCategory === 'restaurant') {
      return {
        global: {
          palette: { primary: 'orange', secondary: 'red', bgTone: '100' },
          tokens: { radius: '8px', spacing: '1rem' }
        },
        'hero-basic': {
          badge: 'ร้านอาหารไทยยอดนิยม',
          heading: 'ลิ้มรสอาหารไทยแท้',
          subheading: 'ประสบการณ์ที่ไม่เหมือนใคร',
          ctaLabel: 'ดูเมนู',
          secondaryCta: 'จองโต๊ะ'
        },
        'navbar-basic': {
          brand: 'ครัวไทย',
          brandFirstChar: 'ค',
          ctaButton: 'สั่งอาหาร',
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เมนู', href: '/menu' }
          ]
        },
        'about-basic': {
          title: 'เกี่ยวกับเรา',
          description: 'ร้านอาหารไทยแท้',
          features: [
            { title: 'สดใหม่', description: 'ทุกวัน' }
          ],
          stats: [
            { number: '10+', label: 'ปี' }
          ]
        },
        'contact-basic': {
          title: 'ติดต่อเรา',
          subtitle: 'สอบถาม',
          address: '123 ถ.สุขุมวิท',
          phone: '02-123-4567',
          email: 'info@kruathai.com',
          businessHours: 'ทุกวัน 10:00-22:00'
        },
        'menu-basic': {
          title: 'เมนูอาหาร',
          menuItems: [
            { name: 'ข้าวผัดกุ้ง', price: '120', description: 'ข้าวผัดกุ้งสด' },
            { name: 'ผัดไทย', price: '80', description: 'ผัดไทยแท้' },
            { name: 'ต้มยำกุ้ง', price: '150', description: 'ต้มยำกุ้งเผ็ดร้อน' }
          ]
        },
        'footer-basic': {
          companyName: 'ครัวไทย',
          description: 'ร้านอาหารไทย',
          socialLinks: [],
          quickLinks: [],
          address: '123 ถ.สุขุมวิท',
          phone: '02-123-4567',
          email: 'info@kruathai.com'
        },
        'theme-basic': {
          primary: 'orange',
          secondary: 'red',
          bgTone: '100',
          radius: '8px',
          spacing: '1rem'
        }
      };
    }
    
    // Default fallback
    return {
      global: {
        palette: { primary: 'blue', secondary: 'green', bgTone: '100' },
        tokens: { radius: '8px', spacing: '1rem' }
      },
      'hero-basic': {
        badge: 'Default Badge',
        heading: 'Default Heading',
        subheading: 'Default Subheading',
        ctaLabel: 'Learn More',
        secondaryCta: 'Contact Us'
      },
      'navbar-basic': {
        brand: 'Default Brand',
        brandFirstChar: 'D',
        ctaButton: 'Action',
        menuItems: []
      },
      'about-basic': {
        title: 'Default About',
        description: 'Default Description',
        features: [],
        stats: []
      },
      'contact-basic': {
        title: 'Default Contact',
        subtitle: 'Default Subtitle',
        address: 'Default Address',
        phone: 'Default Phone',
        email: 'Default Email',
        businessHours: 'Default Hours'
      },
      'menu-basic': {
        title: 'Default Menu',
        menuItems: [
          { name: 'Default Item', price: '100', description: 'Default description' },
          { name: 'Default Item', price: '150', description: 'Default description' }
        ]
      },
      'footer-basic': {
        companyName: 'Default Company',
        description: 'Default Footer Description',
        socialLinks: [],
        quickLinks: [],
        address: 'Default Address',
        phone: 'Default Phone',
        email: 'Default Email'
      },
      'theme-basic': {
        primary: 'blue',
        secondary: 'green',
        bgTone: '100',
        radius: '8px',
        spacing: '1rem'
      }
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
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      temperature: process.env.OPENAI_TEMPERATURE || '1.0'
    };
  }
}
