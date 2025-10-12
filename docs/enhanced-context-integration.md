# Enhanced Context Integration Guide

## 📖 Overview

เอกสารนี้อธิบายการ integrate Enhanced Project Context เข้ากับระบบเดิม (OrchestratorAI)

## 🎯 Architecture

### Before (Legacy System)
```
User Input → OrchestratorAI → ProjectContext (Template-Based)
                                      ↓
                              Frontend-V2 Agent
                                      ↓
                              Template Rendering
```

### After (Enhanced System)
```
User Input → OrchestratorAI → EnhancedContextAdapter
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
         EnhancedProjectContext              LegacyProjectContext
         (Component-Based)                   (Template-Based)
                    ↓                                   ↓
         Component Library                    Template System
                    ↓                                   ↓
         Component Rendering                  Template Rendering
```

## 🚀 Quick Start

### สร้าง Project ใหม่

```typescript
import { ProjectInitializationHelper } from '@/midori/agents/orchestrator/helpers/projectInitializationHelper';

// สร้าง project แบบ Smart (เลือก Enhanced/Legacy อัตโนมัติ)
const projectContext = await ProjectInitializationHelper.initializeSmartProject({
  projectId: 'project_001',
  projectName: 'ร้านอาหารญี่ปุ่น',
  userInput: 'สร้างเว็บไซต์ร้านอาหารญี่ปุ่น โทนสีอุ่น',
  useEnhanced: true, // Optional: บังคับใช้ Enhanced
  businessCategory: 'restaurant' // Optional: ระบุ category
});
```

### ดึง Project Context

```typescript
// ดึง project context (รองรับทั้ง Enhanced/Legacy)
const projectContext = await ProjectInitializationHelper.getSmartProject('project_001');

// ตรวจสอบว่าเป็น Enhanced หรือ Legacy
if (EnhancedContextAdapter.isEnhancedContext(projectContext)) {
  console.log('✅ Enhanced Context');
  console.log('Theme:', projectContext.themePack?.name);
  console.log('Blueprint:', projectContext.blueprint?.name);
} else {
  console.log('✅ Legacy Context');
  console.log('Type:', projectContext.projectType);
}
```

## 🔧 Components

### 1. EnhancedContextAdapter

Adapter สำหรับเชื่อม Legacy System กับ Enhanced System

```typescript
import { EnhancedContextAdapter } from '@/midori/agents/orchestrator/adapters/enhancedContextAdapter';

// สร้าง project
const context = await EnhancedContextAdapter.createProject(
  'project_001',
  'ร้านอาหาร',
  'สร้างเว็บไซต์ร้านอาหารญี่ปุ่น',
  {
    useEnhanced: true,
    businessCategory: 'restaurant'
  }
);

// ดึง project
const context = await EnhancedContextAdapter.getProject('project_001');

// ตรวจสอบประเภท
if (EnhancedContextAdapter.isEnhancedContext(context)) {
  // Enhanced Context
}
```

### 2. ProjectInitializationHelper

Helper functions สำหรับจัดการ project initialization

```typescript
import { ProjectInitializationHelper } from '@/midori/agents/orchestrator/helpers/projectInitializationHelper';

// Extract project name
const name = ProjectInitializationHelper.extractProjectName(
  'สร้างเว็บไซต์ร้านอาหารญี่ปุ่น'
);
// Result: "ร้านอาหารญี่ปุ่น"

// Extract keywords
const keywords = ProjectInitializationHelper.extractKeywords(
  'สร้างเว็บไซต์ร้านอาหาร สีฟ้า ทันสมัย มีเมนู'
);
// Result: ["ฟ้า", "ทันสมัย", "เมนู"]
```

### 3. ProjectContextOrchestratorService

Service สำหรับจัดการ Project Context (รองรับทั้ง Enhanced และ Legacy)

```typescript
import { ProjectContextOrchestratorService } from '@/midori/agents/orchestrator/services/projectContextOrchestratorService';

// สร้าง Enhanced Project
const enhancedContext = await ProjectContextOrchestratorService.initializeEnhancedProject(
  'project_001',
  'ร้านอาหาร',
  'restaurant',
  'สร้างเว็บไซต์ร้านอาหาร'
);

// ดึง Enhanced Project
const context = await ProjectContextOrchestratorService.getEnhancedProjectContext('project_001');
```

