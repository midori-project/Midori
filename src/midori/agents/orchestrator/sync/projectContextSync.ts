/**
 * Project Context Sync
 * Real-time synchronization for project context changes
 * Handles WebSocket/SSE communication for live updates
 */

import { ProjectContextData } from '../types/projectContext';
import { projectContextStore } from '../stores/projectContextStore';

export type SyncEvent = {
  type: 'project_context_updated' | 'project_context_created' | 'project_context_deleted';
  projectId: string;
  context?: ProjectContextData;
  timestamp: string;
};

export class ProjectContextSync {
  private static instance: ProjectContextSync;
  private wsConnections: Map<string, Set<WebSocket>> = new Map();
  private sseConnections: Map<string, Set<Response>> = new Map();

  private constructor() {
    console.log('🔄 ProjectContextSync initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProjectContextSync {
    if (!ProjectContextSync.instance) {
      ProjectContextSync.instance = new ProjectContextSync();
    }
    return ProjectContextSync.instance;
  }

  /**
   * Add WebSocket connection for a project
   */
  addWebSocketConnection(projectId: string, ws: WebSocket): void {
    if (!this.wsConnections.has(projectId)) {
      this.wsConnections.set(projectId, new Set());
    }
    
    this.wsConnections.get(projectId)!.add(ws);
    console.log(`🔌 WebSocket connection added for project ${projectId}`);

    // Send current project context
    this.sendCurrentContext(projectId, ws);

    // Handle connection close
    ws.on('close', () => {
      this.removeWebSocketConnection(projectId, ws);
    });
  }

  /**
   * Remove WebSocket connection
   */
  removeWebSocketConnection(projectId: string, ws: WebSocket): void {
    const connections = this.wsConnections.get(projectId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.wsConnections.delete(projectId);
      }
    }
    console.log(`🔌 WebSocket connection removed for project ${projectId}`);
  }

  /**
   * Add SSE connection for a project
   */
  addSSEConnection(projectId: string, response: Response): void {
    if (!this.sseConnections.has(projectId)) {
      this.sseConnections.set(projectId, new Set());
    }
    
    this.sseConnections.get(projectId)!.add(response);
    console.log(`📡 SSE connection added for project ${projectId}`);

    // Send current project context
    this.sendCurrentContextSSE(projectId, response);
  }

  /**
   * Remove SSE connection
   */
  removeSSEConnection(projectId: string, response: Response): void {
    const connections = this.sseConnections.get(projectId);
    if (connections) {
      connections.delete(response);
      if (connections.size === 0) {
        this.sseConnections.delete(projectId);
      }
    }
    console.log(`📡 SSE connection removed for project ${projectId}`);
  }

  /**
   * Broadcast project context update to all subscribers
   */
  async broadcastUpdate(projectId: string, context: ProjectContextData): Promise<void> {
    const event: SyncEvent = {
      type: 'project_context_updated',
      projectId,
      context,
      timestamp: new Date().toISOString()
    };

    // Broadcast to WebSocket connections
    await this.broadcastToWebSockets(projectId, event);

    // Broadcast to SSE connections
    await this.broadcastToSSE(projectId, event);

    console.log(`📢 Project context update broadcasted for ${projectId}`);
  }

  /**
   * Broadcast project context creation
   */
  async broadcastCreation(projectId: string, context: ProjectContextData): Promise<void> {
    const event: SyncEvent = {
      type: 'project_context_created',
      projectId,
      context,
      timestamp: new Date().toISOString()
    };

    await this.broadcastToWebSockets(projectId, event);
    await this.broadcastToSSE(projectId, event);

    console.log(`📢 Project context creation broadcasted for ${projectId}`);
  }

  /**
   * Broadcast project context deletion
   */
  async broadcastDeletion(projectId: string): Promise<void> {
    const event: SyncEvent = {
      type: 'project_context_deleted',
      projectId,
      timestamp: new Date().toISOString()
    };

    await this.broadcastToWebSockets(projectId, event);
    await this.broadcastToSSE(projectId, event);

    console.log(`📢 Project context deletion broadcasted for ${projectId}`);
  }

  /**
   * Broadcast to WebSocket connections
   */
  private async broadcastToWebSockets(projectId: string, event: SyncEvent): Promise<void> {
    const connections = this.wsConnections.get(projectId);
    if (connections) {
      const message = JSON.stringify(event);
      const deadConnections: WebSocket[] = [];

      for (const ws of connections) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          } else {
            deadConnections.push(ws);
          }
        } catch (error) {
          console.error(`❌ Error sending WebSocket message for ${projectId}:`, error);
          deadConnections.push(ws);
        }
      }

      // Remove dead connections
      deadConnections.forEach(ws => {
        this.removeWebSocketConnection(projectId, ws);
      });
    }
  }

  /**
   * Broadcast to SSE connections
   */
  private async broadcastToSSE(projectId: string, event: SyncEvent): Promise<void> {
    const connections = this.sseConnections.get(projectId);
    if (connections) {
      const message = `data: ${JSON.stringify(event)}\n\n`;
      const deadConnections: Response[] = [];

      for (const response of connections) {
        try {
          // Check if response is still writable
          if (!response.writableEnded) {
            response.write(message);
          } else {
            deadConnections.push(response);
          }
        } catch (error) {
          console.error(`❌ Error sending SSE message for ${projectId}:`, error);
          deadConnections.push(response);
        }
      }

      // Remove dead connections
      deadConnections.forEach(response => {
        this.removeSSEConnection(projectId, response);
      });
    }
  }

  /**
   * Send current project context to WebSocket
   */
  private async sendCurrentContext(projectId: string, ws: WebSocket): Promise<void> {
    try {
      const context = await projectContextStore.getProjectContext(projectId);
      if (context) {
        const event: SyncEvent = {
          type: 'project_context_updated',
          projectId,
          context,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(event));
      }
    } catch (error) {
      console.error(`❌ Error sending current context to WebSocket for ${projectId}:`, error);
    }
  }

  /**
   * Send current project context to SSE
   */
  private async sendCurrentContextSSE(projectId: string, response: Response): Promise<void> {
    try {
      const context = await projectContextStore.getProjectContext(projectId);
      if (context) {
        const event: SyncEvent = {
          type: 'project_context_updated',
          projectId,
          context,
          timestamp: new Date().toISOString()
        };
        response.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (error) {
      console.error(`❌ Error sending current context to SSE for ${projectId}:`, error);
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    webSocket: { total: number; byProject: Record<string, number> };
    sse: { total: number; byProject: Record<string, number> };
  } {
    const wsStats = { total: 0, byProject: {} as Record<string, number> };
    const sseStats = { total: 0, byProject: {} as Record<string, number> };

    for (const [projectId, connections] of this.wsConnections) {
      wsStats.byProject[projectId] = connections.size;
      wsStats.total += connections.size;
    }

    for (const [projectId, connections] of this.sseConnections) {
      sseStats.byProject[projectId] = connections.size;
      sseStats.total += connections.size;
    }

    return { webSocket: wsStats, sse: sseStats };
  }
}

// Export singleton instance
export const projectContextSync = ProjectContextSync.getInstance();
