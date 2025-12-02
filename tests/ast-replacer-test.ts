/**
 * AST Replacer Test
 * ทดสอบ AST-based field replacement
 */

import { replaceFieldWithAST, validateJSXSyntax } from '../src/app/api/visual-edit/ast-replacer';

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

const result1 = replaceFieldWithAST(test1, 'heading', 'ยินดีต้อนรับสู่ร้านเรา', 'heading');
console.log('   Replaced:', result1.replaced ? '✅' : '❌');
console.log('   Syntax Valid:', validateJSXSyntax(result1.newContent).valid ? '✅' : '❌');
if (result1.replaced) {
  console.log('   Preview:', result1.newContent.includes('ยินดีต้อนรับสู่ร้านเรา') ? '✅ Found' : '❌ Not found');
}
console.log('');

// Test Case 2: Multiline Attributes
console.log('📝 Test 2: Multiline Attributes (ปัญหาเดิมของ Regex)');
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

const result2 = replaceFieldWithAST(test2, 'price', '$12.99', 'text');
console.log('   Replaced:', result2.replaced ? '✅' : '❌');
console.log('   Syntax Valid:', validateJSXSyntax(result2.newContent).valid ? '✅' : '❌');
if (result2.replaced) {
  console.log('   Preview:', result2.newContent.includes('$12.99') ? '✅ Found' : '❌ Not found');
  console.log('   className intact:', result2.newContent.includes('group-hover:text-orange-700') ? '✅' : '❌');
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

const result3 = replaceFieldWithAST(test3, 'heroImage', 'https://new-image.webp', 'image');
console.log('   Replaced:', result3.replaced ? '✅' : '❌');
console.log('   Syntax Valid:', validateJSXSyntax(result3.newContent).valid ? '✅' : '❌');
if (result3.replaced) {
  console.log('   Preview:', result3.newContent.includes('https://new-image.webp') ? '✅ Found' : '❌ Not found');
  console.log('   Old src removed:', !result3.newContent.includes('old-image.jpg') ? '✅' : '❌');
}
console.log('');

// Test Case 4: Icon/Emoji Replacement
console.log('📝 Test 4: Icon/Emoji Replacement');
const test4 = `
export default function Features() {
  return (
    <div>
      <span data-field="icon" data-editable="true" data-type="icon">
        ⭐
      </span>
    </div>
  );
}
`;

const result4 = replaceFieldWithAST(test4, 'icon', '🎯', 'icon');
console.log('   Replaced:', result4.replaced ? '✅' : '❌');
console.log('   Syntax Valid:', validateJSXSyntax(result4.newContent).valid ? '✅' : '❌');
if (result4.replaced) {
  console.log('   Preview:', result4.newContent.includes('🎯') ? '✅ Found' : '❌ Not found');
}
console.log('');

// Test Case 5: Nested Content
console.log('📝 Test 5: Nested Content');
const test5 = `
export default function Card() {
  return (
    <div>
      <div data-field="description" data-editable="true">
        <span className="highlight">Original</span> text here
      </div>
    </div>
  );
}
`;

const result5 = replaceFieldWithAST(test5, 'description', 'New description', 'text');
console.log('   Replaced:', result5.replaced ? '✅' : '❌');
console.log('   Syntax Valid:', validateJSXSyntax(result5.newContent).valid ? '✅' : '❌');
if (result5.replaced) {
  console.log('   Preview:', result5.newContent.includes('New description') ? '✅ Found' : '❌ Not found');
}
console.log('');

// Test Case 6: Field Not Found
console.log('📝 Test 6: Field Not Found (Should Fail Gracefully)');
const result6 = replaceFieldWithAST(test1, 'nonexistent', 'value', 'text');
console.log('   Replaced:', result6.replaced ? '❌ Should be false' : '✅ Correctly failed');
console.log('   Error message:', result6.error ? '✅ Has error' : '❌ Missing error');
console.log('');

// Summary
console.log('🎉 ========== TEST SUMMARY ==========');
const allTests = [result1, result2, result3, result4, result5];
const passedTests = allTests.filter(r => r.replaced).length;
console.log(`✅ Passed: ${passedTests}/5`);
console.log(`❌ Failed: ${5 - passedTests}/5`);
console.log('\n✅ All tests completed!\n');

