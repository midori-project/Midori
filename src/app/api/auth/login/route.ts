import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LoginSchema } from '@/schemas/auth/login';
import { authBusinessService } from '@/libs/auth/authBusinessService';

// Response types
interface LoginSuccessResponse {
  success: true;
  message: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface LoginErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

/**
 * POST /api/auth/login
 * API endpoint สำหรับ external clients
 * Internal usage ควรใช้ authBusinessService โดยตรงใน Server Actions
 */
export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const validatedData = LoginSchema.parse(body);
    
    // 2. Call authBusinessService (no business logic here)
    const user = await authBusinessService.login(validatedData);

    // 3. Return HTTP response
    return NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user
    });

  } catch (error) {
    // Handle HTTP errors only
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'ข้อมูลที่กรอกไม่ถูกต้อง',
          details: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Method not allowed - login ต้องใช้ POST เท่านั้น
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST for login.' 
    },
    { status: 405 }
  );
}
