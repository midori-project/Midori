/**
 * 🎭 Unified Orchestrator AI
 * รวม Chat AI + Template-First Orchestrator ในตัวเดียว
 * 
 * Capabilities:
 * - Natural language processing
 * - Intent detection (chat vs task)
 * - Template selection & customization
 * - Task planning & execution
 * - Real-time communication
 */

import { LLMAdapter } from './adapters/llmAdapter';
import { run as orchestrator } from './runners/run';
import { ChatPromptLoader } from './prompts/chatPromptLoader';
import { getResponseConfig, toLLMOptions } from './configs/responseConfig';
import { ProjectContextOrchestratorService } from './services/projectContextOrchestratorService';
import type { ProjectContextData } from './types/projectContext';
import { projectContextStore } from './stores/projectContextStore';
import { projectContextSync } from './sync/projectContextSync';
import { ConversationService, type ConversationData, type MessageData } from './services/conversationService';
import { FrontendV2ProjectContextMapper } from './mappers/frontendV2ProjectContextMapper';
import { randomUUID } from 'crypto';
import { BUSINESS_CATEGORIES } from '../frontend-v2/template-system/business-categories';

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
  // ✅ รองรับ category IDs จาก BUSINESS_CATEGORIES: restaurant, ecommerce, hotel, bakery, academy, bookstore, healthcare, news, portfolio, travel
  projectType?: 'restaurant' | 'ecommerce' | 'hotel' | 'bakery' | 'academy' | 'bookstore' | 'healthcare' | 'news' | 'portfolio' | 'travel';
  parameters?: Record<string, any>;
  designPreferences?: {
    style: 'modern' | 'classic' | 'minimal' | 'vintage' | 'default';
    colorTone: 'warm' | 'cool' | 'neutral' | 'default';
    colors: string[];
    mood: 'professional' | 'friendly' | 'elegant' | 'playful' | 'default';
  };
}

export enum CommandType {
  // Template-First Commands (NEW!)
  SELECT_TEMPLATE = 'select_template',
  CUSTOMIZE_TEMPLATE = 'customize_template',
  
  // Code Edit Commands (NEW!)
  EDIT_WEBSITE = 'edit_website',
  UPDATE_CONTENT = 'update_content',
  
  // Frontend Commands
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
  BACKUP_RESTORE = 'backup_restore'
}

export interface Command {
  commandId: string;
  commandType: CommandType;
  payload: {
    description: string;
    target?: string;
    parameters: Record<string, any>;
    userInput?: string;
    // ✅ Minimal project context - ลบ userPreferences ออก
    projectContext?: {
      projectId: string;
      projectType: string;
      status: string;
      conversationHistory: {
        currentContext: string;
        lastIntent: string;
      };
    } | null;
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
  private activeConversations: Map<string, ConversationData>; // ✅ เพิ่มการ track active conversations
  private initialized: boolean = false;

  /**
   * ✅ Mapping table สำหรับแปลง LLM types เป็น prompt keys
   */
  private static readonly TYPE_MAPPING: Record<string, string> = {
    // LLM อาจตอบแบบ descriptive
    'self_introduction': 'introduction',
    'identity_question': 'introduction', 
    'name_question': 'introduction',
    'who_are_you': 'introduction',
    'about_yourself': 'introduction',
    
    'hello': 'greeting',
    'greetings': 'greeting',
    'hi': 'greeting',
    'welcome': 'greeting',
    'salutation': 'greeting',
    
    'platform_info': 'midori_identity',
    'midori_question': 'midori_identity',
    'about_midori': 'midori_identity',
    'midori_explanation': 'midori_identity',
    
    'tech_question': 'technology_explanation',
    'explain_technology': 'technology_explanation',
    'react_question': 'technology_explanation',
    'supabase_question': 'technology_explanation',
    'technical_explanation': 'technology_explanation',
    
    'general_chat': 'base_chat',
    'casual_conversation': 'base_chat',
    'general_question': 'base_chat',
    'math_calculation': 'base_chat',
    'calculation': 'base_chat',
    
    // Task types
    'frontend_task': 'frontend_task',
    'backend_task': 'backend_task',
    'devops_task': 'devops_task',
    'full_stack_task': 'full_stack_task',
    
    'security_question': 'security_sensitive',
    'password_request': 'security_sensitive',
    'api_key_request': 'security_sensitive',
    
    'current_time': 'time_query',
    'date_question': 'time_query',
    'time_request': 'time_query',
    
    // Fallbacks
    'unknown': 'unclear',
    'not_sure': 'unclear',
    'ambiguous': 'unclear'
  };

  constructor() {
    this.llmAdapter = new LLMAdapter();
    this.conversationHistory = new Map();
    this.activeConversations = new Map();
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

      // ✅ Get or create conversation in database
      const conversation = await this.getOrCreateConversation(message.userId, message.context?.currentProject);
      
      // Get conversation context (memory + database)
      const context = await this.getOrCreateContextWithRestore(message.sessionId || message.userId, conversation.id);
      
      // Update context with new message
      context.previousMessages.push(message.content);
      
      // ✅ Save user message to database
      await this.saveUserMessage(conversation.id, message);
      
      // Analyze user intent
      const analysis = await this.analyzeIntent(message.content, context);
      
      console.log('🧠 Intent Analysis:', analysis);

      let response: OrchestratorResponse;

      switch (analysis.intent) {
        case 'chat':
          response = await this.handleChatRequest(message, analysis, context);
          break;
          
        case 'simple_task':
        case 'complex_task':
          // Template-first approach: ทั้ง simple และ complex tasks ใช้ handler เดียวกัน
          response = await this.handleTask(message, analysis, context);
          break;
          
        default:
          response = await this.handleUnclearIntent(message, analysis, context);
          break;
      }

      // Update execution metadata
      response.metadata.executionTime = Date.now() - startTime;
      
      // ✅ Save assistant response to database
      await this.saveAssistantMessage(conversation.id, response, message.userId);
      
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
    const quickIntent = this.detectQuickIntent(input, context);
    if (quickIntent) {
      return quickIntent;
    }
    
    const analysisPrompt = this.buildIntentAnalysisPrompt(input, context);
    
    // 🐛 DEBUG: Log prompt to verify project type mapping
    console.log('🔍 Intent Analysis Prompt (first 500 chars):', analysisPrompt.substring(0, 500));
    console.log('🔍 Project Type Mapping in prompt:', analysisPrompt.includes('restaurant') ? '✅ Contains restaurant' : '❌ Missing restaurant');
    
    // ใช้ response config สำหรับ intent analysis
    const analysisConfig = getResponseConfig('intentAnalysis');
    const llmOptions = this.getModelSpecificOptions({
      useSystemPrompt: false,
      responseFormat: { type: 'json_object' },  // ✅ บังคับให้ LLM ตอบเป็น JSON
      ...toLLMOptions(analysisConfig)
    });
    
    const response = await this.llmAdapter.callLLM(analysisPrompt, llmOptions);

    // 🐛 DEBUG: Log LLM response
    console.log('🤖 LLM Response:', JSON.stringify(response.content?.substring(0, 300)));

    try {
      // แก้ไข JSON parsing เพื่อรองรับ markdown และ empty response
      let jsonContent = response.content?.trim() || '';
      
      // ตรวจสอบ empty response
      if (!jsonContent) {
        console.warn('⚠️ Empty response from LLM, using fallback analysis');
        return this.getFallbackAnalysis(input);
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
      
      // ✅ Try to parse JSON, with auto-fix on failure
      let analysis;
      try {
        analysis = JSON.parse(jsonContent);
      } catch (firstError) {
        console.warn('⚠️ Initial JSON parse failed, attempting auto-fix...');
        
        // Auto-fix common JSON errors
        const fixedContent = jsonContent
          // Fix: missing comma between } and "
          .replace(/}\s*"/g, '},"')
          // Fix: missing comma between } and {
          .replace(/}\s*{/g, '},{')
          // Fix: trailing commas before }
          .replace(/,\s*}/g, '}')
          // Fix: trailing commas before ]
          .replace(/,\s*]/g, ']');
        
        try {
          analysis = JSON.parse(fixedContent);
          console.log('✅ JSON auto-fixed successfully');
        } catch (secondError) {
          console.error('❌ Auto-fix failed:', secondError);
          throw firstError; // Throw original error
        }
      }
      
      // ✅ Validate และ map parameters.type
      console.log('🔍 Raw LLM Analysis before validation:', JSON.stringify(analysis, null, 2));
      const validatedAnalysis = this.validateAndMapAnalysis(analysis, input);
      console.log('🔍 After validateAndMapAnalysis:', JSON.stringify(validatedAnalysis, null, 2));
      
      return validatedAnalysis;
    } catch (error) {
      console.error('❌ Failed to parse intent analysis:', error);
      console.error('📄 Raw response content:', response.content);
      return this.getFallbackAnalysis(input);
    }
  }

