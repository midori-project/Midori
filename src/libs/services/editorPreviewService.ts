// services/editorPreviewService.ts
'use client'

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

interface EditorPreviewResponse {
  success: boolean
  data?: EditorPreviewData
  error?: string
}

/**
 * Service สำหรับดึงข้อมูล preview จาก editor
 */
export class EditorPreviewService {
  private static instance: EditorPreviewService
  private cache: Map<string, EditorPreviewData> = new Map()
  private listeners: Map<string, Set<(data: EditorPreviewData) => void>> = new Map()

  static getInstance(): EditorPreviewService {
    if (!EditorPreviewService.instance) {
      EditorPreviewService.instance = new EditorPreviewService()
    }
    return EditorPreviewService.instance
  }

  /**
   * ดึงข้อมูล preview สำหรับ project จาก editor
   */
  async getProjectPreview(projectId: string): Promise<EditorPreviewResponse> {
    try {
      console.log(`🔍 [EditorPreviewService] Fetching preview for project: ${projectId}`)
      
      // ตรวจสอบ cache ก่อน
      const cached = this.cache.get(projectId)
      if (cached) {
        console.log(`📦 [EditorPreviewService] Using cached data for project: ${projectId}`)
        return { success: true, data: cached }
      }

      // ดึงข้อมูลจาก editor API
      const response = await fetch(`/api/editor/preview/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch preview from editor')
      }

      const data: EditorPreviewData = await response.json()
      
      // เก็บข้อมูลใน cache
      this.cache.set(projectId, data)
      
      // แจ้ง listeners
      this.notifyListeners(projectId, data)
      
      console.log(`✅ [EditorPreviewService] Preview data fetched successfully for project: ${projectId}`)
      return { success: true, data }
      
    } catch (error) {
      console.error(`❌ [EditorPreviewService] Error fetching preview for project ${projectId}:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * สร้าง preview ใหม่สำหรับ project
   */
  async createPreview(projectId: string, files?: Array<any>): Promise<EditorPreviewResponse> {
    try {
      console.log(`🚀 [EditorPreviewService] Creating preview for project: ${projectId}`)
      
      const response = await fetch('/api/editor/preview/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId,
          files 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create preview')
      }

      const data: EditorPreviewData = await response.json()
      
      // อัปเดต cache
      this.cache.set(projectId, data)
      
      // แจ้ง listeners
      this.notifyListeners(projectId, data)
      
      console.log(`✅ [EditorPreviewService] Preview created successfully for project: ${projectId}`)
      return { success: true, data }
      
    } catch (error) {
      console.error(`❌ [EditorPreviewService] Error creating preview for project ${projectId}:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * หยุด preview สำหรับ project
   */
  async stopPreview(projectId: string): Promise<EditorPreviewResponse> {
    try {
      console.log(`🛑 [EditorPreviewService] Stopping preview for project: ${projectId}`)
      
      const response = await fetch(`/api/editor/preview/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to stop preview')
      }

      const data: EditorPreviewData = { status: 'stopped' }
      
      // อัปเดต cache
      this.cache.set(projectId, data)
      
      // แจ้ง listeners
      this.notifyListeners(projectId, data)
      
      console.log(`✅ [EditorPreviewService] Preview stopped successfully for project: ${projectId}`)
      return { success: true, data }
      
    } catch (error) {
      console.error(`❌ [EditorPreviewService] Error stopping preview for project ${projectId}:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * ลงทะเบียน listener สำหรับการเปลี่ยนแปลงข้อมูล
   */
  subscribe(projectId: string, callback: (data: EditorPreviewData) => void): () => void {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set())
    }
    
    this.listeners.get(projectId)!.add(callback)
    
    // ส่งข้อมูลปัจจุบันทันทีถ้ามี
    const cached = this.cache.get(projectId)
    if (cached) {
      callback(cached)
    }
    
    // Return unsubscribe function
    return () => {
      const projectListeners = this.listeners.get(projectId)
      if (projectListeners) {
        projectListeners.delete(callback)
        if (projectListeners.size === 0) {
          this.listeners.delete(projectId)
        }
      }
    }
  }

  /**
   * แจ้ง listeners เมื่อข้อมูลเปลี่ยนแปลง
   */
  private notifyListeners(projectId: string, data: EditorPreviewData): void {
    const projectListeners = this.listeners.get(projectId)
    if (projectListeners) {
      projectListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in preview listener:', error)
        }
      })
    }
  }

  /**
   * ล้าง cache สำหรับ project
   */
  clearCache(projectId: string): void {
    this.cache.delete(projectId)
    console.log(`🗑️ [EditorPreviewService] Cache cleared for project: ${projectId}`)
  }

  /**
   * ล้าง cache ทั้งหมด
   */
  clearAllCache(): void {
    this.cache.clear()
    console.log(`🗑️ [EditorPreviewService] All cache cleared`)
  }
}

// Export singleton instance
export const editorPreviewService = EditorPreviewService.getInstance()



