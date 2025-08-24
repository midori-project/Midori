import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConditionalNavbar } from "@/components/Layout/ConditionalNavbar";
import { ConditionalLayout } from "@/components/Layout/ConditionalLayout";

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
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
