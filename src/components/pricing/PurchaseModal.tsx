'use client';

import { useState } from 'react';
import { TokenPackage } from '@/libs/billing/tokenPricing';

interface PurchaseModalProps {
  package: TokenPackage;
  onClose: () => void;
}

export function PurchaseModal({ package: pkg, onClose }: PurchaseModalProps) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      setProcessing(true);
      setError(null);

      // TODO: Integrate with Stripe/Omise
      // For now, just simulate the purchase
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          amount: pkg.priceTHB,
          tokens: pkg.tokens,
          bonusTokens: pkg.bonusTokens || 0,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to payment page
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#0B2604]">
            ยืนยันการสั่งซื้อ
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Package Details */}
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg">{pkg.name}</span>
            <span className="text-2xl font-bold text-green-600">
              ฿{pkg.priceTHB.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Tokens:</span>
              <span className="font-semibold">{pkg.tokens} 🪙</span>
            </div>
            {pkg.bonusTokens && (
              <div className="flex justify-between text-green-600">
                <span>Bonus Tokens:</span>
                <span className="font-semibold">+{pkg.bonusTokens} 🪙</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
              <span>Total Tokens:</span>
              <span className="text-green-600">
                {pkg.tokens + (pkg.bonusTokens || 0)} 🪙
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Purchase Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            ⚡ Token ที่ซื้อจะถูกเติมเข้า <strong>PREMIUM Wallet</strong> ของคุณทันที
            <br />
            <span className="text-xs text-blue-600 mt-1 block">
              ระบบจะใช้ FREE Tokens ก่อน แล้วค่อยใช้ Premium Tokens อัตโนมัติ
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handlePurchase}
            disabled={processing}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 shadow-lg"
          >
            {processing ? 'กำลังดำเนินการ...' : 'ยืนยันการซื้อ'}
          </button>
        </div>

        {/* Payment Methods Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            รองรับการชำระเงินผ่าน{' '}
            <span className="font-semibold">บัตรเครดิต/เดบิต</span>
            {' '}และ{' '}
            <span className="font-semibold">PromptPay</span>
          </p>
        </div>
      </div>
    </div>
  );
}

