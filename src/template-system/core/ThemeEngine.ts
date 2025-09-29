/**
 * ThemeEngine - เครื่องมือจัดการธีม
 * รับผิดชอบในการปรับแต่งสี, typography, spacing และ styling ตามธีมที่เลือก
 */

import { Theme, ColorScheme, TypographyConfig, ThemeCustomizations } from '../types/Theme';

export class ThemeEngine {
  private themes: Map<string, Theme> = new Map();
  private currentTheme: string = 'modern';

  constructor() {
    this.initializeThemes();
  }

  /**
   * เริ่มต้นธีมพื้นฐาน
   */
  private initializeThemes(): void {
    // Modern Theme
    this.themes.set('modern', {
      name: 'modern',
      displayName: 'Modern',
      description: 'ธีมทันสมัย สีฟ้า-เหลือง',
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12'
        },
        accent: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          background: '#ffffff',
          surface: '#f9fafb',
          text: {
            primary: '#111827',
            secondary: '#6b7280',
            disabled: '#9ca3af'
          }
        }
      },
      typography: {
        fontFamily: {
          primary: 'Inter',
          secondary: 'system-ui',
          mono: 'JetBrains Mono'
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
          '5xl': '3rem',
          '6xl': '3.75rem'
        },
        fontWeight: {
          thin: 100,
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800,
          black: 900
        },
        lineHeight: {
          none: 1,
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
        '6xl': '12rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: '0 0 #0000'
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    });

    // Cozy Theme
    this.themes.set('cozy', {
      name: 'cozy',
      displayName: 'Cozy',
      description: 'ธีมอบอุ่น สีเขียว-ส้ม',
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b'
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        accent: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          background: '#fefdf8',
          surface: '#f9fafb',
          text: {
            primary: '#1f2937',
            secondary: '#6b7280',
            disabled: '#9ca3af'
          }
        }
      },
      typography: {
        fontFamily: {
          primary: 'Poppins',
          secondary: 'system-ui',
          mono: 'JetBrains Mono'
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
          '5xl': '3rem',
          '6xl': '3.75rem'
        },
        fontWeight: {
          thin: 100,
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800,
          black: 900
        },
        lineHeight: {
          none: 1,
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
        '6xl': '12rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: '0 0 #0000'
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    });

