// controllers/SandboxController.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma/prisma'
import { DaytonaSandboxService } from '../services/DaytonaSandboxService'
import { CleanupService } from '../services/CleanupService'
import { SandboxState, ProjectFile, FileComparison } from '../models/SandboxState'
import { RESPONSE_HEADERS, SANDBOX_CONFIG } from '../utils/constants'
import { validateFiles, logFileStructure } from '../utils/sandboxHelpers'

export class SandboxController {
  private sandboxService: DaytonaSandboxService
  private cleanupService: CleanupService
  private sandboxStates: Map<string, SandboxState>

  constructor() {
    this.sandboxStates = new Map<string, SandboxState>()
    this.sandboxService = new DaytonaSandboxService()
    this.cleanupService = CleanupService.getInstance(this.sandboxStates)
    
    // Initialize cleanup service
    this.initializeCleanupService()
  }

  /**
   * Create new sandbox
   */
  async createSandbox(body: any) {
    console.log('🚀 POST /api/preview/daytona - Creating new sandbox')
    
    const { files, projectId, userId } = body
    
    console.log(`📦 Received preview request for project: ${projectId}`)
    console.log(`👤 User ID: ${userId}`)
    console.log(`📁 Files count: ${files?.length || 0}`)
    
    // Log file structure for debugging
    if (files?.length > 0) {
      logFileStructure(files)
    }
    
    // Validate request
    const validation = validateFiles(files)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }
    
    // Create sandbox with dynamic files, projectId, and userId
    const result = await this.sandboxService.createSandbox(files)
    
    // Update sandbox status in memory and database
    await this.updateSandboxStatus(result.sandboxId, 'running', result.url, result.token, undefined, projectId, userId)
    
    // Show current stats
    const stats = this.cleanupService.getStats()
    console.log(`📊 Current sandbox stats:`, stats)
    
    console.log(`✅ Sandbox created for project ${projectId}:`, {
      sandboxId: result.sandboxId,
      status: result.status,
      hasUrl: !!result.url
    })
    
