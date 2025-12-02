/**
 * Project Context Factory
 * Factory for creating project context data structures
 */

import { ProjectType, ComponentType, PageType } from '@prisma/client';
import type {
  ComponentStateData,
  PageStateData,
  StylingStateData,
  ConversationHistoryData,
  UserPreferencesData,
  ComponentLocation,
  ComponentStyling,
  ComponentMetadata,
  LayoutConfig,
  PageMetadata,
  ThemeConfig,
  ColorPalette,
  FontConfig,
  SpacingConfig,
  BreakpointConfig,
  StylingMetadata
} from '../types/projectContext';

export class ProjectContextFactory {
  // ============================
  // Component Factory
  // ============================

  static createComponentLocation(
    page: string,
    section: string = 'main',
    position: number = 0,
    parent?: string
  ): ComponentLocation {
    return {
      page,
      section,
      position,
      parent
    };
  }

  static createComponentStyling(
    componentType: ComponentType,
    customStyling?: Partial<ComponentStyling>
  ): ComponentStyling {
    const defaultStyling = this.getDefaultComponentStyling(componentType);
    
    return {
      colors: {
        ...defaultStyling.colors,
        ...customStyling?.colors
      },
      fonts: {
        ...defaultStyling.fonts,
        ...customStyling?.fonts
      },
      spacing: {
        ...defaultStyling.spacing,
        ...customStyling?.spacing
      },
      borders: {
        ...defaultStyling.borders,
        ...customStyling?.borders
      },
      shadows: {
        ...defaultStyling.shadows,
        ...customStyling?.shadows
      }
    };
  }

  static createComponentMetadata(
    componentType: ComponentType,
    customMetadata?: Partial<ComponentMetadata>
  ): ComponentMetadata {
    return {
      version: '1.0.0',
      lastModified: new Date(),
      createdBy: 'system',
      tags: [componentType],
      description: `Component of type ${componentType}`,
      ...customMetadata
    };
  }

  static createDefaultComponentProps(componentType: ComponentType): Record<string, any> {
    const defaultProps = {
      [ComponentType.button]: {
        text: 'Click me',
        variant: 'primary',
        size: 'medium'
      },
      [ComponentType.header]: {
        title: 'Website Title',
        showNavigation: true
      },
      [ComponentType.footer]: {
        showCopyright: true,
        showSocialLinks: true
      },
      [ComponentType.menu]: {
        items: [],
        orientation: 'horizontal'
      },
      [ComponentType.card]: {
        title: 'Card Title',
        content: 'Card content goes here'
      },
      [ComponentType.form]: {
        fields: [],
        submitText: 'Submit'
      },
      [ComponentType.navigation]: {
        items: [],
        orientation: 'horizontal'
      },
      [ComponentType.hero]: {
        title: 'Welcome to Our Website',
        subtitle: 'This is a hero section',
        showButton: true
      },
      [ComponentType.content]: {
        text: 'Content goes here'
      },
      [ComponentType.sidebar]: {
        position: 'left',
        width: '250px'
      },
      [ComponentType.modal]: {
        title: 'Modal Title',
        showCloseButton: true
      },
      [ComponentType.gallery]: {
        items: [],
        columns: 3
      },
      [ComponentType.testimonial]: {
        items: []
      },
      [ComponentType.pricing]: {
        plans: []
      },
      [ComponentType.contact]: {
        fields: []
      },
      [ComponentType.about]: {
        content: 'About us content'
      },
      [ComponentType.services]: {
        items: []
      },
      [ComponentType.products]: {
        items: []
      },
      [ComponentType.blog]: {
        posts: []
      },
      [ComponentType.custom]: {}
    };

    return (defaultProps as any)[componentType] || {};
  }

  // ============================
  // Page Factory
  // ============================

  static createLayoutConfig(
    type: 'grid' | 'flex' | 'absolute' = 'grid',
    customConfig?: Partial<LayoutConfig>
  ): LayoutConfig {
    return {
      type,
      columns: 1,
      gap: '1rem',
      padding: '1rem',
      margin: '0',
      responsive: {
        sm: { columns: 1 },
        md: { columns: 2 },
        lg: { columns: 3 }
      },
      ...customConfig
    };
  }

