import { TokenLedgerService } from "./tokenLedgerService";
import { calculateTokenCost, hasEnoughTokens } from "./tokenPricing";

/**
 * Token Guard Service - ตรวจสอบและป้องกันการใช้ Token
 */
export class TokenGuardService {
  private ledgerService: TokenLedgerService;

  constructor() {
    this.ledgerService = new TokenLedgerService();
  }

  /**
   * ตรวจสอบว่าผู้ใช้มี Token เพียงพอสำหรับการสร้างโปรเจค
   */
  async canCreateProject(userId: string): Promise<{
    canProceed: boolean;
    currentBalance: number;
    requiredTokens: number;
    message?: string;
  }> {
    try {
      // ตรวจสอบและรีเซ็ต Token ถ้าครบ 24 ชั่วโมง
      await this.ledgerService.checkAndResetDailyTokens(userId);

      const balance = await this.ledgerService.getUserBalance(userId);
      const requiredTokens = calculateTokenCost("projectCreation");

      const canProceed = hasEnoughTokens(balance.balance, requiredTokens);

      return {
        canProceed,
        currentBalance: balance.balance,
        requiredTokens,
        message: canProceed 
          ? undefined 
          : `คุณมี Token ไม่เพียงพอ ต้องการ ${requiredTokens} Token แต่มีเพียง ${balance.balance} Token`
      };
    } catch (error) {
      console.error("Token guard error:", error);
      return {
        canProceed: false,
        currentBalance: 0,
        requiredTokens: calculateTokenCost("projectCreation"),
        message: "เกิดข้อผิดพลาดในการตรวจสอบ Token"
      };
    }
  }

  /**
   * หัก Token สำหรับการสร้างโปรเจค
   */
  async deductProjectCreationTokens(userId: string, projectId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await this.ledgerService.deductProjectCreationTokens(userId, projectId);
      return {
        success: true,
        message: "หัก Token สำเร็จ"
      };
    } catch (error) {
      console.error("Token deduction error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการหัก Token"
      };
    }
  }

  /**
   * คืน Token เมื่อการสร้างโปรเจคล้มเหลว
   */
  async refundProjectCreationTokens(
    userId: string, 
    projectId: string, 
    reason: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await this.ledgerService.refundProjectCreationTokens(userId, projectId, reason);
      return {
        success: true,
        message: "คืน Token สำเร็จ"
      };
    } catch (error) {
      console.error("Token refund error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการคืน Token"
      };
    }
  }

  /**
   * ดึงข้อมูล Token สำหรับแสดงใน UI
   */
  async getTokenInfo(userId: string): Promise<{
    balance: number;
    lastReset: Date | null;
    canCreateProject: boolean;
    requiredTokens: number;
  }> {
    try {
      await this.ledgerService.checkAndResetDailyTokens(userId);
      const balance = await this.ledgerService.getUserBalance(userId);
      const requiredTokens = calculateTokenCost("projectCreation");
      
      return {
        balance: balance.balance,
        lastReset: balance.lastReset,
        canCreateProject: hasEnoughTokens(balance.balance, requiredTokens),
        requiredTokens,
      };
    } catch (error) {
      console.error("Get token info error:", error);
      return {
        balance: 0,
        lastReset: null,
        canCreateProject: false,
        requiredTokens: calculateTokenCost("projectCreation"),
      };
    }
  }
}
