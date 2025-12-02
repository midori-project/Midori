/**
 * 🧪 Test Enhanced Fallback Mechanism
 * ทดสอบการ fallback เมื่อ GPT-5-nano return empty responses
 */

import { LLMAdapter } from '../src/midori/agents/orchestrator/adapters/llmAdapter';

async function testFallbackMechanism() {
  console.log('🧪 Testing Enhanced Fallback Mechanism...\n');

  const adapter = new LLMAdapter();
  await adapter.initialize();

  // Test 1: Basic Chat Request
  console.log('📝 Test 1: Basic Chat Request');
  try {
    const response1 = await adapter.callLLM('สวัสดีครับ', {
      model: 'gpt-5-nano',
      temperature: 1
    });
    console.log('✅ Response:', response1.content.substring(0, 100) + '...');
    console.log('📊 Model used:', response1.model);
    console.log('⏱️ Response time:', response1.responseTime, 'ms\n');
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Code Generation Request
  console.log('📝 Test 2: Code Generation Request');
  try {
    const response2 = await adapter.callLLM('สร้าง React component สำหรับ Todo List', {
      model: 'gpt-5-nano',
      temperature: 1
    });
    console.log('✅ Response:', response2.content.substring(0, 100) + '...');
    console.log('📊 Model used:', response2.model);
    console.log('⏱️ Response time:', response2.responseTime, 'ms\n');
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Model Reliability Status
  console.log('📝 Test 3: Model Reliability Status');
  console.log('🛡️ Unreliable models:', Array.from((adapter as any).unreliableModels));
  
  // Test 4: Reset and Retry
  console.log('\n📝 Test 4: Reset Reliability and Retry');
  adapter.resetModelReliability();
  try {
    const response4 = await adapter.callLLM('ทดสอบหลังจาก reset', {
      model: 'gpt-5-nano',
      temperature: 1
    });
    console.log('✅ Response after reset:', response4.content.substring(0, 100) + '...');
    console.log('📊 Model used:', response4.model);
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  console.log('\n🏁 Fallback mechanism test completed!');
}

// Run the test
if (require.main === module) {
  testFallbackMechanism().catch(console.error);
}

export { testFallbackMechanism };