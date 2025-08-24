import { NextRequest } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';

/**
 * Helper สำหรับใช้ใน API Routes
 * ตรวจสอบ authentication และดึงข้อมูล user
 */
export async function requireAuth(request: NextRequest) {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return {
    session,
    userId: session.userId,
    user: session.user,
  };
}

/**
 * Helper สำหรับตรวจสอบ admin permission
 */
export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);
  
  // TODO: Add role checking logic
  // if (auth.user?.role !== 'admin') {
  //   throw new Error('Admin access required');
  // }
  
  return auth;
}

/**
 * Helper สำหรับดึงข้อมูล user จาก middleware headers
 */
export function getUserFromHeaders(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const sessionId = request.headers.get('x-session-id');
  
  if (!userId || !sessionId) {
    throw new Error('User information not found in headers');
  }
  
  return { userId, sessionId };
}

/**
 * Wrapper สำหรับ API handler ที่ต้อง auth
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, auth: Awaited<ReturnType<typeof requireAuth>>, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const auth = await requireAuth(request);
      return await handler(request, auth, ...args);
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Wrapper สำหรับ API handler ที่ต้อง admin
 */
export function withAdmin<T extends any[]>(
  handler: (request: NextRequest, auth: Awaited<ReturnType<typeof requireAdmin>>, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const auth = await requireAdmin(request);
      return await handler(request, auth, ...args);
    } catch (error) {
      const status = error instanceof Error && error.message === 'Authentication required' ? 401 : 403;
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Access denied',
        }),
        {
          status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}
