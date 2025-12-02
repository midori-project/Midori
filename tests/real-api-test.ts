/**
 * 🧪 Real API Test with TypeScript
 * ทดสอบ Unified Orchestrator กับ OpenAI API จริง
 */

import { processUserMessage } from '../src/midori/agents/orchestrator/orchestratorAI';

async function testRealAPI() {
  console.log('🚀 Testing REAL Unified Orchestrator with OpenAI API\n');
  
  const testCases = [
    {
      name: 'TEST 1: Thai Greeting with Real AI',
      input: 'สวัสดีครับ',
      expected: 'Natural Thai conversation with AI'
    },
    {
      name: 'TEST 2: Website Creation Request', 
      input: 'สร้างเว็บไซต์ขายของออนไลน์',
      expected: 'Task planning with multi-agent coordination'
    },
    {
      name: 'TEST 3: UI Modification Request',
      input: 'แก้ไข navbar ให้มีเมนู About',
      expected: 'Frontend task with specific requirements'
    }
  ];

  for (const testCase of testCases) {
    console.log('='.repeat(60));
    console.log(testCase.name);
    console.log('='.repeat(60));
    console.log(`📝 Input: "${testCase.input}"`);
    console.log(`🎯 Expected: ${testCase.expected}`);
    console.log('🤖 Processing with Real OpenAI...');
    console.log('');
    
    const startTime = Date.now();
    
    try {
      const result = await processUserMessage(testCase.input);
      const duration = Date.now() - startTime;
      
      console.log(`⏱️ Execution Time: ${duration}ms`);
      console.log(` Type: ${result.type || 'Unknown'}`);
      
      if (result.content) {
        console.log(`📄 AI Response:`);
        console.log(`   ${result.content}`);
      }
      
      if (result.taskResults) {
        console.log(`⚙️ Task Plan:`);
        console.log(JSON.stringify(result.taskResults, null, 2));
      }
      
      if (result.metadata) {
        console.log(`📊 Metadata:`);
        console.log(`   Agents Used: ${result.metadata.agentsUsed || 'None'}`);
        console.log(`   Confidence: ${result.metadata.confidence || 'Unknown'}`);
        console.log(`   Execution Time: ${result.metadata.executionTime || duration}ms`);
      }
      
      console.log('✅ Test Completed Successfully');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.log(`❌ Error: ${errorMsg}`);
      if (errorStack) {
        console.log(`🔧 Stack: ${errorStack.split('\n').slice(0, 3).join('\n')}`);
      }
    }
    
    console.log('');
    
    // Wait between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('='.repeat(60));
  console.log('🎉 Real API Test Complete!');
  console.log('='.repeat(60));
}

// Run the test
testRealAPI().catch(console.error);