/**
 * Interactive Layout Selector
 * เลือก layout variant แบบ interactive ผ่าน CLI
 */

import * as readline from 'readline';
import { runFrontendAgentV2 } from '../runners/run';
import { FrontendTaskV2 } from '../schemas/types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// สี ANSI
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

interface LayoutOption {
  id: string;
  name: string;
  variant: string;
  colors: string;
  vibe: string;
  bestFor: string;
  keywords: string[];
}

const layoutOptions: LayoutOption[] = [
  {
    id: 'restaurant-modern',
    name: '🔷 Modern (Split Layout)',
    variant: 'hero-split',
    colors: 'Blue & Indigo',
    vibe: 'ทันสมัย สะอาดตา',
    bestFor: 'Cafe, Fusion Restaurant',
    keywords: ['modern', 'contemporary', 'trendy', 'ร้านอาหารโมเดิร์น']
  },
  {
    id: 'restaurant-luxury',
    name: '💎 Luxury (Fullscreen Layout)',
    variant: 'hero-fullscreen',
    colors: 'Gray & Amber',
    vibe: 'หรูหรา พรีเมียม',
    bestFor: 'Fine Dining, Michelin Restaurant',
    keywords: ['luxury', 'fine dining', 'premium', 'elegant']
  },
  {
    id: 'restaurant-minimal',
    name: '⬜ Minimal (Clean Layout)',
    variant: 'hero-minimal',
    colors: 'Gray & Stone',
    vibe: 'เรียบง่าย สะอาด',
    bestFor: 'Japanese Restaurant, Simple Cafe',
    keywords: ['minimal', 'simple', 'clean', 'ร้านอาหารมินิมอล']
  },
  {
    id: 'restaurant-casual',
    name: '🍕 Casual (Cards Layout)',
    variant: 'hero-cards',
    colors: 'Orange & Yellow',
    vibe: 'อบอุ่น เป็นกันเอง',
    bestFor: 'Family Restaurant, Street Food',
    keywords: ['casual', 'friendly', 'family', 'cozy']
  },
  {
    id: 'restaurant',
    name: '🍽️  Standard (Stats Layout)',
    variant: 'hero-stats',
    colors: 'Orange & Red',
    vibe: 'ทั่วไป มาตรฐาน',
    bestFor: 'ร้านอาหารทั่วไป',
    keywords: ['restaurant', 'food', 'ร้านอาหาร']
  }
];

function displayOptions() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
  log('║     🎨 Frontend-V2 Interactive Layout Selector                ║', colors.bright + colors.cyan);
  log('╚════════════════════════════════════════════════════════════════╝\n', colors.bright + colors.cyan);

  log('เลือก Layout ที่คุณต้องการ:\n', colors.yellow);

  layoutOptions.forEach((option, index) => {
    log(`${index + 1}. ${option.name}`, colors.bright);
    console.log(`   Variant: ${option.variant}`);
    console.log(`   Colors: ${option.colors}`);
    console.log(`   Vibe: ${option.vibe}`);
    console.log(`   Best For: ${option.bestFor}`);
    console.log('');
  });

  log('6. 🤖 Let AI Choose (Auto-Detection)', colors.bright);
  console.log('   AI จะเลือก layout ที่เหมาะสมจาก keywords\n');

  log('0. ❌ Exit\n', colors.red);
}

