// components/CodeEditor/CodeEditorPanel.tsx
'use client'

import React, { useRef, useEffect } from 'react'
import { CodeEditorFile } from '@/hooks/useCodeEditor'

interface CodeEditorPanelProps {
  file: CodeEditorFile | null
  onContentChange: (content: string) => void
  onLineChange: (line: number, content: string) => void
  onSave: () => void
  onUpdateToDaytona: () => void
  onPartialUpdate: () => void
  loading?: boolean
  error?: string | null
  className?: string
}

export function CodeEditorPanel({
  file,
  onContentChange,
  onLineChange,
  onSave,
  onUpdateToDaytona,
  onPartialUpdate,
  loading = false,
  error = null,
  className = ''
}: CodeEditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localContent, setLocalContent] = React.useState('')
  const [cursorPosition, setCursorPosition] = React.useState(0)

  // Update local content when file changes
  useEffect(() => {
    if (file) {
      setLocalContent(file.content)
    }
  }, [file])

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    onContentChange(newContent)
  }

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      onSave()
    }
    
    // Ctrl+Shift+S or Cmd+Shift+S to update to Daytona
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault()
      onUpdateToDaytona()
    }
    
    // Ctrl+Shift+P or Cmd+Shift+P for partial update
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault()
      onPartialUpdate()
    }
  }

  // Get line number from cursor position
  const getCurrentLine = () => {
    if (!textareaRef.current) return 0
    const text = textareaRef.current.value
    const cursorPos = textareaRef.current.selectionStart
    return text.substring(0, cursorPos).split('\n').length - 1
  }

  // Handle line-specific operations
  const handleLineClick = (lineNumber: number) => {
    const lines = localContent.split('\n')
    if (lineNumber >= 0 && lineNumber < lines.length) {
      onLineChange(lineNumber, lines[lineNumber])
    }
  }

  // Simple syntax highlighting for common languages
  const getSyntaxHighlightedContent = () => {
    if (!file) return localContent
    
    const lines = localContent.split('\n')
    
    switch (file.language) {
      case 'typescript':
      case 'javascript':
        return lines.map((line, index) => {
          const highlighted = line
            .replace(/(import|export|const|let|var|function|class|interface|type|from|return|if|else|for|while|try|catch|async|await)/g, '<span class="text-blue-600 font-semibold">$1</span>')
            .replace(/(['"`].*?['"`])/g, '<span class="text-green-600">$1</span>')
            .replace(/(\/\/.*$)/g, '<span class="text-gray-500">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>')
          return `<div class="line" data-line="${index}">${highlighted}</div>`
        }).join('')
      
      case 'css':
        return lines.map((line, index) => {
          const highlighted = line
            .replace(/([.#]?[a-zA-Z-]+)\s*{/g, '<span class="text-blue-600 font-semibold">$1</span> {')
            .replace(/([a-zA-Z-]+)\s*:/g, '<span class="text-purple-600">$1</span>:')
            .replace(/(['"`].*?['"`])/g, '<span class="text-green-600">$1</span>')
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>')
          return `<div class="line" data-line="${index}">${highlighted}</div>`
        }).join('')
      
      case 'html':
        return lines.map((line, index) => {
          const highlighted = line
            .replace(/(&lt;\/?[a-zA-Z][^&gt;]*&gt;)/g, '<span class="text-blue-600">$1</span>')
            .replace(/(['"`].*?['"`])/g, '<span class="text-green-600">$1</span>')
          return `<div class="line" data-line="${index}">${highlighted}</div>`
        }).join('')
      
      default:
        return lines.map((line, index) => 
          `<div class="line" data-line="${index}">${line}</div>`
        ).join('')
    }
  }

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-lg font-medium mb-2">No file selected</div>
          <div className="text-sm">Select a file from the explorer to start editing</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {file.path.split('/').pop()}
          </span>
          {file.isModified && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              Modified
            </span>
          )}
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
            {file.language}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onSave}
            disabled={loading || !file.isModified}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💾 Save
          </button>
          <button
            onClick={onUpdateToDaytona}
            disabled={loading || !file.isModified}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Update Full
          </button>
          <button
            onClick={onPartialUpdate}
            disabled={loading || !file.isModified}
            className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔧 Partial Update
          </button>
          
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <div className="text-sm text-red-700">
            <span className="font-medium">Error:</span> {error}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <div className="text-sm text-blue-700 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Updating to Daytona...
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 border-r border-gray-200 overflow-hidden">
          <div className="text-xs text-gray-500 font-mono leading-6 p-2">
            {localContent.split('\n').map((_, index) => (
              <div key={index} className="text-right">
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Text Editor */}
        <textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-2 pl-14 font-mono text-sm leading-6 resize-none border-0 focus:outline-none focus:ring-0"
          placeholder="Start typing your code..."
          spellCheck={false}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Line: {getCurrentLine() + 1}</span>
          <span>Chars: {localContent.length}</span>
          <span>Lines: {localContent.split('\n').length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Ctrl+S: Save</span>
          <span>Ctrl+Shift+S: Update Full</span>
          <span>Ctrl+Shift+P: Partial Update</span>
        </div>
      </div>
    </div>
  )
}
