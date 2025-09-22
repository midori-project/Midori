/**
 * Project Context Factory Tests
 * ทดสอบการสร้าง data structures
 */

import { ProjectContextFactory } from '../factories/projectContextFactory';
import { ComponentType, PageType } from '@prisma/client';

describe('ProjectContextFactory', () => {
  // ============================
  // Component Factory Tests
  // ============================

  describe('createComponentLocation', () => {
    test('สร้าง component location พื้นฐาน', () => {
      const location = ProjectContextFactory.createComponentLocation('home', 'main', 0);
      
      expect(location).toEqual({
        page: 'home',
        section: 'main',
        position: 0,
        parent: undefined
      });
    });

    test('สร้าง component location พร้อม parent', () => {
      const location = ProjectContextFactory.createComponentLocation(
        'home', 
        'sidebar', 
        1, 
        'sidebar-container'
      );
      
      expect(location).toEqual({
        page: 'home',
        section: 'sidebar',
        position: 1,
        parent: 'sidebar-container'
      });
    });
  });

  describe('createComponentStyling', () => {
    test('สร้าง component styling สำหรับ button', () => {
      const styling = ProjectContextFactory.createComponentStyling(ComponentType.button);
      
      expect(styling).toHaveProperty('colors');
      expect(styling).toHaveProperty('fonts');
      expect(styling).toHaveProperty('spacing');
      expect(styling).toHaveProperty('borders');
      expect(styling).toHaveProperty('shadows');
      
      // ตรวจสอบ default colors สำหรับ button
      expect(styling.colors).toHaveProperty('primary');
      expect(styling.colors).toHaveProperty('text');
    });

    test('สร้าง component styling พร้อม custom styling', () => {
      const customStyling = {
        colors: { primary: '#FF0000' },
        spacing: { padding: '1rem' }
      };
      
      const styling = ProjectContextFactory.createComponentStyling(
        ComponentType.button, 
        customStyling
      );
      
      expect(styling.colors.primary).toBe('#FF0000');
      expect(styling.spacing.padding).toBe('1rem');
    });
  });

  describe('createDefaultComponentProps', () => {
    test('สร้าง default props สำหรับ button', () => {
      const props = ProjectContextFactory.createDefaultComponentProps(ComponentType.button);
      
      expect(props).toEqual({
        text: 'Click me',
        variant: 'primary',
        size: 'medium'
      });
    });

    test('สร้าง default props สำหรับ header', () => {
      const props = ProjectContextFactory.createDefaultComponentProps(ComponentType.header);
      
      expect(props).toEqual({
        title: 'Website Title',
        showNavigation: true
      });
    });

    test('สร้าง default props สำหรับ component ที่ไม่มี', () => {
      const props = ProjectContextFactory.createDefaultComponentProps('unknown' as ComponentType);
      
      expect(props).toEqual({});
    });
  });

  // ============================
  // Page Factory Tests
  // ============================

  describe('createLayoutConfig', () => {
    test('สร้าง layout config พื้นฐาน', () => {
      const layout = ProjectContextFactory.createLayoutConfig();
      
      expect(layout).toEqual({
        type: 'grid',
        columns: 1,
        gap: '1rem',
        padding: '1rem',
        margin: '0',
        responsive: {
          sm: { columns: 1 },
          md: { columns: 2 },
          lg: { columns: 3 }
        }
      });
    });

    test('สร้าง layout config พร้อม custom config', () => {
      const customConfig = {
        type: 'flex' as const,
        columns: 2,
        gap: '2rem'
      };
      
      const layout = ProjectContextFactory.createLayoutConfig('flex', customConfig);
      
      expect(layout.type).toBe('flex');
      expect(layout.columns).toBe(2);
      expect(layout.gap).toBe('2rem');
    });
  });

  describe('createPageMetadata', () => {
    test('สร้าง page metadata พื้นฐาน', () => {
      const metadata = ProjectContextFactory.createPageMetadata(PageType.home, 'Home Page');
      
      expect(metadata).toEqual({
        title: 'Home Page',
        description: 'Home Page page',
        keywords: ['home', 'page'],
        seo: {
          title: 'Home Page',
          description: 'Home Page page',
          keywords: ['home', 'page']
        },
        lastModified: expect.any(Date),
        createdBy: 'system'
      });
    });
  });

  // ============================
  // Styling Factory Tests
  // ============================

  describe('createThemeConfig', () => {
    test('สร้าง theme config พื้นฐาน', () => {
      const theme = ProjectContextFactory.createThemeConfig();
      
      expect(theme).toEqual({
        name: 'default',
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#F59E0B',
        neutral: '#9CA3AF',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      });
    });

    test('สร้าง theme config พร้อม custom theme', () => {
      const customTheme = {
        primary: '#FF0000',
        secondary: '#00FF00'
      };
      
      const theme = ProjectContextFactory.createThemeConfig('custom', customTheme);
      
      expect(theme.name).toBe('custom');
      expect(theme.primary).toBe('#FF0000');
      expect(theme.secondary).toBe('#00FF00');
      expect(theme.accent).toBe('#F59E0B'); // default value
    });
  });

  describe('createColorPalette', () => {
    test('สร้าง color palette จาก theme', () => {
      const theme = ProjectContextFactory.createThemeConfig();
      const palette = ProjectContextFactory.createColorPalette(theme);
      
      expect(palette).toHaveProperty('primary');
      expect(palette).toHaveProperty('secondary');
      expect(palette).toHaveProperty('neutral');
      expect(palette).toHaveProperty('semantic');
      
      // ตรวจสอบ primary color scale
      expect(palette.primary).toHaveProperty('50');
      expect(palette.primary).toHaveProperty('500');
      expect(palette.primary).toHaveProperty('900');
      
      // ตรวจสอบ semantic colors
      expect(palette.semantic.success).toBe('#10B981');
      expect(palette.semantic.error).toBe('#EF4444');
    });
  });

  describe('createFontConfig', () => {
    test('สร้าง font config พื้นฐาน', () => {
      const fonts = ProjectContextFactory.createFontConfig();
      
      expect(fonts).toHaveProperty('heading');
      expect(fonts).toHaveProperty('body');
      expect(fonts).toHaveProperty('mono');
      
      // ตรวจสอบ heading fonts
      expect(fonts.heading.family).toBe('Inter');
      expect(fonts.heading.weights).toEqual([400, 500, 600, 700]);
      expect(fonts.heading.sizes).toHaveProperty('h1');
      expect(fonts.heading.sizes).toHaveProperty('h2');
    });
  });

  describe('createSpacingConfig', () => {
    test('สร้าง spacing config พื้นฐาน', () => {
      const spacing = ProjectContextFactory.createSpacingConfig();
      
      expect(spacing).toEqual({
        scale: 'linear',
        base: 4,
        units: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem',
          '4xl': '6rem'
        }
      });
    });
  });

  describe('createBreakpointConfig', () => {
    test('สร้าง breakpoint config พื้นฐาน', () => {
      const breakpoints = ProjectContextFactory.createBreakpointConfig();
      
      expect(breakpoints).toEqual({
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      });
    });
  });

  // ============================
  // Conversation History Factory Tests
  // ============================

  describe('createConversationHistory', () => {
    test('สร้าง conversation history พื้นฐาน', () => {
      const history = ProjectContextFactory.createConversationHistory();
      
      expect(history).toEqual({
        messages: [],
        currentContext: '',
        lastIntent: '',
        lastAction: '',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('สร้าง conversation history พร้อม custom data', () => {
      const customHistory = {
        currentContext: 'สร้างเว็บไซต์',
        lastIntent: 'create_website',
        lastAction: 'initialize_project'
      };
      
      const history = ProjectContextFactory.createConversationHistory(customHistory);
      
      expect(history.currentContext).toBe('สร้างเว็บไซต์');
      expect(history.lastIntent).toBe('create_website');
      expect(history.lastAction).toBe('initialize_project');
    });
  });

  // ============================
  // User Preferences Factory Tests
  // ============================

  describe('createUserPreferences', () => {
    test('สร้าง user preferences พื้นฐาน', () => {
      const preferences = ProjectContextFactory.createUserPreferences();
      
      expect(preferences).toEqual({
        language: 'th',
        theme: 'light',
        autoSave: true,
        notifications: true,
        customSettings: {},
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    test('สร้าง user preferences พร้อม custom data', () => {
      const customPreferences = {
        language: 'en',
        theme: 'dark',
        autoSave: false
      };
      
      const preferences = ProjectContextFactory.createUserPreferences(customPreferences);
      
      expect(preferences.language).toBe('en');
      expect(preferences.theme).toBe('dark');
      expect(preferences.autoSave).toBe(false);
      expect(preferences.notifications).toBe(true); // default value
    });
  });
});
