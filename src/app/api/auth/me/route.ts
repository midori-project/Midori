import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { prisma } from '@/libs/prisma/prisma';

// Response types
interface MeSuccessResponse {
  success: true;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    createdAt: string;
    lastLoginAt: string | null;
  };
  session: {
    id: string;
    createdAt: string;
    lastActiveAt: string | null;
    expiresAt: string;
  };
}

interface MeErrorResponse {
  success: false;
  error: string;
}

type MeResponse = MeSuccessResponse | MeErrorResponse;

/**
 * GET /api/auth/me
 * ดึงข้อมูลผู้ใช้และ session ปัจจุบัน
 */
export async function GET(request: NextRequest): Promise<NextResponse<MeResponse>> {
  try {
    // ตรวจสอบ session ปัจจุบัน
    const currentSession = await getCurrentSession();
    
    if (!currentSession || !currentSession.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'ไม่พบ session ที่ active หรือข้อมูลผู้ใช้'
        },
        { status: 401 }
      );
    }

    // ดึงข้อมูล user แบบเต็มจากฐานข้อมูล (รวม lastLoginAt)
    const fullUser = await prisma.user.findUnique({
      where: { id: currentSession.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });

    if (!fullUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'ไม่พบข้อมูลผู้ใช้'
        },
        { status: 404 }
      );
    }

    // Return user และ session data
    return NextResponse.json(
      {
        success: true,
        user: {
          id: fullUser.id,
          email: fullUser.email || '',
          displayName: fullUser.displayName || null,
          avatarUrl: fullUser.avatarUrl || null,
          createdAt: fullUser.createdAt.toISOString(),
          lastLoginAt: fullUser.lastLoginAt?.toISOString() || null,
        },
        session: {
          id: currentSession.id,
          createdAt: currentSession.createdAt.toISOString(),
          lastActiveAt: currentSession.lastActiveAt?.toISOString() || null,
          expiresAt: currentSession.expiresAt.toISOString(),
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get current user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดระหว่างการดึงข้อมูลผู้ใช้'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/me
 * Method not allowed - ใช้ GET เท่านั้น
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use GET to get current user info.' 
    },
    { status: 405 }
  );
}
