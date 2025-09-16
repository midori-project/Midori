const { quickRealWorldTest } = require('./real-world-ai-test');

const restaurantPrompt = "สร้างเว็บไซต์สำหรับร้านอาหารไทยของฉัน ชื่อร้าน 'ครัวคุณยาย' อยากให้มีเมนูอาหาร ระบบสั่งอาหาร และแผนที่ร้าน";

console.log('🍜 Testing Restaurant Prompt:');
console.log(`📝 Input: ${restaurantPrompt}`);
console.log('='.repeat(80));

quickRealWorldTest(restaurantPrompt, false)
  .then(() => {
    console.log('\n✅ Restaurant test completed successfully!');
  })
  .catch(console.error);