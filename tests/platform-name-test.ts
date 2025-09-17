/**
 * 🧪 Test การตรวจจับคำถามเกี่ยวกับชื่อแพลตฟอร์ม
 */

import { OrchestratorAI } from '../src/midori/agents/orchestrator/orchestratorAI';

async function testPlatformNameDetection() {
  console.log('🧪 Testing Platform Name Detection...\n');
  
  const orchestrator = new OrchestratorAI();
  await orchestrator.initialize();
  
  const testCases = [
    'ชื่อเว็บไซต์อะไร',
    'ชื่อแพลตฟอร์มอะไร', 
    'website name คืออะไร',
    'platform name คือ',
    'ชื่อเว็บ',
    'ชื่อแพลตฟอร์ม',
    'เว็บนี้ชื่ออะไร',
    'แพลตฟอร์มนี้ชื่ออะไร'
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 Test: "${testCase}"`);
    
    try {
      const result = await orchestrator.processUserInput({
        content: testCase,
        userId: 'test-user',
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Response: ${result.content.slice(0, 100)}...`);
      console.log(`🎯 Confidence: ${result.metadata.confidence}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Error: ${error}`);
    }
  }
}

// 🚀 Run test
testPlatformNameDetection().catch(console.error);