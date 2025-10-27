// components/CodeEditor/CodeEditor.tsx
'use client'

import React from 'react'
import { useCodeEditor } from '@/hooks/useCodeEditor'
import { FileExplorer } from './FileExplorer'
import { CodeEditorPanel } from './CodeEditorPanel'

interface CodeEditorProps {
  sandboxId?: string
  projectId?: string
  initialFiles?: Array<{
    path: string
    content: string
    type?: string
    language?: string
  }>
  className?: string
}

export function CodeEditor({
  sandboxId,
  projectId,
  initialFiles = [],
  className = ''
}: CodeEditorProps) {
  const {
    files,
    currentFile,
    setCurrentFile,
    updateFileContent,
    updatePartialContent,
    saveFile,
    updateToDaytona,
    updatePartialToDaytona,
    loading,
    error
  } = useCodeEditor({
    sandboxId,
    projectId,
    initialFiles
  })

  const handleFileSelect = (path: string) => {
    setCurrentFile(path)
  }

  const handleContentChange = (content: string) => {
    if (currentFile) {
      updateFileContent(currentFile.path, content)
    }
  }

  const handleLineChange = (line: number, content: string) => {
    if (currentFile) {
      updatePartialContent(currentFile.path, line, content)
    }
  }

  const handleSave = async () => {
    if (currentFile) {
      await saveFile(currentFile.path)
    }
  }

  const handleUpdateToDaytona = async () => {
    if (currentFile) {
      await updateToDaytona(currentFile.path)
    }
  }

  const handlePartialUpdate = async () => {
    if (currentFile) {
      await updatePartialToDaytona(currentFile.path)
    }
  }

  return (
    <div className={`flex h-full bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* File Explorer */}
      <div className="w-64 flex-shrink-0">
        <FileExplorer
          files={files}
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
        />
        
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <CodeEditorPanel
          file={currentFile}
          onContentChange={handleContentChange}
          onLineChange={handleLineChange}
          onSave={handleSave}
          onUpdateToDaytona={handleUpdateToDaytona}
          onPartialUpdate={handlePartialUpdate}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
