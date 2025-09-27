/**
 * WebSocket Server for Project Context Sync
 * Real-time bidirectional communication for project context updates
 */

import { WebSocketServer, WebSocket } from 'ws';
import { projectContextSync } from '@/midori/agents/orchestrator/sync/projectContextSync';

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'ping' | 'pong';
  projectId?: string;
  updates?: any;
  timestamp?: string;
}

export class ProjectContextWebSocketServer {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, Set<WebSocket>> = new Map();

  constructor() {
    console.log('🔌 ProjectContextWebSocketServer initialized');
  }

  /**
   * Start WebSocket server
   */
  start(server: any): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/project-context/ws'
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('🔌 New WebSocket connection established');
      
      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle connection close
      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        this.removeConnection(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.removeConnection(ws);
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: 'pong',
        timestamp: new Date().toISOString()
      });
    });

    console.log('✅ WebSocket server started on /api/project-context/ws');
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(ws, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(ws, message);
        break;
      case 'update':
        this.handleUpdate(ws, message);
        break;
      case 'ping':
        this.handlePing(ws, message);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle subscribe message
   */
  private handleSubscribe(ws: WebSocket, message: WebSocketMessage): void {
    if (!message.projectId) {
      this.sendError(ws, 'Missing projectId for subscription');
      return;
    }

    console.log(`📡 Subscribing WebSocket to project ${message.projectId}`);
    
    // Add to connections map
    if (!this.connections.has(message.projectId)) {
      this.connections.set(message.projectId, new Set());
    }
    this.connections.get(message.projectId)!.add(ws);

    // Add to project context sync
    projectContextSync.addWebSocketConnection(message.projectId, ws as any);

    // Send confirmation
    this.sendMessage(ws, {
      type: 'pong',
      projectId: message.projectId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle unsubscribe message
   */
  private handleUnsubscribe(ws: WebSocket, message: WebSocketMessage): void {
    if (!message.projectId) {
      this.sendError(ws, 'Missing projectId for unsubscription');
      return;
    }

    console.log(`📡 Unsubscribing WebSocket from project ${message.projectId}`);
    
    // Remove from connections map
    const connections = this.connections.get(message.projectId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        this.connections.delete(message.projectId);
      }
    }

    // Remove from project context sync
    projectContextSync.removeWebSocketConnection(message.projectId, ws as any);

    // Send confirmation
    this.sendMessage(ws, {
      type: 'pong',
      projectId: message.projectId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle update message
   */
  private async handleUpdate(ws: WebSocket, message: WebSocketMessage): Promise<void> {
    if (!message.projectId || !message.updates) {
      this.sendError(ws, 'Missing projectId or updates for update');
      return;
    }

    try {
      console.log(`📝 WebSocket update for project ${message.projectId}:`, message.updates);
      
      // Update project context through store
      const { projectContextStore } = await import('@/midori/agents/orchestrator/stores/projectContextStore');
      const updatedContext = await projectContextStore.updateProjectContext(message.projectId, message.updates);
      
      if (updatedContext) {
        this.sendMessage(ws, {
          type: 'pong',
          projectId: message.projectId,
          timestamp: new Date().toISOString()
        });
      } else {
        this.sendError(ws, 'Failed to update project context');
      }
    } catch (error) {
      console.error('❌ Error handling WebSocket update:', error);
      this.sendError(ws, 'Update failed');
    }
  }

  /**
   * Handle ping message
   */
  private handlePing(ws: WebSocket, message: WebSocketMessage): void {
    this.sendMessage(ws, {
      type: 'pong',
      projectId: message.projectId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send message to WebSocket
   */
  private sendMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error message to WebSocket
   */
  private sendError(ws: WebSocket, error: string): void {
    this.sendMessage(ws, {
      type: 'pong',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Remove connection from all projects
   */
  private removeConnection(ws: WebSocket): void {
    for (const [projectId, connections] of this.connections) {
      if (connections.has(ws)) {
        connections.delete(ws);
        if (connections.size === 0) {
          this.connections.delete(projectId);
        }
        projectContextSync.removeWebSocketConnection(projectId, ws as any);
      }
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): { totalConnections: number; projects: Record<string, number> } {
    const projects: Record<string, number> = {};
    let totalConnections = 0;

    for (const [projectId, connections] of this.connections) {
      projects[projectId] = connections.size;
      totalConnections += connections.size;
    }

    return { totalConnections, projects };
  }

  /**
   * Stop WebSocket server
   */
  stop(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      console.log('🔌 WebSocket server stopped');
    }
  }
}

// Export singleton instance
export const projectContextWebSocketServer = new ProjectContextWebSocketServer();
