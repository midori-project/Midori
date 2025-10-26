// utils/cacheUtils.ts
import { PreviewCache, ProjectFile } from '../types/preview'
import { CACHE_CONFIG, CACHE_KEYS } from './constants'
import { generateFilesHash } from './fileUtils'

/**
 * Cache validation utility
 */
export function isCacheValid(cache: PreviewCache, files: ProjectFile[]): boolean {
  if (!cache.sandboxId || !cache.previewUrl || !cache.filesHash) {
    return false
  }

  const currentFilesHash = generateFilesHash(files)
  const isHashMatch = cache.filesHash === currentFilesHash
  const isRecent = cache.lastUpdated 
    ? (Date.now() - cache.lastUpdated) < CACHE_CONFIG.ttl 
    : false

  console.log(`🔍 [CACHE] Validation: hash=${isHashMatch}, recent=${isRecent}, age=${
    cache.lastUpdated ? Date.now() - cache.lastUpdated : 'unknown'
  }ms`)
  
  return isHashMatch && isRecent
}

/**
 * Create cache data object
 */
export function createCacheData(
  sandboxId: string, 
  previewUrl: string, 
  previewToken: string, 
  files: ProjectFile[]
): PreviewCache {
  return {
    sandboxId,
    previewUrl,
    previewToken,
    filesHash: generateFilesHash(files),
    lastUpdated: Date.now()
  }
}

/**
 * Load cache from localStorage
 */
export function loadCacheFromStorage(projectId: string): PreviewCache | null {
  try {
    const cacheKey = CACHE_KEYS.PREVIEW_CACHE(projectId)
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const cacheData = JSON.parse(cached)
      console.log(`💾 [CACHE] Loaded from localStorage for project: ${projectId}`)
      return cacheData
    }
  } catch (error) {
    console.warn(`⚠️ [CACHE] Failed to parse cache from localStorage:`, error)
  }
  return null
}

/**
 * Save cache to localStorage
 */
export function saveCacheToStorage(projectId: string, cacheData: PreviewCache): void {
  try {
    const cacheKey = CACHE_KEYS.PREVIEW_CACHE(projectId)
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    console.log(`💾 [CACHE] Saved to localStorage for project: ${projectId}`)
  } catch (error) {
    console.warn(`⚠️ [CACHE] Failed to save to localStorage:`, error)
  }
}

/**
 * Clear cache from localStorage
 */
export function clearCacheFromStorage(projectId: string): void {
  try {
    const cacheKey = CACHE_KEYS.PREVIEW_CACHE(projectId)
    localStorage.removeItem(cacheKey)
    console.log(`🗑️ [CACHE] Cleared from localStorage for project: ${projectId}`)
  } catch (error) {
    console.warn(`⚠️ [CACHE] Failed to clear from localStorage:`, error)
  }
}

