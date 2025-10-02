// Override System Types
// กำหนด types สำหรับ Concrete Manifest และระบบ Override

import { SharedBlock, PlaceholderConfig } from '../shared-blocks';
import { BusinessCategoryManifest, GlobalSettings } from '../business-categories';

// ===== Concrete Manifest Types =====

export interface ConcreteManifest {
  businessCategory: BusinessCategoryManifest;
  blocks: ConcreteBlock[];
  globalSettings: GlobalSettings;
  metadata: ConcreteManifestMetadata;
}

export interface ConcreteBlock {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  placeholders: Record<string, PlaceholderConfig>;
  appliedOverrides: string[];
  dependencies?: string[];
  metadata: ConcreteBlockMetadata;
}

export interface ConcreteManifestMetadata {
  version: string;
  generatedAt: string;
  businessCategoryId: string;
  totalBlocks: number;
  appliedOverrides: string[];
}

export interface ConcreteBlockMetadata {
  sourceBlockId: string;
  variantId?: string;
  appliedOverrides: string[];
  placeholderCount: number;
  templateLength: number;
}

// ===== Resolver Types =====

export interface ResolverConfig {
  sharedBlocks: SharedBlock[];
  businessCategories: BusinessCategoryManifest[];
  customOverrides?: OverrideConfig[];
}

export interface ResolverResult {
  concreteManifest: ConcreteManifest;
  templateMap: Record<string, string>;
  appliedOverrides: string[];
  processingTime: number;
}

// ===== Renderer Types =====

export interface RendererConfig {
  concreteManifest: ConcreteManifest;
  userData: Record<string, any>;
  validationEnabled?: boolean;
}

export interface RendererResult {
  files: Record<string, string>;
  appliedOverrides: string[];
  processingTime: number;
  validationResults?: ValidationResult;
}

// ===== Override Types =====

export interface OverrideConfig {
  blockId: string;
  variantId?: string;
  customizations: Record<string, any>;
  templateOverrides?: Record<string, string>;
  placeholderOverrides?: Record<string, any>;
  priority?: number;
}

export interface OverrideResult {
  blockId: string;
  finalTemplate: string;
  finalPlaceholders: Record<string, PlaceholderConfig>;
  appliedOverrides: string[];
  processingTime: number;
}

// ===== Validation Types =====

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  expected?: any;
  actual?: any;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationSummary {
  totalFields: number;
  validFields: number;
  errorFields: number;
  warningFields: number;
  successRate: number;
}

// ===== Error Types =====

export class OverrideError extends Error {
  constructor(
    message: string, 
    public code: string, 
    public details?: any
  ) {
    super(message);
    this.name = 'OverrideError';
  }
}

export class SchemaValidationError extends OverrideError {
  constructor(
    message: string, 
    public field: string, 
    public expected: any, 
    public actual: any
  ) {
    super(message, 'SCHEMA_VALIDATION_ERROR', { field, expected, actual });
  }
}

export class TemplateRenderError extends OverrideError {
  constructor(
    message: string, 
    public blockId: string, 
    public template: string
  ) {
    super(message, 'TEMPLATE_RENDER_ERROR', { blockId, template });
  }
}

export class ManifestResolutionError extends OverrideError {
  constructor(
    message: string, 
    public businessCategoryId: string, 
    public blockId?: string
  ) {
    super(message, 'MANIFEST_RESOLUTION_ERROR', { businessCategoryId, blockId });
  }
}

// ===== Logger Types =====

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  component: 'resolver' | 'renderer' | 'ai' | 'validation';
  message: string;
  data?: any;
}

export interface LoggerConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  includeData: boolean;
  maxEntries: number;
}

// ===== Utility Types =====

export interface ProcessingStats {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage?: number;
  steps: ProcessingStep[];
}

export interface ProcessingStep {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

export interface FileMapping {
  blockId: string;
  fileName: string;
  fileType: 'tsx' | 'css' | 'json' | 'js';
  size: number;
  checksum: string;
}

// ===== AI Integration Types =====

export interface AIPromptConfig {
  businessCategory: BusinessCategoryManifest;
  concreteManifest: ConcreteManifest;
  keywords: string[];
  customInstructions?: string;
}

export interface AIResponse {
  data: Record<string, any>;
  metadata: {
    model: string;
    temperature: number;
    tokens: number;
    processingTime: number;
  };
  validation: {
    isValid: boolean;
    errors: string[];
  };
}

// ===== Export All Types =====

export type {
  PlaceholderConfig,
  SharedBlock,
  BusinessCategoryManifest,
  GlobalSettings
} from '../shared-blocks';

export type {
  BusinessCategoryManifest as BusinessCategory,
  GlobalSettings as CategoryGlobalSettings
} from '../business-categories';
