# รายละเอียด: การเลือก Font ตามสถานการณ์

## สถานการณ์ 1: Prompt รองรับแค่ 'th' 

### Setup:
```typescript
// Prompt รองรับแค่ภาษาไทย
'prompt': {
  supportsLanguages: ["th"]  // ⚠️ ไม่มี 'en' หรือ 'all'
}

// Restaurant Pool
'restaurant': {
  allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt'],
  defaultFont: 'prompt'  // ← Set เป็น prompt
}
```

### Case A: User Input = ภาษาไทย 🇹🇭

```
Input: restaurant + language='th'

Step 1: เรียก selectFontForCategory('restaurant', 'warm', 'th')

Step 2: Filter ตาม Language
  allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt']
  
  Filter for 'th':
    - playfair.supportsLanguages: ['en', 'all'] ❌
    - crimson.supportsLanguages: ['en', 'all'] ❌
    - poppins.supportsLanguages: ['en', 'th', 'all'] ✅
    - nunito.supportsLanguages: ['en', 'th', 'all'] ✅
    - inter.supportsLanguages: ['en', 'all'] ❌
    - prompt.supportsLanguages: ['th'] ✅  ← ใช้ได้!
    
  availableFonts: ['poppins', 'nunito', 'prompt']

Step 3: Select Default
  return pool.defaultFont || availableFonts[0] || 'inter';
  → return 'prompt'  ✅

Result: Font = 'prompt' 🎉 ทำงานได้!
```

### Case B: User Input = ภาษาอังกฤษ 🇬🇧

```
Input: restaurant + language='en'

Step 1: เรียก selectFontForCategory('restaurant', 'warm', 'en')

Step 2: Filter ตาม Language
  allowedFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt']
  
  Filter for 'en':
    - playfair.supportsLanguages: ['en', 'all'] ✅
    - crimson.supportsLanguages: ['en', 'all'] ✅
    - poppins.supportsLanguages: ['en', 'th', 'all'] ✅
    - nunito.supportsLanguages: ['en', 'th', 'all'] ✅
    - inter.supportsLanguages: ['en', 'all'] ✅
    - prompt.supportsLanguages: ['th'] ❌  ← ตัดออก!
    
  availableFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter']

Step 3: Filter ตาม Tone (ถ้ามี)
  tone = 'warm':
  - playfair.tone: ['luxury', 'elegant', ...] ❌ (ไม่มี 'warm')
  - crimson.tone: ['luxury', 'elegant', ...] ❌
  - poppins.tone: ['warm', 'friendly', ...] ✅
  - nunito.tone: ['warm', 'friendly', ...] ✅
  - inter.tone: ['professional', 'modern', ...] ❌
  
  fontsByTone: ['poppins', 'nunito']

Step 4: Select Default
  pool.randomSelection = false
  
  // ไม่ได้ใช้ pool.defaultFont (เพราะมันไม่เจอใน availableFonts)
  return fontsByTone[0] || pool.defaultFont || 'inter';
  → return 'poppins'  ✅

Result: Font = 'poppins'  🎉 ใช้ font ที่รองรับภาษาอังกฤษ!
```

### Case C: User Input = ไม่ระบุภาษา

```
Input: restaurant + language=undefined

Step 1: เรียก selectFontForCategory('restaurant', 'warm')

Step 2: ไม่มี Language Filter
  availableFonts = pool.allowedFonts
  availableFonts: ['playfair', 'crimson', 'poppins', 'nunito', 'inter', 'prompt']

Step 3: Filter ตาม Tone
  fontsByTone: ['poppins', 'nunito', 'prompt']
  (playfair, crimson, inter ไม่มี 'warm')

Step 4: Select Default
  return pool.defaultFont || availableFonts[0] || 'inter';
  → return 'prompt'  ✅

Result: Font = 'prompt'  🎉 ใช้ defaultFont
```

## 📊 ตารางสรุป

| Language | availableFonts (after filter) | Selected Font | เหตุผล |
|----------|-------------------------------|---------------|--------|
| `th` | `['poppins', 'nunito', 'prompt']` | `prompt` | Default font + รองรับไทย |
| `en` | `['playfair', 'poppins', 'nunito', 'inter']` | `poppins` | ตัวแรกใน fontsByTone (warm) |
| `undefined` | `['poppins', 'nunito', 'prompt']` | `prompt` | Default font |

## ⚠️ สิ่งที่ต้องระวัง

### 1. ถ้า Prompt รองรับแค่ 'th' แล้วใช้กับภาษาอังกฤษ?

**ไม่เป็นไร!** เพราะ:
- ระบบจะตัด prompt ออกจากการ filter แล้ว
- จะใช้ font อื่นที่รองรับภาษาอังกฤษแทน
- `pool.defaultFont` จะถูกใช้ก็ต่อเมื่อมันอยู่ใน `availableFonts` เท่านั้น

### 2. จะเกิดอะไรถ้าไม่มี font ที่รองรับภาษา?

```typescript
if (availableFonts.length === 0) {
  // For Thai: ใช้ fallback fonts
  availableFonts = ['noto-sans-thai', 'sarabun', 'kanit', 'mitr', 'prompt'];
  
  // For English: ใช้ original pool
  availableFonts = pool.allowedFonts;
}
```

## 🎯 แนะนำ

### แก้ไขให้ Prompt รองรับทั้งไทยและอังกฤษ:
```typescript
'prompt': {
  supportsLanguages: ["th", "en", "all"]  // ✅ รองรับทั้งคู่
}
```

### หรือใช้ Font ที่รองรับทั้งสองอยู่แล้ว:
```typescript
'restaurant': {
  allowedFonts: ['poppins', 'nunito', 'prompt'],  // ทั้งหมดรองรับทั้งไทยและอังกฤษ
  defaultFont: 'prompt'
}
```

## 💡 สรุป

| Prompt Support | Language Input | Result | เสมือน |
|----------------|----------------|--------|---------|
| `["th"]` | `th` | `prompt` ✅ | ใช้ prompt ตาม default |
| `["th"]` | `en` | `poppins` ✅ | ระบบเปลี่ยนไปใช้ font ที่รองรับภาษาอังกฤษ |
| `["th"]` | `undefined` | `prompt` ✅ | ใช้ default font |

**สรุป:** ระบบจะเลือก font ที่เหมาะสมกับภาษาอัตโนมัติ! 🎉

