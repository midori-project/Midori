# API Authentication Endpoints

## 📋 Overview
ระบบ authentication API สำหรับ Midori ที่ใช้ session-based authentication

## 🔗 Endpoints

### 1. POST /api/auth/login
เข้าสู่ระบบด้วย email และ password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember": false // optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "ข้อมูลที่กรอกไม่ถูกต้อง",
  "details": {
    "email": "กรุณากรอกอีเมลให้ถูกต้อง",
    "password": "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
  }
}
```

### 2. POST /api/auth/logout
ออกจากระบบ

**Success Response (200):**
```json
{
  "success": true,
  "message": "ออกจากระบบสำเร็จ"
}
```

### 3. GET /api/auth/me
ดึงข้อมูลผู้ใช้และ session ปัจจุบัน

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://...",
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

**Error Response (401):**
```json
{
  "success": false,
  "error": "ไม่พบ session ที่ active หรือข้อมูลผู้ใช้"
}
```

## 🔒 Security Features

### Session Management
- **Secure Cookies**: ใช้ httpOnly, secure, sameSite cookies
- **Dual Timeout**: Absolute (30 days) และ Idle (30 minutes) timeout
- **Token Hashing**: เก็บ SHA-256 hash แทน token จริง
- **Activity Tracking**: เก็บ IP address และ User-Agent

### Password Security
- **bcrypt Hashing**: ใช้ bcrypt สำหรับ password hashing
- **Rate Limiting**: (ควรเพิ่มในอนาคต)
- **Account Lockout**: (ควรเพิ่มในอนาคต)

### Error Handling
- **Generic Error Messages**: ไม่เปิดเผยข้อมูลที่ละเอียดเกินไป
- **Validation Errors**: แสดง field-specific errors
- **Logging**: บันทึก errors สำหรับ debugging

## 🧪 Testing Examples

### Using curl

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: session=your-session-token"
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: session=your-session-token"
```

### Using axios (Frontend)

```typescript
import axios from 'axios';

// Login
const login = async (email: string, password: string) => {
  try {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const response = await axios.get('/api/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Logout
const logout = async () => {
  try {
    const response = await axios.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
```

## 📝 Notes

- Session cookies จะถูกตั้งค่าอัตโนมัติเมื่อ login สำเร็จ
- ไม่จำเป็นต้องส่ง Authorization header เพราะใช้ cookies
- API จะ return appropriate HTTP status codes
- Error messages เป็นภาษาไทยเพื่อให้เหมาะกับผู้ใช้
