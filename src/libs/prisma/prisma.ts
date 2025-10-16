// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // ให้ TypeScript รู้ว่าเราจะ cache prisma ไว้ใน global ระหว่าง dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaInitialized: boolean | undefined;
}

// ฟังก์ชันสร้าง PrismaClient พร้อม configuration ที่แก้ปัญหา prepared statement
function createPrismaClient() {
  // สร้าง URL พร้อม pgbouncer parameter เพื่อปิด prepared statements
  const databaseUrl = process.env.DATABASE_URL || '';
  const url = databaseUrl.includes('?') 
    ? `${databaseUrl}&pgbouncer=true`
    : `${databaseUrl}?pgbouncer=true`;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url,
      },
    },
  });
}

// สร้าง client เดียว (singleton)
export const prisma = globalThis.prisma ?? createPrismaClient();

// ใน dev ให้ cache ไว้เพื่อเลี่ยงการสร้าง client ใหม่ทุกครั้งที่ HMR
if (process.env.NODE_ENV !== 'production') {
  if (!globalThis.prismaInitialized) {
    globalThis.prisma = prisma;
    globalThis.prismaInitialized = true;
    
    console.log('✅ Prisma Client initialized with pgbouncer mode (prepared statements disabled)');
  }
}