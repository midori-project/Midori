"use client";

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer/Footer';
import { authPages } from '@/components/Layout/authPages';

export function ConditionalFooter() {
  const pathname = usePathname();

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

  return <Footer />;
}
