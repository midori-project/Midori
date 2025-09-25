# Template Slots System สำหรับ Frontend Agent

ระบบ Template Slots ที่ช่วยให้ Frontend Agent สามารถจัดการ templates, เติมข้อมูลด้วยระบบสุ่ม, และสร้างไฟล์ใหม่ได้อย่างอัตโนมัติ

## 🎯 วัตถุประสงค์

ระบบนี้ถูกสร้างขึ้นเพื่อให้ Frontend Agent สามารถ:
- จัดการ templates และ slots ได้
- เติมข้อมูลใน slots ด้วยระบบสุ่ม (เติมทุกช่องที่มี slot)
- สร้างข้อมูลจำลอง (mock data) สำหรับข้อมูลที่อยู่นอก template slots
- Export เป็นไฟล์ใหม่ (ZIP หรือ JSON)

## 📁 โครงสร้างไฟล์

```
tools/
├── template-service.ts        # จัดการ templates และ slots
├── slots-filler.ts           # เติม slots ด้วยระบบสุ่ม
├── export-service.ts         # สร้างไฟล์ใหม่
├── mock-profiles.ts          # ข้อมูลจำลอง
├── template-slots-tool.ts    # Tool หลักสำหรับ agent
├── template-slots-demo.ts    # ตัวอย่างการใช้งาน
└── README.md                 # เอกสารนี้
```

## 🔧 การใช้งาน

### 1. เรียกใช้ Tool ผ่าน Frontend Agent

```typescript
import { template_slots_tool } from './template-slots-tool';

// ดูรายการ templates
const result = await template_slots_tool({
  action: 'list_templates',
  params: { category: 'restaurant' }
});

// เติม slots ด้วยระบบสุ่ม
const fillResult = await template_slots_tool({
  action: 'fill_slots',
  params: {
    templateKey: 'restaurant-basic',
    version: 1,
    requirements: {
      businessName: 'ร้านอาหารสยาม',
      primaryColor: '#ff6b6b'
    },
    includeMock: true,
    mockProfile: 'th-local-basic'
  }
});

// สร้าง bundle ไฟล์
const exportResult = await template_slots_tool({
  action: 'export_bundle',
  params: {
    templateKey: 'restaurant-basic',
    version: 1,
    filledSlots: fillResult.data.filledSlots,
    format: 'zip',
    fileName: 'my-restaurant'
  }
});
```

### 2. Flow ครบวงจร

```typescript
// ดำเนินการทั้งหมดในครั้งเดียว
const completeResult = await template_slots_tool({
  action: 'complete_flow',
  params: {
    templateKey: 'restaurant-basic',
    requirements: {
      businessName: 'ร้านอาหารสยาม',
      primaryColor: '#ff6b6b'
    },
    mockProfile: 'th-local-basic',
    exportFormat: 'zip',
    fileName: 'complete-restaurant'
  }
});
```

## 🎲 ระบบสุ่ม

ระบบจะเติม slots ที่ขาดหายไปด้วยข้อมูลสุ่มตามประเภท:

- **String**: ใช้ templates ที่เหมาะสมกับ context (เช่น title, cta, description)
- **Color**: เลือกจากชุดสีที่กำหนดไว้
- **Phone**: สร้างเบอร์โทรศัพท์ตามรูปแบบ
- **Email**: สร้างอีเมลตัวอย่าง
- **Boolean**: สุ่ม true/false

## 🎭 Mock Profiles

ระบบมี 3 mock profiles:

### 1. `th-local-basic`
สำหรับธุรกิจไทยในพื้นที่กรุงเทพฯ
```json
{
  "external.address": "123 สุขุมวิท, กรุงเทพฯ 10110",
  "external.openHours": "จันทร์-อาทิตย์ 08:00-20:00",
  "contact.email": "info@example.test",
  "social.facebook": "https://facebook.com/example",
  "social.instagram": "https://instagram.com/example",
  "social.line": "https://line.me/R/ti/p/example"
}
```

