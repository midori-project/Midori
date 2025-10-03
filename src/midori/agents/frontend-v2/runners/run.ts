/**
 * Frontend-V2 Agent Runner
 * ใช้ Template System สำหรับการสร้างเว็บไซต์
 */

import { TemplateAdapter } from '../adapters/template-adapter';
import { FrontendTaskV2, ComponentResultV2 } from '../schemas/types';

/**
 * Main Runner Function
 */
export async function runFrontendAgentV2(task: FrontendTaskV2): Promise<ComponentResultV2> {
  console.log('🚀 Starting Frontend-V2 Agent...');
  console.log('📋 Task Details:', {
    taskId: task.taskId,
    taskType: task.taskType,
    businessCategory: task.businessCategory,
    keywords: task.keywords
  });

  try {
    // 1. Validate Task
    validateTask(task);

    // 2. Initialize Template Adapter
    const adapter = new TemplateAdapter();
    console.log('✅ Template Adapter initialized');

    // 3. Log Template System Stats
    const stats = adapter.getTemplateSystemStats();
    console.log('📊 Template System Stats:', stats);

    // 4. Generate Frontend
    const result = await adapter.generateFrontend(task);

    // 5. Log Results
    console.log('📈 Generation Results:', {
      success: result.success,
      filesGenerated: result.files.length,
      executionTime: result.metadata.executionTime,
      totalSize: result.performance.totalSize
    });

    return result;

  } catch (error) {
    console.error('❌ Frontend-V2 Agent Error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Return error result
    return createErrorResult(error as Error, task);
  }
}

/**
 * Validate Frontend Task
 */
function validateTask(task: FrontendTaskV2): void {
  if (!task.taskId) {
    throw new Error('Task ID is required');
  }

  if (!task.taskType) {
    throw new Error('Task type is required');
  }

  if (!task.businessCategory && (!task.keywords || task.keywords.length === 0)) {
    throw new Error('Either business category or keywords must be provided');
  }

  if (task.keywords && task.keywords.length === 0) {
    throw new Error('Keywords array cannot be empty');
  }

  // Validate business category
  const validCategories = ['restaurant', 'ecommerce', 'portfolio', 'healthcare', 'education', 'real_estate'];
  if (task.businessCategory && !validCategories.includes(task.businessCategory)) {
    throw new Error(`Invalid business category: ${task.businessCategory}. Valid categories: ${validCategories.join(', ')}`);
  }

  // Validate task type
  const validTaskTypes = ['generate_website', 'customize_component', 'create_page', 'update_styling', 'regenerate_content', 'create_preview'];
  if (!validTaskTypes.includes(task.taskType)) {
    throw new Error(`Invalid task type: ${task.taskType}. Valid types: ${validTaskTypes.join(', ')}`);
  }

  console.log('✅ Task validation passed');
}

/**
 * Create Error Result
 */
function createErrorResult(error: Error, task: FrontendTaskV2): ComponentResultV2 {
  const timestamp = new Date().toISOString();
  
  return {
    success: false,
    result: {
      businessCategory: task.businessCategory || 'unknown',
      projectType: 'e_commerce', // Default fallback
      templateUsed: 'none',
      blocksGenerated: [],
      aiContentGenerated: false,
      customizationsApplied: [],
      overridesApplied: []
    },
    files: [],
    performance: {
      generationTime: 0,
      templateRenderingTime: 0,
      aiGenerationTime: 0,
      totalFiles: 0,
      totalSize: '0B'
    },
    validation: {
      isValid: false,
      errors: [{
        type: 'validation_error',
        message: error.message,
        file: 'task_validation',
        line: 0
      }],
      warnings: [],
      accessibilityScore: 0,
      typescriptErrors: 0
    },
    metadata: {
      executionTime: 0,
      timestamp,
      agent: 'frontend-v2',
      version: '2.0.0'
    },
    error: {
      message: error.message,
      code: 'TASK_VALIDATION_ERROR',
      details: error.stack || 'Unknown error',
      recoveryAttempted: false
    }
  };
}

/**
 * Batch Processing Function
 */
export async function runBatchFrontendAgentV2(tasks: FrontendTaskV2[]): Promise<ComponentResultV2[]> {
  console.log(`🚀 Starting batch processing for ${tasks.length} tasks...`);

  const results: ComponentResultV2[] = [];
  const adapter = new TemplateAdapter();

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task) continue;
    
    console.log(`📋 Processing task ${i + 1}/${tasks.length}: ${task.taskId}`);

    try {
      const result = await adapter.generateFrontend(task);
      results.push(result);
      console.log(`✅ Task ${i + 1} completed successfully`);
    } catch (error) {
      console.error(`❌ Task ${i + 1} failed:`, error);
      results.push(createErrorResult(error as Error, task));
    }

    // Add small delay between tasks to prevent rate limiting
    if (i < tasks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`🎉 Batch processing completed: ${results.filter(r => r.success).length}/${tasks.length} successful`);
  return results;
}

/**
 * Health Check Function
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  templateSystem: {
    available: boolean;
    sharedBlocksCount: number;
    businessCategoriesCount: number;
  };
  agent: {
    version: string;
    status: string;
  };
}> {
  try {
    const adapter = new TemplateAdapter();
    const stats = adapter.getTemplateSystemStats();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      templateSystem: {
        available: true,
        sharedBlocksCount: stats.sharedBlocksCount,
        businessCategoriesCount: stats.businessCategoriesCount
      },
      agent: {
        version: '2.0.0',
        status: 'running'
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      templateSystem: {
        available: false,
        sharedBlocksCount: 0,
        businessCategoriesCount: 0
      },
      agent: {
        version: '2.0.0',
        status: 'error'
      }
    };
  }
}

/**
 * Get Available Templates
 */
export function getAvailableTemplates(): {
  sharedBlocks: Array<{ id: string; name: string; category: string }>;
  businessCategories: Array<{ id: string; name: string; description: string }>;
} {
  const adapter = new TemplateAdapter();
  const stats = adapter.getTemplateSystemStats();

  return {
    sharedBlocks: stats.availableBlocks.map(id => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      category: 'component'
    })),
    businessCategories: stats.availableCategories.map(id => ({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: `Template for ${id} business category`
    }))
  };
}

// Export types for external use
export type { FrontendTaskV2, ComponentResultV2 } from '../schemas/types';
