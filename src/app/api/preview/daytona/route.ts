// app/api/preview/daytona/route.ts - Refactored
import { NextRequest, NextResponse } from 'next/server'
import { SandboxController } from './controllers/SandboxController'
import { RESPONSE_HEADERS } from './utils/constants'

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
 * Create new sandbox
 * POST /api/preview/daytona
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await controller.createSandbox(body)
    return controller.createSuccessResponse(result)
  } catch (error: any) {
    return controller.handleError(error, 500)
  }
}

/**
 * Get sandbox status and handle heartbeat
 * GET /api/preview/daytona?sandboxId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    const result = await controller.getSandboxStatus(sandboxId)
    return controller.createSuccessResponse(result)
  } catch (error: any) {
    const status = error.message === 'Missing sandboxId' ? 400 : 
                   error.message === 'Sandbox not found' ? 404 : 500
    return controller.handleError(error, status)
  }
}

/**
 * Update files in existing sandbox
 * PUT /api/preview/daytona?sandboxId=xxx
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    const body = await req.json()
    const result = await controller.updateSandboxFiles(sandboxId, body)
    return controller.createSuccessResponse(result)
  } catch (error: any) {
    const status = error.message === 'Missing sandboxId' ? 400 :
                   error.message.includes('not found') ? 404 : 500
    return controller.handleError(error, status)
  }
}

/**
 * Delete sandbox
 * DELETE /api/preview/daytona?sandboxId=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sandboxId = searchParams.get('sandboxId')
    const result = await controller.deleteSandbox(sandboxId)
    return controller.createSuccessResponse(result)
  } catch (error: any) {
    const status = error.message === 'Missing sandboxId' ? 400 : 500
    return controller.handleError(error, status)
  }
}
