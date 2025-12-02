/**
 * Project Context Sync API
 * Server-Sent Events (SSE) endpoint for real-time project context updates
 */

import { NextRequest } from 'next/server';
import { projectContextStore } from '@/midori/agents/orchestrator/stores/projectContextStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) {
    return new Response('Missing projectId parameter', { status: 400 });
  }

  console.log(`📡 Starting SSE connection for project ${projectId}`);

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connection_established',
        projectId,
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Send current project context
      projectContextStore.getProjectContext(projectId).then(context => {
        if (context) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'project_context_updated',
            projectId,
            context,
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      });

      // Subscribe to project context changes
      const unsubscribe = projectContextStore.subscribe(projectId, (context) => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'project_context_updated',
            projectId,
            context,
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          console.error(`❌ Error sending SSE data for ${projectId}:`, error);
        }
      });

      // Handle connection close
      request.signal.addEventListener('abort', () => {
        console.log(`📡 SSE connection closed for project ${projectId}`);
        unsubscribe();
        controller.close();
      });

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'heartbeat',
            projectId,
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          unsubscribe();
          controller.close();
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, updates } = await request.json();
    
    if (!projectId || !updates) {
      return new Response('Missing projectId or updates', { status: 400 });
    }

    console.log(`📝 Updating project context for ${projectId}:`, updates);

    const updatedContext = await projectContextStore.updateProjectContext(projectId, updates);
    
    if (updatedContext) {
      return new Response(JSON.stringify({
        success: true,
        context: updatedContext,
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update project context'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('❌ Error updating project context:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
