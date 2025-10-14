import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma/prisma';
import { deployStaticSite } from '@/libs/services/vercelDeploymentService';

export const runtime = 'nodejs';

/**
 * POST /api/projects/[id]/deploy
 * Deploy โปรเจคจริงของ user ไปยัง Vercel
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { subdomain, customDomain } = await req.json();

    // ✅ Validate subdomain format
    if (!subdomain || !/^[a-z0-9-]{1,50}$/.test(subdomain)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Subdomain ไม่ถูกต้อง: ใช้ได้เฉพาะ a-z, 0-9, และ - เท่านั้น (1-50 ตัวอักษร)' 
        },
        { status: 400 }
      );
    }

    // 🆕 Validate custom domain ถ้ามี
    if (customDomain) {
      // ตรวจสอบ format: www.example.com หรือ example.com หรือ subdomain.example.com
      if (!/^([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}$/i.test(customDomain)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'รูปแบบโดเมนไม่ถูกต้อง (ตัวอย่าง: www.mawza.lol หรือ mawza.lol)' 
          },
          { status: 400 }
        );
      }
    }

    console.log(`🚀 [DEPLOY] Starting deployment for project: ${id}, subdomain: ${subdomain}`);
    if (customDomain) console.log(`🌐 [DEPLOY] Custom domain: ${customDomain}`);

    // ✅ ดึงข้อมูลโปรเจคและ snapshot ล่าสุด
    const project = await (prisma as any).project.findUnique({
      where: { id },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบโปรเจค' },
        { status: 404 }
      );
    }

    if (!project.snapshots || project.snapshots.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ยังไม่มีเทมเพลตสำหรับโปรเจคนี้ กรุณาสร้างเทมเพลตผ่าน Chat ก่อน' 
        },
        { status: 400 }
      );
    }

    const latestSnapshot = project.snapshots[0];
    
    // ✅ แปลงข้อมูล files จาก JSON เป็น array
    let files: any[] = [];
    
    if (latestSnapshot.files) {
      try {
        const filesData = typeof latestSnapshot.files === 'string' 
          ? JSON.parse(latestSnapshot.files) 
          : latestSnapshot.files;
        
        files = Array.isArray(filesData) ? filesData : [];
      } catch (e) {
        console.error('❌ Error parsing snapshot files:', e);
        return NextResponse.json(
          { success: false, error: 'ข้อมูลเทมเพลตไม่ถูกต้อง' },
          { status: 500 }
        );
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่มีไฟล์ในเทมเพลต' },
        { status: 400 }
      );
    }

    console.log(`📁 [DEPLOY] Found ${files.length} files in snapshot ${latestSnapshot.id}`);

    // ✅ แปลงไฟล์เป็น Vercel format
    const vercelFiles = files.map((file: any) => ({
      file: file.path,
      data: file.content || file.data || '',
    }));

    console.log(`📦 [DEPLOY] Prepared files:`, vercelFiles.map((f: any) => f.file).slice(0, 10));

    // ✅ เริ่ม deploy พร้อม custom domain (ถ้ามี)
    const deployResult = await deployStaticSite(subdomain, vercelFiles, customDomain);
    
    console.log(`✅ [DEPLOY] Deployment successful: ${deployResult.url}`);

    // ✅ ตรวจสอบว่ามี deployment ของ subdomain นี้อยู่แล้วหรือไม่
    const existingDeployment = await (prisma as any).deployment.findFirst({
      where: {
        projectId: id,
        url: deployResult.url, // เช็คจาก URL เพราะ URL จะเหมือนกันถ้าเป็น subdomain เดิม
      },
    });

    let deployment;
    if (existingDeployment) {
      // ✅ อัพเดท deployment เดิม
      deployment = await (prisma as any).deployment.update({
        where: { id: existingDeployment.id },
        data: {
          state: 'ready',
          meta: {
            subdomain,
            customDomain: customDomain || null,  // 🆕 เก็บ custom domain
            snapshotId: latestSnapshot.id,
            filesCount: files.length,
            deployedAt: new Date().toISOString(),
            updatedCount: (existingDeployment.meta?.updatedCount || 0) + 1,
          },
        },
      });
      console.log(`💾 [DEPLOY] Deployment record updated: ${deployment.id} (ทับ ${customDomain || 'subdomain'} เดิม)`);
    } else {
      // ✅ สร้าง deployment ใหม่
      deployment = await (prisma as any).deployment.create({
        data: {
          projectId: id,
          provider: 'vercel',
          state: 'ready',
          url: deployResult.url,
          meta: {
            subdomain,
            customDomain: customDomain || null,  // 🆕 เก็บ custom domain
            snapshotId: latestSnapshot.id,
            filesCount: files.length,
            deployedAt: new Date().toISOString(),
            updatedCount: 0,
          },
        },
      });
      console.log(`💾 [DEPLOY] Deployment record created: ${deployment.id} (${customDomain ? 'custom domain' : 'subdomain'} ใหม่)`);
    }

    // ✅ ส่งผลลัพธ์กลับ
    return NextResponse.json({
      success: true,
      deployment: {
        id: deployment.id,
        url: deployResult.url,
        subdomain,
        customDomain: customDomain || null,  // 🆕 ส่ง custom domain กลับด้วย
        projectName: project.name,
        projectDescription: project.description,
        snapshotId: latestSnapshot.id,
        filesCount: files.length,
        deployedAt: new Date().toISOString(),
      },
    });
    
  } catch (error: any) {
    console.error('❌ [DEPLOY] Deployment failed:', error);
    
    // บันทึก deployment ที่ล้มเหลว
    try {
      const { id } = params;
      const body = await req.json();
      const { subdomain, customDomain } = body;
      
      await (prisma as any).deployment.create({
        data: {
          projectId: id,
          provider: 'vercel',
          state: 'failed',
          meta: {
            subdomain,
            customDomain: customDomain || null,  // 🆕 เก็บ custom domain แม้จะ fail
            error: error.message,
            failedAt: new Date().toISOString(),
          },
        },
      });
    } catch (dbError) {
      console.error('❌ Failed to save error deployment record:', dbError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'เกิดข้อผิดพลาดในการ deploy' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects/[id]/deploy
 * ดึงประวัติการ deploy ทั้งหมดของโปรเจค
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const deployments = await (prisma as any).deployment.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      deployments,
    });
  } catch (error: any) {
    console.error('❌ Error fetching deployments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

