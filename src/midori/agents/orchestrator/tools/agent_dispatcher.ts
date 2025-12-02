/**
 * Agent Dispatcher Tool for Orchestrator
 * Handles task dispatch and coordination between agents
 */

import type { Task } from '../runners/run';

interface DispatchResult {
  success: boolean;
  dispatchId?: string;
  estimatedCompletion?: number; // timestamp
  error?: string;
  result?: any; // Add result field for agent response
}

interface TaskProgress {
  taskId: string;
  agent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime?: number;
  estimatedCompletion?: number;
  result?: any;
  error?: string;
}

interface ExecutionStatus {
  planId: string;
  overallStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedTasks: number;
  totalTasks: number;
  tasks: TaskProgress[];
  startTime: number;
  estimatedCompletion?: number;
}

// Real agent clients - Call actual agent implementations
import { runFrontendAgentV2 as frontendAgent } from '../../frontend-v2/runners/run';
import { codeEditService } from '../../frontend-v2/services/code-edit-service';

class RealAgentClient {
  constructor(private agentName: string) {}

  async dispatchTask(task: Task): Promise<DispatchResult> {
    console.log(`📤 Dispatching task ${task.taskId} to ${this.agentName} agent`);
    
    try {
      const dispatchId = `${this.agentName}-${task.taskId}-${Date.now()}`;
      let result: any = null;
      
      // Call real agent based on agent name
      if (this.agentName === 'frontend') {
        // 🔧 Check if this is a code edit task
        if (task.action === 'edit_website' || task.action === 'update_content') {
          console.log('🔧 Routing to Code Edit Service...');
          result = await this.callCodeEditService(task);
        } else {
          // Transform task to frontend format for template system
          const frontendTask = await this.transformToFrontendTask(task);
          result = await frontendAgent(frontendTask);
        }
        
      } else if (this.agentName === 'backend') {
        console.log('⚙️ Calling Backend Agent...');
        
        // Transform task to backend format if needed
        const backendTask = this.transformToBackendTask(task);
        result = await this.callBackendAgent(backendTask);
        
      } else if (this.agentName === 'devops') {
        console.log('🚀 Calling DevOps Agent...');
        
        // Transform task to devops format if needed
        const devopsTask = this.transformToDevOpsTask(task);
        result = await this.callDevOpsAgent(devopsTask);
        
      } else {
        throw new Error(`Unknown agent: ${this.agentName}`);
      }
      
      return {
        success: result.success || false,
        dispatchId,
        result: result,
        estimatedCompletion: Date.now() + (task.estimatedDuration * 60 * 1000)
      };
      
    } catch (error) {
      console.error(`❌ Failed to dispatch task to ${this.agentName}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Transform Task to FrontendTaskV2 format for the new template system
   */
  private async transformToFrontendTask(task: Task): Promise<any> {
    const projectContext = task.payload.projectContext || null;
    
    // Map orchestrator actions to Frontend-V2 task types
    const taskTypeMap: Record<string, string> = {
      'select_template': 'generate_website',
      'customize_template': 'customize_component',
      'create_component': 'create_page',
      'update_styling': 'update_styling',
      'regenerate_content': 'regenerate_content',
      'create_preview': 'create_preview'
    };
    
    // Let Frontend-V2 handle business category detection
    
    // Extract keywords from user input
    const keywords = this.extractKeywords(task.payload?.userInput || '');
    
    // Let Frontend-V2 handle style detection internally
    
    return {
      taskId: task.taskId,
      taskType: taskTypeMap[task.action] || 'generate_website',
      // Let Frontend-V2 handle business category detection
      businessCategory: undefined,
      keywords: keywords,
      // Let Frontend-V2 handle customizations internally
      customizations: {},
      target: projectContext?.projectId || undefined,
      includePreview: true,
      validation: {
        enabled: true,
        strictMode: false,
        accessibilityLevel: 'AA'
      },
      aiSettings: {
        model: 'gpt-5-nano',
        temperature: 1,
        language: projectContext?.userPreferences?.language || 'th'
      },
      priority: 'medium',
      metadata: {
        userId: projectContext?.userId || 'orchestrator',
        projectId: projectContext?.projectId,
        timestamp: new Date().toISOString(),
        dependencies: [],
        tags: [projectContext?.projectType || 'default']
      }
    };
  }

  /**
   * Transform Task to BackendTask format with project context
   */
  private transformToBackendTask(task: Task): any {
    return {
      taskId: task.taskId,
      taskType: task.action,
      endpoint: this.extractEndpointName(task),
      requirements: {
        type: 'api',
        methods: ['GET', 'POST'],
        features: ['typescript', 'validation', 'error_handling'],
        database: 'postgresql',
        tests: true
      },
      // ✅ เพิ่ม project context data
      projectContext: task.payload.projectContext || null
    };
  }

  /**
   * Transform Task to DevOpsTask format with project context
   */
  private transformToDevOpsTask(task: Task): any {
    return {
      taskId: task.taskId,
      taskType: task.action,
      deployment: this.extractDeploymentTarget(task),
      requirements: {
        type: 'deployment',
        platform: 'vercel',
        features: ['ci_cd', 'monitoring', 'scaling'],
        environment: 'production',
        tests: true
      },
      // ✅ เพิ่ม project context data
      projectContext: task.payload.projectContext || null
    };
  }

  /**
   * Call Backend Agent (placeholder implementation)
   */
  private async callBackendAgent(backendTask: any): Promise<any> {
    // TODO: Implement actual backend agent call
    console.log('⚙️ Backend Agent not implemented yet, returning mock result');
    return {
      success: true,
      result: {
        endpoint: backendTask.endpoint,
        message: 'Backend task completed (mock)',
        components: [],
        pages: [],
        styling: null
      }
    };
  }

  /**
   * Call DevOps Agent (placeholder implementation)
   */
  private async callDevOpsAgent(devopsTask: any): Promise<any> {
    // TODO: Implement actual devops agent call
    console.log('🚀 DevOps Agent not implemented yet, returning mock result');
    return {
      success: true,
      result: {
        deployment: devopsTask.deployment,
        message: 'DevOps task completed (mock)',
        components: [],
        pages: [],
        styling: null
      }
    };
  }

  /**
   * 🔧 Call Code Edit Service - NEW!
   */
  private async callCodeEditService(task: Task): Promise<any> {
    try {
      console.log('🔧 Calling Code Edit Service...');
      
      const projectContext = task.payload.projectContext;
      if (!projectContext?.projectId) {
        throw new Error('Project ID is required for code edit');
      }
      
      // Get project data from database
      const prisma = (globalThis as any).prisma;
      const project = await prisma.project.findUnique({
        where: { id: projectContext.projectId },
        include: {
          files: true,
          generations: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          projectContext: {
            select: {
              projectType: true
            }
          }
        }
      });
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Prepare project data for code edit service
      const projectData = {
        projectId: project.id,
        userId: project.ownerId,  // ✅ เพิ่ม userId จาก project owner
        projectName: project.name,
        projectType: project.projectContext?.projectType || 'website',
        files: project.files,
        recentGeneration: project.generations[0]
      };
      
      // Call code edit service
      const editResult = await codeEditService.processEditRequest(
        task.payload.userInput || task.description,
        projectData,
        {
          intent: 'edit',
          parameters: task.payload.parameters || {}
        }
      );
      
      // Transform to standard result format
      return {
        success: editResult.success,
        result: {
          filesModified: editResult.filesModified,
          changes: editResult.changes,
          summary: editResult.summary,
          executionTime: editResult.executionTime,
          errors: editResult.errors
        }
      };
      
    } catch (error) {
      console.error('❌ Code Edit Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        result: {
          filesModified: [],
          changes: [],
          summary: 'Failed to edit code',
          executionTime: 0
        }
      };
    }
  }
  
  /**
   * Extract action from task - Updated for Template-First approach
   */
  private extractAction(task: Task): string {
    // Map task actions to frontend actions - Template-First approach
    const actionMap: Record<string, string> = {
      // Template-First Commands
      'select_template': 'select_template',
      'customize_template': 'customize_template',
      
      // Legacy website creation now maps to template selection
      'create_complete_website': 'select_template',
      'create_website': 'select_template',
      
      // Component commands
      'create_component': 'create_component',
      'update_component': 'update_component',
      'create_page': 'create_page',
      'update_styling': 'update_styling',
      'responsive_design': 'responsive_design',
      
      // Performance commands
      'performance_audit': 'performance_audit',
      'accessibility_check': 'accessibility_check'
    };
    
    return actionMap[task.action] || task.action;
  }

  /**
   * Extract customizations from project context - Minimal approach
   */
  private extractCustomizations(projectContext: any): any {
    if (!projectContext) return {};
    
    return {
      brandName: this.extractBrandName(projectContext),
      colorScheme: this.extractColorScheme(projectContext),
      layout: this.extractLayout(projectContext),
      language: projectContext.userPreferences?.language || 'th',
      theme: projectContext.userPreferences?.theme || 'light'
    };
  }

  /**
   * Extract keywords from user input for Frontend-V2
   */
  private extractKeywords(userInput: string): string[] {
    if (!userInput) return ['website'];
    
    // Enhanced keyword extraction
    const keywords = userInput
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['สร้าง', 'ทำ', 'ต้องการ', 'อยาก', 'ให้', 'เป็น', 'แบบ', 'สี', 'สไตล์', 'and', 'or', 'the', 'a', 'an'].includes(word))
      .slice(0, 40); // Limit to 40 keywords (optimal for AI processing)
    
    return keywords.length > 0 ? keywords : ['website'];
  }


  /**
   * Extract brand name from project context - Minimal approach
   */
  private extractBrandName(projectContext: any): string {
    // Try to extract from conversation history
    const context = projectContext.conversationHistory?.currentContext || '';
    const match = context.match(/ร้าน(.+?)(?:\s|$)/);
    if (match) {
      return match[1];
    }
    
    // Default based on project type
    const typeMap: Record<string, string> = {
      'coffee_shop': 'ร้านกาแฟ',
      'restaurant': 'ร้านอาหาร',
      'e_commerce': 'ร้านค้าออนไลน์'
    };
    
    return typeMap[projectContext.projectType] || 'เว็บไซต์';
  }

  /**
   * Extract color scheme from project context
   */
  private extractColorScheme(projectContext: any): string {
    const typeMap: Record<string, string> = {
      'coffee_shop': 'warm',
      'restaurant': 'warm',
      'e_commerce': 'modern',
      'portfolio': 'minimal'
    };
    
    return typeMap[projectContext.projectType] || 'default';
  }

  /**
   * Extract layout from project context
   */
  private extractLayout(projectContext: any): string {
    const typeMap: Record<string, string> = {
      'coffee_shop': 'modern',
      'restaurant': 'classic',
      'e_commerce': 'grid',
      'portfolio': 'minimal'
    };
    
    return typeMap[projectContext.projectType] || 'modern';
  }

  /**
   * Extract component name from task (legacy method)
   */
  private extractComponentName(task: Task): string {
    const description = task.description || '';
    const userInput = task.payload?.userInput || '';
    
    // Try to extract component name from description or user input
    const patterns = [
      /create\s+(\w+)/i,
      /สร้าง\s+(\w+)/i,
      /component\s+(\w+)/i,
      /(\w+)\s+component/i
    ];
    
    for (const pattern of patterns) {
      const match = (description + ' ' + userInput).match(pattern);
      if (match && match[1]) {
        return this.capitalizeFirstLetter(match[1]);
      }
    }
    
    return 'NewComponent';
  }
  
  /**
   * Extract endpoint name from task
   */
  private extractEndpointName(task: Task): string {
    if (task.payload?.endpoint) {
      return task.payload.endpoint;
    }
    
    const action = task.action.toLowerCase();
    if (action.includes('user')) return '/api/users';
    if (action.includes('auth')) return '/api/auth';
    if (action.includes('data')) return '/api/data';
    if (action.includes('file')) return '/api/files';
    
    return '/api/endpoint';
  }

  /**
   * Extract deployment target from task
   */
  private extractDeploymentTarget(task: Task): string {
    if (task.payload?.deployment) {
      return task.payload.deployment;
    }
    
    const action = task.action.toLowerCase();
    if (action.includes('vercel')) return 'vercel';
    if (action.includes('netlify')) return 'netlify';
    if (action.includes('aws')) return 'aws';
    if (action.includes('docker')) return 'docker';
    
    return 'vercel';
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async getTaskStatus(taskId: string): Promise<TaskProgress> {
    // Simulate task progress
    const progress = Math.floor(Math.random() * 100);
    const status = progress < 30 ? 'in_progress' : 
                  progress < 90 ? 'in_progress' : 'completed';
    
    return {
      taskId,
      agent: this.agentName,
      status,
      progress,
      startTime: Date.now() - 30000, // Started 30 seconds ago
      estimatedCompletion: Date.now() + 60000 // Complete in 1 minute
    };
  }
}

// Agent registry - using real agent clients
const agents = {
  frontend: new RealAgentClient('frontend'),
  backend: new RealAgentClient('backend'),
  devops: new RealAgentClient('devops')
};

/**
 * Dispatch a single task to appropriate agent
 */
export async function dispatchTask(task: Task): Promise<DispatchResult> {
  try {
    const agent = agents[task.agent];
    
    if (!agent) {
      throw new Error(`Unknown agent: ${task.agent}`);
    }
    
    return await agent.dispatchTask(task);
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Dispatch multiple tasks in parallel
 */
export async function dispatchParallelTasks(tasks: Task[]): Promise<{
  success: boolean;
  results: Array<{
    taskId: string;
    success: boolean;
    dispatchId?: string;
    error?: string;
  }>;
  error?: string;
}> {
  try {
    console.log(`🚀 Dispatching ${tasks.length} tasks in parallel`);
    
    const promises = tasks.map(async (task) => {
      const result = await dispatchTask(task);
      return {
        taskId: task.taskId,
        success: result.success,
        dispatchId: result.dispatchId,
        error: result.error
      };
    });
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`📊 Parallel dispatch completed: ${successCount}/${results.length} successful`);
    
    return {
      success: successCount === results.length,
      results
    };
    
  } catch (error) {
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Dispatch tasks following execution graph (DAG)
 */
export async function dispatchExecutionPlan(
  tasks: Task[],
  executionGraph: {
    parallel: string[][];
    sequential: string[];
  }
): Promise<{
  success: boolean;
  executionId: string;
  status: ExecutionStatus;
  error?: string;
}> {
  try {
    const executionId = `exec-${Date.now()}`;
    const startTime = Date.now();
    
    console.log(`🎯 Starting execution plan: ${executionId}`);
    
    const taskMap = new Map(tasks.map(t => [t.taskId, t]));
    const taskProgress: TaskProgress[] = tasks.map(task => ({
      taskId: task.taskId,
      agent: task.agent,
      status: 'pending',
      progress: 0
    }));
    
    // Execute parallel tasks first
    for (const parallelGroup of executionGraph.parallel) {
      const parallelTasks = parallelGroup
        .map(taskId => taskMap.get(taskId))
        .filter((task): task is Task => task !== undefined);
      
      if (parallelTasks.length > 0) {
        console.log(`⚡ Executing parallel group: ${parallelTasks.map(t => t.taskId).join(', ')}`);
        
        const parallelResults = await dispatchParallelTasks(parallelTasks);
        
        // Update task progress
        for (const result of parallelResults.results) {
          const taskProgressIndex = taskProgress.findIndex(tp => tp.taskId === result.taskId);
          if (taskProgressIndex >= 0) {
            taskProgress[taskProgressIndex].status = result.success ? 'in_progress' : 'failed';
            taskProgress[taskProgressIndex].startTime = Date.now();
          }
        }
      }
    }
    
    // Execute sequential tasks
    for (const taskId of executionGraph.sequential) {
      const task = taskMap.get(taskId);
      if (task) {
        console.log(`🔄 Executing sequential task: ${taskId}`);
        
        const result = await dispatchTask(task);
        
        const taskProgressIndex = taskProgress.findIndex(tp => tp.taskId === taskId);
        if (taskProgressIndex >= 0) {
          taskProgress[taskProgressIndex].status = result.success ? 'in_progress' : 'failed';
          taskProgress[taskProgressIndex].startTime = Date.now();
        }
      }
    }
    
    const status: ExecutionStatus = {
      planId: executionId,
      overallStatus: 'in_progress',
      completedTasks: 0,
      totalTasks: tasks.length,
      tasks: taskProgress,
      startTime
    };
    
    console.log(`✅ Execution plan dispatched successfully: ${executionId}`);
    
    return {
      success: true,
      executionId,
      status
    };
    
  } catch (error) {
    return {
      success: false,
      executionId: `failed-${Date.now()}`,
      status: {
        planId: 'failed',
        overallStatus: 'failed',
        completedTasks: 0,
        totalTasks: tasks.length,
        tasks: [],
        startTime: Date.now()
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Monitor execution progress
 */
export async function monitorExecution(executionId: string): Promise<ExecutionStatus> {
  try {
    console.log(`📊 Monitoring execution: ${executionId}`);
    
    // TODO: Implement actual execution monitoring
    // For now, return mock status
    
    return {
      planId: executionId,
      overallStatus: 'in_progress',
      completedTasks: 2,
      totalTasks: 5,
      tasks: [
        {
          taskId: 'task-1',
          agent: 'backend',
          status: 'completed',
          progress: 100,
          startTime: Date.now() - 120000, // Started 2 minutes ago
        },
        {
          taskId: 'task-2',
          agent: 'frontend',
          status: 'in_progress',
          progress: 65,
          startTime: Date.now() - 60000, // Started 1 minute ago
          estimatedCompletion: Date.now() + 30000 // Complete in 30 seconds
        }
      ],
      startTime: Date.now() - 180000 // Started 3 minutes ago
    };
    
  } catch (error) {
    throw new Error(`Failed to monitor execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export types for other modules
export type { Task, TaskProgress, ExecutionStatus, DispatchResult };