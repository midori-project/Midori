# 🔍 การวิเคราะห์ LLM Calls ในระบบ Component-Based

## 📊 สรุป: จำนวน LLM Calls ทั้งหมด

**ตั้งแต่ User Input จนถึงสร้างเว็บเสร็จ มีการเรียก LLM ทั้งหมด: 4-5 ครั้ง**

---

## 🔄 Flow การทำงานทั้งหมด

```
User Input
    ↓
[1] Category Detection (LLM) ← categoryService.detectCategory()
    ↓
[2] Intent Analysis (LLM) ← llmSelector.analyzeUserIntent()
    ↓
[3] Component Recommendations (LLM) ← llmSelector.getLLMRecommendations()
    ↓
[4] Content Generation (LLM) ← aiService.generateContent()
    ↓
Render Components → Final Output
```

---

## 📝 รายละเอียดแต่ละ LLM Call

### **Call #1: Category Detection** 
**ไฟล์:** `src/midori/agents/frontend-v2/services/category-service.ts`  
**ฟังก์ชัน:** `detectCategoryByLLM()`  
**เรียกที่:** `component-adapter.ts` → `detectBusinessCategory()` → `categoryService.detectCategory({ useLLM: true })`

```typescript
// Line 444-449 in component-adapter.ts
const category = await categoryService.detectCategory({
  keywords,
  userInput,
  useLLM: true,  // ✅ เรียก LLM
  fallbackToDefault: true
});
```

**LLM Config:**
- Model: `gpt-5-nano`
- Temperature: `1`
- Max tokens: `16000`
- Purpose: ตรวจจับประเภทธุรกิจจาก user input

**Prompt Example:**
```
Analyze this user input and determine the business category:

User Input: "ร้านอาหารญี่ปุ่น"

Available categories:
- restaurant: Food service, dining, cafe, restaurant
- ecommerce: Online store, shopping, products
- portfolio: Personal portfolio
- healthcare: Medical, health, clinic
- pharmacy: Drugstore, medicine

Respond with ONLY the category ID (e.g., "restaurant"):
```

**Response:**
```
"restaurant"
```

---

### **Call #2: Intent Analysis**
**ไฟล์:** `src/midori/agents/frontend-v2/component-library/llm-selector.ts`  
**ฟังก์ชัน:** `analyzeUserIntent()`  
**เรียกที่:** `llmSelector.selectComponentsWithLLM()` → Step 1

```typescript
// Line 76 in component-adapter.ts
const componentSelection = await this.llmSelector.selectComponentsWithLLM(selectionContext);

// Inside selectComponentsWithLLM() - Line 283
const llmAnalysis = await this.analyzeUserIntent(context.userInput, context.keywords);
```

**LLM Config:**
- Model: `gpt-5-nano`
- Temperature: `1` (ถูกแก้จาก 0.3 → 1 ตาม user edit)
- Max tokens: `16000`
- Purpose: วิเคราะห์ความต้องการของ user แบบละเอียด

**Prompt Example:**
```
วิเคราะห์ความต้องการของผู้ใช้จากข้อความต่อไปนี้:

Input: "ร้านอาหารญี่ปุ่น สไตล์เรียบหรู โทนสีน้ำเงิน"
Keywords: ร้านอาหารญี่ปุ่น, สไตล์เรียบหรู, โทนสีน้ำเงิน

โปรดวิเคราะห์และตอบกลับในรูปแบบ JSON เท่านั้น:

{
  "businessCategory": "restaurant",
  "style": ["luxury", "minimal"],
  "tone": "professional",
  "features": ["menu", "contact", "about"],
  "colorScheme": "cool",
  "layoutStyle": "modern",
  "complexity": "moderate",
  "confidence": 0.92,
  "reasoning": "..."
}
```

