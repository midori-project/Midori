# Frontend-V2 Agent

## ภาพรวม (Overview)

Frontend-V2 Agent เป็นระบบสร้างเว็บไซต์อัตโนมัติที่ใช้ Template System ร่วมกับ AI Integration สำหรับการสร้างเว็บไซต์ที่ทันสมัยและมีประสิทธิภาพ

### ✨ คุณสมบัติหลัก

- 🎨 **Template-based Generation** - สร้างเว็บไซต์จากระบบ Template ที่มีโครงสร้างชัดเจน
- 🧩 **14 Block Variants** - Hero (6), Menu (4), Footer (4) สำหรับ layout หลากหลาย
- 🤖 **AI Content Generation** - สร้างเนื้อหาด้วย AI ตาม keywords และ business category
- 🏢 **Business Category Detection** - ระบุประเภทธุรกิจอัตโนมัติ
- 📱 **Responsive Design** - ออกแบบที่รองรับทุกอุปกรณ์
- 👀 **Real-time Preview** - ดูผลลัพธ์แบบ real-time ผ่าน Daytona
- ⚙️ **Customization Override** - ปรับแต่งตามความต้องการ
- 🚀 **Performance Optimization** - ปรับปรุงประสิทธิภาพ
- ♿ **Accessibility Compliance** - รองรับมาตรฐาน accessibility

## 🏗️ สถาปัตยกรรม (Architecture)

```
Frontend-V2 Agent
├── 🎯 Core Runner (runners/run.ts)
├── 🔌 Template Adapter (adapters/template-adapter.ts)
├── 🤖 AI Service (services/ai-service.ts)
├── 🏢 Category Service (services/category-service.ts)
├── 💾 Persistence Service (services/persistence-service.ts)
├── 📸 Unsplash Service (services/unsplash-service.ts)
├── 🧩 Template System
│   ├── Override System
│   ├── Shared Blocks
│   ├── Business Categories
│   ├── Project Templates
│   └── Project Structure Generator
├── 📋 Schemas
└── 🧪 Tests
```

## 🚀 การติดตั้ง (Installation)

### Prerequisites

- Node.js 18+
- TypeScript 5.9+
- OpenAI API Key (สำหรับ AI features)

### Setup

```bash
# ติดตั้ง dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

### Environment Variables

สร้างไฟล์ `.env` ใน root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
FRONTEND_AI_MODEL=gpt-5-nano
```

## 📖 การใช้งาน (Usage)

### Basic Usage

```typescript
import { runFrontendAgentV2 } from './runners/run';
import { FrontendTaskV2 } from './schemas/types';

const task: FrontendTaskV2 = {
  taskId: 'website-001',
  taskType: 'generate_website',
  businessCategory: 'restaurant',
  keywords: ['restaurant', 'food', 'thai', 'อร่อย'],
  customizations: {
    colors: ['orange', 'red'],
    theme: 'modern',
    layout: 'single-page',
    features: ['hero_section', 'about_section', 'contact_form']
  },
  includePreview: true,
  validation: {
    enabled: true,
    strictMode: true,
    accessibilityLevel: 'AA'
  },
  aiSettings: {
    model: 'gpt-5-nano',
    temperature: 1,
    language: 'th'
  }
};

const result = await runFrontendAgentV2(task);
```

### Advanced Usage

#### Using Layout Variants (Sub-Categories)

```typescript
// Modern Restaurant - Split Layout
const modernTask: FrontendTaskV2 = {
  taskId: 'restaurant-modern-001',
  taskType: 'generate_website',
  businessCategory: 'restaurant-modern',  // ใช้ modern layout
  keywords: ['restaurant', 'modern', 'contemporary', 'fusion']
};

// Luxury Restaurant - Fullscreen Layout
const luxuryTask: FrontendTaskV2 = {
  taskId: 'restaurant-luxury-001',
  taskType: 'generate_website',
  businessCategory: 'restaurant-luxury',  // ใช้ luxury layout
  keywords: ['fine dining', 'premium', 'elegant']
};

// Minimal Restaurant - Clean Layout
const minimalTask: FrontendTaskV2 = {
  taskId: 'restaurant-minimal-001',
  taskType: 'generate_website',
  businessCategory: 'restaurant-minimal',  // ใช้ minimal layout
  keywords: ['restaurant', 'simple', 'clean']
};

// Casual Restaurant - Cards Layout
const casualTask: FrontendTaskV2 = {
  taskId: 'restaurant-casual-001',
  taskType: 'generate_website',
  businessCategory: 'restaurant-casual',  // ใช้ casual layout
  keywords: ['restaurant', 'family', 'friendly']
};
```

