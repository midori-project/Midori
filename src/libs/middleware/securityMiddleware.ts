import { NextResponse } from 'next/server';

/**
 * Security Headers Middleware
 * เพิ่ม security headers ให้กับ response
 */
export function securityHeadersMiddleware(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.codesandbox.io https://codesandbox.io", // Next.js needs unsafe-inline/eval + Sandpack
    "style-src 'self' 'unsafe-inline' https://*.codesandbox.io",
    "img-src 'self' data: https: https://*.codesandbox.io",
    "font-src 'self' data: https://*.codesandbox.io",
    "connect-src 'self' https: https://*.codesandbox.io wss://*.codesandbox.io",
    "frame-src 'self' https://*.codesandbox.io https://codesandbox.io https://*.sandpack.codesandbox.io",
    "frame-ancestors 'none'",
  ].join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=*, microphone=*, geolocation=*');
  
  // HTTPS Only (ใน production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}
