export type { GeneratedFile } from '@/types/sitegen';

// User Intent Analysis Types
export interface UserIntent {
  visualStyle: string;
  colorScheme: string;
  layoutPreference: string;
  features: string[];
  pages: string[];
  targetAudience: string;
  tone: string;
  complexity: string;
}

export interface BusinessContext {
  industry: string;
  specificNiche: string;
  targetAudience: string;
  businessModel: string;
  keyDifferentiators: string[];
}

// File Configuration Types
export interface FileConfig {
  path: string;
  type: 'config' | 'page' | 'component' | 'style' | 'util' | 'entry' | 'app';
}

// Project Structure Types
export interface ProjectStructure {
  name: string;
  description: string;
  framework: string;
  type: string;
  pages: string[];
  components: string[];
  features: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  fileStructure: string[];
  industry?: string;
  targetAudience?: string;
}

// OpenAI Service Types
export interface OpenAIRequestParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_completion_tokens?: number;
  temperature?: number;
}

// Generation Options
export interface GenerationOptions {
  framework: string;
  styling: string;
  typescript: boolean;
  features: string[];
  pages: string[];
}

// Conversation Context Types
export interface ConversationContext {
  businessType: string;
  userIntent: string;
  specificRequirements: string[];
  industryKeywords: string[];
  targetMarket: string;
}
