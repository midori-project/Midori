# Frontend-V2 Demo Scripts

ไฟล์ demo สำหรับทดสอบการทำงานของ Frontend-V2 Agent

## 📁 ไฟล์ Demo

### 1. `layout-variants-demo.ts`
**ทดสอบ Layout Variants อัตโนมัติ**

รันการทดสอบทั้งหมด 5 layouts พร้อมกัน:
- Restaurant Modern (Split Layout)
- Restaurant Luxury (Fullscreen Layout)
- Restaurant Minimal (Clean Layout)
- Restaurant Casual (Cards Layout)
- Auto-Detection (ให้ AI เลือก)

**วิธีใช้:**
```bash
cd src/midori/agents/frontend-v2
npx ts-node demo/layout-variants-demo.ts
```

**ผลลัพธ์:**
- แสดงผลการทดสอบแต่ละ layout
- สรุปจำนวนไฟล์ที่สร้าง
- แสดง preview ของ Hero component
- สถิติการ generation

---

### 2. `interactive-layout-selector.ts`
**เลือก Layout แบบ Interactive**

เครื่องมือ CLI แบบ interactive ให้เลือก layout ที่ต้องการทดสอบ

**วิธีใช้:**
```bash
cd src/midori/agents/frontend-v2
npx ts-node demo/interactive-layout-selector.ts
```

**Features:**
- 🎨 เมนูเลือก layout แบบ visual
- 🔑 เพิ่ม keywords เอง
- 🤖 โหมด Auto-detection
- 📊 แสดงผลลัพธ์แบบละเอียด
- 🔄 สามารถ generate หลายครั้งติดกัน
- 📄 แสดง preview ของ code

**ตัวอย่าง:**
```
╔════════════════════════════════════════════════════════════════╗
║     🎨 Frontend-V2 Interactive Layout Selector                ║
╚════════════════════════════════════════════════════════════════╝

เลือก Layout ที่คุณต้องการ:

1. 🔷 Modern (Split Layout)
   Variant: hero-split
   Colors: Blue & Indigo
   Vibe: ทันสมัย สะอาดตา
   Best For: Cafe, Fusion Restaurant

2. 💎 Luxury (Fullscreen Layout)
   Variant: hero-fullscreen
   Colors: Gray & Amber
   Vibe: หรูหรา พรีเมียม
   Best For: Fine Dining, Michelin Restaurant

...

👉 Enter your choice (0-6): 
```

---

### 3. `chat-ai-demo.js` (Existing)
Demo การใช้งาน Chat AI

### 4. `unified-orchestrator-demo.js` (Existing)
Demo การใช้งาน Unified Orchestrator

---

## 🚀 Quick Start

### ติดตั้ง Dependencies (ถ้ายังไม่ได้ติดตั้ง)

```bash
cd src/midori/agents/frontend-v2
npm install
```

### รัน Layout Variants Demo (อัตโนมัติ)

```bash
npx ts-node demo/layout-variants-demo.ts
```

### รัน Interactive Selector (เลือกเอง)

```bash
npx ts-node demo/interactive-layout-selector.ts
```

---

## 📊 ตัวอย่างผลลัพธ์

### Layout Variants Demo

```
================================================================================
Testing: Restaurant Modern
================================================================================

📝 Description: Modern restaurant with split layout - clean and contemporary design
🏷️  Category: restaurant-modern
🔑 Keywords: restaurant, modern, contemporary, fusion, ร้านอาหารโมเดิร์น

⏳ Generating website...

✅ Success! Generated in 8.52s
📊 Results:
   - Files Generated: 15
   - Total Size: 125.3KB
   - Template Used: template-system-v2
   - Blocks: navbar-basic, hero-basic, about-basic, menu-basic, contact-basic, footer-basic
   - AI Content: Yes
   - Project: modern-restaurant-website
   - Total Project Files: 24

📄 Hero Component Preview:
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
...
```

### Interactive Selector

```
✅ Website generated successfully in 7.84s!

📊 Generation Results:
├─ Files Generated: 18
├─ Total Size: 142.1KB
├─ Template Used: template-system-v2
├─ Business Category: restaurant-luxury
├─ Project Type: restaurant
├─ AI Content: Yes ✓
└─ Blocks: navbar-basic, hero-basic, about-basic, menu-basic, contact-basic, footer-basic

📦 Project Structure:
├─ Name: luxury-fine-dining-website
├─ Type: vite-react-typescript
└─ Total Files: 26

📄 Generated Files:
├─ src/components/Navbar.tsx (component, 3245 bytes)
├─ src/components/Hero.tsx (component, 4821 bytes)
├─ src/components/About.tsx (component, 2156 bytes)
├─ src/components/Menu.tsx (component, 3892 bytes)
├─ src/components/Contact.tsx (component, 2734 bytes)
├─ src/components/Footer.tsx (component, 2451 bytes)
└─ ... and 12 more files

🎨 Hero Component Preview:
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1..."
...

✨ Generation completed successfully!

🔄 Generate another website? (y/n): 
```

---

## 🎯 Use Cases

### 1. ทดสอบว่าทุก Layout ทำงานได้
```bash
npx ts-node demo/layout-variants-demo.ts
```

### 2. เลือก Layout เฉพาะที่ต้องการทดสอบ
```bash
npx ts-node demo/interactive-layout-selector.ts
# แล้วเลือกเลข 1-5
```

### 3. ทดสอบ Auto-Detection
```bash
npx ts-node demo/interactive-layout-selector.ts
# เลือก 6 (Let AI Choose)
# ใส่ keywords: luxury, fine dining, elegant
```

### 4. ทดสอบกับ Keywords เฉพาะ
```bash
npx ts-node demo/interactive-layout-selector.ts
# เลือก layout ที่ต้องการ
# เพิ่ม keywords: vegan, organic, healthy
```

---

## 🐛 Troubleshooting

### ปัญหา: TypeScript errors
```bash
npm run build
```

### ปัญหา: Missing dependencies
```bash
npm install
```

### ปัญหา: OpenAI API errors
ตรวจสอบ `.env` file:
```env
OPENAI_API_KEY=your_key_here
```

---

## 📝 Notes

- Demo scripts ใช้ `gpt-5-nano` model (รวดเร็ว, ประหยัด)
- ผลลัพธ์จะแตกต่างกันในแต่ละครั้งเพราะ AI generation
- `interactive-layout-selector.ts` เหมาะสำหรับ manual testing
- `layout-variants-demo.ts` เหมาะสำหรับ automated testing

---

## 🤝 Contributing

ถ้าต้องการเพิ่ม demo scripts:
1. สร้างไฟล์ใหม่ใน `demo/` folder
2. Export main function
3. อัปเดต README นี้
4. ทดสอบให้แน่ใจว่าทำงานได้

---

**Happy Testing! 🚀**

