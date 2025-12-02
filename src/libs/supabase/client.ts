import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client Configuration
 * 
 * สร้าง Supabase client สำหรับใช้งานใน Next.js 15
 * ใช้สำหรับ OTP verification เท่านั้น
 */

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
    )
}

/**
 * Client-side Supabase client
 * ใช้สำหรับ OTP operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Auto refresh session
        autoRefreshToken: true,
        persistSession: false, // เราใช้ custom session management
        detectSessionInUrl: false,
    },
})
