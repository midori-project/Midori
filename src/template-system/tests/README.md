# 🧪 Template System Test Suite

ระบบทดสอบครบถ้วนสำหรับ Template System ของ Midori

## 📋 การทดสอบที่มี

### 1. **AI Content Generator Tests**
- ทดสอบการสร้างเนื้อหาด้วย AI สำหรับ placeholder แต่ละประเภท
- ทดสอบ Text, Image, Data, Slot, และ Tailwind CSS placeholders
- ทดสอบ Error Handling และ Fallback mechanisms

### 2. **PlaceholderReplacer Tests**
- ทดสอบการแทนที่ placeholders ใน template
- ทดสอบการทำงานร่วมกับ AI Content Generator
- ทดสอบการประมวลผลไฟล์ที่มี placeholders หลายประเภท

### 3. **TemplateProcessor Tests**
- ทดสอบการประมวลผล template ทั้งหมด
- ทดสอบการรวม AI content generation
- ทดสอบการสร้าง ProcessedTemplate

### 4. **TemplateEngine Tests**
- ทดสอบการทำงานของ Template Engine
- ทดสอบการ export และ file generation
- ทดสอบการจัดการ output directory

### 5. **Tailwind Documentation Tests**
- ทดสอบการอัปเดต Tailwind CSS documentation
- ทดสอบการเพิ่ม Common Patterns
- ทดสอบการโหลด documentation จากไฟล์/URL

## 🚀 วิธีใช้งาน

### **Option 1: ใช้ Web Interface**
```bash
# เริ่ม development server
npm run dev

# เปิดเบราว์เซอร์ไปที่
http://localhost:3000/template-test
```

### **Option 2: ใช้ Command Line**

#### รันการทดสอบทั้งหมด
```bash
npm run test:template
```

#### รันการทดสอบเฉพาะ
```bash
# ทดสอบ AI Content Generator
npm run test:template:ai

# ทดสอบ Tailwind AI
npm run test:template:tailwind

# ทดสอบ PlaceholderReplacer
npm run test:template:placeholder

# ทดสอบเฉพาะ (ใช้ชื่อการทดสอบ)
npm run test:template:single api-key
npm run test:template:single image-ai
npm run test:template:single template-processor
```

#### รันการทดสอบแบบ manual
```bash
# รันการทดสอบทั้งหมด
npx ts-node src/template-system/tests/template-system-test.ts

# รันการทดสอบเฉพาะ
npx ts-node src/template-system/tests/template-system-test.ts ai-content
npx ts-node src/template-system/tests/template-system-test.ts tailwind-ai
npx ts-node src/template-system/tests/template-system-test.ts placeholder-replacer
```

## 📊 การทดสอบที่มี

| การทดสอบ | คำอธิบาย | ใช้ AI |
|---------|---------|--------|
| `api-key` | ตรวจสอบ QUESTION_API_KEY | ❌ |
| `ai-content` | ทดสอบการสร้างเนื้อหาด้วย AI | ✅ |
| `tailwind-ai` | ทดสอบการสร้าง Tailwind classes | ✅ |
| `image-ai` | ทดสอบการสร้าง image URLs | ✅ |
| `placeholder-replacer` | ทดสอบการแทนที่ placeholders | ✅ |
| `template-processor` | ทดสอบการประมวลผล template | ✅ |
| `template-engine` | ทดสอบ Template Engine | ❌ |
| `tailwind-docs` | ทดสอบ Tailwind documentation | ❌ |
| `error-handling` | ทดสอบ Error handling | ✅ |

## 🔧 ข้อกำหนด

### **Environment Variables**
```bash
# จำเป็นสำหรับการทดสอบ AI
QUESTION_API_KEY=sk-your-openai-api-key-here
```

### **Dependencies**
```bash
# ติดตั้ง dependencies ที่จำเป็น
npm install

# ติดตั้ง ts-node สำหรับรัน TypeScript
npm install -g ts-node
```

## 📈 ผลลัพธ์การทดสอบ

### **Web Interface**
- แสดงผลลัพธ์แบบ real-time
- แสดง API Key status
- แสดงสถิติการทดสอบ
- แสดง error details

### **Command Line**
```
🚀 เริ่มต้นการทดสอบ Template System
============================================================

🧪 กำลังทดสอบ: API Key Check
✅ API Key Check - ผ่าน (15ms)

🧪 กำลังทดสอบ: AI Content Generator
✅ AI Content Generator - ผ่าน (1250ms)

🧪 กำลังทดสอบ: Tailwind AI
✅ Tailwind AI - ผ่าน (980ms)

============================================================
📊 สรุปผลการทดสอบ
============================================================
✅ ผ่าน: 8/8 (100%)
❌ ล้มเหลว: 0/8
⏱️ เวลาเฉลี่ย: 650ms
🕐 เวลารวม: 5200ms

🎉 การทดสอบเสร็จสิ้น!
```

## 🐛 การแก้ไขปัญหา

### **API Key ไม่พบ**
```bash
# ตรวจสอบ environment variables
echo $QUESTION_API_KEY

# หรือสร้างไฟล์ .env.local
echo "QUESTION_API_KEY=sk-your-key-here" > .env.local
```

### **TypeScript Errors**
```bash
# ตรวจสอบ TypeScript configuration
npx tsc --noEmit

# รันการทดสอบด้วย ts-node
npx ts-node --transpile-only src/template-system/tests/template-system-test.ts
```

### **Module Not Found**
```bash
# ตรวจสอบ path imports
# ใช้ relative paths หรือ absolute paths ที่ถูกต้อง
```

## 📝 การเพิ่มการทดสอบใหม่

### **1. เพิ่มการทดสอบใน TemplateSystemTester**
```typescript
private async testNewFeature(): Promise<any> {
  // การทดสอบของคุณ
  return { result: 'success' };
}
```

### **2. เพิ่มใน testMap**
```typescript
const testMap: Record<string, () => Promise<any>> = {
  // ... existing tests
  'new-feature': () => this.testNewFeature()
};
```

### **3. เพิ่มใน runAllTests**
```typescript
const tests = [
  // ... existing tests
  { name: 'New Feature', fn: () => this.testNewFeature() }
];
```

## 🎯 Best Practices

1. **ใช้ async/await** สำหรับการทดสอบที่ใช้ AI
2. **ตรวจสอบ API Key** ก่อนรันการทดสอบ AI
3. **ใช้ try/catch** สำหรับ error handling
4. **แสดงผลลัพธ์ที่ชัดเจน** ทั้ง success และ error cases
5. **วัดเวลา** สำหรับ performance testing
6. **ใช้ข้อมูลทดสอบที่สมจริง** (realistic test data)

## 📚 เอกสารเพิ่มเติม

- [Template System Documentation](../README.md)
- [AI Content Generator](../core/AIContentGenerator.ts)
- [PlaceholderReplacer](../core/PlaceholderReplacer.ts)
- [TemplateProcessor](../core/TemplateProcessor.ts)
- [TemplateEngine](../core/TemplateEngine.ts)
