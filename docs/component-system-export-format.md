# Component System Export Format Standardization

## Summary

ปรับปรุงระบบ Component Base ให้สร้างโครงสร้างไฟล์ออกมาในรูปแบบมาตรฐานที่เข้ากันได้กับ `test-cafe-complete.json` และระบบ API อื่นๆ

## Problems Identified

### 1. โครงสร้างไฟล์ที่ไม่ตรงกัน
- ไฟล์ `exportedJson.json` ที่สร้างจากระบบมี wrapper object ที่ไม่จำเป็น
- Format ไม่ตรงกับ reference file (`test-cafe-complete.json`)
- ทำให้ parser และ API consumer ต้องจัดการกรณีพิเศษ

### Before (ผิด):
```json
{
  "exportedJson": {
    "files": [...],
    "projectStructure": {...}
  },
  "blocksGenerated": [...],
  "businessCategory": "...",
  "metadata": {...}
}
```

### After (ถูกต้อง):
```json
{
  "projectStructure": {
    "name": "food-delivery-table-reservation",
    "type": "vite-react-typescript",
    "description": "Food delivery and table reservation app..."
  },
  "files": [
    {
      "path": "package.json",
      "content": "...",
      "type": "config",
      "language": "json"
    },
    ...
  ]
}
```

## Solutions Implemented

### 1. Updated `buildExportedJson()` Function
**File:** `src/midori/agents/frontend-v2/services/persistence-service.ts`

**Changes:**
- ลบ wrapper object ออก
- เพิ่ม file type mapping ที่ละเอียดขึ้น
- ปรับปรุง language detection
- Handle content ที่เป็น object ให้แปลงเป็น string

```typescript
function buildExportedJson(result: ComponentResultV2, filesToPersist: Array<any>) {
  // Return format matching test-cafe-complete.json (no wrapper)
  return { 
    projectStructure: {
      name: string;
      type: string;
      description: string;
    }, 
    files: Array<{
      path: string;
      content: string;
      type: string;
      language: string;
    }>
  };
}
```

### 2. Enhanced File Type Detection

| File | Type | Language | Reason |
|------|------|----------|--------|
| `package.json` | config | json | Package configuration |
| `tsconfig.json` | config | json | TypeScript configuration |
| `index.html` | config | html | Entry HTML file |
| `vite.config.ts` | config | typescript | Build tool config |
| `tailwind.config.js` | config | javascript | Styling config |
| `src/main.tsx` | page | typescript | App entry point |
| `src/App.tsx` | page | typescript | Root component |
| `src/pages/*` | page | typescript | Page components |
| `src/components/*` | component | typescript | UI components |
| `*.css` | style | css | Stylesheets |

### 3. Updated Test Files
**File:** `src/components/preview/test/exportedJson.json`

ปรับโครงสร้างให้ตรงกับ `test-cafe-complete.json`:
- ย้าย `projectStructure` ไปด้านบน
- แบน `files` array
- ลบ nested structures และ metadata ที่ไม่จำเป็น

## Data Flow

```
┌─────────────────────────────┐
│  ComponentAdapter           │
│  (component-adapter.ts)     │
└──────────┬──────────────────┘
           │ 1. Generate components
           │ 2. Render to files
           ↓
┌─────────────────────────────┐
│  ProjectStructureGenerator  │
│  (project-structure-gen.ts) │
└──────────┬──────────────────┘
           │ 3. Create project structure
           │    { projectStructure, files }
           ↓
┌─────────────────────────────┐
│  persistFrontendV2Result    │
│  (persistence-service.ts)   │
└──────────┬──────────────────┘
           │ 4. buildExportedJson()
           │    → Standard format
           ↓
┌─────────────────────────────┐
│  Database (Prisma)          │
│  • Snapshot.templateData    │
│    .exportedJson            │
│  • ProjectContext           │
│    .frontendV2Data          │
└─────────────────────────────┘
```

## Database Storage

### Snapshot Table:
```typescript
{
  id: string;
  projectId: string;
  label: string;
  files: Array<{path, type, content}>;
  templateData: {
    businessCategory: string;
    blocksGenerated: string[];
    aiContentGenerated: boolean;
    projectStructure: {...};
    exportedJson: {              // ← Standard format
      projectStructure: {...};
      files: [...];
    };
    exportFormatVersion: "v1";
  }
}
```

