/**
 * Component Library Types
 * Type definitions for component-based architecture
 */

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'content' | 'navigation' | 'interaction' | 'visual' | 'form';
  tags: string[];
  variants: ComponentVariant[];
  propsSchema: Record<string, PropDefinition>;
  dependencies?: string[];
  preview?: ComponentPreview;
  metadata: ComponentMetadata;
}

export interface ComponentVariant {
  id: string;
  name: string;
  description: string;
  style: 'modern' | 'classic' | 'minimal' | 'luxury' | 'creative' | 'playful';
  layout: 'grid' | 'flex' | 'masonry' | 'centered' | 'split' | 'stacked';
  template: string;
  previewImage?: string;
  tags: string[];
  score?: number;
  propsSchema?: Record<string, any>; // Optional variant-specific props override
  metadata: VariantMetadata;
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum' | 'color' | 'image';
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: ValidationRule;
  placeholder?: string;
  examples?: any[];
}

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
  custom?: (value: any) => boolean;
  errorMessage?: string;
}

export interface ComponentPreview {
  thumbnail: string;
  screenshots: string[];
  demoUrl?: string;
  codeExample?: string;
}

export interface ComponentMetadata {
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  popularity: number;
  rating: number;
  downloads: number;
  usageCount: number;
}

export interface VariantMetadata {
  version: string;
  popularity: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================
// Component Selection Types
// ============================

export interface SelectionContext {
  businessCategory: string;
  subCategory?: string;
  userInput: string;
  keywords: string[];
  style: string[];
  tone: string;
  features: string[];
  preferences?: UserPreferences;
  constraints?: SelectionConstraints;
}

export interface UserPreferences {
  colorScheme?: 'warm' | 'cool' | 'neutral' | 'vibrant';
  layoutStyle?: 'modern' | 'classic' | 'minimal';
  complexity?: 'simple' | 'moderate' | 'complex';
  animations?: 'none' | 'subtle' | 'rich';
  language?: 'th' | 'en';
}

export interface SelectionConstraints {
  maxComponents?: number;
  minComponents?: number;
  requiredComponents?: string[];
  excludedComponents?: string[];
  performanceBudget?: number;
}

export interface ComponentScore {
  componentId: string;
  variantId: string;
  totalScore: number;
  scores: {
    domainMatch: number;
    styleMatch: number;
    toneMatch: number;
    featureMatch: number;
    popularityBonus: number;
    performanceScore: number;
  };
  reasoning: string[];
}

export interface ComponentSelection {
  selectedComponents: SelectedComponent[];
  selectionCriteria: SelectionCriteria;
  totalScore: number;
  alternatives?: AlternativeSelection[];
  reasoning: SelectionReasoning;
}

export interface SelectedComponent {
  componentId: string;
  variantId: string;
  slotId: string;
  score: number;
  reason: string;
  props?: Record<string, any>;
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
  differences?: string[];
}

export interface SelectionReasoning {
  summary: string;
  keyFactors: string[];
  tradeoffs?: string[];
  recommendations?: string[];
}

// ============================
// Component Registry Types
// ============================

export interface ComponentRegistry {
  components: Map<string, ComponentDefinition>;
  variants: Map<string, ComponentVariant[]>;
  categories: Map<string, string[]>; // category -> component IDs
  tags: Map<string, string[]>; // tag -> component IDs
  metadata: RegistryMetadata;
}

export interface RegistryMetadata {
  version: string;
  totalComponents: number;
  totalVariants: number;
  lastUpdated: string;
  statistics: RegistryStatistics;
}

export interface RegistryStatistics {
  mostPopular: string[];
  highestRated: string[];
  mostUsed: string[];
  recentlyAdded: string[];
}

// ============================
// Component Manifest Types
// ============================

export interface ComponentManifest {
  id: string;
  name: string;
  version: string;
  components: ComponentDefinition[];
  themes: ThemeDefinition[];
  blueprints: BlueprintDefinition[];
  metadata: ManifestMetadata;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  compatibleCategories: string[];
  variables: Record<string, any>;
}

export interface BlueprintDefinition {
  id: string;
  name: string;
  description: string;
  type: 'onepager' | 'multipage' | 'catalog' | 'schedule' | 'dashboard';
  compatibleCategories: string[];
  slots: BlueprintSlots;
}

export interface BlueprintSlots {
  header: SlotDefinition;
  hero: SlotDefinition;
  sections: SectionSlotDefinition;
  footer: SlotDefinition;
  sidebar?: SlotDefinition;
}

export interface SlotDefinition {
  required: boolean;
  max: number;
  min: number;
  allowedComponents?: string[];
  defaultComponent?: string;
  defaultVariant?: string;
}

export interface SectionSlotDefinition extends SlotDefinition {
  minSections: number;
  maxSections: number;
  recommendedOrder?: string[];
  allowedSections?: string[];
}

export interface ManifestMetadata {
  author: string;
  license: string;
  repository?: string;
  homepage?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================
// Component Analysis Types
// ============================

export interface ComponentAnalysis {
  compatibility: CompatibilityScore;
  performance: PerformanceAnalysis;
  accessibility: AccessibilityAnalysis;
  recommendations: ComponentRecommendations;
}

export interface CompatibilityScore {
  overall: number;
  details: {
    businessCategory: number;
    theme: number;
    blueprint: number;
    dependencies: number;
  };
}

export interface PerformanceAnalysis {
  bundleSize: number;
  renderTime: number;
  dependencies: string[];
  optimizationSuggestions: string[];
}

export interface AccessibilityAnalysis {
  score: number;
  issues: AccessibilityIssue[];
  warnings: AccessibilityWarning[];
  passed: boolean;
}

export interface AccessibilityIssue {
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  message: string;
  element?: string;
  suggestion: string;
}

export interface AccessibilityWarning {
  message: string;
  element?: string;
  suggestion?: string;
}

export interface ComponentRecommendations {
  suggested: string[];
  alternatives: string[];
  complementary: string[];
  reasoning: string;
}

