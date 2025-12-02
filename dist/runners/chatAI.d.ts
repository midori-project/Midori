/**
 * Chat AI Interface - แปลง user input เป็น structured commands หรือ chat responses
 *
 * รับผิดชอบ:
 * 1. ตัดสินใจ intent: chat vs task
 * 2. สำหรับ chat: ตอบกลับตรง ๆ
 * 3. สำหรับ task: แปลงเป็น structured command
 * 4. ส่งต่อ command ไป orchestrator
 */
import { Command } from '../agents/orchestrator/runners/run';
export interface UserMessage {
    content: string;
    userId: string;
    sessionId: string;
    timestamp: string;
}
export interface ChatResponse {
    type: 'chat' | 'task';
    content: string;
    command?: Command;
    taskPlan?: any;
}
/**
 * Chat AI Response System
 * รับ user input และตัดสินใจว่าจะตอบ chat หรือสร้าง task
 */
export declare class ChatAI {
    private llmAdapter;
    constructor();
    processUserMessage(message: UserMessage): Promise<ChatResponse>;
    /**
     * สร้าง prompt สำหรับวิเคราะห์ user input
     */
    private buildAnalysisPrompt;
    /**
     * แปลง AI analysis เป็น structured command
     */
    private createCommand;
}
/**
 * Helper function สำหรับทดสอบ
 */
export declare function processChatMessage(content: string, userId?: string, sessionId?: string): Promise<ChatResponse>;