#### Auto-Detection with Keywords

```typescript
// AI จะเลือก layout อัตโนมัติจาก keywords
const autoTask: FrontendTaskV2 = {
  taskId: 'restaurant-auto-001',
  taskType: 'generate_website',
  // ไม่ระบุ businessCategory - ให้ AI เลือก
  keywords: ['restaurant', 'luxury', 'fine dining', 'elegant']
  // AI จะเลือก 'restaurant-luxury' จาก keywords
};
```

#### Batch Processing with Multiple Layouts

```typescript
// Batch processing
import { runBatchFrontendAgentV2 } from './runners/run';

const tasks: FrontendTaskV2[] = [
  {
    taskId: 'restaurant-001',
    taskType: 'generate_website',
    businessCategory: 'restaurant-modern',
    keywords: ['restaurant', 'modern']
  },
  {
    taskId: 'restaurant-002',
    taskType: 'generate_website',
    businessCategory: 'restaurant-luxury',
    keywords: ['fine dining', 'premium']
  },
  {
    taskId: 'ecommerce-001',
    taskType: 'generate_website',
    businessCategory: 'ecommerce',
    keywords: ['shop', 'online']
  }
];

const results = await runBatchFrontendAgentV2(tasks);
```

### Health Check

```typescript
import { healthCheck } from './runners/run';

const health = await healthCheck();
console.log('System status:', health.status);
```

## 📋 Schema Reference

### FrontendTaskV2

```typescript
interface FrontendTaskV2 {
  taskId: string;                    // รหัสงาน
  taskType: 'generate_website' | 'customize_component' | 'create_page' | 'update_styling' | 'regenerate_content' | 'create_preview';
  businessCategory: 'restaurant' | 'ecommerce' | 'portfolio' | 'healthcare' | 'education' | 'real_estate';
  keywords: string[];                // คำสำคัญสำหรับ AI
  customizations?: {
    colors?: string[];               // สีที่ต้องการ
    theme?: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';
    layout?: 'single-page' | 'multi-page' | 'landing' | 'dashboard';
    features?: string[];             // ฟีเจอร์ที่ต้องการ
  };
  target?: string;                   // เป้าหมายการสร้างไฟล์
  includePreview?: boolean;          // สร้าง preview หรือไม่
  validation?: {
    enabled?: boolean;
    strictMode?: boolean;
    accessibilityLevel?: 'A' | 'AA' | 'AAA';
  };
  aiSettings?: {
    model?: 'gpt-5-nano' | 'gpt-4o-mini' | 'gpt-4o';
    temperature?: number;
    language?: 'th' | 'en' | 'auto';
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    userId?: string;
    projectId?: string;
    timestamp?: string;
    dependencies?: string[];
    tags?: string[];
  };
}
```

### ComponentResultV2

```typescript
interface ComponentResultV2 {
  success: boolean;
  result: {
    businessCategory: string;
    projectType: string;
    templateUsed: string;
    blocksGenerated: string[];
    aiContentGenerated: boolean;
    customizationsApplied: string[];
    overridesApplied: string[];
  };
  files: Array<{
    path: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'test' | 'documentation';
    size: number;
    blockId?: string;
    customized?: boolean;
  }>;
  preview?: {
    url: string;
    sandboxId: string;
    status: 'pending' | 'ready' | 'error';
    error?: string;
    createdAt: string;
  };
  performance: {
    generationTime: number;
    templateRenderingTime: number;
    aiGenerationTime: number;
    totalFiles: number;
    totalSize: string;
  };
  validation: {
    isValid: boolean;
    errors: Array<{
      type: string;
      message: string;
      file: string;
      line: number;
    }>;
    warnings: Array<{
      type: string;
      message: string;
      file: string;
    }>;
    accessibilityScore: number;
    typescriptErrors: number;
  };
  metadata: {
    executionTime: number;
    timestamp: string;
    agent: string;
    version: string;
    templateSystemVersion?: string;
    aiModelUsed?: string;
  };
  error?: {
    message: string;
    code: string;
    details: string;
    recoveryAttempted: boolean;
  };
}
```

