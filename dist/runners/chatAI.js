/**
 * Chat AI Interface - แปลง user input เป็น structured commands หรือ chat responses
 *
 * รับผิดชอบ:
 * 1. ตัดสินใจ intent: chat vs task
 * 2. สำหรับ chat: ตอบกลับตรง ๆ
 * 3. สำหรับ task: แปลงเป็น structured command
 * 4. ส่งต่อ command ไป orchestrator
 */
import { LLMAdapter } from '../agents/orchestrator/adapters/llmAdapter';
import { run as runOrchestrator } from '../agents/orchestrator/runners/run';
import { randomUUID } from 'crypto';
/**
 * Chat AI Response System
 * รับ user input และตัดสินใจว่าจะตอบ chat หรือสร้าง task
 */
export class ChatAI {
    constructor() {
        this.llmAdapter = new LLMAdapter();
    }
    async processUserMessage(message) {
        try {
            console.log('🤖 Chat AI processing:', message.content);
            // ใช้ LLM แปลง user input เป็น intent และ action
            const analysisPrompt = this.buildAnalysisPrompt(message.content);
            const response = await this.llmAdapter.callLLM(analysisPrompt, {
                useSystemPrompt: false,
                temperature: 0.3,
                maxTokens: 500
            });
            console.log('🧠 AI Analysis:', response);
            // Parse analysis result
            let parsedAnalysis;
            try {
                parsedAnalysis = JSON.parse(response.content);
            }
            catch (error) {
                console.error('❌ Failed to parse AI analysis:', error);
                return {
                    type: 'chat',
                    content: 'ขออภัยครับ เกิดข้อผิดพลาดในการวิเคราะห์ข้อความของคุณ'
                };
            }
            // ถ้าเป็น chat
            if (parsedAnalysis.type === 'chat') {
                return {
                    type: 'chat',
                    content: parsedAnalysis.response
                };
            }
            // ถ้าเป็น task - สร้าง structured command
            if (parsedAnalysis.type === 'task') {
                const command = this.createCommand(parsedAnalysis, message);
                console.log('🎯 Generated command:', JSON.stringify(command, null, 2));
                // ส่ง command ไป orchestrator
                const taskPlan = await runOrchestrator(command);
                return {
                    type: 'task',
                    content: `✅ เข้าใจแล้วครับ! กำลังดำเนินการ: ${parsedAnalysis.description}`,
                    command,
                    taskPlan
                };
            }
            // fallback
            return {
                type: 'chat',
                content: 'ขออภัยครับ ไม่เข้าใจความหมายของข้อความนี้'
            };
        }
        catch (error) {
            console.error('❌ Chat AI error:', error);
            return {
                type: 'chat',
                content: 'เกิดข้อผิดพลาดครับ กรุณาลองใหม่อีกครั้ง'
            };
        }
    }
    /**
     * สร้าง prompt สำหรับวิเคราะห์ user input
     */
    buildAnalysisPrompt(userInput) {
        return `คุณเป็น Chat AI ที่ช่วยวิเคราะห์ user input และตัดสินใจว่าเป็น:
1. **chat** - การทักทาย คำถามทั่วไป การสนทนา
2. **task** - งานเฉพาะ เช่น แก้ไขเว็บไซต์ สร้าง API deploy โปรเจค

**User Input:** "${userInput}"

ตอบกลับในรูปแบบ JSON เท่านั้น:

**สำหรับ chat:**
\`\`\`json
{
  "type": "chat",
  "response": "คำตอบที่เป็นมิตรเป็นภาษาไทย"
}
\`\`\`

**สำหรับ task:**
\`\`\`json
{
  "type": "task", 
  "description": "อธิบายงานที่จะทำ",
  "commandType": "update_component|create_component|create_api_endpoint|deploy_application|etc",
  "target": "ระบุ component/file ที่จะแก้ไข (ถ้ามี)",
  "parameters": {
    "key": "value ของ parameters ที่จำเป็น"
  }
}
\`\`\`

**Command Types ที่รองรับ:**
- select_template, customize_template
- create_component, update_component
- create_page, update_styling
- create_api_endpoint, update_database_schema  
- create_auth_system, implement_business_logic
- deploy_application, setup_monitoring
- create_complete_website, implement_full_feature

ตอบ JSON เท่านั้น ไม่ต้องอธิบายเพิ่ม:`;
    }
    /**
     * แปลง AI analysis เป็น structured command
     */
    createCommand(analysis, message) {
        return {
            commandId: randomUUID(),
            commandType: analysis.commandType,
            payload: {
                description: analysis.description,
                target: analysis.target,
                parameters: analysis.parameters || {},
                userInput: message.content
            },
            priority: 'medium',
            metadata: {
                timestamp: new Date().toISOString(),
                userId: message.userId
            }
        };
    }
}
/**
 * Helper function สำหรับทดสอบ
 */
export async function processChatMessage(content, userId = 'test-user', sessionId = randomUUID()) {
    const chatAI = new ChatAI();
    const message = {
        content,
        userId,
        sessionId,
        timestamp: new Date().toISOString()
    };
    return await chatAI.processUserMessage(message);
}
