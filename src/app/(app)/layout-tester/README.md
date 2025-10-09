# Layout Tester - Frontend-V2

หน้าทดสอบ Layout Variants สำหรับ Frontend-V2 Agent

## 🎯 วัตถุประสงค์

ทดสอบและเปรียบเทียบ layout variants ต่างๆ ของ Frontend-V2 Agent ผ่าน Web UI

## 🚀 การใช้งาน

### เข้าถึงหน้าทดสอบ

```
http://localhost:3000/layout-tester
```

### ขั้นตอนการทดสอบ

1. **เลือก Layout** - คลิกที่ layout card ที่ต้องการทดสอบ
2. **เพิ่ม Keywords** (Optional) - ใส่ keywords เพิ่มเติมถ้าต้องการ
3. **คลิก "สร้างเว็บไซต์เลย"** - รอระบบ generate (5-15 วินาที)
4. **ดูผลลัพธ์** - ตรวจสอบไฟล์ที่สร้าง, ขนาด, และรายละเอียดต่างๆ
5. **รอ Daytona Preview** - ระบบจะสร้าง preview อัตโนมัติ (30-60 วินาที)
6. **เปิด Preview** - คลิก "🌐 เปิด Preview ในแท็บใหม่" เพื่อดูเว็บไซต์จริง

## 🎨 Layout Variants ที่มี

### 1. 🔷 Modern (Split Layout)
- **Variant**: `hero-split`
- **Colors**: Blue & Indigo
- **Vibe**: ทันสมัย สะอาดตา
- **Best For**: Cafe, Fusion Restaurant
- **Keywords**: modern, contemporary, trendy

### 2. 💎 Luxury (Fullscreen Layout)
- **Variant**: `hero-fullscreen`
- **Colors**: Gray & Amber
- **Vibe**: หรูหรา พรีเมียม
- **Best For**: Fine Dining, Michelin
- **Keywords**: luxury, fine dining, premium, elegant

### 3. ⬜ Minimal (Clean Layout)
- **Variant**: `hero-minimal`
- **Colors**: Gray & Stone
- **Vibe**: เรียบง่าย สะอาด
- **Best For**: Japanese, Simple Cafe
- **Keywords**: minimal, simple, clean

### 4. 🍕 Casual (Cards Layout)
- **Variant**: `hero-cards`
- **Colors**: Orange & Yellow
- **Vibe**: อบอุ่น เป็นกันเอง
- **Best For**: Family, Street Food
- **Keywords**: casual, friendly, family, cozy

### 5. 🍽️ Standard (Stats Layout)
- **Variant**: `hero-stats`
- **Colors**: Orange & Red
- **Vibe**: ทั่วไป มาตรฐาน
- **Best For**: ร้านอาหารทั่วไป
- **Keywords**: restaurant, food

## 📊 ข้อมูลที่แสดง

### สถิติหลัก
- จำนวนไฟล์ที่สร้าง
- ขนาดรวมของโปรเจค
- จำนวน Blocks ที่ใช้
- สถานะ AI Content Generation

### รายละเอียด
- Business Category ที่ใช้
- Template ที่ใช้
- Blocks ที่ถูก generate
- รายการไฟล์ทั้งหมด (พร้อมขนาด)

### เวลาในการสร้าง
- แสดงเวลาที่ใช้ในการ generate (วินาที)

### 👀 Daytona Preview (ใหม่!)

**สถานะ Preview:**
- 🟡 **Creating** - กำลังสร้าง sandbox (30-60 วินาที)
- 🟢 **Running** - Preview พร้อมใช้งาน
- 🔴 **Error** - เกิดข้อผิดพลาด

**ข้อมูลที่แสดง:**
- Sandbox ID
- Preview URL (พร้อม authentication token)
- สถานะ real-time

**Actions:**
- 🚀 **สร้าง Daytona Preview** - สร้าง preview (auto-start หลัง generate)
- 🌐 **เปิด Preview ในแท็บใหม่** - เปิดเว็บไซต์ที่สร้างในแท็บใหม่
- 🛑 **Stop** - หยุด sandbox
- 🔄 **ลองใหม่อีกครั้ง** - ถ้า preview ล้มเหลว

**Timeline:**
```
1. Generate Website (5-15s) → ✅ สำเร็จ
2. Auto-start Preview (0.5s delay) → ⏳ เริ่มสร้าง
3. Create Daytona Sandbox (30-60s) → 🟢 พร้อมใช้งาน
4. Click "เปิด Preview" → 🌐 เปิดในแท็บใหม่
```

## 🔧 Technical Details

### API Endpoint
```
POST /api/frontend-v2/generate
```

### Request Body
```typescript
{
  taskId: string;
  taskType: 'generate_website';
  businessCategory: string;
  keywords: string[];
  customizations?: object;
  includePreview?: boolean;
  includeProjectStructure?: boolean;
  aiSettings?: {
    model: string;
    temperature: number;
    language: string;
  };
}
```

### Response
```typescript
{
  success: boolean;
  result: {
    businessCategory: string;
    templateUsed: string;
    blocksGenerated: string[];
    aiContentGenerated: boolean;
  };
  files: Array<{
    path: string;
    content: string;
    type: string;
    size: number;
  }>;
  performance: {
    generationTime: number;
    totalSize: string;
  };
  metadata: {
    executionTime: number;
    timestamp: string;
  };
}
```

## 🎯 Use Cases

### 1. เปรียบเทียบ Layouts
เลือกทดสอบหลาย layouts เพื่อดูความแตกต่าง

### 2. ทดสอบ Keywords
ใส่ keywords ต่างๆ เพื่อดูว่า AI generate content อย่างไร

### 3. ตรวจสอบประสิทธิภาพ
ดูเวลาในการ generate และขนาดไฟล์

### 4. Validate Output
ตรวจสอบว่าไฟล์ที่สร้างถูกต้องครบถ้วน

## 💡 Tips

1. **เลือก Layout ที่เหมาะสม** - แต่ละ layout มีจุดเด่นต่างกัน
2. **ใส่ Keywords ที่ดี** - Keywords ที่ชัดเจนจะทำให้ AI generate ได้ดีขึ้น
3. **ทดสอบหลายครั้ง** - AI อาจให้ผลลัพธ์ต่างกันในแต่ละครั้ง
4. **ดูรายละเอียด** - ตรวจสอบไฟล์ที่สร้างให้ครบถ้วน

## 🐛 Troubleshooting

### ปัญหา: Generation ล้มเหลว
- ตรวจสอบ OpenAI API key
- ตรวจสอบ network connection
- ดู console logs สำหรับ error details

### ปัญหา: ไฟล์ไม่ครบ
- ตรวจสอบ business category
- ตรวจสอบ template configuration

### ปัญหา: AI content ไม่ถูกสร้าง
- ตรวจสอบ aiSettings
- ตรวจสอบ keywords

## 🔐 Security

- API endpoint ควรมี authentication ในการใช้งานจริง
- Rate limiting ควรถูก implement
- Input validation ทำอยู่แล้วใน API

## 📝 Notes

- หน้านี้ใช้สำหรับ development และ testing เท่านั้น
- สำหรับ production ควรมี proper authentication
- Results จะแตกต่างกันเพราะ AI generation

---

**Happy Testing! 🚀**

