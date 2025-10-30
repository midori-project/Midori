// services/DaytonaSandboxService.ts
import { Daytona } from '@daytonaio/sdk'
import { daytonaConfig, getDaytonaClient } from '@/config/daytona'
import { ProjectFile, SandboxResult, UpdateResult } from '../models/SandboxState'
import { FileService } from './FileService'
import { SANDBOX_CONFIG, SESSION_IDS, COMMANDS } from '../utils/constants'
import { verifySandboxExists } from '../utils/sandboxHelpers'

export class DaytonaSandboxService {
  private daytona: Daytona
  private fileService: FileService

  constructor() {
    if (!daytonaConfig?.apiKey) {
      throw new Error('Missing DAYTONA_API_KEY')
    }
    this.daytona = new Daytona(getDaytonaClient())
    this.fileService = new FileService()
  }

  /**
   * Create a new Daytona sandbox with project files
   */
  async createSandbox(files: ProjectFile[]): Promise<SandboxResult> {
    console.log(`🏗️ Creating Daytona sandbox with ${files.length} files`)
    
    // Create sandbox with auto-delete interval (ตามเอกสาร Daytona SDK)
    const sandbox = await this.daytona.create({
      ...daytonaConfig.defaultSandboxConfig,
      public: true,
      autoDeleteInterval: SANDBOX_CONFIG.AUTO_DELETE_MINUTES, // 15 นาที
    })
    
    const sandboxId = sandbox.id
    console.log(`🚀 Creating Daytona sandbox: ${sandboxId}`)
    console.log(`⏰ Auto-delete set to ${SANDBOX_CONFIG.AUTO_DELETE_MINUTES} minutes for sandbox: ${sandboxId}`)

    try {
      // Setup sandbox with files
      await this.setupSandbox(sandbox, files)
      
      // Get preview link
      const { url, token } = await sandbox.getPreviewLink(SANDBOX_CONFIG.DEFAULT_PORT)
      
      console.log(`✅ Sandbox ${sandboxId} created successfully with preview URL: ${url}`)
      
      return {
        sandboxId,
        url,
        token,
        status: 'running'
      }
    } catch (error) {
      console.error(`❌ Failed to setup sandbox ${sandboxId}:`, error)
      // Cleanup failed sandbox
      try {
        await sandbox.delete()
      } catch (cleanupError) {
        console.error(`❌ Failed to cleanup failed sandbox ${sandboxId}:`, cleanupError)
      }
      throw error
    }
  }

  /**
   * Update files in existing sandbox
   */
  async updateSandbox(sandboxId: string, files: ProjectFile[]): Promise<UpdateResult> {
    const sandbox = await this.daytona.get(sandboxId)
    return await this.fileService.updateFilesInSandbox(sandbox, files)
  }

  /**
   * Delete a sandbox
   */
  async deleteSandbox(sandboxId: string): Promise<{ success: boolean; existed: boolean }> {
    console.log(`🛑 [DELETE] Stopping sandbox: ${sandboxId}`)

    const sandboxExists = await verifySandboxExists(this.daytona, sandboxId)
    
    if (sandboxExists) {
      const sandbox = await this.daytona.get(sandboxId)
      await sandbox.delete()
      console.log(`✅ [DELETE] Successfully deleted sandbox from Daytona: ${sandboxId}`)
    } else {
      console.log(`⚠️ [DELETE] Sandbox ${sandboxId} not found on Daytona`)
    }
    
    return { success: true, existed: sandboxExists }
  }

  /**
   * Check if sandbox exists
   */
  async sandboxExists(sandboxId: string): Promise<boolean> {
    return await verifySandboxExists(this.daytona, sandboxId)
  }

  /**
   * Get sandbox instance
   */
  async getSandbox(sandboxId: string) {
    return await this.daytona.get(sandboxId)
  }

  /**
   * List all sandboxes
   */
  async listSandboxes() {
    return await this.daytona.list()
  }

  /**
   * Check if dev server is running and restart if needed
   */
  async ensureDevServerRunning(sandboxId: string): Promise<boolean> {
    console.log(`🔍 [DEV SERVER] Checking dev server status for sandbox: ${sandboxId}`)
    
    try {
      const sandbox = await this.daytona.get(sandboxId)
      
      // Create probe session if not exists
      try {
        await sandbox.process.createSession(SESSION_IDS.PROBE)
      } catch (error) {
        // Session might already exist, continue
      }
      
      // Check if dev server is running
      const devCheck = await sandbox.process.executeSessionCommand(SESSION_IDS.PROBE, {
        command: COMMANDS.CHECK_DEV_RUNNING,
        runAsync: false,
      })
      
      const isDevRunning = !(devCheck.stdout || devCheck.output || '').includes('notrunning')
      
      if (isDevRunning) {
        console.log(`✅ [DEV SERVER] Dev server is already running`)
        return true
      }
      
      console.log(`⚠️ [DEV SERVER] Dev server not running, restarting...`)
      
      // Restart dev server
      await this.startDevServer(sandbox, '.')
      
      // Wait for it to be ready
      await this.waitForReady(sandbox)
      
      console.log(`✅ [DEV SERVER] Dev server restarted successfully`)
      return true
      
    } catch (error) {
      console.error(`❌ [DEV SERVER] Failed to check/restart dev server:`, error)
      return false
    }
  }

