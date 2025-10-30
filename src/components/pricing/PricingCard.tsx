'use client';

import { TokenPackage } from '@/libs/billing/tokenPricing';

interface PricingCardProps {
  package: TokenPackage;
  isBestValue?: boolean;
  onPurchase: (pkg: TokenPackage) => void;
}

export function PricingCard({ package: pkg, isBestValue, onPurchase }: PricingCardProps) {
  return (
    <div className={`relative bg-white rounded-xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
      isBestValue ? 'border-green-500 scale-105' : 'border-gray-200'
    }`}>
      {/* Best Value Badge */}
      {isBestValue && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
            ⭐ คุ้มค่าที่สุด
          </span>
        </div>
      )}

      {/* Popular Badge */}
      {pkg.popular && !isBestValue && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}

      {/* Package Info */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-[#0B2604] mb-2">{pkg.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

        {/* Price */}
        <div className="mb-4">
          <div className="text-4xl font-bold text-green-600 mb-1">
            ฿{pkg.priceTHB.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            ${pkg.priceUSD.toLocaleString()} USD
          </div>
        </div>

        {/* Token Amount */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-100">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {pkg.tokens + (pkg.bonusTokens || 0)}
            <span className="text-lg"> 🪙</span>
          </div>
          <div className="text-xs text-gray-600">
            {pkg.tokens} Tokens
            {pkg.bonusTokens && (
              <span className="text-green-600 font-semibold">
                {' '}+ {pkg.bonusTokens} โบนัส
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        {pkg.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <span className="text-green-500 mr-2 mt-1">✓</span>
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Purchase Button */}
      <button
        onClick={() => onPurchase(pkg)}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          isBestValue
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
            : 'bg-[#0B2604] text-white hover:bg-[#0a2300]'
        }`}
      >
        ซื้อเลย
      </button>

      {/* Value Indicator */}
      {!isBestValue && (
        <div className="text-center mt-3 text-xs text-gray-500">
          ฿{Math.round(pkg.priceTHB / pkg.tokens)} / token
        </div>
      )}
    </div>
  );
}

