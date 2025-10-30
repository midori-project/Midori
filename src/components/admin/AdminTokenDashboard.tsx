'use client';

import { useState, useEffect } from 'react';

interface UserTokenData {
  userId: string;
  email: string;
  displayName: string;
  totalBalance: number;
  wallets: Array<{
    id: string;
    walletType: string;
    balanceTokens: number;
    lastTokenReset: string | null;
    expiresAt: string | null;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
  }>;
}

interface TokenStats {
  totalUsers: number;
  totalTokens: number;
  averageTokensPerUser: number;
  usersWithZeroTokens: number;
}

export function AdminTokenDashboard() {
  const [users, setUsers] = useState<UserTokenData[]>([]);
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserTokenData | null>(null);
  const [adjustmentModal, setAdjustmentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tokens/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustTokens = async (userId: string, amount: number, description: string) => {
    try {
      const response = await fetch('/api/admin/tokens/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, description }),
      });
      
      const data = await response.json();
      if (data.success) {
        setAdjustmentModal(false);
        setSelectedUser(null);
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Failed to adjust tokens:', error);
    }
  };

  const handleResetUser = async (userId: string) => {
    if (!confirm('ต้องการรีเซ็ต Token ของผู้ใช้นี้เป็น 5 Token หรือไม่?')) return;
    
    try {
      const response = await fetch('/api/admin/tokens/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      if (data.success) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to reset tokens:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-[#0B2604] mt-1">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Tokens</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalTokens}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Avg per User</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.averageTokensPerUser.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Zero Tokens</h3>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.usersWithZeroTokens}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="ค้นหาด้วย Email หรือ Display Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.displayName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${
                      user.totalBalance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.totalBalance} 🪙
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-1">
                      {user.wallets.map((wallet) => (
                        <span
                          key={wallet.id}
                          className={`px-2 py-1 rounded text-xs ${
                            wallet.walletType === 'STANDARD' ? 'bg-blue-100 text-blue-800' :
                            wallet.walletType === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                            wallet.walletType === 'BONUS' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {wallet.walletType}: {wallet.balanceTokens}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setAdjustmentModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ปรับ Token
                    </button>
                    <button
                      onClick={() => handleResetUser(user.userId)}
                      className="text-green-600 hover:text-green-900"
                    >
                      รีเซ็ต
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjustmentModal && selectedUser && (
        <AdjustmentModal
          user={selectedUser}
          onClose={() => {
            setAdjustmentModal(false);
            setSelectedUser(null);
          }}
          onSave={handleAdjustTokens}
        />
      )}
    </div>
  );
}

function AdjustmentModal({
  user,
  onClose,
  onSave,
}: {
  user: UserTokenData;
  onClose: () => void;
  onSave: (userId: string, amount: number, description: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      alert('กรุณากรอกจำนวน Token ที่ถูกต้อง');
      return;
    }

    setLoading(true);
    await onSave(user.userId, numAmount, description);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">ปรับ Token</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Email: {user.email}</p>
          <p className="text-sm text-gray-600">Token ปัจจุบัน: {user.totalBalance}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            จำนวน Token (ใช้ + สำหรับเพิ่ม, - สำหรับลบ)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="เช่น +10 หรือ -5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            คำอธิบาย (ไม่บังคับ)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="เช่น Admin adjustment, Manual refund"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}



