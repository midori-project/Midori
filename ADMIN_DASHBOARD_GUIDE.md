# 🪙 Admin Dashboard - Token Management Guide

## 📋 Overview

Admin Dashboard สำหรับจัดการ Token ของผู้ใช้ทั้งหมดในระบบ Midori

## 🎯 Features

### 1. **Dashboard Overview**
- แสดงสถิติ Token ของระบบทั้งหมด
- จำนวนผู้ใช้ (Total Users)
- Token ทั้งหมด (Total Tokens)
- Token เฉลี่ยต่อผู้ใช้ (Average per User)
- จำนวนผู้ใช้ที่มี 0 Token (Zero Tokens)

### 2. **User Token Management**
- แสดงรายการผู้ใช้ทั้งหมดพร้อม Token balance
- แสดง wallets ของแต่ละผู้ใช้ (STANDARD, PREMIUM, BONUS, TRIAL)
- ค้นหาผู้ใช้ด้วย Email หรือ Display Name
- ดูประวัติ transactions 5 รายการล่าสุด

### 3. **Token Adjustment**
- ปรับ Token ของผู้ใช้ (เพิ่ม/ลบ)
- รีเซ็ต Token เป็น 5 (Daily Reset)
- บันทึก transaction พร้อมคำอธิบาย

## 🚀 Access

### URL
```
/admin/tokens
```

### Requirements
- ต้อง login เป็น Admin
- (TODO: เพิ่ม permission check)

## 📁 Files Structure

```
src/
├── app/
│   ├── (app)/
│   │   └── (admin)/
│   │       └── admin/
│   │           └── tokens/
│   │               └── page.tsx          # Admin Token Page
│   └── api/
│       └── admin/
│           └── tokens/
│               ├── users/route.ts        # ดึงข้อมูลผู้ใช้ทั้งหมด
│               ├── adjust/route.ts      # ปรับ Token
│               └── reset/route.ts       # รีเซ็ต Token
└── components/
    └── admin/
        └── AdminTokenDashboard.tsx       # Admin Dashboard Component
```

## 🔧 API Endpoints

### 1. GET /api/admin/tokens/users
ดึงข้อมูล Token ของผู้ใช้ทั้งหมด

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "user-123",
        "email": "user@example.com",
        "displayName": "John Doe",
        "totalBalance": 5,
        "wallets": [
          {
            "id": "wallet-1",
            "walletType": "STANDARD",
            "balanceTokens": 5,
            "lastTokenReset": "2024-01-01T00:00:00Z",
            "expiresAt": null
          }
        ],
        "transactions": [...]
      }
    ],
    "stats": {
      "totalUsers": 100,
      "totalTokens": 500,
      "averageTokensPerUser": 5,
      "usersWithZeroTokens": 10
    }
  }
}
```

### 2. POST /api/admin/tokens/adjust
ปรับ Token ของผู้ใช้

**Request Body:**
```json
{
  "userId": "user-123",
  "amount": 10,        // +10 หรือ -5
  "description": "Manual adjustment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ปรับ Token สำเร็จ"
}
```

### 3. POST /api/admin/tokens/reset
รีเซ็ต Token เป็น 5

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "รีเซ็ต Token สำเร็จ"
}
```

## 🎨 UI Components

### AdminTokenDashboard
Main component ที่แสดง:
- Stats cards
- Search bar
- User table
- Adjustment modal

### AdjustmentModal
Modal สำหรับปรับ Token:
- ใส่จำนวน Token (+, -)
- ใส่คำอธิบาย
- ยืนยันหรือยกเลิก

## 🔐 Security

### Current Implementation
- ✅ Authentication check
- ❌ Admin permission check (TODO)
- ❌ Rate limiting (TODO)

### Future Improvements
1. เพิ่ม role-based access control
2. เพิ่ม audit logging
3. เพิ่ม rate limiting
4. เพิ่ม input validation

## 🧪 Testing

### Manual Testing
1. เข้าสู่ระบบด้วย Admin account
2. ไปที่ `/admin/tokens`
3. ทดสอบ:
   - ดูรายการผู้ใช้
   - ค้นหาผู้ใช้
   - ปรับ Token
   - รีเซ็ต Token

### API Testing
```bash
# ดึงข้อมูลผู้ใช้
curl -X GET http://localhost:3000/api/admin/tokens/users \
  -H "Cookie: midori-session=xxx"

# ปรับ Token
curl -X POST http://localhost:3000/api/admin/tokens/adjust \
  -H "Content-Type: application/json" \
  -H "Cookie: midori-session=xxx" \
  -d '{"userId": "user-123", "amount": 10, "description": "Test"}'

# รีเซ็ต Token
curl -X POST http://localhost:3000/api/admin/tokens/reset \
  -H "Content-Type: application/json" \
  -H "Cookie: midori-session=xxx" \
  -d '{"userId": "user-123"}'
```

## 📊 Database Impact

### Tables Used
- `User` - ข้อมูลผู้ใช้
- `TokenWallet` - Wallet ของแต่ละผู้ใช้
- `TokenTransaction` - ประวัติ transactions

### Queries
- `SELECT * FROM User WHERE isActive = true`
- `SELECT * FROM TokenWallet WHERE userId = ?`
- `SELECT * FROM TokenTransaction WHERE userId = ? ORDER BY createdAt DESC LIMIT 5`

## 🚧 TODO

1. เพิ่ม Admin permission check
2. เพิ่ม pagination สำหรับ user list
3. เพิ่ม bulk operations (รีเซ็ตหลายคนพร้อมกัน)
4. เพิ่ม export to CSV/Excel
5. เพิ่ม transaction history viewer
6. เพิ่ม wallet type management

## 📝 Notes

- Token balance มาจากทุก wallets ของผู้ใช้
- Admin สามารถปรับ Token ได้โดยไม่มีการรับรองพิเศษ (ควรเพิ่มในอนาคต)
- ทุกการปรับ Token จะถูกบันทึกใน TokenTransaction
- Daily reset จะรีเซ็ตเฉพาะ STANDARD wallet



