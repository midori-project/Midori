import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/libs/auth/session";
import { TokenWalletService } from "@/libs/billing/tokenWalletService";

/**
 * API endpoint สำหรับดึงข้อมูล Token balance
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
      data: {
        balance: summary.totalBalance,
        canCreateProject: summary.canCreateProject,
        requiredTokens: summary.requiredTokens,
        wallets: summary.wallets
      }
    });

  } catch (error) {
    console.error("Get balance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล Token"
      },
      { status: 500 }
    );
  }
}
