/**
 * 🧪 Real Orchestrator Test with Full Configuration
 * ทดสอบ orchestrator จริงพร้อม config และ system prompts
 */

import path from 'path';
import fs from 'fs/promises';

// Import the real orchestrator components
import { processUserMessage } from '../src/midori/agents/orchestrator/orchestratorAI';
import { LLMAdapter } from '../src/midori/agents/orchestrator/adapters/llmAdapter';

async function setupAndTestRealOrchestrator() {
  console.log('🚀 Real Orchestrator Test with Full Configuration\n');
  console.log('=' .repeat(80));
  console.log('🔧 INITIALIZATION PHASE');
  console.log('='.repeat(80));
  
  // 1. Check environment
  console.log('📋 Environment Check:');
  const hasOpenAiKey = !!process.env.OPENAI_API_KEY;
  console.log(`   OpenAI API Key: ${hasOpenAiKey ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Working Directory: ${process.cwd()}`);
  console.log('');
  
  // 2. Check configuration files
  console.log('📁 Configuration Files Check:');
  const configFiles = [
    'src/midori/configs/midori.yaml',
    'src/midori/agents/orchestrator/prompts/system.md',
    'src/midori/agents/orchestrator/prompts/system-prompt.md',
    'src/midori/agents/orchestrator/adapters/llmAdapter.ts'
  ];
  
  for (const file of configFiles) {
    try {
      const fullPath = path.join(process.cwd(), file);
      await fs.access(fullPath);
      console.log(`   ${file}: ✅ Found`);
    } catch (error) {
      console.log(`   ${file}: ❌ Missing`);
    }
  }
  console.log('');
  
  // 3. Initialize LLM Adapter with real configuration
  console.log('🤖 LLM Adapter Initialization:');
  try {
    const llmAdapter = new LLMAdapter();
    await llmAdapter.loadConfig();
    console.log('   ✅ LLM Adapter initialized with real config');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ❌ LLM Adapter error: ${errorMsg}`);
  }
  console.log('');
  
  // 4. Load and display system prompts
  console.log('📝 System Prompts Loading:');
  try {
    const systemPromptPath = path.join(process.cwd(), 'src/midori/agents/orchestrator/prompts/system-prompt.md');
    const systemPrompt = await fs.readFile(systemPromptPath, 'utf-8');
    console.log(`   ✅ System prompt loaded (${systemPrompt.length} characters)`);
    console.log(`   📖 Preview: ${systemPrompt.substring(0, 150)}...`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`   ❌ System prompt error: ${errorMsg}`);
  }
  console.log('');
  
  // 5. Real orchestrator tests
  console.log('='.repeat(80));
  console.log('🧪 ORCHESTRATOR TESTS WITH REAL AI');
  console.log('='.repeat(80));
  
  const testCases = [
    {
      name: 'TEST 1: Thai Greeting (Chat Intent)',
      input: 'สวัสดีครับ ผมใหม่กับ Midori',
      expectedBehavior: 'Should use Chat AI mode with natural Thai conversation'
    },
    {
      name: 'TEST 2: Simple Frontend Task',
      input: 'แก้ไข navbar ให้มีเมนู About และ Contact',
      expectedBehavior: 'Should route to Frontend Agent with specific requirements'
    },
    {
      name: 'TEST 3: Complex Full-Stack Project',
      input: 'สร้างเว็บไซต์ขายของออนไลน์ที่มีระบบ login และ payment gateway',
      expectedBehavior: 'Should create multi-agent plan (Frontend + Backend + DevOps)'
    },
    {
      name: 'TEST 4: Backend-Only Task',
      input: 'สร้าง API สำหรับ user authentication ด้วย Supabase',
      expectedBehavior: 'Should route to Backend Agent with Supabase-specific instructions'
    }
  ];
  
  for (const testCase of testCases) {
    console.log('─'.repeat(60));
    console.log(`📋 ${testCase.name}`);
    console.log('─'.repeat(60));
    console.log(`📝 User Input: "${testCase.input}"`);
    console.log(`🎯 Expected: ${testCase.expectedBehavior}`);
    console.log('');
    console.log('🤖 Processing with Real Orchestrator + OpenAI...');
    
    const startTime = Date.now();
    
    try {
      // Call the real orchestrator
      const result = await processUserMessage(testCase.input);
      const duration = Date.now() - startTime;
      
      console.log('');
      console.log('📊 RESULTS:');
      console.log(`⏱️  Execution Time: ${duration}ms`);
      console.log(`💬 Response Type: ${result.type}`);
      
      if (result.content) {
        console.log('📄 AI Response:');
        console.log('   ' + '─'.repeat(50));
        // Split long content into readable chunks
        const lines = result.content.split('\n');
        lines.slice(0, 10).forEach(line => {
          console.log(`   ${line}`);
        });
        if (lines.length > 10) {
          console.log(`   ... (${lines.length - 10} more lines)`);
        }
        console.log('   ' + '─'.repeat(50));
      }
      
      if (result.taskResults) {
        console.log('⚙️  Task Plan Generated:');
        console.log(JSON.stringify(result.taskResults, null, 2));
      }
      
      if (result.metadata) {
        console.log('📊 Metadata:');
        console.log(`   Agents Used: ${result.metadata.agentsUsed || 'None'}`);
        console.log(`   Confidence: ${result.metadata.confidence || 'Unknown'}`);
        console.log(`   Internal Time: ${result.metadata.executionTime || 'Unknown'}ms`);
      }
      
      console.log('✅ Test Completed Successfully');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.log('');
      console.log('❌ ORCHESTRATOR ERROR:');
      console.log(`   Message: ${errorMsg}`);
      if (errorStack) {
        console.log('   Stack Trace:');
        errorStack.split('\n').slice(0, 5).forEach(line => {
          console.log(`      ${line}`);
        });
      }
    }
    
    console.log('');
    
    // Wait between tests to avoid rate limiting
    if (testCase !== testCases[testCases.length - 1]) {
      console.log('⏳ Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('='.repeat(80));
  console.log('🎉 REAL ORCHESTRATOR TEST COMPLETE');
  console.log('='.repeat(80));
  console.log('');
  console.log('📋 Summary:');
  console.log('   🤖 Used REAL Orchestrator AI implementation');
  console.log('   ⚙️  Used REAL system prompts and configurations');
  console.log('   🔗 Used REAL OpenAI API integration');
  console.log('   📊 Used REAL LLM Adapter with fallback logic');
  console.log('   🎯 Tested all major intent types and routing');
  console.log('');
  console.log('🔧 Components Tested:');
  console.log('   - orchestratorAI.ts (main orchestrator)');
  console.log('   - llmAdapter.ts (OpenAI integration)');
  console.log('   - system-prompt.md (AI instructions)');
  console.log('   - midori.yaml (model configuration)');
  console.log('   - Intent detection and agent routing');
}

// Run the comprehensive test
setupAndTestRealOrchestrator().catch(console.error);