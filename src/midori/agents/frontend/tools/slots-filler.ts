/**
 * Slots Filler Service
 * จัดการการเติม slots ด้วยระบบสุ่มและเติมทุกช่องที่มี slot
 */

import { TemplateService, TemplateSlotsSchema, TemplateSlot } from './template-service';
import { mockProfiles, generateSeed, processMockData } from './mock-profiles';

export interface FillSlotsInput {
  templateKey: string;
  version: number;
  requirements: Record<string, any>;
  overrides?: Record<string, any>;
  strict?: boolean;
  includeMock?: boolean;
  mockProfile?: string;
}

export interface FillSlotsResult {
  filledSlots: Record<string, any>;
  mockedKeys: string[];
  validationReport: {
    errors: Array<{ field: string; message: string; code?: string }>;
    warnings: Array<{ field: string; message: string }>;
  };
  metadata: {
    templateKey: string;
    version: number;
    filledAt: string;
    mockProfile?: string;
    totalSlots: number;
    filledSlotsCount: number;
  };
}

export class SlotsFiller {
  private templateService: TemplateService;

  constructor(templateService: TemplateService) {
    this.templateService = templateService;
  }

  /**
   * เติม slots ตาม requirements และใช้ระบบสุ่มสำหรับ slots ที่ขาด
   */
  async fillSlots(input: FillSlotsInput): Promise<FillSlotsResult> {
    const {
      templateKey,
      version,
      requirements,
      overrides = {},
      strict = true,
      includeMock = true,
      mockProfile = 'th-local-basic'
    } = input;

    // โหลด slots schema
    const { slots: slotsSchema } = await this.templateService.getSlots(templateKey, version);
    
    // สร้าง seed สำหรับการสุ่ม
    const seed = generateSeed(templateKey, version);
    
    // เติม slots ตามลำดับความสำคัญ
    const filledSlots: Record<string, any> = {};
    const mockedKeys: string[] = [];
    const validationErrors: Array<{ field: string; message: string; code?: string }> = [];
    const validationWarnings: Array<{ field: string; message: string }> = [];

    // 1. Apply overrides (สูงสุด)
    Object.entries(overrides).forEach(([key, value]) => {
      filledSlots[key] = value;
    });

    // 2. Map requirements ผ่าน aliases
    const mappedRequirements = this.mapRequirements(requirements, slotsSchema.aliases);
    Object.entries(mappedRequirements).forEach(([key, value]) => {
      if (!(key in overrides)) { // ไม่ override แล้ว
        filledSlots[key] = value;
      }
    });

    // 3. เติม default values สำหรับ slots ที่ยังไม่มีค่า
    Object.entries(slotsSchema.slots).forEach(([slotKey, slotDef]) => {
      if (!(slotKey in filledSlots)) {
        if (slotDef.default !== undefined) {
          filledSlots[slotKey] = slotDef.default;
        }
      }
    });

    // 4. สร้าง mock data สำหรับ slots ที่ยังขาด (ถ้าเปิดใช้)
    if (includeMock) {
      const profile = mockProfiles[mockProfile];
      if (profile) {
        const businessName = requirements.businessName || 'Sample Business';
        const mockData = processMockData(profile, businessName, seed);
        
        // เติม mock data สำหรับ external/social/contact keys ที่ไม่อยู่ใน template slots
        Object.entries(mockData).forEach(([key, value]) => {
          if (!(key in slotsSchema.slots) && !(key in filledSlots)) {
            filledSlots[key] = value;
            mockedKeys.push(key);
          }
        });
      }
    }

    // 5. สร้างข้อมูลสุ่มสำหรับ template slots ที่ยังขาด
    const missingSlots = Object.keys(slotsSchema.slots).filter(
      slotKey => !(slotKey in filledSlots)
    );
    
    missingSlots.forEach(slotKey => {
      const slotDef = slotsSchema.slots[slotKey];
      const randomValue = this.generateRandomValue(slotKey, slotDef, seed);
      filledSlots[slotKey] = randomValue;
    });

    // 6. Validate ทุก filled slots
    Object.entries(filledSlots).forEach(([key, value]) => {
      const slotDef = slotsSchema.slots[key];
      if (slotDef) {
        const validation = this.templateService.validateSlotValue(key, value, slotDef);
        if (!validation.valid) {
          validationErrors.push({
            field: key,
            message: validation.error || 'Validation failed',
            code: 'VALIDATION_ERROR'
          });
        }
      }
    });

    // 7. ตรวจสอบ cross-field constraints
    if (slotsSchema.constraints?.crossField) {
      slotsSchema.constraints.crossField.forEach(constraint => {
        const isValid = this.evaluateConstraint(constraint.condition, filledSlots);
        if (!isValid) {
          validationErrors.push({
            field: 'cross-field',
            message: constraint.message,
            code: 'CROSS_FIELD_CONSTRAINT'
          });
        }
      });
    }

    // 8. ถ้า strict mode และมี errors ให้ throw error
    if (strict && validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    return {
      filledSlots,
      mockedKeys,
      validationReport: {
        errors: validationErrors,
        warnings: validationWarnings
      },
      metadata: {
        templateKey,
        version,
        filledAt: new Date().toISOString(),
        mockProfile: includeMock ? mockProfile : undefined,
        totalSlots: Object.keys(slotsSchema.slots).length,
        filledSlotsCount: Object.keys(filledSlots).filter(key => key.startsWith('slots.')).length
      }
    };
  }

  /**
   * Map requirements ผ่าน aliases
   */
  private mapRequirements(
    requirements: Record<string, any>,
    aliases: Record<string, string>
  ): Record<string, any> {
    const mapped: Record<string, any> = {};
    
    Object.entries(requirements).forEach(([key, value]) => {
      // ลองหา alias ก่อน
      if (key in aliases) {
        mapped[aliases[key]] = value;
      } else {
        // ลองจับคู่แบบ fuzzy
        const fuzzyMatch = this.findFuzzyMatch(key, Object.keys(aliases));
        if (fuzzyMatch) {
          mapped[aliases[fuzzyMatch]] = value;
        } else {
          // ถ้าไม่เจอ alias ให้เก็บเป็น direct slot key
          if (key.startsWith('slots.')) {
            mapped[key] = value;
          }
        }
      }
    });
    
    return mapped;
  }

  /**
   * หา fuzzy match สำหรับ key
   */
  private findFuzzyMatch(input: string, options: string[]): string | null {
    const normalizedInput = input.toLowerCase().replace(/[-_]/g, '');
    
    for (const option of options) {
      const normalizedOption = option.toLowerCase().replace(/[-_]/g, '');
      if (normalizedInput === normalizedOption) {
        return option;
      }
    }
    
    return null;
  }

  /**
   * สร้างข้อมูลสุ่มสำหรับ slot ที่ขาด
   */
  private generateRandomValue(
    slotKey: string,
    slotDef: TemplateSlot,
    seed: number
  ): any {
    // ใช้ seed + slotKey เพื่อให้ผลลัพธ์สม่ำเสมอ
    const slotSeed = seed + slotKey.length;
    const random = new SeededRandom(slotSeed);
    
    switch (slotDef.type) {
      case 'string':
        return this.generateRandomString(slotKey, slotDef, random);
      case 'number':
        return this.generateRandomNumber(slotKey, slotDef, random);
      case 'boolean':
        return random.next() > 0.5;
      case 'color':
        return this.generateRandomColor(slotKey, random);
      case 'email':
        return this.generateRandomEmail(slotKey, random);
      case 'phone':
        return this.generateRandomPhone(slotKey, random);
      case 'url':
        return this.generateRandomUrl(slotKey, random);
      default:
        return 'Sample Value';
    }
  }

  private generateRandomString(slotKey: string, slotDef: TemplateSlot, random: SeededRandom): string {
    const templates: Record<string, string[]> = {
      'title': ['ยินดีต้อนรับ', 'บริการคุณภาพ', 'ประสบการณ์ใหม่', 'นวัตกรรม'],
      'cta': ['เริ่มต้นเลย', 'เรียนรู้เพิ่มเติม', 'ติดต่อเรา', 'จองเลย'],
      'description': ['บริการที่ดีที่สุด', 'คุณภาพระดับสากล', 'ประสบการณ์ที่ยอดเยี่ยม'],
      'name': ['ร้านตัวอย่าง', 'ธุรกิจใหม่', 'บริการคุณภาพ']
    };
    
    let templateKey = 'title';
    if (slotKey.includes('cta')) templateKey = 'cta';
    else if (slotKey.includes('description')) templateKey = 'description';
    else if (slotKey.includes('name')) templateKey = 'name';
    
    const options = templates[templateKey] || ['ตัวอย่าง'];
    const baseValue = random.choice(options);
    
    // ตรวจสอบ length constraints
    const minLength = slotDef.minLength || 1;
    const maxLength = slotDef.maxLength || 100;
    
    if (baseValue.length >= minLength && baseValue.length <= maxLength) {
      return baseValue;
    }
    
    // ปรับความยาวตาม constraints
    if (baseValue.length < minLength) {
      return baseValue + ' ' + 'ตัวอย่าง'.repeat(Math.ceil((minLength - baseValue.length) / 3));
    }
    
    return baseValue.substring(0, maxLength);
  }

  private generateRandomNumber(slotKey: string, slotDef: TemplateSlot, random: SeededRandom): number {
    return random.nextInt(1, 1000);
  }

  private generateRandomColor(slotKey: string, random: SeededRandom): string {
    const colors = [
      '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    return random.choice(colors);
  }

  private generateRandomEmail(slotKey: string, random: SeededRandom): string {
    const domains = ['example.test', 'demo.local', 'sample.dev'];
    const domain = random.choice(domains);
    return `info@${domain}`;
  }

  private generateRandomPhone(slotKey: string, random: SeededRandom): string {
    const prefixes = ['+66-2-', '+66-8-', '+66-9-'];
    const prefix = random.choice(prefixes);
    const number = random.nextInt(1000000, 9999999);
    return `${prefix}${number}`;
  }

  private generateRandomUrl(slotKey: string, random: SeededRandom): string {
    return 'https://example.test';
  }

  /**
   * ประเมิน cross-field constraint
   */
  private evaluateConstraint(condition: string, filledSlots: Record<string, any>): boolean {
    // ตัวอย่างการประเมิน constraint แบบง่าย
    // ในความเป็นจริงอาจต้องใช้ expression parser ที่ซับซ้อนกว่า
    
    try {
      // แทนที่ field names ด้วย values
      let expression = condition;
      Object.entries(filledSlots).forEach(([key, value]) => {
        const fieldName = key.replace(/[^a-zA-Z0-9_]/g, '_');
        expression = expression.replace(new RegExp(key, 'g'), JSON.stringify(value));
      });
      
      // ประเมิน expression (ต้องระวังเรื่อง security)
      return eval(expression);
    } catch (error) {
      console.warn(`Failed to evaluate constraint: ${condition}`, error);
      return true; // ถ้าประเมินไม่ได้ให้ถือว่า valid
    }
  }
}

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
