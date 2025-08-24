# Environment Setup Guide

## Required Environment Variables

### 1. Create `.env.local` file

สร้างไฟล์ `.env.local` ในโฟลเดอร์ `Midori/` ด้วยเนื้อหาดังนี้:

```env
# OpenAI API Configuration
QUESTION_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get OpenAI API Key

1. ไปที่ [OpenAI Platform](https://platform.openai.com/)
2. สร้างบัญชีหรือเข้าสู่ระบบ
3. ไปที่ [API Keys](https://platform.openai.com/api-keys)
4. สร้าง API key ใหม่
5. คัดลอก API key และใส่ใน `QUESTION_API_KEY`

### 3. Restart Development Server

หลังจากตั้งค่า environment variables แล้ว ให้ restart development server:

```bash
npm run dev
```

## Troubleshooting

### Error: "QUESTION_API_KEY environment variable is not set"

- ตรวจสอบว่าไฟล์ `.env.local` อยู่ในโฟลเดอร์ `Midori/`
- ตรวจสอบว่า API key ถูกต้อง
- Restart development server

### Error: "Invalid JSON response from OpenAI"

- ตรวจสอบว่า API key มีเครดิตเพียงพอ
- ตรวจสอบว่า API key มีสิทธิ์เข้าถึง GPT-4o-mini model
