/**
 * 🧪 Mock GPT-5-nano Fallback Test
 * จำลองพฤติกรรม GPT-5-nano ที่ return empty responses
 */

import { LLMAdapter } from '../src/midori/agents/orchestrator/adapters/llmAdapter';
import { LLMProvider, LLMRequest, LLMResponse, TokenUsage } from '../src/midori/agents/orchestrator/adapters/types';

// Mock Provider that simulates GPT-5-nano empty responses
class MockGPT5NanoProvider implements LLMProvider {
  public name = 'mock-openai';
  private callCount = 0;
  private usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    this.callCount++;
    
    if (request.model === 'gpt-5-nano') {
      // Simulate GPT-5-nano consistently returning empty responses
      console.log(`🔥 MockGPT5NanoProvider: Call #${this.callCount} to ${request.model} - returning empty response`);
      this.usage.promptTokens += request.prompt.length / 4;
      return {
        content: '', // Empty response!
        usage: { 
          prompt_tokens: request.prompt.length / 4,
          completion_tokens: 0,
          total_tokens: request.prompt.length / 4 
        },
        model: request.model,
        responseTime: 1200
      };
    }
    
    if (request.model === 'gpt-4o-mini') {
      // Simulate successful fallback
      console.log(`✅ MockGPT5NanoProvider: Call #${this.callCount} to ${request.model} - returning proper response`);
      const response = `สวัสดีครับ! ผมเป็น AI Assistant ที่พร้อมช่วยเหลือคุณ

สำหรับคำสั่ง: "${request.prompt}"

ผมสามารถช่วยคุณได้ในหลายเรื่อง เช่น:
- การเขียนโค้ด และ debugging
- การออกแบบระบบ
- การแก้ไขปัญหา
- การอธิบายแนวคิดทางเทคนิค

มีอะไรให้ช่วยเหลือไหมครับ?`;

      this.usage.promptTokens += request.prompt.length / 4;
      this.usage.completionTokens += response.length / 4;
      this.usage.totalTokens = this.usage.promptTokens + this.usage.completionTokens;
      
      return {
        content: response,
        usage: { 
          prompt_tokens: request.prompt.length / 4,
          completion_tokens: response.length / 4,
          total_tokens: request.prompt.length / 4 + response.length / 4
        },
        model: request.model,
        responseTime: 800
      };
    }
    
    throw new Error(`Unsupported model: ${request.model}`);
  }

  getUsage(): TokenUsage {
    return this.usage;
  }
}

async function testMockFallback() {
  console.log('🧪 Testing Mock GPT-5-nano Fallback Behavior...\n');

  // Create adapter and inject mock provider
  const adapter = new LLMAdapter();
  
  // Inject mock provider
  const mockProvider = new MockGPT5NanoProvider();
  (adapter as any).providers.set('openai', mockProvider);
  
  // Load config and prompts
  await adapter.loadConfig();
  await adapter.loadSystemPrompts();

  console.log('📝 Test 1: GPT-5-nano Empty Response -> Should fallback to gpt-4o-mini');
  try {
    const response1 = await adapter.callLLM('สวัสดีครับ ทดสอบระบบ', {
      model: 'gpt-5-nano',
      temperature: 1
    });
    
    console.log('📊 Final Model Used:', response1.model);
    console.log('📝 Response Content:', response1.content ? response1.content.substring(0, 150) + '...' : 'EMPTY');
    console.log('⏱️ Response Time:', response1.responseTime, 'ms');
    console.log('🛡️ Unreliable Models:', Array.from((adapter as any).unreliableModels));
    console.log('');
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  console.log('📝 Test 2: Second request -> Should skip gpt-5-nano (blacklisted) and go directly to fallback');
  try {
    const response2 = await adapter.callLLM('สร้างหน้าเว็บ landing page', {
      model: 'gpt-5-nano',
      temperature: 1
    });
    
    console.log('📊 Final Model Used:', response2.model);
    console.log('📝 Response Content:', response2.content ? response2.content.substring(0, 150) + '...' : 'EMPTY');
    console.log('⏱️ Response Time:', response2.responseTime, 'ms');
    console.log('🛡️ Unreliable Models:', Array.from((adapter as any).unreliableModels));
    console.log('');
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  console.log('📝 Test 3: Reset reliability and try again');
  adapter.resetModelReliability();
  try {
    const response3 = await adapter.callLLM('ทดสอบหลัง reset', {
      model: 'gpt-5-nano',
      temperature: 1
    });
    
    console.log('📊 Final Model Used:', response3.model);
    console.log('📝 Response Content:', response3.content ? response3.content.substring(0, 150) + '...' : 'EMPTY');
    console.log('⏱️ Response Time:', response3.responseTime, 'ms');
    console.log('🛡️ Unreliable Models:', Array.from((adapter as any).unreliableModels));
    console.log('');
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  console.log('🏁 Mock fallback test completed!');
  console.log('📊 Total Provider Usage:', mockProvider.getUsage());
}

// Run the test
if (require.main === module) {
  testMockFallback().catch(console.error);
}

export { testMockFallback };