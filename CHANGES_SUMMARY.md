# สรุปการเปลี่ยนแปลงระบบ Info Gathering

## การปรับปรุงที่ทำ

### 1. เพิ่มข้อมูลการออกแบบใน System Prompt
- เพิ่ม `projectName` สำหรับเก็บชื่อโปรเจ็ค
- เพิ่ม `designPreferences` object ที่ประกอบด้วย:
  - `designStyle`: สไตล์การออกแบบรวม (modern-minimalist, classic-elegant, colorful-playful, professional-corporate, creative-artistic, luxury-premium, casual-friendly)

### 2. ปรับปรุงการสร้างคำถามให้อิงจากข้อมูลที่ขาดหายไป
- เปลี่ยนจากการใช้คำถามที่เซ็ทไว้เป็นการสร้างคำถามตาม `missingElements`
- เพิ่ม `priorityQuestions` ใน `questionStrategy`
- เพิ่ม `priority` field ใน `Question` interface (high/medium/low)

### 3. อัปเดต Types และ Interfaces
- เพิ่มฟิลด์ใหม่ใน `EnhancedAnalysis`
- เพิ่มฟิลด์ใหม่ใน `Question`
- อัปเดต `WebsiteConfig` ให้รองรับข้อมูลการออกแบบที่ครบถ้วน

### 4. ปรับปรุง API Response
- เพิ่มข้อมูลการออกแบบใน `generateFinalOutput`
- รองรับการสร้างคำถามแบบ adaptive ตามข้อมูลที่ขาดหายไป

## ไฟล์ที่แก้ไข

1. `src/app/api/openaiInfoGath/route.ts`
   - ปรับปรุง system prompt
   - เพิ่มการสร้างคำถามตาม missingElements
   - อัปเดต final output generation

2. `src/types/openaiQuestion/route.ts`
   - เพิ่มฟิลด์ใหม่ใน interfaces
   - รองรับข้อมูลการออกแบบ

3. `src/hooks/inforGath/useOpenAIInfoGathering.ts`
   - เพิ่ม `generateQuestions` method
   - รองรับการสร้างคำถามแบบ adaptive

4. `src/hooks/inforGath/useInfoGatheringFlow.ts`
   - เปลี่ยนจากการใช้คำถามที่เซ็ทไว้เป็นการใช้ API
   - ปรับปรุง fallback questions ให้อิงจากข้อมูลที่ขาดหายไป

## ผลลัพธ์ที่คาดหวัง

1. ระบบจะสามารถวิเคราะห์และเก็บข้อมูลการออกแบบได้ครบถ้วน
2. คำถามจะถูกสร้างขึ้นตามข้อมูลที่ขาดหายไปจริงๆ ไม่ใช่คำถามทั่วไป
3. ผลลัพธ์สุดท้ายจะมีข้อมูลการออกแบบที่ละเอียดมากขึ้น
4. ประสบการณ์ผู้ใช้จะดีขึ้นเพราะคำถามจะตรงกับความต้องการจริง
5. การออกแบบจะรวม theme, color, style เป็นหัวข้อเดียว ทำให้ง่ายต่อการเข้าใจและเลือก
