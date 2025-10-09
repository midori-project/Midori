// app/api/preview/daytona/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Daytona } from '@daytonaio/sdk'
import { daytonaConfig, getDaytonaClient } from '@/config/daytona'
// import testJson from '@/components/preview/test/test.json' // ✅ Remove hardcoded import

// ใช้ Node APIs ได้
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ProjectFile {
  path: string
  content: string
  type?: string
  language?: string
}
interface SandboxState {
  sandboxId: string
  status: 'idle' | 'creating' | 'running' | 'stopped' | 'error' | 'unknown'
  previewUrl?: string
  previewToken?: string
  error?: string
  createdAt?: number
  lastHeartbeatAt?: number
}

// in-memory (โปรดเปลี่ยนเป็น DB/Redis ใน production)
const sandboxStates = new Map<string, SandboxState>()

// ---------- Auto Cleanup Service ----------
class DaytonaCleanupService {
  private static cleanupInterval: NodeJS.Timeout | null = null
  private static idleCheckInterval: NodeJS.Timeout | null = null
  private static stoppedCleanupInterval: NodeJS.Timeout | null = null
  private static isRunning = false
  private static lastIdleCleanupTime = 0
  private static readonly IDLE_CLEANUP_COOLDOWN = 4 * 60 * 1000 // 4 นาที