  static createPageMetadata(
    pageType: PageType,
    name: string,
    customMetadata?: Partial<PageMetadata>
  ): PageMetadata {
    return {
      title: name,
      description: `${name} page`,
      keywords: [pageType, 'page'],
      seo: {
        title: name,
        description: `${name} page`,
        keywords: [pageType, 'page']
      },
      lastModified: new Date(),
      createdBy: 'system',
      ...customMetadata
    };
  }

  // ============================
  // Styling Factory
  // ============================

  static createThemeConfig(
    themeName: string = 'default',
    customTheme?: Partial<ThemeConfig>
  ): ThemeConfig {
    const defaultTheme = {
      name: 'default',
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#F59E0B',
      neutral: '#9CA3AF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    };
    
    return {
      name: themeName,
      primary: customTheme?.primary || defaultTheme.primary,
      secondary: customTheme?.secondary || defaultTheme.secondary,
      accent: customTheme?.accent || defaultTheme.accent,
      neutral: customTheme?.neutral || defaultTheme.neutral,
      success: customTheme?.success || defaultTheme.success,
      warning: customTheme?.warning || defaultTheme.warning,
      error: customTheme?.error || defaultTheme.error
    };
  }

  static createColorPalette(
    theme: ThemeConfig,
    customColors?: Partial<ColorPalette>
  ): ColorPalette {
    return {
      primary: {
        '50': this.lightenColor(theme.primary, 0.9),
        '100': this.lightenColor(theme.primary, 0.8),
        '200': this.lightenColor(theme.primary, 0.6),
        '300': this.lightenColor(theme.primary, 0.4),
        '400': this.lightenColor(theme.primary, 0.2),
        '500': theme.primary,
        '600': this.darkenColor(theme.primary, 0.2),
        '700': this.darkenColor(theme.primary, 0.4),
        '800': this.darkenColor(theme.primary, 0.6),
        '900': this.darkenColor(theme.primary, 0.8)
      },
      secondary: {
        '50': this.lightenColor(theme.secondary, 0.9),
        '100': this.lightenColor(theme.secondary, 0.8),
        '200': this.lightenColor(theme.secondary, 0.6),
        '300': this.lightenColor(theme.secondary, 0.4),
        '400': this.lightenColor(theme.secondary, 0.2),
        '500': theme.secondary,
        '600': this.darkenColor(theme.secondary, 0.2),
        '700': this.darkenColor(theme.secondary, 0.4),
        '800': this.darkenColor(theme.secondary, 0.6),
        '900': this.darkenColor(theme.secondary, 0.8)
      },
      neutral: {
        '50': '#F9FAFB',
        '100': '#F3F4F6',
        '200': '#E5E7EB',
        '300': '#D1D5DB',
        '400': '#9CA3AF',
        '500': '#6B7280',
        '600': '#4B5563',
        '700': '#374151',
        '800': '#1F2937',
        '900': '#111827'
      },
      semantic: {
        success: theme.success,
        warning: theme.warning,
        error: theme.error,
        info: theme.primary
      },
      ...customColors
    };
  }

  static createFontConfig(
    customFonts?: Partial<FontConfig>
  ): FontConfig {
    return {
      heading: {
        family: customFonts?.heading?.family || 'Inter',
        weights: customFonts?.heading?.weights || [400, 500, 600, 700],
        sizes: {
          h1: '2.5rem',
          h2: '2rem',
          h3: '1.5rem',
          h4: '1.25rem',
          h5: '1.125rem',
          h6: '1rem',
          ...customFonts?.heading?.sizes
        }
      },
      body: {
        family: customFonts?.body?.family || 'Inter',
        weights: customFonts?.body?.weights || [400, 500],
        sizes: {
          base: '1rem',
          small: '0.875rem',
          large: '1.125rem',
          xl: '1.25rem',
          ...customFonts?.body?.sizes
        }
      },
      mono: {
        family: customFonts?.mono?.family || 'JetBrains Mono',
        weights: customFonts?.mono?.weights || [400, 500],
        sizes: {
          base: '0.875rem',
          small: '0.75rem',
          large: '1rem',
          ...customFonts?.mono?.sizes
        }
      }
    };
  }

  static createSpacingConfig(
    customSpacing?: Partial<SpacingConfig>
  ): SpacingConfig {
    return {
      scale: customSpacing?.scale || 'linear',
      base: customSpacing?.base || 4,
      units: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        ...customSpacing?.units
      }
    };
  }

