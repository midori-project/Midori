# ระบบเช็ค Generation ที่มีอยู่แล้ว

## ภาพรวม
ระบบนี้จะเช็ค Generation ที่มีอยู่แล้วในฐานข้อมูลก่อนสร้างใหม่ เพื่อประหยัดเวลาและทรัพยากร

## การทำงาน

### 1. API Endpoint: `/api/gensite/check-existing`
- **Method**: POST
- **Parameters**: 
  - `projectId`: ID ของโปรเจกต์
  - `userId`: ID ของผู้ใช้ (optional)
- **Response**: 
  - `success`: boolean
  - `data`: ข้อมูล Generation ที่มีอยู่แล้ว (ถ้ามี)
  - `message`: ข้อความแจ้งเตือน

### 2. การตรวจสอบไฟล์ในตาราง changes (GenerationFile)

#### เงื่อนไขการตรวจสอบ:
1. **มี Generation อยู่แล้ว**: เช็คจาก `projectId` และ `userId`
2. **มีไฟล์ใน changes**: เช็คว่ามี `GenerationFile` หรือไม่
3. **ไฟล์มีเนื้อหาครบถ้วน**: เช็คว่า `fileContent` ไม่เป็นค่าว่าง
4. **ไฟล์เป็นประเภท create**: เช็คว่า `changeType = 'create'`
5. **มีไฟล์ที่จำเป็น**: เช็คว่ามีไฟล์สำคัญ เช่น `index.html`, `package.json`, `src/App.tsx`

#### กรณีที่ต้องสร้างใหม่:
- ไม่มี Generation อยู่แล้ว
- มี Generation แต่ไม่มีไฟล์ใน changes
- มีไฟล์แต่เนื้อหาว่างเปล่า
- ไม่มีไฟล์ที่จำเป็นสำหรับเว็บไซต์

### 3. การทำงานใน AutoGenerateOnLoad.tsx

#### ขั้นตอนการทำงาน:
1. **เช็ค Generation ที่มีอยู่แล้ว**: เรียก API `/api/gensite/check-existing`
2. **ถ้ามี Generation และไฟล์ครบถ้วน**: 
   - โหลดไฟล์จาก Generation เดิม
   - แสดงข้อความ "โหลดเว็บไซต์ที่มีอยู่แล้ว"
   - บันทึกข้อมูลลง localStorage
3. **ถ้าไม่มี Generation หรือไฟล์ไม่ครบถ้วน**: 
   - สร้าง Generation ใหม่ผ่าน `/api/gensite`
   - แสดงข้อความ "สร้างสำเร็จแล้ว"

#### ข้อมูลที่เก็บใน localStorage:
```json
{
  "files": [...],
  "projectStructure": {...},
  "fileCount": number,
  "generatedAt": "ISO string",
  "generationId": "string",
  "isExisting": boolean
}
```

## ฐานข้อมูล

### ตาราง Generation
- `id`: Primary key
- `projectId`: ID ของโปรเจกต์
- `userId`: ID ของผู้ใช้
- `promptJson`: ข้อมูล prompt ที่ใช้สร้าง
- `createdAt`: วันที่สร้าง

### ตาราง GenerationFile
- `id`: Primary key
- `generationId`: Foreign key ไปยัง Generation
- `filePath`: เส้นทางไฟล์
- `fileContent`: เนื้อหาไฟล์
- `changeType`: ประเภทการเปลี่ยนแปลง (create/update/delete)

## ข้อดี
1. **ประหยัดเวลา**: ไม่ต้องสร้างใหม่ทุกครั้ง
2. **ประหยัดทรัพยากร**: ลดการใช้ AI tokens
3. **ประสบการณ์ผู้ใช้ที่ดีขึ้น**: โหลดเร็วขึ้น
4. **ประวัติการสร้าง**: เก็บประวัติการสร้างเว็บไซต์

## การใช้งาน
ระบบจะทำงานอัตโนมัติเมื่อ:
- มี `promptJson` 
- มี `projectId`
- Component ยังไม่เคยรัน (`hasRunRef.current = false`)

ไม่ต้องทำอะไรเพิ่มเติม ระบบจะเช็คและโหลดข้อมูลเดิมอัตโนมัติ
