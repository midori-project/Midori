/**
 * Template System - Main Export
 * ระบบจัดการ Template สำหรับ Midori ที่ใช้ AI เติมข้อมูลลงใน template อย่างถูกต้อง
 */

// Core Components
export { TemplateEngine } from './core/TemplateEngine';
export { TemplateProcessor } from './core/TemplateProcessor';
export { PlaceholderReplacer } from './core/PlaceholderReplacer';
export { AIContentGenerator } from './core/AIContentGenerator';
export { ThemeEngine } from './core/ThemeEngine';
export { SlotManager } from './core/SlotManager';
export { TemplateValidator } from './core/TemplateValidator';

// Engines
export { ExportEngine } from './engines/ExportEngine';

// Types
export type {
  Template,
  TemplateMeta,
  TemplateVersion,
  SourceFile,
  SlotConfig,
  FieldConfig,
  ValidatorConfig,
  StyleConfig,
  TemplateConstraints,
  AccessibilityConstraints,
  LayoutConstraints,
  ContentConstraints,
  AssetConstraints,
  PerformanceConstraints,
  SecurityConstraints,
  I18nConstraints,
  CodeConstraints,
  PlaceholderConfig,
  ProcessedTemplate,
  ProcessedFile,
  ProjectManifest,
  TemplateMetadata,
  ValidationResult,
  UserData
} from './types/Template';

export type {
  Placeholder,
  PlaceholderType,
  PlaceholderContext,
  PlaceholderMatch,
  PlaceholderReplacement,
  PlaceholderConfig as PlaceholderConfigType,
  TailwindPlaceholder,
  TextPlaceholder,
  ImagePlaceholder,
  DataPlaceholder,
  SlotPlaceholder,
  PlaceholderProcessor,
  PlaceholderRegistry
} from './types/Placeholder';

export type {
  Theme,
  ColorScheme,
  ColorPalette,
  SemanticColors,
  TypographyConfig,
  FontSizeConfig,
  FontWeightConfig,
  LineHeightConfig,
  SpacingConfig,
  BorderRadiusConfig,
  ShadowConfig,
  BreakpointConfig,
  ThemeMapping,
  ThemeContext,
  ThemeCustomizations,
  ThemeProcessor,
  ThemeRegistry
} from './types/Theme';

// Export Engine Types
export type {
  ExportOptions,
  ExportResult
} from './engines/ExportEngine';

// Template Engine Types
export type {
  TemplateEngineOptions,
  TemplateEngineResult
} from './core/TemplateEngine';

// AI Content Generator Types
export type {
  AIGeneratedContent,
  FeatureContent,
  AboutContent,
  TeamMember,
  ContactContent,
  ProductContent,
  ProductCategory,
  Product,
  SEOContent
} from './core/AIContentGenerator';

// Slot Manager Types
export type {
  FilledSlot,
  SlotValidationResult
} from './core/SlotManager';

// Template Validator Types
export type {
  ValidationRule,
  ValidationIssue
} from './core/TemplateValidator';

// Utility Functions
export const createTemplateEngine = (options?: any) => new TemplateEngine(options);
export const createExportEngine = (outputDir?: string) => new ExportEngine(outputDir);

// Version Information
export const VERSION = '1.0.0';
export const DESCRIPTION = 'Template System for Midori - AI-powered template processing';

// Default Configuration
export const DEFAULT_CONFIG = {
  outputDir: './output',
  autoExport: true,
  exportFormat: 'zip' as const,
  includeManifest: true,
  includeMetadata: false
};

// Available Themes
export const AVAILABLE_THEMES = ['modern', 'cozy', 'minimal'];

// Supported Export Formats
export const SUPPORTED_EXPORT_FORMATS = ['zip', 'files', 'json'] as const;

// Business Types for AI Content Generation
export const BUSINESS_TYPES = [
  'food',
  'fashion', 
  'technology',
  'health',
  'general'
] as const;

// Placeholder Types
export const PLACEHOLDER_TYPES = [
  'tw',
  'text',
  'img',
  'data',
  'slot'
] as const;

