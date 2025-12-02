# 🔗 Frontend-V2 Integration Guide

คู่มือการเชื่อมต่อระหว่าง Frontend-V2 Agent และ Project Context

## 📋 ภาพรวม

Frontend-V2 Agent ใช้ Template System ที่แตกต่างจาก Frontend Agent เก่า ทำให้ต้องมีการแปลงข้อมูลเพื่อให้สอดคล้องกับ Project Context structure

## 🏗️ Architecture

```
Frontend-V2 Agent
       ↓
ComponentResultV2
       ↓
FrontendV2ProjectContextMapper
       ↓
Project Context Data
       ↓
ProjectContextService
       ↓
Database (ProjectContext table)
```

## 🔧 Components

### 1. FrontendV2ProjectContextMapper

**หน้าที่:** แปลงข้อมูลจาก Frontend-V2 format เป็น Project Context format

```typescript
// ✅ ใช้งาน
const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(frontendResult);

// ✅ ผลลัพธ์
{
  frontendV2Data: FrontendV2ProjectData,
  components: ComponentStateData[],
  pages: PageStateData[],
  preview: PreviewData | null
}
```

### 2. Project Context Types

**FrontendV2ProjectData:**
```typescript
interface FrontendV2ProjectData {
  businessCategory: string;
  projectType: string;
  templateUsed: string;
  blocksGenerated: string[];
  aiContentGenerated: boolean;
  customizationsApplied: string[];
  overridesApplied: string[];
  files: FrontendV2FileData[];
  projectStructure?: FrontendV2ProjectStructure | null;
  preview?: FrontendV2PreviewData | null;
  performance: FrontendV2PerformanceData;
  validation: FrontendV2ValidationData;
  metadata: FrontendV2Metadata;
}
```

### 3. Database Schema

**ProjectContext table:**
```sql
ALTER TABLE "ProjectContext" 
ADD COLUMN "frontendV2Data" JSON;
```

## 🔄 Data Flow

### 1. Frontend-V2 Generation
```typescript
// Frontend-V2 สร้าง components, pages, preview
const frontendResult = await runFrontendAgentV2(task);
```

### 2. Mapping Process
```typescript
// แปลงข้อมูลเป็น Project Context format
const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(frontendResult);
```

### 3. Project Context Update
```typescript
// อัพเดต Project Context
await projectContextStore.updateProjectContext(projectId, {
  frontendV2Data: mappedData.frontendV2Data,
  components: mappedData.components,
  pages: mappedData.pages,
  preview: mappedData.preview,
  status: 'template_selected'
});
```

## 📊 Mapping Rules

### Components Mapping
```typescript
// Frontend-V2 files → Project Context components
{
  path: 'src/components/Hero.tsx',
  blockId: 'hero-basic',
  type: 'component'
}
↓
{
  componentId: 'hero-basic',
  name: 'Hero',
  type: 'hero',
  location: { page: 'home', section: 'main', position: 0 }
}
```

### Pages Mapping
```typescript
// Frontend-V2 project structure → Project Context pages
{
  path: 'src/pages/Home.tsx',
  content: 'Home page content'
}
↓
{
  pageId: 'home',
  name: 'Home',
  path: '/',
  type: 'home',
  components: ['hero-basic', 'navbar-basic']
}
```

### Preview Mapping
```typescript
// Frontend-V2 preview → Project Context preview
{
  url: 'https://preview.example.com',
  sandboxId: 'sandbox-123',
  status: 'ready'
}
↓
{
  sandboxId: 'sandbox-123',
  previewUrl: 'https://preview.example.com',
  status: 'running'
}
```

## 🧪 Testing

### Unit Tests
```typescript
describe('FrontendV2ProjectContextMapper', () => {
  it('should map files to components correctly', () => {
    const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(mockResult);
    expect(mappedData.components).toHaveLength(3);
    expect(mappedData.components[0].type).toBe('hero');
  });
});
```

