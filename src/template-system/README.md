# Template System

ระบบจัดการ Template สำหรับ Midori ที่ใช้ AI เติมข้อมูลลงใน template อย่างถูกต้อง

## โครงสร้าง

```
template-system/
├── core/                    # ระบบหลัก
│   ├── TemplateProcessor.ts # ประมวลผล template
│   ├── PlaceholderReplacer.ts # แทนที่ placeholder
│   ├── AIContentGenerator.ts # AI เติมข้อมูล
│   ├── ThemeEngine.ts       # จัดการธีม
│   ├── SlotManager.ts       # จัดการ slot data
│   └── TemplateValidator.ts # ตรวจสอบ template
├── engines/                 # เครื่องมือประมวลผล
│   ├── ExportEngine.ts      # ส่งออกไฟล์
│   └── PreviewEngine.ts     # ตัวอย่าง
├── types/                   # Type definitions
│   ├── Template.ts          # Template types
│   ├── Placeholder.ts       # Placeholder types
│   └── Theme.ts             # Theme types
├── utils/                   # ฟังก์ชันช่วยเหลือ
│   ├── FileUtils.ts         # จัดการไฟล์
│   ├── ValidationUtils.ts   # ตรวจสอบข้อมูล
│   └── ThemeUtils.ts        # ฟังก์ชันธีม
├── templates/               # Template ต้นแบบ
│   └── online-shop-enhanced.json
├── examples/                # ตัวอย่างการใช้งาน
│   ├── basic-usage.ts
│   └── advanced-usage.ts
└── tests/                   # การทดสอบ
    ├── TemplateProcessor.test.ts
    └── PlaceholderReplacer.test.ts
```

## การใช้งาน

### การใช้งานพื้นฐาน

```typescript
import { TemplateEngine } from './core/TemplateEngine';

const engine = new TemplateEngine();
const result = await engine.processTemplate('online-shop-enhanced', {
  brandName: 'ร้านหมูปิ้งอร่อย',
  theme: 'cozy',
  content: {
    businessType: 'food',
    specialty: 'หมูปิ้ง',
    location: 'กรุงเทพฯ'
  }
});
```

### การใช้งาน AI Content Generator โดยตรง

```typescript
import { AIContentGenerator } from './core/AIContentGenerator';

const aiGenerator = new AIContentGenerator();
const content = await aiGenerator.generateContent(template, {
  brandName: 'ร้านก๋วยเตี๋ยวเจ้าเก่า',
  theme: 'cozy',
  content: {
    businessType: 'food',
    cuisine: 'thai',
    specialty: 'ก๋วยเตี๋ยว'
  }
});

console.log(content.heroTitle); // "ยินดีต้อนรับสู่ร้านก๋วยเตี๋ยวเจ้าเก่า"
console.log(content.features); // ฟีเจอร์ที่ AI สร้างขึ้น
```

### การทดสอบ AI Content Generation

```typescript
import { aiContentGenerationDemo } from './examples/ai-content-generation-demo';

// รันตัวอย่างการสร้างเนื้อหาด้วย AI
await aiContentGenerationDemo();
```

## คุณสมบัติหลัก

- ✅ **AI Content Generation** - ใช้ AI API จริงสำหรับสร้างเนื้อหา
- ✅ **Placeholder Replacement** - แทนที่ placeholder 5 ประเภท
- ✅ **Theme Management** - รองรับ 3 ธีม: Modern, Cozy, Minimal
- ✅ **Slot-based Data Filling** - เติมข้อมูลในแต่ละส่วนของเว็บไซต์
- ✅ **Template Validation** - ตรวจสอบความถูกต้องตาม constraints
- ✅ **Export to ZIP/Files** - ส่งออกเป็น ZIP, Files, หรือ JSON
- ✅ **Preview Generation** - สร้างตัวอย่างผลลัพธ์
- ✅ **Business Type Detection** - วิเคราะห์ประเภทธุรกิจอัตโนมัติ
- ✅ **Fallback System** - ระบบสำรองเมื่อ AI API ล้มเหลว
