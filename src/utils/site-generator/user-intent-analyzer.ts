import { UserIntent, BusinessContext, ConversationContext } from './types';
import { openai } from './config';

// เพิ่ม interface สำหรับ Content Analysis
interface ContentAnalysis {
  businessName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  navigationItems: string[];
  callToActionText: string;
  tone: 'professional' | 'casual' | 'luxury' | 'friendly' | 'modern';
  language: 'thai' | 'english' | 'mixed';
  industrySpecificContent: {
    [key: string]: any;
  };
}

/**
 * User Intent Analyzer
 * Analyzes user intent and business context from conversation data using AI
 */
export class UserIntentAnalyzer {
  
  /**
   * Analyze user intent from conversation data using AI
   */
  static async analyzeUserIntent(finalJson: Record<string, unknown>): Promise<UserIntent> {
    const conversationText = JSON.stringify(finalJson).toLowerCase();
    const projectTypeRaw = (finalJson as any)?.type;
    const projectType = typeof projectTypeRaw === 'string' ? projectTypeRaw.toLowerCase() : '';
    console.log('[UserIntentAnalyzer] Using finalJson.type to determine intent:', projectTypeRaw);

    if (projectType) {
      return this.userIntentFromProjectType(projectType);
    }

    console.warn('[UserIntentAnalyzer] finalJson.type is missing. Falling back to keyword analysis.');
    return this.performKeywordAnalysis(conversationText);
  }

  /**
   * Map project type to a deterministic UserIntent (no AI)
   */
  private static userIntentFromProjectType(projectType: string): UserIntent {
    switch (projectType) {
      case 'blog':
        return {
          visualStyle: 'modern-minimal',
          colorScheme: 'blue-gray',
          layoutPreference: 'responsive-grid',
          features: ['blog', 'search'],
          pages: ['home', 'about', 'contact', 'articles', 'categories'],
          targetAudience: 'general-users',
          tone: 'professional-friendly',
          complexity: 'moderate',
        };
      case 'ecommerce':
      case 'e-commerce':
        return {
          visualStyle: 'professional-corporate',
          colorScheme: 'cool-blue-green',
          layoutPreference: 'responsive-grid',
          features: ['ecommerce', 'search', 'analytics'],
          pages: ['home', 'products', 'about', 'contact', 'pricing'],
          targetAudience: 'business-professionals',
          tone: 'professional-friendly',
          complexity: 'advanced-complex',
        };
      case 'portfolio':
        return {
          visualStyle: 'artistic-creative',
          colorScheme: 'neutral-beige-brown',
          layoutPreference: 'fullscreen-hero',
          features: ['gallery', 'contact'],
          pages: ['home', 'about', 'gallery', 'contact'],
          targetAudience: 'creative-professionals',
          tone: 'modern',
          complexity: 'minimal-clean',
        };
      case 'restaurant':
      case 'cafe':
        return {
          visualStyle: 'luxury-elegant',
          colorScheme: 'warm-orange-red',
          layoutPreference: 'fullscreen-hero',
          features: ['booking', 'gallery', 'contact'],
          pages: ['home', 'menu', 'reservation', 'about', 'contact'],
          targetAudience: 'general-users',
          tone: 'friendly',
          complexity: 'moderate',
        };
      case 'agency':
        return {
          visualStyle: 'professional-corporate',
          colorScheme: 'blue-gray',
          layoutPreference: 'responsive-grid',
          features: ['contact', 'analytics', 'blog'],
          pages: ['home', 'services', 'about', 'blog', 'contact'],
          targetAudience: 'business-professionals',
          tone: 'professional-friendly',
          complexity: 'moderate',
        };
      case 'technology':
      case 'fashion':
        return {
          visualStyle: projectType === 'fashion' ? 'luxury-elegant' : 'modern-minimal',
          colorScheme: projectType === 'fashion' ? 'bold-vibrant' : 'cool-blue-green',
          layoutPreference: 'responsive-grid',
          features: ['blog', 'contact'],
          pages: ['home', 'about', 'blog', 'contact'],
          targetAudience: 'young-adults',
          tone: 'modern',
          complexity: 'moderate',
        };
      default:
        return {
          visualStyle: 'modern-minimal',
          colorScheme: 'blue-gray',
          layoutPreference: 'responsive-grid',
          features: ['contact'],
          pages: ['home', 'about', 'contact'],
          targetAudience: 'general-users',
          tone: 'professional-friendly',
          complexity: 'moderate',
        };
    }
  }