## 🎨 Template System

### Business Categories

ระบบรองรับ business categories ต่อไปนี้:

#### Main Categories

- **restaurant** - ร้านอาหาร (แบบพื้นฐาน)
- **ecommerce** - ร้านค้าออนไลน์
- **portfolio** - แฟ้มผลงาน
- **healthcare** - สุขภาพ
- **education** - การศึกษา
- **real_estate** - อสังหาริมทรัพย์
- **pharmacy** - ร้านขายยา

#### Restaurant Sub-Categories (Layout Variants)

ระบบมี 4 แบบ layout สำหรับร้านอาหาร เพื่อความหลากหลายและเหมาะกับสไตล์ต่างๆ:

##### 1. **restaurant-modern** - ร้านอาหารโมเดิร์น
- **Layout**: Split Layout (hero-split) - แบ่งครึ่งจอ
- **สี**: Blue & Indigo (สีน้ำเงินสดใส)
- **บรรยากาศ**: ทันสมัย สะอาดตา เป็นระเบียบ
- **เหมาะกับ**: ร้านอาหารสไตล์โมเดิร์น, Cafe ร่วมสมัย, Fusion Restaurant
- **Keywords**: `modern`, `contemporary`, `trendy`, `ร้านอาหารโมเดิร์น`, `ทันสมัย`

```typescript
{
  businessCategory: 'restaurant-modern',
  keywords: ['restaurant', 'modern', 'contemporary']
}
```

##### 2. **restaurant-luxury** - ร้านอาหารหรูหรา
- **Layout**: Fullscreen Layout (hero-fullscreen) - เต็มจอพร้อม overlay
- **สี**: Gray & Amber (สีเทาเข้มกับทอง)
- **บรรยากาศ**: หรูหรา พรีเมียม สง่างาม
- **เหมาะกับ**: Fine Dining, ร้านอาหารระดับไมเชลิน, Premium Restaurant
- **Keywords**: `luxury`, `fine dining`, `premium`, `elegant`, `ร้านอาหารหรูหรา`

```typescript
{
  businessCategory: 'restaurant-luxury',
  keywords: ['restaurant', 'luxury', 'fine dining']
}
```

##### 3. **restaurant-minimal** - ร้านอาหารมินิมอล
- **Layout**: Minimal Layout (hero-minimal) - เรียบง่าย สะอาดตา
- **สี**: Gray & Stone (สีเทาอ่อน นู้ด)
- **บรรยากาศ**: เรียบง่าย สะอาด มุ่งเน้นเนื้อหา
- **เหมาะกับ**: ร้านอาหารมินิมอล, Japanese Restaurant, Simple Cafe
- **Keywords**: `minimal`, `simple`, `clean`, `ร้านอาหารมินิมอล`, `เรียบง่าย`

```typescript
{
  businessCategory: 'restaurant-minimal',
  keywords: ['restaurant', 'minimal', 'clean']
}
```

##### 4. **restaurant-casual** - ร้านอาหารสบายๆ
- **Layout**: Cards Layout (hero-cards) - มี feature cards เด่น
- **สี**: Orange & Yellow (สีส้มอบอุ่น)
- **บรรยากาศ**: อบอุ่น เป็นกันเอง เหมาะกับครอบครัว
- **เหมาะกับ**: ร้านอาหารสบายๆ, ร้านอาหารครอบครัว, Street Food
- **Keywords**: `casual`, `friendly`, `family`, `cozy`, `ร้านอาหารสบายๆ`

```typescript
{
  businessCategory: 'restaurant-casual',
  keywords: ['restaurant', 'casual', 'family']
}
```

### Shared Blocks

ระบบมี shared blocks หลัก:

- **hero-basic** - ส่วน Hero (มี 5 variants)
- **navbar-basic** - Navigation Bar
- **about-basic** - เกี่ยวกับเรา
- **contact-basic** - ติดต่อ
- **menu-basic** - เมนู/สินค้า
- **footer-basic** - Footer
- **theme-basic** - ธีมสี

#### Block Variants

ระบบรองรับ variants สำหรับหลาย blocks เพื่อความหลากหลายของ layout:

### Hero Block Variants

