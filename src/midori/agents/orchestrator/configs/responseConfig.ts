/**
 * 🎯 Response Configuration
 * กำหนดค่า max_completion_tokens และ reasoning effort สำหรับแต่ละประเภทการตอบ
 */

export interface ResponseConfig {
  maxCompletionTokens?: number;
  reasoning?: {
    effort: 'minimal' | 'low' | 'medium' | 'high';
  };
  text?: {
    verbosity: 'low' | 'medium' | 'high';
  };
  description: string;
}

/**
 * 🎭 Response Configuration สำหรับแต่ละสถานการณ์
 */
export const RESPONSE_CONFIGS: Record<string, ResponseConfig> = {
  // 💬 Chat Responses - สั้น กระชับ
  greeting: {
    maxCompletionTokens: 2000,        // ทักทายสั้น ๆ
    reasoning: { effort: 'minimal' },
    text: { verbosity: 'low' },
    description: 'การทักทายแบบสั้น ๆ เป็นมิตรไม่เกิน 20 คำ'
  },

  introduction: {
    maxCompletionTokens: 2000,        // แนะนำตัวสั้น ๆ
    reasoning: { effort: 'minimal' },
    text: { verbosity: 'low' },
    description: 'การแนะนำตัวแบบกระชับ'
  },

  midoriIdentity: {
    maxCompletionTokens: 2000,        // อธิบาย Midori แบบย่อ
    reasoning: { effort: 'medium' },
    text: { verbosity: 'low' },
    description: 'อธิบายเกี่ยวกับ Midori แบบกระชับ'
  },

  technologyExplanation: {
    maxCompletionTokens: 2000,        // อธิบายเทคโนโลยีแบบไม่ยาว
    reasoning: { effort: 'low' },
    text: { verbosity: 'medium' },
    description: 'อธิบายเทคโนโลยีแบบเข้าใจง่าย'
  },

  // 🗣️ General Chat - ปานกลาง
  baseChat: {
    maxCompletionTokens: 2000,        // คุยธรรมดา
    reasoning: { effort: 'medium' },
    text: { verbosity: 'low' },
    description: 'การสนทนาทั่วไป'
  },

  contextAware: {
    maxCompletionTokens: 8000,        // คำนึงถึง context
    reasoning: { effort: 'medium' },
    text: { verbosity: 'low' },
    description: 'การตอบที่คำนึงถึง context'
  },

  projectContextAware: {
    maxCompletionTokens: 2000,        // มี project context
    reasoning: { effort: 'medium' },
    text: { verbosity: 'medium' },
    description: 'การตอบที่เกี่ยวข้องกับโปรเจค'
  },

  // 🧠 Analysis & Tasks - ยาวขึ้น, ใช้ reasoning มากขึ้น
  intentAnalysis: {
    maxCompletionTokens: 2000,        // วิเคราะห์ intent แบบรวดเร็ว
    reasoning: { effort: 'low' },
    text: { verbosity: 'low' },      // ต้องการ JSON กระชับ
    description: 'การวิเคราะห์ intent ของ user'
  },

  taskSummary: {
    maxCompletionTokens: 2000,        // สรุปงานไม่ยาว
    reasoning: { effort: 'low' },
    text: { verbosity: 'medium' },
    description: 'การสรุปผลการทำงาน'
  },

  complexTaskAnalysis: {
    maxCompletionTokens: 2000,        // งานซับซ้อนต้องใช้ reasoning มาก
    reasoning: { effort: 'medium' },
    text: { verbosity: 'medium' },
    description: 'การวิเคราะห์งานที่ซับซ้อน'
  },

  // 🔄 Clarification & Fallback
  unclearIntent: {
    maxCompletionTokens: 2000,        // ถามให้ชัดเจนแบบสั้น
    reasoning: { effort: 'minimal' },
    text: { verbosity: 'medium' },
    description: 'การขอให้ผู้ใช้ชี้แจงเพิ่มเติม'
  },

  fallback: {
    maxCompletionTokens: 2000,        // ข้อความ error แบบสั้น
    reasoning: { effort: 'minimal' },
    text: { verbosity: 'low' },
    description: 'ข้อความ fallback เมื่อเกิดข้อผิดพลาด'
  },

  // 🛡️ Security & Special Cases
  securityDenial: {
    maxCompletionTokens: 2000,        // ปฏิเสธการร้องขอที่ไม่ปลอดภัย
    reasoning: { effort: 'minimal' },
    text: { verbosity: 'low' },
    description: 'การปฏิเสธคำขอที่เกี่ยวข้องกับความปลอดภัย'
  },

  timeQuery: {
    maxCompletionTokens: 100,         // ตอบเวลาแบบสั้น ๆ
    reasoning: { effort: 'minimal' },
    text: { verbosity: 'low' },
    description: 'การตอบคำถามเกี่ยวกับเวลา'
  }
};

/**
 * 🎯 Helper function: ดึง response config ตามประเภท
 */
export function getResponseConfig(
  type: keyof typeof RESPONSE_CONFIGS,
  overrides?: Partial<ResponseConfig>
): ResponseConfig {
  const baseConfig = RESPONSE_CONFIGS[type] || RESPONSE_CONFIGS.baseChat;
  
  return {
    ...baseConfig,
    ...overrides
  };
}

/**
 * 🎯 Helper function: แปลง response config เป็น LLM options
 */
export function toLLMOptions(
  config: ResponseConfig,
  additionalOptions?: any
): any {
  return {
    maxCompletionTokens: config.maxCompletionTokens,
    reasoning: config.reasoning,
    text: config.text,
    ...additionalOptions
  };
}

/**
 * 🎯 Helper function: สำหรับ debug - แสดงรายการ config ทั้งหมด
 */
export function listAvailableConfigs(): string[] {
  return Object.keys(RESPONSE_CONFIGS);
}