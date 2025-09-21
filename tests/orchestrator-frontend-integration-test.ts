/**
 * 🧪 OrchestratorAI + Frontend Agent Integration Test
 * ทดสอบการเชื่อมต่อจริงระหว่าง OrchestratorAI กับ Frontend Agent
 */

import { processUserMessage } from '../src/midori/agents/orchestrator/orchestratorAI';

async function testOrchestratorFrontendIntegration() {
  console.log('🧪 Testing OrchestratorAI + Frontend Agent Integration');
  console.log('='.repeat(80));
  console.log();

  const testCases = [
    {
      name: 'สร้าง Component ใหม่',
      input: 'สร้าง component Button ใหม่',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และสร้าง Button component'
    },
    {
      name: 'แก้ไข Component',
      input: 'แก้ไข navbar component ให้มีเมนู About',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และแก้ไข navbar'
    },
    {
      name: 'สร้าง Template',
      input: 'สร้าง template สำหรับร้านกาแฟ',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และสร้าง template'
    },
    {
      name: 'สร้าง Page ใหม่',
      input: 'สร้างหน้า About page ใหม่',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และสร้าง About page'
    },
    {
      name: 'การสนทนาธรรมดา',
      input: 'สวัสดีครับ',
      expectedType: 'chat',
      expectedAgent: '',
      description: 'ควรตอบสนองแบบ chat ไม่เรียก agent'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: ${testCase.expectedType} ${testCase.expectedAgent ? `(${testCase.expectedAgent})` : ''}`);
    console.log(`   Description: ${testCase.description}`);
    console.log('-'.repeat(60));

    try {
      const startTime = Date.now();
      
      // Call OrchestratorAI
      const response = await processUserMessage(
        testCase.input,
        'test-user-' + index,
        'test-session-' + index
      );
      
      const executionTime = Date.now() - startTime;
      
      // Check response type
      const typeMatch = response.type === testCase.expectedType;
      
      // Check if correct agent was used
      const agentMatch = testCase.expectedAgent === '' || 
                        response.metadata.agentsUsed.includes(testCase.expectedAgent);
      
      // Check if task was executed successfully
      const success = response.taskResults?.success !== false;
      
      // Display results
      console.log(`✅ Response Type: ${response.type} ${typeMatch ? '✓' : '✗'}`);
      console.log(`🤖 Agents Used: ${response.metadata.agentsUsed.join(', ')} ${agentMatch ? '✓' : '✗'}`);
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      console.log(`📊 Success: ${success ? '✓' : '✗'}`);
      console.log(`📝 Content Preview: ${response.content.substring(0, 100)}...`);
      
      if (response.taskResults) {
        console.log(`🔧 Task Results:`);
        console.log(`   - Success: ${response.taskResults.success || 'N/A'}`);
        console.log(`   - Component: ${response.taskResults.component?.name || 'N/A'}`);
        console.log(`   - Files: ${response.taskResults.files?.length || 0} files`);
      }
      
      // Determine if test passed
      const testPassed = typeMatch && agentMatch && success;
      
      if (testPassed) {
        console.log(`🎉 Test PASSED ✓`);
        passedTests++;
      } else {
        console.log(`❌ Test FAILED ✗`);
        console.log(`   Issues:`);
        if (!typeMatch) console.log(`   - Wrong response type: expected ${testCase.expectedType}, got ${response.type}`);
        if (!agentMatch) console.log(`   - Wrong agent: expected ${testCase.expectedAgent}, got ${response.metadata.agentsUsed.join(', ')}`);
        if (!success) console.log(`   - Task execution failed`);
      }
      
    } catch (error) {
      console.log(`💥 Test ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log(`❌ Test FAILED ✗`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! OrchestratorAI + Frontend Agent integration is working! 🚀');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above and fix them.');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Fix any failing tests');
  console.log('2. Add more test cases for edge cases');
  console.log('3. Test with real user scenarios');
  console.log('4. Add performance benchmarks');
}

// Run the test
if (require.main === module) {
  testOrchestratorFrontendIntegration()
    .then(() => {
      console.log('\n✅ Integration test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Integration test failed:', error);
      process.exit(1);
    });
}

export { testOrchestratorFrontendIntegration };
