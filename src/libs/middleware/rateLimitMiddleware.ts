import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // Auth endpoints
  '/api/auth/login': { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  '/api/auth/register': { max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
  
  // General API
  '/api/': { max: 100, window: 60 * 1000 }, // 100 requests per minute
};

// In-memory store (ใน production ควรใช้ Redis)
const requestStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate Limiting Middleware
 * ป้องกัน brute force และ spam requests
 */
export function rateLimitMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Find matching rate limit config
  let rateLimitRule = null;
  for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (pathname.startsWith(pattern)) {
      rateLimitRule = config;
      break;
    }
  }
  
  if (!rateLimitRule) {
    return NextResponse.next();
  }
  
  const key = `${clientIP}:${pathname}`;
  const now = Date.now();
  const entry = requestStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    requestStore.set(key, {
      count: 1,
      resetTime: now + rateLimitRule.window,
    });
    return NextResponse.next();
  }
  
  if (entry.count >= rateLimitRule.max) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
        },
      }
    );
  }
  
  // Increment count
  entry.count++;
  requestStore.set(key, entry);
  
  return NextResponse.next();
}

// Cleanup expired entries (ควรรันใน background job)
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, entry] of requestStore.entries()) {
    if (now > entry.resetTime) {
      requestStore.delete(key);
    }
  }
}