Block `hero-basic` มี **5 variants** ให้เลือกใช้:

##### 1. **hero-basic** (Default)
- Standard hero พร้อม gradient background
- รองรับ badge, heading, subheading, 2 CTA buttons
- มีรูปภาพพื้นหลัง

##### 2. **hero-stats**
- Hero พร้อมส่วนแสดงสถิติ (Statistics)
- เหมาะสำหรับแสดงความน่าเชื่อถือ
- ต้องการ: `stat1`, `stat1Label`, `stat2`, `stat2Label`, `stat3`, `stat3Label`

##### 3. **hero-split** (Modern)
- Layout แบบแบ่งครึ่งจอ (เนื้อหา 50% + รูป 50%)
- ดูทันสมัย สะอาดตา
- มี decorative elements (gradient blobs)

##### 4. **hero-fullscreen** (Luxury)
- เต็มจอพร้อม overlay สีเข้ม
- Dramatic และสง่างาม
- มี scroll indicator
- เหมาะสำหรับ luxury brands

##### 5. **hero-minimal** (Clean)
- เรียบง่าย สะอาดตา
- รูปอยู่ด้านล่าง
- เน้นเนื้อหาและ typography

##### 6. **hero-cards** (Engaging)
- Hero พร้อม 3 feature cards ด้านล่าง
- เหมาะสำหรับแสดงจุดเด่นหลักๆ
- ต้องการ: `stat1-3` + labels

**ตัวอย่างการระบุ Variant:**
```typescript
{
  blockId: 'hero-basic',
  variantId: 'hero-split',  // ระบุ variant ที่ต้องการ
  customizations: {
    badge: 'Modern Restaurant',
    heading: 'Contemporary Dining',
    subheading: 'Experience modern cuisine',
    ctaLabel: 'View Menu',
    secondaryCta: 'Book Table'
  }
}
```

### Menu Block Variants

Block `menu-basic` มี **3 variants** ให้เลือกใช้:

##### 1. **menu-basic** (Default - Grid)
- Grid layout 4 คอลัมน์
- รองรับรูปภาพขนาดใหญ่
- เหมาะสำหรับ showcase สินค้า/เมนู

##### 2. **menu-list**
- List layout แนวตั้ง
- เรียบง่าย สะอาดตา
- เหมาะสำหรับเมนูอาหาร, price list

##### 3. **menu-masonry**
- Masonry grid (Pinterest-style)
- Dynamic และทันสมัย
- เหมาะสำหรับ portfolio, gallery

##### 4. **menu-carousel**
- Horizontal scrolling carousel
- Interactive และน่าสนใจ
- เหมาะสำหรับ featured items

### Footer Block Variants

Block `footer-basic` มี **3 variants** ให้เลือกใช้:

##### 1. **footer-basic** (Default)
- 4 คอลัมน์พร้อม newsletter
- ครบครันทุกข้อมูล
- เหมาะสำหรับ website ทั่วไป

##### 2. **footer-minimal**
- Minimal one-line footer
- สะอาดตา เรียบง่าย
- เหมาะสำหรับ minimal design

##### 3. **footer-centered**
- Centered layout
- สง่างาม เน้นความสมดุล
- เหมาะสำหรับ luxury brands

##### 4. **footer-mega**
- 5 คอลัมน์พร้อมข้อมูลเพิ่มเติม
- ครอบคลุมทุกรายละเอียด
- เหมาะสำหรับ large websites

### Customization Options

#### Colors
รองรับสี: `blue`, `green`, `purple`, `pink`, `orange`, `red`, `yellow`, `indigo`

#### Themes
- **modern** - สไตล์ทันสมัย
- **classic** - สไตล์คลาสสิก
- **minimal** - สไตล์มินิมอล
- **creative** - สไตล์สร้างสรรค์
- **professional** - สไตล์มืออาชีพ

#### Layouts
- **single-page** - หน้าเดียว
- **multi-page** - หลายหน้า
- **landing** - Landing page
- **dashboard** - Dashboard

### 📊 Layout Comparison Table

เปรียบเทียบ Restaurant Sub-Categories แต่ละแบบ:

