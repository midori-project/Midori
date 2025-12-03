import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { otpService } from '@/libs/auth/otpService'

// Request validation schema
const VerifyOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
    token: z.string().length(6, 'OTP must be 6 digits'),
    type: z.enum(['signup', 'login', 'recovery'], {
        errorMap: () => ({ message: 'Type must be signup, login, or recovery' }),
    }),
})

/**
 * POST /api/auth/verify-otp
 * ตรวจสอบ OTP code
 */
export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const validation = VerifyOTPSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: validation.error.flatten().fieldErrors,
                },
                { status: 400 }
            )
        }

        const { email, token, type } = validation.data

        // Verify OTP via OTP service
        const result = await otpService.verifyOTP(email, token, type)

        if (!result.success || !result.verified) {
            return NextResponse.json(
                {
                    success: false,
                    verified: false,
                    error: result.error || 'Invalid or expired OTP',
                },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            verified: true,
            supabaseUserId: result.supabaseUserId,
        })
    } catch (error) {
        console.error('Verify OTP error:', error)
        return NextResponse.json(
            {
                success: false,
                verified: false,
                error: 'An error occurred while verifying OTP',
            },
            { status: 500 }
        )
    }
}

/**
 * GET /api/auth/verify-otp
 * Method not allowed
 */
export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: 'Method not allowed. Use POST to verify OTP.',
        },
        { status: 405 }
    )
}
