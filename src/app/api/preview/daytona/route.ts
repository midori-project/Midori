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
  console.log('[status]', next)
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
    const result = await createDaytonaSandbox()
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

// เช็คสถานะ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    if (!sandboxId) return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 })

    const state = sandboxStates.get(sandboxId)
    if (state) return NextResponse.json(state)

    // no state → ลองเช็คกับ Daytona
    const daytona = new Daytona({ apiKey: daytonaConfig.apiKey! })
    const exists = await verifySandboxExists(daytona, sandboxId)
    if (!exists) return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 })
    const fallback = await updateSandboxStatus(sandboxId, 'unknown')
    return NextResponse.json(fallback)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

// หยุด/ลบ sandbox
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    if (!sandboxId) return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 })

    const daytona = new Daytona({ apiKey: daytonaConfig.apiKey! })
    const s = await daytona.get(sandboxId)
    await s.delete() // ลบ sandbox จริง
    await updateSandboxStatus(sandboxId, 'stopped')

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to stop sandbox' }, { status: 500 })
  }
}
