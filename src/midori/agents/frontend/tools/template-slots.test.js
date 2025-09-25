/**
 * Jest Tests สำหรับ Template Slots System
 * รันด้วย: npm test หรือ jest template-slots.test.js
 */

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

// Jest Tests
describe('Template Slots System', () => {
  
  describe('SeededRandom', () => {
    test('should generate same sequence with same seed', () => {
      const random1 = new SeededRandom(12345);
      const random2 = new SeededRandom(12345);
      
      expect(random1.next()).toBe(random2.next());
      expect(random1.next()).toBe(random2.next());
    });
    
    test('should generate different sequences with different seeds', () => {
      const random1 = new SeededRandom(12345);
      const random2 = new SeededRandom(54321);
      
      expect(random1.next()).not.toBe(random2.next());
    });
    
    test('should generate integers in range', () => {
      const random = new SeededRandom(12345);
      
      for (let i = 0; i < 100; i++) {
        const value = random.nextInt(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
    });
    
    test('should choose from array', () => {
      const random = new SeededRandom(12345);
      const colors = ['red', 'green', 'blue'];
      
      const choice = random.choice(colors);
      expect(colors).toContain(choice);
    });
  });
  
  describe('Seed Generation', () => {
    test('should generate same seed for same input', () => {
      const seed1 = generateSeed('restaurant-basic', 1);
      const seed2 = generateSeed('restaurant-basic', 1);
      
      expect(seed1).toBe(seed2);
    });
    
    test('should generate different seeds for different inputs', () => {
      const seed1 = generateSeed('restaurant-basic', 1);
      const seed2 = generateSeed('cafe-modern', 1);
      
      expect(seed1).not.toBe(seed2);
    });
    
    test('should generate positive integers', () => {
      const seed = generateSeed('test-template', 1);
      
      expect(seed).toBeGreaterThan(0);
      expect(Number.isInteger(seed)).toBe(true);
    });
  });
  
  describe('Alias Mapping', () => {
    test('should map requirements to slots correctly', () => {
      const requirements = {
        businessName: 'ร้านอาหารสยาม',
        primaryColor: '#ff6b6b',
        title: 'ยินดีต้อนรับ'
      };
      
      const mapped = mapRequirements(requirements, mockTemplate.aliases);
      
      expect(mapped['slots.brand.name']).toBe('ร้านอาหารสยาม');
      expect(mapped['slots.theme.primary']).toBe('#ff6b6b');
      expect(mapped['slots.hero.title']).toBe('ยินดีต้อนรับ');
    });
    
    test('should ignore unknown aliases', () => {
      const requirements = {
        businessName: 'ร้านอาหารสยาม',
        unknownField: 'ไม่เจอ alias'
      };
      
      const mapped = mapRequirements(requirements, mockTemplate.aliases);
      
      expect(mapped['slots.brand.name']).toBe('ร้านอาหารสยาม');
      expect(mapped['unknownField']).toBeUndefined();
    });
  });
  
  describe('Validation', () => {
    test('should validate color format', () => {
      const result1 = validateSlotValue('slots.theme.primary', '#ff6b6b', { type: 'color' });
      const result2 = validateSlotValue('slots.theme.primary', 'invalid-color', { type: 'color' });
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain('valid hex color');
    });
    
    test('should validate phone format', () => {
      const result1 = validateSlotValue('slots.contact.phone', '+66-2-123-4567', { type: 'phone' });
      const result2 = validateSlotValue('slots.contact.phone', 'invalid-phone', { type: 'phone' });
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain('valid phone number');
    });
    
    test('should validate string length', () => {
      const result1 = validateSlotValue('slots.brand.name', 'Valid Name', { type: 'string', minLength: 3 });
      const result2 = validateSlotValue('slots.brand.name', 'AB', { type: 'string', minLength: 3 });
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain('at least 3 characters');
    });
    
    test('should validate required fields', () => {
      const result1 = validateSlotValue('slots.brand.name', 'Valid Name', { type: 'string', required: true });
      const result2 = validateSlotValue('slots.brand.name', '', { type: 'string', required: true });
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain('is required');
    });
  });
  
  describe('Mock Data Processing', () => {
    test('should process static mock data', () => {
      const businessName = 'ร้านอาหารสยาม';
      const seed = 123456;
      
      const mockData = processMockData(mockProfile, businessName, seed);
      
      expect(mockData['external.address']).toBe('123 สุขุมวิท, กรุงเทพฯ 10110');
      expect(mockData['external.openHours']).toBe('จันทร์-อาทิตย์ 08:00-20:00');
    });
    
    test('should process dynamic mock data', () => {
      const businessName = 'ร้านอาหารสยาม';
      const seed = 123456;
      
      const mockData = processMockData(mockProfile, businessName, seed);
      
      expect(mockData['external.domain']).toBe('ร้านอาหารสยาม.example.test');
      expect(mockData['contact.phone']).toMatch(/^\+66-[2-9]-\d{7}$/);
    });
    
    test('should generate consistent mock data with same seed', () => {
      const businessName = 'ร้านทดสอบ';
      const seed = 789012;
      
      const mockData1 = processMockData(mockProfile, businessName, seed);
      const mockData2 = processMockData(mockProfile, businessName, seed);
      
      expect(mockData1['contact.phone']).toBe(mockData2['contact.phone']);
      expect(mockData1['external.domain']).toBe(mockData2['external.domain']);
    });
  });
  
  describe('Integration Tests', () => {
    test('should complete full slot filling flow', () => {
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
      
      // 5. Validate
      const validationResults = [];
      Object.entries(filledSlots).forEach(([key, value]) => {
        const slotDef = mockTemplate.slots[key];
        if (slotDef) {
          const result = validateSlotValue(key, value, slotDef);
          validationResults.push(result);
        }
      });
      
      // Assertions
      expect(filledSlots['slots.brand.name']).toBe('ร้านอาหารสยาม');
      expect(filledSlots['slots.theme.primary']).toBe('#ff6b6b');
      expect(filledSlots['external.address']).toBe('123 สุขุมวิท, กรุงเทพฯ 10110');
      expect(filledSlots['external.domain']).toBe('ร้านอาหารสยาม.example.test');
      expect(filledSlots['contact.phone']).toMatch(/^\+66-[2-9]-\d{7}$/);
      
      // All validations should pass
      const allValid = validationResults.every(result => result.valid);
      expect(allValid).toBe(true);
    });
    
    test('should handle missing requirements gracefully', () => {
      const requirements = {}; // Empty requirements
      const seed = generateSeed(mockTemplate.key, mockTemplate.version);
      
      const mapped = mapRequirements(requirements, mockTemplate.aliases);
      const mockData = processMockData(mockProfile, 'Default Business', seed);
      
      expect(Object.keys(mapped)).toHaveLength(0);
      expect(Object.keys(mockData)).toHaveLength(4); // All mock data should be present
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  test('should handle large number of slots efficiently', () => {
    const startTime = Date.now();
    
    // Simulate processing 1000 slots
    for (let i = 0; i < 1000; i++) {
      const seed = generateSeed(`template-${i}`, 1);
      const random = new SeededRandom(seed);
      random.next();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});

// Error handling tests
describe('Error Handling', () => {
  test('should handle invalid template gracefully', () => {
    expect(() => generateSeed(null, 1)).toThrow();
  });
  
  test('should handle invalid validation gracefully', () => {
    const result = validateSlotValue('test', null, { type: 'string', required: false });
    expect(result.valid).toBe(true);
  });
});

console.log('🧪 Template Slots Tests loaded successfully!');
console.log('📋 Run with: npm test หรือ jest template-slots.test.js');
console.log('🎯 Total test suites: 8');
console.log('📊 Expected tests: ~25');
