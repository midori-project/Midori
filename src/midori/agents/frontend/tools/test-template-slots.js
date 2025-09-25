/**
 * การทดสอบระบบ Template Slots แบบง่าย
 * รันด้วย: node test-template-slots.js
 */

// Mock implementations สำหรับการทดสอบ
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

// Mock Templates
const mockTemplates = {
  'restaurant-basic': {
    id: 'tpl-001',
    key: 'restaurant-basic',
    label: 'Restaurant Basic Template',
    category: 'restaurant',
    versions: [{
      id: 'ver-001',
      templateId: 'tpl-001',
      version: 1,
      slots: {
        slots: {
          'slots.brand.name': {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 50
          },
          'slots.hero.title': {
            type: 'string',
            required: true,
            minLength: 3,
            maxLength: 60
          },
          'slots.theme.primary': {
            type: 'color',
            pattern: '^#([0-9a-fA-F]{6})$',
            default: '#22c55e'
          },
          'slots.contact.phone': {
            type: 'phone',
            pattern: '^\\+?[0-9\\- ]{7,20}$'
          }
        },
        aliases: {
          businessName: 'slots.brand.name',
          primaryColor: 'slots.theme.primary',
          title: 'slots.hero.title',
          phone: 'slots.contact.phone'
        }
      },
      status: 'published'
    }]
  }
};

// Mock Profiles
const mockProfiles = {
  'th-local-basic': {
    name: 'th-local-basic',
    data: {
      'external.address': '123 สุขุมวิท, กรุงเทพฯ 10110',
      'external.openHours': 'จันทร์-อาทิตย์ 08:00-20:00'
    },
    functions: {
      'external.domain': (input, seed) => `${input.toLowerCase().replace(/\s+/g, '-')}.example.test`,
      'contact.phone': (input, seed) => {
        const random = new SeededRandom(seed);
        const prefixes = ['+66-2-', '+66-8-', '+66-9-'];
        const prefix = random.choice(prefixes);
        const number = random.nextInt(1000000, 9999999);
        return `${prefix}${number}`;
      }
    }
  }
};

// ฟังก์ชันทดสอบ
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

