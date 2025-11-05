// hooks/useCodeEditor.ts
'use client'

import { useState, useCallback, useRef, useMemo } from 'react'

interface PatchOperation {
  type: 'insert' | 'delete' | 'replace'
  line: number
  content: string
  oldContent?: string
}

interface PartialUpdate {
  path: string
  operations: PatchOperation[]
  strategy: 'patch' | 'full'
}

export interface CodeEditorFile {
  path: string
  content: string
  language: string
  isModified: boolean
  lastModified: number
  originalContent: string
}

interface UseCodeEditorProps {
  sandboxId?: string
  projectId?: string
  initialFiles?: Array<{
    path: string
    content: string
    type?: string
    language?: string
  }>
}

interface UseCodeEditorReturn {
  // File management
  files: Map<string, CodeEditorFile>
  currentFile: CodeEditorFile | null
  setCurrentFile: (path: string) => void
  
  // Editor operations
  updateFileContent: (path: string, content: string) => void
  updatePartialContent: (path: string, line: number, newContent: string) => void
  insertLine: (path: string, line: number, content: string) => void
  deleteLine: (path: string, line: number) => void
  replaceLine: (path: string, line: number, newContent: string) => void
  
  // Update operations
  saveFile: (path: string) => Promise<boolean>
  saveAllFiles: () => Promise<boolean>
  updateToDaytona: (path: string) => Promise<boolean>
  updatePartialToDaytona: (path: string) => Promise<boolean>
  
  // State
  isModified: boolean
  hasUnsavedChanges: boolean
  loading: boolean
  error: string | null
}

