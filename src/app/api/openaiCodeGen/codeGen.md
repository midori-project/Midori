# เอกสารการสร้างโค้ดด้วย AI

เอกสารนี้สำหรับอธิบายการทำงานในส่วนของการสร้างโค้ด ด้วย AI

## 🎯 เป้าหมายหลักของการสร้างโค้ด

### 1. Focus กับการแสดง Preview ใน Sandpack
- **สร้างโค้ดที่รันได้ทันทีใน Sandpack environment**
- **เน้นการแสดงผลที่สวยงามและใช้งานได้จริง**
- **รองรับการ preview แบบ real-time**
- **สร้างไฟล์ที่เข้ากันได้กับ Sandpack 100%**

### 2. ใช้ Dependencies ที่ Sandpack อนุญาตเท่านั้น
- **ใช้เฉพาะ packages ที่ Sandpack รองรับ**
- **หลีกเลี่ยง dependencies ที่ไม่จำเป็น**
- **ตรวจสอบ compatibility ก่อนใช้งาน**
- **ใช้ native browser APIs แทน external libraries**

### 3. ต้อง Compile ได้ทันที
- **ไม่มี syntax errors**
- **ไม่มี missing dependencies**
- **ไม่มี import/export issues**
- **รันได้ทันทีโดยไม่ต้องแก้ไข**

## หลักการพื้นฐาน
1. ทุกโปรเจ็คจะถูกสร้างด้วย React + Vite
2. โครงสร้างที่เป็นส่วนของ backend ให้ใช้ mock up หน้า front ไปก่อน
3. ใช้ TypeScript ในการพัฒนา (ห้ามใช้ `any` type)
4. ใช้เฉพาะ dependencies ที่ Sandpack รองรับ

## แนวทางการพัฒนา

### 1. เน้นการสร้างหน้าเว็บมากกว่าธุรกิจ
- เน้นการออกแบบ UI/UX และการสร้างหน้าเว็บไซต์ทั่วไป
- ไม่เน้นเฉพาะธุรกิจใดธุรกิจหนึ่ง
- รองรับเว็บไซต์หลายประเภท (Portfolio, Blog, Landing Page, etc.)
- เน้นความสวยงามและใช้งานง่าย

### 2. สร้างตาม Sandpack เพื่อการพรีวิวที่สะดวก
- ใช้โครงสร้างที่เข้ากันได้กับ Sandpack
- สร้างไฟล์ที่สามารถรันได้ทันทีใน Sandpack environment
- เน้นการพรีวิวแบบ real-time
- ใช้ dependencies ที่ Sandpack รองรับเท่านั้น

### 3. Tech Stack ที่ใช้
- **Frontend Framework**: React + Vite
- **Styling**: CSS (vanilla CSS หรือ CSS modules)
- **Language**: TypeScript
- **Package Manager**: npm/yarn
- **Development**: Hot reload และ fast refresh

## ขั้นตอนการประมวลผล Final JSON (AI-Powered)

### 1. การวิเคราะห์ Final JSON ด้วย AI
- **ใช้ AI วิเคราะห์ Final JSON** เพื่อเข้าใจความต้องการที่ลึกซึ้ง
- **แปลงข้อมูลที่มีให้ตรงกับ Project Structure format**
- **ใช้ AI ในการสร้างโครงสร้างที่เหมาะสม**
- **ใช้ AI ในการออกแบบ components และ layout**

