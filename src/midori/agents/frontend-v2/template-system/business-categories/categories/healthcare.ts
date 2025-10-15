import { BusinessCategoryManifest } from "../index";

// Healthcare Business Categories
export const healthcareCategories: BusinessCategoryManifest[] = [
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
            { label: 'สินค้า', href: '/menu' },
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
        variantId: 'about-split',
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
        variantId: 'menu-list',
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
        variantId: 'footer-centered',
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
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-stats', 'hero-split'],
        defaultVariant: 'hero-stats',
        randomSelection: false,
        constraints: {
          businessType: ['healthcare', 'medical', 'clinic', 'hospital'],
          tone: ['professional', 'trustworthy', 'reliable', 'medical']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['healthcare', 'medical'],
          tone: ['professional', 'trustworthy', 'medical']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-mega',
        randomSelection: false,
        constraints: {
          businessType: ['healthcare', 'medical'],
          tone: ['professional', 'comprehensive', 'trustworthy']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry'],
        defaultVariant: 'menu-list',
        randomSelection: false,
        constraints: {
          businessType: ['healthcare', 'medical'],
          tone: ['professional', 'organized', 'clear']
        }
      }
    }
  },
/*   {
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
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-stats', 'hero-split', 'hero-cards'],
        defaultVariant: 'hero-stats',
        randomSelection: false,
        constraints: {
          businessType: ['pharmacy', 'drugstore', 'medical-supply'],
          tone: ['professional', 'trustworthy', 'reliable', 'medical']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['pharmacy', 'drugstore'],
          tone: ['professional', 'trustworthy', 'medical']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-mega',
        randomSelection: false,
        constraints: {
          businessType: ['pharmacy', 'drugstore'],
          tone: ['professional', 'comprehensive', 'trustworthy']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry'],
        defaultVariant: 'menu-list',
        randomSelection: false,
        constraints: {
          businessType: ['pharmacy', 'drugstore'],
          tone: ['professional', 'organized', 'clear']
        }
      }
    }
  } */
];

