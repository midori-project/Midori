# 🎨 Shadcn/UI Integration ใน Midori

## ภาพรวม

Midori ใช้ **shadcn/ui** เป็น component library หลักสำหรับสร้าง UI components ในระบบ no-code web generator

## เหตุผลที่เลือก shadcn/ui

### 1. **ความสอดคล้องกับสถาปัตยกรรมระบบ**
- Midori เป็น **no-code web generator** ที่ต้องสร้าง UI components หลายแบบ
- shadcn/ui ให้ **component library ที่สมบูรณ์** สำหรับสร้าง dashboard, forms, และ admin interfaces
- **Template system** ของ Midori ต้องการ UI components ที่ **consistent และ customizable**

### 2. **Tailwind CSS Integration**
- Midori ใช้ **Tailwind CSS** เป็น CSS framework หลัก
- shadcn/ui **ออกแบบมาสำหรับ Tailwind CSS** โดยเฉพาะ
- **class-variance-authority** และ **tailwind-merge** ใน dependencies แสดงว่ามีการใช้ advanced Tailwind patterns

### 3. **Developer Experience**
- shadcn/ui ให้ **copy-paste components** แทนการติดตั้ง package หนัก
- **TypeScript support** ครบถ้วน
- **Customizable** ตาม design system ของโปรเจกต์

### 4. **Template Management Requirements**
หน้า Template Management ต้องการ:
- **Card components** สำหรับแสดง template gallery
- **Tabs** สำหรับแยก upload/gallery/preview
- **Forms** (Input, Textarea, Label) สำหรับ JSON upload
- **Alert** สำหรับแสดง error messages
- **Badge** สำหรับแสดง template status

### 5. **Radix UI Foundation**
- shadcn/ui ใช้ **Radix UI** เป็น base
- ให้ **accessibility** และ **keyboard navigation** ที่ดี
- **Headless components** ที่ flexible

## การติดตั้งและใช้งาน

### 1. Configuration
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

### 2. การติดตั้ง Components
```bash
# ติดตั้ง components ที่จำเป็นสำหรับ Template Management
npx shadcn-ui@latest add card button input label textarea badge tabs alert

# หรือติดตั้งทั้งหมดพร้อมกัน
npx shadcn-ui@latest add card button input label textarea badge tabs alert
```

### 3. การใช้งานในโค้ด
```tsx
// ตัวอย่างการใช้งานใน Template Management
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
```

## Dependencies ที่เกี่ยวข้อง

### Core Dependencies
```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-popover": "^1.1.15", 
  "@radix-ui/react-tooltip": "^1.2.8",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.541.0",
  "tailwind-merge": "^3.3.1"
}
```

### Tailwind CSS
```json
{
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "tw-animate-css": "^1.3.7"
}
```

## ไฟล์ที่ใช้ shadcn/ui Components

### 1. Template Management
- `src/app/dashboard/templates/page.tsx` - หน้าจัดการ templates
- ใช้: Card, Button, Input, Label, Textarea, Badge, Tabs, Alert

### 2. Gallery และ Community
- `src/app/home/gallery.tsx` - หน้า gallery
- `src/app/(app)/(projects)/projects/workspace/WorkspacePagination.tsx`
- `src/app/(app)/(projects)/projects/community/CommunityPagination.tsx`

## การแก้ไขปัญหาที่พบบ่อย

### 1. Import Errors
```
Error: Cannot resolve module '@/components/ui/card'
```
**วิธีแก้**: ติดตั้ง component ที่ขาดหาย
```bash
npx shadcn-ui@latest add card
```

### 2. Styling Issues
- ตรวจสอบว่า Tailwind CSS configuration ถูกต้อง
- ตรวจสอบว่า `globals.css` มี CSS variables ของ shadcn/ui

### 3. TypeScript Errors
- ตรวจสอบว่า `@types/react` และ `@types/react-dom` เป็นเวอร์ชันที่รองรับ
- ตรวจสอบว่า TypeScript configuration ถูกต้อง

## Best Practices

### 1. การ Customize Components
- ใช้ `class-variance-authority` สำหรับสร้าง variants
- ใช้ `tailwind-merge` สำหรับ merge classes

### 2. การจัดการ Icons
- ใช้ `lucide-react` สำหรับ icons
- กำหนด `iconLibrary: "lucide"` ใน `components.json`

### 3. การจัดการ Theming
- ใช้ CSS variables สำหรับ colors
- กำหนด `cssVariables: true` ใน configuration

## สรุป

shadcn/ui ถูกเลือกเป็น component library หลักของ Midori เพราะ:

1. **เหมาะกับ no-code generator** ที่ต้องการ UI components หลากหลาย
2. **Tailwind CSS integration** ที่สมบูรณ์
3. **Developer experience** ที่ดี
4. **Accessibility** และ **TypeScript support**
5. **Customizable** ตามความต้องการของ Midori

การใช้งาน shadcn/ui ช่วยให้ Midori สามารถสร้าง UI ที่สวยงาม, consistent, และ maintainable ได้อย่างมีประสิทธิภาพ
