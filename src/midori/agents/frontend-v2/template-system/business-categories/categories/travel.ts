import { BusinessCategoryManifest } from "../index";

// Travel Business Category
export const travelCategories: BusinessCategoryManifest[] = [
  {
    id: 'travel',
    name: 'Travel',
    description: 'Travel agency and tourism websites',
    keywords: ['travel', 'tourism', 'vacation', 'trip', 'journey', 'adventure', 'explore', 'tour', 'agency', 'destination', 'holiday', 'backpack', 'cruise', 'ท่องเที่ยว', 'เที่ยว', 'ทัวร์', 'เอเจนซี่', 'วันหยุด', 'ผจญภัย'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'แพ็กเกจ', href: '/menu' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        required: true,
        customizations: {
          badge: 'ท่องเที่ยว',
          heading: 'เปิดโลกใหม่ด้วยการเดินทาง',
          subheading: 'แพ็กเกจท่องเที่ยวคุณภาพ พร้อมไกด์มืออาชีพ และประสบการณ์ที่ไม่มีวันลืม',
          ctaLabel: 'ดูแพ็กเกจ',
          secondaryCta: 'ติดต่อสอบถาม'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับเรา',
          description: 'เราเป็นเอเจนซี่ท่องเที่ยวที่ให้บริการแพ็กเกจท่องเที่ยวคุณภาพ พร้อมไกด์มืออาชีพ',
          features: [
            { title: 'แพ็กเกจคุณภาพ', description: 'แพ็กเกจท่องเที่ยวที่คัดสรรแล้ว' },
            { title: 'ไกด์มืออาชีพ', description: 'ไกด์ที่มีประสบการณ์' },
            { title: 'ราคาเหมาะสม', description: 'ราคาที่คุ้มค่า' }
          ],
          stats: [
            { number: '500+', label: 'แพ็กเกจ' },
            { number: '10+', label: 'ปีประสบการณ์' },
            { number: '98%', label: 'ความพึงพอใจ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'แพ็กเกจท่องเที่ยว',
          menuItems: [
            { name: 'เที่ยวญี่ปุ่น', price: '25,000', description: 'เที่ยวโตเกียว เกียวโต 5 วัน 4 คืน' },
            { name: 'เที่ยวเกาหลี', price: '18,000', description: 'เที่ยวโซล 4 วัน 3 คืน' },
            { name: 'เที่ยวยุโรป', price: '80,000', description: 'เที่ยวฝรั่งเศส อิตาลี 10 วัน 9 คืน' },
            { name: 'เที่ยวในประเทศ', price: '8,000', description: 'เที่ยวเชียงใหม่ 3 วัน 2 คืน' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อสอบถามแพ็กเกจ',
          subtitle: 'พร้อมให้คำปรึกษาทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@travel.com',
          businessHours: 'จันทร์-ศุกร์ 9:00-18:00',
          contactFormTitle: 'สอบถามแพ็กเกจ',
          contactFormCta: 'ส่งคำถาม',
          contactFormDescription: 'กรุณากรอกข้อมูลด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด',
          contactInfoTitle: 'ข้อมูลติดต่อ',
          contactInfoDescription: 'เราพร้อมให้คำปรึกษาและตอบคำถามทุกข้อสงสัย',
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
          companyName: 'เอเจนซี่ท่องเที่ยว',
          description: 'เอเจนซี่ท่องเที่ยวที่ให้บริการแพ็กเกจคุณภาพ',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'YouTube', url: 'https://youtube.com', icon: '📺' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'แพ็กเกจ', href: '/menu' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@travel.com'
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
        radius: '12px',
        spacing: '1.25rem'
      },
      tone: 'adventure',
      reasoning: 'Green represents nature and adventure, blue represents sky and ocean'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Travel badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Travel main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Travel description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูแพ็กเกจ", "View Packages")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ติดต่อสอบถาม", "Contact Us")' 
          }
        }
      }
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-minimal', 'hero-split', 'hero-fullscreen'],
        defaultVariant: 'hero-fullscreen',
        randomSelection: false,
        constraints: {
          businessType: ['travel', 'tourism', 'adventure'],
          tone: ['adventure', 'exciting', 'modern', 'dynamic']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team', 'about-timeline'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['travel', 'tourism'],
          tone: ['adventure', 'friendly', 'professional']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-centered',
        randomSelection: false,
        constraints: {
          businessType: ['travel', 'tourism'],
          tone: ['friendly', 'adventure', 'accessible']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-carousel',
        randomSelection: false,
        constraints: {
          businessType: ['travel', 'tourism'],
          tone: ['adventure', 'exciting', 'showcase']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-split',
        randomSelection: true,
        constraints: {
          businessType: ['travel', 'tourism', 'adventure'],
          tone: ['friendly', 'adventure', 'modern', 'casual']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-minimal', 'navbar-sticky'],
        defaultVariant: 'navbar-transparent',
        randomSelection: false,
        constraints: {
          businessType: ['travel', 'tourism', 'adventure'],
          tone: ['adventure', 'friendly', 'modern', 'dynamic']
        }
      }
    }
  }
];
