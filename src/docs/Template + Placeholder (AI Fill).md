# แผนงาน: Template + Placeholder (AI Fill) สำหรับ Midori

## เป้าหมาย
- เปลี่ยนจากระบบ **template + slot** → **template + placeholder** ใน Midori
- ให้ AI เติมทุกค่า (class, wording, imagery) ลงใน template ได้อัตโนมัติ
- ผลลัพธ์ต้อง **build ผ่าน**, **preview ได้ทันที**, และ **สอดคล้อง theme**
- **เข้ากับระบบ Midori ปัจจุบัน**: UiTemplate, Frontend Agent, OrchestratorAI

---

## Placeholder Spec
- `<tw/>` → Tailwind classes (ไม่ใช้ arbitrary `[]`, จำกัด ≤40 utilities/element)
- `<text/>` → ข้อความ (ภาษาไทย/อังกฤษตาม tone, จำกัดความยาว)
- `<img/>` → URL รูป deterministic (จาก imagery+seed) + alt ภาษาไทย
- (optional) `<data key="..."/>` → สำหรับข้อมูลโครงสร้าง เช่น เมนู

---

## Workflow (ปรับให้เข้ากับ Midori)

1. **เตรียม Template**
   - แปลงทุก className → `<tw/>`
   - แปลงข้อความ → `<text/>`
   - แปลง `img src` → `<img/>` และ alt เป็น `<text/>`
   - ค่าข้อมูลเชิงตัวเลข (price/qty) → ใช้ `0` เพื่อให้ TypeScript build ได้
   - **อัพโหลดผ่าน API `/api/template`** → เก็บใน `UiTemplate.sourceFiles`

2. **Theme Input (จาก Project.options)**
   - ผู้ใช้ส่งสตริงผ่าน chat หรือ UI เช่น  
     ```
     modern cozy; primary:sky-600; accent:amber-400; radius:xl; elevation:lg; grid:3; header:underlined; font:inter; imagery:"coffee latte art"; tone:thai-casual
     ```
   - **บันทึกลง `Project.options.theme`** ผ่าน OrchestratorAI

3. **AI Normalize (ใน Frontend Agent)**
   - Prompt: `theme-normalize.md`
   - Output: JSON `{ normalized, issues, ok }`
   - **รวมใน `generateColorScheme()` และ `generateStyling()`**

4. **AI Fill Classes (ใน `processTemplateFiles()`)**
   - Prompt: `fill-classes.md`
   - เติม `<tw/>` เป็น Tailwind classes จริง
   - กติกา:
     - CTA: `bg-{primary} text-white hover:opacity-90 transition`
     - Card: `bg-white shadow-{elevation} rounded-{radius} p-6`
     - Grid desktop: `lg:grid-cols-{grid}`

5. **AI Fill Content (ใน `applyTemplatePlaceholders()`)**
   - Prompt: `fill-content.md`
   - เติม `<text/>` และ `<img/>` ตาม tone/brand/imagery
   - **ใช้ `generateWording()` และ `generateContentFromOrchestrator()`**
   - ภาพใช้ Unsplash deterministic เช่น  
     ```
     https://source.unsplash.com/600x450/?coffee%20latte%20art&sig=cafedelight
     ```

6. **Fallback & Safety**
   - สคริปต์ sanitize className (≤32 char, ≤40 ต่อ element)
   - Tailwind safelist ครอบคลุมสี/spacing ที่ AI อาจใช้
   - **ใช้ fallback data จาก `generateMockFiles()`**

7. **ตรวจรับ**
   - Build ผ่าน (`npm run build`)
   - CTA มี `bg-{primary}`
   - Grid desktop = `lg:grid-cols-{grid}`
   - ไม่มี className ผิดรูป
   - รูปมี alt ภาษาไทย
   - Lighthouse หน้าแรก: Performance ≥90, A11y ≥90

---

## ระบบฐานข้อมูล (ปรับปรุง ERD)

### เพิ่มใน UiTemplate
```prisma
model UiTemplate {
  // ... existing fields
  placeholderConfig Json?  // เก็บการตั้งค่า placeholder
  themeMapping     Json?  // เก็บ mapping ระหว่าง theme กับ placeholder
}

model UiTemplateVersion {
  // ... existing fields
  placeholderData Json?  // เก็บข้อมูล placeholder ที่ถูกเติมแล้ว
  fillHistory     Json?  // เก็บประวัติการเติม placeholder
}
```

