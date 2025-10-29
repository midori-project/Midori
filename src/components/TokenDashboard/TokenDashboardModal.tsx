"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { X, Coins, TrendingUp, Clock, RefreshCw, AlertCircle } from "lucide-react";

interface TokenDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

interface TokenWallet {
  id: string;
  balanceTokens: number;
  walletType: string;
  isActive: boolean;
  expiresAt?: string;
}

export default function TokenDashboardModal({ isOpen, onClose }: TokenDashboardModalProps) {
  const { user, tokenInfo, refetchTokenInfo } = useAuth();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [wallets, setWallets] = useState<TokenWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // โหลดข้อมูล Token เมื่อ modal เปิด
  useEffect(() => {
    if (isOpen && user) {
      loadTokenData();
    }
  }, [isOpen, user]);

  const loadTokenData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // โหลดข้อมูล transactions และ wallets พร้อมกัน
      const [transactionsRes, walletsRes] = await Promise.all([
        fetch('/api/billing/transactions'),
        fetch('/api/billing/wallets')
      ]);

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.data || []);
      }

      if (walletsRes.ok) {
        const walletsData = await walletsRes.json();
        setWallets(walletsData.data?.wallets || []);
      }

      // รีเฟรช token info
      await refetchTokenInfo();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล Token');
      console.error('Error loading token data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DAILY_RESET':
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case 'PROJECT_CREATION':
        return <Coins className="w-4 h-4 text-blue-500" />;
      case 'REFUND':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getWalletTypeLabel = (type: string) => {
    switch (type) {
      case 'STANDARD':
        return 'Token ปกติ';
      case 'PREMIUM':
        return 'Token Premium';
      case 'BONUS':
        return 'Token โบนัส';
      case 'TRIAL':
        return 'Token ทดลอง';
      default:
        return type;
    }
  };

  const getWalletTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD':
        return 'bg-blue-100 text-blue-800';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800';
      case 'BONUS':
        return 'bg-green-100 text-green-800';
      case 'TRIAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Token Dashboard</h2>
              <p className="text-sm text-gray-500">จัดการ Token และดูประวัติการใช้งาน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadTokenData}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Token Balance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700">ยอด Token ปัจจุบัน</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {tokenInfo?.balance || 0}
                      </p>
                    </div>
                    <Coins className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">สถานะการสร้างโปรเจค</p>
                      <p className={`text-lg font-semibold ${tokenInfo?.canCreateProject ? 'text-green-800' : 'text-red-600'}`}>
                        {tokenInfo?.canCreateProject ? 'พร้อมใช้งาน' : 'Token ไม่เพียงพอ'}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Token ที่ต้องการ</p>
                      <p className="text-lg font-semibold text-blue-800">
                        {tokenInfo?.requiredTokens || 1.5}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Token Wallets */}
              {wallets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Wallets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {wallets.map((wallet) => (
                      <div key={wallet.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getWalletTypeColor(wallet.walletType)}`}>
                            {getWalletTypeLabel(wallet.walletType)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {wallet.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {wallet.balanceTokens}
                        </div>
                        <div className="text-sm text-gray-500">Tokens</div>
                        {wallet.expiresAt && (
                          <div className="text-xs text-orange-600 mt-2">
                            หมดอายุ: {formatDate(wallet.expiresAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">ประวัติการใช้งาน Token</h3>
                  <button
                    onClick={loadTokenData}
                    className="flex items-center space-x-1 text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>รีเฟรช</span>
                  </button>
                </div>

                {transactions.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${getTransactionColor(transaction.amount)}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {transaction.type.replace('_', ' ').toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Coins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>ยังไม่มีประวัติการใช้งาน Token</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Token จะรีเซ็ตทุก 0.00 น. เป็น 5 Token
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ปิด
            </button>
            <button
              onClick={loadTokenData}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              รีเฟรชข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
