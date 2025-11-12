import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConditionalNavbar } from "@/components/Layout/ConditionalNavbar";
import { ConditionalLayout } from "@/components/Layout/ConditionalLayout";
import { ConditionalFooter } from "@/components/Layout/ConditionalFooter";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Midori - AI-Powered Website Generator",
  description: "สร้างเว็บไซต์ได้ง่ายๆ ด้วย AI ที่ทรงพลัง",
  other: {
    "Content-Security-Policy": [
      "upgrade-insecure-requests",
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.codesandbox.io",
      "style-src 'self' 'unsafe-inline' https://*.codesandbox.io",
      "frame-src 'self' https://*.codesandbox.io https://*.proxy.daytona.works https://*.daytona.work http://*.proxy.daytona.works http://*.daytona.work",
      "worker-src 'self' blob:",
      "connect-src 'self' https://*.codesandbox.io https://*.proxy.daytona.works https://*.daytona.work http://*.proxy.daytona.works http://*.daytona.work wss://*.proxy.daytona.works wss://*.daytona.work ws://*.proxy.daytona.works ws://*.daytona.work",
      "img-src 'self' data: blob: https://*.codesandbox.io",
      "font-src 'self' data: https://*.codesandbox.io",
      "media-src 'self' blob: https://*.codesandbox.io"
    ].join("; ")
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <ConditionalNavbar />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <ConditionalFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
