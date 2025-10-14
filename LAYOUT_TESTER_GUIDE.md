# 🎨 Layout Tester Guide

## ภาพรวม

Layout Tester เป็นเครื่องมือสำหรับทดสอบการทำงานของ **Variant System** ใน Midori AI Platform ที่ช่วยให้คุณสามารถ:

- 🏢 เลือก Business Categories ต่างๆ (Restaurant, E-commerce, Portfolio, etc.)
- 🎭 ทดสอบ Hero Variants ต่างๆ (hero-stats, hero-split, hero-fullscreen, etc.)
- 🖥️ ดู Live Preview และ Code Preview แบบ Real-time
- 🔄 เปรียบเทียบการทำงานของ Variant System

---

## 🚀 การเข้าถึง

### URL
```
http://localhost:3000/layout-tester
```

### Navigation
- ไปที่หน้า Landing Page
- คลิก "Layout Tester" ในเมนู หรือ
- ไปที่ `/layout-tester` โดยตรง

---

## 🎯 ฟีเจอร์หลัก

### 1️⃣ Business Category Selector
**ตำแหน่ง**: ด้านซ้ายบน

**การทำงาน**:
- แสดง Business Categories ทั้งหมดที่มีในระบบ
- แต่ละ Category มี:
  - 🏷️ **ID**: `restaurant-luxury`, `ecommerce`, `portfolio`
  - 🎨 **Tone**: `luxury`, `modern`, `warm`, `minimal`
  - 🎨 **Colors**: Primary + Secondary colors
  - 📦 **Blocks**: จำนวน blocks ที่ใช้
  - 🎭 **Hero Variant**: variant ที่เลือกใช้

**ตัวอย่าง Categories**:
```
🍽️ Restaurant (warm) - Orange + Red
🏢 Restaurant Modern (modern) - Blue + Indigo  
💎 Restaurant Luxury (luxury) - Gray + Amber
⚪ Restaurant Minimal (minimal) - Gray + Stone
😊 Restaurant Casual (friendly) - Orange + Yellow
🛒 E-commerce (professional) - Blue + Purple
```

### 2️⃣ Hero Variant Selector
**ตำแหน่ง**: ด้านซ้ายล่าง

**การทำงาน**:
- แสดง Hero Variants ทั้งหมด
- แต่ละ Variant มี:
  - 🎨 **Icon**: แสดงประเภทของ variant
  - 📝 **Description**: อธิบายการใช้งาน
  - ⚙️ **Overrides**: จำนวน customizations

**ตัวอย่าง Variants**:
```
📊 hero-stats - Statistics-focused layout
📱 hero-split - Modern split-screen design  
🖥️ hero-fullscreen - Dramatic full-screen hero
⚪ hero-minimal - Clean, minimal design
🃏 hero-cards - Feature cards layout
```

### 3️⃣ Preview Panel
**ตำแหน่ง**: ด้านขวา

**โหมดการแสดงผล**:
- 🖥️ **Live Preview**: แสดงผลลัพธ์แบบ Mock UI
- 💻 **Code Preview**: แสดง Template Code

---

## 🎮 วิธีการใช้งาน

### ขั้นตอนที่ 1: เลือก Business Category
1. ดูรายการ Business Categories ด้านซ้าย
2. คลิกที่ Category ที่ต้องการทดสอบ
3. ระบบจะ Auto-select Hero Variant ที่เหมาะสม

**ตัวอย่าง**:
- เลือก `Restaurant Luxury` → Auto-select `hero-fullscreen`
- เลือก `Restaurant Modern` → Auto-select `hero-split`
- เลือก `E-commerce` → Auto-select `hero-stats`

### ขั้นตอนที่ 2: เลือก Hero Variant
1. ดูรายการ Hero Variants ด้านซ้ายล่าง
2. คลิกที่ Variant ที่ต้องการทดสอบ
3. ระบบจะอัปเดต Preview ทันที

### ขั้นตอนที่ 3: ดูผลลัพธ์
1. **Live Preview**: ดู Mock UI ที่แสดงผลลัพธ์
2. **Code Preview**: ดู Template Code ที่ถูกสร้างขึ้น

---

## 🔍 การอ่านผลลัพธ์

### Live Preview
```
🎨 Category Settings:
- Tone: luxury
- Colors: gray + amber

🎭 Variant Info:  
- Type: Hero Fullscreen
- Overrides: 0
```

### Code Preview
```jsx
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src="{heroImage}" alt="{heroImageAlt}" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-gray-900/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white">
        <h1 className="text-6xl lg:text-8xl font-black mb-8">
          {heading}
        </h1>
        <p className="text-2xl lg:text-3xl mb-12">
          {subheading}
        </p>
      </div>
    </section>
  );
}
```

---

## 🎨 Business Categories ที่รองรับ

