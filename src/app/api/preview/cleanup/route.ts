// app/api/preview/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server'

// ใช้ Node APIs ได้
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Import cleanup service functions from daytona route
// Note: ใน production ควรแยก cleanup service ออกเป็นไฟล์แยก

// ดูสถิติ cleanup service
export async function GET(req: NextRequest) {
  try {
    // ส่ง request ไปยัง daytona route เพื่อดึง stats
    const daytonaUrl = new URL('/api/preview/daytona/stats', req.url)
    const statsResponse = await fetch(daytonaUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!statsResponse.ok) {
      throw new Error('Failed to get stats from daytona service')
    }
    
    const stats = await statsResponse.json()
    
    console.log('📊 [CLEANUP STATS] Requested stats:', stats)
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ [CLEANUP STATS ERROR]', error)
    return NextResponse.json({ 
      success: false,
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 })
  }
}

// เริ่ม/หยุด cleanup service (สำหรับ admin)
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json()
    
    // ส่ง request ไปยัง daytona route เพื่อควบคุม service
    const daytonaUrl = new URL('/api/preview/daytona/cleanup', req.url)
    const cleanupResponse = await fetch(daytonaUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    })
    
    if (!cleanupResponse.ok) {
      throw new Error('Failed to control cleanup service')
    }
    
    const result = await cleanupResponse.json()
    
    if (action === 'start') {
      console.log('🚀 [CLEANUP SERVICE] Started via API')
    } else if (action === 'stop') {
      console.log('🛑 [CLEANUP SERVICE] Stopped via API')
    } else if (action === 'cleanup') {
      console.log('🧹 [CLEANUP SERVICE] Manual cleanup triggered via API')
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ [CLEANUP SERVICE ERROR]', error)
    return NextResponse.json({ 
      success: false,
      error: error?.message ?? 'Unexpected error' 
    }, { status: 500 })
  }
}
