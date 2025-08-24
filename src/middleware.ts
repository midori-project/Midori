import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { securityHeadersMiddleware } from '@/libs/middleware/securityMiddleware';

// Public routes ที่ไม่ต้อง login
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
];

// API routes ที่ไม่ต้อง auth
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
];

// Admin routes ที่ต้อง admin permission
const adminRoutes = [
  '/admin',
  '/api/admin',
];

/**
 * Auth Middleware สำหรับ Next.js 15
 * ตรวจสอบ authentication และ authorization
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug log
 /*  console.log('🔧 Middleware running for path:', pathname); */
  
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
  
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  /* console.log('🔍 Path analysis:', { pathname, isPublicRoute, isPublicApiRoute, publicRoutes }); */

  // Allow public routes
  if (isPublicRoute || isPublicApiRoute) {
    /* console.log('✅ Public route allowed:', pathname); */
    const response = NextResponse.next();
    return securityHeadersMiddleware(response);
  }

  try {
    /* console.log('🔐 Checking authentication for protected route:', pathname); */
    
    // Get current session
    const session = await getCurrentSession();
    
    /* console.log('👤 Session status:', session ? 'Authenticated' : 'Not authenticated'); */
    
    // No session - redirect to login
    if (!session) {
      /* console.log('❌ No session - redirecting to login'); */
      
      if (pathname.startsWith('/api/')) {
        const response = NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
        return securityHeadersMiddleware(response);
      }
      
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      /* console.log('🔄 Redirecting to:', loginUrl.toString()); */
      const response = NextResponse.redirect(loginUrl);
      return securityHeadersMiddleware(response);
    }

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    if (isAdminRoute) {
      // TODO: Add admin role check
      // const isAdmin = session.user.role === 'admin';
      // if (!isAdmin) {
      //   const response = NextResponse.json(
      //     { success: false, error: 'Admin access required' },
      //     { status: 403 }
      //   );
      //   return securityHeadersMiddleware(response);
      // }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.userId);
      requestHeaders.set('x-session-id', session.id);
      
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
    console.error('Middleware error:', error);
    
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
