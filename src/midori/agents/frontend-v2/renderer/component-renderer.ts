/**
 * Component Renderer
 * Renders components with props and theme
 */

import { TemplateEngine } from './template-engine';
import type { RenderInput, RenderOutput, RenderBatchInput, RenderBatchOutput } from './types';
import type { Component, ComponentVariant } from '../component-library/types';
import type { ThemePack } from '../theme-pack/types';

export class ComponentRenderer {
  
  /**
   * Render a single component
   */
  static render(input: RenderInput): RenderOutput {
    console.log(`🎨 Rendering component: ${input.component.id}`);
    
    // 1. Select template (variant or base)
    const template = input.variant?.template || input.component.template;
    
    if (!template) {
      throw new Error(`No template found for component: ${input.component.id}`);
    }
    
    // 2. Validate props
    const validation = TemplateEngine.validateProps(template, input.props);
    if (!validation.isValid) {
      console.warn(`⚠️ Missing props for ${input.component.id}:`, validation.missing);
    }
    
    // 3. Render template
    const code = TemplateEngine.render(template, input.props, input.themePack);
    
    // 4. Extract imports
    const imports = this.extractImports(code, input.component);
    
    // 5. Generate file name
    const fileName = this.generateFileName(input.component, input.variant);
    
    // 6. Calculate metadata
    const linesOfCode = code.split('\n').length;
    const estimatedSize = new Blob([code]).size;
    
    console.log(`✅ Rendered ${input.component.id}: ${linesOfCode} lines, ${estimatedSize} bytes`);
    
    return {
      code,
      imports,
      fileName,
      language: 'tsx',
      metadata: {
        componentId: input.component.id,
        variantId: input.variant?.id,
        linesOfCode,
        estimatedSize
      }
    };
  }
  
  /**
   * Render multiple components in batch
   */
  static renderBatch(input: RenderBatchInput): RenderBatchOutput {
    console.log(`🎨 Batch rendering ${input.components.length} components...`);
    
    const files: RenderOutput[] = [];
    let totalSize = 0;
    
    // Render each component
    for (const componentInput of input.components) {
      const output = this.render(componentInput);
      files.push(output);
      totalSize += output.metadata.estimatedSize;
    }
    
    // Generate global files (theme config, etc.)
    const globalFiles = this.generateGlobalFiles(input.themePack, input.projectType);
    
    console.log(`✅ Batch rendering complete: ${files.length} components, ${totalSize} bytes`);
    
    return {
      files,
      globalFiles,
      totalSize,
      totalComponents: files.length
    };
  }
  
  /**
   * Extract import statements from component code
   */
  private static extractImports(code: string, component: Component): string[] {
    const imports: string[] = [];
    
    // Add React import (always needed for TSX)
    imports.push("import React from 'react';");
    
    // Check for dependencies
    if (component.dependencies && component.dependencies.length > 0) {
      for (const dep of component.dependencies) {
        imports.push(`import ${dep} from './${dep}';`);
      }
    }
    
    // Extract any existing imports from template
    const importPattern = /^import\s+.+?;$/gm;
    const templateImports = code.match(importPattern);
    
    if (templateImports) {
      imports.push(...templateImports);
    }
    
    return [...new Set(imports)]; // Remove duplicates
  }
  
  /**
   * Generate file name for component
   */
  private static generateFileName(component: Component, variant?: ComponentVariant): string {
    const baseName = component.id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    if (variant) {
      const variantName = variant.id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      return `${baseName}${variantName}.tsx`;
    }
    
    return `${baseName}.tsx`;
  }
  
  /**
   * Generate global configuration files
   */
  private static generateGlobalFiles(themePack: ThemePack, projectType: string): Array<{
    fileName: string;
    code: string;
    language: string;
  }> {
    const files: Array<{ fileName: string; code: string; language: string }> = [];
    
    // 1. Theme configuration file
    files.push({
      fileName: 'theme.config.ts',
      code: this.generateThemeConfig(themePack),
      language: 'typescript'
    });
    
    // 2. Tailwind configuration (if applicable)
    if (projectType.includes('tailwind')) {
      files.push({
        fileName: 'tailwind.config.js',
        code: this.generateTailwindConfig(themePack),
        language: 'javascript'
      });
    }
    
    return files;
  }
  
