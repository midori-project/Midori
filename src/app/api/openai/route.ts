import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { 
  ChatMessage, 
  ChatSession, 
  ChatRequest, 
  ChatResponse,
  ChatRequestSchema,
  ChatResponseSchema,
  ChatSessionSchema
} from '@/types/chat';

// In-memory storage for chat sessions (should be replaced with database in production)
const chatSessions = new Map<string, ChatSession>();

// Initialize OpenAI client (will error clearly if key missing)
const apiKey = process.env.QUESTION_API_KEY;
const openai = new OpenAI({
  apiKey,
});

// Generate unique session ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Parse AI response to extract JSON
function parseAIResponse(response: string): any {
  try {
    // ลองหา JSON object ที่สมบูรณ์
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      
      // ลอง parse JSON
      try {
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Problematic JSON string:', jsonString);
        
        // ลองแก้ไข JSON ที่มีปัญหา
        const cleanedJson = jsonString
          .replace(/,\s*}/g, '}') // ลบ comma ที่อยู่ท้าย object
          .replace(/,\s*]/g, ']') // ลบ comma ที่อยู่ท้าย array
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // ลบ control characters
        
        try {
          return JSON.parse(cleanedJson);
        } catch (secondError) {
          console.error('Second parse attempt failed:', secondError);
          return null;
        }
      }
    }
    
    // ถ้าไม่เจอ JSON object ลองหา JSON array
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (parseError) {
        console.error('Array parse error:', parseError);
        return null;
      }
    }
    
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Full AI response:', response);
    return null;
  }
}

