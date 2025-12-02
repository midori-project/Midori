#!/usr/bin/env node

import { config } from 'dotenv';
import { resolve } from 'path';
import { NgrokManager } from './ngrok-sdk';

// โหลด environment variables จาก .env หรือ .env.local
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') }); // ถ้ามี .env.local จะ override .env

/**
 * Script สำหรับรัน ngrok SDK แบบ standalone
 * Usage: ts-node scripts/ngrok-standalone.ts [port]
 */

async function main() {
  const port = parseInt(process.argv[2] || '3000', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ Port ไม่ถูกต้อง กรุณาระบุ port ที่ถูกต้อง (1-65535)');
    process.exit(1);
  }

  const manager = new NgrokManager();

  try {
    // เริ่ม tunnel
    await manager.connect({
      port,
      authtoken: process.env.NGROK_AUTHTOKEN,
    });

    // จัดการ graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⏹️  กำลังปิด ngrok tunnel...');
      await manager.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n⏹️  กำลังปิด ngrok tunnel...');
      await manager.disconnect();
      process.exit(0);
    });

    // เก็บ process ไว้ให้ทำงาน
    console.log('📝 กด Ctrl+C เพื่อปิด tunnel');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ เกิดข้อผิดพลาด:', error);
  process.exit(1);
});

