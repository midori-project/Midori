# 🎯 Response Configuration System

ระบบกำหนดการตอบของ AI ให้เหมาะสมกับแต่ละสถานการณ์ โดยใช้ `max_completion_tokens`, `reasoning.effort`, และ `text.verbosity`

## 📋 Available Response Configurations

| Configuration | Tokens | Reasoning | Verbosity | Use Case |
|---------------|--------|-----------|-----------|-----------|
| `greeting` | 100 | minimal | low | ทักทายสั้น ๆ |
| `introduction` | 150 | minimal | low | แนะนำตัวกระชับ |
| `midoriIdentity` | 200 | low | medium | อธิบาย Midori |
| `technologyExplanation` | 300 | low | medium | อธิบายเทคโนโลยี |
| `baseChat` | 400 | low | medium | สนทนาทั่วไป |
| `contextAware` | 500 | medium | medium | คำนึงถึง context |
| `projectContextAware` | 600 | medium | medium | เกี่ยวข้องกับโปรเจค |
| `intentAnalysis` | 300 | low | low | วิเคราะห์ intent |
| `taskSummary` | 400 | low | medium | สรุปงาน |
| `complexTaskAnalysis` | 800 | medium | medium | วิเคราะห์งานซับซ้อน |
| `unclearIntent` | 250 | minimal | medium | ขอให้ชี้แจง |
| `securityDenial` | 150 | minimal | low | ปฏิเสธคำขอไม่ปลอดภัย |
| `timeQuery` | 80 | minimal | low | ตอบเวลา |

## 🚀 การใช้งาน

### 1. Basic Usage with OpenAI API

```typescript
import { getResponseConfig, toLLMOptions } from './configs/responseConfig';

// สำหรับการทักทายสั้น ๆ
const greetingConfig = getResponseConfig('greeting');

const chat = await client.chat.completions.create({
  model: "gpt-5-nano",
  messages: [{ role: "user", content: "สวัสดี" }],
  max_completion_tokens: greetingConfig.maxCompletionTokens,  // 100
  reasoning: greetingConfig.reasoning,                        // { effort: "minimal" }
  // @ts-ignore
  text: greetingConfig.text                                   // { verbosity: "low" }
});
```

### 2. Direct API Usage

```typescript
const chat = await client.chat.completions.create({
  model: "gpt-5-nano",
  messages,
  max_completion_tokens: 100,       // กำหนดความยาวการตอบ
  reasoning: { effort: "minimal" }, // ลด reasoning ให้เร็ว
  // @ts-ignore
  text: { verbosity: "low" }        // ตอบแบบกระชับ
});
```

### 3. ใช้ใน Orchestrator AI

```typescript
// การกำหนด config อัตโนมัติ
if (messageType === 'greeting') {
  const config = getResponseConfig('greeting');
  // จะใช้ 100 tokens, minimal reasoning, low verbosity
}
```

## 🎯 การปรับแต่ง Response Config

### Override Configuration

```typescript
// ปรับแต่ง greeting ให้สั้นกว่าปกติ
const customConfig = getResponseConfig('greeting', {
  maxCompletionTokens: 50,  // ลดลงเหลือ 50 tokens
  reasoning: { effort: 'minimal' }
});
```

### Create New Configuration

```typescript
const newConfig: ResponseConfig = {
  maxCompletionTokens: 200,
  reasoning: { effort: 'low' },
  text: { verbosity: 'medium' },
  description: 'คำอธิบายใหม่'
};
```

## 📊 ตัวอย่างผลลัพธ์

### Greeting (100 tokens, minimal reasoning)
**Input:** "สวัสดี"  
**Output:** "สวัสดีครับ! ยินดีต้อนรับครับ 😊"

### Complex Analysis (800 tokens, medium reasoning)
**Input:** "วิเคราะห์ความแตกต่างระหว่าง Next.js และ Vite"  
**Output:** [การวิเคราะห์แบบละเอียด 800 tokens]

## 🔧 การทดสอบ

```bash
# ทดสอบระบบ response configuration
npm run test:response-config

# ทดสอบกับ OpenAI API จริง
npm run test:real-openai-config
```

## 🎯 Benefits

1. **ประหยัด Tokens**: ใช้ tokens เท่าที่จำเป็น
2. **เร็วขึ้น**: ลด reasoning effort สำหรับงานง่าย ๆ
3. **คุณภาพเหมาะสม**: Verbosity ที่เหมาะกับแต่ละสถานการณ์
4. **ประสบการณ์ดี**: User ได้คำตอบที่เหมาะสมกับสิ่งที่ถาม

## 📝 สำหรับ Developer

### เพิ่ม Configuration ใหม่

1. เพิ่มใน `RESPONSE_CONFIGS` ใน `responseConfig.ts`
2. กำหนด `maxCompletionTokens`, `reasoning.effort`, `text.verbosity`
3. ใช้ `getResponseConfig()` ในโค้ด
4. ทดสอบกับ `testResponseConfiguration()`

### Debug Configuration

```typescript
import { listAvailableConfigs } from './configs/responseConfig';

// แสดงรายการ config ทั้งหมด
console.log(listAvailableConfigs());
```