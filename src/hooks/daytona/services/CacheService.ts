// services/CacheService.ts
import { PreviewCache, ProjectFile } from '../types/preview'
import { 
  isCacheValid, 
  createCacheData, 
  loadCacheFromStorage, 
  saveCacheToStorage, 
  clearCacheFromStorage 
} from '../utils/cacheUtils'

export class CacheService {
  private cache: PreviewCache = {}
  private projectId?: string

  constructor(projectId?: string) {
    this.projectId = projectId
    this.loadFromStorage()
  }

  /**
   * Load cache from localStorage on initialization
   */
  private loadFromStorage(): void {
    if (this.projectId) {
      const cached = loadCacheFromStorage(this.projectId)
      if (cached) {
        this.cache = cached
      }
    }
  }

  /**
   * Check if current cache is valid for given files
   */
  isValid(files: ProjectFile[]): boolean {
    return isCacheValid(this.cache, files)
  }

  /**
   * Get current cache data
   */
  get(): PreviewCache {
    return this.cache
  }

  /**
   * Update cache with new data
   */
  update(sandboxId: string, previewUrl: string, previewToken: string, files: ProjectFile[]): void {
    const cacheData = createCacheData(sandboxId, previewUrl, previewToken, files)
    this.cache = cacheData
    
    // Save to localStorage if projectId is available
    if (this.projectId) {
      saveCacheToStorage(this.projectId, cacheData)
    }
    
    console.log(`💾 [CACHE SERVICE] Updated cache for sandbox: ${sandboxId}`)
  }

  /**
   * Invalidate current cache
   */
  invalidate(): void {
    console.log(`🔄 [CACHE SERVICE] Invalidating cache`)
    this.cache = {}
    
    if (this.projectId) {
      clearCacheFromStorage(this.projectId)
    }
  }

  /**
   * Check if cache has valid preview URL
   */
  hasValidPreview(): boolean {
    return !!(this.cache.sandboxId && this.cache.previewUrl)
  }

  /**
   * Get cache age in milliseconds
   */
  getAge(): number {
    return this.cache.lastUpdated ? Date.now() - this.cache.lastUpdated : Infinity
  }

  /**
   * Get cache statistics for debugging
   */
  getStats() {
    return {
      hasSandboxId: !!this.cache.sandboxId,
      hasPreviewUrl: !!this.cache.previewUrl,
      hasToken: !!this.cache.previewToken,
      hasFilesHash: !!this.cache.filesHash,
      age: this.getAge(),
      lastUpdated: this.cache.lastUpdated ? new Date(this.cache.lastUpdated).toISOString() : null,
      projectId: this.projectId,
    }
  }
}