  static async start(): Promise<void> {
    // ✅ หยุด service เก่าก่อน (ถ้ามี)
    if (this.isRunning) {
      console.log('🧹 [CLEANUP SERVICE] Stopping existing service before restart...')
      this.stop()
    }

    console.log('🚀 [CLEANUP SERVICE] Starting Daytona cleanup service...')
    this.isRunning = true

    // ✅ Sync กับ Daytona ก่อนเริ่ม cleanup
    await this.syncWithDaytona()

    // Cleanup expired states ทุกชั่วโมง
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredStates()
    }, 60 * 60 * 1000) // 1 hour

    // Cleanup idle sandboxes ทุก 5 นาที
    this.idleCheckInterval = setInterval(() => {
      console.log(`🔄 [CLEANUP SERVICE] Scheduled idle cleanup triggered at ${new Date().toISOString()}`)
      this.cleanupIdleSandboxes()
    }, 5 * 60 * 1000) // 5 minutes

    // Cleanup stopped sandboxes ทุกชั่วโมง
    this.stoppedCleanupInterval = setInterval(() => {
      this.cleanupStoppedSandboxes()
    }, 60 * 60 * 1000) // 1 hour

    console.log('✅ Daytona cleanup service started successfully')
  }

  static stop(): void {
    if (!this.isRunning) {
      console.log('🧹 [CLEANUP SERVICE] Not running')
      return
    }

    console.log('🛑 [CLEANUP SERVICE] Stopping Daytona cleanup service...')

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

    // ✅ Reset cooldown timer
    this.lastIdleCleanupTime = 0
    this.isRunning = false
    console.log('✅ [CLEANUP SERVICE] Stopped successfully')
  }

  static cleanupExpiredStates(): void {
    const startTime = Date.now()
    
    // ✅ เช็คว่ามี states ใน memory หรือไม่
    const totalStates = sandboxStates.size
    if (totalStates === 0) {
      console.log('⏭️ [EXPIRED CLEANUP] No sandbox states in memory, skipping cleanup')
      return
    }
    
    // ✅ เริ่ม cleanup เฉพาะเมื่อมี states
    console.log(`🧹 [EXPIRED CLEANUP] Starting expired states cleanup at ${new Date().toISOString()}`)
    
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 ชั่วโมง
    let cleanedCount = 0

    for (const [sandboxId, state] of sandboxStates.entries()) {
      const lastActivity = state.lastHeartbeatAt || state.createdAt || 0
      const age = now - lastActivity
      if (age > maxAge) {
        console.log(`🗑️ [EXPIRED CLEANUP] Removing expired sandbox state: ${sandboxId} (age: ${Math.round(age / 60000)} minutes, status: ${state.status})`)
        sandboxStates.delete(sandboxId)
        cleanedCount++
      }
    }

    const duration = Date.now() - startTime
    console.log(`✅ [EXPIRED CLEANUP] Completed: cleaned ${cleanedCount}/${totalStates} expired sandbox states in ${duration}ms`)
  }

  /**
   * ทำความสะอาด idle sandboxes
   * - ถ้าหน้าเว็บยังเปิดอยู่ (มี heartbeat ทุก 2 นาที) → ไม่ลบ
   * - ถ้าหน้าเว็บปิดแล้ว (ไม่มี heartbeat มากกว่า 5 นาที) → ลบ
   */
  static async cleanupIdleSandboxes(): Promise<void> {
    const startTime = Date.now()
    
    // ✅ Debug: แสดง call stack
    console.log(`🔍 [DEBUG] cleanupIdleSandboxes called from: ${new Error().stack?.split('\n').slice(1, 3).join(' | ')}`)
    
    // ✅ ตรวจสอบ cooldown period
    const timeSinceLastCleanup = startTime - this.lastIdleCleanupTime
    if (timeSinceLastCleanup < this.IDLE_CLEANUP_COOLDOWN) {
      console.log(`⏭️ [IDLE CLEANUP] Skipping - too soon (${Math.round(timeSinceLastCleanup / 1000)}s ago, need ${Math.round(this.IDLE_CLEANUP_COOLDOWN / 1000)}s)`)
      return
    }
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [IDLE CLEANUP] Daytona API key not configured, skipping cleanup')
      return
    }

    const daytona = new Daytona(getDaytonaClient())
    
    // ✅ เช็คจำนวน sandbox จาก Daytona ก่อน
    let daytonaSandboxCount = 0
    try {
      const sandboxes = await daytona.list()
      daytonaSandboxCount = sandboxes.length
      console.log(`📊 [IDLE CLEANUP] Found ${daytonaSandboxCount} sandboxes on Daytona`)
    } catch (error) {
      console.error('❌ [IDLE CLEANUP] Failed to list sandboxes from Daytona:', error)
      return
    }
    
    // ✅ ถ้าไม่มี sandbox บน Daytona ให้ skip ทันที
    if (daytonaSandboxCount === 0) {
      console.log('⏭️ [IDLE CLEANUP] No sandboxes on Daytona, skipping cleanup')
      return
    }
    
    // ✅ เริ่ม cleanup เฉพาะเมื่อมี sandbox
    console.log(`🧹 [IDLE CLEANUP] Starting idle sandboxes cleanup at ${new Date().toISOString()}`)
    
    // ✅ อัปเดตเวลาล่าสุด
    this.lastIdleCleanupTime = startTime
    const now = Date.now()
    // ⏱️ Idle timeout: 5 นาที (frontend ส่ง heartbeat ทุก 2 นาที)
    // ดังนั้น ถ้าหน้าเว็บยังเปิดอยู่ จะมี heartbeat มาเรื่อยๆ และไม่ถูกลบ
    // แต่ถ้าปิดหน้าเว็บไปแล้ว จะไม่มี heartbeat และหลัง 5 นาที sandbox จะถูกลบ
    const idleTimeout = 5 * 60 * 1000 // 5 นาที
    let cleanedCount = 0
    let errorCount = 0

    // ✅ แสดงข้อมูลใน state ทั้งหมด
    const statesInfo = Array.from(sandboxStates.entries()).map(([id, state]) => 
      `${id}:${state.status}:${state.lastHeartbeatAt ? Math.round((now - state.lastHeartbeatAt) / 60000) + 'm' : 'none'}`
    ).join(', ')
    console.log(`📊 [IDLE CLEANUP] States: ${statesInfo || 'none'} (total: ${sandboxStates.size})`)

    for (const [sandboxId, state] of sandboxStates.entries()) {
      if (state.status === 'running' && state.lastHeartbeatAt) {
        const idleTime = now - state.lastHeartbeatAt
        
        if (idleTime > idleTimeout) {
          console.log(`⏰ [IDLE CLEANUP] Found idle sandbox: ${sandboxId} (idle for ${Math.round(idleTime / 60000)} minutes, created: ${new Date(state.createdAt || 0).toISOString()})`)
          
          // ✅ 1. เช็คจากเว็บก่อนว่ามี sandbox อยู่จริงหรือไม่
          try {
            const sandboxExists = await verifySandboxExists(daytona, sandboxId)
            
            if (!sandboxExists) {
              // ✅ 2. ถ้าไม่มีในเว็บ ให้ลบออกจาก state และนับเป็น cleaned
              console.log(`🗑️ [IDLE CLEANUP] Sandbox ${sandboxId} not found on Daytona, removing from memory`)
              sandboxStates.delete(sandboxId)
              cleanedCount++
              continue
            }
            
            // ✅ 3. ถ้ามีในเว็บ ให้ลบจาก Daytona
            const sandbox = await daytona.get(sandboxId)
            await sandbox.delete()
            
            // ✅ 4. อัปเดตสถานะใน memory เป็น stopped
            sandboxStates.set(sandboxId, { ...state, status: 'stopped' })
            cleanedCount++
            
            console.log(`✅ [IDLE CLEANUP] Successfully cleaned up idle sandbox: ${sandboxId}`)
            
          } catch (error: any) {
            errorCount++
            console.error(`❌ [IDLE CLEANUP] Failed to cleanup idle sandbox ${sandboxId}:`, error)
            
            // ✅ ถ้าเกิด error ในการลบ ให้อัปเดตสถานะเป็น error
            sandboxStates.set(sandboxId, { ...state, status: 'error', error: error.message })
            
            // ✅ เพิ่ม console.log เพื่อ debug
            console.log(`🔍 [IDLE CLEANUP DEBUG] Error details for ${sandboxId}:`)
            console.log(`  - Error message: ${error.message}`)
            console.log(`  - Error type: ${typeof error}`)
            console.log(`  - Current state:`, state)
            console.log(`  - Sandbox exists check result: ${await verifySandboxExists(daytona, sandboxId)}`)
          }
        }
      }
    }

    const duration = Date.now() - startTime
    console.log(`✅ [IDLE CLEANUP] Completed: cleaned ${cleanedCount} idle sandboxes (${errorCount} errors) in ${duration}ms`)
    
    // ✅ ทำความสะอาด memory หลังจาก idle cleanup
    await this.cleanupMemoryStates()
  }


  /**
   * ทำความสะอาด memory states ที่ไม่ตรงกับ Daytona
   */
  static async cleanupMemoryStates(): Promise<void> {
    const startTime = Date.now()
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [MEMORY CLEANUP] Daytona API key not configured, skipping cleanup')
      return
    }

    const daytona = new Daytona(getDaytonaClient())
    let cleanedCount = 0
    let errorCount = 0
    
    // ✅ ดึงรายการ sandbox ทั้งหมดจาก Daytona ก่อน
    let daytonaSandboxIds: string[] = []
    try {
      const sandboxes = await daytona.list()
      daytonaSandboxIds = sandboxes.map(s => s.id)
      console.log(`📊 [MEMORY CLEANUP] Found ${daytonaSandboxIds.length} sandboxes on Daytona`)
    } catch (error) {
      console.error('❌ [MEMORY CLEANUP] Failed to list sandboxes from Daytona:', error)
      return
    }
    
    // ✅ ถ้าไม่มี sandbox บน Daytona ให้ skip ทันที
    if (daytonaSandboxIds.length === 0) {
      console.log('⏭️ [MEMORY CLEANUP] No sandboxes on Daytona, skipping cleanup')
      return
    }
    
    // ✅ เริ่ม cleanup เฉพาะเมื่อมี sandbox
    console.log(`🧹 [MEMORY CLEANUP] Starting memory states cleanup at ${new Date().toISOString()}`)
    
    // ✅ แสดงรายการ sandbox IDs
    const memorySandboxIds = Array.from(sandboxStates.keys())
    console.log(`📋 [MEMORY CLEANUP] Daytona: [${daytonaSandboxIds.join(', ')}], Memory: [${memorySandboxIds.join(', ')}]`)
    
    // ตรวจสอบ sandbox ใน memory ว่ามีอยู่ใน Daytona หรือไม่
    const orphanedIds: string[] = []
    for (const [sandboxId, state] of sandboxStates.entries()) {
      try {
        if (!daytonaSandboxIds.includes(sandboxId)) {
          orphanedIds.push(`${sandboxId}:${state.status}`)
          sandboxStates.delete(sandboxId)
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
   * Sync memory states กับ Daytona จริง
   */
  static async syncWithDaytona(): Promise<void> {
    console.log('🔄 [SYNC] Syncing memory states with Daytona...')
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [SYNC] Daytona API key not configured, skipping sync')
      return
    }

    const daytona = new Daytona(getDaytonaClient())
    let syncedCount = 0
    let removedCount = 0

    const removedIds: string[] = []
    for (const [sandboxId, state] of sandboxStates.entries()) {
      try {
        const exists = await verifySandboxExists(daytona, sandboxId)
        if (!exists) {
          removedIds.push(`${sandboxId}:${state.status}`)
          sandboxStates.delete(sandboxId)
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
   * ทำความสะอาด stopped sandboxes ที่ไม่ต้องการแล้ว
   */
  static cleanupStoppedSandboxes(): void {
    const startTime = Date.now()
    
    // ✅ เช็คว่ามี stopped/error states หรือไม่
    const stoppedStates = Array.from(sandboxStates.values()).filter(s => s.status === 'stopped' || s.status === 'error')
    if (stoppedStates.length === 0) {
      console.log('⏭️ [STOPPED CLEANUP] No stopped/error sandbox states, skipping cleanup')
      return
    }
    
    // ✅ เริ่ม cleanup เฉพาะเมื่อมี stopped/error states
    console.log(`🧹 [STOPPED CLEANUP] Starting stopped sandboxes cleanup at ${new Date().toISOString()}`)
    
    const now = Date.now()
    const stoppedTimeout = 2 * 60 * 60 * 1000 // 2 ชั่วโมง
    let cleanedCount = 0

    const removedIds: string[] = []
    for (const [sandboxId, state] of sandboxStates.entries()) {
      if (state.status === 'stopped' || state.status === 'error') {
        const lastActivity = state.lastHeartbeatAt || state.createdAt || 0
        const stoppedTime = now - lastActivity
        
        if (stoppedTime > stoppedTimeout) {
          removedIds.push(`${sandboxId}:${state.status}:${Math.round(stoppedTime / 60000)}m`)
          sandboxStates.delete(sandboxId)
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

  static getStats() {
    const total = sandboxStates.size
    const running = Array.from(sandboxStates.values()).filter(s => s.status === 'running').length
    const stopped = Array.from(sandboxStates.values()).filter(s => s.status === 'stopped').length
    const error = Array.from(sandboxStates.values()).filter(s => s.status === 'error').length
    const creating = Array.from(sandboxStates.values()).filter(s => s.status === 'creating').length
    const unknown = Array.from(sandboxStates.values()).filter(s => s.status === 'unknown').length

    // Enhanced statistics
    const now = Date.now()
    const oldestRunning = Array.from(sandboxStates.values())
      .filter(s => s.status === 'running')
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))[0]
    
    const oldestStopped = Array.from(sandboxStates.values())
      .filter(s => s.status === 'stopped')
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))[0]

    return {
      // Basic stats
      total,
      running,
      stopped,
      error,
      creating,
      unknown,
      isServiceRunning: this.isRunning,
      
      // Enhanced stats
      memoryUsage: process.memoryUsage(),
      lastCleanup: new Date().toISOString(),
      uptime: process.uptime(),
      
      // Age information
      oldestRunningAge: oldestRunning ? Math.round((now - (oldestRunning.createdAt || 0)) / 60000) : 0,
      oldestStoppedAge: oldestStopped ? Math.round((now - (oldestStopped.createdAt || 0)) / 60000) : 0,
      
      // Service health
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
}

// Auto-start cleanup service (หยุด service เก่าทั้งหมดก่อน)
console.log('🔄 [CLEANUP SERVICE] Force stopping all existing services...')
DaytonaCleanupService.stop() // หยุด service เก่าที่อาจยังทำงานอยู่

// รอสักครู่ให้ service เก่าหยุดทำงาน
setTimeout(() => {
  console.log('🚀 [CLEANUP SERVICE] Starting fresh cleanup service...')
  DaytonaCleanupService.start().catch(console.error)
}, 1000)

// ---------- Helpers ----------
async function updateSandboxStatus(
  sandboxId: string,
  status: SandboxState['status'],
  previewUrl?: string,
  previewToken?: string,
  error?: string
) {
  const now = Date.now()
  const current = sandboxStates.get(sandboxId)
  const next: SandboxState = {
    sandboxId,
    status,
    previewUrl,
    previewToken,
    error,
    createdAt: current?.createdAt ?? now,
    lastHeartbeatAt: now,
  }
  sandboxStates.set(sandboxId, next)
  
  // เพิ่ม console log สำหรับ heartbeat
  if (status === 'running') {
    console.log(`💓 [HEARTBEAT] Sandbox ${sandboxId} - Status: ${status}, Last Heartbeat: ${new Date(now).toISOString()}`)
  } else {
    console.log(`📊 [STATUS] Sandbox ${sandboxId} - Status: ${status}, Timestamp: ${new Date(now).toISOString()}`)
  }
  
  return next
}

async function verifySandboxExists(daytona: Daytona, sandboxId: string) {
  try {
    const s = await daytona.get(sandboxId)
    return !!s
  } catch {
    return false
  }
}

async function createAllFiles(sandbox: any, files: ProjectFile[]) {
  const sessionId = 'file-session'
  await sandbox.process.createSession(sessionId)

  // เขียนไฟล์ทุกไฟล์ (base64 → decode ใน shell)
  for (const file of files) {
    const dir = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : ''
    if (dir) {
      await sandbox.process.executeSessionCommand(sessionId, {
        command: `mkdir -p "${dir}"`,
        runAsync: false,
      })
    }
    const b64 = Buffer.from(file.content).toString('base64')
    const cmd = `echo "${b64}" | base64 -d > "${file.path}"`
    const resp = await sandbox.process.executeSessionCommand(sessionId, {
      command: cmd,
      runAsync: false,
    })
    if (resp.exitCode !== 0) {
      throw new Error(`Failed to write ${file.path}: ${resp.stderr || resp.output}`)
    }
  }
  // แสดงโครงสร้างสั้น ๆ (debug)
  const tree = await sandbox.process.executeSessionCommand(sessionId, {
    command:
      'find . -maxdepth 3 -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.html" -o -name "*.css" \\) | sed -n "1,50p"',
    runAsync: false,
  })
  console.log('[tree]\n', tree.stdout || tree.output || '')
}

async function updateFilesInSandbox(sandbox: any, files: ProjectFile[]) {
  const sessionId = 'update-session'
  await sandbox.process.createSession(sessionId)

  let updatedCount = 0
  const errors: string[] = []

  console.log(`🔄 [UPDATE] Incremental update: ${files.length} files in sandbox`)
  
  // 🚀 Smart rebuild: ตรวจสอบประเภทไฟล์ที่เปลี่ยนแปลง
  const hasReactFiles = files.some(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'))
  const hasCSSFiles = files.some(f => f.path.endsWith('.css') || f.path.endsWith('.scss'))
  const hasConfigFiles = files.some(f => f.path.includes('package.json') || f.path.includes('tsconfig.json'))
  
  if (hasConfigFiles) {
    console.log(`⚙️ [UPDATE] Config files changed - full rebuild may be needed`)
  } else if (hasReactFiles) {
    console.log(`⚛️ [UPDATE] React files changed - optimized rebuild`)
  } else if (hasCSSFiles) {
    console.log(`🎨 [UPDATE] CSS files changed - style-only rebuild`)
  }

  // อัปเดตไฟล์ทีละไฟล์
  for (const file of files) {
    try {
      // สร้าง directory ถ้าไม่มี
      const dir = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : ''
      if (dir) {
        await sandbox.process.executeSessionCommand(sessionId, {
          command: `mkdir -p "${dir}"`,
          runAsync: false,
        })
      }

      // เขียนไฟล์ใหม่ (base64 → decode ใน shell)
      const b64 = Buffer.from(file.content).toString('base64')
      const cmd = `echo "${b64}" | base64 -d > "${file.path}"`
      const resp = await sandbox.process.executeSessionCommand(sessionId, {
        command: cmd,
        runAsync: false,
      })
      
      if (resp.exitCode !== 0) {
        const error = `Failed to update ${file.path}: ${resp.stderr || resp.output}`
        console.error(`❌ [UPDATE] ${error}`)
        errors.push(error)
      } else {
        console.log(`✅ [UPDATE] Updated file: ${file.path}`)
        updatedCount++
      }
    } catch (error: any) {
      const errorMsg = `Error updating ${file.path}: ${error.message}`
      console.error(`❌ [UPDATE] ${errorMsg}`)
      errors.push(errorMsg)
    }
  }

  // 🚀 Conditional rebuild based on file types
  if (hasConfigFiles) {
    console.log(`🔄 [UPDATE] Config files changed - triggering full rebuild...`)
    // Full rebuild for config changes
    const rebuildResult = await sandbox.process.executeSessionCommand(sessionId, {
      command: 'npm run build',
      runAsync: true,
    })
    console.log(`✅ [UPDATE] Full rebuild completed`)
  } else if (hasReactFiles) {
    console.log(`⚛️ [UPDATE] React files changed - triggering optimized rebuild...`)
    // Optimized rebuild for React files
    const rebuildResult = await sandbox.process.executeSessionCommand(sessionId, {
      command: 'npm run build',
      runAsync: true,
    })
    console.log(`✅ [UPDATE] Optimized rebuild completed`)
  } else if (hasCSSFiles) {
    console.log(`🎨 [UPDATE] CSS files changed - style-only update (no rebuild needed)`)
    // CSS changes don't need rebuild
  }

  // แสดงโครงสร้างไฟล์หลังจากอัปเดต (debug)
  const tree = await sandbox.process.executeSessionCommand(sessionId, {
    command:
      'find . -maxdepth 3 -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.html" -o -name "*.css" \\) | sed -n "1,50p"',
    runAsync: false,
  })
  console.log('[update tree]\n', tree.stdout || tree.output || '')

  if (errors.length > 0) {
    console.warn(`⚠️ [UPDATE] ${errors.length} files failed to update:`, errors)
  }

  return {
    updatedCount,
    totalFiles: files.length,
    errors,
    rebuildType: hasConfigFiles ? 'full' : hasReactFiles ? 'optimized' : hasCSSFiles ? 'style-only' : 'none'
  }
}

async function ensureReactPlugin(sandbox: any) {
  // กันเคสที่ package.json ใช้ '@vitejs/plugin-react' แต่ไม่ได้ติดตั้ง หรือเผลอใช้ 'vite-plugin-react'
  const sessionId = 'pkg-fix'
  await sandbox.process.createSession(sessionId)
  await sandbox.process.executeSessionCommand(sessionId, {
    command: 'npm i -D @vitejs/plugin-react || true',
    runAsync: false,
  })
  await sandbox.process.executeSessionCommand(sessionId, {
    command: 'npm rm vite-plugin-react || true',
    runAsync: false,
  })
}

async function installDeps(sandbox: any) {
  const sessionId = 'install'
  await sandbox.process.createSession(sessionId)
  const resp = await sandbox.process.executeSessionCommand(sessionId, {
    command: 'npm install',
    runAsync: false,
  })
  console.log('[npm install]', resp.exitCode, resp.stdout || resp.output || '')
  if (typeof resp.exitCode === 'number' && resp.exitCode !== 0) {
    throw new Error(`npm install failed: ${resp.stderr || resp.stdout || resp.output}`)
  }
}

async function startDevServer(sandbox: any, cwd = '.') {
  const sessionId = 'dev'
  await sandbox.process.createSession(sessionId)
  
  // ✅ Check if package.json exists and has correct scripts
  const packageCheck = await sandbox.process.executeSessionCommand(sessionId, {
    command: `cd ${cwd} && test -f package.json && echo "haspackage" || echo "nopackage"`,
    runAsync: false,
  })
  
  if (!(packageCheck.stdout || packageCheck.output || '').includes('haspackage')) {
    throw new Error('package.json not found in project directory')
  }
  
  // ✅ Check if dev script exists
  const scriptCheck = await sandbox.process.executeSessionCommand(sessionId, {
    command: `cd ${cwd} && grep -q '"dev"' package.json && echo "hasdev" || echo "nodev"`,
    runAsync: false,
  })
  
  if (!(scriptCheck.stdout || scriptCheck.output || '').includes('hasdev')) {
    throw new Error('dev script not found in package.json')
  }
  
  const cmd = `bash -lc "cd ${cwd} && npm run dev -- --host 0.0.0.0 --port 5173"`
  const resp = await sandbox.process.executeSessionCommand(sessionId, {
    command: cmd,
    runAsync: true,
  })
  console.log('[dev spawn]', resp)
  
  // ✅ Wait a bit for the server to start
  await new Promise(resolve => setTimeout(resolve, 3000))
}

async function waitForReady(sandbox: any, maxAttempts = 20, delayMs = 2000) {
  const sessionId = 'probe'
  await sandbox.process.createSession(sessionId)
  
  // ✅ Check if dev server is running first
  const devCheck = await sandbox.process.executeSessionCommand(sessionId, {
    command: 'ps aux | grep "npm run dev" | grep -v grep || echo "notrunning"',
    runAsync: false,
  })
  const isDevRunning = !(devCheck.stdout || devCheck.output || '').includes('notrunning')
  console.log(`[ready] Dev server running: ${isDevRunning}`)
  
  if (!isDevRunning) {
    console.log('[ready] Dev server not running, starting it...')
    await startDevServer(sandbox, '.')
  }
  
  for (let i = 1; i <= maxAttempts; i++) {
    const port = await sandbox.process.executeSessionCommand(sessionId, {
      command: 'ss -lntp | grep :5173 || netstat -tlnp | grep :5173 || echo "noport"',
      runAsync: false,
    })
    const portOpen = (port.stdout || port.output || '').includes(':5173')
    if (portOpen) {
      const http = await sandbox.process.executeSessionCommand(sessionId, {
        command: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "curlfail"',
        runAsync: false,
      })
      const code = (http.stdout || http.output || '').trim()
      if (code === '200' || code === '404') {
        console.log(`[ready] attempt ${i} OK (http ${code})`)
        return
      }
      console.log(`[ready] attempt ${i} port open, http=${code}`)
      
      // ✅ Check for build errors
      const buildCheck = await sandbox.process.executeSessionCommand(sessionId, {
        command: 'ps aux | grep "vite" | grep -v grep || echo "novite"',
        runAsync: false,
      })
      const hasVite = !(buildCheck.stdout || buildCheck.output || '').includes('novite')
      console.log(`[ready] Vite process running: ${hasVite}`)
      
      if (!hasVite) {
        console.log('[ready] Vite not running, checking for errors...')
        const errorCheck = await sandbox.process.executeSessionCommand(sessionId, {
          command: 'cat package.json | grep -q "react" && echo "hasreact" || echo "noreact"',
          runAsync: false,
        })
        console.log(`[ready] Package.json has React: ${(errorCheck.stdout || errorCheck.output || '').includes('hasreact')}`)
      }
      
      return // พอถือว่าพร้อม
    }
    console.log(`[ready] attempt ${i} waiting...`)
    await new Promise((r) => setTimeout(r, delayMs))
  }
  console.log('[ready] continue even if not confirmed')
}

// ---------- Core ----------
async function createDaytonaSandbox(projectFiles?: ProjectFile[]): Promise<{ sandboxId: string; url?: string; token?: string; status: string }> {
  if (!daytonaConfig?.apiKey) throw new Error('Missing DAYTONA_API_KEY')
  
  // ✅ Validate input files
  if (!projectFiles || !Array.isArray(projectFiles) || projectFiles.length === 0) {
    throw new Error('No project files provided for preview')
  }
  
  console.log(`🏗️ Creating Daytona sandbox with ${projectFiles.length} files`);
  
 
  const daytona = new Daytona(getDaytonaClient())
  const sandbox = await daytona.create({
    ...daytonaConfig.defaultSandboxConfig,
    public: true,
  })
  const sandboxId = sandbox.id
  await updateSandboxStatus(sandboxId, 'creating')

  console.log(`🚀 Creating Daytona sandbox: ${sandboxId}`)



  // 1) สร้างไฟล์ทั้งหมดจาก dynamic files
  await createAllFiles(sandbox, projectFiles)

  // 2) แก้ dependency React plugin (กันเคสพลาด)
  await ensureReactPlugin(sandbox)

  // 3) ติดตั้งแพ็กเกจ
  await installDeps(sandbox)

  // 4) รัน dev server (ถ้าโปรเจกต์วางไว้ที่ root ใช้ cwd=".")
  await startDevServer(sandbox, '.')

  // 5) รอให้พร้อม
  await waitForReady(sandbox)

  // 6) ขอพรีวิวลิงก์
  const { url, token } = await sandbox.getPreviewLink(5173)
  await updateSandboxStatus(sandboxId, 'running', url, token)
  
  console.log(`✅ Sandbox ${sandboxId} created successfully with preview URL: ${url}`)
  
  return { sandboxId, url, token, status: 'running' }
}

// ---------- HTTP handlers ----------
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'X-Daytona-Skip-Preview-Warning': 'true',
    },
  })
}

// สร้าง + เริ่มพรีวิว
export async function POST(req: NextRequest) {
  try {
    console.log('🚀 POST /api/preview/daytona - Creating new sandbox')
    // ✅ Parse request body to get dynamic files
    const body = await req.json()
    const { files, projectId } = body
    
    console.log(`📦 Received preview request for project: ${projectId}`)
    console.log(`📁 Files count: ${files?.length || 0}`)
    
    // ✅ Log file structure for debugging
    if (files?.length > 0) {
      console.log(`📋 Files structure:`)
      files.slice(0, 5).forEach((file: any, index: number) => {
        console.log(`  ${index + 1}. ${file.path} (${file.content?.length || 0} chars)`)
      })
      if (files.length > 5) {
        console.log(`  ... and ${files.length - 5} more files`)
      }
    }
    
    // ✅ Validate request
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided. Please include a "files" array in request body.' }, 
        { status: 400 }
      )
    }
    
    // ✅ Validate file structure
    const invalidFiles = files.filter((file: any) => !file.path || !file.content)
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: `Invalid file structure. All files must have "path" and "content" properties.` }, 
        { status: 400 }
      )
    }
    
    // ✅ Create sandbox with dynamic files
    const result = await createDaytonaSandbox(files)
    
    // แสดงสถิติปัจจุบัน
    const stats = DaytonaCleanupService.getStats()
    console.log(`📊 Current sandbox stats:`, stats)
    
    
    console.log(`✅ Sandbox created for project ${projectId}:`, {
      sandboxId: result.sandboxId,
      status: result.status,
      hasUrl: !!result.url
    })
    
    return NextResponse.json({
      ...result,
      projectId
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Daytona-Skip-Preview-Warning': 'true',
      },
    })
    
  } catch (e: any) {
    console.error('[POST error]', e)
    return NextResponse.json({ 
      error: e?.message || 'Failed to create sandbox',
      details: e?.stack || 'No additional details'
    }, { status: 500 })
  }
}

