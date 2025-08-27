# การใช้งาน sandPackConverter.ts กับ react.json

## ภาพรวม

`sandPackConverter.ts` ได้รับการปรับปรุงให้รองรับโครงสร้างของไฟล์ `react.json` ที่มีรูปแบบแตกต่างจาก `test.json` เดิม

## โครงสร้างของ react.json

ไฟล์ `react.json` มีโครงสร้างดังนี้:

```json
{
  "projectStructure": null,
  "files": [
    {
      "path": "package.json",
      "content": "เนื้อหาของไฟล์...",
      "type": "config",
      "language": "json"
    },
    {
      "path": "src/App.tsx",
      "content": "เนื้อหาของไฟล์...",
      "type": "page",
      "language": "typescript"
    }
  ]
}
```

## ฟังก์ชันที่รองรับ react.json

### 1. `createReactSandpackProps()`

ฟังก์ชันหลักสำหรับสร้าง Sandpack props จาก react.json

```typescript
import { createReactSandpackProps } from '@/utils/sandPackConverter';
import reactJsonData from './test/react.json';

const sandpackProps = createReactSandpackProps(reactJsonData, {
  template: 'react',
  theme: 'dark',
  showNavigator: true,
  showTabs: true,
  showLineNumbers: true,
  showInlineErrors: true,
  wrapContent: true,
  editorHeight: 600,
  autorun: true
});

// ใช้กับ Sandpack component
<Sandpack {...sandpackProps} />
```

### 2. `convertReactJsonToSandpackFiles()`

แปลง react.json เป็นรูปแบบไฟล์ที่ Sandpack ต้องการ

```typescript
import { convertReactJsonToSandpackFiles } from '@/utils/sandPackConverter';

const sandpackFiles = convertReactJsonToSandpackFiles(reactJsonData);
console.log(sandpackFiles.files); // { "package.json": "...", "src/App.tsx": "..." }
```

### 3. `validateReactJsonStructure()`

ตรวจสอบว่า JSON มีโครงสร้างที่ถูกต้อง

```typescript
import { validateReactJsonStructure } from '@/utils/sandPackConverter';

const isValid = validateReactJsonStructure(reactJsonData);
if (isValid) {
  console.log('โครงสร้าง JSON ถูกต้อง');
} else {
  console.log('โครงสร้าง JSON ไม่ถูกต้อง');
}
```

### 4. `convertReactJsonStringToSandpackFiles()`

แปลง JSON string เป็น Sandpack files

```typescript
import { convertReactJsonStringToSandpackFiles } from '@/utils/sandPackConverter';

const jsonString = '{"files": [{"path": "index.html", "content": "<!DOCTYPE html>..."}]}';
const files = convertReactJsonStringToSandpackFiles(jsonString);
```

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: การใช้งานพื้นฐาน

```typescript
'use client';

import React from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { createReactSandpackProps } from '@/utils/sandPackConverter';
import reactJsonData from './test/react.json';

const ReactPreview: React.FC = () => {
  const sandpackProps = createReactSandpackProps(reactJsonData, {
    template: 'react',
    theme: 'dark',
    editorHeight: 600
  });

  return (
    <div>
      <h2>React Project Preview</h2>
      <Sandpack {...sandpackProps} />
    </div>
  );
};

export default ReactPreview;
```

### ตัวอย่างที่ 2: การใช้งานแบบ Interactive

```typescript
'use client';

import React, { useState } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { createReactSandpackProps } from '@/utils/sandPackConverter';
import reactJsonData from './test/react.json';

const InteractivePreview: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [template, setTemplate] = useState<'react' | 'nextjs' | 'vanilla'>('react');

  const sandpackProps = createReactSandpackProps(reactJsonData, {
    template,
    theme,
    showNavigator: true,
    showTabs: true
  });

  return (
    <div>
      <div className="controls">
        <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
          <option value="dark">Dark Theme</option>
          <option value="light">Light Theme</option>
        </select>
        <select value={template} onChange={(e) => setTemplate(e.target.value as any)}>
          <option value="react">React</option>
          <option value="nextjs">Next.js</option>
          <option value="vanilla">Vanilla</option>
        </select>
      </div>
      <Sandpack {...sandpackProps} />
    </div>
  );
};
```

### ตัวอย่างที่ 3: การตรวจสอบและแปลงข้อมูล

```typescript
import { 
  validateReactJsonStructure, 
  convertReactJsonToSandpackFiles 
} from '@/utils/sandPackConverter';

const processReactJson = (jsonData: any) => {
  // ตรวจสอบโครงสร้าง
  if (!validateReactJsonStructure(jsonData)) {
    throw new Error('Invalid React JSON structure');
  }

  // แปลงเป็น Sandpack files
  const sandpackFiles = convertReactJsonToSandpackFiles(jsonData);
  
  // แสดงจำนวนไฟล์
  console.log(`จำนวนไฟล์: ${Object.keys(sandpackFiles.files).length}`);
  
  // แสดงรายชื่อไฟล์
  console.log('รายชื่อไฟล์:', Object.keys(sandpackFiles.files));
  
  return sandpackFiles;
};
```

## ข้อแตกต่างจาก test.json

| คุณสมบัติ | test.json | react.json |
|-----------|-----------|------------|
| โครงสร้าง | `projectStructure.files` เป็น object | `files` เป็น array |
| ข้อมูลไฟล์ | `{ path: { code, hidden } }` | `{ path, content, type, language }` |
| ฟังก์ชันที่ใช้ | `createSandpackProps()` | `createReactSandpackProps()` |
| การตรวจสอบ | `validateJsonStructure()` | `validateReactJsonStructure()` |

## การจัดการข้อผิดพลาด

```typescript
try {
  const sandpackProps = createReactSandpackProps(reactJsonData);
  // ใช้งาน sandpackProps
} catch (error) {
  console.error('เกิดข้อผิดพลาด:', error.message);
  // จัดการข้อผิดพลาด
}
```

## หมายเหตุ

- ฟังก์ชันเดิมสำหรับ `test.json` ยังคงใช้งานได้ตามปกติ
- ฟังก์ชันใหม่สำหรับ `react.json` มีคำว่า "React" นำหน้าเพื่อแยกแยะ
- ทั้งสองรูปแบบสามารถใช้งานร่วมกันในโปรเจคเดียวกันได้
