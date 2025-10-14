# 🎲 Random Variant System Guide

## ภาพรวม

ระบบ Random Variant ช่วยให้สามารถสุ่ม variant แบบอัตโนมัติสำหรับแต่ละ block ได้ ทำให้ได้ design ที่หลากหลายโดยไม่ต้องกำหนดแบบตายตัว

---

## 🚀 วิธีใช้งาน

### ✅ **วิธีที่ 1: Random Variant (แนะนำ)**

ใช้ฟังก์ชัน `getRandomVariant()` เพื่อสุ่ม variant อัตโนมัติ:

```typescript
{
  blockId: 'hero-basic',
  variantId: getRandomVariant(HERO_VARIANTS), // 🎲 สุ่ม variant
  required: true,
  customizations: { ... }
}
```

### ⚙️ **วิธีที่ 2: Fixed Variant**

กำหนด variant แบบตายตัว:

```typescript
{
  blockId: 'hero-basic',
  variantId: 'hero-stats', // ✅ กำหนดแบบตายตัว
  required: true,
  customizations: { ... }
}
```

### 🔄 **วิธีที่ 3: No Variant (ใช้ Default)**

ไม่ระบุ variant ID จะใช้ template พื้นฐาน:

```typescript
{
  blockId: 'hero-basic',
  // ไม่ระบุ variantId = ใช้ default template
  required: true,
  customizations: { ... }
}
```

---

## 📚 **Variant Lists**

### Hero Variants (5 แบบ)
```typescript
const HERO_VARIANTS = [
  'hero-stats',      // Hero พร้อม Statistics
  'hero-split',      // Hero แบบ Split Layout
  'hero-fullscreen', // Hero แบบ Fullscreen
  'hero-minimal',    // Hero แบบ Minimal
  'hero-cards'       // Hero พร้อม Feature Cards
];
```

### About Variants (4 แบบ)
```typescript
const ABOUT_VARIANTS = [
  'about-split',     // About พร้อม Image Split
  'about-team',      // About พร้อม Team Section
  'about-timeline',  // About พร้อม Timeline
  'about-minimal'    // About แบบ Minimal
];
```

### Footer Variants (3 แบบ)
```typescript
const FOOTER_VARIANTS = [
  'footer-minimal',  // Footer แบบ Minimal
  'footer-centered', // Footer แบบ Centered
  'footer-mega'      // Footer แบบ Mega (ข้อมูลเยอะ)
];
```

### Menu Variants (3 แบบ)
```typescript
const MENU_VARIANTS = [
  'menu-list',      // Menu แบบ List
  'menu-masonry',   // Menu แบบ Masonry Grid
  'menu-carousel'   // Menu แบบ Carousel
];
```

---

## 🎯 **ตัวอย่างการใช้งาน**

### ตัวอย่างที่ 1: Random ทุก Block

```typescript
export const restaurantCategories: BusinessCategoryManifest[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    blocks: [
      {
        blockId: 'hero-basic',
        variantId: getRandomVariant(HERO_VARIANTS), // 🎲 Random
        required: true,
        customizations: { ... }
      },
      {
        blockId: 'about-basic',
        variantId: getRandomVariant(ABOUT_VARIANTS), // 🎲 Random
        required: false,
        customizations: { ... }
      },
      {
        blockId: 'menu-basic',
        variantId: getRandomVariant(MENU_VARIANTS), // 🎲 Random
        required: true,
        customizations: { ... }
      },
      {
        blockId: 'footer-basic',
        variantId: getRandomVariant(FOOTER_VARIANTS), // 🎲 Random
        required: true,
        customizations: { ... }
      }
    ],
    ...
  }
];
```

### ตัวอย่างที่ 2: Random บางส่วน

```typescript
blocks: [
  {
    blockId: 'hero-basic',
    variantId: 'hero-stats', // ✅ Fix ไว้ที่ hero-stats
    required: true,
    customizations: { ... }
  },
  {
    blockId: 'about-basic',
    variantId: getRandomVariant(ABOUT_VARIANTS), // 🎲 Random
    required: false,
    customizations: { ... }
  },
  {
    blockId: 'menu-basic',
    variantId: 'menu-carousel', // ✅ Fix ไว้ที่ carousel
    required: true,
    customizations: { ... }
  },
  {
    blockId: 'footer-basic',
    variantId: getRandomVariant(FOOTER_VARIANTS), // 🎲 Random
    required: true,
    customizations: { ... }
  }
]
```

### ตัวอย่างที่ 3: Random จาก Subset

สุ่มเฉพาะบาง variants:

```typescript
// สร้าง variant list พิเศษ
const MODERN_HERO_VARIANTS = ['hero-split', 'hero-fullscreen', 'hero-minimal'];
const SIMPLE_MENU_VARIANTS = ['menu-list', 'menu-masonry'];

blocks: [
  {
    blockId: 'hero-basic',
    variantId: getRandomVariant(MODERN_HERO_VARIANTS), // 🎲 สุ่มแค่ modern
    required: true,
    customizations: { ... }
  },
  {
    blockId: 'menu-basic',
    variantId: getRandomVariant(SIMPLE_MENU_VARIANTS), // 🎲 สุ่มแค่ simple
    required: true,
    customizations: { ... }
  }
]
```

---

## 🛠️ **Helper Function**

### getRandomVariant()

