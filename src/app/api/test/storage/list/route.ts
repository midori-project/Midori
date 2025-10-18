// API Route: GET /api/test/storage/list
// ทดสอบการดึงรายการไฟล์จาก Cloudflare R2

import { NextRequest, NextResponse } from 'next/server'
import { getStorageProvider } from '@/libs/services/storageService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  console.log('📋 [LIST] Starting list test...')
  
  try {
    const { searchParams } = new URL(req.url)
    const prefix = searchParams.get('prefix') || undefined

    console.log('🎯 [LIST] Listing with prefix:', prefix || '(all)')

    // Get storage provider
    const storage = getStorageProvider()
    const files = await storage.list(prefix)

    // Create full URLs
    const filesWithUrls = files.map(path => ({
      path,
      url: storage.getPublicUrl(path)
    }))

    console.log(`✅ [LIST] Found ${files.length} files`)

    return NextResponse.json({
      success: true,
      data: {
        count: files.length,
        prefix: prefix || null,
        files: filesWithUrls
      }
    })

  } catch (error: any) {
    console.error('❌ [LIST] Error:', error.message)
    console.error(error.stack)
    
    return NextResponse.json({ 
      success: false,
      error: error.message || 'List failed',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

