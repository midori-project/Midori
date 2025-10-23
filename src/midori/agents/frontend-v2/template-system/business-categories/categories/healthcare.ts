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
        required: true,
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
        required: true,
        customizations: {
          title: 'ติดต่อเรา',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@clinic.com',
          businessHours: 'จันทร์-อาทิตย์ 8:00-20:00 (ฉุกเฉิน 24 ชั่วโมง)',
          contactFormTitle: 'นัดหมายหรือสอบถาม',
          contactFormCta: 'ส่งข้อความ',
          contactFormDescription: 'กรุณากรอกข้อมูลด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด',
          contactInfoTitle: 'ข้อมูลติดต่อ',
          contactInfoDescription: 'เราพร้อมให้บริการและตอบคำถามทุกข้อสงสัย',
          nameLabel: 'ชื่อ-นามสกุล',
          namePlaceholder: 'กรุณากรอกชื่อ-นามสกุล',
          emailLabel: 'อีเมล',
          emailPlaceholder: 'กรุณากรอกอีเมล',
          messageLabel: 'ข้อความ',
          messagePlaceholder: 'กรุณาเขียนข้อความที่ต้องการติดต่อ',
          addressLabel: 'ที่อยู่',
          phoneLabel: 'โทรศัพท์',
          businessHoursLabel: 'เวลาทำการ'
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
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-stats', 'hero-split', 'hero-cards', 'hero-minimal', 'hero-fullscreen'],
        defaultVariant: 'hero-stats',
        randomSelection: false,
        constraints: {
          businessType: ['healthcare', 'medical', 'clinic', 'hospital'],
          tone: ['professional', 'trustworthy', 'reliable', 'medical']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-timeline', 'about-story', 'about-values'],
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
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-split',
        randomSelection: true,
        constraints: {
          businessType: ['healthcare', 'medical', 'clinic', 'hospital'],
          tone: ['professional', 'trustworthy', 'reliable', 'minimal', 'modern', 'luxury', 'casual']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-sidebar', 'navbar-minimal', 'navbar-mega', 'navbar-sticky'],
        defaultVariant: 'navbar-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['healthcare', 'medical', 'clinic', 'hospital'],
          tone: ['professional', 'trustworthy', 'reliable', 'medical', 'clean']
        }
      }
    }
  },
];

