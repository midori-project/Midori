'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar/Navbar';
import { authPages } from '@/components/Layout/authPages';

export function ConditionalNavbar() {
  const pathname = usePathname();

  // ใช้ shared authPages
  const hideNavbar = authPages.includes(pathname);

  if (hideNavbar) {
    return null;
  }

  return <Navbar />;
}
