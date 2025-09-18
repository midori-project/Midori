/**
 * 🤖 OpenAI Provider Implementation
 * ย้าย logic จาก real-world-ai-test.ts มาเป็น production-ready
 */

import OpenAI from 'openai';
import { LLMProvider, LLMRequest, LLMResponse, TokenUsage } from './types';
import type { LLMError as ILLMError } from './types';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private client: OpenAI;
  private usage: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    cost: 0
  };

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple test call to verify API availability
      await this.client.models.list();
      return true;
    } catch (error) {
      console.warn('⚠️ OpenAI provider not available:', error);
      return false;
    }
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    const startTime = performance.now();
    
    try {
      // กำหนด model parameters
      const isGpt5 = request.model?.includes('gpt-5');
      const modelName = request.model || 'gpt-4o-mini';

      // GPT-5 models: Try Responses API first, fallback to Chat Completions
      if (isGpt5) {
        try {
          // For GPT‑5 models prefer Responses API and max_output_tokens
          const input = request.systemPrompt
            ? `${request.systemPrompt}\n\nUser: ${request.prompt}`
            : request.prompt;

          const responsesReq: any = {
            model: modelName,
            input,
            ...(request.maxCompletionTokens !== undefined && { max_output_tokens: request.maxCompletionTokens }),
            ...(request.maxTokens !== undefined && !request.maxCompletionTokens && { max_output_tokens: request.maxTokens }),
            ...(request.reasoning && { reasoning: request.reasoning }),
            ...(request.text && { text: request.text })
          };

          console.log('🧪 Trying GPT-5 via Responses API...', { model: modelName });
          const response: any = await (this.client as any).responses.create(responsesReq);
          const responseTime = performance.now() - startTime;

          // Prefer convenience accessor; fallback to traversing output
          const content: string | undefined = response?.output_text
            ?? (this as any).extractTextFromResponsesOutput(response);

          if (!content || content.trim() === '') {
            throw new LLMError('Empty response from OpenAI Responses API', 'EMPTY_RESPONSE', false);
          }

          // Usage mapping (Responses API may return input_tokens/output_tokens)
          if (response?.usage) {
            const usage: any = response.usage;
            const prompt_tokens = usage.prompt_tokens ?? usage.input_tokens ?? 0;
            const completion_tokens = usage.completion_tokens ?? usage.output_tokens ?? 0;
            const total_tokens = usage.total_tokens ?? (prompt_tokens + completion_tokens);

            this.usage.promptTokens += prompt_tokens;
            this.usage.completionTokens += completion_tokens;
            this.usage.totalTokens += total_tokens;
            this.usage.cost = this.calculateCost({ total_tokens }, modelName);
          }

          return {
            content,
            usage: response?.usage ? {
              prompt_tokens: response.usage.prompt_tokens ?? response.usage.input_tokens ?? 0,
              completion_tokens: response.usage.completion_tokens ?? response.usage.output_tokens ?? 0,
              total_tokens: response.usage.total_tokens ?? ((response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0))
            } : undefined,
            model: modelName,
            responseTime: Math.round(responseTime)
          };
        } catch (responseApiError) {
          console.warn('⚠️ Responses API failed, falling back to Chat Completions API:', responseApiError);
          // Fall through to Chat Completions API
        }
      }

      // Standard Chat Completions API for all models (including fallback from GPT-5)
      const requestConfig: any = {
        model: modelName,
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          { role: 'user', content: request.prompt }
        ],
        ...(request.temperature !== undefined && { temperature: request.temperature }),
        ...(request.reasoning && { reasoning: request.reasoning }),
        ...(request.text && { text: request.text })
      };

      // Set token limits based on model
      if (isGpt5) {
        requestConfig.max_completion_tokens = request.maxCompletionTokens || request.maxTokens || 8000;
      } else {
        requestConfig.max_tokens = request.maxTokens || 4000;
      }

      const response = await this.client.chat.completions.create(requestConfig);
      const responseTime = performance.now() - startTime;

      // Handle normal assistant text replies; ignore tool-only responses
      const content = response.choices?.[0]?.message?.content ?? '';
      if (!content || content.trim() === '') {
        throw new LLMError('Empty response from OpenAI', 'EMPTY_RESPONSE', false);
      }

      if (response.usage) {
        this.usage.promptTokens += response.usage.prompt_tokens;
        this.usage.completionTokens += response.usage.completion_tokens;
        this.usage.totalTokens += response.usage.total_tokens;
        this.usage.cost = this.calculateCost(response.usage, modelName);
      }

      return {
        content,
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        } : undefined,
        model: modelName,
        responseTime: Math.round(responseTime)
      };

    } catch (error: any) {
      const responseTime = performance.now() - startTime;
      
      if (error instanceof Error) {
        throw new LLMError(
          `OpenAI API Error: ${error.message}`,
          'OPENAI_ERROR',
          this.isRetryableError(error)
        );
      }
      
      throw new LLMError('Unknown OpenAI error', 'UNKNOWN_ERROR', false);
    }
  }

  getUsage(): TokenUsage {
    return { ...this.usage };
  }

  private calculateCost(usage: any, model: string): number {
    // Simplified cost calculation - should be updated with real pricing
    const costPerToken = model.includes('gpt-5') ? 0.00006 : 0.000002;
    return usage.total_tokens * costPerToken;
  }

  private isRetryableError(error: Error): boolean {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
    return retryableCodes.some(code => error.message.includes(code));
  }

  // Helper method to extract text from Responses API output structure
  private extractTextFromResponsesOutput(response: any): string | undefined {
    try {
      const output = response?.output;
      if (!Array.isArray(output)) return undefined;
      
      const texts: string[] = [];
      for (const part of output) {
        if (part?.type === 'output_text' || part?.type === 'text') {
          const t = part?.text;
          if (typeof t === 'string') {
            texts.push(t);
          } else if (t && typeof t === 'object' && typeof t.value === 'string') {
            texts.push(t.value);
          }
        }
      }
      
      return texts.join('\n').trim() || undefined;
    } catch {
      return undefined;
    }
  }
}

// Custom error class
class LLMError extends Error implements ILLMError {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'LLMError';
  }
}