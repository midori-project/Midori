# 🎨 ตัวอย่าง Font Pools สำหรับแต่ละ Category

## ✅ คำตอบ
**"เราสามารถกำหนดได้ไหมว่าให้ category ไหนใช้ font รูปแบบไหนได้บ้าง?"**

**ตอบ: ได้แล้วครับ!** ตอนนี้ระบบรองรับ Font Pools แล้ว 🎉

---

## 📊 Font Pools ที่กำหนดไว้

### 🍽️ Restaurant Category
```typescript
{
  allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter'],
  defaultFont: 'poppins',
  randomSelection: true, // 🎲 สุ่มฟอนต์เอง
  constraints: {
    tone: ['warm', 'luxury', 'elegant', 'friendly', 'casual']
  }
}
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **playfair** - หรูหรา (เหมาะกับ luxury restaurant)
- ✅ **crimson** - สง่างาม (เหมาะกับ fine dining)
- ✅ **poppins** - อุ่นไอ (เหมาะกับ casual restaurant) ⭐ Default
- ✅ **nunito** - เป็นกันเอง
- ✅ **inter** - ทันสมัย

**ตัวอย่าง:**
```typescript
// Restaurant ธรรมดา → poppins (warm)
// Luxury Restaurant → playfair หรือ crimson
// Modern Restaurant → inter
```

---

### 🛒 E-commerce Category
```typescript
{
  allowedFonts: ['inter', 'roboto', 'poppins'],
  defaultFont: 'inter',
  randomSelection: false, // ✋ ไม่สุ่ม ใช้ fixed
  constraints: {
    tone: ['professional', 'modern', 'minimal']
  }
}
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **inter** - ทันสมัย ⭐ Default
- ✅ **roboto** - มืออาชีพ
- ✅ **poppins** - อบอุ่น

**เหตุผล:** E-commerce ต้องการ font ที่อ่านง่าย น่าเชื่อถือ ไม่ศิลป์มากเกินไป

---

### 🎨 Portfolio Category
```typescript
{
  allowedFonts: ['montserrat', 'inter', 'poppins', 'playfair'],
  defaultFont: 'montserrat',
  randomSelection: true, // 🎲 สุ่ม
  constraints: {
    tone: ['creative', 'modern', 'elegant', 'minimal']
  }
}
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **montserrat** - สร้างสรรค์ ⭐ Default
- ✅ **inter** - ทันสมัย
- ✅ **poppins** - อบอุ่น
- ✅ **playfair** - หรูหรา

**เหมาะกับ:** Portfolio, Creative, Design agencies

---

### 🏥 Healthcare Category
```typescript
{
  allowedFonts: ['inter', 'roboto', 'poppins'],
  defaultFont: 'inter',
  randomSelection: false,
  constraints: {
    tone: ['professional', 'trustworthy', 'warm']
  }
}
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **inter** - มืออาชีพ ⭐ Default
- ✅ **roboto** - น่าเชื่อถือ
- ✅ **poppins** - อบอุ่น

**เหตุผล:** Healthcare ต้องการความน่าเชื่อถือ + ความอบอุ่น

---

### 📰 News Category
```typescript
{
  allowedFonts: ['lora', 'merriweather', 'inter'],
  defaultFont: 'lora',
  randomSelection: false,
  constraints: {
    tone: ['serious', 'intellectual', 'professional']
  }
}
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **lora** - อ่านง่าย (serif) ⭐ Default
- ✅ **merriweather** - เหมาะกับเนื้อหายาว
- ✅ **inter** - ทันสมัย

**เหตุผล:** News ต้องการ serif fonts ที่อ่านสบายตา

---

## 🚀 วิธีใช้งาน

### 1. ดูฟอนต์ที่ใช้ได้ในแต่ละ Category

```typescript
import { getAllowedFonts, getDefaultFont } from './business-categories';

// ดูฟอนต์ที่ใช้ได้
const fonts = getAllowedFonts('restaurant');
// Returns: ['playfair', 'crimson', 'poppins', 'nunito', 'inter']

// ดู default font
const defaultFont = getDefaultFont('restaurant');
// Returns: 'poppins'
```

### 2. ตรวจสอบว่า Font ใช้ได้หรือไม่

```typescript
import { isFontAllowed } from './business-categories';

// ตรวจสอบ
const isValid = isFontAllowed('restaurant', 'poppins'); // true ✅
const isInvalid = isFontAllowed('restaurant', 'lora'); // false ❌
```

### 3. เลือก Font อัตโนมัติตาม Tone

```typescript
import { selectFontForCategory } from './business-categories';

