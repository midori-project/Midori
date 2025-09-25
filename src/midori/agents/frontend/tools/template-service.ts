/**
 * Template Service สำหรับจัดการ Templates และ Slots
 * รองรับการโหลด, validate, และจัดการ template slots
 */

export interface TemplateSlot {
  type: 'string' | 'number' | 'boolean' | 'color' | 'url' | 'email' | 'phone';
  required?: boolean;
  default?: string | number | boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: (string | number)[];
  description?: string;
}

export interface TemplateSlotsSchema {
  slots: Record<string, TemplateSlot>;
  aliases: Record<string, string>;
  constraints?: {
    crossField?: Array<{
      condition: string;
      message: string;
    }>;
  };
}

export interface UiTemplate {
  id: string;
  key: string;
  label: string;
  category: string;
  createdAt: string;
  versions: UiTemplateVersion[];
}

export interface UiTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  semver: string;
  slots: TemplateSlotsSchema;
  constraints?: any;
  compat?: any;
  status: 'draft' | 'published' | 'archived';
}

export interface TemplateSourceFile {
  id: string;
  versionId: string;
  path: string;
  content: string;
  sha256: string;
  size: number;
}

// Mock Templates สำหรับการทดสอบ
const mockTemplates: Record<string, UiTemplate> = {
  'restaurant-basic': {
    id: 'tpl-001',
    key: 'restaurant-basic',
    label: 'Restaurant Basic Template',
    category: 'restaurant',
    createdAt: '2024-01-01T00:00:00Z',
    versions: [
      {
        id: 'ver-001',
        templateId: 'tpl-001',
        version: 1,
        semver: '1.0.0',
        slots: {
          slots: {
            'slots.brand.name': {
              type: 'string',
              required: true,
              minLength: 2,
              maxLength: 50,
              description: 'ชื่อร้านอาหาร'
            },
            'slots.hero.title': {
              type: 'string',
              required: true,
              minLength: 3,
              maxLength: 60,
              description: 'หัวข้อหลักของหน้าแรก'
            },
            'slots.hero.cta': {
              type: 'string',
              default: 'จองโต๊ะ',
              maxLength: 30,
              description: 'ข้อความปุ่มเรียกให้กระทำ'
            },
            'slots.theme.primary': {
              type: 'color',
              pattern: '^#([0-9a-fA-F]{6})$',
              default: '#22c55e',
              description: 'สีหลักของเว็บไซต์'
            },
            'slots.contact.phone': {
              type: 'phone',
              pattern: '^\\+?[0-9\\- ]{7,20}$',
              description: 'เบอร์โทรศัพท์ติดต่อ'
            },
            'slots.contact.email': {
              type: 'email',
              pattern: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$',
              description: 'อีเมลติดต่อ'
            },
            'slots.about.description': {
              type: 'string',
              maxLength: 500,
              description: 'คำอธิบายเกี่ยวกับร้าน'
            },
            'slots.menu.highlight': {
              type: 'string',
              maxLength: 100,
              description: 'เมนูแนะนำ'
            }
          },
          aliases: {
            businessName: 'slots.brand.name',
            primaryColor: 'slots.theme.primary',
            ctaText: 'slots.hero.cta',
            phone: 'slots.contact.phone',
            email: 'slots.contact.email',
            title: 'slots.hero.title',
            description: 'slots.about.description',
            menuHighlight: 'slots.menu.highlight'
          },
          constraints: {
            crossField: [
              {
                condition: 'slots.contact.phone && slots.contact.email',
                message: 'ต้องมีข้อมูลติดต่ออย่างน้อย 1 ช่อง (โทรศัพท์หรืออีเมล)'
              }
            ]
          }
        },
        constraints: {},
        compat: {},
        status: 'published'
      }
    ]
  },
  
  'cafe-modern': {
    id: 'tpl-002',
    key: 'cafe-modern',
    label: 'Modern Cafe Template',
    category: 'cafe',
    createdAt: '2024-01-02T00:00:00Z',
    versions: [
      {
        id: 'ver-002',
        templateId: 'tpl-002',
        version: 1,
        semver: '1.0.0',
        slots: {
          slots: {
            'slots.brand.name': {
              type: 'string',
              required: true,
              minLength: 2,
              maxLength: 50,
              description: 'ชื่อร้านกาแฟ'
            },
            'slots.hero.title': {
              type: 'string',
              required: true,
              minLength: 3,
              maxLength: 60,
              description: 'หัวข้อหลัก'
            },
            'slots.theme.primary': {
              type: 'color',
              pattern: '^#([0-9a-fA-F]{6})$',
              default: '#8B4513',
              description: 'สีหลัก (สีน้ำตาลกาแฟ)'
            },
            'slots.theme.secondary': {
              type: 'color',
              pattern: '^#([0-9a-fA-F]{6})$',
              default: '#F5F5DC',
              description: 'สีรอง (สีครีม)'
            },
            'slots.coffee.specialty': {
              type: 'string',
              maxLength: 100,
              description: 'กาแฟพิเศษของร้าน'
            }
          },
          aliases: {
            businessName: 'slots.brand.name',
            primaryColor: 'slots.theme.primary',
            secondaryColor: 'slots.theme.secondary',
            title: 'slots.hero.title',
            specialty: 'slots.coffee.specialty'
          },
          constraints: {}
        },
        constraints: {},
        compat: {},
        status: 'published'
      }
    ]
  }
};