// Create new chat session
function createNewSession(): ChatSession {
  const sessionId = generateId();
  const session: ChatSession = {
    id: sessionId,
    messages: [],
    currentStep: 'initial',
    userResponses: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  chatSessions.set(sessionId, session);
  return session;
}

// Handle initial step - analyze user's initial prompt
async function handleInitialStep(session: ChatSession, userMessage: string): Promise<ChatResponse> {
  const systemPrompt = `คุณคือmidoriเป็นกบเพื่อนรักนักเขียนโค้ดมี มีวิธีการพูดคุยที่เป็นมิตร แทรกemoji บ้างในคำตอบ ถ้าผู้ใช้ตอบเป็นภาษาไทย ให้ใช้ภาษาไทยหรือคำศัพท์อังกฤษบางคำเพื่ออธธิบายให้เข้าใจง่าย เพื่อให้บทสนาทนาลื่นไหล ถ้าไม่ใช่ให้ตอบภาษาอังกฤษ มีความสามารถในการวิเคราะห์พรอมท์อย่างละเอียด เพื่อวิเคราะห์จุดประสงค์ของผู้ใช้ และตั้งคำถามต่อยอดเกี่ยวกับความต้องการพรอมท์ที่ได้รับเข้ามาเพื่อให้ได้พรอมท์ที่ละเอียดที่สุดสำหรับการสร้างโปรเจ็ค
  เรียกผู้ใช้ว่า "เธอ" ตอบกลับด้วยคำลงท้ายด้วยครับ

ขั้นตอนที่ 1: วิเคราะห์ความสมบูรณ์ของ prompt แรก
- วิเคราะห์ประเภทโปรเจกต์ (เช่น e-commerce, blog, portfolio, business website)
- ระบุฟีเจอร์หลักที่จำเป็น
- ระบุกลุ่มเป้าหมาย
- ประเมินความซับซ้อน (simple/medium/complex)
- แนะนำ tech stack ที่เหมาะสม
- ประเมินความสมบูรณ์ของ prompt (0-100)
- ระบุสิ่งที่ขาดหายไป
- สร้างคำถาม 5 ข้อเพื่อปรับปรุง prompt

**สำคัญ:** คำถามแรกต้องเป็น "ชื่อโปรเจ็คที่คุณต้องการสร้างคืออะไร?" เสมอ

ตอบกลับในรูปแบบ JSON เท่านั้น:
{
  "projectType": "ประเภทโปรเจกต์",
  "coreFeatures": ["ฟีเจอร์1", "ฟีเจอร์2"],
  "targetAudience": "กลุ่มเป้าหมาย",
  "complexity": "simple|medium|complex",
  "estimatedTokens": จำนวน,
  "techStack": {
    "frontend": ["เทคโนโลยี1", "เทคโนโลยี2"],
    "backend": ["เทคโนโลยี1", "เทคโนโลยี2"],
    "database": ["เทคโนโลยี1", "เทคโนโลยี2"],
    "deployment": ["เทคโนโลยี1", "เทคโนโลยี2"]
  },
  "completeness": {
    "score": 0-100,
    "missingElements": ["สิ่งที่ขาดหายไป1", "สิ่งที่ขาดหายไป2"],
    "suggestions": ["ข้อเสนอแนะ1", "ข้อเสนอแนะ2"]
  },
  "refinementQuestions": [
    "ชื่อโปรเจ็คที่คุณต้องการสร้างคืออะไร?",
    "คำถามที่ 2 เพื่อปรับปรุง prompt",
    "คำถามที่ 3 เพื่อปรับปรุง prompt",
    "คำถามที่ 4 เพื่อปรับปรุง prompt",
    "คำถามที่ 5 เพื่อปรับปรุง prompt"
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    const parsedResponse = parseAIResponse(aiResponse);

    if (!parsedResponse) {
      throw new Error('Failed to parse AI response');
    }

    // Update session
    session.originalPrompt = userMessage;
    session.analysis = {
      projectType: parsedResponse.projectType,
      coreFeatures: parsedResponse.coreFeatures,
      targetAudience: parsedResponse.targetAudience,
      complexity: parsedResponse.complexity,
      estimatedTokens: parsedResponse.estimatedTokens,
      techStack: parsedResponse.techStack,
      completeness: parsedResponse.completeness,
      refinementQuestions: parsedResponse.refinementQuestions,
    };
    session.currentStep = 'analysis';
    
    // ตรวจสอบว่าข้อมูล analysis ถูกต้อง
    if (!session.analysis.refinementQuestions || session.analysis.refinementQuestions.length === 0) {
      console.error('Refinement questions not found in analysis');
      return {
        success: false,
        sessionId: session.id,
        message: 'เกิดข้อผิดพลาดในการสร้างคำถาม กรุณาลองใหม่อีกครั้ง',
        currentStep: session.currentStep,
        isComplete: false,
        error: 'Refinement questions not found',
      };
    }
    session.messages.push(
      { role: "user", content: userMessage, timestamp: new Date() },
      { role: "assistant", content: aiResponse, timestamp: new Date() }
    );
    session.updatedAt = new Date();

          return {
        success: true,
        sessionId: session.id,
        message: `${parsedResponse.refinementQuestions[0]}`,
        currentStep: session.currentStep,
        analysis: session.analysis,
        isComplete: false,
        currentQuestion: 1,
        totalQuestions: parsedResponse.refinementQuestions.length,
        currentquestion: parsedResponse.refinementQuestions[0] || '',
      };
  } catch (error) {
    console.error('Error in initial step:', error);
    return {
      success: false,
      sessionId: session.id,
      message: 'ขออภัย เกิดข้อผิดพลาดในการวิเคราะห์ prompt ของคุณ กรุณาลองใหม่อีกครั้ง',
      currentStep: session.currentStep,
      isComplete: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Handle analysis step - collect user responses to questions
async function handleAnalysisStep(session: ChatSession, userMessage: string): Promise<ChatResponse> {
  // คำนวณคำถามปัจจุบันโดยดูจากจำนวนคำตอบที่มีอยู่แล้ว
  const currentQuestionNumber = Object.keys(session.userResponses).length + 1;
  const totalQuestions = session.analysis?.refinementQuestions.length || 5;
  
  // Debug: แสดงข้อมูลการคำนวณ step
  console.log('=== Step Calculation Debug ===');
  console.log('Current Question Number:', currentQuestionNumber);
  console.log('Total Questions:', totalQuestions);
  console.log('User Responses:', Object.keys(session.userResponses));
  console.log('Session Step:', session.currentStep);
  console.log('================================');

  // บันทึกคำตอบของผู้ใช้ก่อน (ถ้าไม่ใช่การถามเกี่ยวกับคำถาม)
  const isAskingAboutQuestion = userMessage.toLowerCase().includes('คำถาม') || 
                               userMessage.toLowerCase().includes('อธิบาย') ||
                               userMessage.toLowerCase().includes('หมายถึง') ||
                               userMessage.toLowerCase().includes('?') ||
                               userMessage.toLowerCase().includes('ช่วย')||
                               userMessage.toLowerCase().includes('แปล')||
                               userMessage.toLowerCase().includes('แนะนำ')||
                               userMessage.toLowerCase().includes('ทำไม')||
                               userMessage.toLowerCase().includes('อะไร');

  // ตรวจสอบว่าผู้ใช้กำลังถามเกี่ยวกับคำถามปัจจุบันหรือไม่
  if (isAskingAboutQuestion && currentQuestionNumber <= totalQuestions) {
    const currentQuestion = session.analysis?.refinementQuestions[currentQuestionNumber - 1];
    
    // สร้าง system prompt ที่เกี่ยวข้องกับคำถามปัจจุบัน
    const systemPrompt = `คุณคือผู้ช่วยที่อธิบายคำถามให้ชัดเจน

คำถามที่ ${currentQuestionNumber}: "${currentQuestion}"

กรุณาตอบคำถามของผู้ใช้โดยอ้างอิงจากคำถามข้างต้น ให้คำอธิบายที่ชัดเจนและเป็นประโยชน์เพื่อให้ผู้ใช้เข้าใจและตอบได้อย่างถูกต้อง`;

    try {
          const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    
    });

      const explanation = completion.choices[0]?.message?.content || '';

      session.messages.push(
        { role: "user", content: userMessage, timestamp: new Date() },
        { role: "assistant", content: explanation, timestamp: new Date() }
      );
      session.updatedAt = new Date();

      return {
        success: true,
        sessionId: session.id,
        message: `${explanation}`,
        currentStep: session.currentStep,
        analysis: session.analysis,
        isComplete: false,
        currentQuestion: currentQuestionNumber,
        totalQuestions: totalQuestions,
        currentquestion: currentQuestion || '',
        explanation: explanation,
      };
    } catch (error) {
      console.error('Error generating explanation:', error);
      return {
        success: true,
        sessionId: session.id,
        message: `${currentQuestion}`,
        currentStep: session.currentStep,
        analysis: session.analysis,
        isComplete: false,
        currentQuestion: currentQuestionNumber,
        totalQuestions: totalQuestions,
        currentquestion: currentQuestion || '',
        explanation: '',
      };
    }
  }

  // บันทึกคำตอบของผู้ใช้ (ถ้าไม่ใช่การถามเกี่ยวกับคำถาม)
  if (!isAskingAboutQuestion) {
    session.userResponses[`question${currentQuestionNumber}`] = userMessage;
    session.messages.push(
      { role: "user", content: userMessage, timestamp: new Date() }
    );
  }

  // ตรวจสอบว่าตอบคำถามครบแล้วหรือยัง
  if (currentQuestionNumber >= totalQuestions) {
    // เมื่อตอบคำถามครบแล้ว ให้สร้าง JSON สุดท้ายทันที
    console.log('=== All questions answered, generating final JSON ===');
    
    // เปลี่ยนไปยัง step questions และสร้าง JSON สุดท้าย
    session.currentStep = 'questions';
    session.updatedAt = new Date();

    // เรียกใช้ handleQuestionsStep เพื่อสร้าง JSON สุดท้าย
    return await handleQuestionsStep(session);
  } else {
    // ถามคำถามถัดไป
    const nextQuestion = session.analysis?.refinementQuestions[currentQuestionNumber];
    
    // ตรวจสอบว่าคำถามถัดไปมีอยู่จริงหรือไม่
    if (!nextQuestion) {
      console.error('Next question not found for index:', currentQuestionNumber);
      return {
        success: false,
        sessionId: session.id,
        message: 'เกิดข้อผิดพลาดในการดึงคำถามถัดไป กรุณาลองใหม่อีกครั้ง',
        currentStep: session.currentStep,
        analysis: session.analysis,
        isComplete: false,
        error: 'Next question not found',
      };
    }
    
    session.updatedAt = new Date();

    return {
      success: true,
      sessionId: session.id,
      message: `${nextQuestion}`,
      currentStep: session.currentStep,
      analysis: session.analysis,
      isComplete: false,
      currentQuestion: currentQuestionNumber + 1,
      totalQuestions: totalQuestions,
      currentquestion: nextQuestion || '',
    };
  }
}

// Handle questions step - generate final JSON
async function handleQuestionsStep(session: ChatSession): Promise<ChatResponse> {
  console.log('=== Questions Step Debug ===');
  console.log('Session Step:', session.currentStep);
  console.log('User Responses Count:', Object.keys(session.userResponses).length);
  console.log('Expected Questions:', session.analysis?.refinementQuestions.length);
  console.log('User Responses:', session.userResponses);
  console.log('============================');
  const systemPrompt = `คุณคือ Midori AI ที่ช่วยสร้างไฟล์ JSON สำหรับการสร้างเว็บไซต์

ข้อมูลที่ได้จากผู้ใช้:
- Prompt แรก: ${session.originalPrompt}
- ประเภทโปรเจกต์: ${session.analysis?.projectType}
- กลุ่มเป้าหมาย: ${session.analysis?.targetAudience}
- ความซับซ้อน: ${session.analysis?.complexity}
- ฟีเจอร์หลัก: ${session.analysis?.coreFeatures.join(', ')}
- Tech Stack: Frontend: ${session.analysis?.techStack.frontend.join(', ')}, Backend: ${session.analysis?.techStack.backend.join(', ')}, Database: ${session.analysis?.techStack.database.join(', ')}

คำตอบของผู้ใช้:
${Object.entries(session.userResponses).map(([key, value]) => `${key}: ${value}`).join('\n')}

**สำคัญ**: สร้างไฟล์ JSON ที่ครบถ้วนและชัดเจนสำหรับการสร้างเว็บไซต์นี้ โดยรวมข้อมูลทั้งหมดที่ได้จากการวิเคราะห์และคำตอบของผู้ใช้

**ข้อกำหนด JSON**:
- ต้องเป็น JSON ที่ถูกต้องตามมาตรฐาน
- ไม่มีข้อความอธิบายนอก JSON object
- ไม่มี trailing comma
- ใช้ double quotes สำหรับ keys และ string values
- ไม่มี control characters หรือ special characters ที่ไม่ถูกต้อง

ตอบกลับด้วย JSON เท่านั้น ไม่มีข้อความอื่น`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "สร้างไฟล์ JSON สุดท้ายสำหรับการสร้างเว็บไซต์" }
      ],
      
    });

    const finalJsonResponse = completion.choices[0]?.message?.content || '';
    let finalJson = parseAIResponse(finalJsonResponse);
    
    // ถ้า parse ไม่สำเร็จ ให้ลอง parse ใหม่
    if (!finalJson) {
      try {
        finalJson = JSON.parse(finalJsonResponse);
      } catch (parseError) {
        console.error('Failed to parse final JSON:', parseError);
        console.log('Raw AI response:', finalJsonResponse);
        
        // สร้าง JSON ตัวอย่างแทน
        finalJson = {
          projectName: "เว็บไซต์ใหม่",
          description: "เว็บไซต์ที่สร้างจากข้อมูลที่ผู้ใช้ให้มา",
          type: "website",
          features: ["หน้าแรก", "เกี่ยวกับเรา", "ติดต่อ"],
          error: "ไม่สามารถ parse JSON จาก AI ได้ ใช้ข้อมูลตัวอย่างแทน"
        };
      }
    }
    
    // Update session
    session.finalJson = finalJson;
    session.currentStep = 'final';
    session.messages.push(
      { role: "assistant", content: finalJsonResponse, timestamp: new Date() }
    );
    session.updatedAt = new Date();

    const response = {
      success: true,
      sessionId: session.id,
      message: `🎉 **ไฟล์ JSON พร้อมแล้ว!** 

คุณสามารถคัดลอกและใช้ไฟล์ JSON นี้สำหรับการสร้างเว็บไซต์ได้เลย

**ข้อมูลสรุป:**
- ประเภทโปรเจกต์: ${session.analysis?.projectType}
- กลุ่มเป้าหมาย: ${session.analysis?.targetAudience}
- ความซับซ้อน: ${session.analysis?.complexity}
- ฟีเจอร์หลัก: ${session.analysis?.coreFeatures.join(', ')}

ไฟล์ JSON ถูกสร้างขึ้นแล้วและพร้อมใช้งาน!`,
      currentStep: session.currentStep,
      analysis: session.analysis,
      finalJson: session.finalJson,
      isComplete: true,
      currentQuestion: session.analysis?.refinementQuestions.length || 5,
      totalQuestions: session.analysis?.refinementQuestions.length || 5,
    };

    console.log('=== Questions Step Response ===');
    console.log('isComplete:', response.isComplete);
    console.log('finalJson exists:', !!response.finalJson);
    console.log('=============================');

    return response;
  } catch (error) {
    console.error('Error generating final JSON:', error);
    return {
      success: false,
      sessionId: session.id,
      message: 'ขออภัย เกิดข้อผิดพลาดในการสร้างไฟล์ JSON สุดท้าย กรุณาลองใหม่อีกครั้ง',
      currentStep: session.currentStep,
      analysis: session.analysis,
      isComplete: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Handle final step
function handleFinalStep(session: ChatSession): ChatResponse {
  return {
    success: true,
    sessionId: session.id,
    message: 'การสนทนาสิ้นสุดแล้ว คุณสามารถเริ่มการสนทนาใหม่ได้',
    currentStep: session.currentStep,
    analysis: session.analysis,
    finalJson: session.finalJson,
    isComplete: true,
  };
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Preflight check: ensure API key exists
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing QUESTION_API_KEY. Please set it in your environment (.env.local) and restart the dev server.' },
        { status: 500 }
      );
    }
    const body = await request.json();
    
    console.log('=== Request Body ===');
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('===================');
    
    // Validate request body with Zod
    const validationResult = ChatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Invalid request format', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { message, sessionId } = validationResult.data;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let session: ChatSession;

    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId)!;
    } else {
      session = createNewSession();
    }

    let response: ChatResponse;

    // Debug: แสดงข้อมูล session ก่อนเลือก step
    console.log('=== Session Debug ===');
    console.log('Current Step:', session.currentStep);
    console.log('User Responses:', Object.keys(session.userResponses));
    console.log('Analysis exists:', !!session.analysis);
    console.log('User Responses Count:', Object.keys(session.userResponses).length);
    console.log('Expected Questions:', session.analysis?.refinementQuestions?.length);
    console.log('====================');

    switch (session.currentStep) {
      case 'initial':
        response = await handleInitialStep(session, message);
        break;
      case 'analysis':
        response = await handleAnalysisStep(session, message);
        break;
      case 'questions':
        // เมื่ออยู่ใน step questions ให้สร้าง JSON สุดท้าย
        response = await handleQuestionsStep(session);
        break;
      case 'final':
        response = handleFinalStep(session);
        break;
      default:
        console.log('Unknown step, defaulting to initial');
        response = await handleInitialStep(session, message);
    }

    // Validate response with Zod before sending
    const responseValidation = ChatResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('Response validation failed:', responseValidation.error.errors);
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    return NextResponse.json(responseValidation.data);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple health check for this API
export async function GET(): Promise<NextResponse> {
  const hasKey = Boolean(apiKey && apiKey.length > 0);
  return NextResponse.json({ ok: true, hasKey });
}
