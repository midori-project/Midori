import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { otpService } from '@/libs/auth/otpService'

// Request validation schema
const SendOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
    type: z.enum(['signup', 'login', 'recovery'], {
        errorMap: () => ({ message: 'Type must be signup, login, or recovery' }),
    }),
})

/**
 * POST /api/auth/send-otp
 * ส่ง OTP ไปยังอีเมล
 */
export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json()
        const validation = SendOTPSchema.safeParse(body)

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

        const { email, type } = validation.data

        // Send OTP via OTP service
        const result = await otpService.sendOTP(email, type)

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.message,
                },
                { status: result.error === 'RATE_LIMIT_EXCEEDED' ? 429 : 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: result.message,
        })
    } catch (error) {
        console.error('Send OTP error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'An error occurred while sending OTP',
            },
            { status: 500 }
        )
    }
}

/**
 * GET /api/auth/send-otp
 * Method not allowed
 */
export async function GET() {
    return NextResponse.json(
        {
            success: false,
            error: 'Method not allowed. Use POST to send OTP.',
        },
        { status: 405 }
    )
}
