import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/libs/auth/session";
import { TokenLedgerService } from "@/libs/billing/tokenLedgerService";

/**
 * API endpoint สำหรับดึงประวัติ Token transactions
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const ledgerService = new TokenLedgerService();
    const transactions = await ledgerService.getTransactionHistory(
      session.user.id,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงประวัติ Token"
      },
      { status: 500 }
    );
  }
}