| Category | Variant | สี | บรรยากาศ | เหมาะกับ | Layout Style |
|----------|---------|-----|----------|---------|-------------|
| **restaurant** | hero-stats | Orange/Red | ทั่วไป | ร้านอาหารทั่วไป | Standard + Stats |
| **restaurant-modern** | hero-split | Blue/Indigo | ทันสมัย | Cafe, Fusion | Split 50/50 |
| **restaurant-luxury** | hero-fullscreen | Gray/Amber | หรูหรา | Fine Dining | Fullscreen Overlay |
| **restaurant-minimal** | hero-minimal | Gray/Stone | เรียบง่าย | Japanese, Simple | Clean & Minimal |
| **restaurant-casual** | hero-cards | Orange/Yellow | อบอุ่น | Family, Street Food | Hero + 3 Cards |

---

### 📦 Available Block Variants Summary

| Block | Variants | Use Cases |
|-------|----------|-----------|
| **hero-basic** | 6 variants: `hero-basic`, `hero-stats`, `hero-split`, `hero-fullscreen`, `hero-minimal`, `hero-cards` | Landing pages, About pages |
| **menu-basic** | 4 variants: `menu-basic` (grid), `menu-list`, `menu-masonry`, `menu-carousel` | Products, Menus, Portfolios |
| **footer-basic** | 4 variants: `footer-basic`, `footer-minimal`, `footer-centered`, `footer-mega` | All page footers |
| **navbar-basic** | 1 variant | Navigation |
| **about-basic** | 1 variant | About sections |
| **contact-basic** | 1 variant | Contact forms |

**📌 สามารถผสม variants ต่างๆ ได้เพื่อสร้าง layout ที่หลากหลาย!**

---

### 🎯 How AI Chooses Layout

การเลือก layout ทำงาน **2 แบบ**:

#### 1. **Manual Selection** (แนะนำ)
```typescript
{
  businessCategory: 'restaurant-modern',  // เลือกเอง
  keywords: ['restaurant', 'food']
}
```

#### 2. **Auto-Detection** (ใช้ AI)
```typescript
{
  // ไม่ระบุ businessCategory
  keywords: ['restaurant', 'luxury', 'fine dining']
  // AI จะวิเคราะห์ keywords และเลือก 'restaurant-luxury'
}
```

**AI Detection Logic:**
- **Keyword Matching** - เปรียบเทียบ keywords กับ category keywords
- **LLM Classification** - ใช้ GPT-5-nano วิเคราะห์ context
- **Score-based Selection** - เลือก category ที่มีคะแนนสูงสุด

## 🤖 AI Integration

### Supported Models

- **gpt-5-nano** (Default) - รวดเร็ว, ประหยัด
- **gpt-4o-mini** - Fallback model
- **gpt-4o** - คุณภาพสูง

### AI Features

- **Content Generation** - สร้างเนื้อหาตาม keywords
- **Image Generation** - สร้างรูปภาพจาก Unsplash
- **Language Detection** - ตรวจจับภาษาไทย/อังกฤษ
- **Business Category Detection** - ระบุประเภทธุรกิจ
- **Color Preference Extraction** - ดึงความต้องการสี

### Image Integration

ระบบใช้ Unsplash API สำหรับรูปภาพ:

- **Hero Images** - รูปพื้นหลังหลัก
- **Menu Item Images** - รูปเมนูอาหาร/สินค้า
- **Category-based Search** - ค้นหาตามหมวดหมู่
- **Automatic Translation** - แปลคำค้นหาเป็นอังกฤษ

### Daytona Preview Integration

ระบบรองรับการสร้าง **Live Preview** บน Daytona อัตโนมัติ:

#### 🚀 Auto-Preview Flow

```
1. Generate Website
   ↓ (5-15 วินาที)
2. ✅ Website Generated
   ↓ (auto-trigger)
3. Create Daytona Sandbox
   ↓ (30-60 วินาที)
4. 🟢 Preview Ready
   ↓ (one click)
5. 🌐 Open in Browser
```

#### Features

- **Auto-Creation** - สร้าง preview อัตโนมัติหลัง generate สำเร็จ
- **Real-time Status** - แสดงสถานะการสร้าง sandbox
- **One-click Access** - คลิกเดียวเปิดเว็บไซต์
- **Auto-stop** - หยุด sandbox อัตโนมัติเมื่อออกจากหน้า
- **Error Recovery** - สามารถลองใหม่ได้ถ้าล้มเหลว

#### Preview States

