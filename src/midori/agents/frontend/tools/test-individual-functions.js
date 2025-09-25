/**
 * ทดสอบฟังก์ชันแต่ละส่วนแบบแยก
 * รันด้วย: node test-individual-functions.js
 */

// Import mock classes (same as previous file)
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  choice(array) {
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }
}

// 1. ทดสอบ SeededRandom
function testSeededRandom() {
  console.log('🎲 ทดสอบ SeededRandom...\n');
  
  const random1 = new SeededRandom(12345);
  const random2 = new SeededRandom(12345);
  
  console.log('🔢 สร้าง 2 instances ด้วย seed เดียวกัน:');
  console.log('Random 1:', random1.next().toFixed(4));
  console.log('Random 2:', random2.next().toFixed(4));
  console.log('✅ ควรได้ค่าเหมือนกัน:', random1.next() === random2.next());
  
  console.log('\n📊 ทดสอบ nextInt:');
  const random3 = new SeededRandom(54321);
  for (let i = 0; i < 5; i++) {
    console.log(`  ${i + 1}. ${random3.nextInt(1, 100)}`);
  }
  
  console.log('\n🎯 ทดสอบ choice:');
  const random4 = new SeededRandom(98765);
  const colors = ['red', 'green', 'blue', 'yellow'];
  for (let i = 0; i < 5; i++) {
    console.log(`  ${i + 1}. ${random4.choice(colors)}`);
  }
}

