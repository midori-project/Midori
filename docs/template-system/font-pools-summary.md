# ✅ ตอบคำถาม: กำหนด Font ให้แต่ละ Category ได้

## ❓ คำถาม
> "เราสามารถกำหนดได้ไหม ว่า ให้ category ไหน ใช้ font รูปแบบไหนได้บ้าง?"

## ✅ คำตอบ
**ได้แล้วครับ!** 

ตอนนี้ระบบมี **Font Pools** แล้ว ทำให้สามารถกำหนดได้ว่า category ไหนใช้ font รูปแบบไหนได้บ้าง พอๆ กับที่ระบบมี Variant Pools อยู่แล้ว

---

## 🎯 ระบบ Font Pools คืออะไร?

Font Pools ทำงานเหมือนกับ Variant Pools:
- **Variant Pools** → กำหนด variant ไหนใช้ได้ (hero-split, hero-minimal, etc.)
- **Font Pools** → กำหนด font ไหนใช้ได้ (playfair, inter, poppins, etc.) ⭐

---

## 📊 ตัวอย่าง Font Pools ที่กำหนดไว้แล้ว

### 🍽️ Restaurant Category
```typescript
allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter']
defaultFont: 'poppins'
randomSelection: true  // สุ่มได้
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **playfair** - หรูหรา (เหมาะ luxury)
- ✅ **crimson** - สง่างาม (เหมาะ fine dining)
- ✅ **poppins** - อบอุ่น ⭐ Default
- ✅ **nunito** - เป็นกันเอง
- ✅ **inter** - ทันสมัย

**❌ ฟอนต์ที่ใช้ไม่ได้:**
- ❌ **lora** - ใช้กับ news
- ❌ **merriweather** - ใช้กับ news
- ❌ **system** - ใช้กับ minimal

---

### 🛒 E-commerce Category
```typescript
allowedFonts: ['inter', 'roboto', 'poppins']
defaultFont: 'inter'
randomSelection: false  // ไม่สุ่ม
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **inter** ⭐ Default
- ✅ **roboto**
- ✅ **poppins**

---

### 🎨 Portfolio Category
```typescript
allowedFonts: ['montserrat', 'inter', 'poppins', 'playfair']
defaultFont: 'montserrat'
randomSelection: true  // สุ่มได้
```

**ฟอนต์ที่ใช้ได้:**
- ✅ **montserrat** ⭐ Default (creatiร
- ✅ **inter**
- ✅ **poppins**
- ✅ **playfair**

---

### 🏥 Healthcare Category
```typescript
allowedFonts: ['inter', 'roboto', 'poppins']
defaultFont: 'inter'
```

---

### 📰 News Category
```typescript
allowedFonts: ['lora', 'merriweather', 'inter']
defaultFont: 'lora'
```

**เหตุผล:** News ต้องการ serif fonts ที่อ่านสบาย

---

## 🚀 วิธีใช้งาน

### 1. ดู Font ที่ใช้ได้
```typescript
import { getAllowedFonts } from './business-categories';

const fonts = getAllowedFonts('restaurant');
// Returns: ['playfair', 'crimson', 'poppins', 'nunito', 'inter']
```

### 2. ดู Default Font
```typescript
import { getDefaultFont } from './business-categories';

const default = getDefaultFont('restaurant');
// Returns: 'poppins'
```

### 3. ตรวจสอบว่าฟอนต์ใช้ได้หรือไม่
```typescript
import { isFontAllowed } from './business-categories';

isFontAllowed('restaurant', 'poppins'); // true ✅
isFontAllowed('restaurant', 'lora'); // false ❌
```

### 4. เลือก Font อัตโนมัติ
```typescript
import { selectFontForCategory } from './business-categories';

// เลือกตาม tone
selectFontForCategory('restaurant', 'luxury'); // → 'playfair'
selectFontForCategory('restaurant', 'warm'); // → 'poppins'
```

### 5. สุ่ม Font
```typescript
import { getRandomFontFromPool } from './business-categories';

const font = getRandomFontFromPool('restaurant');
// สุ่มจาก ['playfair', 'crimson', 'poppins', 'nunito', 'inter']
```

---

## 📋 ตารางสรุป Font Pools

| Category | Default Font | Fonts |
|----------|-------------|-------|
| **Restaurant** | poppins | playfair, crimson, poppins, nunito, inter |
| **E-commerce** | inter | inter, roboto, poppins |
| **Portfolio** | montserrat | montserrat, inter, poppins, playfair |
| **Healthcare** | inter | inter, roboto, poppins |
| **News** | lora | lora, merriweather, inter |

---

## ✨ ข้อดี

1. ✅ **ป้องกันการใช้ผิด**: Restaurant ไม่ได้ใช้ lora (serif ที่เหมาะกับ news)
2. ✅ **ควบคุมได้**: กำหนดได้ว่าค้าไหนใช้ font ไหน
3. ✅ **Smart Selection**: เลือกตาม tone อัตโนมัติ
4. ✅ **Random Support**: สุ่ม font หรือ fixed ได้
5. ✅ **Consistent**: ทุกเว็บใน category เดียวกันมี font ที่เหมาะสม

---

## 🔧 เพิ่ม Font Pools ใหม่

```typescript
// ใน business-categories/index.ts
export const CATEGORY_FONT_POOLS: FontPools = {
  'travel': {  // ⭐ เพิ่มใหม่
    allowedFonts: ['montserrat', 'poppins', 'playfair'],
    defaultFont: 'montserrat',
    randomSelection: true,
    constraints: {
      tone: ['adventure', 'exciting', 'luxury', 'casual']
    }
  }
};
```

---

## 📖 ไฟล์ที่เกี่ยวข้อง

1. **`shared-blocks/font-presets.ts`** - กำหนด font presets (9 fonts)
2. **`business-categories/index.ts`** - Font Pools + utility functions
3. **`docs/template-system/font-pools-example.md`** - ตัวอย่างการใช้งาน

---

## ✅ สรุป

**ตอบ:** ได้แล้วครับ! ตอนนี้ระบบมี Font Pools ที่กำหนดได้ว่า:
- Category ไหนใช้ font ไหนได้บ้าง
- Default font คืออะไร
- สุ่มได้หรือไม่
- ใช้ font ไหนตาม tone

**ตัวอย่าง:**
- Restaurant → ['playfair', 'crimson', 'poppins', 'nunito', 'inter']
- E-commerce → ['inter', 'roboto', 'poppins']
- News → ['lora', 'merriweather', 'inter']

---

## 🎯 ต่อไป?

ตอนนี้ต้อง:
1. ✅ ระบบ Font Pools พร้อมแล้ว
2. ⏳ ต่อไปต้อง update CSS templates ให้รองรับ font placeholders
3. ⏳ อัปเดต renderer ให้ replace fonts
4. ⏳ เพิ่ม typography ใน globalSettings ของแต่ละ category

ดูรายละเอียดเต็มที่:
- [`font-customization-plan.md`](./font-customization-plan.md)
- [`font-pools-example.md`](./font-pools-example.md)

