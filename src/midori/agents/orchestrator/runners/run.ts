/**
 * Midori Orchestrator Core Runner v3.0
 * Enhanced with LLM Adapter integration and real AI processing
 * Focused on Chat AI Response for user interaction
 */

import { z } from 'zod';
import crypto from 'crypto';
import { LLMAdapter } from '../adapters/llmAdapter';
import { dispatchTask, dispatchExecutionPlan } from '../tools/agent_dispatcher';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

enum CommandType {
  // Template-First Commands (NEW!)
  SELECT_TEMPLATE = 'select_template',
  CUSTOMIZE_TEMPLATE = 'customize_template',
  
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
  BACKUP_RESTORE = 'backup_restore',
  
  // Legacy Complex Commands (Deprecated in favor of Template-First)
  CREATE_COMPLETE_WEBSITE = 'create_complete_website',
  IMPLEMENT_FULL_FEATURE = 'implement_full_feature',
  SETUP_FULL_STACK = 'setup_full_stack'
}

enum TaskType {
  FRONTEND = 'frontend',
  BACKEND = 'backend', 
  DEVOPS = 'devops'
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const CommandSchema = z.object({
  commandId: z.string().uuid(),
  commandType: z.nativeEnum(CommandType),
  payload: z.record(z.any()),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  metadata: z.object({
    userId: z.string().optional(),
    projectId: z.string().optional(),
    timestamp: z.string().datetime()
  }).optional()
});

const TaskSchema = z.object({
  taskId: z.string().uuid(),
  agent: z.nativeEnum(TaskType),
  action: z.string(),
  description: z.string(),
  payload: z.record(z.any()),
  dependencies: z.array(z.string()).default([]),
  customDependencies: z.array(z.string()).optional(),
  deploymentGroup: z.string().optional(),
  estimatedDuration: z.number().positive(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'running', 'completed', 'failed']).default('pending'),
  resourceRequirements: z.object({
    cpu: z.number().min(1).max(8).default(1),
    memory: z.number().min(1).max(16).default(2)
  }).default({ cpu: 1, memory: 2 })
}).transform(data => ({
  ...data,
  status: data.status || 'pending' as const
}));

const ExecutionStageSchema = z.object({
  stageId: z.string(),
  parallelTasks: z.array(z.string()),
  dependencies: z.array(z.string()).default([]),
  estimatedDuration: z.number().positive(),
  resourceRequirements: z.object({
    maxCpu: z.number().positive(),
    maxMemory: z.number().positive(),
    maxConcurrency: z.number().positive()
  })
});

const QualityGateSchema = z.object({
  gate: z.string(),
  required: z.boolean(),
  trigger: z.enum(['before_start', 'before_deploy', 'after_completion']),
  checks: z.array(z.string()).optional(),
  thresholds: z.record(z.number()).optional()
});

const ExecutionPlanSchema = z.object({
  planId: z.string().uuid(),
  commandId: z.string().uuid(),
  tasks: z.array(TaskSchema),
  executionStages: z.array(ExecutionStageSchema),
  qualityGates: z.array(QualityGateSchema),
  estimatedTotalDuration: z.number().positive(),
  totalResourceRequirements: z.object({
    maxParallelTasks: z.number().positive(),
    totalCpuUnits: z.number().positive(),
    totalMemoryUnits: z.number().positive()
  }),
  metadata: z.object({
    createdAt: z.string().datetime(),
    complexity: z.enum(['simple', 'medium', 'complex']).optional(),
    requiredAgents: z.array(z.nativeEnum(TaskType)).optional(),
    aiGenerated: z.boolean().optional(),
    model: z.string().optional()
  })
});

