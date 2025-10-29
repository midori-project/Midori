/**
 * Vercel Cron Job - Daily Token Reset
 * รันทุก 0.00 น. UTC (7.00 น. ไทย)
 */

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // ตรวจสอบว่าเป็น cron job หรือไม่
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('🕛 Starting daily token reset...')

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 1. ตรวจสอบสถานะ
    const { data: checkResult, error: checkError } = await supabase
      .rpc('check_reset_status')

    if (checkError) {
      throw new Error(`Check status failed: ${checkError.message}`)
    }

    if (!checkResult.should_reset) {
      return res.status(200).json({
        success: true,
        resetCount: 0,
        message: 'ไม่จำเป็นต้องรีเซ็ต Token ในขณะนี้',
        timestamp: new Date().toISOString()
      })
    }

    // 2. รีเซ็ต Token
    const { data: resetResult, error: resetError } = await supabase
      .rpc('reset_daily_tokens')

    if (resetError) {
      throw new Error(`Reset failed: ${resetError.message}`)
    }

    console.log(`✅ Daily reset completed: ${resetResult.reset_count} wallets`)

    // 3. ส่งผลลัพธ์
    return res.status(200).json({
      success: resetResult.success,
      resetCount: resetResult.reset_count,
      message: resetResult.message,
      timestamp: resetResult.timestamp
    })

  } catch (error) {
    console.error('❌ Daily reset failed:', error)
    return res.status(500).json({
      success: false,
      resetCount: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

// ตั้งค่า Vercel Cron
export const config = {
  runtime: 'nodejs18.x',
  // รันทุก 0.00 น. UTC
  schedule: '0 0 * * *'
}


