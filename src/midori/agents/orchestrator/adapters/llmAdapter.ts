/**
 * 🎯 LLM Adapter - Main orchestrator LLM interface
 * จัดการ multiple providers และ fallback logic
 * Server-side version (ใช้ fs/promises ได้)
 */

import fs from "fs/promises";
import path from "path";
import * as yaml from "js-yaml";
import { OpenAIProvider } from "./openaiProvider";
import {
  LLMConfig,
  LLMProvider,
  LLMRequest,
  LLMResponse,
  TokenUsage,
} from "./types";

interface AgentConfig {
  model: LLMConfig;
}

export class LLMAdapter {
  private openaiProvider: OpenAIProvider | null = null;
  private config: LLMConfig | null = null;
  private systemPromptAll: string = "";

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
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        this.openaiProvider = new OpenAIProvider(apiKey);
      } else {
        console.warn("⚠️ OpenAI API key not found");
      }
    } catch (error) {
      console.warn("⚠️ Failed to initialize LLM providers:", error);
    }
  }

  async loadConfig(): Promise<void> {
    try {
      // รองรับกำหนดพาธผ่าน ENV, ถ้าไม่มีก็ลอง public ก่อน แล้วค่อย fallback ไป src
      const projectRoot = process.env.MIDORI_PROJECT_ROOT || process.cwd();
      const envPath = process.env.MIDORI_AGENT_CONFIG_PATH;
      const publicPath = path.join(
        projectRoot,
        "public/midori/agents/orchestrator/agent.yaml"
      );
      const srcPath = path.join(
        projectRoot,
        "src/midori/agents/orchestrator/agent.yaml"
      );

      const candidates = [envPath, publicPath, srcPath].filter(Boolean) as string[];

      let loaded: string | null = null;
      let lastError: any = null;
      for (const p of candidates) {
        try {
          const content = await fs.readFile(p, "utf-8");
          const agentConfig = yaml.load(content) as AgentConfig;
          this.config = agentConfig.model;
          loaded = p;
          break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!loaded) {
        throw lastError || new Error("Agent config file not found in any candidate paths");
      }
    } catch (error) {
      console.error("❌ Failed to load LLM config:", error);
      throw error;
    }
  }

  async loadSystemPrompts(): Promise<void> {
    try {
      const projectRoot = process.env.MIDORI_PROJECT_ROOT || process.cwd();
      const promptsPath = path.join(
        projectRoot,
        "src/midori/agents/orchestrator/prompts"
      );

      const prompts = [
        { key: "system", file: "system-prompt.md" },
        { key: "tasks", file: "task_templates.md" },
        { key: "guardrails", file: "guardrails.md" },
      ];

      const promptParts: string[] = [];
      for (const { key, file } of prompts) {
        try {
          const content = await fs.readFile(
            path.join(promptsPath, file),
            "utf-8"
          );
          promptParts.push(content);
        } catch (error) {
          console.warn(`⚠️ Failed to load ${file}:`, error);
        }
      }

      this.systemPromptAll = promptParts.join("\n\n");
    } catch (error) {
      console.error("❌ Failed to load system prompts:", error);
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
      responseFormat?: { type: 'json_object' | 'text' };  // ✅ เพิ่ม JSON mode
      reasoning?: {
        effort: "minimal" | "low" | "medium" | "high";
      };
      text?: {
        verbosity: "low" | "medium" | "high";
      };
    } = {}
  ): Promise<LLMResponse> {
    if (!this.config) {
      throw new Error("LLM config not loaded. Call initialize() first.");
    }

    const config = this.config;

    // Build system prompt
    const systemPrompt =
      options.useSystemPrompt !== false ? this.systemPromptAll : undefined;

    // Determine token limits based on model type
    const isGpt5 = (options.model || config.name).includes("gpt-5");
    const request: LLMRequest = {
      prompt,
      systemPrompt,
      model: options.model || config.name,
      temperature: options.temperature ?? config.temperature,
      maxTokens: isGpt5
        ? undefined
        : options.maxTokens || config.max_tokens || 4000,
      maxCompletionTokens: isGpt5
        ? options.maxCompletionTokens || config.max_completion_tokens || 8000
        : undefined,
      responseFormat: options.responseFormat,  // ✅ ส่ง responseFormat ไปด้วย
      reasoning: options.reasoning,
      text: options.text,
    };

    // Try primary provider with retry logic
    const modelName = request.model || "gpt-4o-mini";

    if (this.openaiProvider) {
      try {
        const response = await this.executeWithRetry(
          () => this.openaiProvider!.call(request),
          {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
          }
        );

        if (response?.content && response.content.trim() !== "") {
          return response;
        }

        console.warn(`⚠️ Empty response from ${modelName}, trying fallback`);
      } catch (error) {
        console.warn(`⚠️ Primary provider failed after retries:`, error);
      }
    }

    // Try fallback provider
    if (config.fallback && this.openaiProvider) {
      const fallbackModelName = config.fallback.name;

      try {
        console.log(`🔄 Falling back to ${fallbackModelName}...`);
        const fallbackRequest = {
          ...request,
          model: fallbackModelName,
          temperature: config.fallback.temperature,
        };

        const response = await this.executeWithRetry(
          () => this.openaiProvider!.call(fallbackRequest),
          {
            maxRetries: 2,
            baseDelay: 2000,
            maxDelay: 8000,
          }
        );

        if (response?.content && response.content.trim() !== "") {
          return response;
        }

        console.warn(`⚠️ Empty response from fallback ${fallbackModelName}`);
      } catch (error) {
        console.warn(`⚠️ Fallback provider failed after retries:`, error);
      }
    }

    // No providers available
    throw new Error(
      "No LLM providers available. Please configure OpenAI API key."
    );
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
    }
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Check if error is retryable using LLMError.retryable flag
        if (
          error &&
          typeof error === "object" &&
          "retryable" in error &&
          !error.retryable
        ) {
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

        console.warn(
          `🔄 Retry ${attempt + 1}/${options.maxRetries} in ${Math.round(
            finalDelay
          )}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, finalDelay));
      }
    }

    throw lastError;
  }

  getUsage(): TokenUsage | null {
    return this.openaiProvider?.getUsage() || null;
  }

  async isReady(): Promise<boolean> {
    return this.config !== null && this.systemPromptAll.length > 0;
  }

  /**
   * ได้ model name ปัจจุบัน
   */
  getCurrentModel(): string {
    return this.config?.name || "gpt-4o-mini";
  }
}
