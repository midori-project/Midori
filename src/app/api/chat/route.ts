import { NextRequest, NextResponse } from 'next/server';
import { processUserMessage } from '@/midori/agents/orchestrator/orchestratorAI';
import { getCurrentSession } from '@/libs/auth/session';
import { tokenMemoryCache } from '@/libs/billing/tokenMemoryCache';
import { calculateTokenCost } from '@/libs/billing/tokenPricing';
import { TokenLedgerService } from '@/libs/billing/tokenLedgerService';
import { TokenTransactionType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = 'default-user', sessionId, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🎭 API Chat endpoint received:', { message, userId, sessionId, context });

    // 🔍 ตรวจสอบ Token ก่อนประมวลผล Chat
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          content: 'กรุณาเข้าสู่ระบบก่อนใช้งาน Chat'
        },
        { status: 401 }
      );
    }

    // ตรวจสอบ Token balance
    const chatCost = calculateTokenCost('chatAnalysis');
    const canProcess = await tokenMemoryCache.canCreateProject(session.user.id);
    
    if (canProcess.currentBalance < chatCost) {
      return NextResponse.json({
        error: 'Insufficient tokens',
        content: `คุณมี Token ไม่เพียงพอสำหรับการ Chat ต้องการ ${chatCost} Token แต่มีเพียง ${canProcess.currentBalance} Token`,
        type: 'chat',
        tokenInfo: {
          currentBalance: canProcess.currentBalance,
          requiredTokens: chatCost,
          canProceed: false
        }
      }, { status: 400 });
    }

    console.log(`💸 Chat cost: ${chatCost} tokens for user ${session.user.id}`);

    // Process with Orchestrator AI
    const response = await processUserMessage(message, userId, sessionId, context);

    console.log('✅ API Chat response:', {
      type: response.type,
      contentLength: response.content.length,
      agentsUsed: response.metadata.agentsUsed,
      executionTime: response.metadata.executionTime
    });

    // 💸 หัก Token หลังประมวลผลสำเร็จ
    try {
      const ledgerService = new TokenLedgerService();
      const deductSuccess = await ledgerService.deductTokens(
        session.user.id,
        chatCost,
        TokenTransactionType.CHAT_ANALYSIS,
        'Chat analysis',
        { timestamp: new Date().toISOString() }
      );
      
      if (deductSuccess) {
        console.log(`✅ Deducted ${chatCost} tokens from user ${session.user.id}`);
        // อัปเดต memory cache
        await tokenMemoryCache.clearUserCache(session.user.id);
      } else {
        console.warn(`⚠️ Failed to deduct tokens for user ${session.user.id}`);
      }
    } catch (error) {
      console.error('❌ Token deduction error:', error);
    }

    return NextResponse.json({
      content: response.content,
      type: response.type,
      taskResults: response.taskResults,
      nextSteps: response.nextSteps,
      metadata: response.metadata,
      tokenInfo: {
        deducted: chatCost,
        remaining: canProcess.currentBalance - chatCost
      }
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