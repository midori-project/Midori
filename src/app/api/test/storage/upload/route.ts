// API Route: POST /api/test/storage/upload
// ทดสอบการอัพโหลดไฟล์ไป Cloudflare R2

import { NextRequest, NextResponse } from 'next/server'
import { getStorageProvider } from '@/libs/services/storageService'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  console.log('📤 [UPLOAD] Starting upload test...')
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 })
    }

    console.log('📁 [UPLOAD] File received:')
    console.log('   Name:', file.name)
    console.log('   Size:', file.size, 'bytes')
    console.log('   Type:', file.type)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false,
        error: 'File must be an image' 
      }, { status: 400 })
    }

    // Validate file size (max 10MB for testing)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false,
        error: 'File too large (max 10MB)' 
      }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `test/${nanoid()}.${ext}`

    console.log('🎯 [UPLOAD] Generated path:', filename)

    // Upload to storage
    const storage = getStorageProvider()
    const publicUrl = await storage.upload(file, filename)

    console.log('✅ [UPLOAD] Success!')
    console.log('   URL:', publicUrl)

    return NextResponse.json({
      success: true,
      data: {
        filename,
        url: publicUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ [UPLOAD] Error:', error.message)
    console.error(error.stack)
    
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Upload failed',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

