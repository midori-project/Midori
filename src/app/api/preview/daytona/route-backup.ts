import { NextRequest, NextResponse } from 'next/server';
import { Daytona } from '@daytonaio/sdk';
import { daytonaConfig, validateDaytonaConfig } from '@/config/daytona';
import testCafeData from '@/components/preview/test/test-cafe.json';

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
  projectId?: string;
  promptJson?: Record<string, unknown>;
  userId?: string;
}

// Interface สำหรับไฟล์
interface ProjectFile {
  path: string;
  content: string;
  type?: string;
  language?: string;
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

// ✅ ฟังก์ชันจัดการไฟล์ที่ปรับปรุงแล้ว
async function createProjectFiles(sandbox: any, files: ProjectFile[]) {
  try {
    console.log('Creating project files from test-cafe.json...');
    console.log(`Total files to create: ${files.length}`);
    
    // จัดกลุ่มไฟล์ตามประเภท
    const fileGroups = groupFilesByType(files);
    console.log('File groups:', Object.keys(fileGroups));
    
    // สร้าง session เดียวสำหรับการสร้างไฟล์ทั้งหมด
    const fileSessionId = 'project-files-session';
    await sandbox.process.createSession(fileSessionId);
    
    // สร้างไฟล์ทีละกลุ่ม
    for (const [fileType, fileList] of Object.entries(fileGroups)) {
      console.log(`Creating ${fileType} files (${fileList.length} files)...`);
      
      for (const file of fileList) {
        try {
          await createSingleFile(sandbox, fileSessionId, file);
          // เพิ่ม delay เล็กน้อยระหว่างไฟล์
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to create ${file.path}, retrying...`);
          // ลองใหม่อีกครั้ง
          await new Promise(resolve => setTimeout(resolve, 1000));
          await createSingleFile(sandbox, fileSessionId, file);
        }
      }
    }
    
    // ตรวจสอบไฟล์ที่สร้างแล้ว
    await verifyFilesCreated(sandbox, fileSessionId, files);
    
    console.log('All project files created successfully');
  } catch (error) {
    console.error('Error creating project files:', error);
    throw error;
  }
}

// จัดกลุ่มไฟล์ตามประเภท
function groupFilesByType(files: ProjectFile[]): Record<string, ProjectFile[]> {
  const groups: Record<string, ProjectFile[]> = {
    config: [],
    pages: [],
    components: [],
    styles: [],
    assets: [],
    other: []
  };
  
  for (const file of files) {
    const path = file.path.toLowerCase();
    
    if (path.includes('package.json') || path.includes('tsconfig') || path.includes('vite.config')) {
      groups.config.push(file);
    } else if (path.includes('/pages/') || path.includes('page')) {
      groups.pages.push(file);
    } else if (path.includes('/components/') || path.includes('component')) {
      groups.components.push(file);
    } else if (path.includes('.css') || path.includes('.scss') || path.includes('.sass')) {
      groups.styles.push(file);
    } else if (path.includes('/assets/') || path.includes('/public/') || path.includes('.png') || path.includes('.jpg')) {
      groups.assets.push(file);
    } else {
      groups.other.push(file);
    }
  }
  
  return groups;
}

// สร้างไฟล์เดียว
async function createSingleFile(sandbox: any, sessionId: string, file: ProjectFile) {
  try {
    // สร้างโฟลเดอร์ก่อน (ถ้าจำเป็น)
    const dirPath = file.path.substring(0, file.path.lastIndexOf('/'));
    if (dirPath) {
      const mkdirCommand = `mkdir -p "${dirPath}"`;
      await sandbox.process.executeSessionCommand(sessionId, {
        command: mkdirCommand,
        runAsync: false
      });
    }
    
    // สร้างไฟล์
    const createFileCommand = `cat > '${file.path}' << 'EOF'\n${file.content}\nEOF`;
    
    // ใช้ shell timeout แทน API timeout เพื่อความเสถียร
    const timeoutCommand = `timeout 30s ${createFileCommand}`;
    const response = await sandbox.process.executeSessionCommand(sessionId, {
      command: timeoutCommand,
      runAsync: false
    });
    
    // Debug response
    console.log(`Creating file: ${file.path} (${file.type || 'unknown'})`);
    
    if (response.exitCode !== 0) {
      console.error(`Failed to create file ${file.path}:`, response.stderr || response.output);
      throw new Error(`Failed to create file ${file.path}: ${response.stderr || response.output}`);
    } else {
      console.log(`✅ Successfully created file: ${file.path}`);
    }
  } catch (error: any) {
    console.error(`Error creating file ${file.path}:`, error.message);
    
    // ตรวจสอบว่าเป็น timeout error หรือไม่
    if (error.message.includes('504') || error.message.includes('timeout')) {
      throw new Error(`Timeout creating file ${file.path}. Please try again.`);
    }
    
    throw error;
  }
}

// ตรวจสอบไฟล์ที่สร้างแล้ว
async function verifyFilesCreated(sandbox: any, sessionId: string, files: ProjectFile[]) {
  try {
    console.log('Verifying created files...');
    
    // ตรวจสอบไฟล์สำคัญ
    const importantFiles = files.filter(f => 
      f.path.includes('package.json') || 
      f.path.includes('index.html') || 
      f.path.includes('main.tsx') ||
      f.path.includes('App.tsx')
    );
    
    for (const file of importantFiles) {
      const verifyCommand = `test -f '${file.path}' && echo "File exists: ${file.path}" || echo "File missing: ${file.path}"`;
      const response = await sandbox.process.executeSessionCommand(sessionId, {
        command: verifyCommand,
        runAsync: false
      });
      
      console.log(`File verification: ${file.path} - ${response.stdout || response.stderr}`);
    }
    
    // แสดงโครงสร้างโฟลเดอร์
    const treeCommand = 'find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.html" | head -20';
    const treeResponse = await sandbox.process.executeSessionCommand(sessionId, {
      command: treeCommand,
      runAsync: false
    });
    
    console.log('Project structure:', treeResponse.stdout);
  } catch (error) {
    console.error('Error verifying files:', error);
  }
}

// Build โปรเจ็ค
async function buildProject(sandbox: any): Promise<{ sandboxId: string; url?: string; token?: string; status: string } | null> {
  try {
    // ✅ สร้างไฟล์โปรเจ็คจาก test-cafe.json แทนการสร้าง Vite ใหม่
    console.log('Creating project files from test-cafe.json...');
    if (testCafeData.files && Array.isArray(testCafeData.files)) {
      await createProjectFiles(sandbox, testCafeData.files);
    } else {
      throw new Error('No files found in test-cafe.json');
    }

    // ตรวจสอบว่าไฟล์โปรเจ็คถูกสร้างแล้วหรือไม่
    console.log('Checking project files...');
    try {
      const checkSessionId = 'check-session';
      await sandbox.process.createSession(checkSessionId);
      
      const checkResponse = await sandbox.process.executeSessionCommand(checkSessionId, {
        command: 'ls -la && pwd && cat package.json 2>/dev/null || echo "No package.json found"',
        runAsync: false
      });
      
      console.log('Project files check:', JSON.stringify(checkResponse, null, 2));
    } catch (error) {
      console.log('Project files check error:', error);
    }

    // ติดตั้ง dependencies
    console.log('Installing dependencies...');
    try {
      const installSessionId = 'install-session';
      await sandbox.process.createSession(installSessionId);
      
      const installResponse = await sandbox.process.executeSessionCommand(installSessionId, {
        command: 'npm install',
        runAsync: false
      });
      
      console.log('Install response structure:', JSON.stringify(installResponse, null, 2));
      
      if (installResponse.exitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installResponse.exitCode}: ${installResponse.stderr || installResponse.stdout}`);
      }
      
      console.log('Dependencies installed successfully');
    } catch (error) {
      console.error('Install error:', error);
      throw new Error(`Failed to install dependencies: ${error}`);
    }

    // ข้าม build สำหรับ dev preview เพื่อให้เร็วและเสถียรขึ้น
    console.log('⏭️ Skipping build step for dev preview - using npm run dev directly');

    // เริ่ม dev server
    console.log('Starting dev server...');
    try {
      const sessionId = 'dev';
      await sandbox.process.createSession(sessionId);
      console.log('Session created:', sessionId);
      
      // รัน dev server ใน session
      const devResponse = await sandbox.process.executeSessionCommand(sessionId, {
        command: 'bash -lc "npm run dev -- --host 0.0.0.0 --port 5173"',
        runAsync: true // ให้รันต่อเนื่อง
      });
      
      console.log('Dev server response structure:', JSON.stringify(devResponse, null, 2));
      console.log('Dev server start response:', devResponse);
    } catch (error) {
      console.error('Dev server start error:', error);
      // ไม่ throw error เพราะ dev server อาจจะรันในพื้นหลัง
    }
    
    // รอให้ dev server เริ่มต้น
    console.log('Waiting for dev server to start...');
    await new Promise(resolve => setTimeout(resolve, 15000)); // รอ 15 วินาที
    
    // ตรวจสอบสถานะ dev server
    console.log('Checking dev server status...');
    try {
      const statusSessionId = 'status-session';
      await sandbox.process.createSession(statusSessionId);
      
      // ตรวจสอบ port 5173
      const statusResponse = await sandbox.process.executeSessionCommand(statusSessionId, {
        command: 'ss -lntp | grep :5173 || netstat -tlnp | grep :5173 || echo "Port 5173 not in use"',
        runAsync: false
      });
      console.log('Status response structure:', JSON.stringify(statusResponse, null, 2));
      console.log('Dev server status check:', statusResponse);
      
      // ตรวจสอบการตอบสนองของเซิร์ฟเวอร์
      const curlResponse = await sandbox.process.executeSessionCommand(statusSessionId, {
        command: 'curl -I http://localhost:5173 || echo "Server not responding"',
        runAsync: false
      });
      console.log('Curl response structure:', JSON.stringify(curlResponse, null, 2));
      console.log('Server response check:', curlResponse);
      
      if (curlResponse && typeof curlResponse === 'object' && curlResponse.exitCode === 0) {
        console.log('Server is running and responding');
      } else {
        console.log('Server is not responding properly');
      }
    } catch (error) {
      console.log('Status check error:', error);
    }

    // ดึง preview URL และ token จาก sandbox
    let previewInfo = null;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting to get preview URL (attempt ${retryCount + 1}/${maxRetries})...`);
        previewInfo = await sandbox.getPreviewLink(5173);
        
        console.log('Preview info structure:', JSON.stringify(previewInfo, null, 2));
        console.log('Preview URL:', previewInfo.url);
        console.log('Preview Token:', previewInfo.token);
        break;
      } catch (error) {
        console.error(`Failed to get preview URL (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Waiting 10 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    }
    
    if (previewInfo) {
      // อัปเดตสถานะเป็น running พร้อม preview URL
      await updateSandboxStatus(sandbox.id, 'running', previewInfo.url, undefined, previewInfo.token);
      
      return {
        sandboxId: sandbox.id,
        url: previewInfo.url,
        token: previewInfo.token,
        status: 'running'
      };
    } else {
      throw new Error('Failed to get preview URL after multiple attempts');
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