  /**
   * Generate theme configuration code
   */
  private static generateThemeConfig(themePack: ThemePack): string {
    return `/**
 * Theme Configuration
 * Auto-generated from ThemePack: ${themePack.name}
 */

export const theme = {
  name: '${themePack.name}',
  
  colors: {
    primary: {
      50: '${themePack.colorPalette.primary[50]}',
      100: '${themePack.colorPalette.primary[100]}',
      200: '${themePack.colorPalette.primary[200]}',
      300: '${themePack.colorPalette.primary[300]}',
      400: '${themePack.colorPalette.primary[400]}',
      500: '${themePack.colorPalette.primary[500]}',
      600: '${themePack.colorPalette.primary[600]}',
      700: '${themePack.colorPalette.primary[700]}',
      800: '${themePack.colorPalette.primary[800]}',
      900: '${themePack.colorPalette.primary[900]}'
    },
    secondary: {
      50: '${themePack.colorPalette.secondary[50]}',
      100: '${themePack.colorPalette.secondary[100]}',
      200: '${themePack.colorPalette.secondary[200]}',
      300: '${themePack.colorPalette.secondary[300]}',
      400: '${themePack.colorPalette.secondary[400]}',
      500: '${themePack.colorPalette.secondary[500]}',
      600: '${themePack.colorPalette.secondary[600]}',
      700: '${themePack.colorPalette.secondary[700]}',
      800: '${themePack.colorPalette.secondary[800]}',
      900: '${themePack.colorPalette.secondary[900]}'
    },
    accent: {
      50: '${themePack.colorPalette.accent[50]}',
      100: '${themePack.colorPalette.accent[100]}',
      200: '${themePack.colorPalette.accent[200]}',
      300: '${themePack.colorPalette.accent[300]}',
      400: '${themePack.colorPalette.accent[400]}',
      500: '${themePack.colorPalette.accent[500]}',
      600: '${themePack.colorPalette.accent[600]}',
      700: '${themePack.colorPalette.accent[700]}',
      800: '${themePack.colorPalette.accent[800]}',
      900: '${themePack.colorPalette.accent[900]}'
    },
    neutral: {
      50: '${themePack.colorPalette.neutral[50]}',
      100: '${themePack.colorPalette.neutral[100]}',
      200: '${themePack.colorPalette.neutral[200]}',
      300: '${themePack.colorPalette.neutral[300]}',
      400: '${themePack.colorPalette.neutral[400]}',
      500: '${themePack.colorPalette.neutral[500]}',
      600: '${themePack.colorPalette.neutral[600]}',
      700: '${themePack.colorPalette.neutral[700]}',
      800: '${themePack.colorPalette.neutral[800]}',
      900: '${themePack.colorPalette.neutral[900]}'
    },
    semantic: {
      success: '${themePack.colorPalette.semantic.success}',
      warning: '${themePack.colorPalette.semantic.warning}',
      error: '${themePack.colorPalette.semantic.error}',
      info: '${themePack.colorPalette.semantic.info}'
    }
  },
  
  typography: {
    fontFamily: {
      heading: '${themePack.typography.fontFamily.heading}',
      body: '${themePack.typography.fontFamily.body}',
      mono: '${themePack.typography.fontFamily.mono}'
    },
    fontSize: {
      xs: '${themePack.typography.fontSize.xs}',
      sm: '${themePack.typography.fontSize.sm}',
      base: '${themePack.typography.fontSize.base}',
      lg: '${themePack.typography.fontSize.lg}',
      xl: '${themePack.typography.fontSize.xl}',
      '2xl': '${themePack.typography.fontSize['2xl']}',
      '3xl': '${themePack.typography.fontSize['3xl']}',
      '4xl': '${themePack.typography.fontSize['4xl']}',
      '5xl': '${themePack.typography.fontSize['5xl']}'
    },
    lineHeight: {
      none: ${themePack.typography.lineHeight.none},
      tight: ${themePack.typography.lineHeight.tight},
      snug: ${themePack.typography.lineHeight.snug},
      normal: ${themePack.typography.lineHeight.normal},
      relaxed: ${themePack.typography.lineHeight.relaxed},
      loose: ${themePack.typography.lineHeight.loose}
    }
  },
  
  spacing: {
    base: '${themePack.spacing.base}',
    scale: ${JSON.stringify(themePack.spacing.scale)}
  },
  
  borderRadius: {
    none: '${themePack.borderRadius.none}',
    sm: '${themePack.borderRadius.sm}',
    md: '${themePack.borderRadius.md}',
    lg: '${themePack.borderRadius.lg}',
    xl: '${themePack.borderRadius.xl}',
    full: '${themePack.borderRadius.full}'
  },
  
  shadows: {
    none: '${themePack.shadows.none}',
    sm: '${themePack.shadows.sm}',
    md: '${themePack.shadows.md}',
    lg: '${themePack.shadows.lg}',
    xl: '${themePack.shadows.xl}'
  }
};

export default theme;
`;
  }
  
  /**
   * Generate Tailwind configuration
   */
  private static generateTailwindConfig(themePack: ThemePack): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '${themePack.colorPalette.primary[50]}',
          100: '${themePack.colorPalette.primary[100]}',
          200: '${themePack.colorPalette.primary[200]}',
          300: '${themePack.colorPalette.primary[300]}',
          400: '${themePack.colorPalette.primary[400]}',
          500: '${themePack.colorPalette.primary[500]}',
          600: '${themePack.colorPalette.primary[600]}',
          700: '${themePack.colorPalette.primary[700]}',
          800: '${themePack.colorPalette.primary[800]}',
          900: '${themePack.colorPalette.primary[900]}'
        },
        secondary: {
          50: '${themePack.colorPalette.secondary[50]}',
          100: '${themePack.colorPalette.secondary[100]}',
          200: '${themePack.colorPalette.secondary[200]}',
          300: '${themePack.colorPalette.secondary[300]}',
          400: '${themePack.colorPalette.secondary[400]}',
          500: '${themePack.colorPalette.secondary[500]}',
          600: '${themePack.colorPalette.secondary[600]}',
          700: '${themePack.colorPalette.secondary[700]}',
          800: '${themePack.colorPalette.secondary[800]}',
          900: '${themePack.colorPalette.secondary[900]}'
        }
      },
      fontFamily: {
        heading: ['${themePack.typography.fontFamily.heading}', 'sans-serif'],
        body: ['${themePack.typography.fontFamily.body}', 'sans-serif'],
        mono: ['${themePack.typography.fontFamily.mono}', 'monospace']
      }
    },
  },
  plugins: [],
};
`;
  }
}