  /**
   * Perform AI-powered analysis using OpenAI
   */
  private static async performAIAnalysis(conversationText: string): Promise<Partial<UserIntent>> {
    const prompt = `
คุณเป็นผู้เชี่ยวชาญในการวิเคราะห์ความต้องการของผู้ใช้สำหรับการออกแบบเว็บไซต์

โปรดวิเคราะห์ข้อความต่อไปนี้และส่งคืนผลลัพธ์เป็น JSON เท่านั้น:

**ข้อความที่ต้องวิเคราะห์:**
${conversationText}

**รูปแบบ JSON ที่ต้องการ:**
{
  "visualStyle": "modern-minimal|vintage-retro|luxury-elegant|playful-creative|professional-corporate|artistic-creative",
  "colorScheme": "blue-gray|warm-orange-red|cool-blue-green|neutral-beige-brown|bold-vibrant|monochrome-black-white",
  "layoutPreference": "responsive-grid|sidebar-navigation|fullscreen-hero|card-masonry|dashboard-panel",
  "features": ["array", "of", "features"],
  "pages": ["array", "of", "pages"],
  "targetAudience": "general-users|business-professionals|students-educators|creative-professionals|young-adults",
  "tone": "professional-friendly|casual-relaxed|formal-serious|playful-fun|luxury-premium",
  "complexity": "simple-basic|moderate|advanced-complex|minimal-clean"
}

**คำแนะนำในการวิเคราะห์:**
- วิเคราะห์จากบริบทและความหมาย ไม่ใช่แค่คำตรงๆ
- รองรับทั้งภาษาไทยและภาษาอังกฤษ
- ใช้ค่าที่เหมาะสมที่สุดสำหรับแต่ละ field
- สำหรับ features และ pages ให้เลือกเฉพาะที่เกี่ยวข้องจริงๆ
- ใช้ fallback values ถ้าไม่แน่ใจ

ตอบเป็น JSON เท่านั้น ไม่มีคำอธิบายเพิ่มเติม
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3, // ต่ำเพื่อความแม่นยำ
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI');
      }
      
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Perform keyword-based analysis as fallback
   */
  private static performKeywordAnalysis(conversationText: string): UserIntent {
    // วิเคราะห์ Visual Style
    let visualStyle = 'modern-minimal';
    if (conversationText.includes('vintage') || conversationText.includes('retro')) {
      visualStyle = 'vintage-retro';
    } else if (conversationText.includes('luxury') || conversationText.includes('premium')) {
      visualStyle = 'luxury-elegant';
    } else if (conversationText.includes('playful') || conversationText.includes('fun')) {
      visualStyle = 'playful-creative';
    } else if (conversationText.includes('professional') || conversationText.includes('corporate')) {
      visualStyle = 'professional-corporate';
    } else if (conversationText.includes('artistic') || conversationText.includes('creative')) {
      visualStyle = 'artistic-creative';
    }
    
    // วิเคราะห์ Color Scheme
    let colorScheme = 'blue-gray';
    if (conversationText.includes('warm') || conversationText.includes('orange') || conversationText.includes('red')) {
      colorScheme = 'warm-orange-red';
    } else if (conversationText.includes('cool') || conversationText.includes('blue') || conversationText.includes('green')) {
      colorScheme = 'cool-blue-green';
    } else if (conversationText.includes('neutral') || conversationText.includes('beige') || conversationText.includes('brown')) {
      colorScheme = 'neutral-beige-brown';
    } else if (conversationText.includes('bold') || conversationText.includes('vibrant') || conversationText.includes('colorful')) {
      colorScheme = 'bold-vibrant';
    } else if (conversationText.includes('monochrome') || conversationText.includes('black') || conversationText.includes('white')) {
      colorScheme = 'monochrome-black-white';
    }
    
    // วิเคราะห์ Layout Preference
    let layoutPreference = 'responsive-grid';
    if (conversationText.includes('sidebar') || conversationText.includes('navigation')) {
      layoutPreference = 'sidebar-navigation';
    } else if (conversationText.includes('fullscreen') || conversationText.includes('hero')) {
      layoutPreference = 'fullscreen-hero';
    } else if (conversationText.includes('card') || conversationText.includes('masonry')) {
      layoutPreference = 'card-masonry';
    } else if (conversationText.includes('dashboard') || conversationText.includes('panel')) {
      layoutPreference = 'dashboard-panel';
    }
    
    // วิเคราะห์ Features
    const features: string[] = [];
    const featureKeywords = {
      'authentication': ['login', 'register', 'auth', 'signin', 'signup'],
      'search': ['search', 'filter', 'find', 'query'],
      'gallery': ['gallery', 'portfolio', 'showcase', 'images'],
      'booking': ['booking', 'reservation', 'appointment', 'schedule'],
      'ecommerce': ['shop', 'store', 'buy', 'cart', 'checkout'],
      'blog': ['blog', 'article', 'post', 'content'],
      'contact': ['contact', 'form', 'message', 'inquiry'],
      'social': ['social', 'share', 'comment', 'like'],
      'analytics': ['analytics', 'stats', 'metrics', 'dashboard'],
      'notification': ['notification', 'alert', 'message', 'reminder']
    };
    
    for (const [feature, keywords] of Object.entries(featureKeywords)) {
      if (keywords.some(keyword => conversationText.includes(keyword))) {
        features.push(feature);
      }
    }
    
    // วิเคราะห์ Pages
    const pages: string[] = [];
    const pageKeywords = {
      'home': ['home', 'หน้าแรก', 'main'],
      'about': ['about', 'เกี่ยวกับ', 'story'],
      'contact': ['contact', 'ติดต่อ', 'reach'],
      'services': ['services', 'บริการ', 'offerings'],
      'products': ['products', 'สินค้า', 'items'],
      'gallery': ['gallery', 'แกลเลอรี่', 'portfolio'],
      'blog': ['blog', 'บล็อก', 'articles'],
      'pricing': ['pricing', 'ราคา', 'plans'],
      'faq': ['faq', 'คำถาม', 'help'],
      'team': ['team', 'ทีม', 'staff']
    };
    
    for (const [page, keywords] of Object.entries(pageKeywords)) {
      if (keywords.some(keyword => conversationText.includes(keyword))) {
        pages.push(page);
      }
    }
    
    // วิเคราะห์ Target Audience
    let targetAudience = 'general-users';
    if (conversationText.includes('business') || conversationText.includes('corporate')) {
      targetAudience = 'business-professionals';
    } else if (conversationText.includes('student') || conversationText.includes('education')) {
      targetAudience = 'students-educators';
    } else if (conversationText.includes('creative') || conversationText.includes('artist')) {
      targetAudience = 'creative-professionals';
    } else if (conversationText.includes('young') || conversationText.includes('millennial')) {
      targetAudience = 'young-adults';
    }
    
    // วิเคราะห์ Tone
    let tone = 'professional-friendly';
    if (conversationText.includes('casual') || conversationText.includes('relaxed')) {
      tone = 'casual-relaxed';
    } else if (conversationText.includes('formal') || conversationText.includes('serious')) {
      tone = 'formal-serious';
    } else if (conversationText.includes('playful') || conversationText.includes('fun')) {
      tone = 'playful-fun';
    } else if (conversationText.includes('luxury') || conversationText.includes('premium')) {
      tone = 'luxury-premium';
    }
    
    // วิเคราะห์ Complexity
    let complexity = 'moderate';
    if (conversationText.includes('simple') || conversationText.includes('basic')) {
      complexity = 'simple-basic';
    } else if (conversationText.includes('advanced') || conversationText.includes('complex')) {
      complexity = 'advanced-complex';
    } else if (conversationText.includes('minimal') || conversationText.includes('clean')) {
      complexity = 'minimal-clean';
    }
    
    return {
      visualStyle,
      colorScheme,
      layoutPreference,
      features: features.length > 0 ? features : ['responsive-design', 'modern-ui'],
      pages: pages.length > 0 ? pages : ['home', 'about', 'contact'],
      targetAudience,
      tone,
      complexity
    };
  }

  /**
   * Merge AI analysis with keyword analysis
   */
  private static mergeAnalysis(aiAnalysis: Partial<UserIntent>, keywordAnalysis: UserIntent): UserIntent {
    return {
      visualStyle: aiAnalysis.visualStyle || keywordAnalysis.visualStyle,
      colorScheme: aiAnalysis.colorScheme || keywordAnalysis.colorScheme,
      layoutPreference: aiAnalysis.layoutPreference || keywordAnalysis.layoutPreference,
      features: aiAnalysis.features && aiAnalysis.features.length > 0 
        ? aiAnalysis.features 
        : keywordAnalysis.features,
      pages: aiAnalysis.pages && aiAnalysis.pages.length > 0 
        ? aiAnalysis.pages 
        : keywordAnalysis.pages,
      targetAudience: aiAnalysis.targetAudience || keywordAnalysis.targetAudience,
      tone: aiAnalysis.tone || keywordAnalysis.tone,
      complexity: aiAnalysis.complexity || keywordAnalysis.complexity
    };
  }

  /**
   * Analyze business context from conversation data using AI
   */
  static async analyzeBusinessContext(finalJson: Record<string, unknown>): Promise<BusinessContext> {
    const projectInfo = (finalJson as any)?.project;
    const typeFromRoot = ((finalJson as any)?.type || (finalJson as any)?.Type) as string | undefined;
    const typeFromProject = (projectInfo?.type || projectInfo?.Type) as string | undefined;
    const targetAudienceRaw = ((finalJson as any)?.targetAudience || (finalJson as any)?.TargetAudience) as string[] | string | undefined;

    console.log('🤖 Starting AI Business Context Analysis:', {
      projectType: typeFromProject,
      projectGoal: projectInfo?.goal,
      projectName: projectInfo?.name,
      projectDescription: projectInfo?.description,
      targetAudience: targetAudienceRaw
    });

    try {
      const normalizedTargetAudience = Array.isArray(targetAudienceRaw) ? targetAudienceRaw : (targetAudienceRaw ? [String(targetAudienceRaw)] : []);
      const analysisText = this.buildAnalysisText(projectInfo, normalizedTargetAudience, (finalJson as any)?.features as any[], (finalJson as any)?.userIntent as string);
      const aiAnalysis = await this.performAIBusinessAnalysis(analysisText);
      const result = this.buildBusinessContext(aiAnalysis, projectInfo, normalizedTargetAudience, (finalJson as any)?.features as any[]);

      if (!result.industry || result.industry === 'default') {
        const fallbackIndustry = (typeFromRoot || typeFromProject || 'default').toLowerCase();
        result.industry = fallbackIndustry;
      }

      console.log('✅ AI Business Context Result:', result);
      return result;
    } catch (error) {
      console.warn('⚠️ AI analysis failed, using fallback:', error);
      const normalizedTargetAudience = Array.isArray(targetAudienceRaw) ? targetAudienceRaw : (targetAudienceRaw ? [String(targetAudienceRaw)] : []);
      const fallbackResult = this.performFallbackAnalysis(projectInfo, normalizedTargetAudience, (finalJson as any)?.features as any[]);
      const fallbackIndustry = (typeFromRoot || typeFromProject);
      if (fallbackIndustry) fallbackResult.industry = fallbackIndustry.toLowerCase();
      console.log('✅ Fallback Business Context Result:', fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Perform AI-powered business context analysis
   */
  private static async performAIBusinessAnalysis(conversationText: string): Promise<Partial<BusinessContext>> {
    const prompt = `
คุณเป็นผู้เชี่ยวชาญในการวิเคราะห์บริบทธุรกิจจากข้อมูลการสนทนา

โปรดวิเคราะห์ข้อความต่อไปนี้และส่งคืนผลลัพธ์เป็น JSON เท่านั้น:

**ข้อความที่ต้องวิเคราะห์:**
${conversationText}

**รูปแบบ JSON ที่ต้องการ:**
{
  "industry": "default|blog|restaurant|cafe|fashion|technology|ecommerce|portfolio|agency",
  "specificNiche": "general-business|content-blog|cms-blog|social-blog|fine-dining|casual-dining|fast-food|specialty-coffee|organic-cafe|coffee-roastery|luxury-fashion|vintage-clothing|sustainable-fashion|tech-startup|software-company|full-ecommerce|product-showcase|creative-agency|marketing-agency",
  "targetAudience": "general-public|students|professionals|families|young-adults|business-owners|tech-savvy-users",
  "businessModel": "b2c|b2b|subscription|marketplace",
  "keyDifferentiators": ["array", "of", "differentiators"]
}

**คำแนะนำในการวิเคราะห์:**
- วิเคราะห์จากบริบทและความหมาย
- รองรับทั้งภาษาไทยและภาษาอังกฤษ
- เลือก industry ที่เหมาะสมที่สุดจากรายการที่กำหนด
- ระบุ niche ที่เฉพาะเจาะจงตาม industry
- ระบุ business model ที่เหมาะสม
- ระบุจุดเด่นที่สำคัญ

**เกณฑ์การเลือก Industry:**
- blog: สำหรับเว็บไซต์บทความ, บล็อก, ข่าวสาร, content creation
- restaurant: สำหรับร้านอาหาร, ภัตตาคาร, ครัว, เมนูอาหาร
- cafe: สำหรับคาเฟ่, ร้านกาแฟ, coffee shop, barista
- fashion: สำหรับแฟชั่น, เสื้อผ้า, clothing store, boutique
- technology: สำหรับบริษัทเทคโนโลยี, software, app development, IT
- ecommerce: สำหรับร้านค้าออนไลน์, online store, marketplace, retail
- portfolio: สำหรับ personal website, portfolio, resume, showcase
- agency: สำหรับเอเจนซี่, marketing, advertising, creative services
- default: สำหรับเว็บไซต์ทั่วไปที่ไม่ตรงกับหมวดหมู่ข้างต้น

ตอบเป็น JSON เท่านั้น ไม่มีคำอธิบายเพิ่มเติม
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI');
      }
      
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI business response:', parseError);
      throw new Error('Invalid AI business response format');
    }
  }

  /**
   * Build analysis text from project data
   */
  private static buildAnalysisText(
    projectInfo: any, 
    targetAudience: string[], 
    features: any[], 
    userIntent?: string
  ): string {
    const parts = [];
    
    if (projectInfo?.name) parts.push(`Project Name: ${projectInfo.name}`);
    if (projectInfo?.type) parts.push(`Project Type: ${projectInfo.type}`);
    if (projectInfo?.goal) parts.push(`Project Goal: ${projectInfo.goal}`);
    if (projectInfo?.description) parts.push(`Description: ${projectInfo.description}`);
    if (userIntent) parts.push(`User Intent: ${userIntent}`);
    if (targetAudience && targetAudience.length > 0) {
      parts.push(`Target Audience: ${targetAudience.join(', ')}`);
    }
    if (features && features.length > 0) {
      const featureNames = features.map(f => f.name || f).join(', ');
      parts.push(`Features: ${featureNames}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Build business context from AI analysis
   */
  private static buildBusinessContext(
    aiAnalysis: Partial<BusinessContext>,
    projectInfo: any,
    targetAudience: string[],
    features: any[]
  ): BusinessContext {
    return {
      industry: aiAnalysis.industry || 'default',
      specificNiche: aiAnalysis.specificNiche || 'general-business',
      targetAudience: aiAnalysis.targetAudience || (targetAudience?.join(', ') || 'general-public'),
      businessModel: aiAnalysis.businessModel || 'b2c',
      keyDifferentiators: aiAnalysis.keyDifferentiators || []
    };
  }

  /**
   * Fallback analysis using keyword matching
   */
  private static performFallbackAnalysis(
    projectInfo: any,
    targetAudience: string[],
    features: any[]
  ): BusinessContext {
    console.log('🔄 Using fallback keyword analysis');
    
    const projectType = projectInfo?.type?.toLowerCase() || '';
    const projectGoal = projectInfo?.goal?.toLowerCase() || '';
    const projectName = projectInfo?.name?.toLowerCase() || '';
    const projectDescription = projectInfo?.description?.toLowerCase() || '';
    
    const combinedText = `${projectType} ${projectGoal} ${projectName} ${projectDescription}`.toLowerCase();
    
    let industry = 'default';
    
    if (this.matchesKeywords(combinedText, ['blog', 'บทความ', 'เขียน', 'แชร์', 'content', 'article', 'post', 'news'])) {
      industry = 'blog';
    } else if (this.matchesKeywords(combinedText, ['restaurant', 'ร้านอาหาร', 'อาหาร', 'food', 'dining', 'chef', 'menu', 'เมนู'])) {
      industry = 'restaurant';
    } else if (this.matchesKeywords(combinedText, ['cafe', 'คาเฟ่', 'กาแฟ', 'coffee', 'coffee shop', 'espresso', 'latte'])) {
      industry = 'cafe';
    } else if (this.matchesKeywords(combinedText, ['fashion', 'แฟชั่น', 'เสื้อผ้า', 'clothing', 'apparel', 'style', 'trend'])) {
      industry = 'fashion';
    } else if (this.matchesKeywords(combinedText, ['ecommerce', 'e-commerce', 'online store', 'shop', 'store', 'retail', 'selling', 'ขาย', 'ร้านค้า'])) {
      industry = 'ecommerce';
    } else if (this.matchesKeywords(combinedText, ['portfolio', 'personal', 'profile', 'work', 'projects', 'showcase', 'ผลงาน', 'ประวัติ'])) {
      industry = 'portfolio';
    } else if (this.matchesKeywords(combinedText, ['agency', 'marketing', 'advertising', 'branding', 'design', 'creative', 'เอเจนซี่', 'การตลาด'])) {
      industry = 'agency';
    } else if (this.matchesKeywords(combinedText, ['technology', 'tech', 'software', 'app', 'development', 'programming', 'เทคโนโลยี', 'ซอฟต์แวร์'])) {
      industry = 'technology';
    }
    
    return {
      industry,
      specificNiche: 'general-business',
      targetAudience: targetAudience?.join(', ') || 'general-public',
      businessModel: 'b2c',
      keyDifferentiators: []
    };
  }

  /**
   * Check if text matches any keywords
   */
  private static matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Perform keyword-based business context analysis
   */
  private static performKeywordBusinessAnalysis(conversationText: string): BusinessContext {
    // วิเคราะห์ Industry
    let industry = 'general';
    if (conversationText.includes('กาแฟ') || conversationText.includes('coffee') || conversationText.includes('คาเฟ่')) {
      industry = 'cafe';
    } else if (conversationText.includes('ร้านอาหาร') || conversationText.includes('restaurant') || conversationText.includes('food')) {
      industry = 'restaurant';
    } else if (conversationText.includes('เสื้อผ้า') || conversationText.includes('fashion') || conversationText.includes('clothing')) {
      industry = 'fashion';
    } else if (conversationText.includes('เทคโนโลยี') || conversationText.includes('tech') || conversationText.includes('software')) {
      industry = 'technology';
    } else if (conversationText.includes('การศึกษา') || conversationText.includes('education') || conversationText.includes('course')) {
      industry = 'education';
    } else if (conversationText.includes('สุขภาพ') || conversationText.includes('health') || conversationText.includes('clinic')) {
      industry = 'healthcare';
    }
    
    // วิเคราะห์ Specific Niche
    let specificNiche = 'general-business';
    if (industry === 'cafe') {
      if (conversationText.includes('specialty') || conversationText.includes('พิเศษ')) specificNiche = 'specialty-coffee';
      else if (conversationText.includes('organic') || conversationText.includes('อินทรีย์')) specificNiche = 'organic-cafe';
      else if (conversationText.includes('roastery') || conversationText.includes('คั่ว')) specificNiche = 'coffee-roastery';
    } else if (industry === 'fashion') {
      if (conversationText.includes('luxury') || conversationText.includes('หรู')) specificNiche = 'luxury-fashion';
      else if (conversationText.includes('vintage') || conversationText.includes('เก่า')) specificNiche = 'vintage-clothing';
      else if (conversationText.includes('sustainable') || conversationText.includes('ยั่งยืน')) specificNiche = 'sustainable-fashion';
    }
    
    // วิเคราะห์ Target Audience
    let targetAudience = 'general-public';
    if (conversationText.includes('นักเรียน') || conversationText.includes('student')) targetAudience = 'students';
    else if (conversationText.includes('professional') || conversationText.includes('มืออาชีพ')) targetAudience = 'professionals';
    else if (conversationText.includes('family') || conversationText.includes('ครอบครัว')) targetAudience = 'families';
    else if (conversationText.includes('young') || conversationText.includes('วัยรุ่น')) targetAudience = 'young-adults';
    
    // วิเคราะห์ Business Model
    let businessModel = 'b2c';
    if (conversationText.includes('b2b') || conversationText.includes('ธุรกิจ')) businessModel = 'b2b';
    else if (conversationText.includes('subscription') || conversationText.includes('สมาชิก')) businessModel = 'subscription';
    else if (conversationText.includes('marketplace') || conversationText.includes('ตลาดกลาง')) businessModel = 'marketplace';
    
    // วิเคราะห์ Key Differentiators
    const keyDifferentiators: string[] = [];
    if (conversationText.includes('ai') || conversationText.includes('artificial intelligence')) {
      keyDifferentiators.push('ai-powered');
    }
    if (conversationText.includes('mobile') || conversationText.includes('มือถือ')) {
      keyDifferentiators.push('mobile-first');
    }
    if (conversationText.includes('realtime') || conversationText.includes('เรียลไทม์')) {
      keyDifferentiators.push('real-time');
    }
    if (conversationText.includes('social') || conversationText.includes('สังคม')) {
      keyDifferentiators.push('social-features');
    }
    
    return {
      industry,
      specificNiche,
      targetAudience,
      businessModel,
      keyDifferentiators
    };
  }

  /**
   * Merge AI business analysis with keyword analysis
   */
  private static mergeBusinessAnalysis(aiAnalysis: Partial<BusinessContext>, keywordAnalysis: BusinessContext): BusinessContext {
    return {
      industry: aiAnalysis.industry || keywordAnalysis.industry,
      specificNiche: aiAnalysis.specificNiche || keywordAnalysis.specificNiche,
      targetAudience: aiAnalysis.targetAudience || keywordAnalysis.targetAudience,
      businessModel: aiAnalysis.businessModel || keywordAnalysis.businessModel,
      keyDifferentiators: aiAnalysis.keyDifferentiators && aiAnalysis.keyDifferentiators.length > 0
        ? aiAnalysis.keyDifferentiators
        : keywordAnalysis.keyDifferentiators
    };
  }

  /**
   * Analyze conversation context for better code generation using AI
   */
  static async analyzeConversationContext(finalJson: Record<string, unknown>): Promise<ConversationContext> {
    const conversationText = JSON.stringify(finalJson).toLowerCase();
    
    try {
      const aiAnalysis = await this.performAIConversationAnalysis(conversationText);
      const keywordAnalysis = this.performKeywordConversationAnalysis(conversationText);
      
      return this.mergeConversationAnalysis(aiAnalysis, keywordAnalysis);
    } catch (error) {
      console.warn('AI conversation analysis failed, falling back to keyword analysis:', error);
      return this.performKeywordConversationAnalysis(conversationText);
    }
  }

  /**
   * Perform AI-powered conversation context analysis
   */
  private static async performAIConversationAnalysis(conversationText: string): Promise<Partial<ConversationContext>> {
    const prompt = `
คุณเป็นผู้เชี่ยวชาญในการวิเคราะห์บริบทการสนทนาสำหรับการสร้างเว็บไซต์

โปรดวิเคราะห์ข้อความต่อไปนี้และส่งคืนผลลัพธ์เป็น JSON เท่านั้น:

**ข้อความที่ต้องวิเคราะห์:**
${conversationText}

**รูปแบบ JSON ที่ต้องการ:**
{
  "businessType": "general-business|specialty-coffee-shop|fine-dining-restaurant|luxury-fashion-boutique|tech-startup|online-education|healthcare-clinic|fitness-studio|consulting-firm|creative-agency",
  "userIntent": "general-website|online-sales|professional-showcase|content-publishing|service-booking|community-building",
  "specificRequirements": ["array", "of", "requirements"],
  "industryKeywords": ["array", "of", "keywords"],
  "targetMarket": "general-consumer|business-clients|premium-customers|young-adults|professionals"
}

**คำแนะนำในการวิเคราะห์:**
- ระบุ business type ที่เฉพาะเจาะจง
- ระบุ user intent ที่ชัดเจน
- ระบุ requirements ที่สำคัญ
- ระบุ keywords ที่เกี่ยวข้องกับอุตสาหกรรม
- ระบุ target market ที่เหมาะสม

ตอบเป็น JSON เท่านั้น ไม่มีคำอธิบายเพิ่มเติม
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: "json_object" }
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from AI');
      }
      
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI conversation response:', parseError);
      throw new Error('Invalid AI conversation response format');
    }
  }

  /**
   * Perform keyword-based conversation context analysis
   */
  private static performKeywordConversationAnalysis(conversationText: string): ConversationContext {
    // วิเคราะห์ Business Type
    let businessType = 'general-business';
    const businessPatterns = {
      'specialty-coffee-shop': ['specialty coffee', 'artisan', 'third wave', 'single origin', 'cupping'],
      'fine-dining-restaurant': ['fine dining', 'michelin', 'chef', 'tasting menu', 'wine pairing'],
      'luxury-fashion-boutique': ['luxury fashion', 'haute couture', 'designer', 'exclusive', 'premium'],
      'tech-startup': ['startup', 'saas', 'mvp', 'funding', 'venture capital', 'disruption'],
      'online-education': ['online course', 'e-learning', 'certification', 'skill development'],
      'healthcare-clinic': ['clinic', 'medical', 'appointment', 'doctor', 'patient', 'healthcare'],
      'fitness-studio': ['fitness', 'yoga', 'personal training', 'workout', 'gym'],
      'consulting-firm': ['consulting', 'advisory', 'strategy', 'business consulting'],
      'creative-agency': ['creative agency', 'design', 'branding', 'marketing', 'advertising']
    };
    
    for (const [type, keywords] of Object.entries(businessPatterns)) {
      if (keywords.some(keyword => conversationText.includes(keyword))) {
        businessType = type;
        break;
      }
    }
    
    // วิเคราะห์ User Intent
    let userIntent = 'general-website';
    if (conversationText.includes('sell online') || conversationText.includes('e-commerce')) {
      userIntent = 'online-sales';
    } else if (conversationText.includes('portfolio') || conversationText.includes('showcase')) {
      userIntent = 'professional-showcase';
    } else if (conversationText.includes('blog') || conversationText.includes('content')) {
      userIntent = 'content-publishing';
    } else if (conversationText.includes('appointment') || conversationText.includes('booking')) {
      userIntent = 'service-booking';
    } else if (conversationText.includes('community') || conversationText.includes('social')) {
      userIntent = 'community-building';
    }
    
    // วิเคราะห์ Specific Requirements
    const specificRequirements: string[] = [];
    const requirementPatterns = {
      'payment-processing': ['payment', 'checkout', 'stripe', 'paypal'],
      'user-authentication': ['login', 'register', 'account', 'profile'],
      'content-management': ['cms', 'admin', 'manage content', 'edit'],
      'real-time-features': ['real-time', 'live', 'instant', 'notification'],
      'mobile-optimization': ['mobile', 'responsive', 'touch', 'ios', 'android'],
      'search-functionality': ['search', 'filter', 'find', 'query'],
      'social-integration': ['social', 'share', 'facebook', 'twitter', 'instagram'],
      'analytics-tracking': ['analytics', 'tracking', 'metrics', 'reporting']
    };
    
    for (const [requirement, keywords] of Object.entries(requirementPatterns)) {
      if (keywords.some(keyword => conversationText.includes(keyword))) {
        specificRequirements.push(requirement);
      }
    }
    
    // วิเคราะห์ Industry Keywords
    const industryKeywords: string[] = [];
    const text = conversationText;
    const wordMatches = text.match(/\b\w{4,}\b/g) || [];
    const relevantWords = wordMatches
      .filter(word => word.length >= 4)
      .filter(word => !['that', 'this', 'with', 'have', 'will', 'from', 'they', 'been', 'were'].includes(word))
      .slice(0, 10);
    industryKeywords.push(...relevantWords);
    
    // วิเคราะห์ Target Market
    let targetMarket = 'general-consumer';
    if (conversationText.includes('b2b') || conversationText.includes('business')) {
      targetMarket = 'business-clients';
    } else if (conversationText.includes('premium') || conversationText.includes('luxury')) {
      targetMarket = 'premium-customers';
    } else if (conversationText.includes('young') || conversationText.includes('millennial')) {
      targetMarket = 'young-adults';
    } else if (conversationText.includes('professional') || conversationText.includes('corporate')) {
      targetMarket = 'professionals';
    }
    
    return {
      businessType,
      userIntent,
      specificRequirements,
      industryKeywords,
      targetMarket
    };
  }

  /**
   * Merge AI conversation analysis with keyword analysis
   */
  private static mergeConversationAnalysis(aiAnalysis: Partial<ConversationContext>, keywordAnalysis: ConversationContext): ConversationContext {
    return {
      businessType: aiAnalysis.businessType || keywordAnalysis.businessType,
      userIntent: aiAnalysis.userIntent || keywordAnalysis.userIntent,
      specificRequirements: aiAnalysis.specificRequirements && aiAnalysis.specificRequirements.length > 0
        ? aiAnalysis.specificRequirements
        : keywordAnalysis.specificRequirements,
      industryKeywords: aiAnalysis.industryKeywords && aiAnalysis.industryKeywords.length > 0
        ? aiAnalysis.industryKeywords
        : keywordAnalysis.industryKeywords,
      targetMarket: aiAnalysis.targetMarket || keywordAnalysis.targetMarket
    };
  }

  /**
   * Get appropriate temperature for user intent
   */
  static getTemperatureForUserIntent(userIntent: UserIntent): number {
    // ใช้ temperature ที่สูงขึ้นสำหรับ creative styles
    switch (userIntent.visualStyle) {
      case 'playful-creative':
      case 'artistic-creative':
        return 0.9; // สูงสุดสำหรับ creative content
      case 'luxury-elegant':
      case 'vintage-retro':
        return 0.8; // สูงสำหรับ unique styles
      case 'professional-corporate':
        return 0.6; // ปานกลางสำหรับ professional
      case 'modern-minimal':
      default:
        return 0.7; // ปกติ
    }
  }

  /**
   * วิเคราะห์และสร้างเนื้อหาที่เหมาะสมสำหรับแต่ละ preset
   */
  static async analyzeContentForPreset(
    finalJson: Record<string, unknown>, 
    businessContext: BusinessContext
  ): Promise<ContentAnalysis> {
    const projectInfo = finalJson.project as any;
    const features = finalJson.features as any[];
    
    console.log('🎯 Analyzing content for preset:', businessContext.industry);
    console.log('📋 Project Info:', {
      name: projectInfo?.name,
      type: projectInfo?.type,
      goal: projectInfo?.goal
    });
    console.log('🏢 Business Context:', businessContext);
    
    // วิเคราะห์ Business Name
    const businessName = projectInfo?.name || this.generateBusinessName(businessContext);
    console.log('🏷️ Generated Business Name:', businessName);
    
    // วิเคราะห์ Tagline
    const tagline = this.generateTagline(businessContext, projectInfo);
    console.log('💬 Generated Tagline:', tagline);
    
    // วิเคราะห์ Hero Content
    const heroContent = this.generateHeroContent(businessContext, projectInfo);
    console.log('🎨 Generated Hero Content:', heroContent);
    
    // วิเคราะห์ About Text
    const aboutText = this.generateAboutText(businessContext, projectInfo);
    console.log('📝 Generated About Text (first 100 chars):', aboutText.substring(0, 100) + '...');
    
    // วิเคราะห์ Navigation Items
    const navigationItems = this.generateNavigationItems(businessContext);
    console.log('🧭 Generated Navigation Items:', navigationItems);
    
    // วิเคราะห์ Tone และ Language
    const tone = this.analyzeTone(finalJson);
    const language = this.analyzeLanguage(finalJson);
    console.log('🎭 Analyzed Tone:', tone);
    console.log('🌐 Analyzed Language:', language);
    
    // วิเคราะห์ Industry Specific Content
    const industrySpecificContent = this.generateIndustrySpecificContent(businessContext, features);
    console.log('🏭 Generated Industry Specific Content:', industrySpecificContent);
    
    const result = {
      businessName,
      tagline,
      heroTitle: heroContent.title,
      heroSubtitle: heroContent.subtitle,
      aboutText,
      contactInfo: this.generateContactInfo(businessContext),
      navigationItems,
      callToActionText: this.generateCallToAction(businessContext),
      tone,
      language,
      industrySpecificContent
    };
    
    console.log('✅ Content Analysis Complete:', {
      businessName: result.businessName,
      tagline: result.tagline,
      heroTitle: result.heroTitle,
      tone: result.tone,
      language: result.language,
      navigationItems: result.navigationItems
    });
    
    return result;
  }

  /**
   * สร้าง Business Name ที่เหมาะสม
   */
  private static generateBusinessName(businessContext: BusinessContext): string {
    const { industry, specificNiche } = businessContext;
    
    const nameTemplates = {
      blog: ['Tech Blog', 'Creative Thoughts', 'Digital Stories', 'Content Hub', 'Knowledge Base'],
      restaurant: ['Bella Vista', 'Golden Spoon', 'Taste Paradise', 'Culinary Corner', 'Flavor House'],
      cafe: ['Coffee Corner', 'Bean & Brew', 'Morning Glory', 'Cafe Delight', 'Brew & Bite'],
      fashion: ['Style Studio', 'Fashion Forward', 'Trendy Boutique', 'Chic Collection', 'Style Hub'],
      technology: ['Tech Solutions', 'Digital Innovation', 'Code Craft', 'Future Tech', 'Tech Hub'],
      default: ['Business Hub', 'Professional Site', 'Company Portal', 'Digital Presence', 'Business Center']
    };
    
    const templates = nameTemplates[industry as keyof typeof nameTemplates] || nameTemplates.default;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * สร้าง Tagline ที่เหมาะสม
   */
  private static generateTagline(businessContext: BusinessContext, projectInfo: any): string {
    const { industry, specificNiche } = businessContext;
    
    const taglines = {
      blog: [
        'Sharing knowledge, inspiring minds',
        'Where ideas come to life',
        'Your daily dose of insights',
        'Thoughts worth sharing',
        'Knowledge that matters'
      ],
      restaurant: [
        'Where taste meets tradition',
        'Culinary excellence since day one',
        'Fresh ingredients, authentic flavors',
        'A dining experience to remember',
        'Taste the difference'
      ],
      cafe: [
        'Brewing happiness, one cup at a time',
        'Where coffee meets community',
        'Artisan coffee, crafted with love',
        'Your perfect coffee destination',
        'Coffee culture at its finest'
      ],
      fashion: [
        'Style that defines you',
        'Fashion forward, always',
        'Where trends meet timeless elegance',
        'Express your unique style',
        'Fashion that speaks'
      ],
      technology: [
        'Innovation at your fingertips',
        'Building the future, today',
        'Technology solutions that matter',
        'Empowering digital transformation',
        'Tech that works'
      ],
      default: [
        'Excellence in everything we do',
        'Your trusted partner',
        'Quality service, guaranteed',
        'Making a difference',
        'Professional excellence'
      ]
    };
    
    const industryTaglines = taglines[industry as keyof typeof taglines] || taglines.default;
    return industryTaglines[Math.floor(Math.random() * industryTaglines.length)];
  }

  /**
   * สร้าง Hero Content ที่เหมาะสม
   */
  private static generateHeroContent(businessContext: BusinessContext, projectInfo: any): { title: string; subtitle: string } {
    const { industry } = businessContext;
    
    const heroContent = {
      blog: {
        title: 'Welcome to Our Blog',
        subtitle: 'Discover insights, stories, and knowledge that inspire and inform your journey'
      },
      restaurant: {
        title: 'Welcome to Our Restaurant',
        subtitle: 'Experience authentic flavors and exceptional dining in a warm, inviting atmosphere'
      },
      cafe: {
        title: 'Welcome to Our Cafe',
        subtitle: 'Savor premium coffee and delicious treats in our cozy, welcoming space'
      },
      fashion: {
        title: 'Discover Your Style',
        subtitle: 'Explore our curated collection of fashion-forward pieces that define your unique look'
      },
      technology: {
        title: 'Innovation Meets Excellence',
        subtitle: 'Cutting-edge technology solutions designed to transform your business and drive success'
      },
      default: {
        title: 'Welcome to Our Website',
        subtitle: 'Discover what makes us special and how we can serve you better'
      }
    };
    
    return heroContent[industry as keyof typeof heroContent] || heroContent.default;
  }

  /**
   * สร้าง About Text ที่เหมาะสม
   */
  private static generateAboutText(businessContext: BusinessContext, projectInfo: any): string {
    const { industry, specificNiche } = businessContext;
    
    const aboutTexts = {
      blog: 'We are passionate storytellers and knowledge sharers, dedicated to bringing you valuable insights, thought-provoking articles, and engaging content that matters. Our mission is to inform, inspire, and connect with readers who share our love for learning and discovery.',
      restaurant: 'We are passionate about creating exceptional dining experiences that celebrate authentic flavors and culinary traditions. Our commitment to quality ingredients, skilled preparation, and warm hospitality ensures every visit is memorable.',
      cafe: 'We are coffee enthusiasts dedicated to serving the finest brews in a welcoming atmosphere. From carefully sourced beans to expertly crafted beverages, we believe every cup should be a moment of pure enjoyment.',
      fashion: 'We are style curators passionate about helping you express your unique personality through fashion. Our carefully selected pieces combine contemporary trends with timeless elegance, ensuring you always look and feel your best.',
      technology: 'We are technology innovators committed to delivering cutting-edge solutions that drive business success. Our expertise spans across modern technologies, helping organizations transform and thrive in the digital age.',
      default: 'We are dedicated professionals committed to delivering exceptional service and value to our clients. Our passion for excellence drives everything we do, ensuring we meet and exceed expectations in every interaction.'
    };
    
    return aboutTexts[industry as keyof typeof aboutTexts] || aboutTexts.default;
  }

  /**
   * สร้าง Navigation Items ที่เหมาะสม
   */
  private static generateNavigationItems(businessContext: BusinessContext): string[] {
    const { industry } = businessContext;
    
    const navigationItems = {
      blog: ['Home', 'Articles', 'Categories', 'About', 'Contact'],
      restaurant: ['Home', 'Menu', 'Reservation', 'About', 'Contact'],
      cafe: ['Home', 'Coffee Menu', 'About', 'Contact'],
      fashion: ['Home', 'Collection', 'Style Guide', 'About', 'Contact'],
      technology: ['Home', 'Projects', 'Services', 'Team', 'About', 'Contact'],
      default: ['Home', 'About', 'Services', 'Contact']
    };
    
    return navigationItems[industry as keyof typeof navigationItems] || navigationItems.default;
  }

  /**
   * สร้าง Call to Action ที่เหมาะสม
   */
  private static generateCallToAction(businessContext: BusinessContext): string {
    const { industry } = businessContext;
    
    const ctaTexts = {
      blog: 'Read Our Latest Articles',
      restaurant: 'Make a Reservation',
      cafe: 'Visit Us Today',
      fashion: 'Shop the Collection',
      technology: 'Get Started',
      default: 'Learn More'
    };
    
    return ctaTexts[industry as keyof typeof ctaTexts] || ctaTexts.default;
  }

  /**
   * สร้าง Contact Info ที่เหมาะสม
   */
  private static generateContactInfo(businessContext: BusinessContext): any {
    return {
      phone: '+66 2-123-4567',
      email: 'info@example.com',
      address: '123 Business Street, Bangkok, Thailand'
    };
  }

  /**
   * สร้าง Industry Specific Content
   */
  private static generateIndustrySpecificContent(businessContext: BusinessContext, features: any[]): any {
    const { industry } = businessContext;
    
    const industryContent = {
      blog: {
        featuredArticles: [
          { title: 'Getting Started with Modern Web Development', excerpt: 'Learn the fundamentals of modern web development...' },
          { title: 'Best Practices for React Development', excerpt: 'Discover the best practices for building React applications...' }
        ],
        categories: ['Technology', 'Design', 'Business', 'Lifestyle'],
        recentPosts: 5
      },
      restaurant: {
        featuredDishes: [
          { name: 'Signature Pasta', description: 'Handmade pasta with fresh ingredients', price: '฿299' },
          { name: 'Grilled Salmon', description: 'Fresh salmon with seasonal vegetables', price: '฿399' }
        ],
        specialties: ['Italian Cuisine', 'Fresh Seafood', 'Vegetarian Options'],
        openingHours: 'Mon-Sun: 11:00 AM - 10:00 PM'
      },
      cafe: {
        featuredDrinks: [
          { name: 'Signature Latte', description: 'Our house blend with perfect foam', price: '฿89' },
          { name: 'Cold Brew', description: 'Smooth and refreshing cold brew coffee', price: '฿79' }
        ],
        atmosphere: ['Cozy', 'Modern', 'WiFi Available', 'Pet Friendly'],
        openingHours: 'Mon-Fri: 7:00 AM - 8:00 PM, Sat-Sun: 8:00 AM - 9:00 PM'
      },
      fashion: {
        featuredItems: [
          { name: 'Summer Collection', description: 'Light and breezy styles for the season', category: 'Women' },
          { name: 'Business Casual', description: 'Professional yet stylish office wear', category: 'Men' }
        ],
        categories: ['Women', 'Men', 'Accessories', 'Sale'],
        sizeGuide: 'Available in sizes XS to XXL'
      },
      technology: {
        services: [
          { name: 'Web Development', description: 'Custom web applications and websites' },
          { name: 'Mobile Apps', description: 'iOS and Android app development' }
        ],
        technologies: ['React', 'Node.js', 'Python', 'AWS'],
        portfolio: '50+ successful projects delivered'
      },
      default: {
        services: [
          { name: 'Consulting', description: 'Professional consulting services' },
          { name: 'Support', description: '24/7 customer support' }
        ],
        features: ['Quality', 'Reliability', 'Innovation'],
        experience: '10+ years of experience'
      }
    };
    
    return industryContent[industry as keyof typeof industryContent] || industryContent.default;
  }

  /**
   * วิเคราะห์ Tone
   */
  private static analyzeTone(finalJson: Record<string, unknown>): 'professional' | 'casual' | 'luxury' | 'friendly' | 'modern' {
    const projectInfo = finalJson.project as any;
    const goal = projectInfo?.goal?.toLowerCase() || '';
    
    if (goal.includes('professional') || goal.includes('corporate')) return 'professional';
    if (goal.includes('luxury') || goal.includes('premium')) return 'luxury';
    if (goal.includes('casual') || goal.includes('relaxed')) return 'casual';
    if (goal.includes('friendly') || goal.includes('warm')) return 'friendly';
    
    return 'modern';
  }

  /**
   * วิเคราะห์ Language
   */
  private static analyzeLanguage(finalJson: Record<string, unknown>): 'thai' | 'english' | 'mixed' {
    const projectInfo = finalJson.project as any;
    const text = JSON.stringify(projectInfo).toLowerCase();
    
    const thaiWords = ['ไทย', 'ภาษาไทย', 'ประเทศไทย', 'กรุงเทพ', 'ร้าน', 'อาหาร', 'กาแฟ'];
    const hasThai = thaiWords.some(word => text.includes(word));
    
    if (hasThai) return 'mixed';
    return 'english';
  }

  /**
   * สร้าง Enhanced Requirements สำหรับ Components
   */
  static generateEnhancedComponentRequirements(
    path: string, 
    finalJson: Record<string, unknown>, 
    project: any, 
    businessContext: BusinessContext,
    contentAnalysis: ContentAnalysis
  ): string {
    const name = path.split('/').pop() || '';
    
    console.log('🔧 Generating Enhanced Component Requirements for:', name);
    console.log('📁 Component Path:', path);
    console.log('🏢 Business Context:', businessContext.industry);
    console.log('🎭 Content Analysis:', {
      businessName: contentAnalysis.businessName,
      tone: contentAnalysis.tone,
      navigationItems: contentAnalysis.navigationItems
    });
    
    if (name.includes('Navbar')) {
      const requirements = `
-- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
-- Create sticky responsive navigation bar with modern design
-- Business Name: "${contentAnalysis.businessName}"
-- Navigation Items: ${contentAnalysis.navigationItems.map(item => `"${item}"`).join(', ')}
-- Tone: ${contentAnalysis.tone}
-- Use Tailwind CSS for styling with ${contentAnalysis.tone} design approach`;
      console.log('🧭 Navbar Requirements Generated:', requirements);
      return requirements;
    }
    
    if (name.includes('HeroSection')) {
      const requirements = `
-- Create impressive hero section as the main focal point
-- Title: "${contentAnalysis.heroTitle}"
-- Subtitle: "${contentAnalysis.heroSubtitle}"
-- Call to Action: "${contentAnalysis.callToActionText}"
-- Tone: ${contentAnalysis.tone}
-- Include background image or gradient
-- Use Tailwind CSS for responsive design`;
      console.log('🎨 HeroSection Requirements Generated:', requirements);
      return requirements;
    }
    
    if (name.includes('Footer')) {
      const requirements = `
-- Create comprehensive footer with contact information
-- Contact Info: ${JSON.stringify(contentAnalysis.contactInfo)}
-- Business Name: "${contentAnalysis.businessName}"
-- Tagline: "${contentAnalysis.tagline}"
-- Include social media links and copyright
-- Use Tailwind CSS for styling`;
      console.log('🦶 Footer Requirements Generated:', requirements);
      return requirements;
    }
    
    const defaultRequirements = `-- Create ${name} component with ${contentAnalysis.tone} design approach`;
    console.log('🔧 Default Component Requirements Generated:', defaultRequirements);
    return defaultRequirements;
  }

  /**
   * สร้าง Enhanced Requirements สำหรับ Pages
   */
  static generateEnhancedPageRequirements(
    path: string, 
    finalJson: Record<string, unknown>, 
    project: any, 
    businessContext: BusinessContext,
    contentAnalysis: ContentAnalysis
  ): string {
    const file = path.toLowerCase();
    
    console.log('📄 Generating Enhanced Page Requirements for:', file);
    console.log('📁 Page Path:', path);
    console.log('🏢 Business Context:', businessContext.industry);
    console.log('🎭 Content Analysis:', {
      businessName: contentAnalysis.businessName,
      tone: contentAnalysis.tone,
      industryContent: Object.keys(contentAnalysis.industrySpecificContent)
    });
    
    if (file.includes('home')) {
      const requirements = `
-- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
-- Start with <HeroSection /> and add key sections
-- Business Name: "${contentAnalysis.businessName}"
-- Tagline: "${contentAnalysis.tagline}"
-- Industry: ${businessContext.industry}
-- Include industry-specific content: ${JSON.stringify(contentAnalysis.industrySpecificContent)}
-- Tone: ${contentAnalysis.tone}
-- Use Tailwind CSS for responsive layout`;
      console.log('🏠 Home Page Requirements Generated:', requirements);
      return requirements;
    }
    
    if (file.includes('about')) {
      const requirements = `
-- Create comprehensive about page
-- About Text: "${contentAnalysis.aboutText}"
-- Business Name: "${contentAnalysis.businessName}"
-- Industry: ${businessContext.industry}
-- Include company values and mission
-- Tone: ${contentAnalysis.tone}
-- Use Tailwind CSS for styling`;
      console.log('ℹ️ About Page Requirements Generated:', requirements);
      return requirements;
    }
    
    if (file.includes('contact')) {
      const requirements = `
-- Create contact page with form and information
-- Contact Info: ${JSON.stringify(contentAnalysis.contactInfo)}
-- Business Name: "${contentAnalysis.businessName}"
-- Include contact form and map
-- Tone: ${contentAnalysis.tone}
-- Use Tailwind CSS for form styling`;
      console.log('📞 Contact Page Requirements Generated:', requirements);
      return requirements;
    }
    
    const defaultRequirements = `-- Create ${path} page with ${contentAnalysis.tone} design approach`;
    console.log('📄 Default Page Requirements Generated:', defaultRequirements);
    return defaultRequirements;
  }

  /**
   * Test function for AI business analysis
   */
  static async testAIBusinessAnalysis(): Promise<void> {
    console.log('🧪 Testing AI Business Analysis...');
    
    const testCases = [
      {
        name: 'Restaurant Test',
        finalJson: {
          project: {
            name: 'Siam Kitchen',
            type: 'restaurant',
            goal: 'สร้างเว็บไซต์ร้านอาหารไทย',
            description: 'ร้านอาหารไทยแบบดั้งเดิม เน้นอาหารพื้นบ้าน'
          },
          targetAudience: ['families', 'food-lovers'],
          features: [
            { name: 'Menu Display' },
            { name: 'Reservation System' }
          ],
          userIntent: 'ต้องการเว็บไซต์ร้านอาหารที่สวยงาม มีเมนูและระบบจองโต๊ะ'
        }
      },
      {
        name: 'E-commerce Test',
        finalJson: {
          project: {
            name: 'TechStore',
            type: 'ecommerce',
            goal: 'ร้านค้าออนไลน์ขายอุปกรณ์อิเล็กทรอนิกส์',
            description: 'ขายสมาร์ทโฟน แท็บเล็ต และอุปกรณ์เสริม'
          },
          targetAudience: ['tech-savvy-users', 'young-adults'],
          features: [
            { name: 'Product Catalog' },
            { name: 'Shopping Cart' },
            { name: 'Payment Gateway' }
          ],
          userIntent: 'ต้องการเว็บไซต์ขายของออนไลน์ที่ทันสมัย'
        }
      },
      {
        name: 'Portfolio Test',
        finalJson: {
          project: {
            name: 'John Designer',
            type: 'portfolio',
            goal: 'เว็บไซต์แสดงผลงานนักออกแบบ',
            description: 'Portfolio ของนักออกแบบกราฟิกและ UI/UX'
          },
          targetAudience: ['clients', 'employers'],
          features: [
            { name: 'Project Gallery' },
            { name: 'Contact Form' }
          ],
          userIntent: 'ต้องการเว็บไซต์แสดงผลงานที่ดูเป็นมืออาชีพ'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.name}`);
      try {
        const result = await this.analyzeBusinessContext(testCase.finalJson);
        console.log(`✅ Result:`, result);
      } catch (error) {
        console.error(`❌ Error:`, error);
      }
    }
  }
}