### Restaurant Categories
| Category | Tone | Colors | Hero Variant | ใช้สำหรับ |
|----------|------|--------|--------------|-----------|
| `restaurant` | warm | orange + red | hero-stats | ร้านอาหารทั่วไป |
| `restaurant-modern` | modern | blue + indigo | hero-split | ร้านอาหารโมเดิร์น |
| `restaurant-luxury` | luxury | gray + amber | hero-fullscreen | ร้านอาหารหรูหรา |
| `restaurant-minimal` | minimal | gray + stone | hero-minimal | ร้านอาหารมินิมอล |
| `restaurant-casual` | friendly | orange + yellow | hero-cards | ร้านอาหารสบายๆ |

### E-commerce Categories
| Category | Tone | Colors | Hero Variant | ใช้สำหรับ |
|----------|------|--------|--------------|-----------|
| `ecommerce` | professional | blue + purple | hero-stats | ร้านค้าออนไลน์ |

### Portfolio Categories
| Category | Tone | Colors | Hero Variant | ใช้สำหรับ |
|----------|------|--------|--------------|-----------|
| `portfolio` | professional | blue + indigo | hero-minimal | Portfolio ส่วนตัว |

### Healthcare Categories
| Category | Tone | Colors | Hero Variant | ใช้สำหรับ |
|----------|------|--------|--------------|-----------|
| `healthcare` | professional | green + blue | hero-stats | โรงพยาบาล/คลินิก |

---

## 🎭 Hero Variants ที่รองรับ

### Variant Types
| Variant | Icon | Description | เหมาะสำหรับ |
|---------|------|-------------|-------------|
| `hero-stats` | 📊 | Statistics-focused layout | ร้านอาหาร, E-commerce, Healthcare |
| `hero-split` | 📱 | Modern split-screen design | ร้านอาหารโมเดิร์น, Portfolio |
| `hero-fullscreen` | 🖥️ | Dramatic full-screen hero | ร้านอาหารหรูหรา, Luxury brands |
| `hero-minimal` | ⚪ | Clean, minimal design | ร้านอาหารมินิมอล, Portfolio |
| `hero-cards` | 🃏 | Feature cards layout | ร้านอาหารสบายๆ, Service businesses |

---

## 🔧 Technical Details

### Data Flow
```
User Selection
    ↓
Business Category Selected
    ↓
Auto-select Hero Variant (if exists)
    ↓
Update Preview Panel
    ↓
Render Template with Mock Data
    ↓
Display Live/Code Preview
```

### Mock Data
```typescript
const mockData = {
  badge: 'Sample Badge',
  heading: 'Sample Heading', 
  subheading: 'This is a sample subheading...',
  ctaLabel: 'Get Started',
  secondaryCta: 'Learn More',
  heroImage: 'https://images.unsplash.com/...',
  stat1: '100+',
  stat1Label: 'Happy Customers',
  // ... more mock data
};
```

### Color System
```typescript
// Primary colors from category
primary: 'gray' | 'blue' | 'orange' | 'green'
secondary: 'amber' | 'indigo' | 'red' | 'stone'

// Applied in templates
className="bg-{primary}-600 text-{primary}-100"
```

---

## 🐛 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. Preview ไม่แสดงผล
**สาเหตุ**: Template processing error
**แก้ไข**: 
- รีเฟรชหน้า
- ตรวจสอบ Console logs
- ลองเปลี่ยน Category หรือ Variant

#### 2. Colors ไม่ถูกต้อง
**สาเหตุ**: Tailwind CSS classes ไม่ถูก generate
**แก้ไข**:
- ตรวจสอบ `globalSettings.palette`
- ใช้สีที่ Tailwind รองรับ

#### 3. Variant ไม่เปลี่ยน
**สาเหตุ**: Auto-selection logic error
**แก้ไข**:
- เลือก Category ใหม่
- เลือก Variant ด้วยตนเอง

---

## 🚀 การพัฒนาต่อ

### Features ที่สามารถเพิ่มได้
1. **Real Template Rendering**: แทนที่ Mock UI ด้วยการ render จริง
2. **Custom Mock Data**: ให้ user ป้อนข้อมูลทดสอบเอง
3. **Export Functionality**: Export template code
4. **Comparison Mode**: เปรียบเทียบ 2 variants พร้อมกัน
5. **Performance Metrics**: แสดงขนาดไฟล์, loading time

### Code Structure
```
src/
├── app/layout-tester/
│   └── page.tsx                 # Main page
├── components/layout-tester/
│   ├── BusinessCategorySelector.tsx
│   ├── VariantSelector.tsx  
│   ├── VariantPreview.tsx
│   └── index.ts
└── midori/agents/frontend-v2/
    └── template-system/
        ├── business-categories/
        └── shared-blocks/
            └── variants/
```

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:
1. ตรวจสอบ Console logs
2. ดู Network tab สำหรับ API calls
3. ตรวจสอบ Component props
4. ดู Documentation ใน `/docs`

---

**Happy Testing! 🎨✨**