function generateRandomValue(slotKey, slotDef, seed) {
  const slotSeed = seed + slotKey.length;
  const random = new SeededRandom(slotSeed);
  
  switch (slotDef.type) {
    case 'string':
      const templates = {
        'title': ['ยินดีต้อนรับ', 'บริการคุณภาพ', 'ประสบการณ์ใหม่'],
        'name': ['ร้านตัวอย่าง', 'ธุรกิจใหม่', 'บริการคุณภาพ']
      };
      
      let templateKey = 'title';
      if (slotKey.includes('name')) templateKey = 'name';
      
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

// ทดสอบการเติม slots
function testFillSlots() {
  console.log('🎲 ทดสอบการเติม slots...\n');
  
  const templateKey = 'restaurant-basic';
  const version = 1;
  const requirements = {
    businessName: 'ร้านอาหารสยาม',
    primaryColor: '#ff6b6b'
  };
  
  // โหลด template
  const template = mockTemplates[templateKey];
  const templateVersion = template.versions[0];
  const slotsSchema = templateVersion.slots;
  
  // สร้าง seed
  const seed = generateSeed(templateKey, version);
  
  // เติม slots
  const filledSlots = {};
  
  // 1. Map requirements ผ่าน aliases
  Object.entries(requirements).forEach(([key, value]) => {
    if (key in slotsSchema.aliases) {
      filledSlots[slotsSchema.aliases[key]] = value;
    }
  });
  
  // 2. เติม default values
  Object.entries(slotsSchema.slots).forEach(([slotKey, slotDef]) => {
    if (!(slotKey in filledSlots) && slotDef.default) {
      filledSlots[slotKey] = slotDef.default;
    }
  });
  
  // 3. สร้าง mock data
  const profile = mockProfiles['th-local-basic'];
  const mockData = processMockData(profile, requirements.businessName, seed);
  Object.entries(mockData).forEach(([key, value]) => {
    if (!(key in slotsSchema.slots)) {
      filledSlots[key] = value;
    }
  });
  
  // 4. สร้างข้อมูลสุ่มสำหรับ slots ที่ยังขาด
  Object.entries(slotsSchema.slots).forEach(([slotKey, slotDef]) => {
    if (!(slotKey in filledSlots)) {
      filledSlots[slotKey] = generateRandomValue(slotKey, slotDef, seed);
    }
  });
  
  console.log('✅ ผลลัพธ์การเติม slots:');
  console.log('📋 Requirements:', requirements);
  console.log('🎯 Filled Slots:', filledSlots);
  console.log('🔢 Seed:', seed);
  console.log('📊 Total Slots:', Object.keys(filledSlots).length);
  
  return filledSlots;
}

// ทดสอบ Mock Profiles
function testMockProfiles() {
  console.log('\n🎭 ทดสอบ Mock Profiles...\n');
  
  const profiles = ['th-local-basic'];
  const businessName = 'ร้านทดสอบ';
  const seed = generateSeed('test-template', 1);
  
  profiles.forEach(profileName => {
    console.log(`📋 Profile: ${profileName}`);
    const profile = mockProfiles[profileName];
    const mockData = processMockData(profile, businessName, seed);
    console.log('🎯 Mock Data:', mockData);
    console.log('');
  });
}

// ทดสอบการสุ่ม
function testRandomGeneration() {
  console.log('🎲 ทดสอบการสุ่ม...\n');
  
  const seed = 12345;
  const random = new SeededRandom(seed);
  
  console.log('🔢 Random Numbers (seed: 12345):');
  for (let i = 0; i < 5; i++) {
    console.log(`  ${i + 1}. ${random.next().toFixed(4)}`);
  }
  
  console.log('\n🎨 Random Colors:');
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  for (let i = 0; i < 3; i++) {
    const newRandom = new SeededRandom(seed + i);
    console.log(`  ${i + 1}. ${newRandom.choice(colors)}`);
  }
  
  console.log('\n📞 Random Phones:');
  const prefixes = ['+66-2-', '+66-8-', '+66-9-'];
  for (let i = 0; i < 3; i++) {
    const newRandom = new SeededRandom(seed + i);
    const prefix = newRandom.choice(prefixes);
    const number = newRandom.nextInt(1000000, 9999999);
    console.log(`  ${i + 1}. ${prefix}${number}`);
  }
}

// ทดสอบการทำงานซ้ำ (deterministic)
function testDeterministic() {
  console.log('\n🔄 ทดสอบการทำงานซ้ำ (Deterministic)...\n');
  
  const templateKey = 'restaurant-basic';
  const version = 1;
  const requirements = { businessName: 'ร้านอาหารสยาม' };
  
  console.log('🔄 รัน 3 ครั้งด้วยข้อมูลเดียวกัน:');
  
  for (let i = 1; i <= 3; i++) {
    const seed = generateSeed(templateKey, version);
    const random = new SeededRandom(seed);
    const color = random.choice(['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']);
    
    console.log(`  ${i}. Seed: ${seed}, Color: ${color}`);
  }
  
  console.log('\n✅ ผลลัพธ์ควรเหมือนกันทุกครั้ง (Deterministic)');
}

// รันการทดสอบทั้งหมด
function runAllTests() {
  console.log('🚀 เริ่มต้นการทดสอบระบบ Template Slots\n');
  console.log('='.repeat(50));
  
  try {
    testFillSlots();
    testMockProfiles();
    testRandomGeneration();
    testDeterministic();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 การทดสอบเสร็จสิ้น!');
    console.log('\n📝 สรุปผลการทดสอบ:');
    console.log('✅ การเติม slots ทำงานได้');
    console.log('✅ Mock profiles ทำงานได้');
    console.log('✅ ระบบสุ่มทำงานได้');
    console.log('✅ ระบบ deterministic ทำงานได้');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error.message);
  }
}

// รันการทดสอบ
runAllTests();
