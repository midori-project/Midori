// models/SandboxState.ts
export interface ProjectFile {
  path: string
  content: string
  type?: string
  language?: string
}

export interface SandboxState {
  sandboxId: string
  status: 'creating' | 'running' | 'stopped' | 'error'
  previewUrl?: string
  previewToken?: string
  error?: string
  createdAt?: number
  lastHeartbeatAt?: number
}

export interface SandboxResult {
  sandboxId: string
  url?: string
  token?: string
  status: string
}

export interface UpdateResult {
  updatedCount: number
  totalFiles: number
  errors: string[]
  rebuildType: 'full' | 'optimized' | 'style-only' | 'none'
}

export interface CleanupStats {
  total: number
  running: number
  stopped: number
  error: number
  creating: number
  unknown: number
  isServiceRunning: boolean
  memoryUsage: NodeJS.MemoryUsage
  lastCleanup: string
  uptime: number
  oldestRunningAge: number
  oldestStoppedAge: number
  serviceHealth: {
    isRunning: boolean
    intervals: {
      expiredCleanup: boolean
      idleCleanup: boolean
      stoppedCleanup: boolean
    }
  }
}

export interface FileComparison {
  totalFiles: number
  changedFiles: number
  skippedFiles: number
}
