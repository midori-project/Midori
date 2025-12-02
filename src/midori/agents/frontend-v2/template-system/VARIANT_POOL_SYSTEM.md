# Variant Pool System

ระบบ Variant Pool เป็นการปรับปรุงระบบ template system เพื่อให้ business categories สามารถควบคุม variants ที่ใช้ได้อย่างมีประสิทธิภาพ

## 🎯 วัตถุประสงค์

- **ควบคุมการเลือก variant**: จำกัด variants ที่ใช้ได้ในแต่ละ business category
- **ป้องกันการใช้ variant ที่ไม่เหมาะสม**: เช่น hero-minimal ไม่เหมาะกับ luxury restaurant
- **ให้ความยืดหยุ่น**: รองรับทั้งการเลือกแบบ fixed และ random
- **ระบบ constraints ที่ยืดหยุ่น**: กำหนดเงื่อนไขตาม business type และ tone

## 🏗️ โครงสร้างระบบ

### 1. VariantPools Interface

```typescript
export interface VariantPools {
  [blockId: string]: {
    allowedVariants: string[];        // variants ที่ใช้ได้
    defaultVariant?: string;          // variant เริ่มต้น
    randomSelection?: boolean;        // เปิด/ปิดการสุ่ม
    constraints?: VariantConstraints; // เงื่อนไขเพิ่มเติม
  };
}
```

### 2. VariantConstraints Interface

```typescript
export interface VariantConstraints {
  minVariants?: number;           // จำนวน variants ขั้นต่ำ
  maxVariants?: number;           // จำนวน variants สูงสุด
  requiredVariants?: string[];    // variants ที่ต้องมี
  excludedVariants?: string[];    // variants ที่ห้ามใช้
  businessType?: string[];        // ประเภทธุรกิจที่รองรับ
  tone?: string[];               // tone ที่เหมาะสม
}
```

## 📋 ตัวอย่างการใช้งาน

### 1. E-commerce Category

```typescript
variantPools: {
  'hero-basic': {
    allowedVariants: ['hero-stats', 'hero-split', 'hero-cards'],
    defaultVariant: 'hero-stats',
    randomSelection: false,
    constraints: {
      businessType: ['ecommerce', 'retail', 'online-store'],
      tone: ['professional', 'trustworthy', 'modern']
    }
  }
}
```

**เหตุผล**: E-commerce ต้องการ variants ที่แสดงความน่าเชื่อถือและข้อมูลสถิติ

### 2. Restaurant Category

```typescript
variantPools: {
  'hero-basic': {
    allowedVariants: ['hero-stats', 'hero-split', 'hero-fullscreen', 'hero-cards'],
    defaultVariant: 'hero-stats',
    randomSelection: true, // 🎲 สุ่มเพื่อความหลากหลาย
    constraints: {
      businessType: ['restaurant', 'food-service', 'dining'],
      tone: ['warm', 'inviting', 'appetizing']
    }
  }
}
```

**เหตุผล**: Restaurant ต้องการความหลากหลายและ variants ที่สร้างความอยากอาหาร

### 3. Luxury Restaurant Category

```typescript
variantPools: {
  'hero-basic': {
    allowedVariants: ['hero-fullscreen', 'hero-minimal'],
    defaultVariant: 'hero-fullscreen',
    randomSelection: false,
    constraints: {
      businessType: ['restaurant', 'luxury', 'fine-dining'],
      tone: ['luxury', 'elegant', 'sophisticated', 'premium']
    }
  }
}
```

**เหตุผล**: Luxury restaurant ต้องการ variants ที่แสดงความหรูหราและความสง่างาม

### 4. Minimal Restaurant Category

```typescript
variantPools: {
  'hero-basic': {
    allowedVariants: ['hero-minimal'],
    defaultVariant: 'hero-minimal',
    randomSelection: false,
    constraints: {
      businessType: ['restaurant', 'minimal'],
      tone: ['minimal', 'clean', 'simple', 'focused']
    }
  }
}
```

**เหตุผล**: Minimal restaurant ต้องการเฉพาะ hero-minimal เพื่อความเรียบง่าย

## 🔧 ฟังก์ชัน Utility

### 1. ดู variants ที่ใช้ได้

```typescript
const variants = getAllowedVariants('ecommerce', 'hero-basic');
// Returns: ['hero-stats', 'hero-split', 'hero-cards']
```

### 2. ดู default variant

```typescript
const defaultVariant = getDefaultVariant('ecommerce', 'hero-basic');
// Returns: 'hero-stats'
```

### 3. ตรวจสอบว่า variant ใช้ได้หรือไม่

```typescript
const isAllowed = isVariantAllowed('ecommerce', 'hero-basic', 'hero-stats');
// Returns: true

const isNotAllowed = isVariantAllowed('ecommerce', 'hero-basic', 'hero-minimal');
// Returns: false
```

