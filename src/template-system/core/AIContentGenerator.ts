/**
 * AIContentGenerator - ตัวสร้างเนื้อหาด้วย AI สำหรับ placeholder
 * ใช้ AI วิเคราะห์ข้อมูลผู้ใช้และสร้างเนื้อหาที่เหมาะสมสำหรับ placeholder แต่ละตัว
 */

import { Template, UserData } from '../types/Template';
import { PlaceholderMatch, PlaceholderType } from '../types/Placeholder';

export interface AIPlaceholderContent {
  text?: string;
  imageUrl?: string;
  data?: any;
  slot?: any;
  tw?: string;
}

export class AIContentGenerator {
  private contentTemplates: Map<string, any> = new Map();
  private tailwindDocumentation: string = '';

  constructor() {
    this.initializeContentTemplates();
    this.loadTailwindDocumentation();
  }

  /**
   * สร้างเนื้อหาด้วย AI สำหรับ placeholder แต่ละตัว
   */
  async generatePlaceholderContent(
    placeholder: PlaceholderMatch, 
    userData: UserData, 
    template: Template,
    context?: string
  ): Promise<string> {
    console.log(`🤖 [AIContentGenerator] สร้างเนื้อหา AI สำหรับ placeholder: ${placeholder.type}`);
    
    try {
      // วิเคราะห์ข้อมูลผู้ใช้
      const analysis = this.analyzeUserData(userData);
      
      // สร้างเนื้อหาด้วย AI ตามประเภท placeholder
      const content = await this.generateContentForPlaceholder(placeholder, analysis, userData, template, context);
      console.log(`✅ [AIContentGenerator] สร้างเนื้อหา AI เสร็จสิ้น`);

      return content;

    } catch (error) {
      console.error(`❌ [AIContentGenerator] ข้อผิดพลาด:`, error);
      // คืนค่า fallback content
      return this.generateFallbackPlaceholderContent(placeholder, userData);
    }
  }

  /**
   * วิเคราะห์ข้อมูลผู้ใช้เพื่อกำหนดประเภทธุรกิจ
   */
  private analyzeUserData(userData: UserData): BusinessAnalysis {
    const brandName = userData.brandName?.toLowerCase() || '';
    const content = userData.content || {};
    
    // วิเคราะห์ประเภทธุรกิจจากชื่อแบรนด์
    let businessType: 'food' | 'fashion' | 'technology' | 'health' | 'general' = 'general';
    let tone: 'professional' | 'warm' | 'trendy' | 'modern' | 'trustworthy' = 'professional';
    let targetAudience = 'general';

    // ตรวจสอบประเภทธุรกิจ
    if (this.isFoodBusiness(brandName)) {
      businessType = 'food';
      tone = 'warm';
      targetAudience = 'food-lovers';
    } else if (this.isFashionBusiness(brandName)) {
      businessType = 'fashion';
      tone = 'trendy';
      targetAudience = 'fashion-conscious';
    } else if (this.isTechBusiness(brandName)) {
      businessType = 'technology';
      tone = 'modern';
      targetAudience = 'tech-savvy';
    } else if (this.isHealthBusiness(brandName)) {
      businessType = 'health';
      tone = 'trustworthy';
      targetAudience = 'health-conscious';
    }

    return {
      businessType,
      tone,
      targetAudience,
      brandName: userData.brandName || 'ร้านค้าออนไลน์',
      theme: userData.theme || 'modern',
      customizations: userData.customizations || {}
    };
  }

  /**
   * สร้างเนื้อหาด้วย AI สำหรับ placeholder แต่ละตัว
   */
  private async generateContentForPlaceholder(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    template: Template,
    context?: string
  ): Promise<string> {
    try {
      // สร้าง prompt สำหรับ AI ตามประเภท placeholder
      const prompt = this.buildPlaceholderPrompt(placeholder, analysis, userData, template, context);
      
      console.log(`🤖 [AIContentGenerator] เรียก AI API สำหรับ placeholder: ${placeholder.type}`);
      
      // เรียก AI API จริง
      const response = await this.callAIAPI(prompt);

      // Parse AI response
      const aiContent = await this.parsePlaceholderResponse(response, placeholder, analysis);
      
      console.log(`✅ [AIContentGenerator] AI สร้างเนื้อหา placeholder เสร็จสิ้น`);
      return aiContent;

    } catch (error) {
      console.error(`❌ [AIContentGenerator] AI API error:`, error);
      // Fallback to static content
      return this.generateFallbackPlaceholderContent(placeholder, userData);
    }
  }

