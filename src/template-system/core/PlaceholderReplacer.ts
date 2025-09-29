/**
 * PlaceholderReplacer - ตัวแทนที่ Placeholder ทั้งหมดใน template
 * รองรับ placeholder ประเภท: <tw/>, <text/>, <img/>, <data key="..."/>, {{slot.field}}
 * ใช้ AI ในการสร้างเนื้อหาสำหรับ placeholder แต่ละตัว
 */

import { PlaceholderMatch, PlaceholderReplacement, PlaceholderType } from '../types/Placeholder';
import { UserData, Template } from '../types/Template';
import { AIContentGenerator } from './AIContentGenerator';
import { mergeTw } from '../utils/tw';

export class PlaceholderReplacer {
  private placeholderPatterns: Map<PlaceholderType, RegExp> = new Map();
  private aiContentGenerator: AIContentGenerator;

  constructor() {
    this.initializePatterns();
    this.aiContentGenerator = new AIContentGenerator();
  }

  /**
   * เริ่มต้น regex patterns สำหรับ placeholder แต่ละประเภท
   */
  private initializePatterns(): void {
    this.placeholderPatterns.set('tw', /<tw\/>/g);
    this.placeholderPatterns.set('text', /<text\/>/g);
    this.placeholderPatterns.set('img', /<img\/>/g);
    this.placeholderPatterns.set('data', /<data\s+key="([^"]+)"\/>/g);
    this.placeholderPatterns.set('slot', /\{\{\s*([^}]+)\s*\}\}/g);
  }

  /**
   * แทนที่ placeholder ทั้งหมดในเนื้อหา (พร้อม AI)
   */
  async replacePlaceholders(content: string, data: any, template?: Template): Promise<string> {
    console.log(`🔄 [PlaceholderReplacer] เริ่มแทนที่ placeholder ในเนื้อหา (${content.length} ตัวอักษร)`);
    
    let processedContent = content;
    let replacementCount = 0;

    // แทนที่ placeholder แต่ละประเภท
    for (const [type, pattern] of this.placeholderPatterns) {
      const matches = this.findMatches(processedContent, type, pattern);
      
      for (const match of matches) {
        const replacement = await this.processPlaceholder(match, data, template);
        if (replacement.success) {
          processedContent = processedContent.replace(match.fullMatch, replacement.replacement);
          replacementCount++;
          console.log(`✅ [PlaceholderReplacer] แทนที่ ${type} placeholder: "${match.fullMatch}" → "${replacement.replacement.substring(0, 50)}..."`);
        } else {
          console.warn(`⚠️ [PlaceholderReplacer] ไม่สามารถแทนที่ ${type} placeholder: ${replacement.error}`);
        }
      }
    }

    console.log(`🎉 [PlaceholderReplacer] แทนที่ placeholder เสร็จสิ้น: ${replacementCount} จุด`);
    return processedContent;
  }

  /**
   * ค้นหา placeholder matches ในเนื้อหา
   */
  private findMatches(content: string, type: PlaceholderType, pattern: RegExp): PlaceholderMatch[] {
    const matches: PlaceholderMatch[] = [];
    let match;

    while ((match = pattern.exec(content)) !== null) {
      // Attempt to infer surrounding tag and className
      const before = content.lastIndexOf('<', match.index);
      const after = content.indexOf('>', match.index);
      const tagChunk = before >= 0 && after > before ? content.slice(before, after + 1) : '';
      const tagName = (tagChunk.match(/^<\s*([a-zA-Z0-9-]+)/)?.[1]) || undefined;
      const classHint = (tagChunk.match(/class(Name)?="([^"]*)"/)
        || tagChunk.match(/class(Name)?=\{`([^`}]*)`\}/)
      )?.[2];

      matches.push({
        fullMatch: match[0],
        type,
        key: match[1] || undefined,
        position: match.index,
        context: {
          file: 'unknown',
          line: this.getLineNumber(content, match.index),
          tagName,
          classHint
        } as any
      });
    }

    return matches;
  }

  /**
   * ประมวลผล placeholder แต่ละตัว (พร้อม AI)
   */
  private async processPlaceholder(match: PlaceholderMatch, data: any, template?: Template): Promise<PlaceholderReplacement> {
    try {
      let replacement = '';

      // ลองใช้ AI ก่อน (ถ้ามี template)
      if (template && data.useAI !== false) {
        try {
          replacement = await this.aiContentGenerator.generatePlaceholderContent(match, data, template);
          console.log(`🤖 [PlaceholderReplacer] ใช้ AI สร้าง ${match.type} placeholder: "${replacement.substring(0, 50)}..."`);
        } catch (aiError) {
          console.warn(`⚠️ [PlaceholderReplacer] AI ล้มเหลว, ใช้ fallback สำหรับ ${match.type}:`, aiError);
          replacement = await this.processFallbackPlaceholder(match, data);
        }
      } else {
        // ใช้วิธีเดิม
        replacement = await this.processFallbackPlaceholder(match, data);
      }

      return {
        original: match.fullMatch,
        replacement,
        type: match.type,
        success: true
      };

    } catch (error) {
      return {
        original: match.fullMatch,
        replacement: match.fullMatch, // คงเดิมไว้
        type: match.type,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ประมวลผล placeholder แบบ fallback (ไม่ใช้ AI)
   */
  private async processFallbackPlaceholder(match: PlaceholderMatch, data: any): Promise<string> {
    switch (match.type) {
      case 'tw':
        return this.processTailwindPlaceholder(match, data);
      case 'text':
        return this.processTextPlaceholder(match, data);
      case 'img':
        return this.processImagePlaceholder(match, data);
      case 'data':
        return this.processDataPlaceholder(match, data);
      case 'slot':
        return this.processSlotPlaceholder(match, data);
      default:
        throw new Error(`Unknown placeholder type: ${match.type}`);
    }
  }

  /**
   * ประมวลผล Tailwind CSS placeholder (<tw/>)
   */
  private processTailwindPlaceholder(match: PlaceholderMatch, data: any): string {
    const theme = data.theme || 'modern';
    const customizations = data.customizations || {};

    // กำหนด Tailwind classes ตาม theme
    const themeClasses = this.getThemeClasses(theme, customizations);
    
    // กำหนด context-specific classes
    const contextClasses = this.getContextClasses(match, data);

    // รวมและแก้ชนกันของคลาส
    return mergeTw(themeClasses, contextClasses);
  }

  /**
   * ประมวลผล Text placeholder (<text/>)
   */
  private processTextPlaceholder(match: PlaceholderMatch, data: any): string {
    // ใช้ AI-generated content หรือ fallback
    const aiContent = data.aiContent || {};
    const userContent = data.content || {};
    
    // ลำดับความสำคัญ: AI content > User content > Default
    const textContent = aiContent.text || userContent.text || this.getDefaultText(match, data);
    
    return textContent;
  }

  /**
   * ประมวลผล Image placeholder (<img/>)
   */
  private processImagePlaceholder(match: PlaceholderMatch, data: any): string {
    const images = data.images || {};
    const aiContent = data.aiContent || {};
    
    // ลำดับความสำคัญ: User images > AI generated > Placeholder
    const imageUrl = images.url || aiContent.imageUrl || this.getPlaceholderImage(match, data);
    
    return imageUrl;
  }

  /**
   * ประมวลผล Data placeholder (<data key="..."/>)
   */
  private processDataPlaceholder(match: PlaceholderMatch, data: any): string {
    if (!match.key) {
      throw new Error('Data placeholder missing key attribute');
    }

    const dynamicData = data.dynamicData || {};
    const value = this.getNestedValue(dynamicData, match.key);
    
    if (value === undefined) {
      throw new Error(`Data key '${match.key}' not found`);
    }

    return String(value);
  }

  /**
   * ประมวลผล Slot placeholder ({{slot.field}})
   */
  private processSlotPlaceholder(match: PlaceholderMatch, data: any): string {
    if (!match.key) {
      throw new Error('Slot placeholder missing key');
    }

    const slots = data.slots || {};
    const value = this.getNestedValue(slots, match.key);
    
    if (value === undefined) {
      throw new Error(`Slot key '${match.key}' not found`);
    }

    return String(value);
  }

  /**
   * กำหนด Tailwind classes ตาม theme
   */
  private getThemeClasses(theme: string, customizations: any): string {
    // Keep theme primitives minimal to avoid broad conflicts; background handled by context
    const themeMappings: Record<string, string> = {
      'modern': 'text-black',
      'cozy': 'text-black',
      'minimal': 'text-black'
    };

    return themeMappings[theme] || themeMappings['modern'];
  }

  /**
   * กำหนด context-specific classes
   */
  private getContextClasses(match: PlaceholderMatch, data: any): string {
    // วิเคราะห์ context จาก surrounding content
    const context = this.analyzeContext(match, data);
    
    switch (context) {
      case 'button':
        return 'bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium transition-colors';
      case 'heading':
        return 'text-3xl md:text-4xl font-semibold leading-tight';
      case 'card':
        return 'bg-white shadow-md rounded-lg p-6';
      case 'header':
        return 'bg-white border-b shadow-sm';
      case 'footer':
        return 'bg-gray-900 text-gray-200';
      default:
        return '';
    }
  }

  /**
   * วิเคราะห์ context ของ placeholder
   */
  private analyzeContext(match: PlaceholderMatch, data: any): string {
    // วิเคราะห์จาก surrounding tag และ classHint ที่ findMatches จับมา
    const ctx: any = (match as any).context || {};
    const tag = (ctx.tagName || '').toLowerCase();
    if (tag === 'button') return 'button';
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') return 'heading';
    if (tag === 'header') return 'header';
    if (tag === 'footer') return 'footer';
    if (tag === 'div' && typeof ctx.classHint === 'string' && /card/.test(ctx.classHint)) return 'card';
    return 'generic';
  }

  /**
   * กำหนดข้อความเริ่มต้น
   */
  private getDefaultText(match: PlaceholderMatch, data: any): string {
    const brandName = data.brandName || 'ร้านค้าออนไลน์';
    
    // กำหนดข้อความเริ่มต้นตาม context
    return `${brandName} - ข้อความเริ่มต้น`;
  }

  /**
   * กำหนดรูปภาพ placeholder
   */
  private getPlaceholderImage(match: PlaceholderMatch, data: any): string {
    const brandName = data.brandName || 'ร้านค้า';
    
    // ใช้ placeholder service
    return `https://via.placeholder.com/800x600/3b82f6/ffffff?text=${encodeURIComponent(brandName)}`;
  }

  /**
   * ดึงค่าจาก nested object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * คำนวณหมายเลขบรรทัด
   */
  private getLineNumber(content: string, position: number): number {
    return content.substring(0, position).split('\n').length;
  }

  /**
   * ตรวจสอบว่าเนื้อหายังมี placeholder หรือไม่
   */
  hasRemainingPlaceholders(content: string): boolean {
    for (const pattern of this.placeholderPatterns.values()) {
      if (pattern.test(content)) {
        return true;
      }
    }
    return false;
  }

  /**
   * นับจำนวน placeholder ที่เหลือ
   */
  countRemainingPlaceholders(content: string): Record<PlaceholderType, number> {
    const counts: Record<PlaceholderType, number> = {
      tw: 0,
      text: 0,
      img: 0,
      data: 0,
      slot: 0
    };

    for (const [type, pattern] of this.placeholderPatterns) {
      const matches = content.match(pattern);
      counts[type] = matches ? matches.length : 0;
    }

    return counts;
  }
}
