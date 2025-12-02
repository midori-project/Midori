"use strict";
/**
 * 🎭 Unified Orchestrator AI
 * รวม Chat AI + Multi-Agent Orchestrator ในตัวเดียว
 *
 * Capabilities:
 * - Natural language processing
 * - Intent detection (chat vs task)
 * - Command translation
 * - Multi-agent coordination
 * - Task planning & execution
 * - Real-time communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorAI = exports.CommandType = void 0;
exports.processUserMessage = processUserMessage;
const llmAdapter_1 = require("./adapters/llmAdapter");
const run_1 = require("./runners/run");
const crypto_1 = require("crypto");
var CommandType;
(function (CommandType) {
    // Frontend Commands
    CommandType["SELECT_TEMPLATE"] = "select_template";
    CommandType["CUSTOMIZE_TEMPLATE"] = "customize_template";
    CommandType["CREATE_COMPONENT"] = "create_component";
    CommandType["UPDATE_COMPONENT"] = "update_component";
    CommandType["CREATE_PAGE"] = "create_page";
    CommandType["UPDATE_STYLING"] = "update_styling";
    CommandType["PERFORMANCE_AUDIT"] = "performance_audit";
    CommandType["ACCESSIBILITY_CHECK"] = "accessibility_check";
    CommandType["RESPONSIVE_DESIGN"] = "responsive_design";
    // Backend Commands
    CommandType["CREATE_API_ENDPOINT"] = "create_api_endpoint";
    CommandType["UPDATE_DATABASE_SCHEMA"] = "update_database_schema";
    CommandType["CREATE_AUTH_SYSTEM"] = "create_auth_system";
    CommandType["OPTIMIZE_DATABASE_QUERIES"] = "optimize_database_queries";
    CommandType["IMPLEMENT_BUSINESS_LOGIC"] = "implement_business_logic";
    CommandType["DATA_VALIDATION"] = "data_validation";
    // DevOps Commands
    CommandType["SETUP_CICD"] = "setup_cicd";
    CommandType["DEPLOY_APPLICATION"] = "deploy_application";
    CommandType["SETUP_MONITORING"] = "setup_monitoring";
    CommandType["OPTIMIZE_INFRASTRUCTURE"] = "optimize_infrastructure";
    CommandType["SECURITY_SCAN"] = "security_scan";
    CommandType["BACKUP_RESTORE"] = "backup_restore";
    // Multi-Agent Commands
    CommandType["CREATE_COMPLETE_WEBSITE"] = "create_complete_website";
    CommandType["IMPLEMENT_FULL_FEATURE"] = "implement_full_feature";
    CommandType["SETUP_FULL_STACK"] = "setup_full_stack";
})(CommandType || (exports.CommandType = CommandType = {}));
/**
 * Unified Orchestrator AI Class
 * รวม Chat AI และ Orchestrator capabilities
 */