### เพิ่มใน Project
```prisma
model Project {
  // ... existing fields
  templateTheme Json?  // เก็บ theme settings สำหรับ template
}
```

---

## Frontend Agent Integration

### ปรับ `customizeTemplate()` ใน `run.ts`
```typescript
async function customizeTemplate(template: any, customizations: any): Promise<any> {
  // 1. ตรวจสอบ placeholder ใน template files
  const hasPlaceholders = checkTemplatePlaceholders(template.files);
  
  if (hasPlaceholders) {
    // 2. เติม placeholder ด้วย AI
    const filledFiles = await fillTemplatePlaceholders(template.files, customizations);
    template.files = filledFiles;
  }
  
  // 3. ดำเนินการต่อตามเดิม
  return processTemplateFiles(template.files, enhancedCustomizations);
}
```

### เพิ่มฟังก์ชันใหม่
```typescript
async function fillTemplatePlaceholders(files: any[], customizations: any): Promise<any[]> {
  // ใช้ LLM เติม placeholder
  // รองรับ <tw/>, <text/>, <img/>, <data/>
}
```

---

## UI สำหรับ Template Management

### หน้าสำหรับแสดงตัวอย่างและอัพโหลดเทมเพลท
- **Route**: `/dashboard/templates`
- **Features**:
  - แสดงรายการ templates ที่มี
  - อัพโหลด template ใหม่ (รองรับ placeholder)
  - Preview template ก่อน/หลังเติม placeholder
  - จัดการ theme settings
  - Test template กับ theme ต่างๆ

### Components ใหม่
- `TemplateUploader` - อัพโหลดและตรวจสอบ template
- `PlaceholderPreview` - แสดงผลก่อน/หลังเติม placeholder
- `ThemeSelector` - เลือกและกำหนด theme
- `TemplateGallery` - แสดงรายการ templates

---

## Checklist (ปรับให้เข้ากับ Midori)
- [x] ปรับปรุง ERD schema สำหรับ placeholder support
- [x] เพิ่ม placeholder config ใน UiTemplate
- [x] ปรับ `customizeTemplate()` ใน Frontend Agent
- [x] เพิ่มฟังก์ชัน `fillTemplatePlaceholders()`
- [x] สร้าง UI สำหรับ template management
- [x] สร้าง API endpoint สำหรับ placeholder filling
- [x] สร้างตัวอย่าง JSON template
- [x] เขียนคู่มือการใช้งาน
- [ ] เพิ่ม Tailwind safelist
- [ ] เขียนสคริปต์ sanitize class
- [ ] เตรียม prompt: normalize / fill-classes / fill-content
- [ ] ตั้งค่า deterministic imagery (Unsplash + seed)
- [ ] ใส่ fallback data (menu, gallery)
- [ ] ทดสอบ build + preview
- [ ] ตรวจ Lighthouse score

---

## Commit/PR Guideline
- `feat(template): add placeholder support to UiTemplate schema`
- `feat(frontend-agent): integrate placeholder filling in customizeTemplate`
- `feat(ui): add template management dashboard`
- `feat(ai-fill): tailwind classes + thai wording + deterministic imagery`
- `feat(guardrails): safelist + sanitize prebuild`
- `chore(seo/a11y): meta description + aria labels`

---

## ตอบคำถามและคำแนะนำเพิ่มเติม

### ✅ **คำตอบจากผู้ใช้**
1. **Template Upload Format**: อัพโหลดเป็น **JSON** เพื่อให้ขึ้นตารางได้เลย
2. **Placeholder Validation**: **ต้องการ** และต้องการหน้าตัวอย่างที่ใช้ AI เติมแล้ว (สามารถใช้ API จริงได้เลย QUESTION_API_KEY)
3. **Theme Presets**: **ยังไม่ต้องการ**
4. **Performance**: ไม่ต้องการ caching พิเศษ
5. **Version Control**: **ไม่ต้องการ** จะไปควบคุมที่ user version

### 🎯 **คำแนะนำเพิ่มเติม**

