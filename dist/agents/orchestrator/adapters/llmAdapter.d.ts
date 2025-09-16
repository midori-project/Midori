/**
 * 🎯 LLM Adapter - Main orchestrator LLM interface
 * จัดการ multiple providers และ fallback logic
 */
import { LLMResponse, TokenUsage } from './types';
export declare class LLMAdapter {
    private providers;
    private config;
    private systemPrompts;
    constructor();
    private initializeProviders;
    loadConfig(): Promise<void>;
    loadSystemPrompts(): Promise<void>;
    callLLM(prompt: string, options?: {
        useSystemPrompt?: boolean;
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<LLMResponse>;
    private getProvider;
    getUsage(): Record<string, TokenUsage>;
    isReady(): Promise<boolean>;
}
