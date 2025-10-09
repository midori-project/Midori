# Block Variants Quick Reference

## 🎯 ภาพรวม

Frontend-V2 รองรับ **14 variants** จาก **3 core blocks** เพื่อสร้าง layout ที่หลากหลาย

---

## 🦸 Hero Variants (6 variants)

### `hero-basic` ⭐ Default
**Use Case:** ทั่วไป - เหมาะสำหรับทุกประเภทธุรกิจ

**Layout:**
- Gradient background พร้อมรูปภาพ
- Badge, Heading, Subheading
- 2 CTA buttons
- ไม่มี extra sections

**Placeholders:** 7 (standard)

---

### `hero-stats` 📊
**Use Case:** แสดงความน่าเชื่อถือ - ร้านอาหาร, B2B

**Layout:**
- Hero พื้นฐาน + Stats section ด้านล่าง
- 3 statistics แสดงผลงาน

**Placeholders:** 13
- 7 standard + `stat1-3`, `stat1Label-stat3Label`

**ตัวอย่าง Stats:**
- "15+ ปีประสบการณ์"
- "1000+ ลูกค้าพึงพอใจ"
- "50+ เมนูหลากหลาย"

---

### `hero-split` 🔄
**Use Case:** Modern - Cafe, Tech startups, SaaS

**Layout:**
- แบ่งครึ่ง 50/50
- ซ้าย: Text content
- ขวา: Image/Visual

**Placeholders:** 7 (standard)

**Visual Style:** Clean, Contemporary

---

### `hero-fullscreen` 🖼️
**Use Case:** Luxury - Fine dining, Premium brands, Hotels

**Layout:**
- Full viewport height
- Centered overlay
- Dark gradient overlay
- Minimalist CTA

**Placeholders:** 7 (standard)

**Visual Style:** Elegant, Immersive

---

### `hero-minimal` ✨
**Use Case:** Minimal - Japanese restaurants, Simple products

**Layout:**
- No background image
- Clean white/light background
- Simple typography
- Subtle accents

**Placeholders:** 7 (standard)

**Visual Style:** Clean, Zen-like

---

### `hero-cards` 🃏
**Use Case:** Feature highlight - New products, Services

**Layout:**
- Hero section + 3 feature cards
- Cards แสดงจุดเด่นหลัก

**Placeholders:** 13
- 7 standard + `stat1-3`, `stat1Label-stat3Label`

**ตัวอย่าง Cards:**
- "🍕 Pizza Napoletana"
- "🍝 Fresh Pasta Daily"
- "🍷 Italian Wine Selection"

---

## 🍽️ Menu Variants (4 variants)

### `menu-basic` ⭐ Default (Grid)
**Use Case:** Standard showcase - Products, Menu items

**Layout:**
- 4-column grid (responsive)
- Large images
- Card-based design

**Best For:** E-commerce, Restaurant menus

---

### `menu-list` 📝
**Use Case:** Simple listing - Price lists, Traditional menus

**Layout:**
- Vertical list
- Compact design
- Clean typography

**Best For:** Price lists, Simple menus, Text-heavy content

---

### `menu-masonry` 🧱
**Use Case:** Visual showcase - Portfolios, Galleries

**Layout:**
- Pinterest-style masonry
- Dynamic heights
- Modern look

**Best For:** Portfolio, Creative agencies, Photo galleries

---

### `menu-carousel` 🎠
**Use Case:** Featured items - Highlights, Promotions

**Layout:**
- Horizontal scrolling
- Interactive
- Dark background

**Best For:** Featured products, Promotions, Special offers

---

## 👣 Footer Variants (4 variants)

### `footer-basic` ⭐ Default
**Use Case:** Standard website footer

**Layout:**
- 4 columns (Company, Links, Contact, Newsletter)
- Newsletter signup
- Social links
- Bottom copyright bar

**Best For:** Corporate, E-commerce, General websites

---

### `footer-minimal` 🎯
**Use Case:** Clean minimal design

**Layout:**
- Single row
- Essential info only
- Light background
- Compact

**Best For:** Landing pages, Minimal designs, Simple sites

---

### `footer-centered` 💎
**Use Case:** Elegant balanced layout

**Layout:**
- Center-aligned
- Stacked vertical layout
- Dark gradient background
- Symmetrical

**Best For:** Luxury brands, Premium products, Portfolios

---

### `footer-mega` 🏢
**Use Case:** Large comprehensive footer

**Layout:**
- 5 columns (Company, Quick Links, Services, Support, Extra)
- Extensive information
- Multiple link sections
- Large footprint

**Best For:** Large websites, Corporate, E-commerce platforms

---

## 🎨 การใช้งาน (Usage)

### วิธีระบุ Variant

```typescript
// ใน Business Category Manifest
{
  blockId: 'hero-basic',
  variantId: 'hero-split',  // ← ระบุ variant ที่ต้องการ
  customizations: {
    heading: 'Modern Cafe',
    subheading: 'Contemporary Coffee Experience'
  }
}
```

### ตัวอย่าง Restaurant Sub-Categories

```typescript
// Modern Restaurant
{
  id: 'restaurant-modern',
  blocks: [
    { blockId: 'hero-basic', variantId: 'hero-split' },
    { blockId: 'menu-basic', variantId: 'menu-masonry' },
    { blockId: 'footer-basic', variantId: 'footer-minimal' }
  ]
}
```

---

## 📊 Variant Combination Examples

### Minimal Portfolio
- Hero: `hero-minimal`
- Menu/Portfolio: `menu-masonry`
- Footer: `footer-centered`

### Luxury Restaurant
- Hero: `hero-fullscreen`
- Menu: `menu-basic`
- Footer: `footer-mega`

### Modern Startup
- Hero: `hero-split`
- Products: `menu-carousel`
- Footer: `footer-minimal`

### Traditional Business
- Hero: `hero-stats`
- Services: `menu-list`
- Footer: `footer-basic`

---

## 🔧 เพิ่ม Variant ใหม่

### Simple Variant (ไม่มี extra placeholders)
1. เพิ่มใน `shared-blocks/index.ts`
2. Set `overrides: {}`
3. เสร็จ! ระบบจะจัดการ AI prompt อัตโนมัติ

### Special Variant (มี extra placeholders)
1. เพิ่มใน `shared-blocks/index.ts`
2. ระบุ `overrides: { newField: {...} }`
3. ระบบจะสร้าง AI instructions อัตโนมัติ
4. Fallback values จะถูกเพิ่มอัตโนมัติ

**ดู:** [VARIANT_GUIDE.md](./template-system/VARIANT_GUIDE.md) สำหรับรายละเอียด

---

## 📈 Statistics

- **Total Blocks:** 7
- **Blocks with Variants:** 3
- **Total Variants:** 14
- **Hero Variants:** 6
- **Menu Variants:** 4
- **Footer Variants:** 4

---

## 🔗 Related Documentation

- [Frontend-V2 README](./README.md) - Main documentation
- [Variant Guide](./template-system/VARIANT_GUIDE.md) - Adding new variants
- [Override System](./template-system/override-system/README.md) - System internals
- [Layout Tester](../../app/(app)/layout-tester/README.md) - Web UI for testing

---

**💡 TIP:** ใช้ [Layout Tester](http://localhost:3000/layout-tester) เพื่อทดสอบ variants แบบ interactive!


