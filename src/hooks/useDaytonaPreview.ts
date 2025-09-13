import { useState, useEffect, useCallback, useRef } from 'react';

interface SandboxState {
  sandboxId?: string;
  status: 'idle' | 'creating' | 'building' | 'running' | 'stopping' | 'error' | 'created';
  previewUrl?: string;
  previewToken?: string;
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
        body: JSON.stringify({}), // API ไม่รับ parameters
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

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

      // อัปเดตสถานะเป็น running ถ้ามี preview URL
      if (data.url && data.token) {
        setSandboxState(prev => ({
          ...prev,
          status: 'running',
          previewUrl: data.url,
          previewToken: data.token,
        }));
      } else {
        setSandboxState(prev => ({
          ...prev,
          status: 'created',
        }));
      }

    } catch (error: any) {
      console.error('Start preview error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Unknown error occurred';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSandboxState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
    } finally {
      setIsStarting(false);
    }
  }, [projectId, userId, sandboxState.usageToday, sandboxState.maxUsagePerDay, startUsageTracking]);

  // หยุดพรีวิว (simplified - ไม่มี API stop)
  const stopPreview = useCallback(async (silent = false) => {
    if (!sandboxState.sandboxId) return;

    if (!silent) setIsStopping(true);
    
    try {
      // หยุดติดตามการใช้งาน
      await stopUsageTracking(sandboxState.sandboxId);

      // รีเซ็ต state (ไม่มี API stop)
      setSandboxState(prev => ({
        ...prev,
        sandboxId: undefined,
        status: 'idle',
        previewUrl: undefined,
        previewToken: undefined,
        logs: undefined,
        error: undefined,
      }));

      // โหลดข้อมูลการใช้งานใหม่
      await loadUsageData();

    } catch (error: any) {
      if (!silent) {
        console.error('Stop preview error:', error);
        setSandboxState(prev => ({
          ...prev,
          error: `Failed to stop: ${error.message}`,
        }));
      }
    } finally {
      if (!silent) setIsStopping(false);
    }
  }, [sandboxState.sandboxId, stopUsageTracking, loadUsageData]);

  // ลบ polling function (ไม่มี status API)

  // Auto-stop เมื่อออกจากหน้าเว็บ (simplified)
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
