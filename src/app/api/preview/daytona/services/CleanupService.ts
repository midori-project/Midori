// services/CleanupService.ts
import { Daytona } from '@daytonaio/sdk'
import { daytonaConfig, getDaytonaClient } from '@/config/daytona'
import { SandboxState, CleanupStats } from '../models/SandboxState'
import { CLEANUP_CONFIG } from '../utils/constants'
import { verifySandboxExists, getSandboxStats, findOldestSandbox, formatAge } from '../utils/sandboxHelpers'
import { prisma } from '@/libs/prisma/prisma'

export class CleanupService {
  private static instance: CleanupService
  private cleanupInterval: NodeJS.Timeout | null = null
  private idleCheckInterval: NodeJS.Timeout | null = null
  private stoppedCleanupInterval: NodeJS.Timeout | null = null
  private isRunning = false
  private lastIdleCleanupTime = 0
  private lastMemoryCleanupTime = 0
  private readonly isDebugMode = process.env.NODE_ENV === 'development'

  constructor(private sandboxCache: Map<string, SandboxState>) {} // เปลี่ยนชื่อเป็น Cache

  static getInstance(sandboxCache: Map<string, SandboxState>): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService(sandboxCache)
    }
    return CleanupService.instance
  }

  /**
   * Start cleanup service with all intervals
   */
  async start(): Promise<void> {
    // Stop existing service if running
    if (this.isRunning) {
      console.log('🧹 [CLEANUP SERVICE] Stopping existing service before restart...')
      this.stop()
    }

    console.log('🚀 [CLEANUP SERVICE] Starting Daytona cleanup service...')
    this.isRunning = true

    // Sync with Daytona before starting cleanup
    await this.syncWithDaytona()

    // Schedule cleanup tasks
    this.scheduleCleanups()

    console.log('✅ Daytona cleanup service started successfully')
  }

  /**
   * Stop cleanup service and clear all intervals
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('🧹 [CLEANUP SERVICE] Not running')
      return
    }

    console.log('🛑 [CLEANUP SERVICE] Stopping Daytona cleanup service...')

    this.clearAllIntervals()
    this.resetState()

    console.log('✅ [CLEANUP SERVICE] Stopped successfully')
  }

  /**
   * Manual cleanup of expired states
   */
  cleanupExpiredStates(): void {
    const startTime = Date.now()
    
    console.log(`🧹 [EXPIRED CLEANUP] Starting expired states cleanup at ${new Date().toISOString()}`)
    
    // Query expired states from database instead of memory
    const expiredThreshold = new Date(Date.now() - CLEANUP_CONFIG.MAX_AGE)
    prisma.sandboxState.findMany({
      where: {
        OR: [
          { lastHeartbeatAt: { lt: expiredThreshold } },
          { createdAt: { lt: expiredThreshold } }
        ]
      }
    }).then(async (expiredStates) => {
      if (expiredStates.length === 0) {
        console.log('⏭️ [EXPIRED CLEANUP] No expired sandbox states found')
        return
      }
      
      let cleanedCount = 0
      for (const state of expiredStates) {
        try {
          await prisma.sandboxState.delete({
            where: { sandboxId: state.sandboxId }
          })
          cleanedCount++
          console.log(`🗑️ [EXPIRED CLEANUP] Removed expired sandbox state: ${state.sandboxId} (age: ${Math.round((Date.now() - (state.lastHeartbeatAt?.getTime() || state.createdAt.getTime())) / 60000)} minutes, status: ${state.status})`)
        } catch (error) {
          console.error(`❌ [EXPIRED CLEANUP] Failed to delete expired state ${state.sandboxId}:`, error)
        }
      }
      
      const duration = Date.now() - startTime
      console.log(`✅ [EXPIRED CLEANUP] Completed: cleaned ${cleanedCount}/${expiredStates.length} expired sandbox states in ${duration}ms`)
    }).catch(error => {
      console.error('❌ [EXPIRED CLEANUP] Failed to query expired states:', error)
    })
  }

  /**
   * Cleanup idle sandboxes
   */
  async cleanupIdleSandboxes(): Promise<void> {
    const startTime = Date.now()
    
    // Check cooldown period
    const timeSinceLastCleanup = startTime - this.lastIdleCleanupTime
    if (timeSinceLastCleanup < CLEANUP_CONFIG.IDLE_CLEANUP_COOLDOWN) {
      return
    }
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [IDLE CLEANUP] Daytona API key not configured, skipping cleanup')
      return
    }

    const daytona = new Daytona(getDaytonaClient())
    
    // Check sandbox count from Daytona first
    let daytonaSandboxCount = 0
    try {
      const sandboxes = await daytona.list()
      daytonaSandboxCount = sandboxes.length
    } catch (error) {
      console.error('❌ [IDLE CLEANUP] Failed to list sandboxes from Daytona:', error)
      return
    }
    
    // Skip if no sandboxes on Daytona
    if (daytonaSandboxCount === 0) {
      return
    }
    
    // Log only when there are sandboxes or in debug mode
    if (daytonaSandboxCount > 0 || this.isDebugMode) {
      console.log(`🧹 [IDLE CLEANUP] Starting cleanup - found ${daytonaSandboxCount} sandboxes`)
    }
    
    // Update last cleanup time
    this.lastIdleCleanupTime = startTime
    const now = Date.now()
    let cleanedCount = 0
    let errorCount = 0

    // Query idle sandboxes from database instead of memory
    const idleThreshold = new Date(now - CLEANUP_CONFIG.IDLE_TIMEOUT)
    const idleSandboxes = await prisma.sandboxState.findMany({
      where: {
        status: 'running',
        lastHeartbeatAt: {
          lt: idleThreshold
        }
      }
    })

    if (this.isDebugMode && idleSandboxes.length > 0) {
      console.log(`⏰ [IDLE CLEANUP] Found ${idleSandboxes.length} idle sandboxes from database`)
    }

    for (const sandboxState of idleSandboxes) {
      const sandboxId = sandboxState.sandboxId
      const idleTime = now - (sandboxState.lastHeartbeatAt?.getTime() || 0)
      
      if (this.isDebugMode) {
        console.log(`⏰ [IDLE CLEANUP] Processing idle sandbox: ${sandboxId} (idle for ${Math.round(idleTime / 60000)} minutes)`)
      }
      
      try {
        const sandboxExists = await verifySandboxExists(daytona, sandboxId)
        
        if (!sandboxExists) {
          if (this.isDebugMode) {
            console.log(`🗑️ [IDLE CLEANUP] Sandbox ${sandboxId} not found on Daytona, removing from database`)
          }
          // Remove from database
          await prisma.sandboxState.delete({
            where: { sandboxId }
          })
          cleanedCount++
          continue
        }
        
        // Delete from Daytona
        const sandbox = await daytona.get(sandboxId)
        await sandbox.delete()
        
        // Update status to stopped in database
        await prisma.sandboxState.update({
          where: { sandboxId },
          data: { 
            status: 'stopped',
            updatedAt: new Date()
          }
        })
        cleanedCount++
        
        if (this.isDebugMode) {
          console.log(`✅ [IDLE CLEANUP] Successfully cleaned up idle sandbox: ${sandboxId}`)
        }
        
      } catch (error: any) {
        errorCount++
        console.error(`❌ [IDLE CLEANUP] Failed to cleanup idle sandbox ${sandboxId}:`, error)
        
        // Update status to error in database
        await prisma.sandboxState.update({
          where: { sandboxId },
          data: { 
            status: 'error',
            error: error.message,
            updatedAt: new Date()
          }
        })
      }
    }

    const duration = Date.now() - startTime
    
    if (cleanedCount > 0 || errorCount > 0) {
      console.log(`✅ [IDLE CLEANUP] Completed: cleaned ${cleanedCount} idle sandboxes (${errorCount} errors) in ${duration}ms`)
    }
    
    // Memory cleanup is no longer needed since we use database
    // await this.cleanupMemoryStates()
  }

  /**
   * Cleanup memory states that don't match Daytona
   * @deprecated This method is no longer needed since we use database instead of memory
   */
  async cleanupMemoryStates(): Promise<void> {
    // This method is deprecated and no longer used
    // We now use database queries instead of memory management
    if (this.isDebugMode) {
      console.log('⚠️ [MEMORY CLEANUP] Method deprecated - using database instead of memory')
    }
  }

  /**
   * Sync database states with Daytona
   */
  async syncWithDaytona(): Promise<void> {
    console.log('🔄 [SYNC] Syncing database states with Daytona...')
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [SYNC] Daytona API key not configured, skipping sync')
      return
    }

    const daytona = new Daytona(getDaytonaClient())
    let syncedCount = 0
    let removedCount = 0

    try {
      // Get all sandbox states from database
      const dbStates = await prisma.sandboxState.findMany({
        select: { sandboxId: true, status: true }
      })

      const removedIds: string[] = []
      for (const dbState of dbStates) {
        try {
          const exists = await verifySandboxExists(daytona, dbState.sandboxId)
          if (!exists) {
            removedIds.push(`${dbState.sandboxId}:${dbState.status}`)
            await prisma.sandboxState.delete({
              where: { sandboxId: dbState.sandboxId }
            })
            removedCount++
          } else {
            syncedCount++
          }
        } catch (error) {
          console.error(`❌ [SYNC] Error checking sandbox ${dbState.sandboxId}:`, error)
        }
      }
      
      if (removedIds.length > 0) {
        console.log(`🗑️ [SYNC] Removed non-existent: [${removedIds.join(', ')}]`)
      }

      console.log(`✅ [SYNC] Completed: ${syncedCount} synced, ${removedCount} removed`)
    } catch (error) {
      console.error('❌ [SYNC] Failed to sync with Daytona:', error)
    }
  }

  /**
   * Cleanup stopped sandboxes
   */
  cleanupStoppedSandboxes(): void {
    const startTime = Date.now()
    
    console.log(`🧹 [STOPPED CLEANUP] Starting stopped sandboxes cleanup at ${new Date().toISOString()}`)
    
    // Query stopped/error states from database instead of memory
    const stoppedThreshold = new Date(Date.now() - CLEANUP_CONFIG.STOPPED_TIMEOUT)
    prisma.sandboxState.findMany({
      where: {
        status: { in: ['stopped', 'error'] },
        OR: [
          { lastHeartbeatAt: { lt: stoppedThreshold } },
          { createdAt: { lt: stoppedThreshold } }
        ]
      }
    }).then(async (stoppedStates) => {
      if (stoppedStates.length === 0) {
        console.log('⏭️ [STOPPED CLEANUP] No stopped/error sandbox states found')
        return
      }
      
      let cleanedCount = 0
      const removedIds: string[] = []
      
      for (const state of stoppedStates) {
        try {
          const stoppedTime = Date.now() - (state.lastHeartbeatAt?.getTime() || state.createdAt.getTime())
          removedIds.push(`${state.sandboxId}:${state.status}:${Math.round(stoppedTime / 60000)}m`)
          
          await prisma.sandboxState.delete({
            where: { sandboxId: state.sandboxId }
          })
          cleanedCount++
        } catch (error) {
          console.error(`❌ [STOPPED CLEANUP] Failed to delete stopped state ${state.sandboxId}:`, error)
        }
      }
      
      if (removedIds.length > 0) {
        console.log(`🗑️ [STOPPED CLEANUP] Removed: [${removedIds.join(', ')}]`)
      }

      const duration = Date.now() - startTime
      console.log(`✅ [STOPPED CLEANUP] Completed: cleaned ${cleanedCount}/${stoppedStates.length} stopped sandbox states in ${duration}ms`)
    }).catch(error => {
      console.error('❌ [STOPPED CLEANUP] Failed to query stopped states:', error)
    })
  }

  /**
   * Get cleanup service statistics
   */
  getStats(): CleanupStats {
    // Get stats from database instead of memory
    const now = Date.now()
    
    // Basic stats from database
    prisma.sandboxState.groupBy({
      by: ['status'],
      _count: { status: true }
    }).then(async (statusCounts) => {
      const stats = statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>)

      const totalStates = Object.values(stats).reduce((sum, count) => sum + count, 0)
      
      // Get oldest running and stopped sandboxes
      const oldestRunning = await prisma.sandboxState.findFirst({
        where: { status: 'running' },
        orderBy: { createdAt: 'asc' }
      })
      
      const oldestStopped = await prisma.sandboxState.findFirst({
        where: { status: 'stopped' },
        orderBy: { createdAt: 'asc' }
      })

      const basicStats = {
        total: totalStates,
        running: stats.running || 0,
        stopped: stats.stopped || 0,
        error: stats.error || 0,
        creating: stats.creating || 0,
        unknown: 0, // ไม่มี unknown status ในระบบ
      }

      const result: CleanupStats = {
        ...basicStats,
        isServiceRunning: this.isRunning,
        memoryUsage: process.memoryUsage(),
        lastCleanup: new Date().toISOString(),
        uptime: process.uptime(),
        oldestRunningAge: oldestRunning ? formatAge(oldestRunning.createdAt.getTime()) : 0,
        oldestStoppedAge: oldestStopped ? formatAge(oldestStopped.createdAt.getTime()) : 0,
        serviceHealth: {
          isRunning: this.isRunning,
          intervals: {
            expiredCleanup: !!this.cleanupInterval,
            idleCleanup: !!this.idleCheckInterval,
            stoppedCleanup: !!this.stoppedCleanupInterval
          }
        }
      }

      console.log('📊 [STATS] Database stats:', result)
    }).catch(error => {
      console.error('❌ [STATS] Failed to get database stats:', error)
    })

    // Return fallback stats for immediate response
    return {
      total: 0,
      running: 0,
      stopped: 0,
      error: 0,
      creating: 0,
      unknown: 0,
      isServiceRunning: this.isRunning,
      memoryUsage: process.memoryUsage(),
      lastCleanup: new Date().toISOString(),
      uptime: process.uptime(),
      oldestRunningAge: 0,
      oldestStoppedAge: 0,
      serviceHealth: {
        isRunning: this.isRunning,
        intervals: {
          expiredCleanup: !!this.cleanupInterval,
          idleCleanup: !!this.idleCheckInterval,
          stoppedCleanup: !!this.stoppedCleanupInterval
        }
      }
    }
  }

  /**
   * Schedule all cleanup intervals
   */
  private scheduleCleanups(): void {
    // Cleanup expired states every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredStates()
    }, CLEANUP_CONFIG.EXPIRED_INTERVAL)

    // Cleanup idle sandboxes every 5 minutes
    this.idleCheckInterval = setInterval(() => {
      this.cleanupIdleSandboxes()
    }, CLEANUP_CONFIG.IDLE_INTERVAL)

    // Cleanup stopped sandboxes every hour
    this.stoppedCleanupInterval = setInterval(() => {
      this.cleanupStoppedSandboxes()
    }, CLEANUP_CONFIG.STOPPED_INTERVAL)
  }

  /**
   * Clear all intervals
   */
  private clearAllIntervals(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval)
      this.idleCheckInterval = null
    }

    if (this.stoppedCleanupInterval) {
      clearInterval(this.stoppedCleanupInterval)
      this.stoppedCleanupInterval = null
    }
  }

  /**
   * Reset service state
   */
  private resetState(): void {
    this.lastIdleCleanupTime = 0
    this.isRunning = false
  }
}

