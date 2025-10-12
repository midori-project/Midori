/**
 * Enhanced Project Context - Example Usage
 * ตัวอย่างการใช้งาน Enhanced Project Context
 */

import { EnhancedProjectContextStore } from '../stores/enhancedProjectContextStore';
import type {
  CreateEnhancedProjectContextInput,
  ThemePack,
  Blueprint,
  ComponentSelection
} from '../types/enhancedProjectContext';

// ============================
// Example 1: Create New Enhanced Project
// ============================

export async function createRestaurantProject() {
  const store = EnhancedProjectContextStore.getInstance();
  
  // สร้าง theme pack สำหรับร้านอาหาร
  const restaurantTheme: ThemePack = {
    id: 'warm-japanese',
    name: 'Warm Japanese',
    description: 'Warm color palette for Japanese restaurant',
    colorPalette: {
      primary: {
        50: '#FFF7ED',
        100: '#FFEDD5',
        200: '#FED7AA',
        300: '#FDBA74',
        400: '#FB923C',
        500: '#F97316', // Main orange
        600: '#EA580C',
        700: '#C2410C',
        800: '#9A3412',
        900: '#7C2D12'
      },
      secondary: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444', // Main red
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D'
      },
      accent: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B', // Main yellow
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F'
      },
      neutral: {
        50: '#FAFAF9',
        100: '#F5F5F4',
        200: '#E7E5E4',
        300: '#D6D3D1',
        400: '#A8A29E',
        500: '#78716C',
        600: '#57534E',
        700: '#44403C',
        800: '#292524',
        900: '#1C1917'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    },
    typography: {
      fontFamily: {
        heading: 'Noto Sans JP, sans-serif',
        body: 'Noto Sans Thai, sans-serif',
        mono: 'JetBrains Mono, monospace',
        accent: 'Dancing Script, cursive'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      base: '1rem',
      scale: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
    },
    borderRadius: {
      sm: '0.25rem',
      base: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    animations: {
      duration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    responsive: {
      breakpoints: {
        xs: '320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    },
    metadata: {
      version: '1.0.0',
      author: 'Midori Team',
      category: 'restaurant',
      tags: ['warm', 'japanese', 'food'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  // สร้าง blueprint
  const onepagerBlueprint: Blueprint = {
    id: 'onepager-v1',
    name: 'One Page Layout',
    description: 'Single page layout for restaurant website',
    type: 'onepager',
    slots: {
      header: {
        required: true,
        max: 1,
        min: 1,
        allowedComponents: ['navbar-basic', 'navbar-transparent'],
        defaultComponent: 'navbar-basic'
      },
      hero: {
        required: true,
        max: 1,
        min: 1,
        allowedComponents: ['hero-visual', 'hero-minimal', 'hero-split'],
        defaultComponent: 'hero-visual'
      },
      sections: {
        required: true,
        max: 8,
        min: 3,
        minSections: 3,
        maxSections: 8,
        recommendedOrder: ['menu', 'about', 'testimonials', 'reservation', 'contact']
      },
      footer: {
        required: true,
        max: 1,
        min: 1,
        allowedComponents: ['footer-basic', 'footer-minimal'],
        defaultComponent: 'footer-basic'
      }
    },
    rules: {
      tone: 'friendly',
      seo: {
        metaTitle: true,
        metaDescription: true,
        ogTags: true,
        structuredData: true
      },
      accessibility: {
        altText: true,
        ariaLabels: true,
        keyboardNavigation: true,
        colorContrast: true
      },
      performance: {
        lazyLoading: true,
        imageOptimization: true,
        codesplitting: true,
        caching: true
      }
    },
    metadata: {
      version: '1.0.0',
      author: 'Midori Team',
      category: 'restaurant',
      tags: ['onepager', 'restaurant', 'simple'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  // สร้าง component selection
  const componentSelection: ComponentSelection = {
    selectedComponents: [
      {
        componentId: 'navbar-basic',
        variantId: 'modern',
        slotId: 'header',
        score: 0.95,
        reason: 'Modern navbar matches restaurant style'
      },
      {
        componentId: 'hero-visual',
        variantId: 'left-image',
        slotId: 'hero',
        score: 0.92,
        reason: 'Visual hero with food image'
      },
      {
        componentId: 'menu-grid',
        variantId: 'grid-3col',
        slotId: 'section-1',
        score: 0.98,
        reason: 'Grid layout perfect for menu items'
      }
    ],
    selectionCriteria: {
      businessCategory: 'restaurant',
      style: ['modern', 'warm'],
      tone: 'friendly',
      features: ['menu', 'reservation', 'contact']
    },
    score: 0.95
  };
  
  // สร้าง enhanced project context
  const input: CreateEnhancedProjectContextInput = {
    projectId: 'project_restaurant_001',
    projectName: 'ร้านอาหารญี่ปุ่น โทนอุ่น',
    businessCategory: 'restaurant',
    userInput: 'สร้างเว็บไซต์ร้านอาหารญี่ปุ่น โทนสีอุ่น มีเมนูอาหาร',
    themePack: restaurantTheme,
    blueprint: onepagerBlueprint,
    componentSelection: componentSelection,
    migrationStatus: 'migrated'
  };
  
  const enhancedContext = await store.createEnhancedProjectContext(input);
  
  console.log('✅ Created enhanced project context:', enhancedContext.id);
  console.log('📦 Theme Pack:', enhancedContext.themePack?.name);
  console.log('🏗️ Blueprint:', enhancedContext.blueprint?.name);
  console.log('🎨 Components:', enhancedContext.componentSelection?.selectedComponents.length);
  
  return enhancedContext;
}

// ============================
// Example 2: Update Project Context
// ============================

export async function updateProjectTheme(projectId: string) {
  const store = EnhancedProjectContextStore.getInstance();
  
  // สร้าง theme pack ใหม่
  const newTheme: ThemePack = {
    id: 'cool-minimal',
    name: 'Cool Minimal',
    description: 'Cool minimal theme',
    // ... (shortened for brevity)
  } as ThemePack;
  
  const updated = await store.updateEnhancedProjectContext({
    projectId,
    themePack: newTheme
  });
  
  console.log('✅ Updated project theme:', updated.themePack?.name);
  
  return updated;
}

// ============================
// Example 3: Migrate Legacy Project
// ============================

export async function migrateLegacyProject(projectId: string) {
  const store = EnhancedProjectContextStore.getInstance();
  
  const result = await store.migrateToComponentBased(projectId, {
    preserveLegacyData: true,
    validateAfterMigration: true,
    createBackup: true,
    dryRun: false
  });
  
  if (result.success) {
    console.log('✅ Migration successful');
    console.log('⏱️ Duration:', result.metrics.duration, 'ms');
    console.log('📊 Data size:', result.metrics.dataSize, 'bytes');
  } else {
    console.error('❌ Migration failed:', result.errors);
  }
  
  return result;
}

// ============================
// Example 4: Get Enhanced Context
// ============================

export async function getProjectContext(projectId: string) {
  const store = EnhancedProjectContextStore.getInstance();
  
  const context = await store.getEnhancedProjectContext(projectId);
  
  if (context) {
    console.log('✅ Project Context loaded');
    console.log('📦 Migration Status:', context.migrationStatus);
    console.log('🎨 Theme:', context.themePack?.name);
    console.log('🏗️ Blueprint:', context.blueprint?.name);
    console.log('📊 Quality Score:', context.quality?.overallScore);
  }
  
  return context;
}

