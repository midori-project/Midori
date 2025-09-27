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
      console.log('🔄 [DAYTONA] Loading existing preview for project:', projectId);
      
      try {
        setLoading(true)
        // ดึงข้อมูล preview ที่มีอยู่แล้วจากฐานข้อมูล
        const res = await fetch(`/api/projects/${projectId}/preview`)
        
        console.log('📡 [DAYTONA] Load existing preview response status:', res.status);
        
        if (res.ok) {
          const data = await res.json()
          console.log('📄 [DAYTONA] Existing preview data:', data);
          
          if (data.previewUrl) {
            console.log('✅ [DAYTONA] Found existing preview, restoring state');
            setSandboxId(data.sandboxId)
            setPreviewUrl(data.previewUrl)
            setPreviewToken(data.previewToken)
            setStatus(data.status || 'running')
          } else {
            console.log('⚠️ [DAYTONA] No existing preview URL found');
          }
        } else {
          console.log('⚠️ [DAYTONA] Failed to load existing preview:', res.status);
        }
      } catch (e) {
        console.log('❌ [DAYTONA] No existing preview found for project:', projectId, e);
      } finally {
        setLoading(false)
        console.log('🏁 [DAYTONA] Load existing preview process finished');
      }
    }

    loadExistingPreview()
  }, [projectId])

  const startPreview = useCallback(async (files?: any[]) => {
    console.log('🚀 [DAYTONA] Starting preview creation...');
    console.log('🚀 [DAYTONA] Project ID:', projectId);
    console.log('🚀 [DAYTONA] Files provided:', files ? files.length : 'none');

    if (!projectId) {
      console.error('❌ [DAYTONA] Project ID is required');
      setError('Project ID is required')
      setStatus('error')
      return
    }

    setLoading(true)
    setStatus('creating')
    setError(undefined)
    
    try {
      console.log('📡 [DAYTONA] Sending request to Daytona API...');
      
      const requestBody: any = { projectId };
      
      // ถ้ามีไฟล์ให้ส่งไปด้วย
      if (files && files.length > 0) {
        requestBody.files = files;
        console.log('📁 [DAYTONA] Including files in request:', files.length, 'files');
      } else {
        console.log('⚠️ [DAYTONA] No files provided, will use default files');
      }

      const res = await fetch('/api/preview/daytona', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('📡 [DAYTONA] API response status:', res.status);
      
      const data = await res.json()
      console.log('📄 [DAYTONA] API response data:', data);
      
      if (!res.ok) {
        console.error('❌ [DAYTONA] API error:', data);
        throw new Error(data?.error || 'Failed to create sandbox')
      }

      console.log('✅ [DAYTONA] Sandbox created successfully');
      console.log('🌐 [DAYTONA] Preview URL:', data.url);
      console.log('🔑 [DAYTONA] Preview token:', data.token ? 'YES' : 'NO');

      setSandboxId(data.sandboxId)
      setPreviewUrl(data.url)
      setPreviewToken(data.token)
      setStatus('running')
      
      console.log('🎉 [DAYTONA] Preview setup completed');
    } catch (e: any) {
      console.error('❌ [DAYTONA] Preview creation failed:', e);
      setError(e?.message || 'Unexpected error')
      setStatus('error')
    } finally {
      setLoading(false)
      console.log('🏁 [DAYTONA] Preview creation process finished');
    }
  }, [projectId])

  const stopPreview = useCallback(async () => {
    console.log('🛑 [DAYTONA] Starting preview stop...');
    console.log('🛑 [DAYTONA] Sandbox ID:', sandboxId);

    if (!sandboxId) {
      console.log('⚠️ [DAYTONA] No sandbox ID, resetting state');
      setStatus('idle')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      return
    }
    
    setLoading(true)
    try {
      console.log('📡 [DAYTONA] Sending DELETE request to stop sandbox...');
      
      const res = await fetch(`/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`, {
        method: 'DELETE',
      })
      
      console.log('📡 [DAYTONA] Stop API response status:', res.status);
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('❌ [DAYTONA] Stop API error:', data);
        throw new Error(data?.error || 'Failed to stop')
      }
      
      console.log('✅ [DAYTONA] Sandbox stopped successfully');
      
      setStatus('stopped')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      setSandboxId(undefined)
      
      console.log('🎉 [DAYTONA] Preview stop completed');
    } catch (e: any) {
      console.error('❌ [DAYTONA] Preview stop failed:', e);
      setError(e?.message || 'Unexpected error')
      setStatus('error')
    } finally {
      setLoading(false)
      console.log('🏁 [DAYTONA] Preview stop process finished');
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
