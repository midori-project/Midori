'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Component สำหรับแสดงข้อความแจ้งเมื่อ session หมดอายุ
 */
export function SessionExpiredNotification() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // ตรวจสอบจาก URL parameter
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setShow(true);
      
      // ลบ parameter ออกจาก URL หลังจาก 5 วินาที
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('expired');
        router.replace(url.pathname + url.search);
      }, 5000);
    }

    // ตรวจสอบจาก localStorage
    try {
      const sessionExpired = localStorage.getItem('midori-session-expired');
      if (sessionExpired === 'true') {
        setShow(true);
        localStorage.removeItem('midori-session-expired');
      }
    } catch (e) {
      console.warn('Cannot access localStorage:', e);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (show) {
      // ซ่อนข้อความหลังจาก 8 วินาที
      const timeoutId = setTimeout(() => {
        setShow(false);
      }, 8000);

      return () => clearTimeout(timeoutId);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 text-sm">⏰</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Session หมดอายุ
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="flex-shrink-0 ml-2 text-amber-400 hover:text-amber-600 transition-colors"
          >
            <span className="sr-only">ปิด</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