  /**
   * สร้าง prompt สำหรับ AI ตามประเภท placeholder
   */
  private buildPlaceholderPrompt(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    template: Template,
    context?: string
  ): string {
    const brandName = analysis.brandName;
    const businessType = analysis.businessType;
    const tone = analysis.tone;
    
    switch (placeholder.type) {
      case 'text':
        return this.buildTextPrompt(placeholder, analysis, userData, context);
      case 'img':
        return this.buildImagePrompt(placeholder, analysis, userData, context);
      case 'data':
        return this.buildDataPrompt(placeholder, analysis, userData, context);
      case 'slot':
        return this.buildSlotPrompt(placeholder, analysis, userData, context);
      case 'tw':
        return this.buildTailwindPrompt(placeholder, analysis, userData, context);
      default:
        return this.buildGenericPrompt(placeholder, analysis, userData, context);
    }
  }

  /**
   * สร้าง prompt สำหรับ text placeholder
   */
  private buildTextPrompt(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    context?: string
  ): string {
    const brandName = analysis.brandName;
    const businessType = analysis.businessType;
    const tone = analysis.tone;
    
    return `สร้างข้อความสำหรับเว็บไซต์ ${brandName}

ข้อมูลธุรกิจ:
- ประเภทธุรกิจ: ${businessType}
- โทนเสียง: ${tone}
- กลุ่มเป้าหมาย: ${analysis.targetAudience}
- Context: ${context || 'ทั่วไป'}

ข้อมูลเพิ่มเติม: ${JSON.stringify(userData.content || {})}

สร้างข้อความที่:
1. เหมาะสมกับประเภทธุรกิจ ${businessType}
2. ใช้โทนเสียง ${tone}
3. เข้าใจง่ายและน่าสนใจ
4. ใช้ภาษาอังกฤษที่ถูกต้อง
5. เน้นประโยชน์และคุณค่าของสินค้า/บริการ

ตอบเป็นข้อความสั้นๆ ไม่เกิน 100 ตัวอักษร`;
  }

  /**
   * สร้าง prompt สำหรับ image placeholder
   */
  private buildImagePrompt(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    context?: string
  ): string {
    const brandName = analysis.brandName;
    const businessType = analysis.businessType;
    
    return `สร้าง URL รูปภาพสำหรับเว็บไซต์ ${brandName}

ข้อมูลธุรกิจ:
- ประเภทธุรกิจ: ${businessType}
- Context: ${context || 'ทั่วไป'}

ข้อมูลเพิ่มเติม: ${JSON.stringify(userData.images || {})}

สร้าง URL รูปภาพที่:
1. เหมาะสมกับประเภทธุรกิจ ${businessType}
2. สื่อถึงแบรนด์ ${brandName}
3. ใช้ placeholder service (เช่น via.placeholder.com)
4. มีขนาดที่เหมาะสม (800x600 หรือ 400x300)
5. มีสีและข้อความที่เหมาะสม

ตอบเป็น URL เท่านั้น`;
  }

  /**
   * สร้าง prompt สำหรับ data placeholder
   */
  private buildDataPrompt(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    context?: string
  ): string {
    const brandName = analysis.brandName;
    const businessType = analysis.businessType;
    const key = placeholder.key;
    
    return `สร้างข้อมูลสำหรับ ${key} ของเว็บไซต์ ${brandName}

ข้อมูลธุรกิจ:
- ประเภทธุรกิจ: ${businessType}
- Key: ${key}
- Context: ${context || 'ทั่วไป'}

ข้อมูลเพิ่มเติม: ${JSON.stringify(userData.content || {})}

สร้างข้อมูลที่:
1. เหมาะสมกับประเภทธุรกิจ ${businessType}
2. สอดคล้องกับ key: ${key}
3. ใช้ภาษาอังกฤษที่ถูกต้อง
4. มีความหมายและเป็นประโยชน์

ตอบเป็นข้อมูลสั้นๆ ไม่เกิน 50 ตัวอักษร`;
  }

