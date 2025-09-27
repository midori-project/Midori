# Template + Placeholder System - คู่มือการใช้งาน

## ภาพรวม

ระบบ Template + Placeholder ใน Midori ช่วยให้คุณสร้าง template ที่มี placeholder และให้ AI เติมค่าต่างๆ อัตโนมัติ รวมถึง Tailwind classes, ข้อความภาษาไทย, และรูปภาพ

## Placeholder Types

### 1. `<tw/>` - Tailwind Classes
ใช้สำหรับ Tailwind CSS classes ที่จะถูกเติมโดย AI ตาม theme

```tsx
<div className="<tw/>">  // AI จะเติม เช่น "bg-blue-600 text-white rounded-lg p-4"
  <button className="<tw/>">  // AI จะเติม เช่น "bg-amber-400 hover:bg-amber-500 text-black px-6 py-2 rounded-xl"
    Click me
  </button>
</div>
```

### 2. `<text/>` - ข้อความภาษาไทย
ใช้สำหรับข้อความที่จะถูกเติมโดย AI ตาม context และ tone

```tsx
<h1 className="<tw/>">
  <text/>  // AI จะเติม เช่น "ยินดีต้อนรับสู่ร้านกาแฟของเรา"
</h1>
<p className="<tw/>">
  <text/>  // AI จะเติม เช่น "กาแฟคุณภาพดี ราคาเป็นมิตร"
</p>
```

### 3. `<img/>` - รูปภาพ
ใช้สำหรับ URL รูปภาพที่จะถูกสร้างโดย AI จาก imagery keywords

```tsx
<img 
  src="<img/>"  // AI จะเติม เช่น "https://source.unsplash.com/600x400/?coffee%20latte%20art&sig=cafedelight"
  alt="<text/>"  // AI จะเติม เช่น "กาแฟลาเต้อาร์ต"
  className="<tw/>"  // AI จะเติม เช่น "w-full h-64 object-cover rounded-lg"
/>
```

### 4. `<data key="..."/>` - ข้อมูลโครงสร้าง
ใช้สำหรับข้อมูลโครงสร้างที่ซับซ้อน เช่น เมนู, รายการสินค้า

```tsx
const menuItems = <data key="menuItems"/>;  // AI จะเติม array ของ menu items

{menuItems.map((item: any) => (
  <div key={item.id}>
    <h3><text/></h3>  // AI จะเติม ชื่อเมนู
    <p><text/></p>    // AI จะเติม คำอธิบาย
    <span><text/></span>  // AI จะเติม ราคา
  </div>
))}
```

## การสร้าง Template

### 1. สร้าง JSON Template

```json
{
  "template": {
    "name": "Coffee Shop Template",
    "category": "Restaurant",
    "version": "1.0.0",
    "files": [
      {
        "path": "src/components/Hero.tsx",
        "content": "import React from 'react';\n\nconst Hero = () => {\n  return (\n    <div className=\"<tw/>\">\n      <h1 className=\"<tw/>\">\n        <text/>\n      </h1>\n      <p className=\"<tw/>\">\n        <text/>\n      </p>\n      <img src=\"<img/>\" alt=\"<text/>\" className=\"<tw/>\" />\n    </div>\n  );\n};\n\nexport default Hero;"
      }
    ],
    "placeholders": {
      "theme": "modern cozy; primary:sky-600; accent:amber-400",
      "imagery": "coffee latte art, coffee beans",
      "tone": "thai-casual"
    }
  }
}
```

### 2. อัพโหลดผ่าน UI

1. ไปที่ `/dashboard/templates`
2. เลือกแท็บ "อัพโหลด Template"
3. วาง JSON template ใน textarea
4. กดปุ่ม "อัพโหลด Template"

### 3. ทดสอบ Preview

1. เลือกแท็บ "Template Gallery"
2. คลิก "Preview" บน template ที่ต้องการ
3. ดูผลลัพธ์ที่ AI เติม placeholder

## Theme Configuration

### Theme String Format

```
modern cozy; primary:sky-600; accent:amber-400; radius:xl; elevation:lg; grid:3; header:underlined; font:inter; imagery:"coffee latte art"; tone:thai-casual
```

### Theme Parameters

- **Style**: `modern`, `minimal`, `elegant`, `cozy`
- **Primary Color**: `primary:sky-600`, `primary:blue-500`, etc.
- **Accent Color**: `accent:amber-400`, `accent:green-500`, etc.
- **Border Radius**: `radius:sm`, `radius:md`, `radius:lg`, `radius:xl`
- **Elevation**: `elevation:sm`, `elevation:md`, `elevation:lg`, `elevation:xl`
- **Grid**: `grid:2`, `grid:3`, `grid:4`
- **Header Style**: `header:underlined`, `header:centered`, `header:minimal`
- **Font**: `font:inter`, `font:roboto`, `font:poppins`
- **Imagery**: `imagery:"coffee latte art, cafe interior"`
- **Tone**: `tone:thai-casual`, `tone:thai-formal`, `tone:english-casual`

## API Usage

### 1. อัพโหลด Template

```bash
POST /api/template/placeholder
Content-Type: application/json

{
  "template": {
    "name": "My Template",
    "category": "Business",
    "version": "1.0.0",
    "files": [...],
    "placeholders": {...}
  }
}
```

### 2. เติม Placeholder

```bash
POST /api/template/placeholder
Content-Type: application/json

{
  "templateId": "template-id",
  "theme": "modern cozy; primary:sky-600; accent:amber-400",
  "projectId": "project-id",
  "action": "fill_placeholders"
}
```

### 3. ตรวจสอบ Placeholder

```bash
POST /api/template/placeholder
Content-Type: application/json

{
  "templateId": "template-id",
  "action": "validate"
}
```

## Best Practices

### 1. Template Design

- ใช้ placeholder ในตำแหน่งที่เหมาะสม
- ไม่ใช้ placeholder มากเกินไปในไฟล์เดียว
- ใส่ placeholder ใน context ที่ชัดเจน

### 2. Theme Design

- ใช้ theme ที่สอดคล้องกับ business type
- กำหนด imagery keywords ที่เฉพาะเจาะจง
- เลือก tone ที่เหมาะสมกับ target audience

### 3. Content Strategy

- ให้ AI เติมข้อความภาษาไทยที่เหมาะสม
- ใช้รูปภาพที่เกี่ยวข้องกับ business
- ตรวจสอบผลลัพธ์ก่อนใช้งานจริง

## Troubleshooting

### 1. Template ไม่แสดงผล

- ตรวจสอบ JSON format
- ตรวจสอบ placeholder syntax
- ตรวจสอบ file paths

### 2. AI ไม่เติม placeholder

- ตรวจสอบ theme configuration
- ตรวจสอบ API key
- ตรวจสอบ network connection

### 3. ผลลัพธ์ไม่ตรงกับที่ต้องการ

- ปรับ theme parameters
- ปรับ imagery keywords
- ปรับ tone setting

## Examples

ดูตัวอย่าง template ในไฟล์ `example-template.json` สำหรับ reference

## Support

หากมีปัญหาหรือคำถาม สามารถติดต่อทีมพัฒนาได้ที่:
- Email: support@midori.ai
- Discord: Midori Community
- GitHub Issues: Midori Repository
