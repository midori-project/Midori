/**
 * Daily Token Reset Script
 * รีเซ็ต Token เป็น 5 ทุก 0.00 น.
 * ใช้ Supabase API โดยตรง
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function resetDailyTokens() {
  try {
    console.log('🕛 Starting daily token reset...');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔍 Checking wallets that need reset...');

    // 1. หา STANDARD wallets ที่ต้องรีเซ็ต
    const { data: wallets, error: walletsError } = await supabase
      .from('token_wallet')
      .select(`
        id,
        user_id,
        balance_tokens,
        last_token_reset,
        user:auth.users(email)
      `)
      .eq('wallet_type', 'STANDARD')
      .eq('is_active', true)
      .or('last_token_reset.is.null,last_token_reset.lt.' + new Date().toISOString().split('T')[0]);

    if (walletsError) {
      throw new Error(`Failed to fetch wallets: ${walletsError.message}`);
    }

    if (!wallets || wallets.length === 0) {
      console.log('✅ No wallets need reset');
      return {
        success: true,
        resetCount: 0,
        message: 'ไม่จำเป็นต้องรีเซ็ต Token ในขณะนี้'
      };
    }

    console.log(`📊 Found ${wallets.length} wallets to reset`);

    let resetCount = 0;
    const errors = [];

    // 2. รีเซ็ตแต่ละ wallet
    for (const wallet of wallets) {
      try {
        console.log(`🔄 Resetting wallet ${wallet.id} for user ${wallet.user?.email || wallet.user_id}`);

        // อัปเดต wallet
        const { error: updateError } = await supabase
          .from('token_wallet')
          .update({
            balance_tokens: 5,
            last_token_reset: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', wallet.id);

        if (updateError) {
          throw new Error(`Failed to update wallet: ${updateError.message}`);
        }

        // บันทึก transaction
        const { error: transactionError } = await supabase
          .from('token_transaction')
          .insert({
            user_id: wallet.user_id,
            wallet_id: wallet.id,
            amount: 5,
            type: 'DAILY_RESET',
            description: 'Daily token reset',
            metadata: {
              reset_date: new Date().toISOString(),
              wallet_type: 'STANDARD'
            }
          });

        if (transactionError) {
          console.warn(`⚠️ Failed to log transaction for wallet ${wallet.id}: ${transactionError.message}`);
        }

        resetCount++;
        console.log(`✅ Reset successful for wallet ${wallet.id}`);

      } catch (error) {
        console.error(`❌ Failed to reset wallet ${wallet.id}:`, error.message);
        errors.push({
          walletId: wallet.id,
          userId: wallet.user_id,
          error: error.message
        });
      }
    }

    const result = {
      success: true,
      resetCount,
      message: `รีเซ็ต Token สำเร็จสำหรับ ${resetCount} wallets`,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Reset Summary:', JSON.stringify(result, null, 2));
    return result;

  } catch (error) {
    console.error('❌ Daily reset failed:', error);
    return {
      success: false,
      resetCount: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkResetStatus() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // นับจำนวน wallets ที่ยังต้องรีเซ็ต
    const { count: pendingCount, error: countError } = await supabase
      .from('token_wallet')
      .select('*', { count: 'exact', head: true })
      .eq('wallet_type', 'STANDARD')
      .eq('is_active', true)
      .or('last_token_reset.is.null,last_token_reset.lt.' + new Date().toISOString().split('T')[0]);

    if (countError) {
      throw new Error(`Failed to check status: ${countError.message}`);
    }

    // นับจำนวน wallets ที่รีเซ็ตวันนี้
    const { count: resetTodayCount, error: todayError } = await supabase
      .from('token_transaction')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'DAILY_RESET')
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (todayError) {
      console.warn(`⚠️ Failed to count today's resets: ${todayError.message}`);
    }

    const status = {
      shouldReset: pendingCount > 0,
      pendingCount: pendingCount || 0,
      resetTodayCount: resetTodayCount || 0,
      message: pendingCount > 0 ? 'มี wallets ที่ต้องรีเซ็ต' : 'ไม่จำเป็นต้องรีเซ็ต',
      timestamp: new Date().toISOString()
    };

    console.log('📊 Status Check:', JSON.stringify(status, null, 2));
    return status;

  } catch (error) {
    console.error('❌ Status check failed:', error);
    return {
      shouldReset: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Main execution
async function main() {
  const action = process.argv[2] || 'reset';

  switch (action) {
    case 'reset':
      const result = await resetDailyTokens();
      process.exit(result.success ? 0 : 1);
      break;

    case 'check':
      const status = await checkResetStatus();
      process.exit(0);
      break;

    default:
      console.log('Usage: node daily-token-reset.js [reset|check]');
      process.exit(1);
  }
}

// รัน script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  resetDailyTokens,
  checkResetStatus
};




