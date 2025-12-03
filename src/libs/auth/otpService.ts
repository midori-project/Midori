import { supabase } from '@/libs/supabase/client'
import { prisma } from '@/libs/prisma/prisma'

/**
 * OTP Service
 * 
 * Wrapper สำหรับ Supabase Auth OTP operations
 * รองรับ: signup, login (2FA), recovery (password reset)
 */

export type OTPType = 'signup' | 'login' | 'recovery'

export interface SendOTPResult {
    success: boolean
    message: string
    error?: string
}

export interface VerifyOTPResult {
    success: boolean
    verified: boolean
    supabaseUserId?: string
    error?: string
}

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
    maxAttempts: 5, // จำนวนครั้งสูงสุดที่ส่ง OTP ได้
    windowMinutes: 15, // ช่วงเวลา (นาที)
    blockDurationMinutes: 30, // ระยะเวลา block (นาที)
}

export class OTPService {
    /**
     * ส่ง OTP ไปยังอีเมล
     */
    async sendOTP(email: string, type: OTPType): Promise<SendOTPResult> {
        try {
            // 1. ตรวจสอบ rate limiting
            const isBlocked = await this.checkRateLimit(email, type)
            if (isBlocked) {
                return {
                    success: false,
                    message: 'Too many attempts. Please try again later.',
                    error: 'RATE_LIMIT_EXCEEDED',
                }
            }

            // 2. ส่ง OTP ผ่าน Supabase Auth
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    // OTP จะหมดอายุใน 60 วินาที
                    shouldCreateUser: type === 'signup', // สร้าง user ใน Supabase Auth สำหรับ signup
                    data: {
                        type, // เก็บ type ไว้ใน metadata
                    },
                },
            })

            if (error) {
                console.error('Supabase OTP error:', error)
                return {
                    success: false,
                    message: 'Failed to send OTP',
                    error: error.message,
                }
            }

            // 3. บันทึก attempt
            await this.recordAttempt(email, type)

            return {
                success: true,
                message: `OTP sent to ${email}`,
            }
        } catch (error) {
            console.error('Send OTP error:', error)
            return {
                success: false,
                message: 'An error occurred while sending OTP',
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }

    /**
     * ตรวจสอบ OTP code
     */
    async verifyOTP(
        email: string,
        token: string,
        type: OTPType
    ): Promise<VerifyOTPResult> {
        try {
            // Verify OTP with Supabase
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email', // Supabase OTP type
            })

            if (error) {
                console.error('Supabase verify OTP error:', error)
                return {
                    success: false,
                    verified: false,
                    error: error.message,
                }
            }

            if (!data.user) {
                return {
                    success: false,
                    verified: false,
                    error: 'Invalid OTP',
                }
            }

            // OTP verified successfully
            // ลบ attempts ที่บันทึกไว้
            await this.clearAttempts(email, type)

            return {
                success: true,
                verified: true,
                supabaseUserId: data.user.id,
            }
        } catch (error) {
            console.error('Verify OTP error:', error)
            return {
                success: false,
                verified: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }

    /**
     * ส่ง OTP ใหม่
     */
    async resendOTP(email: string, type: OTPType): Promise<SendOTPResult> {
        // Resend ใช้ logic เดียวกับ sendOTP
        return this.sendOTP(email, type)
    }

    /**
     * ตรวจสอบ rate limiting
     * @returns true ถ้าถูก block, false ถ้าส่งได้
     */
    private async checkRateLimit(
        email: string,
        type: OTPType
    ): Promise<boolean> {
        const now = new Date()
        const windowStart = new Date(
            now.getTime() - RATE_LIMIT.windowMinutes * 60 * 1000
        )

        // ดึง attempt record
        const attempt = await prisma.oTPAttempt.findFirst({
            where: {
                email,
                type,
            },
        })

        if (!attempt) {
            return false // ไม่มี record = ส่งได้
        }

        // ตรวจสอบว่าถูก block อยู่หรือไม่
        if (attempt.blockedUntil && attempt.blockedUntil > now) {
            return true // ยังถูก block อยู่
        }

        // ตรวจสอบจำนวน attempts ใน window
        if (attempt.lastAttempt < windowStart) {
            // attempt เก่าเกินกว่า window = reset
            return false
        }

        if (attempt.attempts >= RATE_LIMIT.maxAttempts) {
            // เกินจำนวนที่กำหนด = block
            const blockUntil = new Date(
                now.getTime() + RATE_LIMIT.blockDurationMinutes * 60 * 1000
            )
            await prisma.oTPAttempt.update({
                where: { id: attempt.id },
                data: { blockedUntil: blockUntil },
            })
            return true
        }

        return false
    }

    /**
     * บันทึก attempt
     */
    private async recordAttempt(email: string, type: OTPType): Promise<void> {
        const now = new Date()
        const windowStart = new Date(
            now.getTime() - RATE_LIMIT.windowMinutes * 60 * 1000
        )

        const existingAttempt = await prisma.oTPAttempt.findFirst({
            where: { email, type },
        })

        if (!existingAttempt) {
            // สร้าง record ใหม่
            await prisma.oTPAttempt.create({
                data: {
                    email,
                    type,
                    attempts: 1,
                    lastAttempt: now,
                },
            })
        } else if (existingAttempt.lastAttempt < windowStart) {
            // Reset attempts ถ้าเกิน window
            await prisma.oTPAttempt.update({
                where: { id: existingAttempt.id },
                data: {
                    attempts: 1,
                    lastAttempt: now,
                    blockedUntil: null,
                },
            })
        } else {
            // เพิ่ม attempts
            await prisma.oTPAttempt.update({
                where: { id: existingAttempt.id },
                data: {
                    attempts: existingAttempt.attempts + 1,
                    lastAttempt: now,
                },
            })
        }
    }

    /**
     * ลบ attempts หลัง verify สำเร็จ
     */
    private async clearAttempts(email: string, type: OTPType): Promise<void> {
        await prisma.oTPAttempt.deleteMany({
            where: { email, type },
        })
    }
}

// Export singleton instance
export const otpService = new OTPService()
