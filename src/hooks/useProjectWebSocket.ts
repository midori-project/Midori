import { useEffect, useState } from 'react';

/**
 * Hook สำหรับจัดการ WebSocket connection สำหรับโปรเจค
 * 
 * @param projectId - ID ของโปรเจคที่ต้องการ subscribe
 * @param onUpdate - Callback function ที่จะถูกเรียกเมื่อมีการอัพเดทโปรเจค
 * @returns สถานะการเชื่อมต่อและ error
 * 
 * @example
 * ```tsx
 * const { isConnected, error } = useProjectWebSocket(projectId, () => {
 *   console.log('Project updated!');
 *   refetchData();
 * });
 * ```
 */
export function useProjectWebSocket(
  projectId: string,
  onUpdate: () => void
) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const wsUrl =
      process.env.NODE_ENV === 'production'
        ? `wss://${window.location.host}/api/project-context/ws`
        : `ws://localhost:3000/api/project-context/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🔌 WebSocket connected for project:', projectId);
      setIsConnected(true);
      setError(null);
      
      // Subscribe to project updates
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          projectId: projectId,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 WebSocket message received:', data);

        if (data.type === 'snapshot_created' || data.type === 'project_updated') {
          console.log('🔄 Snapshot detected, triggering update...');
          onUpdate();
        }
      } catch (err) {
        // Silent error - parsing issue
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
      setError('WebSocket connection failed');
    };

    return () => {
      ws.close();
    };
  }, [projectId, onUpdate]);

  return {
    isConnected,
    error,
  };
}

