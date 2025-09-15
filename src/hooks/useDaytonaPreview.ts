// hooks/useDaytonaPreview.ts
'use client'

import { useState, useCallback } from 'react'

type Status = 'idle' | 'creating' | 'running' | 'stopped' | 'error'

export function useDaytonaPreview() {
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

  const startPreview = useCallback(async () => {
    setLoading(true)
    setStatus('creating')
    setError(undefined)
    try {
      const res = await fetch('/api/preview/daytona', { method: 'POST' })
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
  }, [])

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
