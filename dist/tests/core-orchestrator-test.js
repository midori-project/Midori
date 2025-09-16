"use strict";
/**
 * 🧪 Core Orchestrator Test
 * ทดสอบ core orchestrator logic พร้อม LLM integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const run_1 = require("../runners/run");
async function testCoreOrchestrator() {
    console.log('🚀 Testing Core Orchestrator with LLM Integration');
    console.log('='.repeat(60));
    const testCommand = {
        commandId: crypto_1.default.randomUUID(),
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
        const result = await (0, run_1.run)(testCommand);
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
    }
    catch (error) {
        console.error('❌ Test Failed:', error);
    }
}
// Run test
testCoreOrchestrator().catch(console.error);
