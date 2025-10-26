// utils/sandboxHelpers.ts
import { Daytona } from '@daytonaio/sdk'
import { SandboxState } from '../models/SandboxState'

/**
 * Verify if a sandbox exists on Daytona
 */
export async function verifySandboxExists(daytona: Daytona, sandboxId: string): Promise<boolean> {
  try {
    const sandbox = await daytona.get(sandboxId)
    return !!sandbox
  } catch {
    return false
  }
}

/**
 * Create a base64 encoded write command for file content
 */
export function createFileWriteCommand(filePath: string, content: string): string {
  const b64 = Buffer.from(content).toString('base64')
  return `echo "${b64}" | base64 -d > "${filePath}"`
}

/**
 * Extract directory from file path
 */
export function getDirectoryFromPath(filePath: string): string {
  return filePath.includes('/') ? filePath.slice(0, filePath.lastIndexOf('/')) : ''
}

/**
 * Create directory command if directory exists
 */
export function createMkdirCommand(filePath: string): string | null {
  const dir = getDirectoryFromPath(filePath)
  return dir ? `mkdir -p "${dir}"` : null
}

/**
 * Analyze file types for rebuild optimization
 */
export function analyzeFileTypes(files: { path: string }[]) {
  const hasReactFiles = files.some(f => f.path.endsWith('.tsx') || f.path.endsWith('.jsx'))
  const hasCSSFiles = files.some(f => f.path.endsWith('.css') || f.path.endsWith('.scss'))
  const hasConfigFiles = files.some(f => 
    f.path.includes('package.json') || 
    f.path.includes('tsconfig.json') ||
    f.path.includes('vite.config')
  )
  
  return { hasReactFiles, hasCSSFiles, hasConfigFiles }
}

/**
 * Get rebuild type based on file analysis
 */
export function getRebuildType(analysis: ReturnType<typeof analyzeFileTypes>): 'full' | 'optimized' | 'style-only' | 'none' {
  if (analysis.hasConfigFiles) return 'full'
  if (analysis.hasReactFiles) return 'optimized'
  if (analysis.hasCSSFiles) return 'style-only'
  return 'none'
}

/**
 * Format sandbox age in minutes
 */
export function formatAge(timestamp: number): number {
  return Math.round((Date.now() - timestamp) / 60000)
}

/**
 * Get sandbox stats from states map
 */
export function getSandboxStats(sandboxStates: Map<string, SandboxState>) {
  const total = sandboxStates.size
  const states = Array.from(sandboxStates.values())
  
  return {
    total,
    running: states.filter(s => s.status === 'running').length,
    stopped: states.filter(s => s.status === 'stopped').length,
    error: states.filter(s => s.status === 'error').length,
    creating: states.filter(s => s.status === 'creating').length,
    unknown: 0,
  }
}

/**
 * Find oldest sandbox by status  
 */
export function findOldestSandbox(sandboxStates: Map<string, SandboxState>, status: SandboxState['status']): SandboxState | undefined {
  return Array.from(sandboxStates.values())
    .filter(s => s.status === status)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))[0]
}

/**
 * Validate file structure in request
 */
export function validateFiles(files: any[]): { isValid: boolean; error?: string } {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return { isValid: false, error: 'No files provided. Please include a "files" array in request body.' }
  }
  
  const invalidFiles = files.filter((file: any) => !file.path || !file.content)
  if (invalidFiles.length > 0) {
    return { isValid: false, error: 'Invalid file structure. All files must have "path" and "content" properties.' }
  }
  
  return { isValid: true }
}

/**
 * Log file structure for debugging
 */
export function logFileStructure(files: any[], prefix = '📋 Files structure:') {
  console.log(prefix)
  files.slice(0, 5).forEach((file: any, index: number) => {
    console.log(`  ${index + 1}. ${file.path} (${file.content?.length || 0} chars)`)
  })
  if (files.length > 5) {
    console.log(`  ... and ${files.length - 5} more files`)
  }
}
