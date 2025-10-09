# 🎨 Variant System Guide

## ภาพรวม

Variant System ช่วยให้สามารถสร้าง layout หลากหลายจาก shared block เดียวกันได้ โดย**ไม่ต้องแก้ Override System ทุกครั้ง**

---

## 🚀 กฏการทำงาน (Auto-Detection Rules)

### ⭐ **กฏหลัก: Variant มี 2 ประเภท**

#### 1. **Simple Variant** (ธรรมดา)
- ใช้ placeholders เดียวกันกับ base block
- **ไม่ต้องแก้ Override System** ✅
- เพียงเพิ่มใน `shared-blocks/index.ts` และใช้ได้เลย

#### 2. **Special Variant** (พิเศษ)
- มี **required placeholders พิเศษ** ที่ไม่มีใน base block
- **ระบบจะ detect และจัดการอัตโนมัติ** ✨
- ไม่ต้องแก้โค้ด - แค่กำหนด `overrides` ให้ถูกต้อง

---

## ✅ **Auto-Detection System**

### ระบบตรวจจับอัตโนมัติ 3 ส่วน:

#### 1. **AI Instruction Generator** (`override-system/index.ts`)

**กฏ:**
```
ถ้า variant มี required placeholder ที่ไม่ใช่ base placeholder
→ สร้าง AI instructions อัตโนมัติ
```

**ตัวอย่าง:**
```typescript
// Variant มี stat1-3 (required) → ระบบ detect แล้วบอก AI
⚠️ IMPORTANT: This Hero block uses variant 'hero-cards' which REQUIRES additional fields:
- stats: stat1: "15+", stat1Label: "ปีประสบการณ์", ...
You MUST include these in the Hero object above!
```

#### 2. **Fallback Value Generator** (`override-system/renderer.ts`)

**กฏ:**
```
ถ้า variant มี required placeholder แต่ AI ไม่ได้ generate
→ เพิ่ม fallback values อัตโนมัติ
```

**ตัวอย่าง:**
```typescript
// AI ไม่ได้ส่ง stat1-3 มา
🔄 Adding fallback values for variant 'hero-cards' (stat1, stat1Label, ...)
// ระบบเพิ่ม: stat1: "15+", stat1Label: "ปีประสบการณ์", ...
```

#### 3. **Validation Relaxer** (`override-system/renderer.ts`)

**กฏ:**
```
ถ้า validation error เป็น variant-specific placeholder
→ แสดง warning แทน error (ไม่ fail)
```

---

## 📝 **วิธีเพิ่ม Variant ใหม่**

### ✅ **แบบที่ 1: Simple Variant (แนะนำ)**

**ตัวอย่าง:** เพิ่ม `hero-gradient` (ใช้ placeholders เดิม)

```typescript
// ใน shared-blocks/index.ts
{
  id: "hero-gradient",
  name: "Hero with Gradient Overlay",
  description: "Hero with colorful gradient overlay",
  template: `import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative py-20">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-{primary}-500 via-{secondary}-500 to-{primary}-700"></div>
      
      <div className="relative z-10 text-center text-white">
        <span className="text-sm">{badge}</span>
        <h1 className="text-7xl">{heading}</h1>
        <p className="text-2xl">{subheading}</p>
        <Link to="/menu">{ctaLabel}</Link>
        <Link to="/about">{secondaryCta}</Link>
      </div>
    </section>
  );
}`,
  overrides: {}  // ✅ ว่างเปล่า - ใช้ placeholders เดิม
}
```

**ขั้นตอน:**
1. เพิ่ม variant ใน `shared-blocks/index.ts` → เสร็จ!
2. ใช้ใน business category:
   ```typescript
   { blockId: 'hero-basic', variantId: 'hero-gradient' }
   ```

**✅ ไม่ต้องแก้ Override System เลย!**

---

### ⚡ **แบบที่ 2: Special Variant (มี Required Placeholders พิเศษ)**

**ตัวอย่าง:** เพิ่ม `hero-video` (ต้องการ videoUrl)

```typescript
// ใน shared-blocks/index.ts
{
  id: "hero-video",
  name: "Hero with Video Background",
  description: "Autoplay video background",
  template: `import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative h-screen">
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
        <source src="{videoUrl}" type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10">
        <span>{badge}</span>
        <h1>{heading}</h1>
        <p>{subheading}</p>
        <Link to="/menu">{ctaLabel}</Link>
      </div>
    </section>
  );
}`,
  overrides: {
    videoUrl: {  // ✨ Required placeholder พิเศษ
      type: "string",
      required: true,
      description: "Video URL for background"
    }
  }
}
```

