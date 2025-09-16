import { quickRealWorldTest } from './real-world-ai-test';

async function testRestaurant() {
  const restaurantPrompt = "สร้างเว็บไซต์สำหรับร้านอาหารไทยของฉัน ชื่อร้าน 'ครัวคุณยาย' อยากให้มีเมนูอาหาร ระบบสั่งอาหาร และแผนที่ร้าน";
  
  console.log('🍜 Testing Restaurant "ครัวคุณยาย" Prompt:');
  console.log(`📝 Input: ${restaurantPrompt}`);
  console.log('='.repeat(80));
  
  try {
    await quickRealWorldTest(restaurantPrompt, false);
    console.log('\n✅ Restaurant test completed successfully!');
  } catch (error) {
    console.error('\n❌ Restaurant test failed:', error);
  }
}

testRestaurant();