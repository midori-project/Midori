# 🚀 Frontend-V2 Agent

Frontend Agent รุ่นใหม่ที่ใช้ **Template System + AI Integration** สำหรับการสร้างเว็บไซต์แบบอัตโนมัติ

## 🎯 ภาพรวม

Frontend-V2 Agent เป็นการปรับปรุงจาก Frontend Agent ตัวเก่า โดยใช้:
- **Template System**: ระบบ template ที่ยืดหยุ่นและมีประสิทธิภาพ
- **AI Integration**: ใช้ AI ในการสร้างเนื้อหาและปรับแต่ง
- **Business Categories**: รองรับหลายประเภทธุรกิจ
- **Real-time Preview**: ดูผลลัพธ์แบบ real-time

## 🏗️ โครงสร้าง

```
frontend-v2/
├── agent.yaml                    # Agent configuration
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest configuration
├── adapters/
│   └── template-adapter.ts      # Template System integration
├── runners/
│   └── run.ts                   # Main runner function
├── schemas/
│   ├── frontend-task-v2.schema.json
│   ├── component-result-v2.schema.json
│   └── types.ts                 # TypeScript types
├── template-system/              # Self-contained template system
│   ├── index.ts                 # Main export
│   ├── override-system/         # Override system
│   ├── shared-blocks/           # Shared blocks
│   └── business-categories/     # Business categories
├── tests/
│   ├── setup.ts                 # Test setup
│   ├── integration.test.ts      # Integration tests
│   ├── independence.test.ts     # Independence tests
│   └── example-usage.ts         # Usage examples
├── MIGRATION.md                 # Migration guide
└── README.md                    # เอกสารนี้
```

## 🔒 Self-Contained & Independent

Frontend-V2 Agent เป็น **self-contained** และ **independent**:
- ✅ **ไม่พึ่งพา External Dependencies** - มี template system ในตัว
- ✅ **Portable** - ย้ายไปที่ไหนก็ได้
- ✅ **Isolated** - ไม่กระทบกับระบบอื่น
- ✅ **Maintainable** - ง่ายต่อการบำรุงรักษา

### **Template System ในตัว:**
```
template-system/
├── index.ts                 # Main export
├── override-system/         # Override system (local copy)
├── shared-blocks/           # Shared blocks (local copy)
└── business-categories/     # Business categories (local copy)
```

## 🚀 การใช้งาน

### **Basic Usage**

```typescript
import { runFrontendAgentV2 } from './runners/run';

const task = {
  taskId: 'website-001',
  taskType: 'generate_website',
  businessCategory: 'restaurant',
  keywords: ['restaurant', 'food', 'thai'],
  customizations: {
    colors: ['orange', 'red'],
    theme: 'modern',
    features: ['hero_section', 'about_section', 'contact_form']
  },
  includePreview: true
};

const result = await runFrontendAgentV2(task);
```

### **Advanced Usage**

```typescript
const advancedTask = {
  taskId: 'advanced-001',
  taskType: 'generate_website',
  businessCategory: 'ecommerce',
  keywords: ['shop', 'online', 'store'],
  customizations: {
    colors: ['blue', 'purple'],
    theme: 'professional',
    layout: 'multi-page',
    features: ['hero_section', 'gallery', 'pricing', 'contact_form']
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
  },
  priority: 'high',
  metadata: {
    userId: 'user-123',
    projectId: 'project-456',
    tags: ['ecommerce', 'shop']
  }
};

const result = await runFrontendAgentV2(advancedTask);
```

## 📋 Task Types

### **1. generate_website**
สร้างเว็บไซต์ใหม่จากศูนย์

```typescript
{
  taskType: 'generate_website',
  businessCategory: 'restaurant',
  keywords: ['restaurant', 'food', 'thai']
}
```

### **2. customize_component**
ปรับแต่ง component ที่มีอยู่

