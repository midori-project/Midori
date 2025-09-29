/**
 * ตัวอย่างการใช้งาน AI Content Generator
 * แสดงให้เห็นการสร้างเนื้อหาด้วย AI API จริง
 */

import { AIContentGenerator } from '../core/AIContentGenerator';
import { Template } from '../types/Template';
import { UserData } from '../types/Template';

// ตัวอย่างการใช้งาน AI Content Generator
export async function aiContentGenerationDemo() {
  console.log('🤖 เริ่มต้นตัวอย่าง AI Content Generation');

  const aiGenerator = new AIContentGenerator();

  // ข้อมูลผู้ใช้สำหรับธุรกิจอาหาร
  const foodBusinessData: UserData = {
    brandName: 'ร้านก๋วยเตี๋ยวเจ้าเก่า',
    theme: 'cozy',
    content: {
      businessType: 'food',
      cuisine: 'thai',
      specialty: 'ก๋วยเตี๋ยว',
      location: 'กรุงเทพฯ',
      priceRange: 'affordable'
    },
    customizations: {
      tone: 'warm',
      targetAudience: 'locals',
      priceRange: 'affordable'
    }
  };

  // ข้อมูลผู้ใช้สำหรับธุรกิจแฟชั่น
  const fashionBusinessData: UserData = {
    brandName: 'StyleHub Fashion',
    theme: 'modern',
    content: {
      businessType: 'fashion',
      style: 'korean',
      targetAge: 'young-adults',
      priceRange: 'mid-range'
    },
    customizations: {
      tone: 'trendy',
      targetAudience: 'fashion-conscious',
      priceRange: 'mid-range'
    }
  };

  // ข้อมูลผู้ใช้สำหรับธุรกิจเทคโนโลยี
  const techBusinessData: UserData = {
    brandName: 'Tech Store',
    theme: 'minimal',
    content: {
      businessType: 'technology',
      focus: 'computers',
      targetMarket: 'gamers',
      priceRange: 'premium'
    },
    customizations: {
      tone: 'modern',
      targetAudience: 'tech-savvy',
      priceRange: 'premium'
    }
  };

  const testCases = [
    { name: 'Food Business', data: foodBusinessData },
    { name: 'Fashion Business', data: fashionBusinessData },
    { name: 'Tech Business', data: techBusinessData }
  ];

  // สร้าง template ตัวอย่าง
  const sampleTemplate: Template = {
    key: 'online-shop-enhanced',
    label: 'Online Shop Enhanced Template',
    category: 'e-commerce',
    meta: {
      description: 'Template ร้านค้าออนไลน์ที่ครบถ้วน',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Midori Team',
      versioningPolicy: 'semver'
    },
    tags: ['e-commerce', 'react', 'tailwind'],
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
      themeMapping: {}
    }
  };

  for (const { name, data } of testCases) {
    console.log(`\n📝 ทดสอบ: ${name}`);
    console.log(`🏪 ชื่อแบรนด์: ${data.brandName}`);
    console.log(`🎨 ธีม: ${data.theme}`);
    
    try {
      const startTime = Date.now();
      
      // สร้างเนื้อหาด้วย AI
      const aiContent = await aiGenerator.generateContent(sampleTemplate, data);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ สร้างเนื้อหาเสร็จสิ้นใน ${processingTime}ms`);
      console.log(`📊 ผลลัพธ์:`);
      console.log(`  - Hero Title: ${aiContent.heroTitle}`);
      console.log(`  - Hero Subtitle: ${aiContent.heroSubtitle}`);
      console.log(`  - Features: ${aiContent.features.length} รายการ`);
      console.log(`  - Products: ${aiContent.productInfo.featuredProducts.length} รายการ`);
      console.log(`  - Categories: ${aiContent.productInfo.categories.length} หมวดหมู่`);
      
      // แสดงฟีเจอร์
      console.log(`\n🎯 ฟีเจอร์หลัก:`);
      aiContent.features.forEach((feature, index) => {
        console.log(`  ${index + 1}. ${feature.icon} ${feature.title}: ${feature.description}`);
      });
      
      // แสดงสินค้าแนะนำ
      console.log(`\n🛍️ สินค้าแนะนำ:`);
      aiContent.productInfo.featuredProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ฿${product.price}`);
        console.log(`     ${product.description}`);
        console.log(`     คุณสมบัติ: ${product.features.join(', ')}`);
      });
      
      // แสดง SEO content
      console.log(`\n🔍 SEO Content:`);
      console.log(`  - Title: ${aiContent.seoContent.title}`);
      console.log(`  - Description: ${aiContent.seoContent.description}`);
      console.log(`  - Keywords: ${aiContent.seoContent.keywords.join(', ')}`);
      
      // แสดงข้อมูลติดต่อ
      console.log(`\n📞 ข้อมูลติดต่อ:`);
      console.log(`  - โทร: ${aiContent.contactInfo.phone}`);
      console.log(`  - อีเมล: ${aiContent.contactInfo.email}`);
      console.log(`  - ที่อยู่: ${aiContent.contactInfo.address}`);
      console.log(`  - เวลาทำการ: ${aiContent.contactInfo.hours}`);
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาดในการสร้างเนื้อหา: ${error}`);
    }
  }
}

// ตัวอย่างการเปรียบเทียบเนื้อหาที่สร้างด้วย AI vs Static
export async function compareAIVsStaticContent() {
  console.log('\n🔄 เปรียบเทียบเนื้อหา AI vs Static');

  const aiGenerator = new AIContentGenerator();
  
  const userData: UserData = {
    brandName: 'ร้านหมูปิ้งอร่อย',
    theme: 'cozy',
    content: {
      businessType: 'food',
      specialty: 'หมูปิ้ง',
      location: 'กรุงเทพฯ'
    }
  };

  const sampleTemplate: Template = {
    key: 'test-template',
    label: 'Test Template',
    category: 'e-commerce',
    meta: {
      description: 'Test template',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Test',
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
      themeMapping: {}
    }
  };

  try {
    console.log('🤖 สร้างเนื้อหาด้วย AI...');
    const aiStartTime = Date.now();
    const aiContent = await aiGenerator.generateContent(sampleTemplate, userData);
    const aiTime = Date.now() - aiStartTime;

    console.log('📊 สร้างเนื้อหาแบบ Static...');
    const staticStartTime = Date.now();
    const staticContent = await aiGenerator['generateBusinessContent'](
      aiGenerator['analyzeUserData'](userData), 
      sampleTemplate
    );
    const staticTime = Date.now() - staticStartTime;

    console.log(`\n📈 ผลการเปรียบเทียบ:`);
    console.log(`  - AI Generation: ${aiTime}ms`);
    console.log(`  - Static Generation: ${staticTime}ms`);
    console.log(`  - ความแตกต่าง: ${aiTime - staticTime}ms`);

    console.log(`\n🎯 เปรียบเทียบเนื้อหา:`);
    console.log(`  AI Hero Title: ${aiContent.heroTitle}`);
    console.log(`  Static Hero Title: ${staticContent.heroTitle}`);
    
    console.log(`\n  AI Features: ${aiContent.features.length} รายการ`);
    console.log(`  Static Features: ${staticContent.features.length} รายการ`);
    
    console.log(`\n  AI Products: ${aiContent.productInfo.featuredProducts.length} รายการ`);
    console.log(`  Static Products: ${staticContent.productInfo.featuredProducts.length} รายการ`);

  } catch (error) {
    console.error(`❌ ข้อผิดพลาดในการเปรียบเทียบ: ${error}`);
  }
}

// ตัวอย่างการทดสอบประสิทธิภาพ
export async function performanceTest() {
  console.log('\n⚡ ทดสอบประสิทธิภาพ AI Content Generation');

  const aiGenerator = new AIContentGenerator();
  
  const userData: UserData = {
    brandName: 'ร้านค้าทดสอบ',
    theme: 'modern',
    content: {
      businessType: 'general'
    }
  };

  const sampleTemplate: Template = {
    key: 'test-template',
    label: 'Test Template',
    category: 'e-commerce',
    meta: {
      description: 'Test template',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Test',
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
      themeMapping: {}
    }
  };

  const iterations = 5;
  const times: number[] = [];

  console.log(`🔄 ทดสอบ ${iterations} ครั้ง...`);

  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = Date.now();
      await aiGenerator.generateContent(sampleTemplate, userData);
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      times.push(processingTime);
      
      console.log(`  ครั้งที่ ${i + 1}: ${processingTime}ms`);
      
    } catch (error) {
      console.error(`  ครั้งที่ ${i + 1}: ข้อผิดพลาด - ${error}`);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`\n📊 สรุปผลการทดสอบ:`);
    console.log(`  - จำนวนครั้งที่สำเร็จ: ${times.length}/${iterations}`);
    console.log(`  - เวลาเฉลี่ย: ${Math.round(avgTime)}ms`);
    console.log(`  - เวลาน้อยที่สุด: ${minTime}ms`);
    console.log(`  - เวลามากที่สุด: ${maxTime}ms`);
  }
}

// รันตัวอย่างทั้งหมด
if (require.main === module) {
  console.log('🎯 เริ่มต้นตัวอย่าง AI Content Generation\n');
  
  aiContentGenerationDemo()
    .then(() => {
      console.log('\n🎉 ตัวอย่าง AI Content Generation เสร็จสิ้น\n');
      
      return compareAIVsStaticContent();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่างการเปรียบเทียบเสร็จสิ้น\n');
      
      return performanceTest();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่างการทดสอบประสิทธิภาพเสร็จสิ้น');
      console.log('\n✨ ทุกตัวอย่างเสร็จสิ้นแล้ว!');
    })
    .catch((error) => {
      console.error('\n❌ เกิดข้อผิดพลาดในการรันตัวอย่าง:', error);
    });
}
