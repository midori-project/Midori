# Frontend-V2 Agent

## ภาพรวม (Overview)

Frontend-V2 Agent เป็นระบบสร้างเว็บไซต์อัตโนมัติที่ใช้ Template System ร่วมกับ AI Integration สำหรับการสร้างเว็บไซต์ที่ทันสมัยและมีประสิทธิภาพ

### ✨ คุณสมบัติหลัก

- 🎨 **Template-based Generation** - สร้างเว็บไซต์จากระบบ Template ที่มีโครงสร้างชัดเจน
- 🤖 **AI Content Generation** - สร้างเนื้อหาด้วย AI ตาม keywords และ business category
- 🏢 **Business Category Detection** - ระบุประเภทธุรกิจอัตโนมัติ
- 📱 **Responsive Design** - ออกแบบที่รองรับทุกอุปกรณ์
- 👀 **Real-time Preview** - ดูผลลัพธ์แบบ real-time
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

```typescript
// Batch processing
import { runBatchFrontendAgentV2 } from './runners/run';

const tasks: FrontendTaskV2[] = [
  {
    taskId: 'restaurant-001',
    taskType: 'generate_website',
    businessCategory: 'restaurant',
    keywords: ['restaurant', 'food']
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

- **restaurant** - ร้านอาหาร
- **ecommerce** - ร้านค้าออนไลน์
- **portfolio** - แฟ้มผลงาน
- **healthcare** - สุขภาพ
- **education** - การศึกษา
- **real_estate** - อสังหาริมทรัพย์

### Shared Blocks

ระบบมี shared blocks หลัก:

- **hero-basic** - ส่วน Hero
- **navbar-basic** - Navigation Bar
- **about-basic** - เกี่ยวกับเรา
- **contact-basic** - ติดต่อ
- **menu-basic** - เมนู/สินค้า
- **footer-basic** - Footer
- **theme-basic** - ธีมสี

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

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Categories

- **Unit Tests** - ทดสอบแต่ละ component
- **Integration Tests** - ทดสอบการทำงานร่วมกัน
- **Independence Tests** - ทดสอบความอิสระของระบบ
- **Project Structure Tests** - ทดสอบโครงสร้างโปรเจค

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

1. **New Business Category**:
   - เพิ่มใน `business-categories/index.ts`
   - อัปเดต schema validation
   - เพิ่ม test cases

2. **New Shared Block**:
   - เพิ่มใน `shared-blocks/index.ts`
   - สร้าง template files
   - อัปเดต AI prompts

3. **New AI Feature**:
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
