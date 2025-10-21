import { NextRequest, NextResponse } from "next/server";
import { DailyResetService } from "@/libs/billing/dailyResetService";

/**
 * API endpoint สำหรับรีเซ็ต Token ทุก 0.00 น.
 * ควรเรียกจาก cron job หรือ scheduled task
 */
export async function POST(request: NextRequest) {
  try {
    const dailyResetService = new DailyResetService();
    
    // ตรวจสอบว่าต้องรีเซ็ตหรือไม่
    const shouldReset = await dailyResetService.shouldResetTokens();
    
    if (!shouldReset) {
      return NextResponse.json({
        success: true,
        message: "ไม่จำเป็นต้องรีเซ็ต Token ในขณะนี้",
        resetCount: 0
      });
    }

    // รีเซ็ต Token สำหรับผู้ใช้ทั้งหมด
    const result = await dailyResetService.resetAllUsersTokens();

    return NextResponse.json(result);

  } catch (error) {
    console.error("Daily reset API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการรีเซ็ต Token",
        resetCount: 0
      },
      { status: 500 }
    );
  }
}

/**
 * ตรวจสอบสถานะการรีเซ็ต
 */
export async function GET() {
  try {
    const dailyResetService = new DailyResetService();
    const shouldReset = await dailyResetService.shouldResetTokens();

    return NextResponse.json({
      shouldReset,
      message: shouldReset 
        ? "มีผู้ใช้ที่ต้องรีเซ็ต Token" 
        : "ไม่จำเป็นต้องรีเซ็ต Token"
    });

  } catch (error) {
    console.error("Check reset status error:", error);
    return NextResponse.json(
      {
        shouldReset: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ"
      },
      { status: 500 }
    );
  }
}
