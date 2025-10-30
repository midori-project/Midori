'use client';

import { useState, useEffect } from 'react';
import { TokenWalletsView } from '@/components/tokens/TokenWalletsView';
import Link from 'next/link';

interface TokenTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

export default function MyTokensPage() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await fetch('/api/billing/transactions?limit=30');
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'DAILY_RESET': '🔄 รีเซ็ตประจำวัน',
      'PROJECT_CREATION': '🚀 สร้างโปรเจค',
      'CHAT_ANALYSIS': '💬 วิเคราะห์ Chat',
      'PREVIEW_BUILD': '👁️ สร้าง Preview',
      'DEPLOYMENT': '🌐 Deploy',
      'ADMIN_ADJUSTMENT': '⚙️ ปรับโดย Admin',
      'REFUND': '♻️ คืน Token',
      'WALLET_CREATION': '💼 สร้าง Wallet',
      'WALLET_EXPIRATION': '⏰ หมดอายุ Wallet',
    };
    return labels[type] || type;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? '➕' : '➖';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B2604] mb-2">
            🪙 My Tokens
          </h1>
          <p className="text-gray-600">
            ดูรายละเอียด Token ทั้งหมดของคุณ
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <Link
            href="/pricing"
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-md transition-all"
          >
            💳 เติม Token
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Token Wallets View */}
        <TokenWalletsView />

        {/* Transaction History */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                📜 ประวัติการใช้งาน
              </h3>
              {transactions.length > 0 && (
                <span className="text-sm text-gray-500">
                  {transactions.length} รายการ
                </span>
              )}
            </div>

            {loadingTransactions ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">กำลังโหลด...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="text-5xl mb-4">📝</div>
                <p>ยังไม่มีประวัติการใช้งาน Token</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getTransactionIcon(transaction.amount)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 mt-1 ml-7">
                            {transaction.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-400 mt-1 ml-7">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${getTransactionColor(transaction.amount)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                        <span className="text-sm ml-1">🪙</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

