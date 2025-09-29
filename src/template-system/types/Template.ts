/**
 * Template System Type Definitions
 */

export interface Template {
  key: string;
  label: string;
  category: string;
  meta: TemplateMeta;
  tags: string[];
  initialVersion: TemplateVersion;
  placeholderConfig: PlaceholderConfig;
}

export interface TemplateMeta {
  description: string;
  engine: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  versioningPolicy: 'semver' | 'numeric';
  previewScreenshot?: string;
}

export interface TemplateVersion {
  version: number;
  semver: string;
  status: 'published' | 'draft';
  sourceFiles: SourceFile[];
  slots: Record<string, SlotConfig>;
  constraints: TemplateConstraints;
}

export interface SourceFile {
  path: string;
  type: 'code' | 'config' | 'asset' | 'style';
  encoding: 'utf8' | 'base64';
  content: string;
}

export interface SlotConfig {
  type: 'object' | 'list' | 'text' | 'image';
  component?: string;
  fields: FieldConfig[];
  style?: StyleConfig;
}

export interface FieldConfig {
  key: string;
  type: 'text' | 'number' | 'boolean' | 'image' | 'url' | 'email' | 'richtext' | 'list' | 'object';
  required?: boolean;
  default?: any;
  validators?: ValidatorConfig[];
  shape?: Record<string, FieldConfig>; // For object type
  itemShape?: FieldConfig; // For list type
}

export interface ValidatorConfig {
  kind: 'maxLength' | 'minLength' | 'maxItems' | 'minItems' | 'pattern' | 'range';
  value: any;
}

export interface StyleConfig {
  allowedClasses?: Record<string, string[]>;
}

export interface TemplateConstraints {
  a11y?: AccessibilityConstraints;
  layout?: LayoutConstraints;
  content?: ContentConstraints;
  assets?: AssetConstraints;
  performance?: PerformanceConstraints;
  security?: SecurityConstraints;
  i18n?: I18nConstraints;
  code?: CodeConstraints;
}

export interface AccessibilityConstraints {
  contrast: 'AA' | 'AAA';
  minFontSizePx: number;
  ariaRequired: boolean;
  keyboardNavigable: boolean;
}

export interface LayoutConstraints {
  breakpoints: string[];
  containerMaxWidth: number;
  minTapTargetPx: number;
}

export interface ContentConstraints {
  seo: {
    titleMaxLen: number;
    descMaxLen: number;
    requireH1: boolean;
    metaTags: string[];
  };
}

export interface AssetConstraints {
  [key: string]: {
    minWidth?: number;
    aspectRatio?: string;
  };
}

export interface PerformanceConstraints {
  maxImageKb: number;
  maxCriticalCssKb: number;
}

export interface SecurityConstraints {
  disallowInlineScript: boolean;
}

export interface I18nConstraints {
  noHardcodedText: boolean;
}

export interface CodeConstraints {
  tsc: boolean;
}

export interface PlaceholderConfig {
  hasPlaceholders: boolean;
  placeholderTypes: Record<string, number>;
  themeMapping: Record<string, string>;
}

export interface ProcessedTemplate {
  files: ProcessedFile[];
  manifest: ProjectManifest;
  metadata: TemplateMetadata;
  validation: ValidationResult;
}

export interface ProcessedFile {
  path: string;
  content: string;
  type: string;
  size: number;
  checksum: string;
}

export interface ProjectManifest {
  name: string;
  version: string;
  description: string;
  template: string;
  engine: string;
  files: number;
  generatedAt: string;
  theme: string;
  slots: Record<string, any>;
}

export interface TemplateMetadata {
  processingTime: number;
  placeholderCount: number;
  themeApplied: string;
  validationPassed: boolean;
  warnings: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface UserData {
  brandName?: string;
  theme?: string;
  content?: Record<string, any>;
  images?: Record<string, string>;
  slots?: Record<string, any>;
  customizations?: Record<string, any>;
}
