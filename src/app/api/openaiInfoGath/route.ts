import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import {
  OpenAIRequest,
  OpenAIResponse,
  EnhancedAnalysis,
  Question,
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
      "isComplete": true/false (true ถ้าข้อมูลครบถ้วน, false ถ้าขาดข้อมูล),
             "questionStrategy": {
         "totalQuestions": จำนวนคำถามที่ควรถาม (1-5 ข้อ),
         "questionTypes": ["ประเภทคำถาม"],
         "adaptiveQuestions": true,
         "priorityQuestions": ["คำถามสำคัญที่ต้องถามก่อน"],
         "focusOnBackground": true/false (true ถ้าข้อมูลครบถ้วน ให้ถามเกี่ยวกับ background แทน)
       }
    }

                                     หมายเหตุสำคัญ:
      - ให้ตั้งค่า projectName, designPreferences.designStyle, coreFeatures, และ targetAudience เป็น null เสมอ
      - ไม่ต้องวิเคราะห์หรือเดาข้อมูลการออกแบบจากพรอมท์
      - ให้ผู้ใช้เป็นคนตอบเรื่องการออกแบบเองเสมอ
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
        
        // บังคับให้มี missingElements ที่จำเป็นเสมอ
        const requiredMissingElements = [
          "ชื่อโปรเจ็คและธีมการออกแบบ",
          "ฟีเจอร์หลัก", 
          "กลุ่มเป้าหมาย",
          "ฟีเจอร์เสริม"
        ];
        
        // เพิ่ม missingElements ที่จำเป็นถ้ายังไม่มี
        if (!parsedResponse.missingElements) {
          parsedResponse.missingElements = [];
        }
        
        requiredMissingElements.forEach(element => {
          if (!parsedResponse.missingElements.includes(element)) {
            parsedResponse.missingElements.push(element);
          }
        });
        
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
     
     หลักการสร้างคำถาม:
     1. ต้องถามข้อมูลพื้นฐานเสมอ ไม่ว่าข้อมูลจะมีใน analysis หรือไม่
     2. คำถามแรก: ชื่อโปรเจ็คและธีมการออกแบบ (รวมเป็นคำถามเดียว)
     3. คำถามที่ 2: ฟีเจอร์หลักที่ต้องการ
     4. คำถามที่ 3: กลุ่มเป้าหมาย
     5. คำถามที่ 4: ฟีเจอร์เสริม
     6. คำถามต่อๆ ไป: ข้อมูลเพิ่มเติมตาม missingElements
     
     หมวดหมู่คำถามหลัก (ต้องถามเสมอ):
     
     ข้อมูลพื้นฐาน (4 ข้อแรก):
     - project_name_and_theme: ชื่อโปรเจ็คและธีมการออกแบบ (รวมเป็นคำถามเดียว)
     - core_features: ฟีเจอร์หลักที่ต้องการ
     - target_audience: กลุ่มเป้าหมาย
     - additional_features: ฟีเจอร์เสริมที่ต้องการ
     
     ข้อมูลเพิ่มเติม:
     - timeline: เวลาและ deadline
     - budget: งบประมาณ
     - team: ทีมงานและผู้เกี่ยวข้อง
     - technical_requirements: ความต้องการทางเทคนิค
     - integrations: การเชื่อมต่อกับระบบอื่น
     - content_pages: หน้าเว็บที่ต้องการ
     - user_experience: ประสบการณ์ผู้ใช้
     
     คำถามเสริม (ใช้เมื่อคำถามหลักน้อยกว่า 2 ข้อ):
     1. background_project: ข้อมูล background ของโปรเจ็ค (ประวัติ, วัตถุประสงค์, ความต้องการพิเศษ)
     2. color_preferences: สีหลักและสีรองที่ต้องการ
     3. additional_features: ฟีเจอร์เสริมที่ต้องการ
     
     หลักการเลือกคำถาม:
     1. ต้องสร้างคำถาม 4 ข้อแรกเสมอ (ข้อมูลพื้นฐาน)
     2. คำถามที่ 5 เป็นต้นไป: เลือกจากข้อมูลเพิ่มเติมตาม missingElements
     3. ให้ความสำคัญกับ missingElements ที่ระบุไว้
     4. สร้างคำถามที่เฉพาะเจาะจงและไม่ซ้ำซ้อน
     5. ทุกคำถามต้องมี priority เป็น "high" และ required เป็น true
     6. จำนวนคำถามทั้งหมด: 4-6 ข้อ (ขึ้นอยู่กับความซับซ้อน)`;

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



    async generateFinalOutput(
    analysis: EnhancedAnalysis,
    answers: UserAnswers
  ): Promise<FinalOutput> {
    const systemPrompt = `คุณเป็น AI ที่เชี่ยวชาญในการออกแบบและพัฒนาเว็บไซต์
    กรุณาสร้างผลลัพธ์สุดท้ายที่เน้นการออกแบบและพัฒนาเว็บไซต์
    ให้ผลลัพธ์ในรูปแบบ JSON:

    {
      "json": {
        "projectObjective": {
          "primaryGoal": "วัตถุประสงค์หลักของเว็บไซต์ (เช่น ขายสินค้า, แสดงผลงาน, ให้ข้อมูล, สร้างชุมชน)",
          "secondaryGoals": ["วัตถุประสงค์รอง"],
          "businessValue": "คุณค่าทางธุรกิจที่คาดหวัง",
          "successMetrics": ["ตัวชี้วัดความสำเร็จ"]
        },
        "name": "ชื่อเว็บไซต์ (วิเคราะห์จากคำตอบของผู้ใช้เกี่ยวกับชื่อโปรเจ็ค)",
        "type": "ประเภทเว็บไซต์",
        "features": ["ฟีเจอร์ (วิเคราะห์จากคำตอบของผู้ใช้เกี่ยวกับ core features)"],
        "design": {
          "designStyle": "สไตล์การออกแบบ (วิเคราะห์จากคำตอบของผู้ใช้เกี่ยวกับธีมการออกแบบ)",
          "primaryColors": ["สีหลัก"],
          "secondaryColors": ["สีรอง"],
          "typography": "ฟอนต์ที่แนะนำ",
          "designRationale": "เหตุผลในการเลือกสไตล์การออกแบบนี้"
        },
        "content": {
          "pages": ["หน้าเว็บ"],
          "sections": ["ส่วนประกอบ"],
          "contentStrategy": "กลยุทธ์การจัดการเนื้อหา"
        },
        "functionality": {
          "userManagement": true/false,
          "payment": true/false,
          "analytics": true/false,
          "seo": true/false
        },
        "targetAudience": {
          "primaryAudience": "กลุ่มเป้าหมายหลัก",
          "secondaryAudience": ["กลุ่มเป้าหมายรอง"],
          "userNeeds": ["ความต้องการของกลุ่มเป้าหมาย"],
          "userJourney": "เส้นทางผู้ใช้ที่คาดหวัง"
        },
        "complexity": "ระดับความซับซ้อน"
      }
    }

     หลักการวิเคราะห์การออกแบบเว็บไซต์:
     1. วิเคราะห์จากชื่อโปรเจ็คและธีมการออกแบบเพื่อเข้าใจสไตล์ที่ต้องการ
     2. ดูจากฟีเจอร์หลักเพื่อออกแบบโครงสร้างเว็บไซต์
     3. วิเคราะห์กลุ่มเป้าหมายเพื่อออกแบบ UX/UI ที่เหมาะสม
     4. ดูจากฟีเจอร์เสริมเพื่อเพิ่มฟังก์ชันการทำงาน
     5. สรุปการออกแบบให้ชัดเจนและใช้งานได้จริง
     6. ระบุสีและฟอนต์ที่เหมาะสมกับสไตล์
     7. จัดวางโครงสร้างหน้าเว็บตามความต้องการ

     การออกแบบและพัฒนา:
     1. วิเคราะห์ความต้องการของเว็บไซต์
     2. ออกแบบโครงสร้างและ layout ที่เหมาะสม
     3. เลือกสีและฟอนต์ที่สอดคล้องกับแบรนด์
     4. วางแผนการพัฒนาเว็บไซต์
     5. ระบุฟีเจอร์ที่จำเป็นต้องมี

     หมายเหตุสำคัญ:
     - เน้นการออกแบบเว็บไซต์ที่สวยงามและใช้งานง่าย
     - ระบุสีและฟอนต์ที่เหมาะสมกับสไตล์
     - วิเคราะห์ความต้องการของกลุ่มเป้าหมายเพื่อออกแบบ UX
     - จัดวางโครงสร้างหน้าเว็บตามความต้องการ
     - ให้เหตุผลในการเลือกสไตล์การออกแบบ
     - วางแผนการพัฒนาเว็บไซต์ที่ใช้งานได้จริง
     - ให้คำแนะนำเกี่ยวกับการออกแบบและพัฒนา`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify({ analysis, answers }) },
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
          answers
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

