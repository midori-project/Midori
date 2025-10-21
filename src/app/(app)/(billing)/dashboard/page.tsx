"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface TokenInfo {
  balance: number;
  lastReset: string | null;
  canCreateProject: boolean;
  requiredTokens: number;
  wallets: Array<{
    id: string;
    balanceTokens: number;
    walletType: string;
    isActive: boolean;
    expiresAt: string | null;
  }>;
}

interface TokenTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  metadata: any;
  createdAt: string;
}

export default function TokenDashboard() {
  const { user } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูล Token balance
  const fetchTokenInfo = async () => {
    try {
      const response = await fetch("/api/billing/wallets");
      const data = await response.json();
      
      if (data.success) {
        setTokenInfo(data.data);
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // ดึงประวัติ transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/billing/transactions?limit=20");
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTokenInfo(), fetchTransactions()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH");
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DAILY_RESET: "รีเซ็ตประจำวัน",
      PROJECT_CREATION: "สร้างโปรเจค",
      CHAT_ANALYSIS: "วิเคราะห์ Chat",
      PREVIEW_BUILD: "สร้าง Preview",
      DEPLOYMENT: "Deploy",
      ADMIN_ADJUSTMENT: "ปรับโดย Admin",
      REFUND: "คืน Token",
    };
    return labels[type] || type;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Token Dashboard</h1>
          <p className="mt-2 text-gray-600">
            จัดการ Token และดูประวัติการใช้งาน
          </p>
        </div>

        {/* Token Balance Card */}
        {tokenInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ยอด Token ปัจจุบัน
                </h2>
                <div className="mt-2 flex items-center">
                  <span className="text-4xl font-bold text-green-600">
                    {tokenInfo.balance}
                  </span>
                  <span className="ml-2 text-gray-600">Token</span>
                </div>
                {tokenInfo.lastReset && (
                  <p className="text-sm text-gray-500 mt-2">
                    รีเซ็ตล่าสุด: {formatDate(tokenInfo.lastReset)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  สร้างโปรเจคใช้ {tokenInfo.requiredTokens} Token
                </div>
                <div className={`text-sm font-medium ${
                  tokenInfo.canCreateProject ? "text-green-600" : "text-red-600"
                }`}>
                  {tokenInfo.canCreateProject ? "สามารถสร้างโปรเจคได้" : "Token ไม่เพียงพอ"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Wallets */}
        {tokenInfo && tokenInfo.wallets && tokenInfo.wallets.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Token Wallets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokenInfo.wallets.map((wallet) => (
                <div key={wallet.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {wallet.walletType}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {wallet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {wallet.balanceTokens}
                  </div>
                  <div className="text-sm text-gray-500">
                    Tokens
                  </div>
                  {wallet.expiresAt && (
                    <div className="text-xs text-orange-600 mt-1">
                      Expires: {formatDate(wallet.expiresAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions History */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              ประวัติการใช้งาน Token
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                ยังไม่มีประวัติการใช้งาน Token
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                        {transaction.description && (
                          <span className="ml-2 text-sm text-gray-500">
                            - {transaction.description}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getTransactionColor(transaction.amount)}`}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            ข้อมูล Token
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>การรีเซ็ต:</strong> ทุก 0.00 น. คุณจะได้รับ 5 Token ใหม่
            </div>
            <div>
              <strong>การสร้างเว็บไซต์:</strong> ใช้ 1 Token ต่อครั้ง
            </div>
            <div>
              <strong>การใช้งานอื่นๆ:</strong> ฟรี (Chat, Preview, Deploy)
            </div>
            <div>
              <strong>การคืน Token:</strong> เมื่อการสร้างเว็บไซต์ล้มเหลว
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
