import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { TokenWalletService } from '@/libs/billing/tokenWalletService';
import { TokenLedgerService } from '@/libs/billing/tokenLedgerService';
import { TokenTransactionType } from '@prisma/client';

/**
 * POST /api/admin/tokens/adjust
 * ปรับ Token ของผู้ใช้ (สำหรับ Admin)
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
    const { userId, amount, description } = body;

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const ledgerService = new TokenLedgerService();

    // เพิ่มหรือลบ Token
    if (amount > 0) {
      // เพิ่ม Token
      const success = await ledgerService.grantTokens(
        userId,
        amount,
        TokenTransactionType.ADMIN_ADJUSTMENT,
        description || `Admin adjustment by ${session.user.email}: +${amount}`
      );

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to add tokens' },
          { status: 500 }
        );
      }
    } else if (amount < 0) {
      // ลบ Token
      const absAmount = Math.abs(amount);
      const success = await ledgerService.deductTokens(
        userId,
        absAmount,
        TokenTransactionType.ADMIN_ADJUSTMENT,
        description || `Admin adjustment by ${session.user.email}: ${amount}`
      );

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to deduct tokens' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'ปรับ Token สำเร็จ',
    });

  } catch (error) {
    console.error('Adjust tokens error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการปรับ Token',
      },
      { status: 500 }
    );
  }
}

