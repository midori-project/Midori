/**
 * 🤖 OpenAI Provider Implementation
 * ย้าย logic จาก real-world-ai-test.ts มาเป็น production-ready
 */
import OpenAI from 'openai';
export class OpenAIProvider {
    constructor(apiKey) {
        this.name = 'openai';
        this.usage = {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            cost: 0
        };
        this.client = new OpenAI({ apiKey });
    }
    async isAvailable() {
        try {
            // Simple test call to verify API availability
            await this.client.models.list();
            return true;
        }
        catch (error) {
            console.warn('⚠️ OpenAI provider not available:', error);
            return false;
        }
    }
    async call(request) {
        const startTime = performance.now();
        try {
            // กำหนด model parameters
            const isGpt5 = request.model?.includes('gpt-5');
            const requestConfig = {
                model: request.model || 'gpt-4o-mini',
                messages: [
                    ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                    { role: 'user', content: request.prompt }
                ],
                temperature: request.temperature ?? 0.7,
            };
            // Set token limits based on model
            if (isGpt5) {
                requestConfig.max_completion_tokens = request.maxTokens || 8000;
            }
            else {
                requestConfig.max_tokens = request.maxTokens || 4000;
            }
            const response = await this.client.chat.completions.create(requestConfig);
            const responseTime = performance.now() - startTime;
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new LLMError('Empty response from OpenAI', 'EMPTY_RESPONSE', false);
            }
            // Track usage
            if (response.usage) {
                this.usage.promptTokens += response.usage.prompt_tokens;
                this.usage.completionTokens += response.usage.completion_tokens;
                this.usage.totalTokens += response.usage.total_tokens;
                this.usage.cost = this.calculateCost(response.usage, requestConfig.model);
            }
            return {
                content,
                usage: response.usage ? {
                    prompt_tokens: response.usage.prompt_tokens,
                    completion_tokens: response.usage.completion_tokens,
                    total_tokens: response.usage.total_tokens
                } : undefined,
                model: requestConfig.model,
                responseTime: Math.round(responseTime)
            };
        }
        catch (error) {
            const responseTime = performance.now() - startTime;
            if (error instanceof Error) {
                throw new LLMError(`OpenAI API Error: ${error.message}`, 'OPENAI_ERROR', this.isRetryableError(error));
            }
            throw new LLMError('Unknown OpenAI error', 'UNKNOWN_ERROR', false);
        }
    }
    getUsage() {
        return { ...this.usage };
    }
    calculateCost(usage, model) {
        // Simplified cost calculation - should be updated with real pricing
        const costPerToken = model.includes('gpt-5') ? 0.00006 : 0.000002;
        return usage.total_tokens * costPerToken;
    }
    isRetryableError(error) {
        const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
        return retryableCodes.some(code => error.message.includes(code));
    }
}
// Custom error class
class LLMError extends Error {
    constructor(message, code, retryable, statusCode) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.statusCode = statusCode;
        this.name = 'LLMError';
    }
}