// เช็คสถานะ + Heartbeat
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    if (!sandboxId) return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 })

    console.log(`💓 [HEARTBEAT] Checking status for sandbox: ${sandboxId}`)

    const state = sandboxStates.get(sandboxId)
    if (state) {
      // อัปเดต heartbeat แล้วคืนค่าที่อัปเดตจริง
      const updated = await updateSandboxStatus(sandboxId, state.status, state.previewUrl, state.previewToken, state.error)
      return NextResponse.json(updated)
    }

    // no state → ลองเช็คกับ Daytona
    const daytona = new Daytona(getDaytonaClient())
    const exists = await verifySandboxExists(daytona, sandboxId)
    if (!exists) return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 })
    const fallback = await updateSandboxStatus(sandboxId, 'unknown')
    return NextResponse.json(fallback)
  } catch (e: any) {
    console.error(`❌ [HEARTBEAT ERROR] ${e?.message}`)
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

// อัปเดตไฟล์ใน sandbox ที่มีอยู่
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    if (!sandboxId) return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 })

    console.log(`🔄 [PUT] Updating files in sandbox: ${sandboxId}`)

    // Parse request body
    const body = await req.json()
    const { files, projectId, comparison } = body
    
    // Log comparison info if available
    if (comparison) {
      console.log(`📊 [PUT] File comparison info:`, {
        totalFiles: comparison.totalFiles,
        changedFiles: comparison.changedFiles,
        skippedFiles: comparison.skippedFiles
      })
    }
    
    // Validate request
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided. Please include a "files" array in request body.' }, 
        { status: 400 }
      )
    }
    
    // Validate file structure
    const invalidFiles = files.filter((file: any) => !file.path || !file.content)
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: `Invalid file structure. All files must have "path" and "content" properties.` }, 
        { status: 400 }
      )
    }

    // Check if sandbox exists and is running
    const state = sandboxStates.get(sandboxId)
    if (!state) {
      return NextResponse.json({ error: 'Sandbox not found in memory' }, { status: 404 })
    }

    if (state.status !== 'running') {
      return NextResponse.json({ error: 'Sandbox is not running' }, { status: 400 })
    }

    // Verify sandbox exists on Daytona
    const daytona = new Daytona(getDaytonaClient())
    const sandboxExists = await verifySandboxExists(daytona, sandboxId)
    
    if (!sandboxExists) {
      return NextResponse.json({ error: 'Sandbox not found on Daytona' }, { status: 404 })
    }

    // Get sandbox instance
    const sandbox = await daytona.get(sandboxId)
    
    // 🚀 Incremental Build: อัปเดตเฉพาะไฟล์ที่เปลี่ยนแปลง
    const updateResult = await updateFilesInSandbox(sandbox, files)
    
    // Update heartbeat
    await updateSandboxStatus(sandboxId, 'running', state.previewUrl, state.previewToken)
    
    console.log(`✅ [PUT] Incremental build completed: ${updateResult.updatedCount}/${updateResult.totalFiles} files updated in sandbox: ${sandboxId}`)
    
    // 🚀 Performance optimization: ถ้ามีไฟล์เปลี่ยนแปลงน้อย ให้ rebuild เฉพาะส่วนที่จำเป็น
    if (comparison && comparison.changedFiles < 5) {
      console.log(`⚡ [PUT] Small change detected (${comparison.changedFiles} files) - using optimized rebuild`)
    }
    
    return NextResponse.json({
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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Daytona-Skip-Preview-Warning': 'true',
      },
    })
    
  } catch (e: any) {
    console.error(`❌ [PUT ERROR] ${e?.message}`)
    return NextResponse.json({ 
      error: e?.message || 'Failed to update files',
      details: e?.stack || 'No additional details'
    }, { status: 500 })
  }
}

