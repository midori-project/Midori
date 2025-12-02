/**
 * Project Context Types
 * Type definitions for project state management
 * ใช้ร่วมกับ SpecBundle (template spec) และ UiTemplate (template structure)
 */

import { ProjectType, ProjectStatus, ComponentType, PageType } from '@prisma/client';

// ============================
// Core Project Context Types
// ============================

export interface ProjectContextData {
  id: string;
  projectId: string;
  specBundleId: string;      // โยงกับ SpecBundle
  projectType: ProjectType;
  status: ProjectStatus;
  components: ComponentStateData[];
  pages: PageStateData[];
  styling: StylingStateData;
  conversationHistory: ConversationHistoryData;
  userPreferences: UserPreferencesData;
  preview?: PreviewData | null;  // ✅ Add preview data for Daytona integration
  // ✅ Add Frontend-V2 support
  frontendV2Data?: FrontendV2ProjectData | null;
  lastModified: Date;
  createdAt: Date;
}

export interface ComponentStateData {
  id: string;
  componentId: string;
  name: string;
  type: ComponentType;
  location: ComponentLocation;
  props: Record<string, any>;
  styling: ComponentStyling;
  metadata: ComponentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageStateData {
  id: string;
  pageId: string;
  name: string;
  path: string;
  type: PageType;
  components: string[]; // component IDs
  layout: LayoutConfig;
  metadata: PageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface StylingStateData {
  id: string;
  theme: ThemeConfig;
  colors: ColorPalette;
  fonts: FontConfig;
  spacing: SpacingConfig;
  breakpoints: BreakpointConfig;
  metadata: StylingMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationHistoryData {
  messages: ConversationMessage[];
  currentContext: string;
  lastIntent: string;
  lastAction: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferencesData {
  language: string;
  theme: string;
  autoSave: boolean;
  notifications: boolean;
  customSettings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================
// Supporting Types
// ============================

export interface ComponentLocation {
  page: string;
  section: string;
  position: number;
  parent?: string;
}

export interface ComponentStyling {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
}

export interface ComponentMetadata {
  version: string;
  lastModified: Date;
  createdBy: string;
  tags: string[];
  description?: string;
}

export interface LayoutConfig {
  type: 'grid' | 'flex' | 'absolute';
  columns?: number;
  gap?: string;
  padding?: string;
  margin?: string;
  responsive?: Record<string, any>;
}

export interface PageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  seo?: Record<string, any>;
  lastModified: Date;
  createdBy: string;
}

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
}

export interface ColorPalette {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  neutral: Record<string, string>;
  semantic: Record<string, string>;
}

export interface FontConfig {
  heading: {
    family: string;
    weights: number[];
    sizes: Record<string, string>;
  };
  body: {
    family: string;
    weights: number[];
    sizes: Record<string, string>;
  };
  mono: {
    family: string;
    weights: number[];
    sizes: Record<string, string>;
  };
}

export interface SpacingConfig {
  scale: 'linear' | 'exponential';
  base: number;
  units: Record<string, string>;
}

export interface BreakpointConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface StylingMetadata {
  version: string;
  lastModified: Date;
  createdBy: string;
  themeVersion: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================
// Service Input/Output Types
// ============================

export interface CreateProjectContextInput {
  projectId: string;
  specBundleId: string;
  projectType: ProjectType;
  status?: ProjectStatus;
  components?: ComponentStateData[];
  pages?: PageStateData[];
  styling?: StylingStateData;
  conversationHistory?: ConversationHistoryData;
  userPreferences?: UserPreferencesData;
}

export interface UpdateProjectContextInput {
  projectId: string;
  updates: {
    status?: ProjectStatus;
    components?: ComponentStateData[];
    pages?: PageStateData[];
    styling?: StylingStateData;
    conversationHistory?: ConversationHistoryData;
    userPreferences?: UserPreferencesData;
    preview?: PreviewData | null;  // ✅ Add preview updates
  };
}

export interface CreateComponentStateInput {
  projectId: string;
  componentId: string;
  name: string;
  type: ComponentType;
  location: ComponentLocation;
  props?: Record<string, any>;
  styling?: ComponentStyling;
  metadata?: ComponentMetadata;
}

export interface UpdateComponentStateInput {
  projectId: string;
  componentId: string;
  updates: {
    name?: string;
    location?: ComponentLocation;
    props?: Record<string, any>;
    styling?: ComponentStyling;
    metadata?: ComponentMetadata;
  };
}

export interface CreatePageStateInput {
  projectId: string;
  pageId: string;
  name: string;
  path: string;
  type: PageType;
  components?: string[];
  layout?: LayoutConfig;
  metadata?: PageMetadata;
}

export interface UpdatePageStateInput {
  projectId: string;
  pageId: string;
  updates: {
    name?: string;
    path?: string;
    components?: string[];
    layout?: LayoutConfig;
    metadata?: PageMetadata;
  };
}

export interface CreateStylingStateInput {
  projectId: string;
  theme?: ThemeConfig;
  colors?: ColorPalette;
  fonts?: FontConfig;
  spacing?: SpacingConfig;
  breakpoints?: BreakpointConfig;
  metadata?: StylingMetadata;
}

export interface UpdateStylingStateInput {
  projectId: string;
  updates: {
    theme?: ThemeConfig;
    colors?: ColorPalette;
    fonts?: FontConfig;
    spacing?: SpacingConfig;
    breakpoints?: BreakpointConfig;
    metadata?: StylingMetadata;
  };
}

export interface CreateConversationHistoryInput {
  projectId: string;
  messages?: ConversationMessage[];
  currentContext?: string;
  lastIntent?: string;
  lastAction?: string;
}

export interface UpdateConversationHistoryInput {
  projectId: string;
  updates: {
    messages?: ConversationMessage[];
    currentContext?: string;
    lastIntent?: string;
    lastAction?: string;
  };
}

export interface CreateUserPreferencesInput {
  projectId: string;
  language?: string;
  theme?: string;
  autoSave?: boolean;
  notifications?: boolean;
  customSettings?: Record<string, any>;
}

export interface UpdateUserPreferencesInput {
  projectId: string;
  updates: {
    language?: string;
    theme?: string;
    autoSave?: boolean;
    notifications?: boolean;
    customSettings?: Record<string, any>;
  };
}

// ============================
// Query Types
// ============================

export interface ProjectContextQuery {
  projectId?: string;
  specBundleId?: string;
  projectType?: ProjectType;
  status?: ProjectStatus;
  includeComponents?: boolean;
  includePages?: boolean;
  includeStyling?: boolean;
  includeConversationHistory?: boolean;
  includeUserPreferences?: boolean;
}

export interface ComponentStateQuery {
  projectId?: string;
  componentId?: string;
  type?: ComponentType;
  page?: string;
}

export interface PageStateQuery {
  projectId?: string;
  pageId?: string;
  type?: PageType;
  path?: string;
}

export interface ConversationHistoryQuery {
  projectId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'createdAt';
  order?: 'asc' | 'desc';
}

// ============================
// Preview Integration Types  
// ============================

export interface PreviewData {
  sandboxId: string;            // Daytona sandbox ID
  previewUrl: string;           // Live preview URL
  status: PreviewStatus;        // Current preview status
  error?: string;               // Error message if failed
  createdAt: Date;              // When preview was created
  lastUpdated: Date;            // Last time preview was updated
  metadata?: {
    projectType?: string;       // Type of project previewed
    templateUsed?: string;      // Template used for preview
    filesCount?: number;        // Number of files sent
    buildTime?: number;         // Time taken to build (ms)
  };
}

export type PreviewStatus = 
  | 'creating'      // Building the preview
  | 'running'       // Preview is live and accessible
  | 'error'         // Preview failed
  | 'stopped'       // Preview was manually stopped
  | 'expired';      // Preview expired (auto-cleanup)

// ============================
// Frontend-V2 Integration Types
// ============================

export interface FrontendV2ProjectData {
  businessCategory: string;
  projectType: string;
  templateUsed: string;
  blocksGenerated: string[];
  aiContentGenerated: boolean;
  customizationsApplied: string[];
  overridesApplied: string[];
  files: FrontendV2FileData[];
  projectStructure?: FrontendV2ProjectStructure | null;
  preview?: FrontendV2PreviewData | null;
  performance: FrontendV2PerformanceData;
  validation: FrontendV2ValidationData;
  metadata: FrontendV2Metadata;
}

export interface FrontendV2FileData {
  path: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'test' | 'documentation';
  size: number;
  blockId: string;
  customized: boolean;
}

export interface FrontendV2ProjectStructure {
  projectStructure: {
    name: string;
    type: string;
    description: string;
  };
  files: Array<{
    path: string;
    content: string;
    type: string;
    language: string;
  }>;
}

export interface FrontendV2PreviewData {
  url: string;
  sandboxId: string;
  status: 'pending' | 'ready' | 'error';
  error?: string;
  createdAt: string;
}

export interface FrontendV2PerformanceData {
  generationTime: number;
  templateRenderingTime: number;
  aiGenerationTime: number;
  totalFiles: number;
  totalSize: string;
}

export interface FrontendV2ValidationData {
  isValid: boolean;
  errors: Array<{
    type: string;
    message: string;
    file: string;
    line: number;
  }>;
  warnings: Array<{
    type: string;
    message: string;
    file: string;
  }>;
  accessibilityScore: number;
  typescriptErrors: number;
}

export interface FrontendV2Metadata {
  executionTime: number;
  timestamp: string;
  agent: string;
  version: string;
  templateSystemVersion?: string;
  aiModelUsed?: string;
  aiGeneratedData?: any;
}