class OrchestratorAI {
    constructor() {
        this.llmAdapter = new llmAdapter_1.LLMAdapter();
        this.conversationHistory = new Map();
    }
    /**
     * Main entry point - รับ user input และตอบสนองตามความเหมาะสม
     */
    async processUserInput(message) {
        const startTime = Date.now();
        try {
            console.log('🎭 Unified Orchestrator AI processing:', message.content);
            // Get conversation context
            const context = this.getOrCreateContext(message.sessionId || message.userId);
            // Update context with new message
            context.previousMessages.push(message.content);
            // Analyze user intent
            const analysis = await this.analyzeIntent(message.content, context);
            console.log('🧠 Intent Analysis:', analysis);
            let response;
            switch (analysis.intent) {
                case 'chat':
                    response = await this.handleChatRequest(message, analysis, context);
                    break;
                case 'simple_task':
                    response = await this.handleSimpleTask(message, analysis, context);
                    break;
                case 'complex_task':
                    response = await this.handleComplexTask(message, analysis, context);
                    break;
                default:
                    response = await this.handleUnclearIntent(message, analysis, context);
                    break;
            }
            // Update execution metadata
            response.metadata.executionTime = Date.now() - startTime;
            // Store context
            this.conversationHistory.set(message.sessionId || message.userId, context);
            return response;
        }
        catch (error) {
            console.error('❌ Orchestrator AI error:', error);
            return {
                type: 'chat',
                content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
                metadata: {
                    executionTime: Date.now() - startTime,
                    agentsUsed: [],
                    confidence: 0
                }
            };
        }
    }
    /**
     * วิเคราะห์ intent ของ user input
     */
    async analyzeIntent(input, context) {
        const analysisPrompt = this.buildIntentAnalysisPrompt(input, context);
        const response = await this.llmAdapter.callLLM(analysisPrompt, {
            useSystemPrompt: false,
            temperature: 0.3,
            maxTokens: 500
        });
        try {
            const analysis = JSON.parse(response.content);
            return {
                intent: analysis.intent || 'unclear',
                confidence: analysis.confidence || 0.5,
                taskType: analysis.taskType,
                requiredAgents: analysis.requiredAgents || [],
                complexity: analysis.complexity || 'medium',
                parameters: analysis.parameters || {}
            };
        }
        catch (error) {
            console.error('❌ Failed to parse intent analysis:', error);
            return {
                intent: 'unclear',
                confidence: 0.3,
                requiredAgents: [],
                complexity: 'medium'
            };
        }
    }
    /**
     * Handle pure chat requests
     */
    async handleChatRequest(message, analysis, context) {
        const chatPrompt = this.buildChatPrompt(message.content, context);
        const response = await this.llmAdapter.callLLM(chatPrompt, {
            useSystemPrompt: false,
            temperature: 0.7,
            maxTokens: 300
        });
        return {
            type: 'chat',
            content: response.content,
            metadata: {
                executionTime: 0, // Will be set by caller
                agentsUsed: [],
                confidence: analysis.confidence
            }
        };
    }
    /**
     * Handle simple tasks (single agent)
     */
    async handleSimpleTask(message, analysis, context) {
        // Create structured command
        const command = this.createCommand(message, analysis);
        // Execute via legacy orchestrator
        const taskResult = await (0, run_1.run)(command);
        // Generate user-friendly response
        const chatResponse = await this.generateTaskSummary(message.content, taskResult);
        return {
            type: 'task',
            content: chatResponse,
            taskResults: taskResult,
            nextSteps: this.generateNextSteps(taskResult),
            metadata: {
                executionTime: 0, // Will be set by caller
                agentsUsed: analysis.requiredAgents,
                confidence: analysis.confidence
            }
        };
    }
    /**
     * Handle complex tasks (multi-agent)
     */
    async handleComplexTask(message, analysis, context) {
        // For complex tasks, use the full orchestrator
        const command = this.createCommand(message, analysis);
        const taskResult = await (0, run_1.run)(command);
        // Generate comprehensive response
        const chatResponse = await this.generateTaskSummary(message.content, taskResult);
        return {
            type: 'mixed',
            content: chatResponse,
            taskResults: taskResult,
            nextSteps: this.generateNextSteps(taskResult),
            metadata: {
                executionTime: 0, // Will be set by caller
                agentsUsed: analysis.requiredAgents,
                confidence: analysis.confidence
            }
        };
    }
    /**
     * Handle unclear intents
     */
    async handleUnclearIntent(message, analysis, context) {
        const clarificationPrompt = `คุณต้องการให้ผมช่วยอะไรครับ? จากข้อความ "${message.content}" ผมไม่แน่ใจว่าคุณต้องการ:
    
1. 🗣️ คุยธรรมดา (ถามคำถาม, ขอคำแนะนำ)
2. 🎨 งานเกี่ยวกับหน้าเว็บ (แก้ไข UI, เพิ่ม component)
3. ⚙️ งานเกี่ยวกับระบบ (สร้าง API, จัดการฐานข้อมูล)
4. 🚀 งานเกี่ยวกับ deployment (อัปโหลดเว็บ, ติดตั้งระบบ)

กรุณาอธิบายเพิ่มเติมหน่อยครับ 😊`;
        return {
            type: 'chat',
            content: clarificationPrompt,
            metadata: {
                executionTime: 0,
                agentsUsed: [],
                confidence: analysis.confidence
            }
        };
    }
    // Helper methods
    getOrCreateContext(sessionId) {
        if (!this.conversationHistory.has(sessionId)) {
            this.conversationHistory.set(sessionId, {
                previousMessages: [],
                activeAgents: [],
            });
        }
        return this.conversationHistory.get(sessionId);
    }
    createCommand(message, analysis) {
        // Map intent to command type
        let commandType;
        if (analysis.requiredAgents.includes('frontend')) {
            commandType = CommandType.UPDATE_COMPONENT;
        }
        else if (analysis.requiredAgents.includes('backend')) {
            commandType = CommandType.CREATE_API_ENDPOINT;
        }
        else if (analysis.requiredAgents.includes('devops')) {
            commandType = CommandType.DEPLOY_APPLICATION;
        }
        else {
            commandType = CommandType.CREATE_COMPLETE_WEBSITE;
        }
        return {
            commandId: (0, crypto_1.randomUUID)(),
            commandType,
            payload: {
                description: analysis.taskType || message.content,
                target: analysis.parameters?.target,
                parameters: analysis.parameters || {},
                userInput: message.content
            },
            priority: analysis.complexity === 'high' ? 'high' : 'medium',
            metadata: {
                timestamp: new Date().toISOString(),
                userId: message.userId
            }
        };
    }
    buildIntentAnalysisPrompt(input, context) {
        return `คุณเป็น AI ที่วิเคราะห์ intent ของ user input สำหรับระบบสร้างเว็บไซต์

**User Input:** "${input}"

**Context:** ${context.previousMessages.slice(-3).join(', ')}

ตอบกลับในรูปแบบ JSON เท่านั้น:

\`\`\`json
{
  "intent": "chat|simple_task|complex_task|unclear",
  "confidence": 0.8,
  "taskType": "สรุปงานที่ต้องทำ",
  "requiredAgents": ["frontend", "backend", "devops"],
  "complexity": "low|medium|high",
  "parameters": {
    "key": "value"
  }
}
\`\`\`

**Guidelines:**
- **chat**: ทักทาย, ถามคำถาม, ขอคำแนะนำ
- **simple_task**: แก้ไข component เดียว, สร้าง API เดียว
- **complex_task**: สร้างเว็บไซต์ใหม่, ระบบซับซ้อน
- **unclear**: ไม่ชัดเจนว่าต้องการอะไร`;
    }
    buildChatPrompt(input, context) {
        return `คุณเป็น Midori AI ผู้ช่วยสร้างเว็บไซต์ที่เป็นมิตรและรู้จักเทคโนโลยีดี

User พูดว่า: "${input}"

ตอบแบบเป็นมิตร เป็นธรรมชาติ และให้ข้อมูลที่เป็นประโยชน์ เกี่ยวกับ:
- Vite + React + TypeScript
- Supabase (Database + Auth)
- การสร้างเว็บไซต์

ตอบเป็นภาษาไทยแบบสั้น ๆ กระชับ (ไม่เกิน 100 คำ)`;
    }
    async generateTaskSummary(input, taskResult) {
        const summaryPrompt = `สรุปผลการทำงานให้ user ฟังแบบเข้าใจง่าย:

User ขอ: "${input}"

ผลการทำงาน: ${JSON.stringify(taskResult, null, 2)}

สรุปเป็นภาษาไทยแบบสั้น ๆ บอกว่าทำอะไรเสร็จแล้วบ้าง (ไม่เกิน 80 คำ)`;
        try {
            const response = await this.llmAdapter.callLLM(summaryPrompt, {
                useSystemPrompt: false,
                temperature: 0.5,
                maxTokens: 200
            });
            return response.content;
        }
        catch (error) {
            return `✅ เสร็จแล้วครับ! ได้ทำตามที่คุณขอแล้ว`;
        }
    }
    generateNextSteps(taskResult) {
        // Simple next steps generation
        if (taskResult?.plan?.tasks) {
            return ['ทดสอบการทำงาน', 'ปรับแต่งตามต้องการ', 'เผยแพร่เว็บไซต์'];
        }
        return ['ลองใช้งานดู', 'แจ้งถ้ามีปัญหา'];
    }
}
exports.OrchestratorAI = OrchestratorAI;
/**
 * Helper function สำหรับใช้งาน
 */
async function processUserMessage(content, userId = 'default-user', sessionId) {
    const orchestrator = new OrchestratorAI();
    const message = {
        content,
        userId,
        sessionId: sessionId || userId,
        timestamp: new Date().toISOString()
    };
    return await orchestrator.processUserInput(message);
}
