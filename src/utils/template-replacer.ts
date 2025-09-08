import { BusinessContext } from '../app/api/gensite/business/types';

/**
 * Template Replacer Utility
 * จัดการ placeholder replacement และ template validation
 * ใช้ AI ก่อน default values เพื่อให้ตรงกับความต้องการของ user
 */
export class TemplateReplacer {
  private static templateCache = new Map<string, string>();

  /**
   * แทนที่ placeholders ใน template ด้วยข้อมูลจาก finalJson
   * ใช้ AI ก่อน default values
   */
  static async replacePlaceholders(
    template: string, 
    finalJson: Record<string, unknown>, 
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string
  ): Promise<string> {
    console.log('[TemplateReplacer] Start replacePlaceholders', {
      industry: ctx?.industry,
      projectName,
      hasUserIntent: Boolean(userIntent)
    });
    // ตรวจสอบว่า template มี placeholders หรือไม่
    const placeholders = template.match(/\[[A-Z0-9_]+\]/g);
    console.log('[TemplateReplacer] Detected placeholders:', placeholders?.length || 0);
    if (!placeholders || placeholders.length === 0) {
      console.log('[TemplateReplacer] No placeholders found. Return original template.');
      return template;
    }

    // ตรวจสอบ cache ก่อน
    const cacheKey = `${template.substring(0, 100)}_${ctx.industry}_${projectName}`;
    const cached = this.getCachedTemplate(cacheKey);
    if (cached) {
      console.log('[TemplateReplacer] Cache hit. Returning cached template.');
      return cached;
    }

    try {
      // ใช้ AI สำหรับ replacement ก่อน
      const aiResult = await this.getAIReplacements(template, finalJson, ctx, projectName, userIntent);
      
      if (aiResult && !aiResult.fallbackUsed) {
        // Cache AI result
        this.cacheTemplate(cacheKey, aiResult.replacedTemplate);
        console.log('[TemplateReplacer] AI replacement success. Cached and returning.');
        return aiResult.replacedTemplate;
      }
    } catch (error) {
      console.warn('AI replacement failed, using fallback:', error);
    }

    // Fallback to default replacements
    const projectInfo = finalJson.project as any;
    const businessInfo = finalJson.business as any;
    const heroInfo = finalJson.hero as any;
    const contactInfo = finalJson.contact as any;
    const menuInfo = finalJson.menu as any;
    const featuredInfo = finalJson.featured as any;

    const result = template
      // Project & Business Info
      .replace(/\[PROJECT_NAME\]/g, projectName || projectInfo?.name || 'Website')
      .replace(/\[BUSINESS_NAME\]/g, businessInfo?.name || projectInfo?.name || ctx.industry)
      .replace(/\[BUSINESS_TYPE\]/g, ctx.industry || 'Business')
      .replace(/\[BUSINESS_DESCRIPTION\]/g, businessInfo?.description || projectInfo?.description || 'Professional website')

      // Hero Section
      .replace(/\[HERO_TITLE\]/g, heroInfo?.title || this.getDefaultHeroTitle(ctx.industry))
      .replace(/\[HERO_SUBTITLE\]/g, heroInfo?.subtitle || this.getDefaultHeroSubtitle(ctx.industry))
      .replace(/\[HERO_DESCRIPTION\]/g, heroInfo?.description || this.getDefaultHeroDescription(ctx.industry))

      // Contact Information
      .replace(/\[CONTACT_PHONE\]/g, contactInfo?.phone || this.getDefaultPhone(ctx.industry))
      .replace(/\[CONTACT_EMAIL\]/g, contactInfo?.email || this.getDefaultEmail(ctx.industry))
      .replace(/\[CONTACT_ADDRESS\]/g, contactInfo?.address || this.getDefaultAddress(ctx.industry))
      .replace(/\[CONTACT_HOURS\]/g, contactInfo?.hours || this.getDefaultHours(ctx.industry))

      // Navigation & Buttons
      .replace(/\[MENU_BUTTON_TEXT\]/g, this.getMenuButtonText(ctx.industry))
      .replace(/\[ORDER_BUTTON_TEXT\]/g, this.getOrderButtonText(ctx.industry))
      .replace(/\[CONTACT_BUTTON_TEXT\]/g, this.getContactButtonText(ctx.industry))
      .replace(/\[LEARN_MORE_TEXT\]/g, this.getLearnMoreText(ctx.industry))

      // Features & Content
      .replace(/\[FEATURED_SECTION_TITLE\]/g, featuredInfo?.title || this.getFeaturedTitle(ctx.industry))
      .replace(/\[ABOUT_SECTION_TITLE\]/g, this.getAboutTitle(ctx.industry))
      .replace(/\[SERVICES_SECTION_TITLE\]/g, this.getServicesTitle(ctx.industry))

      // Menu Items (for cafe/restaurant)
      .replace(/\[MENU_ITEM_1_NAME\]/g, menuInfo?.items?.[0]?.name || this.getDefaultMenuItem(ctx.industry, 1))
      .replace(/\[MENU_ITEM_1_DESCRIPTION\]/g, menuInfo?.items?.[0]?.description || this.getDefaultMenuItemDescription(ctx.industry, 1))
      .replace(/\[MENU_ITEM_1_PRICE\]/g, menuInfo?.items?.[0]?.price || this.getDefaultMenuItemPrice(ctx.industry, 1))
      .replace(/\[MENU_ITEM_2_NAME\]/g, menuInfo?.items?.[1]?.name || this.getDefaultMenuItem(ctx.industry, 2))
      .replace(/\[MENU_ITEM_2_DESCRIPTION\]/g, menuInfo?.items?.[1]?.description || this.getDefaultMenuItemDescription(ctx.industry, 2))
      .replace(/\[MENU_ITEM_2_PRICE\]/g, menuInfo?.items?.[1]?.price || this.getDefaultMenuItemPrice(ctx.industry, 2))
      .replace(/\[MENU_ITEM_3_NAME\]/g, menuInfo?.items?.[2]?.name || this.getDefaultMenuItem(ctx.industry, 3))
      .replace(/\[MENU_ITEM_3_DESCRIPTION\]/g, menuInfo?.items?.[2]?.description || this.getDefaultMenuItemDescription(ctx.industry, 3))
      .replace(/\[MENU_ITEM_3_PRICE\]/g, menuInfo?.items?.[2]?.price || this.getDefaultMenuItemPrice(ctx.industry, 3))

      // Features
      .replace(/\[FEATURE_1_TITLE\]/g, this.getFeatureTitle(ctx.industry, 1))
      .replace(/\[FEATURE_1_DESCRIPTION\]/g, this.getFeatureDescription(ctx.industry, 1))
      .replace(/\[FEATURE_2_TITLE\]/g, this.getFeatureTitle(ctx.industry, 2))
      .replace(/\[FEATURE_2_DESCRIPTION\]/g, this.getFeatureDescription(ctx.industry, 2))
      .replace(/\[FEATURE_3_TITLE\]/g, this.getFeatureTitle(ctx.industry, 3))
      .replace(/\[FEATURE_3_DESCRIPTION\]/g, this.getFeatureDescription(ctx.industry, 3));

    // Cache fallback result
    this.cacheTemplate(cacheKey, result);
    const remaining = result.match(/\[[A-Z0-9_]+\]/g) || [];
    console.log('[TemplateReplacer] Fallback replacement complete', {
      industry: ctx.industry,
      remainingPlaceholders: remaining,
    });
    return result;
  }

