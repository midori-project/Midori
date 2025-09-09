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
      .replace(/\[HERO_IMAGE_URL\]/g, heroInfo?.imageUrl || this.getDefaultHeroImage(ctx.industry))
      .replace(/\[HERO_IMAGE_ALT\]/g, heroInfo?.imageAlt || this.getDefaultHeroAlt(ctx.industry))
      .replace(/\[MENU_IMAGE_URL\]/g, this.getDefaultMenuImage(ctx.industry))
      .replace(/\[MENU_IMAGE_URL_1\]/g, this.getDefaultMenuImage(ctx.industry))
      .replace(/\[MENU_IMAGE_URL_2\]/g, this.getDefaultMenuImage(ctx.industry))
      .replace(/\[MENU_IMAGE_URL_3\]/g, this.getDefaultMenuImage(ctx.industry))
      .replace(/\[MENU_IMAGE_ALT\]/g, this.getDefaultMenuAlt(ctx.industry))
      .replace(/\[COFFEE_IMAGE_URL\]/g, this.getDefaultCoffeeImage(ctx.industry))
      .replace(/\[COFFEE_IMAGE_ALT\]/g, this.getDefaultCoffeeAlt(ctx.industry))
      .replace(/\[PRODUCT_IMAGE_URL\]/g, this.getDefaultProductImage(ctx.industry))
      .replace(/\[PRODUCT_IMAGE_ALT\]/g, this.getDefaultProductAlt(ctx.industry))
      .replace(/\[SERVICE_IMAGE_URL\]/g, this.getDefaultServiceImage(ctx.industry))
      .replace(/\[SERVICE_IMAGE_ALT\]/g, this.getDefaultServiceAlt(ctx.industry))
      .replace(/\[TEAM_IMAGE_URL\]/g, this.getDefaultTeamImage(ctx.industry))
      .replace(/\[TEAM_IMAGE_ALT\]/g, this.getDefaultTeamAlt(ctx.industry))
      .replace(/\[GALLERY_IMAGE_URL\]/g, this.getDefaultGalleryImage(ctx.industry))
      .replace(/\[GALLERY_IMAGE_ALT\]/g, this.getDefaultGalleryAlt(ctx.industry))

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
        // Skip image placeholders - let system handle them separately
        if (key === 'HERO_IMAGE_URL' || key === 'MENU_IMAGE_URL' || key === 'MENU_IMAGE_URL_1' || key === 'MENU_IMAGE_URL_2' || key === 'MENU_IMAGE_URL_3' || key === 'COFFEE_IMAGE_URL' || 
            key === 'PRODUCT_IMAGE_URL' || key === 'SERVICE_IMAGE_URL' || key === 'TEAM_IMAGE_URL' || key === 'GALLERY_IMAGE_URL') {
          continue;
        }
        if (aiReplacements[key]) {
          replacedTemplate = replacedTemplate.replace(new RegExp(`\\${placeholder}`, 'g'), aiReplacements[key]);
          appliedReplacements[key] = aiReplacements[key];
        }
      }

      // หากมีการขอรูป Hero ให้เรียก Images API เพื่อสร้างรูปและแทนที่
      const needHeroImage = placeholders.includes('[HERO_IMAGE_URL]');
      const needHeroAlt = placeholders.includes('[HERO_IMAGE_ALT]');
      if (needHeroImage) {
        try {
          const imageUrl = await this.generateHeroImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[HERO_IMAGE_URL\]/g, imageUrl);
            appliedReplacements['HERO_IMAGE_URL'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateHeroImage failed, will fallback to default image', e);
        }
      }
      if (needHeroAlt) {
        const alt = this.createHeroAlt(ctx, projectName);
        replacedTemplate = replacedTemplate.replace(/\[HERO_IMAGE_ALT\]/g, alt);
        appliedReplacements['HERO_IMAGE_ALT'] = alt;
      }

      // หากมีการขอรูปเมนู ให้เรียก Images API เพื่อสร้างรูปและแทนที่
      const needMenuImage = placeholders.includes('[MENU_IMAGE_URL]');
      const needMenuImage1 = placeholders.includes('[MENU_IMAGE_URL_1]');
      const needMenuImage2 = placeholders.includes('[MENU_IMAGE_URL_2]');
      const needMenuImage3 = placeholders.includes('[MENU_IMAGE_URL_3]');
      const needMenuAlt = placeholders.includes('[MENU_IMAGE_ALT]');
      
      if (needMenuImage) {
        try {
          const imageUrl = await this.generateMenuImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[MENU_IMAGE_URL\]/g, imageUrl);
            appliedReplacements['MENU_IMAGE_URL'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateMenuImage failed, will fallback to default image', e);
        }
      }
      
      if (needMenuImage1) {
        try {
          const imageUrl = await this.generateMenuImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[MENU_IMAGE_URL_1\]/g, imageUrl);
            appliedReplacements['MENU_IMAGE_URL_1'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateMenuImage1 failed, will fallback to default image', e);
        }
      }
      
      if (needMenuImage2) {
        try {
          const imageUrl = await this.generateMenuImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[MENU_IMAGE_URL_2\]/g, imageUrl);
            appliedReplacements['MENU_IMAGE_URL_2'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateMenuImage2 failed, will fallback to default image', e);
        }
      }
      
      if (needMenuImage3) {
        try {
          const imageUrl = await this.generateMenuImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[MENU_IMAGE_URL_3\]/g, imageUrl);
            appliedReplacements['MENU_IMAGE_URL_3'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateMenuImage3 failed, will fallback to default image', e);
        }
      }
      
      if (needMenuAlt) {
        const alt = this.createMenuAlt(ctx, projectName);
        replacedTemplate = replacedTemplate.replace(/\[MENU_IMAGE_ALT\]/g, alt);
        appliedReplacements['MENU_IMAGE_ALT'] = alt;
      }

      // หากมีการขอรูปกาแฟ ให้เรียก Images API เพื่อสร้างรูปและแทนที่
      const needCoffeeImage = placeholders.includes('[COFFEE_IMAGE_URL]');
      const needCoffeeAlt = placeholders.includes('[COFFEE_IMAGE_ALT]');
      if (needCoffeeImage) {
        try {
          const imageUrl = await this.generateCoffeeImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[COFFEE_IMAGE_URL\]/g, imageUrl);
            appliedReplacements['COFFEE_IMAGE_URL'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateCoffeeImage failed, will fallback to default image', e);
        }
      }
      if (needCoffeeAlt) {
        const alt = this.createCoffeeAlt(ctx, projectName);
        replacedTemplate = replacedTemplate.replace(/\[COFFEE_IMAGE_ALT\]/g, alt);
        appliedReplacements['COFFEE_IMAGE_ALT'] = alt;
      }

      // หากมีการขอรูปสินค้า ให้เรียก Images API เพื่อสร้างรูปและแทนที่
      const needProductImage = placeholders.includes('[PRODUCT_IMAGE_URL]');
      const needProductAlt = placeholders.includes('[PRODUCT_IMAGE_ALT]');
      if (needProductImage) {
        try {
          const imageUrl = await this.generateProductImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[PRODUCT_IMAGE_URL\]/g, imageUrl);
            appliedReplacements['PRODUCT_IMAGE_URL'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateProductImage failed, will fallback to default image', e);
        }
      }
      if (needProductAlt) {
        const alt = this.createProductAlt(ctx, projectName);
        replacedTemplate = replacedTemplate.replace(/\[PRODUCT_IMAGE_ALT\]/g, alt);
        appliedReplacements['PRODUCT_IMAGE_ALT'] = alt;
      }

      // หากมีการขอรูปบริการ ให้เรียก Images API เพื่อสร้างรูปและแทนที่
      const needServiceImage = placeholders.includes('[SERVICE_IMAGE_URL]');
      const needServiceAlt = placeholders.includes('[SERVICE_IMAGE_ALT]');
      if (needServiceImage) {
        try {
          const imageUrl = await this.generateServiceImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[SERVICE_IMAGE_URL\]/g, imageUrl);
            appliedReplacements['SERVICE_IMAGE_URL'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateServiceImage failed, will fallback to default image', e);
        }
      }
      if (needServiceAlt) {
        const alt = this.createServiceAlt(ctx, projectName);
        replacedTemplate = replacedTemplate.replace(/\[SERVICE_IMAGE_ALT\]/g, alt);
        appliedReplacements['SERVICE_IMAGE_ALT'] = alt;
      }

      // หากมีการขอรูปทีม ให้เรียก Images API เพื่อสร้างรูปและแทนที่
      const needTeamImage = placeholders.includes('[TEAM_IMAGE_URL]');
      const needTeamAlt = placeholders.includes('[TEAM_IMAGE_ALT]');
      if (needTeamImage) {
        try {
          const imageUrl = await this.generateTeamImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[TEAM_IMAGE_URL\]/g, imageUrl);
            appliedReplacements['TEAM_IMAGE_URL'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateTeamImage failed, will fallback to default image', e);
        }
      }
      if (needTeamAlt) {
        const alt = this.createTeamAlt(ctx, projectName);
        replacedTemplate = replacedTemplate.replace(/\[TEAM_IMAGE_ALT\]/g, alt);
        appliedReplacements['TEAM_IMAGE_ALT'] = alt;
      }

      // หากมีการขอรูปแกลเลอรี่ ให้เรียก Images API เพื่อสร้างรูปและแทนที่
      const needGalleryImage = placeholders.includes('[GALLERY_IMAGE_URL]');
      const needGalleryAlt = placeholders.includes('[GALLERY_IMAGE_ALT]');
      if (needGalleryImage) {
        try {
          const imageUrl = await this.generateGalleryImage(openai, ctx, projectName, userIntent, finalJson);
          if (imageUrl) {
            replacedTemplate = replacedTemplate.replace(/\[GALLERY_IMAGE_URL\]/g, imageUrl);
            appliedReplacements['GALLERY_IMAGE_URL'] = imageUrl;
          }
        } catch (e) {
          console.warn('[TemplateReplacer] generateGalleryImage failed, will fallback to default image', e);
        }
      }
      if (needGalleryAlt) {
        const alt = this.createGalleryAlt(ctx, projectName);
        replacedTemplate = replacedTemplate.replace(/\[GALLERY_IMAGE_ALT\]/g, alt);
        appliedReplacements['GALLERY_IMAGE_ALT'] = alt;
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
7. If placeholders contain HERO_IMAGE_ALT, provide a concise, descriptive alt text.
8. IMPORTANT: Do NOT replace image placeholders - leave them as [HERO_IMAGE_URL], [MENU_IMAGE_URL], [MENU_IMAGE_URL_1], [MENU_IMAGE_URL_2], [MENU_IMAGE_URL_3], [COFFEE_IMAGE_URL], [PRODUCT_IMAGE_URL], [SERVICE_IMAGE_URL], [TEAM_IMAGE_URL], [GALLERY_IMAGE_URL] for system processing.

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
   * สร้างรูปภาพสำหรับ Hero โดยใช้ OpenAI Images API
   */
  private static async generateHeroImage(
    openai: any,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string,
    finalJson?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const businessInfo = (finalJson?.business as any) || {};
      const projectInfo = (finalJson?.project as any) || {};
      const heroInfo = (finalJson?.hero as any) || {};

      const promptParts: string[] = [];
      promptParts.push(`Hero image for a ${ctx.industry} website`);
      if (projectName || projectInfo?.name || businessInfo?.name) {
        promptParts.push(`brand: ${projectName || projectInfo?.name || businessInfo?.name}`);
      }
      if (userIntent) {
        promptParts.push(`intent: ${userIntent}`);
      }
      if (heroInfo?.style) {
        promptParts.push(`style: ${heroInfo.style}`);
      }
      // เน้นภาพกว้างเหมาะกับ hero section
      promptParts.push('high quality, cinematic lighting, 16:9, website hero banner');

      const imagePrompt = promptParts.join(', ');

      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: imagePrompt,
        size: '1024x1024',
        // quality: 'standard',
        n: 1,
      });

      const url: string | undefined = response?.data?.[0]?.url;
      return url || null;
    } catch (error) {
      console.error('[TemplateReplacer] generateHeroImage error:', error);
      return null;
    }
  }

  /**
   * สร้าง alt text สำหรับรูป Hero
   */
  private static createHeroAlt(ctx: BusinessContext, projectName?: string): string {
    const business = ctx?.industry || 'business';
    const name = projectName || 'website';
    return `${name} ${business} hero image`;
  }

  /**
   * สร้างรูปเมนูอาหารผ่าน OpenAI Images API
   */
  private static async generateMenuImage(
    openai: any,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string,
    finalJson?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const businessInfo = (finalJson?.business as any) || {};
      const projectInfo = (finalJson?.project as any) || {};
      const menuInfo = (finalJson?.menu as any) || {};

      const promptParts: string[] = [];
      promptParts.push(`Delicious food dish for a ${ctx.industry} restaurant`);
      if (projectName || projectInfo?.name || businessInfo?.name) {
        promptParts.push(`restaurant: ${projectName || projectInfo?.name || businessInfo?.name}`);
      }
      if (menuInfo?.cuisine) {
        promptParts.push(`cuisine: ${menuInfo.cuisine}`);
      }
      if (menuInfo?.specialty) {
        promptParts.push(`specialty: ${menuInfo.specialty}`);
      }
      // เน้นภาพอาหารที่ดูน่าอร่อย
      promptParts.push('high quality, appetizing, professional food photography, restaurant menu item');

      const imagePrompt = promptParts.join(', ');

      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: imagePrompt,
        size: '1024x1024',
        // quality: 'hd',
        n: 1,
      });

      const url: string | undefined = response?.data?.[0]?.url;
      return url || null;
    } catch (error) {
      console.error('[TemplateReplacer] generateMenuImage error:', error);
      return null;
    }
  }

  /**
   * สร้างรูปกาแฟผ่าน OpenAI Images API
   */
  private static async generateCoffeeImage(
    openai: any,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string,
    finalJson?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const businessInfo = (finalJson?.business as any) || {};
      const projectInfo = (finalJson?.project as any) || {};
      const menuInfo = (finalJson?.menu as any) || {};

      const promptParts: string[] = [];
      promptParts.push(`Beautiful coffee drink for a ${ctx.industry} cafe`);
      if (projectName || projectInfo?.name || businessInfo?.name) {
        promptParts.push(`cafe: ${projectName || projectInfo?.name || businessInfo?.name}`);
      }
      if (menuInfo?.coffeeType) {
        promptParts.push(`coffee type: ${menuInfo.coffeeType}`);
      }
      if (menuInfo?.roast) {
        promptParts.push(`roast: ${menuInfo.roast}`);
      }
      // เน้นภาพกาแฟที่ดูน่าดื่ม
      promptParts.push('high quality, aromatic coffee, professional cafe photography, latte art');

      const imagePrompt = promptParts.join(', ');

      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: imagePrompt,
        size: '1024x1024',
        // quality: 'hd',
        n: 1,
      });

      const url: string | undefined = response?.data?.[0]?.url;
      return url || null;
    } catch (error) {
      console.error('[TemplateReplacer] generateCoffeeImage error:', error);
      return null;
    }
  }

  /**
   * สร้าง alt text สำหรับรูปเมนู
   */
  private static createMenuAlt(ctx: BusinessContext, projectName?: string): string {
    const business = ctx?.industry || 'restaurant';
    const name = projectName || 'restaurant';
    return `${name} delicious food menu item`;
  }

  /**
   * สร้าง alt text สำหรับรูปกาแฟ
   */
  private static createCoffeeAlt(ctx: BusinessContext, projectName?: string): string {
    const business = ctx?.industry || 'cafe';
    const name = projectName || 'cafe';
    return `${name} premium coffee drink`;
  }

  /**
   * สร้างรูปสินค้าผ่าน OpenAI Images API
   */
  private static async generateProductImage(
    openai: any,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string,
    finalJson?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const businessInfo = (finalJson?.business as any) || {};
      const projectInfo = (finalJson?.project as any) || {};
      const productInfo = (finalJson?.product as any) || {};

      const promptParts: string[] = [];
      promptParts.push(`High-quality product for a ${ctx.industry} business`);
      if (projectName || projectInfo?.name || businessInfo?.name) {
        promptParts.push(`brand: ${projectName || projectInfo?.name || businessInfo?.name}`);
      }
      if (productInfo?.category) {
        promptParts.push(`category: ${productInfo.category}`);
      }
      if (productInfo?.type) {
        promptParts.push(`type: ${productInfo.type}`);
      }
      // เน้นภาพสินค้าที่ดูน่าสนใจ
      promptParts.push('high quality, professional product photography, clean background, e-commerce style');

      const imagePrompt = promptParts.join(', ');

      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: imagePrompt,
        size: '1024x1024',
        // quality: 'hd',
        n: 1,
      });

      const url: string | undefined = response?.data?.[0]?.url;
      return url || null;
    } catch (error) {
      console.error('[TemplateReplacer] generateProductImage error:', error);
      return null;
    }
  }

  /**
   * สร้างรูปบริการผ่าน OpenAI Images API
   */
  private static async generateServiceImage(
    openai: any,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string,
    finalJson?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const businessInfo = (finalJson?.business as any) || {};
      const projectInfo = (finalJson?.project as any) || {};
      const serviceInfo = (finalJson?.service as any) || {};

      const promptParts: string[] = [];
      promptParts.push(`Professional service illustration for a ${ctx.industry} business`);
      if (projectName || projectInfo?.name || businessInfo?.name) {
        promptParts.push(`company: ${projectName || projectInfo?.name || businessInfo?.name}`);
      }
      if (serviceInfo?.type) {
        promptParts.push(`service type: ${serviceInfo.type}`);
      }
      if (serviceInfo?.category) {
        promptParts.push(`category: ${serviceInfo.category}`);
      }
      // เน้นภาพบริการที่ดูเป็นมืออาชีพ
      promptParts.push('high quality, professional business illustration, modern style, corporate');

      const imagePrompt = promptParts.join(', ');

      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: imagePrompt,
        size: '1024x1024',
        // quality: 'hd',
        n: 1,
      });

      const url: string | undefined = response?.data?.[0]?.url;
      return url || null;
    } catch (error) {
      console.error('[TemplateReplacer] generateServiceImage error:', error);
      return null;
    }
  }

  /**
   * สร้างรูปทีมผ่าน OpenAI Images API
   */
  private static async generateTeamImage(
    openai: any,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string,
    finalJson?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const businessInfo = (finalJson?.business as any) || {};
      const projectInfo = (finalJson?.project as any) || {};
      const teamInfo = (finalJson?.team as any) || {};

      const promptParts: string[] = [];
      promptParts.push(`Professional team photo for a ${ctx.industry} company`);
      if (projectName || projectInfo?.name || businessInfo?.name) {
        promptParts.push(`company: ${projectName || projectInfo?.name || businessInfo?.name}`);
      }
      if (teamInfo?.department) {
        promptParts.push(`department: ${teamInfo.department}`);
      }
      if (teamInfo?.role) {
        promptParts.push(`role: ${teamInfo.role}`);
      }
      // เน้นภาพทีมที่ดูเป็นมืออาชีพ
      promptParts.push('high quality, professional team photo, business attire, friendly atmosphere, corporate');

      const imagePrompt = promptParts.join(', ');

      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: imagePrompt,
        size: '1024x1024',
        // quality: 'hd',
        n: 1,
      });

      const url: string | undefined = response?.data?.[0]?.url;
      return url || null;
    } catch (error) {
      console.error('[TemplateReplacer] generateTeamImage error:', error);
      return null;
    }
  }

  /**
   * สร้างรูปแกลเลอรี่ผ่าน OpenAI Images API
   */
  private static async generateGalleryImage(
    openai: any,
    ctx: BusinessContext,
    projectName?: string,
    userIntent?: string,
    finalJson?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const businessInfo = (finalJson?.business as any) || {};
      const projectInfo = (finalJson?.project as any) || {};
      const galleryInfo = (finalJson?.gallery as any) || {};

      const promptParts: string[] = [];
      promptParts.push(`Beautiful gallery image for a ${ctx.industry} business`);
      if (projectName || projectInfo?.name || businessInfo?.name) {
        promptParts.push(`business: ${projectName || projectInfo?.name || businessInfo?.name}`);
      }
      if (galleryInfo?.category) {
        promptParts.push(`category: ${galleryInfo.category}`);
      }
      if (galleryInfo?.style) {
        promptParts.push(`style: ${galleryInfo.style}`);
      }
      // เน้นภาพแกลเลอรี่ที่ดูสวยงาม
      promptParts.push('high quality, artistic, visually appealing, portfolio style, professional photography');

      const imagePrompt = promptParts.join(', ');

      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: imagePrompt,
        size: '1024x1024',
        //quality: 'hd',
        n: 1,
      });

      const url: string | undefined = response?.data?.[0]?.url;
      return url || null;
    } catch (error) {
      console.error('[TemplateReplacer] generateGalleryImage error:', error);
      return null;
    }
  }

  /**
   * สร้าง alt text สำหรับรูปสินค้า
   */
  private static createProductAlt(ctx: BusinessContext, projectName?: string): string {
    const business = ctx?.industry || 'business';
    const name = projectName || 'business';
    return `${name} high-quality product`;
  }

  /**
   * สร้าง alt text สำหรับรูปบริการ
   */
  private static createServiceAlt(ctx: BusinessContext, projectName?: string): string {
    const business = ctx?.industry || 'business';
    const name = projectName || 'company';
    return `${name} professional service`;
  }

  /**
   * สร้าง alt text สำหรับรูปทีม
   */
  private static createTeamAlt(ctx: BusinessContext, projectName?: string): string {
    const business = ctx?.industry || 'business';
    const name = projectName || 'company';
    return `${name} professional team`;
  }

  /**
   * สร้าง alt text สำหรับรูปแกลเลอรี่
   */
  private static createGalleryAlt(ctx: BusinessContext, projectName?: string): string {
    const business = ctx?.industry || 'business';
    const name = projectName || 'business';
    return `${name} beautiful gallery image`;
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

  private static getDefaultHeroImage(industry: string): string {
    // ใช้รูปภาพพื้นฐานจาก public เป็นค่าเริ่มต้นที่ปลอดภัย
    return '/img/frame.png';
  }

  private static getDefaultHeroAlt(industry: string): string {
    return `${industry || 'business'} hero image`;
  }

  private static getDefaultMenuImage(industry: string): string {
    return '/img/frame.png'; // Default placeholder image
  }

  private static getDefaultMenuAlt(industry: string): string {
    return `Delicious ${industry} menu item`;
  }

  private static getDefaultCoffeeImage(industry: string): string {
    return '/img/frame.png'; // Default placeholder image
  }

  private static getDefaultCoffeeAlt(industry: string): string {
    return `Premium ${industry} coffee drink`;
  }

  private static getDefaultProductImage(industry: string): string {
    return '/img/frame.png'; // Default placeholder image
  }

  private static getDefaultProductAlt(industry: string): string {
    return `High-quality ${industry} product`;
  }

  private static getDefaultServiceImage(industry: string): string {
    return '/img/frame.png'; // Default placeholder image
  }

  private static getDefaultServiceAlt(industry: string): string {
    return `Professional ${industry} service`;
  }

  private static getDefaultTeamImage(industry: string): string {
    return '/img/frame.png'; // Default placeholder image
  }

  private static getDefaultTeamAlt(industry: string): string {
    return `Professional ${industry} team`;
  }

  private static getDefaultGalleryImage(industry: string): string {
    return '/img/frame.png'; // Default placeholder image
  }

  private static getDefaultGalleryAlt(industry: string): string {
    return `Beautiful ${industry} gallery image`;
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
