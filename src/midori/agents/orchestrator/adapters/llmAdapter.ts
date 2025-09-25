/**
 * 🎯 LLM Adapter - Main orchestrator LLM interface
 * จัดการ multiple providers และ fallback logic
 * Server-side version (ใช้ fs/promises ได้)
 */

import fs from 'fs/promises';
import path from 'path';
import * as yaml from 'js-yaml';
import { OpenAIProvider } from './openaiProvider';
import { LLMConfig, LLMProvider, LLMRequest, LLMResponse, TokenUsage } from './types';

interface AgentConfig {
  model: LLMConfig;
}

export class LLMAdapter {
  private providers: Map<string, LLMProvider> = new Map();
  private config: LLMConfig | null = null;
  private systemPrompts: Map<string, string> = new Map();

  constructor() {
    // ไม่ auto-initialize ใน constructor - ให้เรียก init methods แยก
  }

  async initialize(): Promise<void> {
    await this.initializeProviders();
    await this.loadConfig(); 
    await this.loadSystemPrompts();
  }

  private async initializeProviders(): Promise<void> {
    try {
      // Initialize OpenAI provider
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        const openaiProvider = new OpenAIProvider(apiKey);
        this.providers.set('openai', openaiProvider);
        console.log('✅ OpenAI provider initialized');
      } else {
        console.warn('⚠️ OpenAI API key not found');
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize LLM providers:', error);
    }
  }

  async loadConfig(): Promise<void> {
    try {
      // Use absolute path เพื่อแก้ปัญหา path เมื่อรันจาก directory อื่น
      const projectRoot = process.env.MIDORI_PROJECT_ROOT || process.cwd();
      console.log('🔍 Loading config from:', { projectRoot, cwd: process.cwd() });
      const configPath = path.join(projectRoot, 'src/midori/agents/orchestrator/agent.yaml');
      console.log('📄 Config path:', configPath);
      const configFile = await fs.readFile(configPath, 'utf-8');
      const agentConfig = yaml.load(configFile) as AgentConfig;
      
      this.config = agentConfig.model;
      console.log('⚙️ LLM config loaded:', {
        model: this.config.name,
        temperature: this.config.temperature,
        fallback: this.config.fallback?.name
      });
    } catch (error) {
      console.error('❌ Failed to load LLM config:', error);
      throw error;
    }
  }

  async loadSystemPrompts(): Promise<void> {
    try {
      const promptsPath = path.join(process.cwd(), 'src/midori/agents/orchestrator/prompts');
      
      const prompts = [
        { key: 'system', file: 'system-prompt.md' },
        { key: 'tasks', file: 'task_templates.md' },
        { key: 'guardrails', file: 'guardrails.md' }
      ];

      for (const { key, file } of prompts) {
        try {
          const content = await fs.readFile(path.join(promptsPath, file), 'utf-8');
          this.systemPrompts.set(key, content);
        } catch (error) {
          console.warn(`⚠️ Failed to load ${file}:`, error);
        }
      }

      console.log('✅ System prompts loaded:', Array.from(this.systemPrompts.keys()));
    } catch (error) {
      console.error('❌ Failed to load system prompts:', error);
      throw error;
    }
  }

