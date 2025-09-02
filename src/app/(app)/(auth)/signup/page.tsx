import { Metadata } from 'next';
import Image from 'next/image';
import RegisterFormClient from '@/components/RegisterForm/RegisterFormClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign up - Midori',
  description: 'Create your Midori account - AI-powered website generator',
  keywords: 'signup, register, Midori, AI website generator',
};

function RegisterContent() {
  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* full-page decorative background image */}
      <Image
        src="/img/background_login.png"
        alt="background"
        aria-hidden="true"
        priority
        quality={90}
        /* sizes="100vw" */
        fill
        className="object-cover object-center"
        style={{ filter: "saturate(1.35) contrast(1.08) brightness(1.03)" }}
      />

      {/* left-frame tint overlay to match frame tone (decorative) */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-full lg:w-1/2 pointer-events-none"
        style={{
          // opaque overlay (solid gradient) to match requested "ทึบ" appearance
          background:
            "linear-gradient(180deg, rgba(240,255,250,0.5) 0%, rgba(196,245,233,0.3) 40%, rgba(160,236,214,0.5) 100%)",
          borderTopRightRadius: "1rem",
          borderBottomRightRadius: "1rem",
          zIndex: 10,
        }}
      />

      {/* Left side - content area (sits above background) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-20">
        <div className="relative z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Midori</h1>
            <p className="text-xl text-white/90">
              AI-powered Website Generator
            </p>
            <p className="text-lg text-white/80 max-w-md">
              Create beautiful websites with AI — just tell us what you need.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Register Form overlay (white/semi-opaque panel on top of bg) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-20">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-full rounded-l-2xl shadow-lg"
          style={{
            background: 'linear-gradient(180deg, #F5FFF9 0%, #DCFDEB 40%, #BBF7DC 100%)',
            backdropFilter: 'blur(8px) saturate(1.05)'
          }}
        />

        <div className="w-full max-w-md relative">
          <RegisterFormClient />
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