**ขั้นตอน:**
1. เพิ่ม variant ใน `shared-blocks/index.ts` → เสร็จ!
2. **เพิ่ม fallback value** ใน `renderer.ts`:

```typescript
// ใน fallbackMap (บรรทัด ~999)
const fallbackMap: Record<string, any> = {
  // ... existing fallbacks
  'videoUrl': 'https://via.placeholder.com/1920x1080/000/fff?text=Video',  // ✨ เพิ่มบรรทัดนี้
};
```

3. **(Optional) เพิ่มตัวอย่างใน AI prompt** ถ้าต้องการ format พิเศษ:

```typescript
// ใน generateExamples (บรรทัด ~705)
const exampleMap: Record<string, string> = {
  // ... existing examples
  'videoUrl': '"https://example.com/hero-video.mp4"',  // ✨ เพิ่มบรรทัดนี้
};
```

**✅ ระบบจะ detect และจัดการอัตโนมัติ!**

---

## 🎯 **สิ่งที่ระบบทำให้อัตโนมัติ**

### ✨ **Auto-Detection Flow**

```
1. Variant มี required placeholder พิเศษ (เช่น videoUrl)
   ↓
2. ระบบ detect ว่าไม่ใช่ base placeholder
   ↓
3. สร้าง AI instruction อัตโนมัติ
   "⚠️ IMPORTANT: This Hero block requires: videoUrl"
   ↓
4. ถ้า AI ไม่ generate → ใช้ fallback value
   videoUrl: "https://via.placeholder.com/..."
   ↓
5. Validation ผ่าน (ไม่ error)
```

---

## 📋 **Base Placeholders List**

ระบบจะถือว่า placeholders เหล่านี้เป็น **base** (ไม่ใช่ variant-specific):

### Hero Block:
- `badge`, `heading`, `subheading`
- `ctaLabel`, `secondaryCta`
- `heroImage`, `heroImageAlt`

### Navbar Block:
- `brand`, `brandFirstChar`, `ctaButton`, `menuItems`

### About Block:
- `title`, `description`, `features`, `stats`

### Contact Block:
- `title`, `subtitle`, `address`, `phone`, `email`, `businessHours`

### Footer Block:
- `companyName`, `description`, `socialLinks`, `quickLinks`, `address`, `phone`, `email`

### Theme Block:
- `radius`, `spacing`

**Placeholder อื่นๆ นอกเหนือจากนี้ = Variant-specific** ✨

---

## 🔧 **Fallback Value Patterns**

ระบบจะ generate fallback values อัตโนมัติตาม pattern:

### Pattern Detection:

| Pattern | Detection | Fallback Value | Example |
|---------|-----------|---------------|---------|
| **Stats** | `stat1`, `stat1Label` | `"15+"`, `"ปีประสบการณ์"` | hero-stats, hero-cards |
| **Array** | ลงท้ายด้วย `s` | `[]` | testimonials, items |
| **Label** | มี `Label` ในชื่อ | `"Label"` | stat1Label, categoryLabel |
| **URL** | มี `url` หรือ `Url` | `"https://example.com"` | videoUrl, imageUrl |
| **Default** | อื่นๆ | `"Default Value"` | - |

### Supported Fallbacks:

```typescript
{
  // Stats (hero-stats, hero-cards)
  stat1: '15+',
  stat1Label: 'ปีประสบการณ์',
  stat2: '1000+',
  stat2Label: 'ลูกค้าพึงพอใจ',
  stat3: '50+',
  stat3Label: 'เมนูหลากหลาย',
  
  // Testimonials (hero-testimonial)
  testimonials: [
    { name: 'ชื่อ', quote: 'คำพูด', role: 'ตำแหน่ง' }
  ],
  
  // Video (hero-video)
  videoUrl: 'https://via.placeholder.com/1920x1080',
  
  // Gallery (hero-gallery)
  gallery: [
    { image: 'https://via.placeholder.com/800x600', alt: 'Gallery 1' }
  ],
  
  // Team (hero-team)
  teamMembers: [
    { name: 'Name', role: 'Role', image: 'https://...', bio: 'Bio' }
  ]
}
```

---

## 📚 **ตัวอย่างการใช้งาน**

### ตัวอย่างที่ 1: เพิ่ม Simple Variant

**Variant:** `hero-parallax` (Parallax scrolling effect)

