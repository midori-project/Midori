import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.QUESTION_API_KEY,
});

// Site Generation Configuration
export const SITE_GEN_CONFIG = {
  // Model options for different use cases - แก้ไขให้ใช้ model ที่มีจริง
  models: {
    high_quality: "gpt-4o",                      // สำหรับคุณภาพสูงสุด
    balanced: "gpt-4o-mini",                     // สมดุลระหว่างคุณภาพและราคา
    budget: "gpt-3.5-turbo",                     // ราคาถูกที่สุด (เร็ว)
  },
  
  // Current model selection - ใช้ GPT-4o-mini เพื่อความสมดุล
  currentModel: "gpt-4o-mini", 
  
  // Temperature settings - เพิ่มความหลากหลาย
  temperatures: {
    structure: 0.8,  // เพิ่มความหลากหลายในโครงสร้าง
    code: 0.7,       // เพิ่มความหลากหลายในโค้ด
    creative: 0.9,   // สำหรับ creative components
  },
  
  // Advanced settings
  creativity: {
    high: 0.9,      // สำหรับ creative components
    medium: 0.7,    // สำหรับ standard components  
    low: 0.4        // สำหรับ configuration files
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