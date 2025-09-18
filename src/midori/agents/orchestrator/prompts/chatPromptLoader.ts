/**
 * 📋 Chat Prompt Loader
 * โหลดและจัดการ chat prompts จากไฟล์ .md
 */

import fs from 'fs/promises';
import path from 'path';

export interface ChatPromptTemplates {
  base: string;
  introduction: string;
  greeting: string;
  securityDenial: string;
  midoriIdentity: string;
  technologyExplanation: string;
  baseChat: string;
  unclearIntent: string;
  
  // Optional fields for backward compatibility
  contextAware?: string;
  helpGuidance?: string;
  platformName?: string;
  errorRecovery?: string;
  projectContextAware?: string;
  offTopic?: string;
}

export class ChatPromptLoader {
  private static instance: ChatPromptLoader;
  private prompts: ChatPromptTemplates | null = null;
  private promptsPath: string;

  constructor() {
    // รองรับ path override ผ่าน environment variable
    const customPath = process.env.CHAT_PROMPTS_PATH;
    this.promptsPath = customPath 
      ? path.resolve(customPath)
      : path.join(process.cwd(), 'src/midori/agents/orchestrator/prompts/chat-prompts.md');
  }

  static getInstance(): ChatPromptLoader {
    if (!ChatPromptLoader.instance) {
      ChatPromptLoader.instance = new ChatPromptLoader();
    }
    return ChatPromptLoader.instance;
  }

  /**
   * โหลด chat prompts จากไฟล์
   */
  async loadPrompts(): Promise<ChatPromptTemplates> {
    if (this.prompts) {
      console.log(`✅ Prompts already loaded, returning cached version`);
      return this.prompts;
    }

    try {
      console.log(`📁 Loading prompts from: ${this.promptsPath}`);
      const content = await fs.readFile(this.promptsPath, 'utf-8');
      console.log(`📄 Loaded file content: ${content.length} characters`);
      
      this.prompts = this.parsePrompts(content);
      console.log(`🎯 Parsed prompts:`, Object.keys(this.prompts));
      console.log('✅ Chat prompts loaded successfully');
      return this.prompts;
    } catch (error) {
      console.error(`❌ Failed to load prompts from ${this.promptsPath}:`, error);
      console.log(`🔄 Using fallback prompts instead`);
      return this.getFallbackPrompts();
    }
  }

  /**
   * Parse prompts จาก markdown content ด้วย anchor-based parsing
   */
  private parsePrompts(content: string): ChatPromptTemplates {
    const prompts: Partial<ChatPromptTemplates> = {};

    // รายการ template keys ที่รองรับ (ตรงกับ orchestrator ที่ใช้จริง)
    const templateKeys = [
      'introduction', 'greeting', 'security_sensitive', 'midori_identity', 
      'technology_explanation', 'base_chat', 'unclear'
    ];

    const missing: string[] = [];

    // Key mapping จาก orchestrator → chatPromptLoader format
    const keyMapping: Record<string, keyof ChatPromptTemplates> = {
      'introduction': 'introduction',
      'greeting': 'greeting', 
      'security_sensitive': 'securityDenial',
      'midori_identity': 'midoriIdentity',
      'technology_explanation': 'technologyExplanation',
      'base_chat': 'baseChat',
      'unclear': 'unclearIntent'
    };

    // ใช้ anchor-based parsing แทน regex pattern matching
    for (const key of templateKeys) {
      const mappedKey = keyMapping[key];
      const extracted = this.extractByAnchor(content, key);
      
      if (extracted && mappedKey) {
        prompts[mappedKey] = extracted;
        console.log(`✅ Mapped ${key} → ${mappedKey}`);
      } else {
        missing.push(key);
      }
    }

    // Log รายการ prompt ที่หายไป
    if (missing.length > 0) {
      console.warn(`⚠️ Missing chat prompts: ${missing.join(', ')}`);
    }

    console.log(`✅ Parsed ${Object.keys(prompts).length}/${templateKeys.length} chat prompts`);

    return prompts as ChatPromptTemplates;
  }

