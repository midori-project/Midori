'use client';

import { useState, useEffect } from 'react';
import { AdminTokenDashboard } from '@/components/admin/AdminTokenDashboard';

export default function AdminTokenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B2604] mb-2">
            🪙 Token Management
          </h1>
          <p className="text-gray-600">
            จัดการ Token ของผู้ใช้ทั้งหมด
          </p>
        </div>
        <AdminTokenDashboard />
      </div>
    </div>
  );
}



