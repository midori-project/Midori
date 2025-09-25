/**
 * Template Slots Demo
 * ตัวอย่างการใช้งาน Template Slots Tool สำหรับ Frontend Agent
 */

import { TemplateSlotsTool } from './template-slots-tool';

export async function runTemplateSlotsDemo() {
  console.log('🚀 เริ่มต้น Template Slots Demo...\n');
  
  const tool = new TemplateSlotsTool();
  
  try {
    // 1. ดูรายการ templates
    console.log('📋 1. ดึงรายการ templates...');
    const templatesResult = await tool.execute({
      action: 'list_templates',
      params: { category: 'restaurant' }
    });
    
    if (templatesResult.success) {
      console.log('✅ Templates ที่พบ:', templatesResult.data);
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', templatesResult.error);
      return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. ดูข้อมูล template และ slots
    console.log('🔍 2. ดูข้อมูล template และ slots...');
    const templateResult = await tool.execute({
      action: 'get_template',
      params: { key: 'restaurant-basic', version: 1 }
    });
    
    if (templateResult.success) {
      console.log('✅ Template Info:', {
        template: templateResult.data.template,
        slots: {
          totalSlots: templateResult.data.slots.totalSlots,
          aliases: templateResult.data.slots.aliases,
          sampleSlots: Object.keys(templateResult.data.slots.schema.slots).slice(0, 3)
        }
      });
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', templateResult.error);
      return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. เติม slots ด้วยข้อมูลบางส่วน + ระบบสุ่ม
    console.log('🎲 3. เติม slots ด้วยระบบสุ่ม...');
    const fillResult = await tool.execute({
      action: 'fill_slots',
      params: {
        templateKey: 'restaurant-basic',
        version: 1,
        requirements: {
          businessName: 'ร้านอาหารสยาม',
          primaryColor: '#ff6b6b'
        },
        overrides: {
          'slots.hero.title': 'ยินดีต้อนรับสู่ร้านอาหารสยาม'
        },
        includeMock: true,
        mockProfile: 'th-local-basic'
      }
    });
    
    if (fillResult.success) {
      console.log('✅ Slots ที่เติมแล้ว:', {
        summary: fillResult.data.summary,
        sampleFilledSlots: Object.entries(fillResult.data.filledSlots)
          .slice(0, 5)
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, any>),
        mockedKeys: fillResult.data.mockedKeys,
        validationReport: fillResult.data.validationReport
      });
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', fillResult.error);
      return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Export bundle
    console.log('📦 4. สร้าง bundle ไฟล์...');
    const exportResult = await tool.execute({
      action: 'export_bundle',
      params: {
        templateKey: 'restaurant-basic',
        version: 1,
        filledSlots: fillResult.data.filledSlots,
        format: 'zip',
        includeFiles: true,
        fileName: 'restaurant-siam',
        resolveExternal: 'mock'
      }
    });
    
    if (exportResult.success) {
      console.log('✅ Export สำเร็จ:', {
        downloadUrl: exportResult.data.downloadUrl,
        size: exportResult.data.size,
        summary: exportResult.data.summary,
        manifest: exportResult.data.manifest
      });
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', exportResult.error);
      return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Flow ครบวงจร
    console.log('🔄 5. ทดสอบ Flow ครบวงจร...');
    const completeResult = await tool.execute({
      action: 'complete_flow',
      params: {
        templateKey: 'cafe-modern',
        requirements: {
          businessName: 'คาเฟ่โมเดิร์น',
          primaryColor: '#8B4513',
          secondaryColor: '#F5F5DC'
        },
        mockProfile: 'th-local-basic',
        exportFormat: 'zip',
        fileName: 'cafe-modern-complete'
      }
    });
    
    if (completeResult.success) {
      console.log('✅ Flow ครบวงจรสำเร็จ:', {
        template: completeResult.data.template,
        flowSummary: completeResult.data.flowSummary,
        exportResult: {
          downloadUrl: completeResult.data.exportResult.downloadUrl,
          summary: completeResult.data.exportResult.summary
        }
      });
    } else {
      console.error('❌ เกิดข้อผิดพลาด:', completeResult.error);
    }
    
    console.log('\n🎉 Template Slots Demo เสร็จสิ้น!');
    
  } catch (error) {
    console.error('💥 เกิดข้อผิดพลาดใน Demo:', error);
  }
}

// ฟังก์ชันทดสอบเฉพาะส่วน
export async function testRandomSlotFilling() {
  console.log('🎲 ทดสอบการเติม slots แบบสุ่ม...\n');
  
  const tool = new TemplateSlotsTool();
  
  // ทดสอบการเติม slots โดยไม่ใส่ requirements เลย (ให้ระบบสุ่มทั้งหมด)
  const result = await tool.execute({
    action: 'fill_slots',
    params: {
      templateKey: 'restaurant-basic',
      version: 1,
      requirements: {}, // ไม่ใส่ requirements เลย
      includeMock: true,
      mockProfile: 'random'
    }
  });
  
  if (result.success) {
    console.log('✅ ผลลัพธ์การสุ่ม:', {
      totalSlots: result.data.summary.totalSlots,
      filledSlots: result.data.summary.filledSlots,
      mockedSlots: result.data.summary.mockedSlots,
      sampleSlots: Object.entries(result.data.filledSlots)
        .slice(0, 8)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>)
    });
  } else {
    console.error('❌ เกิดข้อผิดพลาด:', result.error);
  }
}

// ฟังก์ชันทดสอบ Mock Profiles
export async function testMockProfiles() {
  console.log('🎭 ทดสอบ Mock Profiles...\n');
  
  const tool = new TemplateSlotsTool();
  const profiles = ['th-local-basic', 'global-basic', 'random'];
  
  for (const profile of profiles) {
    console.log(`📋 ทดสอบ profile: ${profile}`);
    
    const result = await tool.execute({
      action: 'fill_slots',
      params: {
        templateKey: 'restaurant-basic',
        version: 1,
        requirements: {
          businessName: 'ร้านทดสอบ'
        },
        includeMock: true,
        mockProfile: profile
      }
    });
    
    if (result.success) {
      console.log(`✅ ${profile}:`, {
        mockedKeys: result.data.mockedKeys,
        sampleMockData: result.data.mockedKeys
          .slice(0, 3)
          .reduce((acc: Record<string, any>, key: string) => {
            acc[key] = result.data.filledSlots[key];
            return acc;
          }, {} as Record<string, any>)
      });
    } else {
      console.error(`❌ ${profile}:`, result.error);
    }
    
    console.log('');
  }
}

// เรียกใช้ demo ถ้าเป็น main module
if (require.main === module) {
  runTemplateSlotsDemo()
    .then(() => {
      console.log('\n🎯 การทดสอบเสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 เกิดข้อผิดพลาด:', error);
      process.exit(1);
    });
}
