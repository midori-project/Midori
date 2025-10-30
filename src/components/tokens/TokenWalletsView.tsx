'use client';

import { useEffect, useState } from 'react';

interface WalletInfo {
  id: string;
  walletType: string;
  balanceTokens: number | string;  // Can be Decimal or number
  lastTokenReset: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

interface TokenSummary {
  totalBalance: number | string;  // Can be Decimal or number
  wallets: WalletInfo[];
  canCreateProject: boolean;
  requiredTokens: number;
}

interface TokenWalletsViewProps {
  onRefresh?: () => void;
}

export function TokenWalletsView({ onRefresh }: TokenWalletsViewProps) {
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/wallets');
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Failed to load token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'STANDARD':
        return '🆓';
      case 'PREMIUM':
        return '💎';
      case 'BONUS':
        return '🎁';
      case 'TRIAL':
        return '🎫';
      default:
        return '💼';
    }
  };

  const getWalletColor = (walletType: string) => {
    switch (walletType) {
      case 'STANDARD':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'PREMIUM':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'BONUS':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'TRIAL':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getWalletLabel = (walletType: string) => {
    const labels: Record<string, string> = {
      'STANDARD': 'Free Tokens',
      'PREMIUM': 'Paid Tokens',
      'BONUS': 'Bonus Tokens',
      'TRIAL': 'Trial Tokens',
    };
    return labels[walletType] || walletType;
  };

  const getWalletDescription = (walletType: string) => {
    const descriptions: Record<string, string> = {
      'STANDARD': 'ได้รับฟรีทุกวัน (รีเซ็ตเวลา 0:00 น.)',
      'PREMIUM': 'Token ที่ซื้อมา (ไม่หมดอายุ)',
      'BONUS': 'Token โบนัส/โปรโมชั่น',
      'TRIAL': 'Token ทดลองใช้ (ไม่หมดอายุ)',
    };
    return descriptions[walletType] || '';
  };

  const getUsagePriority = (walletType: string) => {
    const priority: Record<string, number> = {
      'TRIAL': 1,
      'STANDARD': 2,
      'BONUS': 3,
      'PREMIUM': 4,
    };
    return priority[walletType] || 5;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!summary || summary.wallets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">ยังไม่มี Token Wallets</p>
      </div>
    );
  }

  // เรียงตามลำดับการใช้งาน
  const sortedWallets = [...summary.wallets].sort((a, b) => 
    getUsagePriority(a.walletType) - getUsagePriority(b.walletType)
  );

  // คำนวณเปอร์เซ็นต์ (convert to number)
  const totalBalance = Number(summary.totalBalance) || 1;

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium mb-2">Total Token Balance</h3>
            <div className="text-4xl font-bold">
              {Number(summary.totalBalance).toFixed(2)}
              <span className="text-2xl ml-2">🪙</span>
            </div>
            <p className="text-green-100 text-sm mt-2">
              {summary.canCreateProject 
                ? `สามารถสร้างเว็บไซต์ได้ (ใช้ ${summary.requiredTokens} tokens)` 
                : `Token ไม่เพียงพอ (ต้องการ ${summary.requiredTokens} tokens)`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100 mb-2">ลำดับการใช้งาน</div>
            <div className="text-xs text-green-50 space-y-1">
              {sortedWallets.map((w, idx) => (
                <div key={w.id}>
                  {idx + 1}. {getWalletIcon(w.walletType)} {getWalletLabel(w.walletType)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedWallets.map((wallet) => {
          const walletBalance = Number(wallet.balanceTokens) || 0;
          const percentage = (walletBalance / totalBalance) * 100;
          
          return (
            <div
              key={wallet.id}
              className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${getWalletColor(wallet.walletType)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getWalletIcon(wallet.walletType)}</span>
                  <div>
                    <h4 className="font-bold text-lg">
                      {getWalletLabel(wallet.walletType)}
                    </h4>
                    <p className="text-sm opacity-75">
                      {getWalletDescription(wallet.walletType)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  wallet.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {wallet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Balance */}
              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">
                  {walletBalance.toFixed(2)}
                  <span className="text-lg ml-1">🪙</span>
                </div>
                <div className="text-sm opacity-75">
                  {percentage.toFixed(1)}% ของยอดรวม
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-black bg-opacity-10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: getWalletColor(wallet.walletType).includes('blue') ? '#3b82f6' :
                                  getWalletColor(wallet.walletType).includes('purple') ? '#9333ea' :
                                  getWalletColor(wallet.walletType).includes('yellow') ? '#eab308' :
                                  '#22c55e'
                    }}
                  />
                </div>
              </div>

              {/* Expiry Info */}
              {wallet.expiresAt && (
                <div className="text-xs opacity-75">
                  ⏰ หมดอายุ: {new Date(wallet.expiresAt).toLocaleString('th-TH')}
                </div>
              )}

              {/* Reset Info (for STANDARD) */}
              {wallet.walletType === 'STANDARD' && wallet.lastTokenReset && (
                <div className="text-xs opacity-75">
                  🔄 รีเซ็ตล่าสุด: {new Date(wallet.lastTokenReset).toLocaleString('th-TH')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 วิธีใช้งาน Token</h4>
        <p className="text-sm text-blue-800">
          ระบบจะใช้ Token อัตโนมัติตามลำดับ: <strong>TRIAL → STANDARD → BONUS → PREMIUM</strong>
          <br />
          คุณไม่จำเป็นต้องเลือกว่าจะใช้ Token แบบไหน ระบบจะจัดการให้อัตโนมัติ
        </p>
      </div>
    </div>
  );
}

