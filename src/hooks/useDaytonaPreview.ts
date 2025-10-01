// hooks/useDaytonaPreview.ts
'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

type Status = 'idle' | 'creating' | 'running' | 'stopped' | 'error'

interface ProjectFile {
  path: string
  content: string
  type?: string
  language?: string
}

interface UseDaytonaPreviewProps {
  projectId?: string
  files?: ProjectFile[]
}

export function useDaytonaPreview({ projectId, files }: UseDaytonaPreviewProps = {}) {
  const [sandboxId, setSandboxId] = useState<string>()
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [previewToken, setPreviewToken] = useState<string>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  
  // Heartbeat tracking
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastHeartbeatRef = useRef<number>(0)
  const heartbeatAbortControllerRef = useRef<AbortController | null>(null)

  const previewUrlWithToken = useMemo(() => {
    if (!previewUrl) return undefined
    if (!previewToken) return previewUrl
    try {
      const u = new URL(previewUrl)
      u.searchParams.set('DAYTONA_SANDBOX_AUTH_KEY', previewToken)
      return u.toString()
    } catch {
      const sep = previewUrl.includes('?') ? '&' : '?'
      return `${previewUrl}${sep}DAYTONA_SANDBOX_AUTH_KEY=${encodeURIComponent(previewToken)}`
    }
  }, [previewUrl, previewToken])

  // Heartbeat function
  const sendHeartbeat = useCallback(async () => {
    // ป้องกันการยิง heartbeat ถ้าไม่ได้รันอยู่ หรือ interval ถูกยกเลิกแล้ว
    if (!sandboxId || status !== 'running') return

    try {
      console.log(`💓 [FRONTEND] Sending heartbeat for sandbox: ${sandboxId}`)
      // ยกเลิก request เก่าถ้ายังค้างอยู่
      if (heartbeatAbortControllerRef.current) {
        try { heartbeatAbortControllerRef.current.abort() } catch {}
      }
      const controller = new AbortController()
      heartbeatAbortControllerRef.current = controller

      const res = await fetch(
        `/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`,
        { signal: controller.signal }
      )
      if (res.ok) {
        lastHeartbeatRef.current = Date.now()
        console.log(`✅ [FRONTEND] Heartbeat successful for sandbox: ${sandboxId}`)
      } else {
        console.warn(`⚠️ [FRONTEND] Heartbeat failed for sandbox: ${sandboxId}`)
      }
    } catch (error) {
      console.error(`❌ [FRONTEND] Heartbeat error for sandbox: ${sandboxId}:`, error)
    } finally {
      // เคลียร์ controller หลังจบ
      heartbeatAbortControllerRef.current = null
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
      // ยกเลิก in-flight heartbeat ถ้ามี
      if (heartbeatAbortControllerRef.current) {
        try { heartbeatAbortControllerRef.current.abort() } catch {}
        heartbeatAbortControllerRef.current = null
        console.log('🛑 [FRONTEND] Heartbeat request aborted (not running)')
      }
    }

    // Cleanup on unmount - AUTO STOP SANDBOX
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
        console.log('🛑 [FRONTEND] Heartbeat interval cleared on unmount')
      }
      // ยกเลิก in-flight heartbeat เมื่อ unmount
      if (heartbeatAbortControllerRef.current) {
        try { heartbeatAbortControllerRef.current.abort() } catch {}
        heartbeatAbortControllerRef.current = null
        console.log('🛑 [FRONTEND] Heartbeat request aborted on unmount')
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

  // ✅ Load existing preview data when projectId changes
  // Note: Comment out if you don't have a backend endpoint for this
  // useEffect(() => {
  //   if (!projectId) return

  //   const loadExistingPreview = async () => {
  //     try {
  //       setLoading(true)
  //       // ดึงข้อมูล preview ที่มีอยู่แล้วจากฐานข้อมูล
  //       const res = await fetch(`/api/projects/${projectId}/preview`)
  //       if (res.ok) {
  //         const data = await res.json()
  //         if (data.previewUrl) {
  //           setSandboxId(data.sandboxId)
  //           setPreviewUrl(data.previewUrl)
  //           setPreviewToken(data.previewToken)
  //           setStatus(data.status || 'running')
  //         }
  //       }
  //     } catch (e) {
  //       console.log('No existing preview found for project:', projectId)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   loadExistingPreview()
  // }, [projectId])

  const startPreview = useCallback(async () => {
    // ✅ Validate required data
    if (!projectId) {
      setError('Project ID is required')
      setStatus('error')
      return
    }

    if (!files || files.length === 0) {
      setError('No files provided for preview')
      setStatus('error')
      return
    }

    setLoading(true)
    setStatus('creating')
    setError(undefined)
    
    console.log(`🚀 [FRONTEND] Starting preview creation with ${files.length} files...`)
    
    try {
      const res = await fetch('/api/preview/daytona', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId,
          files 
        })
      })
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
  }, [projectId, files])

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
