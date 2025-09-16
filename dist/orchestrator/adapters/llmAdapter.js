"use strict";
/**
 * 🎯 LLM Adapter - Main orchestrator LLM interface
 * จัดการ multiple providers และ fallback logic
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMAdapter = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const yaml = __importStar(require("js-yaml"));
const openaiProvider_1 = require("./openaiProvider");
class LLMAdapter {
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
                const openaiProvider = new openaiProvider_1.OpenAIProvider(apiKey);
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
            const configPath = path_1.default.join(process.cwd(), 'src/midori/agents/orchestrator/agent.yaml');
            const configFile = await promises_1.default.readFile(configPath, 'utf-8');
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
            const promptsPath = path_1.default.join(process.cwd(), 'src/midori/agents/orchestrator/prompts');
            const prompts = [
                { key: 'system', file: 'system-prompt.md' },
                { key: 'tasks', file: 'task-templates.md' },
                { key: 'guardrails', file: 'guardrails.md' }
            ];
            for (const { key, file } of prompts) {
                try {
                    const content = await promises_1.default.readFile(path_1.default.join(promptsPath, file), 'utf-8');
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
exports.LLMAdapter = LLMAdapter;
