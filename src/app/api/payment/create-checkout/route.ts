import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';
import { TOKEN_PACKAGES } from '@/libs/billing/tokenPricing';

/**
 * POST /api/payment/create-checkout
 * สร้าง payment checkout session (สำหรับ Stripe/Omise)
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

    const body = await request.json();
    const { packageId, amount, tokens, bonusTokens } = body;

    // Validate package
    const selectedPackage = TOKEN_PACKAGES.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid package' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount !== selectedPackage.priceTHB) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // TODO: Integrate with Stripe or Omise
    // For now, return a mock checkout URL
    const checkoutUrl = `/payment/process?packageId=${packageId}&userId=${session.user.id}`;

    // TODO: Save pending payment to database
    // await prisma.payment.create({
    //   data: {
    //     userId: session.user.id,
    //     packageId,
    //     amount,
    //     tokens,
    //     bonusTokens,
    //     status: 'pending'
    //   }
    // });

    return NextResponse.json({
      success: true,
      checkoutUrl,
      message: 'Payment checkout created successfully'
    });

  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในการสร้าง payment checkout'
      },
      { status: 500 }
    );
  }
}

