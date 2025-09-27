// app/api/projects/[id]/preview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/libs/auth/session'
import { prisma } from '@/libs/prisma/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET - ดึงข้อมูล preview ที่มีอยู่แล้ว
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // ดึงข้อมูล project และ preview จากฐานข้อมูล
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id
      },
      include: {
        snapshots: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่ามี snapshot ล่าสุดหรือไม่
    const latestSnapshot = project.snapshots[0]
    if (!latestSnapshot) {
      return NextResponse.json({
        previewUrl: null,
        sandboxId: null,
        status: 'idle',
        message: 'No template created yet'
      })
    }

    // ตรวจสอบว่ามี preview URL ใน template data หรือไม่
    const templateData = latestSnapshot.templateData as any
    const previewInfo = templateData?.previewInfo

    if (!previewInfo?.previewUrl) {
      return NextResponse.json({
        previewUrl: null,
        sandboxId: null,
        status: 'idle',
        message: 'No preview available'
      })
    }

    return NextResponse.json({
      previewUrl: previewInfo.previewUrl,
      sandboxId: previewInfo.sandboxId,
      previewToken: previewInfo.previewToken,
      status: previewInfo.status || 'running',
      lastUpdated: latestSnapshot.createdAt
    })

  } catch (error) {
    console.error('Error fetching project preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
