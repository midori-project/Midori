import { prisma } from "@/libs/prisma/prisma";
import { TokenLedgerService } from "./tokenLedgerService";

/**
 * Daily Reset Service - รีเซ็ต Token ทุก 0.00 น.
 */
export class DailyResetService {
  private ledgerService: TokenLedgerService;

  constructor() {
    this.ledgerService = new TokenLedgerService();
  }

  /**
   * รีเซ็ต Token สำหรับผู้ใช้ทั้งหมด
   */
  async resetAllUsersTokens(): Promise<{
    success: boolean;
    resetCount: number;
    message: string;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // หาผู้ใช้ที่ยังไม่ได้รีเซ็ตวันนี้
      const usersToReset = await prisma.user.findMany({
        where: {
          OR: [
            { lastTokenReset: null },
            { lastTokenReset: { lt: today } }
          ]
        },
        select: { id: true, email: true, balanceTokens: true }
      });

      let resetCount = 0;

      for (const user of usersToReset) {
        try {
          await this.ledgerService.resetDailyTokens(user.id);
          resetCount++;
          console.log(`✅ Reset tokens for user ${user.email} (${user.id})`);
        } catch (error) {
          console.error(`❌ Failed to reset tokens for user ${user.email}:`, error);
        }
      }

      return {
        success: true,
        resetCount,
        message: `รีเซ็ต Token สำเร็จสำหรับ ${resetCount} ผู้ใช้`
      };
    } catch (error) {
      console.error("Daily reset error:", error);
      return {
        success: false,
        resetCount: 0,
        message: `เกิดข้อผิดพลาดในการรีเซ็ต Token: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * ตรวจสอบว่าต้องรีเซ็ต Token หรือไม่
   */
  async shouldResetTokens(): Promise<boolean> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // นับจำนวนผู้ใช้ที่ยังไม่ได้รีเซ็ตวันนี้
      const count = await prisma.user.count({
        where: {
          OR: [
            { lastTokenReset: null },
            { lastTokenReset: { lt: today } }
          ]
        }
      });

      return count > 0;
    } catch (error) {
      console.error("Check reset status error:", error);
      return false;
    }
  }

  /**
   * รีเซ็ต Token สำหรับผู้ใช้คนเดียว
   */
  async resetUserTokens(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.ledgerService.resetDailyTokens(userId);
      return {
        success: true,
        message: "รีเซ็ต Token สำเร็จ"
      };
    } catch (error) {
      console.error("Reset user tokens error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการรีเซ็ต Token"
      };
    }
  }
}
