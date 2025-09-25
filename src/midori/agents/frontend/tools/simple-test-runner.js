/**
 * Simple Test Runner สำหรับ Template Slots
 * รันด้วย: node simple-test-runner.js
 */

// Test framework แบบง่าย
class SimpleTestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }
  
  describe(name, callback) {
    console.log(`\n📋 ${name}`);
    console.log('─'.repeat(50));
    callback();
  }
  
  test(name, callback) {
    try {
      callback();
      console.log(`✅ ${name}`);
      this.passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      this.failed++;
    }
  }
  
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      notToBe: (expected) => {
        if (actual === expected) {
          throw new Error(`Expected not ${expected}, but got ${actual}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan: (expected) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      },
      toBeGreaterThanOrEqual: (expected) => {
        if (actual < expected) {
          throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
        }
      },
      toBeLessThanOrEqual: (expected) => {
        if (actual > expected) {
          throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toMatch: (expected) => {
        if (!expected.test(actual)) {
          throw new Error(`Expected ${actual} to match ${expected}`);
        }
      },
      toHaveLength: (expected) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${expected}, but got ${actual.length}`);
        }
      },
      toBeUndefined: () => {
        if (actual !== undefined) {
          throw new Error(`Expected undefined, but got ${actual}`);
        }
      }
    };
  }
  
  async run() {
    console.log('🚀 เริ่มต้น Simple Test Runner\n');
    
    for (const testSuite of this.tests) {
      await testSuite();
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 สรุปผลการทดสอบ:`);
    console.log(`✅ ผ่าน: ${this.passed}`);
    console.log(`❌ ไม่ผ่าน: ${this.failed}`);
    console.log(`📋 รวม: ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 การทดสอบทั้งหมดผ่าน!');
    } else {
      console.log(`\n⚠️  มีการทดสอบ ${this.failed} รายการที่ไม่ผ่าน`);
    }
  }
}

// Mock implementations
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

// Test data
const mockTemplate = {
  key: 'restaurant-basic',
  version: 1,
  slots: {
    'slots.brand.name': { type: 'string', required: true, minLength: 2 },
    'slots.hero.title': { type: 'string', required: true, minLength: 3 },
    'slots.theme.primary': { type: 'color', pattern: '^#([0-9a-fA-F]{6})$' },
    'slots.contact.phone': { type: 'phone', pattern: '^\\+?[0-9\\- ]{7,20}$' }
  },
  aliases: {
    businessName: 'slots.brand.name',
    primaryColor: 'slots.theme.primary',
    title: 'slots.hero.title',
    phone: 'slots.contact.phone'
  }
};

const mockProfile = {
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
};

// Test functions
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

function mapRequirements(requirements, aliases) {
  const mapped = {};
  Object.entries(requirements).forEach(([key, value]) => {
    if (key in aliases) {
      mapped[aliases[key]] = value;
    }
  });
  return mapped;
}

