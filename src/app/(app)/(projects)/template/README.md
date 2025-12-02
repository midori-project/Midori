# 🚀 Shared Blocks + Override + Business Category Manifest System

ระบบสร้างเว็บไซต์แบบใหม่ที่ใช้ **Shared Blocks** (บล็อกที่ใช้ร่วมกัน) + **Override System** (ระบบปรับแต่ง) + **Business Category Manifests** (คู่มือประเภทธุรกิจ)

## 🎯 ภาพรวมระบบ

### 1. Shared Blocks (บล็อกที่ใช้ร่วมกัน)
- **Reusable Components**: คอมโพเนนต์ที่สามารถนำกลับมาใช้ใหม่ได้
- **Template-based**: ใช้ template พร้อม placeholder สำหรับการปรับแต่ง
- **Variant Support**: รองรับหลายรูปแบบของบล็อกเดียวกัน
- **Dependency Management**: จัดการความสัมพันธ์ระหว่างบล็อก

### 2. Override System (ระบบปรับแต่ง)
- **Business Category Overrides**: ปรับแต่งตามประเภทธุรกิจ
- **Custom Overrides**: ปรับแต่งตามความต้องการเฉพาะ
- **Template Overrides**: แก้ไข template โดยตรง
- **Placeholder Overrides**: ปรับแต่ง placeholder configuration

### 3. Business Category Manifests (คู่มือประเภทธุรกิจ)
- **Pre-configured Settings**: การตั้งค่าล่วงหน้าสำหรับแต่ละประเภทธุรกิจ
- **Keyword Matching**: จับคู่ประเภทธุรกิจจากคำสำคัญ
- **Industry-specific Customizations**: การปรับแต่งเฉพาะอุตสาหกรรม

## 📁 โครงสร้างไฟล์

```
template/
├── shared-blocks/
│   └── index.ts              # กำหนด Shared Blocks
├── business-categories/
│   └── index.ts              # กำหนด Business Categories
├── override-system/
│   └── index.ts              # ระบบ Override Engine
├── examples/
│   ├── restaurant-manifest.json
│   └── ecommerce-manifest.json
├── page.tsx                  # UI สำหรับทดสอบ
└── README.md                 # เอกสารนี้
```

## 🧩 Shared Blocks

### ตัวอย่าง Shared Block

```typescript
{
  id: 'hero-basic',
  name: 'Basic Hero Section',
  description: 'Standard hero section with heading, subheading, and CTA buttons',
  category: 'content',
  template: `export default function Hero(){
    return (
      <section className="relative py-20 bg-gradient-to-br from-{primary}-50...">
        <h1 className="text-5xl font-black text-{primary}-900">
          {heading}
        </h1>
        <p className="text-xl text-{primary}-700">
          {subheading}
        </p>
        <a className="bg-gradient-to-r from-{accentColor}-500...">
          {ctaLabel}
        </a>
      </section>
    );
  }`,
  placeholders: {
    heading: { type: 'string', required: true, maxLength: 80 },
    subheading: { type: 'string', required: true, maxLength: 160 },
    ctaLabel: { type: 'string', required: true, maxLength: 24 }
  },
  variants: [
    {
      id: 'hero-stats',
      name: 'Hero with Statistics',
      template: `{hero-basic}
        <div className="mt-16 grid grid-cols-3 gap-8">
          <div>{stat1}</div>
          <div>{stat2}</div>
          <div>{stat3}</div>
        </div>`,
      overrides: {
        stat1: { type: 'string', required: true },
        stat2: { type: 'string', required: true },
        stat3: { type: 'string', required: true }
      }
    }
  ]
}
```

## 🏢 Business Categories

### ตัวอย่าง Business Category

```typescript
{
  id: 'restaurant',
  name: 'Restaurant',
  description: 'Restaurant and food service websites',
  keywords: ['restaurant', 'food', 'dining', 'cafe', 'bistro'],
  blocks: [
    {
      blockId: 'navbar-basic',
      required: true,
      customizations: {
        menuItems: [
          { label: 'หน้าแรก', href: '/' },
          { label: 'เมนู', href: '/menu' },
          { label: 'เกี่ยวกับเรา', href: '/about' }
        ]
      }
    },
    {
      blockId: 'hero-basic',
      variantId: 'hero-stats',
      required: true,
      customizations: {
        badge: 'ร้านอาหารคุณภาพ',
        heading: 'อาหารอร่อย ราคาเป็นมิตร',
        ctaLabel: 'ดูเมนู',
        secondaryCta: 'จองโต๊ะ'
      }
    }
  ],
  globalSettings: {
    palette: { primary: 'orange', secondary: 'red' },
    tokens: { radius: '8px', spacing: '1rem' }
  },
  overrides: {
    'hero-basic': {
      placeholders: {
        heading: { 
          required: true, 
          maxLength: 80, 
          description: 'Restaurant main heading' 
        }
      }
    }
  }
}
```

## ⚙️ Override System

### การทำงานของ Override Engine

1. **Load Shared Blocks**: โหลดบล็อกที่ใช้ร่วมกัน
2. **Load Business Category**: โหลดประเภทธุรกิจ
3. **Apply Category Overrides**: ใช้การปรับแต่งตามประเภทธุรกิจ
4. **Apply Custom Overrides**: ใช้การปรับแต่งเฉพาะ
5. **Apply User Data**: ใส่ข้อมูลจากผู้ใช้
6. **Generate Final Template**: สร้าง template สุดท้าย