### ProjectContext Table:
```typescript
{
  projectId: string;
  frontendV2Data: {
    result: {...};
    performance: {...};
    metadata: {...};
    files: [...];
    exportedJson: {              // ← Standard format
      projectStructure: {...};
      files: [...];
    };
    exportFormatVersion: "v1";
  }
}
```

## Benefits

### 1. **Standardization**
- ✅ เข้ากันได้กับ external APIs
- ✅ ง่ายต่อการ parse และ validate
- ✅ ลด complexity ในการ consume data

### 2. **Type Safety**
- ✅ Clear type definitions
- ✅ Predictable structure
- ✅ Better IDE support

### 3. **Maintainability**
- ✅ Single source of truth for format
- ✅ Easy to extend
- ✅ Better documentation

### 4. **Performance**
- ✅ Flatter structure = faster parsing
- ✅ Less memory overhead
- ✅ Better database indexing

## API Usage

### Generate Project:
```typescript
const task: FrontendTaskV2 = {
  taskId: '123',
  taskType: 'generate_website',
  businessCategory: 'restaurant',
  keywords: ['ร้านอาหาร', 'เจได'],
  projectId: 'my-project-id'
};

const result = await componentAdapter.generateFrontend(task);
// result has correct format already
```

### Retrieve from Database:
```typescript
const snapshot = await prisma.snapshot.findUnique({
  where: { id: snapshotId }
});

const exportedJson = snapshot.templateData.exportedJson;
// { projectStructure: {...}, files: [...] }

// Use directly with preview system
await createPreview(exportedJson);
```

### API Response:
```typescript
// GET /api/projects/:id/export
{
  success: true,
  data: {
    projectStructure: {
      name: "my-restaurant-app",
      type: "vite-react-typescript",
      description: "Restaurant website..."
    },
    files: [
      {
        path: "package.json",
        content: "{...}",
        type: "config",
        language: "json"
      },
      ...
    ]
  }
}
```

## Testing

### Manual Test:
```bash
# Generate a new project
npm run test:component-system

# Check export format in database
npm run db:check-export-format

# Verify against reference
npm run test:export-format-validation
```

### Unit Tests:
```typescript
// tests/export-format.test.ts
describe('Export Format', () => {
  it('should match test-cafe-complete format', () => {
    const exported = buildExportedJson(result, files);
    expect(exported).toHaveProperty('projectStructure');
    expect(exported).toHaveProperty('files');
    expect(exported).not.toHaveProperty('exportedJson');
  });
});
```

## Migration Guide

### For Existing Code:

**Before:**
```typescript
const data = snapshot.templateData.exportedJson.exportedJson;
const files = data.files;
```

**After:**
```typescript
const data = snapshot.templateData.exportedJson;
const files = data.files;
```

### For API Consumers:

**Before:**
```typescript
const response = await fetch('/api/projects/export');
const wrapper = await response.json();
const project = wrapper.exportedJson;
```

**After:**
```typescript
const response = await fetch('/api/projects/export');
const project = await response.json();
// Directly use project.projectStructure and project.files
```

## Version Control

- **Format Version**: `v1`
- **Field**: `exportFormatVersion: "v1"`
- **Stored In**: `Snapshot.templateData.exportFormatVersion`

Future versions can be added without breaking existing data:
```typescript
if (exportFormatVersion === 'v1') {
  // Use v1 parser
} else if (exportFormatVersion === 'v2') {
  // Use v2 parser
}
```

## Related Documentation

- [Component Library System](./component-library-system.md)
- [Blueprint System](./blueprint-system.md)
- [Template System Migration](./migration-to-enhanced-only.md)
- [Project Structure Generator](../src/midori/agents/frontend-v2/template-system/project-structure-generator/README.md)

## Files Modified

1. ✅ `src/midori/agents/frontend-v2/services/persistence-service.ts`
2. ✅ `src/components/preview/test/exportedJson.json`
3. ✅ `docs/component-system-export-format.md` (this file)
4. ✅ `src/midori/agents/frontend-v2/docs/export-format-update.md`

## Next Steps

1. ✅ Update export format function
2. ✅ Update test files
3. ✅ Create documentation
4. ⏳ Update API endpoints to use new format
5. ⏳ Add validation schema
6. ⏳ Create migration scripts for old data
7. ⏳ Update frontend components to consume new format

---

**Date**: 2025-10-10  
**Status**: ✅ Implemented  
**Version**: v1.0.0  
**Author**: Midori AI Development Team

