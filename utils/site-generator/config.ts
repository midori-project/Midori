import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.QUESTION_API_KEY,
});

// Site Generation Configuration
export const SITE_GEN_CONFIG = {
  // Model options for different use cases
  models: {
    high_quality: "gpt-5-mini",              // สำหรับคุณภาพสูงสุด (แพง)
    balanced: "gpt-5-mini",                  // สมดุลระหว่างคุณภาพและราคา (แนะนำ)
    budget: "gpt-5-nano",                    // ราคาถูกที่สุด (เร็ว)
  },
  
  // Current model selection - ใช้ model ที่เสถียร
  currentModel: "gpt-4o-mini", // เปลี่ยนเป็น model ที่เสถียรกว่า
  
  // Temperature settings - เพิ่มความหลากหลาย
  temperatures: {
    structure: 0.7,  // เพิ่มขึ้นเพื่อความหลากหลายในโครงสร้าง
    code: 0.5,       // เพิ่มขึ้นเพื่อความหลากหลายในโค้ด
  },
  
  // Advanced settings
  creativity: {
    high: 0.8,      // สำหรับ creative components
    medium: 0.6,    // สำหรับ standard components  
    low: 0.3        // สำหรับ configuration files
  }
};

// Default generation options
export const DEFAULT_GENERATION_OPTIONS = {
  framework: 'vite-react',
  styling: 'tailwind',
  typescript: true,
  features: ['responsive-design', 'modern-ui'],
  pages: ['home', 'about', 'contact']
};


//setting parameter for site generator