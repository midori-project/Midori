'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar/Navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // หน้าที่ไม่ต้องการแสดง Navbar
  const authPages = ['/login', '/register', '/forgot-password'];
  const hideNavbar = authPages.includes(pathname);
  
  if (hideNavbar) {
    return null;
  }
  
  return <Navbar />;
}