export function useCodeEditor({ 
  sandboxId, 
  projectId, 
  initialFiles = [] 
}: UseCodeEditorProps = {}): UseCodeEditorReturn {
  const [files, setFiles] = useState<Map<string, CodeEditorFile>>(new Map())
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize files from initialFiles
  useMemo(() => {
    if (initialFiles.length > 0) {
      const filesMap = new Map<string, CodeEditorFile>()
      initialFiles.forEach(file => {
        const language = getLanguageFromPath(file.path)
        filesMap.set(file.path, {
          path: file.path,
          content: file.content,
          language,
          isModified: false,
          lastModified: Date.now(),
          originalContent: file.content
        })
      })
      setFiles(filesMap)
      if (initialFiles.length > 0) {
        setCurrentFilePath(initialFiles[0].path)
      }
    }
  }, [initialFiles])

  // Get current file
  const currentFile = currentFilePath ? files.get(currentFilePath) || null : null

  // Check if any files are modified
  const isModified = Array.from(files.values()).some(file => file.isModified)
  const hasUnsavedChanges = isModified

  // Set current file
  const setCurrentFile = useCallback((path: string) => {
    if (files.has(path)) {
      setCurrentFilePath(path)
    }
  }, [files])

  // Update file content
  const updateFileContent = useCallback((path: string, content: string) => {
    setFiles(prev => {
      const newFiles = new Map(prev)
      const file = newFiles.get(path)
      if (file) {
        newFiles.set(path, {
          ...file,
          content,
          isModified: content !== file.originalContent,
          lastModified: Date.now()
        })
      }
      return newFiles
    })
  }, [])

  // Update partial content (single line)
  const updatePartialContent = useCallback((path: string, line: number, newContent: string) => {
    setFiles(prev => {
      const newFiles = new Map(prev)
      const file = newFiles.get(path)
      if (file) {
        const lines = file.content.split('\n')
        if (line >= 0 && line < lines.length) {
          lines[line] = newContent
          const newContentStr = lines.join('\n')
          newFiles.set(path, {
            ...file,
            content: newContentStr,
            isModified: newContentStr !== file.originalContent,
            lastModified: Date.now()
          })
        }
      }
      return newFiles
    })
  }, [])

  // Insert line
  const insertLine = useCallback((path: string, line: number, content: string) => {
    setFiles(prev => {
      const newFiles = new Map(prev)
      const file = newFiles.get(path)
      if (file) {
        const lines = file.content.split('\n')
        lines.splice(line, 0, content)
        const newContentStr = lines.join('\n')
        newFiles.set(path, {
          ...file,
          content: newContentStr,
          isModified: newContentStr !== file.originalContent,
          lastModified: Date.now()
        })
      }
      return newFiles
    })
  }, [])

  // Delete line
  const deleteLine = useCallback((path: string, line: number) => {
    setFiles(prev => {
      const newFiles = new Map(prev)
      const file = newFiles.get(path)
      if (file) {
        const lines = file.content.split('\n')
        if (line >= 0 && line < lines.length) {
          lines.splice(line, 1)
          const newContentStr = lines.join('\n')
          newFiles.set(path, {
            ...file,
            content: newContentStr,
            isModified: newContentStr !== file.originalContent,
            lastModified: Date.now()
          })
        }
      }
      return newFiles
    })
  }, [])

  // Replace line
  const replaceLine = useCallback((path: string, line: number, newContent: string) => {
    updatePartialContent(path, line, newContent)
  }, [updatePartialContent])

  // Generate patch operations
  const generatePatchOperations = useCallback((path: string): PatchOperation[] => {
    const file = files.get(path)
    if (!file) return []

    const originalLines = file.originalContent.split('\n')
    const currentLines = file.content.split('\n')
    const operations: PatchOperation[] = []

    // Simple diff algorithm
    const maxLines = Math.max(originalLines.length, currentLines.length)
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i]
      const currentLine = currentLines[i]

      if (originalLine === undefined) {
        // Line was added
        operations.push({
          type: 'insert',
          line: i,
          content: currentLine
        })
      } else if (currentLine === undefined) {
        // Line was deleted
        operations.push({
          type: 'delete',
          line: i,
          content: originalLine,
          oldContent: originalLine
        })
      } else if (originalLine !== currentLine) {
        // Line was modified
        operations.push({
          type: 'replace',
          line: i,
          content: currentLine,
          oldContent: originalLine
        })
      }
    }

    return operations
  }, [files])

  // Save file (update original content)
  const saveFile = useCallback(async (path: string): Promise<boolean> => {
    const file = files.get(path)
    if (!file) return false

    setFiles(prev => {
      const newFiles = new Map(prev)
      const updatedFile = newFiles.get(path)
      if (updatedFile) {
        newFiles.set(path, {
          ...updatedFile,
          originalContent: updatedFile.content,
          isModified: false
        })
      }
      return newFiles
    })

    return true
  }, [files])

  // Save all files
  const saveAllFiles = useCallback(async (): Promise<boolean> => {
    setFiles(prev => {
      const newFiles = new Map(prev)
      newFiles.forEach((file, path) => {
        if (file.isModified) {
          newFiles.set(path, {
            ...file,
            originalContent: file.content,
            isModified: false
          })
        }
      })
      return newFiles
    })
    return true
  }, [])

  // Update to Daytona (full file)
  const updateToDaytona = useCallback(async (path: string): Promise<boolean> => {
    if (!sandboxId) {
      setError('No sandbox ID available')
      return false
    }

    const file = files.get(path)
    if (!file) {
      setError('File not found')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: [{
            path: file.path,
            content: file.content,
            type: file.language
          }],
          projectId,
          comparison: {
            totalFiles: 1,
            changedFiles: 1,
            skippedFiles: 0
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update file')
      }

      // Mark as saved after successful update
      await saveFile(path)
      return true
    } catch (e: any) {
      setError(e?.message || 'Failed to update file')
      return false
    } finally {
      setLoading(false)
    }
  }, [sandboxId, projectId, files, saveFile])

  // Update partial to Daytona (patch operations)
  const updatePartialToDaytona = useCallback(async (path: string): Promise<boolean> => {
    if (!sandboxId) {
      setError('No sandbox ID available')
      return false
    }

    const file = files.get(path)
    if (!file) {
      setError('File not found')
      return false
    }

    const operations = generatePatchOperations(path)
    if (operations.length === 0) {
      return true // No changes to update
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/preview/daytona/partial?sandboxId=${encodeURIComponent(sandboxId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: file.path,
          operations,
          projectId
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update file partially')
      }

      // Mark as saved after successful update
      await saveFile(path)
      return true
    } catch (e: any) {
      setError(e?.message || 'Failed to update file partially')
      return false
    } finally {
      setLoading(false)
    }
  }, [sandboxId, projectId, files, generatePatchOperations, saveFile])

  return {
    // File management
    files,
    currentFile,
    setCurrentFile,
    
    // Editor operations
    updateFileContent,
    updatePartialContent,
    insertLine,
    deleteLine,
    replaceLine,
    
    // Update operations
    saveFile,
    saveAllFiles,
    updateToDaytona,
    updatePartialToDaytona,
    
    // State
    isModified,
    hasUnsavedChanges,
    loading,
    error
  }
}

// Helper function to get language from file path
function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sh': 'shell',
    'bash': 'shell'
  }
  return languageMap[ext || ''] || 'text'
}
