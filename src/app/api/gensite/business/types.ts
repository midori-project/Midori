export interface BusinessContext {
  industry: string;
  specificNiche: string;
  businessModel: string;
  keyDifferentiators: string[];
  targetAudience?: string;
  marketPosition?: string;
}

export interface EnhancedContentAnalysis {
  businessName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  tone: string;
  language: string;
  industrySpecificContent: Record<string, any>;
  colorPreferences: string[];
  layoutPreferences: string[];
  contentStyle: 'modern' | 'classic' | 'minimalist' | 'luxury' | 'bold' | 'elegant' | 'cozy' | 'creative';
  navigationItems: string[];
  socialLinks?: Record<string, string>;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
  };
}

export interface StyleConfiguration {
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string[];
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  layout: {
    spacing: 'compact' | 'comfortable' | 'spacious';
    borderRadius: 'none' | 'small' | 'medium' | 'large';
    shadows: 'none' | 'subtle' | 'medium' | 'strong';
  };
}

export interface EnhancedTemplate {
  baseTemplate: string;
  customizationPoints: string[];
  aiGenerationHints: string[];
  dynamicContentSlots: string[];
  styleVariations: string[];
}

export type FileType = 'config' | 'page' | 'component' | 'style' | 'util' | 'entry' | 'app';

export interface FileConfigLite {
  path: string;
  type: FileType;
}

export interface ProjectLike {
  name: string;
  fileStructure?: string[];
  description?: string;
  features?: string[];
}

export interface BusinessHandler {
  getEssentialFiles(project: ProjectLike): FileConfigLite[];
  templates: Record<string, (
    project: ProjectLike, 
    finalJson: Record<string, unknown>, 
    ctx: BusinessContext
  ) => string | Promise<string>>;
  getComponentRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string;
  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string;
  getEnhancedContentAnalysis?(finalJson: Record<string, unknown>, ctx: BusinessContext): EnhancedContentAnalysis;
  getStyleConfiguration?(finalJson: Record<string, unknown>, ctx: BusinessContext): StyleConfiguration;
}