async function generateWebsite(layoutOption: LayoutOption | null, customKeywords?: string[]) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  
  if (layoutOption) {
    log(`\n🎨 Selected Layout: ${layoutOption.name}`, colors.bright + colors.green);
    log(`📋 Category: ${layoutOption.id}`, colors.blue);
    log(`🎭 Variant: ${layoutOption.variant}`, colors.blue);
  } else {
    log(`\n🤖 Auto-Detection Mode`, colors.bright + colors.green);
  }

  // ถาม keywords เพิ่มเติม
  const keywordsInput = await question('\n🔑 Enter additional keywords (comma-separated) or press Enter to skip: ');
  const additionalKeywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim()) : [];
  
  const allKeywords = layoutOption 
    ? [...layoutOption.keywords, ...additionalKeywords]
    : customKeywords || additionalKeywords;

  log(`\n📝 Using keywords: ${allKeywords.join(', ')}`, colors.yellow);

  const task: FrontendTaskV2 = {
    taskId: `interactive-${Date.now()}`,
    taskType: 'generate_website',
    businessCategory: (layoutOption?.id || 'restaurant') as any,
    keywords: allKeywords.length > 0 ? allKeywords : ['restaurant', 'food'],
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

  log('\n⏳ Generating website... Please wait...', colors.yellow);
  
  const startTime = Date.now();

  try {
    const result = await runFrontendAgentV2(task);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success) {
      log(`\n✅ Website generated successfully in ${duration}s!`, colors.bright + colors.green);
      
      log('\n📊 Generation Results:', colors.bright + colors.cyan);
      console.log(`├─ Files Generated: ${result.files.length}`);
      console.log(`├─ Total Size: ${result.performance.totalSize}`);
      console.log(`├─ Template Used: ${result.result.templateUsed}`);
      console.log(`├─ Business Category: ${result.result.businessCategory}`);
      console.log(`├─ Project Type: ${result.result.projectType}`);
      console.log(`├─ AI Content: ${result.result.aiContentGenerated ? 'Yes ✓' : 'No ✗'}`);
      console.log(`└─ Blocks: ${result.result.blocksGenerated.join(', ')}`);

      if (result.projectStructure) {
        log(`\n📦 Project Structure:`, colors.bright + colors.cyan);    
        console.log(`├─ Name: ${result.projectStructure.projectStructure.name}`);
        console.log(`├─ Type: ${result.projectStructure.projectStructure.type}`);
        console.log(`└─ Total Files: ${result.projectStructure.files.length}`);
      }

      // แสดง preview ของไฟล์สำคัญ
      log('\n📄 Generated Files:', colors.bright + colors.cyan);
      result.files.slice(0, 10).forEach((file, index) => {
        const isLast = index === Math.min(9, result.files.length - 1);
        const prefix = isLast ? '└─' : '├─';
        console.log(`${prefix} ${file.path} (${file.type}, ${file.size} bytes)`);
      });
      
      if (result.files.length > 10) {
        console.log(`└─ ... and ${result.files.length - 10} more files`);
      }

      // แสดง Hero component preview
      const heroFile = result.files.find(f => f.path.includes('Hero'));
      if (heroFile) {
        log('\n🎨 Hero Component Preview:', colors.bright + colors.magenta);
        const lines = heroFile.content.split('\n').slice(0, 15);
        console.log(colors.magenta + lines.join('\n') + '\n...' + colors.reset);
      }

      log('\n✨ Generation completed successfully!', colors.bright + colors.green);

    } else {
      log(`\n❌ Generation failed!`, colors.bright + colors.red);
      
      if (result.error) {
        console.error(`Error: ${result.error.message}`);
        console.error(`Code: ${result.error.code}`);
        
        if (result.error.details) {
          console.error(`Details: ${result.error.details}`);
        }
      }

      if (result.validation && result.validation.errors.length > 0) {
        log('\n⚠️  Validation Errors:', colors.yellow);
        result.validation.errors.forEach(err => {
          console.error(`  - ${err.type}: ${err.message} (${err.file}:${err.line})`);
        });
      }
    }

  } catch (error) {
    log(`\n❌ Error occurred during generation!`, colors.bright + colors.red);
    console.error(error);
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.cyan);
}

async function main() {
  while (true) {
    displayOptions();

    const choice = await question('👉 Enter your choice (0-6): ');

    if (choice === '0') {
      log('\n👋 Goodbye!', colors.bright + colors.cyan);
      rl.close();
      process.exit(0);
    }

    const index = parseInt(choice) - 1;

    if (choice === '6') {
      // Auto-detection mode
      const keywords = await question('\n🔑 Enter keywords for AI to detect (e.g., luxury, modern, casual): ');
      const keywordArray = keywords.split(',').map(k => k.trim());
      await generateWebsite(null, keywordArray);
    } else if (index >= 0 && index < layoutOptions.length) {
      await generateWebsite(layoutOptions[index]);
    } else {
      log('\n❌ Invalid choice! Please try again.', colors.red);
      await question('\nPress Enter to continue...');
      continue;
    }

    const continueChoice = await question('\n🔄 Generate another website? (y/n): ');
    if (continueChoice.toLowerCase() !== 'y') {
      log('\n👋 Thank you for using Layout Selector!', colors.bright + colors.cyan);
      rl.close();
      process.exit(0);
    }
  }
}

// Run interactive selector
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  });
}

export { main as runInteractiveSelector };

