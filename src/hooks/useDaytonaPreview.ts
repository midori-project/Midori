// hooks/useDaytonaPreview.ts
'use client'

import { useState, useCallback, useEffect } from 'react'

type Status = 'idle' | 'creating' | 'running' | 'stopped' | 'error'

interface UseDaytonaPreviewProps {
  projectId?: string
}

export function useDaytonaPreview({ projectId }: UseDaytonaPreviewProps = {}) {
  const [sandboxId, setSandboxId] = useState<string>()
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [previewToken, setPreviewToken] = useState<string>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const previewUrlWithToken =
    previewUrl && previewToken
      ? `${previewUrl}?DAYTONA_SANDBOX_AUTH_KEY=${encodeURIComponent(previewToken)}`
      : previewUrl

  // ✅ Load existing preview data when projectId changes
  useEffect(() => {
    if (!projectId) return

    const loadExistingPreview = async () => {
      try {
        setLoading(true)
        // ดึงข้อมูล preview ที่มีอยู่แล้วจากฐานข้อมูล
        const res = await fetch(`/api/projects/${projectId}/preview`)
        if (res.ok) {
          const data = await res.json()
          if (data.previewUrl) {
            setSandboxId(data.sandboxId)
            setPreviewUrl(data.previewUrl)
            setPreviewToken(data.previewToken)
            setStatus(data.status || 'running')
          }
        }
      } catch (e) {
        console.log('No existing preview found for project:', projectId)
      } finally {
        setLoading(false)
      }
    }

    loadExistingPreview()
  }, [projectId])

  const startPreview = useCallback(async () => {
    if (!projectId) {
      setError('Project ID is required')
      setStatus('error')
      return
    }

    setLoading(true)
    setStatus('creating')
    setError(undefined)
    try {
      const res = await fetch('/api/preview/daytona', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create sandbox')

      setSandboxId(data.sandboxId)
      setPreviewUrl(data.url)
      setPreviewToken(data.token)
      setStatus('running')
    } catch (e: any) {
      setError(e?.message || 'Unexpected error')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const stopPreview = useCallback(async () => {
    if (!sandboxId) {
      setStatus('idle')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to stop')
      }
      setStatus('stopped')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      setSandboxId(undefined)
    } catch (e: any) {
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
  }
}
