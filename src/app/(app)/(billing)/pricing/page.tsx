'use client';

import { useState } from 'react';
import { TOKEN_PACKAGES, TokenPackage, getBestValuePackage } from '@/libs/billing/tokenPricing';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PurchaseModal } from '@/components/pricing/PurchaseModal';

export default function PricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [showModal, setShowModal] = useState(false);

  const bestValue = getBestValuePackage();

  const handlePurchase = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B2604] mb-4">
            🪙 Token Packages
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            เติม Token เพื่อสร้างเว็บไซต์ได้ไม่จำกัด
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              คุณจะได้ 5 Token ฟรีทุกวัน จาก Wallet ประเภท STANDARD
            </span>
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">🆓</div>
            <h3 className="font-bold text-lg mb-2">Free Tokens</h3>
            <p className="text-sm text-gray-600">
              ได้ 5 Token ฟรีทุกวัน จาก Wallet ประเภท STANDARD
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-bold text-lg mb-2">Premium Tokens</h3>
            <p className="text-sm text-gray-600">
              Token ที่ซื้อมาใช้ได้ไม่จำกัดเวลา และไม่หมดอายุ
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-lg mb-2">Auto Priority</h3>
            <p className="text-sm text-gray-600">
              ระบบจะใช้ FREE Tokens ก่อน แล้วค่อยใช้ Paid Tokens อัตโนมัติ
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TOKEN_PACKAGES.map((pkg) => (
            <PricingCard
              key={pkg.id}
              package={pkg}
              isBestValue={pkg.id === bestValue.id}
              onPurchase={handlePurchase}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0B2604] mb-6 text-center">
            คำถามที่พบบ่อย (FAQ)
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="Free Tokens กับ Paid Tokens ต่างกันอย่างไร?"
              answer="Free Tokens (STANDARD wallet) ได้ฟรี 5 tokens ทุกวัน ส่วน Paid Tokens (PREMIUM wallet) ซื้อมาใช้ได้ไม่จำกัดเวลาและไม่หมดอายุ"
            />
            <FAQItem
              question="ระบบจะใช้ Token อย่างไร?"
              answer="ระบบจะใช้ FREE Tokens ก่อน (STANDARD → TRIAL) จากนั้นจึงใช้ Paid Tokens (BONUS → PREMIUM) อัตโนมัติ ตามลำดับความสำคัญ"
            />
            <FAQItem
              question="Token ที่ซื้อมาใช้ได้นานแค่ไหน?"
              answer="Token ที่ซื้อมาจาก PREMIUM wallet จะใช้ได้ไม่จำกัดเวลาและไม่หมดอายุ สามารถใช้ได้จนกว่าจะหมด"
            />
            <FAQItem
              question="สร้างเว็บไซต์ครั้งละกี่ Token?"
              answer="การสร้างเว็บไซต์ใช้ 1.5 Token ต่อครั้ง ส่วน Chat Analysis ใช้ 0.5 Token ต่อครั้ง"
            />
            <FAQItem
              question="ควรซื้อแพคเกจไหนดี?"
              answer={`แพคเกจ "${bestValue.name}" คุ้มค่าที่สุด โดยให้ Token มากที่สุดเมื่อเทียบกับราคา`}
            />
          </div>
        </div>

        {/* Purchase Modal */}
        {showModal && selectedPackage && (
          <PurchaseModal
            package={selectedPackage}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="font-bold text-lg mb-2 text-[#0B2604]">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}

