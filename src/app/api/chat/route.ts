import { NextRequest, NextResponse } from 'next/server';
import { processUserMessage } from '@/midori/agents/orchestrator/orchestratorAI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = 'default-user', sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🎭 API Chat endpoint received:', { message, userId, sessionId });

    // Process with Orchestrator AI
    const response = await processUserMessage(message, userId, sessionId);

    console.log('✅ API Chat response:', {
      type: response.type,
      contentLength: response.content.length,
      agentsUsed: response.metadata.agentsUsed,
      executionTime: response.metadata.executionTime
    });

    return NextResponse.json({
      content: response.content,
      type: response.type,
      taskResults: response.taskResults,
      nextSteps: response.nextSteps,
      metadata: response.metadata
    });

  } catch (error) {
    console.error('❌ API Chat error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        content: 'ขออภัยครับ เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
        type: 'chat'
      },
      { status: 500 }
    );
  }
}