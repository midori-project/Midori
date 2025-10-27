# 📝 สรุปแผนการจัดการฟอนต์

## ❓ คำถาม
> "เราเปลี่ยน font ของเว็บที่สร้างขึ้นมาได้ไหม? มีวิธีการยังไงบ้าง?"

## ✅ คำตอบ
**ตอบ: ได้ครับ!** ปัจจุบันระบบยังไม่สามารถเปลี่ยนฟอนต์ได้ เพราะฟอนต์ถูก hardcode ไว้

## 🎯 วิธีแก้ไขที่แนะนำ

### วิธีที่ 1: เพิ่ม Typography Configuration (แนะนำ) ⭐

เพิ่ม field `typography` ใน GlobalSettings เพื่อควบคุมฟอนต์แบบ centralize

**ตัวอย่าง:**
```typescript
globalSettings: {
  palette: { primary: "red", secondary: "orange" },
  tokens: { radius: "8px", spacing: "1rem" },
  typography: {                      // ⭐ เพิ่มใหม่
    fontFamily: "Playfair Display",
    googleFont: "Playfair+Display:wght@400;700",
    fallback: ["serif"]
  }
}
```

### วิธีที่ 2: Font Presets

สร้าง font presets ที่เหมาะกับแต่ละ tone:
- **Modern**: Inter (professional)
- **Elegant**: Playfair Display (luxury)
- **Warm**: Poppins (friendly)
- **Minimal**: Roboto (clean)
- **Creative**: Montserrat (artistic)
- **Traditional**: Lora (serious)

### วิธีที่ 3: Smart Auto-Selection

ให้ AI เลือกฟอนต์ที่เหมาะสมตาม tone อัตโนมัติ
- tone: "professional" → Inter
- tone: "luxury" → Playfair Display
- tone: "warm" → Poppins

---

## 📂 ไฟล์ที่ต้องแก้

1. **`business-categories/index.ts`**
   - เพิ่ม `typography` field ใน interface

2. **`project-templates/index.ts`** (line 441)
   - เปลี่ยนจาก `font-family: 'Inter', sans-serif;`
   - เป็น `font-family: {fontFamily}, {fallback};`

3. **`override-system/renderer.ts`**
   - เพิ่ม logic สำหรับ replace font placeholders

4. **ทุกไฟล์ใน `business-categories/categories/`**
   - เพิ่ม typography config

---

## 🚀 ขั้นตอนการทำ

### Phase 1: Setup (1-2 ชั่วโมง)
```bash
# 1. เพิ่ม interface
- business-categories/index.ts

# 2. แก้ CSS template
- project-templates/index.ts

# 3. สร้าง font-presets
- shared-blocks/font-presets.ts (new)
```

### Phase 2: Implementation (2-3 ชั่วโมง)
```bash
# 1. แก้ renderer
- override-system/renderer.ts

# 2. เพิ่ม typography ในแต่ละ category
- business-categories/categories/*.ts (หลายไฟล์)
```

### Phase 3: Testing (1 ชั่วโมง)
```bash
# ทดสอบกับหลายๆ category
- Restaurant (luxury tone)
- E-commerce (professional tone)
- Portfolio (creative tone)
```

---

## 💻 ตัวอย่างการใช้งาน

### ก่อนแก้ไข (ปัจจุบัน):
```css
body {
  font-family: 'Inter', sans-serif;  /* hardcoded */
}
```

### หลังแก้ไข:
```css
body {
  font-family: {fontFamily}, {fallback};  /* dynamic */
}

<!-- และใน <head> -->
<link href="https://fonts.googleapis.com/css2?family={googleFont}" rel="stylesheet">
```

### ตัวอย่าง Config:
```typescript
{
  id: "restaurant-luxury",
  globalSettings: {
    typography: {
      fontFamily: "Playfair Display",
      googleFont: "Playfair+Display:wght@400;700",
      fallback: ["serif"]
    }
  }
}
```

---

## 📋 Checklist

- [ ] Phase 1: เพิ่ม interface และ placeholder
- [ ] Phase 2: อัปเดต CSS templates
- [ ] Phase 3: อัปเดต categories ทั้งหมด
- [ ] Phase 4: ทดสอบและ debug

---

## 🎨 ตัวอย่าง Font Matching

| Business Type | Tone | Recommended Font | Google Font URL |
|--------------|------|-----------------|-----------------|
| Restaurant Luxury | luxury | Playfair Display | `Playfair+Display:wght@400;700` |
| E-commerce | professional | Inter | `Inter:wght@300;400;600;700` |
| Portfolio Creative | creative | Montserrat | `Montserrat:wght@300;400;600;700` |
| Restaurant Casual | warm | Poppins | `Poppins:wght@300;400;600` |
| Healthcare | professional | Roboto | `Roboto:wght@300;400;500;700` |
| News | serious | Lora | `Lora:wght@400;700` |

---

## ✨ ประโยชน์ที่ได้

1. ✅ **ความหลากหลาย**: ฟอนต์เหมาะกับแต่ละ business type
2. ✅ **ความยืดหยุ่น**: เลือกได้ทั้ง manual และ auto
3. ✅ **Google Fonts**: รองรับ external fonts
4. ✅ **Fallback**: มี system fonts เป็น backup
5. ✅ **ง่ายต่อการใช้งาน**: กำหนด config เดียวใช้ทั้งเว็บ

---

## 📖 อ่านเอกสารเต็ม

ดูรายละเอียดเต็มที่: [`font-customization-plan.md`](./font-customization-plan.md)

