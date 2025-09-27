// app/api/preview/daytona/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Daytona } from '@daytonaio/sdk'
import { daytonaConfig } from '@/config/daytona'
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
  console.log('📁 [FILES] Starting file creation process...');
  console.log('📁 [FILES] Files to create:', files.length);
  
  const sessionId = 'file-session'
  await sandbox.process.createSession(sessionId)
  console.log('📁 [FILES] Session created:', sessionId);

  // เขียนไฟล์ทุกไฟล์ (base64 → decode ใน shell)
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`📁 [FILES] Creating file ${i + 1}/${files.length}: ${file.path}`);
    
    const dir = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/')) : ''
    if (dir) {
      console.log(`📁 [FILES] Creating directory: ${dir}`);
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
      console.error(`❌ [FILES] Failed to write ${file.path}:`, resp.stderr || resp.output);
      throw new Error(`Failed to write ${file.path}: ${resp.stderr || resp.output}`)
    } else {
      console.log(`✅ [FILES] Successfully created: ${file.path}`);
    }
  }
  
  // แสดงโครงสร้างสั้น ๆ (debug)
  console.log('📁 [FILES] Getting file structure...');
  const tree = await sandbox.process.executeSessionCommand(sessionId, {
    command:
      'find . -maxdepth 3 -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.html" -o -name "*.css" \\) | sed -n "1,50p"',
    runAsync: false,
  })
  console.log('📁 [FILES] File structure:\n', tree.stdout || tree.output || '');
  console.log('✅ [FILES] File creation process completed');
}

async function ensureReactPlugin(sandbox: any) {
  console.log('🔧 [REACT] Ensuring React plugin...');
  // กันเคสที่ package.json ใช้ '@vitejs/plugin-react' แต่ไม่ได้ติดตั้ง หรือเผลอใช้ 'vite-plugin-react'
  const sessionId = 'pkg-fix'
  await sandbox.process.createSession(sessionId)
  console.log('🔧 [REACT] Installing @vitejs/plugin-react...');
  await sandbox.process.executeSessionCommand(sessionId, {
    command: 'npm i -D @vitejs/plugin-react || true',
    runAsync: false,
  })
  console.log('🔧 [REACT] Removing conflicting vite-plugin-react...');
  await sandbox.process.executeSessionCommand(sessionId, {
    command: 'npm rm vite-plugin-react || true',
    runAsync: false,
  })
  console.log('✅ [REACT] React plugin setup completed');
}

async function installDeps(sandbox: any) {
  console.log('📦 [INSTALL] Starting dependency installation...');
  const sessionId = 'install'
  await sandbox.process.createSession(sessionId)
  console.log('📦 [INSTALL] Running npm install...');
  const resp = await sandbox.process.executeSessionCommand(sessionId, {
    command: 'npm install',
    runAsync: false,
  })
  console.log('📦 [INSTALL] npm install result:', {
    exitCode: resp.exitCode,
    output: resp.stdout || resp.output || '',
    stderr: resp.stderr || ''
  });
  if (typeof resp.exitCode === 'number' && resp.exitCode !== 0) {
    console.error('❌ [INSTALL] npm install failed:', resp.stderr || resp.stdout || resp.output);
    throw new Error(`npm install failed: ${resp.stderr || resp.stdout || resp.output}`)
  }
  console.log('✅ [INSTALL] Dependencies installed successfully');
}

async function startDevServer(sandbox: any, cwd = '.') {
  console.log('🚀 [DEV-SERVER] Starting development server...');
  console.log('🚀 [DEV-SERVER] Working directory:', cwd);
  const sessionId = 'dev'
  await sandbox.process.createSession(sessionId)
  const cmd = `bash -lc "cd ${cwd} && npm run dev -- --host 0.0.0.0 --port 5173"`
  console.log('🚀 [DEV-SERVER] Command:', cmd);
  const resp = await sandbox.process.executeSessionCommand(sessionId, {
    command: cmd,
    runAsync: true,
  })
  console.log('🚀 [DEV-SERVER] Dev server started:', resp);
  console.log('✅ [DEV-SERVER] Development server is running');
}

async function waitForReady(sandbox: any, maxAttempts = 20, delayMs = 2000) {
  console.log('⏳ [READY] Waiting for server to be ready...');
  console.log('⏳ [READY] Max attempts:', maxAttempts, 'Delay:', delayMs + 'ms');
  
  const sessionId = 'probe'
  await sandbox.process.createSession(sessionId)
  
  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`⏳ [READY] Attempt ${i}/${maxAttempts}: Checking port 5173...`);
    
    const port = await sandbox.process.executeSessionCommand(sessionId, {
      command: 'ss -lntp | grep :5173 || netstat -tlnp | grep :5173 || echo "noport"',
      runAsync: false,
    })
    const portOpen = (port.stdout || port.output || '').includes(':5173')
    
    if (portOpen) {
      console.log(`✅ [READY] Port 5173 is open, checking HTTP response...`);
      
      const http = await sandbox.process.executeSessionCommand(sessionId, {
        command: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "curlfail"',
        runAsync: false,
      })
      const code = (http.stdout || http.output || '').trim()
      
      if (code === '200' || code === '404') {
        console.log(`🎉 [READY] Server is ready! (HTTP ${code}) - attempt ${i}`);
        return
      }
      console.log(`⚠️ [READY] Port open but HTTP ${code} - attempt ${i}, continuing anyway`);
      return // พอถือว่าพร้อม
    }
    
    console.log(`⏳ [READY] Port not ready, waiting ${delayMs}ms... (attempt ${i})`);
    await new Promise((r) => setTimeout(r, delayMs))
  }
  
  console.log('⚠️ [READY] Max attempts reached, continuing anyway');
}

