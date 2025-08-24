import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import {
  OpenAIRequest,
  OpenAIResponse,
  EnhancedAnalysis,
  Question,
  QualityAssessment,
  FinalOutput,
  ConversationContext,
  UserAnswers,
} from "@/types/openaiQuestion/route";

if (!process.env.QUESTION_API_KEY) {
  throw new Error("QUESTION_API_KEY environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.QUESTION_API_KEY,
});

// Enhanced Analysis Engine
class EnhancedAnalysisEngine {
  // Helper function to clean OpenAI response
  private cleanOpenAIResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.trim();
    
    // Remove ```json and ``` at the beginning and end
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  async analyzeInitialPrompt(prompt: string): Promise<EnhancedAnalysis> {
    const systemPrompt = `คุณเป็น AI ที่เชี่ยวชาญในการวิเคราะห์ความต้องการของเว็บไซต์ 
    กรุณาวิเคราะห์พรอมท์ที่ได้รับและให้ข้อมูลในรูปแบบ JSON ตามโครงสร้างที่กำหนด:

    {
      "projectName": "ชื่อโปรเจ็ค (ถ้าไม่ระบุให้เป็น null)",
      "projectType": "ประเภทโปรเจ็ค (e-commerce, blog, portfolio, business website)",
      "complexity": "ระดับความซับซ้อน (simple/medium/complex/enterprise)",
      "coreFeatures": ["ฟีเจอร์หลักที่จำเป็น"],
      "targetAudience": "กลุ่มเป้าหมาย",
      "designPreferences": {
        "designStyle": "สไตล์การออกแบบ (modern-minimalist, classic-elegant, colorful-playful, professional-corporate, creative-artistic, luxury-premium, casual-friendly)"
      },
      "missingElements": ["ข้อมูลที่ขาดหายไป - ระบุรายละเอียดที่จำเป็นต้องถามเพิ่มเติม"],
      "questionStrategy": {
        "totalQuestions": จำนวนคำถามที่ควรถาม,
        "questionTypes": ["ประเภทคำถาม"],
        "adaptiveQuestions": true/false,
        "priorityQuestions": ["คำถามสำคัญที่ต้องถามก่อน"]
      }
    }

         หมายเหตุสำคัญ:
     - ให้ตั้งค่า projectName, designPreferences.designStyle, coreFeatures, และ targetAudience เป็น null เสมอ
     - เพิ่ม "ชื่อโปรเจ็คและธีมการออกแบบ", "ฟีเจอร์หลัก", "กลุ่มเป้าหมาย", และ "ฟีเจอร์เสริม" เข้าไปใน missingElements เสมอ
     - คำถามชื่อโปรเจ็คและธีมการออกแบบต้องเป็นคำถามแรกเสมอ
     - คำถามฟีเจอร์หลักต้องเป็นคำถามที่ 2 เสมอ
     - คำถามกลุ่มเป้าหมายต้องเป็นคำถามที่ 3 เสมอ
     - คำถามฟีเจอร์เสริมต้องเป็นคำถามที่ 4 เสมอ
     - ไม่ต้องใช้ completeness score อีกต่อไป

   `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      
      try {
        // Clean the response before parsing
        const cleanedResponse = this.cleanOpenAIResponse(response);
        
        const parsedResponse = JSON.parse(cleanedResponse);
        return parsedResponse;
      } catch (parseError) {
        throw new Error("Invalid JSON response from OpenAI");
      }
    } catch (error) {
      throw error;
    }
  }

  async generateQuestions(analysis: EnhancedAnalysis): Promise<Question[]> {
    const systemPrompt = `สร้างคำถามตามการวิเคราะห์ที่ได้รับ โดยเน้นที่ข้อมูลที่ขาดหายไป (missingElements) 
    และคำถามสำคัญ (priorityQuestions) 
    ให้คำถามในรูปแบบ JSON array:

    [
      {
        "id": "unique_id",
        "type": "basic/contextual/followup",
        "category": "หมวดหมู่คำถาม",
        "question": "คำถามที่ตรงกับข้อมูลที่ขาดหายไป",
        "required": true/false,
        "dependsOn": ["id ของคำถามที่ต้องตอบก่อน"] (ถ้ามี),
        "priority": "high/medium/low"
      }
    ]

                  หลักการสร้างคำถาม:
     1. คำถามแรกต้องเป็นคำถามชื่อโปรเจ็คและธีมการออกแบบเสมอ (รวมเป็นคำถามเดียว)
     2. คำถามที่ 2 ต้องเป็นคำถามเกี่ยวกับ core features (ฟีเจอร์หลักที่ต้องการ) เสมอ
     3. คำถามที่ 3 ต้องเป็นคำถามเกี่ยวกับกลุ่มเป้าหมายเสมอ
     4. คำถามที่ 4 ต้องเป็นคำถามเกี่ยวกับฟีเจอร์เสริม โดยให้สร้าง options ที่เหมาะสมกับประเภทโปรเจ็ค
     5. คำถามต่อๆ ไปต้องไม่เกี่ยวกับชื่อโปรเจ็ค, ธีมการออกแบบ, ฟีเจอร์หลัก, กลุ่มเป้าหมาย, หรือฟีเจอร์เสริม เพราะถามไปแล้ว
     6. ดูจาก missingElements และสร้างคำถามที่ตรงกับข้อมูลที่ขาดหายไป
     7. สร้างคำถามที่เฉพาะเจาะจงกับข้อมูลที่ต้องการ ไม่ใช่คำถามทั่วไป
     8. ให้ความสำคัญกับ priorityQuestions ที่ระบุไว้
     9. คำถาม 4 ข้อแรกต้องมี priority เป็น "high" และ required เป็น true
     10. จำนวนคำถามทั้งหมดต้องสอดคล้องกับระดับความซับซ้อน (complexity):
         - simple: 4-6 คำถาม
         - medium: 6-8 คำถาม  
         - complex: 8-10 คำถาม
         - enterprise: 10-12 คำถาม`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(analysis) },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      
      try {
        // Clean the response before parsing
        const cleanedResponse = this.cleanOpenAIResponse(response);
        
        const parsedResponse = JSON.parse(cleanedResponse);
        return parsedResponse;
      } catch (parseError) {
        throw new Error("Invalid JSON response from OpenAI");
      }
    } catch (error) {
      throw error;
    }
  }

  async assessQuality(answers: UserAnswers, context: ConversationContext): Promise<QualityAssessment> {
    const systemPrompt = `ประเมินคุณภาพของคำตอบที่ได้รับ 
    ให้ผลลัพธ์ในรูปแบบ JSON:

    {
      "completeness": 0-100,
      "clarity": 0-100,
      "consistency": 0-100,
      "confidence": 0-100,
      "overallScore": 0-100,
      "recommendations": ["ข้อเสนอแนะ"],
      "requiredFollowUps": ["คำถามเพิ่มเติมที่จำเป็น"]
    }`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify({ answers, context }) },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      
      try {
        // Clean the response before parsing
        const cleanedResponse = this.cleanOpenAIResponse(response);
        
        const parsedResponse = JSON.parse(cleanedResponse);
        return parsedResponse;
      } catch (parseError) {
        throw new Error("Invalid JSON response from OpenAI");
      }
    } catch (error) {
      throw error;
    }
  }

  async generateFinalOutput(
    analysis: EnhancedAnalysis,
    answers: UserAnswers,
    quality: QualityAssessment
  ): Promise<FinalOutput> {
    const systemPrompt = `สร้างผลลัพธ์สุดท้ายจากข้อมูลทั้งหมด 
    ให้ผลลัพธ์ในรูปแบบ JSON:

         {
       "json": {
         "name": "ชื่อเว็บไซต์ (วิเคราะห์จากคำตอบของผู้ใช้เกี่ยวกับชื่อโปรเจ็ค)",
         "type": "ประเภทเว็บไซต์",
         "features": ["ฟีเจอร์ (วิเคราะห์จากคำตอบของผู้ใช้เกี่ยวกับ core features)"],
                  "design": {
            "designStyle": "สไตล์การออกแบบ (วิเคราะห์จากคำตอบของผู้ใช้เกี่ยวกับธีมการออกแบบ)",
            "primaryColors": ["สีหลัก"],
            "secondaryColors": ["สีรอง"],
            "typography": "ฟอนต์ที่แนะนำ",
          },
        "content": {
          "pages": ["หน้าเว็บ"],
          "sections": ["ส่วนประกอบ"]
        },
        "functionality": {
          "userManagement": true/false,
          "payment": true/false,
          "analytics": true/false,
          "seo": true/false
        },
        "targetAudience": "กลุ่มเป้าหมาย",
        "complexity": "ระดับความซับซ้อน"
      }
    }

         หมายเหตุสำคัญ:
     - วิเคราะห์ชื่อเว็บไซต์จากคำตอบของผู้ใช้เกี่ยวกับชื่อโปรเจ็ค (project_name_and_theme)
     - วิเคราะห์ฟีเจอร์หลักจากคำตอบของผู้ใช้เกี่ยวกับ core features
     - วิเคราะห์ฟีเจอร์เสริมจากคำตอบของผู้ใช้เกี่ยวกับ additional_features (อาจเป็น array)
     - วิเคราะห์กลุ่มเป้าหมายจากคำตอบของผู้ใช้เกี่ยวกับ target_audience
     - วิเคราะห์สไตล์การออกแบบจากคำตอบของผู้ใช้เกี่ยวกับธีมการออกแบบ (project_name_and_theme)
     - ใช้ข้อมูลจาก analysis และ answers เพื่อสร้างผลลัพธ์ที่สมบูรณ์`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify({ analysis, answers, quality }) },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      
      try {
        // Clean the response before parsing
        const cleanedResponse = this.cleanOpenAIResponse(response);
        
        const parsedResponse = JSON.parse(cleanedResponse);
        return parsedResponse;
      } catch (parseError) {
        throw new Error("Invalid JSON response from OpenAI");
      }
    } catch (error) {
      throw error;
    }
  }
}

