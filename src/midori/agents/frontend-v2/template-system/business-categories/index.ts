// Business Category Manifests
// Each business category defines which shared blocks to use and how to customize them

export interface BusinessCategoryManifest {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  blocks: BlockUsage[];
  globalSettings: GlobalSettings;
  overrides: CategoryOverrides;
}

export interface BlockUsage {
  blockId: string;
  variantId?: string;
  required: boolean;
  customizations: Record<string, any>;
}

export interface GlobalSettings {
  palette: {
    primary: string;
    secondary?: string;
    bgTone?: string;
  };
  tokens: {
    radius: string;
    spacing: string;
  };
  tone?: string;
  reasoning?: string;
}

export interface CategoryOverrides {
  [blockId: string]: {
    placeholders: Record<string, PlaceholderOverride>;
    template?: string;
  };
}

export interface PlaceholderOverride {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  enum?: string[];
  defaultValue?: any;
  description?: string;
}

// Business Category Definitions
export const BUSINESS_CATEGORIES: BusinessCategoryManifest[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Restaurant and food service websites',
    keywords: ['restaurant', 'food', 'dining', 'cafe', 'bistro', 'menu', 'reservation', 'ร้านอาหาร', 'อาหาร', 'หมูย่าง', 'หมูกรอบ', 'ขายอาหาร', 'ร้านขายอาหาร', 'ภัตตาคาร', 'คาเฟ่', 'ร้านกาแฟ'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เมนู', href: '/menu' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-stats',
        required: true,
        customizations: {
          badge: 'ร้านอาหารคุณภาพ',
          heading: 'อาหารอร่อย ราคาเป็นมิตร',
          subheading: 'เราใช้ส่วนผสมคุณภาพสูง ปรุงสดใหม่ทุกวัน เพื่อความอร่อยที่คุณจะไม่ลืม',
          ctaLabel: 'ดูเมนู',
          secondaryCta: 'จองโต๊ะ',
          stat1: '15+',
          stat1Label: 'ปีประสบการณ์',
          stat2: '1000+',
          stat2Label: 'ลูกค้าพึงพอใจ',
          stat3: '50+',
          stat3Label: 'เมนูหลากหลาย'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'เกี่ยวกับร้านอาหารของเรา',
          description: 'เราเป็นร้านอาหารที่ให้บริการอาหารไทยแท้ ใช้ส่วนผสมคุณภาพสูง ปรุงสดใหม่ทุกวัน',
          features: [
            { title: 'อาหารสดใหม่', description: 'ปรุงสดทุกวัน' },
            { title: 'ราคาเป็นมิตร', description: 'ราคาเหมาะสม' },
            { title: 'บริการดี', description: 'ยิ้มแย้มแจ่มใส' }
          ],
          stats: [
            { number: '15+', label: 'ปีประสบการณ์' },
            { number: '1000+', label: 'ลูกค้าพึงพอใจ' },
            { number: '50+', label: 'เมนูหลากหลาย' },
            { number: '24/7', label: 'บริการส่ง' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'เมนูอาหาร',
          menuItems: [
            { name: 'ข้าวผัดกุ้ง', price: '120', description: 'ข้าวผัดกุ้งสด ใส่ผักสด' },
            { name: 'ผัดไทย', price: '80', description: 'ผัดไทยแท้ รสชาติดั้งเดิม' },
            { name: 'ต้มยำกุ้ง', price: '150', description: 'ต้มยำกุ้งเผ็ดร้อน' },
            { name: 'แกงเขียวหวาน', price: '100', description: 'แกงเขียวหวานไก่' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'ติดต่อเรา',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@restaurant.com',
          businessHours: 'จันทร์-อาทิตย์ 10:00-22:00'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'ร้านอาหารฟ้าสดใส',
          description: 'ร้านอาหารไทยแท้ อาหารอร่อย ราคาเป็นมิตร',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'Line', url: 'https://line.me', icon: '💬' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เมนู', href: '/menu' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@restaurant.com'
        }
      },
      {
        blockId: 'theme-basic',
        required: true,
        customizations: {}
      }
    ],
    globalSettings: {
      palette: {
        primary: 'orange',
        secondary: 'red',
        bgTone: '100'
      },
      tokens: {
        radius: '8px',
        spacing: '1rem'
      },
      tone: 'warm',
      reasoning: 'Orange and red colors evoke appetite and warmth, perfect for food service'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Restaurant badge text (e.g., "ร้านอาหารคุณภาพ")' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Restaurant main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Restaurant description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูเมนู", "สั่งอาหาร")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "จองโต๊ะ", "ติดต่อ")' 
          }
        }
      },
      'navbar-basic': {
        placeholders: {
          brand: { 
            required: true, 
            minLength: 1, 
            description: 'Restaurant name' 
          },
          ctaButton: { 
            required: true, 
            maxLength: 20, 
            description: 'Restaurant CTA (e.g., "จองโต๊ะ", "สั่งอาหาร")' 
          }
        }
      }
    }
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online store and e-commerce websites',
    keywords: ['shop', 'store', 'buy', 'sell', 'ecommerce', 'shopping', 'products', 'ขายหนังสือ', 'หนังสือ', 'ร้านหนังสือ', 'bookstore', 'ร้านค้า', 'ขายสินค้า', 'ออนไลน์', 'ช้อปปิ้ง', 'สินค้า', 'ร้านขายของ'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'สินค้า', href: '/products' },
            { label: 'หมวดหมู่', href: '/categories' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-stats',
        required: true,
        customizations: {
          badge: 'ร้านค้าออนไลน์',
          heading: 'สินค้าคุณภาพ ราคาดี',
          subheading: 'เลือกซื้อสินค้าคุณภาพสูงจากร้านค้าออนไลน์ที่เชื่อถือได้ พร้อมบริการส่งฟรี',
          ctaLabel: 'ช้อปเลย',
          secondaryCta: 'ดูสินค้า',
          stat1: '1000+',
          stat1Label: 'สินค้า',
          stat2: '24/7',
          stat2Label: 'บริการ',
          stat3: 'ฟรี',
          stat3Label: 'ค่าส่ง'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'เกี่ยวกับร้านค้าออนไลน์ของเรา',
          description: 'เราเป็นร้านค้าออนไลน์ที่ให้บริการสินค้าคุณภาพสูง ราคาเป็นมิตร พร้อมบริการส่งฟรี',
          features: [
            { title: 'สินค้าคุณภาพ', description: 'คัดสรรอย่างดี' },
            { title: 'ราคาเป็นมิตร', description: 'ราคาเหมาะสม' },
            { title: 'ส่งฟรี', description: 'ส่งฟรีทุกออเดอร์' }
          ],
          stats: [
            { number: '1000+', label: 'สินค้า' },
            { number: '24/7', label: 'บริการ' },
            { number: 'ฟรี', label: 'ค่าส่ง' },
            { number: '5★', label: 'รีวิว' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'สินค้าของเรา',
          menuItems: [
            { name: 'หนังสือใหม่', price: '299', description: 'หนังสือขายดีล่าสุด' },
            { name: 'หนังสือเก่า', price: '199', description: 'หนังสือคุณภาพดี ราคาถูก' },
            { name: 'อุปกรณ์เขียน', price: '50', description: 'ปากกา ดินสอ สมุด' },
            { name: 'ของเล่น', price: '399', description: 'ของเล่นเสริมพัฒนาการ' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'ติดต่อเรา',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@shop.com',
          businessHours: 'จันทร์-อาทิตย์ 9:00-21:00'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'ร้านค้าออนไลน์คุณภาพ',
          description: 'ร้านค้าออนไลน์ที่ให้บริการสินค้าคุณภาพสูง ราคาเป็นมิตร',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'Line', url: 'https://line.me', icon: '💬' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'สินค้า', href: '/products' },
            { label: 'หมวดหมู่', href: '/categories' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@shop.com'
        }
      },
      {
        blockId: 'theme-basic',
        required: true,
        customizations: {}
      }
    ],
    globalSettings: {
      palette: {
        primary: 'blue',
        secondary: 'purple',
        bgTone: '50'
      },
      tokens: {
        radius: '6px',
        spacing: '1rem'
      },
      tone: 'professional',
      reasoning: 'Blue conveys trust and reliability, essential for e-commerce'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'E-commerce badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'E-commerce main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'E-commerce value proposition' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ช้อปเลย", "ซื้อสินค้า")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ดูสินค้า", "ค้นหา")' 
          }
        }
      }
    }
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio and creative showcase websites',
    keywords: ['portfolio', 'creative', 'designer', 'developer', 'artist', 'work', 'projects'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'ผลงาน', href: '/portfolio' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        required: true,
        customizations: {
          badge: 'Portfolio',
          heading: 'Creative Professional',
          subheading: 'แสดงผลงานและความสามารถในการสร้างสรรค์สิ่งใหม่ๆ',
          ctaLabel: 'ดูผลงาน',
          secondaryCta: 'ติดต่อ'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'เกี่ยวกับฉัน',
          description: 'ฉันเป็นนักออกแบบและนักพัฒนาที่มีความหลงใหลในการสร้างสรรค์สิ่งใหม่ๆ',
          features: [
            { title: 'ออกแบบ', description: 'UI/UX Design' },
            { title: 'พัฒนา', description: 'Web Development' },
            { title: 'สร้างสรรค์', description: 'Creative Solutions' }
          ],
          stats: [
            { number: '50+', label: 'โปรเจค' },
            { number: '3+', label: 'ปีประสบการณ์' },
            { number: '100%', label: 'ความพึงพอใจ' },
            { number: '24/7', label: 'พร้อมทำงาน' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'ผลงานของฉัน',
          menuItems: [
            { name: 'Web Design', price: '15,000', description: 'ออกแบบเว็บไซต์สวยงาม' },
            { name: 'Mobile App', price: '25,000', description: 'พัฒนาแอปมือถือ' },
            { name: 'Logo Design', price: '5,000', description: 'ออกแบบโลโก้' },
            { name: 'Branding', price: '20,000', description: 'สร้างแบรนด์ครบวงจร' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'ติดต่อฉัน',
          subtitle: 'พร้อมรับงานใหม่',
          address: 'กรุงเทพฯ, ประเทศไทย',
          phone: '081-234-5678',
          email: 'hello@portfolio.com',
          businessHours: 'จันทร์-ศุกร์ 9:00-18:00'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'Creative Portfolio',
          description: 'นักออกแบบและนักพัฒนาที่มีความหลงใหลในการสร้างสรรค์',
          socialLinks: [
            { name: 'GitHub', url: 'https://github.com', icon: '💻' },
            { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
            { name: 'Dribbble', url: 'https://dribbble.com', icon: '🎨' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'ผลงาน', href: '/portfolio' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: 'กรุงเทพฯ, ประเทศไทย',
          phone: '081-234-5678',
          email: 'hello@portfolio.com'
        }
      },
      {
        blockId: 'theme-basic',
        required: true,
        customizations: {}
      }
    ],
    globalSettings: {
      palette: {
        primary: 'purple',
        secondary: 'pink',
        bgTone: '100'
      },
      tokens: {
        radius: '10px',
        spacing: '1.25rem'
      },
      tone: 'creative',
      reasoning: 'Purple and pink convey creativity and innovation'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Portfolio badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Professional title or name' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Professional description or tagline' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูผลงาน", "Portfolio")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ติดต่อ", "Contact")' 
          }
        }
      }
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical and healthcare service websites',
    keywords: ['health', 'medical', 'doctor', 'clinic', 'hospital', 'healthcare', 'treatment'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'บริการ', href: '/services' },
            { label: 'แพทย์', href: '/doctors' },
            { label: 'นัดหมาย', href: '/appointment' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-stats',
        required: true,
        customizations: {
          badge: 'บริการสุขภาพ',
          heading: 'ดูแลสุขภาพคุณอย่างมืออาชีพ',
          subheading: 'ทีมแพทย์ผู้เชี่ยวชาญพร้อมให้บริการดูแลสุขภาพด้วยมาตรฐานสากล',
          ctaLabel: 'นัดหมาย',
          secondaryCta: 'ดูบริการ',
          stat1: '20+',
          stat1Label: 'ปีประสบการณ์',
          stat2: '1000+',
          stat2Label: 'ผู้ป่วย',
          stat3: '24/7',
          stat3Label: 'บริการฉุกเฉิน'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'เกี่ยวกับคลินิกของเรา',
          description: 'เราเป็นคลินิกที่ให้บริการดูแลสุขภาพด้วยมาตรฐานสากล โดยทีมแพทย์ผู้เชี่ยวชาญ',
          features: [
            { title: 'แพทย์เชี่ยวชาญ', description: 'ทีมแพทย์ผู้เชี่ยวชาญ' },
            { title: 'มาตรฐานสากล', description: 'มาตรฐานการรักษาสูง' },
            { title: 'อุปกรณ์ทันสมัย', description: 'เทคโนโลยีล่าสุด' }
          ],
          stats: [
            { number: '20+', label: 'ปีประสบการณ์' },
            { number: '1000+', label: 'ผู้ป่วย' },
            { number: '24/7', label: 'บริการฉุกเฉิน' },
            { number: '100%', label: 'ความปลอดภัย' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'บริการของเรา',
          menuItems: [
            { name: 'ตรวจสุขภาพ', price: '500', description: 'ตรวจสุขภาพทั่วไป' },
            { name: 'ตรวจเลือด', price: '300', description: 'ตรวจเลือดครบถ้วน' },
            { name: 'X-Ray', price: '800', description: 'เอกซเรย์ปอด' },
            { name: 'วัคซีน', price: '1,200', description: 'วัคซีนป้องกันโรค' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'ติดต่อเรา',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@clinic.com',
          businessHours: 'จันทร์-อาทิตย์ 8:00-20:00 (ฉุกเฉิน 24 ชั่วโมง)'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'คลินิกสุขภาพดี',
          description: 'คลินิกที่ให้บริการดูแลสุขภาพด้วยมาตรฐานสากล',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Line', url: 'https://line.me', icon: '💬' },
            { name: 'YouTube', url: 'https://youtube.com', icon: '📺' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'บริการ', href: '/services' },
            { label: 'แพทย์', href: '/doctors' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@clinic.com'
        }
      },
      {
        blockId: 'theme-basic',
        required: true,
        customizations: {}
      }
    ],
    globalSettings: {
      palette: {
        primary: 'green',
        secondary: 'blue',
        bgTone: '50'
      },
      tokens: {
        radius: '8px',
        spacing: '1rem'
      },
      tone: 'professional',
      reasoning: 'Green conveys health, growth, and trust - essential for healthcare'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Healthcare badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Healthcare main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Healthcare value proposition' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "นัดหมาย", "จองคิว")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ดูบริการ", "ข้อมูล")' 
          }
        }
      }
    }
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    description: 'Pharmacy and drugstore websites',
    keywords: ['pharmacy', 'drugstore', 'medicine', 'ยา', 'ขายยา', 'ร้านขายยา', 'ยา', 'เภสัช', 'เภสัชกรรม', 'ร้านยา', 'คลินิก', 'โรงพยาบาล', 'สุขภาพ', 'ยาแผนปัจจุบัน'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'สินค้า', href: '/products' },
            { label: 'บริการ', href: '/services' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-stats',
        required: true,
        customizations: {
          badge: 'ร้านขายยาคุณภาพ',
          heading: 'ยาคุณภาพ ราคาเป็นมิตร',
          subheading: 'เราให้บริการยาคุณภาพสูง พร้อมคำแนะนำจากเภสัชกรผู้เชี่ยวชาญ เพื่อสุขภาพที่ดีของคุณ',
          ctaLabel: 'ดูสินค้า',
          secondaryCta: 'ติดต่อเรา',
          stat1: '20+',
          stat1Label: 'ปีประสบการณ์',
          stat2: '5000+',
          stat2Label: 'ลูกค้าพึงพอใจ',
          stat3: '1000+',
          stat3Label: 'สินค้าคุณภาพ'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'เกี่ยวกับร้านขายยาของเรา',
          description: 'เราเป็นร้านขายยาที่ให้บริการยาคุณภาพสูง พร้อมคำแนะนำจากเภสัชกรผู้เชี่ยวชาญ',
          features: [
            { title: 'ยาคุณภาพ', description: 'คัดสรรอย่างดี' },
            { title: 'เภสัชกร', description: 'ผู้เชี่ยวชาญ' },
            { title: 'ราคายุติธรรม', description: 'ราคาเหมาะสม' }
          ],
          stats: [
            { number: '20+', label: 'ปีประสบการณ์' },
            { number: '5000+', label: 'ลูกค้าพึงพอใจ' },
            { number: '1000+', label: 'สินค้าคุณภาพ' },
            { number: '24/7', label: 'บริการ' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'ติดต่อเรา',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@pharmacy.com',
          businessHours: 'จันทร์-อาทิตย์ 8:00-20:00'
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'สินค้ายา',
          menuItems: [
            { name: 'ยาแก้ไข้', price: '50', description: 'ยาแก้ไข้ลดไข้' },
            { name: 'วิตามิน', price: '200', description: 'วิตามินเสริมสุขภาพ' },
            { name: 'ครีมทาผิว', price: '150', description: 'ครีมบำรุงผิว' },
            { name: 'อุปกรณ์การแพทย์', price: '300', description: 'อุปกรณ์ตรวจสุขภาพ' }
          ]
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'ร้านขายยา สุขใจ',
          description: 'ร้านขายยาคุณภาพสูง พร้อมคำแนะนำจากเภสัชกรผู้เชี่ยวชาญ',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'Line', url: 'https://line.me', icon: '💬' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'สินค้า', href: '/products' },
            { label: 'บริการ', href: '/services' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@pharmacy.com'
        }
      },
      {
        blockId: 'theme-basic',
        required: true,
        customizations: {}
      }
    ],
    globalSettings: {
      palette: {
        primary: 'blue',
        secondary: 'green',
        bgTone: '50'
      },
      tokens: {
        radius: '8px',
        spacing: '1rem'
      },
      tone: 'professional',
      reasoning: 'Pharmacy websites need a professional, trustworthy appearance with blue/green colors'
    },
    overrides: {
      'navbar-basic': {
        placeholders: {
          brand: { 
            required: true, 
            maxLength: 30, 
            description: 'Pharmacy name (e.g., "ร้านขายยา ABC")' 
          },
          brandFirstChar: { 
            required: true, 
            minLength: 1, 
            description: 'First character of pharmacy name' 
          },
          ctaButton: { 
            required: true, 
            maxLength: 20, 
            description: 'Pharmacy CTA (e.g., "ติดต่อเรา", "สั่งยา")' 
          },
          menuItems: { 
            required: true, 
            description: 'Menu items array' 
          }
        }
      },
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Pharmacy badge text (e.g., "ร้านขายยาคุณภาพ")' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Pharmacy main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Pharmacy description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูสินค้า", "สั่งยา")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ติดต่อเรา", "ข้อมูล")' 
          }
        }
      }
    }
  }
];


