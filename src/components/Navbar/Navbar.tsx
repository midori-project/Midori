"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logoutAction } from "@/app/(app)/(auth)/logout/action";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, refetchUser } = useAuth();
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = async () => {
    try {
      // Prefer server action (invalidate session server-side)
      const res = await logoutAction();
      if (res?.ok) {
        // notify other tabs
        try {
          localStorage.setItem('midori-auth-change', JSON.stringify({ type: 'logout', t: Date.now() }));
        } catch (e) {
          /* ignore */
        }

        // refresh context to reflect logout
        try {
          await refetchUser();
        } catch (e) {
          // AuthContext will clear state if validation fails
        }

        setIsUserMenuOpen(false);
        router.push('/');
      } 
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
          <Link href="/projects/community" className="text-base text-[#252424] font-medium">
            Community
          </Link>
        </div>
      </div>
      {/* Desktop Auth Section */}
      <div className="hidden md:flex items-center gap-2">
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="user-menu flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="w-8 h-8 bg-[#B6E23A] rounded-full flex items-center justify-center text-white font-semibold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-[#0B2604] font-medium">
                {user.displayName || user.email.split('@')[0]}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="user-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-900">{user.displayName || 'User'}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Link
                  href="/projects/workspace"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Workspace
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}
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
                Community
              </Link>

              {/* Mobile Auth Section */}
              {isAuthenticated && user ? (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-[#B6E23A] rounded-full flex items-center justify-center text-white font-semibold">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.displayName || 'User'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="block w-full px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors text-center mb-2"
                    onClick={toggleMenu}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="block w-full px-4 py-2 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition-colors text-center"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </nav>
  );
}
