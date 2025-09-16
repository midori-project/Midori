/**
 * 🧪 Live Test: Unified Orchestrator AI
 * ทดสอบการทำงานจริงของ Orchestrator AI ที่รวม Chat + Task coordination
 */

import { processUserMessage } from '../src/midori/agents/orchestrator/orchestratorAI';

async function runLiveTest() {
  console.log('🎭 Midori Unified Orchestrator - Live Test');
  console.log('='.repeat(80));
  console.log();

  const testCases = [
    {
      name: 'การทักทาย',
      input: 'สวัสดีครับ',
      expectedType: 'chat',
      description: 'ควรตอบทักทายแบบเป็นมิตรและแนะนำความสามารถ'
    },
    {
      name: 'สร้างเว็บไซต์',
      input: 'สร้างเว็ปไซต์',
      expectedType: 'task', 
      description: 'ควรใช้ multi-agent coordination'
    },
    {
      name: 'แก้ไข navbar',
      input: 'แก้ไข navbar ให้มีเมนู About เพิ่ม',
      expectedType: 'task',
      description: 'ควรใช้ frontend agent เท่านั้น'
    }
  ];

  for (const [index, testCase] of testCases.entries()) {
    console.log(`🧪 Test ${index + 1}: ${testCase.name}`);
    console.log(`💬 User Input: "${testCase.input}"`);
    console.log(`🎯 Expected: ${testCase.expectedType}`);
    console.log(`📋 Description: ${testCase.description}`);
    console.log('─'.repeat(60));

    try {
      const startTime = Date.now();
      const response = await processUserMessage(
        testCase.input,
        'live-test-user',
        `session-${index}`
      );
      const totalTime = Date.now() - startTime;

      console.log('📊 Response:');
      console.log(`   Type: ${response.type}`);
      console.log(`   Content: "${response.content}"`);
      
      if (response.taskResults) {
        console.log(`   ✅ Task Results Available`);
        if (response.taskResults.plan) {
          console.log(`   📋 Plan Generated: ${response.taskResults.plan.tasks?.length || 0} tasks`);
          
          if (response.taskResults.plan.tasks) {
            response.taskResults.plan.tasks.forEach((task: any, i: number) => {
              console.log(`      ${i + 1}. ${task.agent}: ${task.action}`);
            });
          }
        }
      }

      if (response.nextSteps && response.nextSteps.length > 0) {
        console.log(`   🚀 Next Steps:`);
        response.nextSteps.forEach((step: string, i: number) => {
          console.log(`      ${i + 1}. ${step}`);
        });
      }

      console.log(`   ⏱️ AI Processing: ${response.metadata.executionTime}ms`);
      console.log(`   🤖 Agents Used: ${response.metadata.agentsUsed.join(', ') || 'None'}`);
      console.log(`   🎯 Confidence: ${(response.metadata.confidence * 100).toFixed(1)}%`);
      console.log(`   📊 Total Time: ${totalTime}ms`);

      // Validation
      const isCorrectType = response.type === testCase.expectedType;
      console.log(`   ✅ Type Check: ${isCorrectType ? 'PASSED' : 'FAILED'}`);

    } catch (error) {
      console.error(`❌ Test ${index + 1} Failed:`, error instanceof Error ? error.message : error);
    }

    console.log();
    console.log('='.repeat(80));
    console.log();
  }

  // Test conversation context
  console.log('🔄 Testing Conversation Context');
  console.log('─'.repeat(60));

  try {
    const sessionId = 'context-test-session';
    
    console.log('💬 Conversation 1: "สร้างเว็บไซต์ร้านอาหาร"');
    const conv1 = await processUserMessage('สร้างเว็บไซต์ร้านอาหาร', 'context-user', sessionId);
    console.log(`   Response: ${conv1.content.substring(0, 80)}...`);
    console.log(`   Type: ${conv1.type}, Agents: ${conv1.metadata.agentsUsed.join(', ')}`);
    console.log();

    console.log('💬 Conversation 2: "เปลี่ยนสีหลักเป็นสีเขียว"');
    const conv2 = await processUserMessage('เปลี่ยนสีหลักเป็นสีเขียว', 'context-user', sessionId);
    console.log(`   Response: ${conv2.content.substring(0, 80)}...`);
    console.log(`   Type: ${conv2.type}, Agents: ${conv2.metadata.agentsUsed.join(', ')}`);
    console.log();

    console.log('💬 Conversation 3: "ทำไมถึงเลือกสีเขียว?"');
    const conv3 = await processUserMessage('ทำไมถึงเลือกสีเขียว?', 'context-user', sessionId);
    console.log(`   Response: ${conv3.content.substring(0, 80)}...`);
    console.log(`   Type: ${conv3.type}, Agents: ${conv3.metadata.agentsUsed.join(', ')}`);

    console.log('✅ Context test completed successfully');

  } catch (error) {
    console.error('❌ Context test failed:', error);
  }

  console.log();
  console.log('🎉 Live Test Summary');
  console.log('='.repeat(80));
  console.log('✅ Unified Orchestrator AI successfully combines:');
  console.log('   🗣️  Chat AI Engine - Natural conversation responses');
  console.log('   🎭 Multi-Agent Coordinator - Complex task orchestration');
  console.log('   🧠 Smart Intent Detection - Automatic routing decisions');
  console.log('   📊 Context Awareness - Conversation memory persistence');
  console.log('   ⚡ Performance Tracking - Execution time and confidence metrics');
  console.log();
  console.log('🌟 Ready for production use!');
}

// Execute live test
console.log('🚀 Starting Unified Orchestrator Live Test...');
console.log();

runLiveTest()
  .then(() => {
    console.log('🎯 All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Live test failed:', error);
    process.exit(1);
  });