const mockSourceFiles: Record<string, TemplateSourceFile[]> = {
  'ver-001': [
    {
      id: 'file-001',
      versionId: 'ver-001',
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ slots.brand.name }}</title>
    <style>
        :root {
            --primary-color: {{ slots.theme.primary }};
        }
        .hero {
            background: var(--primary-color);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .cta-button {
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 5px;
            font-size: 1.2rem;
        }
    </style>
</head>
<body>
    <header class="hero">
        <h1>{{ slots.hero.title }}</h1>
        <p>{{ slots.about.description }}</p>
        <button class="cta-button">{{ slots.hero.cta }}</button>
    </header>
    
    <section>
        <h2>เมนูแนะนำ</h2>
        <p>{{ slots.menu.highlight }}</p>
    </section>
    
    <footer>
        <h3>ติดต่อเรา</h3>
        <p>โทร: {{ slots.contact.phone }}</p>
        <p>อีเมล: {{ slots.contact.email }}</p>
        <p>เว็บไซต์: {{ external.domain }}</p>
        <p>ที่อยู่: {{ external.address }}</p>
        <p>เวลาเปิด-ปิด: {{ external.openHours }}</p>
    </footer>
</body>
</html>`,
      sha256: 'sha256:example1',
      size: 1200
    }
  ]
};

export class TemplateService {
  /**
   * ดึงรายการ templates
   */
  async getTemplates(params: {
    category?: string;
    q?: string;
    status?: string;
  } = {}): Promise<UiTemplate[]> {
    let templates = Object.values(mockTemplates);
    
    if (params.category) {
      templates = templates.filter(t => t.category === params.category);
    }
    
    if (params.q) {
      const query = params.q.toLowerCase();
      templates = templates.filter(t => 
        t.label.toLowerCase().includes(query) ||
        t.key.toLowerCase().includes(query)
      );
    }
    
    if (params.status) {
      templates = templates.filter(t => 
        t.versions.some(v => v.status === params.status)
      );
    }
    
    return templates;
  }

  /**
   * ดึงเวอร์ชันของ template
   */
  async getTemplateVersions(key: string): Promise<UiTemplateVersion[]> {
    const template = mockTemplates[key];
    if (!template) {
      throw new Error(`Template '${key}' not found`);
    }
    
    return template.versions.map(v => ({
      ...v,
      slots: v.slots // Return slots schema
    }));
  }

  /**
   * ดึง slots schema ของ template version
   */
  async getSlots(key: string, version: number): Promise<{
    slots: TemplateSlotsSchema;
    constraints?: any;
  }> {
    const template = mockTemplates[key];
    if (!template) {
      throw new Error(`Template '${key}' not found`);
    }
    
    const templateVersion = template.versions.find(v => v.version === version);
    if (!templateVersion) {
      throw new Error(`Version ${version} of template '${key}' not found`);
    }
    
    return {
      slots: templateVersion.slots,
      constraints: templateVersion.constraints
    };
  }

  /**
   * ดึงไฟล์ต้นฉบับของ template version
   */
  async getFiles(
    key: string, 
    version: number, 
    prefix?: string
  ): Promise<TemplateSourceFile[]> {
    const template = mockTemplates[key];
    if (!template) {
      throw new Error(`Template '${key}' not found`);
    }
    
    const templateVersion = template.versions.find(v => v.version === version);
    if (!templateVersion) {
      throw new Error(`Version ${version} of template '${key}' not found`);
    }
    
    let files = mockSourceFiles[templateVersion.id] || [];
    
    if (prefix) {
      files = files.filter(f => f.path.startsWith(prefix));
    }
    
    return files;
  }

  /**
   * Validate slot value ตาม constraints
   */
  validateSlotValue(
    slotKey: string,
    value: any,
    slotDef: TemplateSlot
  ): { valid: boolean; error?: string } {
    // ตรวจสอบ required
    if (slotDef.required && (value === undefined || value === null || value === '')) {
      return { valid: false, error: `Field '${slotKey}' is required` };
    }
    
    // ถ้าไม่ required และไม่มีค่า ให้ผ่าน
    if (!slotDef.required && (value === undefined || value === null || value === '')) {
      return { valid: true };
    }
    
    // ตรวจสอบ type
    switch (slotDef.type) {
      case 'string':
        if (typeof value !== 'string') {
          return { valid: false, error: `Field '${slotKey}' must be a string` };
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          return { valid: false, error: `Field '${slotKey}' must be a number` };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: `Field '${slotKey}' must be a boolean` };
        }
        break;
      case 'color':
        if (typeof value !== 'string' || !/^#([0-9a-fA-F]{6})$/.test(value)) {
          return { valid: false, error: `Field '${slotKey}' must be a valid hex color` };
        }
        break;
      case 'email':
        if (typeof value !== 'string' || !/^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return { valid: false, error: `Field '${slotKey}' must be a valid email` };
        }
        break;
      case 'phone':
        if (typeof value !== 'string' || !/^\+?[0-9\- ]{7,20}$/.test(value)) {
          return { valid: false, error: `Field '${slotKey}' must be a valid phone number` };
        }
        break;
    }
    
    // ตรวจสอบ string constraints
    if (typeof value === 'string') {
      if (slotDef.minLength && value.length < slotDef.minLength) {
        return { valid: false, error: `Field '${slotKey}' must be at least ${slotDef.minLength} characters` };
      }
      if (slotDef.maxLength && value.length > slotDef.maxLength) {
        return { valid: false, error: `Field '${slotKey}' must be at most ${slotDef.maxLength} characters` };
      }
      if (slotDef.pattern && !new RegExp(slotDef.pattern).test(value)) {
        return { valid: false, error: `Field '${slotKey}' format is invalid` };
      }
      if (slotDef.enum && !slotDef.enum.includes(value)) {
        return { valid: false, error: `Field '${slotKey}' must be one of: ${slotDef.enum.join(', ')}` };
      }
    }
    
    return { valid: true };
  }
}
