# 🕛 Daily Token Reset Script

Script สำหรับรีเซ็ต Token เป็น 5 ทุก 0.00 น. โดยใช้ Supabase API โดยตรง

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
cd scripts
npm install
```

### 2. ตั้งค่า Environment Variables
```bash
# Copy environment file
cp env.example .env

# แก้ไข .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. ทดสอบการเชื่อมต่อ
```bash
# ตรวจสอบสถานะ
npm run check

# รีเซ็ต Token (ทดสอบ)
npm run reset
```

## 📋 การใช้งาน

### รีเซ็ต Token
```bash
node daily-token-reset.js reset
```

### ตรวจสอบสถานะ
```bash
node daily-token-reset.js check
```

## 🔧 การตั้งค่า GitHub Actions

### 1. ตั้งค่า Secrets
ใน GitHub Repository → Settings → Secrets and variables → Actions:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. ตั้งค่า Workflow
ไฟล์ `.github/workflows/daily-token-reset.yml` จะรันอัตโนมัติทุก 0.00 น. UTC

### 3. ทดสอบ Workflow
```bash
# รันด้วยตนเอง
gh workflow run daily-token-reset

# หรือผ่าน GitHub UI
# Actions → Daily Token Reset → Run workflow
```

## 📊 การ Monitor

### ดู Logs
```bash
# GitHub Actions
gh run list --workflow=daily-token-reset

# ดู logs
gh run view [run-id]
```

### ตรวจสอบ Database
```sql
-- ดู wallets ที่รีเซ็ตวันนี้
SELECT 
  tw.id,
  tw.user_id,
  tw.balance_tokens,
  tw.last_token_reset,
  u.email
FROM token_wallet tw
JOIN auth.users u ON tw.user_id = u.id
WHERE tw.wallet_type = 'STANDARD'
  AND DATE(tw.last_token_reset) = CURRENT_DATE;

-- ดู transactions วันนี้
SELECT 
  tt.id,
  tt.user_id,
  tt.amount,
  tt.type,
  tt.description,
  tt.created_at
FROM token_transaction tt
WHERE tt.type = 'DAILY_RESET'
  AND DATE(tt.created_at) = CURRENT_DATE;
```

## 🛠️ Troubleshooting

### ปัญหาที่พบบ่อย

1. **Authentication Error**
   ```
   Error: Invalid API key
   ```
   **แก้ไข**: ตรวจสอบ SUPABASE_SERVICE_ROLE_KEY

2. **Database Connection Error**
   ```
   Error: Failed to fetch wallets
   ```
   **แก้ไข**: ตรวจสอบ SUPABASE_URL และ network connection

3. **Permission Error**
   ```
   Error: Row Level Security
   ```
   **แก้ไข**: ใช้ SERVICE_ROLE_KEY แทน ANON_KEY

### Debug Mode
```bash
# เปิด debug mode
DEBUG=true node daily-token-reset.js reset
```

## 📈 Performance

- **Speed**: ~2-3 วินาที สำหรับ 100 wallets
- **Memory**: ~50MB RAM
- **Network**: ~10KB data transfer

## 🔒 Security

- ใช้ SERVICE_ROLE_KEY สำหรับ admin operations
- ไม่เก็บ sensitive data ใน logs
- ใช้ HTTPS สำหรับ API calls

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ logs ใน GitHub Actions
2. ทดสอบ script ใน local environment
3. ตรวจสอบ Supabase Dashboard




