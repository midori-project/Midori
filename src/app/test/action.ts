// app/test/action.ts
// ฟังก์ชันฝั่ง client/server สำหรับเรียก Template API เพื่อดึง source ตาม label/category

export type TemplateSourceItem = {
  template: {
    id: string
    key: string
    label: string
    category: string | null
  }
  meta?: unknown
  version: {
    id: string
    version: number
    semver?: string | null
    status?: string | null
    createdAt?: string | null
    files?: unknown
    slots?: unknown
    constraints?: unknown
    checksum?: string | null
    sizeBytes?: number | null
  } | null
  sourceFiles: Array<{
    id: string
    path: string
    type?: string | null
    encoding: string
    contentType?: string | null
    size: number
    sha256: string
    content: string
  }>
  sourceSummary: {
    filesCount: number
    sizeBytes: number
    checksum: string
  } | null
}

type FetchOptions = {
  label?: string
  category?: string
  version?: number
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) usp.set(k, String(v))
  })
  return usp.toString()
}

export async function fetchTemplateSource(opts: FetchOptions): Promise<{
  success: boolean
  data?: TemplateSourceItem[]
  count?: number
  error?: string
}> {
  const qs = buildQuery({ action: 'source', label: opts.label, category: opts.category, version: opts.version })
  const url = `/api/template?${qs}`
  console.log('[TemplateAPI] Request URL:', url)
  const res = await fetch(url, { method: 'GET' })
  console.log('[TemplateAPI] Status:', res.status)
  const json = await res.json()
  if (json?.success) {
    console.log('[TemplateAPI] count:', json?.count ?? json?.data?.length ?? 0)
  } else {
    console.log('[TemplateAPI] error:', json?.error)
  }
  return json
}

export async function fetchTemplateSourceByLabel(label: string) {
  return fetchTemplateSource({ label })
}

export async function fetchTemplateSourceByCategory(category: string) {
  return fetchTemplateSource({ category })
}


