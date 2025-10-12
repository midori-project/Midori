/**
 * Enhanced Project Context Types
 * Extended types for component-based architecture
 */

import { ProjectContextData } from './projectContext';
import { ProjectType, ProjectStatus } from '@prisma/client';

// ============================
// Component Library Types
// ============================

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'content' | 'navigation' | 'interaction' | 'visual';
  tags: string[];
  variants: ComponentVariant[];
  propsSchema: Record<string, PropDefinition>;
  dependencies?: string[];
  metadata: ComponentMetadata;
}

export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  style: 'modern' | 'classic' | 'minimal' | 'luxury' | 'creative';
  layout: 'grid' | 'flex' | 'masonry' | 'centered' | 'split';
  template: string;
  previewImage?: string;
  tags: string[];
  score?: number; // For component selection
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: ValidationRule;
}

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
  custom?: (value: any) => boolean;
}

export interface ComponentMetadata {
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  popularity?: number;
  rating?: number;
}

// ============================
// Theme Pack Types
// ============================

export interface ThemePack {
  id: string;
  name: string;
  description: string;
  colorPalette: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  animations: AnimationConfig;
  responsive: ResponsiveConfig;
  metadata: ThemeMetadata;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
  custom?: Record<string, string>;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface TypographyConfig {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
    accent?: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface SpacingConfig {
  base: string;
  scale: number[];
}

export interface BorderRadiusConfig {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ShadowConfig {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface AnimationConfig {
  duration: {
    fast: string;
    base: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface ResponsiveConfig {
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

export interface ThemeMetadata {
  version: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================
// Blueprint Types
// ============================

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  type: 'onepager' | 'multipage' | 'catalog' | 'schedule' | 'dashboard';
  slots: {
    header: SlotConfig;
    hero: SlotConfig;
    sections: SectionSlotConfig;
    footer: SlotConfig;
  };
  rules: BlueprintRules;
  metadata: BlueprintMetadata;
}

export interface SlotConfig {
  required: boolean;
  max: number;
  min: number;
  allowedComponents?: string[];
  defaultComponent?: string;
}

export interface SectionSlotConfig extends SlotConfig {
  minSections: number;
  maxSections: number;
  recommendedOrder?: string[];
}

export interface BlueprintRules {
  tone?: string;
  seo?: SEOConfig;
  accessibility?: AccessibilityConfig;
  performance?: PerformanceConfig;
}

export interface SEOConfig {
  metaTitle: boolean;
  metaDescription: boolean;
  ogTags: boolean;
  structuredData: boolean;
}

export interface AccessibilityConfig {
  altText: boolean;
  ariaLabels: boolean;
  keyboardNavigation: boolean;
  colorContrast: boolean;
}

export interface PerformanceConfig {
  lazyLoading: boolean;
  imageOptimization: boolean;
  codesplitting: boolean;
  caching: boolean;
}

export interface BlueprintMetadata {
  version: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================
// Layout Types
// ============================

export interface LayoutConfig {
  type: 'single-column' | 'two-column' | 'three-column' | 'grid' | 'masonry';
  header: ComponentSlot;
  hero: ComponentSlot;
  sections: ComponentSlot[];
  footer: ComponentSlot;
  sidebar?: ComponentSlot;
  metadata: LayoutMetadata;
}

export interface ComponentSlot {
  slotId: string;
  componentId: string;
  variantId: string;
  props: Record<string, any>;
  position: number;
  visibility: 'always' | 'desktop-only' | 'mobile-only' | 'tablet-only';
  customStyles?: Record<string, any>;
}

export interface LayoutMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
}

// ============================
// Component Selection Types
// ============================

export interface ComponentSelection {
  selectedComponents: SelectedComponent[];
  selectionCriteria: SelectionCriteria;
  score: number;
  alternatives?: AlternativeSelection[];
}

export interface SelectedComponent {
  componentId: string;
  variantId: string;
  slotId: string;
  score: number;
  reason: string;
}

export interface SelectionCriteria {
  businessCategory: string;
  style: string[];
  tone: string;
  features: string[];
  userPreferences?: Record<string, any>;
}

export interface AlternativeSelection {
  components: SelectedComponent[];
  score: number;
  reason: string;
}

// ============================
// Enhanced Project Context
// ============================

export interface EnhancedProjectContextData extends ProjectContextData {
  // Component-based fields
  componentLibrary?: ComponentLibraryRef;
  themePack?: ThemePack;
  blueprint?: Blueprint;
  layout?: LayoutConfig;
  componentSelection?: ComponentSelection;
  
  // PageSpec (SSOT) integration
  pageSpec?: PageSpec;
  
  // Migration support
  migrationStatus: 'legacy' | 'migrated' | 'hybrid';
  legacyData?: LegacyTemplateData;
  
  // Version control
  version: string;
  schemaVersion: string;
  
  // Quality metrics
  quality?: QualityMetrics;
}

export interface ComponentLibraryRef {
  libraryId: string;
  version: string;
  components: string[]; // Component IDs
}

export interface PageSpec {
  domain: string;
  themePack: string;
  blueprint: string;
  slots: {
    header: ComponentSlot;
    hero: ComponentSlot;
    sections: ComponentSlot[];
    footer: ComponentSlot;
  };
  metadata: PageSpecMetadata;
}

export interface PageSpecMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
}

export interface LegacyTemplateData {
  concreteManifest?: any;
  templateMap?: Record<string, string>;
  businessCategory?: string;
  appliedOverrides?: string[];
}

export interface QualityMetrics {
  accessibility: AccessibilityScore;
  performance: PerformanceScore;
  seo: SEOScore;
  userExperience: UXScore;
  overallScore: number;
}

export interface AccessibilityScore {
  score: number;
  issues: string[];
  warnings: string[];
  passed: boolean;
}

export interface PerformanceScore {
  score: number;
  metrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  };
  passed: boolean;
}

export interface SEOScore {
  score: number;
  issues: string[];
  warnings: string[];
  passed: boolean;
}

export interface UXScore {
  score: number;
  factors: {
    navigation: number;
    readability: number;
    mobileResponsiveness: number;
    visualHierarchy: number;
  };
  passed: boolean;
}

// ============================
// Input Types
// ============================

export interface CreateEnhancedProjectContextInput {
  projectId: string;
  projectName: string;
  businessCategory: string;
  userInput: string;
  
  // Optional component-based inputs
  themePack?: ThemePack;
  blueprint?: Blueprint;
  componentSelection?: ComponentSelection;
  
  // Legacy support
  legacyData?: LegacyTemplateData;
  
  // Migration options
  migrationStatus?: 'legacy' | 'migrated' | 'hybrid';
}

export interface UpdateEnhancedProjectContextInput {
  projectId: string;
  
  // Updatable fields
  themePack?: ThemePack;
  blueprint?: Blueprint;
  layout?: LayoutConfig;
  componentSelection?: ComponentSelection;
  quality?: QualityMetrics;
  
  // Partial updates
  partialUpdate?: Partial<EnhancedProjectContextData>;
}

// ============================
// Migration Types
// ============================

export interface MigrationOptions {
  preserveLegacyData: boolean;
  validateAfterMigration: boolean;
  createBackup: boolean;
  dryRun: boolean;
}

export interface MigrationResult {
  success: boolean;
  projectId: string;
  migratedData: EnhancedProjectContextData;
  warnings: string[];
  errors: string[];
  metrics: {
    startTime: string;
    endTime: string;
    duration: number;
    dataSize: number;
  };
}

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
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationSummary {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  successRate: number;
}

