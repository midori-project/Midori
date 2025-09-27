# 🚀 **Midori Template API Testing Guide (Fixed Version)**

## 📋 **Overview**
Postman Collection นี้ได้แก้ไขให้เติมค่าแบบเรียบร้อยแล้ว ไม่ต้องพึ่ง Environment Variables

---

## 🔧 **การตั้งค่า**

### **1. Import Collection**
1. เปิด **Postman**
2. คลิก **Import** 
3. เลือกไฟล์ `postman-template-api-fixed.json`
4. Collection จะถูกนำเข้าโดยอัตโนมัติ

### **2. ตรวจสอบ Server**
- เปิด **Next.js Development Server**: `npm run dev`
- ตรวจสอบว่า server ทำงานที่ `http://localhost:3000`

---

## 📝 **API Tests ที่พร้อมใช้งาน**

### **🔹 Template Management**

#### **1. สร้าง Template ใหม่ (Online Shop)**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/template`
- **Body**: Online Shop template พร้อม placeholder support
- **Expected Response**: Template ID สำหรับใช้ในขั้นตอนต่อไป

#### **2. เพิ่ม Version ให้ Template**
- **Method**: `POST` 
- **URL**: `http://localhost:3000/api/template?action=version`
- **Body**: ใช้ Template ID: `2a90b089-6112-4585-979b-331c811957d9`
- **Expected Response**: Version ใหม่ที่สร้างสำเร็จ

#### **3. ดึงรายการ Templates**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/template?category=e-commerce&status=published&limit=10`
- **Expected Response**: รายการ templates ที่มีอยู่

#### **4. ดึง Template Source Files**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/template?action=source&category=e-commerce`
- **Expected Response**: Source files ของ templates

### **🔹 Placeholder Management**

#### **5. เติม Placeholder ด้วย AI**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/template/placeholder`
- **Body**: Template ID + Theme configuration
- **Expected Response**: Template ที่เติม placeholder แล้ว

#### **6. ตรวจสอบ Placeholder (Validate)**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/template/placeholder`
- **Body**: Template ID + validation action
- **Expected Response**: ผลการตรวจสอบ placeholder

#### **7. อัพโหลด JSON Template**
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/template/placeholder`
- **Body**: JSON template format
- **Expected Response**: Template ที่อัพโหลดสำเร็จ

### **🔹 Project Integration**

#### **8. สร้าง Project จาก Template**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/projects`
- **Body**: Project details + Template ID
- **Expected Response**: Project ID สำหรับใช้ในขั้นตอนต่อไป

#### **9. ดึง Project Preview**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/projects/{PROJECT_ID}/preview`
- **Note**: ต้องใส่ Project ID จริงที่ได้จากการสร้าง project
- **Expected Response**: ข้อมูล preview ของ project

---

## 🎯 **การทดสอบแบบ Step-by-Step**

### **ขั้นตอนที่ 1: สร้าง Template**
```bash
1. เปิด Collection "Midori Template API Tests (Fixed)"
2. คลิก "1. สร้าง Template ใหม่ (Online Shop)"
3. คลิก Send
4. ตรวจสอบ Response ได้ Template ID
```

### **ขั้นตอนที่ 2: เพิ่ม Version**
```bash
1. คลิก "2. เพิ่ม Version ให้ Template"
2. คลิก Send (ใช้ Template ID ที่มีอยู่แล้ว)
3. ตรวจสอบ Response ได้ Version ใหม่
```

### **ขั้นตอนที่ 3: ทดสอบ Placeholder**
```bash
1. คลิก "5. เติม Placeholder ด้วย AI"
2. คลิก Send
3. ตรวจสอบ Response ได้ Template ที่เติม placeholder แล้ว
```

### **ขั้นตอนที่ 4: สร้าง Project**
```bash
1. คลิก "8. สร้าง Project จาก Template"
2. คลิก Send
3. ตรวจสอบ Response ได้ Project ID
4. คัดลอก Project ID ไปใส่ในข้อ 9
```

---

## ✅ **Expected Success Responses**

### **สร้าง Template สำเร็จ:**
```json
{
  "success": true,
  "data": {
    "id": "template-uuid",
    "key": "online-shop-enhanced",
    "label": "Online Shop Enhanced Template",
    "category": "e-commerce",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **เพิ่ม Version สำเร็จ:**
```json
{
  "success": true,
  "data": {
    "id": "version-uuid",
    "templateId": "2a90b089-6112-4585-979b-331c811957d9",
    "version": 2,
    "status": "published",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **เติม Placeholder สำเร็จ:**
```json
{
  "success": true,
  "data": {
    "templateId": "2a90b089-6112-4585-979b-331c811957d9",
    "filledFiles": [...],
    "previewUrl": "https://preview.daytona.works/sandbox/xxx",
    "previewToken": "token_xxx"
  }
}
```

---

## 🚨 **Troubleshooting**

### **Error: "templateId is required"**
- ✅ **แก้ไขแล้ว**: ใช้ Template ID ที่มีอยู่แล้วใน collection
- Template ID: `2a90b089-6112-4585-979b-331c811957d9`

### **Error: "Module not found"**
- ตรวจสอบว่า Next.js server ทำงานอยู่
- รัน `npm run dev` ใน terminal

### **Error: "Connection refused"**
- ตรวจสอบ URL: `http://localhost:3000`
- ตรวจสอบว่า port 3000 ไม่ถูกใช้งานโดยโปรแกรมอื่น

### **Error: "Template not found"**
- ลองสร้าง template ใหม่ก่อน (ข้อ 1)
- ใช้ Template ID ที่ได้จากการสร้าง template

---

## 🎉 **Features ที่พร้อมใช้งาน**

- ✅ **Template Creation**: สร้าง template พร้อม placeholder support
- ✅ **Version Management**: เพิ่ม version ให้ template
- ✅ **Placeholder Filling**: เติม placeholder ด้วย AI
- ✅ **JSON Template Upload**: อัพโหลด template จาก JSON
- ✅ **Project Creation**: สร้าง project จาก template
- ✅ **Preview Management**: ดึงข้อมูล preview ของ project

---

## 📞 **Support**

หากพบปัญหา:
1. ตรวจสอบ Next.js server ทำงานอยู่
2. ตรวจสอบ API endpoint ถูกต้อง
3. ตรวจสอบ Request body format
4. ดู Console logs ใน Next.js server

**Happy Testing! 🚀**
