import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';

// หมายเหตุ: ติดตั้ง @daytonaio/sdk ก่อนใช้งาน
// npm install @daytonaio/sdk
// import { Daytona } from '@daytonaio/sdk';

interface CreatePreviewRequest {
  projectId: string;
  promptJson?: Record<string, unknown>;
  userId?: string;
}

// สร้าง sandbox และเริ่มกระบวนการ build/serve
export async function POST(req: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, promptJson, userId }: CreatePreviewRequest = await req.json();
    
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // ตรวจสอบ API Key
    const apiKey = process.env.DAYTONA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'DAYTONA_API_KEY not configured' 
      }, { status: 500 });
    }

    // ตรวจสอบโควตาการใช้งานรายวัน
    const usageToday = await getTodayUsageSeconds(userId || session.user?.id || '');
    const maxUsagePerDay = 3600; // 1 ชั่วโมง
    
    if (usageToday >= maxUsagePerDay) {
      return NextResponse.json({ 
        error: 'คุณใช้เวลาพรีวิวครบโควตาวันนี้แล้ว (1 ชั่วโมง)' 
      }, { status: 429 });
    }

    // ตรวจสอบ concurrency (จำกัดให้รันได้ 1 sandbox ต่อผู้ใช้)
    const currentCount = await getUserRunningSandboxCount(userId || session.user?.id || '');
    if (currentCount >= 1) {
      return NextResponse.json({ 
        error: 'คุณมี sandbox ที่กำลังรันอยู่แล้ว กรุณาหยุดก่อนเริ่มใหม่' 
      }, { status: 429 });
    }

    // เริ่มสร้าง sandbox
    const sandboxId = await createDaytonaSandbox(projectId, promptJson);
    
    // บันทึกสถานะ sandbox
    await saveSandboxState({
      sandboxId,
      userId: userId || session.user?.id || '',
      projectId,
      status: 'creating',
      createdAt: Date.now(),
      lastHeartbeatAt: Date.now(),
    });

    // เพิ่มจำนวน running sandbox
    await incrementUserSandboxCount(userId || session.user?.id || '');

    return NextResponse.json({
      sandboxId,
      status: 'creating',
      logs: [`เริ่มสร้าง sandbox สำหรับโปรเจกต์ ${projectId}`],
    });

  } catch (error: any) {
    console.error('Create preview error:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 });
  }
}

// ฟังก์ชันสร้าง sandbox (ตัวอย่าง - ต้องติดตั้ง SDK จริง)
async function createDaytonaSandbox(
  projectId: string, 
  promptJson?: Record<string, unknown>
): Promise<string> {
  try {
    // TODO: แทนที่ด้วยการเรียก Daytona SDK จริง
    // const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });
    // const sandbox = await daytona.create({ language: 'typescript' });
    // return sandbox.id;
    
    // Mock สำหรับทดสอบ
    const mockSandboxId = `sb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    // จำลองการ setup และ build ใน sandbox
    setTimeout(async () => {
      try {
        await updateSandboxStatus(mockSandboxId, 'building');
        
        // จำลองการ build (รอ 30 วินาที)
        setTimeout(async () => {
          const previewUrl = `https://preview-${mockSandboxId}.daytona.example.com`;
          await updateSandboxStatus(mockSandboxId, 'running', previewUrl);
        }, 30000);
        
      } catch (error) {
        await updateSandboxStatus(mockSandboxId, 'error', undefined, 'Mock build failed');
      }
    }, 2000);
    
    return mockSandboxId;
    
  } catch (error) {
    throw new Error(`Failed to create sandbox: ${error}`);
  }
}

// ฟังก์ชันจัดการสถานะ sandbox (ต้องเชื่อมกับ database/Redis จริง)
async function saveSandboxState(state: any) {
  // TODO: บันทึกลง database/Redis
  console.log('Saving sandbox state:', state);
}

async function updateSandboxStatus(
  sandboxId: string, 
  status: string, 
  previewUrl?: string,
  error?: string
) {
  // TODO: อัปเดตสถานะใน database/Redis
  console.log('Updating sandbox status:', { sandboxId, status, previewUrl, error });
}

async function getTodayUsageSeconds(userId: string): Promise<number> {
  // TODO: อ่านจาก database/Redis
  // SELECT SUM(duration_seconds) FROM sandbox_usage 
  // WHERE user_id = ? AND DATE(created_at) = CURDATE()
  return 0; // Mock
}

async function getUserRunningSandboxCount(userId: string): Promise<number> {
  // TODO: นับจาก database/Redis
  // SELECT COUNT(*) FROM sandbox_states 
  // WHERE user_id = ? AND status IN ('creating', 'building', 'running')
  return 0; // Mock
}

async function incrementUserSandboxCount(userId: string) {
  // TODO: เพิ่มจำนวนใน memory/Redis counter
  console.log('Incrementing sandbox count for user:', userId);
}
