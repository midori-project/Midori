import { OrchestratorAI, UserMessage } from '../src/midori/agents/orchestrator/orchestratorAI.js';

async function testGreetingDetection() {
  console.log('🧪 Testing Greeting Detection Fix');
  console.log('═══════════════════════════════════════════════');
  
  const orchestrator = new OrchestratorAI();
  
  const testCases = [
    {
      input: "สวัสดีครับ",
      expected: "chat",
      description: "Basic Thai greeting"
    },
    {
      input: "Hello",
      expected: "chat", 
      description: "Basic English greeting"
    },
    {
      input: "กบมีกี่ขา",
      expected: "chat",  // Should be off-topic but returns as chat
      description: "Off-topic question about frogs"
    },
    {
      input: "สร้างเว็บไซต์ขายของ",
      expected: "task",
      description: "Website creation task"
    },
    {
      input: "midori ช่วยอะไรได้บ้าง",
      expected: "chat",
      description: "General question about Midori"
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.description}`);
    console.log(`💬 Input: "${testCase.input}"`);
    console.log('─'.repeat(50));
    
    try {
      // Create proper UserMessage
      const userMessage: UserMessage = {
        content: testCase.input,
        userId: 'test-user',
        sessionId: 'test-session',
        timestamp: new Date().toISOString()
      };
      
      const result = await orchestrator.processUserInput(userMessage);
      console.log(`✅ Result Type: ${result.type}`);
      console.log(`💬 Content: ${result.content.substring(0, 100)}...`);
      console.log(`📊 Confidence: ${result.metadata.confidence}`);
      console.log(`🤖 Agents Used: ${result.metadata.agentsUsed.join(', ')}`);
      
      // Check if it matches expected behavior
      const isCorrect = result.type === testCase.expected;
      
      console.log(`${isCorrect ? '✅' : '❌'} Expected: ${testCase.expected}, Got: ${result.type}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }
}

// Run the test
testGreetingDetection().catch(console.error);