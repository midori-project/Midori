// app/preview/daytona/page.tsx
"use client"

import * as React from 'react'
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview'

export default function DaytonaPreviewPage() {
  const {
    sandboxId,
    status,
    previewUrlWithToken, // มีโทเคนใน query (เหมาะเปิดในแท็บใหม่)
    error,
    loading,
    startPreview,
    stopPreview,
  } = useDaytonaPreview()


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
            disabled={loading || status === 'running'}
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
