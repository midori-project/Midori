"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      setIsScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBase =
    "w-full flex items-center justify-between px-6 md:px-8 py-3 transition-colors duration-300 fixed top-0 left-0 z-40";
  // Stronger frosted-glass (more opaque + heavier blur) for a pronounced glass effect
  const navTransparent = "bg-white/40 backdrop-blur-lg border border-white/10 text-white shadow-sm";
  const navSolid =
    "bg-white/95 backdrop-blur-xl border-b border-slate-200/70 text-slate-900 shadow-md dark:bg-slate-900/95 dark:border-slate-700/60 dark:text-white";

  return (
    <nav className={`${navBase} ${isScrolled ? navSolid : navTransparent}`}>
      {/* Left: Logo & Desktop Menu */}
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/img/logo.png"
            alt="Midori Logo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <span className="text-2xl font-bold text-[#B6E23A] ml-2">Midori</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-base text-[#252424] font-medium">
            Home
          </Link>
          <Link
            href="/projects/workspace"
            className="text-base text-[#252424] font-medium"
          >
            Workspace
          </Link>
          <Link href="/co" className="text-base text-[#252424] font-medium">
            Community
          </Link>
        </div>
      </div>
      {/* Desktop Sign in */}
      <div className="hidden md:flex items-center gap-2">
        <Link
          href="/login"
          className="ml-4 px-4 py-2 rounded-lg bg-[#FFFFFF] text-[#252424] font-semibold shadow hover:bg-[#A0D82A] transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="ml-4 px-4 py-2 rounded-lg bg-[#94D133] text-white font-semibold shadow hover:bg-[#A0D82A] transition-colors"
        >
          Get Started
        </Link>
      </div>
      {/* Hamburger Button (Mobile) */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-[#B6E23A] hover:bg-white/10 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile Menu Overlay */}
      {mounted &&
        isMenuOpen &&
        createPortal(
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black/60 backdrop-blur-md flex flex-col items-center justify-start"
            style={{ zIndex: 9999 }}
            onClick={toggleMenu}
          >
            <div
              className="bg-white/98 backdrop-blur-xl rounded-xl shadow-2xl mt-6 w-[90vw] max-w-sm p-6 flex flex-col gap-4 border border-slate-200/30"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href="/"
                className="text-lg text-slate-800 font-medium py-2 rounded hover:bg-green-50 transition-colors"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                href="/projects/workspace"
                className="text-lg text-slate-800 font-medium py-2 rounded hover:bg-green-50 transition-colors"
                onClick={toggleMenu}
              >
                Workspace
              </Link>
              <Link
                href="/projects/featured"
                className="text-lg text-slate-800 font-medium py-2 rounded hover:bg-green-50 transition-colors"
                onClick={toggleMenu}
              >
                Comunity
              </Link>
              <Link
                href="/login"
                className="mt-4 px-4 py-2 rounded-lg bg-[#B6E23A] text-white font-semibold shadow hover:bg-[#A0D82A] transition-colors text-center w-full text-base"
                onClick={toggleMenu}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="mt-4 px-4 py-2 rounded-lg bg-[#B6E23A] text-white font-semibold shadow hover:bg-[#A0D82A] transition-colors text-center w-full text-base"
                onClick={toggleMenu}
              >
                Get Started
              </Link>
            </div>
          </div>,
          document.body
        )}
    </nav>
  );
}
