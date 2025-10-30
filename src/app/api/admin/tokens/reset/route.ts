import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { TokenWalletService } from '@/libs/billing/tokenWalletService';
import { TokenLedgerService } from '@/libs/billing/tokenLedgerService';
import { TokenTransactionType } from '@prisma/client';

/**
 * POST /api/admin/tokens/reset
 * รีเซ็ต Token ของผู้ใช้เป็น 5 (สำหรับ Admin)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const walletService = new TokenWalletService();
    const ledgerService = new TokenLedgerService();

    // ตั้งค่า Token เป็น 5
    await walletService.resetDailyTokens(userId);

    // บันทึก transaction (ดึง walletId ก่อน)
    const summary = await walletService.getUserTokenSummary(userId);
    const standardWallet = summary.wallets.find(w => w.walletType === 'STANDARD');
    
    await ledgerService.recordTransaction(
      userId,
      5,
      TokenTransactionType.DAILY_RESET,
      `Admin manual reset by ${session.user.email}`,
      { adminUserId: session.user.id },
      standardWallet?.id
    );

    return NextResponse.json({
      success: true,
      message: 'รีเซ็ต Token สำเร็จ',
    });

  } catch (error) {
    console.error('Reset tokens error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการรีเซ็ต Token',
      },
      { status: 500 }
    );
  }
}