**Response:**
```json
{
  "businessCategory": "restaurant",
  "style": ["luxury", "minimal"],
  "tone": "professional",
  "features": ["menu", "contact", "about"],
  "colorScheme": "cool",
  "layoutStyle": "modern",
  "complexity": "moderate",
  "confidence": 0.92,
  "reasoning": "ร้านอาหารญี่ปุ่นมักใช้สไตล์มินิมอลและหรูหรา..."
}
```

---

### **Call #3: Component Recommendations**
**ไฟล์:** `src/midori/agents/frontend-v2/component-library/llm-selector.ts`  
**ฟังก์ชัน:** `getLLMRecommendations()`  
**เรียกที่:** `llmSelector.selectComponentsWithLLM()` → Step 4

```typescript
// Inside selectComponentsWithLLM() - Line 293
const llmRecommendations = await this.getLLMRecommendations(enhancedContext, allComponents);
```

**LLM Config:**
- Model: `gpt-5-nano`
- Temperature: `0.5`
- Max tokens: `16000`
- Purpose: แนะนำ components ที่เหมาะสมที่สุด

**Prompt Example:**
```
เลือก components ที่เหมาะสมที่สุดสำหรับเว็บไซต์ตามข้อมูลต่อไปนี้:

User Context:
- Business: restaurant
- Input: "ร้านอาหารญี่ปุ่น สไตล์เรียบหรู"
- Style: luxury, minimal
- Tone: professional
- Features: menu, contact, about

Available Components:
[
  { id: "navbar-main", variants: [...] },
  { id: "hero-basic", variants: [...] },
  { id: "menu-grid", variants: [...] },
  ...
]

โปรดแนะนำ components ที่เหมาะสมในรูปแบบ JSON array:
[
  {
    "componentId": "navbar-main",
    "variantId": "minimal",
    "slotId": "header",
    "score": 0.95,
    "reasoning": "..."
  },
  ...
]
```

**Response:**
```json
[
  {
    "componentId": "navbar-main",
    "variantId": "minimal",
    "slotId": "header",
    "score": 0.95,
    "reasoning": "Minimal navbar เหมาะกับสไตล์เรียบหรู..."
  },
  {
    "componentId": "hero-basic",
    "variantId": "centered",
    "slotId": "hero",
    "score": 0.92,
    "reasoning": "Hero centered เหมาะกับมินิมอล..."
  },
  ...
]
```

---

### **Call #4: Content Generation**
**ไฟล์:** `src/midori/agents/frontend-v2/services/ai-service.ts`  
**ฟังก์ชัน:** `generateContent()`  
**เรียกที่:** `component-adapter.ts` → `generateContentForComponents()`

```typescript
// Line 83-86 in component-adapter.ts
const aiGeneratedData = await this.generateContentForComponents(
  componentSelection,
  task
);

// Line 309-311 in component-adapter.ts
const aiRequest = this.createAIRequest(componentSelection, task);
const aiResponse = await this.aiService.generateContent(aiRequest);
```

**LLM Config:**
- Model: `gpt-5-nano` (default) หรือตาม `task.aiSettings.model`
- Temperature: `1` (default) หรือตาม `task.aiSettings.temperature`
- Max tokens: `16000`
- Purpose: สร้างเนื้อหาจริงๆ สำหรับแต่ละ component (text, menu items, contact info, etc.)

**Prompt Example:**
```
Generate content for a restaurant website in Thai language.

Business: restaurant
Components:
- navbar-main/minimal
- hero-basic/centered
- menu-grid/card
- contact-basic/with-form
- footer-main/multi-column

Generate JSON with content for each component:
{
  "global": {
    "businessName": "...",
    "tagline": "...",
    "description": "..."
  },
  "navbar-main": {
    "logo": "...",
    "links": [...]
  },
  "hero-basic": {
    "title": "...",
    "subtitle": "...",
    "cta": "..."
  },
  "menu-grid": {
    "items": [
      {
        "name": "...",
        "description": "...",
        "price": "...",
        "image": "..."
      }
    ]
  },
  ...
}
```

