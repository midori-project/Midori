import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma/prisma";
import { getCurrentSession } from "@/libs/auth/session";
import { TokenGuardService } from "@/libs/billing/tokenGuard";

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, visibility = 'private' } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // ตรวจสอบ Token ก่อนสร้างโปรเจค
    const tokenGuard = new TokenGuardService();
    const tokenCheck = await tokenGuard.canCreateProject(session.user.id);
    
    if (!tokenCheck.canProceed) {
      return NextResponse.json(
        { 
          error: "Token ไม่เพียงพอสำหรับการสร้างโปรเจค",
          details: {
            currentBalance: tokenCheck.currentBalance,
            requiredTokens: tokenCheck.requiredTokens,
            message: tokenCheck.message
          }
        },
        { status: 402 } // Payment Required
      );
    }

    console.log(`🔍 Token check passed for user ${session.user.id}: ${tokenCheck.currentBalance} tokens available`);

    // สร้าง project ใหม่
    const project = await prisma.project.create({
      data: {
        name,
        description,
        visibility,
        ownerId: session.user.id, // ใช้ authenticated user
      },
    });

    // หัก Token หลังจากสร้างโปรเจคสำเร็จ
    const deductResult = await tokenGuard.deductProjectCreationTokens(session.user.id, project.id);
    
    if (!deductResult.success) {
      console.error("❌ Failed to deduct tokens after project creation:", deductResult.message);
      // ไม่ต้องลบโปรเจค เพราะอาจเป็นปัญหาในการบันทึก transaction เท่านั้น
    } else {
      console.log(`💸 Successfully deducted tokens for project ${project.id}`);
    }

    return NextResponse.json({
      success: true,
      data: project,
      tokenInfo: {
        deducted: true,
        remainingBalance: tokenCheck.currentBalance - tokenCheck.requiredTokens
      }
    });

  } catch (error) {
    console.error("Error creating project:", error);
    
    // ถ้าเกิดข้อผิดพลาด ให้คืน Token (ถ้าเป็นไปได้)
    try {
      const session = await getCurrentSession();
      if (session?.user?.id) {
        const tokenGuard = new TokenGuardService();
        await tokenGuard.refundProjectCreationTokens(
          session.user.id, 
          'unknown', // ไม่มี projectId เพราะสร้างไม่สำเร็จ
          'Project creation failed due to system error'
        );
        console.log("💰 Refunded tokens due to project creation failure");
      }
    } catch (refundError) {
      console.error("Failed to refund tokens:", refundError);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create project",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await (prisma as any).project.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