const OrchestratorResultSchema = z.object({
  success: z.boolean(),
  plan: ExecutionPlanSchema.optional(),
  error: z.string().optional(),
  warnings: z.array(z.string()).default([]),
  chatResponse: z.object({
    message: z.string(),
    tone: z.string(),
    suggestions: z.array(z.string()),
    timestamp: z.string()
  }).optional(),
  metadata: z.object({
    processingTimeMs: z.number().positive(),
    validationErrors: z.array(z.string()).default([])
  })
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Command = z.infer<typeof CommandSchema>;
type Task = z.infer<typeof TaskSchema>;
type ExecutionStage = z.infer<typeof ExecutionStageSchema>;
type QualityGate = z.infer<typeof QualityGateSchema>;
type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
type OrchestratorResult = z.infer<typeof OrchestratorResultSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * 1. Validate and parse incoming command
 */
function validateCommand(rawCommand: unknown): Command {
  console.log('⚡ Validating command...');
  
  try {
    const result = CommandSchema.parse(rawCommand);
    console.log(`✅ Command validated: ${result.commandType}`);
    return result;
  } catch (error) {
    console.error('❌ Command validation failed:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid command format: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * 2. Classify command to determine complexity and requirements
 */
function classifyCommand(command: Command): {
  complexity: 'simple' | 'medium' | 'complex';
  requiredAgents: TaskType[];
  estimatedDuration: number;
} {
  console.log(`🔍 Classifying command: ${command.commandType}`);
  
  // Template-First commands are generally simple
  if (command.commandType === CommandType.SELECT_TEMPLATE || 
      command.commandType === CommandType.CUSTOMIZE_TEMPLATE) {
    return {
      complexity: 'simple',
      requiredAgents: [TaskType.FRONTEND],
      estimatedDuration: command.commandType === CommandType.SELECT_TEMPLATE ? 45 : 30
    };
  }
  
  // Frontend-only commands
  const frontendCommands = [
    CommandType.CREATE_COMPONENT,
    CommandType.UPDATE_COMPONENT,
    CommandType.CREATE_PAGE,
    CommandType.UPDATE_STYLING,
    CommandType.RESPONSIVE_DESIGN
  ];
  
  if (frontendCommands.includes(command.commandType)) {
    return {
      complexity: 'simple',
      requiredAgents: [TaskType.FRONTEND],
      estimatedDuration: 30
    };
  }
  
  // Backend commands
  const backendCommands = [
    CommandType.CREATE_API_ENDPOINT,
    CommandType.UPDATE_DATABASE_SCHEMA,
    CommandType.CREATE_AUTH_SYSTEM,
    CommandType.IMPLEMENT_BUSINESS_LOGIC
  ];
  
  if (backendCommands.includes(command.commandType)) {
    return {
      complexity: 'medium',
      requiredAgents: [TaskType.BACKEND],
      estimatedDuration: 60
    };
  }
  
  // DevOps commands
  const devopsCommands = [
    CommandType.SETUP_CICD,
    CommandType.DEPLOY_APPLICATION,
    CommandType.SETUP_MONITORING
  ];
  
  if (devopsCommands.includes(command.commandType)) {
    return {
      complexity: 'medium',
      requiredAgents: [TaskType.DEVOPS],
      estimatedDuration: 90
    };
  }
  
  // Complex multi-agent commands
  return {
    complexity: 'complex',
    requiredAgents: [TaskType.FRONTEND, TaskType.BACKEND],
    estimatedDuration: 120
  };
}

/**
 * 3. Break down command into executable tasks
 */
function breakdownCommand(command: Command): Task[] {
  console.log(`⚙️ Breaking down command: ${command.commandType}`);
  
  const taskId = crypto.randomUUID();
  const baseTask = {
    taskId,
    action: command.commandType,
    description: `Execute ${command.commandType} task`,
    payload: command.payload,
    dependencies: [],
    estimatedDuration: 30,
    priority: command.priority,
    status: 'pending' as const,
    resourceRequirements: { cpu: 1, memory: 2 }
  };
  
  // Template-First: Frontend handles template selection
  if (command.commandType === CommandType.SELECT_TEMPLATE) {
    return [{
      ...baseTask,
      agent: TaskType.FRONTEND,
      description: 'Select appropriate template for the project',
      estimatedDuration: 45
    }];
  }
  
  if (command.commandType === CommandType.CUSTOMIZE_TEMPLATE) {
    return [{
      ...baseTask,
      agent: TaskType.FRONTEND,
      description: 'Customize template according to requirements',
      estimatedDuration: 30
    }];
  }
  
  // Frontend tasks
  const frontendCommands = [
    CommandType.CREATE_COMPONENT,
    CommandType.UPDATE_COMPONENT,
    CommandType.CREATE_PAGE,
    CommandType.UPDATE_STYLING,
    CommandType.RESPONSIVE_DESIGN
  ];
  
  if (frontendCommands.includes(command.commandType)) {
    return [{
      ...baseTask,
      agent: TaskType.FRONTEND,
      estimatedDuration: 30
    }];
  }
  
  // Backend tasks
  const backendCommands = [
    CommandType.CREATE_API_ENDPOINT,
    CommandType.UPDATE_DATABASE_SCHEMA,
    CommandType.CREATE_AUTH_SYSTEM,
    CommandType.IMPLEMENT_BUSINESS_LOGIC
  ];
  
  if (backendCommands.includes(command.commandType)) {
    return [{
      ...baseTask,
      agent: TaskType.BACKEND,
      estimatedDuration: 60
    }];
  }
  
  // DevOps tasks
  const devopsCommands = [
    CommandType.SETUP_CICD,
    CommandType.DEPLOY_APPLICATION,
    CommandType.SETUP_MONITORING
  ];
  
  if (devopsCommands.includes(command.commandType)) {
    return [{
      ...baseTask,
      agent: TaskType.DEVOPS,
      estimatedDuration: 90
    }];
  }
  
  // Default single task
  return [{
    ...baseTask,
    agent: TaskType.FRONTEND
  }];
}

/**
 * 4. Create execution stages for parallel processing
 */
function createExecutionStages(tasks: Task[]): ExecutionStage[] {
  console.log('🗂️ Creating execution stages...');
  
  return [{
    stageId: crypto.randomUUID(),
    parallelTasks: tasks.map(t => t.taskId),
    dependencies: [],
    estimatedDuration: Math.max(...tasks.map(t => t.estimatedDuration)),
    resourceRequirements: {
      maxCpu: Math.max(...tasks.map(t => t.resourceRequirements.cpu)),
      maxMemory: Math.max(...tasks.map(t => t.resourceRequirements.memory)),
      maxConcurrency: tasks.length
    }
  }];
}

/**
 * 5. Set up quality gates
 */
function setupQualityGates(complexity: string): QualityGate[] {
  console.log('🛡️ Setting up quality gates...');
  
  const baseGates: QualityGate[] = [
    {
      gate: 'code_review',
      required: true,
      trigger: 'before_deploy' as const,
      checks: ['syntax_check', 'type_check'],
      thresholds: { coverage: 80 }
    }
  ];
  
  if (complexity === 'complex') {
    baseGates.push({
      gate: 'integration_test',
      required: true,
      trigger: 'before_deploy',
      checks: ['api_test', 'ui_test'],
      thresholds: { success_rate: 95 }
    });
  }
  
  return baseGates;
}

/**
 * 6. Create complete execution plan
 */
function createExecutionPlan(command: Command): ExecutionPlan {
  console.log('📋 Creating execution plan...');
  
  const classification = classifyCommand(command);
  const tasks = breakdownCommand(command);
  const executionStages = createExecutionStages(tasks);
  const qualityGates = setupQualityGates(classification.complexity);
  
  const estimatedTotalDuration = Math.max(...executionStages.map(s => s.estimatedDuration));
  
  const plan: ExecutionPlan = {
    planId: crypto.randomUUID(),
    commandId: command.commandId,
    tasks,
    executionStages,
    qualityGates,
    estimatedTotalDuration,
    totalResourceRequirements: {
      maxParallelTasks: Math.max(...executionStages.map(s => s.parallelTasks.length)),
      totalCpuUnits: tasks.reduce((sum, task) => sum + task.resourceRequirements.cpu, 0),
      totalMemoryUnits: tasks.reduce((sum, task) => sum + task.resourceRequirements.memory, 0)
    },
    metadata: {
      createdAt: new Date().toISOString(),
      complexity: classification.complexity,
      requiredAgents: classification.requiredAgents
    }
  };
  
  console.log(`✅ Execution plan created: ${tasks.length} tasks, ${classification.complexity} complexity`);
  return plan;
}

// ============================================================================
// LLM INTEGRATION
// ============================================================================

let llmAdapter: LLMAdapter | null = null;

async function initializeLLM(): Promise<LLMAdapter> {
  if (!llmAdapter) {
    llmAdapter = new LLMAdapter();
    await llmAdapter.initialize(); // เพิ่ม initialize() call
  }
  return llmAdapter;
}

async function processWithAI(command: Command): Promise<{ 
  aiResponse: any; 
  chatResponse: any; 
  success: boolean 
}> {
  try {
    const llm = await initializeLLM();
    
    // Create AI prompt from command
    const prompt = `Command: ${command.commandType}\nPayload: ${JSON.stringify(command.payload)}\nPriority: ${command.priority}`;
    
    const aiResponse = await llm.callLLM(prompt, {
      useSystemPrompt: true,
      temperature: 1,
      maxTokens: 8000
    });

    // Parse AI response as JSON with better error handling
    let parsedResponse;
    try {
      // Log the raw AI response for debugging
      console.log('🔍 Raw AI response:', aiResponse.content);
      
      // Try to clean the response before parsing
      let cleanedContent = aiResponse.content.trim();
      
      // Remove any markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON object in the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[0];
      }
      
      console.log('🔍 Cleaned AI response:', cleanedContent);
      
      parsedResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse AI response as JSON:', parseError);
      console.warn('⚠️ Raw response content:', aiResponse.content);
      
      // Fallback: Create a basic plan structure
      console.log('🔄 Creating fallback plan structure');
      parsedResponse = {
        success: true,
        plan: {
          planId: crypto.randomUUID(),
          tasks: [{
            taskId: crypto.randomUUID(),
            agent: 'frontend',
            action: command.commandType,
            description: `Execute ${command.commandType} task`,
            payload: command.payload,
            dependencies: [],
            estimatedDuration: 30,
            priority: command.priority,
            status: 'pending',
            resourceRequirements: { cpu: 1, memory: 2 }
          }],
          executionStages: [],
          qualityGates: [],
          estimatedTotalDuration: 30,
          totalResourceRequirements: {
            maxParallelTasks: 1,
            totalCpuUnits: 1,
            totalMemoryUnits: 1
          },
          metadata: {
            createdAt: new Date().toISOString(),
            aiGenerated: false,
            fallback: true
          }
        },
        warnings: ['AI response parsing failed, using fallback plan']
      };
    }

    // Generate chat response (mock for now - will use ChatResponseService)
    const chatResponse = {
      message: "🤖 ผมเข้าใจแล้วครับ! กำลังประมวลผลตามที่คุณขอ",
      tone: "helpful",
      suggestions: ["ตรวจสอบผลลัพธ์", "ปรับแต่งเพิ่มเติม", "ขอความช่วยเหลือ"],
      timestamp: new Date().toISOString()
    };

    return {
      aiResponse: parsedResponse,
      chatResponse,
      success: true
    };
  } catch (error) {
    console.error('❌ LLM processing failed:', error);
    return {
      aiResponse: { error: error instanceof Error ? error.message : 'Unknown AI error' },
      chatResponse: null,
      success: false
    };
  }
}

// ============================================================================
// TEMPLATE-FIRST HANDLERS
// ============================================================================

/**
 * Handle template-first commands (SELECT_TEMPLATE, CUSTOMIZE_TEMPLATE)
 */
async function handleTemplateCommand(
  command: Command, 
  startTime: number, 
  warnings: string[], 
  validationErrors: string[]
): Promise<OrchestratorResult> {
  console.log('🎯 Handling template command:', command.commandType);
  
  // Create simple template task
  const task = {
    taskId: crypto.randomUUID(),
    agent: TaskType.FRONTEND,
    action: command.commandType,
    description: command.commandType === CommandType.SELECT_TEMPLATE 
      ? 'Select appropriate template for the project'
      : 'Customize template according to requirements',
    payload: command.payload,
    dependencies: [],
    estimatedDuration: command.commandType === CommandType.SELECT_TEMPLATE ? 45 : 30,
    priority: command.priority,
    status: 'pending' as const,
    resourceRequirements: { cpu: 1, memory: 2 }
  };
  
  // Create execution plan
  const plan: ExecutionPlan = {
    planId: crypto.randomUUID(),
    commandId: command.commandId,
    tasks: [task],
    executionStages: [{
      stageId: crypto.randomUUID(),
      parallelTasks: [task.taskId],
      estimatedDuration: task.estimatedDuration,
      dependencies: [],
      resourceRequirements: { maxCpu: 1, maxMemory: 2, maxConcurrency: 1 }
    }],
    qualityGates: [],
    estimatedTotalDuration: task.estimatedDuration,
    totalResourceRequirements: {
      maxParallelTasks: 1,
      totalCpuUnits: 1,
      totalMemoryUnits: 2
    },
    metadata: {
      createdAt: new Date().toISOString(),
      aiGenerated: false
    }
  };
  
  // Execute template task
  console.log('🚀 Executing template task...');
  const executionResult = await executeTasks(plan);
  
  return {
    success: true,
    plan,
    chatResponse: {
      message: command.commandType === CommandType.SELECT_TEMPLATE 
        ? '🎯 กำลังเลือกเทมเพลตที่เหมาะสมสำหรับโปรเจคของคุณ...'
        : '🎨 กำลังปรับแต่งเทมเพลตตามความต้องการ...',
      tone: 'helpful',
      suggestions: ['ตรวจสอบผลลัพธ์', 'ปรับแต่งเพิ่มเติม', 'ขอความช่วยเหลือ'],
      timestamp: new Date().toISOString()
    },
    warnings,
    metadata: {
      processingTimeMs: performance.now() - startTime,
      validationErrors
    }
  };
}

// ============================================================================
// MAIN ORCHESTRATOR FUNCTION
// ============================================================================

export async function run(rawCommand: unknown): Promise<OrchestratorResult> {
  const startTime = performance.now();
  const warnings: string[] = [];
  const validationErrors: string[] = [];
  
  try {
    console.log('🎯 Starting orchestrator with command:', JSON.stringify(rawCommand, null, 2));

    // 1. Validate input command
    const command = validateCommand(rawCommand);
    
    // 2. Check if we should use Component-Based instead of Template-Based
    if (command.commandType === CommandType.SELECT_TEMPLATE || 
        command.commandType === CommandType.CUSTOMIZE_TEMPLATE) {
      
      // Check if Enhanced Context exists (indicates Component-Based)
      const projectContext = command.payload?.projectContext;
      const hasEnhancedContext = projectContext && 
        (projectContext as any).themePack !== undefined || 
        (projectContext as any).blueprint !== undefined;
      
      if (hasEnhancedContext) {
        console.log('🎯 Enhanced Context detected - Using Component-Based approach');
        console.log('- ThemePack:', (projectContext as any).themePack ? 'Yes' : 'No');
        console.log('- Blueprint:', (projectContext as any).blueprint ? 'Yes' : 'No');
        // Continue to AI processing for component-based approach
      } else {
        console.log('🎯 Using Template-First approach for:', command.commandType);
        return await handleTemplateCommand(command, startTime, warnings, validationErrors);
      }
    }
    
    // 2. Process with AI for intelligent planning (for other commands)
    console.log('🤖 Processing with AI...');
    const aiResult = await processWithAI(command);
    
    if (!aiResult.success) {
      return {
        success: false,
        error: 'AI processing failed: ' + (aiResult.aiResponse.error || 'Unknown AI error'),
        warnings,
        chatResponse: aiResult.chatResponse,
        metadata: {
          processingTimeMs: performance.now() - startTime,
          validationErrors
        }
      };
    }

    // Check if AI returned a valid plan
    if (aiResult.aiResponse.success && aiResult.aiResponse.plan) {
      console.log('✅ AI generated plan successfully');
      const aiPlan = aiResult.aiResponse.plan;
      
      // Create execution plan from AI response
      let tasks = aiPlan.tasks || [];
      
      // If AI didn't provide tasks, create them from command
      if (tasks.length === 0) {
        console.log('⚠️ AI plan has no tasks, creating tasks from command');
        tasks = breakdownCommand(command);
      } else {
        // ✅ แก้ไข: เพิ่ม projectContext และแปลงเป็น hybrid approach (template + component)
        console.log('🔧 Adding projectContext to AI plan tasks and converting to hybrid approach');
        tasks = tasks.map((task: any) => {
          // Handle frontend tasks based on context
          if (task.agent === 'frontend') {
            // Check if this is a new website creation (use template)
            if (task.action === 'create_component' && 
                (command.commandType === CommandType.SELECT_TEMPLATE || 
                 task.description?.includes('เว็บไซต์') || 
                 task.description?.includes('ร้าน'))) {
              console.log('🔄 Converting website creation to template selection:', task.taskId);
              return {
                ...task,
                action: 'select_template',
                description: `เลือก template ที่เหมาะสมสำหรับ ${command.payload.projectContext?.projectType || 'e_commerce'}`,
                payload: {
                  templateType: command.payload.projectContext?.projectType || 'e_commerce',
                  customizations: {
                    theme: command.payload.projectContext?.userPreferences?.theme || 'light',
                    language: command.payload.projectContext?.userPreferences?.language || 'th'
                  },
                  projectContext: command.payload.projectContext
                }
              };
            }
            // Keep component creation for specific components
            else if (task.action === 'create_component') {
              console.log('🔄 Keeping component creation for specific component:', task.taskId);
              return {
                ...task,
                payload: {
                  ...task.payload,
                  projectContext: command.payload.projectContext,
                  templateIntegration: {
                    insertInto: 'main',
                    position: 'bottom'
                  }
                }
              };
            }
          }
          
          // Keep other tasks as is but add projectContext
          return {
            ...task,
            payload: {
              ...task.payload,
              projectContext: command.payload.projectContext
            }
          };
        });
        
        console.log('🔧 Tasks with projectContext (template-first):', tasks.map((t: any) => ({
          taskId: t.taskId,
          agent: t.agent,
          action: t.action,
          hasProjectContext: !!t.payload?.projectContext,
          projectId: t.payload?.projectContext?.projectId,
          templateType: t.payload?.templateType
        })));
      }
      
      const plan: ExecutionPlan = {
        planId: aiPlan.planId || crypto.randomUUID(),
        commandId: command.commandId,
        tasks,
        executionStages: [],
        qualityGates: aiPlan.qualityGates || [],
        estimatedTotalDuration: aiPlan.estimatedTotalDuration || 30,
        totalResourceRequirements: {
          maxParallelTasks: 1,
          totalCpuUnits: 1,
          totalMemoryUnits: 1
        },
        metadata: {
          createdAt: new Date().toISOString(),
          aiGenerated: true,
          model: 'gpt-5-nano'
        }
      };
      
      // Execute tasks with real agents
      console.log('🚀 Starting task execution from AI plan...');
      const executionResult = await executeTasks(plan);
      
      return {
        success: true,
        plan,
        chatResponse: aiResult.chatResponse,
        warnings: aiResult.aiResponse.warnings || [],
        metadata: {
          processingTimeMs: performance.now() - startTime,
          validationErrors
        }
      };
    }

    // Fallback to traditional planning if AI fails
    console.log('⚠️ AI plan generation failed, falling back to traditional planning');
    
    // 3. Classify command and determine complexity
    const classification = classifyCommand(command);
    
    // 4. Break down into tasks
    const tasks = breakdownCommand(command);
    
    // 4. Create execution stages
    const executionStages = createExecutionStages(tasks);
    
    // 5. Setup quality gates
    const qualityGates = setupQualityGates(classification.complexity);
    
    // 6. Calculate total duration
    const estimatedTotalDuration = Math.max(...executionStages.map(s => s.estimatedDuration));
    
    // 7. Create complete execution plan
    const plan: ExecutionPlan = {
      planId: crypto.randomUUID(),
      commandId: command.commandId,
      tasks,
      executionStages,
      qualityGates,
      estimatedTotalDuration,
      totalResourceRequirements: {
        maxParallelTasks: Math.max(...executionStages.map(s => s.parallelTasks.length)),
        totalCpuUnits: tasks.reduce((sum, task) => sum + task.resourceRequirements.cpu, 0),
        totalMemoryUnits: tasks.reduce((sum, task) => sum + task.resourceRequirements.memory, 0)
      },
      metadata: {
        createdAt: new Date().toISOString(),
        complexity: classification.complexity,
        requiredAgents: classification.requiredAgents
      }
    };
    
    // 8. Validate plan
    const validatedPlan = ExecutionPlanSchema.parse(plan);
    
    console.log('📋 Execution plan created:', JSON.stringify(validatedPlan, null, 2));
    
    // 9. Execute tasks with real agents
    console.log('🚀 Starting task execution...');
    const executionResult = await executeTasks(validatedPlan);
    
    const processingTimeMs = performance.now() - startTime;
    
    return {
      success: true,
      plan: validatedPlan,
      warnings,
      metadata: {
        processingTimeMs,
        validationErrors
      }
    };
    
  } catch (error) {
    const processingTimeMs = performance.now() - startTime;
    console.error('❌ Orchestrator error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      warnings,
      metadata: {
        processingTimeMs,
        validationErrors
      }
    };
  }
}

// ============================================================================
// TASK EXECUTION
// ============================================================================

/**
 * Execute tasks using real agents
 */
async function executeTasks(plan: ExecutionPlan): Promise<{
  success: boolean;
  results: any[];
  errors: string[];
  executionTime: number;
}> {
  const startTime = Date.now();
  const results: any[] = [];
  const errors: string[] = [];
  
  try {
    console.log(`🎯 Executing ${plan.tasks.length} tasks...`);
    
    // Execute tasks in parallel for now (can be enhanced with dependency management)
    const taskPromises = plan.tasks.map(async (task) => {
      try {
        // Task dispatching logged in agent_dispatcher.ts
        const result = await dispatchTask(task);
        
        if (result.success) {
          console.log(`✅ Task ${task.taskId} completed successfully`);
          results.push({
            taskId: task.taskId,
            agent: task.agent,
            success: true,
            result: result.result,
            dispatchId: result.dispatchId
          });
        } else {
          console.error(`❌ Task ${task.taskId} failed:`, result.error);
          errors.push(`Task ${task.taskId}: ${result.error}`);
          results.push({
            taskId: task.taskId,
            agent: task.agent,
            success: false,
            error: result.error
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Task ${task.taskId} execution error:`, errorMsg);
        errors.push(`Task ${task.taskId}: ${errorMsg}`);
        results.push({
          taskId: task.taskId,
          agent: task.agent,
          success: false,
          error: errorMsg
        });
      }
    });
    
    await Promise.all(taskPromises);
    
    const executionTime = Date.now() - startTime;
    const success = errors.length === 0;
    
    console.log(`🏁 Task execution completed in ${executionTime}ms. Success: ${success}`);
    
    return {
      success,
      results,
      errors,
      executionTime
    };
    
  } catch (error) {
    console.error('❌ Task execution failed:', error);
    return {
      success: false,
      results,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
      executionTime: Date.now() - startTime
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { CommandType, TaskType };
export type { Command, Task, ExecutionStage, ExecutionPlan, OrchestratorResult };