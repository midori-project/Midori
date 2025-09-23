/**
 * useProjectContextSync Hook
 * React hook for real-time project context synchronization
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface ProjectContextSyncEvent {
  type: 'connection_established' | 'project_context_updated' | 'heartbeat' | 'error';
  projectId: string;
  context?: any;
  timestamp: string;
}

export interface UseProjectContextSyncOptions {
  projectId: string;
  onUpdate?: (context: any) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export interface UseProjectContextSyncReturn {
  isConnected: boolean;
  context: any | null;
  error: string | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useProjectContextSync({
  projectId,
  onUpdate,
  onError,
  onConnect,
  onDisconnect,
  autoReconnect = true,
  reconnectInterval = 5000
}: UseProjectContextSyncOptions): UseProjectContextSyncReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [context, setContext] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnect = useRef(false);

  /**
   * Connect to SSE stream
   */
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log(`📡 Connecting to project context sync for ${projectId}`);
    
    const eventSource = new EventSource(`/api/project-context/sync?projectId=${projectId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`✅ Connected to project context sync for ${projectId}`);
      setIsConnected(true);
      setError(null);
      onConnect?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ProjectContextSyncEvent = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection_established':
            console.log(`📡 Connection established for project ${data.projectId}`);
            break;
            
          case 'project_context_updated':
            console.log(`📝 Project context updated for ${data.projectId}:`, data.context);
            setContext(data.context);
            onUpdate?.(data.context);
            break;
            
          case 'heartbeat':
            console.log(`💓 Heartbeat received for project ${data.projectId}`);
            break;
            
          default:
            console.warn(`⚠️ Unknown event type: ${data.type}`);
        }
      } catch (err) {
        console.error('❌ Error parsing SSE message:', err);
        setError('Failed to parse server message');
        onError?.('Failed to parse server message');
      }
    };

    eventSource.onerror = (event) => {
      console.error(`❌ SSE connection error for project ${projectId}:`, event);
      setIsConnected(false);
      setError('Connection error');
      onError?.('Connection error');
      
      // Auto-reconnect if enabled and not manually disconnected
      if (autoReconnect && !isManualDisconnect.current) {
        console.log(`🔄 Auto-reconnecting in ${reconnectInterval}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };
  }, [projectId, onUpdate, onError, onConnect, autoReconnect, reconnectInterval]);

  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    console.log(`📡 Disconnecting from project context sync for ${projectId}`);
    isManualDisconnect.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    onDisconnect?.();
  }, [projectId, onDisconnect]);

  /**
   * Reconnect to SSE stream
   */
  const reconnect = useCallback(() => {
    console.log(`🔄 Reconnecting to project context sync for ${projectId}`);
    isManualDisconnect.current = false;
    disconnect();
    setTimeout(connect, 100);
  }, [projectId, connect, disconnect]);

  // Connect on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [projectId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    context,
    error,
    reconnect,
    disconnect
  };
}
