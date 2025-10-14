# 🧠 LLM-Enhanced Component Selection System

## 📌 Overview

ระบบการเลือก Component ที่ได้รับการปรับปรุงด้วย **Large Language Model (LLM)** เพื่อแก้ปัญหาการ match keywords ที่จำกัดและเพิ่มความแม่นยำในการเข้าใจความต้องการของผู้ใช้

---

## 🎯 ปัญหาที่แก้ไข

### ❌ ปัญหาเดิม (Traditional Selection)

1. **Keyword Matching แบบตายตัว**
   ```typescript
   // ❌ ถ้า user พิมพ์ "เรียบหรู" แต่ system มีแค่ "luxury", "หรูหรา"
   const styleKeywords = {
     'luxury': ['luxury', 'หรูหรา', 'premium'],  // ไม่มี "เรียบหรู"
   };
   // → ไม่ match → ใช้ default "modern" แทน
   ```

2. **ไม่เข้าใจ Context และ Synonyms**
   - "ร้านอาหารญี่ปุ่น สไตล์เรียบหรู" → ไม่รู้ว่า "เรียบหรู" = "luxury" + "minimal"
   - "modern clean design" → ไม่รู้ว่า "clean" เกี่ยวข้องกับ "minimal"

3. **Reasoning แบบ Hardcoded**
   ```typescript
   // ❌ เป็นแค่ string concatenation
   reasoning = `Optimized for ${category} business`;
   // ไม่มีการวิเคราะห์เหตุผลจริงๆ
   ```

---

## ✅ วิธีแก้ด้วย LLM

### 1. **LLM-Based Intent Analysis**

```typescript
// ✅ LLM วิเคราะห์ความหมายจริงๆ
async analyzeUserIntent(userInput: string): Promise<LLMAnalysisResult>
```

**Input:**
```
"ร้านอาหารญี่ปุ่น สไตล์เรียบหรู โทนสีน้ำเงิน"
```

**LLM Analysis Output:**
```json
{
  "businessCategory": "restaurant",
  "style": ["luxury", "minimal"],           // ✅ เข้าใจว่า "เรียบหรู" = luxury + minimal
  "tone": "professional",
  "features": ["menu", "contact", "about"],
  "colorScheme": "cool",                    // ✅ เข้าใจว่า "น้ำเงิน" = cool
  "layoutStyle": "modern",
  "complexity": "moderate",
  "confidence": 0.92,
  "reasoning": "ร้านอาหารญี่ปุ่นมักใช้สไตล์มินิมอลและหรูหรา เน้นความเรียบง่ายแต่ดูดี"
}
```

**ข้อดี:**
- ✅ เข้าใจคำพ้อง: "เรียบหรู" = "luxury", "ทันสมัย" = "modern"
- ✅ รองรับทั้งไทยและอังกฤษ
- ✅ วิเคราะห์ความหมายโดยรวม ไม่ใช่แค่ match คำ
- ✅ ให้ confidence score และเหตุผล

---

### 2. **LLM-Based Component Recommendations**

```typescript
async getLLMRecommendations(
  context: SelectionContext,
  availableComponents: ComponentDefinition[]
): Promise<LLMComponentRecommendation[]>
```

**Input:**
```json
{
  "context": {
    "businessCategory": "restaurant",
    "userInput": "ร้านอาหารญี่ปุ่น สไตล์เรียบหรู",
    "style": ["luxury", "minimal"],
    "tone": "professional",
    "features": ["menu", "contact", "about"]
  },
  "availableComponents": [
    {
      "id": "navbar-main",
      "variants": [
        {"id": "modern", "style": "modern"},
        {"id": "minimal", "style": "minimal"}
      ]
    },
    {
      "id": "hero-basic",
      "variants": [
        {"id": "centered", "style": "minimal"},
        {"id": "split", "style": "modern"}
      ]
    }
  ]
}
```

**LLM Recommendations Output:**
```json
[
  {
    "componentId": "navbar-main",
    "variantId": "minimal",
    "slotId": "header",
    "score": 0.95,
    "reasoning": "Minimal navbar เหมาะกับสไตล์เรียบหรูของร้านอาหารญี่ปุ่น เน้นความเรียบง่ายและดูดี"
  },
  {
    "componentId": "hero-basic",
    "variantId": "centered",
    "slotId": "hero",
    "score": 0.92,
    "reasoning": "Hero section แบบ centered เหมาะกับสไตล์มินิมอล โชว์ภาพอาหารได้สวยงาม"
  },
  {
    "componentId": "menu-grid",
    "variantId": "card",
    "slotId": "section-1",
    "score": 0.90,
    "reasoning": "Menu grid แบบ card เหมาะสำหรับแสดงเมนูอาหาร รองรับภาพและราคา"
  },
  {
    "componentId": "contact-basic",
    "variantId": "with-form",
    "slotId": "section-2",
    "score": 0.88,
    "reasoning": "Contact form สำหรับจองโต๊ะ เหมาะกับร้านอาหาร"
  },
  {
    "componentId": "footer-main",
    "variantId": "multi-column",
    "slotId": "footer",
    "score": 0.85,
    "reasoning": "Footer แบบ multi-column ให้ข้อมูลครบถ้วน"
  }
]
```

