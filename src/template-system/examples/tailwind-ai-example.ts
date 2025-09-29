/**
 * ตัวอย่างการใช้งาน AI Content Generator กับ Tailwind CSS
 * แสดงวิธีการใช้ AI ในการสร้าง Tailwind classes ที่ถูกต้อง
 */

import { AIContentGenerator } from '../core/AIContentGenerator';
import { UserData, Template } from '../types/Template';
import { PlaceholderMatch } from '../types/Placeholder';

// ตัวอย่างการใช้งาน
async function demonstrateTailwindAI() {
  console.log('🚀 เริ่มต้นตัวอย่างการใช้งาน AI กับ Tailwind CSS');
  
  // สร้าง AIContentGenerator
  const aiGenerator = new AIContentGenerator();
  
  // ข้อมูลผู้ใช้ตัวอย่าง
  const userData: UserData = {
    brandName: 'ร้านอาหารไทยอร่อย',
    theme: 'cozy',
    content: {
      heroTitle: 'ยินดีต้อนรับสู่ร้านอาหารไทยอร่อย',
      heroSubtitle: 'อาหารไทยแท้ รสชาติอร่อย'
    },
    customizations: {
      colors: {
        primary: '#10b981', // emerald-500
        secondary: '#f97316' // orange-500
      }
    }
  };
  
  // Template ตัวอย่าง
  const template: Template = {
    key: 'restaurant-template',
    label: 'Restaurant Template',
    category: 'food',
    meta: {
      description: 'Template สำหรับร้านอาหาร',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Midori Team',
      versioningPolicy: 'semver'
    },
    tags: ['food', 'restaurant', 'thai'],
    initialVersion: {
      version: 1,
      semver: '1.0.0',
      status: 'published',
      sourceFiles: [],
      slots: {},
      constraints: {}
    },
    placeholderConfig: {
      hasPlaceholders: true,
      placeholderTypes: {
        tw: 0,
        text: 0,
        img: 0,
        data: 0
      },
      themeMapping: {
        modern: 'primary:sky-600; accent:amber-400; radius:xl; elevation:lg',
        cozy: 'primary:emerald-600; accent:orange-400; radius:lg; elevation:md',
        minimal: 'primary:gray-600; accent:blue-400; radius:sm; elevation:sm'
      }
    }
  };
  
  // ตัวอย่าง placeholder ต่างๆ
  const placeholders: PlaceholderMatch[] = [
    {
      fullMatch: '<tw/>',
      type: 'tw',
      position: 0,
      context: { file: 'button.tsx', line: 10 }
    },
    {
      fullMatch: '<tw/>',
      type: 'tw',
      position: 0,
      context: { file: 'card.tsx', line: 15 }
    },
    {
      fullMatch: '<tw/>',
      type: 'tw',
      position: 0,
      context: { file: 'hero.tsx', line: 8 }
    }
  ];
  
  // ทดสอบการสร้าง Tailwind classes สำหรับแต่ละ placeholder
  for (const placeholder of placeholders) {
    try {
      console.log(`\n🎨 สร้าง Tailwind classes สำหรับ: ${placeholder.context.file}:${placeholder.context.line}`);
      
      const tailwindClasses = await aiGenerator.generatePlaceholderContent(
        placeholder,
        userData,
        template,
        `button component in ${placeholder.context.file}`
      );
      
      console.log(`✅ ได้ Tailwind classes: ${tailwindClasses}`);
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด:`, error);
    }
  }
  
  // แสดงวิธีการอัปเดตเอกสาร Tailwind CSS
  console.log('\n📚 ตัวอย่างการอัปเดตเอกสาร Tailwind CSS');
  
  // เพิ่ม Common Pattern ใหม่
  aiGenerator.addCommonPattern(
    'Button Food Primary',
    'bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg'
  );
  
  aiGenerator.addCommonPattern(
    'Card Food',
    'bg-white shadow-lg rounded-xl p-8 border border-emerald-100 hover:shadow-xl transition-shadow duration-300'
  );
  
  aiGenerator.addCommonPattern(
    'Hero Food',
    'bg-gradient-to-br from-emerald-500 to-orange-500 text-white py-24 px-6 rounded-2xl shadow-2xl'
  );
  
  console.log('✅ เพิ่ม Common Patterns ใหม่แล้ว');
  
  // แสดงเอกสาร Tailwind CSS ปัจจุบัน
  console.log('\n📖 เอกสาร Tailwind CSS ปัจจุบัน:');
  const currentDoc = aiGenerator.getTailwindDocumentation();
  console.log(currentDoc.substring(0, 500) + '...');
  
  // ตัวอย่างการโหลดเอกสารจาก URL (ถ้ามี)
  console.log('\n🌐 ตัวอย่างการโหลดเอกสารจาก URL:');
  try {
    // await aiGenerator.loadTailwindDocumentationFromURL('https://example.com/tailwind-docs.md');
    console.log('💡 สามารถใช้ loadTailwindDocumentationFromURL() เพื่อโหลดเอกสารจาก URL ได้');
  } catch (error) {
    console.log('ℹ️ ตัวอย่างการโหลดจาก URL (ไม่มีการเรียกจริง)');
  }
  
  console.log('\n🎉 เสร็จสิ้นการทดสอบ AI กับ Tailwind CSS');
}

// ตัวอย่างการใช้งานแบบ advanced
async function demonstrateAdvancedTailwindAI() {
  console.log('\n🚀 เริ่มต้นตัวอย่าง Advanced Tailwind AI');
  
  const aiGenerator = new AIContentGenerator();
  
  // สร้างเอกสาร Tailwind CSS แบบ custom
  const customTailwindDoc = `
## Custom Business Colors
- Food Primary: bg-orange-500, bg-orange-600, bg-orange-700, text-orange-500, text-orange-600, text-orange-700
- Food Secondary: bg-yellow-500, bg-yellow-600, bg-yellow-700, text-yellow-500, text-yellow-600, text-yellow-700
- Food Accent: bg-red-500, bg-red-600, bg-red-700, text-red-500, text-red-600, text-red-700

## Custom Patterns
- Food Button: bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
- Food Card: bg-white shadow-xl rounded-2xl p-8 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300
- Food Hero: bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 text-white py-32 px-8 rounded-3xl shadow-2xl
- Food Badge: bg-orange-100 text-orange-800 text-sm font-semibold px-4 py-2 rounded-full border border-orange-200
- Food Input: border-2 border-orange-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-200
`;
  
  // อัปเดตเอกสาร
  aiGenerator.updateTailwindDocumentation(customTailwindDoc);
  
  console.log('✅ อัปเดตเอกสาร Tailwind CSS แบบ custom แล้ว');
  
  // ทดสอบการสร้าง classes ใหม่
  const userData: UserData = {
    brandName: 'ร้านปิ้งย่างอร่อย',
    theme: 'cozy',
    customizations: {
      colors: {
        primary: '#f97316', // orange-500
        secondary: '#eab308' // yellow-500
      }
    }
  };
  
  const template: Template = {
    key: 'bbq-template',
    label: 'BBQ Template',
    category: 'food',
    meta: {
      description: 'Template สำหรับร้านปิ้งย่าง',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Midori Team',
      versioningPolicy: 'semver'
    },
    tags: ['food', 'bbq', 'grill'],
    initialVersion: {
      version: 1,
      semver: '1.0.0',
      status: 'published',
      sourceFiles: [],
      slots: {},
      constraints: {}
    },
    placeholderConfig: {
      hasPlaceholders: true,
      placeholderTypes: { tw: 0, text: 0, img: 0, data: 0 },
      themeMapping: {
        cozy: 'primary:orange-600; accent:yellow-400; radius:lg; elevation:md'
      }
    }
  };
  
  const placeholder: PlaceholderMatch = {
    fullMatch: '<tw/>',
    type: 'tw',
    position: 0,
    context: { file: 'hero.tsx', line: 5 }
  };
  
  try {
    const tailwindClasses = await aiGenerator.generatePlaceholderContent(
      placeholder,
      userData,
      template,
      'hero section for BBQ restaurant'
    );
    
    console.log(`✅ ได้ Tailwind classes สำหรับ Hero: ${tailwindClasses}`);
    
  } catch (error) {
    console.error(`❌ ข้อผิดพลาด:`, error);
  }
  
  console.log('\n🎉 เสร็จสิ้นการทดสอบ Advanced Tailwind AI');
}

// เรียกใช้ตัวอย่าง
if (require.main === module) {
  demonstrateTailwindAI()
    .then(() => demonstrateAdvancedTailwindAI())
    .catch(console.error);
}

export { demonstrateTailwindAI, demonstrateAdvancedTailwindAI };