```typescript
{
  taskType: 'customize_component',
  businessCategory: 'restaurant',
  keywords: ['restaurant', 'food'],
  customizations: {
    colors: ['blue', 'green'],
    theme: 'modern'
  }
}
```

### **3. create_page**
สร้างหน้าใหม่

```typescript
{
  taskType: 'create_page',
  businessCategory: 'ecommerce',
  keywords: ['product', 'catalog'],
  customizations: {
    features: ['gallery', 'pricing']
  }
}
```

## 🏢 Business Categories

### **รองรับประเภทธุรกิจ:**
- `restaurant` - ร้านอาหาร
- `ecommerce` - ร้านค้าออนไลน์
- `portfolio` - ผลงาน
- `healthcare` - สุขภาพและการแพทย์
- `education` - การศึกษา
- `real_estate` - อสังหาริมทรัพย์

### **ตัวอย่างการใช้งาน:**

```typescript
// ร้านอาหาร
const restaurantTask = {
  businessCategory: 'restaurant',
  keywords: ['restaurant', 'food', 'thai', 'อร่อย']
};

// E-commerce
const ecommerceTask = {
  businessCategory: 'ecommerce',
  keywords: ['shop', 'online', 'store', 'ขายของ']
};

// Portfolio
const portfolioTask = {
  businessCategory: 'portfolio',
  keywords: ['portfolio', 'creative', 'design', 'ผลงาน']
};
```

## 🎨 Customizations

### **Colors**
```typescript
customizations: {
  colors: ['orange', 'red']  // Primary, Secondary
}
```

### **Theme**
```typescript
customizations: {
  theme: 'modern'  // modern, classic, minimal, creative, professional
}
```

### **Layout**
```typescript
customizations: {
  layout: 'single-page'  // single-page, multi-page, landing, dashboard
}
```

### **Features**
```typescript
customizations: {
  features: [
    'hero_section',
    'about_section',
    'contact_form',
    'gallery',
    'testimonials',
    'pricing',
    'blog',
    'ecommerce'
  ]
}
```

## 🤖 AI Settings

### **Model Selection**
```typescript
aiSettings: {
  model: 'gpt-5-nano'  // gpt-5-nano, gpt-4o-mini, gpt-4o
}
```

### **Temperature**
```typescript
aiSettings: {
  temperature: 1  // 0-2, higher = more creative
}
```

### **Language**
```typescript
aiSettings: {
  language: 'th'  // th, en, auto
}
```

## 📊 Results

### **Success Result**
```typescript
{
  success: true,
  result: {
    businessCategory: 'restaurant',
    templateUsed: 'template-system-v2',
    blocksGenerated: ['hero-basic', 'navbar-basic', 'footer-basic'],
    aiContentGenerated: true,
    customizationsApplied: ['color_override', 'theme_override'],
    overridesApplied: ['hero-stats', 'restaurant-menu']
  },
  files: [
    {
      path: 'src/components/Hero.tsx',
      content: 'export default function Hero() { ... }',
      type: 'component',
      size: 1234,
      blockId: 'hero-basic',
      customized: false
    }
  ],
  performance: {
    generationTime: 2500,
    templateRenderingTime: 800,
    aiGenerationTime: 1200,
    totalFiles: 5,
    totalSize: '15.2KB'
  },
  validation: {
    isValid: true,
    errors: [],
    warnings: [],
    accessibilityScore: 95,
    typescriptErrors: 0
  },
  preview: {
    url: 'https://preview.example.com/sandbox/123',
    sandboxId: 'sandbox-123',
    status: 'ready',
    createdAt: '2024-01-01T00:00:00Z'
  }
}
```

### **Error Result**
```typescript
{
  success: false,
  error: {
    message: 'Invalid business category',
    code: 'TASK_VALIDATION_ERROR',
    details: 'Business category must be one of: restaurant, ecommerce, portfolio, healthcare, education, real_estate',
    recoveryAttempted: false
  }
}
```

