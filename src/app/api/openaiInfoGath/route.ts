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
      - ตรวจสอบข้อมูลที่มีอยู่ในพรอมท์และเก็บข้อมูลที่ชัดเจนไว้:
        * ถ้าพรอมท์ระบุชื่อโปรเจ็ค → เก็บไว้ใน projectName
        * ถ้าพรอมท์ระบุสไตล์การออกแบบ → เก็บไว้ใน designPreferences.designStyle
        * ถ้าพรอมท์ระบุฟีเจอร์หลัก → เก็บไว้ใน coreFeatures
        * ถ้าพรอมท์ระบุกลุ่มเป้าหมาย → เก็บไว้ใน targetAudience
        * ถ้าพรอมท์ระบุประเภทโปรเจ็ค → เก็บไว้ใน projectType
      
     - ตรวจสอบความครบถ้วนของข้อมูล:
       * ถ้ามีข้อมูลครบถ้วน → isComplete = true
       * ถ้าขาดข้อมูลใดๆ → isComplete = false
      
     - missingElements:
       * ระบุเฉพาะข้อมูลที่ขาดหายไปจริงๆ
       * ไม่ต้องเพิ่มข้อมูลที่พรอมท์มีอยู่แล้ว
      
     - คำนวณจำนวนคำถาม (totalQuestions):
       * นับจำนวนข้อมูลที่ขาดหายไปจาก missingElements
       * ถ้าข้อมูลพื้นฐานครบแล้ว (isComplete = true) และ missingElements น้อยกว่า 2 → totalQuestions = 5 (รวมคำถามเสริม)
       * ถ้าข้อมูลพื้นฐานไม่ครบ → totalQuestions = จำนวน missingElements (สูงสุด 5)
      
     - ไม่ต้องตั้งค่า projectName, designPreferences.designStyle, coreFeatures, targetAudience เป็น null เสมอ
     - ให้เก็บข้อมูลที่ชัดเจนจากพรอมท์ไว้

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
     
     หลักการ Dynamic Questions:
     1. ตรวจสอบข้อมูลที่มีอยู่ใน analysis และไม่ถามซ้ำ
     2. ถ้า projectName มีข้อมูลแล้ว → ไม่ถามชื่อโปรเจ็ค
     3. ถ้า designPreferences.designStyle มีข้อมูลแล้ว → ไม่ถามสไตล์การออกแบบ
     4. ถ้า coreFeatures มีข้อมูลแล้ว → ไม่ถามฟีเจอร์หลัก
     5. ถ้า targetAudience มีข้อมูลแล้ว → ไม่ถามกลุ่มเป้าหมาย
     6. ถ้า projectType มีข้อมูลแล้ว → ไม่ถามประเภทโปรเจ็ค
     
     หมวดหมู่คำถามหลัก (เลือกตามข้อมูลที่ขาดหายไป):
     
     ข้อมูลพื้นฐาน:
     - project_name: ชื่อโปรเจ็ค (ถ้าไม่มีใน analysis)
     - design_style: สไตล์การออกแบบ (ถ้าไม่มีใน analysis)
     - project_type: ประเภทโปรเจ็ค (ถ้าไม่มีใน analysis)
     - core_features: ฟีเจอร์หลัก (ถ้าไม่มีใน analysis)
     - target_audience: กลุ่มเป้าหมาย (ถ้าไม่มีใน analysis)
     
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
     1. เลือกคำถามหลักที่ข้อมูลยังไม่มีใน analysis ก่อน
     2. ถ้าข้อมูลพื้นฐานครบแล้ว ให้เลือกคำถามเพิ่มเติม
     3. ถ้าคำถามหลักน้อยกว่า 2 ข้อ ให้เพิ่มคำถามเสริม 3 ข้อ
     4. ให้ความสำคัญกับ missingElements ที่ระบุไว้
     5. สร้างคำถามที่เฉพาะเจาะจงและไม่ซ้ำซ้อน
     6. ทุกคำถามต้องมี priority เป็น "high" และ required เป็น true`;

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

