// app/preview/daytona/page.tsx
'use client'

import * as React from 'react'
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview'

export default function DaytonaPreviewPage() {
  const {
    sandboxId,
    status,
    previewUrlWithToken,
    error,
    loading,
    startPreview,
    stopPreview,
  } = useDaytonaPreview()

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Daytona Preview</h1>

        <div className="flex gap-3">
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

        {previewUrlWithToken && status === 'running' && (
          <>
            <div className="flex items-center gap-3">
              <a
                href={previewUrlWithToken}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Open Preview in New Tab
              </a>
              <code className="text-xs bg-neutral-200 px-2 py-1 rounded">
                {previewUrlWithToken}
              </code>
            </div>

            <div className="mt-4 border rounded-lg overflow-hidden bg-white">
              <iframe
                src={previewUrlWithToken}
                title="Daytona Preview"
                className="w-full h-[70vh]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
