# 🧪 Testing Guide สำหรับ Authentication System

## 📋 Overview
คู่มือการทดสอบระบบ authentication ที่เชื่อมต่อ frontend กับ backend API

## 🚀 ขั้นตอนการทดสอบ

### 1. เตรียมข้อมูลทดสอบ
สร้างผู้ใช้ทดสอบในฐานข้อมูล:

```sql
-- เพิ่มผู้ใช้ทดสอบ (ต้องรันใน database โดยตรง)
INSERT INTO "User" (id, email, "displayName", "isActive", "createdAt", "updatedAt")
VALUES (
  'test-user-id',
  'test@midori.dev',
  'Test User',
  true,
  NOW(),
  NOW()
);

-- เพิ่ม credential สำหรับผู้ใช้ทดสอบ
INSERT INTO "AuthCredential" (
  id, 
  "userId", 
  "loginEmail", 
  "passwordHash", 
  "passwordAlgo", 
  "isEmailVerified", 
  "createdAt"
) VALUES (
  'test-credential-id',
  'test-user-id',
  'test@midori.dev',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBNFknjUxYj6A2', -- password: testpass123
  'bcrypt',
  true,
  NOW()
);
```

### 2. รันเซิร์ฟเวอร์
```bash
npm run dev
```

### 3. ทดสอบ API Endpoints

#### ทดสอบ Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@midori.dev",
    "password": "testpass123"
  }'
```

#### ทดสอบ Current User API
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: session=your-session-token"
```

### 4. ทดสอบ Frontend

#### ขั้นตอนการทดสอบ:

1. **เปิดเบราว์เซอร์** ไปที่ `http://localhost:3000`
2. **ตรวจสอบ Navbar** - ควรแสดงปุ่ม "เข้าสู่ระบบ" และ "สมัครสมาชิก"
3. **คลิก "เข้าสู่ระบบ"** - ไปที่หน้า `/login`
4. **กรอกข้อมูล**:
   - Email: `test@midori.dev`
   - Password: `testpass123`
   - เลือก "จำการเข้าสู่ระบบ" (ถ้าต้องการ)
5. **คลิก "เข้าสู่ระบบ"** - ควรได้รับข้อความสำเร็จและ redirect ไป `/`
6. **ตรวจสอบ Navbar** - ควรแสดงชื่อผู้ใช้และเมนู dropdown
7. **ทดสอบ Logout** - คลิก "ออกจากระบบ" ใน dropdown menu

### 5. สิ่งที่ควรเกิดขึ้น

#### ✅ เมื่อ Login สำเร็จ:
- แสดงข้อความ "เข้าสู่ระบบสำเร็จ"
- Redirect ไปหน้าแรก
- Navbar แสดงชื่อผู้ใช้
- หน้าแรกแสดงข้อความต้อนรับพร้อมชื่อผู้ใช้

#### ✅ เมื่อ Login ไม่สำเร็จ:
- แสดงข้อความ error ที่เหมาะสม
- Form ยังคงแสดงอยู่
- Password field ถูกล้างเพื่อความปลอดภัย

#### ✅ เมื่อ Logout:
- กลับไปสู่สถานะไม่ได้ login
- Navbar แสดงปุ่ม login/register
- Session ถูกลบออกจากฐานข้อมูล

### 6. การทดสอบ Error Cases

#### Invalid Credentials:
```json
{
  "email": "test@midori.dev",
  "password": "wrongpassword"
}
```
ผลลัพธ์: แสดง "อีเมลหรือรหัสผ่านไม่ถูกต้อง"

#### Validation Errors:
```json
{
  "email": "invalid-email",
  "password": "123"
}
```
ผลลัพธ์: แสดง field-specific errors

#### Network Error:
- ปิดเซิร์ฟเวอร์แล้วลอง login
ผลลัพธ์: แสดง "เกิดข้อผิดพลาดในการเชื่อมต่อ"

## 🔧 Tools สำหรับ Debug

### 1. Browser DevTools
- **Network Tab**: ดู API calls และ responses
- **Application Tab**: ดู cookies ที่ถูกตั้งค่า
- **Console**: ดู error messages และ logs

### 2. Database Tools
- **Prisma Studio**: `npx prisma studio --schema=midori-infastructure/lambda/api/prisma/schema.prisma`
- ดู tables: User, AuthCredential, Session

### 3. API Testing
- **Postman**: สำหรับทดสอบ API endpoints
- **curl**: สำหรับ command line testing

## 🐛 Common Issues และ Solutions

### Issue 1: Cookie ไม่ถูกตั้งค่า
**Solution**: ตรวจสอบว่า API response มี `withCredentials: true`

### Issue 2: CORS Errors
**Solution**: ตรวจสอบ Next.js API routes configuration

### Issue 3: Session Expires เร็วเกินไป
**Solution**: ตรวจสอบ `sessionConfig` ใน `session.ts`

### Issue 4: TypeScript Errors
**Solution**: รัน `npx prisma generate` หลังเปลี่ยน schema

## 📊 Expected API Responses

### Login Success:
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "user": {
    "id": "test-user-id",
    "email": "test@midori.dev",
    "displayName": "Test User",
    "avatarUrl": null
  }
}
```

### Login Error:
```json
{
  "success": false,
  "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
}
```

### Current User:
```json
{
  "success": true,
  "user": {
    "id": "test-user-id",
    "email": "test@midori.dev",
    "displayName": "Test User",
    "avatarUrl": null,
    "createdAt": "2025-08-22T10:30:00.000Z",
    "lastLoginAt": "2025-08-22T10:30:00.000Z"
  },
  "session": {
    "id": "session-uuid",
    "createdAt": "2025-08-22T10:30:00.000Z",
    "lastActiveAt": "2025-08-22T10:35:00.000Z",
    "expiresAt": "2025-09-21T10:30:00.000Z"
  }
}
```
