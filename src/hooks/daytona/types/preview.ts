// types/preview.ts
export type Status = 'idle' | 'creating' | 'running' | 'stopped' | 'error'

export interface ProjectFile {
  path: string
  content: string
  type?: string
  language?: string
}

export interface FileState {
  path: string
  content: string
  hash: string
  lastModified: number
  size: number
}

export interface FileComparison {
  hasChanged: boolean
  changeType: 'added' | 'removed' | 'modified' | 'unchanged'
  oldState?: FileState
  newState: FileState
}

export interface UpdateResult {
  success: boolean
  updatedFiles: number
  totalFiles: number
  skippedFiles: number
  message: string
  error?: string
}

export interface PreviewCache {
  sandboxId?: string
  previewUrl?: string
  previewToken?: string
  filesHash?: string
  lastUpdated?: number
}

export interface FileComparisonResult {
  changedFiles: ProjectFile[]
  skippedFiles: string[]
  comparison: {
    totalFiles: number
    changedFiles: number
    skippedFiles: number
  }
}

export interface UseDaytonaPreviewProps {
  projectId?: string
  files?: ProjectFile[]
}

export interface UseDaytonaPreviewReturn {
  // Core state
  sandboxId?: string
  status: Status
  previewUrl?: string
  previewToken?: string
  previewUrlWithToken?: string
  error?: string
  loading: boolean
  
  // Actions
  startPreview: () => Promise<void>
  stopPreview: () => Promise<void>
  updateFiles: (files: ProjectFile[]) => Promise<UpdateResult>
  
  // Additional info
  lastHeartbeat: number
  isHeartbeatActive: boolean
}

export interface ApiResponse {
  sandboxId: string
  url?: string
  token?: string
  status: string
  error?: string
}

export interface HeartbeatConfig {
  interval: number // milliseconds
  timeout: number // milliseconds
}

export interface CacheConfig {
  ttl: number // milliseconds
  maxAge: number // milliseconds
}

export interface DebounceConfig {
  delay: number // milliseconds
}

