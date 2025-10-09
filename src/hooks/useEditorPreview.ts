// hooks/useEditorPreview.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { editorPreviewService, EditorPreviewService } from '@/libs/services/editorPreviewService'

interface EditorPreviewData {
  sandboxId?: string
  previewUrl?: string
  previewToken?: string
  status: 'idle' | 'creating' | 'running' | 'stopped' | 'error'
  files?: Array<{
    path: string
    content: string
    type?: string
    language?: string
  }>
  error?: string
}

interface UseEditorPreviewOptions {
  projectId: string
  autoFetch?: boolean
  refreshInterval?: number
}

interface UseEditorPreviewReturn {
  data: EditorPreviewData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createPreview: (files?: Array<any>) => Promise<void>
  stopPreview: () => Promise<void>
}

/**
 * Hook สำหรับดึงข้อมูล preview จาก editor
 */
export function useEditorPreview({ 
  projectId, 
  autoFetch = true,
  refreshInterval 
}: UseEditorPreviewOptions): UseEditorPreviewReturn {
  const [data, setData] = useState<EditorPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ฟังก์ชันสำหรับดึงข้อมูล
  const fetchData = useCallback(async () => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await editorPreviewService.getProjectPreview(projectId)
      
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch preview data')
        setData(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setData(null)
      console.error('Error fetching editor preview:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // ฟังก์ชันสำหรับสร้าง preview
  const createPreview = useCallback(async (files?: Array<any>) => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await editorPreviewService.createPreview(projectId, files)
      
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to create preview')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error creating editor preview:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // ฟังก์ชันสำหรับหยุด preview
  const stopPreview = useCallback(async () => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await editorPreviewService.stopPreview(projectId)
      
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to stop preview')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error stopping editor preview:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Auto fetch เมื่อ component mount
  useEffect(() => {
    if (autoFetch && projectId) {
      fetchData()
    }
  }, [autoFetch, projectId, fetchData])

  // ตั้งค่า refresh interval
  useEffect(() => {
    if (!refreshInterval || !projectId) return

    const interval = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, projectId, fetchData])

  // ลงทะเบียน listener สำหรับการเปลี่ยนแปลงข้อมูลแบบ real-time
  useEffect(() => {
    if (!projectId) return

    const unsubscribe = editorPreviewService.subscribe(projectId, (newData) => {
      setData(newData)
      setError(null)
    })

    return unsubscribe
  }, [projectId])

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    createPreview,
    stopPreview,
  }
}

export default useEditorPreview
