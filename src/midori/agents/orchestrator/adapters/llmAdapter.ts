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
  private unreliableModels: Set<string> = new Set(); // ติดตาม models ที่มีปัญหา

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
      maxTokens: options.maxTokens || config.max_completion_tokens || config.max_tokens
    };

    // Check if model is blacklisted
    const modelName = request.model || 'gpt-4o-mini';
    if (this.unreliableModels.has(modelName)) {
      console.warn(`⚠️ Model ${modelName} is blacklisted, skipping to fallback`);
    } else {
      // Try primary provider
      const primaryProvider = this.getProvider(modelName);
      if (primaryProvider && await primaryProvider.isAvailable()) {
        try {
          console.log(`🚀 Calling ${modelName}...`);
          const response = await primaryProvider.call(request);
          
          // Check for empty or invalid response
          if (!response?.content || response.content.trim() === '') {
            console.warn(`⚠️ Empty response from ${modelName}, marking as unreliable`);
            this.markModelAsUnreliable(modelName);
          } else {
            console.log(`✅ ${modelName} responded successfully`);
            return response;
          }
        } catch (error) {
          console.warn(`⚠️ Primary provider failed:`, error);
          this.markModelAsUnreliable(modelName);
          // Continue to fallback logic instead of re-throwing
        }
      }
    }

    // Try fallback provider
    if (config.fallback) {
      const fallbackModelName = config.fallback.name;
      
      // Check if fallback model is also blacklisted
      if (this.unreliableModels.has(fallbackModelName)) {
        console.warn(`⚠️ Fallback model ${fallbackModelName} is also blacklisted, trying alternative`);
        
        // Try gpt-4o-mini as last resort if it's not the current fallback
        if (fallbackModelName !== 'gpt-4o-mini' && !this.unreliableModels.has('gpt-4o-mini')) {
          const alternativeProvider = this.getProvider('gpt-4o-mini');
          if (alternativeProvider && await alternativeProvider.isAvailable()) {
            console.log(`🔄 Using alternative model: gpt-4o-mini`);
            const alternativeRequest = {
              ...request,
              model: 'gpt-4o-mini',
              // ใช้ temperature จาก fallback config หรือ default
              temperature: config.fallback?.temperature
            };
            return await alternativeProvider.call(alternativeRequest);
          }
        }
      } else {
        const fallbackProvider = this.getProvider(fallbackModelName);
        if (fallbackProvider && await fallbackProvider.isAvailable()) {
          console.log(`🔄 Falling back to ${fallbackModelName}...`);
          const fallbackRequest = {
            ...request,
            model: fallbackModelName,
            temperature: config.fallback.temperature
          };
          try {
            const response = await fallbackProvider.call(fallbackRequest);
            
            // Check fallback response quality too
            if (!response?.content || response.content.trim() === '') {
              console.warn(`⚠️ Empty response from fallback ${fallbackModelName}, marking as unreliable`);
              this.markModelAsUnreliable(fallbackModelName);
            } else {
              console.log(`✅ Fallback ${fallbackModelName} responded successfully`);
              return response;
            }
          } catch (error) {
            console.warn(`⚠️ Fallback provider failed:`, error);
            this.markModelAsUnreliable(fallbackModelName);
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
   * Mark a model as unreliable and blacklist it
   */
  private markModelAsUnreliable(modelName: string): void {
    this.unreliableModels.add(modelName);
    console.warn(`🚫 Model ${modelName} marked as unreliable and blacklisted`);
  }

  /**
   * Check if a model is blacklisted
   */
  private isModelReliable(modelName: string): boolean {
    return !this.unreliableModels.has(modelName);
  }

  /**
   * Reset model reliability tracking (for testing or recovery)
   */
  public resetModelReliability(): void {
    this.unreliableModels.clear();
    console.log('🔄 Model reliability tracking reset');
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