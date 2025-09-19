# 🚀 Midori Template API - Postman Testing Guide

## 📋 การตั้งค่า Postman

### 1. Import Collection
1. เปิด Postman
2. คลิก **Import**
3. เลือกไฟล์ `postman-template-api.json`
4. Collection จะถูกเพิ่มเข้ามา

### 2. ตั้งค่า Environment Variables
สร้าง Environment ใหม่ชื่อ `Midori Local`:

```json
{
  "base_url": "http://localhost:3000",
  "template_id": ""
}
```

## 🧪 การทดสอบ API

### **ขั้นตอนที่ 1: สร้าง Template แม่แบบ**
1. รัน **"1. Create Template (Basic)"**
2. ตรวจสอบ response ได้ `template.id`
3. Copy `template.id` ไปใส่ใน `template_id` variable

### **ขั้นตอนที่ 2: สร้าง Template พร้อม Initial Version**
1. รัน **"2. Create Template with Initial Version"**
2. ตรวจสอบ response ได้ `initialVersion.id`

### **ขั้นตอนที่ 3: สร้าง Versions เพิ่มเติม**
1. รัน **"3. Create Template Version (Thai Restaurant)"**
2. รัน **"4. Create Template Version (Japanese Restaurant)"**
3. ตรวจสอบ version numbers ที่เพิ่มขึ้น

### **ขั้นตอนที่ 4: ทดสอบ GET APIs**
1. รัน **"5. Get All Templates"** - ดู templates ทั้งหมด
2. รัน **"6. Get Templates by Category"** - กรองตาม category
3. รัน **"7. Get Published Templates"** - กรองตาม status
4. รัน **"8. Get Templates with Published Versions"** - กรองตาม version status

### **ขั้นตอนที่ 5: ทดสอบ Error Cases**
1. รัน **"9. Error Test - Duplicate Template Key"** - ควรได้ 409 Conflict
2. รัน **"10. Error Test - Invalid Template ID"** - ควรได้ 400 Validation Error

## 📊 Expected Responses

### ✅ Success Response (Create Template)
```json
{
  "success": true,
  "data": {
    "template": {
      "id": "uuid-here",
      "key": "restaurant-basic",
      "label": "Restaurant Basic Template",
      "category": "restaurant"
    },
    "meta": {
      "id": "meta-uuid-here",
      "status": "draft"
    },
    "initialVersion": {
      "id": "version-uuid-here",
      "version": 1
    }
  }
}
```

### ✅ Success Response (Create Version)
```json
{
  "success": true,
  "data": {
    "id": "version-uuid-here",
    "templateId": "template-uuid-here",
    "version": 2,
    "status": "published",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### ❌ Error Response (Duplicate Key)
```json
{
  "error": "Template key already exists"
}
```

### ❌ Error Response (Validation Error)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "expected": "uuid",
      "received": "string",
      "path": ["templateId"],
      "message": "Invalid uuid"
    }
  ]
}
```

## 🔧 การตั้งค่า Tests Scripts

เพิ่ม Tests Script ใน **"1. Create Template (Basic)"**:

```javascript
// เก็บ template_id สำหรับใช้ใน requests อื่น
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.template.id) {
        pm.environment.set("template_id", response.data.template.id);
        console.log("Template ID saved:", response.data.template.id);
    }
}
```

## 📝 หมายเหตุ

1. **Base URL**: เปลี่ยน `base_url` เป็น URL ของ server จริง
2. **Template ID**: จะถูกเก็บอัตโนมัติหลังจากสร้าง template แรก
3. **Error Testing**: ทดสอบ error cases เพื่อให้แน่ใจว่า validation ทำงานถูกต้อง
4. **Pagination**: ใช้ `limit` และ `offset` สำหรับ pagination
5. **Status Scope**: ใช้ `statusScope=meta` หรือ `statusScope=version` ตามต้องการ

## 🎯 Tips การทดสอบ

- รัน requests ตามลำดับเพื่อให้ได้ผลลัพธ์ที่ถูกต้อง
- ตรวจสอบ response status codes
- ดู console logs ใน Postman สำหรับ debug
- ใช้ Collection Runner สำหรับทดสอบแบบ batch
