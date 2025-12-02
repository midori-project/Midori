// utils/fileUtils.ts
import { ProjectFile, FileState } from '../types/preview'

/**
 * Generate a simple hash for client-side use
 * In production, consider using crypto.subtle.digest for better security
 */
export function generateHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}

/**
 * Create a file state object with metadata
 */
export function createFileState(path: string, content: string): FileState {
  return {
    path,
    content,
    hash: generateHash(content),
    lastModified: Date.now(),
    size: content.length
  }
}

/**
 * Generate a combined hash for an array of files
 * Used for cache validation
 */
export function generateFilesHash(files: ProjectFile[]): string {
  const filesContent = files
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(f => `${f.path}:${f.content}`)
    .join('|')
  return generateHash(filesContent)
}

/**
 * Validate file structure
 */
export function validateFiles(files: ProjectFile[]): { isValid: boolean; error?: string } {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return { isValid: false, error: 'No files provided for preview' }
  }

  const invalidFiles = files.filter(file => !file.path || typeof file.content !== 'string')
  if (invalidFiles.length > 0) {
    return { 
      isValid: false, 
      error: `Invalid file structure. All files must have "path" and "content" properties.` 
    }
  }

  return { isValid: true }
}

/**
 * Log files structure for debugging
 */
export function logFilesStructure(files: ProjectFile[], context: string = 'Files') {
  console.log(`📁 [${context}] Structure:`)
  files.slice(0, 5).forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.path} (${file.content?.length || 0} chars)`)
  })
  if (files.length > 5) {
    console.log(`  ... and ${files.length - 5} more files`)
  }
}

