// app/preview/daytona/page.tsx
"use client"

import * as React from 'react'
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview'
import { useState } from 'react'
import { fetchTemplateSourceByLabel, fetchTemplateSourceByCategory, TemplateSourceItem } from './action'

export default function DaytonaPreviewPage() {
  const [label, setLabel] = useState('Cafe Basic Template')
  const [category, setCategory] = useState('Restaurant')
  const [results, setResults] = useState<TemplateSourceItem[] | null>(null)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [errorSearch, setErrorSearch] = useState<string | null>(null)
  const {
    sandboxId,
    status,
    previewUrlWithToken, // มีโทเคนใน query (เหมาะเปิดในแท็บใหม่)
    error,
    loading,
    startPreview,
    stopPreview,
  } = useDaytonaPreview()

  async function onSearchByLabel() {
    setLoadingSearch(true)
    setErrorSearch(null)
    try {
      const res = await fetchTemplateSourceByLabel(label)
      console.log('[Page] search by label result:', res)
      if (!res.success) throw new Error(res.error || 'fetch failed')
      res.data?.forEach((item, idx) => {
        console.log(`[Page] item#${idx} template:`, item.template)
        console.log(`[Page] item#${idx} version:`, item.version)
        console.log(`[Page] item#${idx} sourceSummary:`, item.sourceSummary)
        console.log(`[Page] item#${idx} files:`, item.sourceFiles?.map(f => ({ path: f.path, size: f.size, encoding: f.encoding })))
      })
      setResults(res.data || [])
    } catch (e: any) {
      setErrorSearch(e.message)
      setResults(null)
    } finally {
      setLoadingSearch(false)
    }
  }

  async function onSearchByCategory() {
    setLoadingSearch(true)
    setErrorSearch(null)
    try {
      const res = await fetchTemplateSourceByCategory(category)
      console.log('[Page] search by category result:', res)
      if (!res.success) throw new Error(res.error || 'fetch failed')
      res.data?.forEach((item, idx) => {
        console.log(`[Page] item#${idx} template:`, item.template)
        console.log(`[Page] item#${idx} version:`, item.version)
        console.log(`[Page] item#${idx} sourceSummary:`, item.sourceSummary)
        console.log(`[Page] item#${idx} files:`, item.sourceFiles?.map(f => ({ path: f.path, size: f.size, encoding: f.encoding })))
      })
      setResults(res.data || [])
    } catch (e: any) {
      setErrorSearch(e.message)
      setResults(null)
    } finally {
      setLoadingSearch(false)
    }
  }

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

        <div className="mt-6 p-4 border rounded-lg bg-white space-y-3">
          <h2 className="text-lg font-semibold">ค้นหา Template Source</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ค้นหาตาม label (เช่น Cafe)"
              className="px-3 py-2 border rounded"
            />
            <button onClick={onSearchByLabel} disabled={loadingSearch} className="px-3 py-2 bg-neutral-800 text-white rounded disabled:opacity-50">
              ค้นหาตาม Label
            </button>
            <span className="text-neutral-400">หรือ</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="ค้นหาตาม category (เช่น Restaurant)"
              className="px-3 py-2 border rounded"
            />
            <button onClick={onSearchByCategory} disabled={loadingSearch} className="px-3 py-2 bg-neutral-800 text-white rounded disabled:opacity-50">
              ค้นหาตาม Category
            </button>
            {loadingSearch && <span className="text-sm text-neutral-500">กำลังค้นหา...</span>}
            {errorSearch && <span className="text-sm text-rose-600">{errorSearch}</span>}
          </div>

          {results && (
            <div className="mt-3 space-y-2">
              {results.length === 0 && <div className="text-sm text-neutral-500">ไม่พบผลลัพธ์</div>}
              {results.map((r) => (
                <div key={r.template.id} className="p-3 border rounded">
                  <div className="font-medium">{r.template.label} <span className="text-neutral-500">({r.template.category || '—'})</span></div>
                  <div className="text-xs text-neutral-500">key: {r.template.key}</div>
                  {r.version && (
                    <div className="text-xs text-neutral-600">version: {r.version.version} checksum: {r.version.checksum || '-'}</div>
                  )}
                  {r.sourceSummary && (
                    <div className="text-xs text-neutral-600">files: {r.sourceSummary.filesCount}, size: {r.sourceSummary.sizeBytes} bytes</div>
                  )}
                  {r.sourceFiles?.length ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">แสดงไฟล์ ({r.sourceFiles.length})</summary>
                      <ul className="mt-2 space-y-2 text-sm">
                        {r.sourceFiles.map((f) => (
                          <li key={f.id} className="border rounded p-2">
                            <details>
                              <summary className="flex items-center justify-between gap-2 cursor-pointer">
                                <code className="bg-neutral-100 px-2 py-1 rounded break-all">{f.path}</code>
                                <span className="text-xs text-neutral-500">{f.size} bytes</span>
                              </summary>
                              <div className="mt-2">
                                {f.encoding === 'utf8' ? (
                                  <pre className="bg-neutral-50 border rounded p-3 max-h-72 overflow-auto text-xs whitespace-pre-wrap">
                                    <code>{f.content}</code>
                                  </pre>
                                ) : (
                                  <div className="text-xs text-amber-600">
                                    ไฟล์นี้ถูกเข้ารหัสเป็น {f.encoding} ไม่แสดงตัวอย่างเนื้อหา
                                  </div>
                                )}
                              </div>
                            </details>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              ))}
            </div>
          )}
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

            <p className="text-xs text-amber-600 mt-2">
              หมายเหตุ: ถ้าพรีวิวเป็น <b>private</b> การฝังใน iframe อาจเจอ redirect/CORS/HMR error
              แนะนำเปิดในแท็บใหม่ หรือทำ proxy ฝั่งเซิร์ฟเวอร์เพื่อแนบโทเคนทุกรีเควสต์
              (ไม่สามารถใส่ <code>X-Daytona-Skip-Preview-Warning</code> เป็นแอตทริบิวต์ใน iframe ได้)
            </p>
          </>
        )}
      </div>
    </div>
  )
}
