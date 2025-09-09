/**
 * Client-side session manager for automatic expired session cleanup
 * ทำงานใน client-side เพื่อไม่กระทบ middleware performance
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSessionManager() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          credentials: 'include', // ส่ง cookies ไปด้วย
        });

        const result = await response.json();

        if (!result.valid) {
          console.log('🔄 Session expired, redirecting to login...');
          
          // ลบ expired cookies ที่ client
          document.cookie = 'midori-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        // ไม่ redirect หากเกิด network error
      }
    };

    // เช็ค session ทุก 5 นาที
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // เช็คเมื่อ component mount
    checkSession();

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [router]);
}

/**
 * Session Manager Component
 * ใส่ใน RootLayout เพื่อทำงานทุกหน้า
 */
export default function SessionManager() {
  useSessionManager();
  return null; // ไม่แสดงอะไร แค่ทำงานใน background
}