- 🟡 **Creating** - กำลังสร้าง Daytona sandbox
- 🟢 **Running** - Preview พร้อมใช้งาน
- 🔴 **Error** - เกิดข้อผิดพลาด
- ⚫ **Stopped** - Sandbox ถูกหยุดแล้ว

#### ตัวอย่างการใช้

```typescript
// Preview จะถูกสร้างอัตโนมัติหลังจาก generate สำเร็จ
const task = {
  taskId: 'restaurant-001',
  taskType: 'generate_website',
  businessCategory: 'restaurant-modern',
  keywords: ['restaurant', 'modern'],
  includeProjectStructure: true  // ✅ จำเป็นสำหรับ Daytona preview
};

const result = await runFrontendAgentV2(task);

// ระบบจะ auto-create Daytona preview ทันที
// ไม่ต้องเรียก API แยก
```

## ⚙️ Configuration

### Agent Configuration (agent.yaml)

```yaml
name: frontend-v2
version: "2.0.0"
role: "Template-based Frontend Generator with AI Integration"

# Model Configuration
model:
  provider: openai
  name: gpt-5-nano
  temperature: 1
  max_completion_tokens: 8000
  timeout: 120
  fallback:
    name: gpt-4o-mini
    temperature: 0.3
    max_tokens: 4000
    timeout: 60

# Performance Targets
performance:
  lighthouse_score_min: 90
  first_contentful_paint: "< 1.5s"
  largest_contentful_paint: "< 2.5s"
  cumulative_layout_shift: "< 0.1"
  template_rendering_time: "< 2s"
  ai_generation_time: "< 10s"
```

### Quality Configuration

```yaml
quality:
  smoke_checks: true
  contract_validation: true
  accessibility_compliance: true
  performance_audit: true
  typescript_strict: true
  template_validation: true
```

## 🧪 Testing & Demo

### 🌐 Web-based Layout Tester (แนะนำที่สุด!)

ทดสอบ layout variants ผ่านหน้าเว็บแบบ interactive:

```bash
# เปิดหน้าเว็บ
http://localhost:3000/layout-tester
```

**Features:**
- 🎨 UI สวยงาม ใช้งานง่าย
- 🖱️ คลิกเลือก layout ได้เลย
- 📊 แสดงผลลัพธ์แบบ real-time
- 📁 ดูรายการไฟล์ที่สร้างทันที
- 🔑 เพิ่ม keywords เองได้
- ⚡ ไม่ต้องใช้ command line
- 👀 **Auto-create Daytona Preview** - สร้าง preview อัตโนมัติ
- 🌐 **One-click Preview** - เปิดเว็บไซต์ที่สร้างได้ทันที

**วิธีใช้:**
1. เปิด browser ไปที่ `http://localhost:3000/layout-tester`
2. คลิกเลือก layout card ที่ต้องการทดสอบ
3. (Optional) ใส่ keywords เพิ่มเติม
4. คลิก "สร้างเว็บไซต์เลย"
5. รอระบบ generate (5-15 วินาที)
6. ✨ **Daytona Preview จะถูกสร้างอัตโนมัติ** (30-60 วินาที)
7. คลิก "🌐 เปิด Preview ในแท็บใหม่" เพื่อดูเว็บไซต์ที่สร้างจริงๆ

### 💻 CLI Interactive Layout Testing

ทดสอบ layout variants แบบ interactive ผ่าน CLI:

```bash
cd src/midori/agents/frontend-v2
npx ts-node demo/interactive-layout-selector.ts
```

**Features:**
- 🎨 เมนูเลือก layout แบบ visual
- 🔑 เพิ่ม keywords เอง
- 🤖 โหมด Auto-detection
- 📊 แสดงผลลัพธ์แบบละเอียด
- 🔄 Generate หลายครั้งติดกัน

**ตัวอย่าง:**
```
╔════════════════════════════════════════════════════════════════╗
║     🎨 Frontend-V2 Interactive Layout Selector                ║
╚════════════════════════════════════════════════════════════════╝

1. 🔷 Modern (Split Layout)
2. 💎 Luxury (Fullscreen Layout)
3. ⬜ Minimal (Clean Layout)
4. 🍕 Casual (Cards Layout)
5. 🍽️  Standard (Stats Layout)
6. 🤖 Let AI Choose (Auto-Detection)

👉 Enter your choice (0-6):
```

