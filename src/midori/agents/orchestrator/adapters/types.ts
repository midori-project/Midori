/**
 * 🤖 LLM Adapter Types
 * Type definitions สำหรับ LLM integrations
 */

export interface LLMConfig {
  name: string;
  temperature: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  fallback?: {
    name: string;
    temperature: number;
  };
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  // 🎯 Response Configuration
  maxCompletionTokens?: number;
  responseFormat?: { type: 'json_object' | 'text' };  // ✅ เพิ่ม JSON mode
  reasoning?: {
    effort: 'minimal' | 'low' | 'medium' | 'high';
  };
  text?: {
    verbosity: 'low' | 'medium' | 'high';
  };
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  responseTime: number;
}

export interface LLMProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  call(request: LLMRequest): Promise<LLMResponse>;
  getUsage(): TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

export interface LLMError extends Error {
  code: string;
  statusCode?: number;
  retryable: boolean;
}