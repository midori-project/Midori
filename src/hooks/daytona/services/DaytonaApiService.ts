// services/DaytonaApiService.ts
import { 
  ProjectFile, 
  ApiResponse, 
  UpdateResult, 
  FileComparisonResult 
} from '../types/preview'
import { API_ENDPOINTS, HTTP_STATUS } from '../utils/constants'

export class DaytonaApiService {
  /**
   * Create a new sandbox
   */
  async createSandbox(projectId: string, files: ProjectFile[]): Promise<ApiResponse> {
    console.log(`🚀 [API] Creating sandbox with ${files.length} files...`)
    
    const response = await fetch(API_ENDPOINTS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        projectId,
        files 
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      if (response.status === HTTP_STATUS.RATE_LIMIT) {
        const retryAfter = data.retryAfter || 60
        console.warn(`🚫 [API] Rate limit exceeded, retry in ${retryAfter} seconds`)
        throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`)
      }
      throw new Error(data?.error || 'Failed to create sandbox')
    }
    
    console.log(`✅ [API] Sandbox created successfully: ${data.sandboxId}`)
    return data
  }

  /**
   * Get sandbox status (heartbeat)
   */
  async getSandboxStatus(sandboxId: string, signal?: AbortSignal): Promise<ApiResponse> {
    const response = await fetch(API_ENDPOINTS.STATUS(sandboxId), { 
      signal 
    })
    
    if (!response.ok) {
      if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new Error('Sandbox not found')
      }
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.error || 'Failed to get sandbox status')
    }
    
    return await response.json()
  }

  /**
   * Update files in existing sandbox
   */
  async updateFiles(
    sandboxId: string, 
    projectId: string,
    comparisonResult: FileComparisonResult
  ): Promise<UpdateResult> {
    console.log(`🔄 [API] Updating ${comparisonResult.changedFiles.length} changed files...`)
    
    const response = await fetch(API_ENDPOINTS.UPDATE(sandboxId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: comparisonResult.changedFiles,
        projectId,
        comparison: comparisonResult.comparison
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      if (response.status === HTTP_STATUS.RATE_LIMIT) {
        const retryAfter = data.retryAfter || 60
        console.warn(`🚫 [API] Rate limit exceeded during update, retry in ${retryAfter} seconds`)
        throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`)
      }
      if (response.status === HTTP_STATUS.NOT_FOUND) {
        throw new Error('Sandbox not found')
      }
      throw new Error(data?.error || 'Failed to update files')
    }
    
    console.log(`✅ [API] Files updated successfully: ${data.updatedFiles} files`)
    
    return {
      success: true,
      updatedFiles: data.updatedFiles,
      totalFiles: comparisonResult.comparison.totalFiles,
      skippedFiles: comparisonResult.comparison.skippedFiles,
      message: data.message || `Updated ${data.updatedFiles} files, skipped ${comparisonResult.comparison.skippedFiles} unchanged files`
    }
  }

  /**
   * Delete sandbox
   */
  async deleteSandbox(sandboxId: string): Promise<void> {
    console.log(`🛑 [API] Stopping sandbox: ${sandboxId}`)
    
    const response = await fetch(API_ENDPOINTS.DELETE(sandboxId), {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.error || 'Failed to stop sandbox')
    }
    
    console.log(`✅ [API] Sandbox stopped successfully: ${sandboxId}`)
  }

  /**
   * Send heartbeat request
   */
  async sendHeartbeat(sandboxId: string, signal?: AbortSignal): Promise<void> {
    try {
      console.log(`💓 [API] Sending heartbeat for sandbox: ${sandboxId}`)
      const response = await this.getSandboxStatus(sandboxId, signal)
      console.log(`✅ [API] Heartbeat successful for sandbox: ${sandboxId}`)
    } catch (error) {
      console.error(`❌ [API] Heartbeat error for sandbox: ${sandboxId}:`, error)
      throw error
    }
  }
}