**ข้อดี:**
- ✅ LLM เลือก component ที่เหมาะสมตามบริบท
- ✅ ให้เหตุผลที่ชัดเจน
- ✅ คะแนนที่สมเหตุสมผล
- ✅ เลือก variant ที่เหมาะสมที่สุด

---

### 3. **Enhanced Reasoning with LLM Insights**

```typescript
private generateEnhancedReasoning(
  selectedComponents: SelectedComponent[],
  context: SelectionContext,
  llmAnalysis: LLMAnalysisResult | null
): any
```

**Output:**
```json
{
  "summary": "Selected 5 components with average score of 90.0%",
  "keyFactors": [
    "AI-analyzed user intent with 92% confidence",
    "ร้านอาหารญี่ปุ่นมักใช้สไตล์มินิมอลและหรูหรา เน้นความเรียบง่ายแต่ดูดี",
    "Optimized for restaurant business",
    "Matches luxury, minimal style",
    "Aligned with professional tone"
  ],
  "llmEnhanced": true,
  "tradeoffs": [
    "AI-powered selection for better accuracy",
    "Balanced between user intent and best practices"
  ],
  "recommendations": [
    "Review component selection reasoning",
    "Customize colors to match brand"
  ]
}
```

---

## 🔄 Workflow Comparison

### ❌ Traditional Workflow

```
User Input → Keyword Matching → Simple Scoring → Component Selection
     ↓              ↓                 ↓                   ↓
"เรียบหรู"    ไม่ match        Default 0.5       ผลลัพธ์ไม่ตรง
```

### ✅ LLM-Enhanced Workflow

```
User Input → LLM Intent Analysis → Enhanced Context → LLM Recommendations → Best Selection
     ↓              ↓                     ↓                    ↓                  ↓
"เรียบหรู"   ["luxury","minimal"]   Rich Context      Smart Choices        ผลลัพธ์แม่นยำ
              confidence: 0.92
```

---

## 📊 Implementation Details

### **File Structure**

```
src/midori/agents/frontend-v2/
├── component-library/
│   ├── selector.ts              # ❌ Traditional selector (fallback)
│   ├── llm-selector.ts          # ✅ NEW: LLM-enhanced selector
│   └── types.ts
├── adapters/
│   └── component-adapter.ts     # ✅ UPDATED: Uses LLMEnhancedSelector
└── services/
    ├── ai-service.ts
    └── category-service.ts      # Already uses LLM for category detection
```

### **Key Changes**

#### 1. **Component Adapter (component-adapter.ts)**

```typescript
// Before
const selector = getComponentSelector();
const componentSelection = await selector.selectComponents(selectionContext);

// After
const llmSelector = new LLMEnhancedSelector();
const componentSelection = await this.llmSelector.selectComponentsWithLLM(selectionContext);
```

#### 2. **LLM Enhanced Selector (llm-selector.ts)**

```typescript
export class LLMEnhancedSelector {
  // Step 1: Analyze user intent
  async analyzeUserIntent(userInput: string, keywords: string[]): Promise<LLMAnalysisResult | null>
  
  // Step 2: Get LLM recommendations
  async getLLMRecommendations(context: SelectionContext, components: ComponentDefinition[]): Promise<LLMComponentRecommendation[]>
  
  // Step 3: Combine with traditional selection
  async selectComponentsWithLLM(context: SelectionContext): Promise<ComponentSelection>
}
```

---

## 🚀 Usage Example

### **Test Case 1: ภาษาไทย**

```typescript
const task = {
  keywords: ["ร้านอาหารญี่ปุ่น", "สไตล์เรียบหรู", "โทนสีน้ำเงิน"],
  businessCategory: "restaurant"
};

const adapter = new ComponentAdapter();
const result = await adapter.generateFrontend(task);

// LLM Analysis:
// ✅ businessCategory: "restaurant"
// ✅ style: ["luxury", "minimal"]
// ✅ colorScheme: "cool"
// ✅ tone: "professional"

// LLM Recommendations:
// ✅ navbar-main/minimal (score: 0.95)
// ✅ hero-basic/centered (score: 0.92)
// ✅ menu-grid/card (score: 0.90)
```

### **Test Case 2: English**

