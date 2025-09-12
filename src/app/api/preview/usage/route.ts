import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';

// ดึงข้อมูลการใช้งานของผู้ใช้
export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || session.user?.id || '';
    
    // ตรวจสอบสิทธิ์ (ผู้ใช้ดูได้เฉพาะข้อมูลตัวเอง หรือมีสิทธิ์ admin)
    if (userId !== session.user?.id && !isAdmin(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ดึงข้อมูลการใช้งานรายวัน
    const usageToday = await getTodayUsageSeconds(userId);
    const maxUsagePerDay = 3600; // 1 ชั่วโมง (ควรมาจากการตั้งค่าระบบ)
    
    // ดึงข้อมูลสถิติเพิ่มเติม
    const stats = await getUserUsageStats(userId);

    return NextResponse.json({
      usageToday, // วินาที
      maxUsagePerDay, // วินาที
      usageTodayMinutes: Math.round(usageToday / 60),
      maxUsagePerDayMinutes: Math.round(maxUsagePerDay / 60),
      usagePercent: Math.round((usageToday / maxUsagePerDay) * 100),
      remainingSeconds: Math.max(0, maxUsagePerDay - usageToday),
      ...stats
    });

  } catch (error: any) {
    console.error('Get usage error:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 });
  }
}

// บันทึกการใช้งาน (เรียกจาก heartbeat หรือเมื่อหยุดพรีวิว)
export async function POST(req: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sandboxId, userId, deltaSeconds } = await req.json();
    
    if (!sandboxId || !deltaSeconds) {
      return NextResponse.json({ 
        error: 'Missing required fields: sandboxId, deltaSeconds' 
      }, { status: 400 });
    }

    const targetUserId = userId || session.user?.id || '';
    
    // ตรวจสอบสิทธิ์
    if (targetUserId !== session.user?.id && !isAdmin(session)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // ตรวจสอบว่า sandbox นี้เป็นของผู้ใช้คนนี้
    const sandboxState = await getSandboxState(sandboxId);
    if (!sandboxState || sandboxState.userId !== targetUserId) {
      return NextResponse.json({ error: 'Invalid sandbox' }, { status: 403 });
    }

    // บันทึกการใช้งาน (ป้องกันการบันทึกซ้ำด้วย idempotency)
    await recordUsageDelta(targetUserId, sandboxId, deltaSeconds);

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('Record usage error:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 });
  }
}

// ฟังก์ชันตรวจสอบสิทธิ์ admin
function isAdmin(session: any): boolean {
  // TODO: ตรวจสอบสิทธิ์จริงตามระบบของคุณ
  return session.user.role === 'admin';
}

// ฟังก์ชันจัดการข้อมูล (ต้องเชื่อมกับ database จริง)
async function getTodayUsageSeconds(userId: string): Promise<number> {
  // TODO: อ่านจาก database
  // SELECT SUM(duration_seconds) FROM sandbox_usage 
  // WHERE user_id = ? AND DATE(created_at) = CURDATE()
  
  // Mock data
  return Math.floor(Math.random() * 1800); // 0-30 นาที
}

async function getUserUsageStats(userId: string) {
  // TODO: อ่านสถิติเพิ่มเติมจาก database
  // - การใช้งาน 7 วันที่ผ่านมา
  // - จำนวน sandbox ที่สร้างทั้งหมด
  // - เวลาใช้งานเฉลี่ย
  
  return {
    totalSandboxesCreated: 5,
    avgUsagePerDay: 1200, // วินาที
    usageThisWeek: [800, 1200, 0, 900, 1800, 600, 0], // วินาทีต่อวัน (จันทร์-อาทิตย์)
    currentRunningSandboxes: 0
  };
}

async function getSandboxState(sandboxId: string) {
  // TODO: อ่านจาก database
  // Mock data
  return {
    sandboxId,
    userId: 'mock-user-id',
    status: 'running'
  };
}

async function recordUsageDelta(userId: string, sandboxId: string, deltaSeconds: number) {
  // TODO: บันทึกลง database ด้วย idempotency key
  // INSERT INTO sandbox_usage (user_id, sandbox_id, duration_seconds, recorded_at) 
  // VALUES (?, ?, ?, NOW()) 
  // ON DUPLICATE KEY UPDATE duration_seconds = duration_seconds + VALUES(duration_seconds)
  
  console.log('Recording usage delta:', { userId, sandboxId, deltaSeconds });
}
