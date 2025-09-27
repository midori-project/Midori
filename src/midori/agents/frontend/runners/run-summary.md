# Frontend Agent Runner - สรุปการทำงาน

## ภาพรวม
Frontend Agent Runner (`run.ts`) เป็นระบบหลักที่จัดการการพัฒนาฟรอนต์เอนด์ด้วยแนวทางแบบ Template-based โดยเน้นการเลือกและปรับแต่งเทมเพลตจากฐานข้อมูล พร้อมสร้าง Preview ผ่าน Daytona

## โครงสร้างหลัก

### 1. Interfaces และ Types
- **FrontendTask**: โครงสร้างงานที่รับเข้ามา
- **ComponentResult**: ผลลัพธ์ที่ส่งกลับ
- **Style Preferences**: การตั้งค่าสไตล์และธีม

### 2. ฟังก์ชันหลัก

#### Template Selection & Processing
```typescript
processTemplateSelection(task, startTime)
```
- รับข้อมูลจาก Project Context (SSOT)
- แปลง projectType เป็น template category
- ดึงเทมเพลตจากฐานข้อมูล
- ปรับแต่งเทมเพลตตามความต้องการ
- สร้าง Daytona preview
- อัพเดท Project Context กลับสู่ฐานข้อมูล

#### Template Customization
```typescript
customizeTemplate(template, customizations)
```
- สร้าง enhanced customizations
- ตรวจสอบ placeholder ในไฟล์
- เติม placeholder ด้วย AI
- ประมวลผลไฟล์เทมเพลต
- สร้าง combined JSON structure

#### File Processing
```typescript
sortSourceFilesByPriority(sourceFiles)
```
- เรียงลำดับไฟล์ตาม priority
- รองรับการเพิ่มเทมเพลตใหม่ในอนาคต
- แบ่งประเภท: config → entry → styles → layout → components → pages → features → utils → types → assets

## การจัดการ Placeholder

### ตรวจสอบ Placeholder
- `<tw/>` - Tailwind classes
- `<text/>` - ข้อความ
- `<img/>` - รูปภาพ
- `<data>` - ข้อมูล

### การเติม Placeholder ด้วย AI
```typescript
fillPlaceholdersWithAI(content, customizations)
```
- ใช้ LLM Adapter
- สร้าง prompt เฉพาะสำหรับแต่ละไฟล์
- เติมเนื้อหาไทยที่เหมาะสมกับบริบท
- แก้ไข syntax ให้ถูกต้อง

## การจัดการ Styling

### Color Scheme
```typescript
generateColorScheme(customizations)
```
- สร้างชุดสีตาม theme (dark/light)
- รองรับ colorTone (cool/warm)
- ใช้สีที่กำหนดเอง

### Wording Customization
```typescript
generateWording(customizations)
```
- สร้างเนื้อหาภาษาไทย
- ปรับตามประเภทธุรกิจ (e_commerce, หมูปิ้ง)
- รองรับ mood และ style

## Daytona Preview Integration

### การสร้าง Project Structure
```typescript
generateCompleteProjectStructure(template, customizations, projectContext)
```
- ใช้เฉพาะไฟล์เทมเพลต
- สร้างโครงสร้างโปรเจกต์ที่สมบูรณ์
- รองรับ fallback structure

### การส่งไป Daytona
```typescript
sendToDaytonaPreview(projectFiles, projectId)
```
- เรียก API `/api/preview/daytona`
- ส่งไฟล์ทั้งหมดไปสร้าง preview
- รับ sandboxId และ previewUrl กลับมา

## การจัดการฐานข้อมูล

### บันทึกไฟล์ที่ปรับแต่งแล้ว
```typescript
saveCustomizedFilesToDatabase(projectId, customizedFiles)
```
- ใช้ Prisma upsert
- บันทึกไฟล์แต่ละไฟล์
- อัพเดท project options

### สร้าง Snapshot
```typescript
createTemplateSnapshot(projectId, customizedFiles, previewInfo)
```
- สร้าง version control
- เก็บข้อมูลการเปลี่ยนแปลง
- รองรับการ rollback

## การแก้ไข Syntax

### JSX Syntax Fixing
```typescript
fixJSXSyntax(content)
```
- แก้ไข Thai text ที่ใช้เป็น attribute names
- แก้ไข Route elements ที่เสียหาย
- ทำความสะอาด component attributes

### Validation & Fixing
```typescript
validateAndFixFileContent(content, filePath)
```
- แก้ไข placeholder ที่เหลือ
- แก้ไข JavaScript syntax
- ตรวจสอบ JSX syntax
- แก้ไข React patterns

## การทำงานแบบ SSOT (Single Source of Truth)

### Project Context Integration
- รับข้อมูลจาก Orchestrator
- ใช้ projectId เป็น primary key
- อัพเดทข้อมูลกลับสู่ฐานข้อมูล
- รักษาความสอดคล้องของข้อมูล

### Style Preferences
- รับจาก Orchestrator
- ไม่ hardcode ค่าใดๆ
- ใช้เป็น default theme = 'dark'

## การจัดการ Error และ Fallback

### Template Fallback
- หาเทมเพลตที่เหมาะสมที่สุด
- ใช้ mock template เป็นทางเลือกสุดท้าย
- บันทึก reason สำหรับ fallback

### Error Handling
- Try-catch ทุกฟังก์ชันสำคัญ
- Log ข้อผิดพลาดอย่างละเอียด
- ส่งกลับ error information ใน ComponentResult

## การทำงานแบบ Hybrid

### Task Routing
```typescript
if (taskType === 'select_template') {
  return processTemplateSelection()
} else if (taskType === 'customize_template') {
  return processTemplateCustomization()
} else if (taskType === 'create_component') {
  return processComponentCreation()
}
```

### Component Creation
- สร้าง component ใหม่ตาม specifications
- รองรับ functional และ class components
- บูรณาการกับเทมเพลตที่มีอยู่

## การ Logging และ Debugging

### Detailed Logging
- Log ทุกขั้นตอนการประมวลผล
- แสดงข้อมูลไฟล์ก่อนและหลังการแก้ไข
- Track การเปลี่ยนแปลง placeholder
- Monitor การเรียก API

### Performance Tracking
- วัดเวลาการทำงาน
- นับจำนวนไฟล์ที่ประมวลผล
- ตรวจสอบขนาดไฟล์

## สรุป
Frontend Agent Runner เป็นระบบที่ซับซ้อนและครบครัน ทำงานร่วมกับฐานข้อมูล เทมเพลต AI และ Daytona เพื่อสร้างเว็บไซต์ที่สมบูรณ์แบบ โดยเน้นการใช้งานจริงและการบำรุงรักษาที่ง่าย
