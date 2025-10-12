/**
 * Project Initialization Helper
 * Helper functions สำหรับการสร้าง project ใหม่
 */

import { EnhancedContextAdapter } from '../adapters/enhancedContextAdapter';
import { ProjectContextData } from '../types/projectContext';
import { EnhancedProjectContextData } from '../types/enhancedProjectContext';

export interface ProjectInitializationOptions {
  projectId: string;
  projectName: string;
  userInput: string;
  useEnhanced?: boolean;
  businessCategory?: string;
}

export class ProjectInitializationHelper {
  
  /**
   * สร้าง project ใหม่แบบ Smart (เลือกระหว่าง Enhanced/Legacy อัตโนมัติ)
   */
  static async initializeSmartProject(
    options: ProjectInitializationOptions
  ): Promise<ProjectContextData | EnhancedProjectContextData> {
    
    console.log('🚀 Initializing Smart Project...');
    console.log('- Project ID:', options.projectId);
    console.log('- Project Name:', options.projectName);
    console.log('- User Input:', options.userInput);
    
    // สร้าง project ผ่าน adapter
    const projectContext = await EnhancedContextAdapter.createProject(
      options.projectId,
      options.projectName,
      options.userInput,
      {
        useEnhanced: options.useEnhanced,
        businessCategory: options.businessCategory
      }
    );
    
    // Log ประเภทของ context ที่สร้าง
    if (EnhancedContextAdapter.isEnhancedContext(projectContext)) {
      console.log('✅ Created Enhanced Project Context');
      console.log('- Business Category:', projectContext.themePack?.metadata.category || 'N/A');
      console.log('- Blueprint:', projectContext.blueprint?.name || 'N/A');
      console.log('- Components:', projectContext.componentSelection?.selectedComponents.length || 0);
    } else {
      console.log('✅ Created Legacy Project Context');
      console.log('- Project Type:', projectContext.projectType);
      console.log('- Components:', projectContext.components?.length || 0);
    }
    
    return projectContext;
  }
  
  /**
   * ดึง project context แบบ Smart (รองรับทั้ง Enhanced/Legacy)
   */
  static async getSmartProject(
    projectId: string
  ): Promise<ProjectContextData | EnhancedProjectContextData | null> {
    
    console.log('📦 Getting Smart Project Context:', projectId);
    
    const projectContext = await EnhancedContextAdapter.getProject(projectId);
    
    if (!projectContext) {
      console.log('⚠️ Project not found:', projectId);
      return null;
    }
    
    if (EnhancedContextAdapter.isEnhancedContext(projectContext)) {
      console.log('✅ Found Enhanced Project Context');
    } else {
      console.log('✅ Found Legacy Project Context');
    }
    
    return projectContext;
  }
  
  /**
   * Extract project name from user input
   */
  static extractProjectName(userInput: string): string {
    // ลอง extract ชื่อจาก pattern ต่างๆ
    
    // Pattern 1: "สร้างเว็บไซต์ [ชื่อ]"
    const pattern1 = /สร้างเว็บไซต์(.+?)(?:\s|$)/i;
    const match1 = userInput.match(pattern1);
    if (match1 && match1[1]) {
      return match1[1].trim();
    }
    
    // Pattern 2: "create website for [ชื่อ]"
    const pattern2 = /create\s+website\s+for\s+(.+?)(?:\s|$)/i;
    const match2 = userInput.match(pattern2);
    if (match2 && match2[1]) {
      return match2[1].trim();
    }
    
    // Pattern 3: "[ชื่อ] website"
    const pattern3 = /^(.+?)\s+(?:website|เว็บไซต์)/i;
    const match3 = userInput.match(pattern3);
    if (match3 && match3[1]) {
      return match3[1].trim();
    }
    
    // Default: ใช้ user input ตัวแรก 50 ตัวอักษร
    return userInput.substring(0, 50);
  }
  
  /**
   * Detect keywords from user input
   */
  static extractKeywords(userInput: string): string[] {
    const keywords: string[] = [];
    const lowerInput = userInput.toLowerCase();
    
    // Color keywords
    const colorKeywords = [
      'ฟ้า', 'น้ำเงิน', 'blue',
      'แดง', 'red',
      'เขียว', 'green',
      'ส้ม', 'orange',
      'ม่วง', 'purple',
      'ชมพู', 'pink',
      'เหลือง', 'yellow'
    ];
    
    colorKeywords.forEach(color => {
      if (lowerInput.includes(color)) {
        keywords.push(color);
      }
    });
    
    // Style keywords
    const styleKeywords = [
      'modern', 'ทันสมัย', 'โมเดิร์น',
      'classic', 'คลาสสิก',
      'minimal', 'มินิมอล', 'เรียบง่าย',
      'luxury', 'หรูหรา',
      'warm', 'อุ่น',
      'cool', 'เย็น'
    ];
    
    styleKeywords.forEach(style => {
      if (lowerInput.includes(style)) {
        keywords.push(style);
      }
    });
    
    // Feature keywords
    const featureKeywords = [
      'menu', 'เมนู',
      'contact', 'ติดต่อ',
      'about', 'เกี่ยวกับ',
      'reservation', 'จอง',
      'cart', 'ตะกร้า',
      'gallery', 'แกลเลอรี่'
    ];
    
    featureKeywords.forEach(feature => {
      if (lowerInput.includes(feature)) {
        keywords.push(feature);
      }
    });
    
    return keywords;
  }
}