  async callLLM(
    prompt: string, 
    options: {
      useSystemPrompt?: boolean;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      maxCompletionTokens?: number;
      reasoning?: {
        effort: 'minimal' | 'low' | 'medium' | 'high';
      };
      text?: {
        verbosity: 'low' | 'medium' | 'high';
      };
    } = {}
  ): Promise<LLMResponse> {
    if (!this.config) {
      throw new Error('LLM config not loaded. Call initialize() first.');
    }

    const config = this.config;

    // Build system prompt
    let systemPrompt = '';
    if (options.useSystemPrompt !== false) {
      const systemContent = this.systemPrompts.get('system') || '';
      const tasksContent = this.systemPrompts.get('tasks') || '';
      const guardrailsContent = this.systemPrompts.get('guardrails') || '';
      systemPrompt = `${systemContent}\n\n${tasksContent}\n\n${guardrailsContent}`;
    }

    const request: LLMRequest = {
      prompt,
      systemPrompt: systemPrompt || undefined,
      model: options.model || config.name,
      temperature: options.temperature ?? config.temperature,
      maxTokens: options.maxTokens || config.max_completion_tokens || config.max_tokens,
      maxCompletionTokens: options.maxCompletionTokens,
      reasoning: options.reasoning,
      text: options.text
    };

    // Try primary provider with retry logic
    const modelName = request.model || 'gpt-4o-mini';
    const primaryProvider = this.getProvider(modelName);
    
    if (primaryProvider && await primaryProvider.isAvailable()) {
      try {
        console.log(`🚀 Calling ${modelName}...`);
        const response = await this.executeWithRetry(
          () => primaryProvider.call(request),
          {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
            retryableErrors: ['timeout', 'rate_limit', 'api_error', 'network_error']
          }
        );
        
        // Check for empty or invalid response
        if (!response?.content || response.content.trim() === '') {
          console.warn(`⚠️ Empty response from ${modelName}, trying fallback`);
        } else {
          console.log(`✅ ${modelName} responded successfully`);
          return response;
        }
      } catch (error) {
        console.warn(`⚠️ Primary provider failed after retries:`, error);
        // Continue to fallback logic instead of re-throwing
      }
    }

    // Try fallback provider
    if (config.fallback) {
      const fallbackModelName = config.fallback.name;
      
      const fallbackProvider = this.getProvider(fallbackModelName);
      if (fallbackProvider && await fallbackProvider.isAvailable()) {
        try {
          console.log(`🔄 Falling back to ${fallbackModelName}...`);
          const fallbackRequest = {
            ...request,
            model: fallbackModelName,
            temperature: config.fallback.temperature
          };
          
          const response = await this.executeWithRetry(
            () => fallbackProvider.call(fallbackRequest),
            {
              maxRetries: 2,
              baseDelay: 2000,
              maxDelay: 8000,
              retryableErrors: ['timeout', 'rate_limit', 'api_error', 'network_error']
            }
          );
          
          // Check fallback response quality
          if (!response?.content || response.content.trim() === '') {
            console.warn(`⚠️ Empty response from fallback ${fallbackModelName}, trying alternative`);
          } else {
            console.log(`✅ Fallback ${fallbackModelName} responded successfully`);
            return response;
          }
        } catch (error) {
          console.warn(`⚠️ Fallback provider failed after retries:`, error);
        }
      }
      
      // Try alternative model as last resort
      if (fallbackModelName !== 'gpt-4o-mini') {
        console.log(`🔄 Trying alternative model: gpt-4o-mini`);
        const alternativeProvider = this.getProvider('gpt-4o-mini');
        if (alternativeProvider && await alternativeProvider.isAvailable()) {
          try {
            const alternativeRequest = {
              ...request,
              model: 'gpt-4o-mini',
              temperature: 0.3
            };
            
            const response = await this.executeWithRetry(
              () => alternativeProvider.call(alternativeRequest),
              {
                maxRetries: 1,
                baseDelay: 3000,
                maxDelay: 5000,
                retryableErrors: ['timeout', 'rate_limit', 'api_error', 'network_error']
              }
            );
            
            if (response?.content && response.content.trim() !== '') {
              console.log(`✅ Alternative gpt-4o-mini responded successfully`);
              return response;
            }
          } catch (error) {
            console.warn(`⚠️ Alternative provider failed:`, error);
          }
        }
      }
    }

    // Fallback to mock response if no providers available
    console.warn('⚠️ No LLM providers available, using mock response');
    return {
      content: `ขออภัยครับ ตอนนี้ระบบ AI ยังไม่พร้อมใช้งาน กรุณาตั้งค่า OpenAI API key ก่อนครับ

สำหรับคำสั่ง: "${prompt}"

หากต้องการใช้งานจริง กรุณาเพิ่ม OPENAI_API_KEY ใน environment variables ครับ`,
      usage: {
        prompt_tokens: prompt.length / 4,
        completion_tokens: 50,
        total_tokens: prompt.length / 4 + 50
      },
      model: request.model || 'mock',
      responseTime: 100
    };
  }

  private getProvider(modelName: string): LLMProvider | undefined {
    // Simple mapping - can be enhanced
    if (modelName.includes('gpt') || modelName.includes('openai')) {
      return this.providers.get('openai');
    }
    return undefined;
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries: number;
      baseDelay: number;
      maxDelay: number;
      retryableErrors: string[];
    }
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.isRetryableError(error, options.retryableErrors)) {
          throw error;
        }
        
        if (attempt === options.maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          options.baseDelay * Math.pow(2, attempt),
          options.maxDelay
        );
        const jitter = Math.random() * 0.1 * delay;
        const finalDelay = delay + jitter;
        
        console.log(`🔄 Retry ${attempt + 1}/${options.maxRetries} in ${Math.round(finalDelay)}ms`);
        await new Promise(resolve => setTimeout(resolve, finalDelay));
      }
    }
    
    throw lastError;
  }
  
  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any, retryableErrors: string[]): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    return retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase())
    );
  }

  getUsage(): Record<string, TokenUsage> {
    const usage: Record<string, TokenUsage> = {};
    for (const [name, provider] of this.providers) {
      usage[name] = provider.getUsage();
    }
    return usage;
  }

  async isReady(): Promise<boolean> {
    return this.config !== null && this.systemPrompts.size > 0;
  }

  /**
   * ได้ model name ปัจจุบัน
   */
  getCurrentModel(): string {
    return this.config?.name || 'gpt-4o-mini';
  }

  /**
   * ตรวจสอบว่า model ปัจจุบันมีข้อจำกัดอะไรบ้าง
   */
  getModelConstraints(): { requiresDefaultTemperature?: boolean } {
    const model = this.getCurrentModel();
    
    if (model.includes('gpt-5-nano')) {
      return { requiresDefaultTemperature: true };
    }
    
    return {};
  }
}