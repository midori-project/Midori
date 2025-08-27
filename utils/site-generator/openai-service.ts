import { openai, SITE_GEN_CONFIG } from './config';
import { OpenAIRequestParams } from './types';

/**
 * OpenAI Service
 * Handles all interactions with OpenAI API
 */
export class OpenAIService {
  
  /**
   * Make OpenAI API request with retry logic and timeout
   */
  static async makeOpenAIRequestWithRetry(
    params: OpenAIRequestParams, 
    maxRetries: number = 3, 
    timeoutMs: number = 120000,
    userIntent?: any
  ): Promise<any> {
    // ปรับ temperature ตาม user intent ถ้ามี
    if (userIntent && !params.temperature) {
      params.temperature = this.getTemperatureForUserIntent(userIntent);
      console.log(`🎨 Using temperature ${params.temperature} for ${userIntent.visualStyle} style`);
    }
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 OpenAI API attempt ${attempt}/${maxRetries}`);
        
        // สร้าง Promise race กับ timeout
        const apiCall = openai.chat.completions.create(params);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('OpenAI API timeout')), timeoutMs)
        );
        
        const result = await Promise.race([apiCall, timeoutPromise]);
        console.log(`✅ OpenAI API success on attempt ${attempt}`);
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.log(`❌ OpenAI API attempt ${attempt} failed:`, error.message);
        
        // ถ้าเป็น attempt สุดท้าย ก็ throw error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // รอ exponential backoff ก่อน retry
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError || new Error('All OpenAI API attempts failed');
  }

  /**
   * Get appropriate temperature for different file types
   */
  static getTemperatureForFile(filePath: string): number {
    const fileName = filePath.toLowerCase();
    
    // Configuration files need lower temperature (more predictable)
    if (fileName.includes('config') || fileName.includes('package.json') || fileName.includes('tsconfig')) {
      return 0.3;
    }
    
    // Component files need moderate temperature
    if (fileName.includes('component') || fileName.includes('.tsx') || fileName.includes('.jsx')) {
      return 0.7;
    }
    
    // Page files can be more creative
    if (fileName.includes('page') || fileName.includes('layout')) {
      return 0.8;
    }
    
    // Default temperature
    return 0.7;
  }

  /**
   * Parse JSON response from OpenAI
   */
  static parseJSONResponse(response: string): any {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // If no JSON blocks found, try to parse the entire response
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.log('Raw response:', response);
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  /**
   * Clean code response from OpenAI (remove markdown blocks)
   */
  static cleanCodeResponse(content: string): string {
    return content
      .replace(/```[a-zA-Z]*\n?/g, '')
      .replace(/```/g, '')
      .trim();
  }

  /**
   * Get temperature for user intent
   */
  private static getTemperatureForUserIntent(userIntent: any): number {
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
