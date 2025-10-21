import { prisma } from "@/libs/prisma/prisma";
import { TokenTransactionType, WalletType } from "@prisma/client";
import { calculateTokenCost } from "./tokenPricing";
import { TokenWalletService } from "./tokenWalletService";

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
   */
  async getUserBalance(userId: string): Promise<TokenBalance> {
    const summary = await this.walletService.getUserTokenSummary(userId);
    const standardWallet = await this.walletService.getWalletByType(userId, 'STANDARD');

    return {
      balance: summary.totalBalance,
      lastReset: standardWallet?.lastTokenReset || null,
      walletType: 'STANDARD',
    };
  }

  /**
   * หัก Token (Debit)
   */
  async deductTokens(
    userId: string,
    amount: number,
    type: TokenTransactionType,
    description?: string,
    metadata?: Record<string, any>,
    preferredWalletType?: WalletType
  ): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      // หัก Token จาก wallet
      const deductResult = await this.walletService.deductTokens(
        userId,
        amount,
        preferredWalletType
      );

      if (!deductResult.success) {
        throw new Error(deductResult.message || "Insufficient tokens");
      }

      // บันทึก transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          walletId: deductResult.walletId,
          amount: -amount, // Negative for debit
          type,
          description,
          metadata,
        },
      });

      return true;
    });
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
}