  /**
   * Helper function ดึงข้อความระหว่าง anchor tags
   */
  private extractByAnchor(content: string, key: string): string | null {
    const startAnchor = `<!-- prompt:${key}:start -->`;
    const endAnchor = `<!-- prompt:${key}:end -->`;
    
    console.log(`🔍 Looking for prompt: ${key}`);
    
    const startIndex = content.indexOf(startAnchor);
    const endIndex = content.indexOf(endAnchor);
    
    if (startIndex === -1) {
      console.warn(`❌ Start anchor not found for: ${key} (looking for: ${startAnchor})`);
      return null;
    }
    
    if (endIndex === -1) {
      console.warn(`❌ End anchor not found for: ${key} (looking for: ${endAnchor})`);
      return null;
    }
    
    if (startIndex >= endIndex) {
      console.warn(`❌ Invalid anchor positions for: ${key}`);
      return null;
    }
    
    const startPos = startIndex + startAnchor.length;
    const extracted = content.substring(startPos, endIndex).trim();
    
    console.log(`✅ Found prompt: ${key} (${extracted.length} chars)`);
    
    // ลบ markdown code blocks ถ้ามี
    if (extracted.startsWith('```') && extracted.endsWith('```')) {
      const lines = extracted.split('\n');
      lines.shift(); // ลบ ```
      lines.pop();   // ลบ ```
      return lines.join('\n').trim();
    }
    
    return extracted;
  }

  /**
   * Fallback prompts ถ้าโหลดไฟล์ไม่ได้
   */
  private getFallbackPrompts(): ChatPromptTemplates {
    console.log('⚠️ Using fallback chat prompts');
    
    return {
      base: `คุณเป็น Midori AI ผู้ช่วยสร้างเว็บไซต์ที่เป็นมิตร

User พูดว่า: "{input}"

**ข้อจำกัดสำคัญ: ตอบเฉพาะเรื่องที่เกี่ยวข้องกับการสร้างเว็บไซต์เท่านั้น**

หากถูกถามเรื่องที่ไม่เกี่ยวข้องกับเว็บไซต์:
ขออภัยครับ ผมเป็นผู้ช่วยเฉพาะเรื่องการสร้างเว็บไซต์ ถ้ามีคำถามเกี่ยวกับการทำเว็บ UI/UX หรือการเขียนโปรแกรม บอกผมได้เลยครับ!

ตอบแบบเป็นมิตรและให้ข้อมูลที่เป็นประโยชน์
ตอบเป็นภาษาไทยแบบสั้น ๆ กระชับ (ไม่เกิน 100 คำ)`,

      introduction: `ผมคือ Midori AI ครับ! 👋
ผม​ช่วยสร้างเว็บไซต์ด้วย React, TypeScript และ Supabase
บอกผมได้เลยครับว่าต้องการช่วยอะไร! 🚀`,

      greeting: `สวัสดีครับ! ยินดีต้อนรับสู่ Midori AI 🌿
ผมพร้อมช่วยคุณสร้างเว็บไซต์ที่ยอดเยี่ยม!
บอกผมได้เลยครับว่าต้องการอะไร 😊`,

      securityDenial: `ขออภัยครับ ผมไม่สามารถแชร์ข้อมูลลับหรือรหัสผ่านได้เพื่อความปลอดภัย 🔒`,

      midoriIdentity: `User ถาม: "{input}"
Midori AI คือแพลตฟอร์มสร้างเว็บไซต์ Full-Stack (React + TypeScript + Supabase) จากข้อความธรรมชาติ
- ได้โค้ดจริง ปรับแต่งและ deploy ได้
- ไม่มีส่วนเกี่ยวข้องกับ Midori Browser
ชวนผู้ใช้บอกประเภทเว็บหรือฟีเจอร์ที่ต้องการ`,

      technologyExplanation: `User ถาม: "{input}"
อธิบายเทคโนโลยีแบบเข้าใจง่าย เน้นประโยชน์และการใช้งานจริง
ตอบเป็นภาษาไทยแบบเข้าใจง่าย`,

      baseChat: `User พูดว่า: "{input}"

ตอบแบบเป็นมิตรและให้ข้อมูลที่เป็นประโยชน์เกี่ยวกับการสร้างเว็บไซต์
ตอบเป็นภาษาไทยแบบสั้น ๆ กระชับ (ไม่เกิน 100 คำ)`,

      unclearIntent: `ผมไม่ค่อยแน่ใจว่าคุณต้องการให้ผมช่วยอะไรครับ 🤔
กรุณาอธิบายเพิ่มเติมนิดหนึ่งครับ แล้วผมจะช่วยให้ได้ดีที่สุด! 😊`,

      // Optional backward compatibility fields
      contextAware: `User พูดว่า: "{input}"
Previous: {context}
ตอบโดยอ้างอิงถึงบทสนทนาก่อนหน้า
ตอบเป็นภาษาไทยแบบเป็นธรรมชาติ`,

      helpGuidance: `User ต้องการความช่วยเหลือ: "{input}"

หากคำถามเกี่ยวข้องกับเว็บไซต์:
ให้คำแนะนำที่เป็นประโยชน์และชี้ทางที่ชัดเจน

หากคำถามไม่เกี่ยวข้องกับเว็บไซต์:
ขออภัยครับ ผมเชี่ยวชาญเฉพาะเรื่องการสร้างเว็บไซต์ หากมีคำถามเกี่ยวกับการเขียนโปรแกรม UI/UX หรือเทคโนโลยีเว็บ บอกผมได้เลยครับ!

ตอบแบบเป็นขั้นตอน ชัดเจน`,

      platformName: `แพลตฟอร์มของเราชื่อ **Midori** 🌿

เป็น AI-powered website generator ที่สร้างเว็บไซต์ตามความต้องการของผู้ใช้ 

คุณต้องการสร้างเว็บไซต์แบบไหนครับ?`,

      errorRecovery: `เกิดข้อผิดพลาดเล็กน้อยครับ แต่ไม่ต้องกังวล! 🔧
ผมพร้อมช่วยแก้ไขและหาทางออกที่ดีที่สุด
บอกผมได้เลยครับว่าต้องการให้ลองใหม่อย่างไร 💪`,

      projectContextAware: `User พูดว่า: "{input}"
Project: {projectName}
Recent work: {recentWork}

ตอบโดยเชื่อมโยงกับโปรเจคปัจจุบัน ให้คำแนะนำที่สอดคล้องกับงานที่กำลังทำ
ตอบเป็นภาษาไทยแบบเฉพาะเจาะจง (ไม่เกิน 100 คำ)`,

      offTopic: `ขออภัยครับ ผมเป็นผู้ช่วยเฉพาะเรื่องการสร้างเว็บไซต์ 

ถ้ามีคำถามเกี่ยวกับการทำเว็บ UI/UX หรือการเขียนโปรแกรม บอกผมได้เลยครับ! 🚀`
    };
  }

