/**
 * 🚀 Quick Test สำหรับ Template System
 * การทดสอบแบบง่ายและเร็ว
 */

import { AIContentGenerator } from '../core/AIContentGenerator';
import { PlaceholderReplacer } from '../core/PlaceholderReplacer';

async function quickTest() {
  console.log('🚀 Quick Test - Template System');
  console.log('='.repeat(40));

  // ตรวจสอบ API Key
  const apiKey = process.env.QUESTION_API_KEY;
  console.log(`🔑 API Key: ${apiKey ? '✅ พบแล้ว' : '❌ ไม่พบ'}`);
  
  if (!apiKey) {
    console.log('❌ กรุณาตั้งค่า QUESTION_API_KEY ใน environment variables');
    return;
  }

  try {
    // ทดสอบ AI Content Generator
    console.log('\n🤖 ทดสอบ AI Content Generator...');
    const aiGenerator = new AIContentGenerator();
    
    const textPlaceholder = {
      fullMatch: '<text/>',
      type: 'text' as const,
      position: 0,
      context: { file: 'test.tsx', line: 1 }
    };

    const userData = {
      brandName: 'ร้านกาแฟทดสอบ',
      theme: 'cozy',
      content: { heroTitle: 'ยินดีต้อนรับ' },
      customizations: {}
    };

    const template = {
      key: 'test-template',
      label: 'Test Template',
      category: 'test',
      meta: { description: 'Test template' },
      tags: ['test'],
      initialVersion: {
        version: 1,
        semver: '1.0.0',
        status: 'published' as const,
        sourceFiles: [],
        slots: {},
        constraints: {}
      },
      placeholderConfig: {
        hasPlaceholders: true,
        placeholderTypes: { text: 1, tw: 0, img: 0, data: 0 },
        themeMapping: {}
      }
    };

    const aiResult = await aiGenerator.generatePlaceholderContent(
      textPlaceholder,
      userData,
      template,
      'test context'
    );

    console.log(`✅ AI Result: "${aiResult}"`);

    // ทดสอบ PlaceholderReplacer
    console.log('\n🔄 ทดสอบ PlaceholderReplacer...');
    const replacer = new PlaceholderReplacer();
    
    const testContent = '<h1><text/></h1><button className="<tw/>"><text/></button>';
    const processedContent = await replacer.replacePlaceholders(
      testContent,
      { ...userData, useAI: true },
      template
    );

    console.log(`✅ Original: ${testContent}`);
    console.log(`✅ Processed: ${processedContent}`);

    // ทดสอบ Tailwind Documentation
    console.log('\n🎨 ทดสอบ Tailwind Documentation...');
    aiGenerator.addCommonPattern('Test Button', 'bg-blue-500 text-white px-4 py-2 rounded');
    const docs = aiGenerator.getTailwindDocumentation();
    console.log(`✅ Documentation length: ${docs.length} characters`);
    console.log(`✅ Has test pattern: ${docs.includes('Test Button')}`);

    console.log('\n🎉 Quick Test เสร็จสิ้น! ทุกอย่างทำงานได้ปกติ');

  } catch (error) {
    console.error('❌ Quick Test ล้มเหลว:', error);
  }
}

// รันการทดสอบ
if (require.main === module) {
  quickTest().catch(console.error);
}

export { quickTest };
