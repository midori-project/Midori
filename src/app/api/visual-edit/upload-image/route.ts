// API Route: POST /api/visual-edit/upload-image
// อัปโหลดรูปภาพสำหรับ Visual Edit Mode

import { NextRequest, NextResponse } from 'next/server'
import { getStorageProvider } from '@/libs/services/storageService'
import { prisma } from '@/libs/prisma/prisma'
import { nanoid } from 'nanoid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface UploadImageResponse {
  success: boolean
  url?: string
  imageAssetId?: string
  meta?: {
    filename: string
    size: number
    type: string
    uploadedAt: string
  }
  error?: string
  details?: string
}

/**
 * Visual Edit Image Upload API
 * 
 * Flow:
 * 1. รับไฟล์จาก FormData
 * 2. Validate image type & size
 * 3. Upload ไป Cloudflare R2
 * 4. บันทึก ImageAsset ลง Supabase (Prisma)
 * 5. Return public URL
 */
export async function POST(req: NextRequest): Promise<NextResponse<UploadImageResponse>> {
  console.log('🖼️ [VISUAL-EDIT-UPLOAD] ========== API CALLED ==========')
  
  try {
    // Parse FormData
    console.log('📥 [UPLOAD] Parsing FormData...')
    const formData = await req.formData()
    
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const blockId = formData.get('blockId') as string
    const field = formData.get('field') as string
    
    // Validate required fields
    if (!file) {
      console.error('❌ [UPLOAD] No file provided')
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 })
    }
    
    if (!projectId || !blockId || !field) {
      console.error('❌ [UPLOAD] Missing metadata:', { projectId, blockId, field })
      return NextResponse.json({ 
        success: false,
        error: 'Missing required metadata (projectId, blockId, field)' 
      }, { status: 400 })
    }

    // Check if file was compressed
    const wasCompressed = formData.get('compressed') === 'true';
    const originalSize = formData.get('originalSize');
    
    console.log('📁 [UPLOAD] File received:')
    console.log('   Name:', file.name)
    console.log('   Size:', file.size, 'bytes', `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    console.log('   Type:', file.type)
    console.log('   Project:', projectId)
    console.log('   Block:', blockId)
    console.log('   Field:', field)
    
    // Log compression info if available
    if (wasCompressed && originalSize) {
      const originalSizeNum = parseInt(originalSize as string);
      const reduction = ((1 - file.size / originalSizeNum) * 100);
      console.log('📊 [COMPRESSION] Metrics:')
      console.log('   Original:', (originalSizeNum / 1024 / 1024).toFixed(2), 'MB')
      console.log('   Compressed:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      console.log('   Reduction:', reduction.toFixed(1), '%')
      console.log('   Saved:', ((originalSizeNum - file.size) / 1024 / 1024).toFixed(2), 'MB')
    }

    // Validate file type - must be image
    if (!file.type.startsWith('image/')) {
      console.error('❌ [UPLOAD] Invalid file type:', file.type)
      return NextResponse.json({ 
        success: false,
        error: 'File must be an image (JPEG, PNG, GIF, WEBP)' 
      }, { status: 400 })
    }

    // Validate file size - max 10MB
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error('❌ [UPLOAD] File too large:', file.size, 'bytes')
      return NextResponse.json({ 
        success: false,
        error: `File too large (max 10MB). Your file: ${(file.size / 1024 / 1024).toFixed(2)} MB` 
      }, { status: 400 })
    }

    // Generate unique filename
    // Pattern: projects/{projectId}/visual-edit/{timestamp}-{nanoid}.{ext}
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const uniqueId = nanoid(10)
    const filename = `projects/${projectId}/visual-edit/${timestamp}-${uniqueId}.${ext}`

    console.log('🎯 [UPLOAD] Generated filename:', filename)

    // Upload to Cloudflare R2
    console.log('☁️ [UPLOAD] Uploading to Cloudflare R2...')
    const storage = getStorageProvider()
    const publicUrl = await storage.upload(file, filename)

    console.log('✅ [UPLOAD] Upload successful!')
    console.log('   Public URL:', publicUrl)

    // Save metadata to database (ImageAsset table)
    console.log('💾 [UPLOAD] Saving to database...')
    
    // Prepare metadata with compression info
    const metadata: any = {
      url: publicUrl,
      blockId: blockId,
      field: field,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedVia: 'visual-edit'
    };
    
    // Add compression metadata if available
    if (wasCompressed && originalSize) {
      const originalSizeNum = parseInt(originalSize as string);
      metadata.compression = {
        enabled: true,
        originalSize: originalSizeNum,
        compressedSize: file.size,
        reduction: ((1 - file.size / originalSizeNum) * 100),
        savedBytes: originalSizeNum - file.size
      };
    }
    
    const imageAsset = await prisma.imageAsset.create({
      data: {
        projectId: projectId,
        provider: 'cloudflare-r2',
        meta: metadata
      }
    })

    console.log('✅ [UPLOAD] Saved to database!')
    console.log('   ImageAsset ID:', imageAsset.id)

    // Return success response
    return NextResponse.json({
      success: true,
      url: publicUrl,
      imageAssetId: imageAsset.id,
      meta: {
        filename: filename,
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

