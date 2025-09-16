/**
 * 🧪 Core Orchestrator Test
 * ทดสอบ core orchestrator logic พร้อม LLM integration
 */

import crypto from 'crypto';
import { run } from '../runners/run';

async function testCoreOrchestrator() {
  console.log('🚀 Testing Core Orchestrator with LLM Integration');
  console.log('='.repeat(60));

  const testCommand = {
    commandId: crypto.randomUUID(),
    commandType: 'create_component',
    payload: {
      componentName: 'TestButton',
      framework: 'react',
      styling: 'tailwind'
    },
    priority: 'medium',
    metadata: {
      timestamp: new Date().toISOString(),
      userId: 'test-user'
    }
  };

  try {
    console.log('📝 Test Command:', JSON.stringify(testCommand, null, 2));
    
    const result = await run(testCommand);
    
    console.log('\n✅ Orchestrator Result:');
    console.log('   Success:', result.success);
    console.log('   Plan Generated:', !!result.plan);
    console.log('   Chat Response:', !!result.chatResponse);
    console.log('   Processing Time:', result.metadata.processingTimeMs + 'ms');
    
    if (result.plan) {
      console.log('   Tasks Count:', result.plan.tasks.length);
      console.log('   Duration:', result.plan.estimatedTotalDuration + 'min');
      console.log('   AI Generated:', result.plan.metadata.aiGenerated);
    }

    if (result.chatResponse) {
      console.log('   Chat Message:', result.chatResponse.message);
      console.log('   Suggestions:', result.chatResponse.suggestions.length);
    }

    console.log('\n🎉 Core Orchestrator Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
}

// Run test
testCoreOrchestrator().catch(console.error);