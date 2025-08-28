import { SITE_GEN_CONFIG } from './config';
import { ProjectStructure, GenerationOptions } from './types';
import { UserIntentAnalyzer } from './user-intent-analyzer';
import { OpenAIService } from './openai-service';

/**
 * Project Structure Generator
 * Generates project structure based on user intent and conversation data
 */
export class ProjectStructureGenerator {
  
  /**
   * Create project structure from finalJson
   */
  static async createProjectStructure(finalJson: Record<string, unknown>, options: GenerationOptions): Promise<ProjectStructure> {
    // เปลี่ยนจากการวิเคราะห์ Business Context เป็น User Intent Analysis
    const userIntent = await UserIntentAnalyzer.analyzeUserIntent(finalJson);
    const businessContext = await UserIntentAnalyzer.analyzeBusinessContext(finalJson);
    const projectName = this.extractProjectName(finalJson);
    const projectDescription = this.extractProjectDescription(finalJson);
    const features = this.extractFeatures(finalJson);
    const pages = this.extractPages(finalJson);
    
    const systemPrompt = `🎨 CREATIVE FRONTEND DEVELOPER: สร้างเว็บไซต์ที่ตรงตามความต้องการของผู้ใช้

**TECH STACK:** Vite + React + TypeScript + Tailwind CSS (Frontend-only)

**🏢 BUSINESS CONTEXT DETECTED:**
- Industry: ${businessContext.industry}
- Specific Niche: ${businessContext.specificNiche}
- Target Audience: ${businessContext.targetAudience}
- Business Model: ${businessContext.businessModel}
- Key Differentiators: ${businessContext.keyDifferentiators.join(', ')}

**🎯 USER INTENT ANALYSIS:**
- สไตล์ที่ต้องการ: ${userIntent.visualStyle}
- โทนสี: ${userIntent.colorScheme}
- เลย์เอาต์: ${userIntent.layoutPreference}
- ฟีเจอร์หลัก: ${userIntent.features.join(', ')}
- หน้าที่ต้องการ: ${userIntent.pages.join(', ')}
- กลุ่มเป้าหมาย: ${userIntent.targetAudience}
- โทนการสื่อสาร: ${userIntent.tone}
- ความซับซ้อน: ${userIntent.complexity}

**🚨 CRITICAL REQUIREMENTS:**
- สร้าง React/TypeScript frontend เท่านั้น
- ไม่สร้าง backend code, API routes, หรือ database
- ใช้ Mock Data สำหรับ development
- เน้น UI/UX ที่สวยงามและใช้งานง่าย
- สร้างสรรค์และไม่ซ้ำใคร
- ต้องสร้างหน้าที่เฉพาะเจาะจงตาม business context

**🎨 CREATIVITY GUIDELINES:**
- สร้างเว็บไซต์ที่ตรงตามสไตล์และความต้องการของผู้ใช้
- ใช้สีและดีไซน์ที่เหมาะสมกับโทนที่ต้องการ
- สร้าง components ที่เฉพาะเจาะจงและไม่ generic
- เน้น user experience ที่ดี
- สร้างสรรค์แต่ยังคงฟังก์ชันการทำงาน

**📁 REQUIRED PAGES FOR ${businessContext.industry.toUpperCase()}:**
${this.getRequiredPagesForIndustry(businessContext.industry)}

**📁 FILE STRUCTURE REQUIREMENTS:**
- สร้างไฟล์ที่มีชื่อเฉพาะเจาะจงตามความต้องการ
- หลีกเลี่ยงชื่อ generic เช่น "Header.tsx", "Footer.tsx"
- ใช้ชื่อที่สะท้อนฟีเจอร์จริง เช่น "ProductShowcase.tsx", "BookingCalendar.tsx"
- สร้าง components ที่ตรงกับ user intent

**🎯 RESPONSE FORMAT:**
ตอบเป็น JSON เท่านั้น ไม่มี markdown headers หรือคำอธิบาย

{
  "name": "ชื่อโปรเจกต์ที่สะท้อนความต้องการของผู้ใช้",
  "description": "คำอธิบายที่ตรงตาม user intent",
  "framework": "vite-react",
  "type": "${businessContext.industry}-${businessContext.businessModel}",
  "pages": ["หน้าที่เฉพาะเจาะจงตาม business context"],
  "components": ["components ที่มีชื่อเฉพาะเจาะจง"],
  "features": ["ฟีเจอร์ที่ตรงตามความต้องการ"],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "fileStructure": [
    "ไฟล์ที่มีชื่อเฉพาะเจาะจงตาม business context"
  ]
}

**⚠️ IMPORTANT:**
- ตอบเฉพาะ JSON เท่านั้น
- ไม่ใส่ markdown headers หรือคำอธิบาย
- เริ่มต้นด้วย JSON ทันที
- ต้องเป็น valid JSON`;

    try {
      console.log('🤖 Calling OpenAI API with model:', SITE_GEN_CONFIG.currentModel);
      console.log('🔑 API Key available:', !!process.env.QUESTION_API_KEY);
      console.log('🏢 Business Context:', businessContext);
      
      const completion = await OpenAIService.makeOpenAIRequestWithRetry({
        model: SITE_GEN_CONFIG.currentModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `ข้อมูลจาก conversation:\n${JSON.stringify(finalJson, null, 2)}\n\nกรุณาวิเคราะห์และสร้างโครงสร้างโปรเจกต์ที่เหมาะสมสำหรับ ${businessContext.industry} business` }
        ],
        temperature: SITE_GEN_CONFIG.temperatures.structure,
        max_completion_tokens: 1500, // ลดจาก 2000 สำหรับ project structure
      }, 2, 30000, userIntent); // 2 retries, 30 second timeout สำหรับ Frontend-only structure

