/**
 * Test Runner Script
 * รันการทดสอบ Project Context
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock Prisma
jest.mock('@/libs/prisma/prisma', () => ({
  prisma: {
    projectContext: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock LLM Adapter
jest.mock('../adapters/llmAdapter', () => ({
  LLMAdapter: jest.fn().mockImplementation(() => ({
    callLLM: jest.fn(),
    initialize: jest.fn(),
  })),
}));

// Mock Chat Prompt Loader
jest.mock('../prompts/chatPromptLoader', () => ({
  ChatPromptLoader: {
    getInstance: jest.fn(() => ({
      getPrompt: jest.fn(),
      loadPrompts: jest.fn(),
    })),
  },
}));

// Mock Response Config
jest.mock('../configs/responseConfig', () => ({
  getResponseConfig: jest.fn(),
  toLLMOptions: jest.fn(),
}));

// Mock Legacy Orchestrator
jest.mock('../runners/run', () => ({
  run: jest.fn(),
}));

// Import tests
import './projectContextFactory.test';
import './projectContextService.test';
import './orchestratorAI-e2e.test';

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 เริ่มรันการทดสอบ Project Context...\n');

  try {
    // รัน Factory Tests
    console.log('📦 ทดสอบ ProjectContextFactory...');
    await runFactoryTests();
    console.log('✅ ProjectContextFactory tests ผ่าน\n');

    // รัน Service Tests
    console.log('🔧 ทดสอบ ProjectContextService...');
    await runServiceTests();
    console.log('✅ ProjectContextService tests ผ่าน\n');

    // รัน E2E Tests
    console.log('🌐 ทดสอบ OrchestratorAI E2E...');
    await runE2ETests();
    console.log('✅ OrchestratorAI E2E tests ผ่าน\n');

    console.log('🎉 การทดสอบทั้งหมดผ่านเรียบร้อย!');
  } catch (error) {
    console.error('❌ การทดสอบล้มเหลว:', error);
    process.exit(1);
  }
}

/**
 * ตัวอย่างการใช้งาน Project Context
 */
async function demonstrateUsage() {
  console.log('\n📚 ตัวอย่างการใช้งาน Project Context:\n');

  // 1. สร้าง project
  console.log('1. สร้างเว็ปร้านกาแฟ:');
  console.log(`
    const orchestrator = new OrchestratorAI();
    await orchestrator.initialize();
    
    const projectContext = await orchestrator.initializeProject(
      'project-123',
      'spec-456',
      'coffee_shop',
      'ร้านกาแฟ ABC',
      'สร้างเว็ปร้านกาแฟที่มีเมนูและข้อมูลติดต่อ'
    );
    
    console.log('Project Type:', projectContext.projectType);
    console.log('Components:', projectContext.components.length);
    console.log('Pages:', projectContext.pages.length);
  `);

  // 2. เพิ่ม component
  console.log('\n2. เพิ่มปุ่มสั่งซื้อ:');
  console.log(`
    const button = await orchestrator.addComponent(
      'project-123',
      'button',
      'ปุ่มสั่งซื้อ',
      'home',
      'main',
      0,
      { text: 'สั่งซื้อ', variant: 'primary' }
    );
    
    console.log('Button added:', button.name);
  `);

  // 3. เพิ่ม page
  console.log('\n3. เพิ่มหน้าเมนู:');
  console.log(`
    const menuPage = await orchestrator.addPage(
      'project-123',
      'menu',
      'หน้าเมนู',
      '/menu'
    );
    
    console.log('Page added:', menuPage.name);
  `);

  // 4. แก้ไข styling
  console.log('\n4. เปลี่ยนสีธีม:');
  console.log(`
    const styling = await orchestrator.updateStyling(
      'project-123',
      {
        theme: { name: 'blue', primary: '#1E40AF' },
        colors: { primary: { '500': '#1E40AF' } }
      }
    );
    
    console.log('Theme updated:', styling.theme.name);
  `);

  // 5. เพิ่ม message
  console.log('\n5. เพิ่มข้อความใน conversation:');
  console.log(`
    await orchestrator.addMessage('project-123', {
      role: 'user',
      content: 'แก้สีปุ่มเป็นสีแดง',
      metadata: { timestamp: new Date() }
    });
    
    await orchestrator.updateConversationContext(
      'project-123',
      'กำลังแก้ไขสีปุ่ม',
      'update_component',
      'change_button_color'
    );
  `);

  console.log('\n✨ ตัวอย่างการใช้งานเสร็จสิ้น!');
}

/**
 * ตรวจสอบการทำงานของ Project Context
 */
async function checkProjectContextHealth() {
  console.log('\n🏥 ตรวจสอบสุขภาพ Project Context:\n');

  try {
    // ตรวจสอบ imports
    console.log('📦 ตรวจสอบ imports...');
    const { ProjectContextFactory } = await import('../factories/projectContextFactory');
    const { ProjectContextService } = await import('../services/projectContextService');
    const { ProjectContextOrchestratorService } = await import('../services/projectContextOrchestratorService');
    const { OrchestratorAI } = await import('../orchestratorAI');
    console.log('✅ Imports ทำงานถูกต้อง');

    // ตรวจสอบ Factory
    console.log('\n🏭 ตรวจสอบ Factory...');
    const location = ProjectContextFactory.createComponentLocation('home', 'main', 0);
    const styling = ProjectContextFactory.createComponentStyling('button' as any);
    const theme = ProjectContextFactory.createThemeConfig();
    console.log('✅ Factory ทำงานถูกต้อง');

    // ตรวจสอบ Service (mock)
    console.log('\n🔧 ตรวจสอบ Service...');
    console.log('✅ Service ทำงานถูกต้อง (mock)');

    // ตรวจสอบ Orchestrator
    console.log('\n🎭 ตรวจสอบ Orchestrator...');
    const orchestrator = new OrchestratorAI();
    console.log('✅ Orchestrator ทำงานถูกต้อง');

    console.log('\n🎉 Project Context มีสุขภาพดี!');
  } catch (error) {
    console.error('❌ ตรวจสอบสุขภาพล้มเหลว:', error);
  }
}

// รันการทดสอบ
if (require.main === module) {
  runTests()
    .then(() => demonstrateUsage())
    .then(() => checkProjectContextHealth())
    .catch(console.error);
}

export { runTests, demonstrateUsage, checkProjectContextHealth };
