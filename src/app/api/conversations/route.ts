/**
 * 🗣️ Conversations API
 * จัดการการสนทนาของ users
 * 
 * Endpoints:
 * - GET /api/conversations - ดูรายการ conversations
 * - POST /api/conversations - สร้าง conversation ใหม่
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserConversations, 
  processUserMessage,
  getConversationWithMessages,
  archiveConversation,
  updateConversationTitle
} from '@/midori/agents/orchestrator/orchestratorAI';

/**
 * GET /api/conversations
 * ดูรายการ conversations ของ user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const projectId = searchParams.get('projectId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log(`📋 Getting conversations for user: ${userId}`);
    
    const conversations = await getUserConversations(userId, projectId, limit);
    
    return NextResponse.json({
      success: true,
      data: conversations,
      count: conversations.length
    });
    
  } catch (error) {
    console.error('❌ Failed to get conversations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * สร้าง conversation ใหม่หรือส่งข้อความ
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, projectId, content, conversationId, title } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'send_message':
        if (!content) {
          return NextResponse.json(
            { success: false, error: 'content is required for send_message' },
            { status: 400 }
          );
        }
        
        console.log(`💬 Sending message from user: ${userId}`);
        const response = await processUserMessage(content, userId, undefined, {
          currentProject: projectId
        });
        
        return NextResponse.json({
          success: true,
          data: response
        });
        
      case 'get_conversation':
        if (!conversationId) {
          return NextResponse.json(
            { success: false, error: 'conversationId is required for get_conversation' },
            { status: 400 }
          );
        }
        
        console.log(`📖 Getting conversation: ${conversationId}`);
        const conversation = await getConversationWithMessages(conversationId);
        
        if (!conversation) {
          return NextResponse.json(
            { success: false, error: 'Conversation not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: conversation
        });
        
      case 'archive_conversation':
        if (!conversationId) {
          return NextResponse.json(
            { success: false, error: 'conversationId is required for archive_conversation' },
            { status: 400 }
          );
        }
        
        console.log(`📦 Archiving conversation: ${conversationId}`);
        const archived = await archiveConversation(conversationId);
        
        return NextResponse.json({
          success: archived,
          data: { archived }
        });
        
      case 'update_title':
        if (!conversationId || !title) {
          return NextResponse.json(
            { success: false, error: 'conversationId and title are required for update_title' },
            { status: 400 }
          );
        }
        
        console.log(`✏️ Updating conversation title: ${conversationId}`);
        const updated = await updateConversationTitle(conversationId, title);
        
        return NextResponse.json({
          success: updated,
          data: { updated }
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Supported actions: send_message, get_conversation, archive_conversation, update_title' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('❌ Failed to process conversation request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process conversation request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
