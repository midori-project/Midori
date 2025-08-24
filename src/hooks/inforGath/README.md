# 🎣 Custom Hooks สำหรับ Info Gathering Flow

โฟลเดอร์นี้ประกอบด้วย custom hooks สำหรับการจัดการ Info Gathering Flow ของระบบ Midori

## 📁 ไฟล์ในโฟลเดอร์

### 1. `useOpenAIInfoGathering.ts`
Hook สำหรับการเรียกใช้ OpenAI API ในการวิเคราะห์และสร้างผลลัพธ์

**ฟีเจอร์:**
- วิเคราะห์พรอมท์แรก (Initial Analysis)
- ประเมินคุณภาพข้อมูล (Quality Assessment)
- สร้างผลลัพธ์สุดท้าย (Final Generation)
- จัดการ loading states และ error handling

**การใช้งาน:**
```typescript
import { useOpenAIInfoGathering } from '@/hooks';

const MyComponent = () => {
  const {
    loading,
    error,
    data,
    phase,
    analyzeInitialPrompt,
    assessQuality,
    generateFinalOutput,
    reset,
    clearError,
  } = useOpenAIInfoGathering();

  const handleAnalysis = async (prompt: string) => {
    const result = await analyzeInitialPrompt(prompt);
    if (result) {
      console.log('Analysis result:', result);
    }
  };

  return (
    <div>
      {loading && <p>กำลังประมวลผล...</p>}
      {error && <p>ข้อผิดพลาด: {error}</p>}
      {/* UI components */}
    </div>
  );
};
```

### 2. `useQuestionnaire.ts`
Hook สำหรับการจัดการคำถามและคำตอบ

**ฟีเจอร์:**
- จัดการรายการคำถาม
- จัดการคำตอบของผู้ใช้
- นำทางระหว่างคำถาม
- คำนวณความคืบหน้า

**การใช้งาน:**
```typescript
import { useQuestionnaire } from '@/hooks';

const MyComponent = () => {
  const {
    questions,
    answers,
    currentQuestionIndex,
    isComplete,
    setQuestions,
    setAnswer,
    nextQuestion,
    previousQuestion,
    getProgress,
    reset,
  } = useQuestionnaire();

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswer(questionId, answer);
  };

  return (
    <div>
      <div>ความคืบหน้า: {getProgress()}%</div>
      {questions[currentQuestionIndex] && (
        <div>
          <h3>{questions[currentQuestionIndex].question}</h3>
          {/* Answer input */}
          <button onClick={nextQuestion}>ถัดไป</button>
        </div>
      )}
    </div>
  );
};
```

### 3. `useInfoGatheringFlow.ts`
Hook รวมสำหรับการจัดการ Info Gathering Flow ทั้งหมด

**ฟีเจอร์:**
- รวมการใช้งานทั้งสอง hooks ข้างต้น
- จัดการ phases ของ flow
- จัดการ state ทั้งหมดในที่เดียว

**การใช้งาน:**
```typescript
import { useInfoGatheringFlow } from '@/hooks';

const MyComponent = () => {
  const {
    currentPhase,
    analysis,
    quality,
    finalOutput,
    isAnalyzing,
    isAssessingQuality,
    isGeneratingFinal,
    error,
    startAnalysis,
    assessQuality,
    generateFinalOutput,
    reset,
    questionnaire,
  } = useInfoGatheringFlow();

  const handleStart = async (prompt: string) => {
    await startAnalysis(prompt);
  };

  return (
    <div>
      {currentPhase === 'initial' && (
        <InitialPhase onStart={handleStart} />
      )}
      {currentPhase === 'questions' && (
        <QuestionsPhase questionnaire={questionnaire} />
      )}
      {currentPhase === 'quality' && (
        <QualityPhase onAssess={assessQuality} />
      )}
      {currentPhase === 'complete' && (
        <CompletePhase result={finalOutput} />
      )}
    </div>
  );
};
```

## 🔄 Flow การทำงาน

```
1. Initial Phase
   ↓
2. Questions Phase
   ↓
3. Quality Assessment
   ↓
4. Final Generation
   ↓
5. Complete
```

## 📊 State Management

### Phase States:
- `initial`: เริ่มต้น
- `questions`: คำถาม
- `quality`: ประเมินคุณภาพ
- `final`: สร้างผลลัพธ์สุดท้าย
- `complete`: เสร็จสิ้น

### Loading States:
- `isAnalyzing`: กำลังวิเคราะห์
- `isAssessingQuality`: กำลังประเมินคุณภาพ
- `isGeneratingFinal`: กำลังสร้างผลลัพธ์สุดท้าย

### Error Handling:
- จัดการ error จาก API calls
- แสดงข้อความ error ที่เหมาะสม
- มีฟังก์ชัน clearError สำหรับล้าง error

