/**
 * Enhanced Context Adapter
 * Adapter สำหรับเชื่อม Legacy System กับ Enhanced Project Context
 */

import { ProjectContextOrchestratorService } from '../services/projectContextOrchestratorService';
import type { ProjectContextData } from '../types/projectContext';
import type { EnhancedProjectContextData } from '../types/enhancedProjectContext';
import { ProjectType } from '@prisma/client';

export class EnhancedContextAdapter {
  
  /**
   * สร้าง project ใหม่ (ตรวจสอบว่าควรใช้ Enhanced หรือ Legacy)
   */
  static async createProject(
    projectId: string,
    projectName: string,
    userInput: string,
    options?: {
      useEnhanced?: boolean;
      businessCategory?: string;
      projectType?: ProjectType;
    }
  ): Promise<ProjectContextData | EnhancedProjectContextData> {
    
    const useEnhanced = options?.useEnhanced ?? this.shouldUseEnhanced(userInput);
    
    if (useEnhanced) {
      console.log('🆕 Using Enhanced Project Context (Component-Based)');
      
      // ตรวจหา business category จาก user input
      const businessCategory = options?.businessCategory || 
        this.detectBusinessCategory(userInput);
      
      return await ProjectContextOrchestratorService.initializeEnhancedProject(
        projectId,
        projectName,
        businessCategory,
        userInput,
        {
          useComponentBased: true
        }
      );
    } else {
      console.log('🏛️ Using Legacy Project Context (Template-Based)');
      
      const projectType = options?.projectType || this.mapCategoryToProjectType(
        options?.businessCategory || 'business'
      );
      
      return await ProjectContextOrchestratorService.initializeProject(
        projectId,
        'default_spec',
        projectType,
        projectName,
        userInput
      );
    }
  }
  
  /**
   * ดึง project context (รองรับทั้ง Enhanced และ Legacy)
   */
  static async getProject(
    projectId: string
  ): Promise<ProjectContextData | EnhancedProjectContextData | null> {
    
    // พยายามดึง Enhanced context ก่อน
    const enhancedContext = await ProjectContextOrchestratorService.getEnhancedProjectContext(projectId);
    
    if (enhancedContext) {
      console.log('📦 Found Enhanced Project Context');
      return enhancedContext;
    }
    
    // ถ้าไม่มี ให้ดึง Legacy context
    const legacyContext = await ProjectContextOrchestratorService.getProjectContext(projectId);
    
    if (legacyContext) {
      console.log('📦 Found Legacy Project Context');
      return legacyContext;
    }
    
    return null;
  }
  
  /**
   * ตรวจสอบว่าควรใช้ Enhanced Context หรือไม่
   */
  private static shouldUseEnhanced(userInput: string): boolean {
    // Keywords ที่บ่งชี้ว่าควรใช้ Enhanced Context
    const enhancedKeywords = [
      'component',
      'modern',
      'responsive',
      'beautiful',
      'สวย',
      'ทันสมัย',
      'โมเดิร์น'
    ];
    
    const lowerInput = userInput.toLowerCase();
    return enhancedKeywords.some(keyword => lowerInput.includes(keyword));
  }
  
  /**
   * ตรวจหา business category จาก user input
   */
  private static detectBusinessCategory(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
    // Restaurant keywords
    if (
      lowerInput.includes('ร้านอาหาร') ||
      lowerInput.includes('restaurant') ||
      lowerInput.includes('อาหาร') ||
      lowerInput.includes('food') ||
      lowerInput.includes('เมนู') ||
      lowerInput.includes('menu')
    ) {
      return 'restaurant';
    }
    
    // E-commerce keywords
    if (
      lowerInput.includes('ร้านค้า') ||
      lowerInput.includes('shop') ||
      lowerInput.includes('store') ||
      lowerInput.includes('ขาย') ||
      lowerInput.includes('สินค้า') ||
      lowerInput.includes('product') ||
      lowerInput.includes('หนังสือ') ||
      lowerInput.includes('book')
    ) {
      return 'ecommerce';
    }
    
    // Portfolio keywords
    if (
      lowerInput.includes('portfolio') ||
      lowerInput.includes('ผลงาน') ||
      lowerInput.includes('creative') ||
      lowerInput.includes('designer')
    ) {
      return 'portfolio';
    }
    
    // Healthcare keywords
    if (
      lowerInput.includes('clinic') ||
      lowerInput.includes('hospital') ||
      lowerInput.includes('คลินิก') ||
      lowerInput.includes('โรงพยาบาล') ||
      lowerInput.includes('doctor') ||
      lowerInput.includes('แพทย์')
    ) {
      return 'healthcare';
    }
    
    // Pharmacy keywords
    if (
      lowerInput.includes('pharmacy') ||
      lowerInput.includes('drugstore') ||
      lowerInput.includes('ร้านขายยา') ||
      lowerInput.includes('ยา') ||
      lowerInput.includes('เภสัช')
    ) {
      return 'pharmacy';
    }
    
    // Default
    return 'business';
  }
  
  /**
   * แปลง business category เป็น ProjectType (สำหรับ Legacy)
   */
  private static mapCategoryToProjectType(category: string): ProjectType {
    const mapping: Record<string, ProjectType> = {
      'restaurant': 'restaurant',
      'ecommerce': 'e_commerce',
      'portfolio': 'portfolio',
      'healthcare': 'business',
      'pharmacy': 'business',
      'business': 'business'
    };
    
    return mapping[category] || 'business';
  }
  
  /**
   * ตรวจสอบว่าเป็น Enhanced Context หรือไม่
   */
  static isEnhancedContext(
    context: ProjectContextData | EnhancedProjectContextData
  ): context is EnhancedProjectContextData {
    return 'migrationStatus' in context && 'version' in context;
  }
}

