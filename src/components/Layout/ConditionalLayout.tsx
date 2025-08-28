'use client';

import { usePathname } from 'next/navigation';
import { authPages } from '@/components/Layout/authPages';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // ใช้ shared authPages เพื่อให้พฤติกรรมตรงกับ Navbar
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    // Layout สำหรับหน้า Auth (ไม่มี Navbar, ใช้พื้นที่เต็มหน้าจอ)
    return <div className="h-screen overflow-hidden">{children}</div>;
  }

  // Layout ปกติ (มี main wrapper)
  return (
    <main className="flex-1">
      {children}
    </main>
  );
}