function validateSlotValue(slotKey, value, slotDef) {
  const errors = [];
  
  if (slotDef.required && (!value || value === '')) {
    errors.push(`Field '${slotKey}' is required`);
  }
  
  if (!value) return { valid: true, errors };
  
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

function processMockData(profile, businessName, seed) {
  const result = {};
  
  Object.entries(profile.data).forEach(([key, value]) => {
    result[key] = value;
  });
  
  Object.entries(profile.functions).forEach(([key, func]) => {
    result[key] = func(businessName, seed);
  });
  
  return result;
}

// สร้าง test runner
const runner = new SimpleTestRunner();

// เพิ่ม test suites
runner.tests.push(async () => {
  runner.describe('SeededRandom', () => {
    runner.test('should generate same sequence with same seed', () => {
      const random1 = new SeededRandom(12345);
      const random2 = new SeededRandom(12345);
      
      runner.expect(random1.next()).toBe(random2.next());
      runner.expect(random1.next()).toBe(random2.next());
    });
    
    runner.test('should generate different sequences with different seeds', () => {
      const random1 = new SeededRandom(12345);
      const random2 = new SeededRandom(54321);
      
      runner.expect(random1.next()).notToBe(random2.next());
    });
    
    runner.test('should generate integers in range', () => {
      const random = new SeededRandom(12345);
      
      for (let i = 0; i < 10; i++) {
        const value = random.nextInt(1, 10);
        runner.expect(value).toBeGreaterThanOrEqual(1);
        runner.expect(value).toBeLessThanOrEqual(10);
      }
    });
    
    runner.test('should choose from array', () => {
      const random = new SeededRandom(12345);
      const colors = ['red', 'green', 'blue'];
      
      const choice = random.choice(colors);
      runner.expect(colors).toContain(choice);
    });
  });
});

runner.tests.push(async () => {
  runner.describe('Seed Generation', () => {
    runner.test('should generate same seed for same input', () => {
      const seed1 = generateSeed('restaurant-basic', 1);
      const seed2 = generateSeed('restaurant-basic', 1);
      
      runner.expect(seed1).toBe(seed2);
    });
    
    runner.test('should generate different seeds for different inputs', () => {
      const seed1 = generateSeed('restaurant-basic', 1);
      const seed2 = generateSeed('cafe-modern', 1);
      
      runner.expect(seed1).notToBe(seed2);
    });
    
    runner.test('should generate positive integers', () => {
      const seed = generateSeed('test-template', 1);
      
      runner.expect(seed).toBeGreaterThan(0);
      runner.expect(Number.isInteger(seed)).toBe(true);
    });
  });
});

runner.tests.push(async () => {
  runner.describe('Alias Mapping', () => {
    runner.test('should map requirements to slots correctly', () => {
      const requirements = {
        businessName: 'ร้านอาหารสยาม',
        primaryColor: '#ff6b6b',
        title: 'ยินดีต้อนรับ'
      };
      
      const mapped = mapRequirements(requirements, mockTemplate.aliases);
      
      runner.expect(mapped['slots.brand.name']).toBe('ร้านอาหารสยาม');
      runner.expect(mapped['slots.theme.primary']).toBe('#ff6b6b');
      runner.expect(mapped['slots.hero.title']).toBe('ยินดีต้อนรับ');
    });
    
    runner.test('should ignore unknown aliases', () => {
      const requirements = {
        businessName: 'ร้านอาหารสยาม',
        unknownField: 'ไม่เจอ alias'
      };
      
      const mapped = mapRequirements(requirements, mockTemplate.aliases);
      
      runner.expect(mapped['slots.brand.name']).toBe('ร้านอาหารสยาม');
      runner.expect(mapped['unknownField']).toBeUndefined();
    });
  });
});

runner.tests.push(async () => {
  runner.describe('Validation', () => {
    runner.test('should validate color format', () => {
      const result1 = validateSlotValue('slots.theme.primary', '#ff6b6b', { type: 'color' });
      const result2 = validateSlotValue('slots.theme.primary', 'invalid-color', { type: 'color' });
      
      runner.expect(result1.valid).toBe(true);
      runner.expect(result2.valid).toBe(false);
      runner.expect(result2.errors[0]).toContain('valid hex color');
    });
    
    runner.test('should validate phone format', () => {
      const result1 = validateSlotValue('slots.contact.phone', '+66-2-123-4567', { type: 'phone' });
      const result2 = validateSlotValue('slots.contact.phone', 'invalid-phone', { type: 'phone' });
      
      runner.expect(result1.valid).toBe(true);
      runner.expect(result2.valid).toBe(false);
      runner.expect(result2.errors[0]).toContain('valid phone number');
    });
    
    runner.test('should validate string length', () => {
      const result1 = validateSlotValue('slots.brand.name', 'Valid Name', { type: 'string', minLength: 3 });
      const result2 = validateSlotValue('slots.brand.name', 'AB', { type: 'string', minLength: 3 });
      
      runner.expect(result1.valid).toBe(true);
      runner.expect(result2.valid).toBe(false);
      runner.expect(result2.errors[0]).toContain('at least 3 characters');
    });
  });
});

runner.tests.push(async () => {
  runner.describe('Mock Data Processing', () => {
    runner.test('should process static mock data', () => {
      const businessName = 'ร้านอาหารสยาม';
      const seed = 123456;
      
      const mockData = processMockData(mockProfile, businessName, seed);
      
      runner.expect(mockData['external.address']).toBe('123 สุขุมวิท, กรุงเทพฯ 10110');
      runner.expect(mockData['external.openHours']).toBe('จันทร์-อาทิตย์ 08:00-20:00');
    });
    
    runner.test('should process dynamic mock data', () => {
      const businessName = 'ร้านอาหารสยาม';
      const seed = 123456;
      
      const mockData = processMockData(mockProfile, businessName, seed);
      
      runner.expect(mockData['external.domain']).toBe('ร้านอาหารสยาม.example.test');
      runner.expect(mockData['contact.phone']).toMatch(/^\+66-[2-9]-\d{7}$/);
    });
    
    runner.test('should generate consistent mock data with same seed', () => {
      const businessName = 'ร้านทดสอบ';
      const seed = 789012;
      
      const mockData1 = processMockData(mockProfile, businessName, seed);
      const mockData2 = processMockData(mockProfile, businessName, seed);
      
      runner.expect(mockData1['contact.phone']).toBe(mockData2['contact.phone']);
      runner.expect(mockData1['external.domain']).toBe(mockData2['external.domain']);
    });
  });
});

runner.tests.push(async () => {
  runner.describe('Integration Tests', () => {
    runner.test('should complete full slot filling flow', () => {
      // 1. Generate seed
      const seed = generateSeed(mockTemplate.key, mockTemplate.version);
      
      // 2. Map requirements
      const requirements = {
        businessName: 'ร้านอาหารสยาม',
        primaryColor: '#ff6b6b'
      };
      const mapped = mapRequirements(requirements, mockTemplate.aliases);
      
      // 3. Process mock data
      const mockData = processMockData(mockProfile, requirements.businessName, seed);
      
      // 4. Combine all data
      const filledSlots = { ...mapped };
      Object.entries(mockData).forEach(([key, value]) => {
        if (!(key in mockTemplate.slots)) {
          filledSlots[key] = value;
        }
      });
      
      // Assertions
      runner.expect(filledSlots['slots.brand.name']).toBe('ร้านอาหารสยาม');
      runner.expect(filledSlots['slots.theme.primary']).toBe('#ff6b6b');
      runner.expect(filledSlots['external.address']).toBe('123 สุขุมวิท, กรุงเทพฯ 10110');
      runner.expect(filledSlots['external.domain']).toBe('ร้านอาหารสยาม.example.test');
      runner.expect(filledSlots['contact.phone']).toMatch(/^\+66-[2-9]-\d{7}$/);
    });
    
    runner.test('should handle missing requirements gracefully', () => {
      const requirements = {}; // Empty requirements
      const seed = generateSeed(mockTemplate.key, mockTemplate.version);
      
      const mapped = mapRequirements(requirements, mockTemplate.aliases);
      const mockData = processMockData(mockProfile, 'Default Business', seed);
      
      runner.expect(Object.keys(mapped)).toHaveLength(0);
      runner.expect(Object.keys(mockData)).toHaveLength(4); // All mock data should be present
    });
  });
});

// รันการทดสอบ
runner.run().catch(console.error);