```typescript
function getRandomVariant(variants: string[]): string {
  if (variants.length === 0) {
    throw new Error('Variants array cannot be empty');
  }
  const randomIndex = Math.floor(Math.random() * variants.length);
  return variants[randomIndex] as string;
}
```

**Features:**
- ✅ Type-safe (TypeScript)
- ✅ Error handling (ถ้า array ว่าง)
- ✅ Pure function (ไม่มี side effects)

---

## ⚡ **การทำงาน**

### 1. Random Time
Random variant จะเกิดขึ้น **เมื่อโหลด manifest** ครั้งแรก:

```typescript
// ครั้งที่ 1: โหลด manifest
variantId: getRandomVariant(HERO_VARIANTS) // → 'hero-split'

// ครั้งที่ 2: โหลด manifest ใหม่
variantId: getRandomVariant(HERO_VARIANTS) // → 'hero-fullscreen'

// ครั้งที่ 3: โหลด manifest ใหม่
variantId: getRandomVariant(HERO_VARIANTS) // → 'hero-minimal'
```

### 2. Override Priority

ระบบจะเลือก variant ตาม priority นี้:

```
customOverride.variantId > blockUsage.variantId > default (no variant)
```

ตัวอย่าง:
```typescript
// ใน business category
variantId: getRandomVariant(HERO_VARIANTS) // → 'hero-stats'

// Override runtime
const customOverrides = [{
  blockId: 'hero-basic',
  variantId: 'hero-fullscreen' // ✅ จะใช้อันนี้แทน
}];

// Result: ใช้ 'hero-fullscreen'
```

---

## 🎨 **Variant Compatibility**

### ✅ Simple Variants
ใช้ placeholders เดิม ไม่ต้องเพิ่ม customizations:

```typescript
// ✅ Works with all customizations
{
  blockId: 'hero-basic',
  variantId: getRandomVariant(['hero-split', 'hero-fullscreen', 'hero-minimal']),
  customizations: {
    badge: 'ร้านอาหาร',
    heading: 'อาหารอร่อย',
    subheading: 'รสชาติดี',
    ctaLabel: 'ดูเมนู',
    secondaryCta: 'จองโต๊ะ'
    // ✅ ไม่ต้องเพิ่มอะไร
  }
}
```

### ⚡ Special Variants
ต้องเพิ่ม required placeholders พิเศษ:

```typescript
// ⚠️ hero-stats และ hero-cards ต้องมี stat1-3
{
  blockId: 'hero-basic',
  variantId: getRandomVariant(['hero-stats', 'hero-cards']),
  customizations: {
    badge: 'ร้านอาหาร',
    heading: 'อาหารอร่อย',
    subheading: 'รสชาติดี',
    ctaLabel: 'ดูเมนู',
    secondaryCta: 'จองโต๊ะ',
    // ⚡ Required สำหรับ special variants
    stat1: '15+',
    stat1Label: 'ปีประสบการณ์',
    stat2: '1000+',
    stat2Label: 'ลูกค้าพึงพอใจ',
    stat3: '50+',
    stat3Label: 'เมนูหลากหลาย'
  }
}
```

**💡 Tip:** ถ้าใช้ random กับ special variants ควรเพิ่ม required placeholders ไว้ทุกกรณี หรือสุ่มเฉพาะ simple variants

---

## 🔍 **Best Practices**

### ✅ **DO**

1. **สร้าง variant lists ที่เหมาะสมกับ business**
```typescript
const LUXURY_HERO_VARIANTS = ['hero-fullscreen', 'hero-minimal'];
const CASUAL_HERO_VARIANTS = ['hero-split', 'hero-cards'];
```

2. **ใช้ random สำหรับ variety**
```typescript
variantId: getRandomVariant(HERO_VARIANTS) // ✅ ได้ design หลากหลาย
```

3. **Fix variant สำหรับ brand consistency**
```typescript
variantId: 'hero-fullscreen' // ✅ คงรูปแบบเดิม
```

### ❌ **DON'T**

1. **อย่า random กับ special variants โดยไม่เตรียม data**
```typescript
// ❌ BAD: อาจ random ได้ hero-stats แต่ไม่มี stat1-3
variantId: getRandomVariant(HERO_VARIANTS)
customizations: {
  // ไม่มี stat1-3
}
```

2. **อย่าใช้ variant ที่ไม่มีอยู่จริง**
```typescript
// ❌ BAD: variant ไม่มีอยู่
variantId: 'hero-ultra-mega' // ไม่มี variant นี้
```

3. **อย่าสุ่ม empty array**
```typescript
// ❌ BAD: จะ error
const VARIANTS = [];
variantId: getRandomVariant(VARIANTS) // Error!
```

---

## 🎉 **สรุป**

### **Random Variant ดีอย่างไร?**

✅ **Variety** - ได้ design หลากหลาย  
✅ **Easy** - ไม่ต้องเลือกเอง  
✅ **Flexible** - สุ่มได้ทั้งหมดหรือบางส่วน  
✅ **Type-safe** - มี TypeScript support  

### **เมื่อไหร่ควรใช้ Random?**

- 🎲 ต้องการ design ที่หลากหลาย
- 🎲 ทดสอบ variants ต่างๆ
- 🎲 ไม่แน่ใจว่า variant ไหนเหมาะ

### **เมื่อไหร่ควรใช้ Fixed?**

- ✅ Brand ต้องการรูปแบบเฉพาะ
- ✅ ต้องการควบคุม UX แบบเดิม
- ✅ มี special requirements

---

**Happy Randomizing! 🎲✨**