// ---------- Core ----------
async function createDaytonaSandbox(projectFiles?: ProjectFile[]): Promise<{ sandboxId: string; url?: string; token?: string; status: string }> {
  console.log('🏗️ [DAYTONA-API] Starting sandbox creation...');
  
  if (!daytonaConfig?.apiKey) {
    console.error('❌ [DAYTONA-API] Missing DAYTONA_API_KEY');
    throw new Error('Missing DAYTONA_API_KEY')
  }
  
  // ✅ Validate input files
  if (!projectFiles || !Array.isArray(projectFiles) || projectFiles.length === 0) {
    console.error('❌ [DAYTONA-API] No project files provided for preview');
    throw new Error('No project files provided for preview')
  }
  
  console.log(`🏗️ [DAYTONA-API] Creating Daytona sandbox with ${projectFiles.length} files`);
  console.log(`📁 [DAYTONA-API] Files structure:`, projectFiles.map(f => ({
    path: f.path,
    contentLength: f.content?.length || 0,
    type: f.type
  })));
  
  console.log('🔑 [DAYTONA-API] Initializing Daytona client...');
  const daytona = new Daytona({ apiKey: daytonaConfig.apiKey })
  
  console.log('🚀 [DAYTONA-API] Creating sandbox...');
  const sandbox = await daytona.create({
    ...daytonaConfig.defaultSandboxConfig,
    public: true,
  })
  const sandboxId = sandbox.id
  console.log('✅ [DAYTONA-API] Sandbox created with ID:', sandboxId);
  
  await updateSandboxStatus(sandboxId, 'creating')

  // 1) สร้างไฟล์ทั้งหมดจาก dynamic files
  console.log('📁 [DAYTONA-API] Creating all files in sandbox...');
  await createAllFiles(sandbox, projectFiles)

  // 2) แก้ dependency React plugin (กันเคสพลาด)
  console.log('🔧 [DAYTONA-API] Ensuring React plugin...');
  await ensureReactPlugin(sandbox)

  // 3) ติดตั้งแพ็กเกจ
  console.log('📦 [DAYTONA-API] Installing dependencies...');
  await installDeps(sandbox)

  // 4) รัน dev server (ถ้าโปรเจกต์วางไว้ที่ root ใช้ cwd=".")
  console.log('🚀 [DAYTONA-API] Starting dev server...');
  await startDevServer(sandbox, '.')

  // 5) รอให้พร้อม
  console.log('⏳ [DAYTONA-API] Waiting for server to be ready...');
  await waitForReady(sandbox)

  // 6) ขอพรีวิวลิงก์
  console.log('🔗 [DAYTONA-API] Getting preview link...');
  const { url, token } = await sandbox.getPreviewLink(5173)
  console.log('🌐 [DAYTONA-API] Preview URL:', url);
  console.log('🔑 [DAYTONA-API] Preview token:', token ? 'YES' : 'NO');
  
  await updateSandboxStatus(sandboxId, 'running', url, token)
  
  console.log('🎉 [DAYTONA-API] Sandbox creation completed successfully');
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
  console.log('📡 [POST] Received preview request');
  
  try {
    // ✅ Parse request body to get dynamic files
    console.log('📡 [POST] Parsing request body...');
    const body = await req.json()
    const { files, projectId } = body
    
    console.log(`📦 [POST] Preview request for project: ${projectId}`)
    console.log(`📁 [POST] Files count: ${files?.length || 0}`)
    
    // ✅ Log file structure for debugging
    if (files?.length > 0) {
      console.log(`📋 [POST] Files structure:`)
      files.slice(0, 5).forEach((file: any, index: number) => {
        console.log(`  ${index + 1}. ${file.path} (${file.content?.length || 0} chars)`)
      })
      if (files.length > 5) {
        console.log(`  ... and ${files.length - 5} more files`)
      }
    }
    
    // ✅ Validate request
    console.log('✅ [POST] Validating request...');
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.error('❌ [POST] No files provided');
      return NextResponse.json(
        { error: 'No files provided. Please include a "files" array in request body.' }, 
        { status: 400 }
      )
    }
    
    // ✅ Validate file structure
    const invalidFiles = files.filter((file: any) => !file.path || !file.content)
    if (invalidFiles.length > 0) {
      console.error('❌ [POST] Invalid file structure:', invalidFiles);
      return NextResponse.json(
        { error: `Invalid file structure. All files must have "path" and "content" properties.` }, 
        { status: 400 }
      )
    }
    
    console.log('✅ [POST] Request validation passed');
    
    // ✅ Create sandbox with dynamic files
    console.log('🚀 [POST] Creating sandbox...');
    const result = await createDaytonaSandbox(files)
    
    console.log(`✅ [POST] Sandbox created for project ${projectId}:`, {
      sandboxId: result.sandboxId,
      status: result.status,
      hasUrl: !!result.url
    })
    
    const response = {
      ...result,
      projectId
    };
    
    console.log('📤 [POST] Sending response:', response);
    
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Daytona-Skip-Preview-Warning': 'true',
      },
    })
    
  } catch (e: any) {
    console.error('❌ [POST] Error:', e)
    console.error('❌ [POST] Error details:', {
      message: e?.message,
      stack: e?.stack
    });
    return NextResponse.json({ 
      error: e?.message || 'Failed to create sandbox',
      details: e?.stack || 'No additional details'
    }, { status: 500 })
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
