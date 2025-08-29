// Types for OpenAI Question API - Microservice Architecture

export interface QuestionStrategy {
  totalQuestions: number;
  questionTypes: string[];
  adaptiveQuestions: boolean;
  priorityQuestions: string[];
  focusOnBackground?: boolean;
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
  // Detailed completeness information (score, missing elements, suggestions)
    completeness?: Completeness;
  missingElements: string[];
  isComplete?: boolean;
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

export interface ConversationContext {
  previousAnswers: UserAnswers;
  analysis: EnhancedAnalysis;
  currentPhase: 'initial' | 'questions' | 'final';
}

export interface ProjectObjective {
  primaryGoal: string;
  secondaryGoals: string[];
  businessValue: string;
  successMetrics: string[];
}

export interface TargetAudience {
  primaryAudience: string;
  secondaryAudience: string[];
  userNeeds: string[];
  userJourney: string;
}

export interface DesignConfig {
  designStyle: string;
  primaryColors: string[];
  secondaryColors: string[];
  typography: string;
  designRationale: string;
    // optional visualStyle used in UI components
    visualStyle?: string;
}

export interface ContentConfig {
  pages: string[];
  sections: string[];
  contentStrategy: string;
}

export interface ImplementationPriority {
  phase1: string[];
  phase2: string[];
  futureEnhancements: string[];
}

export interface WebsiteConfig {
  projectObjective: ProjectObjective;
  name: string;
  type: string;
  features: string[];
  design: DesignConfig;
  content: ContentConfig;
  functionality: {
    userManagement: boolean;
    payment: boolean;
    analytics: boolean;
    seo: boolean;
  };
  targetAudience: TargetAudience;
  complexity: string;
  technical?: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
}

export interface FinalOutput {
  json: WebsiteConfig;
    // optional human-readable summary produced by the OpenAI final stage
    summary?: Summary;
    // optional quality assessment produced by the OpenAI final stage
    quality?: Quality;
}
  // Additional types used by consumers in the app
  export interface Summary {
    requirements?: string[];
    recommendations?: string[];
    estimatedTime?: string;
    estimatedCost?: string;
    risks?: string[];
  }

  export interface Quality {
    completeness: number; // percentage 0-100
    clarity: number; // percentage
    consistency: number; // percentage
    overallScore: number; // percentage
  }

  // The 'Completeness' type referenced in EnhancedAnalysis
  export interface Completeness {
    score: number; // percentage 0-100
    missingItems?: string[];
    suggestions?: string[];
  }

// API Request/Response Types
export interface OpenAIRequest {
  prompt: string;
  phase?: 'initial' | 'questions' | 'final';
  context?: ConversationContext;
  answers?: UserAnswers;
}

export interface OpenAIResponse {
  success: boolean;
  data?: EnhancedAnalysis | Question[] | FinalOutput;
  error?: string;
  phase?: string;
  nextAction?: string;
}