// เลือก font โดยอัตโนมัติ
const font1 = selectFontForCategory('restaurant', 'luxury');
// อาจได้ 'playfair' หรือ 'crimson'

const font2 = selectFontForCategory('restaurant', 'warm');
// อาจได้ 'poppins' หรือ 'nunito'

const font3 = selectFontForCategory('restaurant'); // ไม่มี tone
// สุ่มจาก pool หรือใช้ default
```

### 4. สุ่ม Font จาก Pool

```typescript
import { getRandomFontFromPool } from './business-categories';

// สุ่ม font
const randomFont = getRandomFontFromPool('restaurant');
// อาจได้ 'playfair', 'crimson', 'poppins', 'nunito', หรือ 'inter'
```

---

## 📋 ตารางสรุป

| Category | Default Font | Random? | Allowed Fonts | Tone |
|----------|-------------|---------|----------------|------|
| Restaurant | poppins | ✅ Yes | playfair, crimson, poppins, nunito, inter | warm, luxury, elegant |
| E-commerce | inter | ❌ No | inter, roboto, poppins | professional, modern |
| Portfolio | montserrat | ✅ Yes | montserrat, inter, poppins, playfair | creative, modern |
| Healthcare | inter | ❌ No | inter, roboto, poppins | professional, trustworthy |
| News | lora | ❌ No | lora, merriweather, inter | serious, intellectual |

---

## 🎯 ตัวอย่างการใช้งานจริง

### ตัวอย่าง 1: Restaurant Category

```typescript
// Category: restaurant-classic
const config = {
  categoryId: 'restaurant',
  tone: 'luxury', // หรือ 'warm', 'casual'
  
  // AI จะเลือก font จาก pool
  possibleFonts: ['playfair', 'crimson'], // ถ้า luxury
  // หรือ
  possibleFonts: ['poppins', 'nunito'], // ถ้า warm/casual
  
  defaultFont: 'poppins'
};
```

### ตัวอย่าง 2: E-commerce Category

```typescript
// Category: ecommerce-modern
const config = {
  categoryId: 'ecommerce',
  tone: 'professional',
  
  // ไม่สุ่ม ใช้ fixed font
  font: 'inter',
  
  allowedFonts: ['inter', 'roboto', 'poppins']
};
```

### ตัวอย่าง 3: Portfolio Category

```typescript
// Category: portfolio-creative
const config = {
  categoryId: 'portfolio',
  tone: 'creative',
  
  // สุ่ม font เอง
  randomSelection: true,
  
  possibleFonts: ['montserrat', 'inter', 'poppins', 'playfair'],
  defaultFont: 'montserrat'
};
```

---

## ✨ ข้อดีของระบบ Font Pools

1. ✅ **ควบคุมได้**: กำหนดได้ว่าค่า category ไหนใช้ฟอนต์ไหนได้
2. ✅ **ป้องกันข้อผิดพลาด**: ไม่ให้ใช้ฟอนต์ที่ไม่เหมาะสม (เช่น lora กับ restaurant)
3. ✅ **ความยืดหยุ่น**: รองรับทั้ง random และ fixed
4. ✅ **การขยายตัวง่าย**: เพิ่มฟอนต์ใหม่ได้ง่าย
5. ✅ **Smart Selection**: AI เลือกฟอนต์ให้ตาม tone อัตโนมัติ

---

## 🔧 การเพิ่ม Category/Font ใหม่

### เพิ่ม Category ใหม่

```typescript
// ใน business-categories/index.ts
export const CATEGORY_FONT_POOLS: FontPools = {
  // ... existing categories
  'travel': {
    allowedFonts: ['montserrat', 'poppins', 'playfair'],
    defaultFont: 'montserrat',
    randomSelection: true,
    constraints: {
      tone: ['adventure', 'exciting', 'luxury', 'casual']
    }
  }
};
```

### เพิ่ม Font Preset ใหม่

```typescript
// ใน shared-blocks/font-presets.ts
export const FONT_PRESETS: Record<string, FontConfig> = {
  // ... existing fonts
  'outfit': {
    fontFamily: "Outfit",
    googleFont: "Outfit:wght@300;400;600;700",
    fallback: ["sans-serif"],
    category: "creative",
    description: "Modern sans-serif with personality",
    tone: ["creative", "modern", "bold", "unique"]
  }
};
```

---

## 📖 อ่านเพิ่มเติม

- [`font-customization-plan.md`](./font-customization-plan.md) - แผนการ implement เต็ม
- [`font-customization-summary-th.md`](./font-customization-summary-th.md) - สรุปภาษาไทย

