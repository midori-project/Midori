// components/CodeEditor/FileExplorer.tsx
'use client'

import React from 'react'
import { CodeEditorFile } from '@/hooks/useCodeEditor'

interface FileExplorerProps {
  files: Map<string, CodeEditorFile>
  currentFile: CodeEditorFile | null
  onFileSelect: (path: string) => void
  className?: string
}

export function FileExplorer({ 
  files, 
  currentFile, 
  onFileSelect, 
  className = '' 
}: FileExplorerProps) {
  // Group files by directory
  const fileTree = React.useMemo(() => {
    const tree: Record<string, Array<{ path: string; file: CodeEditorFile }>> = {}
    
    Array.from(files.entries()).forEach(([path, file]) => {
      const parts = path.split('/')
      const dir = parts.slice(0, -1).join('/') || 'root'
      const fileName = parts[parts.length - 1]
      
      if (!tree[dir]) {
        tree[dir] = []
      }
      
      tree[dir].push({ path, file })
    })
    
    // Sort directories and files
    Object.keys(tree).forEach(dir => {
      tree[dir].sort((a, b) => {
        const aIsDir = a.path.includes('/')
        const bIsDir = b.path.includes('/')
        if (aIsDir !== bIsDir) {
          return aIsDir ? -1 : 1
        }
        return a.path.localeCompare(b.path)
      })
    })
    
    return tree
  }, [files])

  const getFileIcon = (path: string, language: string) => {
    const ext = path.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'tsx':
      case 'ts':
        return '🔷'
      case 'jsx':
      case 'js':
        return '🟨'
      case 'css':
        return '🎨'
      case 'scss':
      case 'sass':
        return '💅'
      case 'html':
        return '🌐'
      case 'json':
        return '📋'
      case 'md':
        return '📝'
      case 'py':
        return '🐍'
      case 'java':
        return '☕'
      case 'cpp':
      case 'c':
        return '⚙️'
      case 'php':
        return '🐘'
      case 'rb':
        return '💎'
      case 'go':
        return '🐹'
      case 'rs':
        return '🦀'
      case 'sql':
        return '🗄️'
      case 'yaml':
      case 'yml':
        return '⚙️'
      case 'xml':
        return '📄'
      case 'sh':
      case 'bash':
        return '💻'
      default:
        return '📄'
    }
  }

  const getDirectoryIcon = (dir: string) => {
    if (dir === 'root') return '📁'
    if (dir.includes('src')) return '📦'
    if (dir.includes('components')) return '🧩'
    if (dir.includes('pages')) return '📄'
    if (dir.includes('styles')) return '🎨'
    if (dir.includes('utils')) return '🔧'
    if (dir.includes('hooks')) return '🪝'
    if (dir.includes('types')) return '📝'
    if (dir.includes('api')) return '🔌'
    if (dir.includes('config')) return '⚙️'
    return '📁'
  }

  return (
    <div className={`bg-gray-50 border-r border-gray-200 h-full overflow-y-auto ${className}`}>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          📁 Project Files
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
            {files.size} files
          </span>
        </h3>
        
        <div className="space-y-1">
          {Object.entries(fileTree).map(([dir, dirFiles]) => (
            <div key={dir} className="mb-2">
              <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                {getDirectoryIcon(dir)} {dir === 'root' ? 'Root' : dir}
              </div>
              
              <div className="ml-2 space-y-1">
                {dirFiles.map(({ path, file }) => (
                  <button
                    key={path}
                    onClick={() => onFileSelect(path)}
                    className={`w-full text-left px-2 py-1 rounded text-sm flex items-center hover:bg-gray-100 transition-colors ${
                      currentFile?.path === path
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="mr-2 text-sm">
                      {getFileIcon(path, file.language)}
                    </span>
                    <span className="flex-1 truncate">
                      {path.split('/').pop()}
                    </span>
                    {file.isModified && (
                      <span className="ml-1 text-orange-500 text-xs">●</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {files.size === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            <div className="text-2xl mb-2">📂</div>
            <div>No files loaded</div>
            <div className="text-xs mt-1">Start a preview to see files</div>
          </div>
        )}
      </div>
    </div>
  )
}
