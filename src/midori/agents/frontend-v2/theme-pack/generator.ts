/**
 * ThemePack Generator
 * Main generator for creating theme packs
 */

import { ColorDetector } from './color-detector';
import { PaletteBuilder } from './palette-builder';
import type { GenerateThemePackInput, ThemePackMetadata } from './types';
import type { 
  ThemePack, 
  TypographyConfig, 
  SpacingConfig, 
  BorderRadiusConfig,
  ShadowConfig,
  AnimationConfig,
  ResponsiveConfig,
  ThemeMetadata
} from '@/midori/agents/orchestrator/types/enhancedProjectContext';

export class ThemePackGenerator {
  
  /**
   * Generate complete theme pack
   */
  static generate(input: GenerateThemePackInput): ThemePack {
    // 1. Detect colors from keywords
    const detectedColors = ColorDetector.detect(input.keywords);
    
    // 2. Build color palette
    const colorPalette = PaletteBuilder.build(input.businessCategory, detectedColors);
    
    // 3. Create typography
    const typography = this.createTypography(input);
    
    // 4. Create spacing
    const spacing = this.createSpacing();
    
    // 5. Create border radius
    const borderRadius = this.createBorderRadius();
    
    // 6. Create shadows
    const shadows = this.createShadows();
    
    // 7. Create animations
    const animations = this.createAnimations();
    
    // 8. Create responsive
    const responsive = this.createResponsive();
    
    // 9. Create metadata
    const metadata: ThemeMetadata = {
      category: input.businessCategory,
      author: 'Midori AI',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      tags: input.keywords
    };
    
    const themePack: ThemePack = {
      id: `theme_${Date.now()}`,
      name: this.generateName(input.businessCategory, detectedColors),
      description: `Theme for ${input.businessCategory} with ${detectedColors.tone} colors`,
      colorPalette,
      typography,
      spacing,
      borderRadius,
      shadows,
      animations,
      responsive,
      metadata
    };
    
    // ThemePack generated
    
    return themePack;
  }
  
  /**
   * Generate theme pack name
   */
  private static generateName(category: string, detected: any): string {
    const categoryNames: Record<string, string> = {
      'restaurant': 'Restaurant',
      'ecommerce': 'E-commerce',
      'portfolio': 'Portfolio',
      'healthcare': 'Healthcare',
      'pharmacy': 'Pharmacy',
      'business': 'Business'
    };
    
    const baseName = categoryNames[category] || 'Modern';
    
    if (detected.keywords.length > 0) {
      const colorName = detected.keywords[0];
      return `${baseName} ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} Theme`;
    }
    
    return `${baseName} Theme`;
  }
  
  /**
   * Create typography configuration
   */
  private static createTypography(input: GenerateThemePackInput): TypographyConfig {
    // Different fonts for different styles
    const fontFamilies: Record<string, { heading: string; body: string }> = {
      'modern': {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      },
      'classic': {
        heading: 'Georgia, serif',
        body: 'system-ui, sans-serif'
      },
      'minimal': {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif'
      },
      'creative': {
        heading: 'Poppins, sans-serif',
        body: 'Open Sans, sans-serif'
      }
    };
    
    const style = input.style || 'modern';
    const fonts = fontFamilies[style] || fontFamilies['modern'];
    
    return {
      fontFamily: {
        heading: fonts.heading,
        body: fonts.body,
        mono: 'Monaco, Courier, monospace'
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
        '6xl': '3.75rem'  // 60px
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      }
    };
  }
  
  /**
   * Create spacing configuration
   */
  private static createSpacing(): SpacingConfig {
    return {
      base: '1rem',
      scale: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16]
    };
  }
  
  /**
   * Create border radius configuration
   */
  private static createBorderRadius(): BorderRadiusConfig {
    return {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    };
  }
  
  /**
   * Create shadows configuration
   */
  private static createShadows(): ShadowConfig {
    return {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    };
  }
  
  /**
   * Create animations configuration
   */
  private static createAnimations(): AnimationConfig {
    return {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }
  
  /**
   * Create responsive configuration
   */
  private static createResponsive(): ResponsiveConfig {
    return {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    };
  }
}

