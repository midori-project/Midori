# Component Library System

## 📖 Overview

Component Library System เป็นระบบจัดการ components แบบ **component-based architecture** ที่ให้ความยืดหยุ่นและหลากหลายกว่าการใช้ template แบบเดิม

## 🎯 Features

### 1. **Component Registry**
- Central registry สำหรับ components ทั้งหมด
- Indexing by category, tags
- Search capabilities
- Statistics & analytics

### 2. **Component Variants**
- หลาย variants ต่อ component
- แต่ละ variant มี style และ layout แตกต่างกัน
- Flexible customization

### 3. **Smart Component Selector**
- AI-powered selection algorithm
- Score-based ranking
- Context-aware selection
- Alternative suggestions

### 4. **Props Schema**
- Type-safe props definition
- Validation rules
- Default values
- Examples

## 🚀 Quick Start

### Initialize Component Library

```typescript
import { initializeComponentLibrary } from '@/midori/agents/frontend-v2/component-library';

// Initialize library (loads all components)
initializeComponentLibrary();
```

### Browse Components

```typescript
import { getComponentLibrary } from '@/midori/agents/frontend-v2/component-library';

const library = getComponentLibrary();

// Get all components
const all = library.getAllComponents();

// Get by category
const content = library.getComponentsByCategory('content');

// Get by tag
const heroes = library.getComponentsByTag('hero');

// Search
const results = library.searchComponents('visual');
```

### Smart Component Selection

```typescript
import { getComponentSelector } from '@/midori/agents/frontend-v2/component-library';

const selector = getComponentSelector();

const selection = await selector.selectComponents({
  businessCategory: 'restaurant',
  userInput: 'สร้างเว็บไซต์ร้านอาหารญี่ปุ่น โทนอุ่น',
  keywords: ['japanese', 'food', 'warm'],
  style: ['modern', 'warm'],
  tone: 'friendly',
  features: ['menu', 'reservation'],
  preferences: {
    colorScheme: 'warm',
    layoutStyle: 'modern'
  }
});

console.log('Selected:', selection.selectedComponents);
console.log('Score:', selection.totalScore);
console.log('Reasoning:', selection.reasoning);
```

## 📊 Component Structure

### ComponentDefinition

```typescript
interface ComponentDefinition {
  id: string;                           // Unique ID
  name: string;                         // Display name
  description: string;                  // Description
  category: string;                     // Category (layout, content, etc.)
  tags: string[];                       // Tags for search/filtering
  variants: ComponentVariant[];         // Component variants
  propsSchema: Record<string, PropDefinition>; // Props definition
  dependencies?: string[];              // Dependencies
  preview?: ComponentPreview;           // Preview assets
  metadata: ComponentMetadata;          // Metadata
}
```

### ComponentVariant

```typescript
interface ComponentVariant {
  id: string;                           // Variant ID
  name: string;                         // Variant name
  description: string;                  // Description
  style: string;                        // Style (modern, classic, etc.)
  layout: string;                       // Layout (grid, flex, etc.)
  template: string;                     // React component template
  previewImage?: string;                // Preview image
  tags: string[];                       // Tags
  metadata: VariantMetadata;            // Metadata
}
```

### PropDefinition

```typescript
interface PropDefinition {
  type: string;                         // Type (string, number, etc.)
  required: boolean;                    // Required?
  defaultValue?: any;                   // Default value
  description: string;                  // Description
  validation?: ValidationRule;          // Validation rules
  placeholder?: string;                 // Placeholder text
  examples?: any[];                     // Example values
}
```

## 🎨 Available Components

### Hero Components

#### hero-visual
- **Variants**: centered, left-image, minimal
- **Best for**: Landing pages, restaurants, portfolios
- **Props**: badge, heading, subheading, ctaLabel, secondaryCta, heroImage, heroImageAlt

```typescript
// Example usage
const heroComponent = library.getComponent('hero-visual');
const centeredVariant = library.getVariant('hero-visual', 'centered');
```

### Coming Soon
- Navbar Components
- Footer Components
- Menu Components
- About Components
- Contact Components
- Product Catalog Components
- etc.

## 🧮 Component Selection Algorithm

### Scoring Factors

