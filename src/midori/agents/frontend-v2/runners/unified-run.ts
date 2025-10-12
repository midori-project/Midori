/**
 * Unified Frontend-V2 Agent Runner
 * ✅ รองรับทั้ง Template-Based และ Component-Based
 */

import { TemplateAdapter } from '../adapters/template-adapter';
import { ComponentAdapter } from '../adapters/component-adapter';
import { FrontendTaskV2, ComponentResultV2 } from '../schemas/types';

export interface RunnerOptions {
  /**
   * บังคับใช้ Component-Based generation
   */
  useComponentBased?: boolean;
  
  /**
   * บังคับใช้ Template-Based generation
   */
  useTemplateBased?: boolean;
}

/**
 * Main Unified Runner Function
 */
export async function runFrontendAgentV2Unified(
  task: FrontendTaskV2,
  options: RunnerOptions = {}
): Promise<ComponentResultV2> {
  console.log('🚀 Starting Unified Frontend-V2 Agent...');
  console.log('📋 Task Details:', {
    taskId: task.taskId,
    taskType: task.taskType,
    businessCategory: task.businessCategory,
    keywords: task.keywords,
    options
  });

  try {
    // 1. Validate Task
    validateTask(task);

    // 2. Determine which adapter to use
    const useComponentBased = determineAdapter(task, options);

    if (useComponentBased) {
      console.log('✅ Using Component-Based Generation (Component Library)');
      return await runWithComponentAdapter(task);
    } else {
      console.log('✅ Using Template-Based Generation (Template System)');
      return await runWithTemplateAdapter(task);
    }

  } catch (error) {
    console.error('❌ Unified Frontend-V2 Agent Error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Return error result
    return createErrorResult(error as Error, task);
  }
}

/**
 * Run with Component Adapter
 */
async function runWithComponentAdapter(task: FrontendTaskV2): Promise<ComponentResultV2> {
  const adapter = new ComponentAdapter();
  console.log('🔧 Component Adapter initialized');

  const result = await adapter.generateFrontend(task);

  console.log('📈 Component Generation Results:', {
    success: result.success,
    filesGenerated: result.files.length,
    componentsUsed: result.result.blocksGenerated.length,
    executionTime: result.metadata.executionTime,
    totalSize: result.performance.totalSize
  });

  return result;
}

/**
 * Run with Template Adapter
 */
async function runWithTemplateAdapter(task: FrontendTaskV2): Promise<ComponentResultV2> {
  const adapter = new TemplateAdapter();
  console.log('🔧 Template Adapter initialized');

  // Log Template System Stats
  const stats = adapter.getTemplateSystemStats();
  console.log('📊 Template System Stats:', stats);

  const result = await adapter.generateFrontend(task);

  console.log('📈 Template Generation Results:', {
    success: result.success,
    filesGenerated: result.files.length,
    executionTime: result.metadata.executionTime,
    totalSize: result.performance.totalSize
  });

  return result;
}

/**
 * Determine which adapter to use
 */
function determineAdapter(task: FrontendTaskV2, options: RunnerOptions): boolean {
  // 1. Check explicit options
  if (options.useComponentBased === true) {
    console.log('🎯 Using Component-Based (explicitly requested)');
    return true;
  }

  if (options.useTemplateBased === true) {
    console.log('🎯 Using Template-Based (explicitly requested)');
    return false;
  }

  // 2. Check task customizations for component-based
  if (task.customizations?.theme) {
    console.log('🎯 Using Component-Based (from task customizations)');
    return true;
  }

  // 3. Auto-detect based on keywords
  const keywords = task.keywords.map(k => k.toLowerCase());
  
  const componentKeywords = [
    'component',
    'modern',
    'ทันสมัย',
    'โมเดิร์น',
    'responsive',
    'beautiful',
    'สวย',
    'creative',
    'unique',
    'สร้างสรรค์'
  ];

  const hasComponentKeywords = keywords.some(k => 
    componentKeywords.some(ck => k.includes(ck))
  );

  if (hasComponentKeywords) {
    console.log('🎯 Using Component-Based (detected from keywords:', keywords.filter(k => 
      componentKeywords.some(ck => k.includes(ck))
    ).join(', '), ')');
    return true;
  }

  // 4. Default to Template-Based for now (until Component Library is complete)
  console.log('🎯 Using Template-Based (default)');
  return false;
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

  // Validate required fields based on task type
  if (task.taskType === 'generate_website') {
    if (!task.businessCategory) {
      console.warn('⚠️ Business category not provided, will use default');
    }
  }
}

/**
 * Create error result
 */
function createErrorResult(error: Error, task: FrontendTaskV2): ComponentResultV2 {
  return {
    success: false,
    result: {
      businessCategory: task.businessCategory || 'unknown',
      projectType: task.projectType || 'vite-react-typescript',
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
      totalSize: '0 B'
    },
    validation: {
      isValid: false,
      errors: [{
        type: 'task_validation_error',
        message: error.message,
        file: '',
        line: 0
      }],
      warnings: [],
      accessibilityScore: 0,
      typescriptErrors: 0
    },
    metadata: {
      executionTime: 0,
      timestamp: new Date().toISOString(),
      agent: 'frontend-v2',
      version: '2.0.0'
    },
    error: {
      message: error.message,
      code: 'TASK_ERROR',
      details: error.stack || '',
      recoveryAttempted: false
    }
  };
}

// Re-export for backward compatibility
export { runFrontendAgentV2 } from './run';

