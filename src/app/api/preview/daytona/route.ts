// app/api/preview/daytona/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Daytona } from '@daytonaio/sdk'
import { daytonaConfig } from '@/config/daytona'
import testJson from '@/components/preview/test/test.json'

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

  static start(): void {
    if (this.isRunning) {
      console.log('🧹 Daytona cleanup service already running')
      return
    }

    console.log('🚀 Starting Daytona cleanup service...')
    this.isRunning = true

    // Cleanup expired states ทุกชั่วโมง
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredStates()
    }, 60 * 60 * 1000) // 1 hour

    // Cleanup idle sandboxes ทุก 1 นาที
    this.idleCheckInterval = setInterval(() => {
      this.cleanupIdleSandboxes()
    }, 60 * 1000) // 1 minute

    // Cleanup stopped sandboxes ทุกชั่วโมง
    this.stoppedCleanupInterval = setInterval(() => {
      this.cleanupStoppedSandboxes()
    }, 60 * 60 * 1000) // 1 hour

    console.log('✅ Daytona cleanup service started successfully')
  }

  static stop(): void {
    if (!this.isRunning) {
      console.log('🧹 Daytona cleanup service not running')
      return
    }

    console.log('🛑 Stopping Daytona cleanup service...')

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

    this.isRunning = false
    console.log('✅ Daytona cleanup service stopped')
  }

  static cleanupExpiredStates(): void {
    const startTime = Date.now()
    console.log(`🧹 [EXPIRED CLEANUP] Starting expired states cleanup at ${new Date().toISOString()}`)
    
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 ชั่วโมง
    let cleanedCount = 0
    const totalStates = sandboxStates.size

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

  static async cleanupIdleSandboxes(): Promise<void> {
    // ตรวจสอบว่ามี sandbox ที่กำลังทำงานหรือไม่ก่อน
    const runningSandboxes = Array.from(sandboxStates.values()).filter(s => s.status === 'running')
    
    // ถ้าไม่มี sandbox ที่กำลังทำงาน ให้ skip
    if (runningSandboxes.length === 0) {
      return // ไม่ log อะไร
    }
    
    const startTime = Date.now()
    console.log(`🧹 [IDLE CLEANUP] Starting idle sandboxes cleanup at ${new Date().toISOString()}`)
    
    if (!daytonaConfig.apiKey) {
      console.warn('⚠️ [IDLE CLEANUP] Daytona API key not configured, skipping cleanup')
      return
    }

    const daytona = new Daytona({ apiKey: daytonaConfig.apiKey })
    const now = Date.now()
    const idleTimeout = 5 * 60 * 1000 // 5 นาที
    let cleanedCount = 0
    let errorCount = 0

    for (const [sandboxId, state] of sandboxStates.entries()) {
      if (state.status === 'running' && state.lastHeartbeatAt) {
        const idleTime = now - state.lastHeartbeatAt
        
        if (idleTime > idleTimeout) {
          console.log(`⏰ [IDLE CLEANUP] Found idle sandbox: ${sandboxId} (idle for ${Math.round(idleTime / 60000)} minutes, created: ${new Date(state.createdAt || 0).toISOString()})`)
          
          try {
            // ลบ sandbox จาก Daytona
            const sandbox = await daytona.get(sandboxId)
            await sandbox.delete()
            
            // อัปเดตสถานะใน memory
            sandboxStates.set(sandboxId, { ...state, status: 'stopped' })
            cleanedCount++
            
            console.log(`✅ [IDLE CLEANUP] Successfully cleaned up idle sandbox: ${sandboxId}`)
          } catch (error) {
            errorCount++
            console.error(`❌ [IDLE CLEANUP] Failed to cleanup idle sandbox ${sandboxId}:`, error)
          }
        }
      }
    }

    const duration = Date.now() - startTime
    console.log(`✅ [IDLE CLEANUP] Completed: cleaned ${cleanedCount}/${runningSandboxes.length} idle sandboxes (${errorCount} errors) in ${duration}ms`)
  }


  /**
   * ทำความสะอาด stopped sandboxes ที่ไม่ต้องการแล้ว
   */
  static cleanupStoppedSandboxes(): void {
    const startTime = Date.now()
    console.log(`🧹 [STOPPED CLEANUP] Starting stopped sandboxes cleanup at ${new Date().toISOString()}`)
    
    const now = Date.now()
    const stoppedTimeout = 2 * 60 * 60 * 1000 // 2 ชั่วโมง
    let cleanedCount = 0
    const stoppedStates = Array.from(sandboxStates.values()).filter(s => s.status === 'stopped' || s.status === 'error')

    for (const [sandboxId, state] of sandboxStates.entries()) {
      if (state.status === 'stopped' || state.status === 'error') {
        const lastActivity = state.lastHeartbeatAt || state.createdAt || 0
        const stoppedTime = now - lastActivity
        
        if (stoppedTime > stoppedTimeout) {
          console.log(`🗑️ [STOPPED CLEANUP] Removing stopped sandbox state: ${sandboxId} (stopped for ${Math.round(stoppedTime / 60000)} minutes, status: ${state.status})`)
          sandboxStates.delete(sandboxId)
          cleanedCount++
        }
      }
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

// Auto-start cleanup service
DaytonaCleanupService.start()

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
  const cmd = `bash -lc "cd ${cwd} && npm run dev -- --host 0.0.0.0 --port 5173"`
  const resp = await sandbox.process.executeSessionCommand(sessionId, {
    command: cmd,
    runAsync: true,
  })
  console.log('[dev spawn]', resp)
}

async function waitForReady(sandbox: any, maxAttempts = 20, delayMs = 2000) {
  const sessionId = 'probe'
  await sandbox.process.createSession(sessionId)
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
      return // พอถือว่าพร้อม
    }
    console.log(`[ready] attempt ${i} waiting...`)
    await new Promise((r) => setTimeout(r, delayMs))
  }
  console.log('[ready] continue even if not confirmed')
}

