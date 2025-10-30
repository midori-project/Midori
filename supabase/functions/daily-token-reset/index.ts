import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetResult {
  success: boolean;
  resetCount: number;
  message: string;
  timestamp: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { method } = req
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'reset'

    console.log(`🕛 Daily Token Reset - Action: ${action}`)

    switch (action) {
      case 'reset':
        return await handleDailyReset(supabaseAdmin)
      
      case 'check':
        return await handleCheckStatus(supabaseAdmin)
      
      case 'reset-user':
        const userId = url.searchParams.get('userId')
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'userId parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return await handleUserReset(supabaseAdmin, userId)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('❌ Daily reset error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/**
 * รีเซ็ต Token สำหรับผู้ใช้ทั้งหมด
 */
async function handleDailyReset(supabase: any): Promise<Response> {
  try {
    console.log('🔄 Starting daily token reset...')

    // 1. ตรวจสอบว่าต้องรีเซ็ตหรือไม่
    const { data: checkResult, error: checkError } = await supabase
      .rpc('check_reset_status')

    if (checkError) {
      throw new Error(`Check status failed: ${checkError.message}`)
    }

    if (!checkResult.should_reset) {
      return new Response(
        JSON.stringify({
          success: true,
          resetCount: 0,
          message: 'ไม่จำเป็นต้องรีเซ็ต Token ในขณะนี้',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. รีเซ็ต Token
    const { data: resetResult, error: resetError } = await supabase
      .rpc('reset_daily_tokens')

    if (resetError) {
      throw new Error(`Reset failed: ${resetError.message}`)
    }

    console.log(`✅ Daily reset completed: ${resetResult.reset_count} wallets`)

    return new Response(
      JSON.stringify({
        success: resetResult.success,
        resetCount: resetResult.reset_count,
        message: resetResult.message,
        timestamp: resetResult.timestamp
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Daily reset failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        resetCount: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

/**
 * ตรวจสอบสถานะการรีเซ็ต
 */
async function handleCheckStatus(supabase: any): Promise<Response> {
  try {
    const { data, error } = await supabase
      .rpc('check_reset_status')

    if (error) {
      throw new Error(`Check status failed: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        shouldReset: data.should_reset,
        pendingCount: data.pending_count,
        message: data.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Check status failed:', error)
    return new Response(
      JSON.stringify({
        shouldReset: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

/**
 * รีเซ็ต Token สำหรับผู้ใช้คนเดียว
 */
async function handleUserReset(supabase: any, userId: string): Promise<Response> {
  try {
    const { data, error } = await supabase
      .rpc('reset_user_tokens', { user_id_param: userId })

    if (error) {
      throw new Error(`User reset failed: ${error.message}`)
    }

    return new Response(
      JSON.stringify({
        success: data.success,
        message: data.message,
        walletId: data.wallet_id,
        newBalance: data.new_balance,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ User reset failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}