### Automated Layout Testing

ทดสอบทุก layout พร้อมกันแบบอัตโนมัติ:

```bash
npx ts-node demo/layout-variants-demo.ts
```

จะรัน 5 tests:
1. Restaurant Modern (Split Layout)
2. Restaurant Luxury (Fullscreen Layout)
3. Restaurant Minimal (Clean Layout)
4. Restaurant Casual (Cards Layout)
5. Auto-Detection Test

### Run Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Categories

- **Demo Scripts** - ทดสอบแบบ interactive และ automated
- **Unit Tests** - ทดสอบแต่ละ component
- **Integration Tests** - ทดสอบการทำงานร่วมกัน
- **Independence Tests** - ทดสอบความอิสระของระบบ
- **Layout Variant Tests** - ทดสอบทุก layout variants

### Example Test

```typescript
import { runFrontendAgentV2 } from '../runners/run';

describe('Frontend-V2 Agent', () => {
  it('should generate restaurant website', async () => {
    const task = {
      taskId: 'test-001',
      taskType: 'generate_website',
      businessCategory: 'restaurant',
      keywords: ['restaurant', 'food']
    };

    const result = await runFrontendAgentV2(task);
    
    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThan(0);
    expect(result.result.businessCategory).toBe('restaurant');
  });

  it('should generate modern layout variant', async () => {
    const task = {
      taskId: 'test-002',
      taskType: 'generate_website',
      businessCategory: 'restaurant-modern',
      keywords: ['restaurant', 'modern']
    };

    const result = await runFrontendAgentV2(task);
    
    expect(result.success).toBe(true);
    expect(result.result.businessCategory).toBe('restaurant-modern');
    expect(result.files.some(f => f.path.includes('Hero'))).toBe(true);
  });

  it('should auto-detect luxury layout from keywords', async () => {
    const task = {
      taskId: 'test-003',
      taskType: 'generate_website',
      businessCategory: 'restaurant', // base category
      keywords: ['restaurant', 'luxury', 'fine dining', 'premium']
    };

    const result = await runFrontendAgentV2(task);
    
    expect(result.success).toBe(true);
    // AI should detect and use luxury-related category
  });
});
```

## 📊 Performance

### Benchmarks

- **Generation Time**: < 10 วินาที
- **Template Rendering**: < 2 วินาที
- **AI Generation**: < 8 วินาที
- **File Generation**: 10-20 ไฟล์
- **Total Size**: 50-200KB

### Optimization Features

- **Template Caching** - เก็บ template ใน cache
- **AI Response Caching** - เก็บ AI response
- **Image Optimization** - ปรับขนาดรูปภาพ
- **Code Minification** - บีบอัดโค้ด
- **Lazy Loading** - โหลดเมื่อจำเป็น

## 🔧 Development

### Project Structure

```
src/midori/agents/frontend-v2/
├── adapters/           # Template Adapter
├── runners/            # Main Runner
├── services/           # AI, Category, Persistence Services
├── schemas/            # TypeScript Schemas
├── template-system/    # Template System
│   ├── override-system/
│   ├── shared-blocks/
│   ├── business-categories/
│   ├── project-templates/
│   └── project-structure-generator/
├── tests/              # Test Files
├── agent.yaml          # Agent Configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript Config
```

### Adding New Features

#### 1. **New Business Category**:
   - เพิ่มใน `business-categories/index.ts`
   - อัปเดต schema validation
   - เพิ่ม test cases

#### 2. **New Shared Block**:
   - เพิ่มใน `shared-blocks/index.ts`
   - สร้าง template files
   - อัปเดต AI prompts

#### 3. **New Block Variant** ⭐ (รองรับ Auto-Detection!)

**Simple Variant** (ไม่มี required placeholders พิเศษ):
```typescript
// เพิ่มใน shared-blocks/index.ts เท่านั้น!
{
  id: "hero-parallax",
  name: "Hero with Parallax",
  template: `...`,
  overrides: {}  // ✅ ว่างเปล่า
}
```
✅ **ไม่ต้องแก้ Override System** - ใช้ได้เลย!

