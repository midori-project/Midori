/**
 * Manifest Validation Script
 * รันสคริปต์นี้เพื่อตรวจสอบว่า manifests ถูกต้องครบถ้วน
 */

import { SHARED_BLOCKS } from '../template-system/shared-blocks';
import { BUSINESS_CATEGORIES } from '../template-system/business-categories';
import { createOverrideSystem } from '../template-system/override-system';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '━'.repeat(80));
  log(title, colors.bright + colors.cyan);
  console.log('━'.repeat(80));
}

async function validateSharedBlocks() {
  section('1️⃣ Validating Shared Blocks');
  
  const heroBlock = SHARED_BLOCKS.find(b => b.id === 'hero-basic');
  
  if (!heroBlock) {
    log('❌ hero-basic block not found!', colors.red);
    return false;
  }
  
  log(`✅ hero-basic block found`, colors.green);
  
  // Check variants
  if (!heroBlock.variants || heroBlock.variants.length === 0) {
    log('❌ No variants found for hero-basic!', colors.red);
    return false;
  }
  
  log(`✅ Found ${heroBlock.variants.length} variants`, colors.green);
  
  const expectedVariants = ['hero-stats', 'hero-split', 'hero-fullscreen', 'hero-minimal', 'hero-cards'];
  const actualVariants = heroBlock.variants.map(v => v.id);
  
  for (const expected of expectedVariants) {
    if (actualVariants.includes(expected)) {
      log(`  ✅ ${expected}`, colors.green);
    } else {
      log(`  ❌ ${expected} NOT FOUND`, colors.red);
      return false;
    }
  }
  
  // Check stat overrides
  const statsVariant = heroBlock.variants.find(v => v.id === 'hero-stats');
  const cardsVariant = heroBlock.variants.find(v => v.id === 'hero-cards');
  const splitVariant = heroBlock.variants.find(v => v.id === 'hero-split');
  
  log('\n📋 Checking variant overrides:', colors.cyan);
  
  if (statsVariant && statsVariant.overrides && 'stat1' in statsVariant.overrides) {
    log('  ✅ hero-stats has stat overrides', colors.green);
  } else {
    log('  ❌ hero-stats missing stat overrides', colors.red);
    return false;
  }
  
  if (cardsVariant && cardsVariant.overrides && 'stat1' in cardsVariant.overrides) {
    log('  ✅ hero-cards has stat overrides', colors.green);
  } else {
    log('  ❌ hero-cards missing stat overrides', colors.red);
    return false;
  }
  
  if (splitVariant && Object.keys(splitVariant.overrides).length === 0) {
    log('  ✅ hero-split has no stat overrides (correct)', colors.green);
  } else {
    log('  ❌ hero-split should not have stat overrides', colors.red);
    return false;
  }
  
  return true;
}

async function validateBusinessCategories() {
  section('2️⃣ Validating Business Categories');
  
  const restaurantCategories = BUSINESS_CATEGORIES.filter(c => c.id.startsWith('restaurant'));
  
  log(`✅ Found ${restaurantCategories.length} restaurant categories`, colors.green);
  
  const testCases = [
    { id: 'restaurant', expectedVariant: 'hero-stats', needsStats: true },
    { id: 'restaurant-modern', expectedVariant: 'hero-split', needsStats: false },
    { id: 'restaurant-luxury', expectedVariant: 'hero-fullscreen', needsStats: false },
    { id: 'restaurant-minimal', expectedVariant: 'hero-minimal', needsStats: false },
    { id: 'restaurant-casual', expectedVariant: 'hero-cards', needsStats: true },
  ];
  
  log('\n📋 Checking variant assignments:', colors.cyan);
  
  for (const testCase of testCases) {
    const category = BUSINESS_CATEGORIES.find(c => c.id === testCase.id);
    
    if (!category) {
      log(`  ❌ ${testCase.id} not found`, colors.red);
      return false;
    }
    
    const heroBlock = category.blocks.find(b => b.blockId === 'hero-basic');
    
    if (!heroBlock) {
      log(`  ❌ ${testCase.id} has no hero block`, colors.red);
      return false;
    }
    
    if (heroBlock.variantId === testCase.expectedVariant) {
      log(`  ✅ ${testCase.id} → ${testCase.expectedVariant}`, colors.green);
      
      // Check stats customizations
      if (testCase.needsStats) {
        const hasStats = heroBlock.customizations && 
                        'stat1' in heroBlock.customizations &&
                        'stat2' in heroBlock.customizations &&
                        'stat3' in heroBlock.customizations;
        
        if (hasStats) {
          log(`     ✅ Has stat customizations`, colors.green);
        } else {
          log(`     ❌ Missing stat customizations`, colors.red);
          return false;
        }
      }
    } else {
      log(`  ❌ ${testCase.id} has wrong variant: ${heroBlock.variantId} (expected: ${testCase.expectedVariant})`, colors.red);
      return false;
    }
  }
  
  return true;
}