  /**
   * สร้าง prompt สำหรับ slot placeholder
   */
  private buildSlotPrompt(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    context?: string
  ): string {
    const brandName = analysis.brandName;
    const businessType = analysis.businessType;
    const key = placeholder.key;
    
    return `สร้างเนื้อหาสำหรับ slot ${key} ของเว็บไซต์ ${brandName}

ข้อมูลธุรกิจ:
- ประเภทธุรกิจ: ${businessType}
- Slot: ${key}
- Context: ${context || 'ทั่วไป'}

ข้อมูลเพิ่มเติม: ${JSON.stringify(userData.slots || {})}

สร้างเนื้อหาที่:
1. เหมาะสมกับประเภทธุรกิจ ${businessType}
2. สอดคล้องกับ slot: ${key}
3. ใช้ภาษาอังกฤษที่ถูกต้อง
4. มีความหมายและเป็นประโยชน์

ตอบเป็นเนื้อหาสั้นๆ ไม่เกิน 100 ตัวอักษร`;
  }

  /**
   * สร้าง prompt สำหรับ tailwind placeholder
   */
  private buildTailwindPrompt(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    context?: string
  ): string {
    const brandName = analysis.brandName;
    const businessType = analysis.businessType;
    const theme = userData.theme || 'modern';
    
    return `สร้าง Tailwind CSS classes สำหรับเว็บไซต์ ${brandName}

ข้อมูลธุรกิจ:
- ประเภทธุรกิจ: ${businessType}
- Theme: ${theme}
- Context: ${context || 'ทั่วไป'}

ข้อมูลเพิ่มเติม: ${JSON.stringify(userData.customizations || {})}

${this.tailwindDocumentation}

สร้าง Tailwind classes ที่:
1. เหมาะสมกับประเภทธุรกิจ ${businessType}
2. สอดคล้องกับ theme: ${theme}
3. ใช้สีและสไตล์ที่เหมาะสมตามเอกสารข้างต้น
4. มีความสวยงามและใช้งานได้
5. ใช้ classes ที่ถูกต้องตาม Tailwind CSS documentation
6. ใช้ Common Patterns ที่เหมาะสมกับ context

ตอบเป็น Tailwind classes เท่านั้น ไม่ต้องมีคำอธิบายเพิ่มเติม`;
  }

  /**
   * สร้าง prompt สำหรับ generic placeholder
   */
  private buildGenericPrompt(
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis, 
    userData: UserData, 
    context?: string
  ): string {
    const brandName = analysis.brandName;
    const businessType = analysis.businessType;
    
    return `สร้างเนื้อหาสำหรับ placeholder ${placeholder.type} ของเว็บไซต์ ${brandName}

ข้อมูลธุรกิจ:
- ประเภทธุรกิจ: ${businessType}
- Placeholder: ${placeholder.type}
- Context: ${context || 'ทั่วไป'}

ข้อมูลเพิ่มเติม: ${JSON.stringify(userData.content || {})}

สร้างเนื้อหาที่:
1. เหมาะสมกับประเภทธุรกิจ ${businessType}
2. สอดคล้องกับ placeholder: ${placeholder.type}
3. ใช้ภาษาอังกฤษที่ถูกต้อง
4. มีความหมายและเป็นประโยชน์

ตอบเป็นเนื้อหาสั้นๆ ไม่เกิน 100 ตัวอักษร`;
  }

  /**
   * Parse AI response สำหรับ placeholder
   */
  private async parsePlaceholderResponse(
    aiResponse: string, 
    placeholder: PlaceholderMatch, 
    analysis: BusinessAnalysis
  ): Promise<string> {
    try {
      // ลบ markdown code blocks ถ้ามี
      let cleanedResponse = aiResponse.trim();
      
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\w*\s*/, '').replace(/\s*```$/, '');
      }
      
      // ลบ quotes ถ้ามี
      cleanedResponse = cleanedResponse.replace(/^["']|["']$/g, '');
      
      return cleanedResponse;
      
    } catch (error) {
      console.error(`❌ [AIContentGenerator] Failed to parse AI response:`, error);
      return this.generateFallbackPlaceholderContent(placeholder, { brandName: analysis.brandName } as UserData);
    }
  }

  /**
   * สร้างเนื้อหา fallback สำหรับ placeholder
   */
  private generateFallbackPlaceholderContent(placeholder: PlaceholderMatch, userData: UserData): string {
    const brandName = userData.brandName || 'ร้านค้าออนไลน์';
    
    switch (placeholder.type) {
      case 'text':
        return `${brandName} - ข้อความเริ่มต้น`;
      case 'img':
        return `https://via.placeholder.com/800x600/3b82f6/ffffff?text=${encodeURIComponent(brandName)}`;
      case 'data':
        return placeholder.key ? `${brandName} - ${placeholder.key}` : `${brandName} - ข้อมูล`;
      case 'slot':
        return placeholder.key ? `${brandName} - ${placeholder.key}` : `${brandName} - เนื้อหา`;
      case 'tw':
        return 'bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 rounded-lg';
      default:
        return `${brandName} - เนื้อหาเริ่มต้น`;
    }
  }

