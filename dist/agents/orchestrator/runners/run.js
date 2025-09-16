/**
 * Midori Orchestrator Core Runner v3.0
 * Enhanced with LLM Adapter integration and real AI processing
 * Focused on Chat AI Response for user interaction
 */
import { z } from 'zod';
import crypto from 'crypto';
import { LLMAdapter } from '../adapters/llmAdapter';
// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================
var CommandType;
(function (CommandType) {
    // Template-First Commands (NEW!)
    CommandType["SELECT_TEMPLATE"] = "select_template";
    CommandType["CUSTOMIZE_TEMPLATE"] = "customize_template";
    // Frontend Commands
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
    // Legacy Complex Commands (Deprecated in favor of Template-First)
    CommandType["CREATE_COMPLETE_WEBSITE"] = "create_complete_website";
    CommandType["IMPLEMENT_FULL_FEATURE"] = "implement_full_feature";
    CommandType["SETUP_FULL_STACK"] = "setup_full_stack";
})(CommandType || (CommandType = {}));
var TaskType;
(function (TaskType) {
    TaskType["FRONTEND"] = "frontend";
    TaskType["BACKEND"] = "backend";
    TaskType["DEVOPS"] = "devops";
})(TaskType || (TaskType = {}));
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
    status: data.status || 'pending'
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
// HELPER FUNCTIONS
// ============================================================================
/**
 * 1. Validate and parse incoming command
 */
function validateCommand(rawCommand) {
    console.log('⚡ Validating command...');
    try {
        const result = CommandSchema.parse(rawCommand);
        console.log(`✅ Command validated: ${result.commandType}`);
        return result;
    }
    catch (error) {
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
function classifyCommand(command) {
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
function breakdownCommand(command) {
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
        status: 'pending',
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
function createExecutionStages(tasks) {
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
function setupQualityGates(complexity) {
    console.log('🛡️ Setting up quality gates...');
    const baseGates = [
        {
            gate: 'code_review',
            required: true,
            trigger: 'before_deploy',
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
function createExecutionPlan(command) {
    console.log('📋 Creating execution plan...');
    const classification = classifyCommand(command);
    const tasks = breakdownCommand(command);
    const executionStages = createExecutionStages(tasks);
    const qualityGates = setupQualityGates(classification.complexity);
    const estimatedTotalDuration = Math.max(...executionStages.map(s => s.estimatedDuration));
    const plan = {
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
let llmAdapter = null;
async function initializeLLM() {
    if (!llmAdapter) {
        llmAdapter = new LLMAdapter();
        await llmAdapter.loadConfig();
        await llmAdapter.loadSystemPrompts();
    }
    return llmAdapter;
}
async function processWithAI(command) {
    try {
        const llm = await initializeLLM();
        // Create AI prompt from command
        const prompt = `Command: ${command.commandType}\nPayload: ${JSON.stringify(command.payload)}\nPriority: ${command.priority}`;
        const aiResponse = await llm.callLLM(prompt, {
            useSystemPrompt: true,
            temperature: 1,
            maxTokens: 8000
        });
        // Parse AI response as JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(aiResponse.content);
        }
        catch (parseError) {
            console.warn('⚠️ Failed to parse AI response as JSON:', parseError);
            return {
                aiResponse: { error: 'Invalid JSON response from AI' },
                chatResponse: null,
                success: false
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
    }
    catch (error) {
        console.error('❌ LLM processing failed:', error);
        return {
            aiResponse: { error: error instanceof Error ? error.message : 'Unknown AI error' },
            chatResponse: null,
            success: false
        };
    }
}
// ============================================================================
// MAIN ORCHESTRATOR FUNCTION
// ============================================================================
export async function run(rawCommand) {
    const startTime = performance.now();
    const warnings = [];
    const validationErrors = [];
    try {
        console.log('🎯 Starting orchestrator with command:', JSON.stringify(rawCommand, null, 2));
        // 1. Validate input command
        const command = validateCommand(rawCommand);
        // 2. Process with AI for intelligent planning
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
            return {
                success: true,
                plan: {
                    planId: aiPlan.planId || crypto.randomUUID(),
                    commandId: command.commandId,
                    tasks: aiPlan.tasks || [],
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
                },
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
        const plan = {
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
    }
    catch (error) {
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
// EXPORTS
// ============================================================================
export { CommandType, TaskType };
