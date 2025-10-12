# Blueprint System Documentation

## Overview

The **Blueprint System** defines website structure templates that determine the layout, pages, and sections of a website. It acts as a high-level architectural plan that guides the component-based website generation process.

## Key Concepts

### What is a Blueprint?

A Blueprint is a predefined structure that specifies:
- **Pages**: What pages the website has (Home, About, Contact, etc.)
- **Sections**: What sections each page contains (Hero, Menu, Footer, etc.)
- **Components**: Which components to use for each section
- **Layout**: How sections are arranged and styled
- **Navigation**: How users navigate between sections/pages

### Blueprint Types

1. **Onepager**: Single-page website with all sections on one scrollable page
2. **Multipage** (Planned): Multi-page website with separate routes

## Architecture

```
Blueprint System
├── types.ts              # Type definitions
├── layouts/
│   ├── onepager.ts      # Onepager blueprints
│   └── multipage.ts     # Multipage blueprints (future)
├── selector.ts          # Blueprint selection logic
├── examples/            # Usage examples
└── index.ts             # Main exports
```

## Core Types

### Blueprint

```typescript
interface Blueprint {
  id: string;
  name: string;
  description: string;
  type: 'onepager' | 'multipage';
  category: string;
  pages: BlueprintPage[];
  layout: LayoutConfig;
  components: ComponentRequirement[];
  metadata: BlueprintMetadata;
}
```

### BlueprintPage

```typescript
interface BlueprintPage {
  id: string;
  name: string;
  route: string;
  title: string;
  sections: BlueprintSection[];
}
```

### BlueprintSection

```typescript
interface BlueprintSection {
  id: string;
  name: string;
  componentCategory: 'navigation' | 'content' | 'layout';
  componentId: string;
  variantPreference?: string[];
  required: boolean;
  order: number;
  props?: Record<string, any>;
}
```

## Available Blueprints

### 1. Restaurant Onepager

**ID:** `restaurant-onepager-v1`

**Sections:**
- Navigation Bar (required)
- Hero Section (required)
- About Section (required)
- Menu Section (required)
- Contact Section (required)
- Footer (required)

**Best for:**
- Restaurants
- Cafes
- Food businesses

### 2. E-commerce Onepager

**ID:** `ecommerce-onepager-v1`

**Sections:**
- Navigation Bar (required)
- Hero Section (required)
- Products Section (required)
- About Section (optional)
- Contact Section (required)
- Footer (required)

**Best for:**
- Online stores
- Product catalogs
- Small e-commerce sites

### 3. Portfolio Onepager

**ID:** `portfolio-onepager-v1`

**Sections:**
- Navigation Bar (required)
- Hero Section (required)
- About Section (required)
- Contact Section (required)
- Footer (required)

**Best for:**
- Personal portfolios
- Creative professionals
- Simple business sites

## Usage

### 1. Select Blueprint Automatically

```typescript
import { BlueprintSelector } from '@/midori/agents/frontend-v2/blueprint';

const blueprint = BlueprintSelector.select({
  businessCategory: 'restaurant',
  features: ['menu', 'about', 'contact'],
  complexity: 'moderate'
});

console.log(blueprint.name); // "Restaurant One Page"
console.log(blueprint.pages[0].sections.length); // 6
```

### 2. Get Blueprint by ID

```typescript
const blueprint = BlueprintSelector.getById('restaurant-onepager-v1');

if (blueprint) {
  console.log(blueprint.name);
  console.log(blueprint.description);
}
```

### 3. Get Blueprints by Category

```typescript
const restaurantBlueprints = BlueprintSelector.getByCategory('restaurant');

restaurantBlueprints.forEach(bp => {
  console.log(`${bp.name} - ${bp.type}`);
});
```

### 4. List All Blueprints

```typescript
const allBlueprints = BlueprintSelector.listAll();

console.log(`Total blueprints: ${allBlueprints.length}`);
```

### 5. Direct Access

```typescript
import { ONEPAGER_BLUEPRINTS } from '@/midori/agents/frontend-v2/blueprint';

const restaurantBp = ONEPAGER_BLUEPRINTS.restaurant;
const ecommerceBp = ONEPAGER_BLUEPRINTS.ecommerce;
const portfolioBp = ONEPAGER_BLUEPRINTS.portfolio;
```

## Selection Algorithm

The `BlueprintSelector.select()` method uses the following logic:

1. **Determine Page Type**
   - Check if `pageCount > 1` → multipage
   - Check complexity level → simple/moderate → onepager
   - Check feature count → many features → multipage
   - Default: onepager

2. **Map Business Category**
   - Match category to appropriate blueprint
   - Fallback to generic blueprint if no exact match

3. **Customize Sections**
   - Keep all required sections
   - Filter optional sections based on requested features
   - Reorder sections by priority

