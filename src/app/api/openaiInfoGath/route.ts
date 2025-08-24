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
      "projectType": "ประเภทโปรเจ็ค (e-commerce, blog, portfolio, business website)",
      "complexity": "ระดับความซับซ้อน (simple/medium/complex/enterprise)",
      "coreFeatures": ["ฟีเจอร์หลักที่จำเป็น"],
      "targetAudience": "กลุ่มเป้าหมาย",
      "completeness": {
        "score": 0-100,
        "missingElements": ["ข้อมูลที่ขาดหายไป"],
        "suggestions": ["ข้อเสนอแนะ"],
        "confidence": 0-100
      },
      "questionStrategy": {
        "totalQuestions": จำนวนคำถามที่ควรถาม,
        "questionTypes": ["ประเภทคำถาม"],
        "adaptiveQuestions": true/false
      }
    }`;

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
    const systemPrompt = `สร้างคำถามตามการวิเคราะห์ที่ได้รับ 
    ให้คำถามในรูปแบบ JSON array:

    [
      {
        "id": "unique_id",
        "type": "basic/contextual/followup",
        "category": "หมวดหมู่คำถาม",
        "question": "คำถาม",
        "required": true/false,
        "options": ["ตัวเลือก"] (ถ้ามี),
        "dependsOn": ["id ของคำถามที่ต้องตอบก่อน"] (ถ้ามี)
      }
    ]`;

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
        "name": "ชื่อเว็บไซต์",
        "type": "ประเภทเว็บไซต์",
        "features": ["ฟีเจอร์"],
        "design": {
          "theme": "ธีม",
          "colorScheme": "สี",
          "layout": "เลย์เอาต์"
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
        "technical": {
          "frontend": "เทคโนโลยี frontend",
          "backend": "เทคโนโลยี backend",
          "database": "ฐานข้อมูล",
          "deployment": "การ deploy"
        }
      },
      "summary": {
        "requirements": ["ความต้องการ"],
        "recommendations": ["ข้อเสนอแนะ"],
        "estimatedTime": "เวลาที่ประมาณการ",
        "estimatedCost": "ต้นทุนที่ประมาณการ",
        "risks": ["ความเสี่ยง"]
      },
      "quality": {
        "completeness": 0-100,
        "clarity": 0-100,
        "consistency": 0-100,
        "confidence": 0-100,
        "overallScore": 0-100,
        "recommendations": ["ข้อเสนอแนะ"],
        "requiredFollowUps": ["คำถามเพิ่มเติม"]
      }
    }`;

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
          nextAction: analysis.completeness.score >= 70 ? 'final' : 'quality',
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
          nextAction: quality.overallScore >= 70 ? 'final' : 'followup',
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