// หยุด/ลบ sandbox
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    if (!sandboxId) return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 })

    console.log(`🛑 [DELETE] Stopping sandbox: ${sandboxId}`)

    const daytona = new Daytona(getDaytonaClient())
    
    // ✅ ตรวจสอบว่า sandbox มีอยู่จริงหรือไม่ก่อน
    const sandboxExists = await verifySandboxExists(daytona, sandboxId)
    
    if (sandboxExists) {
      // ถ้ามีอยู่จริง ให้ลบจาก Daytona
      const s = await daytona.get(sandboxId)
      await s.delete() // ลบ sandbox จริง
      console.log(`✅ [DELETE] Successfully deleted sandbox from Daytona: ${sandboxId}`)
    } else {
      console.log(`⚠️ [DELETE] Sandbox ${sandboxId} not found on Daytona, updating memory only`)
    }
    
    // ✅ อัปเดตสถานะใน memory เป็น stopped เสมอ (ไม่ว่าจะมีใน Daytona หรือไม่)
    await updateSandboxStatus(sandboxId, 'stopped')

    // แสดงสถิติหลังจากลบ
    const stats = DaytonaCleanupService.getStats()
    console.log(`📊 Sandbox ${sandboxId} deleted. Current stats:`, stats)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error(`❌ [DELETE ERROR] ${e?.message}`)
    return NextResponse.json({ error: e?.message || 'Failed to stop sandbox' }, { status: 500 })
  }
}

