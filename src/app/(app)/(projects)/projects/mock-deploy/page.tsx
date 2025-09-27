'use client'
import { useState } from 'react'
import axios from 'axios'

export default function MockDeployPage() {
  const [projectId, setProjectId] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const runMockRecordOnly = async () => {
    if (!projectId.trim()) {
      setError('กรุณาใส่ Project ID')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await axios.post('/api/deploy-mock', {
        projectId: projectId.trim(),
        subdomain: subdomain.trim() || undefined,
      })
      setResult(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Mock deploy ล้มเหลว')
    } finally {
      setLoading(false)
    }
  }

  const runMockToVercel = async () => {
    if (!projectId.trim()) {
      setError('กรุณาใส่ Project ID')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await axios.post('/api/deploy-website/mock', {
        projectId: projectId.trim(),
        subdomain: subdomain.trim() || undefined,
      })
      setResult(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Mock-to-Vercel deploy ล้มเหลว')
    } finally {
      setLoading(false)
    }
  }

  const createMockProject = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await axios.post('/api/projects/mock', {
        name: 'Mock Project (Deploy Test)'
      })
      if (res?.data?.success && res.data.data?.id) {
        setProjectId(res.data.data.id)
      } else {
        setError('สร้าง Mock Project ไม่สำเร็จ')
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'สร้าง Mock Project ล้มเหลว')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-[#0B2604] mb-6">Mock Deploy Shortcut</h1>
        <p className="text-sm text-gray-700 mb-6">
          หน้านี้เป็นทางลัดสำหรับทดสอบการ Deploy แบบ Mock (ไม่เรียกผู้ให้บริการจริง และไม่ผ่าน Flow ปกติ)
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="เช่น project_123... หรือ UUID"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain (ไม่บังคับ)</label>
            <input
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="เช่น demo-shop"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={createMockProject}
              disabled={creating || loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'กำลังสร้างโปรเจค...' : 'Create Mock Project'}
            </button>
            <button
              onClick={runMockRecordOnly}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'กำลังสร้าง...' : 'Create Mock Record'}
            </button>
            <button
              onClick={runMockToVercel}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'กำลัง Deploy...' : 'Deploy Mock to Vercel'}
            </button>
            <a href="/projects/workspace" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">
              กลับ Workspace
            </a>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
          )}

          {result && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-sm text-gray-700 font-medium mb-2">ผลลัพธ์</div>
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              {result?.data?.url && (
                <div className="mt-3 text-sm">
                  URL: <a className="text-green-700 underline" href={result.data.url} target="_blank">{result.data.url}</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


