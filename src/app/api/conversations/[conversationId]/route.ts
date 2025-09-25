/**
 * 🗣️ Conversation Detail API
 * จัดการ conversation เฉพาะ
 * 
 * Endpoints:
 * - GET /api/conversations/[conversationId] - ดู conversation พร้อม messages
 * - PUT /api/conversations/[conversationId] - อัปเดต conversation
 * - DELETE /api/conversations/[conversationId] - Archive conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getConversationWithMessages,
  archiveConversation,
  updateConversationTitle
} from '@/midori/agents/orchestrator/orchestratorAI';

/**
 * GET /api/conversations/[conversationId]
 * ดู conversation พร้อม messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log(`📖 Getting conversation: ${conversationId}`);
    
    const conversation = await getConversationWithMessages(conversationId, limit);
    
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
    
  } catch (error) {
    console.error('❌ Failed to get conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/conversations/[conversationId]
 * อัปเดต conversation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();
    const { title, visibility } = body;
    
    console.log(`✏️ Updating conversation: ${conversationId}`);
    
    let updated = false;
    
    // Update title if provided
    if (title) {
      const titleUpdated = await updateConversationTitle(conversationId, title);
      updated = updated || titleUpdated;
    }
    
    // TODO: Add visibility update when ConversationService supports it
    
    return NextResponse.json({
      success: updated,
      data: { 
        conversationId,
        updated: {
          title: title ? updated : undefined,
          visibility: visibility ? 'not_implemented' : undefined
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to update conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[conversationId]
 * Archive conversation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    
    console.log(`📦 Archiving conversation: ${conversationId}`);
    
    const archived = await archiveConversation(conversationId);
    
    return NextResponse.json({
      success: archived,
      data: { 
        conversationId,
        archived
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to archive conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to archive conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
