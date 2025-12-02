/**
 * Layout Variants Demo
 * ทดสอบการเลือก layout variants สำหรับ restaurant categories
 */

import { runFrontendAgentV2 } from '../runners/run';
import { FrontendTaskV2 } from '../schemas/types';

// สี ANSI สำหรับ console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(80));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(80) + '\n');
}

async function testLayoutVariant(
  categoryId: string,
  categoryName: string,
  keywords: string[],
  description: string
) {
  section(`Testing: ${categoryName}`);
  
  log(`📝 Description: ${description}`, colors.yellow);
  log(`🏷️  Category: ${categoryId}`, colors.blue);
  log(`🔑 Keywords: ${keywords.join(', ')}`, colors.blue);
  
  const task: FrontendTaskV2 = {
    taskId: `test-${categoryId}-${Date.now()}`,
    taskType: 'generate_website',
    businessCategory: categoryId as any,
    keywords: keywords,
    customizations: {
      theme: 'modern',
      layout: 'single-page'
    },
    includePreview: false,
    includeProjectStructure: true,
    validation: {
      enabled: true,
      strictMode: false,
      accessibilityLevel: 'AA'
    },
    aiSettings: {
      model: 'gpt-5-nano',
      temperature: 1,
      language: 'th'
    }
  };

  try {
    log('\n⏳ Generating website...', colors.yellow);
    const startTime = Date.now();
    
    const result = await runFrontendAgentV2(task);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (result.success) {
      log(`\n✅ Success! Generated in ${duration}s`, colors.green);
      log(`📊 Results:`, colors.bright);
      console.log(`   - Files Generated: ${result.files.length}`);
      console.log(`   - Total Size: ${result.performance.totalSize}`);
      console.log(`   - Template Used: ${result.result.templateUsed}`);
      console.log(`   - Blocks: ${result.result.blocksGenerated.join(', ')}`);
      console.log(`   - AI Content: ${result.result.aiContentGenerated ? 'Yes' : 'No'}`);
      
      if (result.projectStructure) {
        console.log(`   - Project: ${result.projectStructure.projectStructure.name}`);
        console.log(`   - Total Project Files: ${result.projectStructure.files.length}`);
      }

      // แสดง sample ของ Hero component
      const heroFile = result.files.find(f => f.path.includes('Hero'));
      if (heroFile) {
        log(`\n📄 Hero Component Preview:`, colors.magenta);
        const preview = heroFile.content.substring(0, 500);
        console.log(preview + '...\n');
      }

      return { success: true, duration, result };
    } else {
      log(`\n❌ Failed!`, colors.bright);
      if (result.error) {
        console.error(`   Error: ${result.error.message}`);
        console.error(`   Code: ${result.error.code}`);
      }
      return { success: false, duration, result };
    }
  } catch (error) {
    log(`\n❌ Error occurred!`, colors.bright);
    console.error(error);
    return { success: false, duration: 0, error };
  }
}

async function runDemo() {
  console.clear();
  
  section('🎨 Frontend-V2 Layout Variants Demo');
  log('Testing all restaurant layout variants...', colors.cyan);
  
  const results: any[] = [];

  // Test 1: Restaurant Modern (Split Layout)
  results.push(await testLayoutVariant(
    'restaurant-modern',
    'Restaurant Modern',
    ['restaurant', 'modern', 'contemporary', 'fusion', 'ร้านอาหารโมเดิร์น'],
    'Modern restaurant with split layout - clean and contemporary design'
  ));

  await delay(2000);

  // Test 2: Restaurant Luxury (Fullscreen Layout)
  results.push(await testLayoutVariant(
    'restaurant-luxury',
    'Restaurant Luxury',
    ['restaurant', 'luxury', 'fine dining', 'premium', 'elegant', 'ร้านอาหารหรูหรา'],
    'Luxury fine dining with dramatic fullscreen hero'
  ));

  await delay(2000);

  // Test 3: Restaurant Minimal (Clean Layout)
  results.push(await testLayoutVariant(
    'restaurant-minimal',
    'Restaurant Minimal',
    ['restaurant', 'minimal', 'simple', 'clean', 'ร้านอาหารมินิมอล'],
    'Minimalist restaurant with clean, simple design'
  ));

  await delay(2000);

  // Test 4: Restaurant Casual (Cards Layout)
  results.push(await testLayoutVariant(
    'restaurant-casual',
    'Restaurant Casual',
    ['restaurant', 'casual', 'friendly', 'family', 'cozy', 'ร้านอาหารสบายๆ'],
    'Casual family-friendly restaurant with feature cards'
  ));

  await delay(2000);

  // Test 5: Auto-Detection (ให้ AI เลือก)
  section('Testing: Auto-Detection');
  log('📝 Description: Let AI choose the layout based on keywords', colors.yellow);
  log('🔑 Keywords: restaurant, luxury, fine dining, elegant', colors.blue);
  
  const autoTask: FrontendTaskV2 = {
    taskId: `test-auto-${Date.now()}`,
    taskType: 'generate_website',
    businessCategory: 'restaurant' as any, // ใส่ base category
    keywords: ['restaurant', 'luxury', 'fine dining', 'elegant'],
    aiSettings: {
      model: 'gpt-5-nano',
      temperature: 1,
      language: 'en'
    }
  };

  try {
    log('\n⏳ Generating website (auto-detect)...', colors.yellow);
    const autoResult = await runFrontendAgentV2(autoTask);
    
    if (autoResult.success) {
      log(`\n✅ Success! AI detected category: ${autoResult.result.businessCategory}`, colors.green);
      results.push({ success: true, category: autoResult.result.businessCategory });
    }
  } catch (error) {
    log(`\n❌ Auto-detection failed`, colors.bright);
    results.push({ success: false });
  }

  // Summary
  section('📊 Summary');
  
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  log(`Total Tests: ${totalTests}`, colors.bright);
  log(`Passed: ${successCount}`, colors.green);
  log(`Failed: ${totalTests - successCount}`, colors.bright);
  
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    const duration = r.duration ? ` (${r.duration}s)` : '';
    console.log(`  ${status} Test ${i + 1}${duration}`);
  });

  log('\n🎉 Demo completed!', colors.bright + colors.green);
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run demo
if (require.main === module) {
  runDemo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

export { runDemo, testLayoutVariant };

