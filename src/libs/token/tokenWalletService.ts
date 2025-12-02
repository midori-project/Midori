import { prisma } from "@/libs/prisma/prisma";
import { WalletType } from "@prisma/client";

export interface TokenWalletInfo {
    id: string;
    balanceTokens: number;
    lastTokenReset: Date | null;
    walletType: WalletType;
    isActive: boolean;
    expiresAt: Date | null;
}

export interface UserTokenSummary {
    totalBalance: number;
    wallets: TokenWalletInfo[];
    canCreateProject: boolean;
    requiredTokens: number;
}

/**
 * TokenWallet Service - จัดการ TokenWallet table
 */
export class TokenWalletService {
    /**
     * สร้าง TokenWallet ใหม่สำหรับผู้ใช้
     */
    async createWallet(
        userId: string,
        walletType: WalletType = 'STANDARD',
        initialTokens: number = 5,
        expiresAt?: Date
    ): Promise<TokenWalletInfo> {
        const wallet = await prisma.tokenWallet.create({
            data: {
                userId,
                balanceTokens: initialTokens,
                walletType,
                expiresAt,
                lastTokenReset: new Date(),
            },
        });

        return {
            id: wallet.id,
            balanceTokens: Number(wallet.balanceTokens),
            lastTokenReset: wallet.lastTokenReset,
            walletType: wallet.walletType,
            isActive: wallet.isActive,
            expiresAt: wallet.expiresAt,
        };
    }

