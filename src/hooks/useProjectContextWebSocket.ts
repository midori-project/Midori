/**
 * useProjectContextWebSocket Hook
 * React hook for WebSocket-based project context synchronization
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'ping' | 'pong' | 'error';
  projectId?: string;
  updates?: any;
  context?: any;
  timestamp?: string;
}

export interface UseProjectContextWebSocketOptions {
  projectId: string;
  onUpdate?: (context: any) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  pingInterval?: number;
}

export interface UseProjectContextWebSocketReturn {
  isConnected: boolean;
  context: any | null;
  error: string | null;
  sendUpdate: (updates: any) => void;
  reconnect: () => void;
  disconnect: () => void;
}

export function useProjectContextWebSocket({
  projectId,
  onUpdate,
  onError,
  onConnect,
  onDisconnect,
  autoReconnect = true,
  reconnectInterval = 5000,
  pingInterval = 30000
}: UseProjectContextWebSocketOptions): UseProjectContextWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [context, setContext] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnect = useRef(false);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log(`🔌 Connecting to WebSocket for project ${projectId}`);
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/project-context/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ WebSocket connected for project ${projectId}`);
      setIsConnected(true);
      setError(null);
      
      // Subscribe to project updates
      sendMessage({
        type: 'subscribe',
        projectId,
        timestamp: new Date().toISOString()
      });
      
      onConnect?.();
      
      // Start ping interval
      startPingInterval();
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err);
        setError('Failed to parse server message');
        onError?.('Failed to parse server message');
      }
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket closed for project ${projectId}:`, event.code, event.reason);
      setIsConnected(false);
      stopPingInterval();
      
      onDisconnect?.();
      
      // Auto-reconnect if enabled and not manually disconnected
      if (autoReconnect && !isManualDisconnect.current && event.code !== 1000) {
        console.log(`🔄 Auto-reconnecting in ${reconnectInterval}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (event) => {
      console.error(`❌ WebSocket error for project ${projectId}:`, event);
      setError('WebSocket connection error');
      onError?.('WebSocket connection error');
    };
  }, [projectId, onUpdate, onError, onConnect, onDisconnect, autoReconnect, reconnectInterval]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'pong':
        if (message.context) {
          console.log(`📝 Project context received for ${message.projectId}:`, message.context);
          setContext(message.context);
          onUpdate?.(message.context);
        }
        break;
        
      default:
        console.log(`📨 WebSocket message received:`, message);
    }
  }, [onUpdate]);

  /**
   * Send message to WebSocket
   */
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }, []);

  /**
   * Send update to project context
   */
  const sendUpdate = useCallback((updates: any) => {
    console.log(`📝 Sending project context update for ${projectId}:`, updates);
    sendMessage({
      type: 'update',
      projectId,
      updates,
      timestamp: new Date().toISOString()
    });
  }, [projectId, sendMessage]);

  /**
   * Start ping interval
   */
  const startPingInterval = useCallback(() => {
    stopPingInterval();
    pingTimeoutRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({
          type: 'ping',
          projectId,
          timestamp: new Date().toISOString()
        });
      }
    }, pingInterval);
  }, [projectId, sendMessage, pingInterval]);

  /**
   * Stop ping interval
   */
  const stopPingInterval = useCallback(() => {
    if (pingTimeoutRef.current) {
      clearInterval(pingTimeoutRef.current);
      pingTimeoutRef.current = null;
    }
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    console.log(`🔌 Disconnecting WebSocket for project ${projectId}`);
    isManualDisconnect.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopPingInterval();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    onDisconnect?.();
  }, [projectId, onDisconnect, stopPingInterval]);

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(() => {
    console.log(`🔄 Reconnecting WebSocket for project ${projectId}`);
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
      if (pingTimeoutRef.current) {
        clearInterval(pingTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    context,
    error,
    sendUpdate,
    reconnect,
    disconnect
  };
}