    // Minimal Theme
    this.themes.set('minimal', {
      name: 'minimal',
      displayName: 'Minimal',
      description: 'ธีมเรียบง่าย สีเทา-น้ำเงิน',
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          background: '#ffffff',
          surface: '#f8fafc',
          text: {
            primary: '#0f172a',
            secondary: '#475569',
            disabled: '#94a3b8'
          }
        }
      },
      typography: {
        fontFamily: {
          primary: 'system-ui',
          secondary: 'system-ui',
          mono: 'JetBrains Mono'
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
          '5xl': '3rem',
          '6xl': '3.75rem'
        },
        fontWeight: {
          thin: 100,
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800,
          black: 900
        },
        lineHeight: {
          none: 1,
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
        '6xl': '12rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 2px 4px -1px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        lg: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        xl: '0 8px 10px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        '2xl': '0 12px 16px -4px rgb(0 0 0 / 0.1), 0 4px 6px -6px rgb(0 0 0 / 0.1)',
        inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        none: '0 0 #0000'
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    });
  }

  /**
   * ใช้ธีมกับเนื้อหา
   */
  applyTheme(content: string, themeName: string, customizations?: ThemeCustomizations): string {
    console.log(`🎨 [ThemeEngine] ใช้ธีม: ${themeName}`);
    
    const theme = this.getTheme(themeName);
    if (!theme) {
      console.warn(`⚠️ [ThemeEngine] ไม่พบธีม: ${themeName} ใช้ธีม default`);
      return content;
    }

    this.currentTheme = themeName;
    let themedContent = content;

    // ใช้สี
    themedContent = this.applyColorScheme(themedContent, theme.colors, customizations?.colors);
    
    // ใช้ typography
    themedContent = this.applyTypography(themedContent, theme.typography, customizations?.typography);
    
    // ใช้ spacing
    themedContent = this.applySpacing(themedContent, theme.spacing, customizations?.spacing);
    
    // ใช้ border radius
    themedContent = this.applyBorderRadius(themedContent, theme.borderRadius, customizations?.borderRadius);
    
    // ใช้ shadows
    themedContent = this.applyShadows(themedContent, theme.shadows, customizations?.shadows);

    console.log(`✅ [ThemeEngine] ใช้ธีมเสร็จสิ้น: ${themeName}`);
    return themedContent;
  }

  /**
   * ใช้สีกับเนื้อหา
   */
  private applyColorScheme(content: string, colors: ColorScheme, customizations?: Partial<ColorScheme>): string {
    let themedContent = content;

    // รวม customizations
    const finalColors = this.mergeColorScheme(colors, customizations);

    // แทนที่สีหลัก
    themedContent = themedContent.replace(/bg-blue-\d+/g, `bg-${this.getColorClass(finalColors.primary[600], 'bg')}`);
    themedContent = themedContent.replace(/text-blue-\d+/g, `text-${this.getColorClass(finalColors.primary[600], 'text')}`);
    themedContent = themedContent.replace(/border-blue-\d+/g, `border-${this.getColorClass(finalColors.primary[600], 'border')}`);

    // แทนที่สีรอง
    themedContent = themedContent.replace(/bg-yellow-\d+/g, `bg-${this.getColorClass(finalColors.secondary[500], 'bg')}`);
    themedContent = themedContent.replace(/text-yellow-\d+/g, `text-${this.getColorClass(finalColors.secondary[500], 'text')}`);

    // แทนที่สี accent
    themedContent = themedContent.replace(/bg-orange-\d+/g, `bg-${this.getColorClass(finalColors.accent[500], 'bg')}`);
    themedContent = themedContent.replace(/text-orange-\d+/g, `text-${this.getColorClass(finalColors.accent[500], 'text')}`);

    return themedContent;
  }

  /**
   * ใช้ typography
   */
  private applyTypography(content: string, typography: TypographyConfig, customizations?: Partial<TypographyConfig>): string {
    let themedContent = content;

    // รวม customizations
    const finalTypography = this.mergeTypography(typography, customizations);

    // แทนที่ font family
    themedContent = themedContent.replace(/font-\[Inter\]/g, `font-['${finalTypography.fontFamily.primary}']`);
    themedContent = themedContent.replace(/font-\[Poppins\]/g, `font-['${finalTypography.fontFamily.primary}']`);

    return themedContent;
  }

  /**
   * ใช้ spacing
   */
  private applySpacing(content: string, spacing: any, customizations?: any): string {
    // Spacing มักจะถูกกำหนดใน CSS classes แล้ว
    return content;
  }

  /**
   * ใช้ border radius
   */
  private applyBorderRadius(content: string, borderRadius: any, customizations?: any): string {
    let themedContent = content;

    // แทนที่ border radius ตามธีม
    if (this.currentTheme === 'minimal') {
      themedContent = themedContent.replace(/rounded-xl/g, 'rounded-md');
      themedContent = themedContent.replace(/rounded-2xl/g, 'rounded-lg');
      themedContent = themedContent.replace(/rounded-3xl/g, 'rounded-xl');
    } else if (this.currentTheme === 'cozy') {
      themedContent = themedContent.replace(/rounded-xl/g, 'rounded-lg');
      themedContent = themedContent.replace(/rounded-2xl/g, 'rounded-xl');
    }

    return themedContent;
  }

  /**
   * ใช้ shadows
   */
  private applyShadows(content: string, shadows: any, customizations?: any): string {
    let themedContent = content;

    // แทนที่ shadow ตามธีม
    if (this.currentTheme === 'minimal') {
      themedContent = themedContent.replace(/shadow-lg/g, 'shadow-sm');
      themedContent = themedContent.replace(/shadow-xl/g, 'shadow-md');
      themedContent = themedContent.replace(/shadow-2xl/g, 'shadow-lg');
    } else if (this.currentTheme === 'cozy') {
      themedContent = themedContent.replace(/shadow-lg/g, 'shadow-md');
      themedContent = themedContent.replace(/shadow-xl/g, 'shadow-lg');
    }

    return themedContent;
  }

  /**
   * ดึงธีม
   */
  getTheme(name: string): Theme | undefined {
    return this.themes.get(name);
  }

  /**
   * รายการธีมที่มี
   */
  listThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * สร้าง CSS สำหรับธีม
   */
  generateCSS(themeName: string): string {
    const theme = this.getTheme(themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }

    const css = `
/* ${theme.displayName} Theme */
:root {
  /* Primary Colors */
  --color-primary-50: ${theme.colors.primary[50]};
  --color-primary-100: ${theme.colors.primary[100]};
  --color-primary-200: ${theme.colors.primary[200]};
  --color-primary-300: ${theme.colors.primary[300]};
  --color-primary-400: ${theme.colors.primary[400]};
  --color-primary-500: ${theme.colors.primary[500]};
  --color-primary-600: ${theme.colors.primary[600]};
  --color-primary-700: ${theme.colors.primary[700]};
  --color-primary-800: ${theme.colors.primary[800]};
  --color-primary-900: ${theme.colors.primary[900]};

  /* Secondary Colors */
  --color-secondary-50: ${theme.colors.secondary[50]};
  --color-secondary-100: ${theme.colors.secondary[100]};
  --color-secondary-200: ${theme.colors.secondary[200]};
  --color-secondary-300: ${theme.colors.secondary[300]};
  --color-secondary-400: ${theme.colors.secondary[400]};
  --color-secondary-500: ${theme.colors.secondary[500]};
  --color-secondary-600: ${theme.colors.secondary[600]};
  --color-secondary-700: ${theme.colors.secondary[700]};
  --color-secondary-800: ${theme.colors.secondary[800]};
  --color-secondary-900: ${theme.colors.secondary[900]};

  /* Typography */
  --font-family-primary: '${theme.typography.fontFamily.primary}', system-ui, sans-serif;
  --font-family-secondary: '${theme.typography.fontFamily.secondary}', system-ui, sans-serif;
  --font-family-mono: '${theme.typography.fontFamily.mono}', monospace;

  /* Spacing */
  --spacing-xs: ${theme.spacing.xs};
  --spacing-sm: ${theme.spacing.sm};
  --spacing-md: ${theme.spacing.md};
  --spacing-lg: ${theme.spacing.lg};
  --spacing-xl: ${theme.spacing.xl};

  /* Border Radius */
  --radius-sm: ${theme.borderRadius.sm};
  --radius-md: ${theme.borderRadius.md};
  --radius-lg: ${theme.borderRadius.lg};
  --radius-xl: ${theme.borderRadius.xl};

  /* Shadows */
  --shadow-sm: ${theme.shadows.sm};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};
  --shadow-xl: ${theme.shadows.xl};
}

body {
  font-family: var(--font-family-primary);
  background-color: ${theme.colors.semantic.background};
  color: ${theme.colors.semantic.text.primary};
}
`;

    return css;
  }

  /**
   * รวม color scheme
   */
  private mergeColorScheme(base: ColorScheme, customizations?: Partial<ColorScheme>): ColorScheme {
    if (!customizations) return base;

    return {
      primary: { ...base.primary, ...customizations.primary },
      secondary: { ...base.secondary, ...customizations.secondary },
      accent: { ...base.accent, ...customizations.accent },
      neutral: { ...base.neutral, ...customizations.neutral },
      semantic: { ...base.semantic, ...customizations.semantic }
    };
  }

  /**
   * รวม typography
   */
  private mergeTypography(base: TypographyConfig, customizations?: Partial<TypographyConfig>): TypographyConfig {
    if (!customizations) return base;

    return {
      fontFamily: { ...base.fontFamily, ...customizations.fontFamily },
      fontSize: { ...base.fontSize, ...customizations.fontSize },
      fontWeight: { ...base.fontWeight, ...customizations.fontWeight },
      lineHeight: { ...base.lineHeight, ...customizations.lineHeight }
    };
  }

  /**
   * แปลงสีเป็น Tailwind class
   */
  private getColorClass(color: string, prefix: string): string {
    // นี่เป็นตัวอย่างง่ายๆ ในความเป็นจริงต้องมี mapping ที่ซับซ้อนกว่า
    if (color.includes('#0ea5e9')) return `${prefix}-sky-500`;
    if (color.includes('#10b981')) return `${prefix}-emerald-500`;
    if (color.includes('#64748b')) return `${prefix}-slate-500`;
    if (color.includes('#f59e0b')) return `${prefix}-amber-500`;
    if (color.includes('#3b82f6')) return `${prefix}-blue-500`;
    
    return `${prefix}-gray-500`; // fallback
  }

  /**
   * ตรวจสอบธีม
   */
  validateTheme(theme: Theme): boolean {
    // ตรวจสอบโครงสร้างธีม
    if (!theme.name || !theme.colors || !theme.typography) {
      return false;
    }

    // ตรวจสอบสี
    if (!theme.colors.primary || !theme.colors.secondary) {
      return false;
    }

    // ตรวจสอบ typography
    if (!theme.typography.fontFamily || !theme.typography.fontSize) {
      return false;
    }

    return true;
  }
}
