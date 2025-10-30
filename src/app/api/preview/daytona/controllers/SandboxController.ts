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
  private sandboxCache: Map<string, SandboxState> // เปลี่ยนชื่อเป็น Cache

  constructor() {
    this.sandboxCache = new Map<string, SandboxState>() // เปลี่ยนชื่อเป็น Cache
    this.sandboxService = new DaytonaSandboxService()
    this.cleanupService = CleanupService.getInstance(this.sandboxCache) // ส่ง Cache แทน Memory
    
    // Initialize cleanup service
    this.initializeCleanupService()
  }

  /**
   * Create new sandbox or reuse existing running sandbox
   */
  async createSandbox(body: any) {
    console.log('🚀 POST /api/preview/daytona - Creating or reusing sandbox')
    
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
    
    // 1) เช็ค DB หา sandbox เดิมที่ยัง running โดยผูกกับ projectId/userId
    if (projectId || userId) {
      console.log(`🔍 Checking for existing running sandbox...`)
      
      const existing = await prisma.sandboxState.findFirst({
        where: {
          status: 'running',
          ...(projectId ? { projectId } : {}),
          ...(userId ? { userId } : {}),
        },
        orderBy: { updatedAt: 'desc' },
      })

      if (existing) {
        console.log(`📌 Found existing sandbox: ${existing.sandboxId}`)
        
        // 2) ยืนยันว่ามีอยู่จริงบน Daytona
        const existsOnDaytona = await this.sandboxService.sandboxExists(existing.sandboxId)
        
        if (existsOnDaytona) {
          console.log(`✅ Sandbox ${existing.sandboxId} is still running on Daytona, reusing...`)
          
          // 3) เช็คและ restart dev server ถ้าจำเป็น
          const devServerRunning = await this.sandboxService.ensureDevServerRunning(existing.sandboxId)
          
          if (!devServerRunning) {
            console.log(`⚠️ Failed to ensure dev server is running, will create new sandbox`)
            // Mark as error and create new one
            await prisma.sandboxState.update({
              where: { sandboxId: existing.sandboxId },
              data: { status: 'error', error: 'Dev server failed to start', updatedAt: new Date() },
            })
          } else {
            // 4) อัปเดต heartbeat + ส่งคืน sandbox เดิม
            const updated = await this.updateSandboxStatus(
              existing.sandboxId,
              'running',
              existing.previewUrl ?? undefined,
              existing.previewToken ?? undefined,
              undefined,
              projectId,
              userId
            )
            
            // Show current stats
            const stats = this.cleanupService.getStats()
            console.log(`📊 Current sandbox stats:`, stats)
            
            return {
              sandboxId: updated.sandboxId,
              url: updated.previewUrl,
              token: updated.previewToken,
              status: updated.status,
              projectId,
              userId,
              reused: true,
            }
          }
        } else {
          console.log(`⚠️ Sandbox ${existing.sandboxId} not found on Daytona, marking as stopped`)
          
          // ถ้า DB มีแต่ Daytona ไม่มี → mark stopped
          await prisma.sandboxState.update({
            where: { sandboxId: existing.sandboxId },
            data: { status: 'stopped', updatedAt: new Date() },
          })
        }
      } else {
        console.log(`🆕 No existing running sandbox found`)
      }
    }
    
    // 4) ไม่พบที่ reuse → สร้างใหม่ตามเดิม
    console.log(`🏗️ Creating new sandbox...`)
    const result = await this.sandboxService.createSandbox(files)
    
    // Update sandbox status in database (primary) and cache (secondary)
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
      userId,
      reused: false,
    }
  }

  /**
   * Get sandbox status and handle heartbeat
   */
  async getSandboxStatus(sandboxId: string | null) {
    if (!sandboxId) {
      throw new Error('Missing sandboxId')
    }

    // เปลี่ยนลำดับ: เช็ค Database ก่อน, Cache เป็น secondary
    try {
      // 1. เช็ค Database ก่อน
      const dbState = await prisma.sandboxState.findUnique({
        where: { sandboxId }
      })

      if (dbState) {
        // 2. อัพเดท Cache จาก Database
        const cacheState: SandboxState = {
          sandboxId: dbState.sandboxId,
          status: dbState.status as SandboxState['status'],
          previewUrl: dbState.previewUrl || undefined,
          previewToken: dbState.previewToken || undefined,
          error: dbState.error || undefined,
          createdAt: dbState.createdAt.getTime(),
          lastHeartbeatAt: dbState.lastHeartbeatAt?.getTime() || Date.now(),
        }
        this.sandboxCache.set(sandboxId, cacheState)

        // 3. อัพเดท heartbeat และ return
        const updated = await this.updateSandboxStatus(sandboxId, dbState.status as SandboxState['status'], dbState.previewUrl || undefined, dbState.previewToken || undefined, dbState.error || undefined)
        return updated
      }

      // 4. ถ้าไม่มีใน Database → เช็ค Cache
      const cacheState = this.sandboxCache.get(sandboxId)
      if (cacheState) {
        // 5. อัพเดท heartbeat และ return
        const updated = await this.updateSandboxStatus(sandboxId, cacheState.status, cacheState.previewUrl, cacheState.previewToken, cacheState.error)
        return updated
      }

      // 6. ถ้าไม่มีทั้ง Database และ Cache → เช็คกับ Daytona
      const exists = await this.sandboxService.sandboxExists(sandboxId)
      if (!exists) {
        throw new Error('Sandbox not found')
      }
      
      // 7. สร้าง state ใหม่
      const fallback = await this.updateSandboxStatus(sandboxId, 'error')
      return fallback

    } catch (error) {
      console.error(`❌ [GET STATUS] Error getting sandbox status for ${sandboxId}:`, error)
      throw error
    }
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

    // เปลี่ยนลำดับ: เช็ค Database ก่อน, Cache เป็น secondary
    try {
      // 1. เช็ค Database ก่อน
      const dbState = await prisma.sandboxState.findUnique({
        where: { sandboxId }
      })

      if (!dbState) {
        throw new Error('Sandbox not found in database')
      }

      if (dbState.status !== 'running') {
        throw new Error('Sandbox is not running')
      }

      // 2. อัพเดท Cache จาก Database
      const cacheState: SandboxState = {
        sandboxId: dbState.sandboxId,
        status: dbState.status as SandboxState['status'],
        previewUrl: dbState.previewUrl || undefined,
        previewToken: dbState.previewToken || undefined,
        error: dbState.error || undefined,
        createdAt: dbState.createdAt.getTime(),
        lastHeartbeatAt: dbState.lastHeartbeatAt?.getTime() || Date.now(),
      }
      this.sandboxCache.set(sandboxId, cacheState)

      // 3. Verify sandbox exists on Daytona
      const sandboxExists = await this.sandboxService.sandboxExists(sandboxId)
      if (!sandboxExists) {
        throw new Error('Sandbox not found on Daytona')
      }

      // 4. Update files incrementally
      const updateResult = await this.sandboxService.updateSandbox(sandboxId, files)
      
      // 5. Update heartbeat with database
      await this.updateSandboxStatus(sandboxId, 'running', dbState.previewUrl || undefined, dbState.previewToken || undefined, undefined, projectId, userId)
      
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

    } catch (error) {
      console.error(`❌ [UPDATE FILES] Error updating sandbox files for ${sandboxId}:`, error)
      throw error
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
   * Update sandbox status in database (primary) and cache (secondary)
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
    
    // 1. อัพเดท Database ก่อน (Primary)
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
    
    // 2. อัพเดท Cache หลัง (Secondary)
    const current = this.sandboxCache.get(sandboxId)
    const next: SandboxState = {
      sandboxId,
      status,
      previewUrl,
      previewToken,
      error,
      createdAt: current?.createdAt ?? now,
      lastHeartbeatAt: now,
    }
    this.sandboxCache.set(sandboxId, next)
    
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

