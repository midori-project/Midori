/**
 * SlotManager - ตัวจัดการ Slot Data
 * รับผิดชอบในการเติมข้อมูลในแต่ละ slot ตาม configuration
 */

import { SlotConfig, FieldConfig, UserData } from '../types/Template';
import { AIGeneratedContent } from './AIContentGenerator';

export interface FilledSlot {
  [key: string]: any;
}

export interface SlotValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
}

export class SlotManager {
  private defaultValues: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultValues();
  }

  /**
   * เติมข้อมูลใน slots ทั้งหมด
   */
  async fillSlots(
    slotConfigs: Record<string, SlotConfig>, 
    userData: UserData, 
    aiContent: AIGeneratedContent
  ): Promise<Record<string, FilledSlot>> {
    console.log(`📊 [SlotManager] เริ่มเติมข้อมูลใน slots: ${Object.keys(slotConfigs).length} slots`);
    
    const filledSlots: Record<string, FilledSlot> = {};

    for (const [slotName, slotConfig] of Object.entries(slotConfigs)) {
      try {
        console.log(`📝 [SlotManager] เติมข้อมูล slot: ${slotName}`);
        
        const filledSlot = await this.fillSlot(slotName, slotConfig, userData, aiContent);
        filledSlots[slotName] = filledSlot;
        
        console.log(`✅ [SlotManager] เติมข้อมูล slot เสร็จ: ${slotName}`);
        
      } catch (error) {
        console.error(`❌ [SlotManager] ข้อผิดพลาดในการเติม slot ${slotName}:`, error);
        // ใช้ค่าเริ่มต้นแทน
        filledSlots[slotName] = this.getDefaultSlotData(slotName, slotConfig);
      }
    }

    console.log(`🎉 [SlotManager] เติมข้อมูล slots เสร็จสิ้น: ${Object.keys(filledSlots).length} slots`);
    return filledSlots;
  }

  /**
   * เติมข้อมูลใน slot เดียว
   */
  private async fillSlot(
    slotName: string, 
    slotConfig: SlotConfig, 
    userData: UserData, 
    aiContent: AIGeneratedContent
  ): Promise<FilledSlot> {
    const filledSlot: FilledSlot = {};

    for (const field of slotConfig.fields) {
      try {
        const value = await this.fillField(field, slotName, userData, aiContent);
        filledSlot[field.key] = value;
        
        console.log(`  ✅ [SlotManager] เติมฟิลด์: ${field.key} = ${typeof value === 'string' ? value.substring(0, 50) + '...' : value}`);
        
      } catch (error) {
        console.warn(`  ⚠️ [SlotManager] ไม่สามารถเติมฟิลด์ ${field.key}: ${error}`);
        filledSlot[field.key] = this.getDefaultFieldValue(field);
      }
    }

    return filledSlot;
  }

  /**
   * เติมข้อมูลในฟิลด์เดียว
   */
  private async fillField(
    field: FieldConfig, 
    slotName: string, 
    userData: UserData, 
    aiContent: AIGeneratedContent
  ): Promise<any> {
    // ลำดับความสำคัญ: User Data > AI Content > Default Value
    const value = this.getValueFromSources(field, slotName, userData, aiContent);
    
    // ตรวจสอบความถูกต้อง
    const validation = this.validateFieldValue(field, value);
    if (!validation.isValid) {
      throw new Error(`Validation failed for field ${field.key}: ${validation.errors.join(', ')}`);
    }

    return value;
  }

  /**
   * ดึงค่าจากแหล่งข้อมูลต่างๆ
   */
  private getValueFromSources(
    field: FieldConfig, 
    slotName: string, 
    userData: UserData, 
    aiContent: AIGeneratedContent
  ): any {
    // 1. ตรวจสอบจาก userData.slots
    if (userData.slots && userData.slots[slotName] && userData.slots[slotName][field.key] !== undefined) {
      return userData.slots[slotName][field.key];
    }

    // 2. ตรวจสอบจาก userData.content
    if (userData.content && userData.content[field.key] !== undefined) {
      return userData.content[field.key];
    }

    // 3. ตรวจสอบจาก AI Content
    const aiValue = this.getValueFromAIContent(field, slotName, aiContent);
    if (aiValue !== undefined) {
      return aiValue;
    }

    // 4. ใช้ค่าเริ่มต้น
    return this.getDefaultFieldValue(field);
  }

  /**
   * ดึงค่าจาก AI Content
   */
  private getValueFromAIContent(field: FieldConfig, slotName: string, aiContent: AIGeneratedContent): any {
    // Mapping ระหว่าง slot และ AI content
    const aiMapping: Record<string, Record<string, any>> = {
      header: {
        brandName: aiContent.heroTitle?.split(' ').slice(-2).join(' ') || 'ร้านค้าออนไลน์',
        tagline: aiContent.heroSubtitle || 'บริการคุณภาพดี ราคาเป็นมิตร',
        logoUrl: aiContent.imageUrl || 'https://via.placeholder.com/200x60/3b82f6/ffffff?text=Logo'
      },
      home: {
        heroTitle: aiContent.heroTitle || 'ยินดีต้อนรับ',
        heroSubtitle: aiContent.heroSubtitle || 'บริการคุณภาพดี',
        heroImage: aiContent.imageUrl || 'https://via.placeholder.com/1200x600/3b82f6/ffffff?text=Hero',
        ctaLabel: 'เริ่มช้อป',
        feature1: aiContent.features[0] || { title: 'คุณภาพดี', text: 'สินค้าคุณภาพสูง', icon: '⭐' },
        feature2: aiContent.features[1] || { title: 'ราคาเป็นมิตร', text: 'ราคาที่เหมาะสม', icon: '💰' },
        feature3: aiContent.features[2] || { title: 'บริการดี', text: 'บริการลูกค้าด้วยใจ', icon: '❤️' }
      },
      about: {
        pageTitle: 'เกี่ยวกับเรา',
        pageSubtitle: aiContent.aboutContent?.story || 'เรื่องราวของเรา',
        heroImage: aiContent.imageUrl || 'https://via.placeholder.com/1200x600/3b82f6/ffffff?text=About',
        storyTitle: 'เรื่องราวของเรา',
        storyContent: aiContent.aboutContent?.story || 'เรื่องราวของเรา',
        values: aiContent.aboutContent?.values || ['คุณภาพ', 'ราคาเป็นมิตร', 'บริการดี'],
        team: aiContent.aboutContent?.team || []
      },
      contact: {
        pageTitle: 'ติดต่อเรา',
        pageSubtitle: 'เราพร้อมให้บริการ',
        contactInfo: {
          phone: aiContent.contactInfo?.phone || '02-123-4567',
          email: aiContent.contactInfo?.email || 'info@example.com',
          address: aiContent.contactInfo?.address || '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          hours: aiContent.contactInfo?.hours || 'เปิดบริการทุกวัน 9:00-18:00'
        },
        formFields: [
          { name: 'name', type: 'text', required: true, placeholder: 'ชื่อของคุณ' },
          { name: 'email', type: 'email', required: true, placeholder: 'อีเมลของคุณ' },
          { name: 'subject', type: 'text', required: true, placeholder: 'หัวข้อ' },
          { name: 'message', type: 'textarea', required: true, placeholder: 'ข้อความของคุณ' }
        ],
        submitButton: 'ส่งข้อความ'
      },
      productList: {
        title: 'สินค้าของเรา',
        categories: aiContent.productInfo?.categories || [
          { id: '1', name: 'สินค้าประเภท 1' },
          { id: '2', name: 'สินค้าประเภท 2' }
        ],
        products: aiContent.productInfo?.featuredProducts?.map((product, index) => ({
          id: `product-${index + 1}`,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          rating: 4.5,
          tags: product.features?.map(feature => ({ value: feature })) || []
        })) || []
      },
      footer: {
        columns: [
          {
            title: 'เกี่ยวกับเรา',
            links: [
              { label: 'ประวัติ', href: '/about' },
              { label: 'ทีมงาน', href: '/team' }
            ]
          },
          {
            title: 'บริการ',
            links: [
              { label: 'จัดส่ง', href: '/delivery' },
              { label: 'ติดต่อ', href: '/contact' }
            ]
          },
          {
            title: 'ข้อมูล',
            links: [
              { label: 'เงื่อนไข', href: '/terms' },
              { label: 'นโยบาย', href: '/privacy' }
            ]
          }
        ],
        newsletter: { enabled: true },
        socialLinks: [
          { platform: 'Facebook', url: '#', icon: '📘' },
          { platform: 'Instagram', url: '#', icon: '📷' },
          { platform: 'Line', url: '#', icon: '💬' }
        ]
      },
      i18n: {
        currency: '฿',
        language: 'th',
        commonTexts: {
          addToCart: 'เพิ่มในตะกร้า',
          buyNow: 'ซื้อเลย',
          search: 'ค้นหา',
          filter: 'กรอง'
        }
      },
      theme: {
        primaryColor: 'sky-600',
        accentColor: 'amber-400',
        borderRadius: 'xl',
        elevation: 'lg',
        gridColumns: 3,
        fontFamily: 'inter',
        imagery: 'modern clean',
        tone: 'thai-casual'
      }
    };

    return aiMapping[slotName]?.[field.key];
  }

  /**
   * ตรวจสอบความถูกต้องของค่า
   */
  private validateFieldValue(field: FieldConfig, value: any): SlotValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // ตรวจสอบ required
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field ${field.key} is required`);
      missingFields.push(field.key);
    }

    // ตรวจสอบ validators
    if (field.validators && value !== undefined) {
      for (const validator of field.validators) {
        const validation = this.validateWithValidator(validator, value);
        if (!validation.isValid) {
          errors.push(validation.error || `Validation failed for ${field.key}`);
        }
      }
    }

    // ตรวจสอบประเภทข้อมูล
    const typeValidation = this.validateFieldType(field.type, value);
    if (!typeValidation.isValid) {
      errors.push(typeValidation.error || `Type validation failed for ${field.key}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields
    };
  }

  /**
   * ตรวจสอบด้วย validator
   */
  private validateWithValidator(validator: any, value: any): { isValid: boolean; error?: string } {
    switch (validator.kind) {
      case 'maxLength':
        if (typeof value === 'string' && value.length > validator.value) {
          return { isValid: false, error: `Value exceeds maximum length of ${validator.value}` };
        }
        break;
      case 'minLength':
        if (typeof value === 'string' && value.length < validator.value) {
          return { isValid: false, error: `Value is below minimum length of ${validator.value}` };
        }
        break;
      case 'maxItems':
        if (Array.isArray(value) && value.length > validator.value) {
          return { isValid: false, error: `Array exceeds maximum items of ${validator.value}` };
        }
        break;
      case 'minItems':
        if (Array.isArray(value) && value.length < validator.value) {
          return { isValid: false, error: `Array is below minimum items of ${validator.value}` };
        }
        break;
      case 'pattern':
        if (typeof value === 'string' && !new RegExp(validator.value).test(value)) {
          return { isValid: false, error: `Value does not match pattern ${validator.value}` };
        }
        break;
      case 'range':
        if (typeof value === 'number' && (value < validator.value.min || value > validator.value.max)) {
          return { isValid: false, error: `Value is outside range ${validator.value.min}-${validator.value.max}` };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * ตรวจสอบประเภทข้อมูล
   */
  private validateFieldType(type: string, value: any): { isValid: boolean; error?: string } {
    if (value === undefined || value === null) {
      return { isValid: true }; // undefined/null ผ่านได้
    }

    switch (type) {
      case 'text':
      case 'richtext':
        if (typeof value !== 'string') {
          return { isValid: false, error: `Expected string, got ${typeof value}` };
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          return { isValid: false, error: `Expected number, got ${typeof value}` };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { isValid: false, error: `Expected boolean, got ${typeof value}` };
        }
        break;
      case 'email':
        if (typeof value !== 'string' || !value.includes('@')) {
          return { isValid: false, error: `Expected valid email, got ${value}` };
        }
        break;
      case 'url':
        if (typeof value !== 'string' || (!value.startsWith('http://') && !value.startsWith('https://'))) {
          return { isValid: false, error: `Expected valid URL, got ${value}` };
        }
        break;
      case 'image':
        if (typeof value !== 'string') {
          return { isValid: false, error: `Expected image URL, got ${typeof value}` };
        }
        break;
      case 'list':
        if (!Array.isArray(value)) {
          return { isValid: false, error: `Expected array, got ${typeof value}` };
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          return { isValid: false, error: `Expected object, got ${typeof value}` };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * ดึงค่าเริ่มต้นของฟิลด์
   */
  private getDefaultFieldValue(field: FieldConfig): any {
    if (field.default !== undefined) {
      return field.default;
    }

    // ค่าเริ่มต้นตามประเภท
    switch (field.type) {
      case 'text':
      case 'richtext':
      case 'email':
      case 'url':
      case 'image':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'list':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  /**
   * ดึงข้อมูลเริ่มต้นของ slot
   */
  private getDefaultSlotData(slotName: string, slotConfig: SlotConfig): FilledSlot {
    const defaultData: FilledSlot = {};

    for (const field of slotConfig.fields) {
      defaultData[field.key] = this.getDefaultFieldValue(field);
    }

    return defaultData;
  }

  /**
   * เริ่มต้นค่าเริ่มต้น
   */
  private initializeDefaultValues(): void {
    this.defaultValues.set('header.brandName', 'ร้านค้าออนไลน์');
    this.defaultValues.set('header.tagline', 'บริการคุณภาพดี ราคาเป็นมิตร');
    this.defaultValues.set('home.heroTitle', 'ยินดีต้อนรับ');
    this.defaultValues.set('home.heroSubtitle', 'บริการคุณภาพดี ราคาเป็นมิตร');
    this.defaultValues.set('contact.phone', '02-123-4567');
    this.defaultValues.set('contact.email', 'info@example.com');
    this.defaultValues.set('i18n.currency', '฿');
    this.defaultValues.set('i18n.language', 'th');
  }

  /**
   * ตรวจสอบ slots ทั้งหมด
   */
  async validateSlots(
    slotConfigs: Record<string, SlotConfig>, 
    filledSlots: Record<string, FilledSlot>
  ): Promise<Record<string, SlotValidationResult>> {
    const results: Record<string, SlotValidationResult> = {};

    for (const [slotName, slotConfig] of Object.entries(slotConfigs)) {
      const filledSlot = filledSlots[slotName] || {};
      const errors: string[] = [];
      const warnings: string[] = [];
      const missingFields: string[] = [];

      for (const field of slotConfig.fields) {
        const value = filledSlot[field.key];
        const validation = this.validateFieldValue(field, value);
        
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
        missingFields.push(...validation.missingFields);
      }

      results[slotName] = {
        isValid: errors.length === 0,
        errors,
        warnings,
        missingFields
      };
    }

    return results;
  }
}
