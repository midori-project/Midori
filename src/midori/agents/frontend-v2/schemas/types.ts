/**
 * TypeScript Types for Frontend-V2 Agent
 */

export interface FrontendTaskV2 {
  taskId: string;
  taskType: 'generate_website' | 'customize_component' | 'create_page' | 'update_styling' | 'regenerate_content' | 'create_preview';
  businessCategory: string;
  keywords: string[];
  customizations?: {
    colors?: string[];
    theme?: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';
    layout?: 'single-page' | 'multi-page' | 'landing' | 'dashboard';
    features?: string[];
  };
  target?: string;
  includePreview?: boolean;
  includeProjectStructure?: boolean;
  projectType?: 'vite-react-typescript' | 'nextjs' | 'create-react-app';
  validation?: {
    enabled?: boolean;
    strictMode?: boolean;
    accessibilityLevel?: 'A' | 'AA' | 'AAA';
  };
  aiSettings?: {
    model?: 'gpt-5-nano' | 'gpt-4o-mini' | 'gpt-4o';
    temperature?: number;
    language?: 'th' | 'en' | 'auto';
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    userId?: string;
    projectId?: string;
    timestamp?: string;
    dependencies?: string[];
    tags?: string[];
  };
}

export interface ComponentResultV2 {
  success: boolean;
  result: {
    businessCategory: string;
    projectType: string; // เพิ่ม projectType ที่ Frontend-V2 detect ได้
    templateUsed: string;
    blocksGenerated: string[];
    aiContentGenerated: boolean;
    customizationsApplied: string[];
    overridesApplied: string[];
  };
  files: Array<{
    path: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'test' | 'documentation';
    size: number;
    blockId: string;
    customized: boolean;
  }>;
  preview?: {
    url: string;
    sandboxId: string;
    status: 'pending' | 'ready' | 'error';
    error?: string;
    createdAt: string;
  };
  projectStructure?: {
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
  };
  performance: {
    generationTime: number;
    templateRenderingTime: number;
    aiGenerationTime: number;
    totalFiles: number;
    totalSize: string;
  };
  validation: {
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
  };
  metadata: {
    executionTime: number;
    timestamp: string;
    agent: string;
    version: string;
    templateSystemVersion?: string;
    aiModelUsed?: string;
    aiGeneratedData?: any;
  };
  error?: {
    message: string;
    code: string;
    details: string;
    recoveryAttempted: boolean;
  };
}

export interface TemplateRequest {
  businessCategoryId: string;
  customOverrides: any[];
  userData: any;
  validationEnabled: boolean;
}

export interface PreviewConfig {
  enabled: boolean;
  service: 'daytona' | 'codesandbox' | 'stackblitz';
  autoOpen: boolean;
  timeout: number;
}
