-- =============================================
-- Supabase Daily Token Reset Script
-- รีเซ็ต Token เป็น 5 ทุก 0.00 น.
-- =============================================

-- 1. สร้าง Function สำหรับรีเซ็ต Token
CREATE OR REPLACE FUNCTION reset_daily_tokens()
RETURNS JSON AS $$
DECLARE
    reset_count INTEGER := 0;
    wallet_record RECORD;
    transaction_id UUID;
BEGIN
    -- หา STANDARD wallets ที่ต้องรีเซ็ต
    FOR wallet_record IN 
        SELECT 
            tw.id as wallet_id,
            tw.user_id,
            u.email
        FROM token_wallet tw
        JOIN auth.users u ON tw.user_id = u.id
        WHERE tw.wallet_type = 'STANDARD'
          AND tw.is_active = true
          AND (
              tw.last_token_reset IS NULL 
              OR tw.last_token_reset < CURRENT_DATE
          )
    LOOP
        -- รีเซ็ต Token เป็น 5
        UPDATE token_wallet 
        SET 
            balance_tokens = 5,
            last_token_reset = NOW(),
            updated_at = NOW()
        WHERE id = wallet_record.wallet_id;
        
        -- บันทึก Transaction
        INSERT INTO token_transaction (
            id,
            user_id,
            wallet_id,
            amount,
            type,
            description,
            metadata,
            created_at
        ) VALUES (
            gen_random_uuid(),
            wallet_record.user_id,
            wallet_record.wallet_id,
            5,
            'DAILY_RESET',
            'Daily token reset',
            jsonb_build_object(
                'reset_date', NOW()::text,
                'wallet_type', 'STANDARD'
            ),
            NOW()
        );
        
        reset_count := reset_count + 1;
        
        -- Log success
        RAISE NOTICE 'Reset tokens for user % (wallet: %)', 
            wallet_record.email, 
            wallet_record.wallet_id;
    END LOOP;
    
    -- Return result
    RETURN jsonb_build_object(
        'success', true,
        'reset_count', reset_count,
        'message', 'Daily token reset completed',
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        RAISE LOG 'Daily reset error: %', SQLERRM;
        
        RETURN jsonb_build_object(
            'success', false,
            'reset_count', reset_count,
            'error', SQLERRM,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. สร้าง Function สำหรับตรวจสอบสถานะ
CREATE OR REPLACE FUNCTION check_reset_status()
RETURNS JSON AS $$
DECLARE
    pending_count INTEGER;
BEGIN
    -- นับจำนวน wallets ที่ต้องรีเซ็ต
    SELECT COUNT(*) INTO pending_count
    FROM token_wallet
    WHERE wallet_type = 'STANDARD'
      AND is_active = true
      AND (
          last_token_reset IS NULL 
          OR last_token_reset < CURRENT_DATE
      );
    
    RETURN jsonb_build_object(
        'should_reset', pending_count > 0,
        'pending_count', pending_count,
        'message', CASE 
            WHEN pending_count > 0 THEN 'มี wallets ที่ต้องรีเซ็ต'
            ELSE 'ไม่จำเป็นต้องรีเซ็ต'
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. สร้าง Function สำหรับรีเซ็ตผู้ใช้คนเดียว
CREATE OR REPLACE FUNCTION reset_user_tokens(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
    wallet_record RECORD;
    transaction_id UUID;
BEGIN
    -- หา STANDARD wallet ของผู้ใช้
    SELECT * INTO wallet_record
    FROM token_wallet
    WHERE user_id = user_id_param
      AND wallet_type = 'STANDARD'
      AND is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'ไม่พบ STANDARD wallet ของผู้ใช้'
        );
    END IF;
    
    -- รีเซ็ต Token
    UPDATE token_wallet 
    SET 
        balance_tokens = 5,
        last_token_reset = NOW(),
        updated_at = NOW()
    WHERE id = wallet_record.id;
    
    -- บันทึก Transaction
    INSERT INTO token_transaction (
        id,
        user_id,
        wallet_id,
        amount,
        type,
        description,
        metadata,
        created_at
    ) VALUES (
        gen_random_uuid(),
        user_id_param,
        wallet_record.id,
        5,
        'DAILY_RESET',
        'Manual token reset',
        jsonb_build_object(
            'reset_date', NOW()::text,
            'wallet_type', 'STANDARD',
            'manual_reset', true
        ),
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'รีเซ็ต Token สำเร็จ',
        'wallet_id', wallet_record.id,
        'new_balance', 5
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. สร้าง View สำหรับดูสถิติ
CREATE OR REPLACE VIEW token_reset_stats AS
SELECT 
    DATE(last_token_reset) as reset_date,
    COUNT(*) as wallets_reset,
    SUM(balance_tokens) as total_tokens
FROM token_wallet
WHERE wallet_type = 'STANDARD'
  AND is_active = true
  AND last_token_reset IS NOT NULL
GROUP BY DATE(last_token_reset)
ORDER BY reset_date DESC;

-- 5. สร้าง Index สำหรับประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_token_wallet_reset_check 
ON token_wallet (wallet_type, is_active, last_token_reset) 
WHERE wallet_type = 'STANDARD' AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_token_transaction_daily_reset 
ON token_transaction (type, created_at) 
WHERE type = 'DAILY_RESET';

-- 6. ตั้งค่า RLS (Row Level Security)
ALTER TABLE token_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transaction ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ token_wallet
CREATE POLICY "Users can view their own wallets" ON token_wallet
    FOR SELECT USING (auth.uid() = user_id);

-- Policy สำหรับ token_transaction  
CREATE POLICY "Users can view their own transactions" ON token_transaction
    FOR SELECT USING (auth.uid() = user_id);

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION reset_daily_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION check_reset_status() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_tokens(UUID) TO authenticated;
GRANT SELECT ON token_reset_stats TO authenticated;


