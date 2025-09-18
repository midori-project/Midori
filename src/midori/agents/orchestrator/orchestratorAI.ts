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

import { LLMAdapter } from './adapters/llmAdapter';
import { run as legacyOrchestrator } from './runners/run';
import { ChatPromptLoader } from './prompts/chatPromptLoader';
import { getResponseConfig, toLLMOptions } from './configs/responseConfig';
import { randomUUID } from 'crypto';

// Create singleton instance
const chatPromptLoader = ChatPromptLoader.getInstance();

// Types
export interface UserMessage {
  content: string;
  userId: string;
  sessionId?: string;
  timestamp: string;
  context?: ConversationContext;
}

export interface ConversationContext {
  previousMessages: string[];
  currentProject?: string;
  activeAgents: string[];
  lastTaskResult?: any;
}

export interface OrchestratorResponse {
  type: 'chat' | 'task' | 'mixed';
  content: string;
  taskResults?: any;
  nextSteps?: string[];
  metadata: {
    executionTime: number;
    agentsUsed: string[];
    confidence: number;
  };
}

export interface IntentAnalysis {
  intent: 'chat' | 'simple_task' | 'complex_task' | 'unclear';
  confidence: number;
  taskType?: string;
  requiredAgents: ('frontend' | 'backend' | 'devops')[];
  complexity: 'low' | 'medium' | 'high';
  parameters?: Record<string, any>;
}

export enum CommandType {
  // Frontend Commands
  SELECT_TEMPLATE = 'select_template',
  CUSTOMIZE_TEMPLATE = 'customize_template',
  CREATE_COMPONENT = 'create_component',
  UPDATE_COMPONENT = 'update_component',
  CREATE_PAGE = 'create_page',
  UPDATE_STYLING = 'update_styling',
  PERFORMANCE_AUDIT = 'performance_audit',
  ACCESSIBILITY_CHECK = 'accessibility_check',
  RESPONSIVE_DESIGN = 'responsive_design',

  // Backend Commands
  CREATE_API_ENDPOINT = 'create_api_endpoint',
  UPDATE_DATABASE_SCHEMA = 'update_database_schema',
  CREATE_AUTH_SYSTEM = 'create_auth_system',
  OPTIMIZE_DATABASE_QUERIES = 'optimize_database_queries',
  IMPLEMENT_BUSINESS_LOGIC = 'implement_business_logic',
  DATA_VALIDATION = 'data_validation',

  // DevOps Commands
  SETUP_CICD = 'setup_cicd',
  DEPLOY_APPLICATION = 'deploy_application',
  SETUP_MONITORING = 'setup_monitoring',
  OPTIMIZE_INFRASTRUCTURE = 'optimize_infrastructure',
  SECURITY_SCAN = 'security_scan',
  BACKUP_RESTORE = 'backup_restore',

  // Multi-Agent Commands
  CREATE_COMPLETE_WEBSITE = 'create_complete_website',
  IMPLEMENT_FULL_FEATURE = 'implement_full_feature',
  SETUP_FULL_STACK = 'setup_full_stack'
}

export interface Command {
  commandId: string;
  commandType: CommandType;
  payload: {
    description: string;
    target?: string;
    parameters: Record<string, any>;
    userInput?: string;
  };
  priority: 'low' | 'medium' | 'high';
  metadata: {
    timestamp: string;
    userId?: string;
    projectId?: string;
  };
}

/**
 * Unified Orchestrator AI Class
 * รวม Chat AI และ Orchestrator capabilities
 */
export class OrchestratorAI {
  private llmAdapter: LLMAdapter;
  private conversationHistory: Map<string, ConversationContext>;
  private initialized: boolean = false;

  constructor() {
    this.llmAdapter = new LLMAdapter();
    this.conversationHistory = new Map();
  }

  /**
   * Initialize the orchestrator - ต้องเรียกก่อนใช้งาน
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔧 Initializing Orchestrator AI...');
      await this.llmAdapter.initialize();
      this.initialized = true;
      console.log('✅ Orchestrator AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Orchestrator AI:', error);
      throw error;
    }
  }

  /**
   * Main entry point - รับ user input และตอบสนองตามความเหมาะสม
   */
  async processUserInput(message: UserMessage): Promise<OrchestratorResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🎭 Unified Orchestrator AI processing:', message.content);

