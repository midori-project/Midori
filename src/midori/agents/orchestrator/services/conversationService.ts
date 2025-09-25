/**
 * 🗣️ Conversation Service
 * จัดการการสนทนาและบันทึกลง database
 * 
 * Features:
 * - Create/Update/Delete conversations
 * - Message management
 * - Conversation threading
 * - Context persistence
 */

import { prisma } from '@/libs/prisma/prisma';
import { randomUUID } from 'crypto';

export interface ConversationData {
  id: string;
  userId: string | null;
  projectId?: string | null;
  agentId?: string | null;
  title?: string | null;
  visibility: 'private' | 'public' | 'unlisted';
  context?: any;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date | null;
}

export interface MessageData {
  id: string;
  conversationId: string;
  userId?: string | null;
  role: 'user' | 'assistant' | 'system' | 'tool'; // ✅ เพิ่ม 'tool' role
  content?: string | null;
  contentJson?: any;
  runId?: string | null;
  toolName?: string | null;
  toolInput?: any;
  toolOutput?: any;
  messageIndex: number;
  createdAt: Date;
  metadata?: any;
}

export interface CreateConversationInput {
  userId: string;
  projectId?: string;
  agentId?: string | null; // ✅ เปลี่ยนเป็น null ได้
  title?: string;
  visibility?: 'private' | 'public' | 'unlisted';
  context?: any;
}

export interface AddMessageInput {
  conversationId: string;
  userId?: string;
  role: 'user' | 'assistant' | 'system';
  content?: string;
  contentJson?: any;
  runId?: string;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  metadata?: any;
}

export interface ConversationWithMessages extends ConversationData {
  messages: MessageData[];
  messageCount: number;
  lastMessageAt?: Date;
}

export class ConversationService {
  
  /**
   * สร้าง conversation ใหม่
   */
  static async createConversation(input: CreateConversationInput): Promise<ConversationData> {
    try {
      console.log(`🗣️ Creating conversation for user: ${input.userId}`);
      
      // ✅ สร้าง user ก่อนถ้ายังไม่มี
      await this.ensureUserExists(input.userId);
      
      const conversation = await prisma.conversation.create({
        data: {
          id: randomUUID(),
          userId: input.userId,
          projectId: input.projectId,
          agentId: input.agentId || null, // ✅ ใช้ null แทน undefined
          title: input.title || this.generateDefaultTitle(),
          visibility: input.visibility || 'private',
          context: input.context || {}
        }
      });
      
      console.log(`✅ Conversation created: ${conversation.id}`);
      return conversation;
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * หา conversation ตาม ID
   */
  static async getConversation(conversationId: string): Promise<ConversationData | null> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
      
      return conversation;
    } catch (error) {
      console.error('❌ Failed to get conversation:', error);
      return null;
    }
  }

