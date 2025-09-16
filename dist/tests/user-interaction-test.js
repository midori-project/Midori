"use strict";
/**
 * 🧪 Orchestrator User Interaction Test
 * ทดสอบการคุยกับ user และส่งงานไปยัง agents
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const run_1 = require("../runners/run");
async function testUserInteraction() {
    console.log('🤖 Testing Orchestrator User Interactions');
    console.log('='.repeat(60));
    const testCases = [
        {
            name: 'การทักทาย',
            input: 'สวัสดีครับ',
            expectedType: 'chat_response'
        },
        {
            name: 'แก้ไข Navbar',
            input: 'แก้ไข navbar ให้มีเมนู About เพิ่ม',
            expectedType: 'frontend_task'
        },
        {
            name: 'สร้าง API',
            input: 'สร้าง API endpoint สำหรับ user registration',
            expectedType: 'backend_task'
        },
        {
            name: 'Deploy โปรเจค',
            input: 'deploy โปรเจคไป staging environment',
            expectedType: 'devops_task'
        }
    ];
    for (const testCase of testCases) {
        console.log(`\n📝 Test: ${testCase.name}`);
        console.log(`💬 User Input: "${testCase.input}"`);
        console.log('─'.repeat(40));
        try {
            // สร้าง command จาก user input
            const command = {
                commandId: crypto_1.default.randomUUID(),
                commandType: 'user_request', // Generic user request
                payload: {
                    userInput: testCase.input,
                    timestamp: new Date().toISOString()
                },
                priority: 'medium',
                metadata: {
                    timestamp: new Date().toISOString(),
                    userId: 'test-user',
                    sessionId: crypto_1.default.randomUUID()
                }
            };
            const result = await (0, run_1.run)(command);
            if (result.success && result.plan) {
                console.log('✅ Orchestrator Response:');
                console.log(`   🎯 Success: ${result.success}`);
                console.log(`   📋 Tasks Generated: ${result.plan.tasks.length}`);
                console.log(`   ⏱️ Est. Duration: ${result.plan.estimatedTotalDuration}min`);
                if (result.plan.tasks.length > 0) {
                    console.log('\n📤 Tasks to Send to Agents:');
                    result.plan.tasks.forEach((task, index) => {
                        console.log(`   ${index + 1}. Agent: ${task.agent}`);
                        console.log(`      Action: ${task.action}`);
                        console.log(`      Description: ${task.description}`);
                        console.log(`      Payload: ${JSON.stringify(task.payload, null, 6)}`);
                    });
                }
                if (result.chatResponse) {
                    console.log('\n💬 Chat Response to User:');
                    console.log(`   Message: "${result.chatResponse.message}"`);
                    console.log(`   Tone: ${result.chatResponse.tone}`);
                    console.log(`   Suggestions: ${result.chatResponse.suggestions.length}`);
                }
            }
            else {
                console.log('❌ Failed:', result.error);
            }
        }
        catch (error) {
            console.error('❌ Test Error:', error);
        }
        console.log('\n' + '='.repeat(60));
    }
}
// Run tests
testUserInteraction().catch(console.error);
