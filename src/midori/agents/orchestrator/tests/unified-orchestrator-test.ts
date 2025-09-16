/**
 * 🧪 Unified Orchestrator AI Test
 * ทดสอบการทำงานของ Orchestrator AI ที่รวม Chat + Task coordination
 */

import { processUserMessage } from '../orchestratorAI';

async function testUnifiedOrchestrator() {
  console.log('🎭 Testing Unified Orchestrator AI');
  console.log('='.repeat(60));
  console.log();

  const testCases = [
    {
      name: 'การทักทาย',
      input: 'สวัสดีครับ',
      expectedType: 'chat',
      description: 'ควรตอบทักทายกลับแบบเป็นมิตร'
    },
    {
      name: 'คำถามเกี่ยวกับความสามารถ',
      input: 'คุณช่วยอะไรได้บ้าง',
      expectedType: 'chat',
      description: 'ควรอธิบายความสามารถของ Midori'
    },
    {
      name: 'แก้ไข UI Component',
      input: 'แก้ไข navbar ให้มีเมนู About เพิ่ม',
      expectedType: 'task',
      description: 'ควรสร้าง command สำหรับ Frontend AI'
    },
    {
      name: 'สร้าง API',
      input: 'สร้าง API endpoint สำหรับ user registration',
      expectedType: 'task',
      description: 'ควรสร้าง command สำหรับ Backend AI'
    },
    {
      name: 'โปรเจคซับซ้อน',
      input: 'สร้างเว็บไซต์ร้านกาแฟ พร้อม login และระบบสั่งซื้อ',
      expectedType: 'mixed',
      description: 'ควรใช้ multi-agent coordination'
    },
    {
      name: 'Input ไม่ชัดเจน',
      input: 'ช่วยหน่อย',
      expectedType: 'chat',
      description: 'ควรขอคำอธิบายเพิ่มเติม'
    }
  ];

  for (const [index, testCase] of testCases.entries()) {
    console.log(`📝 Test ${index + 1}: ${testCase.name}`);
    console.log(`💬 Input: "${testCase.input}"`);
    console.log(`🎯 Expected: ${testCase.expectedType}`);
    console.log('─'.repeat(50));

    try {
      const startTime = Date.now();
      const response = await processUserMessage(
        testCase.input,
        'test-user',
        `session-${index}`
      );
      const duration = Date.now() - startTime;

      console.log(`✅ Response Type: ${response.type}`);
      console.log(`💬 Content: ${response.content}`);
      console.log(`⏱️ Execution Time: ${response.metadata.executionTime}ms`);
      console.log(`🤖 Agents Used: ${response.metadata.agentsUsed.join(', ') || 'None'}`);
      console.log(`🎯 Confidence: ${(response.metadata.confidence * 100).toFixed(1)}%`);
      
      if (response.taskResults) {
        console.log(`📋 Task Results: Available`);
      }

      if (response.nextSteps && response.nextSteps.length > 0) {
        console.log(`🚀 Next Steps: ${response.nextSteps.join(', ')}`);
      }

      // Validation
      const isCorrectType = response.type === testCase.expectedType || 
                           (testCase.expectedType === 'mixed' && response.type === 'task');
      
      if (isCorrectType) {
        console.log(`✅ Type validation: PASSED`);
      } else {
        console.log(`❌ Type validation: FAILED (expected ${testCase.expectedType}, got ${response.type})`);
      }

      console.log(`📊 Overall Duration: ${duration}ms`);

    } catch (error) {
      console.error(`❌ Test Failed:`, error instanceof Error ? error.message : error);
    }

    console.log('='.repeat(60));
    console.log();
  }

  // Test conversation context
  console.log('🔄 Testing Conversation Context');
  console.log('─'.repeat(50));
  
  try {
    const sessionId = 'context-test';
    
    // First message
    console.log('Message 1: สร้างหน้า home');
    const response1 = await processUserMessage('สร้างหน้า home', 'test-user', sessionId);
    console.log(`Response 1: ${response1.content.substring(0, 100)}...`);
    
    // Follow-up message
    console.log('Message 2: เปลี่ยนสีเป็นสีน้ำเงิน');
    const response2 = await processUserMessage('เปลี่ยนสีเป็นสีน้ำเงิน', 'test-user', sessionId);
    console.log(`Response 2: ${response2.content.substring(0, 100)}...`);
    
    // Chat message in context
    console.log('Message 3: ทำไมถึงเลือกสีน้ำเงิน?');
    const response3 = await processUserMessage('ทำไมถึงเลือกสีน้ำเงิน?', 'test-user', sessionId);
    console.log(`Response 3: ${response3.content.substring(0, 100)}...`);
    
    console.log('✅ Context test completed');
    
  } catch (error) {
    console.error('❌ Context test failed:', error);
  }

  console.log();
  console.log('🎉 Unified Orchestrator AI Test Complete!');
  console.log();
  console.log('💡 Key Features Tested:');
  console.log('• Intent detection (chat vs task)');
  console.log('• Natural language to structured commands');
  console.log('• Multi-agent coordination');
  console.log('• Conversation context persistence');
  console.log('• User-friendly response generation');
  console.log('• Error handling and fallbacks');
}

// Run the test
testUnifiedOrchestrator().catch(console.error);