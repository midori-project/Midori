/**
 * Enhanced Interactive Chat Simulation Test for Orchestrator
 * Tests real user input → AI processing (with REAL prompts) → Orchestrator planning → Chat response
 * 
 * NEW FEATURES:
 * - Uses real prompts from system.md, task_templates.md, guardrails.md
 * - Enhanced security validation with guardrails
 * - Complex test scenarios for real-world validation
 * - Improved AI model configuration
 */

import { run, CommandType } from '../runners/run';
import type { Command } from '../runners/run';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// AI API INTEGRATION
// ============================================================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  command: Command | null;
  explanation: string;
  confidence: number;
  guardrailsWarning?: string;
  clarifyingQuestions?: string[];
}

interface PromptsData {
  system: string;
  taskTemplates: string;
  guardrails: string;
}

class EnhancedChatAI {
  private openai: OpenAI | null = null;
  private prompts: PromptsData = {
    system: '',
    taskTemplates: '',
    guardrails: ''
  };
  private promptsLoaded: boolean = false;
  
  constructor() {
    // Try to initialize OpenAI with API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      console.log('✅ OpenAI API connected');
    } else {
      console.log('⚠️ No OpenAI API key found, using mock responses');
    }
    
    // Load prompts asynchronously
    this.loadRealPrompts();
  }

  /**
   * ตรวจสอบ Guardrails - Security validation
   */
  async checkGuardrails(message: string): Promise<{ hasViolation: boolean; violation?: string }> {
    try {
      // ตรวจสอบ security patterns
      const securityPatterns = [
        { pattern: /(hack|crack|exploit|bypass)/i, violation: 'คำขอเกี่ยวกับการโจมตีหรือเจาะระบบ' },
        { pattern: /(delete|remove|drop)\s+(database|table|user)/i, violation: 'คำขอลบข้อมูลสำคัญ' },
        { pattern: /(access|steal|grab)\s+(password|credential|key)/i, violation: 'คำขอเข้าถึงข้อมูลลับ' },
        { pattern: /(virus|malware|backdoor)/i, violation: 'คำขอสร้างซอฟต์แวร์อันตราย' },
        { pattern: /(illegal|piracy|copyright)/i, violation: 'คำขอเกี่ยวกับกิจกรรมผิดกฎหมาย' }
      ];

      for (const { pattern, violation } of securityPatterns) {
        if (pattern.test(message)) {
          return { hasViolation: true, violation };
        }
      }

      return { hasViolation: false };
    } catch (error) {
      console.error('Guardrails check error:', error);
      return { hasViolation: false };
    }
  }

  private async loadRealPrompts(): Promise<void> {
    try {
      const promptsDir = path.join(__dirname, '../prompts');
      
      console.log('📁 Loading real prompts from:', promptsDir);
      
      // โหลด prompts จริงทั้งหมด
      const [systemMd, taskTemplatesMd, guardrailsMd] = await Promise.all([
        fs.readFile(path.join(promptsDir, 'system.md'), 'utf-8'),
        fs.readFile(path.join(promptsDir, 'task_templates.md'), 'utf-8'),
        fs.readFile(path.join(promptsDir, 'guardrails.md'), 'utf-8')
      ]);
      
      this.prompts = {
        system: systemMd,
        taskTemplates: taskTemplatesMd,
        guardrails: guardrailsMd
      };
      
      this.promptsLoaded = true;
      console.log('✅ Real prompts loaded successfully!');
      console.log(`📊 System prompt: ${systemMd.length} chars`);
      console.log(`📊 Task templates: ${taskTemplatesMd.length} chars`);
      console.log(`📊 Guardrails: ${guardrailsMd.length} chars`);
      
    } catch (error) {
      console.error('❌ Failed to load real prompts:', error);
      console.log('🔄 Falling back to hardcoded prompts...');
      this.initializeFallbackPrompts();
    }
  }

  private initializeFallbackPrompts(): void {
    this.prompts = {
      system: `You are Midori AI assistant. Convert user requests into structured commands.
Available command types:
- CREATE_COMPONENT: Create React components
- CREATE_PAGE: Create web pages  
- CREATE_AUTH_SYSTEM: Create authentication
- CREATE_COMPLETE_WEBSITE: Create full websites
- UPDATE_COMPONENT: Modify existing components
- UPDATE_STYLING: Change visual styling`,
      
      taskTemplates: `Common task templates:
- Component creation: componentName, styling
- Authentication: authMethod, database
- Website: websiteType, features`,
      
      guardrails: `Security guidelines:
- Never expose sensitive data
- Validate all inputs
- No destructive operations`
    };
    this.promptsLoaded = true;
    console.log('⚠️ Using fallback prompts');
  }

  async processUserInput(userInput: string): Promise<AIResponse> {
    // รอให้ prompts โหลดเสร็จ
    while (!this.promptsLoaded) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (this.openai) {
      return this.processWithRealAI(userInput);
    } else {
      return this.processMockResponse(userInput);
    }
  }

  private async processWithRealAI(userInput: string): Promise<AIResponse> {
    try {
      // สร้าง system prompt ที่ครบถ้วนด้วย prompts จริง
      const fullSystemPrompt = `
${this.prompts.system}

## Task Templates Available:
${this.prompts.taskTemplates}

## Critical Safety Guardrails (ต้องปฏิบัติตาม):
${this.prompts.guardrails}

## Instructions:
1. วิเคราะห์ user input อย่างละเอียด
2. ตรวจสอบ guardrails ก่อนประมวลผล
3. ถ้าปลอดภัย ให้แปลงเป็น structured command
4. ถ้าไม่ปลอดภัย ให้ปฏิเสธและอธิบาย
5. ถ้าข้อมูลไม่พอ ให้ถาม clarifying questions

User input: "${userInput}"

ตอบเป็น JSON ในรูปแบบ:
{
  "commandType": "CREATE_COMPONENT",
  "payload": { "componentName": "Button", "styling": "tailwind" },
  "explanation": "สร้าง Button component ใหม่ด้วย Tailwind CSS",
  "confidence": 0.95,
  "guardrailsViolation": false,
  "guardrailsWarning": "",
  "clarifyingQuestions": []
}
`;

      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o', // ใช้ model ที่ดีที่สุด
        messages: [
          { role: 'system', content: fullSystemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature: 1, // GPT-5 models only support temperature = 1
        max_tokens: 2000,
        response_format: { type: "json_object" } // บังคับให้ตอบเป็น JSON
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      const parsed = JSON.parse(content);
      
      // ตรวจสอบ guardrails violation
      if (parsed.guardrailsViolation) {
        return {
          command: null,
          explanation: parsed.guardrailsWarning || 'คำขอนี้ขัดต่อนโยบายความปลอดภัย',
          confidence: 0,
          guardrailsWarning: parsed.guardrailsWarning
        };
      }
      
      const command: Command = {
        commandId: crypto.randomUUID(),
        commandType: parsed.commandType as CommandType,
        payload: parsed.payload,
        priority: 'medium',
        metadata: {
          timestamp: new Date().toISOString(),
          userId: 'real_ai_user',
          projectId: 'chat_test'
        }
      };

      return {
        command,
        explanation: parsed.explanation,
        confidence: parsed.confidence,
        clarifyingQuestions: parsed.clarifyingQuestions || []
      };

    } catch (error) {
      console.error('AI processing error:', error);
      console.log('🔄 Falling back to mock response...');
      return this.processMockResponse(userInput);
    }
  }

  private processMockResponse(userInput: string): AIResponse {
    const input = userInput.toLowerCase();
    
    // ตรวจสอบ security violations ก่อน (Mock Guardrails)
    const dangerousPatterns = [
      'password', 'secret', 'api key', 'delete', 'drop', 'rm -rf', 
      'environment', 'env', 'config', 'database', 'production'
    ];
    
    if (dangerousPatterns.some(pattern => input.includes(pattern))) {
      return {
        command: null,
        explanation: '🛡️ คำขอนี้อาจมีความเสี่ยงด้านความปลอดภัย กรุณาระบุเฉพาะสิ่งที่ต้องการสร้างหรือปรับปรุง',
        confidence: 0,
        guardrailsWarning: 'Potential security violation detected'
      };
    }
    
    // Enhanced keyword matching for testing
    if (input.includes('button') || input.includes('component') || input.includes('ปุ่ม')) {
      return {
        command: {
          commandId: crypto.randomUUID(),
          commandType: CommandType.CREATE_COMPONENT,
          payload: { componentName: 'Button', styling: 'tailwind' },
          priority: 'medium',
          metadata: { timestamp: new Date().toISOString(), userId: 'mock_user' }
        },
        explanation: 'สร้าง Button component ใหม่ด้วย Tailwind CSS',
        confidence: 0.8
      };
    }
    
    if (input.includes('login') || input.includes('auth') || input.includes('เข้าสู่ระบบ')) {
      return {
        command: {
          commandId: crypto.randomUUID(),
          commandType: CommandType.CREATE_AUTH_SYSTEM,
          payload: { authMethod: 'jwt', database: 'postgresql' },
          priority: 'high',
          metadata: { timestamp: new Date().toISOString(), userId: 'mock_user' }
        },
        explanation: 'สร้างระบบ Authentication ด้วย JWT และ PostgreSQL',
        confidence: 0.9
      };
    }
    
    if (input.includes('website') || input.includes('เว็บไซต์') || input.includes('ecommerce') || input.includes('e-commerce')) {
      return {
        command: {
          commandId: crypto.randomUUID(),
          commandType: CommandType.CREATE_COMPLETE_WEBSITE,
          payload: { websiteType: 'business', features: ['responsive', 'seo'] },
          priority: 'critical',
          metadata: { timestamp: new Date().toISOString(), userId: 'mock_user' }
        },
        explanation: 'สร้างเว็บไซต์ธุรกิจครบระบบ พร้อม responsive design และ SEO',
        confidence: 0.85
      };
    }

    // คำขอที่คลุมเครือ - ให้ clarifying questions
    if (input.includes('ปรับปรุง') || input.includes('แก้ไข') || input.includes('ดีขึ้น')) {
      return {
        command: null,
        explanation: 'ข้อมูลยังไม่เพียงพอสำหรับการวางแผน กรุณาระบุรายละเอียดเพิ่มเติม',
        confidence: 0.3,
        clarifyingQuestions: [
          'ต้องการปรับปรุงส่วนไหนของระบบ?',
          'มีฟีเจอร์เฉพาะที่ต้องการหรือไม่?',
          'มีข้อจำกัดทางเทคนิคที่ต้องพิจารณาไหม?'
        ]
      };
    }

    return {
      command: null,
      explanation: 'ขออภัย ไม่เข้าใจคำสั่งนี้ กรุณาลองใหม่หรือระบุรายละเอียดเพิ่มเติม',
      confidence: 0.1,
      clarifyingQuestions: [
        'ต้องการสร้างอะไรใหม่หรือไม่?',
        'มีส่วนไหนของระบบที่ต้องการปรับปรุง?'
      ]
    };
  }
}

// ============================================================================
// CHAT ORCHESTRATOR INTEGRATION
// ============================================================================

class ChatOrchestrator {
  private chatAI: EnhancedChatAI;

  constructor() {
    this.chatAI = new EnhancedChatAI();
  }

  async processUserMessage(userInput: string): Promise<string> {
    try {
      console.log(`\n💬 User: ${userInput}`);
      
      // Step 1: Check guardrails first
      const guardrailsCheck = await this.chatAI.checkGuardrails(userInput);
      if (guardrailsCheck.hasViolation) {
        console.log(`🛡️ Guardrails violation: ${guardrailsCheck.violation}`);
        return `🚫 **คำขอไม่เหมาะสม:** ${guardrailsCheck.violation}\n\nกรุณาปรับคำขอให้เหมาะสมและลองใหม่`;
      }
      
      // Step 2: AI processes user input into command
      console.log('🤖 AI analyzing input...');
      const aiResponse = await this.chatAI.processUserInput(userInput);
      
      if (!aiResponse.command) {
        let errorResponse = `❌ ${aiResponse.explanation}`;
        
        // แสดง clarifying questions ถ้ามี
        if (aiResponse.clarifyingQuestions && aiResponse.clarifyingQuestions.length > 0) {
          errorResponse += `\n\n❓ **คำถามเพิ่มเติมเพื่อความชัดเจน:**\n`;
          aiResponse.clarifyingQuestions.forEach((question, index) => {
            errorResponse += `${index + 1}. ${question}\n`;
          });
        }
        
        return errorResponse;
      }

      console.log(`✅ AI Understanding: ${aiResponse.explanation} (${Math.round(aiResponse.confidence * 100)}% confident)`);

      // Step 3: Orchestrator creates execution plan
      console.log('🎯 Orchestrator planning...');
      const orchestratorResult = await run(aiResponse.command);

      if (!orchestratorResult.success) {
        let errorResponse = `❌ เกิดข้อผิดพลาด: ${orchestratorResult.error}`;
        
        // แสดง clarifying questions ถ้ามี
        if (aiResponse.clarifyingQuestions && aiResponse.clarifyingQuestions.length > 0) {
          errorResponse += `\n\n❓ **คำถามเพิ่มเติมเพื่อความชัดเจน:**\n`;
          aiResponse.clarifyingQuestions.forEach((question, index) => {
            errorResponse += `${index + 1}. ${question}\n`;
          });
        }
        
        return errorResponse;
      }

      // Step 4: Format response for user
      const plan = orchestratorResult.plan!;
      const response = this.formatPlanResponse(aiResponse.explanation, plan, aiResponse);
      
      return response;

    } catch (error) {
      console.error('Chat processing error:', error);
      return '❌ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่';
    }
  }

  private formatPlanResponse(explanation: string, plan: any, aiResponse?: AIResponse): string {
    const complexity = plan.complexity === 'simple' ? 'ง่าย' : 
                      plan.complexity === 'medium' ? 'ปานกลาง' : 'ซับซ้อน';
    
    const agents = (plan.requiredAgents || []).map((agent: string) => {
      switch (agent) {
        case 'frontend': return 'Frontend Developer';
        case 'backend': return 'Backend Developer';
        case 'devops': return 'DevOps Engineer';
        default: return agent;
      }
    }).join(', ');

    let response = `✅ **${explanation}**\n\n`;
    
    // แสดง confidence score
    if (aiResponse?.confidence) {
      const confidencePercent = Math.round(aiResponse.confidence * 100);
      const confidenceEmoji = confidencePercent >= 80 ? '🎯' : confidencePercent >= 60 ? '🤔' : '❓';
      response += `${confidenceEmoji} **ความมั่นใจ AI:** ${confidencePercent}%\n\n`;
    }
    
    // แสดง guardrails warning ถ้ามี
    if (aiResponse?.guardrailsWarning) {
      response += `�️ **คำเตือนความปลอดภัย:** ${aiResponse.guardrailsWarning}\n\n`;
    }
    
    response += `�📊 **ข้อมูลโครงการ:**\n`;
    response += `• ระดับความซับซ้อน: ${complexity}\n`;
    response += `• ทีมที่ต้องใช้: ${agents || 'ไม่ระบุ'}\n`;
    response += `• จำนวนงาน: ${(plan.tasks || []).length} tasks\n`;
    response += `• เวลาที่ประมาณ: ${plan.estimatedDuration || plan.estimatedTotalDuration || 0} นาที\n`;
    response += `• จุดตรวจสอบคุณภาพ: ${(plan.qualityGates || []).length} gates\n\n`;
    
    response += `🏗️ **แผนการดำเนินงาน:**\n`;
    (plan.tasks || []).forEach((task: any, index: number) => {
      response += `${index + 1}. ${task.description || task.action || 'ไม่ระบุ'} (${task.estimatedDuration || 0} นาที)\n`;
    });

    response += `\n🛡️ **การตรวจสอบคุณภาพ:**\n`;
    (plan.qualityGates || []).forEach((gate: any) => {
      const gateName = gate.gate === 'security_scan' ? 'ตรวจสอบความปลอดภัย' :
                       gate.gate === 'accessibility' ? 'ตรวจสอบการเข้าถึง' :
                       gate.gate === 'performance' ? 'ตรวจสอบประสิทธิภาพ' :
                       gate.gate === 'code_quality' ? 'ตรวจสอบคุณภาพโค้ด' : gate.gate;
      response += `• ${gateName}\n`;
    });

    // แสดง clarifying questions ถ้ามี
    if (aiResponse?.clarifyingQuestions && aiResponse.clarifyingQuestions.length > 0) {
      response += `\n❓ **คำถามเพิ่มเติม:**\n`;
      aiResponse.clarifyingQuestions.forEach((question, index) => {
        response += `${index + 1}. ${question}\n`;
      });
    }

    response += `\n📋 **Plan ID:** ${plan.planId || 'unknown'}`;
    response += `\n⏱️ **สร้างเมื่อ:** ${new Date().toLocaleString('th-TH')}`;
    response += `\n🤖 **ประมวลผลโดย:** ${aiResponse ? (process.env.OPENAI_API_KEY ? 'Real AI (GPT-4o)' : 'Mock AI') : 'Orchestrator'}`;

    return response;
  }
}

// ============================================================================
// INTERACTIVE TEST FUNCTIONS
// ============================================================================

const chatOrchestrator = new ChatOrchestrator();

export async function runChatSimulation(userInput: string): Promise<void> {
  console.log('\n🎯 Midori Chat Simulation Test');
  console.log('=' .repeat(50));
  
  const response = await chatOrchestrator.processUserMessage(userInput);
  
  console.log('\n🤖 Midori Assistant:');
  console.log(response);
  console.log('\n' + '='.repeat(50));
}

export async function runInteractiveChatTest(): Promise<void> {
  console.log('\n🎯 Midori Interactive Chat Test');
  console.log('Type your requests and see how Orchestrator plans them!');
  console.log('Examples:');
  console.log('- "สร้าง button ใหม่"');
  console.log('- "ต้องการระบบ login"'); 
  console.log('- "สร้างเว็บไซต์ e-commerce"');
  console.log('- "exit" to quit\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question('💬 You: ', resolve);
    });
  };

  while (true) {
    try {
      const userInput = await askQuestion();
      
      if (userInput.toLowerCase() === 'exit') {
        console.log('\n👋 ขอบคุณที่ทดสอบ Midori Orchestrator!');
        break;
      }

      const response = await chatOrchestrator.processUserMessage(userInput);
      console.log('\n🤖 Midori Assistant:');
      console.log(response);
      console.log('\n' + '-'.repeat(50) + '\n');
      
    } catch (error) {
      console.error('Error:', error);
    }
  }

  rl.close();
}

// Sample test cases
export async function runSampleChatTests(): Promise<void> {
  const testCases = [
    'สร้าง button component ใหม่',
    'ต้องการระบบ login สำหรับผู้ใช้',
    'สร้างเว็บไซต์ e-commerce ครบระบบ',
    'แก้ไข navbar ให้สวยกว่าเดิม',
    'เพิ่ม dark mode ให้เว็บไซต์'
  ];

  console.log('\n🧪 Running Sample Chat Tests...\n');

  for (let i = 0; i < testCases.length; i++) {
    console.log(`\n📝 Test Case ${i + 1}/${testCases.length}`);
    await runChatSimulation(testCases[i]);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ All sample tests completed!');
}

// Auto-run if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args[0] || 'sample';
  
  switch (mode) {
    case 'interactive':
      runInteractiveChatTest().catch(console.error);
      break;
    case 'sample':
      runSampleChatTests().catch(console.error);
      break;
    default:
      console.log('Usage:');
      console.log('  npm run test:chat              # Run sample tests');
      console.log('  npm run test:chat interactive  # Interactive mode');
  }
}