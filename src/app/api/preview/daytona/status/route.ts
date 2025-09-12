import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/libs/auth/session';

// ตรวจสอบสถานะ sandbox
export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sandboxId = searchParams.get('sandboxId');
    
    if (!sandboxId) {
      return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 });
    }

    // ตรวจสอบสถานะจาก database/storage
    const sandboxState = await getSandboxState(sandboxId);
    if (!sandboxState) {
      return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (sandboxState.userId !== session.user?.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // อัปเดต heartbeat
    await updateHeartbeat(sandboxId);

    // ตรวจสอบสถานะล่าสุดจาก Daytona (ถ้าจำเป็น)
    let actualStatus = sandboxState.status;
    let previewUrl = sandboxState.previewUrl;
    let logs = sandboxState.logs || [];

    if (sandboxState.status === 'building' || sandboxState.status === 'creating') {
      // ตรวจสอบสถานะจริงจาก Daytona API
      const latestState = await checkDaytonaSandboxStatus(sandboxId);
      if (latestState) {
        actualStatus = latestState.status;
        previewUrl = latestState.previewUrl;
        logs = [...logs, ...(latestState.logs || [])];
        
        // อัปเดตสถานะในฐานข้อมูล
        await updateSandboxStatus(sandboxId, actualStatus, previewUrl, logs);
      }
    }

    return NextResponse.json({
      sandboxId,
      status: actualStatus,
      previewUrl,
      logs,
      createdAt: sandboxState.createdAt,
      lastHeartbeatAt: sandboxState.lastHeartbeatAt,
    });

  } catch (error: any) {
    console.error('Get status error:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 });
  }
}

// ฟังก์ชันตรวจสอบสถานะจาก Daytona (ต้องใช้ SDK จริง)
async function checkDaytonaSandboxStatus(sandboxId: string) {
  try {
    // TODO: แทนที่ด้วยการเรียก Daytona SDK จริง
    // const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY! });
    // const sandbox = await daytona.get(sandboxId);
    // return {
    //   status: sandbox.status,
    //   previewUrl: sandbox.previewUrl,
    //   logs: sandbox.logs
    // };
    
    // Mock สำหรับทดสอบ
    if (sandboxId.includes('_')) {
      const timestamp = parseInt(sandboxId.split('_')[1]);
      const elapsed = Date.now() - timestamp;
      
      if (elapsed > 30000) { // มากกว่า 30 วินาที
        return {
          status: 'running',
          previewUrl: `https://preview-${sandboxId}.daytona.example.com`,
          logs: ['Build completed successfully', 'Server started on port 3000']
        };
      }
    }
    
    return null; // ยังไม่เสร็จ
    
  } catch (error) {
    console.error('Failed to check sandbox status:', error);
    return {
      status: 'error',
      error: `Failed to check status: ${error}`
    };
  }
}

// ฟังก์ชันจัดการข้อมูล (ต้องเชื่อมกับ database/Redis จริง)
async function getSandboxState(sandboxId: string) {
  // TODO: อ่านจาก database/Redis
  // SELECT * FROM sandbox_states WHERE sandbox_id = ?
  
  // Mock data
  if (sandboxId.startsWith('sb_')) {
    const timestamp = parseInt(sandboxId.split('_')[1]);
    const elapsed = Date.now() - timestamp;
    
    let status = 'creating';
    if (elapsed > 5000) status = 'building';
    if (elapsed > 30000) status = 'running';
    
    return {
      sandboxId,
      userId: 'mock-user-id',
      projectId: 'mock-project',
      status,
      createdAt: timestamp,
      lastHeartbeatAt: Date.now(),
      previewUrl: elapsed > 30000 ? `https://preview-${sandboxId}.daytona.example.com` : undefined,
      logs: ['Sandbox created', 'Installing dependencies...']
    };
  }
  
  return null;
}

async function updateHeartbeat(sandboxId: string) {
  // TODO: อัปเดต last_heartbeat_at ใน database/Redis
  // UPDATE sandbox_states SET last_heartbeat_at = NOW() WHERE sandbox_id = ?
  console.log('Updating heartbeat for:', sandboxId);
}

async function updateSandboxStatus(
  sandboxId: string, 
  status: string, 
  previewUrl?: string, 
  logs?: string[]
) {
  // TODO: อัปเดตสถานะใน database/Redis
  // UPDATE sandbox_states SET status = ?, preview_url = ?, logs = ? WHERE sandbox_id = ?
  console.log('Updating sandbox status:', { sandboxId, status, previewUrl, logs });
}
