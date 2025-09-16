/**
 * ทดสอบ Chat AI Interface
 * Test user interaction ผ่าน Chat AI layer
 */

import { processChatMessage } from '../dist/runners/chatAI';

async function testChatAI() {
  console.log('🤖 Testing Chat AI Interface');
  console.log('============================================================\n');

  const testCases = [
    {
      name: 'การทักทาย',
      input: 'สวัสดีครับ',
      expectedType: 'chat'
    },
    {
      name: 'คำถามทั่วไป',
      input: 'คุณช่วยอะไรได้บ้าง',
      expectedType: 'chat'
    },
    {
      name: 'แก้ไข Navbar',
      input: 'แก้ไข navbar ให้มีเมนู About เพิ่ม',
      expectedType: 'task'
    },
    {
      name: 'สร้าง API',
      input: 'สร้าง API endpoint สำหรับ user registration',
      expectedType: 'task'
    },
    {
      name: 'Deploy โปรเจค',
      input: 'deploy โปรเจคไป staging environment',
      expectedType: 'task'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`💬 User Input: "${testCase.input}"`);
    console.log('────────────────────────────────────────');

    try {
      const startTime = Date.now();
      const response = await processChatMessage(testCase.input);
      const duration = Date.now() - startTime;

      console.log(`✅ Response Type: ${response.type}`);
      console.log(`💬 Content: ${response.content}`);
      
      if (response.command) {
        console.log(`🎯 Generated Command:`, {
          type: response.command.commandType,
          payload: response.command.payload
        });
      }

      if (response.taskPlan) {
        console.log(`📋 Task Plan: Generated successfully`);
      }

      console.log(`⏱️ Processing Time: ${duration}ms`);
      
      // Validation
      if (response.type === testCase.expectedType) {
        console.log(`✅ Expected type: ${testCase.expectedType}`);
      } else {
        console.log(`❌ Expected: ${testCase.expectedType}, Got: ${response.type}`);
      }

    } catch (error) {
      console.error(`❌ Error:`, error instanceof Error ? error.message : error);
    }

    console.log('============================================================\n');
  }
}

// Run tests
testChatAI().catch(console.error);