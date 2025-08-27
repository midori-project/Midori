'use client';

import React from 'react';
import { GeneratedFile } from '@/types/sitegen';

interface FileTreeProps {
  files: GeneratedFile[];
  selectedFile: GeneratedFile | null;
  onFileSelect: (file: GeneratedFile) => void;
  projectStructure: any;
}

const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFile,
  onFileSelect,
  projectStructure
}) => {
  // Get file icon based on extension
  const getFileIcon = (path: string, type: GeneratedFile['type']) => {
    const extension = path.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'tsx':
      case 'jsx':
        return '⚛️';
      case 'ts':
      case 'js':
        return '📜';
      case 'css':
      case 'scss':
        return '🎨';
      case 'json':
        return '⚙️';
      case 'md':
        return '📝';
      case 'html':
        return '🌐';
      default:
        return type === 'component' ? '🧩' : 
               type === 'page' ? '📄' : 
               type === 'api' ? '🔌' : '📄';
    }
  };

  // Group files by directory
  const organizeFiles = (files: GeneratedFile[]) => {
    const organized: { [key: string]: GeneratedFile[] } = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      if (pathParts.length === 1) {
        // Root files
        if (!organized['root']) organized['root'] = [];
        organized['root'].push(file);
      } else {
        // Directory files
        const dir = pathParts.slice(0, -1).join('/');
        if (!organized[dir]) organized[dir] = [];
        organized[dir].push(file);
      }
    });
    
    return organized;
  };

  const organizedFiles = organizeFiles(files);
  const directories = Object.keys(organizedFiles).sort();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          📁 {projectStructure?.name || 'Project Files'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {files.length} files generated
        </p>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {directories.map(directory => (
          <div key={directory} className="mb-2">
            {/* Directory Header */}
            {directory !== 'root' && (
              <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <span>📂</span>
                  <span>{directory}</span>
                </div>
              </div>
            )}

            {/* Files in Directory */}
            <div className={directory === 'root' ? 'mt-2' : ''}>
              {organizedFiles[directory].map(file => (
                <button
                  key={file.path}
                  onClick={() => onFileSelect(file)}
                  className={`
                    w-full text-left px-4 py-2 flex items-center space-x-3
                    hover:bg-blue-50 transition-colors
                    ${selectedFile?.path === file.path 
                      ? 'bg-blue-100 border-r-2 border-blue-500 text-blue-900' 
                      : 'text-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">
                    {getFileIcon(file.path, file.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {file.path.split('/').pop()}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {file.type} • {file.language}
                    </div>
                  </div>
                  {file.content.length > 0 && (
                    <div className="text-xs text-gray-400">
                      {Math.round(file.content.length / 1024)}KB
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div>📊 Project Statistics:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Components: {files.filter(f => f.type === 'component').length}</div>
            <div>Pages: {files.filter(f => f.type === 'page').length}</div>
            <div>Configs: {files.filter(f => f.type === 'config').length}</div>
            <div>Styles: {files.filter(f => f.type === 'style').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileTree;
