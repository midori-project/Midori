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

// Mock agent clients - In real implementation, these would be actual agent connections
class AgentClient {
  constructor(private agentName: string) {}

  async dispatchTask(task: Task): Promise<DispatchResult> {
    console.log(`📤 Dispatching task ${task.taskId} to ${this.agentName} agent`);
    
    try {
      // Simulate task dispatch
      const dispatchId = `${this.agentName}-${task.taskId}-${Date.now()}`;
      const estimatedCompletion = Date.now() + (task.estimatedDuration * 60 * 1000);
      
      // Simulate different response times for different agents
      const delay = this.agentName === 'frontend' ? 100 : 
                   this.agentName === 'backend' ? 200 : 300;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`✅ Task dispatched successfully: ${dispatchId}`);
      
      return {
        success: true,
        dispatchId,
        estimatedCompletion
      };
      
    } catch (error) {
      console.error(`❌ Failed to dispatch task to ${this.agentName}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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

// Agent registry
const agents = {
  frontend: new AgentClient('frontend'),
  backend: new AgentClient('backend'),
  devops: new AgentClient('devops')
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