// Validation Severity Levels
export const VALIDATION_SEVERITY = [
  'error',
  'warning',
  'info'
] as const;

// Template Categories
export const TEMPLATE_CATEGORIES = [
  'e-commerce',
  'restaurant',
  'portfolio',
  'blog',
  'landing-page',
  'business',
  'personal',
  'hotel',
  'healthcare'
] as const;

// Engine Types
export const ENGINE_TYPES = [
  'react-vite-tailwind',
  'nextjs',
  'vue-nuxt',
  'angular',
  'svelte'
] as const;

// Main Template System Class
export class TemplateSystem {
  private engine: TemplateEngine;
  private exportEngine: ExportEngine;

  constructor(options?: any) {
    this.engine = new TemplateEngine(options);
    this.exportEngine = new ExportEngine(options?.outputDir || './output');
  }

  /**
   * ประมวลผล template
   */
  async processTemplate(template: Template, userData: UserData) {
    return await this.engine.processTemplate(template, userData);
  }

  /**
   * ส่งออก template
   */
  async exportTemplate(template: ProcessedTemplate, options: ExportOptions) {
    return await this.exportEngine.exportTemplate(template, options);
  }

  /**
   * ตรวจสอบ template
   */
  async validateTemplate(template: Template) {
    return await this.engine.validateTemplate(template);
  }

  /**
   * ดึงข้อมูลสถิติ
   */
  getStats() {
    return this.engine.getStats();
  }
}

// Default Export
export default TemplateSystem;

// Quick Start Functions
export const quickStart = {
  /**
   * สร้าง template engine พร้อมการตั้งค่าเริ่มต้น
   */
  createEngine: (options?: any) => new TemplateEngine(options),
  
  /**
   * สร้างข้อมูลผู้ใช้ตัวอย่าง
   */
  createSampleUserData: (businessType: string = 'general') => {
    const engine = new TemplateEngine();
    return engine.generateSampleUserData(businessType);
  },
  
  /**
   * สร้าง template ตัวอย่าง
   */
  createSampleTemplate: () => ({
    key: 'sample-template',
    label: 'Sample Template',
    category: 'e-commerce',
    meta: {
      description: 'A sample template for testing',
      engine: 'react-vite-tailwind',
      status: 'published' as const,
      author: 'Midori Team',
      versioningPolicy: 'semver' as const
    },
    tags: ['sample', 'test'],
    initialVersion: {
      version: 1,
      semver: '1.0.0',
      status: 'published' as const,
      sourceFiles: [],
      slots: {},
      constraints: {}
    },
    placeholderConfig: {
      hasPlaceholders: true,
      placeholderTypes: { tw: 0, text: 0, img: 0, data: 0 },
      themeMapping: {}
    }
  }),
  
  /**
   * รันตัวอย่างพื้นฐาน
   */
  runBasicExample: async () => {
    const { basicUsageExample } = await import('./examples/basic-usage');
    return await basicUsageExample();
  },
  
  /**
   * รันตัวอย่างขั้นสูง
   */
  runAdvancedExample: async () => {
    const { advancedUsageExample } = await import('./examples/advanced-usage');
    return await advancedUsageExample();
  }
};

// Error Classes
export class TemplateError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TemplateError';
  }
}

export class ValidationError extends TemplateError {
  constructor(message: string, public validationErrors: string[] = []) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ExportError extends TemplateError {
  constructor(message: string, public exportPath?: string) {
    super(message, 'EXPORT_ERROR');
    this.name = 'ExportError';
  }
}

export class ThemeError extends TemplateError {
  constructor(message: string, public themeName?: string) {
    super(message, 'THEME_ERROR');
    this.name = 'ThemeError';
  }
}

// Constants
export const CONSTANTS = {
  VERSION,
  DESCRIPTION,
  DEFAULT_CONFIG,
  AVAILABLE_THEMES,
  SUPPORTED_EXPORT_FORMATS,
  BUSINESS_TYPES,
  PLACEHOLDER_TYPES,
  VALIDATION_SEVERITY,
  TEMPLATE_CATEGORIES,
  ENGINE_TYPES
} as const;