### Integration Tests
```typescript
describe('Frontend-V2 Integration', () => {
  it('should update Project Context with Frontend-V2 data', async () => {
    const result = await runFrontendAgentV2(task);
    const updatedContext = await projectContextStore.updateProjectContext(projectId, updates);
    expect(updatedContext.frontendV2Data).toBeDefined();
  });
});
```

## 🚀 Usage Examples

### 1. Basic Integration
```typescript
// ใน OrchestratorAI
const frontendResult = taskResult.metadata.executionResult.results[0].result;
const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(frontendResult);

await projectContextStore.updateProjectContext(projectId, {
  frontendV2Data: mappedData.frontendV2Data,
  components: mappedData.components,
  pages: mappedData.pages,
  preview: mappedData.preview
});
```

### 2. Get Frontend-V2 Data
```typescript
// ดึงข้อมูล Frontend-V2 จาก Project Context
const frontendV2Data = await ProjectContextService.getFrontendV2Data(projectId);
console.log(frontendV2Data.files);
console.log(frontendV2Data.projectStructure);
```

### 3. Update Specific Data
```typescript
// อัพเดต components เท่านั้น
await ProjectContextService.updateFrontendV2Components(projectId, newComponents);

// อัพเดต preview เท่านั้น
await ProjectContextService.updateFrontendV2Preview(projectId, newPreview);
```

## 🔍 Troubleshooting

### Common Issues

1. **Mapping Errors**
   ```typescript
   // ❌ ผิด
   const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(null);
   
   // ✅ ถูก
   if (frontendResult) {
     const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(frontendResult);
   }
   ```

2. **Database Errors**
   ```typescript
   // ❌ ผิด
   await prisma.projectContext.update({
     where: { projectId },
     data: { frontendV2Data: frontendResult } // ไม่ได้ serialize
   });
   
   // ✅ ถูก
   await prisma.projectContext.update({
     where: { projectId },
     data: { frontendV2Data: JSON.parse(JSON.stringify(frontendResult)) }
   });
   ```

3. **Type Errors**
   ```typescript
   // ❌ ผิด
   const components: ComponentStateData[] = frontendResult.files;
   
   // ✅ ถูก
   const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(frontendResult);
   const components: ComponentStateData[] = mappedData.components;
   ```

## 📈 Performance Considerations

### 1. Caching
```typescript
// Cache mapped data เพื่อลดการประมวลผล
const cacheKey = `frontend-v2-${projectId}`;
const cachedData = cache.get(cacheKey);
if (cachedData) return cachedData;

const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(frontendResult);
cache.set(cacheKey, mappedData, 300000); // 5 minutes
```

### 2. Batch Updates
```typescript
// อัพเดตหลาย field พร้อมกัน
await projectContextStore.updateProjectContext(projectId, {
  frontendV2Data: mappedData.frontendV2Data,
  components: mappedData.components,
  pages: mappedData.pages,
  preview: mappedData.preview,
  status: 'template_selected'
});
```

## 🔮 Future Enhancements

### 1. Real-time Sync
```typescript
// Sync ข้อมูลแบบ real-time
projectContextSync.on('frontend-v2:update', (data) => {
  const mappedData = FrontendV2ProjectContextMapper.mapResultToProjectContext(data);
  projectContextStore.updateProjectContext(projectId, mappedData);
});
```

### 2. Incremental Updates
```typescript
// อัพเดตเฉพาะส่วนที่เปลี่ยนแปลง
const changes = detectChanges(oldData, newData);
if (changes.components) {
  await ProjectContextService.updateFrontendV2Components(projectId, changes.components);
}
```

### 3. Validation
```typescript
// ตรวจสอบความถูกต้องของข้อมูล
const validation = validateFrontendV2Data(frontendResult);
if (!validation.isValid) {
  throw new Error(`Invalid Frontend-V2 data: ${validation.errors.join(', ')}`);
}
```

## 📚 Related Documentation

- [Frontend-V2 Agent Guide](../../frontend-v2/README.md)
- [Project Context Types](../types/projectContext.ts)
- [Database Schema](../../../prisma/schema.prisma)
- [Migration Guide](../migrations/add-frontend-v2-support.sql)