// ---------- Core ----------
async function createDaytonaSandbox(): Promise<{ sandboxId: string; url?: string; token?: string; status: string }> {
  if (!daytonaConfig?.apiKey) throw new Error('Missing DAYTONA_API_KEY')
  const daytona = new Daytona({ apiKey: daytonaConfig.apiKey })
  const sandbox = await daytona.create({
    ...daytonaConfig.defaultSandboxConfig,
    public: true,
  })
  const sandboxId = sandbox.id
  await updateSandboxStatus(sandboxId, 'creating')

  console.log(`🚀 Creating Daytona sandbox: ${sandboxId}`)

  // 1) สร้างไฟล์ทั้งหมดจาก JSON
  const files = (testJson as any).files as ProjectFile[]
  if (!Array.isArray(files) || files.length === 0) throw new Error('No files in test-cafe-complete.json')
  await createAllFiles(sandbox, files)

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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    const result = await createDaytonaSandbox()
    
    // แสดงสถิติปัจจุบัน
    const stats = DaytonaCleanupService.getStats()
    console.log(`📊 Current sandbox stats:`, stats)
    
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Daytona-Skip-Preview-Warning': 'true',
      },
    })
  } catch (e: any) {
    console.error('[POST error]', e)
    return NextResponse.json({ error: e?.message || 'Failed to create sandbox' }, { status: 500 })
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
      // อัปเดต heartbeat
      await updateSandboxStatus(sandboxId, state.status, state.previewUrl, state.previewToken, state.error)
      return NextResponse.json(state)
    }

    // no state → ลองเช็คกับ Daytona
    const daytona = new Daytona({ apiKey: daytonaConfig.apiKey! })
    const exists = await verifySandboxExists(daytona, sandboxId)
    if (!exists) return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 })
    const fallback = await updateSandboxStatus(sandboxId, 'unknown')
    return NextResponse.json(fallback)
  } catch (e: any) {
    console.error(`❌ [HEARTBEAT ERROR] ${e?.message}`)
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

// หยุด/ลบ sandbox
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    if (!sandboxId) return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 })

    console.log(`🛑 [DELETE] Stopping sandbox: ${sandboxId}`)

    const daytona = new Daytona({ apiKey: daytonaConfig.apiKey! })
    const s = await daytona.get(sandboxId)
    await s.delete() // ลบ sandbox จริง
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
      DaytonaCleanupService.start()
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
        error: 'Invalid action. Use: start, stop, cleanup, or stopped' 
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
