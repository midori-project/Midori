// app/api/projects/[id]/snapshot/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/libs/auth/session'
import { prisma } from '@/libs/prisma/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET - ดึงข้อมูล snapshot ล่าสุดของ project (รวม templateData)
 */
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

    // ดึงข้อมูล project และ snapshot ล่าสุด (อนุญาตให้ผู้ใช้ที่ไม่ใช่เจ้าของเข้าดูได้)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
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

    // ตรวจสอบว่ามี snapshot หรือไม่
    const latestSnapshot = project.snapshots[0]
    
    // ✅ กรณีไม่มี snapshot: ส่ง success=true แต่ hasSnapshot=false
    if (!latestSnapshot) {
      return NextResponse.json({
        success: true,
        hasSnapshot: false,
        message: 'ยังไม่มีเทมเพลตสำหรับโปรเจคนี้ กรุณาสร้างเทมเพลตจาก Chat ก่อน',
        data: {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            ownerId: project.ownerId, // ✅ เพิ่ม ownerId เพื่อเช็คว่าเป็นเจ้าของโปรเจ็คหรือไม่
          },
          snapshot: null,
          templateData: null,
          files: [],
          filesCount: 0,
        }
      })
    }

    // ดึงข้อมูลจาก templateData
    const templateData = latestSnapshot.templateData as any
    const files = latestSnapshot.files as any

    // แปลงไฟล์จาก templateData ให้อยู่ในรูปแบบที่ใช้ได้
    let filesList = []
    
    // ลองดึงจาก templateData.files ก่อน
    if (templateData?.files && Array.isArray(templateData.files)) {
      filesList = templateData.files
    } 
    // ถ้าไม่มี ให้ดึงจาก files field
    else if (files && Array.isArray(files)) {
      filesList = files
    }
    // ถ้าไม่มี ให้ดึงจาก templateData.exportedJson.files
    else if (templateData?.exportedJson?.files && Array.isArray(templateData.exportedJson.files)) {
      filesList = templateData.exportedJson.files
    }

    // จัดรูปแบบข้อมูลให้เป็นมาตรฐาน
    const formattedFiles = filesList.map((file: any) => ({
      path: file.path || file.filePath,
      content: file.content,
      type: file.type || file.language || 'code',
    }))

    return NextResponse.json({
      success: true,
      hasSnapshot: true,
      message: 'ดึงข้อมูลสำเร็จ',
      data: {
        snapshot: {
          id: latestSnapshot.id,
          label: latestSnapshot.label,
          createdAt: latestSnapshot.createdAt,
        },
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          ownerId: project.ownerId, // ✅ เพิ่ม ownerId เพื่อเช็คว่าเป็นเจ้าของโปรเจ็คหรือไม่
        },
        templateData: templateData || {},
        files: formattedFiles,
        filesCount: formattedFiles.length,
      }
    })

  } catch (error) {
    console.error('Error fetching project snapshot:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST - สร้าง snapshot ใหม่
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getCurrentSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: projectId } = await params
    const body = await request.json()
    const { label, files, templateData } = body

    // ตรวจสอบว่า project มีอยู่จริง
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // สร้าง snapshot ใหม่
    const snapshot = await prisma.snapshot.create({
      data: {
        projectId: projectId,
        label: label || 'Manual snapshot',
        files: files || [],
        templateData: templateData || {},
      }
    })

    return NextResponse.json({
      success: true,
      data: snapshot
    })

  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
