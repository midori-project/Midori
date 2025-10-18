// API Route: DELETE /api/test/storage/delete
// ทดสอบการลบไฟล์จาก Cloudflare R2

import { NextRequest, NextResponse } from 'next/server'
import { getStorageProvider } from '@/libs/services/storageService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  console.log('🗑️ [DELETE] Starting delete test...')
  
  try {
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path')
    
    if (!path) {
      return NextResponse.json({ 
        success: false,
        error: 'No path provided. Use ?path=test/filename.jpg' 
      }, { status: 400 })
    }

    console.log('🎯 [DELETE] Deleting path:', path)

    // Delete from storage
    const storage = getStorageProvider()
    await storage.delete(path)

    console.log('✅ [DELETE] Success!')

    return NextResponse.json({
      success: true,
      data: {
        path,
        deletedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ [DELETE] Error:', error.message)
    console.error(error.stack)
    
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Delete failed',
      details: error.stack
    }, { status: 500 })
  }
}

// Support POST with body (alternative)
export async function POST(req: NextRequest) {
  console.log('🗑️ [DELETE] Starting delete test (POST)...')
  
  try {
    const body = await req.json()
    const { path } = body
    
    if (!path) {
      return NextResponse.json({ 
        success: false,
        error: 'No path provided in body' 
      }, { status: 400 })
    }

    console.log('🎯 [DELETE] Deleting path:', path)

    // Delete from storage
    const storage = getStorageProvider()
    await storage.delete(path)

    console.log('✅ [DELETE] Success!')

    return NextResponse.json({
      success: true,
      data: {
        path,
        deletedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ [DELETE] Error:', error.message)
    console.error(error.stack)
    
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Delete failed',
      details: error.stack
    }, { status: 500 })
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

