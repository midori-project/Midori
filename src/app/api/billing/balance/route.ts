import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/libs/auth/session";
import { TokenGuardService } from "@/libs/billing/tokenGuard";

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

    const tokenGuard = new TokenGuardService();
    const tokenInfo = await tokenGuard.getTokenInfo(session.user.id);

    return NextResponse.json({
      success: true,
      data: tokenInfo
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
