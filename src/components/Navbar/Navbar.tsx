
'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-transparent backdrop-blur-md border-b border-slate-200 dark:border-slate-700 relative">
      {/* Left: Logo & Desktop Menu */}
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/img/logo.png" alt="Midori Logo" width={48} height={48} className="rounded-full" />
          <span className="text-2xl font-bold text-[#B6E23A] ml-2">Midori</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-base text-slate-800 dark:text-slate-800 font-medium">หน้าแรก</Link>
          <Link href="/projects" className="text-base text-slate-800 dark:text-slate-800 font-medium">โปรเจค</Link>
          <Link href="/templates" className="text-base text-slate-800 dark:text-slate-800 font-medium">เทมเพลต</Link>
        </div>
      </div>
      {/* Desktop Sign in */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/login" className="ml-4 px-4 py-2 rounded-lg bg-[#B6E23A] text-white font-semibold shadow hover:bg-[#A0D82A] transition-colors">Sign in</Link>
      </div>
      {/* Hamburger Button (Mobile) */}
      <div className="md:hidden">
        <button onClick={toggleMenu} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile Menu Overlay */}
      {mounted && isMenuOpen && createPortal(
        <div 
          className="fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm flex flex-col items-center justify-start" 
          style={{ zIndex: 9999 }}
          onClick={toggleMenu}
        >
          <div 
            className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl mt-6 w-[90vw] max-w-sm p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href="/" className="text-lg text-slate-800 font-medium py-2 rounded hover:bg-green-50 transition-colors" onClick={toggleMenu}>หน้าแรก</Link>
            <Link href="/projects" className="text-lg text-slate-800 font-medium py-2 rounded hover:bg-green-50 transition-colors" onClick={toggleMenu}>โปรเจค</Link>
            <Link href="/templates" className="text-lg text-slate-800 font-medium py-2 rounded hover:bg-green-50 transition-colors" onClick={toggleMenu}>เทมเพลต</Link>
            <Link href="/login" className="mt-4 px-4 py-2 rounded-lg bg-[#B6E23A] text-white font-semibold shadow hover:bg-[#A0D82A] transition-colors text-center w-full text-base" onClick={toggleMenu}>Sign in</Link>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
