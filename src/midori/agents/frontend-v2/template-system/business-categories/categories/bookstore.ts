import { BusinessCategoryManifest } from "../index";

// Book Store Business Category
export const bookstoreCategories: BusinessCategoryManifest[] = [
  {
    id: 'bookstore',
    name: 'Book Store',
    description: 'Book stores and online book retailers',
    keywords: ['book', 'books', 'bookstore', 'library', 'reading', 'novel', 'textbook', 'magazine', 'ebook', 'publisher', 'author', 'literature', 'education', 'knowledge', 'ร้านหนังสือ', 'หนังสือ', 'อ่าน', 'นิยาย', 'ตำรา', 'นิตยสาร', 'อีบุ๊ค'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'หนังสือ', href: '/menu' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        required: true,
        customizations: {
          badge: 'ร้านหนังสือคุณภาพ',
          heading: 'ค้นพบโลกแห่งความรู้และจินตนาการ',
          subheading: 'หนังสือหลากหลายประเภท ราคาเป็นมิตร พร้อมบริการส่งถึงบ้าน',
          ctaLabel: 'ดูหนังสือ',
          secondaryCta: 'ค้นหาหนังสือ'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับร้านหนังสือของเรา',
          description: 'เราเป็นร้านหนังสือที่ให้บริการหนังสือหลากหลายประเภท ราคาเป็นมิตร',
          features: [
            { title: 'หนังสือหลากหลาย', description: 'หนังสือทุกประเภททุกวัย' },
            { title: 'ราคาเป็นมิตร', description: 'ราคาที่เหมาะสม' },
            { title: 'บริการส่งถึงบ้าน', description: 'ส่งถึงบ้านทั่วประเทศ' }
          ],
          stats: [
            { number: '10,000+', label: 'หนังสือ' },
            { number: '5+', label: 'ปีประสบการณ์' },
            { number: '99%', label: 'ความพึงพอใจ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'หนังสือแนะนำ',
          menuItems: [
            { name: 'นิยายไทย', price: '250', description: 'นิยายไทยคลาสสิกและร่วมสมัย' },
            { name: 'นิยายต่างประเทศ', price: '350', description: 'นิยายแปลจากต่างประเทศ' },
            { name: 'หนังสือเด็ก', price: '150', description: 'หนังสือภาพและนิทานสำหรับเด็ก' },
            { name: 'ตำราเรียน', price: '450', description: 'ตำราเรียนและหนังสือวิชาการ' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อสั่งซื้อหนังสือ',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@bookstore.com',
          businessHours: 'จันทร์-อาทิตย์ 9:00-21:00',
          contactFormTitle: 'สั่งซื้อหนังสือ',
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
          companyName: 'ร้านหนังสือคุณภาพ',
          description: 'ร้านหนังสือที่ให้บริการหนังสือหลากหลายประเภท',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'หนังสือ', href: '/menu' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@bookstore.com'
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
        primary: 'brown',
        secondary: 'orange',
        bgTone: '50'
      },
      tokens: {
        radius: '6px',
        spacing: '1rem'
      },
      tone: 'warm',
      reasoning: 'Brown represents books and knowledge, orange adds warmth and friendliness'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Bookstore badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Bookstore main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Bookstore description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูหนังสือ", "Browse Books")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ค้นหาหนังสือ", "Search Books")' 
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
          businessType: ['bookstore', 'library', 'education'],
          tone: ['warm', 'friendly', 'cozy', 'intellectual']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team', 'about-timeline'],
        defaultVariant: 'about-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['bookstore', 'library'],
          tone: ['warm', 'friendly', 'intellectual']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-centered',
        randomSelection: false,
        constraints: {
          businessType: ['bookstore', 'library'],
          tone: ['warm', 'friendly', 'accessible']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-list',
        randomSelection: false,
        constraints: {
          businessType: ['bookstore', 'library'],
          tone: ['organized', 'intellectual', 'cozy']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-minimal',
        randomSelection: true,
        constraints: {
          businessType: ['bookstore', 'library', 'education'],
          tone: ['warm', 'friendly', 'cozy', 'intellectual']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-minimal', 'navbar-sticky'],
        defaultVariant: 'navbar-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['bookstore', 'library', 'education'],
          tone: ['warm', 'friendly', 'cozy', 'intellectual']
        }
      }
    }
  }
];