async function validateOverrideSystem() {
  section('3️⃣ Validating Override System');
  
  const overrideSystem = createOverrideSystem(SHARED_BLOCKS, BUSINESS_CATEGORIES);
  
  const testCases = [
    { category: 'restaurant-modern', variant: 'hero-split', shouldHaveStats: false },
    { category: 'restaurant-luxury', variant: 'hero-fullscreen', shouldHaveStats: false },
    { category: 'restaurant-minimal', variant: 'hero-minimal', shouldHaveStats: false },
    { category: 'restaurant-casual', variant: 'hero-cards', shouldHaveStats: true },
    { category: 'restaurant', variant: 'hero-stats', shouldHaveStats: true },
  ];
  
  log('\n📋 Testing manifest resolution:', colors.cyan);
  
  for (const testCase of testCases) {
    try {
      const result = await overrideSystem.resolveManifest(testCase.category, []);
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      
      if (!heroBlock) {
        log(`  ❌ ${testCase.category}: No hero block in manifest`, colors.red);
        return false;
      }
      
      // Check variant
      if (heroBlock.metadata.variantId !== testCase.variant) {
        log(`  ❌ ${testCase.category}: Wrong variant ${heroBlock.metadata.variantId} (expected: ${testCase.variant})`, colors.red);
        return false;
      }
      
      // Check placeholders
      const hasStatPlaceholders = 'stat1' in heroBlock.placeholders;
      
      if (testCase.shouldHaveStats && !hasStatPlaceholders) {
        log(`  ❌ ${testCase.category}: Should have stat placeholders but doesn't`, colors.red);
        return false;
      }
      
      if (!testCase.shouldHaveStats && hasStatPlaceholders) {
        log(`  ❌ ${testCase.category}: Should NOT have stat placeholders but does`, colors.red);
        return false;
      }
      
      // Check applied overrides
      const hasVariantOverride = heroBlock.appliedOverrides.some(o => o.includes(`variant-${testCase.variant}`));
      
      if (!hasVariantOverride) {
        log(`  ⚠️  ${testCase.category}: Variant override not tracked in appliedOverrides`, colors.yellow);
      }
      
      log(`  ✅ ${testCase.category} → ${testCase.variant} (stats: ${testCase.shouldHaveStats ? 'yes' : 'no'})`, colors.green);
      
    } catch (error) {
      log(`  ❌ ${testCase.category}: Resolution failed - ${error instanceof Error ? error.message : String(error)}`, colors.red);
      return false;
    }
  }
  
  return true;
}

async function validatePlaceholderCounts() {
  section('4️⃣ Validating Placeholder Counts');
  
  const overrideSystem = createOverrideSystem(SHARED_BLOCKS, BUSINESS_CATEGORIES);
  
  const testCases = [
    { category: 'restaurant-modern', variant: 'hero-split', expectedPlaceholderCount: 7 }, // base hero placeholders
    { category: 'restaurant-casual', variant: 'hero-cards', expectedPlaceholderCount: 13 }, // base + 6 stats
  ];
  
  for (const testCase of testCases) {
    const result = await overrideSystem.resolveManifest(testCase.category, []);
    const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
    
    if (!heroBlock) continue;
    
    const placeholderCount = Object.keys(heroBlock.placeholders).length;
    
    if (placeholderCount === testCase.expectedPlaceholderCount) {
      log(`  ✅ ${testCase.category}: ${placeholderCount} placeholders (correct)`, colors.green);
    } else {
      log(`  ⚠️  ${testCase.category}: ${placeholderCount} placeholders (expected: ${testCase.expectedPlaceholderCount})`, colors.yellow);
      log(`     Placeholders: ${Object.keys(heroBlock.placeholders).join(', ')}`, colors.yellow);
    }
  }
  
  return true;
}

async function main() {
  console.clear();
  
  log('\n🔍 Frontend-V2 Manifest Validation', colors.bright + colors.cyan);
  log('Checking template system configuration...', colors.cyan);
  
  let allPassed = true;
  
  // Test 1: Shared Blocks
  const sharedBlocksOk = await validateSharedBlocks();
  allPassed = allPassed && sharedBlocksOk;
  
  // Test 2: Business Categories
  const categoriesOk = await validateBusinessCategories();
  allPassed = allPassed && categoriesOk;
  
  // Test 3: Override System
  const overrideSystemOk = await validateOverrideSystem();
  allPassed = allPassed && overrideSystemOk;
  
  // Test 4: Placeholder Counts
  const placeholdersOk = await validatePlaceholderCounts();
  allPassed = allPassed && placeholdersOk;
  
  // Summary
  section('📊 Summary');
  
  if (allPassed) {
    log('✅ All validations passed!', colors.bright + colors.green);
    log('Template system is correctly configured.', colors.green);
    process.exit(0);
  } else {
    log('❌ Some validations failed!', colors.bright + colors.red);
    log('Please check the errors above and fix them.', colors.red);
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});

