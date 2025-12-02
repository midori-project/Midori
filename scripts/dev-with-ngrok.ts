#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import { spawn } from 'child_process';
import { NgrokManager } from './ngrok-sdk';

// โหลด environment variables จาก .env หรือ .env.local
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') }); // ถ้ามี .env.local จะ override .env

/**
 * Script สำหรับรัน Next.js dev server พร้อม ngrok tunnel
 * Usage: ts-node scripts/dev-with-ngrok.ts [port]
 */

async function checkPortAvailable(port: number): Promise<boolean> {
  const net = await import('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

async function waitForServer(port: number, maxAttempts = 30): Promise<boolean> {
  const http = await import('http');
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/',
            method: 'HEAD',
            timeout: 2000,
          },
          (res) => {
            resolve();
          }
        );
        
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
        
        req.end();
      });
      
      return true;
    } catch (error) {
      // Server ยังไม่พร้อม
    }
  }
  
  return false;
}

async function main() {
  const port = parseInt(process.argv[2] || '3000', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ Port ไม่ถูกต้อง กรุณาระบุ port ที่ถูกต้อง (1-65535)');
    process.exit(1);
  }

  // ตรวจสอบว่าพอร์ตว่างหรือไม่
  const portAvailable = await checkPortAvailable(port);
  if (!portAvailable) {
    console.error(`❌ พอร์ต ${port} ถูกใช้งานอยู่แล้ว`);
    console.error(`💡 วิธีแก้: ปิด process ที่ใช้พอร์ต ${port} ก่อน`);
    console.error(`   Windows: netstat -ano | findstr :${port} แล้ว kill process`);
    console.error(`   หรือใช้พอร์ตอื่น: npm run dev:ngrok 3001`);
    process.exit(1);
  }

  // ตรวจสอบ NGROK_AUTHTOKEN
  if (!process.env.NGROK_AUTHTOKEN) {
    console.error('❌ NGROK_AUTHTOKEN ไม่ถูกตั้งค่า');
    console.error('💡 วิธีแก้: เพิ่ม NGROK_AUTHTOKEN ในไฟล์ .env');
    console.error('   ตัวอย่าง: NGROK_AUTHTOKEN=your_token_here');
    process.exit(1);
  }

  const manager = new NgrokManager();

  // เริ่ม Next.js dev server
  console.log(`🚀 กำลังเริ่ม Next.js dev server ที่พอร์ต ${port}...`);
  const devServer = spawn('npm', ['run', 'dev', '--', '-p', port.toString()], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  });

  // รอให้ server เริ่มทำงาน
  console.log(`⏳ กำลังรอให้ server เริ่มทำงาน...`);
  const serverReady = await waitForServer(port);

  if (!serverReady) {
    console.error('❌ ไม่สามารถเชื่อมต่อกับ server ได้ภายในเวลาที่กำหนด');
    devServer.kill();
    process.exit(1);
  }

  // เริ่ม ngrok tunnel
  try {
    console.log(`🔗 กำลังเริ่ม ngrok tunnel...`);
    await manager.connect({
      port,
      authtoken: process.env.NGROK_AUTHTOKEN,
    });
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเริ่ม ngrok tunnel:', error);
    devServer.kill();
    process.exit(1);
  }

  // จัดการ graceful shutdown
  const shutdown = async () => {
    console.log('\n⏹️  กำลังปิด...');
    await manager.disconnect();
    devServer.kill();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // เก็บ process ไว้ให้ทำงาน
  devServer.on('exit', async (code) => {
    console.log(`\n📝 Dev server หยุดทำงาน (exit code: ${code})`);
    await manager.disconnect();
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error('❌ เกิดข้อผิดพลาด:', error);
  process.exit(1);
});

