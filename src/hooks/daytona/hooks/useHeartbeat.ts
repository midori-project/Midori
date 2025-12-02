// hooks/useHeartbeat.ts
import { useCallback, useEffect, useRef } from 'react'
import { Status } from '../types/preview'
import { DaytonaApiService } from '../services/DaytonaApiService'
import { HEARTBEAT_CONFIG } from '../utils/constants'

export function useHeartbeat(sandboxId?: string, status?: Status) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastHeartbeatRef = useRef<number>(0)
  const apiServiceRef = useRef<DaytonaApiService>(new DaytonaApiService())

  /**
   * Send heartbeat to keep sandbox alive
   */
  const sendHeartbeat = useCallback(async (): Promise<void> => {
    // Don't send heartbeat if not running or no sandboxId
    if (!sandboxId || status !== 'running') return

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        try { 
          abortControllerRef.current.abort() 
        } catch {}
      }

      // Create new abort controller
      const controller = new AbortController()
      abortControllerRef.current = controller

      // Send heartbeat
      await apiServiceRef.current.sendHeartbeat(sandboxId, controller.signal)
      lastHeartbeatRef.current = Date.now()
      console.log(`✅ [HEARTBEAT] Successful for sandbox: ${sandboxId}`)
      
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error(`❌ [HEARTBEAT] Error for sandbox: ${sandboxId}:`, error)
      }
    } finally {
      // Clear controller reference
      abortControllerRef.current = null
    }
  }, [sandboxId, status])

  /**
   * Start heartbeat interval
   */
  const startHeartbeat = useCallback((): void => {
    if (intervalRef.current) return // Already running

    console.log(`🔄 [HEARTBEAT] Starting for sandbox: ${sandboxId}`)
    
    // Send initial heartbeat
    sendHeartbeat()
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      sendHeartbeat()
    }, HEARTBEAT_CONFIG.interval)
  }, [sandboxId, sendHeartbeat])

  /**
   * Stop heartbeat interval
   */
  const stopHeartbeat = useCallback((): void => {
    if (intervalRef.current) {
      console.log(`🛑 [HEARTBEAT] Stopping for sandbox: ${sandboxId}`)
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Cancel any pending heartbeat request
    if (abortControllerRef.current) {
      try { 
        abortControllerRef.current.abort() 
      } catch {}
      abortControllerRef.current = null
      console.log('🛑 [HEARTBEAT] Request aborted')
    }
  }, [sandboxId])

  /**
   * Auto-stop sandbox when component unmounts
   */
  const autoStopSandbox = useCallback(async (): Promise<void> => {
    if (sandboxId && status === 'running') {
      console.log(`🛑 [HEARTBEAT] Page unmount - Auto stopping sandbox: ${sandboxId}`)
      
      try {
        await apiServiceRef.current.deleteSandbox(sandboxId)
      } catch (error) {
        console.error(`❌ [HEARTBEAT] Failed to auto-stop sandbox ${sandboxId}:`, error)
      }
    }
  }, [sandboxId, status])

  /**
   * Effect to manage heartbeat lifecycle
   */
  useEffect(() => {
    if (status === 'running' && sandboxId) {
      startHeartbeat()
    } else {
      stopHeartbeat()
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      stopHeartbeat()
      
      // Auto-stop sandbox when leaving page
      autoStopSandbox()
    }
  }, [status, sandboxId, startHeartbeat, stopHeartbeat, autoStopSandbox])

  /**
   * Get heartbeat status information
   */
  const getHeartbeatInfo = useCallback(() => {
    return {
      lastHeartbeat: lastHeartbeatRef.current,
      isActive: intervalRef.current !== null,
      timeSinceLastHeartbeat: lastHeartbeatRef.current ? Date.now() - lastHeartbeatRef.current : 0,
      intervalMs: HEARTBEAT_CONFIG.interval,
    }
  }, [])

  /**
   * Force send a heartbeat immediately
   */
  const forceHeartbeat = useCallback(async (): Promise<void> => {
    console.log(`⚡ [HEARTBEAT] Force sending heartbeat for sandbox: ${sandboxId}`)
    await sendHeartbeat()
  }, [sendHeartbeat, sandboxId])

  return {
    lastHeartbeat: lastHeartbeatRef.current,
    isHeartbeatActive: intervalRef.current !== null,
    getHeartbeatInfo,
    forceHeartbeat,
    sendHeartbeat,
    startHeartbeat,
    stopHeartbeat,
    autoStopSandbox,
  }
}

