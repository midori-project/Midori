import { useState, useEffect, useCallback, useRef } from 'react';

interface SandboxState {
  sandboxId?: string;
  status: 'idle' | 'creating' | 'building' | 'running' | 'stopping' | 'error';
  previewUrl?: string;
  logs?: string[];
  error?: string;
  usageToday?: number;
  maxUsagePerDay?: number;
}

interface UsageDelta {
  startTime: number;
  lastRecorded: number;
}

export function useDaytonaPreview(projectId: string, userId?: string) {
  const [sandboxState, setSandboxState] = useState<SandboxState>({
    status: 'idle',
    usageToday: 0,
    maxUsagePerDay: 3600,
  });

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  
  // สำหรับติดตามการใช้งาน
  const usageRef = useRef<UsageDelta | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // โหลดข้อมูลการใช้งาน
  const loadUsageData = useCallback(async () => {
    if (!userId) return;
    
    try {
      const res = await fetch(`/api/preview/usage?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSandboxState(prev => ({
          ...prev,
          usageToday: data.usageToday ?? 0,
          maxUsagePerDay: data.maxUsagePerDay ?? 3600,
        }));
      }
    } catch (error) {
      console.warn('Failed to load usage data:', error);
    }
  }, [userId]);

  // เริ่มติดตามการใช้งาน
  const startUsageTracking = useCallback((sandboxId: string) => {
    const now = Date.now();
    usageRef.current = {
      startTime: now,
      lastRecorded: now,
    };

    // ส่ง heartbeat ทุก 30 วินาที และบันทึกการใช้งาน
    heartbeatIntervalRef.current = setInterval(async () => {
      if (!usageRef.current || !sandboxId) return;

      const now = Date.now();
      const deltaSeconds = Math.floor((now - usageRef.current.lastRecorded) / 1000);
      
      if (deltaSeconds > 0) {
        try {
          await fetch('/api/preview/usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sandboxId,
              userId,
              deltaSeconds,
            }),
          });
          
          usageRef.current.lastRecorded = now;
          
          // อัปเดตยอดใช้งานในหน้า
          setSandboxState(prev => ({
            ...prev,
            usageToday: (prev.usageToday ?? 0) + deltaSeconds,
          }));
          
        } catch (error) {
          console.warn('Failed to record usage:', error);
        }
      }
    }, 30000); // 30 วินาที
  }, [userId]);

  // หยุดติดตามการใช้งาน
  const stopUsageTracking = useCallback(async (sandboxId?: string) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // บันทึกช่วงสุดท้าย
    if (usageRef.current && sandboxId) {
      const now = Date.now();
      const deltaSeconds = Math.floor((now - usageRef.current.lastRecorded) / 1000);
      
      if (deltaSeconds > 0) {
        try {
          await fetch('/api/preview/usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sandboxId,
              userId,
              deltaSeconds,
            }),
          });
        } catch (error) {
          console.warn('Failed to record final usage:', error);
        }
      }
    }
    
    usageRef.current = null;
  }, [userId]);

  // เริ่มพรีวิว
  const startPreview = useCallback(async (promptJson?: Record<string, unknown>) => {
    setIsStarting(true);
    
    try {
      // ตรวจสอบโควตาก่อน
      if ((sandboxState.usageToday ?? 0) >= (sandboxState.maxUsagePerDay ?? 3600)) {
        throw new Error('คุณใช้เวลาพรีวิวครบโควตาวันนี้แล้ว (1 ชั่วโมง)');
      }

      setSandboxState(prev => ({ ...prev, status: 'creating', error: undefined }));

      const res = await fetch('/api/preview/daytona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId, 
          promptJson,
          userId 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create preview');
      }

      setSandboxState(prev => ({
        ...prev,
        sandboxId: data.sandboxId,
        status: 'building',
        logs: data.logs || [],
      }));

      // เริ่มติดตามการใช้งาน
      startUsageTracking(data.sandboxId);

      // เริ่ม polling สถานะ
      pollSandboxStatus(data.sandboxId);

    } catch (error: any) {
      setSandboxState(prev => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));
    } finally {
      setIsStarting(false);
    }
  }, [projectId, userId, sandboxState.usageToday, sandboxState.maxUsagePerDay, startUsageTracking]);

  // หยุดพรีวิว
  const stopPreview = useCallback(async (silent = false) => {
    if (!sandboxState.sandboxId) return;

    if (!silent) setIsStopping(true);
    
    try {
      // หยุดติดตามการใช้งานก่อน
      await stopUsageTracking(sandboxState.sandboxId);

      await fetch('/api/preview/daytona/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxId: sandboxState.sandboxId }),
        keepalive: silent, // ใช้ keepalive เมื่อ silent stop
      });

      setSandboxState(prev => ({
        ...prev,
        sandboxId: undefined,
        status: 'idle',
        previewUrl: undefined,
        logs: undefined,
      }));

      // โหลดข้อมูลการใช้งานใหม่
      await loadUsageData();

    } catch (error: any) {
      if (!silent) {
        setSandboxState(prev => ({
          ...prev,
          error: `Failed to stop: ${error.message}`,
        }));
      }
    } finally {
      if (!silent) setIsStopping(false);
    }
  }, [sandboxState.sandboxId, stopUsageTracking, loadUsageData]);

  // Polling สถานะ sandbox
  const pollSandboxStatus = useCallback(async (sandboxId: string) => {
    const maxAttempts = 30; // 5 นาที
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setSandboxState(prev => ({
          ...prev,
          status: 'error',
          error: 'Timeout: Preview creation took too long',
        }));
        return;
      }

      try {
        const res = await fetch(`/api/preview/daytona/status?sandboxId=${sandboxId}`);
        const data = await res.json();

        if (res.ok) {
          setSandboxState(prev => ({
            ...prev,
            status: data.status,
            previewUrl: data.previewUrl,
            logs: data.logs || prev.logs,
          }));

          if (data.status === 'running' && data.previewUrl) {
            // พรีวิวพร้อมใช้งาน
            return;
          } else if (data.status === 'error') {
            setSandboxState(prev => ({
              ...prev,
              error: data.error || 'Sandbox failed',
            }));
            return;
          }
        }

        // ยังไม่เสร็จ ต่อ polling
        attempts++;
        setTimeout(poll, 10000); // 10 วินาที
      } catch (error) {
        attempts++;
        setTimeout(poll, 10000);
      }
    };

    poll();
  }, []);

  // Auto-stop เมื่อผู้ใช้ออกจากหน้า
  useEffect(() => {
    if (!sandboxState.sandboxId || sandboxState.status !== 'running') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPreview(true); // silent stop
      }
    };

    const handleBeforeUnload = () => {
      if (sandboxState.sandboxId) {
        stopPreview(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sandboxState.sandboxId, sandboxState.status, stopPreview]);

  // โหลดข้อมูลการใช้งานเมื่อเริ่มต้น
  useEffect(() => {
    loadUsageData();
  }, [loadUsageData]);

  // ทำความสะอาดเมื่อ unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  return {
    sandboxState,
    isStarting,
    isStopping,
    startPreview,
    stopPreview,
    loadUsageData,
  };
}