### 2. การแปลง Final JSON เป็น Project Structure ด้วย AI
```typescript
// ใช้ AI ในการแปลงข้อมูลจาก Final JSON
async function convertFinalJsonToProjectStructureWithAI(finalJson: any): Promise<ProjectStructure> {
  const aiPrompt = `
    วิเคราะห์ Final JSON นี้และสร้าง Project Structure ที่เหมาะสม:
    ${JSON.stringify(finalJson, null, 2)}
    
    สร้างโครงสร้างที่:
    1. ตรงตามความต้องการของผู้ใช้
    2. ใช้ React + Vite + TypeScript
    3. รองรับ Sandpack environment
    4. มี components ที่เหมาะสม
    5. มี layout ที่สวยงาม
  `;

  const aiResponse = await callOpenAI(aiPrompt);
  return parseAIResponseToProjectStructure(aiResponse);
}

// แปลง Pages จากภาษาไทยเป็นภาษาอังกฤษ
function translatePages(pages: string[]): string[] {
  const translationMap = {
    'หน้าแรก': 'home',
    'คลังรูปภาพ': 'gallery',
    'เกี่ยวกับเรา': 'about',
    'ติดต่อเรา': 'contact',
    'บริการ': 'services',
    'สินค้า': 'products',
    'บล็อก': 'blog',
    'ชุมชน': 'community'
  };
  
  return pages.map(page => translationMap[page] || page);
}

// แปลง Features จากภาษาไทยเป็นภาษาอังกฤษ
function translateFeatures(features: string[]): string[] {
  const translationMap = {
    'คลังเก็บรูป': 'gallery',
    'ฟีเจอร์แชร์': 'social',
    'แกลเลอรีรูปแมว': 'gallery',
    'บทความเกี่ยวกับแมว': 'blog',
    'ฟอรัมสำหรับคนรักแมว': 'community'
  };
  
  return features.map(feature => translationMap[feature] || feature);
}
```

### 3. การสร้างโครงสร้างโปรเจ็ค
```
project-name/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks (เก็บใน folder)
│   ├── services/         # Mock data services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── styles/           # CSS files
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── package.json          # Dependencies (Sandpack compatible)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── index.html            # HTML template
```

### 4. การสร้าง Components ด้วย AI
- **UI Components**: ใช้ AI สร้าง reusable components ตาม design system
- **Form Components**: ใช้ AI สร้าง forms ตาม data structure ใน JSON
- **Display Components**: ใช้ AI สร้าง components สำหรับแสดงข้อมูล (tables, cards, etc.)
- **Layout Components**: ใช้ AI สร้าง layout components ตาม layout requirements

### 5. การสร้าง Mock Services ด้วย AI
- ใช้ AI สร้าง mock data ตาม schema ใน JSON
- ใช้ AI สร้าง service functions สำหรับ CRUD operations
- ใช้ fetch API syntax สำหรับ API calls
- สร้าง error handling และ loading states

### 6. การสร้าง Custom Hooks ด้วย AI
- ใช้ AI สร้าง hooks สำหรับ state management
- ใช้ AI สร้าง hooks สำหรับ API calls
- ใช้ AI สร้าง hooks สำหรับ form handling
- เก็บ hooks ใน folder แทนการตั้งชื่อไฟล์ด้วย "use..."

### 7. การสร้าง Type Definitions ด้วย AI
- ใช้ AI สร้าง TypeScript interfaces ตาม JSON schema
- กำหนด strict types (ห้ามใช้ `any`)
- สร้าง utility types สำหรับ common patterns

## การแปลงข้อมูลจาก Final JSON ด้วย AI

### การแปลง Visual Style ด้วย AI
```typescript
async function inferVisualStyleWithAI(designStyle: string): Promise<string> {
  const aiPrompt = `
    วิเคราะห์ design style นี้และแนะนำ visual style ที่เหมาะสม:
    "${designStyle}"
    
    เลือกจาก:
    - playful-creative (สำหรับเว็บไซต์ที่สนุก สีสันสดใส)
    - modern-minimal (สำหรับเว็บไซต์ที่เรียบง่าย ทันสมัย)
    - professional-corporate (สำหรับเว็บไซต์ธุรกิจ ดูเป็นทางการ)
    
    ตอบกลับด้วยชื่อ style เท่านั้น
  `;

  const aiResponse = await callOpenAI(aiPrompt);
  return aiResponse.trim();
}
```

### การแปลง Color Scheme ด้วย AI
```typescript
async function convertColorsToSchemeWithAI(primaryColors: string[]): Promise<string> {
  const aiPrompt = `
    วิเคราะห์สีเหล่านี้และแนะนำ color scheme ที่เหมาะสม:
    ${JSON.stringify(primaryColors)}
    
    เลือกจาก:
    - warm-orange-red (สำหรับสีอุ่น ส้ม แดง)
    - blue-gray (สำหรับสีน้ำเงิน เทา)
    - cool-blue-green (สำหรับสีน้ำเงิน เขียว)
    - neutral-gray (สำหรับสีเทา เป็นกลาง)
    
    ตอบกลับด้วยชื่อ scheme เท่านั้น
  `;

  const aiResponse = await callOpenAI(aiPrompt);
  return aiResponse.trim();
}
```

