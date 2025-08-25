import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';

/**
 * API endpoint สำหรับตรวจสอบ session validity
 * ใช้สำหรับ client-side validation
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired session' 
      }, { 
        status: 401 
      });
    }

    return NextResponse.json({ 
      valid: true,
      user: {
        id: session.userId,
        email: session.user?.email,
        displayName: session.user?.displayName,
        avatarUrl: session.user?.avatarUrl
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    
    return NextResponse.json({ 
      valid: false, 
      error: 'Session validation failed' 
    }, { 
      status: 500 
    });
  }
}
