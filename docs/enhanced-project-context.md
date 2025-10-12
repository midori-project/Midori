# Enhanced Project Context

## 📖 Overview

Enhanced Project Context เป็นการขยายความสามารถของ Project Context เดิมให้รองรับ **Component-Based Architecture** แทนการใช้ Template-Based Architecture เพียงอย่างเดียว

## 🎯 Features

### 1. **Component-Based System**
- รองรับ Component Library
- มี Component Variants หลายแบบ
- Selection Algorithm อัจฉริยะ

### 2. **Theme Pack System**
- Color Palette ครบถ้วน (Primary, Secondary, Accent, Neutral, Semantic)
- Typography Configuration
- Spacing, Border Radius, Shadows
- Animations และ Responsive

### 3. **Blueprint System**
- Layout Templates (Onepager, Multipage, Catalog, Schedule, Dashboard)
- Slot Configuration
- Rules (Tone, SEO, Accessibility, Performance)

### 4. **PageSpec (SSOT)**
- Single Source of Truth สำหรับ website structure
- รวม domain, theme, blueprint, และ slots
- รองรับ versioning

### 5. **Migration Support**
- แปลง Legacy Template-Based → Component-Based
- Backward Compatibility
- Validation และ Backup

### 6. **Quality Metrics**
- Accessibility Score
- Performance Score
- SEO Score
- User Experience Score

## 🚀 Usage

### Create Enhanced Project Context

```typescript
import { EnhancedProjectContextStore } from '@/midori/agents/orchestrator/stores/enhancedProjectContextStore';

const store = EnhancedProjectContextStore.getInstance();

const context = await store.createEnhancedProjectContext({
  projectId: 'project_001',
  projectName: 'ร้านอาหารญี่ปุ่น',
  businessCategory: 'restaurant',
  userInput: 'สร้างเว็บไซต์ร้านอาหารญี่ปุ่น โทนอุ่น',
  themePack: restaurantTheme,
  blueprint: onepagerBlueprint,
  componentSelection: componentSelection,
  migrationStatus: 'migrated'
});
```

### Get Enhanced Project Context

```typescript
const context = await store.getEnhancedProjectContext('project_001');

console.log('Theme:', context.themePack?.name);
console.log('Blueprint:', context.blueprint?.name);
console.log('Components:', context.componentSelection?.selectedComponents);
```

### Update Enhanced Project Context

```typescript
await store.updateEnhancedProjectContext({
  projectId: 'project_001',
  themePack: newTheme,
  quality: updatedQuality
});
```

### Migrate Legacy Project

```typescript
const result = await store.migrateToComponentBased('project_001', {
  preserveLegacyData: true,
  validateAfterMigration: true,
  createBackup: true,
  dryRun: false
});

if (result.success) {
  console.log('Migration successful!');
}
```

## 📊 Data Structure

### EnhancedProjectContextData

```typescript
interface EnhancedProjectContextData extends ProjectContextData {
  // Component-based fields
  componentLibrary?: ComponentLibraryRef;
  themePack?: ThemePack;
  blueprint?: Blueprint;
  layout?: LayoutConfig;
  componentSelection?: ComponentSelection;
  
  // PageSpec (SSOT)
  pageSpec?: PageSpec;
  
  // Migration support
  migrationStatus: 'legacy' | 'migrated' | 'hybrid';
  legacyData?: LegacyTemplateData;
  
  // Version control
  version: string;
  schemaVersion: string;
  
  // Quality metrics
  quality?: QualityMetrics;
}
```

### ThemePack

```typescript
interface ThemePack {
  id: string;
  name: string;
  description: string;
  colorPalette: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  animations: AnimationConfig;
  responsive: ResponsiveConfig;
  metadata: ThemeMetadata;
}
```

### Blueprint

```typescript
interface Blueprint {
  id: string;
  name: string;
  description: string;
  type: 'onepager' | 'multipage' | 'catalog' | 'schedule' | 'dashboard';
  slots: {
    header: SlotConfig;
    hero: SlotConfig;
    sections: SectionSlotConfig;
    footer: SlotConfig;
  };
  rules: BlueprintRules;
  metadata: BlueprintMetadata;
}
```

### ComponentSelection

