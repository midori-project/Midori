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

interface FileState {
  path: string
  content: string
  hash: string
  lastModified: number
  size: number
}

interface FileComparison {
  hasChanged: boolean
  changeType: 'added' | 'removed' | 'modified' | 'unchanged'
  oldState?: FileState
  newState: FileState
}

interface UpdateResult {
  success: boolean
  updatedFiles: number
  totalFiles: number
  skippedFiles: number
  message: string
  error?: string
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
  
  // Request debouncing to prevent rate limiting
  const lastRequestRef = useRef<number>(0)
  const requestDebounceMs = 1000 // 1 second debounce
  
  // File state management for comparison
  const fileStatesRef = useRef<Map<string, FileState>>(new Map())
  
  // Preview cache management
  const previewCacheRef = useRef<{
    sandboxId?: string
    previewUrl?: string
    previewToken?: string
    filesHash?: string
    lastUpdated?: number
  }>({})

  // Load cache from localStorage on mount
  useEffect(() => {
    if (projectId) {
      const cacheKey = `preview-cache-${projectId}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const cacheData = JSON.parse(cached)
          previewCacheRef.current = cacheData
          console.log(`💾 [CACHE] Loaded cache from localStorage for project: ${projectId}`)
        } catch (error) {
          console.warn(`⚠️ [CACHE] Failed to parse cache from localStorage:`, error)
        }
      }
    }
  }, [projectId])

  // File Comparison utilities
  const generateHash = useCallback((content: string): string => {
    // Simple hash function for client-side (in production, use crypto.subtle.digest)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }, [])

  const createFileState = useCallback((path: string, content: string): FileState => {
    return {
      path,
      content,
      hash: generateHash(content),
      lastModified: Date.now(),
      size: content.length
    }
  }, [generateHash])

  const compareFiles = useCallback((path: string, newContent: string): FileComparison => {
    const oldState = fileStatesRef.current.get(path)
    const newState = createFileState(path, newContent)
    
    if (!oldState) {
      return { hasChanged: true, changeType: 'added', newState }
    }
    
    if (oldState.hash === newState.hash) {
      return { hasChanged: false, changeType: 'unchanged', oldState, newState }
    }
    
    return { hasChanged: true, changeType: 'modified', oldState, newState }
  }, [createFileState])

  const updateFileState = useCallback((path: string, content: string) => {
    const newState = createFileState(path, content)
    fileStatesRef.current.set(path, newState)
    return newState
  }, [createFileState])

  // Cache validation utilities
  const generateFilesHash = useCallback((files: ProjectFile[]): string => {
    const filesContent = files
      .sort((a, b) => a.path.localeCompare(b.path))
      .map(f => `${f.path}:${f.content}`)
      .join('|')
    return generateHash(filesContent)
  }, [generateHash])

  const isCacheValid = useCallback((files: ProjectFile[]): boolean => {
    const cache = previewCacheRef.current
    if (!cache.sandboxId || !cache.previewUrl || !cache.filesHash) {
      return false
    }

    const currentFilesHash = generateFilesHash(files)
    const isHashMatch = cache.filesHash === currentFilesHash
    const isRecent = cache.lastUpdated ? (Date.now() - cache.lastUpdated) < 300000 : false // 5 minutes

    console.log(`🔍 [CACHE] Validation: hash=${isHashMatch}, recent=${isRecent}, cacheAge=${cache.lastUpdated ? Date.now() - cache.lastUpdated : 'unknown'}ms`)
    return isHashMatch && isRecent
  }, [generateFilesHash])

  const updateCache = useCallback((sandboxId: string, previewUrl: string, previewToken: string, files: ProjectFile[]) => {
    const cacheData = {
      sandboxId,
      previewUrl,
      previewToken,
      filesHash: generateFilesHash(files),
      lastUpdated: Date.now()
    }
    
    previewCacheRef.current = cacheData
    
    // Save to localStorage for persistence
    if (projectId) {
      const cacheKey = `preview-cache-${projectId}`
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        console.log(`💾 [CACHE] Saved cache to localStorage for project: ${projectId}`)
      } catch (error) {
        console.warn(`⚠️ [CACHE] Failed to save cache to localStorage:`, error)
      }
    }
    
    console.log(`💾 [CACHE] Updated cache for sandbox: ${sandboxId}`)
  }, [generateFilesHash, projectId])

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
      
      // Set up interval (every 5 minutes)
      heartbeatIntervalRef.current = setInterval(() => {
        sendHeartbeat()
      }, 5 * 60 * 1000)
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

    // 🚀 Cache check: ตรวจสอบว่า preview ยังใช้ได้หรือไม่
    if (isCacheValid(files)) {
      console.log(`💾 [CACHE] Using cached preview - no rebuild needed`)
      setSandboxId(previewCacheRef.current.sandboxId!)
      setPreviewUrl(previewCacheRef.current.previewUrl!)
      setPreviewToken(previewCacheRef.current.previewToken!)
      setStatus('running')
      setLoading(false)
      return
    }

    // 🚀 Request debouncing: ป้องกัน rate limiting
    const now = Date.now()
    if (now - lastRequestRef.current < requestDebounceMs) {
      console.log(`⏳ [DEBOUNCE] Request too soon, skipping...`)
      setLoading(false)
      return
    }
    lastRequestRef.current = now

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
      
      if (!res.ok) {
        if (res.status === 429) {
          console.warn(`🚫 [RATE_LIMIT] Rate limit exceeded, retrying in ${data.retryAfter || 60} seconds...`)
          setError(`Rate limit exceeded. Please wait ${data.retryAfter || 60} seconds before trying again.`)
          setStatus('error')
          return
        }
        throw new Error(data?.error || 'Failed to create sandbox')
      }

      console.log(`✅ [FRONTEND] Preview created successfully: ${data.sandboxId}`)
      
      // เก็บสถานะไฟล์เริ่มต้นสำหรับการเปรียบเทียบ
      if (files) {
        files.forEach(file => {
          updateFileState(file.path, file.content)
        })
        console.log(`📁 [FRONTEND] Stored initial state for ${files.length} files`)
      }
      
      setSandboxId(data.sandboxId)
      setPreviewUrl(data.url)
      setPreviewToken(data.token)
      setStatus('running')
      lastHeartbeatRef.current = Date.now()
      
      // 💾 Update cache with new preview data
      if (files) {
        updateCache(data.sandboxId, data.url, data.token, files)
      }
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

  const updateFiles = useCallback(async (newFiles: ProjectFile[]): Promise<UpdateResult> => {
    if (!sandboxId) {
      console.log('❌ [FRONTEND] No sandbox to update')
      throw new Error('No active sandbox to update')
    }

    if (status !== 'running') {
      console.log('❌ [FRONTEND] Sandbox is not running')
      throw new Error('Sandbox is not running')
    }

    if (!newFiles || newFiles.length === 0) {
      console.log('❌ [FRONTEND] No files provided for update')
      throw new Error('No files provided for update')
    }

    setLoading(true)
    setError(undefined)
    
    // 🔍 File Comparison: ตรวจสอบไฟล์ที่เปลี่ยนแปลง
    const changedFiles: ProjectFile[] = []
    const skippedFiles: string[] = []
    
    console.log(`🔍 [FRONTEND] Comparing ${newFiles.length} files for changes...`)
    
    newFiles.forEach(file => {
      const comparison = compareFiles(file.path, file.content)
      
      if (comparison.hasChanged) {
        changedFiles.push(file)
        console.log(`📝 [FRONTEND] File changed: ${file.path} (${comparison.changeType})`)
      } else {
        skippedFiles.push(file.path)
        console.log(`⏭️ [FRONTEND] File unchanged: ${file.path}`)
      }
    })
    
    console.log(`📊 [FRONTEND] Comparison result: ${changedFiles.length} changed, ${skippedFiles.length} unchanged`)
    
    // ถ้าไม่มีไฟล์เปลี่ยนแปลง ไม่ต้องส่ง request
    if (changedFiles.length === 0) {
      console.log(`✅ [FRONTEND] No files to update - all files are unchanged`)
      setLoading(false)
      return {
        success: true,
        updatedFiles: 0,
        totalFiles: newFiles.length,
        skippedFiles: skippedFiles.length,
        message: 'No files to update - all files are unchanged'
      }
    }

    // 🚀 Invalidate cache when files change
    console.log(`🔄 [CACHE] Files changed - invalidating cache`)
    previewCacheRef.current = {}
    if (projectId) {
      const cacheKey = `preview-cache-${projectId}`
      localStorage.removeItem(cacheKey)
    }

    // 🚀 Request debouncing: ป้องกัน rate limiting
    const now = Date.now()
    if (now - lastRequestRef.current < requestDebounceMs) {
      console.log(`⏳ [DEBOUNCE] Update request too soon, skipping...`)
      setLoading(false)
      return {
        success: true,
        updatedFiles: 0,
        totalFiles: newFiles.length,
        skippedFiles: skippedFiles.length,
        message: 'Request debounced - too soon'
      }
    }
    lastRequestRef.current = now

    // 🚀 Incremental Build: ส่งเฉพาะไฟล์ที่เปลี่ยนแปลง
    console.log(`🚀 [FRONTEND] Starting incremental build for ${changedFiles.length} changed files...`)
    
    try {
      const res = await fetch(`/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          files: changedFiles,  // ส่งเฉพาะไฟล์ที่เปลี่ยนแปลง
          projectId,
          comparison: {
            totalFiles: newFiles.length,
            changedFiles: changedFiles.length,
            skippedFiles: skippedFiles.length
          }
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        if (res.status === 429) {
          console.warn(`🚫 [RATE_LIMIT] Rate limit exceeded during update, retrying in ${data.retryAfter || 60} seconds...`)
          setError(`Rate limit exceeded. Please wait ${data.retryAfter || 60} seconds before trying again.`)
          setStatus('error')
          return {
            success: false,
            updatedFiles: 0,
            totalFiles: newFiles.length,
            skippedFiles: skippedFiles.length,
            message: `Rate limit exceeded. Retry in ${data.retryAfter || 60} seconds.`
          }
        }
        throw new Error(data?.error || 'Failed to update files')
      }
      
      // อัปเดตสถานะไฟล์หลังจากอัปเดตสำเร็จ
      changedFiles.forEach(file => {
        updateFileState(file.path, file.content)
      })
      
      console.log(`✅ [FRONTEND] Files updated successfully: ${data.updatedFiles} files`)
      
      // อัปเดต heartbeat หลังจากอัปเดตไฟล์สำเร็จ
      lastHeartbeatRef.current = Date.now()
      
      return {
        success: true,
        updatedFiles: data.updatedFiles,
        totalFiles: newFiles.length,
        skippedFiles: skippedFiles.length,
        message: data.message || `Updated ${data.updatedFiles} files, skipped ${skippedFiles.length} unchanged files`
      }
    } catch (e: any) {
      console.error(`❌ [FRONTEND] File update failed:`, e)
      setError(e?.message || 'Unexpected error')
      return {
        success: false,
        updatedFiles: 0,
        totalFiles: newFiles.length,
        skippedFiles: 0,
        message: 'Update failed',
        error: e?.message || 'Unexpected error'
      }
    } finally {
      setLoading(false)
    }
  }, [sandboxId, status, projectId, compareFiles, updateFileState])

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
    updateFiles,
    // Additional heartbeat info
    lastHeartbeat: lastHeartbeatRef.current,
    isHeartbeatActive: heartbeatIntervalRef.current !== null,
  }
}
