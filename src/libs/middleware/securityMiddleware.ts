import { NextResponse } from 'next/server';

/**
 * Security Headers Middleware
 * เพิ่ม security headers ให้กับ response
 */
export function securityHeadersMiddleware(response: NextResponse) {
  // Content Security Policy
  const csp = [
    "upgrade-insecure-requests",
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.codesandbox.io https://codesandbox.io", // Next.js needs unsafe-inline/eval + Sandpack
    "style-src 'self' 'unsafe-inline' https://*.codesandbox.io",
    "img-src 'self' data: https: https://*.codesandbox.io",
    "font-src 'self' data: https://*.codesandbox.io",
    "connect-src 'self' https: http: https://*.codesandbox.io wss://*.codesandbox.io https://*.proxy.daytona.works https://*.daytona.work http://*.proxy.daytona.works http://*.daytona.work wss://*.proxy.daytona.works wss://*.daytona.work ws://*.proxy.daytona.works ws://*.daytona.work",
    "frame-src 'self' https://*.codesandbox.io https://codesandbox.io https://*.sandpack.codesandbox.io https://*.proxy.daytona.works https://*.daytona.work http://*.proxy.daytona.works http://*.daytona.work",
    "frame-ancestors 'self' https://*.proxy.daytona.works https://*.daytona.work http://*.proxy.daytona.works http://*.daytona.work",
  ].join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  // ใช้ CSP ควบคุม frame-ancestors แทนการตั้งค่า DENY
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=*, microphone=*, geolocation=*');
  
  // HTTPS Only (ใน production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}
