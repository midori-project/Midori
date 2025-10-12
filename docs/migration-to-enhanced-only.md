# Migration Plan: Enhanced Context Only

## 📋 **สิ่งที่ต้องทำก่อนเปลี่ยนเป็น Enhanced อย่างเดียว**

ก่อนที่จะลบ Legacy Context ออกทั้งหมด เราต้องตรวจสอบและทำสิ่งเหล่านี้ให้เสร็จก่อน:

---

## ✅ **Phase 1: ตรวจสอบ Dependencies (เสร็จแล้ว)**

### 1.1 Database Schema
- ✅ `ProjectContext.frontendV2Data` field มีอยู่แล้ว (Json)
- ✅ รองรับการบันทึก Enhanced data

### 1.2 Services
- ✅ `EnhancedProjectContextService` - บันทึก/ดึงข้อมูล Enhanced
- ✅ `ProjectContextOrchestratorService` - wrapper methods
- ✅ `EnhancedContextAdapter` - detect business category
- ✅ `ProjectInitializationHelper` - smart initialization

### 1.3 Types
- ✅ `EnhancedProjectContextData` - interface ครบถ้วน
- ✅ `ComponentLibrary`, `ThemePack`, `Blueprint` - types พร้อม

---

## ⚠️ **Phase 2: Features ที่ยังขาด**

### 2.1 ThemePack Generator
**Status:** ❌ **ยังไม่มี**

**ต้องการ:**
```typescript
// ตอนนี้มีแค่ placeholder
const themePack = this.generateDefaultThemePack(input.businessCategory);

// ต้องทำให้สร้าง ThemePack จริงๆ จาก:
// 1. Business category
// 2. Keywords (เช่น "สีส้ม", "โทนอุ่น")
// 3. Style preferences
```

**ต้อง Implement:**
```typescript
class ThemePackGenerator {
  static generate(input: {
    businessCategory: string;
    keywords: string[];
    style?: string;
    tone?: string;
  }): ThemePack {
    // 1. ตรวจหา color จาก keywords
    const colors = this.detectColors(input.keywords);
    
    // 2. สร้าง palette ตาม category
    const palette = this.createPalette(input.businessCategory, colors);
    
    // 3. สร้าง typography
    const typography = this.createTypography(input.businessCategory);
    
    // 4. สร้าง spacing & effects
    const spacing = this.createSpacing();
    const effects = this.createEffects();
    
    return {
      id: `theme_${Date.now()}`,
      name: `${input.businessCategory} Theme`,
      category: input.businessCategory,
      colorPalette: palette,
      typography,
      spacing,
      effects,
      // ...
    };
  }
}
```

### 2.2 Blueprint System
**Status:** ❌ **ยังไม่มี**

**ต้องการ:**
```typescript
// ตอนนี้มีแค่ placeholder
const blueprint = this.initializeDefaultBlueprint();

// ต้องทำให้เลือก Blueprint ตาม:
// 1. Business category
// 2. Complexity
// 3. Features ที่ต้องการ
```

**ต้อง Implement:**
```typescript
class BlueprintSelector {
  static select(input: {
    businessCategory: string;
    features: string[];
    complexity: 'simple' | 'moderate' | 'complex';
  }): Blueprint {
    // 1. เลือก layout structure
    const layout = this.selectLayout(input);
    
    // 2. กำหนด sections
    const sections = this.defineSections(input);
    
    // 3. Component requirements
    const components = this.defineComponents(input);
    
    return {
      id: 'blueprint_onepager_v1',
      name: 'One Page Website',
      type: 'onepager',
      layout,
      sections,
      components,
      // ...
    };
  }
}
```

### 2.3 Component Selection Logic
**Status:** ⚠️ **มีแล้วแต่ต้องปรับปรุง**

**ปัญหา:**
- `ComponentSelector` มีอยู่แล้ว แต่ยัง basic
- ยังไม่ได้ integrate กับ Blueprint

