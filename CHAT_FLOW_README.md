# Chat Flow System - Midori

## ภาพรวมระบบ

ระบบนี้สร้างขึ้นเพื่อให้ผู้ใช้สามารถพิมพ์ prompt ในหน้าแรก แล้วระบบจะสร้างคำถามแบบไดนามิกจาก AI และแสดงทีละข้อในหน้า chat โดยใช้ OpenAI API ที่มีระบบ session management

## การทำงานของระบบ

### 1. หน้าแรก (`page.tsx`)
- ผู้ใช้พิมพ์ prompt ใน ChatInput component
- เมื่อกดส่ง ระบบจะ:
  - สร้าง project ใหม่ในฐานข้อมูล
  - นำทางไปยังหน้า `/info/[projectId]?prompt=[userPrompt]`

### 2. หน้า Info (`info/[id]/page.tsx`)
- รับ project ID และ prompt จาก URL
- ส่งข้อมูลไปยัง InfoChatClient component

### 3. InfoChatClient Component
- ใช้ `/api/openai` endpoint เพื่อ:
  - สร้าง session ใหม่และวิเคราะห์ prompt เริ่มต้น
  - สร้างคำถามแบบไดนามิกจากผลการวิเคราะห์
  - จัดการการสนทนาทีละขั้นตอน (initial → analysis → questions → final)
- แสดงคำถามทีละข้อ
- ผู้ใช้ตอบคำถามทีละข้อ
- เมื่อตอบครบทุกคำถาม จะสร้างไฟล์ JSON สุดท้าย

## ไฟล์ที่เกี่ยวข้อง

### Frontend Components
- `src/app/page.tsx` - หน้าแรกที่มี ChatInput
- `src/app/info/[id]/page.tsx` - หน้า info ที่แสดง InfoChatClient
- `src/components/InfoChat/InfoChatClient.tsx` - Component หลักสำหรับ chat

### API Endpoints
- `src/app/api/projects/route.ts` - สร้างและดึงข้อมูล project
- `src/app/api/openai/route.ts` - AI service หลักสำหรับการสนทนาและสร้างคำถาม

### Types
- `src/types/chat.ts` - TypeScript types และ Zod schemas สำหรับ chat system

## การตั้งค่า

### Environment Variables
ต้องตั้งค่าใน `.env.local`:
```env
QUESTION_API_KEY=your_openai_api_key_here
DATABASE_URL=your_database_url_here
```

### Database
ต้องมี Prisma schema ที่มี:
- `User` model
- `Project` model (เชื่อมโยงกับ User)

## การใช้งาน

1. เปิดหน้าแรก (`/`)
2. พิมพ์ prompt ที่ต้องการ (เช่น "ต้องการสร้างเว็บไซต์ร้านอาหาร")
3. กดส่ง
4. ระบบจะนำทางไปยังหน้า chat
5. ตอบคำถามทีละข้อที่ AI สร้างขึ้น
6. เมื่อตอบครบ จะสร้างไฟล์ JSON สุดท้าย

## ฟีเจอร์

- **Session Management**: จัดการการสนทนาด้วย session ID
- **Dynamic Questions**: คำถามถูกสร้างจาก AI ตาม prompt ของผู้ใช้
- **Sequential Flow**: ตอบคำถามทีละข้อ
- **Progress Tracking**: แสดงความคืบหน้าในการตอบคำถาม
- **Error Handling**: จัดการข้อผิดพลาดอย่างเหมาะสม
- **Final JSON Generation**: สร้างไฟล์ JSON สุดท้ายเมื่อตอบครบ

## ขั้นตอนการทำงานของ AI

### 1. Initial Step
- วิเคราะห์ prompt เริ่มต้น
- ระบุประเภทโปรเจกต์, ฟีเจอร์หลัก, กลุ่มเป้าหมาย
- สร้างคำถาม 5 ข้อเพื่อปรับปรุง prompt

### 2. Analysis Step
- ผู้ใช้ตอบคำถามทีละข้อ
- AI สามารถอธิบายคำถามเพิ่มเติมได้
- ติดตามความคืบหน้า

### 3. Questions Step
- สร้างไฟล์ JSON สุดท้ายจากข้อมูลทั้งหมด

### 4. Final Step
- แสดงผลลัพธ์สุดท้าย

## การพัฒนาต่อ

- เพิ่มระบบ authentication
- บันทึกคำตอบของผู้ใช้ในฐานข้อมูล
- เพิ่มการปรับแต่งคำถามตามคำตอบก่อนหน้า
- เพิ่มการ export ไฟล์ JSON
- เพิ่มการแชร์ session