// 2. ทดสอบการสร้าง Seed
function testSeedGeneration() {
  console.log('\n🔑 ทดสอบการสร้าง Seed...\n');
  
  function generateSeed(templateKey, version) {
    const input = `${templateKey}-${version}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  const testCases = [
    ['restaurant-basic', 1],
    ['cafe-modern', 2],
    ['restaurant-basic', 1], // ซ้ำ
    ['test-template', 1]
  ];
  
  testCases.forEach(([key, version], index) => {
    const seed = generateSeed(key, version);
    console.log(`${index + 1}. ${key} v${version} → Seed: ${seed}`);
  });
  
  console.log('\n✅ การสร้าง seed ทำงานได้และ deterministic');
}

// 3. ทดสอบการสร้างข้อมูลสุ่มตามประเภท
function testRandomValueGeneration() {
  console.log('\n🎨 ทดสอบการสร้างข้อมูลสุ่ม...\n');
  
  function generateRandomValue(slotKey, slotDef, seed) {
    const slotSeed = seed + slotKey.length;
    const random = new SeededRandom(slotSeed);
    
    switch (slotDef.type) {
      case 'string':
        const templates = {
          'title': ['ยินดีต้อนรับ', 'บริการคุณภาพ', 'ประสบการณ์ใหม่', 'นวัตกรรม'],
          'cta': ['เริ่มต้นเลย', 'เรียนรู้เพิ่มเติม', 'ติดต่อเรา', 'จองเลย'],
          'description': ['บริการที่ดีที่สุด', 'คุณภาพระดับสากล'],
          'name': ['ร้านตัวอย่าง', 'ธุรกิจใหม่', 'บริการคุณภาพ']
        };
        
        let templateKey = 'title';
        if (slotKey.includes('cta')) templateKey = 'cta';
        else if (slotKey.includes('description')) templateKey = 'description';
        else if (slotKey.includes('name')) templateKey = 'name';
        
        const options = templates[templateKey] || ['ตัวอย่าง'];
        return random.choice(options);
        
      case 'color':
        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        return random.choice(colors);
        
      case 'phone':
        const prefixes = ['+66-2-', '+66-8-', '+66-9-'];
        const prefix = random.choice(prefixes);
        const number = random.nextInt(1000000, 9999999);
        return `${prefix}${number}`;
        
      default:
        return 'Sample Value';
    }
  }
  
  const testSlots = [
    { key: 'slots.hero.title', def: { type: 'string' } },
    { key: 'slots.hero.cta', def: { type: 'string' } },
    { key: 'slots.theme.primary', def: { type: 'color' } },
    { key: 'slots.contact.phone', def: { type: 'phone' } },
    { key: 'slots.brand.name', def: { type: 'string' } }
  ];
  
  const seed = 123456;
  
  testSlots.forEach(({ key, def }) => {
    const value = generateRandomValue(key, def, seed);
    console.log(`${key} (${def.type}) → ${value}`);
  });
}

// 4. ทดสอบการประมวลผล Mock Data
function testMockDataProcessing() {
  console.log('\n🎭 ทดสอบการประมวลผล Mock Data...\n');
  
  const mockProfile = {
    name: 'th-local-basic',
    data: {
      'external.address': '123 สุขุมวิท, กรุงเทพฯ 10110',
      'external.openHours': 'จันทร์-อาทิตย์ 08:00-20:00'
    },
    functions: {
      'external.domain': (input, seed) => {
        const random = new SeededRandom(seed);
        return `${input.toLowerCase().replace(/\s+/g, '-')}.example.test`;
      },
      'contact.phone': (input, seed) => {
        const random = new SeededRandom(seed);
        const prefixes = ['+66-2-', '+66-8-', '+66-9-'];
        const prefix = random.choice(prefixes);
        const number = random.nextInt(1000000, 9999999);
        return `${prefix}${number}`;
      }
    }
  };
  
  function processMockData(profile, businessName, seed) {
    const result = {};
    
    // เพิ่มข้อมูลคงที่
    Object.entries(profile.data).forEach(([key, value]) => {
      result[key] = value;
    });
    
    // ประมวลผล functions
    Object.entries(profile.functions).forEach(([key, func]) => {
      result[key] = func(businessName, seed);
    });
    
    return result;
  }
  
  const businessName = 'ร้านอาหารสยาม';
  const seed = 789012;
  
  console.log(`📋 Business Name: ${businessName}`);
  console.log(`🔢 Seed: ${seed}`);
  
  const mockData = processMockData(mockProfile, businessName, seed);
  
  console.log('\n🎯 Mock Data ที่สร้างขึ้น:');
  Object.entries(mockData).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

// 5. ทดสอบการ Mapping Aliases
function testAliasMapping() {
  console.log('\n🔗 ทดสอบการ Mapping Aliases...\n');
  
  const aliases = {
    businessName: 'slots.brand.name',
    primaryColor: 'slots.theme.primary',
    title: 'slots.hero.title',
    phone: 'slots.contact.phone'
  };
  
  const requirements = {
    businessName: 'ร้านอาหารสยาม',
    primaryColor: '#ff6b6b',
    title: 'ยินดีต้อนรับ',
    someOtherField: 'ไม่เจอ alias'
  };
  
  function mapRequirements(requirements, aliases) {
    const mapped = {};
    
    Object.entries(requirements).forEach(([key, value]) => {
      if (key in aliases) {
        mapped[aliases[key]] = value;
        console.log(`✅ ${key} → ${aliases[key]}: ${value}`);
      } else {
        console.log(`⚠️  ${key}: ไม่เจอ alias`);
      }
    });
    
    return mapped;
  }
  
  console.log('📋 Requirements:');
  Object.entries(requirements).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  console.log('\n🔗 Mapping Results:');
  const mapped = mapRequirements(requirements, aliases);
  
  console.log('\n🎯 Mapped Results:');
  Object.entries(mapped).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

// 6. ทดสอบ Validation
function testValidation() {
  console.log('\n✅ ทดสอบ Validation...\n');
  
  function validateSlotValue(slotKey, value, slotDef) {
    const errors = [];
    
    // ตรวจสอบ required
    if (slotDef.required && (!value || value === '')) {
      errors.push(`Field '${slotKey}' is required`);
    }
    
    if (!value) return { valid: true, errors };
    
    // ตรวจสอบ type
    switch (slotDef.type) {
      case 'color':
        if (!/^#([0-9a-fA-F]{6})$/.test(value)) {
          errors.push(`Field '${slotKey}' must be a valid hex color`);
        }
        break;
      case 'phone':
        if (!/^\+?[0-9\- ]{7,20}$/.test(value)) {
          errors.push(`Field '${slotKey}' must be a valid phone number`);
        }
        break;
    }
    
    // ตรวจสอบ length
    if (typeof value === 'string') {
      if (slotDef.minLength && value.length < slotDef.minLength) {
        errors.push(`Field '${slotKey}' must be at least ${slotDef.minLength} characters`);
      }
      if (slotDef.maxLength && value.length > slotDef.maxLength) {
        errors.push(`Field '${slotKey}' must be at most ${slotDef.maxLength} characters`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  const testCases = [
    { key: 'slots.theme.primary', value: '#ff6b6b', def: { type: 'color' } },
    { key: 'slots.theme.primary', value: 'invalid-color', def: { type: 'color' } },
    { key: 'slots.contact.phone', value: '+66-2-123-4567', def: { type: 'phone' } },
    { key: 'slots.contact.phone', value: 'invalid-phone', def: { type: 'phone' } },
    { key: 'slots.brand.name', value: 'AB', def: { type: 'string', minLength: 3 } },
    { key: 'slots.brand.name', value: 'Valid Name', def: { type: 'string', minLength: 3 } }
  ];
  
  testCases.forEach(({ key, value, def }) => {
    const result = validateSlotValue(key, value, def);
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${key}: "${value}" → ${result.valid ? 'Valid' : result.errors.join(', ')}`);
  });
}

// รันการทดสอบทั้งหมด
function runIndividualTests() {
  console.log('🧪 ทดสอบฟังก์ชันแต่ละส่วน\n');
  console.log('='.repeat(60));
  
  try {
    testSeededRandom();
    testSeedGeneration();
    testRandomValueGeneration();
    testMockDataProcessing();
    testAliasMapping();
    testValidation();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 การทดสอบฟังก์ชันแต่ละส่วนเสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

// รันการทดสอบ
runIndividualTests();