**ต้อง Improve:**
```typescript
class ComponentSelector {
  // ✅ มีอยู่แล้ว
  async selectComponents(context: SelectionContext): Promise<ComponentSelection> {
    // ...
  }
  
  // ❌ ยังไม่มี - ต้องเพิ่ม
  async selectComponentsFromBlueprint(
    blueprint: Blueprint,
    context: SelectionContext
  ): Promise<ComponentSelection> {
    // เลือก components ตาม blueprint requirements
    const selections: SelectedComponent[] = [];
    
    for (const requirement of blueprint.components) {
      const component = await this.selectComponent({
        ...context,
        category: requirement.category,
        required: requirement.required
      });
      
      selections.push(component);
    }
    
    return {
      selectedComponents: selections,
      // ...
    };
  }
}
```

### 2.4 Component Rendering
**Status:** ❌ **ยังไม่มี**

**ปัญหา:**
```typescript
// ใน component-adapter.ts
private async renderComponents(...): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  
  // TODO: Implement actual component rendering
  // สำหรับตอนนี้ return empty object
  // จะ implement ในขั้นตอนต่อไป
  
  return files;  // ❌ ว่างเปล่า!
}
```

**ต้อง Implement:**
```typescript
class ComponentRenderer {
  static render(
    component: Component,
    variant: ComponentVariant,
    props: Record<string, any>
  ): string {
    // 1. ดึง template
    let template = variant.template;
    
    // 2. Replace placeholders
    for (const [key, value] of Object.entries(props)) {
      template = template.replace(`{${key}}`, String(value));
    }
    
    // 3. Handle special cases (arrays, objects, etc.)
    template = this.handleArrays(template, props);
    template = this.handleConditionals(template, props);
    
    return template;
  }
}
```

### 2.5 PageSpec System
**Status:** ❌ **ยังไม่มี**

**ต้องการ:**
```typescript
interface PageSpec {
  pages: Array<{
    id: string;
    route: string;
    title: string;
    sections: Array<{
      id: string;
      componentId: string;
      variantId: string;
      props: Record<string, any>;
      order: number;
    }>;
  }>;
}

class PageSpecBuilder {
  static build(
    blueprint: Blueprint,
    componentSelection: ComponentSelection
  ): PageSpec {
    // สร้าง page structure จาก blueprint และ components
  }
}
```

---

## 📊 **Phase 3: Migration Tools**

### 3.1 Data Migration Script
**Status:** ❌ **ยังไม่มี**

**ต้องการ:**
```typescript
// scripts/migrate-to-enhanced.ts
async function migrateAllProjects() {
  const legacyProjects = await prisma.projectContext.findMany({
    where: {
      frontendV2Data: null  // Legacy projects
    }
  });
  
  for (const project of legacyProjects) {
    // แปลง Legacy → Enhanced
    const enhanced = await convertLegacyToEnhanced(project);
    
    // บันทึกกลับ
    await EnhancedProjectContextService.saveEnhancedData(
      project.projectId,
      enhanced
    );
  }
}
```

### 3.2 Validation Tool
**Status:** ❌ **ยังไม่มี**

**ต้องการ:**
```typescript
async function validateEnhancedContext(
  projectId: string
): Promise<ValidationResult> {
  // ตรวจสอบว่า Enhanced Context ถูกต้องครบถ้วน
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Check required fields
  if (!context.componentLibrary) errors.push('Missing componentLibrary');
  if (!context.themePack) errors.push('Missing themePack');
  
  // 2. Check data consistency
  // 3. Check completeness
  
  return { errors, warnings, isValid: errors.length === 0 };
}
```

---

## 🔄 **Phase 4: Update Integration Points**

### 4.1 Frontend-V2 Agent
**Status:** ⚠️ **บางส่วนทำแล้ว**

**ต้องทำ:**
- ✅ มี `ComponentAdapter` แล้ว
- ✅ มี `UnifiedRunner` แล้ว
- ❌ ยังไม่ได้ integrate กับ `ProjectStructureGenerator` จริงๆ
- ❌ ยังไม่มีการ render components จริง

**ต้องแก้:**
```typescript
// frontend-v2/runners/unified-run.ts
// เปลี่ยนจาก default Template-Based
→ เป็น default Component-Based

function determineAdapter(...): boolean {
  // Before: return false (Template-Based)
  // After: return true (Component-Based)
  
  return true;  // ✅ Default to Component-Based
}
```

### 4.2 OrchestratorAI
**Status:** ✅ **ทำแล้ว**

- ✅ ใช้ `ProjectInitializationHelper`
- ✅ Auto-detect business category
- ✅ สร้าง Enhanced Context

