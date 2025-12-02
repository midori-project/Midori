/**
 * ProjectContextSync Component
 * React component for real-time project context synchronization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useProjectContextSync } from '@/hooks/useProjectContextSync';
import { useProjectContextWebSocket } from '@/hooks/useProjectContextWebSocket';

export interface ProjectContextSyncProps {
  projectId: string;
  syncMethod?: 'sse' | 'websocket' | 'both';
  onContextUpdate?: (context: any) => void;
  onError?: (error: string) => void;
  showStatus?: boolean;
  className?: string;
}

export function ProjectContextSync({
  projectId,
  syncMethod = 'sse',
  onContextUpdate,
  onError,
  showStatus = true,
  className = ''
}: ProjectContextSyncProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  // SSE hook
  const sseSync = useProjectContextSync({
    projectId,
    onUpdate: (context) => {
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      onContextUpdate?.(context);
    },
    onError: (error) => {
      console.error('SSE Error:', error);
      onError?.(error);
    },
    onConnect: () => {
      console.log('SSE Connected');
    },
    onDisconnect: () => {
      console.log('SSE Disconnected');
    }
  });

  // WebSocket hook
  const wsSync = useProjectContextWebSocket({
    projectId,
    onUpdate: (context) => {
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      onContextUpdate?.(context);
    },
    onError: (error) => {
      console.error('WebSocket Error:', error);
      onError?.(error);
    },
    onConnect: () => {
      console.log('WebSocket Connected');
    },
    onDisconnect: () => {
      console.log('WebSocket Disconnected');
    }
  });

  // Determine which sync to use
  const activeSync = syncMethod === 'websocket' ? wsSync : sseSync;
  const isConnected = activeSync.isConnected;
  const context = activeSync.context;
  const error = activeSync.error;

  // Update context when it changes
  useEffect(() => {
    if (context) {
      console.log('Project context updated:', context);
    }
  }, [context]);

  if (!showStatus) {
    return null;
  }

  return (
    <div className={`project-context-sync ${className}`}>
      <div className="sync-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="status-dot" />
          <span className="status-text">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {lastUpdate && (
          <div className="last-update">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
        
        <div className="update-count">
          Updates: {updateCount}
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
        
        <div className="sync-actions">
          <button
            onClick={activeSync.reconnect}
            disabled={isConnected}
            className="reconnect-btn"
          >
            Reconnect
          </button>
          
          <button
            onClick={activeSync.disconnect}
            disabled={!isConnected}
            className="disconnect-btn"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .project-context-sync {
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
          font-size: 14px;
        }
        
        .sync-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
        }
        
        .status-indicator.connected .status-dot {
          background: #4caf50;
          animation: pulse 2s infinite;
        }
        
        .status-indicator.disconnected .status-dot {
          background: #f44336;
        }
        
        .status-text {
          font-weight: 500;
        }
        
        .last-update,
        .update-count {
          color: #666;
          font-size: 12px;
        }
        
        .error-message {
          color: #f44336;
          font-size: 12px;
          background: #ffebee;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .sync-actions {
          display: flex;
          gap: 8px;
        }
        
        .reconnect-btn,
        .disconnect-btn {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
        }
        
        .reconnect-btn:disabled,
        .disconnect-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .reconnect-btn:hover:not(:disabled) {
          background: #e3f2fd;
        }
        
        .disconnect-btn:hover:not(:disabled) {
          background: #ffebee;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ProjectContextSync;
