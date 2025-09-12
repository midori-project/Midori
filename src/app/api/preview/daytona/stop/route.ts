import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';

interface StopPreviewRequest {
  sandboxId: string;
}

// หยุดและลบ sandbox
export async function POST(req: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sandboxId }: StopPreviewRequest = await req.json();
    
    if (!sandboxId) {
      return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 });
    }

    // ตรวจสอบว่า sandbox นี้เป็นของผู้ใช้คนนี้
    const sandboxState = await getSandboxState(sandboxId);
    if (!sandboxState) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    if (sandboxState.userId !== session.user?.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // หยุด sandbox
    await stopDaytonaSandbox(sandboxId);
    
    // คำนวณเวลาที่ใช้และบันทึก
    const usageDuration = Date.now() - sandboxState.createdAt;
    await recordUsage(session.user?.id || '', Math.floor(usageDuration / 1000));
    
    // ลบสถานะ sandbox
    await deleteSandboxState(sandboxId);
    
    // ลดจำนวน running sandbox
    await decrementUserSandboxCount(session.user?.id || '');

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('Stop preview error:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 });
  }
}

// ฟังก์ชันหยุด sandbox (ต้องใช้ Daytona SDK จริง)
async function stopDaytonaSandbox(sandboxId: string) {
  try {
    // TODO: แทนที่ด้วยการเรียก Daytona SDK จริง
    // const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });
    // await daytona.delete(sandboxId);
    
    // Mock สำหรับทดสอบ
    console.log('Stopping sandbox:', sandboxId);
    
  } catch (error) {
    throw new Error(`Failed to stop sandbox: ${error}`);
  }
}

// ฟังก์ชันจัดการข้อมูล (ต้องเชื่อมกับ database/Redis จริง)
async function getSandboxState(sandboxId: string) {
  // TODO: อ่านจาก database/Redis
  // SELECT * FROM sandbox_states WHERE sandbox_id = ?
  return {
    sandboxId,
    userId: 'mock-user-id',
    createdAt: Date.now() - 300000, // 5 นาทีที่แล้ว
    status: 'running'
  }; // Mock
}

async function deleteSandboxState(sandboxId: string) {
  // TODO: ลบจาก database/Redis
  // DELETE FROM sandbox_states WHERE sandbox_id = ?
  console.log('Deleting sandbox state:', sandboxId);
}

async function recordUsage(userId: string, durationSeconds: number) {
  // TODO: บันทึกการใช้งานลง database
  // INSERT INTO sandbox_usage (user_id, duration_seconds, date) VALUES (?, ?, CURDATE())
  console.log('Recording usage:', { userId, durationSeconds });
}

async function decrementUserSandboxCount(userId: string) {
  // TODO: ลดจำนวนใน memory/Redis counter
  console.log('Decrementing sandbox count for user:', userId);
}
