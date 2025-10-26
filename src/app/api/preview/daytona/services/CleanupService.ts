// services/CleanupService.ts
import { Daytona } from '@daytonaio/sdk'
import { daytonaConfig, getDaytonaClient } from '@/config/daytona'
import { SandboxState, CleanupStats } from '../models/SandboxState'
import { CLEANUP_CONFIG } from '../utils/constants'
import { verifySandboxExists, getSandboxStats, findOldestSandbox, formatAge } from '../utils/sandboxHelpers'

export class CleanupService {
  private static instance: CleanupService
  private cleanupInterval: NodeJS.Timeout | null = null
  private idleCheckInterval: NodeJS.Timeout | null = null
  private stoppedCleanupInterval: NodeJS.Timeout | null = null
  private isRunning = false
  private lastIdleCleanupTime = 0

  constructor(private sandboxStates: Map<string, SandboxState>) {}

  static getInstance(sandboxStates: Map<string, SandboxState>): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService(sandboxStates)
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
    
    const totalStates = this.sandboxStates.size
    if (totalStates === 0) {
      console.log('⏭️ [EXPIRED CLEANUP] No sandbox states in memory, skipping cleanup')
      return
    }
    
    console.log(`🧹 [EXPIRED CLEANUP] Starting expired states cleanup at ${new Date().toISOString()}`)
    
    const now = Date.now()
    let cleanedCount = 0

    for (const [sandboxId, state] of this.sandboxStates.entries()) {
      const lastActivity = state.lastHeartbeatAt || state.createdAt || 0
      const age = now - lastActivity
      if (age > CLEANUP_CONFIG.MAX_AGE) {
        console.log(`🗑️ [EXPIRED CLEANUP] Removing expired sandbox state: ${sandboxId} (age: ${Math.round(age / 60000)} minutes, status: ${state.status})`)
        this.sandboxStates.delete(sandboxId)
        cleanedCount++
      }
    }

    const duration = Date.now() - startTime
    console.log(`✅ [EXPIRED CLEANUP] Completed: cleaned ${cleanedCount}/${totalStates} expired sandbox states in ${duration}ms`)
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
    
    console.log(`🧹 [IDLE CLEANUP] Starting cleanup - found ${daytonaSandboxCount} sandboxes`)
    
    // Update last cleanup time
    this.lastIdleCleanupTime = startTime
    const now = Date.now()
    let cleanedCount = 0
    let errorCount = 0

    for (const [sandboxId, state] of this.sandboxStates.entries()) {
      if (state.status === 'running' && state.lastHeartbeatAt) {
        const idleTime = now - state.lastHeartbeatAt
        
        if (idleTime > CLEANUP_CONFIG.IDLE_TIMEOUT) {
          console.log(`⏰ [IDLE CLEANUP] Found idle sandbox: ${sandboxId} (idle for ${Math.round(idleTime / 60000)} minutes)`)
          
          try {
            const sandboxExists = await verifySandboxExists(daytona, sandboxId)
            
            if (!sandboxExists) {
              console.log(`🗑️ [IDLE CLEANUP] Sandbox ${sandboxId} not found on Daytona, removing from memory`)
              this.sandboxStates.delete(sandboxId)
              cleanedCount++
              continue
            }
            
            // Delete from Daytona
            const sandbox = await daytona.get(sandboxId)
            await sandbox.delete()
            
            // Update status to stopped
            this.sandboxStates.set(sandboxId, { ...state, status: 'stopped' })
            cleanedCount++
            
            console.log(`✅ [IDLE CLEANUP] Successfully cleaned up idle sandbox: ${sandboxId}`)
            
          } catch (error: any) {
            errorCount++
            console.error(`❌ [IDLE CLEANUP] Failed to cleanup idle sandbox ${sandboxId}:`, error)
            
            // Update status to error
            this.sandboxStates.set(sandboxId, { ...state, status: 'error', error: error.message })
          }
        }
      }
    }

    const duration = Date.now() - startTime
    
    if (cleanedCount > 0 || errorCount > 0) {
      console.log(`✅ [IDLE CLEANUP] Completed: cleaned ${cleanedCount} idle sandboxes (${errorCount} errors) in ${duration}ms`)
    }
    