    /**
     * ดึงข้อมูล TokenWallet ของผู้ใช้
     */
    async getUserWallets(userId: string): Promise<TokenWalletInfo[]> {
        const wallets = await prisma.tokenWallet.findMany({
            where: {
                userId,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: [
                { walletType: 'asc' },
                { createdAt: 'asc' }
            ]
        });

        return wallets.map(wallet => ({
            id: wallet.id,
            balanceTokens: Number(wallet.balanceTokens),  // Convert Decimal to number
            lastTokenReset: wallet.lastTokenReset,
            walletType: wallet.walletType,
            isActive: wallet.isActive,
            expiresAt: wallet.expiresAt,
        }));
    }

    /**
     * ดึงข้อมูล TokenWallet ตามประเภท
     */
    async getWalletByType(
        userId: string,
        walletType: WalletType
    ): Promise<TokenWalletInfo | null> {
        const wallet = await prisma.tokenWallet.findFirst({
            where: {
                userId,
                walletType,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        });

        if (!wallet) return null;

        return {
            id: wallet.id,
            balanceTokens: Number(wallet.balanceTokens),
            lastTokenReset: wallet.lastTokenReset,
            walletType: wallet.walletType,
            isActive: wallet.isActive,
            expiresAt: wallet.expiresAt,
        };
    }

    /**
     * ดึงสรุป Token ทั้งหมดของผู้ใช้
     */
    async getUserTokenSummary(userId: string): Promise<UserTokenSummary> {
        const wallets = await this.getUserWallets(userId);
        const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balanceTokens, 0);
        const requiredTokens = 1; // สร้างโปรเจคใช้ 1 Token

        return {
            totalBalance,
            wallets,
            canCreateProject: totalBalance >= requiredTokens,
            requiredTokens,
        };
    }

    /**
     * หัก Token จาก wallet ที่เหมาะสม
     */
    async deductTokens(
        userId: string,
        amount: number,
        preferredWalletType?: WalletType
    ): Promise<{ success: boolean; walletId?: string; message?: string }> {
        return await prisma.$transaction(async (tx) => {
            // หา wallet ที่เหมาะสม
            let targetWallet = null;

            if (preferredWalletType) {
                targetWallet = await tx.tokenWallet.findFirst({
                    where: {
                        userId,
                        walletType: preferredWalletType,
                        isActive: true,
                        balanceTokens: { gte: amount },
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } }
                        ]
                    }
                });
            }

            // ถ้าไม่เจอ wallet ที่ต้องการ หรือไม่มี token เพียงพอ
            if (!targetWallet) {
                // หา wallet อื่นที่มี token เพียงพอ (ลำดับความสำคัญ)
                const walletPriority = ['STANDARD', 'PREMIUM', 'BONUS', 'TRIAL'];

                for (const walletType of walletPriority) {
                    if (preferredWalletType && walletType === preferredWalletType) continue;

                    targetWallet = await tx.tokenWallet.findFirst({
                        where: {
                            userId,
                            walletType: walletType as WalletType,
                            isActive: true,
                            balanceTokens: { gte: amount },
                            OR: [
                                { expiresAt: null },
                                { expiresAt: { gt: new Date() } }
                            ]
                        }
                    });

                    if (targetWallet) break;
                }
            }

            if (!targetWallet) {
                return {
                    success: false,
                    message: 'Token ไม่เพียงพอใน wallet ใดๆ'
                };
            }

            // หัก Token
            await tx.tokenWallet.update({
                where: { id: targetWallet.id },
                data: {
                    balanceTokens: {
                        decrement: amount
                    },
                    updatedAt: new Date()
                }
            });

            return {
                success: true,
                walletId: targetWallet.id
            };
        });
    }

    /**
     * เพิ่ม Token ให้ wallet
     */
    async addTokens(
        userId: string,
        amount: number,
        walletType: WalletType = 'STANDARD'
    ): Promise<{ success: boolean; walletId?: string; message?: string }> {
        try {
            // หา wallet ที่มีอยู่
            let wallet = await prisma.tokenWallet.findFirst({
                where: {
                    userId,
                    walletType,
                    isActive: true
                }
            });

            // ถ้าไม่มี wallet สร้างใหม่
            if (!wallet) {
                wallet = await prisma.tokenWallet.create({
                    data: {
                        userId,
                        walletType,
                        balanceTokens: amount,
                        lastTokenReset: new Date()
                    }
                });
            } else {
                // เพิ่ม Token ใน wallet ที่มีอยู่
                wallet = await prisma.tokenWallet.update({
                    where: { id: wallet.id },
                    data: {
                        balanceTokens: {
                            increment: amount
                        },
                        updatedAt: new Date()
                    }
                });
            }

            return {
                success: true,
                walletId: wallet.id
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
            };
        }
    }

    /**
     * รีเซ็ต STANDARD wallet ทุกวัน
     */
    async resetDailyTokens(userId: string): Promise<boolean> {
        try {
            const standardWallet = await prisma.tokenWallet.findFirst({
                where: {
                    userId,
                    walletType: 'STANDARD',
                    isActive: true
                }
            });

            if (standardWallet) {
                await prisma.tokenWallet.update({
                    where: { id: standardWallet.id },
                    data: {
                        balanceTokens: 5,
                        lastTokenReset: new Date(),
                        updatedAt: new Date()
                    }
                });
            } else {
                // สร้าง STANDARD wallet ใหม่
                await prisma.tokenWallet.create({
                    data: {
                        userId,
                        walletType: 'STANDARD',
                        balanceTokens: 5,
                        lastTokenReset: new Date()
                    }
                });
            }

            return true;
        } catch (error) {
            console.error('Reset daily tokens error:', error);
            return false;
        }
    }

    /**
     * ตรวจสอบและรีเซ็ต Token ถ้าครบ 24 ชั่วโมง
     */
    async checkAndResetDailyTokens(userId: string): Promise<boolean> {
        const standardWallet = await prisma.tokenWallet.findFirst({
            where: {
                userId,
                walletType: 'STANDARD',
                isActive: true
            }
        });

        if (!standardWallet) {
            // สร้าง STANDARD wallet ใหม่
            await this.createWallet(userId, 'STANDARD', 5);
            return true;
        }

        // ตรวจสอบว่าผ่านไป 24 ชั่วโมงแล้วหรือไม่
        const now = new Date();
        const lastReset = standardWallet.lastTokenReset || standardWallet.createdAt;
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

        if (hoursSinceReset >= 24) {
            return await this.resetDailyTokens(userId);
        }

        return false;
    }

    /**
     * สร้าง wallet ใหม่สำหรับผู้ใช้ (เมื่อ register)
     */
    async initializeUserWallets(userId: string): Promise<void> {
        // สร้าง STANDARD wallet
        await this.createWallet(userId, 'STANDARD', 5);
    }

    /**
     * ปิดใช้งาน wallet (soft delete)
     */
    async deactivateWallet(walletId: string): Promise<boolean> {
        try {
            await prisma.tokenWallet.update({
                where: { id: walletId },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            return true;
        } catch (error) {
            console.error('Deactivate wallet error:', error);
            return false;
        }
    }
}

// Export singleton instance
export const tokenWalletService = new TokenWalletService();
