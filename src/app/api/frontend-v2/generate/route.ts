import { NextRequest, NextResponse } from 'next/server';
import { runFrontendAgentV2 } from '@/midori/agents/frontend-v2/runners/run';
import { FrontendTaskV2 } from '@/midori/agents/frontend-v2/schemas/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.taskId || !body.taskType) {
      return NextResponse.json(
        { 
          success: false, 
          error: { message: 'Missing required fields: taskId, taskType' } 
        },
        { status: 400 }
      );
    }

    // Create task
    const task: FrontendTaskV2 = {
      taskId: body.taskId,
      taskType: body.taskType,
      businessCategory: body.businessCategory || 'restaurant',
      keywords: body.keywords || [],
      customizations: body.customizations,
      target: body.target,
      includePreview: body.includePreview ?? false,
      includeProjectStructure: body.includeProjectStructure ?? true,
      validation: body.validation || {
        enabled: true,
        strictMode: false,
        accessibilityLevel: 'AA'
      },
      aiSettings: body.aiSettings || {
        model: 'gpt-5-nano',
        temperature: 1,
        language: 'th'
      },
      priority: body.priority || 'medium',
      metadata: body.metadata
    };

    console.log('🚀 Starting Frontend-V2 generation:', {
      taskId: task.taskId,
      businessCategory: task.businessCategory,
      keywords: task.keywords
    });

    // Run Frontend-V2 Agent
    const result = await runFrontendAgentV2(task);

    console.log('✅ Frontend-V2 generation completed:', {
      success: result.success,
      filesGenerated: result.files?.length || 0
    });

    // Return result
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Frontend-V2 API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'API_ERROR',
          details: error instanceof Error ? error.stack : String(error)
        }
      },
      { status: 500 }
    );
  }
}

// GET endpoint สำหรับ health check
export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      service: 'frontend-v2-api',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

