"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Link from "next/link";

interface TokenDisplayProps {
  showDashboardLink?: boolean;
  className?: string;
}

export default function TokenDisplay({ 
  showDashboardLink = true, 
  className = "" 
}: TokenDisplayProps) {
  const { user, tokenInfo, refetchTokenInfo } = useAuth();

  // โหลดข้อมูล Token เมื่อ component mount
  useEffect(() => {
    if (user && !tokenInfo) {
      refetchTokenInfo();
    }
  }, [user, tokenInfo, refetchTokenInfo]);

  if (!user) {
    return null;
  }

  if (!tokenInfo) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Token Icon */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-gray-700">
          {tokenInfo.balance} Token
        </span>
      </div>

      {/* Status Indicator */}
      <div className={`text-xs px-2 py-1 rounded-full ${
        tokenInfo.canCreateProject 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {tokenInfo.canCreateProject ? 'พร้อมใช้งาน' : 'Token ไม่เพียงพอ'}
      </div>

      {/* Dashboard Link */}
      {showDashboardLink && (
        <Link 
          href="/dashboard" 
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          จัดการ Token
        </Link>
      )}
    </div>
  );
}
