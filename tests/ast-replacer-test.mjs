/**
 * AST Replacer Test (ES Module)
 * ทดสอบ AST-based field replacement
 */

import { replaceFieldWithAST, validateJSXSyntax } from '../src/app/api/visual-edit/ast-replacer.ts';

console.log('🧪 ========== AST REPLACER TESTS ==========\n');

// Test Case 1: Simple Text Replacement
console.log('📝 Test 1: Simple Text Replacement');
const test1 = `
export default function Hero() {
  return (
    <div>
      <h1 data-field="heading" data-editable="true">
        Welcome to Our Restaurant
      </h1>
    </div>
  );
}
`;

try {
  const result1 = replaceFieldWithAST(test1, 'heading', 'ยินดีต้อนรับสู่ร้านเรา', 'heading');
  console.log('   Replaced:', result1.replaced ? '✅' : '❌');
  const validation1 = validateJSXSyntax(result1.newContent);
  console.log('   Syntax Valid:', validation1.valid ? '✅' : '❌');
  if (result1.replaced) {
    console.log('   Preview:', result1.newContent.includes('ยินดีต้อนรับสู่ร้านเรา') ? '✅ Found' : '❌ Not found');
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}
console.log('');

// Test Case 2: Multiline Attributes (ปัญหาเดิมของ Regex)
console.log('📝 Test 2: Multiline Attributes - ปัญหาที่ Regex จัดการไม่ได้');
const test2 = `
export default function Menu() {
  return (
    <div>
      <div 
        data-field="price"
        data-editable="true"
        className="text-3xl font-bold 
                   text-orange-600 
                   group-hover:text-orange-700 
                   transition-colors"
      >
        $15.99
      </div>
    </div>
  );
}
`;

try {
  const result2 = replaceFieldWithAST(test2, 'price', '$12.99', 'text');
  console.log('   Replaced:', result2.replaced ? '✅' : '❌');
  const validation2 = validateJSXSyntax(result2.newContent);
  console.log('   Syntax Valid:', validation2.valid ? '✅' : '❌');
  if (result2.replaced) {
    console.log('   New value found:', result2.newContent.includes('$12.99') ? '✅' : '❌');
    console.log('   className intact:', result2.newContent.includes('group-hover:text-orange-700') ? '✅' : '❌');
    console.log('   No unclosed tags:', !result2.newContent.includes('className="text-3xl font-bold\n') ? '✅' : '❌');
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}
console.log('');

// Test Case 3: Image Src Replacement
console.log('📝 Test 3: Image Src Replacement');
const test3 = `
export default function Hero() {
  return (
    <div>
      <img 
        src="https://old-image.jpg"
        alt="Hero"
        data-field="heroImage"
        data-editable="true"
        className="w-full"
      />
    </div>
  );
}
`;

try {
  const result3 = replaceFieldWithAST(test3, 'heroImage', 'https://new-image.webp', 'image');
  console.log('   Replaced:', result3.replaced ? '✅' : '❌');
  const validation3 = validateJSXSyntax(result3.newContent);
  console.log('   Syntax Valid:', validation3.valid ? '✅' : '❌');
  if (result3.replaced) {
    console.log('   New src:', result3.newContent.includes('https://new-image.webp') ? '✅' : '❌');
    console.log('   Old src removed:', !result3.newContent.includes('old-image.jpg') ? '✅' : '❌');
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}
console.log('');

// Test Case 4: Field Not Found
console.log('📝 Test 4: Field Not Found (Should Fail Gracefully)');
try {
  const result4 = replaceFieldWithAST(test1, 'nonexistent', 'value', 'text');
  console.log('   Replaced:', result4.replaced ? '❌ Should be false' : '✅ Correctly failed');
  console.log('   Error message:', result4.error ? '✅ Has error message' : '❌ Missing error');
} catch (error) {
  console.log('   ❌ Unexpected exception:', error.message);
}
console.log('');

console.log('🎉 ========== TESTS COMPLETED ==========\n');
console.log('ℹ️  หมายเหตุ: ถ้าเห็น ✅ ทั้งหมด แสดงว่าระบบทำงานได้ถูกต้อง!\n');