**Response:**
```json
{
  "global": {
    "businessName": "ซากุระ อิซากายะ",
    "tagline": "รสชาติแท้ของญี่ปุ่น",
    "description": "ร้านอาหารญี่ปุ่นสไตล์มินิมอล..."
  },
  "navbar-main": {
    "logo": "ซากุระ",
    "links": ["หน้าแรก", "เมนู", "เกี่ยวกับเรา", "ติดต่อ"]
  },
  "hero-basic": {
    "title": "ยินดีต้อนรับสู่ ซากุระ อิซากายะ",
    "subtitle": "สัมผัสประสบการณ์อาหารญี่ปุ่นแท้ๆ",
    "cta": "ดูเมนู"
  },
  "menu-grid": {
    "items": [
      {
        "name": "ซูชิแซลมอน",
        "description": "ซูชิปลาแซลมอนสดใหม่",
        "price": "250 บาท",
        "image": "/api/placeholder/400/300"
      },
      ...
    ]
  },
  ...
}
```

---

## 📈 Timeline และ Dependencies

```
Time →

1. Category Detection (LLM)
   ↓ (depends on: user input)
   
2. Intent Analysis (LLM)
   ↓ (depends on: category + user input)
   
3. Component Recommendations (LLM)
   ↓ (depends on: intent analysis + available components)
   
4. Content Generation (LLM)
   ↓ (depends on: selected components)
   
5. Render Components (No LLM)
   → Final Output
```

---

## 🎯 สรุปจำนวน LLM Calls

| # | ชื่อ | ไฟล์ | ฟังก์ชัน | Model | Temp | Purpose |
|---|------|------|---------|-------|------|---------|
| 1 | **Category Detection** | `category-service.ts` | `detectCategoryByLLM()` | gpt-5-nano | 1 | หา business category |
| 2 | **Intent Analysis** | `llm-selector.ts` | `analyzeUserIntent()` | gpt-5-nano | 1 | วิเคราะห์ความต้องการ |
| 3 | **Component Recommendations** | `llm-selector.ts` | `getLLMRecommendations()` | gpt-5-nano | 0.5 | แนะนำ components |
| 4 | **Content Generation** | `ai-service.ts` | `generateContent()` | gpt-5-nano | 1 | สร้างเนื้อหา |

**รวม: 4 LLM calls (guaranteed)**

---

## 🔀 Conditional Calls

### เมื่อไหร่ที่ LLM ไม่ถูกเรียก?