4. **Return Blueprint**
   - Return customized blueprint ready for component selection

## Integration with Enhanced Project Context

The Blueprint System integrates seamlessly with the Enhanced Project Context:

```typescript
import { EnhancedProjectContextService } from '@/midori/agents/orchestrator/services/enhancedProjectContextService';

// Blueprint is automatically selected during project creation
const enhancedContext = await EnhancedProjectContextService.createEnhancedProjectContext({
  projectId: 'project_123',
  projectName: 'My Restaurant',
  businessCategory: 'restaurant',
  userInput: 'สร้างเว็บร้านอาหาร มีเมนู ติดต่อ',
  // Blueprint will be auto-selected based on businessCategory and features
});

console.log(enhancedContext.blueprint?.name);
console.log(enhancedContext.blueprint?.pages[0].sections);
```

## Blueprint Structure Example

```typescript
{
  id: 'restaurant-onepager-v1',
  name: 'Restaurant One Page',
  description: 'Single page restaurant website with all sections',
  type: 'onepager',
  category: 'restaurant',
  pages: [
    {
      id: 'home',
      name: 'Home',
      route: '/',
      title: 'Home',
      sections: [
        {
          id: 'navbar',
          name: 'Navigation Bar',
          componentCategory: 'navigation',
          componentId: 'navbar',
          variantPreference: ['horizontal', 'minimal'],
          required: true,
          order: 0
        },
        {
          id: 'hero',
          name: 'Hero Section',
          componentCategory: 'content',
          componentId: 'hero',
          variantPreference: ['centered', 'left-image'],
          required: true,
          order: 1
        },
        // ... more sections
      ]
    }
  ],
  layout: {
    type: 'onepager',
    sections: ['navbar', 'hero', 'about', 'menu', 'contact', 'footer'],
    navigation: {
      type: 'smooth-scroll',
      anchors: true
    }
  },
  components: [
    { category: 'navigation', required: true, min: 1, max: 1 },
    { category: 'content', required: true, min: 3, max: 6 },
    { category: 'layout', required: true, min: 1, max: 1 }
  ],
  metadata: {
    complexity: 'moderate',
    estimatedComponents: 6,
    features: ['menu', 'contact', 'about'],
    targetDevices: ['desktop', 'mobile']
  }
}
```

## Customization

### Adding New Blueprints

To add a new blueprint:

1. Define the blueprint in the appropriate layout file (e.g., `layouts/onepager.ts`)
2. Add it to the blueprint collection (e.g., `ONEPAGER_BLUEPRINTS`)
3. Export it from `index.ts`

Example:

```typescript
export const COFFEE_SHOP_ONEPAGER: Blueprint = {
  id: 'coffee-shop-onepager-v1',
  name: 'Coffee Shop One Page',
  description: 'Single page coffee shop website',
  type: 'onepager',
  category: 'coffee_shop',
  pages: [
    {
      id: 'home',
      name: 'Home',
      route: '/',
      title: 'Home',
      sections: [
        // Define sections...
      ]
    }
  ],
  layout: {
    type: 'onepager',
    sections: ['navbar', 'hero', 'menu', 'about', 'contact', 'footer'],
    navigation: {
      type: 'smooth-scroll',
      anchors: true
    }
  },
  components: [
    { category: 'navigation', required: true, min: 1, max: 1 },
    { category: 'content', required: true, min: 3, max: 5 },
    { category: 'layout', required: true, min: 1, max: 1 }
  ],
  metadata: {
    complexity: 'moderate',
    estimatedComponents: 6,
    features: ['menu', 'about', 'contact'],
    targetDevices: ['desktop', 'mobile']
  }
};
```

### Modifying Existing Blueprints

To modify an existing blueprint:

1. Locate the blueprint definition in `layouts/`
2. Update the sections, layout, or metadata
3. Ensure all required fields are present
4. Test the changes

## Best Practices

1. **Keep Blueprints Focused**: Each blueprint should serve a specific business category
2. **Mark Core Sections as Required**: Ensure essential sections (navbar, footer) are always required
3. **Provide Variant Preferences**: Offer multiple variant options for flexibility
4. **Document Features**: Clearly specify what features each blueprint supports
5. **Consider Complexity**: Match blueprint complexity to business needs

## Future Enhancements

- [ ] Multipage blueprints
- [ ] Dynamic section ordering based on priority
- [ ] A/B testing for different layouts
- [ ] User-customizable blueprints
- [ ] Blueprint versioning and migration
- [ ] Analytics integration for blueprint performance

## Related Documentation

- [Enhanced Project Context](./enhanced-project-context.md)
- [Component Library System](./component-library-system.md)
- [Theme Pack System](./theme-pack-system.md)

## Examples

See `src/midori/agents/frontend-v2/blueprint/examples/blueprintExample.ts` for comprehensive usage examples.

