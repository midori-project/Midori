import { TokenWalletService } from './tokenWalletService';

type WalletType = 'STANDARD' | 'PREMIUM' | 'BONUS' | 'TRIAL';

/**
 * Token Memory Cache Service
 * จัดการ Token data ใน memory แทนการ query database
 */

export interface CachedTokenData {
  userId: string;
  totalBalance: number;
  wallets: Array<{
    id: string;
    walletType: WalletType;
    balanceTokens: number;
    isActive: boolean;
    expiresAt: Date | null;
  }>;
  lastUpdated: Date;
  version: number;
}

export interface TokenCacheStats {
  totalUsers: number;
  memoryUsed: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

export class TokenMemoryCacheService {
  private cache = new Map<string, CachedTokenData>();
  private walletService: TokenWalletService;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private cacheHits = 0;
  private cacheMisses = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.walletService = new TokenWalletService();
    this.startCleanupInterval();
  }

  /**
   * โหลด Token จาก database และเก็บใน memory
   */
  async loadUserTokens(userId: string): Promise<CachedTokenData> {
    try {
      const summary = await this.walletService.getUserTokenSummary(userId);
      
      const cachedData: CachedTokenData = {
        userId,
        totalBalance: summary.totalBalance,
        wallets: summary.wallets.map(wallet => ({
          id: wallet.id,
          walletType: wallet.walletType,
          balanceTokens: wallet.balanceTokens,
          isActive: wallet.isActive,
          expiresAt: wallet.expiresAt
        })),
        lastUpdated: new Date(),
        version: 1
      };

      this.cache.set(userId, cachedData);
      this.cacheMisses++;
      
      console.log(`🔄 Loaded tokens for user ${userId}: ${cachedData.totalBalance} tokens`);
      return cachedData;
    } catch (error) {
      console.error(`❌ Failed to load tokens for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * อ่าน Token จาก memory cache
   */
  async getCachedTokens(userId: string): Promise<CachedTokenData | null> {
    const cached = this.cache.get(userId);
    
    if (!cached) {
      this.cacheMisses++;
      return null;
    }

    // ตรวจสอบ TTL
    const isExpired = Date.now() - cached.lastUpdated.getTime() > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(userId);
      this.cacheMisses++;
      console.log(`⏰ Cache expired for user ${userId}`);
      return null;
    }

    this.cacheHits++;
    return cached;
  }

  /**
   * อัปเดต Token ใน memory cache และ database
   */
  async updateTokens(
    userId: string, 
    newBalance: number, 
    walletId: string,
    amount: number
  ): Promise<void> {
    const cached = this.cache.get(userId);
    if (!cached) {
      console.warn(`⚠️ No cache found for user ${userId}`);
      return;
    }

    // อัปเดต memory
    cached.totalBalance = newBalance;
    cached.lastUpdated = new Date();
    cached.version += 1;

    // อัปเดต wallet ที่เปลี่ยนแปลง
    const wallet = cached.wallets.find(w => w.id === walletId);
    if (wallet) {
      wallet.balanceTokens = newBalance;
    }

    this.cache.set(userId, cached);
    console.log(`💾 Updated cache for user ${userId}: ${newBalance} tokens`);

    // อัปเดต database
    try {
      const { prisma } = await import('@/libs/prisma/prisma');
      await prisma.tokenWallet.update({
        where: { id: walletId },
        data: { balanceTokens: newBalance }
      });
      console.log(`💾 Updated database for wallet ${walletId}: ${newBalance} tokens`);
    } catch (error) {
      console.error('❌ Failed to update database:', error);
    }
  }

  /**
   * ตรวจสอบว่าสามารถสร้างโปรเจคได้หรือไม่
   */
  async canCreateProject(userId: string): Promise<{
    canProceed: boolean;
    currentBalance: number;
    requiredTokens: number;
    message?: string;
  }> {
    // อ่านจาก memory ก่อน
    let cachedTokens = await this.getCachedTokens(userId);
    
    // ถ้าไม่มี cache ให้โหลดจาก database
    if (!cachedTokens) {
      cachedTokens = await this.loadUserTokens(userId);
    }

    const required = 1;
    const canProceed = cachedTokens.totalBalance >= required;

    return {
      canProceed,
      currentBalance: cachedTokens.totalBalance,
      requiredTokens: required,
      message: canProceed ? undefined : 'Token ไม่เพียงพอ'
    };
  }

  /**
   * หัก Token จาก memory cache
   */
  async deductTokens(userId: string, amount: number, transactionType: string = 'CHAT_ANALYSIS'): Promise<{
    success: boolean;
    walletId?: string;
    message?: string;
  }> {
    try {
      // อ่านจาก memory
      let cachedTokens = await this.getCachedTokens(userId);
      
      // ถ้าไม่มี cache ให้โหลดจาก database
      if (!cachedTokens) {
        cachedTokens = await this.loadUserTokens(userId);
      }

      // ตรวจสอบ balance
      if (cachedTokens.totalBalance < amount) {
        return { 
          success: false, 
          message: 'Token ไม่เพียงพอใน wallet ใดๆ' 
        };
      }

      // หา wallet ที่เหมาะสม
      const targetWallet = this.findBestWallet(cachedTokens.wallets, amount);
      if (!targetWallet) {
        return { 
          success: false, 
          message: 'ไม่พบ wallet ที่เหมาะสม' 
        };
      }

      // อัปเดต memory
      const newBalance = targetWallet.balanceTokens - amount;
      await this.updateTokens(userId, cachedTokens.totalBalance - amount, targetWallet.id, amount);

      // บันทึก transaction ใน database (async)
      this.recordTransaction(userId, targetWallet.id, -amount, transactionType)
        .catch(error => console.error('Failed to record transaction:', error));

      return {
        success: true,
        walletId: targetWallet.id
      };

    } catch (error) {
      console.error('Token deduction error:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการหัก Token'
      };
    }
  }

  /**
   * หา wallet ที่เหมาะสมสำหรับหัก Token
   */
  private findBestWallet(wallets: CachedTokenData['wallets'], amount: number): CachedTokenData['wallets'][0] | null {
    // ลำดับความสำคัญ: STANDARD → PREMIUM → BONUS → TRIAL
    const priority: WalletType[] = ['STANDARD', 'PREMIUM', 'BONUS', 'TRIAL'];
    
    for (const walletType of priority) {
      const wallet = wallets.find(w => 
        w.walletType === walletType && 
        w.isActive && 
        w.balanceTokens >= amount &&
        (!w.expiresAt || w.expiresAt > new Date())
      );
      
      if (wallet) return wallet;
    }
    
    return null;
  }

  /**
   * ล้าง cache ของ user เมื่อ logout
   */
  clearUserCache(userId: string): void {
    this.cache.delete(userId);
    console.log(`🗑️ Cleared cache for user ${userId}`);
  }

  /**
   * ล้าง cache ทั้งหมด (daily reset)
   */
  clearAllCache(): void {
    this.cache.clear();
    console.log('🗑️ Cleared all token cache');
  }

  /**
   * เริ่ม cleanup interval
   */
  private startCleanupInterval(): void {
    // ล้าง cache ที่หมดอายุทุก 5 นาที
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  /**
   * ล้าง cache entries ที่หมดอายุ
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, data] of this.cache.entries()) {
      if (now - data.lastUpdated.getTime() > this.CACHE_TTL) {
        this.cache.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * ดึงสถิติ cache
   */
  getCacheStats(): TokenCacheStats {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    return {
      totalUsers: this.cache.size,
      memoryUsed: process.memoryUsage().heapUsed,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * บันทึก transaction ใน database
   */
  private async recordTransaction(
    userId: string, 
    walletId: string, 
    amount: number, 
    type: string
  ): Promise<void> {
    try {
      const { prisma } = await import('@/libs/prisma/prisma');
      
      await prisma.tokenTransaction.create({
        data: {
          userId,
          walletId,
          amount,
          type: type as any,
          description: type === 'CHAT_ANALYSIS' ? 'Chat analysis' : 'Token transaction',
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'memory_cache'
          }
        }
      });
      
      console.log(`📝 Recorded transaction: ${amount} tokens for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to record transaction:', error);
      throw error;
    }
  }

  /**
   * ปิด cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const tokenMemoryCache = new TokenMemoryCacheService();
