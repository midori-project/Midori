import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../libs/prisma/prisma';
import { getCurrentSession } from '../../../../libs/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { projectId, userId } = await request.json();
    
    if (!projectId) {
      return NextResponse.json({ 
        success: false, 
        error: 'projectId is required' 
      }, { status: 400 });
    }

    // ดึง session ปัจจุบันถ้าไม่มี userId
    const session = await getCurrentSession();
    const currentUserId = userId || session?.userId;
    
    if (!currentUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User authentication required' 
      }, { status: 401 });
    }

    // เช็ค Generation ล่าสุดของโปรเจกต์นี้
    const latestGeneration = await prisma.generation.findFirst({
      where: {
        projectId: projectId,
        userId: currentUserId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        changes: {
          orderBy: {
            filePath: 'asc'
          }
        }
      }
    });

    if (!latestGeneration) {
      return NextResponse.json({ 
        success: false, 
        message: 'No existing generation found' 
      });
    }

    // เช็คว่ามีไฟล์ใน changes หรือไม่
    if (!latestGeneration.changes || latestGeneration.changes.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No files found in existing generation' 
      });
    }

    // ตรวจสอบว่าไฟล์มีเนื้อหาครบถ้วนหรือไม่
    const validFiles = latestGeneration.changes.filter(file => 
      file.fileContent && 
      file.fileContent.trim().length > 0 &&
      file.changeType === 'create'
    );

    if (validFiles.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No valid files found in existing generation' 
      });
    }

    // ตรวจสอบไฟล์ที่จำเป็นสำหรับเว็บไซต์
    const requiredFiles = ['index.html', 'package.json', 'src/App.tsx'];
    const hasRequiredFiles = requiredFiles.some(requiredFile => 
      validFiles.some(file => file.filePath.includes(requiredFile))
    );

    if (!hasRequiredFiles) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required files in existing generation' 
      });
    }

    // แปลงข้อมูล GenerationFile เป็นรูปแบบที่ต้องการ
    const files = validFiles.map(file => ({
      path: file.filePath,
      content: file.fileContent || '',
      type: file.changeType
    }));

    // สร้าง projectStructure จากข้อมูลที่มี
    const promptData = latestGeneration.promptJson as any;
    const projectStructure = {
      name: promptData?.Name || promptData?.name || 'Generated Project',
      framework: 'react',
      styling: 'tailwind',
      typescript: true
    };

    return NextResponse.json({
      success: true,
      data: {
        files: files,
        projectStructure: projectStructure,
        fileCount: files.length,
        generationId: latestGeneration.id,
        createdAt: latestGeneration.createdAt,
        isExisting: true
      }
    });

  } catch (error) {
    console.error('Error checking existing generation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
