import { NextRequest, NextResponse } from 'next/server';
import { securityHeadersMiddleware } from '@/libs/middleware/securityMiddleware';
import { rateLimitMiddleware } from '@/libs/middleware/rateLimitMiddleware';

// Session configuration
const sessionConfig = {
  cookieName: process.env.NODE_ENV === "production" ? "__Host-session" : "midori-session",
} as const;

// Public routes ที่ไม่ต้อง login
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/projects/community',
];

// API routes ที่ไม่ต้อง auth
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/validate',
  '/api/auth/send-otp',    // OTP for registration
  '/api/auth/verify-otp',  // OTP verification
  '/api/preview/daytona', // เพิ่ม Daytona preview API
  '/api/projects', // เพิ่ม projects API (สำหรับ preview)
  '/api/stripe/webhook', // Stripe webhook (must be public for Stripe to call)
];

// Admin routes ที่ต้อง admin permission
const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Debug logging helper
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Auth Middleware สำหรับ Next.js 15
 * ตรวจสอบ authentication และ authorization
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting first (before any other checks)
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse.status === 429) {
    console.warn('🚫 Rate limit exceeded for:', pathname);
    return securityHeadersMiddleware(rateLimitResponse);
  }

  // Skip middleware for static files และ Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  // ตรวจสอบ exact match ก่อน แล้วค่อย startsWith (ยกเว้น root path)
  const isPublicRoute = publicRoutes.includes(pathname) ||
    publicRoutes.some(route => {
      if (route === '/') {
        return pathname === '/'; // Root path ต้อง exact match
      }
      return pathname.startsWith(route);
    });

  const isPublicApiRoute = publicApiRoutes.some(route => {
    if (route === '/api/projects') {
      return pathname.startsWith('/api/projects/') && pathname.endsWith('/preview');
    }
    return pathname.startsWith(route);
  });

  // Allow public routes
  if (isPublicRoute || isPublicApiRoute) {
    if (isDevelopment) {
      console.log('✅ Public route allowed:', pathname);
    }
    const response = NextResponse.next();
    return securityHeadersMiddleware(response);
  }

  try {
    // ตรวจสอบ session จาก cookie (เช็คแค่ว่ามีหรือไม่)
    const sessionCookie = request.cookies.get(sessionConfig.cookieName);

    if (!sessionCookie?.value) {
      if (isDevelopment) {
        console.log('❌ No session cookie - redirecting to login for:', pathname);
      }

      if (pathname.startsWith('/api/')) {
        const response = NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
        return securityHeadersMiddleware(response);
      }

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      return securityHeadersMiddleware(response);
    }

    // หมายเหตุ: การตรวจสอบ session expiry จะทำใน client-side (SessionManager)
    // และใน API routes ที่ใช้ getCurrentSession() เพื่อไม่กระทบ middleware performance

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    if (isAdminRoute) {
      // TODO: Add admin role check - ต้องตรวจสอบผ่าน API call
      // เนื่องจาก middleware ไม่สามารถเข้าถึง database ได้โดยตรง
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      // เพิ่ม session token ใน header สำหรับ API routes
      requestHeaders.set('x-session-token', sessionCookie.value);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      return securityHeadersMiddleware(response);
    }

    const response = NextResponse.next();
    return securityHeadersMiddleware(response);

  } catch (error) {
    console.error('❌ Middleware error:', error);

    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { success: false, error: 'Authentication error' },
        { status: 500 }
      );
      return securityHeadersMiddleware(response);
    }

    const response = NextResponse.redirect(new URL('/login', request.url));
    return securityHeadersMiddleware(response);
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
