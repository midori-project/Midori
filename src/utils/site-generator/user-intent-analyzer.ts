import { UserIntent, BusinessContext, ConversationContext } from './types';
import { openai } from './config';

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
    
    try {
      // Step 1: ใช้ AI analysis เป็นหลัก
      const aiAnalysis = await this.performAIAnalysis(conversationText);
      
      // Step 2: ใช้ keyword analysis เป็น fallback และ validation
      const keywordAnalysis = this.performKeywordAnalysis(conversationText);
      
      // Step 3: รวมผลการวิเคราะห์
      return this.mergeAnalysis(aiAnalysis, keywordAnalysis);
      
    } catch (error) {
      console.warn('AI analysis failed, falling back to keyword analysis:', error);
      return this.performKeywordAnalysis(conversationText);
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
    // ใช้ข้อมูลโดยตรงจาก finalJson แทน string analysis
    const projectInfo = finalJson.project as any;
    const targetAudience = finalJson.targetAudience as string[];
    const features = finalJson.features as any[];
    
    console.log('🎯 Direct finalJson analysis:', {
      projectType: projectInfo?.type,
      projectGoal: projectInfo?.goal,
      targetAudience: targetAudience
    });
    
    // Direct mapping จาก project type และ goal
    let industry = 'general';
    const projectType = projectInfo?.type?.toLowerCase() || '';
    const projectGoal = projectInfo?.goal?.toLowerCase() || '';
    
    if (projectType.includes('blog') || projectGoal.includes('บทความ') || projectGoal.includes('เขียน') || projectGoal.includes('แชร์')) {
      industry = 'blog';
    } else if (projectType.includes('restaurant') || projectGoal.includes('ร้านอาหาร') || projectGoal.includes('อาหาร')) {
      industry = 'restaurant';
    } else if (projectType.includes('cafe') || projectGoal.includes('คาเฟ่') || projectGoal.includes('กาแฟ')) {
      industry = 'cafe';
    } else if (projectType.includes('fashion') || projectGoal.includes('แฟชั่น') || projectGoal.includes('เสื้อผ้า')) {
      industry = 'fashion';
    } else if (projectType.includes('technology') || projectGoal.includes('เทคโนโลยี') || projectGoal.includes('software')) {
      industry = 'technology';
    }
    
    // ใช้ targetAudience โดยตรง
    const audienceText = targetAudience?.join(', ') || 'general-public';
    
    // กำหนด specificNiche ตาม industry และ features
    let specificNiche = 'general-business';
    if (industry === 'blog') {
      if (features?.some(f => f.name?.includes('CMS') || f.name?.includes('Admin'))) {
        specificNiche = 'cms-blog';
      } else if (features?.some(f => f.name?.includes('Comment') || f.name?.includes('Social'))) {
        specificNiche = 'social-blog';
      } else {
        specificNiche = 'content-blog';
      }
    }
    
    const result = {
      industry,
      specificNiche,
      targetAudience: audienceText,
      businessModel: 'b2c' as const,
      keyDifferentiators: [] // เพิ่ม keyDifferentiators เป็น array ว่าง
    };
    
    console.log('✅ Business Context Result:', result);
    return result;
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
  "industry": "general|cafe|restaurant|fashion|technology|education|healthcare",
  "specificNiche": "general-business|specialty-coffee|organic-cafe|coffee-roastery|luxury-fashion|vintage-clothing|sustainable-fashion",
  "targetAudience": "general-public|students|professionals|families|young-adults",
  "businessModel": "b2c|b2b|subscription|marketplace",
  "keyDifferentiators": ["array", "of", "differentiators"]
}

**คำแนะนำในการวิเคราะห์:**
- วิเคราะห์จากบริบทและความหมาย
- รองรับทั้งภาษาไทยและภาษาอังกฤษ
- ระบุ industry ที่เหมาะสมที่สุด
- ระบุ niche ที่เฉพาะเจาะจง
- ระบุ business model ที่เหมาะสม
- ระบุจุดเด่นที่สำคัญ

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
}
