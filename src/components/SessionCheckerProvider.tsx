'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionChecker } from '@/hooks/useSessionChecker';

/**
 * Component สำหรับจัดการ session checking
 * ใช้หลังจาก AuthProvider
 */
export function SessionCheckerProvider({ children }: { children: React.ReactNode }) {
  // เรียกใช้ session checker hook
  useSessionChecker();

  return <>{children}</>;
}
