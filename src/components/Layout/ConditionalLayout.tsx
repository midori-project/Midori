'use client';

import { usePathname } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // หน้าที่ต้องการ layout แบบเต็มหน้าจอ
  const authPages = ['/login', '/register', '/forgot-password'];
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
