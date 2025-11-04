// app/api/preview/daytona/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SandboxController } from '../controllers/SandboxController'
import { RESPONSE_HEADERS } from '../utils/constants'

// Runtime configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Initialize controller (singleton pattern)
const controller = new SandboxController()

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: RESPONSE_HEADERS.CORS,
  })
}

/**
 * Control cleanup service (admin endpoint)
 * POST /api/preview/daytona/cleanup
 */
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json()
    const result = await controller.controlCleanupService(action)
    return controller.createSuccessResponse(result)
  } catch (error: any) {
    const status = error.message.includes('Invalid action') ? 400 : 500
    return controller.handleError(error, status)
  }
}

