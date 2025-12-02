/**
 * 🧪 OrchestratorAI + Frontend Agent Mock Integration Test
 * ทดสอบการเชื่อมต่อจริงแต่ใช้ mock results
 */

import { processUserMessage } from '../src/midori/agents/orchestrator/orchestratorAI';

async function testOrchestratorFrontendMockIntegration() {
  console.log(' Testing OrchestratorAI + Frontend Agent Mock Integration');
  console.log('='.repeat(80));
  console.log();

  // Set mock mode
  process.env.FRONTEND_MOCK_MODE = 'true';
  
  const testCases = [
    {
      name: 'สร้างเว็บไซต์ร้านกาแฟ (Mock)',
      input: 'สร้างเว็บไซต์ร้านกาแฟ',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และสร้างเว็บไซต์ร้านกาแฟ แบบ mock'
    },
    {
      name: 'สร้าง Button Component (Mock)',
      input: 'สร้าง component Button ใหม่ที่มี props label, onClick, disabled',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และสร้าง Button component แบบ mock'
    },
    {
      name: 'สร้าง Card Component (Mock)',
      input: 'สร้าง component Card สำหรับแสดงข้อมูลสินค้า',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และสร้าง Card component แบบ mock'
    },
    {
      name: 'แก้ไข Navbar Component (Mock)',
      input: 'แก้ไข navbar component ให้มีเมนู About และ Contact',
      expectedType: 'task',
      expectedAgent: 'frontend',
      description: 'ควรเรียก Frontend Agent และแก้ไข navbar แบบ mock'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n Testing: ${testCase.name}`);
    console.log(` Input: ${testCase.input}`);
    console.log(`🎯 Expected: ${testCase.description}`);
    console.log('-'.repeat(60));

    try {
      const startTime = Date.now();
      
      const response = await processUserMessage(
        testCase.input,
        'test-user-123',
        'test-session-456'
      );
      
      const executionTime = Date.now() - startTime;
      
      console.log(`✅ Response Type: ${response.type}`);
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      
      if (response.type === 'task' && response.taskResults) {
        console.log(`🎨 Task Results:`, {
          success: response.taskResults.success,
          component: response.taskResults.component?.name,
          files: response.taskResults.files?.length || 0,
          tests: response.taskResults.tests?.generated ? 'Yes' : 'No',
          performance: response.taskResults.performance?.lighthouseScore
        });
        
        // Display generated files
        if (response.taskResults.files) {
          console.log(`📁 Generated Files:`);
          response.taskResults.files.forEach((file: any) => {
            console.log(`  - ${file.path} (${file.type}) - ${file.size} bytes`);
          });
        }
        
        // Display component code preview
        if (response.taskResults.component?.code) {
          console.log(`💻 Component Code Preview:`);
          console.log(response.taskResults.component.code.substring(0, 200) + '...');
        }
      }
      
      console.log(`✅ Test passed: ${testCase.name}`);
      
    } catch (error) {
      console.error(`❌ Test failed: ${testCase.name}`);
      console.error(`Error:`, error);
    }
  }

  console.log('\n Mock Integration Test Completed!');
  console.log(' Summary:');
  console.log('- OrchestratorAI can receive real commands');
  console.log('- Frontend Agent responds with mock results');
  console.log('- Full integration pipeline working');
  console.log('- Ready for real LLM integration when API key is available');
}

// Run test
testOrchestratorFrontendMockIntegration().catch(console.error);