### ตัวอย่างการใช้งาน

```typescript
const overrideEngine = new OverrideEngine(SHARED_BLOCKS, BUSINESS_CATEGORIES);

// สร้างเว็บไซต์จากประเภทธุรกิจ
const results = overrideEngine.generateWebsite(
  'restaurant',           // Business category ID
  [],                     // Custom overrides
  {                       // User data
    Hero: {
      heading: 'ร้านอาหารไทยอร่อย',
      subheading: 'อาหารไทยแท้ ปรุงสดใหม่ทุกวัน'
    }
  }
);

// ผลลัพธ์
console.log(results['hero-basic'].finalTemplate);
```

## 🚀 การใช้งาน

### 1. ผ่าน API

```bash
GET /api/generate?keywords=restaurant,food,thai
```

### 2. ผ่าน UI

1. เปิดหน้า `/template`
2. ใส่คำสำคัญ (keywords)
3. เลือกประเภทธุรกิจ (หรือให้ระบบเลือกอัตโนมัติ)
4. กดปุ่ม "Generate Website"
5. ดูผลลัพธ์ที่สร้างขึ้น

## 🔧 การขยายระบบ

### เพิ่ม Shared Block ใหม่

```typescript
// ใน shared-blocks/index.ts
export const SHARED_BLOCKS: SharedBlock[] = [
  // ... existing blocks
  {
    id: 'footer-basic',
    name: 'Basic Footer',
    description: 'Standard footer with links and contact info',
    category: 'layout',
    template: `export default function Footer() {
      return (
        <footer className="bg-{primary}-900 text-white py-8">
          <div className="container mx-auto">
            <p>&copy; 2024 {brand}. All rights reserved.</p>
          </div>
        </footer>
      );
    }`,
    placeholders: {
      brand: { type: 'string', required: true, description: 'Brand name' }
    }
  }
];
```

### เพิ่ม Business Category ใหม่

```typescript
// ใน business-categories/index.ts
export const BUSINESS_CATEGORIES: BusinessCategoryManifest[] = [
  // ... existing categories
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical and healthcare service websites',
    keywords: ['health', 'medical', 'doctor', 'clinic', 'hospital'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'บริการ', href: '/services' },
            { label: 'แพทย์', href: '/doctors' },
            { label: 'นัดหมาย', href: '/appointment' }
          ]
        }
      }
      // ... other blocks
    ],
    globalSettings: {
      palette: { primary: 'green', secondary: 'blue' },
      tokens: { radius: '8px', spacing: '1rem' }
    }
  }
];
```

## 📊 ประโยชน์ของระบบ

### 1. **Reusability** (การนำกลับมาใช้)
- บล็อกเดียวกันใช้ได้กับหลายประเภทธุรกิจ
- ลดการเขียนโค้ดซ้ำซ้อน
- ง่ายต่อการบำรุงรักษา

### 2. **Flexibility** (ความยืดหยุ่น)
- ปรับแต่งได้ตามความต้องการ
- รองรับการขยายระบบ
- ใช้ได้กับหลายอุตสาหกรรม

### 3. **Consistency** (ความสอดคล้อง)
- ใช้มาตรฐานเดียวกัน
- ง่ายต่อการเรียนรู้
- ลดข้อผิดพลาด

### 4. **Scalability** (การขยายตัว)
- เพิ่มบล็อกใหม่ได้ง่าย
- เพิ่มประเภทธุรกิจใหม่ได้
- รองรับการใช้งานขนาดใหญ่

## 🎨 ตัวอย่างผลลัพธ์

### Restaurant Category
- **สี**: Orange + Red (อบอุ่น, กระตุ้นความอยากอาหาร)
- **เนื้อหา**: เน้นเมนู, การจองโต๊ะ, ประสบการณ์
- **สถิติ**: จำนวนปีประสบการณ์, ลูกค้าพึงพอใจ, เมนูหลากหลาย

### E-commerce Category
- **สี**: Blue + Purple (น่าเชื่อถือ, เป็นมืออาชีพ)
- **เนื้อหา**: เน้นสินค้า, การช้อปปิ้ง, ความปลอดภัย
- **สถิติ**: จำนวนสินค้า, บริการ 24/7, ส่งฟรี

### Portfolio Category
- **สี**: Purple + Pink (สร้างสรรค์, นวัตกรรม)
- **เนื้อหา**: เน้นผลงาน, ความสามารถ, การติดต่อ
- **สถิติ**: จำนวนโปรเจ็ค, ลูกค้า, รางวัล

## 🔮 แนวทางการพัฒนาต่อ

1. **เพิ่ม Shared Blocks**: Footer, Testimonials, Pricing, Gallery
2. **เพิ่ม Business Categories**: Education, Real Estate, Travel
3. **ปรับปรุง Override System**: Visual editor, Real-time preview
4. **เพิ่ม Features**: Animation, Responsive design, SEO optimization
5. **Integration**: CMS, Analytics, Payment systems

---

**สรุป**: ระบบ Shared Blocks + Override + Business Category Manifest ช่วยให้การสร้างเว็บไซต์เป็นเรื่องง่าย รวดเร็ว และยืดหยุ่น โดยสามารถปรับแต่งได้ตามความต้องการของแต่ละประเภทธุรกิจ
