# JSON to Sandpack Converter Utility

Utility functions สำหรับแปลงไฟล์จาก `test.json` ให้เป็นรูปแบบที่ Sandpack ต้องการ

## การใช้งานพื้นฐาน

```typescript
import { convertEssentialFiles, createSandpackConfig } from '@/utils/jsonConverterSp';

// แปลงไฟล์หลัก
const files = convertEssentialFiles();

// สร้าง Sandpack configuration
const config = createSandpackConfig(files);

// ใช้กับ Sandpack
<Sandpack template="nextjs" {...config} />
```

## Functions ที่มีให้

### 1. `convertJsonToSandpackFiles()`
แปลงไฟล์ทั้งหมดจาก test.json

```typescript
const allFiles = convertJsonToSandpackFiles();
```

### 2. `convertEssentialFiles()`
แปลงเฉพาะไฟล์ที่จำเป็น (แนะนำสำหรับการใช้งานทั่วไป)

```typescript
const essentialFiles = convertEssentialFiles();
// รวม: package.json, layout.tsx, page.tsx, globals.css, page.module.css, next.config.js, tailwind.config.js
```

### 3. `convertFilesByType(type)`
แปลงไฟล์ตามประเภท

```typescript
const pages = convertFilesByType('page');        // หน้าเพจ
const components = convertFilesByType('component'); // คอมโพเนนต์
const styles = convertFilesByType('style');      // ไฟล์ CSS
const configs = convertFilesByType('config');    // ไฟล์ config
const utils = convertFilesByType('util');        // ไฟล์ utility
```

### 4. `convertFilesByPattern(pattern)`
แปลงไฟล์ตาม path pattern

```typescript
const appFiles = convertFilesByPattern('app/');     // ไฟล์ใน app directory
const cssFiles = convertFilesByPattern('.css');     // ไฟล์ CSS ทั้งหมด
const tsxFiles = convertFilesByPattern('.tsx');     // ไฟล์ TypeScript React
```

### 5. `convertCustomFiles(filterFn, pathTransform?)`
แปลงไฟล์แบบ custom

```typescript
// แปลงไฟล์ที่มีขนาดใหญ่กว่า 1000 characters
const largeFiles = convertCustomFiles(
  (file) => file.content.length > 1000
);

// แปลงไฟล์และเปลี่ยน path
const renamedFiles = convertCustomFiles(
  (file) => file.type === 'page',
  (path) => path.replace('app/', 'src/')
);
```

### 6. `validateSandpackFiles(files)`
ตรวจสอบความถูกต้องของไฟล์

```typescript
const files = convertEssentialFiles();
if (validateSandpackFiles(files)) {
  // ไฟล์ถูกต้อง
} else {
  // แสดงข้อผิดพลาด
}
```

### 7. `getFilesStats(files)`
แสดงข้อมูลสถิติ

```typescript
const files = convertEssentialFiles();
const stats = getFilesStats(files);
console.log(`Total files: ${stats.totalFiles}`);
console.log(`File types:`, stats.fileTypes);
console.log(`Total size: ${stats.totalSize} characters`);
```

### 8. `createSandpackConfig(files)`
สร้าง Sandpack configuration ที่สมบูรณ์

```typescript
const files = convertEssentialFiles();
const config = createSandpackConfig(files);

return (
  <Sandpack
    template="nextjs"
    theme="dark"
    {...config}
  />
);
```

## ตัวอย่างการใช้งานใน Component

```typescript
'use client';

import { Sandpack } from "@codesandbox/sandpack-react";
import { 
  convertEssentialFiles, 
  validateSandpackFiles, 
  getFilesStats,
  createSandpackConfig 
} from '@/utils/jsonConverterSp';

export default function MySandpackComponent() {
  const files = convertEssentialFiles();
  const isValid = validateSandpackFiles(files);
  const stats = getFilesStats(files);
  const config = createSandpackConfig(files);

  if (!isValid) {
    return <div>Error: Invalid files</div>;
  }

  return (
    <div>
      <div>Files: {stats.totalFiles}</div>
      <Sandpack template="nextjs" {...config} />
    </div>
  );
}
```

## ประโยชน์

1. **แก้ปัญหา Server Crash** - ไม่ต้อง import JSON โดยตรงใน client component
2. **Flexible** - สามารถเลือกแปลงไฟล์ตามต้องการ
3. **Type Safe** - มี TypeScript interfaces
4. **Performance** - สามารถเลือกแปลงเฉพาะไฟล์ที่จำเป็น
5. **Validation** - มีการตรวจสอบความถูกต้องของไฟล์
6. **Statistics** - แสดงข้อมูลสถิติของไฟล์

## หมายเหตุ

- ไฟล์ `test.json` ต้องมีโครงสร้างที่ถูกต้อง
- Language จะถูกแปลงอัตโนมัติ (typescript → tsx, javascript → jsx)
- ไฟล์ที่จำเป็นต้องมี: `package.json`, `app/page.tsx`
