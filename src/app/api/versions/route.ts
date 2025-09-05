import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { prisma } from '@/libs/prisma/prisma';

/**
 * API endpoint สำหรับบันทึกข้อมูลการสร้างเว็บไซต์
 * ใช้ Generation + GenerationFile tables เก็บประวัติการสร้าง
 */
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      projectId, 
      generationId, 
      files, 
      finalJson, 
      model = "gpt-4",
      options = {}
    } = body;

    // Validation
    if (!projectId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'projectId is required' 
        },
        { status: 400 }
      );
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'files array is required and cannot be empty' 
        },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า project นี้เป็นของ user นี้หรือไม่
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.userId
      }
    });

    if (!project) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Project not found or access denied' 
        },
        { status: 404 }
      );
    }

    console.log('💾 Saving generation data...');
    console.log('📊 Project ID:', projectId);
    console.log('👤 User ID:', session.userId);
    console.log('📁 Files count:', files.length);
    console.log('🤖 Model:', model);

    // 1. สร้าง Generation record
    const generation = await prisma.generation.create({
      data: {
        projectId: projectId,
        userId: session.userId,
        prompt: finalJson || null,
        promptJson: finalJson || null,
        options: options,
        model: model,
        tokensInput: 0, // จะอัปเดตจาก gensite API ในอนาคต
        tokensOutput: 0, // จะอัปเดตจาก gensite API ในอนาคต
        costUsd: 0, // จะอัปเดตจาก gensite API ในอนาคต
      }
    });

    console.log('✅ Generation record created:', generation.id);

    // 2. สร้าง GenerationFile records
    const generationFilesData = files.map((file: any) => ({
      generationId: generation.id,
      filePath: file.path || file.name || 'unknown',
      fileContent: file.content || '',
      changeType: 'create' as const
    }));

    const generationFiles = await prisma.generationFile.createMany({
      data: generationFilesData
    });

    console.log('✅ GenerationFile records created:', generationFiles.count);

    // 3. อัปเดต File table ด้วยไฟล์ปัจจุบัน (optional)
    // ถ้าต้องการให้ไฟล์เหล่านี้เป็นไฟล์ปัจจุบันของโปรเจกต์
    try {
      // ลบไฟล์เก่าของโปรเจกต์นี้ (ถ้ามี)
      await prisma.file.deleteMany({
        where: {
          projectId: projectId
        }
      });

      // สร้างไฟล์ใหม่
      const currentFilesData = files.map((file: any) => ({
        projectId: projectId,
        path: file.path || file.name || 'unknown',
        type: getFileType(file.path || file.name || ''),
        isBinary: false,
        content: file.content || '',
      }));

      const currentFiles = await prisma.file.createMany({
        data: currentFilesData
      });

      console.log('✅ Current project files updated:', currentFiles.count);
    } catch (fileError) {
      console.warn('⚠️ Failed to update current project files:', fileError);
      // ไม่ throw error เพราะ generation ถูกบันทึกแล้ว
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลการสร้างเว็บไซต์สำเร็จ',
      data: {
        generationId: generation.id,
        filesCount: files.length,
        generationFilesCount: generationFiles.count
      }
    });

  } catch (error) {
    console.error('❌ Error saving generation data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint สำหรับดึงข้อมูล generation history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!projectId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'projectId is required' 
        },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์เข้าถึง project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.userId
      }
    });

    if (!project) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Project not found or access denied' 
        },
        { status: 404 }
      );
    }

    // ดึงข้อมูล generation history
    const generations = await prisma.generation.findMany({
      where: {
        projectId: projectId
      },
      include: {
        changes: {
          select: {
            id: true,
            filePath: true,
            changeType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: generations
    });

  } catch (error) {
    console.error('❌ Error fetching generation history:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' 
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function เพื่อกำหนด file type จาก path
 */
function getFileType(path: string): 'code' | 'text' | 'config' | 'asset' {
  const extension = path.split('.').pop()?.toLowerCase();
  
  const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'vue', 'svelte', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'];
  const configExtensions = ['json', 'yaml', 'yml', 'toml', 'ini', 'env', 'config', 'conf'];
  const assetExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'mp4', 'mp3', 'wav', 'pdf', 'zip'];
  
  if (codeExtensions.includes(extension || '')) {
    return 'code';
  } else if (configExtensions.includes(extension || '')) {
    return 'config';
  } else if (assetExtensions.includes(extension || '')) {
    return 'asset';
  } else {
    return 'text';
  }
}