  /**
   * หา conversation พร้อม messages
   */
  static async getConversationWithMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<ConversationWithMessages | null> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { messageIndex: 'asc' },
            ...(limit && { take: limit }),
            ...(offset && { skip: offset })
          }
        }
      });
      
      if (!conversation) return null;
      
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      
      return {
        ...conversation,
        messageCount: conversation.messages.length,
        lastMessageAt: lastMessage?.createdAt
      };
    } catch (error) {
      console.error('❌ Failed to get conversation with messages:', error);
      return null;
    }
  }

  /**
   * หา conversations ของ user
   */
  static async getUserConversations(
    userId: string,
    projectId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ConversationWithMessages[]> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          userId,
          ...(projectId && { projectId }),
          archivedAt: null
        },
        include: {
          messages: {
            orderBy: { messageIndex: 'desc' },
            take: 1 // เอาแค่ message ล่าสุด
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset
      });
      
      return conversations.map(conv => ({
        ...conv,
        messageCount: conv.messages.length,
        lastMessageAt: conv.messages[0]?.createdAt
      }));
    } catch (error) {
      console.error('❌ Failed to get user conversations:', error);
      return [];
    }
  }

  /**
   * เพิ่ม message ลง conversation
   */
  static async addMessage(input: AddMessageInput): Promise<MessageData> {
    try {
      // หา message index ต่อไป
      const lastMessage = await prisma.message.findFirst({
        where: { conversationId: input.conversationId },
        orderBy: { messageIndex: 'desc' }
      });
      
      const messageIndex = (lastMessage?.messageIndex || -1) + 1;
      
      const message = await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId: input.conversationId,
          userId: input.userId,
          role: input.role,
          content: input.content,
          contentJson: input.contentJson,
          runId: input.runId,
          toolName: input.toolName,
          toolInput: input.toolInput,
          toolOutput: input.toolOutput,
          messageIndex
        }
      });
      
      // อัปเดต conversation updatedAt
      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() }
      });
      
      console.log(`💬 Message added to conversation ${input.conversationId}: ${message.role}`);
      return message;
    } catch (error) {
      console.error('❌ Failed to add message:', error);
      throw error;
    }
  }

  /**
   * อัปเดต conversation
   */
  static async updateConversation(
    conversationId: string,
    updates: {
      title?: string;
      context?: any;
      visibility?: 'private' | 'public' | 'unlisted';
    }
  ): Promise<ConversationData | null> {
    try {
      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Conversation updated: ${conversationId}`);
      return conversation;
    } catch (error) {
      console.error('❌ Failed to update conversation:', error);
      return null;
    }
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { archivedAt: new Date() }
      });
      
      console.log(`📦 Conversation archived: ${conversationId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to archive conversation:', error);
      return false;
    }
  }

  /**
   * ลบ conversation (hard delete)
   */
  static async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await prisma.conversation.delete({
        where: { id: conversationId }
      });
      
      console.log(`🗑️ Conversation deleted: ${conversationId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete conversation:', error);
      return false;
    }
  }

  /**
   * หา conversation ที่ active ล่าสุดของ user
   */
  static async getActiveConversation(
    userId: string,
    projectId?: string
  ): Promise<ConversationData | null> {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          userId,
          ...(projectId && { projectId }),
          archivedAt: null
        },
        orderBy: { updatedAt: 'desc' }
      });
      
      return conversation;
    } catch (error) {
      console.error('❌ Failed to get active conversation:', error);
      return null;
    }
  }

  /**
   * สร้างหรือหา conversation ที่ active
   */
  static async getOrCreateActiveConversation(
    userId: string,
    projectId?: string,
    agentId?: string | null
  ): Promise<ConversationData> {
    try {
      // หา conversation ที่ active อยู่
      let conversation = await this.getActiveConversation(userId, projectId);
      
      if (!conversation) {
        // สร้างใหม่ถ้าไม่มี
        conversation = await this.createConversation({
          userId,
          projectId,
          agentId,
          title: this.generateDefaultTitle()
        });
      }
      
      return conversation;
    } catch (error) {
      console.error('❌ Failed to get or create active conversation:', error);
      throw error;
    }
  }

  /**
   * Restore conversation history จาก database
   */
  static async restoreConversationHistory(
    conversationId: string,
    limit: number = 50
  ): Promise<{
    conversation: ConversationData;
    messages: MessageData[];
  } | null> {
    try {
      const conversationWithMessages = await this.getConversationWithMessages(
        conversationId,
        limit
      );
      
      if (!conversationWithMessages) {
        return null;
      }
      
      return {
        conversation: conversationWithMessages,
        messages: conversationWithMessages.messages
      };
    } catch (error) {
      console.error('❌ Failed to restore conversation history:', error);
      return null;
    }
  }

  /**
   * สร้าง title เริ่มต้น
   */
  private static generateDefaultTitle(): string {
    const now = new Date();
    const timeStr = now.toLocaleString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `การสนทนา ${timeStr}`;
  }

  /**
   * สร้าง user ถ้ายังไม่มี
   */
  private static async ensureUserExists(userId: string): Promise<void> {
    try {
      // ตรวจสอบว่า user มีอยู่แล้วหรือไม่
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!existingUser) {
        console.log(`👤 Creating user: ${userId}`);
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@midori.ai`,
            displayName: `User ${userId}`,
            isActive: true,
            locale: 'th'
          }
        });
        console.log(`✅ User created: ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to ensure user exists:`, error);
      throw error;
    }
  }

  /**
   * สร้าง title จาก message แรก
   */
  static generateTitleFromMessage(content: string): string {
    // ตัด title จาก message แรก (ไม่เกิน 50 ตัวอักษร)
    const cleanContent = content.trim().replace(/\n/g, ' ');
    return cleanContent.length > 50 
      ? cleanContent.substring(0, 47) + '...'
      : cleanContent;
  }

  /**
   * นับจำนวน messages ใน conversation
   */
  static async getMessageCount(conversationId: string): Promise<number> {
    try {
      const count = await prisma.message.count({
        where: { conversationId }
      });
      return count;
    } catch (error) {
      console.error('❌ Failed to get message count:', error);
      return 0;
    }
  }

  /**
   * Cleanup old conversations (สำหรับ maintenance)
   */
  static async cleanupOldConversations(
    daysOld: number = 30,
    batchSize: number = 100
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const conversations = await prisma.conversation.findMany({
        where: {
          archivedAt: { not: null },
          updatedAt: { lt: cutoffDate }
        },
        take: batchSize,
        select: { id: true }
      });
      
      let deletedCount = 0;
      for (const conv of conversations) {
        const deleted = await this.deleteConversation(conv.id);
        if (deleted) deletedCount++;
      }
      
      console.log(`🧹 Cleaned up ${deletedCount} old conversations`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old conversations:', error);
      return 0;
    }
  }
}
