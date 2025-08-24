// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // ให้ TypeScript รู้ว่าเราจะ cache prisma ไว้ใน global ระหว่าง dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// สร้าง client เดียว (singleton)
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['warn', 'error'], // จะเพิ่ม 'query' เฉพาะตอนดีบักก็ได้
  });

// ใน dev ให้ cache ไว้เพื่อเลี่ยงการสร้าง client ใหม่ทุกครั้งที่ HMR
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
