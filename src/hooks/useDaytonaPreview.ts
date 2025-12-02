// hooks/useDaytonaPreview.ts - Refactored
'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  Status, 
  ProjectFile, 
  UseDaytonaPreviewProps, 
  UseDaytonaPreviewReturn,
  UpdateResult 
} from './daytona/types/preview'
import { useFileComparison } from './daytona/hooks/useFileComparison'
import { usePreviewCache } from './daytona/hooks/usePreviewCache'
import { useHeartbeat } from './daytona/hooks/useHeartbeat'
import { useApiDebounce } from './daytona/hooks/useApiDebounce'
import { DaytonaApiService } from './daytona/services/DaytonaApiService'
import { validateFiles } from './daytona/utils/fileUtils'

export function useDaytonaPreview({ 
  projectId, 
  files 
}: UseDaytonaPreviewProps = {}): UseDaytonaPreviewReturn {
  // Core state
  const [sandboxId, setSandboxId] = useState<string>()
  const [status, setStatus] = useState<Status>('idle')
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [previewToken, setPreviewToken] = useState<string>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  
  // Specialized hooks
  const fileComparison = useFileComparison()
  const cache = usePreviewCache(projectId)
  const heartbeat = useHeartbeat(sandboxId, status)
  const debounce = useApiDebounce()
  
  // API service
  const apiService = useMemo(() => new DaytonaApiService(), [])

  // Preview URL with token
  const previewUrlWithToken = useMemo(() => {
    if (!previewUrl) return undefined
    if (!previewToken) return previewUrl
    
    try {
      const url = new URL(previewUrl)
      url.searchParams.set('DAYTONA_SANDBOX_AUTH_KEY', previewToken)
      return url.toString()
    } catch {
      const separator = previewUrl.includes('?') ? '&' : '?'
      return `${previewUrl}${separator}DAYTONA_SANDBOX_AUTH_KEY=${encodeURIComponent(previewToken)}`
    }
  }, [previewUrl, previewToken])

  /**
   * Start preview creation
   */
  const startPreview = useCallback(async (): Promise<void> => {
    // Validate required data
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

    // Validate file structure
    const validation = validateFiles(files)
    if (!validation.isValid) {
      setError(validation.error!)
      setStatus('error')
      return
    }

    // Check cache first
    const cachedPreview = cache.loadIfValid(files)
    if (cachedPreview) {
      setSandboxId(cachedPreview.sandboxId!)
      setPreviewUrl(cachedPreview.previewUrl!)
      setPreviewToken(cachedPreview.previewToken!)
      setStatus('running')
      setLoading(false)
      return
    }

    // Check debounce
    if (!debounce.canProceed()) {
      console.log(`⏳ [PREVIEW] Request debounced`)
      setLoading(false)
      return
    }

    setLoading(true)
    setStatus('creating')
    setError(undefined)
    
    console.log(`🚀 [PREVIEW] Starting creation with ${files.length} files...`)
    
    try {
      const result = await apiService.createSandbox(projectId, files)
      
      // Store initial file states for comparison
      fileComparison.updateMultipleFileStates(files)
      
      // Update state
      setSandboxId(result.sandboxId)
      setPreviewUrl(result.url)
      setPreviewToken(result.token)
      setStatus('running')
      
      // Update cache
      if (result.url && result.token) {
        cache.updateAndLog(result.sandboxId, result.url, result.token, files)
      }
      
      console.log(`✅ [PREVIEW] Created successfully: ${result.sandboxId}`)
      
    } catch (error: any) {
      console.error(`❌ [PREVIEW] Creation failed:`, error)
      setError(error?.message || 'Unexpected error')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [projectId, files, cache, debounce, apiService, fileComparison])

  /**
   * Stop preview
   */
  const stopPreview = useCallback(async (): Promise<void> => {
    if (!sandboxId) {
      console.log('🛑 [PREVIEW] No sandbox to stop')
      setStatus('idle')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      return
    }
    
    setLoading(true)
    console.log(`🛑 [PREVIEW] Stopping sandbox: ${sandboxId}`)
    
    try {
      await apiService.deleteSandbox(sandboxId)
      
      console.log(`✅ [PREVIEW] Stopped successfully: ${sandboxId}`)
      
      // Clear state
      setStatus('stopped')
      setPreviewUrl(undefined)
      setPreviewToken(undefined)
      setSandboxId(undefined)
      
    } catch (error: any) {
      console.error(`❌ [PREVIEW] Stop failed:`, error)
      setError(error?.message || 'Unexpected error')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }, [sandboxId, apiService])

  /**
   * Update files in existing sandbox
   */
  const updateFiles = useCallback(async (newFiles: ProjectFile[]): Promise<UpdateResult> => {
    if (!sandboxId) {
      throw new Error('No active sandbox to update')
    }

    if (status !== 'running') {
      throw new Error('Sandbox is not running')
    }

    // Validate files
    const validation = validateFiles(newFiles)
    if (!validation.isValid) {
      throw new Error(validation.error!)
    }

    setLoading(true)
    setError(undefined)
    
    // Compare files to find changes
    const comparisonResult = fileComparison.compareFiles(newFiles)
    
    // If no changes, return early
    if (comparisonResult.changedFiles.length === 0) {
      console.log(`✅ [PREVIEW] No files to update - all unchanged`)
      setLoading(false)
      return {
        success: true,
        updatedFiles: 0,
        totalFiles: newFiles.length,
        skippedFiles: comparisonResult.skippedFiles.length,
        message: 'No files to update - all files are unchanged'
      }
    }

    // Invalidate cache when files change
    cache.invalidateOnChange()

    // Check debounce
    if (!debounce.canProceed()) {
      console.log(`⏳ [PREVIEW] Update request debounced`)
      setLoading(false)
      return {
        success: true,
        updatedFiles: 0,
        totalFiles: newFiles.length,
        skippedFiles: comparisonResult.skippedFiles.length,
        message: 'Request debounced - too soon'
      }
    }

    console.log(`🚀 [PREVIEW] Updating ${comparisonResult.changedFiles.length} changed files...`)
    
    try {
      const result = await apiService.updateFiles(sandboxId, projectId!, comparisonResult)
      
      // Update file states after successful update
      comparisonResult.changedFiles.forEach(file => {
        fileComparison.updateFileState(file.path, file.content)
      })
      
      console.log(`✅ [PREVIEW] Files updated successfully: ${result.updatedFiles} files`)
      
      return result
      
    } catch (error: any) {
      console.error(`❌ [PREVIEW] File update failed:`, error)
      setError(error?.message || 'Unexpected error')
      return {
        success: false,
        updatedFiles: 0,
        totalFiles: newFiles.length,
        skippedFiles: 0,
        message: 'Update failed',
        error: error?.message || 'Unexpected error'
      }
    } finally {
      setLoading(false)
    }
  }, [sandboxId, status, projectId, fileComparison, cache, debounce, apiService])

  return {
    // Core state
    sandboxId,
    status,
    previewUrl,
    previewToken,
    previewUrlWithToken,
    error,
    loading,
    
    // Actions
    startPreview,
    stopPreview,
    updateFiles,
    
    // Additional info from heartbeat
    lastHeartbeat: heartbeat.lastHeartbeat,
    isHeartbeatActive: heartbeat.isHeartbeatActive,
  }
}