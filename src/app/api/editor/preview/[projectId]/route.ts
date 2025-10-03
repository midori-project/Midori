// app/api/editor/preview/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/libs/auth/session'

interface RouteParams {
  params: Promise<{
    projectId: string
  }>
}

// GET /api/editor/preview/[projectId] - ดึงข้อมูล preview สำหรับ project
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId } = await params

    // TODO: ดึงข้อมูล preview จากฐานข้อมูลหรือ editor service
    // ตอนนี้จะ return mock data ก่อน
    const mockPreviewData = {
      projectId,
      sandboxId: null,
      previewUrl: null,
      previewToken: null,
      status: 'idle' as const,
      files: [],
      lastUpdated: null,
    }

    console.log(`📋 [API] Fetched preview data for project: ${projectId}`)
    
    return NextResponse.json(mockPreviewData)
    
  } catch (error) {
    console.error('Error fetching editor preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/editor/preview/[projectId] - หยุด preview สำหรับ project
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession()
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId } = await params

    // TODO: หยุด preview ใน editor service
    // ตอนนี้จะ return success response ก่อน
    console.log(`🛑 [API] Stopped preview for project: ${projectId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Preview stopped successfully',
      data: {
        projectId,
        status: 'stopped'
      }
    })
    
  } catch (error) {
    console.error('Error stopping editor preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
