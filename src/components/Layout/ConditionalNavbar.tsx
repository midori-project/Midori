'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar/Navbar';
import { authPages } from '@/components/Layout/authPages';

export function ConditionalNavbar() {
  const pathname = usePathname();

  // 🚀 Custom logic: ซ่อน navbar เฉพาะ projects/[id] (UUID pattern)
  const isProjectDetailPage = pathname.startsWith('/projects/') && 
    pathname.match(/^\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  
  if (isProjectDetailPage) {
    return null; // ซ่อน navbar สำหรับ projects/[id]
  }

  // รองรับ entry เป็น string หรือ { base, allowScroll? }
  let matched = false;
  for (const entry of authPages) {
    if (typeof entry === 'string') {
      if (pathname === entry || pathname.startsWith(entry + '/')) {
        matched = true;
        break;
      }
    } else {
      if (pathname === entry.base || pathname.startsWith(entry.base + '/')) {
        matched = true;
        break;
      }
    }
  }

  if (matched) return null;

  return <Navbar />;
}
