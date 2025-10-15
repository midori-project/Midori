import { BusinessCategoryManifest } from "../index";

// E-commerce Business Category
export const ecommerceCategories: BusinessCategoryManifest[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online store and e-commerce websites',
    keywords: ['shop', 'store', 'buy', 'sell', 'ecommerce', 'shopping', 'products', 'ขายหนังสือ', 'หนังสือ', 'ร้านหนังสือ', 'bookstore', 'ร้านค้า', 'ขายสินค้า', 'ออนไลน์', 'ช้อปปิ้ง', 'สินค้า', 'ร้านขายของ', 'flower', 'flowers', 'ดอกไม้', 'ร้านดอกไม้', 'flower shop', 'florist'],
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
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-stats', 'hero-split', 'hero-cards'],
        defaultVariant: 'hero-stats',
        randomSelection: false,
        constraints: {
          businessType: ['ecommerce', 'retail', 'online-store'],
          tone: ['professional', 'trustworthy', 'modern']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-timeline'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['ecommerce', 'retail'],
          tone: ['professional', 'trustworthy']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-mega',
        randomSelection: false,
        constraints: {
          businessType: ['ecommerce', 'retail'],
          tone: ['professional', 'comprehensive']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-masonry',
        randomSelection: false,
        constraints: {
          businessType: ['ecommerce', 'retail'],
          tone: ['professional', 'organized']
        }
      }
    }
  }
];

