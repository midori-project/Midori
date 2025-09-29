/**
 * ตัวอย่างการใช้งาน Template System แบบพื้นฐาน
 */

import { TemplateEngine } from '../core/TemplateEngine';
import { Template } from '../types/Template';
import { UserData } from '../types/Template';

// ตัวอย่างการใช้งานพื้นฐาน
export async function basicUsageExample() {
  console.log('🚀 เริ่มต้นตัวอย่างการใช้งาน Template System');

  // 1. สร้าง TemplateEngine
  const engine = new TemplateEngine({
    outputDir: './output',
    autoExport: true,
    exportFormat: 'zip',
    includeManifest: true
  });

  // 2. สร้างข้อมูลผู้ใช้
  const userData: UserData = {
    brandName: 'ร้านหมูปิ้งอร่อย',
    theme: 'cozy',
    content: {
      heroTitle: 'ยินดีต้อนรับสู่ร้านหมูปิ้งอร่อย',
      heroSubtitle: 'หมูปิ้งสดใหม่ ปรุงรสแบบไทยแท้',
      ctaLabel: 'สั่งซื้อเลย'
    },
    customizations: {
      colors: {
        primary: '#10b981',
        secondary: '#f97316'
      }
    }
  };

  // 3. โหลด template (ในความเป็นจริงจะโหลดจากไฟล์)
  const template: Template = {
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
      sourceFiles: [
        {
          path: 'src/App.tsx',
          type: 'code',
          encoding: 'utf8',
          content: `import React from 'react';

const App: React.FC = () => {
  return (
    <div className="<tw/>">
      <h1><text/></h1>
      <p><text/></p>
      <img src="<img/>" alt="<text/>" />
    </div>
  );
};

export default App;`
        }
      ],
      slots: {
        header: {
          type: 'object',
          component: 'Header',
          fields: [
            { key: 'brandName', type: 'text', required: true },
            { key: 'tagline', type: 'text' }
          ]
        }
      },
      constraints: {
        a11y: { contrast: 'AA', minFontSizePx: 14, ariaRequired: true, keyboardNavigable: true },
        performance: { maxImageKb: 700, maxCriticalCssKb: 180 }
      }
    },
    placeholderConfig: {
      hasPlaceholders: true,
      placeholderTypes: { tw: 1, text: 3, img: 1, data: 0 },
      themeMapping: {
        modern: 'primary:sky-600; accent:amber-400',
        cozy: 'primary:emerald-600; accent:orange-400',
        minimal: 'primary:gray-600; accent:blue-400'
      }
    }
  };

  try {
    // 4. ประมวลผล template
    console.log('📝 กำลังประมวลผล template...');
    const result = await engine.processTemplate(template, userData);

    if (result.success) {
      console.log('✅ ประมวลผลสำเร็จ!');
      console.log(`📊 ข้อมูลผลลัพธ์:`);
      console.log(`  - ไฟล์: ${result.template.files.length} ไฟล์`);
      console.log(`  - เวลาประมวลผล: ${result.processingTime}ms`);
      console.log(`  - คะแนนการตรวจสอบ: ${result.template.validation.score}/100`);
      
      if (result.export) {
        console.log(`📦 ส่งออกไฟล์: ${result.export.outputPath}`);
        console.log(`📏 ขนาดไฟล์: ${Math.round(result.export.totalSize / 1024)}KB`);
      }

      // 5. แสดงข้อมูลเพิ่มเติม
      console.log(`🎨 ธีมที่ใช้: ${result.template.metadata.themeApplied}`);
      console.log(`🔢 จำนวน placeholder: ${result.template.metadata.placeholderCount}`);
      
      if (result.template.validation.warnings.length > 0) {
        console.log(`⚠️ คำเตือน:`);
        result.template.validation.warnings.forEach(warning => {
          console.log(`  - ${warning}`);
        });
      }

    } else {
      console.error('❌ ประมวลผลล้มเหลว:', result.error);
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

// ตัวอย่างการใช้งานแบบขั้นสูง
export async function advancedUsageExample() {
  console.log('🚀 เริ่มต้นตัวอย่างการใช้งานขั้นสูง');

  const engine = new TemplateEngine({
    outputDir: './output/advanced',
    autoExport: false, // ไม่ส่งออกอัตโนมัติ
    includeManifest: true,
    includeMetadata: true
  });

  // สร้างข้อมูลผู้ใช้หลายแบบ
  const businessTypes = ['food', 'fashion', 'technology', 'general'];
  
  for (const businessType of businessTypes) {
    console.log(`\n📝 ประมวลผลธุรกิจประเภท: ${businessType}`);
    
    // สร้างข้อมูลผู้ใช้ตามประเภทธุรกิจ
    const userData = engine.generateSampleUserData(businessType);
    
    // โหลด template (ในความเป็นจริงจะโหลดจากไฟล์)
    const template = await loadTemplateFromFile('./templates/online-shop-enhanced.json');
    
    try {
      // ประมวลผล template
      const result = await engine.processTemplate(template, userData);
      
      if (result.success) {
        console.log(`✅ ประมวลผลสำเร็จ: ${userData.brandName}`);
        
        // ส่งออกเป็นไฟล์แยก
        const exportResult = await engine.exportProcessedTemplate(result.template, {
          format: 'files',
          includeManifest: true,
          includeMetadata: true
        });
        
        if (exportResult.success) {
          console.log(`📁 ส่งออกไฟล์: ${exportResult.outputPath}`);
          
          // สร้างโปรเจกต์เต็มรูปแบบ
          const fullProjectResult = await engine.createFullProject(
            result.template, 
            `${exportResult.outputPath}-full`
          );
          
          if (fullProjectResult.success) {
            console.log(`🏗️ สร้างโปรเจกต์เต็มรูปแบบ: ${fullProjectResult.outputPath}`);
          }
        }
        
      } else {
        console.error(`❌ ประมวลผลล้มเหลว: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ ข้อผิดพลาด: ${error}`);
    }
  }
}

// ตัวอย่างการตรวจสอบ template
export async function validationExample() {
  console.log('🔍 ตัวอย่างการตรวจสอบ template');

  const engine = new TemplateEngine();
  
  // โหลด template
  const template = await loadTemplateFromFile('./templates/online-shop-enhanced.json');
  
  // ตรวจสอบ template
  const isValid = await engine.validateTemplate(template);
  
  if (isValid) {
    console.log('✅ Template ผ่านการตรวจสอบ');
  } else {
    console.log('❌ Template ไม่ผ่านการตรวจสอบ');
  }
  
  // ตรวจสอบธีม
  const themes = engine.getAvailableThemes();
  console.log(`🎨 ธีมที่มี: ${themes.join(', ')}`);
  
  for (const theme of themes) {
    const isValidTheme = engine.validateTheme(theme);
    console.log(`  ${theme}: ${isValidTheme ? '✅' : '❌'}`);
  }
}

// ตัวอย่างการจัดการไฟล์
export async function fileManagementExample() {
  console.log('📁 ตัวอย่างการจัดการไฟล์');

  const engine = new TemplateEngine();
  
  // สร้างข้อมูลผู้ใช้
  const userData = engine.generateSampleUserData('food');
  
  // โหลดและประมวลผล template
  const template = await loadTemplateFromFile('./templates/online-shop-enhanced.json');
  const result = await engine.processTemplate(template, userData);
  
  if (result.success) {
    // บันทึก template ที่ประมวลผลแล้ว
    const savePath = './output/processed-template.json';
    await engine.saveProcessedTemplate(result.template, savePath);
    console.log(`💾 บันทึก template: ${savePath}`);
    
    // โหลด template ที่บันทึกไว้
    const loadedTemplate = await engine.loadProcessedTemplate(savePath);
    console.log(`📂 โหลด template: ${loadedTemplate.manifest.name}`);
    
    // ส่งออกเป็น JSON
    const jsonExport = await engine.exportProcessedTemplate(loadedTemplate, {
      format: 'json',
      includeManifest: true,
      includeMetadata: true
    });
    
    if (jsonExport.success) {
      console.log(`📄 ส่งออก JSON: ${jsonExport.outputPath}`);
    }
  }
}

// ฟังก์ชันช่วยเหลือ
async function loadTemplateFromFile(filePath: string): Promise<Template> {
  // ในความเป็นจริงจะใช้ fs หรือ fetch
  // ที่นี่เราจะใช้ข้อมูลตัวอย่าง
  return {
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
}

// รันตัวอย่าง
if (require.main === module) {
  console.log('🎯 เริ่มต้นตัวอย่างการใช้งาน Template System\n');
  
  // รันตัวอย่างพื้นฐาน
  basicUsageExample()
    .then(() => {
      console.log('\n🎉 ตัวอย่างพื้นฐานเสร็จสิ้น\n');
      
      // รันตัวอย่างขั้นสูง
      return advancedUsageExample();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่างขั้นสูงเสร็จสิ้น\n');
      
      // รันตัวอย่างการตรวจสอบ
      return validationExample();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่างการตรวจสอบเสร็จสิ้น\n');
      
      // รันตัวอย่างการจัดการไฟล์
      return fileManagementExample();
    })
    .then(() => {
      console.log('\n🎉 ตัวอย่างการจัดการไฟล์เสร็จสิ้น');
      console.log('\n✨ ทุกตัวอย่างเสร็จสิ้นแล้ว!');
    })
    .catch((error) => {
      console.error('\n❌ เกิดข้อผิดพลาดในการรันตัวอย่าง:', error);
    });
}
