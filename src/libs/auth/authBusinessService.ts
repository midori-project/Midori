import { prisma } from '@/libs/prisma/prisma';
import { createSession } from '@/libs/auth/session';
import bcrypt from 'bcryptjs';

// Types for auth business service
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UserWithSession extends User {
  createdAt: Date;
  lastLoginAt: Date | null;
}

/**
 * Auth Business Service - Pure business logic ไม่มี HTTP calls
 * ใช้สำหรับ internal calls จาก Server Actions
 */
export class AuthBusinessService {
  /**
   * เข้าสู่ระบบด้วย email และ password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const { email, password, remember = false } = credentials;

    // ดึงข้อมูลผู้ใช้พร้อม credentials
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        authCredentials: {
          where: { 
            type: 'PASSWORD',
            identifier: email
          },
          select: {
            secret: true,
            isVerified: true
          }
        }
      }
    });

    if (!user || !user.authCredentials.length) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const credential = user.authCredentials[0];
    
    // ตรวจสอบว่าอีเมลได้รับการยืนยันแล้วหรือไม่
    if (!credential.isVerified) {
      throw new Error('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
    }

    // ตรวจสอบรหัสผ่าน
    if (!credential.secret) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    
    const isPasswordValid = await bcrypt.compare(password, credential.secret);
    
    if (!isPasswordValid) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    // สร้าง session
    await createSession(user.id, remember);

    // อัปเดต last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      id: user.id,
      email: user.email || '',
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    };
  }

  /**
   * ลงทะเบียนผู้ใช้ใหม่
   */
  async register(data: RegisterData): Promise<User> {
    const { name, email, password } = data;

    // ตรวจสอบว่ามี user ที่ใช้ email นี้แล้วหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 12);

    // สร้างผู้ใช้ใหม่พร้อม credentials
    const user = await prisma.user.create({
      data: {
        email,
        displayName: name,
        authCredentials: {
          create: {
            type: 'PASSWORD',
            identifier: email,
            secret: hashedPassword,
            isVerified: false // ต้องยืนยันอีเมลก่อน
          }
        }
      }
    });

    // TODO: ส่งอีเมลยืนยัน

    return {
      id: user.id,
      email: user.email || '',
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    };
  }

  /**
   * ดึงข้อมูลผู้ใช้จาก ID
   */
  async getUserById(userId: string): Promise<UserWithSession | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user || !user.email) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  /**
   * ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    return !!user;
  }

  /**
   * อัปเดตข้อมูลผู้ใช้
   */
  async updateUser(userId: string, data: {
    displayName?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true
      }
    });

    if (!updatedUser.email) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      avatarUrl: updatedUser.avatarUrl
    };
  }
  /**
   * ออกจากระบบ (logout)
   */
  async logout(): Promise<void> {
    // ใช้ session service สำหรับจัดการ session
    const { revokeCurrentSession } = await import('@/libs/auth/session');
    await revokeCurrentSession();
  }
}

// Export singleton instance
export const authBusinessService = new AuthBusinessService();
