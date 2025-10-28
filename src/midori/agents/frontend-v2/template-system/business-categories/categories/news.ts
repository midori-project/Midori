import { BusinessCategoryManifest } from "../index";

// News Business Category
export const newsCategories: BusinessCategoryManifest[] = [
  {
    id: 'news',
    name: 'News',
    description: 'News websites and media outlets',
    keywords: ['news', 'media', 'newspaper', 'journalism', 'article', 'report', 'breaking', 'update', 'information', 'press', 'broadcast', 'ข่าว', 'สื่อ', 'หนังสือพิมพ์', 'วารสาร', 'รายงาน', 'ข้อมูล', 'อัพเดท'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'ข่าว', href: '/menu' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        required: true,
        customizations: {
          badge: 'ข่าวสาร',
          heading: 'ข่าวสารที่ทันสมัยและเชื่อถือได้',
          subheading: 'นำเสนอข่าวสารที่ถูกต้อง ครบถ้วน และทันสมัย เพื่อให้คุณได้รับข้อมูลที่เชื่อถือได้',
          ctaLabel: 'อ่านข่าว',
          secondaryCta: 'ติดตามเรา'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับเรา',
          description: 'เราเป็นสื่อข่าวที่ให้บริการข่าวสารที่ถูกต้อง ครบถ้วน และทันสมัย',
          features: [
            { title: 'ข่าวทันสมัย', description: 'ข่าวสารที่อัพเดทตลอดเวลา' },
            { title: 'ข้อมูลถูกต้อง', description: 'ตรวจสอบข้อมูลอย่างละเอียด' },
            { title: 'ครอบคลุมทุกด้าน', description: 'ข่าวสารทุกประเภท' }
          ],
          stats: [
            { number: '1,000+', label: 'ข่าวต่อวัน' },
            { number: '10+', label: 'ปีประสบการณ์' },
            { number: '1M+', label: 'ผู้อ่าน' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'ข่าวล่าสุด',
          menuItems: [
            { name: 'ข่าวการเมือง', price: 'ฟรี', description: 'ข่าวการเมืองและนโยบายรัฐบาล' },
            { name: 'ข่าวเศรษฐกิจ', price: 'ฟรี', description: 'ข่าวเศรษฐกิจและการเงิน' },
            { name: 'ข่าวกีฬา', price: 'ฟรี', description: 'ข่าวกีฬาและผลการแข่งขัน' },
            { name: 'ข่าวบันเทิง', price: 'ฟรี', description: 'ข่าวบันเทิงและดารา' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อส่งข่าว',
          subtitle: 'พร้อมรับข่าวสารทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'news@news.com',
          businessHours: '24 ชั่วโมง',
          contactFormTitle: 'ส่งข่าวสาร',
          contactFormCta: 'ส่งข่าว',
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
          companyName: 'สื่อข่าวคุณภาพ',
          description: 'สื่อข่าวที่ให้บริการข่าวสารที่ถูกต้องและทันสมัย',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
            { name: 'YouTube', url: 'https://youtube.com', icon: '📺' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'ข่าว', href: '/menu' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@news.com'
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
        primary: 'red',
        secondary: 'blue',
        bgTone: '50'
      },
      tokens: {
        radius: '4px',
        spacing: '1rem'
      },
      tone: 'professional',
      reasoning: 'Red represents urgency and breaking news, blue represents trust and reliability'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'News badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'News main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'News description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "อ่านข่าว", "Read News")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ติดตามเรา", "Follow Us")' 
          }
        }
      }
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-minimal', 'hero-split', 'hero-fullscreen'],
        defaultVariant: 'hero-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['news', 'media', 'journalism'],
          tone: ['professional', 'serious', 'modern', 'urgent']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team', 'about-timeline'],
        defaultVariant: 'about-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['news', 'media'],
          tone: ['professional', 'serious', 'trustworthy']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-mega',
        randomSelection: false,
        constraints: {
          businessType: ['news', 'media'],
          tone: ['professional', 'comprehensive', 'serious']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-list',
        randomSelection: false,
        constraints: {
          businessType: ['news', 'media'],
          tone: ['professional', 'organized', 'serious']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-minimal',
        randomSelection: true,
        constraints: {
          businessType: ['news', 'media', 'journalism'],
          tone: ['professional', 'serious', 'modern', 'urgent']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-minimal', 'navbar-sticky'],
        defaultVariant: 'navbar-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['news', 'media', 'journalism'],
          tone: ['professional', 'serious', 'clean', 'modern']
        }
      }
    }
  }
];
