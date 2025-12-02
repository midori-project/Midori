// hooks/useFileComparison.ts
import { useCallback, useRef } from 'react'
import { ProjectFile, FileState, FileComparison, FileComparisonResult } from '../types/preview'
import { createFileState } from '../utils/fileUtils'

export function useFileComparison() {
  const fileStatesRef = useRef<Map<string, FileState>>(new Map())

  /**
   * Compare a single file with its previous state
   */
  const compareFile = useCallback((path: string, newContent: string): FileComparison => {
    const oldState = fileStatesRef.current.get(path)
    const newState = createFileState(path, newContent)
    
    if (!oldState) {
      return { 
        hasChanged: true, 
        changeType: 'added', 
        newState 
      }
    }
    
    if (oldState.hash === newState.hash) {
      return { 
        hasChanged: false, 
        changeType: 'unchanged', 
        oldState, 
        newState 
      }
    }
    
    return { 
      hasChanged: true, 
      changeType: 'modified', 
      oldState, 
      newState 
    }
  }, [])

  /**
   * Update the stored state for a file
   */
  const updateFileState = useCallback((path: string, content: string): FileState => {
    const newState = createFileState(path, content)
    fileStatesRef.current.set(path, newState)
    return newState
  }, [])

  /**
   * Update states for multiple files
   */
  const updateMultipleFileStates = useCallback((files: ProjectFile[]): void => {
    files.forEach(file => {
      updateFileState(file.path, file.content)
    })
    console.log(`📁 [FILE COMPARISON] Updated state for ${files.length} files`)
  }, [updateFileState])

  /**
   * Compare multiple files and return changed/unchanged files
   */
  const compareFiles = useCallback((files: ProjectFile[]): FileComparisonResult => {
    const changedFiles: ProjectFile[] = []
    const skippedFiles: string[] = []
    
    console.log(`🔍 [FILE COMPARISON] Comparing ${files.length} files for changes...`)
    
    files.forEach(file => {
      const comparison = compareFile(file.path, file.content)
      
      if (comparison.hasChanged) {
        changedFiles.push(file)
        console.log(`📝 [FILE COMPARISON] File changed: ${file.path} (${comparison.changeType})`)
      } else {
        skippedFiles.push(file.path)
        console.log(`⏭️ [FILE COMPARISON] File unchanged: ${file.path}`)
      }
    })
    
    const result = {
      changedFiles,
      skippedFiles,
      comparison: {
        totalFiles: files.length,
        changedFiles: changedFiles.length,
        skippedFiles: skippedFiles.length
      }
    }
    
    console.log(`📊 [FILE COMPARISON] Result: ${changedFiles.length} changed, ${skippedFiles.length} unchanged`)
    
    return result
  }, [compareFile])

  /**
   * Check if any files have changed
   */
  const hasChanges = useCallback((files: ProjectFile[]): boolean => {
    return files.some(file => {
      const comparison = compareFile(file.path, file.content)
      return comparison.hasChanged
    })
  }, [compareFile])

  /**
   * Get current file states count
   */
  const getStatesCount = useCallback((): number => {
    return fileStatesRef.current.size
  }, [])

  /**
   * Clear all file states
   */
  const clearStates = useCallback((): void => {
    fileStatesRef.current.clear()
    console.log(`🗑️ [FILE COMPARISON] Cleared all file states`)
  }, [])

  /**
   * Get statistics about file states
   */
  const getStats = useCallback(() => {
    const states = Array.from(fileStatesRef.current.values())
    return {
      totalFiles: states.length,
      totalSize: states.reduce((sum, state) => sum + state.size, 0),
      oldestModified: states.reduce((oldest, state) => 
        Math.min(oldest, state.lastModified), Date.now()),
      newestModified: states.reduce((newest, state) => 
        Math.max(newest, state.lastModified), 0),
    }
  }, [])

  return {
    compareFile,
    compareFiles,
    updateFileState,
    updateMultipleFileStates,
    hasChanges,
    getStatesCount,
    clearStates,
    getStats,
  }
}