### 4. สุ่ม variant จาก pool

```typescript
const randomVariant = getRandomVariantFromPool('restaurant', 'hero-basic');
// Returns: 'hero-stats' หรือ 'hero-split' หรือ 'hero-fullscreen' หรือ 'hero-cards'
```

### 5. ตรวจสอบ validation

```typescript
const validation = validateVariantSelection('ecommerce', 'hero-basic', 'hero-minimal');
// Returns: { valid: false, reason: "Variant 'hero-minimal' is not allowed for block 'hero-basic' in category 'ecommerce'" }
```

### 6. ดู variant pools ทั้งหมดของ category

```typescript
const pools = getCategoryVariantPools('restaurant');
// Returns: { 'hero-basic': {...}, 'about-basic': {...}, ... }
```

## 🎨 ระบบ Constraints

### Business Types
- `ecommerce`, `retail`, `online-store`
- `restaurant`, `food-service`, `dining`
- `luxury`, `fine-dining`, `premium`
- `minimal`, `simple`, `clean`
- `casual`, `family`, `friendly`

### Tones
- `professional`, `trustworthy`, `modern`
- `warm`, `inviting`, `appetizing`
- `luxury`, `elegant`, `sophisticated`
- `minimal`, `clean`, `simple`, `focused`
- `friendly`, `welcoming`, `cozy`

## 🚀 การใช้งานใน Template System

### 1. การเลือก variant อัตโนมัติ

```typescript
// ใช้ default variant
const variantId = getDefaultVariant(categoryId, blockId) || 'basic';

// หรือใช้ random variant (ถ้าเปิดใช้งาน)
const variantId = category.variantPools[blockId]?.randomSelection 
  ? getRandomVariantFromPool(categoryId, blockId) 
  : getDefaultVariant(categoryId, blockId);
```

### 2. การตรวจสอบก่อนใช้งาน

```typescript
const validation = validateVariantSelection(categoryId, blockId, selectedVariant);
if (!validation.valid) {
  console.error(validation.reason);
  // ใช้ default variant แทน
  const fallbackVariant = getDefaultVariant(categoryId, blockId);
}
```

## 📊 ตัวอย่างการเปรียบเทียบ

| Category | Hero Variants | Default | Random | Tone |
|----------|---------------|---------|--------|------|
| E-commerce | stats, split, cards | stats | No | professional |
| Restaurant | stats, split, fullscreen, cards | stats | Yes | warm |
| Modern Restaurant | split, minimal, fullscreen | split | No | modern |
| Luxury Restaurant | fullscreen, minimal | fullscreen | No | luxury |
| Minimal Restaurant | minimal | minimal | No | minimal |
| Casual Restaurant | cards, stats, split | cards | Yes | warm |

## 🔄 การ Migration

### 1. อัปเดต BusinessCategoryManifest

เพิ่ม `variantPools` property ในทุก business category:

```typescript
export interface BusinessCategoryManifest {
  // ... existing properties
  variantPools: VariantPools; // ← เพิ่มใหม่
}
```

### 2. อัปเดต BlockUsage

เปลี่ยนจาก `getRandomVariant()` เป็นการใช้ variant pools:

```typescript
// เก่า
variantId: getRandomVariant(HERO_VARIANTS)

// ใหม่
variantId: 'hero-stats' // จะถูกจัดการโดย variantPools
```

### 3. ใช้ฟังก์ชัน Utility

แทนที่การสุ่มแบบเก่าด้วยฟังก์ชันใหม่:

```typescript
// เก่า
const randomVariant = getRandomVariant(variants);

// ใหม่
const randomVariant = getRandomVariantFromPool(categoryId, blockId);
```

## 🎯 ประโยชน์ของระบบใหม่

1. **ความปลอดภัย**: ป้องกันการใช้ variant ที่ไม่เหมาะสม
2. **ความยืดหยุ่น**: รองรับทั้ง fixed และ random selection
3. **ความชัดเจน**: กำหนด variants ที่ใช้ได้อย่างชัดเจน
4. **การบำรุงรักษา**: ง่ายต่อการเพิ่ม/ลบ variants
5. **การขยายตัว**: รองรับ constraints ที่ซับซ้อน
6. **การตรวจสอบ**: มี validation ที่ครอบคลุม

## 🧪 การทดสอบ

ใช้ไฟล์ `variant-pool-demo.ts` เพื่อทดสอบระบบ:

```typescript
import { runVariantPoolDemo } from './variant-pool-demo';

// เรียกใช้ demo
runVariantPoolDemo();
```

## 📝 หมายเหตุ

- ระบบนี้ backward compatible กับ template system เดิม
- สามารถเพิ่ม business categories และ variants ใหม่ได้ง่าย
- รองรับการกำหนด constraints ที่ซับซ้อน
- มีฟังก์ชัน utility ที่ครอบคลุมสำหรับการใช้งาน
