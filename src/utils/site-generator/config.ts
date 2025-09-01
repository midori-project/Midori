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
  
  // Current model selection - ใช้ GPT-5o-nano
  currentModel: "gpt-5o-nano", 
  
  // Temperature settings - ใช้ค่า default (1) สำหรับ gpt-5
  temperatures: {
    structure: 1,  // ใช้ค่า default (1) สำหรับ gpt-5
    code: 1,       // ใช้ค่า default (1) สำหรับ gpt-5
    creative: 1,   // ใช้ค่า default (1) สำหรับ gpt-5
  },
  
  // Advanced settings
  creativity: {
    high: 1,      // ใช้ค่า default (1) สำหรับ gpt-5
    medium: 1,    // ใช้ค่า default (1) สำหรับ gpt-5
    low: 1        // ใช้ค่า default (1) สำหรับ gpt-5
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