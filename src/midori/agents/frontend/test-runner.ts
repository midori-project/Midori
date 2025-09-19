/**
 * Test runner for Frontend Agent
 * Simple test to verify Frontend Agent functionality
 */

import { run } from './runners/run';

async function testFrontendAgent() {
  console.log('🧪 Testing Frontend Agent...');
  
  // Test task: Create a Button component
  const testTask = {
    taskId: 'test-button-001',
    taskType: 'create_component',
    componentName: 'Button',
    requirements: {
      type: 'functional',
      props: ['label', 'onClick', 'disabled'],
      features: ['typescript', 'accessibility', 'responsive', 'testing'],
      styling: 'tailwind',
      tests: true
    }
  };
  
  try {
    console.log('📝 Test Task:', JSON.stringify(testTask, null, 2));
    
    // Run Frontend Agent
    const result = await run(testTask);
    
    console.log('✅ Frontend Agent Result:');
    console.log('Success:', result.success);
    console.log('Component Name:', result.component.name);
    console.log('Component Type:', result.component.type);
    console.log('Files Generated:', result.files.length);
    console.log('Test Coverage:', result.tests?.coverage || 'N/A');
    console.log('Performance Score:', result.performance?.lighthouseScore || 'N/A');
    
    // Display generated files
    console.log('\n📁 Generated Files:');
    result.files.forEach(file => {
      console.log(`- ${file.path} (${file.type}) - ${file.size} bytes`);
    });
    
    // Display component code preview
    if (result.component.code) {
      console.log('\n💻 Component Code Preview:');
      console.log(result.component.code.substring(0, 200) + '...');
    }
    
    console.log('\n🎉 Frontend Agent test completed successfully!');
    
  } catch (error) {
    console.error('❌ Frontend Agent test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFrontendAgent();
}

export { testFrontendAgent };
