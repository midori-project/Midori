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
          {parseFloat(tokenInfo.balance.toString()) === 0 ? '0' : parseFloat(tokenInfo.balance.toString())} Token
        </span>
      </div>
    </div>
  );
}