  /**
   * ตรวจสอบว่าเป็นธุรกิจอาหารหรือไม่
   */
  private isFoodBusiness(brandName: string): boolean {
    const foodKeywords = ['อาหาร', 'ร้าน', 'ครัว', 'ปิ้ง', 'ย่าง', 'หมู', 'ไก่', 'ปลา', 'กุ้ง', 'ข้าว', 'ก๋วยเตี๋ยว', 'ส้มตำ', 'ลาบ', 'สลัด', 'กาแฟ', 'ชา', 'น้ำ', 'ขนม', 'เค้ก', 'ไอศครีม'];
    return foodKeywords.some(keyword => brandName.includes(keyword));
  }

  /**
   * ตรวจสอบว่าเป็นธุรกิจแฟชั่นหรือไม่
   */
  private isFashionBusiness(brandName: string): boolean {
    const fashionKeywords = ['แฟชั่น', 'เสื้อ', 'ผ้า', 'ชุด', 'กางเกง', 'กระโปรง', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ', 'สไตล์', 'แฟชั่น', 'fashion', 'style'];
    return fashionKeywords.some(keyword => brandName.includes(keyword));
  }

  /**
   * ตรวจสอบว่าเป็นธุรกิจเทคโนโลยีหรือไม่
   */
  private isTechBusiness(brandName: string): boolean {
    const techKeywords = ['คอมพิวเตอร์', 'มือถือ', 'โทรศัพท์', 'โน๊ตบุ๊ค', 'แท็บเล็ต', 'เกม', 'gaming', 'tech', 'เทคโนโลยี', 'อิเล็กทรอนิกส์'];
    return techKeywords.some(keyword => brandName.includes(keyword));
  }

  /**
   * ตรวจสอบว่าเป็นธุรกิจสุขภาพหรือไม่
   */
  private isHealthBusiness(brandName: string): boolean {
    const healthKeywords = ['สุขภาพ', 'ยา', 'วิตามิน', 'อาหารเสริม', 'เครื่องสำอาง', 'สปา', 'ฟิตเนส', 'ยิม', 'คลินิก', 'โรงพยาบาล', 'สุขภาพ', 'health', 'beauty'];
    return healthKeywords.some(keyword => brandName.includes(keyword));
  }

  /**
   * เริ่มต้น content templates
   */
  private initializeContentTemplates(): void {
    // เก็บ templates สำหรับการปรับแต่งในอนาคต
    this.contentTemplates.set('default', {});
  }

  /**
   * โหลดเอกสาร Tailwind CSS
   */
  private loadTailwindDocumentation(): void {
    this.tailwindDocumentation = `
## สี (Colors)
- Primary: bg-blue-500, bg-blue-600, bg-blue-700, text-blue-500, text-blue-600, text-blue-700
- Secondary: bg-gray-500, bg-gray-600, bg-gray-700, text-gray-500, text-gray-600, text-gray-700
- Success: bg-green-500, bg-green-600, bg-green-700, text-green-500, text-green-600, text-green-700
- Warning: bg-yellow-500, bg-yellow-600, bg-yellow-700, text-yellow-500, text-yellow-600, text-yellow-700
- Danger: bg-red-500, bg-red-600, bg-red-700, text-red-500, text-red-600, text-red-700
- Info: bg-cyan-500, bg-cyan-600, bg-cyan-700, text-cyan-500, text-cyan-600, text-cyan-700
- Purple: bg-purple-500, bg-purple-600, bg-purple-700, text-purple-500, text-purple-600, text-purple-700
- Pink: bg-pink-500, bg-pink-600, bg-pink-700, text-pink-500, text-pink-600, text-pink-700
- Indigo: bg-indigo-500, bg-indigo-600, bg-indigo-700, text-indigo-500, text-indigo-600, text-indigo-700
- Teal: bg-teal-500, bg-teal-600, bg-teal-700, text-teal-500, text-teal-600, text-teal-700
- Orange: bg-orange-500, bg-orange-600, bg-orange-700, text-orange-500, text-orange-600, text-orange-700
- Emerald: bg-emerald-500, bg-emerald-600, bg-emerald-700, text-emerald-500, text-emerald-600, text-emerald-700

## ขนาด (Sizing)
- Padding: p-1, p-2, p-3, p-4, p-5, p-6, p-8, p-10, p-12, p-16, p-20, p-24, p-32
- Margin: m-1, m-2, m-3, m-4, m-5, m-6, m-8, m-10, m-12, m-16, m-20, m-24, m-32
- Width: w-1, w-2, w-4, w-8, w-12, w-16, w-20, w-24, w-32, w-40, w-48, w-56, w-64, w-72, w-80, w-96, w-auto, w-full, w-screen
- Height: h-1, h-2, h-4, h-8, h-12, h-16, h-20, h-24, h-32, h-40, h-48, h-56, h-64, h-72, h-80, h-96, h-auto, h-full, h-screen
- Max Width: max-w-xs, max-w-sm, max-w-md, max-w-lg, max-w-xl, max-w-2xl, max-w-3xl, max-w-4xl, max-w-5xl, max-w-6xl, max-w-7xl, max-w-full
- Max Height: max-h-32, max-h-40, max-h-48, max-h-56, max-h-64, max-h-72, max-h-80, max-h-96, max-h-full, max-h-screen

## Typography
- Font Size: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl, text-6xl, text-7xl, text-8xl, text-9xl
- Font Weight: font-thin, font-extralight, font-light, font-normal, font-medium, font-semibold, font-bold, font-extrabold, font-black
- Text Align: text-left, text-center, text-right, text-justify
- Line Height: leading-3, leading-4, leading-5, leading-6, leading-7, leading-8, leading-9, leading-10, leading-none, leading-tight, leading-snug, leading-normal, leading-relaxed, leading-loose
- Letter Spacing: tracking-tighter, tracking-tight, tracking-normal, tracking-wide, tracking-wider, tracking-widest

## Layout
- Display: block, inline-block, inline, flex, inline-flex, grid, inline-grid, hidden
- Position: static, fixed, absolute, relative, sticky
- Flexbox: flex-row, flex-col, flex-wrap, flex-nowrap, justify-start, justify-center, justify-end, justify-between, justify-around, justify-evenly, items-start, items-center, items-end, items-stretch, items-baseline
- Grid: grid-cols-1, grid-cols-2, grid-cols-3, grid-cols-4, grid-cols-5, grid-cols-6, grid-cols-12, grid-rows-1, grid-rows-2, grid-rows-3, grid-rows-4, grid-rows-5, grid-rows-6

## Border & Radius
- Border: border, border-2, border-4, border-8, border-t, border-r, border-b, border-l, border-t-2, border-r-2, border-b-2, border-l-2
- Border Radius: rounded-none, rounded-sm, rounded, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl, rounded-full
- Border Color: border-gray-200, border-gray-300, border-gray-400, border-blue-500, border-red-500, border-green-500, etc.

## Shadow & Effects
- Shadow: shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl, shadow-2xl, shadow-inner, shadow-none
- Opacity: opacity-0, opacity-5, opacity-10, opacity-20, opacity-25, opacity-30, opacity-40, opacity-50, opacity-60, opacity-70, opacity-75, opacity-80, opacity-90, opacity-95, opacity-100
- Transform: scale-0, scale-50, scale-75, scale-90, scale-95, scale-100, scale-105, scale-110, scale-125, scale-150, rotate-0, rotate-1, rotate-2, rotate-3, rotate-6, rotate-12, rotate-45, rotate-90, rotate-180

## Hover & Focus States
- Hover: hover:bg-blue-600, hover:text-white, hover:shadow-lg, hover:scale-105, hover:rotate-1
- Focus: focus:outline-none, focus:ring-2, focus:ring-blue-500, focus:ring-offset-2
- Active: active:bg-blue-700, active:scale-95
- Disabled: disabled:opacity-50, disabled:cursor-not-allowed

## Responsive Design
- Breakpoints: sm:, md:, lg:, xl:, 2xl:
- Example: sm:text-lg, md:text-xl, lg:text-2xl, xl:text-3xl, 2xl:text-4xl

## Common Patterns
- Button Primary: bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200
- Button Secondary: bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200
- Button Success: bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200
- Button Danger: bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200
- Card: bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200
- Input: border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
- Badge: bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full
- Alert Success: bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded
- Alert Warning: bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded
- Alert Error: bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded
- Navigation: bg-white shadow-sm border-b border-gray-200 px-4 py-2
- Footer: bg-gray-800 text-gray-200 py-8 px-4
- Hero Section: bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-4
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
`;
  }

  /**
   * อัปเดตเอกสาร Tailwind CSS
   */
  updateTailwindDocumentation(newDocumentation: string): void {
    this.tailwindDocumentation = newDocumentation;
    console.log(`📚 [AIContentGenerator] อัปเดตเอกสาร Tailwind CSS`);
  }

  /**
   * เพิ่ม Common Pattern ใหม่
   */
  addCommonPattern(name: string, pattern: string): void {
    const patternSection = `- ${name}: ${pattern}`;
    this.tailwindDocumentation += `\n${patternSection}`;
    console.log(`🎨 [AIContentGenerator] เพิ่ม Common Pattern: ${name}`);
  }

  /**
   * ดึงเอกสาร Tailwind CSS ปัจจุบัน
   */
  getTailwindDocumentation(): string {
    return this.tailwindDocumentation;
  }

  /**
   * โหลดเอกสาร Tailwind CSS จากไฟล์ภายนอก
   */
  async loadTailwindDocumentationFromFile(filePath: string): Promise<void> {
    try {
      const response = await fetch(filePath);
      if (response.ok) {
        const documentation = await response.text();
        this.updateTailwindDocumentation(documentation);
        console.log(`📚 [AIContentGenerator] โหลดเอกสาร Tailwind CSS จากไฟล์: ${filePath}`);
      } else {
        console.warn(`⚠️ [AIContentGenerator] ไม่สามารถโหลดไฟล์: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ [AIContentGenerator] ข้อผิดพลาดในการโหลดไฟล์:`, error);
    }
  }

  /**
   * โหลดเอกสาร Tailwind CSS จาก URL
   */
  async loadTailwindDocumentationFromURL(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const documentation = await response.text();
        this.updateTailwindDocumentation(documentation);
        console.log(`📚 [AIContentGenerator] โหลดเอกสาร Tailwind CSS จาก URL: ${url}`);
      } else {
        console.warn(`⚠️ [AIContentGenerator] ไม่สามารถโหลดจาก URL: ${url}`);
      }
    } catch (error) {
      console.error(`❌ [AIContentGenerator] ข้อผิดพลาดในการโหลดจาก URL:`, error);
    }
  }

