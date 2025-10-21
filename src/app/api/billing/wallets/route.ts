import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/libs/auth/session";
import { TokenWalletService } from "@/libs/billing/tokenWalletService";

/**
 * API endpoint สำหรับจัดการ TokenWallet
 */
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const walletService = new TokenWalletService();
    const summary = await walletService.getUserTokenSummary(session.user.id);

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error("Get wallets error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล wallets"
      },
      { status: 500 }
    );
  }
}

/**
 * สร้าง wallet ใหม่
 */
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { walletType, initialTokens, expiresAt } = body;

    const walletService = new TokenWalletService();
    const wallet = await walletService.createWallet(
      session.user.id,
      walletType || 'STANDARD',
      initialTokens || 5,
      expiresAt ? new Date(expiresAt) : undefined
    );

    return NextResponse.json({
      success: true,
      data: wallet
    });

  } catch (error) {
    console.error("Create wallet error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการสร้าง wallet"
      },
      { status: 500 }
    );
  }
}
