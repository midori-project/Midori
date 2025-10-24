import { BusinessCategoryManifest } from "../index";

// Bakery Business Category
export const bakeryCategories: BusinessCategoryManifest[] = [
  {
    id: 'bakery',
    name: 'Bakery',
    description: 'Bakery and pastry shops',
    keywords: ['bakery', 'bread', 'cake', 'pastry', 'dessert', 'sweet', 'baking', 'cookie', 'muffin', 'croissant', 'donut', 'pie', 'tart', 'ขนมปัง', 'เค้ก', 'ขนม', 'เบเกอรี่', 'ของหวาน', 'อบ', 'คุกกี้'],
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
        required: true,
        customizations: {
          badge: 'เบเกอรี่คุณภาพ',
          heading: 'ความหอมหวานที่อบสดใหม่ทุกวัน',
          subheading: 'ขนมปัง เค้ก และของหวานคุณภาพ อบสดใหม่ทุกวันด้วยความใส่ใจ',
          ctaLabel: 'ดูเมนู',
          secondaryCta: 'สั่งซื้อ'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับร้านเบเกอรี่ของเรา',
          description: 'เราเป็นร้านเบเกอรี่ที่ให้บริการขนมปัง เค้ก และของหวานคุณภาพ อบสดใหม่ทุกวัน',
          features: [
            { title: 'อบสดใหม่', description: 'อบสดใหม่ทุกวัน' },
            { title: 'คุณภาพดี', description: 'ใช้ส่วนผสมคุณภาพสูง' },
            { title: 'รสชาติดี', description: 'รสชาติที่อร่อยถูกใจ' }
          ],
          stats: [
            { number: '50+', label: 'เมนู' },
            { number: '3+', label: 'ปีประสบการณ์' },
            { number: '100%', label: 'ความพึงพอใจ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'เมนูเบเกอรี่',
          menuItems: [
            { name: 'ขนมปังฝรั่งเศส', price: '45', description: 'ขนมปังฝรั่งเศสกรอบนอกนุ่มใน' },
            { name: 'เค้กช็อคโกแลต', price: '120', description: 'เค้กช็อคโกแลตเข้มข้น' },
            { name: 'คุกกี้ช็อคโกแลต', price: '25', description: 'คุกกี้ช็อคโกแลตชิป' },
            { name: 'มัฟฟินบลูเบอร์รี่', price: '35', description: 'มัฟฟินบลูเบอร์รี่สด' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อสั่งซื้อ',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@bakery.com',
          businessHours: 'จันทร์-อาทิตย์ 6:00-20:00',
          contactFormTitle: 'สั่งซื้อเบเกอรี่',
          contactFormCta: 'ส่งคำสั่งซื้อ',
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
          companyName: 'ร้านเบเกอรี่คุณภาพ',
          description: 'ร้านเบเกอรี่ที่ให้บริการขนมปัง เค้ก และของหวานคุณภาพ',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'Line', url: 'https://line.me', icon: '💬' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เมนู', href: '/menu' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@bakery.com'
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
        secondary: 'yellow',
        bgTone: '50'
      },
      tokens: {
        radius: '12px',
        spacing: '1.25rem'
      },
      tone: 'warm',
      reasoning: 'Orange and yellow represent warmth, coziness, and delicious baked goods'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Bakery badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Bakery main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Bakery description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูเมนู", "View Menu")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "สั่งซื้อ", "Order Now")' 
          }
        }
      }
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-minimal', 'hero-split', 'hero-fullscreen'],
        defaultVariant: 'hero-split',
        randomSelection: false,
        constraints: {
          businessType: ['bakery', 'food', 'dessert'],
          tone: ['warm', 'cozy', 'friendly', 'delicious']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team', 'about-timeline'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['bakery', 'food'],
          tone: ['warm', 'friendly', 'cozy']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-centered',
        randomSelection: false,
        constraints: {
          businessType: ['bakery', 'food'],
          tone: ['warm', 'friendly', 'cozy']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-masonry',
        randomSelection: false,
        constraints: {
          businessType: ['bakery', 'food'],
          tone: ['warm', 'delicious', 'cozy']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-minimal',
        randomSelection: true,
        constraints: {
          businessType: ['bakery', 'food', 'dessert'],
          tone: ['warm', 'friendly', 'cozy', 'delicious']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-minimal', 'navbar-sticky'],
        defaultVariant: 'navbar-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['bakery', 'food', 'dessert'],
          tone: ['warm', 'friendly', 'cozy', 'delicious']
        }
      }
    }
  }
];