1. **Category Detection (Call #1)**
   - ❌ ถ้ามี `task.businessCategory` อยู่แล้ว → skip LLM
   - ❌ ถ้า `useLLM: false` → ใช้ keyword matching
   - ❌ ถ้า keywords match ได้แล้ว → skip LLM

2. **Intent Analysis (Call #2)**
   - ❌ ถ้า OPENAI_API_KEY ไม่มี → skip LLM
   - ❌ ถ้า LLM service ไม่ initialize → fallback

3. **Component Recommendations (Call #3)**
   - ❌ ถ้า OPENAI_API_KEY ไม่มี → skip LLM
   - ❌ ถ้า LLM service ไม่ initialize → fallback

4. **Content Generation (Call #4)**
   - ✅ **Always called** (มี mock data fallback ถ้า LLM fail)

---

## 📊 จำนวน LLM Calls แต่ละสถานการณ์

### **Scenario 1: Full LLM Mode (มี API key + ทุกอย่างพร้อม)**
```
✅ Call #1: Category Detection
✅ Call #2: Intent Analysis
✅ Call #3: Component Recommendations
✅ Call #4: Content Generation
---
Total: 4 calls
```

### **Scenario 2: มี businessCategory อยู่แล้ว**
```
❌ Call #1: Category Detection (skip)
✅ Call #2: Intent Analysis
✅ Call #3: Component Recommendations
✅ Call #4: Content Generation
---
Total: 3 calls
```

### **Scenario 3: ไม่มี OPENAI_API_KEY**
```
❌ Call #1: Category Detection (keyword matching)
❌ Call #2: Intent Analysis (skip → fallback)
❌ Call #3: Component Recommendations (skip → fallback)
✅ Call #4: Content Generation (mock data)
---
Total: 0-1 calls (ถ้า AI Service มี key อื่น)
```

### **Scenario 4: Category match จาก keywords**
```
❌ Call #1: Category Detection (keyword match → skip LLM)
✅ Call #2: Intent Analysis
✅ Call #3: Component Recommendations
✅ Call #4: Content Generation
---
Total: 3 calls
```

---

## 💡 ข้อสังเกต

### **1. Sequential vs Parallel**
- ทั้ง 4 calls เป็น **Sequential** (ทีละ call)
- แต่ละ call ต้องรอ response จาก call ก่อนหน้า
- ไม่สามารถ parallel ได้เพราะมี dependencies

### **2. Cost Optimization**
- ใช้ `gpt-5-nano` ทุก call (model ถูกสุด)
- มี caching ใน category detection
- มี fallback mechanisms ทุก call

### **3. Fallback Strategy**
```
LLM Call → Success? → Use result
          ↓ Failed
          → Fallback (keyword matching / traditional selector / mock data)
```

### **4. Temperature Settings**
- **Category Detection**: `1.0` → consistency ปานกลาง
- **Intent Analysis**: `1.0` → ความยืดหยุ่นปานกลาง (user แก้จาก 0.3)
- **Component Recommendations**: `0.5` → balanced
- **Content Generation**: `1.0` (default) → creative

---

## 🔧 แนวทางปรับปรุง

### **1. Reduce LLM Calls (ถ้าต้องการประหยัด)**

```typescript
// รวม Call #2 และ #3 เป็น call เดียว
async analyzeAndRecommend(userInput: string, components: Component[]): Promise<{
  analysis: LLMAnalysisResult;
  recommendations: LLMComponentRecommendation[];
}>
```

**ประโยชน์:**
- ลด calls จาก 4 → 3
- ลดเวลารอ
- ประหยัด API cost

### **2. Add Caching**

```typescript
// Cache intent analysis results
const cacheKey = `${userInput}-${keywords.join(',')}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

**ประโยชน์:**
- ลด repeated calls
- เร็วขึ้น
- ประหยัด cost

### **3. Batch Processing (ถ้าสร้างหลายเว็บพร้อมกัน)**

```typescript
// Batch multiple requests
const results = await Promise.all([
  llm.analyze(input1),
  llm.analyze(input2),
  llm.analyze(input3)
]);
```

---

## ✅ สรุปสุดท้าย

### **คำตอบ: ระบบมีการเรียก LLM กี่ครั้ง?**

**ตอบ: 4 ครั้ง (ในสถานการณ์ปกติ)**

1. **Category Detection** - หาประเภทธุรกิจ
2. **Intent Analysis** - วิเคราะห์ความต้องการ
3. **Component Recommendations** - แนะนำ components
4. **Content Generation** - สร้างเนื้อหา

**แต่อาจลดลงเหลือ 3 ครั้ง** ถ้า:
- มี `businessCategory` อยู่แล้ว
- Keywords match ได้เลย

**หรืออาจเป็น 0-1 ครั้ง** ถ้า:
- ไม่มี OPENAI_API_KEY
- ใช้ fallback mechanisms

---

## 📝 Note

User ได้แก้ไข temperature ใน `llm-selector.ts`:
- Line 130: `temperature: 1` (เดิม: `0.3`)
- นี่ทำให้ Intent Analysis มีความยืดหยุ่นมากขึ้น แต่อาจได้ผลลัพธ์ที่หลากหลายกว่าเดิม