```typescript
interface ComponentSelection {
  selectedComponents: SelectedComponent[];
  selectionCriteria: SelectionCriteria;
  score: number;
  alternatives?: AlternativeSelection[];
}
```

## 🔄 Migration Flow

```
Legacy Project Context
         ↓
   Create Backup
         ↓
Convert to Component-Based
         ↓
    Validate
         ↓
      Save
         ↓
Enhanced Project Context
```

## 📈 Quality Metrics

Enhanced Project Context รวม quality metrics 4 ด้าน:

1. **Accessibility**: alt text, aria labels, keyboard navigation, color contrast
2. **Performance**: load time, FCP, LCP, CLS
3. **SEO**: meta tags, structured data, sitemap
4. **User Experience**: navigation, readability, mobile responsiveness, visual hierarchy

## 🎨 Theme Pack Examples

### Warm Japanese (Restaurant)
- Primary: Orange (#F97316)
- Secondary: Red (#EF4444)
- Accent: Yellow (#F59E0B)

### Cool Minimal (Portfolio)
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Accent: Indigo (#6366F1)

### Professional Healthcare
- Primary: Green (#10B981)
- Secondary: Blue (#3B82F6)
- Accent: Teal (#14B8A6)

## 🏗️ Blueprint Types

### 1. Onepager
- Single page layout
- Sections: Header, Hero, Sections (3-8), Footer
- Best for: Restaurant, Portfolio, Landing Page

### 2. Multipage
- Multiple pages
- Navigation between pages
- Best for: E-commerce, Corporate Website

### 3. Catalog
- Product/Item listing
- Filtering and search
- Best for: E-commerce, Directory

### 4. Schedule
- Time-based content
- Calendar/Timeline view
- Best for: Cinema, Events, Booking

### 5. Dashboard
- Data visualization
- Charts and metrics
- Best for: Analytics, Admin Panel

## 🔧 Configuration

### Database Schema

Enhanced Project Context data จะถูกบันทึกใน `frontendV2Data` field ของ `ProjectContext` table:

```prisma
model ProjectContext {
  id                    String   @id @default(cuid())
  projectId             String   @unique
  // ... existing fields ...
  frontendV2Data        Json?    // Enhanced Project Context data
}
```

### Cache Configuration

```typescript
private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

## 📝 Best Practices

1. **Always use EnhancedProjectContextStore** แทนการเรียก Service โดยตรง
2. **Validate data** ก่อน save
3. **Create backup** ก่อน migrate
4. **Use dry run** เมื่อทดสอบ migration
5. **Clear cache** เมื่อมี manual updates
6. **Monitor quality metrics** เพื่อปรับปรุงคุณภาพ

## 🐛 Troubleshooting

### Migration Failed
- ตรวจสอบ legacy data format
- ใช้ `dryRun: true` เพื่อทดสอบ
- ดู error logs

### Cache Issues
- เรียก `clearCache(projectId)` เพื่อ clear cache
- ตรวจสอบ CACHE_TTL setting

### Validation Errors
- ตรวจสอบ required fields
- ตรวจสอบ data types
- ดู validation summary

## 🔮 Future Improvements

- [ ] A/B Testing System
- [ ] Analytics Integration
- [ ] Version Control (Git-like)
- [ ] Component Recommendation AI
- [ ] Auto Theme Generator
- [ ] Blueprint Generator
- [ ] Quality Score Auto-improvement

## 📚 Related Documentation

- [Component Library System](./component-library.md) (Coming Soon)
- [Theme Pack System](./theme-pack-system.md) (Coming Soon)
- [Blueprint System](./blueprint-system.md) (Coming Soon)
- [Migration Guide](./migration-guide.md) (Coming Soon)

## 🤝 Contributing

ถ้าต้องการเพิ่ม features ใหม่:

1. สร้าง types ใน `enhancedProjectContext.ts`
2. เพิ่ม methods ใน `EnhancedProjectContextService`
3. อัปเดต `EnhancedProjectContextStore`
4. เพิ่ม tests
5. อัปเดต documentation

## 📞 Support

ติดปัญหา? ติดต่อ:
- GitHub Issues
- Team Chat
- Email: dev@midori.com

