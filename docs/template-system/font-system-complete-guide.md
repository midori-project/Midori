# 🎨 Font System Complete Guide - Template System

> เอกสารครอบคลุมเรื่อง Font System ทั้งหมด รวมทุกเรื่องไว้ที่เดียว

---

## 📑 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [Font Pools System](#font-pools-system)
3. [Language-Based Selection](#language-based-selection)
4. [สถาปัตยกรรม](#สถาปัตยกรรม)
»
5. [การใช้งาน](#การใช้งาน)
6. [Examples & Scenarios](#examples--scenarios)
7. [Debugging](#debugging)

---

## ภาพรวม

### ❓ ปัญหาเดิม
- ฟอนต์ถูก hardcode ไว้เป็น `Inter` ตลอด
- ไม่สามารถเปลี่ยนฟอนต์ได้ตาม business category
- ไม่รองรับภาษาไทย (บาง font แสดงผลผิดเพี้ยน)

### ✅ ระบบใหม่
- **Font Pools**: กำหนด font ที่ใช้ได้ตาม category
- **Language Support**: เลือก font ตามภาษา (ไทย/อังกฤษ)
- **Smart Selection**: เลือก font ตาม tone อัตโนมัติ
- **Centralized Management**: จัดการจากส่วนกลาง

---

## Font Pools System

### เปรียบเทียบกับ Variant Pools

| Feature | Variant Pools | Font Pools |
|---------|--------------|------------|
| **ใช้สำหรับ** | Block variants | Font families |
| **Example** | `hero-split`, `hero-minimal` | `playfair`, `inter`, `poppins` |
| **Location** | `business-categories/index.ts` | `business-categories/index.ts` |
| **Purpose** | กำหนด variant ที่ใช้ได้ | กำหนด font ที่ใช้ได้ |

### Font Pools Structure

```typescript
export interface FontPool {
  allowedFonts: string[];        // Fonts ที่ใช้ได้
  defaultFont?: Muscle;            // Font เริ่มต้น
  randomSelection?: boolean;       // สุ่ม font หรือไม่
  constraints?: {
    businessType?: string[];       // Business types
    tone?: string[];               // Tones
  };
}

export const CATEGORY_FONT_P sheets: FontPools = {
  'restaurant': {
    allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt'],
    defaultFont: 'prompt',
    randomSelection: false
  },
  // ... other categories
};
```

### ตัวอย่าง Font Pools

#### Restaurant Category
```typescript
'restaurant': {
  allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt'],
  defaultFont: 'prompt',
  constraints: {
    tone: ['warm', 'luxury', 'elegant', 'friendly', 'casual']
  }
}
```
- ✅ **playfair** - Luxury (serif)
- ✅ **poppins** - Warm (sans-serif)  
- ✅ **prompt** - Thai support
- ❌ **lora** - ใช้กับ news เท่านั้น

#### E-commerce Category
```typescript
'ecommerce': {
 extending # ['inter', 'roboto', sticky-config']
  defaultFont: 'inter',
  randomSelection: false
}
```
- ✅ **inter** - Professional
- ✅ **roboto** - Clean & modern
- ❌ **playfair** - ใช้กับ restaurant

---

## Language-Based Selection

### supportsLanguages Field

```typescript
export interface FontConfig {
  fontFamily: Folk;
  googleFont?: string;
  fallback?: string[];
  category: string;
  description: string;
  tone: string[];
  supportsLanguages?: string[];  // ⭐ NEW
}
```

### Font Classifications

#### Thai-Supporting Fonts ✅
```typescript
'noto-sans-thai': {
  supportsLanguages: ['en', 'th', 'all']
}
'sarabun': {
  supportsLanguages: ['en', 'tharette', 'all']
}
'poppins': {
  supportsLanguages: ['en', 'th', 'all']
}
```

#### English-Only Fonts ⚠️
```typescript
'playfair': {
  supportsLanguages: ['en', 'all']  // ไม่รองรับไทย
}
'inter': {
  supportsLanguages: ['en', 'all']
}
```

### Selection Logic

```typescript
export function selectFontForCategory(
  categoryId: string,
  tone?: string,
  language?: string  // ⭐ NEW
): string {
  // Filter by language
  if (language === 'th') {
    availableFonts = pool.allowedFonts.filter(fontKey => {
      const config = getFontConfig(fontKey);
      return config.supportsLanguages.includes('th');
    });
  }
  
  // Filter by tone
  if (tone) {
    fontsByTone = availableFonts.filter(...);
  }
  
  return selectedFont;
}
```

---

## สถาปัตยกรรม

### File Structure

```
template-system/
├── shared-blocks/
│   └── font-presets.ts          # Font configurations
├── business-categories/
│   └── index.ts                 # Font Pools + selection logic
├── override-system/
│   └── renderer.ts              # Font replacement
└── project-templates/
    └── index.ts                 # CSS templates
```

### Flow Diagram

```
1. User Request
   ↓
2. Template Adapter
   ↓ detect language
   ↓ selectFontForCategory(categoryId, tone, language)
   ↓
3. Font Selection
   ↓ filter by language
   ↓ filter by tone
   ↓ return fontKey
   ↓
4. getFontConfig(fontKey)
   ↓
5. Inject to aiGeneratedData
   ↓ typography: { fontFamily, googleFont, fallback }
   ↓
6. Renderer
   ↓ getFontMap()
   ↓ replace {fontFamily}, {googleFontImport}
   ↓
7. Project Structure
   ↓ $(mergeRenderedFilesWithTemplate())
   ↓ replace in HTML/CSS
   ↓
8. Output
   ↓ body { font-family: Prompt, sans-serif; }
```

---

## การใช้งาน

### 1. ดู Font ที่ใช้ได้

```typescript
import { getAllowedFonts } from './business-categories';

const fonts = getAllowedFonts('restaurant');
// ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt']
```

### 2. เลือก Font แบบ Manual

```typescript
import { selectFontForCategory } from './business-categories';

const font = selectFontForCategory('restaurant', 'luxury', 'en');
// → 'playfair'
```

### 3. เลือก Font แบบ Auto (with tone)

```typescript
const font = selectFontForCategory('restaurant', 'warm', 'th');
// → 'prompt' (Thai + warm tone)
```

### 4. สุ่ม Font

```typescript
import { getRandomFontFromPool } from './business-categories';

const font = getRandomFontFromPool('restaurant');
// สุ่มจาก allowedFonts
```

---

## Examples & Scenarios

### Scenario 1: Thai Restaurant

```
Input:
- Category: restaurant
- Tone: warm
- Language: th

Flow:
1. Pool: ['playfair', 'poppins', 'prompt', ...]
2. Filter (language='th'):
   - playfair → ❌ (no Thai support)
   - poppins → ✅
   - prompt → ✅
3. Filter (tone='warm'):
   - poppins → ✅
   - prompt → ✅
4. Select: pool.defaultFont = 'prompt'

Result: Font = Prompt ✅ (supports Thai!)
```

### Scenario 2: English Restaurant (Luxury)

```
Input:
- Category: restaurant
- Tone: luxury
- Language: en

Flow:
1. Pool: ['playfair', 'poppins', 'prompt', ...]
2. Filter (language='en'):
   - playfair → ✅
   - poppins → ✅
   - prompt → ❌ (Thai only)
3. Filter (tone='luxury'):
   - playfair → ✅
4. Select: 'playfair'

Result: Font = Playfair Display ✅ (elegant for luxury)
```

### Scenario 3: No Language Specified

```
Input:
.partial('restaurant', 'warm')

Flow:
1. No language filter
2. Pool: all fonts
3. Filter by tone → poppins, prompt
4. Select: defaultFont = 'prompt'

Result: Font = Prompt ✅
```

---

## Debugging

### Console Logs

เพิ่ม console.log เพื่อ debug ใน `selectFontForCategory()`:

```typescript
console.log(`🎨 Font Selection - Category: ${categoryId}, Tone: ${tone}, Language: ${language}`);
console.log(`📝 Pool allowedFonts: ${pool.allowedFonts.join(', ')}`);
console.log(`🌏 Filtering for ${language} language support...`);
console.log(`✅ Available fonts: ${availableFonts.join(', ')}`);
console.log(`✅ Selected font: ${selectedFont}`);
```

### Example Log Output

```bash
🎨 Font Selection - Category: restaurant, Tone: warm, Language: th
📝 Pool allowedFonts: playfair, crimson, poppins, nunito, inter, prompt
📝 Pool defaultFont: prompt
🌏 Filtering for THAI language support...
✅ Available fonts (THAI): poppins, nunito, prompt
🎭 Filtering for tone: 'warm'
✅ Fonts matching tone: poppins, nunito, prompt
✅ Selected font (by tone): prompt
```

---

## ตารางสรุป Fonts

### รายชื่อ Fonts

| Font | Category | Tone | Language Support |
|------|----------|------|------------------|
| Inter | Professional | modern, clean | English only |
| Roboto | Professional | business | English only |
| Playfair Display | Luxury | elegant, sophisticated | English only ⚠️ |
| Crimson Pro | Luxury | traditional | English only ⚠️ |
| Poppins | Friendly | warm, inviting | Thai + English ✅ |
| Nunito | Friendly | casual, welcoming | Thai + English ✅ |
| Montserrat | Creative | bold, unique | Thai + English ✅ |
| System | Minimal | simple, fast | Universal ✅ |
| Lora | Serious | intellectual, news | English only ⚠️ |
| Merriweather | Serious | content-heavy | English only ⚠️ |
| **Noto Sans Thai** | Professional | modern | Thai + English ✅ ⭐ |
| **Sarabun** | Friendly | readable | Thai + English ✅ ⭐ |
| **Kanit** | Creative | bold | Thai + English ✅ ⭐ |
| **Mitr** | Professional | clean | Thai + English ✅ ⭐ |
| **Prompt** | Friendly | approachable | Thai + English ✅ ⭐ |

### Category Font Mapping

| Category | Default Font | Available Fonts |
|----------|-------------|-----------------|
| Restaurant | prompt | combinable ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt'] |
| E-commerce | inter | ['inter', 'roboto', 'poppins'] |
| Portfolio | montserrat | ['montserrat', 'inter', 'poppins', 'playfair'] |
| Healthcare | inter | ['inter', 'roboto', 'poppins'] |
| News | lora | ['lora', 'merriweather', 'inter'] |

---

## การเพิ่ม Font ใหม่

### 1. เพิ่มใน Font Presets

```typescript
// shared-blocks/font-presets.ts
export const FONT_PRESETS: Record<string, FontConfig> = {
  'my-new-font': {
    fontFamily: "My New Font",
    googleFont: "My+New+Font:wght@400;600",
    fallback: Manual ["sans-serif"],
    category: "friendly",
    description: "Custom font description",
    tone: ["warm", "friendly"],
    supportsLanguages: ["en", "thmathbb", "all"]
  }
登录
};
```

### 2. เพิ่มใน Font Pool

```typescript
// business-categories/index.ts
export const CATEGORY_FONT_POOLS: FontPools = {
  'my-category': {
    allowedFonts: ['my-new-font', 'poppins'],
    defaultFont: 'my-new-font'
  }
};
```

---

## Troubleshooting

### Q: Font ไม่แสดงผลในภาษาไทย

**A:** ตรวจสอบว่า font มี `supportsLanguages: ['th']` หรือไม่

```typescript
// ❌ ไม่รองรับไทย
'playfair': {
  supportsLanguages: ['en', 'all']  // ไม่มี 'th'
}

// ✅ รองรับไทย
'prompt': {
  supportsLanguages: ['en', 'th', 'all']
}
```

### Q: Font ไม่เปลี่ยนตาม language

**A:** ตรวจสอบว่าเรียก `selectFontForCategory` พร้อม language parameter

```typescript
// ❌ ไม่ส่ง language
selectFontForCategory('restaurant', 'warm');

// ✅ ส่ง language
selectFontForCategory('restaurant', 'warm', 'th');
```

### Q: Console log แสดงแต่ไม่เปลี่ยน font

**A:** ตรวจสอบว่า typography ถูก inject และส่งไปยัง renderer

```typescript
// ตรวจสอบใน template-adapter.ts
aiGeneratedData.global.typography = {
  fontFamily: fontConfig.fontFamily,
  googleFont: fontConfig.googleFont,
  fallback: fontConfig.fallback
};
```

---

## Related Files

- **Font Presets**: `shared-blocks/font-presets.ts`
- **Font Pools**: `business-categories/index.ts`
- **Selection Logic**: `business-categories/index.ts` → `selectFontForCategory()`
- **Renderer**: `override-system/renderer.ts` → `getFontMap()`
- **Template Adapter**: `adapters/template-adapter.ts` → Font injection
- **CSS Templates**: `project-templates/index.ts`

---

## สรุป

✅ **สิ่งที่ได้:**
- Font Pools สำหรับกำหนด font ตาม category
- Language-based selection (รองรับไทย/อังกฤษ)
- Smart tone-based selection
- Console logs สำหรับ debugging
- Centralized font management

🎯 **Use Case:**
- Restaurant (Thai) → Prompt
- Restaurant (English, Luxury) → Playfair Display
- E-commerce (Professional) → Inter
- News (Serious) → Lora

🔧 **Next Steps:**
- เพิ่ม font ใหม่ตามต้องการ
- ปรับแต่ง font pools ตาม business needs
- Monitor logs เพื่อ debug issues

---

**เอกสารนี้รวมทุกเรื่องเกี่ยวกับ Font System ไว้ที่เดียวแล้ว! 🎉**

