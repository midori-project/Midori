import { prisma } from "@/libs/prisma/prisma";
import { TokenTransactionType, WalletType } from "@prisma/client";
import { calculateTokenCost } from "./tokenPricing";
import { TokenWalletService } from "./tokenWalletService";
import { tokenMemoryCache } from "./tokenMemoryCache";

export interface TokenTransactionData {
  userId: string;
  amount: number;
  type: TokenTransactionType;
  description?: string;
  metadata?: Record<string, any>;
  walletId?: string;
}

export interface TokenBalance {
  balance: number;
  lastReset: Date | null;
  walletType: WalletType;
}

/**
 * Token Ledger Service - จัดการ Token transactions
 */
export class TokenLedgerService {
  private walletService: TokenWalletService;

  constructor() {
    this.walletService = new TokenWalletService();
  }

  /**
   * ดึงยอด Token ปัจจุบันของผู้ใช้ (รวมทุก wallet)
   * ใช้ Memory Cache แทนการ query database
   */
  async getUserBalance(userId: string): Promise<TokenBalance> {
    try {
      // อ่านจาก memory cache ก่อน
      let cachedTokens = await tokenMemoryCache.getCachedTokens(userId);
      
      // ถ้าไม่มี cache ให้โหลดจาก database
      if (!cachedTokens) {
        cachedTokens = await tokenMemoryCache.loadUserTokens(userId);
      }
      
      return {
        balance: cachedTokens.totalBalance,
        lastReset: null, // ใช้ข้อมูลจาก wallets แทน
        walletType: 'STANDARD',
      };
    } catch (error) {
      console.error("Error getting user balance:", error);
      throw error;
    }
  }

  /**
   * หัก Token (Debit)
   * ใช้ Memory Cache แทนการ query database
   */
  async deductTokens(
    userId: string,
    amount: number,
    type: TokenTransactionType,
    description?: string,
    metadata?: Record<string, any>,
    preferredWalletType?: WalletType
  ): Promise<boolean> {
    try {
      // หัก Token จาก memory cache
      const result = await tokenMemoryCache.deductTokens(userId, amount);
      
      if (!result.success) {
        throw new Error(result.message || "Insufficient tokens");
      }

      // บันทึก transaction ใน database (async)
      prisma.tokenTransaction.create({
        data: {
          userId,
          walletId: result.walletId,
          amount: -amount, // Negative for debit
          type,
          description,
          metadata,
        },
      }).catch(error => console.error('Failed to log transaction:', error));

      return true;
    } catch (error) {
      console.error("Token deduction error:", error);
      throw error;
    }
  }

  /**
   * เพิ่ม Token (Credit)
   */
  async addTokens(
    userId: string,
    amount: number,
    type: TokenTransactionType,
    description?: string,
    metadata?: Record<string, any>,
    walletType: WalletType = 'STANDARD'
  ): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      // เพิ่ม Token ใน wallet
      const addResult = await this.walletService.addTokens(
        userId,
        amount,
        walletType
      );

      if (!addResult.success) {
        throw new Error(addResult.message || "Failed to add tokens");
      }

      // บันทึก transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          walletId: addResult.walletId,
          amount, // Positive for credit
          type,
          description,
          metadata,
        },
      });

      return true;
    });
  }

  /**
   * รีเซ็ต Token เป็น 5 ทุกวัน
   */
  async resetDailyTokens(userId: string): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      // รีเซ็ต STANDARD wallet
      const resetResult = await this.walletService.resetDailyTokens(userId);
      
      if (!resetResult) {
        throw new Error("Failed to reset daily tokens");
      }

      // บันทึก transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount: 5,
          type: "DAILY_RESET",
          description: "Daily token reset",
          metadata: {
            resetDate: new Date().toISOString(),
            walletType: 'STANDARD',
          },
        },
      });

      return true;
    });
  }

  /**
   * ตรวจสอบและรีเซ็ต Token ถ้าครบ 24 ชั่วโมง
   */
  async checkAndResetDailyTokens(userId: string): Promise<boolean> {
    return await this.walletService.checkAndResetDailyTokens(userId);
  }

  /**
   * ดึงประวัติ Token transactions
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return await prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  /**
   * หัก Token สำหรับการสร้างโปรเจค
   */
  async deductProjectCreationTokens(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const cost = calculateTokenCost("projectCreation");
    
    return await this.deductTokens(
      userId,
      cost,
      "PROJECT_CREATION",
      "Project creation",
      { projectId }
    );
  }

  /**
   * คืน Token เมื่อการสร้างโปรเจคล้มเหลว
   */
  async refundProjectCreationTokens(
    userId: string,
    projectId: string,
    reason: string
  ): Promise<boolean> {
    const cost = calculateTokenCost("projectCreation");
    
    return await this.addTokens(
      userId,
      cost,
      "REFUND",
      `Refund for failed project creation: ${reason}`,
      { projectId, originalType: "PROJECT_CREATION" }
    );
  }

  /**
   * บันทึก Token transaction (สำหรับ Admin และระบบอื่นๆ)
   */
  async recordTransaction(
    userId: string,
    amount: number,
    type: TokenTransactionType,
    description?: string,
    metadata?: Record<string, any>,
    walletId?: string
  ): Promise<void> {
    await prisma.tokenTransaction.create({
      data: {
        userId,
        walletId,
        amount,
        type,
        description,
        metadata,
      },
    });
  }

  /**
   * เพิ่ม Token โดยไม่หัก Wallet (สำหรับ Admin)
   */
  async grantTokens(
    userId: string,
    amount: number,
    type: TokenTransactionType,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // เพิ่ม Token โดยตรงใน STANDARD wallet
      const result = await this.walletService.addTokens(userId, amount, 'STANDARD');
      
      if (!result.success) {
        return false;
      }

      // บันทึก transaction
      await this.recordTransaction(
        userId,
        amount,
        type,
        description,
        metadata,
        result.walletId
      );

      return true;
    } catch (error) {
      console.error('Grant tokens error:', error);
      return false;
    }
  }
}
