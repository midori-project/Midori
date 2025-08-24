// Types for OpenAI Question API - Microservice Architecture

export interface Completeness {
  score: number; // 0-100
  missingElements: string[];
  suggestions: string[];
  confidence: number; // 0-100
}

export interface QuestionStrategy {
  totalQuestions: number;
  questionTypes: string[];
  adaptiveQuestions: boolean;
  priorityQuestions: string[];
}

export interface EnhancedAnalysis {
  projectName?: string | null;
  projectType: string;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  coreFeatures: string[];
  targetAudience: string;
  designPreferences: {
    designStyle?: string;
  };
  missingElements: string[];
  questionStrategy: QuestionStrategy;
}

export interface Question {
  id: string;
  type: 'basic' | 'contextual' | 'followup';
  category: string;
  question: string;
  required: boolean;
  options?: string[];
  dependsOn?: string[];
  priority?: 'high' | 'medium' | 'low';
}

export interface UserAnswers {
  [questionId: string]: string | string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
}

export interface ConversationContext {
  previousAnswers: UserAnswers;
  analysis: EnhancedAnalysis;
  currentPhase: 'initial' | 'questions' | 'quality' | 'followup' | 'final';
}

export interface QualityAssessment {
  completeness: number; // 0-100
  clarity: number; // 0-100
  consistency: number; // 0-100
  confidence: number; // 0-100
  overallScore: number; // 0-100
  recommendations: string[];
  requiredFollowUps: string[];
}

export interface WebsiteConfig {
  name: string;
  type: string;
  features: string[];
  design: {
    designStyle: string;
    primaryColors: string[];
    secondaryColors: string[];
    typography: string;
    visualStyle: string;
  };
  content: {
    pages: string[];
    sections: string[];
  };
  functionality: {
    userManagement: boolean;
    payment: boolean;
    analytics: boolean;
    seo: boolean;
  };
  targetAudience: string;
  complexity: string;
  technical: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
}

export interface FinalOutput {
  json: WebsiteConfig;
  summary: {
    requirements: string[];
    recommendations: string[];
    estimatedTime: string;
    estimatedCost: string;
    risks: string[];
  };
  quality: QualityAssessment;
}

// API Request/Response Types
export interface OpenAIRequest {
  prompt: string;
  phase?: 'initial' | 'questions' | 'quality' | 'followup' | 'final';
  context?: ConversationContext;
  answers?: UserAnswers;
}

export interface OpenAIResponse {
  success: boolean;
  data?: EnhancedAnalysis | Question[] | QualityAssessment | FinalOutput;
  error?: string;
  phase?: string;
  nextAction?: string;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
}