### 2. `global-basic`
สำหรับธุรกิจสากล
```json
{
  "external.address": "123 Main Street, Sample City, SC 12345",
  "external.openHours": "Mon-Fri 09:00-18:00",
  "contact.email": "info@example.com",
  "social.facebook": "https://facebook.com/example",
  "social.instagram": "https://instagram.com/example",
  "social.twitter": "https://twitter.com/example"
}
```

### 3. `random`
ข้อมูลสุ่มหลากหลายรูปแบบ

## 📋 Templates ที่รองรับ

### 1. `restaurant-basic`
สำหรับร้านอาหารทั่วไป
- Slots: brand.name, hero.title, hero.cta, theme.primary, contact.phone, contact.email, about.description, menu.highlight
- Aliases: businessName, primaryColor, ctaText, phone, email, title, description, menuHighlight

### 2. `cafe-modern`
สำหรับร้านกาแฟสมัยใหม่
- Slots: brand.name, hero.title, theme.primary, theme.secondary, coffee.specialty
- Aliases: businessName, primaryColor, secondaryColor, title, specialty

## 🔄 ลำดับความสำคัญการเติมข้อมูล

1. **overrides** (สูงสุด) - ข้อมูลที่ผู้ใช้กำหนดโดยตรง
2. **requirements** - ข้อมูลที่ผู้ใช้ส่งมา (ผ่าน aliases)
3. **defaults** - ค่าเริ่มต้นจาก template schema
4. **mock** - ข้อมูลจำลอง (ถ้าเปิดใช้)
5. **random** - ข้อมูลสุ่มสำหรับ slots ที่ยังขาด
6. **empty** (ต่ำสุด) - ค่าว่าง

## 🧪 การทดสอบ

รัน demo เพื่อทดสอบระบบ:

```bash
# ทดสอบระบบทั้งหมด
npx ts-node template-slots-demo.ts

# ทดสอบการสุ่ม
npx ts-node -e "import('./template-slots-demo').then(m => m.testRandomSlotFilling())"

# ทดสอบ mock profiles
npx ts-node -e "import('./template-slots-demo').then(m => m.testMockProfiles())"
```

## 📊 ผลลัพธ์

### Fill Slots Result
```typescript
{
  filledSlots: Record<string, any>,      // ข้อมูลที่เติมแล้วทั้งหมด
  mockedKeys: string[],                  // keys ที่ใช้ mock data
  validationReport: {
    errors: Array<{field, message, code}>,
    warnings: Array<{field, message}>
  },
  metadata: {
    templateKey: string,
    version: number,
    filledAt: string,
    mockProfile?: string,
    totalSlots: number,
    filledSlotsCount: number
  }
}
```

### Export Bundle Result
```typescript
{
  url: string,                           // URL สำหรับดาวน์โหลด
  size: number,                          // ขนาดไฟล์ (bytes)
  checksum: string,                      // checksum สำหรับตรวจสอบ
  contentType: string,                   // MIME type
  manifest: {
    template: {key, version},
    generatedAt: string,
    filledSlotsCount: number,
    mock: {used, profile, mockedKeys},
    constraintsHash: string,
    filesCount: number
  }
}
```

## 🔒 ความปลอดภัย

- ข้อมูล mock ไม่มีข้อมูลส่วนตัวจริง
- มีการ sanitize token replacement
- ตรวจสอบ size limits สำหรับไฟล์
- ใช้ deterministic seed สำหรับการสุ่ม

## 🚀 การใช้งานใน Frontend Agent

1. เพิ่ม `template_slots_tool` ใน `agent.yaml`
2. ใช้ `template_slots_fill` และ `template_export` ใน task types
3. เรียกใช้ผ่าน agent orchestration system

ระบบนี้จะช่วยให้ Frontend Agent สามารถสร้างเว็บไซต์จาก templates ได้อย่างอัตโนมัติ โดยเติมข้อมูลให้ครบถ้วนด้วยระบบสุ่มและ mock data ครับ