## 🧪 Testing

### **Run Tests**
```bash
npm test frontend-v2
```

### **Integration Tests**
```typescript
import { runFrontendAgentV2 } from './runners/run';

describe('Frontend-V2 Agent', () => {
  it('should generate website successfully', async () => {
    const task = {
      taskId: 'test-001',
      taskType: 'generate_website',
      businessCategory: 'restaurant',
      keywords: ['restaurant', 'food']
    };

    const result = await runFrontendAgentV2(task);
    expect(result.success).toBe(true);
  });
});
```

## 🔧 Health Check

### **Check System Status**
```typescript
import { healthCheck } from './runners/run';

const health = await healthCheck();
console.log(health);
// {
//   status: 'healthy',
//   templateSystem: {
//     available: true,
//     sharedBlocksCount: 15,
//     businessCategoriesCount: 6
//   },
//   agent: {
//     version: '2.0.0',
//     status: 'running'
//   }
// }
```

### **Get Available Templates**
```typescript
import { getAvailableTemplates } from './runners/run';

const templates = getAvailableTemplates();
console.log(templates);
// {
//   sharedBlocks: [
//     { id: 'hero-basic', name: 'Hero Basic', category: 'component' },
//     { id: 'navbar-basic', name: 'Navbar Basic', category: 'component' }
//   ],
//   businessCategories: [
//     { id: 'restaurant', name: 'Restaurant', description: 'Template for restaurant business category' },
//     { id: 'ecommerce', name: 'Ecommerce', description: 'Template for ecommerce business category' }
//   ]
// }
```

## 🚀 Migration จาก Frontend Agent เก่า

### **ข้อดีของการอัพเกรด:**
1. **Performance ดีขึ้น** - ใช้ Template System ที่มีประสิทธิภาพ
2. **AI Integration** - ใช้ AI ในการสร้างเนื้อหา
3. **Error Handling ดีขึ้น** - จัดการ error ได้ดีกว่า
4. **Maintainability** - โค้ดสะอาดและง่ายต่อการบำรุงรักษา
5. **Flexibility** - ปรับแต่งได้ตามความต้องการ

### **การ Migration:**
```typescript
// เก่า
import { runFrontendAgent } from '../frontend/runners/run';

// ใหม่
import { runFrontendAgentV2 } from '../frontend-v2/runners/run';
```

## 📈 Performance

### **Benchmarks:**
- **Generation Time**: < 3 seconds
- **Template Rendering**: < 1 second
- **AI Generation**: < 2 seconds
- **File Size**: < 50KB per website
- **Accessibility Score**: > 90%

### **Optimization Tips:**
1. ใช้ `includePreview: false` ถ้าไม่ต้องการ preview
2. ใช้ `validation.strictMode: false` สำหรับการทดสอบ
3. ใช้ `aiSettings.temperature: 0.7` สำหรับเนื้อหาที่สม่ำเสมอ
4. ใช้ batch processing สำหรับหลายเว็บไซต์

## 🐛 Troubleshooting

### **Common Issues:**

#### **1. Template System Not Available**
```typescript
// Check health
const health = await healthCheck();
if (!health.templateSystem.available) {
  console.error('Template System not available');
}
```

#### **2. AI Generation Failed**
```typescript
// Check AI settings
const task = {
  // ... other settings
  aiSettings: {
    model: 'gpt-4o-mini',  // Try fallback model
    temperature: 0.7       // Lower temperature
  }
};
```

#### **3. Validation Errors**
```typescript
// Check validation settings
const task = {
  // ... other settings
  validation: {
    enabled: true,
    strictMode: false,  // Try non-strict mode
    accessibilityLevel: 'A'  // Try lower level
  }
};
```

## 📚 Examples

ดูตัวอย่างการใช้งานเพิ่มเติมใน `tests/example-usage.ts`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests
4. Submit pull request

## 📄 License

MIT License
