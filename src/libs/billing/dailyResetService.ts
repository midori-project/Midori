import { prisma } from "@/libs/prisma/prisma";
import { TokenLedgerService } from "./tokenLedgerService";
import { TokenWalletService } from "./tokenWalletService";
import { tokenMemoryCache } from "./tokenMemoryCache";

/**
 * Daily Reset Service - รีเซ็ต Token ทุก 0.00 น.
 */
export class DailyResetService {
  private ledgerService: TokenLedgerService;
  private walletService: TokenWalletService;

  constructor() {
    this.ledgerService = new TokenLedgerService();
    this.walletService = new TokenWalletService();
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
      
      // หา STANDARD wallets ที่ต้องรีเซ็ต
      const walletsToReset = await prisma.tokenWallet.findMany({
        where: {
          walletType: 'STANDARD',
          isActive: true,
          OR: [
            { lastTokenReset: null },
            { lastTokenReset: { lt: today } }
          ]
        },
        select: { 
          id: true,
          userId: true,
          user: {
            select: { email: true }
          }
        }
      });

      let resetCount = 0;

      for (const wallet of walletsToReset) {
        try {
          await this.walletService.resetDailyTokens(wallet.userId);
          
          // ล้าง cache ของ user นี้เพื่อให้โหลดข้อมูลใหม่
          tokenMemoryCache.clearUserCache(wallet.userId);
          
          resetCount++;
          console.log(`✅ Reset tokens for wallet ${wallet.id} (user: ${wallet.user.email})`);
        } catch (error) {
          console.error(`❌ Failed to reset tokens for wallet ${wallet.id}:`, error);
        }
      }

      // ล้าง cache ทั้งหมดหลังจาก daily reset
      tokenMemoryCache.clearAllCache();
      console.log('🗑️ Cleared all token cache after daily reset');

      return {
        success: true,
        resetCount,
        message: `รีเซ็ต Token สำเร็จสำหรับ ${resetCount} wallets`
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
      
      // นับจำนวน STANDARD wallets ที่ยังไม่ได้รีเซ็ตวันนี้
      const count = await prisma.tokenWallet.count({
        where: {
          walletType: 'STANDARD',
          isActive: true,
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