    // Cleanup memory states after idle cleanup
    await this.cleanupMemoryStates()
  }

  /**
   * Cleanup memory states that don't match Daytona
   */
  async cleanupMemoryStates(): Promise<void> {
    const startTime = Date.now()
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [MEMORY CLEANUP] Daytona API key not configured, skipping cleanup')
      return
    }

    const daytona = new Daytona(getDaytonaClient())
    let cleanedCount = 0
    let errorCount = 0
    
    // Get all sandbox IDs from Daytona first
    let daytonaSandboxIds: string[] = []
    try {
      const sandboxes = await daytona.list()
      daytonaSandboxIds = sandboxes.map(s => s.id)
      console.log(`📊 [MEMORY CLEANUP] Found ${daytonaSandboxIds.length} sandboxes on Daytona`)
    } catch (error) {
      console.error('❌ [MEMORY CLEANUP] Failed to list sandboxes from Daytona:', error)
      return
    }
    
    // Skip if no sandboxes on Daytona
    if (daytonaSandboxIds.length === 0) {
      console.log('⏭️ [MEMORY CLEANUP] No sandboxes on Daytona, skipping cleanup')
      return
    }
    
    console.log(`🧹 [MEMORY CLEANUP] Starting memory states cleanup at ${new Date().toISOString()}`)
    
    // Show sandbox lists for debugging
    const memorySandboxIds = Array.from(this.sandboxStates.keys())
    console.log(`📋 [MEMORY CLEANUP] Daytona: [${daytonaSandboxIds.join(', ')}], Memory: [${memorySandboxIds.join(', ')}]`)
    
    // Check sandbox in memory against Daytona
    const orphanedIds: string[] = []
    for (const [sandboxId, state] of this.sandboxStates.entries()) {
      try {
        if (!daytonaSandboxIds.includes(sandboxId)) {
          orphanedIds.push(`${sandboxId}:${state.status}`)
          this.sandboxStates.delete(sandboxId)
          cleanedCount++
        }
      } catch (error) {
        errorCount++
        console.error(`❌ [MEMORY CLEANUP] Error checking sandbox ${sandboxId}:`, error)
      }
    }
    
    if (orphanedIds.length > 0) {
      console.log(`🗑️ [MEMORY CLEANUP] Removed orphaned: [${orphanedIds.join(', ')}]`)
    }
    
    const duration = Date.now() - startTime
    console.log(`✅ [MEMORY CLEANUP] Completed: cleaned ${cleanedCount} orphaned states (${errorCount} errors) in ${duration}ms`)
  }

  /**
   * Sync memory states with Daytona
   */
  async syncWithDaytona(): Promise<void> {
    console.log('🔄 [SYNC] Syncing memory states with Daytona...')
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [SYNC] Daytona API key not configured, skipping sync')
      return
    }

    const daytona = new Daytona(getDaytonaClient())
    let syncedCount = 0
    let removedCount = 0

    const removedIds: string[] = []
    for (const [sandboxId, state] of this.sandboxStates.entries()) {
      try {
        const exists = await verifySandboxExists(daytona, sandboxId)
        if (!exists) {
          removedIds.push(`${sandboxId}:${state.status}`)
          this.sandboxStates.delete(sandboxId)
          removedCount++
        } else {
          syncedCount++
        }
      } catch (error) {
        console.error(`❌ [SYNC] Error checking sandbox ${sandboxId}:`, error)
      }
    }
    
    if (removedIds.length > 0) {
      console.log(`🗑️ [SYNC] Removed non-existent: [${removedIds.join(', ')}]`)
    }

    console.log(`✅ [SYNC] Completed: ${syncedCount} synced, ${removedCount} removed`)
  }

  /**
   * Cleanup stopped sandboxes
   */
  cleanupStoppedSandboxes(): void {
    const startTime = Date.now()
    
    const stoppedStates = Array.from(this.sandboxStates.values()).filter(s => s.status === 'stopped' || s.status === 'error')
    if (stoppedStates.length === 0) {
      console.log('⏭️ [STOPPED CLEANUP] No stopped/error sandbox states, skipping cleanup')
      return
    }
    
    console.log(`🧹 [STOPPED CLEANUP] Starting stopped sandboxes cleanup at ${new Date().toISOString()}`)
    
    const now = Date.now()
    let cleanedCount = 0

    const removedIds: string[] = []
    for (const [sandboxId, state] of this.sandboxStates.entries()) {
      if (state.status === 'stopped' || state.status === 'error') {
        const lastActivity = state.lastHeartbeatAt || state.createdAt || 0
        const stoppedTime = now - lastActivity
        
        if (stoppedTime > CLEANUP_CONFIG.STOPPED_TIMEOUT) {
          removedIds.push(`${sandboxId}:${state.status}:${Math.round(stoppedTime / 60000)}m`)
          this.sandboxStates.delete(sandboxId)
          cleanedCount++
        }
      }
    }
    
    if (removedIds.length > 0) {
      console.log(`🗑️ [STOPPED CLEANUP] Removed: [${removedIds.join(', ')}]`)
    }

    const duration = Date.now() - startTime
    console.log(`✅ [STOPPED CLEANUP] Completed: cleaned ${cleanedCount}/${stoppedStates.length} stopped sandbox states in ${duration}ms`)
  }

  /**
   * Get cleanup service statistics
   */
  getStats(): CleanupStats {
    const basicStats = getSandboxStats(this.sandboxStates)
    const now = Date.now()
    const oldestRunning = findOldestSandbox(this.sandboxStates, 'running')
    const oldestStopped = findOldestSandbox(this.sandboxStates, 'stopped')

    return {
      ...basicStats,
      isServiceRunning: this.isRunning,
      memoryUsage: process.memoryUsage(),
      lastCleanup: new Date().toISOString(),
      uptime: process.uptime(),
      oldestRunningAge: oldestRunning ? formatAge(oldestRunning.createdAt || 0) : 0,
      oldestStoppedAge: oldestStopped ? formatAge(oldestStopped.createdAt || 0) : 0,
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