  /**
   * Setup sandbox with project files and development environment
   */
  private async setupSandbox(sandbox: any, files: ProjectFile[]): Promise<void> {
    // 1. Create all files from dynamic files
    await this.fileService.createAllFiles(sandbox, files)

    // 2. Fix React plugin dependencies
    await this.fileService.ensureReactPlugin(sandbox)

    // 3. Install packages
    await this.fileService.installDeps(sandbox)

    // 4. Start dev server
    await this.startDevServer(sandbox)

    // 5. Wait for server to be ready
    await this.waitForReady(sandbox)
  }

  /**
   * Start development server
   */
  private async startDevServer(sandbox: any, cwd = '.'): Promise<void> {
    await sandbox.process.createSession(SESSION_IDS.DEV)
    
    // Check if package.json exists and has correct scripts
    const packageCheck = await sandbox.process.executeSessionCommand(SESSION_IDS.DEV, {
      command: `cd ${cwd} && ${COMMANDS.CHECK_PACKAGE_JSON}`,
      runAsync: false,
    })
    
    if (!(packageCheck.stdout || packageCheck.output || '').includes('haspackage')) {
      throw new Error('package.json not found in project directory')
    }
    
    // Check if dev script exists
    const scriptCheck = await sandbox.process.executeSessionCommand(SESSION_IDS.DEV, {
      command: `cd ${cwd} && ${COMMANDS.CHECK_DEV_SCRIPT}`,
      runAsync: false,
    })
    
    if (!(scriptCheck.stdout || scriptCheck.output || '').includes('hasdev')) {
      throw new Error('dev script not found in package.json')
    }
    
    // Start dev server
    const cmd = `bash -lc "cd ${cwd} && npm run dev -- --host 0.0.0.0 --port ${SANDBOX_CONFIG.DEFAULT_PORT}"`
    const resp = await sandbox.process.executeSessionCommand(SESSION_IDS.DEV, {
      command: cmd,
      runAsync: true,
    })
    console.log('[dev spawn]', resp)
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, SANDBOX_CONFIG.START_DELAY_MS))
  }

  /**
   * Wait for development server to be ready
   */
  private async waitForReady(sandbox: any): Promise<void> {
    await sandbox.process.createSession(SESSION_IDS.PROBE)
    
    // Check if dev server is running first
    const devCheck = await sandbox.process.executeSessionCommand(SESSION_IDS.PROBE, {
      command: COMMANDS.CHECK_DEV_RUNNING,
      runAsync: false,
    })
    const isDevRunning = !(devCheck.stdout || devCheck.output || '').includes('notrunning')
    console.log(`[ready] Dev server running: ${isDevRunning}`)
    
    if (!isDevRunning) {
      console.log('[ready] Dev server not running, starting it...')
      await this.startDevServer(sandbox, '.')
    }
    
    // Wait for port to be available and HTTP to respond
    for (let i = 1; i <= SANDBOX_CONFIG.MAX_READY_ATTEMPTS; i++) {
      const port = await sandbox.process.executeSessionCommand(SESSION_IDS.PROBE, {
        command: COMMANDS.CHECK_PORT,
        runAsync: false,
      })
      const portOpen = (port.stdout || port.output || '').includes(`:${SANDBOX_CONFIG.DEFAULT_PORT}`)
      
      if (portOpen) {
        const http = await sandbox.process.executeSessionCommand(SESSION_IDS.PROBE, {
          command: COMMANDS.CHECK_HTTP,
          runAsync: false,
        })
        const code = (http.stdout || http.output || '').trim()
        
        if (code === '200' || code === '404') {
          console.log(`[ready] attempt ${i} OK (http ${code})`)
          return
        }
        console.log(`[ready] attempt ${i} port open, http=${code}`)
        
        // Check for build errors
        await this.checkForBuildErrors(sandbox)
        return // Consider it ready even if not perfect
      }
      
      console.log(`[ready] attempt ${i} waiting...`)
      await new Promise((r) => setTimeout(r, SANDBOX_CONFIG.READY_DELAY_MS))
    }
    
    console.log('[ready] continue even if not confirmed')
  }

  /**
   * Check for build errors in the sandbox
   */
  private async checkForBuildErrors(sandbox: any): Promise<void> {
    const buildCheck = await sandbox.process.executeSessionCommand(SESSION_IDS.PROBE, {
      command: COMMANDS.CHECK_VITE_RUNNING,
      runAsync: false,
    })
    const hasVite = !(buildCheck.stdout || buildCheck.output || '').includes('novite')
    console.log(`[ready] Vite process running: ${hasVite}`)
    
    if (!hasVite) {
      console.log('[ready] Vite not running, checking for errors...')
      const errorCheck = await sandbox.process.executeSessionCommand(SESSION_IDS.PROBE, {
        command: COMMANDS.CHECK_REACT,
        runAsync: false,
      })
      console.log(`[ready] Package.json has React: ${(errorCheck.stdout || errorCheck.output || '').includes('hasreact')}`)
    }
  }
}