// Main API Route Handler
export async function POST(request: NextRequest): Promise<NextResponse<OpenAIResponse>> {
  try {
    const body: OpenAIRequest = await request.json();
    const { prompt, phase = 'initial', context, answers } = body;

    if (!prompt && phase === 'initial') {
      return NextResponse.json({
        success: false,
        error: "Prompt is required",
      }, { status: 400 });
    }

    const engine = new EnhancedAnalysisEngine();
    let response: OpenAIResponse;
    
    switch (phase) {
      case 'initial':
        const analysis = await engine.analyzeInitialPrompt(prompt);
        const initialQuestions = await engine.generateQuestions(analysis);
        
        response = {
          success: true,
          data: analysis,
          phase: 'initial',
          nextAction: 'questions',
        };
        break;

      case 'questions':
        if (!context) {
          return NextResponse.json({
            success: false,
            error: "Context is required for questions phase",
          }, { status: 400 });
        }

        const generatedQuestions = await engine.generateQuestions(context.analysis);
        
        response = {
          success: true,
          data: generatedQuestions,
          phase: 'questions',
          nextAction: 'quality',
        };
        break;

      case 'quality':
        if (!context || !answers) {
          return NextResponse.json({
            success: false,
            error: "Context and answers are required for quality assessment",
          }, { status: 400 });
        }

        const quality = await engine.assessQuality(answers, context);
        
        response = {
          success: true,
          data: quality,
          phase: 'quality',
          nextAction: 'final',
        };
        break;

      case 'final':
        if (!context || !answers) {
          return NextResponse.json({
            success: false,
            error: "Context and answers are required for final generation",
          }, { status: 400 });
        }

        const finalOutput = await engine.generateFinalOutput(
          context.analysis,
          answers,
          {
            completeness: 80,
            clarity: 80,
            consistency: 80,
            confidence: 80,
            overallScore: 80,
            recommendations: [],
            requiredFollowUps: [],
          }
        );
        
        response = {
          success: true,
          data: finalOutput,
          phase: 'final',
          nextAction: 'complete',
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid phase",
        }, { status: 400 });
    }

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    }, { status: 500 });
  }
}