  static createBreakpointConfig(
    customBreakpoints?: Partial<BreakpointConfig>
  ): BreakpointConfig {
    return {
      sm: customBreakpoints?.sm || '640px',
      md: customBreakpoints?.md || '768px',
      lg: customBreakpoints?.lg || '1024px',
      xl: customBreakpoints?.xl || '1280px',
      '2xl': customBreakpoints?.['2xl'] || '1536px'
    };
  }

  static createStylingMetadata(
    customMetadata?: Partial<StylingMetadata>
  ): StylingMetadata {
    return {
      version: '1.0.0',
      lastModified: new Date(),
      createdBy: 'system',
      themeVersion: '1.0.0',
      ...customMetadata
    };
  }

  // ============================
  // Conversation History Factory
  // ============================

  static createConversationHistory(
    customHistory?: Partial<ConversationHistoryData>
  ): ConversationHistoryData {
    return {
      messages: [],
      currentContext: '',
      lastIntent: '',
      lastAction: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...customHistory
    };
  }

  // ============================
  // User Preferences Factory
  // ============================

  static createUserPreferences(
    customPreferences?: Partial<UserPreferencesData>
  ): UserPreferencesData {
    return {
      language: 'th',
      theme: 'light',
      autoSave: true,
      notifications: true,
      customSettings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      ...customPreferences
    };
  }

  // ============================
  // Default Component Styling
  // ============================

  private static getDefaultComponentStyling(componentType: ComponentType): ComponentStyling {
    const defaultStyling = {
      [ComponentType.button]: {
        colors: {
          primary: '#3B82F6',
          text: '#FFFFFF'
        },
        fonts: {},
        spacing: {
          padding: '0.5rem 1rem',
          margin: '0.25rem'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.header]: {
        colors: {
          background: '#FFFFFF',
          text: '#000000'
        },
        fonts: {},
        spacing: {
          padding: '1rem',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.footer]: {
        colors: {
          background: '#1F2937',
          text: '#FFFFFF'
        },
        fonts: {},
        spacing: {
          padding: '2rem 1rem',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.menu]: {
        colors: {
          background: 'transparent',
          text: '#000000'
        },
        fonts: {},
        spacing: {
          padding: '0',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.card]: {
        colors: {
          background: '#FFFFFF',
          text: '#000000',
          border: '#E5E7EB'
        },
        fonts: {},
        spacing: {
          padding: '1rem',
          margin: '0.5rem'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.form]: {
        colors: {
          background: '#FFFFFF',
          text: '#000000'
        },
        fonts: {},
        spacing: {
          padding: '1rem',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.navigation]: {
        colors: {
          background: '#FFFFFF',
          text: '#000000'
        },
        fonts: {},
        spacing: {
          padding: '0',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.hero]: {
        colors: {
          background: '#F3F4F6',
          text: '#000000'
        },
        fonts: {},
        spacing: {
          padding: '4rem 1rem',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.content]: {
        colors: {
          background: 'transparent',
          text: '#000000'
        },
        fonts: {},
        spacing: {
          padding: '1rem',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.sidebar]: {
        colors: {
          background: '#F9FAFB',
          text: '#000000'
        },
        fonts: {},
        spacing: {
          padding: '1rem',
          margin: '0'
        },
        borders: {},
        shadows: {}
      },
      [ComponentType.modal]: {
        colors: {
          background: '#FFFFFF',
          text: '#000000',
          overlay: 'rgba(0, 0, 0, 0.5)'
        },
        fonts: {},
        spacing: {
          padding: '2rem',
          margin: '0'
        },
        borders: {},
        shadows: {}
      }
    };

    return (defaultStyling as any)[componentType] || {
      colors: {},
      fonts: {},
      spacing: {},
      borders: {},
      shadows: {}
    };
  }

  // ============================
  // Utility Methods
  // ============================

  private static lightenColor(color: string, amount: number): string {
    // Simple color lightening - in production, use a proper color library
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  private static darkenColor(color: string, amount: number): string {
    // Simple color darkening - in production, use a proper color library
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}
