/**
 * 🤖 OpenAI Provider Implementation
 * ย้าย logic จาก real-world-ai-test.ts มาเป็น production-ready
 */
import { LLMProvider, LLMRequest, LLMResponse, TokenUsage } from './types';
export declare class OpenAIProvider implements LLMProvider {
    name: string;
    private client;
    private usage;
    constructor(apiKey: string);
    isAvailable(): Promise<boolean>;
    call(request: LLMRequest): Promise<LLMResponse>;
    getUsage(): TokenUsage;
    private calculateCost;
    private isRetryableError;
}
