// hooks/useDaytonaPreview.ts
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

type Status = 'idle' | 'creating' | 'running' | 'stopped' | 'error'

export function useDaytonaPreview() {
  const [sandboxId, setSandboxId] = useState<string>()
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [previewToken, setPreviewToken] = useState<string>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  
  // Heartbeat tracking
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastHeartbeatRef = useRef<number>(0)

  const previewUrlWithToken =
    previewUrl && previewToken
      ? `${previewUrl}?DAYTONA_SANDBOX_AUTH_KEY=${encodeURIComponent(previewToken)}`
      : previewUrl

  // Heartbeat function
  const sendHeartbeat = useCallback(async () => {
    if (!sandboxId || status !== 'running') return

    try {
      console.log(`💓 [FRONTEND] Sending heartbeat for sandbox: ${sandboxId}`)
      const res = await fetch(`/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`)
      if (res.ok) {
        lastHeartbeatRef.current = Date.now()
        console.log(`✅ [FRONTEND] Heartbeat successful for sandbox: ${sandboxId}`)
      } else {
        console.warn(`⚠️ [FRONTEND] Heartbeat failed for sandbox: ${sandboxId}`)
      }
    } catch (error) {
      console.error(`❌ [FRONTEND] Heartbeat error for sandbox: ${sandboxId}:`, error)
    }
  }, [sandboxId, status])

  // Start heartbeat when sandbox is running
  useEffect(() => {
    if (status === 'running' && sandboxId) {
      console.log(`🔄 [FRONTEND] Starting heartbeat for sandbox: ${sandboxId}`)
      
      // Send initial heartbeat
      sendHeartbeat()
      
      // Set up interval (every 30 seconds)
      heartbeatIntervalRef.current = setInterval(() => {
        sendHeartbeat()
      }, 30000)
    } else {
      // Clear heartbeat when not running
      if (heartbeatIntervalRef.current) {
        console.log(`🛑 [FRONTEND] Stopping heartbeat for sandbox: ${sandboxId}`)
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
    }

    // Cleanup on unmount - AUTO STOP SANDBOX
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
      
      // Auto stop sandbox when leaving page
      if (sandboxId && status === 'running') {
        console.log(`🛑 [FRONTEND] Page unmount - Auto stopping sandbox: ${sandboxId}`)
        
        // Send DELETE request to stop sandbox immediately
        fetch(`/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`, {
          method: 'DELETE',
        }).catch(error => {
          console.error(`❌ [FRONTEND] Failed to auto-stop sandbox ${sandboxId}:`, error)
        })
      }
    }
  }, [status, sandboxId, sendHeartbeat])

  const startPreview = useCallback(async () => {
    setLoading(true)
    setStatus('creating')
    setError(undefined)
    
    console.log('🚀 [FRONTEND] Starting preview creation...')
    
    try {
      const res = await fetch('/api/preview/daytona', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create sandbox')

      console.log(`✅ [FRONTEND] Preview created successfully: ${data.sandboxId}`)
      
      setSandboxId(data.sandboxId)
      setPreviewUrl(data.url)
      setPreviewToken(data.token)
      setStatus('running')
      lastHeartbeatRef.current = Date.now()
    } catch (e: any) {
      console.error(`❌ [FRONTEND] Preview creation failed:`, e)
      setError(e?.message || 'Unexpected error')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [])

  const stopPreview = useCallback(async () => {
    if (!sandboxId) {
      console.log('🛑 [FRONTEND] No sandbox to stop')
      setStatus('idle')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      return
    }
    
    setLoading(true)
    console.log(`🛑 [FRONTEND] Stopping preview for sandbox: ${sandboxId}`)
    
    try {
      const res = await fetch(`/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to stop')
      }
      
      console.log(`✅ [FRONTEND] Preview stopped successfully: ${sandboxId}`)
      
      setStatus('stopped')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      setSandboxId(undefined)
      lastHeartbeatRef.current = 0
    } catch (e: any) {
      console.error(`❌ [FRONTEND] Preview stop failed:`, e)
      setError(e?.message || 'Unexpected error')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [sandboxId])

  return {
    sandboxId,
    status,
    previewUrl,
    previewToken,
    previewUrlWithToken,
    error,
    loading,
    startPreview,
    stopPreview,
    // Additional heartbeat info
    lastHeartbeat: lastHeartbeatRef.current,
    isHeartbeatActive: heartbeatIntervalRef.current !== null,
  }
}