      console.log('✅ OpenAI API response received');
      const response = completion.choices[0]?.message?.content || '';
      console.log('📝 Response content length:', response.length);
      
      if (!response || response.trim().length === 0) {
        console.error('❌ Empty response from OpenAI');
        throw new Error('OpenAI returned empty response');
      }
      
      const parsed = OpenAIService.parseJSONResponse(response);
      
      // ตรวจสอบและ enhance response ถ้าจำเป็น
      if (this.isGenericResponse(parsed, finalJson)) {
        console.warn('⚠️ AI response is somewhat generic, attempting to enhance...');
        
        // พยายาม enhance response แทนที่จะ throw error ทันที
        try {
          const enhanced = await this.enhanceWithCustomData(parsed, finalJson, options);
          console.log('✅ Successfully enhanced generic response');
          return enhanced;
        } catch (enhanceError) {
          console.error('❌ Failed to enhance generic response:', enhanceError);
          // ถ้า enhance ไม่สำเร็จ ให้ใช้ fallback
          console.log('🔄 Using fallback project structure');
          return this.getFallbackProjectStructure(finalJson, options);
        }
      }
      
      console.log('✅ Successfully parsed project structure:', parsed.name);
      return parsed;
      
    } catch (error) {
      console.error('❌ Error creating project structure:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw new Error(`Failed to create project structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract project name from finalJson
   */
  private static extractProjectName(finalJson: Record<string, unknown>): string {
    // ลอง extract ชื่อโปรเจกต์จาก conversation
    const messages = Array.isArray(finalJson.messages) ? finalJson.messages : [];
    
    // หาคำที่บ่งชี้ถึงชื่อโปรเจกต์
    const projectKeywords = ['เว็บไซต์', 'แอป', 'ระบบ', 'โปรเจกต์', 'website', 'app', 'system', 'platform'];
    
    for (const message of messages) {
      if (typeof message === 'object' && message && 'content' in message) {
        const content = String(message.content).toLowerCase();
        
        // หาชื่อโปรเจกต์จากรูปแบบต่างๆ
        for (const keyword of projectKeywords) {
          const regex = new RegExp(`${keyword}\\s+([\\w\\s]+?)(?=\\s|$|[.!?])`, 'i');
          const match = content.match(regex);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
      }
    }
    
    // ถ้าไม่เจอให้ใช้ default
    return 'Generated Website';
  }

  /**
   * Extract project description from finalJson
   */
  private static extractProjectDescription(finalJson: Record<string, unknown>): string {
    const messages = Array.isArray(finalJson.messages) ? finalJson.messages : [];
    
    // รวมข้อความทั้งหมดเพื่อหาคำอธิบายโปรเจกต์
    const allText = messages
      .filter(msg => typeof msg === 'object' && msg && 'content' in msg)
      .map(msg => String((msg as any).content))
      .join(' ');
    
    // ตัดข้อความให้เหลือแค่ 200 ตัวอักษร
    return allText.length > 200 ? allText.substring(0, 200) + '...' : allText || 'Website generated from chat conversation';
  }

  /**
   * Extract features from finalJson
   */
  private static extractFeatures(finalJson: Record<string, unknown>): string[] {
    const messages = Array.isArray(finalJson.messages) ? finalJson.messages : [];
    const features: string[] = [];
    
    const featureKeywords = [
      'authentication', 'auth', 'login', 'ลงชื่อเข้าใช้',
      'database', 'db', 'ฐานข้อมูล',
      'responsive', 'mobile', 'มือถือ',
      'search', 'ค้นหา',
      'upload', 'อัพโหลด',
      'payment', 'ชำระเงิน',
      'chat', 'แชท',
      'blog', 'บล็อก',
      'ecommerce', 'ขาย',
      'dashboard', 'แดชบอร์ด'
    ];
    
    const allText = messages
      .filter(msg => typeof msg === 'object' && msg && 'content' in msg)
      .map(msg => String((msg as any).content).toLowerCase())
      .join(' ');
    
    for (const keyword of featureKeywords) {
      if (allText.includes(keyword)) {
        features.push(keyword);
      }
    }
    
    return features.length > 0 ? features : ['modern-ui', 'responsive-design'];
  }

  /**
   * Extract pages from finalJson
   */
  private static extractPages(finalJson: Record<string, unknown>): string[] {
    const messages = Array.isArray(finalJson.messages) ? finalJson.messages : [];
    const pages: string[] = [];
    
    const pageKeywords = [
      'home', 'หน้าแรก',
      'about', 'เกี่ยวกับ',
      'contact', 'ติดต่อ',
      'login', 'ลงชื่อเข้าใช้',
      'register', 'สมัครสมาชิก',
      'dashboard', 'แดชบอร์ด',
      'profile', 'โปรไฟล์',
      'settings', 'ตั้งค่า',
      'blog', 'บล็อก',
      'shop', 'ร้านค้า',
      'cart', 'ตะกร้า'
    ];
    
    const allText = messages
      .filter(msg => typeof msg === 'object' && msg && 'content' in msg)
      .map(msg => String((msg as any).content).toLowerCase())
      .join(' ');
    
    for (const keyword of pageKeywords) {
      if (allText.includes(keyword)) {
        pages.push(keyword);
      }
    }
    
    return pages.length > 0 ? pages : ['home', 'about', 'contact'];
  }

  /**
   * Check if AI response is too generic
   */
  private static isGenericResponse(parsed: any, finalJson: Record<string, unknown>): boolean {
    // ตรวจสอบว่า response มี generic terms เยอะเกินไป
    const genericNames = ['my-website', 'generated-website', 'sample-website', 'test-project'];
    const genericComponents = ['header', 'footer', 'layout', 'component'];
    const genericFeatures = ['modern-ui', 'responsive-design', 'clean-design'];
    
    const name = String(parsed.name || '').toLowerCase();
    const features = Array.isArray(parsed.features) ? parsed.features : [];
    const components = Array.isArray(parsed.components) ? parsed.components : [];
    const fileStructure = Array.isArray(parsed.fileStructure) ? parsed.fileStructure : [];
    
    // เพิ่ม debug logging
    console.log('🔍 Checking generic response:', {
      name,
      featuresCount: features.length,
      componentsCount: components.length,
      fileStructureCount: fileStructure.length
    });
    
    // ตรวจสอบชื่อโปรเจกต์ - ลดความเข้มงวด
    const hasGenericName = genericNames.some(generic => name === generic);
    
    // ตรวจสอบ features - เพิ่ม threshold และลดความเข้มงวด
    const genericFeatureCount = features.filter((f: any) => 
      typeof f === 'string' && genericFeatures.some(gf => f.toLowerCase().includes(gf))
    ).length;
    const hasOnlyGenericFeatures = features.length > 0 && genericFeatureCount >= features.length * 0.8;
    
    // ตรวจสอบ components - เพิ่ม threshold และลดความเข้มงวด
    const genericComponentCount = components.filter((c: any) => 
      typeof c === 'string' && genericComponents.some(gc => c.toLowerCase().includes(gc))
    ).length;
    const hasTooManyGenericComponents = components.length > 0 && genericComponentCount >= components.length * 0.9;
    
    // ตรวจสอบ file structure - ลดความเข้มงวด
    const hasGenericFiles = fileStructure.length > 0 && fileStructure.every((f: any) => 
      typeof f === 'string' && (
        f.toLowerCase().includes('header.tsx') || 
        f.toLowerCase().includes('footer.tsx') ||
        f.toLowerCase().includes('component.tsx') ||
        f.toLowerCase().includes('layout.tsx')
      )
    );
    
    // ตรวจสอบว่ามี business-specific content หรือไม่
    const hasBusinessSpecificContent = this.hasBusinessSpecificElements(parsed, finalJson);
    
    // ถ้ามี business-specific content ให้ผ่าน
    if (hasBusinessSpecificContent) {
      console.log('✅ Found business-specific content, allowing response');
      return false;
    }
    
    // เงื่อนไขที่ปรับปรุงแล้ว - ต้องมีหลายเงื่อนไขพร้อมกัน
    const isGeneric = (hasGenericName && hasOnlyGenericFeatures) || 
                     (hasOnlyGenericFeatures && hasTooManyGenericComponents && hasGenericFiles) ||
                     (hasGenericName && hasTooManyGenericComponents && hasGenericFiles);
    
    console.log('🔍 Generic check result:', {
      hasGenericName,
      hasOnlyGenericFeatures,
      hasTooManyGenericComponents,
      hasGenericFiles,
      hasBusinessSpecificContent,
      isGeneric
    });
    
    return isGeneric;
  }

  /**
   * Check if response has business-specific elements
   */
  private static hasBusinessSpecificElements(parsed: any, finalJson: Record<string, unknown>): boolean {
    // ตรวจสอบว่ามี business-specific terms ใน finalJson หรือไม่
    const businessTerms = [
      'restaurant', 'cafe', 'shop', 'store', 'business', 'company', 'agency',
      'blog', 'portfolio', 'ecommerce', 'marketplace', 'booking', 'reservation',
      'food', 'fashion', 'tech', 'health', 'education', 'finance', 'real-estate'
    ];
    
    // ตรวจสอบใน conversation context
    const conversationText = JSON.stringify(finalJson).toLowerCase();
    const hasBusinessContext = businessTerms.some(term => conversationText.includes(term));
    
    // ตรวจสอบใน parsed response
    const parsedText = JSON.stringify(parsed).toLowerCase();
    const hasBusinessSpecificName = !parsed.name || 
      businessTerms.some(term => String(parsed.name).toLowerCase().includes(term));
    
    // ตรวจสอบว่ามี components ที่เฉพาะเจาะจง
    const components = Array.isArray(parsed.components) ? parsed.components : [];
    const hasSpecificComponents = components.some((c: any) => 
      typeof c === 'string' && c.length > 10 && !c.toLowerCase().includes('component')
    );
    
    // ตรวจสอบว่ามี features ที่เฉพาะเจาะจง
    const features = Array.isArray(parsed.features) ? parsed.features : [];
    const hasSpecificFeatures = features.some((f: any) => 
      typeof f === 'string' && f.length > 15 && !f.toLowerCase().includes('design')
    );
    
    return hasBusinessContext || hasBusinessSpecificName || hasSpecificComponents || hasSpecificFeatures;
  }

  /**
   * Enhance generic response with custom data
   */
  private static async enhanceWithCustomData(
    parsed: any, 
    finalJson: Record<string, unknown>, 
    options: GenerationOptions
  ): Promise<ProjectStructure> {
    console.log('🔧 Enhancing generic response with custom data...');
    
    const extractedName = this.extractProjectName(finalJson);
    const extractedFeatures = this.extractFeatures(finalJson);
    const extractedPages = this.extractPages(finalJson);
    
    // สร้าง business context จาก conversation
    const businessContext = await UserIntentAnalyzer.analyzeBusinessContext(finalJson);
    
    // ถ้ามี businessContext ให้สร้าง components และ features ที่เฉพาะเจาะจง
    if (businessContext) {
      console.log('🏢 Detected business context:', businessContext.industry);
      
      const businessComponents = this.generateBusinessSpecificComponents(businessContext);
      const businessFeatures = this.generateBusinessSpecificFeatures(businessContext);
      
      const enhancedName = extractedName !== 'Generated Website' ? extractedName : 
        `${businessContext.industry}-${businessContext.specificNiche || 'platform'}`;
      
      return {
        ...parsed,
        name: enhancedName,
        type: `${businessContext.industry}-${businessContext.businessModel || 'platform'}`,
        components: [...businessComponents, ...(parsed.components || [])],
        features: [...businessFeatures, ...(parsed.features || [])],
        pages: [...extractedPages, ...(parsed.pages || [])],
        description: `A specialized ${businessContext.industry} platform with ${businessFeatures.join(', ')} capabilities`,
        industry: businessContext.industry,
        targetAudience: businessContext.targetAudience || 'users'
      };
    }
    
    // ถ้าไม่มี business context ให้ใช้ข้อมูลที่ extract ได้
    const enhancedName = extractedName !== 'Generated Website' ? extractedName : 
      this.generateCustomName(finalJson);
    
    return {
      ...parsed,
      name: enhancedName,
      features: [...extractedFeatures, ...(parsed.features || [])],
      pages: [...extractedPages, ...(parsed.pages || [])],
      description: this.extractProjectDescription(finalJson) || 'Custom website generated from conversation'
    };
  }

  /**
   * Generate business-specific components
   */
  private static generateBusinessSpecificComponents(context: any): string[] {
    const { industry, specificNiche, targetAudience, keyDifferentiators } = context;
    const components: string[] = [];
    
    // Base components based on industry
    switch (industry) {
      case 'cafe':
        components.push('CoffeeMenuDisplay.tsx', 'BaristaProfile.tsx', 'OrderProgressTracker.tsx');
        if (specificNiche === 'specialty-coffee') {
          components.push('BeanOriginMap.tsx', 'BrewingMethodSelector.tsx', 'CuppingScoreCard.tsx');
        } else if (specificNiche === 'organic-cafe') {
          components.push('OrganicCertificationBadge.tsx', 'FarmPartnerShowcase.tsx', 'SustainabilityMetrics.tsx');
        }
        break;
        
      case 'restaurant':
        components.push('DishGallery.tsx', 'ChefRecommendation.tsx', 'TableAvailabilityCalendar.tsx');
        if (targetAudience === 'families') {
          components.push('KidsMenuSection.tsx', 'FamilyPackageDeals.tsx', 'PlayAreaBooking.tsx');
        }
        break;
        
      case 'fashion':
        components.push('StyleCatalog.tsx', 'SizeGuideInteractive.tsx', 'TrendSpotlight.tsx');
        if (specificNiche === 'luxury-fashion') {
          components.push('PersonalShopperChat.tsx', 'ExclusiveCollectionAccess.tsx', 'VIPCustomerPortal.tsx');
        } else if (specificNiche === 'sustainable-fashion') {
          components.push('EcoImpactTracker.tsx', 'MaterialOriginStory.tsx', 'UpcyclingWorkshopSignup.tsx');
        }
        break;
        
      case 'technology':
        components.push('TechStackDisplay.tsx', 'ProjectShowcase.tsx', 'CodeRepositoryLinks.tsx');
        if (keyDifferentiators.includes('ai-powered')) {
          components.push('AIFeatureDemo.tsx', 'ModelPerformanceMetrics.tsx', 'AIExplanationModal.tsx');
        }
        break;
        
      case 'education':
        components.push('CourseProgressTracker.tsx', 'InstructorProfile.tsx', 'StudentTestimonials.tsx');
        if (targetAudience === 'professionals') {
          components.push('CertificationBadge.tsx', 'SkillAssessmentTool.tsx', 'CareerPathGuide.tsx');
        }
        break;
        
      default:
        components.push('HeroSection.tsx', 'FeatureHighlight.tsx', 'ContactForm.tsx');
    }
    
    // Add differentiator-specific components
    if (keyDifferentiators.includes('real-time')) {
      components.push('LiveUpdatesFeed.tsx', 'RealTimeNotifications.tsx');
    }
    if (keyDifferentiators.includes('social-features')) {
      components.push('SocialShareButtons.tsx', 'CommunityFeed.tsx', 'UserReviewSystem.tsx');
    }
    if (keyDifferentiators.includes('mobile-first')) {
      components.push('MobileNavigationDrawer.tsx', 'TouchGestureHandler.tsx');
    }
    
    return components;
  }

  /**
   * Generate business-specific features
   */
  private static generateBusinessSpecificFeatures(context: any): string[] {
    const { industry, specificNiche, businessModel, keyDifferentiators } = context;
    const features: string[] = [];
    
    switch (industry) {
      case 'cafe':
        features.push('coffee-ordering-system', 'loyalty-rewards-program', 'barista-scheduling');
        if (specificNiche === 'specialty-coffee') {
          features.push('bean-origin-tracking', 'brewing-method-customization', 'cupping-score-rating');
        }
        break;
        
      case 'restaurant':
        features.push('table-reservation-system', 'menu-nutritional-info', 'chef-special-alerts');
        if (businessModel === 'subscription') {
          features.push('meal-plan-subscription', 'weekly-menu-preview', 'dietary-preference-tracking');
        }
        break;
        
      case 'fashion':
        features.push('style-recommendation-engine', 'virtual-fitting-room', 'seasonal-collection-showcase');
        if (specificNiche === 'luxury-fashion') {
          features.push('personal-shopper-consultation', 'exclusive-member-access', 'custom-tailoring-service');
        }
        break;
        
      case 'technology':
        features.push('technical-documentation', 'api-integration-guides', 'performance-monitoring');
        if (keyDifferentiators.includes('ai-powered')) {
          features.push('machine-learning-insights', 'predictive-analytics', 'intelligent-automation');
        }
        break;
        
      default:
        features.push('modern-responsive-design', 'cross-platform-compatibility', 'seo-optimization');
    }
    
    return features;
  }

  /**
   * Generate custom name from conversation
   */
  private static generateCustomName(finalJson: Record<string, unknown>): string {
    const conversationText = JSON.stringify(finalJson).toLowerCase();
    
    // พยายามหา keywords ที่น่าสนใจ
    const interestingWords = conversationText.match(/\b[a-z]{4,}\b/g) || [];
    const filteredWords = interestingWords.filter(word => 
      !['the', 'and', 'for', 'with', 'this', 'that', 'have', 'will', 'from', 'they', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'].includes(word)
    );
    
    if (filteredWords.length > 0) {
      const randomWord = filteredWords[Math.floor(Math.random() * Math.min(filteredWords.length, 5))];
      return `${randomWord}-platform`;
    }
    
    return 'custom-website';
  }

  /**
   * Get required pages for specific industry
   */
  private static getRequiredPagesForIndustry(industry: string): string {
    switch (industry) {
      case 'restaurant':
        return `- Menu (เมนูอาหาร) - แสดงรายการอาหารและเครื่องดื่ม
- Reservation (จองโต๊ะ) - ระบบจองโต๊ะออนไลน์
- Chef Profile (โปรไฟล์เชฟ) - แนะนำเชฟและทีมครัว
- Dish Gallery (แกลเลอรี่อาหาร) - รูปภาพอาหารสวยๆ
- About (เกี่ยวกับร้าน) - ประวัติและความเป็นมา
- Contact (ติดต่อ) - ข้อมูลการติดต่อและแผนที่`;
        
      case 'cafe':
        return `- Coffee Menu (เมนูกาแฟ) - รายการกาแฟและเครื่องดื่ม
- Barista Profile (โปรไฟล์บาริสต้า) - แนะนำบาริสต้า
- Order Tracking (ติดตามออเดอร์) - ติดตามสถานะออเดอร์
- Bean Origin (แหล่งที่มาของเมล็ดกาแฟ) - ข้อมูลเมล็ดกาแฟ
- About (เกี่ยวกับคาเฟ่) - ประวัติและความเป็นมา
- Contact (ติดต่อ) - ข้อมูลการติดต่อและแผนที่`;
        
      case 'fashion':
        return `- Collection (คอลเลกชัน) - แสดงคอลเลกชันล่าสุด
- Product Detail (รายละเอียดสินค้า) - ข้อมูลสินค้าแต่ละชิ้น
- Style Guide (ไกด์สไตล์) - แนะนำการแต่งตัว
- About (เกี่ยวกับแบรนด์) - ประวัติแบรนด์
- Contact (ติดต่อ) - ข้อมูลการติดต่อ`;
        
      case 'technology':
        return `- Projects (โปรเจกต์) - แสดงผลงานและโปรเจกต์
- Services (บริการ) - บริการที่ให้
- Team (ทีม) - แนะนำทีมงาน
- About (เกี่ยวกับบริษัท) - ประวัติบริษัท
- Contact (ติดต่อ) - ข้อมูลการติดต่อ`;
        
      default:
        return `- Home (หน้าแรก) - หน้าแรกของเว็บไซต์
- About (เกี่ยวกับ) - ข้อมูลเกี่ยวกับ
- Contact (ติดต่อ) - ข้อมูลการติดต่อ
- Products (สินค้า) - รายการสินค้า
- Services (บริการ) - บริการที่ให้`;
    }
  }

  /**
   * Get fallback project structure
   */
  private static getFallbackProjectStructure(finalJson: Record<string, unknown>, options: GenerationOptions): ProjectStructure {
    console.log('🔄 Creating fallback project structure');
    
    const projectName = typeof finalJson.projectName === 'string' ? finalJson.projectName : 'my-website';
    const framework = options.framework || 'vite-react';
    
    return {
      name: projectName,
      description: 'Generated website from chat conversation',
      type: 'website',
      framework: framework,
      pages: ['home', 'about', 'contact'],
      components: ['Header', 'Footer', 'Layout'],
      features: ['responsive-design', 'modern-ui'],
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.8.0"
      },
      devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@vitejs/plugin-react": "^4.0.0",
        "tailwindcss": "^3.3.0",
        "typescript": "^5.0.0",
        "vite": "^4.4.0"
      },
      scripts: {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      fileStructure: [
        "src/main.tsx",
        "src/App.tsx",
        "src/index.css",
        "src/components/Header.tsx",
        "src/components/Footer.tsx",
        "src/components/Navigation.tsx",
        "src/components/Layout.tsx",
        "src/types/index.ts",
        "src/hooks/useLocalStorage.ts",
        "src/lib/utils.ts",
        "src/data/mockData.ts",
        "tailwind.config.js",
        "vite.config.ts"
      ]
    };
  }
}
