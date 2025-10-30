/**
 * Token Pricing Configuration
 * กำหนดราคา Token สำหรับแต่ละการใช้งาน
 */

export interface TokenPricingConfig {
  projectCreation: number;
  chatAnalysis: number;
  previewBuild: number;
  deployment: number;
  dailyReset: number;
}

export const TOKEN_PRICING: TokenPricingConfig = {
  projectCreation: 1.5,    // สร้างเว็บไซต์ใหม่
  chatAnalysis: 0.5,     // วิเคราะห์ chat (0.5 token ต่อครั้ง)
  previewBuild: 0,       // สร้าง preview (ฟรีไปก่อน)
  deployment: 0,         // deploy (ฟรีไปก่อน)
  dailyReset: 5,        // รีเซ็ตทุกวัน
};

/**
 * Token Packages สำหรับซื้อเพิ่ม
 */
export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceTHB: number;
  priceUSD: number;
  bonusTokens?: number;
  popular?: boolean;
  description: string;
  features: string[];
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 20,
    priceTHB: 299,
    priceUSD: 9.99,
    bonusTokens: 0,
    description: 'เหมาะสำหรับผู้เริ่มต้น',
    features: [
      '20 Tokens',
      'สร้างเว็บไซต์ได้ ~13 เว็บ',
      'ใช้ได้ไม่จำกัดเวลา',
      'Chat Analysis ไม่จำกัด'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    tokens: 50,
    priceTHB: 649,
    priceUSD: 19.99,
    bonusTokens: 5,
    popular: true,
    description: 'แพคเกจยอดนิยม - ดีลที่สุด',
    features: [
      '50 Tokens + โบนัส 5 (55 รวม)',
      'สร้างเว็บไซต์ได้ ~36 เว็บ',
      'ใช้ได้ไม่จำกัดเวลา',
      'Chat Analysis ไม่จำกัด',
      '🚀 Best Value!'
    ]
  },
  {
    id: 'business',
    name: 'Business Pack',
    tokens: 150,
    priceTHB: 1699,
    priceUSD: 49.99,
    bonusTokens: 25,
    description: 'เหมาะสำหรับธุรกิจ',
    features: [
      '150 Tokens + โบนัส 25 (175 รวม)',
      'สร้างเว็บไซต์ได้ ~116 เว็บ',
      'ใช้ได้ไม่จำกัดเวลา',
      'Chat Analysis ไม่จำกัด',
      'Support Priority',
      '💼 Best for Teams'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    tokens: 500,
    priceTHB: 4999,
    priceUSD: 149.99,
    bonusTokens: 100,
    description: 'สำหรับองค์กรขนาดใหญ่',
    features: [
      '500 Tokens + โบนัส 100 (600 รวม)',
      'สร้างเว็บไซต์ได้ ~400 เว็บ',
      'ใช้ได้ไม่จำกัดเวลา',
      'Chat Analysis ไม่จำกัด',
      'Dedicated Support',
      '🎯 Unlimited Potential'
    ]
  }
];

/**
 * คำนวณราคา Token ตามประเภทการใช้งาน
 */
export function calculateTokenCost(actionType: keyof TokenPricingConfig): number {
  return TOKEN_PRICING[actionType];
}

/**
 * ตรวจสอบว่าผู้ใช้มี Token เพียงพอหรือไม่
 */
export function hasEnoughTokens(userBalance: number, requiredTokens: number): boolean {
  return userBalance >= requiredTokens;
}

/**
 * ตรวจสอบ Token ที่จำเป็นสำหรับการสร้างโปรเจค
 */
export function getProjectCreationCost(): number {
  return calculateTokenCost('projectCreation');
}

/**
 * คำนวณราคาต่อ Token (สำหรับเปรียบเทียบแพคเกจ)
 */
export function getPricePerToken(packageTokens: number, priceTHB: number): number {
  return priceTHB / packageTokens;
}

/**
 * เปรียบเทียบแพคเกจว่าอันไหนคุ้มที่สุด
 */
export function getBestValuePackage(): TokenPackage {
  return TOKEN_PACKAGES.reduce((best, pkg) => {
    const currentValue = pkg.tokens / pkg.priceTHB;
    const bestValue = best.tokens / best.priceTHB;
    return currentValue > bestValue ? pkg : best;
  });
}
