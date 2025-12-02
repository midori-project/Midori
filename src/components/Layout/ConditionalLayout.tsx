'use client';

import { usePathname } from 'next/navigation';
import { authPages } from '@/components/Layout/authPages';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // ใช้ shared authPages เพื่อให้พฤติกรรมตรงกับ Navbar
  let matchedEntry: string | { base: string; allowScroll?: boolean } | null = null;
  for (const entry of authPages) {
    if (typeof entry === 'string') {
      if (pathname === entry || pathname.startsWith(entry + '/')) {
        matchedEntry = entry;
        break;
      }
    } else {
      if (pathname === entry.base || pathname.startsWith(entry.base + '/')) {
        matchedEntry = entry;
        break;
      }
    }
  }

  if (matchedEntry) {
    // ถ้า entry ระบุ allowScroll ให้ใช้ค่าเลย มิฉะนั้น default เป็น no-scroll
    const allowScroll = typeof matchedEntry === 'string' ? false : !!matchedEntry.allowScroll;
    if (allowScroll) {
      return <div className="min-h-screen overflow-auto">{children}</div>;
    }

    return <div className="h-screen overflow-hidden">{children}</div>;
  }

  // Layout ปกติ (มี main wrapper)
  return (
    <main className="flex-1">
      {children}
    </main>
  );
}
