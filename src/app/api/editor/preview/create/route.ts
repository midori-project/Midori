// app/api/editor/preview/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/libs/auth/session'

// POST /api/editor/preview/create - สร้าง preview ใหม่สำหรับ project
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId, files } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // TODO: สร้าง preview ใน editor service
    // ตอนนี้จะ return mock data ก่อน
    const mockPreviewData = {
      projectId,
      sandboxId: `sandbox-${Date.now()}`,
      previewUrl: 'https://example.com/preview',
      previewToken: 'mock-token',
      status: 'running' as const,
      files: files || [],
      lastUpdated: new Date().toISOString(),
    }

    console.log(`🚀 [API] Created preview for project: ${projectId}`)
    
    return NextResponse.json(mockPreviewData)
    
  } catch (error) {
    console.error('Error creating editor preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