  /**
   * Fallback analysis เมื่อ parse ไม่ได้
   */
  private getFallbackAnalysis(input?: string): IntentAnalysis {
    const lowerInput = input?.toLowerCase().trim() || '';
    
    // Smart fallback based on input
    let fallbackType = 'base_chat';
    
    if (lowerInput.includes('คุณคือใคร') || lowerInput.includes('ชื่อ')) {
      fallbackType = 'introduction';
    } else if (lowerInput.includes('สวัสดี') || lowerInput.includes('hello')) {
      fallbackType = 'greeting';
    } else if (lowerInput.includes('midori')) {
      fallbackType = 'midori_identity';
    } else if (lowerInput.includes('react') || lowerInput.includes('supabase')) {
      fallbackType = 'technology_explanation';
    }
    
    return {
      intent: 'chat',
      confidence: 0.3,
      taskType: 'คุยทั่วไป',
      requiredAgents: [],
      complexity: 'low',
      parameters: { type: fallbackType }
    };
  }

  /**
   * ✅ Map LLM type เป็น valid prompt key
   */
  private mapLLMTypeToPromptKey(llmType: string): string {
    // ถ้า type ตรงกับ prompt key อยู่แล้ว
    const validKeys = [
      'introduction', 'greeting', 'security_sensitive', 'midori_identity', 
      'time_query', 'technology_explanation', 'base_chat', 'unclear',
      'frontend_task', 'backend_task', 'devops_task', 'full_stack_task'
    ];
    
    if (validKeys.includes(llmType)) {
      return llmType;
    }
    
    // ใช้ mapping table
    const mappedType = OrchestratorAI.TYPE_MAPPING[llmType];
    if (mappedType) {
      console.log(`🔄 Mapped LLM type '${llmType}' → '${mappedType}'`);
      return mappedType;
    }
    
    // Fallback
    console.warn(`⚠️ Unknown LLM type '${llmType}', using 'base_chat'`);
    return 'base_chat';
  }

  /**
   * ✅ Validate และ map LLM analysis ให้ตรงกับ Quick Intent patterns
   */
  private validateAndMapAnalysis(analysis: any, input: string): IntentAnalysis {
    const lowerInput = input.toLowerCase().trim();
    
    console.log('🔍 validateAndMapAnalysis - Input analysis.projectType:', analysis.projectType);
    
    let mappedType = analysis.parameters?.type;
    
    // ✅ ถ้า LLM ตอบ type ที่ไม่ valid → map ใหม่
    const validChatTypes = [
      'introduction', 'greeting', 'security_sensitive', 'midori_identity', 
      'time_query', 'technology_explanation', 'base_chat', 'unclear'
    ];
    
    const validTaskTypes = [
      'website_creation', 'website_edit', 'template_selection', 'template_customization',
      'frontend_task', 'backend_task', 'devops_task', 'full_stack_task'
    ];
    
    // Check if it's a valid chat type or task type
    if (!validChatTypes.includes(mappedType) && !validTaskTypes.includes(mappedType)) {
      console.warn(`⚠️ Invalid type from LLM: ${mappedType}, mapping to appropriate type`);
      mappedType = this.mapLLMTypeToPromptKey(mappedType || 'unknown');
    }
    
    const result = {
      intent: analysis.intent || 'unclear',
      confidence: analysis.confidence || 0.5,
      taskType: analysis.taskType,
      requiredAgents: analysis.requiredAgents || [],
      complexity: analysis.complexity || 'medium',
      projectType: analysis.projectType,  // ✅ เพิ่ม projectType จาก LLM response
      parameters: {
        ...analysis.parameters,
        type: mappedType  // ✅ ใช้ mapped type
      }
    };
    
    console.log('🔍 validateAndMapAnalysis - Output result.projectType:', result.projectType);
    
    return result;
  }