## 🎯 Best Practices

### 1. การใช้งาน Hooks
```typescript
// ✅ ดี - ใช้ hook รวม
const flow = useInfoGatheringFlow();

// ❌ ไม่ดี - ใช้ hooks แยกกัน
const openAI = useOpenAIInfoGathering();
const questionnaire = useQuestionnaire();
```

### 2. การใช้งาน Types
```typescript
// ✅ ดี - import types จาก index
import { 
  useInfoGatheringFlow, 
  type UseInfoGatheringFlowReturn 
} from '@/hooks';

// ✅ ดี - ใช้ type สำหรับ component props
interface Props {
  flow: UseInfoGatheringFlowReturn;
}
```

### 2. Error Handling
```typescript
// ✅ ดี - จัดการ error อย่างเหมาะสม
if (error) {
  return <ErrorMessage error={error} onRetry={clearError} />;
}

// ❌ ไม่ดี - ไม่จัดการ error
const result = await startAnalysis(prompt);
```

### 3. Loading States
```typescript
// ✅ ดี - แสดง loading state
{isAnalyzing && <LoadingSpinner />}

// ❌ ไม่ดี - ไม่แสดง loading
<button onClick={() => startAnalysis(prompt)}>
  เริ่มวิเคราะห์
</button>
```

### 4. Rules of Hooks
```typescript
// ✅ ดี - เรียกใช้ hook ในระดับบนสุดของ component
function MyComponent() {
  const flow = useInfoGatheringFlow();
  
  const handleClick = () => {
    flow.startAnalysis("ตัวอย่างพรอมท์");
  };
  
  return <button onClick={handleClick}>เริ่ม</button>;
}

// ❌ ไม่ดี - เรียกใช้ hook ใน event handler
function MyComponent() {
  const handleClick = () => {
    const flow = useInfoGatheringFlow(); // ❌ ผิด!
    flow.startAnalysis("ตัวอย่างพรอมท์");
  };
  
  return <button onClick={handleClick}>เริ่ม</button>;
}
```

## 🔧 การปรับแต่ง

### เพิ่มคำถามใหม่:
```typescript
const questions: Question[] = [
  {
    id: 'new_question',
    type: 'basic',
    category: 'custom',
    question: 'คำถามใหม่ของคุณ',
    required: true,
    options: ['ตัวเลือก 1', 'ตัวเลือก 2'],
  },
];

questionnaire.setQuestions(questions);
```

### ปรับแต่ง API calls:
```typescript
// ใน useOpenAIInfoGathering.ts
const makeRequest = useCallback(async <T>(
  endpoint: string,
  requestData: Partial<OpenAIRequest>
): Promise<T | null> => {
  // เพิ่ม custom logic ตรงนี้
  const response = await axios.post<OpenAIResponse>(endpoint, requestData);
  // ...
}, []);
```

## 📝 หมายเหตุ

- Hooks ทั้งหมดใช้ TypeScript เพื่อความปลอดภัยของ type
- ใช้ axios สำหรับ HTTP requests ตามที่กำหนดใน project rules
- ไม่ใช้ `any` type ตามที่กำหนดใน project rules
- จัดเก็บ hooks ในโฟลเดอร์แยกตามที่กำหนดใน project rules

## 🔧 การแก้ไขปัญหา

### TypeScript Errors
หากพบ TypeScript errors เกี่ยวกับ missing properties ใน `ConversationContext`:

```typescript
// ❌ ไม่ถูกต้อง
const context: ConversationContext = {
  analysis: analysis,
  conversationHistory: [], // ไม่มี property นี้
};

// ✅ ถูกต้อง
const context: ConversationContext = {
  analysis: analysis,
  previousAnswers: answers,
  currentPhase: 'quality',
};
```

### Export Types
หากต้องการใช้ types จาก hooks:

```typescript
// ✅ ถูกต้อง - import จาก index
import { type UseInfoGatheringFlowReturn } from '@/hooks';

// ❌ ไม่ถูกต้อง - import โดยตรง
import { type UseInfoGatheringFlowReturn } from '@/hooks/useInfoGatheringFlow';
```

### Rules of Hooks Error
หากพบ error "Invalid hook call":

```typescript
// ❌ ไม่ถูกต้อง - เรียกใช้ hook ใน event handler
<button onClick={() => {
  const hook = useInfoGatheringFlow(); // ❌ ผิด!
}}>

// ✅ ถูกต้อง - เรียกใช้ hook ในระดับบนสุดของ component
function MyComponent() {
  const hook = useInfoGatheringFlow(); // ✅ ถูกต้อง
  
  const handleClick = () => {
    hook.startAnalysis("พรอมท์");
  };
  
  return <button onClick={handleClick}>เริ่ม</button>;
}
```
