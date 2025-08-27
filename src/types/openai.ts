export interface AnalysisData {
  analysis?: {
    projectType: string;
    coreFeatures: string[];
    targetAudience: string;
    complexity: "simple" | "medium" | "complex";
    estimatedTokens: number;
    techStack: {
      frontend: string[];
      backend: string[];
      database: string[];
      deployment: string[];
    };
  };
  refinementQuestions?: string[];
  finalPrompt?: string;
  cached: boolean;
  cacheId?: string;
  modelUsed: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}

export interface UseOpenAIOptions {
  onSuccess?: (data: AnalysisData) => void;
  onError?: (error: string) => void;
} 