  /**
   * Get specific prompt template with parameter substitution and validation
   */
  async getPrompt(
    type: keyof ChatPromptTemplates, 
    params: Record<string, string> = {}
  ): Promise<string> {
    console.log(`📋 ChatPromptLoader.getPrompt called with key: ${type}`);
    
    const prompts = await this.loadPrompts();
    let template = prompts[type];

    // Guard: ตรวจสอบว่า template มีอยู่จริง
    if (!template || template.trim() === '') {
      console.warn(`⚠️ Template '${type}' not found or empty, using fallback`);
      console.error(`❌ Available templates:`, Object.keys(prompts));
      
      // คืน fallback เฉพาะกรณี หรือ empty string
      const fallbackPrompts = this.getFallbackPrompts();
      template = fallbackPrompts[type] || '';
      
      if (!template) {
        console.error(`❌ No fallback available for template '${type}'`);
        return '';
      }
    } else {
      console.log(`✅ Template '${type}' found: ${template.substring(0, 100)}...`);
    }

    // Substitute parameters with escaped regex
    if (Object.keys(params).length > 0) {
      console.log(`🔧 Replacing variables:`, params);
    }
    
    for (const [key, value] of Object.entries(params)) {
      // Escape พารามิเตอร์เพื่อป้องกันอักขระพิเศษใน regex
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`{${escapedKey}}`, 'g');
      const oldTemplate: string = template;
      template = template.replace(regex, value);
      
      if (oldTemplate !== template) {
        console.log(`✅ Replaced {${key}} with: ${String(value).substring(0, 50)}...`);
      }
    }

    console.log(`📤 Final prompt result: ${template.substring(0, 150)}...`);
    return template;
  }

  /**
   * Clear cache - ใช้สำหรับ development/testing
   */
  clearCache(): void {
    this.prompts = null;
  }
}

// Export singleton instance
export const chatPromptLoader = ChatPromptLoader.getInstance();