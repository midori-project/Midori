import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RegisterSchema } from '@/schemas/auth/register';
import { authBusinessService } from '@/libs/auth/authBusinessService';

// Response types
interface RegisterSuccessResponse {
  success: true;
  message: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface RegisterErrorResponse {
  success: false;
  error: string;
  // validation.flatten().fieldErrors returns Record<string, string[] | undefined>
  details?: Record<string, string[] | undefined>;
}

type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

/**
 * POST /api/auth/register
 * API endpoint สำหรับ external clients
 * Internal usage ควรใช้ authBusinessService โดยตรงใน Server Actions
 */
export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    // 1. Parse and validate request
    const body = await request.json();
    const validatedData = RegisterSchema.parse(body);
    
    // 2. Call authBusinessService (no business logic here)
    const user = await authBusinessService.register(validatedData);

    // 3. Return HTTP response
    return NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
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
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/register
 * Method not allowed - register ต้องใช้ POST เท่านั้น
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST for register.' 
    },
    { status: 405 }
  );
}
