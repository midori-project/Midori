import { BusinessCategoryManifest } from "../index";

// Healthcare Business Categories
export const healthcareCategories: BusinessCategoryManifest[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical and healthcare websites',
    keywords: ['healthcare', 'medical', 'doctor', 'hospital', 'clinic', 'health', 'medicine', 'สุขภาพ', 'แพทย์', 'โรงพยาบาล', 'คลินิก', 'การแพทย์'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'บริการ', href: '/services' },
            { label: 'แพทย์', href: '/doctors' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-stats',
        required: true,
        customizations: {
          badge: 'บริการทางการแพทย์',
          heading: 'ดูแลสุขภาพคุณด้วยความใส่ใจ',
          subheading: 'เราให้บริการทางการแพทย์ที่ครบวงจร ด้วยทีมแพทย์ผู้เชี่ยวชาญและเทคโนโลยีที่ทันสมัย',
          ctaLabel: 'นัดหมาย',
          secondaryCta: 'ดูบริการ',
          stat1: '20+',
          stat1Label: 'ปีประสบการณ์',
          stat2: '1000+',
          stat2Label: 'ผู้ป่วย',
          stat3: '24/7',
          stat3Label: 'บริการ'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับเรา',
          description: 'เราเป็นโรงพยาบาลที่ให้บริการทางการแพทย์ที่ครบวงจร ด้วยทีมแพทย์ผู้เชี่ยวชาญและเทคโนโลยีที่ทันสมัย',
          features: [
            { title: 'ทีมแพทย์ผู้เชี่ยวชาญ', description: 'แพทย์ที่มีประสบการณ์สูง' },
            { title: 'เทคโนโลยีทันสมัย', description: 'อุปกรณ์ทางการแพทย์ล่าสุด' },
            { title: 'บริการ 24 ชั่วโมง', description: 'พร้อมให้บริการตลอดเวลา' }
          ],
          stats: [
            { number: '20+', label: 'ปีประสบการณ์' },
            { number: '1000+', label: 'ผู้ป่วย' },
            { number: '24/7', label: 'บริการ' },
            { number: '5★', label: 'ความพึงพอใจ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'บริการของเรา',
          menuItems: [
            { name: 'ตรวจสุขภาพ', price: '1,500', description: 'การตรวจสุขภาพประจำปี' },
            { name: 'ตรวจโรคเฉพาะทาง', price: '2,500', description: 'การตรวจโรคเฉพาะทาง' },
            { name: 'การผ่าตัด', price: '15,000', description: 'การผ่าตัดทั่วไป' },
            { name: 'การรักษาฉุกเฉิน', price: '3,000', description: 'การรักษาฉุกเฉิน' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อเรา',
          subtitle: 'พร้อมให้บริการตลอด 24 ชั่วโมง',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@hospital.com',
          businessHours: 'จันทร์-อาทิตย์ 24 ชั่วโมง'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'โรงพยาบาลสุขภาพดี',
          description: 'โรงพยาบาลที่ให้บริการทางการแพทย์ที่ครบวงจร',
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
          email: 'info@hospital.com'
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
        radius: '6px',
        spacing: '1rem'
      },
      tone: 'professional',
      reasoning: 'Green conveys health and trust, essential for healthcare'
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
            description: 'Primary CTA (e.g., "นัดหมาย", "ติดต่อ")'
          },
          secondaryCta: {
            required: true,
            maxLength: 24,
            description: 'Secondary CTA (e.g., "ดูบริการ", "ข้อมูล")'
          }
        }
      }
    }
  }
];