```typescript
const task = {
  keywords: ["modern", "clean", "restaurant", "website"],
  businessCategory: "restaurant"
};

const adapter = new ComponentAdapter();
const result = await adapter.generateFrontend(task);

// LLM Analysis:
// ✅ businessCategory: "restaurant"
// ✅ style: ["modern", "minimal"]  // LLM understands "clean" → "minimal"
// ✅ tone: "friendly"

// LLM Recommendations:
// ✅ navbar-main/modern (score: 0.93)
// ✅ hero-basic/split (score: 0.91)
```

### **Test Case 3: คำพ้อง**

```typescript
const task = {
  keywords: ["ทันสมัย", "เรียบง่าย", "ร้านกาแฟ"],
  businessCategory: "restaurant"
};

// LLM Analysis:
// ✅ "ทันสมัย" → "modern"
// ✅ "เรียบง่าย" → "minimal"
// ✅ style: ["modern", "minimal"]
```

---

## 🎯 Benefits

### 1. **Better Intent Understanding**
- ✅ เข้าใจคำพ้อง synonyms
- ✅ รองรับหลายภาษา
- ✅ วิเคราะห์ความหมายโดยรวม

### 2. **Smarter Component Selection**
- ✅ เลือก component ที่เหมาะสมจริงๆ
- ✅ เลือก variant ที่ถูกต้อง
- ✅ ให้เหตุผลที่เข้าใจง่าย

### 3. **Fallback Mechanism**
- ✅ ถ้า LLM ไม่พร้อม → ใช้ traditional selector
- ✅ ระบบทำงานได้ทุกสถานการณ์
- ✅ Graceful degradation

### 4. **Transparent Reasoning**
- ✅ แสดง confidence score
- ✅ อธิบายเหตุผลการเลือก
- ✅ ตรวจสอบได้ว่าใช้ LLM หรือไม่

---

## 📈 Performance Considerations

### **LLM Calls**

1. **Intent Analysis** (1 call)
   - Model: `gpt-5-nano` (fast, cheap)
   - Temperature: 0.3 (consistent)
   - Max tokens: 16,000

2. **Component Recommendations** (1 call)
   - Model: `gpt-5-nano`
   - Temperature: 0.5 (balanced)
   - Max tokens: 16,000

**Total:** 2 LLM calls per website generation

### **Caching Strategy**

```typescript
// Future enhancement: Cache LLM results
const cacheKey = `${userInput}-${keywords.join(',')}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

---

## 🔧 Configuration

### **Environment Variables**

```env
OPENAI_API_KEY=your-api-key-here
```

### **LLM Settings**

```typescript
// In llm-selector.ts
const LLM_CONFIG = {
  model: 'gpt-5-nano',           // Fast & affordable model
  intentAnalysisTemp: 0.3,       // Low for consistency
  recommendationTemp: 0.5,       // Medium for creativity
  maxTokens: 16000,
  timeout: 30000                 // 30 seconds
};
```

---

## 🧪 Testing

### **Unit Tests**

```typescript
describe('LLMEnhancedSelector', () => {
  it('should analyze Thai synonyms correctly', async () => {
    const result = await selector.analyzeUserIntent(
      'ร้านอาหาร สไตล์เรียบหรู',
      ['สไตล์เรียบหรู']
    );
    expect(result.style).toContain('luxury');
    expect(result.style).toContain('minimal');
  });

  it('should fallback to traditional when LLM fails', async () => {
    // Mock LLM failure
    openai.chat.completions.create.mockRejectedValue(new Error('API Error'));
    
    const result = await selector.selectComponentsWithLLM(context);
    expect(result.selectedComponents.length).toBeGreaterThan(0);
    expect(result.reasoning.llmEnhanced).toBe(false);
  });
});
```

---

## 📝 Future Enhancements

1. **Caching**
   - Cache LLM analysis results
   - Reduce API calls for similar inputs

2. **Multi-language Support**
   - Support more languages (Japanese, Chinese, etc.)

3. **User Feedback Loop**
   - Learn from user selections
   - Improve recommendations over time

4. **A/B Testing**
   - Compare LLM vs Traditional selection
   - Measure accuracy improvements

5. **Component Scoring Refinement**
   - Use LLM to score individual components
   - More nuanced scoring criteria

---

## ✅ Conclusion

LLM-Enhanced Component Selection แก้ปัญหาหลักของระบบเดิม:

| ปัญหา | วิธีแก้ |
|-------|---------|
| ❌ Keyword matching แบบตายตัว | ✅ LLM วิเคราะห์ความหมาย |
| ❌ ไม่เข้าใจคำพ้อง | ✅ LLM เข้าใจ synonyms |
| ❌ Reasoning แบบ hardcoded | ✅ LLM ให้เหตุผลจริง |
| ❌ คะแนนไม่แม่นยำ | ✅ LLM ให้คะแนนตาม context |

**Result:** ระบบที่ฉลาดขึ้น, เข้าใจผู้ใช้ดีขึ้น, ผลลัพธ์แม่นยำขึ้น 🚀