**Special Variant** (มี required placeholders พิเศษ):
```typescript
// 1. เพิ่มใน shared-blocks/index.ts
{
  id: "hero-video",
  name: "Hero with Video",
  template: `...<video src="{videoUrl}">...`,
  overrides: {
    videoUrl: { type: "string", required: true }  // ✨ พิเศษ
  }
}

// 2. เพิ่ม fallback ใน renderer.ts (บรรทัด ~999)
'videoUrl': 'https://via.placeholder.com/1920x1080'
```
✅ **ระบบจะ detect และสร้าง AI instructions อัตโนมัติ!**

**🎯 Auto-Detection Rules:**
- ระบบจะ detect required placeholders ที่ไม่ใช่ base placeholders
- สร้าง AI instructions อัตโนมัติ
- เพิ่ม fallback values อัตโนมัติ
- Validation จะยืดหยุ่นกับ variant-specific placeholders

**📚 ดูรายละเอียดใน:** `template-system/VARIANT_GUIDE.md`

#### 4. **New AI Feature**:
   - เพิ่มใน `services/ai-service.ts`
   - อัปเดต prompt templates
   - เพิ่ม fallback logic

### Code Style

- ใช้ TypeScript strict mode
- ใช้ ESLint configuration
- เขียน tests สำหรับทุก feature
- ใช้ meaningful variable names
- เขียน comments เป็นภาษาไทย

## 🐛 Troubleshooting

### Common Issues

1. **AI Service Not Available**
   ```
   Error: AI Service not available, using mock data
   ```
   - ตรวจสอบ OPENAI_API_KEY
   - ตรวจสอบ network connection

2. **Template Resolution Failed**
   ```
   Error: Template resolution failed
   ```
   - ตรวจสอบ business category
   - ตรวจสอบ shared blocks

3. **Validation Errors**
   ```
   Error: Schema validation failed
   ```
   - ตรวจสอบ input data
   - ตรวจสอบ required fields

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG = 'frontend-v2:*';

// Check system health
const health = await healthCheck();
console.log('Health status:', health);
```

## 📚 API Reference

### Main Functions

#### `runFrontendAgentV2(task: FrontendTaskV2): Promise<ComponentResultV2>`

สร้างเว็บไซต์ตาม task ที่กำหนด

**Parameters:**
- `task` - FrontendTaskV2 object

**Returns:**
- `ComponentResultV2` - ผลลัพธ์การสร้างเว็บไซต์

#### `runBatchFrontendAgentV2(tasks: FrontendTaskV2[]): Promise<ComponentResultV2[]>`

สร้างเว็บไซต์หลายเว็บพร้อมกัน

**Parameters:**
- `tasks` - Array of FrontendTaskV2 objects

**Returns:**
- `ComponentResultV2[]` - Array of results

#### `healthCheck(): Promise<HealthStatus>`

ตรวจสอบสถานะระบบ

**Returns:**
- `HealthStatus` - สถานะระบบ

#### `getAvailableTemplates(): TemplateInfo`

ดู templates ที่มีอยู่

**Returns:**
- `TemplateInfo` - ข้อมูล templates

### Services

#### `AIService`

จัดการการเรียกใช้ OpenAI API

```typescript
const aiService = new AIService();
const content = await aiService.generateContent(request);
```

#### `CategoryService`

จัดการ business category detection

```typescript
const category = await categoryService.detectCategory({
  keywords: ['restaurant', 'food'],
  userInput: 'ร้านอาหารไทย',
  useLLM: true
});
```

#### `UnsplashService`

จัดการรูปภาพจาก Unsplash

```typescript
const image = await unsplashService.getImageForMenuItem(
  'ข้าวผัดกุ้ง',
  'food',
  'restaurant'
);
```

## 🤝 Contributing

1. Fork repository
2. สร้าง feature branch
3. เขียน tests
4. Submit pull request

### Development Guidelines

- ใช้ TypeScript
- เขียน tests ครอบคลุม
- ใช้ meaningful commit messages
- ตรวจสอบ code quality
- อัปเดต documentation

## 📄 License

MIT License - ดู [LICENSE](LICENSE) สำหรับรายละเอียด

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/midori/frontend-v2-agent/issues)
- **Documentation**: [Wiki](https://github.com/midori/frontend-v2-agent/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/midori/frontend-v2-agent/discussions)

---

**Frontend-V2 Agent** - สร้างเว็บไซต์ด้วย AI และ Template System 🚀
