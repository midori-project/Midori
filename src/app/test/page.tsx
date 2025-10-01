// app/preview/daytona/page.tsx
"use client"

import * as React from 'react'
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview'
import testCafeData from '@/components/preview/test/test-cafe-complete.json'

export default function DaytonaPreviewPage() {
  // Mock Project ID และใช้ไฟล์จาก test-cafe-complete.json โดยตรง
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
    previewUrlWithToken, // มีโทเคนใน query (เหมาะเปิดในแท็บใหม่)
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

  // ถ้าคุณทำ sandbox เป็น public: ใช้ previewUrlPublic แทน (ไม่มี token)
  // ณ ที่นี้เราจะใช้ previewUrlWithToken ไปก่อน แต่ **แนะนำ** ให้ฝัง iframe เฉพาะกรณี public
  const iframeSrc = previewUrlWithToken

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Daytona Preview</h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={startPreview}
            disabled={loading || status === 'running' || templateFiles.length === 0}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
          >
            {status === 'running' ? 'Running' : loading ? 'Starting...' : 'Start Preview'}
          </button>

          <button
            onClick={stopPreview}
            disabled={loading || status !== 'running'}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white disabled:opacity-50"
          >
            Stop Preview
          </button>

          <span className="px-3 py-2 rounded-lg bg-neutral-200 text-neutral-700">
            Status: {status}
          </span>
        </div>


        <div className="bg-white p-4 rounded-lg border border-neutral-200 space-y-2">
          <h2 className="font-semibold text-neutral-800 mb-2">📦 Project Information</h2>
          <div className="text-sm text-neutral-600 space-y-1">
            <div>Project ID: <code className="font-mono">{mockProjectId}</code></div>
            <div>Project Name: <code className="font-mono">{projectName}</code></div>
            <div>Type: <code className="font-mono">{testCafeData.projectStructure.type}</code></div>
            <div>Description: <span className="text-neutral-500">{testCafeData.projectStructure.description}</span></div>
            <div>Files Ready: <code className="font-mono bg-green-100 text-green-700 px-2 py-1 rounded">{templateFiles.length} files</code></div>
          </div>
        </div>

        {/* แสดงรายการไฟล์ */}
        <details className="bg-white p-4 rounded-lg border border-neutral-200">
          <summary className="font-semibold text-neutral-800 cursor-pointer">📁 Files Preview ({templateFiles.length} files)</summary>
          <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
            {templateFiles.map((file, index) => (
              <div key={index} className="text-xs text-neutral-600 font-mono py-1 px-2 hover:bg-neutral-50 rounded">
                <span className="text-blue-600">{file.path}</span>
                <span className="text-neutral-400 ml-2">({file.type})</span>
              </div>
            ))}
          </div>
        </details>

        {sandboxId && (
          <div className="text-sm text-neutral-600">
            Sandbox ID: <code className="font-mono">{sandboxId}</code>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {iframeSrc && status === 'running' && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {/* เปิดในแท็บใหม่: เหมาะสำหรับ private เพื่อให้เบราว์เซอร์ตั้งคุกกี้ first-party */}
              <a
                href={iframeSrc}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Open Preview in New Tab
              </a>

              <code className="text-xs bg-neutral-200 px-2 py-1 rounded break-all">
                {iframeSrc}
              </code>
            </div>

            <div className="mt-4 border rounded-lg overflow-hidden bg-white">
              <iframe
                key={iframeSrc} // reload เมื่อ URL เปลี่ยน
                src={iframeSrc}
                title="Daytona Preview"
                className="w-full h-[70vh]"
                // ถ้าเป็น public preview การตั้งค่าด้านล่างก็พอใช้ได้
                // ถ้าเป็น private + ต้องฝังจริง แนะนำทำ proxy ฝั่งเซิร์ฟเวอร์แทน
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="no-referrer"
                allow="clipboard-read; clipboard-write"
                loading="lazy"
              />
            </div>

          </>
        )}
      </div>
    </div>
  )
}