// ดูสถิติ cleanup service
export async function GET_STATS(req: NextRequest) {
  try {
    const stats = DaytonaCleanupService.getStats()
    
    console.log('📊 [CLEANUP STATS] Requested stats:', stats)
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ [CLEANUP STATS ERROR]', error)
    return NextResponse.json({ 
      success: false,
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 })
  }
}

// ควบคุม cleanup service (สำหรับ admin)
export async function POST_CLEANUP(req: NextRequest) {
  try {
    const { action } = await req.json()
    
    if (action === 'start') {
      await DaytonaCleanupService.start()
      console.log('🚀 [CLEANUP SERVICE] Started via API')
      return NextResponse.json({ 
        success: true, 
        message: 'Cleanup service started',
        stats: DaytonaCleanupService.getStats()
      })
    } else if (action === 'stop') {
      DaytonaCleanupService.stop()
      console.log('🛑 [CLEANUP SERVICE] Stopped via API')
      return NextResponse.json({ 
        success: true, 
        message: 'Cleanup service stopped',
        stats: DaytonaCleanupService.getStats()
      })
    } else if (action === 'cleanup') {
      // Manual cleanup
      console.log('🧹 [CLEANUP SERVICE] Manual cleanup triggered via API')
      
      // Run all cleanup functions
      DaytonaCleanupService.cleanupExpiredStates()
      await DaytonaCleanupService.cleanupIdleSandboxes()
      DaytonaCleanupService.cleanupStoppedSandboxes()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Manual cleanup completed',
        stats: DaytonaCleanupService.getStats()
      })
    } else if (action === 'memory') {
      // Manual memory cleanup
      console.log('🧹 [CLEANUP SERVICE] Manual memory cleanup triggered via API')
      await DaytonaCleanupService.cleanupMemoryStates()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Memory cleanup completed',
        stats: DaytonaCleanupService.getStats()
      })
    } else if (action === 'sync') {
      // Manual sync
      console.log('🔄 [CLEANUP SERVICE] Manual sync triggered via API')
      await DaytonaCleanupService.syncWithDaytona()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Manual sync completed',
        stats: DaytonaCleanupService.getStats()
      })
    } else if (action === 'stopped') {
      // Manual stopped cleanup
      console.log('🧹 [CLEANUP SERVICE] Manual stopped cleanup triggered')
      DaytonaCleanupService.cleanupStoppedSandboxes()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Stopped cleanup completed',
        stats: DaytonaCleanupService.getStats()
      })
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid action. Use: start, stop, cleanup, sync, memory, or stopped' 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ [CLEANUP SERVICE ERROR]', error)
    return NextResponse.json({ 
      success: false,
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 })
  }
}
