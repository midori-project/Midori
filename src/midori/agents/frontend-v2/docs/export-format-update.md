# Export Format Update - Component System

## Overview
Updated the Component System to export project structure in a standardized format compatible with `test-cafe-complete.json`.

## Changes Made

### 1. Updated `buildExportedJson()` in `persistence-service.ts`

**Location:** `src/midori/agents/frontend-v2/services/persistence-service.ts`

**Changes:**
- Removed wrapper object layer
- Changed format from:
  ```json
  {
    "exportedJson": {
      "files": [...],
      "projectStructure": {...}
    }
  }
  ```
  
- To standard format:
  ```json
  {
    "projectStructure": {...},
    "files": [...]
  }
  ```

**Key Improvements:**
- ✅ Added `package.json` and `tsconfig.json` to config type mapping
- ✅ Enhanced type detection for components in `src/components/`
- ✅ Better handling of file content (string vs object)
- ✅ More accurate file type classification

### 2. Export Format Structure

The new format follows this structure:

```typescript
{
  projectStructure: {
    name: string;           // Project name (e.g., "food-delivery-table-reservation")
    type: string;           // Project type (e.g., "vite-react-typescript")
    description: string;    // Project description
  },
  files: Array<{
    path: string;           // File path (e.g., "src/App.tsx")
    content: string;        // File content as string
    type: string;           // File type: "config" | "page" | "component" | "style"
    language: string;       // Language: "typescript" | "javascript" | "css" | "html" | "json"
  }>
}
```

### 3. File Type Mapping

| File Path Pattern | Type | Language |
|-------------------|------|----------|
| `package.json` | config | json |
| `tsconfig.json` | config | json |
| `index.html` | config | html |
| `vite.config.ts` | config | typescript |
| `tailwind.config.js` | config | javascript |
| `postcss.config.cjs` | config | javascript |
| `src/main.tsx` | page | typescript |
| `src/App.tsx` | page | typescript |
| `src/pages/**` | page | typescript |
| `src/components/**` | component | typescript |
| `*.css` | style | css |

### 4. Benefits

1. **Standardized Format**: Compatible with existing tools and APIs
2. **Better Type Safety**: Clear file type classification
3. **Easier Parsing**: Flat structure without unnecessary nesting
4. **Database Efficiency**: Stored directly in `Snapshot.templateData.exportedJson`
5. **API Compatibility**: Can be used directly with preview systems

## Usage Example

### In Component Adapter:
```typescript
const result = await componentAdapter.generateFrontend(task);
// result.projectStructure already has correct format
```

### In Persistence Service:
```typescript
await persistFrontendV2Result(result, task, {
  projectId: 'my-project-id',
  userId: 'user-id'
});
// Automatically creates exportedJson in correct format
```

### From Database:
```typescript
const snapshot = await prisma.snapshot.findUnique({
  where: { id: snapshotId }
});

const exportedJson = snapshot.templateData.exportedJson;
// { projectStructure: {...}, files: [...] }
```

## Migration

No migration needed for existing data. The new format will be applied to:
- All new generations
- Updated projects
- New snapshots

Old snapshots with the previous format will continue to work but should be regenerated for the new format.

## Testing

Test the export format:
```bash
npm test -- export-format.test.ts
```

## Related Files

- `src/midori/agents/frontend-v2/services/persistence-service.ts` - Main export logic
- `src/midori/agents/frontend-v2/template-system/project-structure-generator/index.ts` - Project structure generation
- `src/midori/agents/frontend-v2/adapters/component-adapter.ts` - Component generation flow
- `src/components/preview/test/test-cafe-complete.json` - Reference format
- `src/components/preview/test/exportedJson.json` - Updated test file

## Version

- **Previous Format**: v0 (wrapped format)
- **Current Format**: v1 (flat format)
- **exportFormatVersion**: "v1"

---

**Last Updated**: 2025-10-10
**Author**: Midori AI Team