      // Ensure initialization
      if (!this.initialized) {
        await this.initialize();
      }

      // Get conversation context
      const context = this.getOrCreateContext(message.sessionId || message.userId);
      
      // Update context with new message
      context.previousMessages.push(message.content);
      
      // Analyze user intent
      const analysis = await this.analyzeIntent(message.content, context);
      
      console.log('🧠 Intent Analysis:', analysis);

      let response: OrchestratorResponse;

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

    } catch (error) {
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
  private async analyzeIntent(
    input: string, 
    context: ConversationContext
  ): Promise<IntentAnalysis> {
    
    // Quick detection สำหรับคำถามพื้นฐาน
    const quickIntent = this.detectQuickIntent(input);
    if (quickIntent) {
      return quickIntent;
    }
    
    const analysisPrompt = this.buildIntentAnalysisPrompt(input, context);
    
    // ใช้ response config สำหรับ intent analysis
    const analysisConfig = getResponseConfig('intentAnalysis');
    const llmOptions = this.getModelSpecificOptions({
      useSystemPrompt: false,
      ...toLLMOptions(analysisConfig)
    });
    
    const response = await this.llmAdapter.callLLM(analysisPrompt, llmOptions);

    try {
      // แก้ไข JSON parsing เพื่อรองรับ markdown และ empty response
      let jsonContent = response.content?.trim() || '';
      
      // ตรวจสอบ empty response
      if (!jsonContent) {
        console.warn('⚠️ Empty response from LLM, using fallback analysis');
        return this.getFallbackAnalysis();
      }
      
      // ลบ markdown code blocks ถ้ามี
      if (jsonContent.includes('```json')) {
        const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      } else if (jsonContent.includes('```')) {
        const jsonMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      }
      
      // ลอง parse JSON
      const analysis = JSON.parse(jsonContent);
      return {
        intent: analysis.intent || 'unclear',
        confidence: analysis.confidence || 0.5,
        taskType: analysis.taskType,
        requiredAgents: analysis.requiredAgents || [],
        complexity: analysis.complexity || 'medium',
        parameters: analysis.parameters || {}
      };
    } catch (error) {
      console.error('❌ Failed to parse intent analysis:', error);
      console.error('📄 Raw response content:', response.content);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Fallback analysis เมื่อ parse ไม่ได้
   */
  private getFallbackAnalysis(): IntentAnalysis {
    return {
      intent: 'unclear',
      confidence: 0.3,
      requiredAgents: [],
      complexity: 'medium'
    };
  }

  /**
   * ตรวจจับ intent ที่ง่าย ๆ ไม่ต้องใช้ AI
   */
  private detectQuickIntent(input: string): IntentAnalysis | null {
    const lowerInput = input.toLowerCase().trim();
    
    // 🛡️ Security-sensitive requests
    const securityKeywords = [
      'รหัส env', 'env key', 'environment variable', 'api key', 'secret key',
      'password', 'รหัสผ่าน', 'token', 'credential', 'database password',
      'config file', 'ไฟล์ config', '.env', 'env file', 'connection string'
    ];
    
    if (securityKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        intent: 'chat',
        confidence: 0.95,
        taskType: 'security_denial',
        requiredAgents: [],
        complexity: 'low',
        parameters: { type: 'security_sensitive' }
      };
    }
    
    const mentionsMidori = lowerInput.includes('midori');
    const midoriContextKeywords = ['แพลตฟอร์ม', 'platform', 'เว็บ', 'website', 'คือ', 'อะไร', 'ข้อมูล', 'แนะนำ', 'ทำอะไรได้', 'ฟีเจอร์', 'browser'];
    const isMidoriIdentityRequest = mentionsMidori && midoriContextKeywords.some(keyword => lowerInput.includes(keyword));

    if (isMidoriIdentityRequest) {
      return {
        intent: 'chat',
        confidence: 0.92,
        taskType: 'midori_identity',
        requiredAgents: [],
        complexity: 'low',
        parameters: { type: 'midori_identity' }
      };
    }
    
    // ⏰ Time/Date queries
    const timeKeywords = ['เวลา', 'กี่โมง', 'วันที่', 'วันนี้', 'ตอนนี้', 'เดี๋ยวนี้', 'time', 'date', 'now'];
    if (timeKeywords.some(keyword => lowerInput.includes(keyword))) {
      return {
        intent: 'chat',
        confidence: 0.95,
        taskType: 'time_query',
        requiredAgents: [],
        complexity: 'low',
        parameters: { type: 'time_query' }
      };
    }

    // คำถามเกี่ยวกับชื่อ/ตัวตน
    if (lowerInput.includes('ชื่ออะไร') || 
        lowerInput.includes('คุณคือใคร') || 
        lowerInput.includes('แนะนำตัว') ||
        lowerInput.includes('what is your name') ||
        lowerInput.includes('who are you')) {
      return {
        intent: 'chat',
        confidence: 0.9,
        taskType: 'แนะนำตัว',
        requiredAgents: [],
        complexity: 'low',
        parameters: { type: 'introduction' }
      };
    }

    // คำทักทาย (ปรับให้ทนทานขึ้น)
    if (lowerInput.includes('สวัสดี') || 
        lowerInput.includes('hello') || 
        lowerInput.includes('hi') ||
        lowerInput === 'ไง' ||
        lowerInput === 'หวัดดี') {
      return {
        intent: 'chat',
        confidence: 0.9,
        taskType: 'ทักทาย',
        requiredAgents: [],
        complexity: 'low',
        parameters: { type: 'greeting' }
      };
    }

    // ไม่พบ quick intent
    return null;
  }

  /**
   * Handle pure chat requests
   */
  private async handleChatRequest(
    message: UserMessage,
    analysis: IntentAnalysis,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    
    const shortCircuitType = analysis.parameters?.type;

    // ⏰ Time/Date queries - ตอบทันทีไม่ใช้ LLM
    if (shortCircuitType === 'time_query') {
      const timeResponse = this.formatCurrentTimeForUser();
      return {
        type: 'chat',
        content: timeResponse,
        metadata: {
          executionTime: 0,
          agentsUsed: [],
          confidence: analysis.confidence
        }
      };
    }

    if (shortCircuitType === 'security_sensitive') {
      const securityResponse = await chatPromptLoader.getPrompt('securityDenial');
      return {
        type: 'chat',
        content: securityResponse,
        metadata: {
          executionTime: 0,
          agentsUsed: [],
          confidence: analysis.confidence
        }
      };
    }

    // 🎯 กำหนด response config ตามประเภทการตอบ
    let responseConfigType: string;
    
    if (shortCircuitType === 'greeting') {
      responseConfigType = 'greeting';
    } else if (shortCircuitType === 'introduction') {
      responseConfigType = 'introduction';
    } else if (shortCircuitType === 'midori_identity') {
      responseConfigType = 'midoriIdentity';
    } else if (analysis.taskType === 'ทักทาย') {
      responseConfigType = 'greeting';
    } else if (analysis.taskType === 'แนะนำตัว') {
      responseConfigType = 'introduction';
    } else if (context.currentProject && context.lastTaskResult) {
      responseConfigType = 'projectContextAware';
    } else if (context.previousMessages.length > 0) {
      responseConfigType = 'contextAware';
    } else {
      responseConfigType = 'baseChat';
    }

    const chatPrompt = await this.buildChatPrompt(message.content, context, analysis);
    
    // 🔍 Debug: เช็คว่า chatPrompt ที่ได้มาถูกต้องไหม
    console.log(`🔍 Generated chatPrompt preview:`, chatPrompt.substring(0, 200));
    console.log(`🎯 Expected introduction prompt should contain: "Midori AI Agent"`);
    console.log(`✅ Does prompt contain expected text?`, chatPrompt.includes('Midori AI Agent'));
    
    // ใช้ response configuration ที่เหมาะสม
    const responseConfig = getResponseConfig(responseConfigType);
    const llmOptions = this.getModelSpecificOptions({
      useSystemPrompt: false,
      ...toLLMOptions(responseConfig)
    });
    
    const response = await this.llmAdapter.callLLM(chatPrompt, llmOptions);

    console.log(`✅ Chat response generated using '${responseConfigType}' config:`, {
      tokens: responseConfig.maxCompletionTokens,
      reasoning: responseConfig.reasoning?.effort,
      verbosity: responseConfig.text?.verbosity
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
  private async handleSimpleTask(
    message: UserMessage,
    analysis: IntentAnalysis,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    
    // Create structured command
    const command = this.createCommand(message, analysis);
    
    // Execute via legacy orchestrator
    const taskResult = await legacyOrchestrator(command);
    
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
  private async handleComplexTask(
    message: UserMessage,
    analysis: IntentAnalysis,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    
    // For complex tasks, use the full orchestrator
    const command = this.createCommand(message, analysis);
    const taskResult = await legacyOrchestrator(command);
    
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
  private async handleUnclearIntent(
    message: UserMessage,
    analysis: IntentAnalysis,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    
    try {
      const clarificationPrompt = await chatPromptLoader.getPrompt('unclearIntent', { 
        input: message.content 
      });
      
      return {
        type: 'chat',
        content: clarificationPrompt,
        metadata: {
          executionTime: 0,
          agentsUsed: [],
          confidence: analysis.confidence
        }
      };
    } catch (error) {
      console.error('❌ Failed to load unclear intent prompt:', error);
      
      // Fallback clarification message
      const fallbackMessage = `คุณต้องการให้ผมช่วยอะไรครับ? จากข้อความ "${message.content}" ผมไม่แน่ใจว่าคุณต้องการ:
      
1. 🗣️ คุยธรรมดา (ถามคำถาม, ขอคำแนะนำ)
2. 🎨 งานเกี่ยวกับหน้าเว็บ (แก้ไข UI, เพิ่ม component)
3. ⚙️ งานเกี่ยวกับระบบ (สร้าง API, จัดการฐานข้อมูล)
4. 🚀 งานเกี่ยวกับ deployment (อัปโหลดเว็บ, ติดตั้งระบบ)

กรุณาอธิบายเพิ่มเติมหน่อยครับ 😊`;

      return {
        type: 'chat',
        content: fallbackMessage,
        metadata: {
          executionTime: 0,
          agentsUsed: [],
          confidence: analysis.confidence
        }
      };
    }
  }

  // Helper methods
  private getOrCreateContext(sessionId: string): ConversationContext {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, {
        previousMessages: [],
        activeAgents: [],
      });
    }
    return this.conversationHistory.get(sessionId)!;
  }

  /**
   * ปรับ LLM options ให้เหมาะสมกับแต่ละ model
   */
  private getModelSpecificOptions(options: {
    useSystemPrompt?: boolean;
    temperature?: number;
    maxTokens?: number;
    maxCompletionTokens?: number;
    reasoning?: {
      effort: 'minimal' | 'low' | 'medium' | 'high';
    };
    text?: {
      verbosity: 'low' | 'medium' | 'high';
    };
    model?: string;
  }) {
    // ใช้ model จาก LLMAdapter จริง ๆ
    const currentModel = this.llmAdapter.getCurrentModel();
    const constraints = this.llmAdapter.getModelConstraints();
    
    console.log(`🤖 Using model: ${currentModel}, constraints:`, constraints);
    
    // ถ้า model ต้องการ default temperature เท่านั้น
    if (constraints.requiresDefaultTemperature) {
      console.log(`⚠️ Model ${currentModel} requires default temperature, removing custom temperature`);
      const { temperature, ...optionsWithoutTemp } = options;
      return optionsWithoutTemp; // ไม่ส่ง temperature parameter
    }
    
    // Models อื่น ๆ ใช้ค่าปกติ
    return options;
  }

  private createCommand(message: UserMessage, analysis: IntentAnalysis): Command {
    // Map intent to command type
    let commandType: CommandType;
    
    if (analysis.requiredAgents.includes('frontend')) {
      commandType = CommandType.UPDATE_COMPONENT;
    } else if (analysis.requiredAgents.includes('backend')) {
      commandType = CommandType.CREATE_API_ENDPOINT;
    } else if (analysis.requiredAgents.includes('devops')) {
      commandType = CommandType.DEPLOY_APPLICATION;
    } else {
      commandType = CommandType.CREATE_COMPLETE_WEBSITE;
    }

    return {
      commandId: randomUUID(),
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

  private buildIntentAnalysisPrompt(input: string, context: ConversationContext): string {
    return `คุณเป็น AI ที่วิเคราะห์ intent ของ user input สำหรับระบบสร้างเว็บไซต์

**User Input:** "${input}"

**Context:** ${context.previousMessages.slice(-3).join(', ')}

IMPORTANT: ตอบกลับเป็น JSON object เท่านั้น ไม่ต้องใช้ markdown หรือ \`\`\`

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

**Guidelines:**
- **chat**: ทักทาย, ถามคำถาม, ขอคำแนะนำ, ถามชื่อ, คุยธรรมดา, คำนวณคณิตศาสตร์ (เช่น 1+1), อธิบายคำศัพท์, ถามเกี่ยวกับข้อมูล
- **simple_task**: แก้ไข component เดียว, สร้าง API เดียว, เพิ่ม/ลบ feature เล็กๆ
- **complex_task**: สร้างเว็บไซต์ใหม่, ระบบซับซ้อน, โปรเจคใหม่ทั้งหมด
- **unclear**: ไม่ชัดเจนว่าต้องการอะไร

**Chat Examples (ใช้ chat เท่านั้น):**
- "1+1 เท่ากับเท่าไหร่", "5*3 เท่าไหร่"
- "สวัสดี", "hello", "คุณคือใคร"
- "React คืออะไร", "Supabase ทำอะไรได้"
- "คำแนะนำในการเรียนโปรแกรม"
- "อธิบายให้ฟัง", "หมายความว่าอะไร"`;
  }

  /**
   * Build chat prompt using prompt loader
   */
  private async buildChatPrompt(
    input: string, 
    context: ConversationContext, 
    analysis?: IntentAnalysis
  ): Promise<string> {
    try {
      console.log(`🎭 buildChatPrompt called with analysis:`, analysis?.parameters);
      
      // ตรวจสอบประเภทคำถาม
      const lowerInput = input.toLowerCase();
      const shortCircuitType = analysis?.parameters?.type;
      
      // 🛡️ Security-sensitive requests
      if (analysis?.parameters?.type === 'security_sensitive') {
        console.log(`🛡️ Using security denial prompt`);
        return await chatPromptLoader.getPrompt('securityDenial');
      }
      
      const midoriIdentityKeywords = ['แพลตฟอร์ม', 'platform', 'เว็บ', 'website', 'คือ', 'อะไร', 'ข้อมูล', 'แนะนำ', 'ทำอะไรได้', 'ฟีเจอร์', 'browser'];
      const shouldUseMidoriIdentity =
        analysis?.parameters?.type === 'midori_identity' ||
        (lowerInput.includes('midori') && midoriIdentityKeywords.some(keyword => lowerInput.includes(keyword)));

      if (shouldUseMidoriIdentity) {
        console.log(`🌿 Using midori identity prompt`);
        return await chatPromptLoader.getPrompt('midoriIdentity', { input });
      }

      // Introduction/Self-identification
      if (lowerInput.includes('ชื่ออะไร') || 
          lowerInput.includes('คุณคือใคร') || 
          lowerInput.includes('แนะนำตัว') ||
          lowerInput.includes('คุณเป็นใคร') ||
          lowerInput.includes('คือใคร') ||
          (analysis?.parameters?.type === 'introduction')) {
        
        console.log(`🎯 Using introduction prompt for input: "${input}"`);
        try {
          const prompt = await chatPromptLoader.getPrompt('introduction', { input });
          console.log(`📝 Introduction prompt loaded: ${prompt.substring(0, 100)}...`);
          return prompt;
        } catch (error) {
          console.error(`❌ Failed to load introduction prompt:`, error);
          return this.getFallbackChatPrompt(input);
        }
      }
      
      // Greeting (ปรับให้ทนทานขึ้น)
      if (lowerInput.includes('สวัสดี') || 
          lowerInput.includes('hello') || 
          lowerInput.includes('hi') ||
          lowerInput === 'ไง' ||
          lowerInput === 'หวัดดี' ||
          (analysis?.parameters?.type === 'greeting')) {
        return await chatPromptLoader.getPrompt('greeting');
      }
      
      // Technology questions
      if (lowerInput.includes('เทคโนโลยี') || 
          lowerInput.includes('react') || 
          lowerInput.includes('supabase') ||
          lowerInput.includes('vite')) {
        return await chatPromptLoader.getPrompt('technologyExplanation', { input });
      }
      
      // Project context aware (ถ้ามี project context)
      if (context.currentProject && context.lastTaskResult) {
        return await chatPromptLoader.getPrompt('projectContextAware', { 
          input, 
          projectName: context.currentProject,
          recentWork: JSON.stringify(context.lastTaskResult).substring(0, 200) + '...'
        });
      }
      
      // Context-aware (ถ้ามี conversation history)
      if (context.previousMessages.length > 0) {
        const recentMessages = context.previousMessages.slice(-3).join(', ');
        return await chatPromptLoader.getPrompt('contextAware', { 
          input, 
          context: recentMessages 
        });
      }
      
      // Default base chat prompt
      return await chatPromptLoader.getPrompt('base', { input });
      
    } catch (error) {
      console.error('❌ Failed to load chat prompt, using fallback:', error);
      return this.getFallbackChatPrompt(input);
    }
  }

  /**
   * Fallback chat prompt ถ้าโหลดไฟล์ไม่ได้
   */
  private getFallbackChatPrompt(input: string): string {
    return `คุณเป็น Midori AI ผู้ช่วยสร้างเว็บไซต์ที่เป็นมิตรและรู้จักเทคโนโลยีดี

User พูดว่า: "${input}"

ตอบแบบเป็นมิตร เป็นธรรมชาติ และให้ข้อมูลที่เป็นประโยชน์

**หากถูกถามเกี่ยวกับตัวตน/ชื่อ:**
- ชื่อ: Midori AI
- บทบาท: ผู้ช่วยสร้างเว็บไซต์อัจฉริยะ
- ความสามารถ: สร้าง UI, API, Deploy เว็บไซต์

**เทคโนโลยีที่รู้จัก:**
- Vite + React + TypeScript
- Supabase (Database + Auth)
- การสร้างเว็บไซต์

ตอบเป็นภาษาไทยแบบสั้น ๆ กระชับ (ไม่เกิน 100 คำ)`;
  }

  private async generateTaskSummary(input: string, taskResult: any): Promise<string> {
    const summaryPrompt = `สรุปผลการทำงานให้ user ฟังแบบเข้าใจง่าย:

User ขอ: "${input}"

ผลการทำงาน: ${JSON.stringify(taskResult, null, 2)}

สรุปเป็นภาษาไทยแบบสั้น ๆ บอกว่าทำอะไรเสร็จแล้วบ้าง (ไม่เกิน 80 คำ)`;

    try {
      // ใช้ task summary config
      const summaryConfig = getResponseConfig('taskSummary');
      const llmOptions = this.getModelSpecificOptions({
        useSystemPrompt: false,
        ...toLLMOptions(summaryConfig)
      });
      
      const response = await this.llmAdapter.callLLM(summaryPrompt, llmOptions);
      return response.content;
    } catch (error) {
      return `✅ เสร็จแล้วครับ! ได้ทำตามที่คุณขอแล้ว`;
    }
  }

  private generateNextSteps(taskResult: any): string[] {
    // Simple next steps generation
    if (taskResult?.plan?.tasks) {
      return ['ทดสอบการทำงาน', 'ปรับแต่งตามต้องการ', 'เผยแพร่เว็บไซต์'];
    }
    return ['ลองใช้งานดู', 'แจ้งถ้ามีปัญหา'];
  }

  /**
   * Format current time for user query
   */
  private formatCurrentTimeForUser(tz?: string): string {
    const timezone = tz || process.env.TZ || 'Asia/Bangkok';
    const now = new Date();
    
    const formatter = new Intl.DateTimeFormat('th-TH', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    
    const formattedTime = formatter.format(now);
    return `ตอนนี้คือ ${formattedTime} ครับ`;
  }
}

// Global orchestrator instance เพื่อไม่ต้อง initialize ซ้ำ
let globalOrchestrator: OrchestratorAI | null = null;

/**
 * Helper function สำหรับใช้งาน - ใช้ singleton pattern
 */
export async function processUserMessage(
  content: string,
  userId: string = 'default-user',
  sessionId?: string
): Promise<OrchestratorResponse> {
  // ใช้ global instance หรือสร้างใหม่ถ้ายังไม่มี
  if (!globalOrchestrator) {
    globalOrchestrator = new OrchestratorAI();
    await globalOrchestrator.initialize();
  }
  
  const message: UserMessage = {
    content,
    userId,
    sessionId: sessionId || userId,
    timestamp: new Date().toISOString()
  };

  return await globalOrchestrator.processUserInput(message);
}