### การแปลง Layout Preference ด้วย AI
```typescript
async function inferLayoutFromFeaturesWithAI(features: string[]): Promise<string> {
  const aiPrompt = `
    วิเคราะห์ features เหล่านี้และแนะนำ layout ที่เหมาะสม:
    ${JSON.stringify(features)}
    
    เลือกจาก:
    - card-masonry (สำหรับแกลเลอรี รูปภาพ)
    - dashboard-panel (สำหรับ dashboard analytics)
    - responsive-grid (สำหรับเนื้อหาทั่วไป)
    - single-column (สำหรับบล็อก บทความ)
    - hero-centered (สำหรับ landing page)
    
    ตอบกลับด้วยชื่อ layout เท่านั้น
  `;

  const aiResponse = await callOpenAI(aiPrompt);
  return aiResponse.trim();
}
```

## Dependencies ที่ Sandpack รองรับ (100% Compatible)

### Core Dependencies (ต้องใช้)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0"
}
```

### Development Dependencies (ต้องใช้)
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.0.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0"
}
```

### Styling Dependencies (เลือกใช้)
```json
{
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### Dependencies ที่ห้ามใช้ (ไม่รองรับใน Sandpack)
- ❌ axios (ใช้ fetch API แทน)
- ❌ lodash (ใช้ native JavaScript methods)
- ❌ moment.js (ใช้ Date API หรือ date-fns)
- ❌ jQuery (ไม่จำเป็นใน React)
- ❌ express (backend framework)
- ❌ prisma (database ORM)
- ❌ next.js (ใช้ Vite แทน)

## การจัดการข้อมูล (Mock Services) ด้วย AI

### ใช้ Fetch API แทน Axios
```typescript
// ✅ ถูกต้อง - ใช้ fetch API (Sandpack compatible)
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// ❌ ผิด - ไม่ใช้ axios (ไม่รองรับใน Sandpack)
// const fetchData = async () => {
//   const response = await axios.get('/api/data');
//   return response.data;
// };
```

### Mock Data Services ด้วย AI (Sandpack Compatible)
```typescript
// services/mockData.ts - สร้างด้วย AI
async function generateMockDataServiceWithAI(schema: any): Promise<string> {
  const aiPrompt = `
    สร้าง mock data service สำหรับ schema นี้:
    ${JSON.stringify(schema, null, 2)}
    
    ต้อง:
    1. ใช้ fetch API (ไม่ใช้ axios)
    2. รองรับ Sandpack environment
    3. มี error handling
    4. มี loading states
    5. ใช้ TypeScript (ไม่ใช้ any)
    
    สร้างเป็น TypeScript code เท่านั้น
  `;

  const aiResponse = await callOpenAI(aiPrompt);
  return aiResponse;
}

