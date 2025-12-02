// hooks/usePreviewCache.ts
import { useCallback, useMemo, useRef, useEffect } from 'react'
import { ProjectFile, PreviewCache } from '../types/preview'
import { CacheService } from '../services/CacheService'

export function usePreviewCache(projectId?: string) {
  const cacheServiceRef = useRef<CacheService | null>(null)

  // Create cache service when projectId changes
  const cacheService = useMemo(() => {
    cacheServiceRef.current = new CacheService(projectId)
    return cacheServiceRef.current
  }, [projectId])

  /**
   * Check if cache is valid for given files
   */
  const isValid = useCallback((files: ProjectFile[]): boolean => {
    return cacheService.isValid(files)
  }, [cacheService])

  /**
   * Get current cache data
   */
  const get = useCallback((): PreviewCache => {
    return cacheService.get()
  }, [cacheService])

  /**
   * Update cache with new preview data
   */
  const update = useCallback((
    sandboxId: string, 
    previewUrl: string, 
    previewToken: string, 
    files: ProjectFile[]
  ): void => {
    cacheService.update(sandboxId, previewUrl, previewToken, files)
  }, [cacheService])

  /**
   * Invalidate current cache
   */
  const invalidate = useCallback((): void => {
    cacheService.invalidate()
  }, [cacheService])

  /**
   * Check if cache has valid preview data
   */
  const hasValidPreview = useCallback((): boolean => {
    return cacheService.hasValidPreview()
  }, [cacheService])

  /**
   * Get cache age in milliseconds
   */
  const getAge = useCallback((): number => {
    return cacheService.getAge()
  }, [cacheService])

  /**
   * Get cache statistics
   */
  const getStats = useCallback(() => {
    return cacheService.getStats()
  }, [cacheService])

  /**
   * Load from cache if valid, otherwise return null
   */
  const loadIfValid = useCallback((files: ProjectFile[]): PreviewCache | null => {
    if (isValid(files)) {
      const cached = get()
      console.log(`💾 [CACHE HOOK] Using cached preview - no rebuild needed`)
      return cached
    }
    return null
  }, [isValid, get])

  /**
   * Update cache and log success
   */
  const updateAndLog = useCallback((
    sandboxId: string,
    previewUrl: string,
    previewToken: string,
    files: ProjectFile[]
  ): void => {
    update(sandboxId, previewUrl, previewToken, files)
    console.log(`💾 [CACHE HOOK] Updated cache for sandbox: ${sandboxId}`)
  }, [update])

  /**
   * Invalidate cache when files change
   */
  const invalidateOnChange = useCallback((): void => {
    console.log(`🔄 [CACHE HOOK] Files changed - invalidating cache`)
    invalidate()
  }, [invalidate])

  return {
    isValid,
    get,
    update,
    invalidate,
    hasValidPreview,
    getAge,
    getStats,
    loadIfValid,
    updateAndLog,
    invalidateOnChange,
  }
}