### 4.3 API Endpoints
**Status:** ⚠️ **ต้องตรวจสอบ**

**ต้องตรวจสอบ:**
```typescript
// src/app/api/projects/[id]/route.ts
// ต้องรองรับ Enhanced Context
```

---

## 📝 **Phase 5: Documentation & Testing**

### 5.1 Documentation
- ❌ Developer Guide สำหรับ Enhanced Context
- ❌ API Documentation
- ❌ Migration Guide สำหรับ existing projects

### 5.2 Testing
- ❌ Unit Tests สำหรับ ThemePack Generator
- ❌ Unit Tests สำหรับ Blueprint Selector
- ❌ Integration Tests สำหรับ Component Rendering
- ❌ End-to-End Tests

---

## 🎯 **Summary: สิ่งที่ต้องทำก่อน Go Enhanced-Only**

| Feature | Status | Priority | Estimated Time |
|---------|--------|----------|----------------|
| **ThemePack Generator** | ❌ Not Started | 🔴 High | 4-6 hours |
| **Blueprint System** | ❌ Not Started | 🔴 High | 6-8 hours |
| **Component Rendering** | ❌ Not Started | 🔴 High | 8-10 hours |
| **PageSpec Builder** | ❌ Not Started | 🟡 Medium | 4-6 hours |
| **Component Selection (Improved)** | ⚠️ Partial | 🟡 Medium | 3-4 hours |
| **Migration Script** | ❌ Not Started | 🟡 Medium | 4-6 hours |
| **Validation Tool** | ❌ Not Started | 🟢 Low | 2-3 hours |
| **Documentation** | ❌ Not Started | 🟢 Low | 4-6 hours |
| **Testing** | ❌ Not Started | 🟡 Medium | 8-10 hours |

**Total Estimated Time:** **43-59 hours** (~5-7 working days)

---

## 🚀 **Recommended Action Plan**

### Step 1: Core Features (Week 1)
1. ✅ Implement ThemePack Generator
2. ✅ Implement Blueprint System
3. ✅ Implement Component Rendering

### Step 2: Integration (Week 2)
4. ✅ Improve Component Selection
5. ✅ Implement PageSpec Builder
6. ✅ Update Frontend-V2 to use Component-Based by default

### Step 3: Migration & Testing (Week 3)
7. ✅ Create Migration Script
8. ✅ Create Validation Tool
9. ✅ Write Tests
10. ✅ Test with real projects

### Step 4: Go Live
11. ✅ Migrate existing projects
12. ✅ Remove Legacy Code
13. ✅ Update Documentation
14. ✅ Deploy

---

## ⚠️ **Risks & Mitigation**

### Risk 1: Breaking Existing Projects
**Mitigation:**
- Keep Legacy support until all projects migrated
- Test migration thoroughly
- Have rollback plan

### Risk 2: Incomplete Features
**Mitigation:**
- Implement core features first
- Use fallbacks for missing features
- Gradual rollout

### Risk 3: Performance Issues
**Mitigation:**
- Cache component registry
- Optimize rendering
- Monitor performance

---

## 💡 **Recommendation**

**ตอนนี้ยัง ไม่แนะนำ ให้เปลี่ยนเป็น Enhanced อย่างเดียว** เพราะ:

1. ❌ Component Rendering ยังไม่มี (ไม่สามารถสร้าง code ได้จริง)
2. ❌ ThemePack Generator ยังไม่มี (ไม่มี theme)
3. ❌ Blueprint System ยังไม่มี (ไม่รู้จะ layout ยังไง)

**แนะนำให้:**
1. ✅ **ทำ Step 1 ก่อน** (ThemePack + Blueprint + Rendering)
2. ✅ **ทดสอบว่าสร้างเว็บไซต์ได้จริง**
3. ✅ **แล้วค่อยเปลี่ยนเป็น Enhanced อย่างเดียว**

หรือถ้าต้องการเปลี่ยนเลยตอนนี้:
- ✅ สามารถเปลี่ยนได้ แต่จะยังสร้างเว็บไซต์ไม่ได้
- ✅ ต้องใช้ Template System แทนชั่วคราว
- ✅ หรือ implement features ที่ขาดทีละส่วน

คุณต้องการทำยังไงครับ? 🤔