  /**
   * เรียก AI API โดยตรงด้วย QUESTION_API_KEY
   */
  private async callAIAPI(prompt: string): Promise<string> {
    try {
      const apiKey = process.env.QUESTION_API_KEY;
      
      if (!apiKey) {
        throw new Error('QUESTION_API_KEY not found in environment variables');
      }

      console.log(`🤖 [AIContentGenerator] เรียก AI API โดยตรงด้วย QUESTION_API_KEY`);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          messages: [
            {
              role: 'system',
              content: 'คุณเป็นผู้เชี่ยวชาญด้านการสร้างเนื้อหาเว็บไซต์สำหรับธุรกิจต่างๆ ในประเทศไทย คุณต้องตอบเป็นภาษาอังกฤษที่ถูกต้องและเหมาะสมกับธุรกิจ'
            },
            {
              role: 'user',
              content: prompt
            }
          ],

          response_format: { type: "text" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in AI response');
      }

      return content;

    } catch (error) {
      console.error(`❌ [AIContentGenerator] AI API call failed:`, error);
      throw error; // ส่งต่อ error ให้ caller จัดการ
    }
  }

}

interface BusinessAnalysis {
  businessType: 'food' | 'fashion' | 'technology' | 'health' | 'general';
  tone: 'professional' | 'warm' | 'trendy' | 'modern' | 'trustworthy';
  targetAudience: string;
  brandName: string;
  theme: string;
  customizations: any;
}
