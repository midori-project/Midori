// services/FileService.ts
import { ProjectFile, UpdateResult } from '../models/SandboxState'
import { SESSION_IDS, COMMANDS } from '../utils/constants'
import { 
  createFileWriteCommand, 
  createMkdirCommand, 
  analyzeFileTypes, 
  getRebuildType 
} from '../utils/sandboxHelpers'

export class FileService {
  /**
   * Create all files in sandbox from project files
   */
  async createAllFiles(sandbox: any, files: ProjectFile[]): Promise<void> {
    await sandbox.process.createSession(SESSION_IDS.FILE_SESSION)

    // Write all files (base64 → decode in shell)
    for (const file of files) {
      const mkdirCommand = createMkdirCommand(file.path)
      if (mkdirCommand) {
        await sandbox.process.executeSessionCommand(SESSION_IDS.FILE_SESSION, {
          command: mkdirCommand,
          runAsync: false,
        })
      }
      
      const writeCommand = createFileWriteCommand(file.path, file.content)
      const resp = await sandbox.process.executeSessionCommand(SESSION_IDS.FILE_SESSION, {
        command: writeCommand,
        runAsync: false,
      })
      
      if (resp.exitCode !== 0) {
        throw new Error(`Failed to write ${file.path}: ${resp.stderr || resp.output}`)
      }
    }
    
    // Show file structure for debugging
    await this.showFileTree(sandbox, SESSION_IDS.FILE_SESSION)
  }

  /**
   * Update files incrementally in existing sandbox
   */
  async updateFilesInSandbox(sandbox: any, files: ProjectFile[]): Promise<UpdateResult> {
    await sandbox.process.createSession(SESSION_IDS.UPDATE_SESSION)

    let updatedCount = 0
    const errors: string[] = []

    console.log(`🔄 [UPDATE] Incremental update: ${files.length} files in sandbox`)
    
    // Smart rebuild: analyze file types that changed
    const analysis = analyzeFileTypes(files)
    const rebuildType = getRebuildType(analysis)
    
    this.logFileAnalysis(analysis)

    // Update files one by one
    for (const file of files) {
      try {
        const mkdirCommand = createMkdirCommand(file.path)
        if (mkdirCommand) {
          await sandbox.process.executeSessionCommand(SESSION_IDS.UPDATE_SESSION, {
            command: mkdirCommand,
            runAsync: false,
          })
        }

        const writeCommand = createFileWriteCommand(file.path, file.content)
        const resp = await sandbox.process.executeSessionCommand(SESSION_IDS.UPDATE_SESSION, {
          command: writeCommand,
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

    // Conditional rebuild based on file types
    await this.performRebuild(sandbox, rebuildType)

    // Show file structure after update
    await this.showFileTree(sandbox, SESSION_IDS.UPDATE_SESSION)

    if (errors.length > 0) {
      console.warn(`⚠️ [UPDATE] ${errors.length} files failed to update:`, errors)
    }

    return {
      updatedCount,
      totalFiles: files.length,
      errors,
      rebuildType
    }
  }

  /**
   * Install dependencies and fix React plugin issues
   */
  async ensureReactPlugin(sandbox: any): Promise<void> {
    await sandbox.process.createSession(SESSION_IDS.PKG_FIX)
    
    // Install correct React plugin and remove old one
    await sandbox.process.executeSessionCommand(SESSION_IDS.PKG_FIX, {
      command: COMMANDS.INSTALL_REACT_PLUGIN,
      runAsync: false,
    })
    
    await sandbox.process.executeSessionCommand(SESSION_IDS.PKG_FIX, {
      command: COMMANDS.REMOVE_OLD_REACT_PLUGIN,
      runAsync: false,
    })
  }

  /**
   * Install npm dependencies
   */
  async installDeps(sandbox: any): Promise<void> {
    await sandbox.process.createSession(SESSION_IDS.INSTALL)
    
    const resp = await sandbox.process.executeSessionCommand(SESSION_IDS.INSTALL, {
      command: COMMANDS.NPM_INSTALL,
      runAsync: false,
    })
    
    console.log('[npm install]', resp.exitCode, resp.stdout || resp.output || '')
    
    if (typeof resp.exitCode === 'number' && resp.exitCode !== 0) {
      throw new Error(`npm install failed: ${resp.stderr || resp.stdout || resp.output}`)
    }
  }

  /**
   * Perform rebuild based on file analysis
   */
  private async performRebuild(sandbox: any, rebuildType: UpdateResult['rebuildType']): Promise<void> {
    switch (rebuildType) {
      case 'full':
        console.log(`🔄 [UPDATE] Config files changed - triggering full rebuild...`)
        await sandbox.process.executeSessionCommand(SESSION_IDS.UPDATE_SESSION, {
          command: COMMANDS.NPM_BUILD,
          runAsync: true,
        })
        console.log(`✅ [UPDATE] Full rebuild completed`)
        break
        
      case 'optimized':
        console.log(`⚛️ [UPDATE] React files changed - triggering optimized rebuild...`)
        await sandbox.process.executeSessionCommand(SESSION_IDS.UPDATE_SESSION, {
          command: COMMANDS.NPM_BUILD,
          runAsync: true,
        })
        console.log(`✅ [UPDATE] Optimized rebuild completed`)
        break
        
      case 'style-only':
        console.log(`🎨 [UPDATE] CSS files changed - style-only update (no rebuild needed)`)
        break
        
      default:
        // No rebuild needed
        break
    }
  }

  /**
   * Show file tree for debugging
   */
  private async showFileTree(sandbox: any, sessionId: string): Promise<void> {
    const tree = await sandbox.process.executeSessionCommand(sessionId, {
      command: COMMANDS.SHOW_TREE,
      runAsync: false,
    })
    console.log('[tree]\n', tree.stdout || tree.output || '')
  }

  /**
   * Log file analysis results
   */
  private logFileAnalysis(analysis: ReturnType<typeof analyzeFileTypes>): void {
    if (analysis.hasConfigFiles) {
      console.log(`⚙️ [UPDATE] Config files changed - full rebuild may be needed`)
    } else if (analysis.hasReactFiles) {
      console.log(`⚛️ [UPDATE] React files changed - optimized rebuild`)
    } else if (analysis.hasCSSFiles) {
      console.log(`🎨 [UPDATE] CSS files changed - style-only rebuild`)
    }
  }
}