  /**
   * เรียกใช้ AI API สำหรับ template replacement
   */
  private static async getAIReplacements(
    template: string,
    finalJson: Record<string, unknown>,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string
  ): Promise<{ replacedTemplate: string; fallbackUsed: boolean } | null> {
    try {
      // ใช้ direct AI call แทน fetch API
      const { OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: process.env.QUESTION_API_KEY,
      });

      // ตรวจสอบว่า template มี placeholders หรือไม่
      const placeholders = template.match(/\[[A-Z0-9_]+\]/g);
      if (!placeholders || placeholders.length === 0) {
        console.log('[TemplateReplacer] getAIReplacements: No placeholders. Skip AI.');
        return {
          replacedTemplate: template,
          fallbackUsed: false
        };
      }

      // สร้าง prompt สำหรับ AI
      const prompt = this.createReplacementPrompt(template, finalJson, ctx, placeholders, projectName, userIntent);

      // เรียกใช้ AI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert content generator for website templates. Generate appropriate content for placeholders based on user intent and business context. Return only valid JSON with replacements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        console.warn('[TemplateReplacer] AI responded with empty content');
        throw new Error('No response from AI');
      }

      // Parse AI response
      const aiReplacements = JSON.parse(aiResponse);
      
      // Apply AI replacements
      let replacedTemplate = template;
      const appliedReplacements: Record<string, string> = {};
      
