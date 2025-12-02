import { NextRequest, NextResponse } from 'next/server';
import { authBusinessService } from '@/libs/auth/authBusinessService';
import { getCurrentSession } from '@/libs/auth/session';

// Response types
interface LogoutSuccessResponse {
  success: true;
  message: string;
}

interface LogoutErrorResponse {
  success: false;
  error: string;
}

type LogoutResponse = LogoutSuccessResponse | LogoutErrorResponse;

/**
 * POST /api/auth/logout
 * API endpoint สำหรับ external clients
 * Internal usage ควรใช้ authBusinessService โดยตรงใน Server Actions
 */
export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse>> {
  try {
    // 1. Check if user has active session
    const currentSession = await getCurrentSession();
    
    if (!currentSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'ไม่พบ session ที่ active'
        },
        { status: 401 }
      );
    }

    // 2. Call authBusinessService (no business logic here)
    await authBusinessService.logout();

    // 3. Return HTTP response
    return NextResponse.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });

  } catch (error) {
    // Handle HTTP errors only
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดระหว่างการออกจากระบบ' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/logout
 * Method not allowed - logout ต้องใช้ POST เท่านั้น
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST for logout.' 
    },
    { status: 405 }
  );
}
