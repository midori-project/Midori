/**
 * ตัวอย่างการใช้งาน AI Content Generator กับ QUESTION_API_KEY โดยตรง
 * แสดงวิธีการใช้ AI API โดยตรงในการสร้างเนื้อหาสำหรับ placeholder
 */

import { AIContentGenerator } from '../core/AIContentGenerator';
import { UserData, Template } from '../types/Template';
import { PlaceholderMatch } from '../types/Placeholder';

// ตัวอย่างการใช้งาน
async function demonstrateDirectAI() {
  console.log('🚀 เริ่มต้นตัวอย่างการใช้งาน AI โดยตรงด้วย QUESTION_API_KEY');
  
  // ตรวจสอบ API Key
  if (!process.env.QUESTION_API_KEY) {
    console.error('❌ QUESTION_API_KEY ไม่พบใน environment variables');
    console.log('💡 กรุณาตั้งค่า QUESTION_API_KEY ใน .env file');
    return;
  }
  
  // สร้าง AIContentGenerator
  const aiGenerator = new AIContentGenerator();
  
  // ข้อมูลผู้ใช้ตัวอย่าง
  const userData: UserData = {
    brandName: 'ร้านกาแฟอร่อย',
    theme: 'cozy',
    content: {
      heroTitle: 'ยินดีต้อนรับสู่ร้านกาแฟอร่อย',
      heroSubtitle: 'กาแฟสดใหม่ อบอุ่นใจ'
    },
    customizations: {
      colors: {
        primary: '#8B4513', // brown-600
        secondary: '#D2691E' // chocolate
      }
    }
  };
  
  // Template ตัวอย่าง
  const template: Template = {
    key: 'coffee-shop-template',
    label: 'Coffee Shop Template',
    category: 'food',
    meta: {
      description: 'Template สำหรับร้านกาแฟ',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Midori Team',
      versioningPolicy: 'semver'
    },
    tags: ['food', 'coffee', 'cafe'],
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
      fullMatch: '<text/>',
      type: 'text',
      position: 0,
      context: { file: 'hero.tsx', line: 10 }
    },
    {
      fullMatch: '<tw/>',
      type: 'tw',
      position: 0,
      context: { file: 'button.tsx', line: 15 }
    },
    {
      fullMatch: '<img/>',
      type: 'img',
      position: 0,
      context: { file: 'hero.tsx', line: 8 }
    },
    {
      fullMatch: '<data key="price"/>',
      type: 'data',
      key: 'price',
      position: 0,
      context: { file: 'product.tsx', line: 20 }
    }
  ];
  
  // ทดสอบการสร้างเนื้อหาสำหรับแต่ละ placeholder
  for (const placeholder of placeholders) {
    try {
      console.log(`\n🎨 สร้างเนื้อหา AI สำหรับ: ${placeholder.type} placeholder`);
      console.log(`📍 ตำแหน่ง: ${placeholder.context.file}:${placeholder.context.line}`);
      
      const aiContent = await aiGenerator.generatePlaceholderContent(
        placeholder,
        userData,
        template,
        `component in ${placeholder.context.file}`
      );
      
      console.log(`✅ ได้เนื้อหา AI: "${aiContent}"`);
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด:`, error);
    }
  }
  
  // แสดงวิธีการอัปเดตเอกสาร Tailwind CSS
  console.log('\n📚 ตัวอย่างการอัปเดตเอกสาร Tailwind CSS');
  
  // เพิ่ม Common Pattern สำหรับร้านกาแฟ
  aiGenerator.addCommonPattern(
    'Coffee Button Primary',
    'bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg'
  );
  
  aiGenerator.addCommonPattern(
    'Coffee Card',
    'bg-white shadow-lg rounded-xl p-8 border border-amber-100 hover:shadow-xl transition-shadow duration-300'
  );
  
  aiGenerator.addCommonPattern(
    'Coffee Hero',
    'bg-gradient-to-br from-amber-500 to-orange-600 text-white py-24 px-6 rounded-2xl shadow-2xl'
  );
  
  console.log('✅ เพิ่ม Common Patterns สำหรับร้านกาแฟแล้ว');
  
  // ทดสอบการสร้าง Tailwind classes ใหม่
  const tailwindPlaceholder: PlaceholderMatch = {
    fullMatch: '<tw/>',
    type: 'tw',
    position: 0,
    context: { file: 'coffee-button.tsx', line: 5 }
  };
  
  try {
    console.log('\n🎨 ทดสอบการสร้าง Tailwind classes ใหม่');
    
    const tailwindClasses = await aiGenerator.generatePlaceholderContent(
      tailwindPlaceholder,
      userData,
      template,
      'coffee shop button component'
    );
    
    console.log(`✅ ได้ Tailwind classes: ${tailwindClasses}`);
    
  } catch (error) {
    console.error(`❌ ข้อผิดพลาดในการสร้าง Tailwind:`, error);
  }
  
  console.log('\n🎉 เสร็จสิ้นการทดสอบ AI โดยตรงด้วย QUESTION_API_KEY');
}

// ตัวอย่างการใช้งานแบบ advanced
async function demonstrateAdvancedDirectAI() {
  console.log('\n🚀 เริ่มต้นตัวอย่าง Advanced Direct AI');
  
  const aiGenerator = new AIContentGenerator();
  
  // สร้างเอกสาร Tailwind CSS แบบ custom สำหรับร้านอาหาร
  const customTailwindDoc = `
## Custom Restaurant Colors
- Food Primary: bg-orange-500, bg-orange-600, bg-orange-700, text-orange-500, text-orange-600, text-orange-700
- Food Secondary: bg-red-500, bg-red-600, bg-red-700, text-red-500, text-red-600, text-red-700
- Food Accent: bg-yellow-500, bg-yellow-600, bg-yellow-700, text-yellow-500, text-yellow-600, text-yellow-700

## Custom Patterns
- Food Button: bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
- Food Card: bg-white shadow-xl rounded-2xl p-8 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300
- Food Hero: bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 text-white py-32 px-8 rounded-3xl shadow-2xl
- Food Badge: bg-orange-100 text-orange-800 text-sm font-semibold px-4 py-2 rounded-full border border-orange-200
- Food Input: border-2 border-orange-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-200
`;
  
  // อัปเดตเอกสาร
  aiGenerator.updateTailwindDocumentation(customTailwindDoc);
  
  console.log('✅ อัปเดตเอกสาร Tailwind CSS แบบ custom สำหรับร้านอาหารแล้ว');
  
  // ทดสอบการสร้าง classes ใหม่
  const userData: UserData = {
    brandName: 'ร้านส้มตำอร่อย',
    theme: 'cozy',
    customizations: {
      colors: {
        primary: '#f97316', // orange-500
        secondary: '#dc2626' // red-600
      }
    }
  };
  
  const template: Template = {
    key: 'somtam-template',
    label: 'Som Tam Template',
    category: 'food',
    meta: {
      description: 'Template สำหรับร้านส้มตำ',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Midori Team',
      versioningPolicy: 'semver'
    },
    tags: ['food', 'somtam', 'thai'],
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
        cozy: 'primary:orange-600; accent:red-400; radius:lg; elevation:md'
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
      'hero section for Thai restaurant'
    );
    
    console.log(`✅ ได้ Tailwind classes สำหรับ Hero: ${tailwindClasses}`);
    
  } catch (error) {
    console.error(`❌ ข้อผิดพลาด:`, error);
  }
  
  console.log('\n🎉 เสร็จสิ้นการทดสอบ Advanced Direct AI');
}

// ตัวอย่างการทดสอบ Error Handling
async function demonstrateErrorHandling() {
  console.log('\n🚀 เริ่มต้นตัวอย่าง Error Handling');
  
  const aiGenerator = new AIContentGenerator();
  
  // ทดสอบกับข้อมูลที่ไม่สมบูรณ์
  const incompleteUserData: UserData = {
    brandName: '', // ชื่อแบรนด์ว่าง
    theme: 'unknown-theme', // ธีมที่ไม่รู้จัก
    content: {},
    customizations: {}
  };
  
  const template: Template = {
    key: 'test-template',
    label: 'Test Template',
    category: 'general',
    meta: {
      description: 'Template สำหรับทดสอบ',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Midori Team',
      versioningPolicy: 'semver'
    },
    tags: ['test'],
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
        modern: 'primary:blue-600; accent:yellow-400; radius:lg; elevation:md'
      }
    }
  };
  
  const placeholder: PlaceholderMatch = {
    fullMatch: '<text/>',
    type: 'text',
    position: 0,
    context: { file: 'test.tsx', line: 1 }
  };
  
  try {
    console.log('🧪 ทดสอบกับข้อมูลที่ไม่สมบูรณ์');
    
    const result = await aiGenerator.generatePlaceholderContent(
      placeholder,
      incompleteUserData,
      template,
      'test context'
    );
    
    console.log(`✅ ได้ผลลัพธ์ (fallback): "${result}"`);
    
  } catch (error) {
    console.error(`❌ ข้อผิดพลาด:`, error);
  }
  
  console.log('\n🎉 เสร็จสิ้นการทดสอบ Error Handling');
}

// เรียกใช้ตัวอย่าง
if (require.main === module) {
  demonstrateDirectAI()
    .then(() => demonstrateAdvancedDirectAI())
    .then(() => demonstrateErrorHandling())
    .catch(console.error);
}

export { demonstrateDirectAI, demonstrateAdvancedDirectAI, demonstrateErrorHandling };
