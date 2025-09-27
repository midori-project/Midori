/**
 * Mock Profiles สำหรับ Template Slots
 * ใช้สร้างข้อมูลจำลองสำหรับ slots ที่อยู่นอก template schema
 */

export interface MockProfile {
  name: string;
  description: string;
  data: Record<string, string>;
  functions: Record<string, (input: string, seed: number) => string>;
}

// Token functions ที่ใช้สร้างข้อมูลจำลอง
const tokenFunctions = {
  slug: (input: string, seed: number): string => {
    const seededRandom = new SeededRandom(seed);
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },
  
  randPick: (options: string[], input: string, seed: number): string => {
    const seededRandom = new SeededRandom(seed + input.length);
    const index = seededRandom.nextInt(0, options.length - 1);
    return options[index];
  },
  
  randInt: (min: number, max: number, input: string, seed: number): string => {
    const seededRandom = new SeededRandom(seed + input.length);
    return seededRandom.nextInt(min, max).toString();
  },
  
  randPhone: (input: string, seed: number): string => {
    const seededRandom = new SeededRandom(seed + input.length);
    const prefixes = ['+66-2-', '+66-8-', '+66-9-'];
    const prefix = seededRandom.choice(prefixes);
    const number = seededRandom.nextInt(1000000, 9999999);
    return `${prefix}${number}`;
  },
  
  randEmail: (input: string, seed: number): string => {
    const slug = tokenFunctions.slug(input, seed);
    const domains = ['example.test', 'demo.local', 'sample.dev'];
    const seededRandom = new SeededRandom(seed + input.length);
    const domain = seededRandom.choice(domains);
    return `${slug}@${domain}`;
  }
};

// Seeded Random Number Generator
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  choice<T>(array: T[]): T {
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }
}

// Mock Profiles
export const mockProfiles: Record<string, MockProfile> = {
  'th-local-basic': {
    name: 'th-local-basic',
    description: 'Mock profile สำหรับธุรกิจไทยในพื้นที่กรุงเทพฯ',
    data: {
      'external.address': '123 สุขุมวิท, กรุงเทพฯ 10110',
      'external.openHours': 'จันทร์-อาทิตย์ 08:00-20:00',
      'contact.email': 'info@example.test',
      'social.facebook': 'https://facebook.com/example',
      'social.instagram': 'https://instagram.com/example',
      'social.line': 'https://line.me/R/ti/p/example'
    },
    functions: {
      'external.domain': (input: string, seed: number) => 
        `${tokenFunctions.slug(input, seed)}.example.test`,
      'contact.phone': tokenFunctions.randPhone,
      'contact.email': tokenFunctions.randEmail
    }
  },
  
  'global-basic': {
    name: 'global-basic',
    description: 'Mock profile สำหรับธุรกิจสากล',
    data: {
      'external.address': '123 Main Street, Sample City, SC 12345',
      'external.openHours': 'Mon-Fri 09:00-18:00',
      'contact.email': 'info@example.com',
      'social.facebook': 'https://facebook.com/example',
      'social.instagram': 'https://instagram.com/example',
      'social.twitter': 'https://twitter.com/example'
    },
    functions: {
      'external.domain': (input: string, seed: number) => 
        `${tokenFunctions.slug(input, seed)}.example.com`,
      'contact.phone': (input: string, seed: number) => {
        const seededRandom = new SeededRandom(seed + input.length);
        const areaCode = seededRandom.nextInt(200, 999);
        const number = seededRandom.nextInt(1000000, 9999999);
        return `+1-${areaCode}-${number}`;
      },
      'contact.email': tokenFunctions.randEmail
    }
  },
  
  'random': {
    name: 'random',
    description: 'Mock profile แบบสุ่มข้อมูลหลากหลาย',
    data: {
      'external.openHours': 'Mon-Sun 24/7',
      'social.facebook': 'https://facebook.com/random',
      'social.instagram': 'https://instagram.com/random'
    },
    functions: {
      'external.domain': (input: string, seed: number) => {
        const seededRandom = new SeededRandom(seed + input.length);
        const domains = ['.com', '.net', '.org', '.dev', '.test'];
        const domain = seededRandom.choice(domains);
        return `${tokenFunctions.slug(input, seed)}${domain}`;
      },
      'external.address': (input: string, seed: number) => {
        const seededRandom = new SeededRandom(seed + input.length);
        const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Elm St'];
        const cities = ['Sample City', 'Demo Town', 'Test Valley', 'Mock Hills'];
        const street = seededRandom.choice(streets);
        const city = seededRandom.choice(cities);
        const number = seededRandom.nextInt(100, 9999);
        return `${number} ${street}, ${city}`;
      },
      'contact.phone': (input: string, seed: number) => {
        const seededRandom = new SeededRandom(seed + input.length);
        const formats = [
          () => `+66-${seededRandom.nextInt(8, 9)}-${seededRandom.nextInt(1000000, 9999999)}`,
          () => `+1-${seededRandom.nextInt(200, 999)}-${seededRandom.nextInt(1000000, 9999999)}`,
          () => `+44-${seededRandom.nextInt(20, 79)}-${seededRandom.nextInt(10000000, 99999999)}`
        ];
        const format = seededRandom.choice(formats);
        return format();
      },
      'contact.email': tokenFunctions.randEmail
    }
  }
};

/**
 * สร้าง seed จาก template key และ version
 */
export function generateSeed(templateKey: string, version: number): number {
  const input = `${templateKey}-${version}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * ประมวลผล mock data โดยใช้ profile และ seed
 */
export function processMockData(
  profile: MockProfile, 
  businessName: string, 
  seed: number
): Record<string, string> {
  const result: Record<string, string> = {};
  
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
