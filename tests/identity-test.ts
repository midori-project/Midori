import { OrchestratorAI, UserMessage } from '../src/midori/agents/orchestrator/orchestratorAI.js';

async function testIdentity() {
  console.log('🧪 Testing AI Identity Recognition');
  console.log('══════════════════════════════════════');
  
  const orchestrator = new OrchestratorAI();
  
  const testCases = [
    {
      input: "คุณคือใคร",
      expected: "introduction",
      description: "Who are you question"
    },
    {
      input: "ชื่ออะไร",
      expected: "introduction",
      description: "Name question"
    },
    {
      input: "แนะนำตัว",
      expected: "introduction", 
      description: "Self introduction request"
    },
    {
      input: "สวัสดีครับ",
      expected: "greeting",
      description: "Greeting"
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.description}`);
    console.log(`💬 Input: "${testCase.input}"`);
    console.log('─'.repeat(50));
    
    try {
      const userMessage: UserMessage = {
        content: testCase.input,
        userId: 'test-user',
        sessionId: 'test-session',
        timestamp: new Date().toISOString()
      };
      
      const result = await orchestrator.processUserInput(userMessage);
      console.log(`✅ Result Type: ${result.type}`);
      console.log(`💬 Content: ${result.content}`);
      console.log(`📊 Confidence: ${result.metadata.confidence}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }
}

// Run the test
testIdentity().catch(console.error);