// app/editor/page.tsx
"use client"

import * as React from 'react'
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview'
import { CodeEditor } from '@/components/CodeEditor/CodeEditor'
import testCafeData from '@/components/preview/test/test-cafe-complete.json'

export default function CodeEditorPage() {
  // Mock Project ID และใช้ไฟล์จาก test-cafe-complete.json
  const mockProjectId = "mock-project-123"
  const projectName = testCafeData.projectStructure.name
  
  // แปลงไฟล์จาก JSON เป็นรูปแบบที่ API ต้องการ
  const templateFiles = React.useMemo(() => {
    return testCafeData.files.map((f: any) => ({
      path: f.path,
      content: f.content,
      type: f.type || f.language,
    }))
  }, [])
  
  const {
    sandboxId,
    status,
    previewUrlWithToken,
    error,
    loading,
    startPreview,
    stopPreview,
  } = useDaytonaPreview({ 
    projectId: mockProjectId,
    files: templateFiles 
  })

  // Log ข้อมูลเมื่อโหลดหน้า
  React.useEffect(() => {
    console.log(`✅ Loaded ${templateFiles.length} files from test-cafe-complete.json`)
    console.log(`📦 Project: ${projectName}`)
  }, [templateFiles.length, projectName])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Code Editor</h1>
            <p className="text-sm text-gray-600 mt-1">
              Edit your code and see live updates in Daytona
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Project:</span> {projectName}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={startPreview}
                disabled={loading || status === 'running' || templateFiles.length === 0}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-700 transition-colors"
              >
                {status === 'running' ? 'Running' : loading ? 'Starting...' : 'Start Preview'}
              </button>

              <button
                onClick={stopPreview}
                disabled={loading || status !== 'running'}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white disabled:opacity-50 hover:bg-rose-700 transition-colors"
              >
                Stop Preview
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === 'running' 
                  ? 'bg-green-100 text-green-700' 
                  : status === 'creating'
                  ? 'bg-yellow-100 text-yellow-700'
                  : status === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {status}
              </span>
              
              {sandboxId && (
                <span className="text-xs text-gray-500 font-mono">
                  {sandboxId.substring(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700">
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}

        {status !== 'running' ? (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Daytona Preview
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Click "Start Preview" to create a Daytona sandbox and begin editing your code with live updates.
              </p>
              <button
                onClick={startPreview}
                disabled={loading || templateFiles.length === 0}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Starting...' : 'Start Preview'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
            {/* Code Editor */}
            <div className="lg:col-span-2">
              <CodeEditor
                sandboxId={sandboxId}
                projectId={mockProjectId}
                initialFiles={templateFiles}
                className="h-full"
              />
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-1">
              <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    🔴 Live Preview
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Connected
                    </span>
                  </h3>
                </div>
                
                <div className="h-full">
                  {previewUrlWithToken ? (
                    <iframe
                      src={previewUrlWithToken}
                      title="Live Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                      allow="clipboard-read; clipboard-write"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <div>Loading preview...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Files:</span> {templateFiles.length} | 
              <span className="font-medium ml-2">Status:</span> {status} |
              {sandboxId && (
                <>
                  <span className="font-medium ml-2">Sandbox:</span> {sandboxId.substring(0, 12)}...
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span>💾 Ctrl+S: Save</span>
              <span>🚀 Ctrl+Shift+S: Update Full</span>
              <span>🔧 Ctrl+Shift+P: Partial Update</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
