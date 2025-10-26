# Daytona Preview API - Refactored

## 📁 โครงสร้างไฟล์ใหม่

```
src/app/api/preview/daytona/
├── route.ts                    # HTTP handlers (90 lines)
├── controllers/
│   └── SandboxController.ts    # Business logic layer
├── services/
│   ├── DaytonaSandboxService.ts # Sandbox operations
│   ├── CleanupService.ts       # Cleanup logic
│   └── FileService.ts          # File operations
├── models/
│   └── SandboxState.ts         # Type definitions
├── utils/
│   ├── constants.ts            # Configuration constants
│   └── sandboxHelpers.ts       # Helper functions
├── route.ts.backup             # Original file backup
└── README.md                   # This file
```

## 🔄 การเปลี่ยนแปลงหลัก

### ก่อน Refactor
- ไฟล์ `route.ts` เดียว: **1,173 บรรทัด**
- ทุกอย่างอยู่ในที่เดียว (Mixed Responsibilities)
- ยากต่อการ maintain และ test

### หลัง Refactor
- แบ่งเป็น **8 ไฟล์** ตามหน้าที่
- `route.ts` ใหม่: **90 บรรทัด** (ลดลง 92%!)
- Separation of Concerns ชัดเจน
- Easy to maintain และ extend

## 🏗️ Architecture Overview

```
HTTP Request
     ↓
route.ts (HTTP Handlers)
     ↓
SandboxController (Business Logic)
     ↓
Services (DaytonaSandboxService, FileService, CleanupService)
     ↓
Models & Utils (Types, Helpers, Constants)
```

## 📋 ฟีเจอร์ที่ยังคงใช้งานได้เหมือนเดิม

### 1. **สร้าง Sandbox** 
```http
POST /api/preview/daytona
Content-Type: application/json

{
  "files": [...],
  "projectId": "project-123",
  "userId": "user-456"
}
```

### 2. **เช็คสถานะ + Heartbeat**
```http
GET /api/preview/daytona?sandboxId=sandbox-123
```

### 3. **อัปเดตไฟล์**
```http
PUT /api/preview/daytona?sandboxId=sandbox-123
Content-Type: application/json

{
  "files": [...],
  "comparison": { ... }
}
```

### 4. **ลบ Sandbox**
```http
DELETE /api/preview/daytona?sandboxId=sandbox-123
```

### 5. **ดูสถิติ Cleanup**
```http
GET_STATS /api/preview/daytona
```

### 6. **ควบคุม Cleanup Service**
```http
POST_CLEANUP /api/preview/daytona
Content-Type: application/json

{
  "action": "start|stop|cleanup|sync|memory|stopped"
}
```

## 🔧 Services อธิบาย

### **DaytonaSandboxService**
- จัดการ Daytona sandbox operations
- สร้าง, อัปเดต, ลบ sandbox
- รองรับ auto-start dev server

### **FileService** 
- จัดการ file operations
- Smart rebuild optimization
- Install dependencies

### **CleanupService**
- Auto cleanup expired/idle sandboxes
- Memory state synchronization
- Configurable intervals

### **SandboxController**
- Business logic layer
- Request validation
- Error handling
- Database operations

## 📊 ประสิทธิภาพที่ดีขึ้น

| Metric | Before | After | Improvement |
|--------|--------|--------|-------------|
| **File Size** | 1,173 lines | 90 lines | 92% ลดลง |
| **Maintainability** | ❌ ยาก | ✅ ง่าย | มาก |
| **Testability** | ❌ ยาก | ✅ ง่าย | มาก |
| **Readability** | ❌ ยาก | ✅ ง่าย | มาก |
| **Reusability** | ❌ ไม่ได้ | ✅ ได้ | มาก |

## 🔄 วิธี Rollback (ถ้าจำเป็น)

```bash
# กลับไปใช้ไฟล์เดิม
cd src/app/api/preview/daytona
cp route.ts.backup route.ts

# ลบ folder ที่สร้างใหม่ (ถ้าต้องการ)
rm -rf controllers services models utils
```

## 🚀 การใช้งานต่อไป

### ขยายฟีเจอร์ใหม่
1. เพิ่ม Service ใหม่ใน `services/`
2. เพิ่ม Controller method ใน `SandboxController`
3. เพิ่ม HTTP handler ใน `route.ts`

### ปรับแต่ง Configuration
- แก้ไขค่าใน `utils/constants.ts`
- เพิ่ม types ใน `models/SandboxState.ts`

### Debugging
- แต่ละ Service มี logging ชัดเจน
- Error handling ครอบคลุม
- Stats และ monitoring built-in

## ✅ สรุป

การ refactor ทำให้:
- **Code ง่ายต่อการอ่าน** และ maintain
- **แยกหน้าที่ชัดเจน** (Separation of Concerns)  
- **Performance เหมือนเดิม** แต่โครงสร้างดีขึ้น
- **Ready สำหรับ scaling** และเพิ่มฟีเจอร์ใหม่
- **ไม่กระทบต่อ API เดิม** ที่มีอยู่

🎉 **ความสำเร็จ: จาก 1,173 บรรทัด → 90 บรรทัด (ลดลง 92%!)**
