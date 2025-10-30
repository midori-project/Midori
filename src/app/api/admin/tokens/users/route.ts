import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { prisma } from '@/libs/prisma/prisma';
import { TokenWalletService } from '@/libs/billing/tokenWalletService';

/**
 * GET /api/admin/tokens/users
 * ดึงข้อมูล Token ของผู้ใช้ทั้งหมด (สำหรับ Admin)
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: ตรวจสอบ admin permission
    // const isAdmin = await checkAdminPermission(session.user.id);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // ดึงข้อมูลผู้ใช้ทั้งหมดพร้อม wallets
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
      },
      where: {
        isActive: true,
      },
    });

    const walletService = new TokenWalletService();
    const stats = {
      totalUsers: users.length,
      totalTokens: 0,
      averageTokensPerUser: 0,
      usersWithZeroTokens: 0,
    };

    // ดึงข้อมูล Token ของแต่ละผู้ใช้
    const usersWithTokens = await Promise.all(
      users.map(async (user) => {
        const summary = await walletService.getUserTokenSummary(user.id);
        
        // Update stats
        stats.totalTokens += summary.totalBalance;
        if (summary.totalBalance === 0) stats.usersWithZeroTokens++;

        // ดึงข้อมูล transactions
        const transactions = await prisma.tokenTransaction.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            createdAt: true,
          },
        });

        return {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          totalBalance: summary.totalBalance,
          wallets: summary.wallets.map(w => ({
            id: w.id,
            walletType: w.walletType,
            balanceTokens: Number(w.balanceTokens),
            lastTokenReset: w.lastTokenReset?.toISOString() || null,
            expiresAt: w.expiresAt?.toISOString() || null,
          })),
          transactions: transactions.map(t => ({
            id: t.id,
            amount: Number(t.amount),
            type: t.type,
            description: t.description,
            createdAt: t.createdAt.toISOString(),
          })),
        };
      })
    );

    stats.averageTokensPerUser = users.length > 0 ? stats.totalTokens / users.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithTokens,
        stats,
      },
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      },
      { status: 500 }
    );
  }
}