```typescript
// shared-blocks/index.ts
{
  id: "hero-parallax",
  name: "Hero with Parallax",
  description: "Hero with parallax scrolling effect",
  template: `...parallax code...`,
  overrides: {}  // ✅ ไม่มี required placeholders พิเศษ
}
```

**การทำงาน:**
- ✅ ระบบ detect: ไม่มี variant-specific placeholders
- ✅ ไม่เพิ่ม AI instructions
- ✅ ไม่ต้อง fallback values
- ✅ ใช้ได้เลย!

---

### ตัวอย่างที่ 2: เพิ่ม Special Variant

**Variant:** `hero-testimonial` (Customer testimonials)

```typescript
// shared-blocks/index.ts
{
  id: "hero-testimonial",
  name: "Hero with Testimonials",
  description: "Hero with customer testimonials",
  template: `...
    {testimonials.map(t => (
      <div key={t.name}>
        <p>"{t.quote}"</p>
        <span>{t.name} - {t.role}</span>
      </div>
    ))}
  ...`,
  overrides: {
    testimonials: {  // ✨ Required placeholder พิเศษ
      type: "array",
      required: true,
      description: "Array of testimonial objects"
    }
  }
}
```

**การทำงาน:**
- ✅ ระบบ detect: มี `testimonials` (variant-specific)
- ✅ สร้าง AI instruction อัตโนมัติ:
  ```
  ⚠️ IMPORTANT: This Hero block requires:
  - testimonials: [{ name, quote, role }]
  ```
- ✅ ถ้า AI ไม่ generate → ใช้ fallback:
  ```typescript
  testimonials: [
    { name: 'สมชาย', quote: 'ดีมาก', role: 'ลูกค้า' }
  ]
  ```
- ✅ ใช้ได้เลย!

**ต้องทำเพิ่ม:**
```typescript
// เพิ่มใน renderer.ts fallbackMap (บรรทัด ~999)
'testimonials': [
  { name: 'สมชาย ใจดี', quote: 'อาหารอร่อยมาก', role: 'ลูกค้าประจำ' }
]
```

---

## 🎯 **Checklist การเพิ่ม Variant**

### Simple Variant (ไม่มี required placeholders พิเศษ)

- [ ] เพิ่ม variant ใน `shared-blocks/index.ts`
  - กำหนด `id`, `name`, `description`
  - เขียน `template`
  - ตั้ง `overrides: {}`
- [ ] ใช้ใน business category
  - ระบุ `variantId: 'variant-name'`
- [ ] เสร็จ! ✅

### Special Variant (มี required placeholders พิเศษ)

- [ ] เพิ่ม variant ใน `shared-blocks/index.ts`
  - กำหนด `id`, `name`, `description`
  - เขียน `template` (ใช้ placeholder พิเศษ)
  - ตั้ง `overrides` พร้อม `required: true`
- [ ] เพิ่ม fallback value ใน `renderer.ts`
  - เพิ่มใน `fallbackMap` (บรรทัด ~999)
- [ ] (Optional) เพิ่มตัวอย่างใน `generateExamples`
  - เพิ่มใน `exampleMap` (บรรทัด ~705)
- [ ] ใช้ใน business category
- [ ] เสร็จ! ✅

---

## 💡 **Best Practices**

### 1. **ตั้งชื่อ Placeholder ที่มีความหมาย**

✅ Good:
```typescript
videoUrl, galleryImages, testimonials
```

❌ Bad:
```typescript
data, items, stuff
```

### 2. **ใช้ Required อย่างระมัดระวัง**

✅ Good:
```typescript
{
  videoUrl: { type: "string", required: false, defaultValue: "" }
}
```

⚠️ Use carefully:
```typescript
{
  videoUrl: { type: "string", required: true }  // ต้องเพิ่ม fallback!
}
```

### 3. **จัดกลุ่ม Related Placeholders**

✅ Good:
```typescript
// stat1, stat1Label, stat2, stat2Label, stat3, stat3Label
// → ระบบ group เป็น "stats" อัตโนมัติ
```

### 4. **ใส่ Description ที่ชัดเจน**

```typescript
{
  testimonials: {
    type: "array",
    required: true,
    description: "Array of testimonial objects with name, quote, role"
    // ✅ AI จะเข้าใจได้ง่ายขึ้น
  }
}
```

---

## 🧪 **การทดสอบ Variant ใหม่**

### 1. รัน Validation Script

```bash
cd src/midori/agents/frontend-v2
npx ts-node tests/validate-manifests.ts
```

ตรวจสอบ:
- ✅ Variant ถูก detect ถูกต้อง
- ✅ Placeholders ครบถ้วน
- ✅ Override ถูก apply