  /**
   * ตรวจจับ intent ที่ง่าย ๆ ไม่ต้องใช้ AI
   */
  private detectQuickIntent(input: string, context?: ConversationContext): IntentAnalysis | null {
    const lowerInput = input.toLowerCase().trim();
    
    //️ Security-sensitive requests
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

    // Template selection patterns (NEW!)
    if (lowerInput.includes('เลือกเทมเพลต') || 
        lowerInput.includes('เลือก template') ||
        lowerInput.includes('เลือกแบบ') ||
        lowerInput.includes('template') ||
        lowerInput.includes('เทมเพลต')) {
      return {
        intent: 'simple_task',
        confidence: 0.95,
        requiredAgents: ['frontend'],
        complexity: 'low',
        taskType: 'Template selection request detected',
        parameters: { type: 'template_selection' }
      };
    }
    
    // 🔧 ✅ PRIORITY: Edit/Modify existing website patterns BEFORE creation patterns!
    // This must come FIRST to catch edit requests correctly
    if (lowerInput.includes('แก้ไข') ||
        lowerInput.includes('เปลี่ยน') ||
        lowerInput.includes('ปรับ') ||
        lowerInput.includes('แก้') ||
        lowerInput.includes('เพิ่ม') ||
        lowerInput.includes('ลบ') ||
        lowerInput.includes('อัพเดต') ||
        lowerInput.includes('อัปเดต') ||
        lowerInput.includes('edit') ||
        lowerInput.includes('change') ||
        lowerInput.includes('modify') ||
        lowerInput.includes('update') ||
        lowerInput.includes('add') ||
        lowerInput.includes('remove')) {
      // Check if we have context (existing project)
      const hasExistingProject = context?.currentProject || 
                                  context?.previousMessages.some((msg: string) => 
                                    msg.includes('สร้างเว็บ') || 
                                    msg.includes('project')
                                  );
      
      if (hasExistingProject) {
        // ✅ ตรวจจับ projectType จาก keywords (ถ้ามี)
        const projectType = this.detectProjectTypeFromKeywords(input);
        
        console.log(`🔧 Website EDIT request detected: "${input}" with projectType: ${projectType}`);
        
        return {
          intent: 'simple_task',
          confidence: 0.95,
          requiredAgents: ['frontend'],
          complexity: 'low',
          taskType: 'Website edit request detected',
          projectType,  // ✅ เพิ่ม projectType (อาจเป็น undefined ถ้าไม่เจอ keyword)
          parameters: { type: 'website_edit' }
        };
      }
    }

    // Template customization patterns
    if (lowerInput.includes('ปรับแต่งเทมเพลต') || 
        lowerInput.includes('customize template') ||
        lowerInput.includes('แก้ไขเทมเพลต') ||
        lowerInput.includes('ปรับแต่งแบบ')) {
      return {
        intent: 'simple_task',
        confidence: 0.9,
        requiredAgents: ['frontend'],
        complexity: 'medium',
        taskType: 'Template customization request detected',
        parameters: { type: 'template_customization' }
      };
    }
    
    // Website creation patterns - now use template selection
    if (lowerInput.includes('สร้างเว็บไซต์') || 
        lowerInput.includes('สร้างร้าน') ||
        lowerInput.includes('ร้าน อาหาร') ||        // ✅ เพิ่ม pattern นี้
        lowerInput.includes('ร้านอาหาร') ||         // ✅ เพิ่ม pattern นี้
        lowerInput.includes('สร้างเว็บ') ||
        lowerInput.includes('เว็บขาย') ||
        lowerInput.includes('เว็บไซต์ขาย') ||
        lowerInput.includes('create website') ||
        lowerInput.includes('build website')) {
      
      // ✅ ตรวจจับ projectType จาก keywords
      const projectType = this.detectProjectTypeFromKeywords(input);
      
      return {
        intent: 'simple_task',
        confidence: 0.9,
        requiredAgents: ['frontend'],
        complexity: 'medium',
        taskType: 'Website creation request detected - will use template selection',
        projectType,  // ✅ เพิ่ม projectType
        parameters: { type: 'website_creation' }
      };
    }
    
    // Component creation patterns
    if (lowerInput.includes('สร้าง component') || 
        lowerInput.includes('สร้าง') && lowerInput.includes('ใหม่') ||
        lowerInput.includes('create component')) {
      return {
        intent: 'simple_task',
        confidence: 0.8,
        requiredAgents: ['frontend'],
        complexity: 'low',
        taskType: 'Component creation request detected'
      };
    }
    
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
   * Handle tasks (both simple and complex) - Template-First approach
   */
  private async handleTask(
    message: UserMessage,
    analysis: IntentAnalysis,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    
    // 🔧 Check if this is a code edit request
    if (analysis.parameters?.type === 'website_edit') {
      return this.handleCodeEdit(message, analysis, context);
    }
    
    // Create structured command with project context
    const command = await this.createCommand(message, analysis);
    
    console.log('🎯 Executing task with template-first orchestrator:', command.commandType);
    
    // Execute via orchestrator (template-first approach)
    const taskResult = await orchestrator(command);
    
    // Update project context if task was successful and we have project context
    if (taskResult.success && command.payload.projectContext) {
      // ถ้า Frontend-V2 ส่ง projectType กลับมา ให้อัปเดต project context
      if (taskResult.metadata && 'executionResult' in taskResult.metadata) {
        const executionResult = (taskResult.metadata as any).executionResult;
        if (executionResult?.results?.[0]?.result?.projectType) {
          const frontendResult = executionResult.results[0].result;
          const detectedProjectType = this.getProjectTypeFromFrontendResult(frontendResult);
          
          console.log('🔄 Updating project type based on Frontend-V2 result:', detectedProjectType);
          
          // อัปเดต project context ด้วย projectType ที่ถูกต้อง
          await this.updateProjectContext(command.payload.projectContext.projectId, {
            status: 'template_selected' as 'created' | 'in_progress' | 'completed' | 'paused' | 'cancelled' | 'template_selected'
          });
        }
      }
      
      await this.updateProjectContextAfterTask(command.payload.projectContext.projectId, taskResult);
    }
    
    // Generate user-friendly response based on execution results
    const chatResponse = await this.generateTaskSummary(message.content, taskResult);
    
    // Determine response type based on task complexity
    const responseType = analysis.complexity === 'high' ? 'mixed' : 'task';
    
    return {
      type: responseType,
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
   * 🔧 Handle Code Edit requests - Direct editing of existing websites
   */
  private async handleCodeEdit(
    message: UserMessage,
    analysis: IntentAnalysis,
    context: ConversationContext
  ): Promise<OrchestratorResponse> {
    console.log('🔧 Handling code edit request:', message.content);
    
    try {
      // Create edit command
      const command = await this.createCommand(message, analysis);
      
      // Ensure we have project context
      if (!command.payload.projectContext?.projectId) {
        return {
          type: 'chat',
          content: 'ขออภัยครับ ไม่พบโปรเจ็กต์ที่จะแก้ไข กรุณาสร้างเว็บไซต์ก่อนครับ',
          metadata: {
            executionTime: 0,
            agentsUsed: [],
            confidence: 0.5
          }
        };
      }
      
      console.log('🎯 Executing code edit via orchestrator');
      
      // Execute via orchestrator (will route to code-edit-service)
      const editResult = await orchestrator(command);
      
      if (!editResult.success) {
        return {
          type: 'chat',
          content: 'ขออภัยครับ เกิดข้อผิดพลาดในการแก้ไขโค้ด กรุณาลองใหม่อีกครั้ง',
          metadata: {
            executionTime: 0,
            agentsUsed: ['frontend'],
            confidence: 0.3
          }
        };
      }
      
      // Generate user-friendly response
      const chatResponse = await this.generateEditSummary(message.content, editResult);
      
      return {
        type: 'task',
        content: chatResponse,
        taskResults: editResult,
        nextSteps: ['ตรวจสอบการเปลี่ยนแปลงใน preview', 'ทดสอบการทำงานของเว็บไซต์'],
        metadata: {
          executionTime: 0,
          agentsUsed: ['frontend'],
          confidence: analysis.confidence
        }
      };
      
    } catch (error) {
      console.error('❌ Code edit error:', error);
      return {
        type: 'chat',
        content: 'เกิดข้อผิดพลาดในการแก้ไขโค้ดครับ กรุณาลองใหม่อีกครั้ง',
        metadata: {
          executionTime: 0,
          agentsUsed: [],
          confidence: 0
        }
      };
    }
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
    
    console.log(`🤖 Using model: ${currentModel}`);
    
    // ถ้าเป็น GPT-5 model ต้องใช้ temperature = 1 เท่านั้น
    if (currentModel.includes('gpt-5')) {
      const { temperature, ...optionsWithoutTemp } = options;
      return optionsWithoutTemp; // ไม่ส่ง temperature parameter
    }
    
    // Models อื่น ๆ ใช้ค่าปกติ
    return options;
  }

  private async createCommand(message: UserMessage, analysis: IntentAnalysis): Promise<Command> {
    // Map intent to command type - Template-First Approach
    let commandType: CommandType;
    
    console.log('🔍 Command creation analysis:', {
      message: message.content,
      taskType: analysis.taskType,
      requiredAgents: analysis.requiredAgents,
      intent: analysis.intent
    });
    
    // Template selection patterns (NEW!)
    if (message.content.includes('เลือกเทมเพลต') || 
        message.content.includes('เลือก template') ||
        message.content.includes('เลือกแบบ') ||
        message.content.includes('template') ||
        analysis.taskType?.includes('template selection')) {
      commandType = CommandType.SELECT_TEMPLATE;
    } 
    // Template customization patterns (NEW!)
    else if (message.content.includes('ปรับแต่งเทมเพลต') || 
             message.content.includes('customize template') ||
             message.content.includes('แก้ไขเทมเพลต') ||
             analysis.taskType?.includes('template customization')) {
      commandType = CommandType.CUSTOMIZE_TEMPLATE;
    }
    // 🔧 Code Edit patterns - Check if editing existing website (NEW!)
    else if (analysis.parameters?.type === 'website_edit' ||
             analysis.taskType?.includes('Website edit')) {
      commandType = CommandType.EDIT_WEBSITE;
    }
    // Component update/modification patterns
    else if (message.content.toLowerCase().includes('แก้ไข') || 
             message.content.toLowerCase().includes('แก้') ||
             message.content.toLowerCase().includes('ปรับ') ||
             message.content.toLowerCase().includes('update') ||
             message.content.toLowerCase().includes('modify') ||
             message.content.toLowerCase().includes('edit')) {
      commandType = CommandType.UPDATE_COMPONENT;
    }
    // Website creation patterns - now use template selection
    else if (analysis.taskType?.includes('Website creation') || 
        message.content.includes('สร้างเว็บไซต์') || 
        message.content.includes('สร้างร้าน') ||
        message.content.includes('ร้าน อาหาร') ||        // ✅ เพิ่ม pattern นี้
        message.content.includes('ร้านอาหาร') ||         // ✅ เพิ่ม pattern นี้
        message.content.includes('สร้างเว็บ') ||
        message.content.includes('เว็บขาย') ||
        message.content.includes('เว็บไซต์ขาย') ||
        message.content.includes('ขายเครื่องบิน') ||
        message.content.includes('ขาย') && message.content.includes('เว็บ')) {
      commandType = CommandType.SELECT_TEMPLATE; // ✅ เปลี่ยนเป็น template selection
    } 
    // Component creation patterns
    else if (analysis.taskType?.includes('Component creation') || 
               message.content.includes('สร้าง component')) {
      commandType = CommandType.CREATE_COMPONENT;
    } 
    // Agent-based mapping (ONLY if not website creation)
    else if (analysis.requiredAgents.includes('frontend') && 
             !message.content.includes('สร้างเว็บ') &&
             !message.content.includes('เว็บขาย') &&
             !message.content.includes('เว็บไซต์ขาย') &&
             !message.content.includes('ขายเครื่องบิน') &&
             !message.content.includes('ขาย') && !message.content.includes('เว็บ')) {
      commandType = CommandType.CREATE_COMPONENT;
    } else if (analysis.requiredAgents.includes('backend')) {
      commandType = CommandType.CREATE_API_ENDPOINT;
    } else if (analysis.requiredAgents.includes('devops')) {
      commandType = CommandType.DEPLOY_APPLICATION;
    } 
    // Default to template selection for new projects
    else {
      commandType = CommandType.SELECT_TEMPLATE; // ✅ เปลี่ยน default เป็น template selection
    }
    
    console.log('🎯 Selected command type:', commandType, 'for message:', message.content);

    // Get project context if available
    let projectContext: ProjectContextData | null = null;
    if (message.context?.currentProject) {
      projectContext = await this.getProjectContext(message.context.currentProject);
      console.log(`🔍 Looking for existing project context: ${message.context.currentProject}`);
    }
    
    // ถ้าไม่มี project context และเป็น task ให้สร้างใหม่
    if (!projectContext && (analysis.intent === 'simple_task' || analysis.intent === 'complex_task')) {
      console.log('🏗️ Creating new project context for task');
      
      // ✅ ใช้ project ID ที่ส่งมาจาก home page ถ้ามี
      let projectId = message.context?.currentProject;
      if (!projectId) {
        // สร้างใหม่เฉพาะเมื่อไม่มี project ID จาก home page
        projectId = `project_${Date.now()}`;
        console.log(`⚠️ No project ID from home page, creating new one: ${projectId}`);
      } else {
        console.log(`✅ Using project ID from home page: ${projectId}`);
      }
      
      // ✅ ใช้ projectType จาก Intent Analysis แทน hardcode (fallback to 'ecommerce')
      const projectType = (analysis.projectType || 'ecommerce') as 'restaurant' | 'ecommerce' | 'hotel' | 'bakery' | 'academy' | 'bookstore' | 'healthcare' | 'news' | 'portfolio' | 'travel';
      console.log(`🎯 Using project type from analysis: ${projectType}`);
      
      // สร้าง Project record ก่อน (เฉพาะเมื่อสร้าง project ID ใหม่)
      if (!message.context?.currentProject) {
        await this.createProjectRecord(projectId, this.extractProjectName(message.content));
      }
      
      projectContext = await this.initializeProject(
        projectId,
        'default_spec',
        projectType,
        this.extractProjectName(message.content),
        message.content
      );
      console.log(`✅ Created new project context: ${projectId} (type: ${projectType})`);
    }

    return {
      commandId: randomUUID(),
      commandType,
      payload: {
        description: analysis.taskType || message.content,
        target: analysis.parameters?.target,
        parameters: analysis.parameters || {},
        userInput: message.content,
        // ✅ ส่งเฉพาะข้อมูลที่จำเป็น - ลบ userPreferences ออก
        projectContext: projectContext ? {
          projectId: projectContext.projectId,
          projectType: projectContext.projectType,
          status: projectContext.status,
          conversationHistory: {
            currentContext: projectContext.conversationHistory.currentContext,
            lastIntent: projectContext.conversationHistory.lastIntent
          }
        } : null
      },
      priority: analysis.complexity === 'high' ? 'high' : 'medium',
      metadata: {
        timestamp: new Date().toISOString(),
        userId: message.userId,
        projectId: projectContext?.projectId
      }
    };
  }

  /**
   * ✅ สร้าง Project Type Mapping จาก Business Categories
   * ดึง category IDs และ keywords จาก BUSINESS_CATEGORIES
   */
  private static getProjectTypeMapping(): { categoryIds: string[]; mappingText: string } {
    const categoryIds = BUSINESS_CATEGORIES.map(cat => cat.id);
    
    const mappingLines = BUSINESS_CATEGORIES.map(category => {
      const keywords = category.keywords.slice(0, 10).join(', '); // เอา 10 keywords แรก
      return `- **"${category.id}"**: ${keywords}`;
    });
    
    return {
      categoryIds,
      mappingText: mappingLines.join('\n')
    };
  }

  /**
   * ✅ ตรวจจับ projectType จาก keywords ในข้อความ
   * ใช้เหมือนกับ frontend-v2 agent
   */
  private detectProjectTypeFromKeywords(input: string): 'restaurant' | 'ecommerce' | 'hotel' | 'bakery' | 'academy' | 'bookstore' | 'healthcare' | 'news' | 'portfolio' | 'travel' | undefined {
    const lowerInput = input.toLowerCase();
    
    // Score แต่ละ category
    const scores: Record<string, number> = {};
    
    for (const category of BUSINESS_CATEGORIES) {
      let score = 0;
      
      for (const keyword of category.keywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          score += keyword.length; // Longer keyword = higher score
        }
      }
      
      if (score > 0) {
        scores[category.id] = score;
      }
    }
    
    // หา category ที่ score สูงสุด
    if (Object.keys(scores).length === 0) {
      return undefined; // ไม่เจอ keyword ไหนเลย
    }
    
    const bestCategory = Object.entries(scores).reduce((best, current) => 
      current[1] > best[1] ? current : best
    );
    
    console.log(`🎯 Quick Intent detected projectType: ${bestCategory[0]} (score: ${bestCategory[1]})`);
    return bestCategory[0] as 'restaurant' | 'ecommerce' | 'hotel' | 'bakery' | 'academy' | 'bookstore' | 'healthcare' | 'news' | 'portfolio' | 'travel';
  }

  private buildIntentAnalysisPrompt(input: string, context: ConversationContext): string {
    const contextInfo = context.previousMessages.length > 0 
      ? `**Previous Messages:** ${context.previousMessages.join(' | ')}`
      : '**Previous Messages:** (none)';
    
    // ✅ ดึง Project Type Mapping จาก Business Categories
    const { categoryIds, mappingText } = OrchestratorAI.getProjectTypeMapping();
    const projectTypeEnum = categoryIds.join('|');
    
    return `คุณเป็น AI ที่วิเคราะห์ intent ของ user input สำหรับระบบสร้างเว็บไซต์

**User Input:** "${input}"

${contextInfo}

CRITICAL: Return ONLY a valid JSON object. No markdown, no \`\`\`, no extra text.
The JSON MUST be properly formatted with commas between all properties.

Response format:
{
  "intent": "chat|simple_task|complex_task|unclear",
  "confidence": 0.8,
  "taskType": "สรุปงานที่ต้องทำ",
  "requiredAgents": ["frontend"],
  "complexity": "low|medium|high",
  "projectType": "${projectTypeEnum}",
  "parameters": {
    "type": "one_of_the_types_below"
  }
}

**🏢 Project Type Detection (สำหรับ website_creation และ website_edit):**
วิเคราะห์จาก keywords ในข้อความเพื่อหา business category ที่ตรงที่สุด:

${mappingText}

**หมายเหตุ:** 
- ถ้าไม่ใช่ website_creation/website_edit → ไม่ต้องใส่ projectType
- ถ้าไม่แน่ใจ → ใช้ "ecommerce" เป็น default
- ให้ความสำคัญกับ keyword แรกที่พบในข้อความ
- Keywords รองรับทั้งภาษาไทยและภาษาอังกฤษ

**CRITICAL: parameters.type ต้องเป็นค่าใดค่าหนึ่งเท่านั้น:**

**🎭 Chat Types (สำหรับ intent: "chat"):**
- **"introduction"**: คำถามเกี่ยวกับชื่อ/ตัวตน (คุณคือใคร, ชื่ออะไร, แนะนำตัว)
- **"greeting"**: การทักทาย (สวัสดี, hello, hi)
- **"security_sensitive"**: คำถามเกี่ยวกับข้อมูลลับ (API key, password, .env)
- **"midori_identity"**: คำถามเกี่ยวกับ Midori platform (Midori คืออะไร, ทำอะไรได้)
- **"technology_explanation"**: อธิบายเทคโนโลยี (React คืออะไร, Supabase ใช้ยังไง)
- **"base_chat"**: คำถามทั่วไป/คุยธรรมดา, คำนวณคณิตศาสตร์ (เช่น 1+1)
- **"unclear"**: ไม่ชัดเจน

**📝 Task Types (สำหรับ intent: "simple_task" หรือ "complex_task"):**
- **"website_creation"**: การสร้างเว็บไซต์ใหม่ (สร้างเว็บ, สร้างเว็บไซต์, สร้างร้าน, เว็บขาย)
- **"website_edit"**: แก้ไขเว็บไซต์ที่มีอยู่ (แก้ไข, เปลี่ยน, ปรับ, อัปเดต, เพิ่ม, ลบ, สี, ชื่อ, navbar, footer)
- **"frontend_task"**: งานเกี่ยวกับ UI/UX (สร้าง component, แก้ไขหน้าเว็บ)
- **"backend_task"**: งานเกี่ยวกับ API/Database  
- **"devops_task"**: งานเกี่ยวกับ deployment
- **"full_stack_task"**: งานแบบครบ stack

**Examples (MUST follow exact format):**
- "คุณคือใครครับ" → {"intent": "chat", "confidence": 0.9, "taskType": "Introduction", "requiredAgents": [], "complexity": "low", "parameters": {"type": "introduction"}}
- "สวัสดี" → {"intent": "chat", "confidence": 0.9, "taskType": "Greeting", "requiredAgents": [], "complexity": "low", "parameters": {"type": "greeting"}}
- "1+1 เท่าไหร่" → {"intent": "chat", "confidence": 0.8, "taskType": "คุยทั่วไป", "requiredAgents": [], "complexity": "low", "parameters": {"type": "base_chat"}}
- "สร้างเว็บไซต์" → {"intent": "simple_task", "confidence": 0.9, "taskType": "Website creation", "requiredAgents": ["frontend"], "complexity": "medium", "projectType": "ecommerce", "parameters": {"type": "website_creation"}}
- "สร้างเว็บร้านอาหาร" → {"intent": "simple_task", "confidence": 0.9, "taskType": "Website creation", "requiredAgents": ["frontend"], "complexity": "medium", "projectType": "restaurant", "parameters": {"type": "website_creation"}}
- "สร้างเว็บโรงแรม" → {"intent": "simple_task", "confidence": 0.9, "taskType": "Website creation", "requiredAgents": ["frontend"], "complexity": "medium", "projectType": "hotel", "parameters": {"type": "website_creation"}}
- "สร้างเว็บร้านขนมปัง" → {"intent": "simple_task", "confidence": 0.9, "taskType": "Website creation", "requiredAgents": ["frontend"], "complexity": "medium", "projectType": "bakery", "parameters": {"type": "website_creation"}}
- "สร้างเว็บสถาบันการศึกษา" → {"intent": "simple_task", "confidence": 0.9, "taskType": "Website creation", "requiredAgents": ["frontend"], "complexity": "medium", "projectType": "academy", "parameters": {"type": "website_creation"}}
- "แก้ไข navbar เป็นสีแดง" → {"intent": "simple_task", "confidence": 0.9, "taskType": "Website edit", "requiredAgents": ["frontend"], "complexity": "low", "projectType": "ecommerce", "parameters": {"type": "website_edit"}}
- "เปลี่ยนชื่อร้าน" → {"intent": "simple_task", "confidence": 0.85, "taskType": "Website edit", "requiredAgents": ["frontend"], "complexity": "low", "parameters": {"type": "website_edit"}}`;
  }

  /**
   * ตรวจสอบว่า context เกี่ยวข้องกับคำถามปัจจุบันหรือไม่
   */
  private isContextRelevant(input: string, previousMessages: string[]): boolean {
    const lowerInput = input.toLowerCase();
    
    // ✅ Special case: คำถามเกี่ยวกับ chat history
    if (this.isChatHistoryQuestion(lowerInput)) {
      console.log('💬 Chat history question detected, using context');
      return true;
    }
    
    // ถ้าเป็นคำถามทั่วไปที่ไม่เกี่ยวข้องกับเว็บไซต์
    if (this.isGeneralQuestion(lowerInput)) {
      console.log('🔍 General question detected, not using context');
      return false;
    }
    
    // ถ้าเป็นคำถามใหม่ที่เปลี่ยนเรื่อง
    if (this.isTopicChange(lowerInput, previousMessages)) {
      console.log('🔄 Topic change detected, not using context');
      return false;
    }
    
    // ถ้าเป็นคำถามเกี่ยวกับเว็บไซต์และมี context ที่เกี่ยวข้อง
    if (this.isWebRelatedQuestion(lowerInput) && this.hasRelevantContext(previousMessages)) {
      console.log('✅ Web-related question with relevant context, using context');
      return true;
    }
    
    return false;
  }

  /**
   * ตรวจสอบว่าเป็นคำถามเกี่ยวกับ chat history หรือไม่
   */
  private isChatHistoryQuestion(input: string): boolean {
    const chatHistoryKeywords = [
      'คำถามก่อนหน้า', 'แชทก่อนหน้า', 'ข้อความก่อนหน้า', 'ที่ถามไป', 'ที่พูดไป',
      'ก่อนหน้านี้', 'เมื่อกี้', 'เมื่อสักครู่', 'เมื่อก่อน', 'ที่แล้ว',
      'ถามอะไร', 'พูดอะไร', 'บอกอะไร', 'ถามคุณว่า', 'ถามผมว่า',
      'ข้อความแรก', 'ข้อความที่สอง', 'ข้อความสุดท้าย', 'ข้อความที่',
      'ในบทสนทนา', 'ในแชทนี้', 'ในแชท', 'บทสนทนา',
      'previous', 'before', 'earlier', 'last time', 'what did i ask',
      'what did i say', 'what did we talk about', 'conversation history',
      'first message', 'second message', 'last message'
    ];
    
    return chatHistoryKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * ตรวจสอบว่าเป็นคำถามทั่วไปที่ไม่เกี่ยวข้องกับเว็บไซต์
   */
  private isGeneralQuestion(input: string): boolean {
    const generalKeywords = [
      'แมว', 'สุนัข', 'สัตว์', 'อาหาร', 'อากาศ', 'ข่าว', 'กีฬา', 
      'หนัง', 'เพลง', 'หนังสือ', 'การเมือง', 'เศรษฐกิจ', 'สุขภาพ',
      'การเรียน', 'มหาวิทยาลัย', 'โรงเรียน', 'งาน', 'เงิน', 'ธนาคาร'
    ];
    
    return generalKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * ตรวจสอบว่าเปลี่ยนเรื่องหรือไม่
   */
  private isTopicChange(input: string, previousMessages: string[]): boolean {
    if (previousMessages.length === 0) return false;
    
    const lastMessage = previousMessages[previousMessages.length - 1].toLowerCase();
    
    // ถ้าคำถามปัจจุบันไม่เกี่ยวข้องกับข้อความล่าสุด
    const webKeywords = ['เว็บ', 'website', 'react', 'supabase', 'สร้าง', 'ออกแบบ', 'พัฒนา'];
    const currentIsWebRelated = webKeywords.some(keyword => input.includes(keyword));
    const lastIsWebRelated = webKeywords.some(keyword => lastMessage.includes(keyword));
    
    // ถ้าจากเว็บไซต์เป็นเรื่องอื่น หรือจากเรื่องอื่นเป็นเว็บไซต์
    if (currentIsWebRelated !== lastIsWebRelated) {
      return true;
    }
    
    return false;
  }

  /**
   * ตรวจสอบว่าเป็นคำถามเกี่ยวกับเว็บไซต์
   */
  private isWebRelatedQuestion(input: string): boolean {
    const webKeywords = [
      'เว็บ', 'website', 'react', 'supabase', 'สร้าง', 'ออกแบบ', 'พัฒนา',
      'component', 'api', 'database', 'deploy', 'hosting', 'domain',
      'frontend', 'backend', 'fullstack', 'ui', 'ux', 'design'
    ];
    
    return webKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * ตรวจสอบว่า context มีความเกี่ยวข้องหรือไม่
   */
  private hasRelevantContext(previousMessages: string[]): boolean {
    if (previousMessages.length === 0) return false;
    
    const webKeywords = [
      'เว็บ', 'website', 'react', 'supabase', 'สร้าง', 'ออกแบบ', 'พัฒนา',
      'component', 'api', 'database', 'deploy', 'hosting', 'domain'
    ];
    
    return previousMessages.some(message => 
      webKeywords.some(keyword => message.toLowerCase().includes(keyword))
    );
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
      console.log(`📚 Context has ${context.previousMessages.length} previous messages`);
      
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
        console.log(`🏗️ Using project context aware prompt`);
        return await chatPromptLoader.getPrompt('projectContextAware', { 
          input, 
          projectName: context.currentProject,
          recentWork: JSON.stringify(context.lastTaskResult).substring(0, 200) + '...'
        });
      }
      
      // Context-aware (ถ้ามี conversation history และ context เกี่ยวข้อง)
      if (context.previousMessages.length > 0 && this.isContextRelevant(input, context.previousMessages)) {
        console.log(`💬 Using context-aware prompt`);
        const recentMessages = context.previousMessages.join(' | ');
        return await chatPromptLoader.getPrompt('contextAware', { 
          input, 
          context: recentMessages 
        });
      }
      
      // Default base chat prompt
      return await chatPromptLoader.getPrompt('baseChat', { input });
      
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

ตอบเป็นภาษาไทยแบบสั้น ๆ กระชับ (ไม่เกิน 60 คำ)`;
  }

  private async generateTaskSummary(input: string, taskResult: any): Promise<string> {
    // Check if we have execution results
    const hasExecutionResults = taskResult?.metadata?.executionResult?.results?.length > 0;
    const executionResults = hasExecutionResults ? taskResult.metadata.executionResult.results : [];
    
    let summaryPrompt = `สรุปผลการทำงานให้ user ฟังแบบเข้าใจง่าย:

User ขอ: "${input}"

ผลการทำงาน: ${JSON.stringify(taskResult, null, 2)}`;

    if (hasExecutionResults) {
      summaryPrompt += `

ผลการทำงานจริง:
${executionResults.map((result: any) => 
  `- ${result.agent} agent: ${result.success ? 'สำเร็จ' : 'ล้มเหลว'} ${result.error ? `(${result.error})` : ''}`
).join('\n')}`;
    }

    summaryPrompt += `

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
      if (hasExecutionResults) {
        const successCount = executionResults.filter((r: any) => r.success).length;
        const totalCount = executionResults.length;
        return `✅ เสร็จแล้วครับ! ได้ทำงาน ${successCount}/${totalCount} งานสำเร็จ`;
      }
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
   * 🔧 Generate summary for code edit results
   */
  private async generateEditSummary(input: string, editResult: any): Promise<string> {
    try {
      // Extract edit information
      const hasExecutionResults = editResult?.metadata?.executionResult?.results?.length > 0;
      const executionResults = hasExecutionResults ? editResult.metadata.executionResult.results : [];
      
      // Check if code-edit-service returned results
      const codeEditResult = executionResults.find((r: any) => r.result?.filesModified);
      
      if (codeEditResult?.result) {
        const { filesModified, summary, changes } = codeEditResult.result;
        const fileCount = filesModified?.length || 0;
        const changeCount = changes?.reduce((sum: number, c: any) => sum + (c.changes?.length || 0), 0) || 0;
        
        return `✅ แก้ไขเสร็จแล้วครับ!

📝 สิ่งที่แก้ไข:
${summary || input}

📁 ไฟล์ที่แก้: ${fileCount} ไฟล์
🔧 การเปลี่ยนแปลง: ${changeCount} จุด

กรุณาตรวจสอบผลลัพธ์ใน preview ครับ`;
      }
      
      // Fallback summary
      return `✅ แก้ไขโค้ดเสร็จแล้วครับ!

คำขอของคุณ: "${input}"

กรุณาตรวจสอบการเปลี่ยนแปลงใน preview ครับ`;
      
    } catch (error) {
      console.error('Failed to generate edit summary:', error);
      return `✅ แก้ไขเสร็จแล้วครับ! กรุณาตรวจสอบผลลัพธ์ใน preview`;
    }
  }

  // ============================
  // Project Context Management
  // ============================

  /**
   * Initialize project with Project Context
   */
  async initializeProject(
    projectId: string,
    specBundleId: string,
    projectType: 'restaurant' | 'ecommerce' | 'hotel' | 'bakery' | 'academy' | 'bookstore' | 'healthcare' | 'news' | 'portfolio' | 'travel',
    name: string,
    userInput?: string
  ): Promise<ProjectContextData> {
    const projectContext = await ProjectContextOrchestratorService.initializeProject(
      projectId,
      specBundleId,
      projectType,
      name,
      userInput
    );

    // Project context is now managed by ProjectContextStore (SSOT)

    // อัปเดต conversation context
    const sessionId = `${projectId}_${Date.now()}`;
    this.conversationHistory.set(sessionId, {
      previousMessages: [],
      currentProject: projectId,
      activeAgents: ['orchestrator'],
      lastTaskResult: { projectContext }
    });

    return projectContext;
  }

  /**
   * Get project context from SSOT
   */
  async getProjectContext(projectId: string): Promise<ProjectContextData | null> {
    return await projectContextStore.getProjectContext(projectId);
  }

  /**
   * Update project context
   */
  async updateProjectContext(
    projectId: string,
    updates: {
      status?: 'created' | 'in_progress' | 'completed' | 'paused' | 'cancelled' | 'template_selected';
      components?: any[];
      pages?: any[];
      styling?: any;
      conversationHistory?: any;
      userPreferences?: any;
    }
  ): Promise<ProjectContextData | null> {
    const updatedContext = await projectContextStore.updateProjectContext(projectId, updates);
    
    if (updatedContext) {
      // Broadcast update to all subscribers
      await projectContextSync.broadcastUpdate(projectId, updatedContext);
    }
    
    return updatedContext;
  }


  /**
   * Add message to conversation history
   */
  async addMessage(
    projectId: string,
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await ProjectContextOrchestratorService.addMessage(projectId, message);
  }

  /**
   * Update conversation context
   */
  async updateConversationContext(
    projectId: string,
    context: string,
    intent?: string,
    action?: string
  ): Promise<void> {
    await ProjectContextOrchestratorService.updateConversationContext(
      projectId,
      context,
      intent,
      action
    );
  }

  /**
   * Get real-time project state updates
   */
  async getProjectStateUpdates(projectId: string): Promise<{
    hasUpdates: boolean;
    lastModified: Date;
    changes: any;
  }> {
    try {
      const projectContext = await this.getProjectContext(projectId);
      if (!projectContext) {
        return {
          hasUpdates: false,
          lastModified: new Date(),
          changes: {}
        };
      }

      // Check if there are recent changes
      const now = new Date();
      const lastModified = projectContext.lastModified;
      const timeDiff = now.getTime() - lastModified.getTime();
      const hasRecentUpdates = timeDiff < 60000; // Within last minute

      return {
        hasUpdates: hasRecentUpdates,
        lastModified,
        changes: {
          components: projectContext.components,
          pages: projectContext.pages,
          styling: projectContext.styling,
          conversationHistory: projectContext.conversationHistory
        }
      };
    } catch (error) {
      console.error(`❌ Failed to get project state updates:`, error);
      return {
        hasUpdates: false,
        lastModified: new Date(),
        changes: {}
      };
    }
  }

  /**
   * Subscribe to project state changes (WebSocket/SSE ready)
   */
  async subscribeToProjectUpdates(
    projectId: string,
    callback: (updates: any) => void
  ): Promise<() => void> {
    console.log(`📡 Subscribing to project updates for ${projectId}`);
    
    // Simulate real-time updates (in real implementation, use WebSocket/SSE)
    const interval = setInterval(async () => {
      try {
        const updates = await this.getProjectStateUpdates(projectId);
        if (updates.hasUpdates) {
          callback(updates);
        }
      } catch (error) {
        console.error(`❌ Error in project update subscription:`, error);
      }
    }, 5000); // Check every 5 seconds

    // Return unsubscribe function
    return () => {
      console.log(`📡 Unsubscribing from project updates for ${projectId}`);
      clearInterval(interval);
    };
  }


  /**
   * Update project context after task execution with comprehensive state sync
   */
  private async updateProjectContextAfterTask(projectId: string, taskResult: any): Promise<void> {
    try {
      console.log(`🔄 Syncing project context for project ${projectId} after task execution`);
      
      // Get current project context
      const currentContext = await this.getProjectContext(projectId);
      if (!currentContext) {
        console.warn(`⚠️ No project context found for project ${projectId}`);
        return;
      }

      // Check if this is a Frontend-V2 result
      if (taskResult.metadata?.executionResult?.results?.[0]?.result) {
        const frontendResult = taskResult.metadata.executionResult.results[0].result;
        
        console.log(`🎯 Detected Frontend-V2 result, mapping to Project Context format`);
        
        // Use Frontend-V2 mapper to convert result
        const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(frontendResult);
        
        // Update project context with mapped data (exclude frontendV2Data from update)
        const updatedContext = await projectContextStore.updateProjectContext(projectId, {
          components: mappedData.components,
          pages: mappedData.pages,
          preview: mappedData.preview,
          status: 'template_selected' as 'created' | 'in_progress' | 'completed' | 'paused' | 'cancelled' | 'template_selected'
        });
        
        if (updatedContext) {
          console.log(`✅ Updated project context with Frontend-V2 data for ${projectId}`);
          
          // Update conversation context
          await this.updateConversationContextAfterTask(projectId, {
            lastTaskResult: taskResult,
            timestamp: new Date().toISOString()
          });
          
          // Broadcast changes to all subscribers
          await projectContextSync.broadcastUpdate(projectId, updatedContext);
        }
        
        return;
      }

      // Extract changes from task results (legacy approach)
      const changes = this.extractChangesFromTaskResult(taskResult);
      
      if (changes.hasChanges) {
        // Update project context with changes using SSOT
        const updates = this.buildProjectContextUpdates(changes);
        const updatedContext = await projectContextStore.updateProjectContext(projectId, updates);
        
        if (updatedContext) {
          // Update conversation context
          await this.updateConversationContextAfterTask(projectId, changes);
          
          // Broadcast changes to all subscribers
          await projectContextSync.broadcastUpdate(projectId, updatedContext);
          
          console.log(`✅ Project context synced successfully for project ${projectId}`);
        }
      } else {
        console.log(`ℹ️ No changes detected for project ${projectId}`);
      }

    } catch (error) {
      console.error(`❌ Failed to sync project context for project ${projectId}:`, error);
    }
  }

  /**
   * Build project context updates from changes
   */
  private buildProjectContextUpdates(changes: {
    hasChanges: boolean;
    components: any[];
    pages: any[];
    styling: any | null;
    metadata: any;
  }): {
    status?: 'created' | 'in_progress' | 'completed' | 'paused' | 'cancelled' | 'template_selected';
    components?: any[];
    pages?: any[];
    styling?: any;
  } {
    const updates: {
      status?: 'created' | 'in_progress' | 'completed' | 'paused' | 'cancelled' | 'template_selected';
      components?: any[];
      pages?: any[];
      styling?: any;
    } = {};
    
    if (changes.components.length > 0) {
      updates.components = changes.components;
    }
    
    if (changes.pages.length > 0) {
      updates.pages = changes.pages;
    }
    
    if (changes.styling) {
      updates.styling = changes.styling;
    }
    
    // Update status based on changes
    if (changes.hasChanges) {
      updates.status = 'in_progress' as 'created' | 'in_progress' | 'completed' | 'paused' | 'cancelled' | 'template_selected';
    }
    
    return updates;
  }

  /**
   * Extract comprehensive changes from task result
   */
  private extractChangesFromTaskResult(taskResult: any): {
    hasChanges: boolean;
    components: any[];
    pages: any[];
    styling: any | null;
    metadata: any;
  } {
    const changes = {
      hasChanges: false,
      components: [] as any[],
      pages: [] as any[],
      styling: null as any,
      metadata: {}
    };

    if (taskResult?.metadata?.executionResult?.results) {
      for (const result of taskResult.metadata.executionResult.results) {
        if (result.success && result.result) {
          // Extract components
          if (result.result.components && Array.isArray(result.result.components)) {
            changes.components.push(...result.result.components);
            changes.hasChanges = true;
          }
          
          // Extract pages
          if (result.result.pages && Array.isArray(result.result.pages)) {
            changes.pages.push(...result.result.pages);
            changes.hasChanges = true;
          }
          
          // Extract styling updates
          if (result.result.styling) {
            changes.styling = { ...changes.styling, ...result.result.styling };
            changes.hasChanges = true;
          }
          
          // Extract metadata
          if (result.result.metadata) {
            changes.metadata = { ...changes.metadata, ...result.result.metadata };
          }
        }
      }
    }

    return changes;
  }


  /**
   * Update conversation context after task execution
   */
  private async updateConversationContextAfterTask(projectId: string, changes: any): Promise<void> {
    try {
      // Find conversation context for this project
      for (const [sessionId, context] of this.conversationHistory.entries()) {
        if (context.currentProject === projectId) {
          // Update last task result
          context.lastTaskResult = {
            ...context.lastTaskResult,
            changes,
            timestamp: new Date().toISOString()
          };
          
          // Update active agents if needed
          if (changes.metadata?.agentsUsed) {
            context.activeAgents = [...new Set([...context.activeAgents, ...changes.metadata.agentsUsed])];
          }
          
          console.log(`✅ Conversation context updated for session ${sessionId}`);
          break;
        }
      }
    } catch (error) {
      console.error(`❌ Failed to update conversation context:`, error);
    }
  }


  /**
   * Get project type from Frontend-V2 result
   */
  private getProjectTypeFromFrontendResult(frontendResult: any): string {
    console.log('🔍 Getting project type from Frontend-V2 result:', frontendResult?.result?.projectType);
    
    // Use projectType from Frontend-V2 result, fallback to 'ecommerce'
    return frontendResult?.result?.projectType || 'ecommerce';
  }

  /**
   * Create Project record in database
   */
  private async createProjectRecord(projectId: string, name: string): Promise<void> {
    try {
      console.log(`📝 Creating Project record: ${projectId}`);
      
      // Import prisma here to avoid circular dependency
      const { prisma } = await import('@/libs/prisma/prisma');
      
      // สร้าง User record ก่อน (ถ้ายังไม่มี)
      await this.ensureDefaultUserExists();
      
      await prisma.project.create({
        data: {
          id: projectId,
          ownerId: 'default-user',
          name: name,
          description: `Project created for: ${name}`,
          visibility: 'private',
          options: {},
          likeCount: 0
        }
      });
      
      console.log(`✅ Project record created: ${projectId}`);
    } catch (error) {
      console.error(`❌ Failed to create Project record:`, error);
      throw error;
    }
  }

  /**
   * Ensure default user exists in database
   */
  private async ensureDefaultUserExists(): Promise<void> {
    try {
      const { prisma } = await import('@/libs/prisma/prisma');
      
      // Check if default user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: 'default-user' }
      });
      
      if (!existingUser) {
        console.log(`👤 Creating default user: default-user`);
        await prisma.user.create({
          data: {
            id: 'default-user',
            email: 'default@midori.ai',
            displayName: 'Default User',
            isActive: true,
            locale: 'th'
          }
        });
        console.log(`✅ Default user created: default-user`);
      }
    } catch (error) {
      console.error(`❌ Failed to ensure default user exists:`, error);
      throw error;
    }
  }

  /**
   * Extract project name from user input
   */
  private extractProjectName(input: string): string {
    // Extract name from input patterns
    const patterns = [
      /สร้างเว็บไซต์(.+)/i,
      /สร้างร้าน(.+)/i,
      /สร้าง(.+)เว็บไซต์/i,
      /create website (.+)/i,
      /build (.+) website/i
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'เว็บไซต์ใหม่'; // default
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

  // ============================
  // Conversation Database Management
  // ============================

  /**
   * Get or create conversation in database
   */
  private async getOrCreateConversation(
    userId: string, 
    projectId?: string
  ): Promise<ConversationData> {
    try {
      // หา conversation ที่ active อยู่
      let conversation = await ConversationService.getActiveConversation(userId, projectId);
      
      if (!conversation) {
        // สร้างใหม่ถ้าไม่มี (ไม่ระบุ agentId เพื่อหลีกเลี่ยง foreign key constraint)
        conversation = await ConversationService.createConversation({
          userId,
          projectId,
          agentId: null, // ✅ ใช้ null แทน undefined
          title: ConversationService.generateTitleFromMessage('การสนทนาใหม่')
        });
        
        console.log(`🗣️ Created new conversation: ${conversation.id}`);
      }
      
      // Cache ใน memory
      this.activeConversations.set(userId, conversation);
      
      return conversation;
    } catch (error) {
      console.error('❌ Failed to get or create conversation:', error);
      throw error;
    }
  }

  /**
   * Save user message to database
   */
  private async saveUserMessage(conversationId: string, message: UserMessage): Promise<void> {
    try {
      await ConversationService.addMessage({
        conversationId,
        userId: message.userId,
        role: 'user',
        content: message.content,
        metadata: {
          sessionId: message.sessionId,
          timestamp: message.timestamp,
          context: message.context
        }
      });
    } catch (error) {
      console.error('❌ Failed to save user message:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบการทำงานหลัก
    }
  }

  /**
   * Save assistant response to database
   */
  private async saveAssistantMessage(
    conversationId: string, 
    response: OrchestratorResponse, 
    userId: string
  ): Promise<void> {
    try {
      await ConversationService.addMessage({
        conversationId,
        userId,
        role: 'assistant',
        content: response.content,
        contentJson: {
          type: response.type,
          taskResults: response.taskResults,
          nextSteps: response.nextSteps,
          metadata: response.metadata
        },
        metadata: {
          responseType: response.type,
          agentsUsed: response.metadata.agentsUsed,
          confidence: response.metadata.confidence,
          executionTime: response.metadata.executionTime
        }
      });
    } catch (error) {
      console.error('❌ Failed to save assistant message:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบการทำงานหลัก
    }
  }

  /**
   * Get or create context with conversation restoration
   */
  private async getOrCreateContextWithRestore(
    sessionId: string, 
    conversationId?: string
  ): Promise<ConversationContext> {
    // ถ้ามีใน memory อยู่แล้ว ให้ใช้
    if (this.conversationHistory.has(sessionId)) {
      return this.conversationHistory.get(sessionId)!;
    }

    // ถ้ามี conversationId ให้ restore จาก database
    if (conversationId) {
      try {
        const conversationData = await ConversationService.restoreConversationHistory(conversationId);
        
        if (conversationData) {
          const context: ConversationContext = {
            previousMessages: conversationData.messages
              .filter(msg => msg.role === 'user' || msg.role === 'assistant')
              .map(msg => msg.content || ''),
            activeAgents: ['orchestrator'],
            lastTaskResult: null
          };
          
          // Cache ใน memory
          this.conversationHistory.set(sessionId, context);
          
          console.log(`🔄 Restored conversation context from database: ${conversationId}`);
          return context;
        }
      } catch (error) {
        console.error('❌ Failed to restore conversation context:', error);
      }
    }

    // สร้าง context ใหม่
    const context: ConversationContext = {
      previousMessages: [],
      activeAgents: [],
    };
    
    this.conversationHistory.set(sessionId, context);
    return context;
  }

  /**
   * Get conversation history for a user
   */
  async getUserConversations(
    userId: string, 
    projectId?: string, 
    limit: number = 20
  ): Promise<ConversationData[]> {
    try {
      return await ConversationService.getUserConversations(userId, projectId, limit);
    } catch (error) {
      console.error('❌ Failed to get user conversations:', error);
      return [];
    }
  }

  /**
   * Get conversation with messages
   */
  async getConversationWithMessages(
    conversationId: string, 
    limit?: number
  ): Promise<{
    conversation: ConversationData;
    messages: MessageData[];
  } | null> {
    try {
      return await ConversationService.restoreConversationHistory(conversationId, limit);
    } catch (error) {
      console.error('❌ Failed to get conversation with messages:', error);
      return null;
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      return await ConversationService.archiveConversation(conversationId);
    } catch (error) {
      console.error('❌ Failed to archive conversation:', error);
      return false;
    }
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    try {
      const updated = await ConversationService.updateConversation(conversationId, { title });
      return updated !== null;
    } catch (error) {
      console.error('❌ Failed to update conversation title:', error);
      return false;
    }
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
  sessionId?: string,
  context?: ConversationContext
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
    timestamp: new Date().toISOString(),
    context // ✅ เพิ่ม context
  };

  return await globalOrchestrator.processUserInput(message);
}

/**
 * ✅ Helper functions สำหรับ conversation management
 */

/**
 * Get user's conversation history
 */
export async function getUserConversations(
  userId: string,
  projectId?: string,
  limit: number = 20
): Promise<ConversationData[]> {
  if (!globalOrchestrator) {
    globalOrchestrator = new OrchestratorAI();
    await globalOrchestrator.initialize();
  }
  
  return await globalOrchestrator.getUserConversations(userId, projectId, limit);
}

/**
 * Get conversation with messages
 */
export async function getConversationWithMessages(
  conversationId: string,
  limit?: number
): Promise<{
  conversation: ConversationData;
  messages: MessageData[];
} | null> {
  if (!globalOrchestrator) {
    globalOrchestrator = new OrchestratorAI();
    await globalOrchestrator.initialize();
  }
  
  return await globalOrchestrator.getConversationWithMessages(conversationId, limit);
}

/**
 * Archive conversation
 */
export async function archiveConversation(conversationId: string): Promise<boolean> {
  if (!globalOrchestrator) {
    globalOrchestrator = new OrchestratorAI();
    await globalOrchestrator.initialize();
  }
  
  return await globalOrchestrator.archiveConversation(conversationId);
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string, 
  title: string
): Promise<boolean> {
  if (!globalOrchestrator) {
    globalOrchestrator = new OrchestratorAI();
    await globalOrchestrator.initialize();
  }
  
  return await globalOrchestrator.updateConversationTitle(conversationId, title);
}