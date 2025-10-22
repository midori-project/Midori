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
