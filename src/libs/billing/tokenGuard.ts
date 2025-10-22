import { TokenLedgerService } from "./tokenLedgerService";
import { calculateTokenCost, hasEnoughTokens } from "./tokenPricing";
import { tokenMemoryCache } from "./tokenMemoryCache";

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
      // ใช้ Memory Cache แทนการ query database
      const result = await tokenMemoryCache.canCreateProject(userId);
      
      console.log(`🔍 Token check for user ${userId}: ${result.currentBalance} tokens, can proceed: ${result.canProceed}`);
      return result;
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
   * ใช้ Memory Cache แทนการ query database
   */
  async deductProjectCreationTokens(userId: string, projectId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const cost = calculateTokenCost("projectCreation");
      const result = await tokenMemoryCache.deductTokens(userId, cost, 'PROJECT_CREATION');
      
      if (result.success) {
        // บันทึก transaction ใน database (async)
        this.ledgerService.deductProjectCreationTokens(userId, projectId)
          .catch(error => console.error('Failed to log transaction:', error));
        
        console.log(`💸 Deducted ${cost} token from user ${userId}, wallet: ${result.walletId}`);
        return {
          success: true,
          message: "หัก Token สำเร็จ"
        };
      } else {
        return {
          success: false,
          message: result.message || "ไม่สามารถหัก Token ได้"
        };
      }
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
      const cost = calculateTokenCost("projectCreation");
      
      // คืน Token ใน memory cache
      const cachedTokens = await tokenMemoryCache.getCachedTokens(userId);
      if (cachedTokens) {
        await tokenMemoryCache.updateTokens(
          userId, 
          cachedTokens.totalBalance + cost, 
          '', // ไม่ระบุ walletId สำหรับ refund
          cost
        );
      }
      
      // บันทึก transaction ใน database (async)
      this.ledgerService.refundProjectCreationTokens(userId, projectId, reason)
        .catch(error => console.error('Failed to log refund transaction:', error));
      
      console.log(`💰 Refunded ${cost} token to user ${userId}`);
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
