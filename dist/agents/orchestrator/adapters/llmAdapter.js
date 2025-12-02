/**
 * 🎯 LLM Adapter - Main orchestrator LLM interface
 * จัดการ multiple providers และ fallback logic
 */
import fs from 'fs/promises';
import path from 'path';
import * as yaml from 'js-yaml';
import { OpenAIProvider } from './openaiProvider';
export class LLMAdapter {
    constructor() {
        this.providers = new Map();
        this.config = null;
        this.systemPrompts = new Map();
        this.initializeProviders();
    }
    async initializeProviders() {
        try {
            // Initialize OpenAI provider
            const apiKey = process.env.OPENAI_API_KEY;
            if (apiKey) {
                const openaiProvider = new OpenAIProvider(apiKey);
                this.providers.set('openai', openaiProvider);
                console.log('✅ OpenAI provider initialized');
            }
        }
        catch (error) {
            console.warn('⚠️ Failed to initialize LLM providers:', error);
        }
    }
    async loadConfig() {
        try {
            const configPath = path.join(process.cwd(), 'src/midori/agents/orchestrator/agent.yaml');
            const configFile = await fs.readFile(configPath, 'utf-8');
            const agentConfig = yaml.load(configFile);
            this.config = agentConfig.model;
            console.log('⚙️ LLM config loaded:', {
                model: this.config.name,
                temperature: this.config.temperature,
                fallback: this.config.fallback?.name
            });
        }
        catch (error) {
            console.error('❌ Failed to load LLM config:', error);
            throw error;
        }
    }
    async loadSystemPrompts() {
        try {
            const promptsPath = path.join(process.cwd(), 'src/midori/agents/orchestrator/prompts');
            const prompts = [
                { key: 'system', file: 'system-prompt.md' },
                { key: 'tasks', file: 'task-templates.md' },
                { key: 'guardrails', file: 'guardrails.md' }
            ];
            for (const { key, file } of prompts) {
                try {
                    const content = await fs.readFile(path.join(promptsPath, file), 'utf-8');
                    this.systemPrompts.set(key, content);
                }
                catch (error) {
                    console.warn(`⚠️ Failed to load ${file}:`, error);
                }
            }
            console.log('✅ System prompts loaded:', Array.from(this.systemPrompts.keys()));
        }
        catch (error) {
            console.error('❌ Failed to load system prompts:', error);
            throw error;
        }
    }
    async callLLM(prompt, options = {}) {
        if (!this.config) {
            throw new Error('LLM config not loaded. Call loadConfig() first.');
        }
        // Build system prompt
        let systemPrompt = '';
        if (options.useSystemPrompt !== false) {
            const systemContent = this.systemPrompts.get('system') || '';
            const tasksContent = this.systemPrompts.get('tasks') || '';
            const guardrailsContent = this.systemPrompts.get('guardrails') || '';
            systemPrompt = `${systemContent}\n\n${tasksContent}\n\n${guardrailsContent}`;
        }
        const request = {
            prompt,
            systemPrompt: systemPrompt || undefined,
            model: options.model || this.config.name,
            temperature: options.temperature ?? this.config.temperature,
            maxTokens: options.maxTokens || this.config.max_completion_tokens || this.config.max_tokens
        };
        // Try primary provider
        const primaryProvider = this.getProvider(request.model || 'gpt-4o-mini');
        if (primaryProvider && await primaryProvider.isAvailable()) {
            try {
                console.log(`🚀 Calling ${request.model}...`);
                return await primaryProvider.call(request);
            }
            catch (error) {
                console.warn(`⚠️ Primary provider failed:`, error);
            }
        }
        // Try fallback provider
        if (this.config.fallback) {
            const fallbackProvider = this.getProvider(this.config.fallback.name);
            if (fallbackProvider && await fallbackProvider.isAvailable()) {
                console.log(`🔄 Falling back to ${this.config.fallback.name}...`);
                const fallbackRequest = {
                    ...request,
                    model: this.config.fallback.name,
                    temperature: this.config.fallback.temperature
                };
                return await fallbackProvider.call(fallbackRequest);
            }
        }
        throw new Error('No available LLM providers');
    }
    getProvider(modelName) {
        // Simple mapping - can be enhanced
        if (modelName.includes('gpt') || modelName.includes('openai')) {
            return this.providers.get('openai');
        }
        return undefined;
    }
    getUsage() {
        const usage = {};
        for (const [name, provider] of this.providers) {
            usage[name] = provider.getUsage();
        }
        return usage;
    }
    async isReady() {
        return this.config !== null && this.systemPrompts.size > 0;
    }
}
