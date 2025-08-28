"use client";

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer/Footer';
import { authPages } from '@/components/Layout/authPages';

export function ConditionalFooter() {
  const pathname = usePathname();

  // ใช้ shared authPages
  const hideFooter = authPages.includes(pathname);

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}