## 📊 Decision Logic

### เมื่อไหร่ใช้ Enhanced Context?

System จะใช้ Enhanced Context เมื่อ:

1. **User บังคับใช้** (`useEnhanced: true`)
2. **User Input มี keywords พิเศษ**:
   - "component"
   - "modern", "ทันสมัย", "โมเดิร์น"
   - "responsive"
   - "beautiful", "สวย"

### Business Category Detection

System จะตรวจหา business category อัตโนมัติจาก keywords:

- **Restaurant**: ร้านอาหาร, restaurant, อาหาร, food, เมนู, menu
- **E-commerce**: ร้านค้า, shop, store, ขาย, สินค้า, product, หนังสือ
- **Portfolio**: portfolio, ผลงาน, creative, designer
- **Healthcare**: clinic, hospital, คลินิก, โรงพยาบาล, doctor, แพทย์
- **Pharmacy**: pharmacy, drugstore, ร้านขายยา, ยา, เภสัช

## 🔄 Migration Path

### Legacy → Enhanced

```typescript
import { EnhancedProjectContextService } from '@/midori/agents/orchestrator/services/enhancedProjectContextService';

// Migrate existing project
const result = await EnhancedProjectContextService.migrateToComponentBased(
  'project_001',
  {
    preserveLegacyData: true,
    validateAfterMigration: true,
    createBackup: true,
    dryRun: false
  }
);

if (result.success) {
  console.log('✅ Migration successful');
}
```

## 🎯 Best Practices

### 1. ใช้ Smart Initialization

```typescript
// ✅ GOOD: ใช้ Smart initialization
const context = await ProjectInitializationHelper.initializeSmartProject({
  projectId: 'project_001',
  projectName: 'ร้านอาหาร',
  userInput: userInput
});

// ❌ BAD: เลือกเอง
const context = await ProjectContextService.createProjectContext({...});
```

### 2. ตรวจสอบประเภท Context

```typescript
// ✅ GOOD: ตรวจสอบก่อนใช้
if (EnhancedContextAdapter.isEnhancedContext(context)) {
  // ใช้ Enhanced features
} else {
  // ใช้ Legacy features
}

// ❌ BAD: สมมติเอาเอง
const theme = context.themePack.name; // อาจ error
```

### 3. Handle Errors

```typescript
// ✅ GOOD: Handle errors
try {
  const context = await ProjectInitializationHelper.initializeSmartProject({...});
} catch (error) {
  console.error('Failed to initialize project:', error);
  // Fallback to legacy
}

// ❌ BAD: ไม่ handle errors
const context = await ProjectInitializationHelper.initializeSmartProject({...});
```

## 🐛 Troubleshooting

### Project Not Found

```typescript
const context = await ProjectInitializationHelper.getSmartProject('project_001');
if (!context) {
  console.log('Project not found, creating new one...');
  const newContext = await ProjectInitializationHelper.initializeSmartProject({...});
}
```

### Migration Failed

```typescript
const result = await EnhancedProjectContextService.migrateToComponentBased('project_001');
if (!result.success) {
  console.error('Migration errors:', result.errors);
  console.error('Migration warnings:', result.warnings);
}
```

### Wrong Business Category

```typescript
// แก้ไข business category ภายหลัง
const context = await ProjectContextOrchestratorService.initializeEnhancedProject(
  'project_001',
  'ร้านอาหาร',
  'restaurant', // ✅ ระบุ category ที่ถูกต้อง
  userInput
);
```

## 📚 Related Documentation

- [Enhanced Project Context](./enhanced-project-context.md)
- [Component Library System](./component-library-system.md)
- [Migration Guide](./migration-guide.md) (Coming Soon)

## 🤝 Contributing

ถ้าต้องการเพิ่ม business categories ใหม่:

1. เพิ่ม detection logic ใน `EnhancedContextAdapter.detectBusinessCategory()`
2. เพิ่ม mapping ใน `EnhancedContextAdapter.mapCategoryToProjectType()`
3. Update documentation

## 📞 Support

ติดปัญหา? ติดต่อ:
- GitHub Issues
- Team Chat  
- Email: dev@midori.com

