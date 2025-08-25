// lib/auth/session.ts
import { cookies, headers } from "next/headers";
import { prisma } from "@/libs/prisma/prisma";

// Types
export interface Session {
  id: string;
  userId: string;
  sessionTokenHash: string;
  ip?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  terminatedAt?: Date | null;
  lastActiveAt?: Date | null;
  createdAt: Date;
  user?: {
    id: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface CreateSessionResult {
  token: string;
}

// Configuration
const sessionConfig = {
  cookieName:
    process.env.NODE_ENV === "production" ? "__Host-session" : "midori-session",
  absoluteTtlDays: 30,
  idleTtlMinutes: 30,
} as const;

/**
 * สร้าง SHA-256 hash จาก input string (Edge Runtime compatible)
 * @param input - ข้อความที่ต้องการ hash
 * @returns SHA-256 hash เป็น hex string
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * สร้าง session token แบบสุ่ม 256-bit (Edge Runtime compatible)
 * @returns Base64URL encoded token
 */
export function generateSessionToken(): string {
  const randomBytes = new Uint8Array(32); // 256-bit
  crypto.getRandomValues(randomBytes);
  // Convert to base64url
  const base64 = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return base64;
}

/**
 * สร้าง session ใหม่และตั้งค่า cookie
 * @param userId - รหัสผู้ใช้
 * @param remember - จำ session นานขึ้นหรือไม่
 * @returns Promise ที่ resolve เป็น token object
 */
export async function createSession(
  userId: string,
  remember = false
): Promise<CreateSessionResult> {
  const token = generateSessionToken();
  const tokenHash = await sha256(token);

  const now = new Date();
  const abs = new Date(
    now.getTime() + sessionConfig.absoluteTtlDays * 24 * 60 * 60 * 1000
  );

  try {
    await prisma.session.create({
      data: {
        userId,
        sessionTokenHash: tokenHash,
        ip: await getClientIp(),
        userAgent: await getUserAgent(),
        expiresAt: abs,
      },
    });
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }

  const maxAge = remember
    ? 60 * 60 * 24 * sessionConfig.absoluteTtlDays
    : undefined;
  const cookieStore = await cookies();

  cookieStore.set(sessionConfig.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return { token };
}

/**
 * ดึงข้อมูล session ปัจจุบันจาก cookie
 * @returns Promise ที่ resolve เป็น session object หรือ null
 */
export async function getCurrentSession(): Promise<Session | null> {
  const cookieStore = await cookies();

  const cookie = cookieStore.get(sessionConfig.cookieName);

  if (!cookie?.value) {
    return null;
  }

  const tokenHash = await sha256(cookie.value);

  try {
    const session = await prisma.session.findUnique({
      where: { sessionTokenHash: tokenHash },
      include: { user: true },
    });

    if (session) {
    }

    if (!session) {
      return null;
    }

    // ตรวจสอบหมดอายุ absolute
    const now = new Date();
    const isExpired = session.expiresAt < now;
    const isTerminated = session.terminatedAt !== null;

    if (isExpired || isTerminated) {
      try {
        await prisma.session.delete({ where: { sessionTokenHash: tokenHash } });
      } catch (error) {
        console.error("Error deleting expired session:", error);
      }
      cookieStore.delete(sessionConfig.cookieName);
      return null;
    }

    // idle timeout (sliding window)
    const last = session.lastActiveAt ?? session.createdAt;
    const idleMs = sessionConfig.idleTtlMinutes * 60 * 1000;
    if (now.getTime() - last.getTime() > idleMs) {
      // timeout
      try {
        await prisma.session.delete({ where: { sessionTokenHash: tokenHash } });
      } catch (error) {
        console.error("Error deleting idle session:", error);
      }
      cookieStore.delete(sessionConfig.cookieName);
      return null;
    }

    // touch lastActiveAt (ไม่ต้องทุกครั้งก็ได้: ทำทุก N นาที)
    try {
      await prisma.session.update({
        where: { sessionTokenHash: tokenHash },
        data: {
          lastActiveAt: now,
          ip: await getClientIp(),
          userAgent: await getUserAgent(),
        },
      });
    } catch (error) {
      console.error("Error updating session activity:", error);
    }

    return session as Session;
  } catch (error) {
    console.error("❌ getCurrentSession error:", error);
    return null;
  }
}

/**
 * ยกเลิก session ปัจจุบัน
 * @returns Promise ที่ resolve เมื่อ session ถูกยกเลิก
 */
export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(sessionConfig.cookieName);
  if (!cookie?.value) return;

  const tokenHash = await sha256(cookie.value);

  try {
    await prisma.session.updateMany({
      where: { sessionTokenHash: tokenHash, terminatedAt: null },
      data: { terminatedAt: new Date() },
    });
  } catch (error) {
    console.error("Error revoking session:", error);
  }

  cookieStore.delete(sessionConfig.cookieName);
}

/**
 * ดึง IP address ของ client จาก headers
 * @returns Promise ที่ resolve เป็น IP address หรือ undefined
 */
async function getClientIp(): Promise<string | undefined> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? undefined;
}

/**
 * ดึง User-Agent จาก headers
 * @returns Promise ที่ resolve เป็น user agent string หรือ undefined
 */
async function getUserAgent(): Promise<string | undefined> {
  const h = await headers();
  return h.get("user-agent") ?? undefined;
}
