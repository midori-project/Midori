/**
 * 🧪 Direct Frontend Agent Test
 * ทดสอบ Frontend Agent โดยตรงโดยไม่ผ่าน Orchestrator
 */

// Mock project context
const mockProjectContext = {
  projectId: 'test-project-123',
  projectType: 'e_commerce',
  status: 'template_selection' as any,
  userPreferences: {
    language: 'th',
    theme: 'dark'
  },
  conversationHistory: {
    currentContext: 'สร้างร้านออนไลน์',
    lastIntent: 'create_website'
  }
};

// Mock task for frontend agent
const mockFrontendTask = {
  taskId: 'task-frontend-test-123',
  taskType: 'select_template',
  action: 'select_template',
  componentName: 'EcommerceTemplate',
  projectContext: mockProjectContext,
  requirements: {
    templateType: 'e_commerce',
    features: ['responsive', 'seo', 'accessibility'],
    customizations: {
      theme: 'dark',
      colors: ['#FF6B35', '#F39C12', '#8E44AD'],
      style: 'modern',
      mood: 'professional'
    },
    stylePreferences: {
      style: 'modern',
      colorTone: 'warm',
      colors: ['#FF6B35', '#F39C12', '#8E44AD'],
      mood: 'professional',
      theme: 'dark',
      confidence: 0.8,
      reasoning: 'Professional e-commerce with warm colors'
    },
    type: 'functional' as any,
    props: [],
    styling: 'tailwind',
    tests: true
  }
};

async function testFrontendAgentDirect() {
  console.log('🧪 Testing Frontend Agent Directly');
  console.log('='.repeat(80));
  console.log();

  try {
    console.log('📤 Mock task for Frontend Agent:');
    console.log(JSON.stringify(mockFrontendTask, null, 2));
    console.log();

    // Import and run frontend agent
    console.log('🎨 Importing Frontend Agent...');
    const { run: frontendAgent } = await import('../src/midori/agents/frontend/runners/run');
    
    console.log('🎨 Running Frontend Agent...');
    const startTime = Date.now();
    const result = await frontendAgent(mockFrontendTask);
    const duration = Date.now() - startTime;

    console.log();
    console.log('✅ Frontend Agent Result:');
    console.log('Success:', result.success);
    console.log('Component Name:', result.component?.name);
    console.log('Component Type:', result.component?.type);
    console.log('Files Generated:', result.files?.length || 0);
    console.log('Execution Time:', duration, 'ms');
    
    if (result.files && result.files.length > 0) {
      console.log('\n📁 Generated Files:');
      result.files.forEach((file: any, index: number) => {
        console.log(`${index + 1}. ${file.path} (${file.type})`);
        if (file.content && file.content.length > 0) {
          console.log(`   Content: ${file.content.substring(0, 100)}...`);
        }
      });
    }

    if (result.error) {
      console.log('\n❌ Error:', result.error.message);
      console.log('Details:', result.error.details);
    }

    console.log('\n🎯 Summary:');
    console.log(`- Task completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`- Processing time: ${duration}ms`);
    console.log(`- Files generated: ${result.files?.length || 0}`);
    console.log(`- Agent version: ${result.metadata?.version || 'unknown'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Unknown error');
  }
}

// Run the test
testFrontendAgentDirect();