1. **Domain Match (30%)**: Business category alignment
2. **Style Match (25%)**: Visual style compatibility
3. **Tone Match (20%)**: Brand tone alignment
4. **Feature Match (15%)**: Required features
5. **Popularity Bonus (5%)**: Usage statistics
6. **Performance Score (5%)**: Bundle size, dependencies

### Selection Process

```
1. Get all available components
    ↓
2. Score each component + variant
    ↓
3. Rank by total score
    ↓
4. Select best for each slot
    ↓
5. Generate alternatives
    ↓
6. Return ComponentSelection
```

## 📈 Usage Tracking

### Track Component Usage

```typescript
const library = getComponentLibrary();

// Track usage
library.trackUsage('hero-visual', 'centered');

// Get statistics
const stats = library.getStatistics();
console.log('Most Popular:', stats.mostPopular);
console.log('Most Used:', stats.mostUsed);
```

### Rate Components

```typescript
// Rate component
library.rateComponent('hero-visual', 5); // 5 stars

// Get rating
const component = library.getComponent('hero-visual');
console.log('Rating:', component.metadata.rating);
```

## 🔧 Advanced Usage

### Create Custom Component

```typescript
import { ComponentDefinition } from '@/midori/agents/frontend-v2/component-library';

const customComponent: ComponentDefinition = {
  id: 'custom-hero',
  name: 'Custom Hero',
  description: 'My custom hero component',
  category: 'content',
  tags: ['hero', 'custom'],
  variants: [
    {
      id: 'default',
      name: 'Default Variant',
      description: 'Default variant',
      style: 'modern',
      layout: 'centered',
      template: `/* React component code */`,
      tags: [],
      metadata: {
        version: '1.0.0',
        popularity: 0,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  ],
  propsSchema: {
    title: {
      type: 'string',
      required: true,
      description: 'Hero title',
      validation: { maxLength: 100 }
    }
  },
  metadata: {
    version: '1.0.0',
    author: 'Me',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    popularity: 0,
    rating: 0,
    downloads: 0,
    usageCount: 0
  }
};

// Register
library.registerComponent(customComponent);
```

### Add Variant to Existing Component

```typescript
import { ComponentVariant } from '@/midori/agents/frontend-v2/component-library';

const newVariant: ComponentVariant = {
  id: 'new-variant',
  name: 'New Variant',
  description: 'A new variant',
  style: 'modern',
  layout: 'grid',
  template: `/* React component code */`,
  tags: ['new'],
  metadata: {
    version: '1.0.0',
    popularity: 0,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

library.addVariant('hero-visual', newVariant);
```

### Export/Import Registry

```typescript
// Export registry as JSON
const json = library.exportRegistry();
fs.writeFileSync('registry.json', json);

// Import registry from JSON
const json = fs.readFileSync('registry.json', 'utf-8');
library.importRegistry(json);
```

## 🎯 Best Practices

1. **Use Smart Selection**: Let the algorithm pick components instead of manual selection
2. **Track Usage**: Always track component usage for better recommendations
3. **Rate Components**: Rate components to improve quality metrics
4. **Create Variants**: Create variants instead of new components when possible
5. **Validate Props**: Always define proper validation rules
6. **Document Components**: Add clear descriptions and examples

## 🐛 Troubleshooting

### Component Not Found
- Make sure component is registered
- Check component ID spelling
- Initialize library before use

### Low Selection Score
- Review selection context
- Check if component tags match business category
- Add more relevant tags to components

### Performance Issues
- Use component dependencies wisely
- Avoid circular dependencies
- Consider lazy loading for large components

## 🔮 Future Improvements

- [ ] AI-powered component recommendation
- [ ] Visual component builder
- [ ] Component marketplace
- [ ] Version control for components
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Auto-generated documentation

## 📚 Related Documentation

- [Enhanced Project Context](./enhanced-project-context.md)
- [Theme Pack System](./theme-pack-system.md) (Coming Soon)
- [Blueprint System](./blueprint-system.md) (Coming Soon)
- [Migration Guide](./migration-guide.md) (Coming Soon)

## 🤝 Contributing

To add new components:

1. Create component definition in `components/` folder
2. Follow ComponentDefinition interface
3. Add multiple variants
4. Define props schema with validation
5. Add preview assets
6. Register in `index.ts`
7. Update documentation

## 📞 Support

Questions? Issues?
- GitHub Issues
- Team Chat
- Email: dev@midori.com