#### 1. **JSON Template Format**
```json
{
  "template": {
    "name": "Coffee Shop Template",
    "category": "Restaurant", 
    "version": "1.0.0",
    "files": [
      {
        "path": "src/components/Hero.tsx",
        "content": "import React from 'react';\nconst Hero = () => {\n  return (\n    <div className=\"<tw/>\">\n      <h1><text/></h1>\n      <p><text/></p>\n      <img src=\"<img/>\" alt=\"<text/>\" />\n    </div>\n  );\n};\nexport default Hero;"
      }
    ],
    "placeholders": {
      "theme": "modern cozy; primary:sky-600; accent:amber-400",
      "imagery": "coffee latte art",
      "tone": "thai-casual"
    }
  }
}
```

#### 2. **Template Upload & Preview System**
- **Upload**: Drag & drop JSON file หรือ paste JSON content
- **Validation**: ตรวจสอบ JSON structure และ placeholder syntax
- **Preview**: แสดงตัวอย่างก่อน/หลัง AI เติม placeholder
- **Live Demo**: ใช้ QUESTION_API_KEY เพื่อทดสอบ AI filling จริง

#### 3. **Database Schema (ปรับปรุง)**
```prisma
model UiTemplate {
  // ... existing fields
  placeholderConfig Json?     // เก็บการตั้งค่า placeholder
  themeMapping     Json?     // เก็บ mapping ระหว่าง theme กับ placeholder
  jsonSource       Json?     // เก็บ JSON source ที่อัพโหลดมา
  previewUrl       String?   // URL สำหรับ preview
  demoData         Json?     // ข้อมูลสำหรับ demo
}

model UiTemplateVersion {
  // ... existing fields
  placeholderData Json?      // เก็บข้อมูล placeholder ที่ถูกเติมแล้ว
  fillHistory     Json?      // เก็บประวัติการเติม placeholder
  aiGenerated     Json?      // เก็บผลลัพธ์จาก AI
  demoPreview     Json?      // ข้อมูลสำหรับ demo preview
}
```

#### 4. **API Integration**
```typescript
// ใช้ QUESTION_API_KEY สำหรับ AI filling
const fillWithAI = async (template: any, theme: string) => {
  const response = await fetch('/api/questionAi', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${QUESTION_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template,
      theme,
      projectId: 'demo-project'
    })
  });
  return response.json();
};
```

#### 5. **UI Components ที่แนะนำ**
- `JsonTemplateUploader` - อัพโหลดและ validate JSON
- `PlaceholderValidator` - ตรวจสอบ placeholder syntax
- `AIFillDemo` - แสดงตัวอย่าง AI filling
- `TemplatePreview` - Preview template ก่อน/หลัง
- `ThemeTester` - ทดสอบ template กับ theme ต่างๆ

#### 6. **Performance Optimization**
- **Lazy Loading**: โหลด template preview เมื่อต้องการ
- **Caching**: Cache AI results ใน database
- **Batch Processing**: ประมวลผล template หลายตัวพร้อมกัน
- **CDN**: ใช้ CDN สำหรับ template assets

#### 7. **Security & Validation**
- **JSON Schema**: ใช้ JSON Schema validate template structure
- **Placeholder Sanitization**: ตรวจสอบ placeholder syntax
- **AI Rate Limiting**: จำกัดการเรียก AI API
- **Content Security**: ตรวจสอบ content ที่ AI สร้าง

#### 8. **User Experience**
- **Template Gallery**: แสดง template พร้อม preview
- **Search & Filter**: ค้นหา template ตาม category, theme
- **Favorites**: เก็บ template ที่ชอบ
- **Share**: แชร์ template กับผู้อื่น

#### 9. **Analytics & Monitoring**
- **Usage Stats**: ติดตามการใช้ template
- **AI Performance**: วัดประสิทธิภาพ AI filling
- **Error Tracking**: ติดตาม error และ bug
- **User Feedback**: เก็บ feedback จากผู้ใช้

#### 10. **Future Enhancements**
- **Template Marketplace**: ตลาด template
- **Custom Themes**: ให้ผู้ใช้สร้าง theme เอง
- **Collaboration**: ทำงานร่วมกันบน template
- **Export Options**: ส่งออก template เป็นรูปแบบต่างๆ