      for (const placeholder of placeholders) {
        const key = placeholder.slice(1, -1); // Remove [ and ]
        if (aiReplacements[key]) {
          replacedTemplate = replacedTemplate.replace(new RegExp(`\\${placeholder}`, 'g'), aiReplacements[key]);
          appliedReplacements[key] = aiReplacements[key];
        }
      }
      const remaining = replacedTemplate.match(/\[[A-Z0-9_]+\]/g) || [];
      console.log('[TemplateReplacer] AI replacements applied', {
        appliedCount: Object.keys(appliedReplacements).length,
        remainingPlaceholders: remaining
      });

      return {
        replacedTemplate,
        fallbackUsed: false
      };

    } catch (error) {
      console.error('[TemplateReplacer] AI replacement error:', error);
      return null;
    }
  }

  /**
   * สร้าง prompt สำหรับ AI replacement
   */
  private static createReplacementPrompt(
    template: string,
    finalJson: Record<string, unknown>,
    ctx: BusinessContext,
    placeholders: string[],
    projectName?: string,
    userIntent?: string
  ): string {
    const projectInfo = finalJson.project as any;
    const businessInfo = finalJson.business as any;
    const heroInfo = finalJson.hero as any;
    const contactInfo = finalJson.contact as any;
    const menuInfo = finalJson.menu as any;
    const featuredInfo = finalJson.featured as any;

    return `Generate appropriate content for the following placeholders in a ${ctx.industry} website template.

**Business Context:**
- Industry: ${ctx.industry}
- Project Name: ${projectName || projectInfo?.name || 'Website'}
- Business Name: ${businessInfo?.name || projectInfo?.name || ctx.industry}
- Business Description: ${businessInfo?.description || projectInfo?.description || ''}

**User Intent:** ${userIntent || 'Create a professional website'}

**Available Data:**
- Hero Info: ${JSON.stringify(heroInfo || {})}
- Contact Info: ${JSON.stringify(contactInfo || {})}
- Menu Info: ${JSON.stringify(menuInfo || {})}
- Featured Info: ${JSON.stringify(featuredInfo || {})}

**Placeholders to Replace:**
${placeholders.map(p => `- ${p}`).join('\n')}

**Requirements:**
1. Generate content that matches the ${ctx.industry} industry
2. Use available data from finalJson when possible
3. Create professional, engaging content
4. Keep text concise and appropriate for web use
5. Use English for international businesses
6. Ensure content is relevant to user intent: "${userIntent || 'Create a professional website'}"

**Return Format:**
Return only a JSON object with the placeholder names (without brackets) as keys and the replacement content as values.

Example:
{
  "HERO_TITLE": "Welcome to Our Cafe",
  "HERO_SUBTITLE": "Experience the finest coffee in town",
  "CONTACT_PHONE": "02-123-4567"
}`;
  }

  /**
   * ตรวจสอบความถูกต้องของ template
   */
  static validateTemplate(template: string): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ตรวจสอบ placeholder ที่ไม่ได้ replace
    const unreplacedPlaceholders = template.match(/\[[A-Z0-9_]+\]/g);
    if (unreplacedPlaceholders) {
      warnings.push(`Unreplaced placeholders: ${unreplacedPlaceholders.join(', ')}`);
    }

    // ตรวจสอบ syntax errors
    if (template.includes('${undefined}')) {
      errors.push('Template contains undefined variables');
    }

    // ตรวจสอบ React component structure
    if (template.includes('.tsx') && !template.includes('import React')) {
      warnings.push('TSX file missing React import');
    }

    if (template.includes('.tsx') && !template.includes('export default')) {
      errors.push('TSX file missing export default');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Cache template สำหรับ performance
   */
  static getCachedTemplate(templateKey: string): string | null {
    return this.templateCache.get(templateKey) || null;
  }

  static cacheTemplate(templateKey: string, content: string): void {
    this.templateCache.set(templateKey, content);
  }

  // Default content generators based on industry
  private static getDefaultHeroTitle(industry: string): string {
    const titles: Record<string, string> = {
      'cafe': 'Artisan Coffee Experience',
      'restaurant': 'Fine Dining Experience',
      'ecommerce': 'Shop Quality Products',
      'portfolio': 'Creative Portfolio',
      'agency': 'Digital Solutions',
      'blog': 'Thoughts & Stories',
      'fashion': 'Style & Fashion',
      'technology': 'Innovation & Technology'
    };
    return titles[industry] || 'Welcome to Our Website';
  }

  private static getDefaultHeroSubtitle(industry: string): string {
    const subtitles: Record<string, string> = {
      'cafe': 'Discover the perfect blend of tradition and innovation',
      'restaurant': 'Experience culinary excellence in every dish',
      'ecommerce': 'Find the best products at great prices',
      'portfolio': 'Showcasing creative work and projects',
      'agency': 'Transforming ideas into digital reality',
      'blog': 'Sharing insights and experiences',
      'fashion': 'Express your unique style',
      'technology': 'Building the future with technology'
    };
    return subtitles[industry] || 'Discover what we offer';
  }

  private static getDefaultHeroDescription(industry: string): string {
    const descriptions: Record<string, string> = {
      'cafe': 'We serve premium coffee in a cozy atmosphere',
      'restaurant': 'Fresh ingredients, authentic flavors, exceptional service',
      'ecommerce': 'Quality products delivered to your doorstep',
      'portfolio': 'Creative solutions for modern challenges',
      'agency': 'Full-service digital marketing and development',
      'blog': 'Thoughtful content on various topics',
      'fashion': 'Trendy styles for every occasion',
      'technology': 'Cutting-edge solutions for businesses'
    };
    return descriptions[industry] || 'Professional services and solutions';
  }

  private static getDefaultPhone(industry: string): string {
    return '02-123-4567';
  }

  private static getDefaultEmail(industry: string): string {
    return 'info@example.com';
  }

  private static getDefaultAddress(industry: string): string {
    return '123 Main Street, Bangkok 10110';
  }

  private static getDefaultHours(industry: string): string {
    const hours: Record<string, string> = {
      'cafe': '7:00 - 22:00',
      'restaurant': '11:00 - 22:00',
      'ecommerce': '24/7 Online',
      'portfolio': '9:00 - 18:00',
      'agency': '9:00 - 18:00',
      'blog': '24/7 Available',
      'fashion': '10:00 - 20:00',
      'technology': '9:00 - 18:00'
    };
    return hours[industry] || '9:00 - 18:00';
  }

  private static getMenuButtonText(industry: string): string {
    const texts: Record<string, string> = {
      'cafe': 'View Menu',
      'restaurant': 'View Menu',
      'ecommerce': 'Shop Now',
      'portfolio': 'View Work',
      'agency': 'Our Services',
      'blog': 'Read More',
      'fashion': 'Shop Collection',
      'technology': 'Our Solutions'
    };
    return texts[industry] || 'Learn More';
  }

  private static getOrderButtonText(industry: string): string {
    const texts: Record<string, string> = {
      'cafe': 'Order Now',
      'restaurant': 'Make Reservation',
      'ecommerce': 'Add to Cart',
      'portfolio': 'Get Quote',
      'agency': 'Start Project',
      'blog': 'Subscribe',
      'fashion': 'Buy Now',
      'technology': 'Get Started'
    };
    return texts[industry] || 'Get Started';
  }

  private static getContactButtonText(industry: string): string {
    return 'Contact Us';
  }

  private static getLearnMoreText(industry: string): string {
    return 'Learn More';
  }

  private static getFeaturedTitle(industry: string): string {
    const titles: Record<string, string> = {
      'cafe': 'Featured Coffee',
      'restaurant': 'Featured Dishes',
      'ecommerce': 'Featured Products',
      'portfolio': 'Featured Work',
      'agency': 'Featured Services',
      'blog': 'Featured Posts',
      'fashion': 'Featured Collection',
      'technology': 'Featured Solutions'
    };
    return titles[industry] || 'Featured Items';
  }

  private static getAboutTitle(industry: string): string {
    return 'About Us';
  }

  private static getServicesTitle(industry: string): string {
    const titles: Record<string, string> = {
      'cafe': 'Our Services',
      'restaurant': 'Our Menu',
      'ecommerce': 'Our Products',
      'portfolio': 'Our Services',
      'agency': 'Our Services',
      'blog': 'Categories',
      'fashion': 'Collections',
      'technology': 'Our Solutions'
    };
    return titles[industry] || 'Our Services';
  }

  private static getDefaultMenuItem(industry: string, index: number): string {
    const items: Record<string, string[]> = {
      'cafe': ['Espresso', 'Cappuccino', 'Latte'],
      'restaurant': ['Signature Dish', 'Chef Special', 'Popular Choice'],
      'ecommerce': ['Product 1', 'Product 2', 'Product 3'],
      'portfolio': ['Project 1', 'Project 2', 'Project 3'],
      'agency': ['Service 1', 'Service 2', 'Service 3'],
      'blog': ['Post 1', 'Post 2', 'Post 3'],
      'fashion': ['Item 1', 'Item 2', 'Item 3'],
      'technology': ['Solution 1', 'Solution 2', 'Solution 3']
    };
    return items[industry]?.[index - 1] || `Item ${index}`;
  }

  private static getDefaultMenuItemDescription(industry: string, index: number): string {
    const descriptions: Record<string, string[]> = {
      'cafe': ['Rich and bold', 'Perfect balance', 'Smooth and creamy'],
      'restaurant': ['Delicious and fresh', 'Authentic flavors', 'Chef recommended'],
      'ecommerce': ['High quality', 'Great value', 'Popular choice'],
      'portfolio': ['Creative design', 'Modern approach', 'User focused'],
      'agency': ['Professional service', 'Expert solution', 'Quality work'],
      'blog': ['Interesting read', 'Valuable insights', 'Engaging content'],
      'fashion': ['Trendy style', 'Comfortable fit', 'Fashionable design'],
      'technology': ['Innovative solution', 'Reliable service', 'Advanced technology']
    };
    return descriptions[industry]?.[index - 1] || `Description for item ${index}`;
  }

  private static getDefaultMenuItemPrice(industry: string, index: number): string {
    const prices: Record<string, string[]> = {
      'cafe': ['฿80', '฿120', '฿140'],
      'restaurant': ['฿250', '฿350', '฿450'],
      'ecommerce': ['฿500', '฿800', '฿1200'],
      'portfolio': ['฿5000', '฿10000', '฿15000'],
      'agency': ['฿10000', '฿25000', '฿50000'],
      'blog': ['Free', 'Free', 'Free'],
      'fashion': ['฿800', '฿1200', '฿1800'],
      'technology': ['฿15000', '฿30000', '฿50000']
    };
    return prices[industry]?.[index - 1] || '฿100';
  }

  private static getFeatureTitle(industry: string, index: number): string {
    const features: Record<string, string[]> = {
      'cafe': ['Fresh Beans', 'Expert Baristas', 'Cozy Atmosphere'],
      'restaurant': ['Fresh Ingredients', 'Expert Chefs', 'Great Service'],
      'ecommerce': ['Fast Delivery', 'Quality Products', 'Great Prices'],
      'portfolio': ['Creative Design', 'Modern Approach', 'User Focused'],
      'agency': ['Expert Team', 'Quality Work', 'Fast Delivery'],
      'blog': ['Quality Content', 'Regular Updates', 'Engaging Stories'],
      'fashion': ['Trendy Styles', 'Quality Materials', 'Perfect Fit'],
      'technology': ['Innovation', 'Reliability', 'Support']
    };
    return features[industry]?.[index - 1] || `Feature ${index}`;
  }

  private static getFeatureDescription(industry: string, index: number): string {
    const descriptions: Record<string, string[]> = {
      'cafe': ['Premium coffee beans sourced daily', 'Trained professionals crafting perfect cups', 'Comfortable space for work and relaxation'],
      'restaurant': ['Locally sourced, fresh ingredients', 'Experienced chefs with passion', 'Friendly and attentive service'],
      'ecommerce': ['Quick and reliable delivery service', 'Carefully selected quality products', 'Competitive prices for value'],
      'portfolio': ['Creative and innovative design solutions', 'Modern and clean aesthetic approach', 'User-centered design philosophy'],
      'agency': ['Experienced and skilled team members', 'High-quality work and attention to detail', 'Fast turnaround times'],
      'blog': ['Well-researched and informative content', 'Regular updates with fresh perspectives', 'Engaging and relatable stories'],
      'fashion': ['Latest trends and fashionable styles', 'High-quality materials and construction', 'Perfect fit and comfort'],
      'technology': ['Cutting-edge innovative solutions', 'Reliable and stable technology', 'Comprehensive support and maintenance']
    };
    return descriptions[industry]?.[index - 1] || `Description for feature ${index}`;
  }
}
