import { NextRequest, NextResponse } from 'next/server';
import { Daytona } from '@daytonaio/sdk';
import { daytonaConfig, validateDaytonaConfig } from '@/config/daytona';

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

interface CreatePreviewRequest {
  // Empty interface - no parameters needed
}

// สร้าง sandbox และเริ่มกระบวนการ build/serve
export async function POST(req: NextRequest) {
  try {

    // ตรวจสอบ Daytona configuration
    const configValidation = validateDaytonaConfig();
    console.log('Daytona config validation:', configValidation);
    
    if (!configValidation.isValid) {
      console.error('Daytona config error:', configValidation.error);
      return NextResponse.json({ 
        error: configValidation.error 
      }, { status: 500 });
    }


    // เริ่มสร้าง sandbox
    const result = await createDaytonaSandbox();
    
    // บันทึกสถานะ sandbox
    await saveSandboxState({
      sandboxId: result.sandboxId,
      status: result.status,
      createdAt: Date.now(),
      lastHeartbeatAt: Date.now(),
    });

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });

  } catch (error: any) {
    console.error('Create preview error:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Unexpected error' 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
}

// ฟังก์ชันสร้าง sandbox ด้วย Daytona SDK จริง
async function createDaytonaSandbox(): Promise<{ sandboxId: string; url?: string; token?: string; status: string }> {
  try {
    // สร้าง Daytona client
    console.log('Creating Daytona client with config:', {
      apiKey: daytonaConfig.apiKey ? '***' + daytonaConfig.apiKey.slice(-4) : 'undefined',
      baseUrl: daytonaConfig.baseUrl
    });
    
    const daytona = new Daytona({ 
      apiKey: daytonaConfig.apiKey! 
    });
    
    console.log('Daytona client created successfully');

    // สร้าง sandbox สำหรับโปรเจ็ค React/TypeScript
    console.log('Creating sandbox with config:', daytonaConfig.defaultSandboxConfig);
    
    const sandbox = await daytona.create({
      ...daytonaConfig.defaultSandboxConfig,
    });

    const sandboxId = sandbox.id;
    console.log('Sandbox created successfully with ID:', sandboxId);
    
    // บันทึกสถานะเริ่มต้น
    await updateSandboxStatus(sandboxId, 'building');
    
    // เริ่ม build process
    const buildResult = await buildProject(sandbox);
    
    return buildResult || {
      sandboxId,
      status: 'created',
    };
    
  } catch (error) {
    console.error('Daytona sandbox creation error:', error);
    throw new Error(`Failed to create sandbox: ${error}`);
  }
}


// Build โปรเจ็ค
async function buildProject(sandbox: any): Promise<{ sandboxId: string; url?: string; token?: string; status: string } | null> {
  try {
    // สร้างโปรเจกต์ Vite ก่อน
    console.log('Creating Vite project...');
    try {
      const createSessionId = 'create-project';
      await sandbox.process.createSession(createSessionId);
      
      // สร้างโปรเจกต์ Vite React TypeScript
      const createResponse = await sandbox.process.executeSessionCommand(createSessionId, {
        command: 'npm create vite@latest app -- --template react-ts -y',
        runAsync: false
      });
      
      console.log('Create project response:', JSON.stringify(createResponse, null, 2));
      
      if (createResponse.exitCode !== 0) {
        throw new Error(`Failed to create Vite project: ${createResponse.stderr || createResponse.stdout}`);
      }
      
      // ติดตั้ง dependencies
      console.log('Installing dependencies...');
      const installResponse = await sandbox.process.executeSessionCommand(createSessionId, {
        command: 'cd app && npm install',
        runAsync: false
      });
      
      console.log('Install dependencies response:', JSON.stringify(installResponse, null, 2));
      
      if (installResponse.exitCode !== 0) {
        throw new Error(`Failed to install dependencies: ${installResponse.stderr || installResponse.stdout}`);
      }
      
      console.log('Vite project created and dependencies installed successfully');
    } catch (error) {
      console.error('Project creation error:', error);
      throw new Error(`Failed to create Vite project: ${error}`);
    }

    // เริ่ม Vite dev server
    console.log('Starting Vite dev server...');
    try {
      // ใช้ session สำหรับรัน Vite
      const sessionId = 'vite-server';
      await sandbox.process.createSession(sessionId);
      console.log('Session created:', sessionId);
      
      // รัน Vite dev server จากโฟลเดอร์ app
      const serverResponse = await sandbox.process.executeSessionCommand(sessionId, {
        command: 'cd app && npm run dev -- --host 0.0.0.0 --port 5173',
        runAsync: true // ให้รันต่อเนื่อง
      });
      
      console.log('Vite server response structure:', JSON.stringify(serverResponse, null, 2));
      console.log('Vite server start response:', serverResponse);
    } catch (error) {
      console.error('Vite server start error:', error);
      // ไม่ throw error เพราะ server อาจจะรันในพื้นหลัง
    }
    
    // รอให้ Vite server เริ่มต้น (เพิ่มเวลาเพราะต้องสร้างโปรเจกต์ก่อน)
    console.log('Waiting for Vite server to start...');
    await new Promise(resolve => setTimeout(resolve, 30000)); // รอ 30 วินาที (สร้างโปรเจกต์ + ติดตั้ง dependencies + เริ่ม server)
    
    // ตรวจสอบสถานะ Vite server
    console.log('Checking Vite server status...');
    try {
      // ใช้ session สำหรับตรวจสอบสถานะ
      const statusSessionId = 'status-session';
      await sandbox.process.createSession(statusSessionId);
      
      // ตรวจสอบ port 5173
      const statusResponse = await sandbox.process.executeSessionCommand(statusSessionId, {
        command: 'ss -lntp | grep :5173 || netstat -tlnp | grep :5173 || echo "Port 5173 not in use"',
        runAsync: false
      });
      console.log('Status response structure:', JSON.stringify(statusResponse, null, 2));
      console.log('Vite server status check:', statusResponse);
      
      // ตรวจสอบการตอบสนองของเซิร์ฟเวอร์
      const curlResponse = await sandbox.process.executeSessionCommand(statusSessionId, {
        command: 'curl -I http://localhost:5173 || echo "Vite server not responding"',
        runAsync: false
      });
      console.log('Curl response structure:', JSON.stringify(curlResponse, null, 2));
      console.log('Vite server response check:', curlResponse);
      
      // ตรวจสอบ exitCode แทนการค้นหา string
      if (curlResponse && typeof curlResponse === 'object' && curlResponse.exitCode === 0) {
        console.log('Vite server is running and responding');
      } else {
        console.log('Vite server is not responding properly');
      }
    } catch (error) {
      console.log('Status check error:', error);
    }

    // ดึง preview URL และ token จาก sandbox
    try {
      console.log('Getting preview URL...');
      const previewInfo = await sandbox.getPreviewLink(5173);
      
      // Debug preview info structure
      console.log('Preview info structure:', JSON.stringify(previewInfo, null, 2));
      console.log('Preview URL:', previewInfo.url);
      console.log('Preview Token:', previewInfo.token);
      
      // อัปเดตสถานะเป็น running พร้อม preview URL
      await updateSandboxStatus(sandbox.id, 'running', previewInfo.url, undefined, previewInfo.token);
      
      // คืนค่า preview URL และ token กลับไป
      return {
        sandboxId: sandbox.id,
        url: previewInfo.url,
        token: previewInfo.token,
        status: 'running'
      };
    } catch (error) {
      console.error('Failed to get preview URL:', error);
      // ถ้าไม่สามารถดึง preview URL ได้ ให้คืนค่า sandbox ID กลับไป
      await updateSandboxStatus(sandbox.id, 'created', undefined, undefined, undefined);
      
      return {
        sandboxId: sandbox.id,
        status: 'created'
      };
    }
    
  } catch (error) {
    console.error('Build error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown build error';
    await updateSandboxStatus(sandbox.id, 'error', undefined, errorMessage);
    return null;
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
  error?: string,
  previewToken?: string
) {
  // TODO: อัปเดตสถานะใน database/Redis
  console.log('Updating sandbox status:', { 
    sandboxId, 
    status, 
    previewUrl, 
    error, 
    previewToken 
  });
}

