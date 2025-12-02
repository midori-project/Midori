/**
 * Test script for Batch Unsplash Service
 * Phase 2: Testing batch approach with menu items
 */

import { AIService } from '../services/ai-service';

async function testBatchMenuItems() {
  console.log('🧪 Testing Batch Menu Items Processing...\n');

  const aiService = new AIService();

  // Test data - Thai menu items
  const testMenuItems = [
    { name: 'ข้าวผัดกุ้ง', category: 'rice', businessCategory: 'restaurant' },
    { name: 'ผัดไทยกุ้งสด', category: 'noodles', businessCategory: 'restaurant' },
    { name: 'ต้มยำกุ้ง', category: 'soup', businessCategory: 'restaurant' },
    { name: 'แกงเขียวหวานไก่', category: 'curry', businessCategory: 'restaurant' },
    { name: 'สเต็กเนื้อ', category: 'meat', businessCategory: 'restaurant' },
    { name: 'ผัดผักบุ้งไฟแดง', category: 'vegetable', businessCategory: 'restaurant' }
  ];

  console.log('📋 Test Menu Items:');
  testMenuItems.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} (${item.category})`);
  });
  console.log('');

  // Test 1: Individual processing (current approach)
  console.log('🔄 Test 1: Individual Processing (Current Approach)');
  const startTime1 = Date.now();
  
  const individualResults = await Promise.all(
    testMenuItems.map(async (item, index) => {
      const start = Date.now();
      const result = await aiService.getImageForMenuItem(
        item.name,
        item.category,
        item.businessCategory
      );
      const duration = Date.now() - start;
      console.log(`  ✅ Item ${index + 1}: ${item.name} - ${duration}ms`);
      return { ...result, duration, itemName: item.name };
    })
  );
  
  const individualDuration = Date.now() - startTime1;
  console.log(`⏱️  Individual processing total time: ${individualDuration}ms\n`);

  // Test 2: Batch processing (new approach)
  console.log('🚀 Test 2: Batch Processing (New Approach)');
  const startTime2 = Date.now();
  
  const batchResults = await aiService.getImagesForMenuItemsBatch(testMenuItems);
  
  const batchDuration = Date.now() - startTime2;
  console.log(`⏱️  Batch processing total time: ${batchDuration}ms\n`);

  // Results comparison
  console.log('📊 Performance Comparison:');
  console.log(`  Individual: ${individualDuration}ms`);
  console.log(`  Batch:      ${batchDuration}ms`);
  console.log(`  Improvement: ${Math.round(((individualDuration - batchDuration) / individualDuration) * 100)}% faster`);
  console.log('');

  // Success rate comparison
  const individualSuccess = individualResults.filter(r => r.image && !r.image.includes('placeholder')).length;
  const batchSuccess = batchResults.filter(r => r.success).length;
  
  console.log('✅ Success Rate Comparison:');
  console.log(`  Individual: ${individualSuccess}/${individualResults.length} (${Math.round((individualSuccess/individualResults.length)*100)}%)`);
  console.log(`  Batch:      ${batchSuccess}/${batchResults.length} (${Math.round((batchSuccess/batchResults.length)*100)}%)`);
  console.log('');

  // Sample results
  console.log('🖼️  Sample Results (Batch):');
  batchResults.slice(0, 3).forEach((result, index) => {
    console.log(`  ${index + 1}. ${testMenuItems[index]?.name || 'Unknown'}:`);
    console.log(`     Image: ${result.image?.substring(0, 80) || 'No image'}...`);
    console.log(`     Alt: ${result.imageAlt || 'No alt text'}`);
    console.log(`     Success: ${result.success}`);
    if (result.error) console.log(`     Error: ${result.error}`);
    console.log('');
  });

  return {
    individualDuration,
    batchDuration,
    individualSuccess,
    batchSuccess,
    improvement: Math.round(((individualDuration - batchDuration) / individualDuration) * 100)
  };
}

// Run the test
if (require.main === module) {
  testBatchMenuItems()
    .then((results) => {
      console.log('🎉 Test completed!');
      console.log(`📈 Performance improvement: ${results.improvement}%`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testBatchMenuItems };