export const mockDataService = {
  getUsers: () => Promise.resolve([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]),
  
  getUserById: (id: number) => Promise.resolve({
    id,
    name: 'John Doe',
    email: 'john@example.com'
  }),
  
  createUser: (userData: UserData) => Promise.resolve({
    id: Math.random(),
    ...userData
  })
};
```

## หลักการสร้าง Components ด้วย AI (Sandpack Ready)

### UI Components ด้วย AI
- ใช้ AI สร้าง components ที่ reusable
- ใช้ props ที่ type-safe
- เน้นความสวยงามและ responsive
- รองรับ dark/light mode
- **ต้อง compile ได้ทันที**

### Layout Components ด้วย AI
- ใช้ AI สร้าง Header, Footer, Navigation
- Responsive layout
- Mobile-first approach
- **ไม่มี external dependencies**

### Page Components ด้วย AI
- ใช้ AI สร้างหน้าตามความต้องการ
- ใช้ React Router สำหรับ routing
- เน้น user experience
- **รันได้ทันทีใน Sandpack**

## การจัดการข้อมูลด้วย AI

### Mock Services ด้วย AI
- ใช้ AI สร้าง mock data ที่สมจริง
- ใช้ fetch API สำหรับ API calls
- สร้าง error handling
- ใช้ loading states
- **ไม่ใช้ backend dependencies**

### Type Definitions ด้วย AI
- ใช้ AI สร้าง interfaces ที่ชัดเจน
- ใช้ strict types (ห้ามใช้ `any`)
- สร้าง utility types
- **ไม่มี external type packages**

## Best Practices (Sandpack Focused)

### Code Quality
- ใช้ semantic HTML
- สร้าง accessible components
- ใช้ proper naming conventions
- สร้าง clean code structure
- **ไม่มี syntax errors**

### Performance
- ใช้ lazy loading
- Optimize images
- Minimize bundle size
- ใช้ proper caching
- **รันเร็วใน Sandpack**

### Development Experience
- Hot reload
- Fast refresh
- Type checking
- Error boundaries
- **Compile ได้ทันที**

## การทดสอบและ Deploy

### Testing
- Unit tests สำหรับ components
- Integration tests
- E2E tests (ถ้าจำเป็น)
- **Test ใน Sandpack environment**

### Deployment
- Vite build system
- Static hosting
- Environment variables
- CI/CD pipeline
- **Deploy เป็น static files**

## ตัวอย่างการใช้งาน

### การสร้างหน้าเว็บไซต์ด้วย AI
1. ใช้ AI วิเคราะห์ความต้องการจาก Final JSON
2. ใช้ AI แปลงข้อมูลเป็น Project Structure
3. ใช้ AI สร้าง components ที่จำเป็น
4. ใช้ AI สร้าง mock services (ใช้ fetch API)
5. ทดสอบใน Sandpack
6. ปรับปรุงจน compile ได้ทันที

### การพรีวิวใน Sandpack
1. ใช้ AI สร้างไฟล์ที่เข้ากันได้กับ Sandpack 100%
2. ใช้ dependencies ที่รองรับเท่านั้น
3. ทดสอบการ compile
4. ตรวจสอบการแสดงผล
5. ปรับปรุงตาม feedback

## ตัวอย่างการประมวลผล

### Input: Final JSON
```json
{
  "projectName": "Portfolio Website",
  "features": [
    {
      "name": "Hero Section",
      "type": "hero",
      "content": "Welcome to my portfolio"
    },
    {
      "name": "Project Gallery",
      "type": "gallery",
      "items": ["Project 1", "Project 2", "Project 3"]
    },
    {
      "name": "Contact Form",
      "type": "form",
      "fields": ["name", "email", "message"]
    }
  ]
}
```

### Output: Generated Code Structure ด้วย AI (Sandpack Ready)
1. **Types**: ใช้ AI สร้าง `PortfolioData`, `Project`, `ContactForm`
2. **Components**: ใช้ AI สร้าง `HeroSection`, `ProjectGallery`, `ContactForm`
3. **Services**: ใช้ AI สร้าง `portfolioService.ts` with mock data
4. **Hooks**: ใช้ AI สร้าง `usePortfolio`, `useContactForm`
5. **Pages**: ใช้ AI สร้าง `HomePage`, `ProjectsPage`, `ContactPage`
6. **✅ Compile ได้ทันที**
7. **✅ รันได้ใน Sandpack**

## ประโยชน์ของการใช้ AI ในการสร้างโค้ด

### ✅ ความฉลาดและยืดหยุ่น
- AI สามารถเข้าใจความต้องการที่ซับซ้อน
- สร้างโค้ดที่เหมาะสมกับแต่ละโปรเจกต์
- ปรับแต่งได้ตามความต้องการเฉพาะ

### ✅ คุณภาพโค้ดสูง
- AI สร้างโค้ดที่ clean และ maintainable
- ใช้ best practices ในการเขียนโค้ด
- มี error handling ที่ครอบคลุม

### ✅ ความเร็วในการพัฒนา
- สร้างโค้ดได้เร็วขึ้นด้วย AI
- ลดเวลาในการเขียน boilerplate code
- เน้นการสร้าง features ที่สำคัญ

### ✅ ความแม่นยำ
- AI เข้าใจ context ได้ดี
- สร้างโค้ดที่ตรงตามความต้องการ
- ลดข้อผิดพลาดในการเขียนโค้ด

### ✅ Sandpack Ready
- AI สร้างโค้ดที่เข้ากันได้กับ Sandpack 100%
- ใช้ dependencies ที่รองรับเท่านั้น
- Compile ได้ทันที

## การเรียกใช้ AI Functions

### การตั้งค่า OpenAI Client
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callOpenAI(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "คุณเป็น AI ที่เชี่ยวชาญในการสร้างโค้ด React + TypeScript ที่เข้ากันได้กับ Sandpack environment"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate code with AI');
  }
}
```

