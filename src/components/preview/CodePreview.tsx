'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });
import { GeneratedFile } from '@/types/sitegen';

interface CodePreviewProps {
  files: GeneratedFile[];
  projectStructure: any;
}

const CodePreview: React.FC<CodePreviewProps> = ({ files, projectStructure }) => {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [fileTree, setFileTree] = useState<any>({});

  // Initialize with main page
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      const mainFile = files.find(f => 
        f.path.includes('page.tsx') || 
        f.path.includes('index') || 
        f.type === 'page'
      ) || files[0];
      setSelectedFile(mainFile);
    }
  }, [files, selectedFile]);

  // Configure Monaco loader to use CDN workers to avoid bundler worker issues
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const monacoReact = await import('@monaco-editor/react');
        if (!isMounted) return;
        if ('loader' in monacoReact && monacoReact.loader) {
          monacoReact.loader.config({
            paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }
          });
        }
      } catch (e) {
        console.warn('Monaco loader config error:', e);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Build file tree structure
  useEffect(() => {
    const tree: any = {};
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // This is a file
          current[part] = file;
        } else {
          // This is a directory
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });
    setFileTree(tree);
  }, [files]);

  const getFileIcon = (file: GeneratedFile) => {
    const ext = file.path.split('.').pop();
    const icons: Record<string, string> = {
      'tsx': '⚛️',
      'ts': '🔷',
      'js': '🟨',
      'jsx': '⚛️',
      'json': '📋',
      'css': '🎨',
      'md': '📝',
      'html': '🌐'
    };
    return icons[ext || ''] || '📄';
  };

  const getLanguageFromFile = (file: GeneratedFile): string => {
    const ext = file.path.split('.').pop();
    const languages: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript', 
      'js': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'css': 'css',
      'md': 'markdown',
      'html': 'html'
    };
    return languages[ext || ''] || 'typescript';
  };

  const renderFileTree = (tree: any, path: string = '') => {
    return Object.keys(tree).map(key => {
      const item = tree[key];
      const fullPath = path ? `${path}/${key}` : key;
      
      if (item.path) {
        // This is a file
        return (
          <div
            key={item.path}
            className={`flex items-center space-x-2 px-3 py-1.5 cursor-pointer rounded text-sm transition-colors
              ${selectedFile?.path === item.path 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'hover:bg-gray-100 text-gray-700'
              }`}
            onClick={() => setSelectedFile(item)}
          >
            <span className="text-base">{getFileIcon(item)}</span>
            <span className="truncate">{key}</span>
          </div>
        );
      } else {
        // This is a directory
        return (
          <div key={fullPath} className="mb-1">
            <div className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-gray-600">
              <span>📁</span>
              <span>{key}</span>
            </div>
            <div className="ml-4 border-l border-gray-200 pl-2">
              {renderFileTree(item, fullPath)}
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className="h-full flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* File Explorer Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <span className="mr-2">📁</span>
              Project Files
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                title="Toggle theme"
              >
                {theme === 'vs-dark' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-3">
            <span>📊 {files.length} files</span>
            <span>⚡ {projectStructure?.framework || 'Next.js'}</span>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {renderFileTree(fileTree)}
        </div>

        {/* Stats */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Components:</span>
              <span>{files.filter(f => f.type === 'component').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Pages:</span>
              <span>{files.filter(f => f.type === 'page').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Config:</span>
              <span>{files.filter(f => f.type === 'config').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        {selectedFile && (
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getFileIcon(selectedFile)}</span>
              <span className="font-medium text-gray-800">{selectedFile.path}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
                {getLanguageFromFile(selectedFile)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{selectedFile.type}</span>
              <span>•</span>
              <span>{selectedFile.content.split('\n').length} lines</span>
            </div>
          </div>
        )}

        {/* Monaco Editor */}
        <div className="flex-1">
          {selectedFile ? (
            <Editor
              height="100%"
              language={getLanguageFromFile(selectedFile)}
              theme={theme}
              value={selectedFile.content}
              options={{
                readOnly: true,
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                renderWhitespace: 'selection',
                bracketPairColorization: { enabled: true },
                codeLens: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'line',
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
              }}
              onMount={(editor, monaco) => {
                try {
                  // Enhanced TypeScript configuration
                  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2020,
                    allowNonTsExtensions: true,
                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.ESNext,
                    noEmit: true,
                    esModuleInterop: true,
                    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                    allowJs: true,
                    strict: false,
                    skipLibCheck: true,
                    allowSyntheticDefaultImports: true,
                  });

                  // Add comprehensive React types
                  monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    `
                    declare module 'react' {
                      export interface FC<P = {}> extends FunctionComponent<P> {}
                      export interface FunctionComponent<P = {}> {
                        (props: P & { children?: ReactNode }): ReactElement | null;
                      }
                      export type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
                      export type ReactElement = any;
                      export type ReactChild = ReactElement | ReactText;
                      export type ReactText = string | number;
                      export type ReactFragment = {} | ReactNodeArray;
                      export type ReactPortal = any;
                      export interface ReactNodeArray extends Array<ReactNode> {}
                      export function useState<S>(initialState: S | (() => S)): [S, (newState: S | ((prevState: S) => S)) => void];
                      export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
                      export default React;
                    }
                    
                    declare module 'next/*' {
                      const component: any;
                      export default component;
                    }
                    
                    declare global {
                      namespace JSX {
                        interface IntrinsicElements {
                          [elemName: string]: any;
                        }
                      }
                    }
                    `,
                    'file:///node_modules/@types/react/index.d.ts'
                  );
                } catch (error) {
                  console.warn('Monaco setup error:', error);
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <div>Select a file to view its content</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePreview;
