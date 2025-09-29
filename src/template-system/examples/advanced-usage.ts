/**
 * ตัวอย่างการใช้งาน Template System แบบขั้นสูง
 * รวมการใช้งาน AI Content Generation, Theme Customization, และ Advanced Features
 */

import { TemplateEngine } from '../core/TemplateEngine';
import { Template } from '../types/Template';
import { UserData } from '../types/Template';

// ตัวอย่างการใช้งาน AI Content Generation
export async function aiContentGenerationExample() {
  console.log('🤖 ตัวอย่างการใช้งาน AI Content Generation');

  const engine = new TemplateEngine({
    outputDir: './output/ai-generated',
    autoExport: true,
    exportFormat: 'files'
  });

  // สร้างข้อมูลผู้ใช้สำหรับธุรกิจอาหาร
  const foodBusinessData: UserData = {
    brandName: 'ร้านก๋วยเตี๋ยวเจ้าเก่า',
    theme: 'cozy',
    content: {
      businessType: 'food',
      cuisine: 'thai',
      specialty: 'ก๋วยเตี๋ยว'
    },
    customizations: {
      tone: 'warm',
      targetAudience: 'locals',
      priceRange: 'affordable'
    }
  };

  // สร้างข้อมูลผู้ใช้สำหรับธุรกิจแฟชั่น
  const fashionBusinessData: UserData = {
    brandName: 'StyleHub Fashion',
    theme: 'modern',
    content: {
      businessType: 'fashion',
      style: 'korean',
      targetAge: 'young-adults'
    },
    customizations: {
      tone: 'trendy',
      targetAudience: 'fashion-conscious',
      priceRange: 'mid-range'
    }
  };

  const businessDataList = [
    { name: 'Food Business', data: foodBusinessData },
    { name: 'Fashion Business', data: fashionBusinessData }
  ];

  for (const { name, data } of businessDataList) {
    console.log(`\n📝 ประมวลผล: ${name}`);
    
    // โหลด template
    const template = await loadAdvancedTemplate();
    
    try {
      // ประมวลผล template
      const result = await engine.processTemplate(template, data);
      
      if (result.success) {
        console.log(`✅ ประมวลผลสำเร็จ: ${data.brandName}`);
        console.log(`🎨 ธีม: ${data.theme}`);
        console.log(`📊 คะแนน AI: ${result.template.metadata.validationPassed ? 'ผ่าน' : 'ไม่ผ่าน'}`);
        
        // แสดงข้อมูลที่ AI สร้าง
        console.log(`🤖 เนื้อหาที่ AI สร้าง:`);
        console.log(`  - Hero Title: ${data.content.heroTitle || 'N/A'}`);
        console.log(`  - Hero Subtitle: ${data.content.heroSubtitle || 'N/A'}`);
        console.log(`  - CTA Label: ${data.content.ctaLabel || 'N/A'}`);
        
      } else {
        console.error(`❌ ประมวลผลล้มเหลว: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด: ${error}`);
    }
  }
}

// ตัวอย่างการปรับแต่งธีมขั้นสูง
export async function advancedThemeCustomizationExample() {
  console.log('🎨 ตัวอย่างการปรับแต่งธีมขั้นสูง');

  const engine = new TemplateEngine({
    outputDir: './output/theme-customized'
  });

  // สร้างธีมแบบกำหนดเอง
  const customThemes = [
    {
      name: 'luxury',
      displayName: 'Luxury',
      colors: {
        primary: '#8B4513', // Brown
        secondary: '#FFD700', // Gold
        accent: '#C0C0C0' // Silver
      },
      typography: {
        fontFamily: 'Playfair Display',
        fontSize: 'large'
      },
      spacing: 'generous',
      borderRadius: 'minimal'
    },
    {
      name: 'playful',
      displayName: 'Playful',
      colors: {
        primary: '#FF6B6B', // Coral
        secondary: '#4ECDC4', // Teal
        accent: '#45B7D1' // Sky Blue
      },
      typography: {
        fontFamily: 'Comic Sans MS',
        fontSize: 'medium'
      },
      spacing: 'compact',
      borderRadius: 'rounded'
    },
    {
      name: 'minimalist',
      displayName: 'Minimalist',
      colors: {
        primary: '#2C3E50', // Dark Blue
        secondary: '#ECF0F1', // Light Gray
        accent: '#E74C3C' // Red
      },
      typography: {
        fontFamily: 'Helvetica',
        fontSize: 'small'
      },
      spacing: 'minimal',
      borderRadius: 'sharp'
    }
  ];

  const baseUserData: UserData = {
    brandName: 'Custom Brand',
    theme: 'modern',
    content: {
      heroTitle: 'Custom Brand Experience',
      heroSubtitle: 'Tailored to your needs'
    }
  };

  for (const customTheme of customThemes) {
    console.log(`\n🎨 ทดสอบธีม: ${customTheme.displayName}`);
    
    // ปรับแต่งข้อมูลผู้ใช้ตามธีม
    const themedUserData: UserData = {
      ...baseUserData,
      theme: customTheme.name,
      customizations: {
        colors: customTheme.colors,
        typography: customTheme.typography,
        spacing: customTheme.spacing,
        borderRadius: customTheme.borderRadius
      }
    };

    // โหลด template
    const template = await loadAdvancedTemplate();
    
    try {
      // ประมวลผล template
      const result = await engine.processTemplate(template, themedUserData);
      
      if (result.success) {
        console.log(`✅ ประมวลผลสำเร็จ: ${customTheme.displayName}`);
        console.log(`🎨 สีหลัก: ${customTheme.colors.primary}`);
        console.log(`🔤 ฟอนต์: ${customTheme.typography.fontFamily}`);
        console.log(`📏 Spacing: ${customTheme.spacing}`);
        
        // ส่งออกเป็นไฟล์แยก
        const exportResult = await engine.exportProcessedTemplate(result.template, {
          format: 'files',
          outputPath: `./output/theme-customized/${customTheme.name}`
        });
        
        if (exportResult.success) {
          console.log(`📁 ส่งออก: ${exportResult.outputPath}`);
        }
        
      } else {
        console.error(`❌ ประมวลผลล้มเหลว: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด: ${error}`);
    }
  }
}

// ตัวอย่างการใช้งาน Multi-language Support
export async function multiLanguageExample() {
  console.log('🌍 ตัวอย่างการใช้งาน Multi-language Support');

  const engine = new TemplateEngine({
    outputDir: './output/multi-language'
  });

  const languages = [
    {
      code: 'th',
      name: 'Thai',
      data: {
        brandName: 'ร้านค้าออนไลน์',
        theme: 'cozy',
        content: {
          heroTitle: 'ยินดีต้อนรับสู่ร้านค้าออนไลน์',
          heroSubtitle: 'บริการคุณภาพดี ราคาเป็นมิตร',
          ctaLabel: 'เริ่มช้อป',
          currency: '฿',
          language: 'th'
        }
      }
    },
    {
      code: 'en',
      name: 'English',
      data: {
        brandName: 'Online Store',
        theme: 'modern',
        content: {
          heroTitle: 'Welcome to Online Store',
          heroSubtitle: 'Quality service at affordable prices',
          ctaLabel: 'Start Shopping',
          currency: '$',
          language: 'en'
        }
      }
    },
    {
      code: 'ja',
      name: 'Japanese',
      data: {
        brandName: 'オンラインストア',
        theme: 'minimal',
        content: {
          heroTitle: 'オンラインストアへようこそ',
          heroSubtitle: '高品質なサービスを手頃な価格で',
          ctaLabel: 'ショッピングを始める',
          currency: '¥',
          language: 'ja'
        }
      }
    }
  ];

  for (const lang of languages) {
    console.log(`\n🌍 ประมวลผลภาษา: ${lang.name} (${lang.code})`);
    
    // โหลด template
    const template = await loadAdvancedTemplate();
    
    try {
      // ประมวลผล template
      const result = await engine.processTemplate(template, lang.data);
      
      if (result.success) {
        console.log(`✅ ประมวลผลสำเร็จ: ${lang.data.brandName}`);
        console.log(`💰 สกุลเงิน: ${lang.data.content.currency}`);
        console.log(`🔤 ภาษา: ${lang.data.content.language}`);
        
        // ส่งออกเป็นไฟล์แยก
        const exportResult = await engine.exportProcessedTemplate(result.template, {
          format: 'files',
          outputPath: `./output/multi-language/${lang.code}`
        });
        
        if (exportResult.success) {
          console.log(`📁 ส่งออก: ${exportResult.outputPath}`);
        }
        
      } else {
        console.error(`❌ ประมวลผลล้มเหลว: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด: ${error}`);
    }
  }
}

// ตัวอย่างการใช้งาน Batch Processing
export async function batchProcessingExample() {
  console.log('📦 ตัวอย่างการใช้งาน Batch Processing');

  const engine = new TemplateEngine({
    outputDir: './output/batch-processing'
  });

  // สร้างข้อมูลผู้ใช้หลายแบบ
  const batchData = [
    {
      name: 'Food Business 1',
      data: {
        brandName: 'ร้านก๋วยเตี๋ยวเจ้าเก่า',
        theme: 'cozy',
        content: { businessType: 'food', specialty: 'ก๋วยเตี๋ยว' }
      }
    },
    {
      name: 'Food Business 2',
      data: {
        brandName: 'ร้านข้าวมันไก่',
        theme: 'cozy',
        content: { businessType: 'food', specialty: 'ข้าวมันไก่' }
      }
    },
    {
      name: 'Fashion Business 1',
      data: {
        brandName: 'StyleHub Fashion',
        theme: 'modern',
        content: { businessType: 'fashion', style: 'korean' }
      }
    },
    {
      name: 'Fashion Business 2',
      data: {
        brandName: 'Trendy Clothes',
        theme: 'modern',
        content: { businessType: 'fashion', style: 'western' }
      }
    },
    {
      name: 'Tech Business 1',
      data: {
        brandName: 'Tech Store',
        theme: 'minimal',
        content: { businessType: 'technology', focus: 'computers' }
      }
    },
    {
      name: 'Tech Business 2',
      data: {
        brandName: 'Gadget Hub',
        theme: 'minimal',
        content: { businessType: 'technology', focus: 'mobile' }
      }
    }
  ];

  console.log(`📊 ประมวลผล ${batchData.length} โปรเจกต์`);

  const results = [];
  const startTime = Date.now();

  // ประมวลผลแบบ parallel
  const promises = batchData.map(async ({ name, data }) => {
    console.log(`🔄 เริ่มประมวลผล: ${name}`);
    
    try {
      const template = await loadAdvancedTemplate();
      const result = await engine.processTemplate(template, data);
      
      if (result.success) {
        console.log(`✅ เสร็จสิ้น: ${name} (${result.processingTime}ms)`);
        return { name, success: true, result };
      } else {
        console.error(`❌ ล้มเหลว: ${name} - ${result.error}`);
        return { name, success: false, error: result.error };
      }
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด: ${name} - ${error}`);
      return { name, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // รอให้ทุก promise เสร็จสิ้น
  const batchResults = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  // สรุปผลลัพธ์
  const successful = batchResults.filter(r => r.success);
  const failed = batchResults.filter(r => !r.success);

  console.log(`\n📊 สรุปผลลัพธ์ Batch Processing:`);
  console.log(`  ✅ สำเร็จ: ${successful.length}/${batchData.length}`);
  console.log(`  ❌ ล้มเหลว: ${failed.length}/${batchData.length}`);
  console.log(`  ⏱️ เวลารวม: ${totalTime}ms`);
  console.log(`  📈 เวลาเฉลี่ย: ${Math.round(totalTime / batchData.length)}ms/โปรเจกต์`);

  if (failed.length > 0) {
    console.log(`\n❌ โปรเจกต์ที่ล้มเหลว:`);
    failed.forEach(f => {
      console.log(`  - ${f.name}: ${f.error}`);
    });
  }

  // ส่งออกผลลัพธ์ที่สำเร็จ
  for (const { name, result } of successful) {
    const exportResult = await engine.exportProcessedTemplate(result.template, {
      format: 'zip',
      outputPath: `./output/batch-processing/${name.replace(/\s+/g, '-').toLowerCase()}`
    });
    
    if (exportResult.success) {
      console.log(`📦 ส่งออก: ${name} -> ${exportResult.outputPath}`);
    }
  }
}

// ตัวอย่างการใช้งาน Performance Monitoring
export async function performanceMonitoringExample() {
  console.log('📊 ตัวอย่างการใช้งาน Performance Monitoring');

  const engine = new TemplateEngine({
    outputDir: './output/performance-test'
  });

  // ทดสอบประสิทธิภาพกับข้อมูลขนาดต่างๆ
  const testCases = [
    { name: 'Small Template', fileCount: 5, placeholderCount: 20 },
    { name: 'Medium Template', fileCount: 15, placeholderCount: 50 },
    { name: 'Large Template', fileCount: 30, placeholderCount: 100 },
    { name: 'Extra Large Template', fileCount: 50, placeholderCount: 200 }
  ];

  const performanceResults = [];

  for (const testCase of testCases) {
    console.log(`\n🧪 ทดสอบ: ${testCase.name}`);
    
    // สร้าง template ขนาดต่างๆ
    const template = await generateTestTemplate(testCase.fileCount, testCase.placeholderCount);
    const userData = engine.generateSampleUserData('general');
    
    // วัดประสิทธิภาพ
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await engine.processTemplate(template, userData);
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      
      const processingTime = endTime - startTime;
      const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;
      
      performanceResults.push({
        name: testCase.name,
        fileCount: testCase.fileCount,
        placeholderCount: testCase.placeholderCount,
        processingTime,
        memoryUsed,
        success: result.success,
        validationScore: result.template.validation.score
      });
      
      console.log(`  ⏱️ เวลาประมวลผล: ${processingTime}ms`);
      console.log(`  💾 หน่วยความจำ: ${Math.round(memoryUsed / 1024 / 1024)}MB`);
      console.log(`  📊 คะแนน: ${result.template.validation.score}/100`);
      console.log(`  ✅ สถานะ: ${result.success ? 'สำเร็จ' : 'ล้มเหลว'}`);
      
    } catch (error) {
      console.error(`  ❌ ข้อผิดพลาด: ${error}`);
      performanceResults.push({
        name: testCase.name,
        fileCount: testCase.fileCount,
        placeholderCount: testCase.placeholderCount,
        processingTime: 0,
        memoryUsed: 0,
        success: false,
        validationScore: 0
      });
    }
  }

  // สรุปผลการทดสอบประสิทธิภาพ
  console.log(`\n📊 สรุปผลการทดสอบประสิทธิภาพ:`);
  console.log(`┌─────────────────────┬──────────┬─────────────┬──────────┬──────────┬──────────┐`);
  console.log(`│ Template            │ ไฟล์     │ Placeholder │ เวลา(ms) │ หน่วยความจำ(MB) │ คะแนน   │`);
  console.log(`├─────────────────────┼──────────┼─────────────┼──────────┼──────────┼──────────┤`);
  
  performanceResults.forEach(result => {
    const name = result.name.padEnd(19);
    const files = result.fileCount.toString().padStart(8);
    const placeholders = result.placeholderCount.toString().padStart(11);
    const time = result.processingTime.toString().padStart(8);
    const memory = Math.round(result.memoryUsed / 1024 / 1024).toString().padStart(14);
    const score = result.validationScore.toString().padStart(8);
    
    console.log(`│ ${name} │ ${files} │ ${placeholders} │ ${time} │ ${memory} │ ${score} │`);
  });
  
  console.log(`└─────────────────────┴──────────┴─────────────┴──────────┴──────────┴──────────┘`);
}

// ฟังก์ชันช่วยเหลือ
async function loadAdvancedTemplate(): Promise<Template> {
  // ในความเป็นจริงจะโหลดจากไฟล์
  return {
    key: 'advanced-template',
    label: 'Advanced Template',
    category: 'e-commerce',
    meta: {
      description: 'Advanced template with AI support',
      engine: 'react-vite-tailwind',
      status: 'published',
      author: 'Midori Team',
      versioningPolicy: 'semver'
    },
    tags: ['advanced', 'ai-ready'],
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
}

async function generateTestTemplate(fileCount: number, placeholderCount: number): Promise<Template> {
  const sourceFiles = [];
  
  for (let i = 0; i < fileCount; i++) {
    let content = `// Test file ${i + 1}\n`;
    
    // เพิ่ม placeholder
    for (let j = 0; j < Math.floor(placeholderCount / fileCount); j++) {
      content += `<text/>\n`;
      content += `<tw/>\n`;
    }
    
    sourceFiles.push({
      path: `src/test${i + 1}.tsx`,
      type: 'code' as const,
      encoding: 'utf8' as const,
      content
    });
  }
  
  return {
    key: 'test-template',
    label: 'Test Template',
    category: 'test',
    meta: {
      description: 'Test template for performance monitoring',
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
      sourceFiles,
      slots: {},
      constraints: {}
    },
    placeholderConfig: {
      hasPlaceholders: true,
      placeholderTypes: { tw: 0, text: 0, img: 0, data: 0 },
      themeMapping: {}
    }
  };
}

// รันตัวอย่างขั้นสูง
if (require.main === module) {
  console.log('🎯 เริ่มต้นตัวอย่างการใช้งานขั้นสูง\n');
  
  // รันตัวอย่าง AI Content Generation
  aiContentGenerationExample()
    .then(() => {
      console.log('\n🎉 ตัวอย่าง AI Content Generation เสร็จสิ้น\n');
      
      // รันตัวอย่างการปรับแต่งธีมขั้นสูง
      return advancedThemeCustomizationExample();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่างการปรับแต่งธีมขั้นสูงเสร็จสิ้น\n');
      
      // รันตัวอย่าง Multi-language Support
      return multiLanguageExample();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่าง Multi-language Support เสร็จสิ้น\n');
      
      // รันตัวอย่าง Batch Processing
      return batchProcessingExample();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่าง Batch Processing เสร็จสิ้น\n');
      
      // รันตัวอย่าง Performance Monitoring
      return performanceMonitoringExample();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่าง Performance Monitoring เสร็จสิ้น');
      console.log('\n✨ ทุกตัวอย่างขั้นสูงเสร็จสิ้นแล้ว!');
    })
    .catch((error) => {
      console.error('\n❌ เกิดข้อผิดพลาดในการรันตัวอย่างขั้นสูง:', error);
    });
}