    return {
      ...result,
      projectId,
      userId
    }
  }

  /**
   * Get sandbox status and handle heartbeat
   */
  async getSandboxStatus(sandboxId: string | null) {
    if (!sandboxId) {
      throw new Error('Missing sandboxId')
    }

    const state = this.sandboxStates.get(sandboxId)
    if (state) {
      // Update heartbeat and return updated state
      const updated = await this.updateSandboxStatus(sandboxId, state.status, state.previewUrl, state.previewToken, state.error)
      return updated
    }

    // No state in memory → check with Daytona
    const exists = await this.sandboxService.sandboxExists(sandboxId)
    if (!exists) {
      throw new Error('Sandbox not found')
    }
    
    const fallback = await this.updateSandboxStatus(sandboxId, 'error')
    return fallback
  }

  /**
   * Update files in existing sandbox
   */
  async updateSandboxFiles(sandboxId: string | null, body: any) {
    if (!sandboxId) {
      throw new Error('Missing sandboxId')
    }

    console.log(`🔄 [PUT] Updating files in sandbox: ${sandboxId}`)

    const { files, projectId, userId, comparison } = body
    
    // Log comparison info if available
    if (comparison) {
      console.log(`📊 [PUT] File comparison info:`, {
        totalFiles: comparison.totalFiles,
        changedFiles: comparison.changedFiles,
        skippedFiles: comparison.skippedFiles
      })
    }
    
    // Validate request
    const validation = validateFiles(files)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Check if sandbox exists and is running
    const state = this.sandboxStates.get(sandboxId)
    if (!state) {
      throw new Error('Sandbox not found in memory')
    }

    if (state.status !== 'running') {
      throw new Error('Sandbox is not running')
    }

    // Verify sandbox exists on Daytona
    const sandboxExists = await this.sandboxService.sandboxExists(sandboxId)
    if (!sandboxExists) {
      throw new Error('Sandbox not found on Daytona')
    }

    // Update files incrementally
    const updateResult = await this.sandboxService.updateSandbox(sandboxId, files)
    
    // Update heartbeat with database
    await this.updateSandboxStatus(sandboxId, 'running', state.previewUrl, state.previewToken, undefined, projectId, userId)
    
    console.log(`✅ [PUT] Incremental build completed: ${updateResult.updatedCount}/${updateResult.totalFiles} files updated in sandbox: ${sandboxId}`)
    
    // Performance optimization log
    if (comparison && comparison.changedFiles < 5) {
      console.log(`⚡ [PUT] Small change detected (${comparison.changedFiles} files) - using optimized rebuild`)
    }
    
    return {
      success: true,
      updatedFiles: updateResult.updatedCount,
      totalFiles: updateResult.totalFiles,
      skippedFiles: comparison?.skippedFiles || 0,
      errors: updateResult.errors,
      message: `Successfully updated ${updateResult.updatedCount} files${comparison?.skippedFiles ? `, skipped ${comparison.skippedFiles} unchanged files` : ''}`,
      projectId,
      comparison: comparison ? {
        totalFiles: comparison.totalFiles,
        changedFiles: comparison.changedFiles,
        skippedFiles: comparison.skippedFiles
      } : undefined
    }
  }

  /**
   * Delete sandbox
   */
  async deleteSandbox(sandboxId: string | null) {
    if (!sandboxId) {
      throw new Error('Missing sandboxId')
    }

    console.log(`🛑 [DELETE] Stopping sandbox: ${sandboxId}`)

    const result = await this.sandboxService.deleteSandbox(sandboxId)
    
    // Update status in database as stopped always
    await this.updateSandboxStatus(sandboxId, 'stopped')

    // Show stats after deletion
    const stats = this.cleanupService.getStats()
    console.log(`📊 Sandbox ${sandboxId} deleted. Current stats:`, stats)

    return { success: true }
  }

  /**
   * Get cleanup service stats
   */
  getCleanupStats() {
    const stats = this.cleanupService.getStats()
    console.log('📊 [CLEANUP STATS] Requested stats:', stats)
    
    return {
      success: true,
      stats,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Control cleanup service
   */
  async controlCleanupService(action: string) {
    switch (action) {
      case 'start':
        await this.cleanupService.start()
        console.log('🚀 [CLEANUP SERVICE] Started via API')
        return { 
          success: true, 
          message: 'Cleanup service started',
          stats: this.cleanupService.getStats()
        }
        
      case 'stop':
        this.cleanupService.stop()
        console.log('🛑 [CLEANUP SERVICE] Stopped via API')
        return { 
          success: true, 
          message: 'Cleanup service stopped',
          stats: this.cleanupService.getStats()
        }
        
      case 'cleanup':
        console.log('🧹 [CLEANUP SERVICE] Manual cleanup triggered via API')
        this.cleanupService.cleanupExpiredStates()
        await this.cleanupService.cleanupIdleSandboxes()
        this.cleanupService.cleanupStoppedSandboxes()
        return { 
          success: true, 
          message: 'Manual cleanup completed',
          stats: this.cleanupService.getStats()
        }
        
      case 'memory':
        console.log('🧹 [CLEANUP SERVICE] Manual memory cleanup triggered via API')
        await this.cleanupService.cleanupMemoryStates()
        return { 
          success: true, 
          message: 'Memory cleanup completed',
          stats: this.cleanupService.getStats()
        }
        
      case 'sync':
        console.log('🔄 [CLEANUP SERVICE] Manual sync triggered via API')
        await this.cleanupService.syncWithDaytona()
        return { 
          success: true, 
          message: 'Manual sync completed',
          stats: this.cleanupService.getStats()
        }
        
      case 'stopped':
        console.log('🧹 [CLEANUP SERVICE] Manual stopped cleanup triggered')
        this.cleanupService.cleanupStoppedSandboxes()
        return { 
          success: true, 
          message: 'Stopped cleanup completed',
          stats: this.cleanupService.getStats()
        }
        
      default:
        throw new Error('Invalid action. Use: start, stop, cleanup, sync, memory, or stopped')
    }
  }

  /**
   * Handle errors and return proper response
   */
  handleError(error: any, status: number = 500): NextResponse {
    console.error(`❌ [ERROR] ${error?.message}`)
    return NextResponse.json({ 
      error: error?.message || 'Unexpected error',
      details: error?.stack || 'No additional details'
    }, { 
      status,
      headers: RESPONSE_HEADERS.CORS 
    })
  }

  /**
   * Create success response with CORS headers
   */
  createSuccessResponse(data: any): NextResponse {
    return NextResponse.json(data, {
      headers: RESPONSE_HEADERS.CORS,
    })
  }

  /**
   * Update sandbox status in memory and database
   */
  private async updateSandboxStatus(
    sandboxId: string,
    status: SandboxState['status'],
    previewUrl?: string,
    previewToken?: string,
    error?: string,
    projectId?: string,
    userId?: string
  ): Promise<SandboxState> {
    const now = Date.now()
    const current = this.sandboxStates.get(sandboxId)
    const next: SandboxState = {
      sandboxId,
      status,
      previewUrl,
      previewToken,
      error,
      createdAt: current?.createdAt ?? now,
      lastHeartbeatAt: now,
    }
    this.sandboxStates.set(sandboxId, next)
    
    // Save to database
    try {
      await prisma.sandboxState.upsert({
        where: { sandboxId },
        update: {
          status,
          previewUrl,
          previewToken,
          error,
          lastHeartbeatAt: new Date(now),
          updatedAt: new Date(),
          ...(projectId && { projectId }),
          ...(userId && { userId }),
        },
        create: {
          sandboxId,
          projectId,
          userId,
          status,
          previewUrl,
          previewToken,
          error,
          lastHeartbeatAt: new Date(now),
          expiresAt: new Date(now + SANDBOX_CONFIG.EXPIRES_HOURS * 60 * 60 * 1000),
        }
      })
    } catch (dbError) {
      console.error(`❌ [DB ERROR] Failed to update sandbox state in database:`, dbError)
      // Don't throw error to avoid affecting main functionality
    }
    
    // Log only important status changes (not heartbeat spam)
    if (status !== 'running' || !current || current.status !== status) {
      console.log(`📊 [STATUS] Sandbox ${sandboxId} - Status: ${status}, Timestamp: ${new Date(now).toISOString()}`)
    }
    
    return next
  }

  /**
   * Initialize cleanup service
   */
  private async initializeCleanupService(): Promise<void> {
    console.log('🔄 [CLEANUP SERVICE] Force stopping all existing services...')
    this.cleanupService.stop()

    // Wait for service to stop
    setTimeout(async () => {
      console.log('🚀 [CLEANUP SERVICE] Starting fresh cleanup service...')
      try {
        await this.cleanupService.start()
      } catch (error) {
        console.error('❌ [CLEANUP SERVICE] Failed to start:', error)
      }
    }, 1000)
  }
}