### 2. ทดสอบผ่าน Layout Tester

```bash
npm run dev
http://localhost:3000/layout-tester
```

ตรวจสอบ:
- ✅ สร้างเว็บไซต์สำเร็จ
- ✅ ไม่มี validation errors
- ✅ Template ถูก render ถูกต้อง
- ✅ Fallback values ถูกใช้ (ถ้า AI ไม่ generate)

### 3. ตรวจสอบ Console Logs

```
✨ Applying variant 'hero-video' for block 'hero-basic'
📋 Hero placeholders: [..., 'videoUrl']
🔄 Adding fallback values for variant 'hero-video' (videoUrl)
✅ AI content generated
```

---

## 📊 **Variant Complexity Matrix**

| Variant Type | Base Placeholders | Special Placeholders | Auto-Detect | Fallback | AI Instructions |
|--------------|-------------------|---------------------|-------------|----------|-----------------|
| **Simple** | ✅ | ❌ | ✅ Skip | ❌ No need | ❌ No need |
| **Special** | ✅ | ✅ Required | ✅ Detect | ✅ Auto-add | ✅ Auto-generate |

---

## 🔍 **การ Debug**

### เช็คว่า Variant ถูก Detect หรือไม่:

```typescript
// ใน console logs
✨ Applying variant 'variant-name' for block 'block-id'
```

### เช็คว่า AI Instructions ถูกสร้างหรือไม่:

```typescript
// ใน AI prompt (ดูใน logs)
⚠️ IMPORTANT: This Hero block uses variant 'hero-video' which REQUIRES additional fields:
- videoUrl: "https://example.com/video.mp4"
```

### เช็คว่า Fallback Values ถูกใช้หรือไม่:

```typescript
// ใน console logs
🔄 Adding fallback values for variant 'hero-video' (videoUrl)
```

---

## 🚀 **Supported Variant Patterns**

ระบบรองรับ auto-detection สำหรับ patterns เหล่านี้:

### 1. **Stats Pattern**
```typescript
stat1, stat1Label, stat2, stat2Label, stat3, stat3Label
→ Group: "stats"
→ Fallback: "15+", "ปีประสบการณ์", ...
```

### 2. **Testimonials Pattern**
```typescript
testimonials: Array<{ name, quote, role }>
→ Group: "testimonials"
→ Fallback: [{ name: "ชื่อ", quote: "คำพูด", role: "ตำแหน่ง" }]
```

### 3. **Media Patterns**
```typescript
videoUrl, imageUrl, galleryImages
→ Fallback: "https://via.placeholder.com/..."
```

### 4. **Custom Patterns**
เพิ่มใน `fallbackMap` หรือใช้ generic fallback

---

## ⚙️ **Configuration**

### เพิ่ม Base Placeholder ใหม่

ถ้าต้องการให้ placeholder ใหม่เป็น "base" (ไม่ใช่ variant-specific):

**ไฟล์:** `override-system/index.ts` และ `renderer.ts`

```typescript
const basePlaceholders = [
  // ... existing
  'newBasePlaceholder'  // ✨ เพิ่มตรงนี้
];
```

### เพิ่ม Fallback Pattern ใหม่

**ไฟล์:** `renderer.ts` บรรทัด ~999

```typescript
const fallbackMap: Record<string, any> = {
  // ... existing
  'yourNewPlaceholder': 'your fallback value'  // ✨ เพิ่มตรงนี้
};
```

### เพิ่ม Example Pattern ใหม่

**ไฟล์:** `override-system/index.ts` บรรทัด ~705

```typescript
const exampleMap: Record<string, string> = {
  // ... existing
  'yourNewPlaceholder': '"example value"'  // ✨ เพิ่มตรงนี้
};
```

---

## 🎉 **สรุป**

### เมื่อเพิ่ม Variant ใหม่:

**Simple Variant:**
1. เพิ่มใน `shared-blocks/index.ts` → เสร็จ! ✅

**Special Variant:**
1. เพิ่มใน `shared-blocks/index.ts` ✅
2. เพิ่ม fallback value ใน `renderer.ts` ✅
3. เสร็จ! (ระบบจัดการที่เหลืออัตโนมัติ) ✅

**ไม่ต้อง:**
- ❌ แก้ AI prompt logic ทุกครั้ง
- ❌ แก้ validation logic
- ❌ แก้ detection logic

**ระบบจะ detect และจัดการให้อัตโนมัติ!** 🚀

---

**Happy Variant Building! 🎨✨**

