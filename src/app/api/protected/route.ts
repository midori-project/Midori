import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/libs/middleware/authHelpers';

/**
 * ตัวอย่าง Protected API Route
 * ใช้ withAuth wrapper เพื่อตรวจสอบ authentication
 */
export const GET = withAuth(async (request, auth) => {
  // auth.session - session data
  // auth.userId - user ID
  // auth.user - user data
  
  return NextResponse.json({
    success: true,
    message: 'Protected data accessed successfully',
    user: auth.user,
    sessionId: auth.session.id,
  });
});

/**
 * ตัวอย่าง API Route ที่ต้องการ specific user data
 */
export const POST = withAuth(async (request, auth) => {
  try {
    const body = await request.json();
    
    // ใช้ auth.userId สำหรับ database operations
    console.log(`User ${auth.userId} is creating something:`, body);
    
    return NextResponse.json({
      success: true,
      message: 'Created successfully',
      createdBy: auth.userId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
});
