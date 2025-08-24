import { Metadata } from 'next';
import { LoginFormClient } from '@/components/LoginForm/LoginFormClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ - Midori',
  description: 'เข้าสู่ระบบ Midori - AI-powered website generator',
  keywords: 'เข้าสู่ระบบ, ล็อกอิน, Midori, AI website generator',
};

function LoginContent() {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left side - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Midori</h1>
            <p className="text-xl text-white/90 mb-8">AI-powered Website Generator</p>
            <p className="text-lg text-white/80 max-w-md">
              สร้างเว็บไซต์ที่สวยงามด้วยพลัง AI ง่ายๆ เพียงแค่บอกความต้องการของคุณ
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-lg" />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-md" />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <LoginFormClient />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <LoginContent />
    </Suspense>
  );
}