### การแปลง AI Response เป็น Project Structure
```typescript
function parseAIResponseToProjectStructure(aiResponse: string): ProjectStructure {
  try {
    // พยายาม parse JSON จาก AI response
    const parsed = JSON.parse(aiResponse);
    return {
      name: parsed.name || 'Generated Project',
      description: parsed.description || 'Website generated with AI',
      framework: 'vite-react',
      type: parsed.type || 'website',
      pages: parsed.pages || ['home', 'about', 'contact'],
      components: parsed.components || ['Header', 'Footer'],
      features: parsed.features || [],
      dependencies: getSandpackCompatibleDependencies(),
      devDependencies: getSandpackCompatibleDevDependencies(),
      scripts: getDefaultScripts(),
      fileStructure: parsed.fileStructure || []
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // ใช้ fallback structure
    return getDefaultProjectStructure();
  }
}
```

## Error Handling และ Validation

### การตรวจสอบข้อมูล Final JSON
```typescript
function validateFinalJson(finalJson: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ตรวจสอบข้อมูลที่จำเป็น
  if (!finalJson.name) {
    errors.push('Project name is required');
  }

  if (!finalJson.features || finalJson.features.length === 0) {
    warnings.push('No features specified, using default features');
  }

  if (!finalJson.content?.pages || finalJson.content.pages.length === 0) {
    warnings.push('No pages specified, using default pages');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### การจัดการ Error ใน File Generation
```typescript
async function generateFileWithErrorHandling(fileConfig: FileConfig): Promise<GeneratedFile> {
  try {
    const file = await generateFile(fileConfig);
    return file;
  } catch (error) {
    console.error(`Failed to generate ${fileConfig.path}:`, error);
    
    // ใช้ fallback template
    return generateFallbackFile(fileConfig);
  }
}
```

### Fallback Strategy
```typescript
function generateFallbackFile(fileConfig: FileConfig): GeneratedFile {
  const fallbackTemplates = {
    'package.json': getDefaultPackageJson(),
    'vite.config.ts': getDefaultViteConfig(),
    'src/App.tsx': getDefaultAppComponent(),
    'src/main.tsx': getDefaultMainComponent()
  };

  return {
    path: fileConfig.path,
    content: fallbackTemplates[fileConfig.path] || getDefaultTemplate(fileConfig.type)
  };
}
```

## Performance Optimization

### การสร้างไฟล์แบบ Batch
```typescript
async function generateFilesInBatches(files: FileConfig[]): Promise<GeneratedFile[]> {
  const batchSize = 3;
  const results: GeneratedFile[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(file => generateFileWithErrorHandling(file))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Batch ${i + index} failed:`, result.reason);
        // ใช้ fallback
        results.push(generateFallbackFile(batch[index]));
      }
    });
  }

  return results;
}
```

### การ Cache ผลลัพธ์
```typescript
const fileCache = new Map<string, GeneratedFile>();

function getCachedFile(filePath: string): GeneratedFile | null {
  return fileCache.get(filePath) || null;
}

function cacheFile(filePath: string, content: string): void {
  fileCache.set(filePath, { path: filePath, content });
}
```

## การ Monitor และ Logging

### การติดตาม Performance
```typescript
function logPerformance(operation: string, startTime: number): void {
  const duration = Date.now() - startTime;
  console.log(`⏱️ ${operation} completed in ${duration}ms`);
}

// ใช้งาน
const startTime = Date.now();
const result = await generateProject(finalJson);
logPerformance('Project Generation', startTime);
```

### การติดตาม Error
```typescript
function logError(operation: string, error: Error): void {
  console.error(`❌ ${operation} failed:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}
```

## การปรับปรุงในอนาคต

### 1. Template System
- สร้าง template library สำหรับ components ต่างๆ
- ใช้ template engine สำหรับการสร้างโค้ด
- รองรับ custom templates

### 2. Plugin System
- สร้าง plugin architecture
- รองรับ third-party generators
- ระบบ extension points

### 3. AI Enhancement
- ใช้ AI เฉพาะเมื่อจำเป็น
- Hybrid approach (template + AI)
- Smart fallback system