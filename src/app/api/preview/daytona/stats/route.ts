// app/api/preview/daytona/stats/route.ts
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
 * Get cleanup service statistics
 * GET /api/preview/daytona/stats
 */
export async function GET(req: NextRequest) {
  try {
    const result = controller.getCleanupStats()
    return controller.createSuccessResponse(result)
  } catch (error: any) {
    return controller.handleError(error, 500)
  }
}

