/**
 * Palette Builder
 * Builds color palettes for different business categories
 */

import type { DetectedColors } from './types';
import type { ColorPalette } from '../component-library/types';

export class PaletteBuilder {
  
  /**
   * Build color palette
   */
  static build(
    businessCategory: string,
    detectedColors: DetectedColors
  ): ColorPalette {
    
    // If colors detected from keywords, use them
    if (detectedColors.primary) {
      return this.buildFromDetectedColors(detectedColors);
    }
    
    // Otherwise, use category defaults
    return this.buildFromCategory(businessCategory, detectedColors.tone);
  }
  
  /**
   * Build palette from detected colors
   */
  private static buildFromDetectedColors(detected: DetectedColors): ColorPalette {
    return {
      primary: this.createColorScale(detected.primary!),
      secondary: this.createColorScale(detected.secondary!),
      accent: this.createColorScale(detected.accent!),
      neutral: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    };
  }
  
  /**
   * Create color scale from a single color
   */
  private static createColorScale(baseColor: string): { [key: number]: string } {
    return {
      50: this.lighten(baseColor, 45),
      100: this.lighten(baseColor, 35),
      200: this.lighten(baseColor, 25),
      300: this.lighten(baseColor, 15),
      400: this.lighten(baseColor, 5),
      500: baseColor,
      600: this.darken(baseColor, 10),
      700: this.darken(baseColor, 20),
      800: this.darken(baseColor, 30),
      900: this.darken(baseColor, 40)
    };
  }
  
  /**
   * Build palette from category defaults
   */
  private static buildFromCategory(
    category: string,
    tone: 'warm' | 'cool' | 'neutral' | 'vibrant'
  ): ColorPalette {
    
    const categoryPalettes: Record<string, ColorPalette> = {
      'restaurant': {
        primary: this.createColorScale('#DC2626'),
        secondary: this.createColorScale('#F59E0B'),
        accent: this.createColorScale('#059669'),
        neutral: this.getNeutralPalette(),
        semantic: this.getSemanticColors()
      },
      'ecommerce': {
        primary: this.createColorScale('#2563EB'),
        secondary: this.createColorScale('#7C3AED'),
        accent: this.createColorScale('#F59E0B'),
        neutral: this.getNeutralPalette(),
        semantic: this.getSemanticColors()
      },
      'portfolio': {
        primary: this.createColorScale('#111827'),
        secondary: this.createColorScale('#6B7280'),
        accent: this.createColorScale('#3B82F6'),
        neutral: this.getNeutralPalette(),
        semantic: this.getSemanticColors()
      },
      'healthcare': {
        primary: this.createColorScale('#0891B2'),
        secondary: this.createColorScale('#10B981'),
        accent: this.createColorScale('#3B82F6'),
        neutral: this.getNeutralPalette(),
        semantic: this.getSemanticColors()
      },
      'pharmacy': {
        primary: this.createColorScale('#059669'),
        secondary: this.createColorScale('#0891B2'),
        accent: this.createColorScale('#3B82F6'),
        neutral: this.getNeutralPalette(),
        semantic: this.getSemanticColors()
      }
    };
    
    // Get base palette for category
    let palette = categoryPalettes[category] || categoryPalettes['ecommerce'];
    
    // Adjust based on tone
    if (tone === 'warm') {
      palette = this.adjustToWarmTone(palette);
    } else if (tone === 'cool') {
      palette = this.adjustToCoolTone(palette);
    }
    
    return palette;
  }
  
  /**
   * Get neutral palette
   */
  private static getNeutralPalette() {
    return {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    };
  }
  
  /**
   * Get semantic colors
   */
  private static getSemanticColors() {
    return {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    };
  }
  
  /**
   * Adjust palette to warm tone
   */
  private static adjustToWarmTone(palette: ColorPalette): ColorPalette {
    // Add warm tint to colors
    // For simplicity, return as-is for now
    // Can implement actual color adjustment later
    return palette;
  }
  
  /**
   * Adjust palette to cool tone
   */
  private static adjustToCoolTone(palette: ColorPalette): ColorPalette {
    // Add cool tint to colors
    // For simplicity, return as-is for now
    return palette;
  }
  
  /**
   * Lighten a hex color
   */
  private static lighten(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1).toUpperCase();
  }
  
  /**
   * Darken a hex color
   */
  private static darken(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
      0x1000000 +
      (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0)
    ).toString(16).slice(1).toUpperCase();
  }
}

