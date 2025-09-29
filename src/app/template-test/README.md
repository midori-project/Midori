# 🧪 Template System Test Page

หน้าทดสอบครบถ้วนสำหรับ Template System ของ Midori

## 🚀 การใช้งาน

### **1. เข้าถึงหน้า Test**
```
http://localhost:3000/template-test
```

### **2. ตั้งค่า API Key**
```bash
# สร้างไฟล์ .env.local
echo "QUESTION_API_KEY=sk-your-openai-api-key-here" > .env.local

# หรือตั้งค่าใน environment variables
export QUESTION_API_KEY=sk-your-openai-api-key-here
```

### **3. เริ่ม Development Server**
```bash
npm run dev
```

## 🧪 การทดสอบที่มี

### **การทดสอบทั้งหมด**
- กดปุ่ม "🧪 รันการทดสอบทั้งหมด" เพื่อทดสอบทุกส่วน

### **การทดสอบเฉพาะ**
- **🤖 ทดสอบ AI Content** - ทดสอบการสร้างเนื้อหาด้วย AI
- **🎨 ทดสอบ Tailwind AI** - ทดสอบการสร้าง Tailwind classes
- **🔄 ทดสอบ PlaceholderReplacer** - ทดสอบการแทนที่ placeholders

## 📊 ผลลัพธ์การทดสอบ

### **API Key Status**
- ✅ **พบแล้ว** - QUESTION_API_KEY พบและพร้อมใช้งาน
- ❌ **ไม่พบ** - ต้องตั้งค่า QUESTION_API_KEY

### **Test Results**
- ✅ **ผ่าน** - การทดสอบสำเร็จ
- ❌ **ล้มเหลว** - การทดสอบล้มเหลว พร้อม error message
- ⏱️ **เวลา** - เวลาที่ใช้ในการทดสอบ (milliseconds)

### **สถิติ**
- **อัตราความสำเร็จ** - เปอร์เซ็นต์การทดสอบที่ผ่าน
- **เวลาเฉลี่ย** - เวลาเฉลี่ยต่อการทดสอบ
- **เวลารวม** - เวลารวมทั้งหมด

## 🔧 การทำงาน

### **Architecture**
```
Frontend (React) → API Route → Server-Side Testing
     ↓                ↓              ↓
  UI Display    /api/template-test   Core Classes
```

### **API Endpoints**
- `POST /api/template-test` - รันการทดสอบ
- `GET /api/check-api-key` - ตรวจสอบ API Key

### **Test Types**
- `all` - ทดสอบทั้งหมด
- `ai-content` - ทดสอบ AI Content Generator
- `tailwind-ai` - ทดสอบ Tailwind AI
- `placeholder-replacer` - ทดสอบ PlaceholderReplacer
- `template-processor` - ทดสอบ TemplateProcessor
- `server-template-engine` - ทดสอบ ServerTemplateEngine
- `api-key` - ตรวจสอบ API Key

## 🐛 การแก้ไขปัญหา

### **API Key ไม่พบ**
```bash
# ตรวจสอบ environment variables
echo $QUESTION_API_KEY

# ตั้งค่าใหม่
export QUESTION_API_KEY=sk-your-key-here
```

### **Build Error: Module not found 'fs'**
- ✅ **แก้ไขแล้ว** - ใช้ ServerTemplateEngine แทน TemplateEngine
- ✅ **รองรับ** - ทั้ง server-side และ client-side operations

### **TypeScript Errors**
```bash
# ตรวจสอบ types
npx tsc --noEmit

# รันการทดสอบ
npm run test:template
```

## 📚 ไฟล์ที่เกี่ยวข้อง

### **Frontend**
- `src/app/template-test/page.tsx` - หน้า UI หลัก
- `src/app/api/check-api-key/route.ts` - API ตรวจสอบ API Key

### **Backend**
- `src/app/api/template-test/route.ts` - API การทดสอบ
- `src/template-system/core/ServerTemplateEngine.ts` - Server-side Template Engine

### **Core Classes**
- `src/template-system/core/AIContentGenerator.ts` - AI Content Generation
- `src/template-system/core/PlaceholderReplacer.ts` - Placeholder Replacement
- `src/template-system/core/TemplateProcessor.ts` - Template Processing

## 🎯 ข้อมูลทดสอบ

### **Test Template**
- **ชื่อ**: Coffee Shop Test Template
- **ประเภท**: ร้านกาแฟ
- **Placeholders**: `<tw/>`, `<text/>`, `<img/>`
- **Slots**: heroTitle, heroSubtitle, ctaLabel

### **Test User Data**
- **Brand Name**: ร้านกาแฟทดสอบ
- **Theme**: cozy
- **Colors**: Primary (#8B4513), Secondary (#D2691E)

## 🚀 การพัฒนาต่อ

### **เพิ่มการทดสอบใหม่**
1. เพิ่ม test function ใน API route
2. เพิ่ม test type ใน switch case
3. เพิ่มปุ่มใน UI (ถ้าต้องการ)

### **ปรับปรุง UI**
1. เพิ่ม charts/graphs สำหรับสถิติ
2. เพิ่ม export ผลลัพธ์
3. เพิ่ม real-time monitoring

### **เพิ่ม Features**
1. การทดสอบแบบ batch
2. การเปรียบเทียบผลลัพธ์
3. การบันทึกผลลัพธ์ลง database

## 📞 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ console logs
2. ตรวจสอบ API responses
3. ตรวจสอบ environment variables
4. ดู documentation ใน `src/template-system/tests/README.md`
