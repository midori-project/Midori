import { BusinessCategoryManifest } from "../index";

// Restaurant Business Category - Unified with flexible styling
export const restaurantCategories: BusinessCategoryManifest[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Restaurant and food service websites with flexible styling',
    keywords: ['restaurant', 'restuarant', 'food', 'dining', 'cafe', 'bistro', 'menu', 'reservation', 'ร้านอาหาร', 'อาหาร', 'หมูย่าง', 'หมูกรอบ', 'ขายอาหาร', 'ร้านขายอาหาร', 'ภัตตาคาร', 'คาเฟ่', 'ร้านกาแฟ'],
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
        variantId: 'hero-stats', // Will be managed by variantPools
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
        variantId: 'about-split', // Will be managed by variantPools
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
        variantId: 'menu-list', // Will be managed by variantPools
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
          businessHours: 'จันทร์-อาทิตย์ 10:00-22:00',
          contactFormTitle: 'จองโต๊ะหรือสอบถาม',
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
        variantId: 'footer-centered', // Will be managed by variantPools
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
    },
    variantPools: {
      'hero-basic': {
        allowedVariants: ['hero-stats', 'hero-split', 'hero-fullscreen', 'hero-cards', 'hero-minimal'],
        defaultVariant: 'hero-stats',
        randomSelection: true, // 🎲 Random selection for variety
        constraints: {
          businessType: ['restaurant', 'food-service', 'dining'],
          tone: ['warm', 'inviting', 'appetizing', 'minimal', 'modern', 'luxury', 'casual']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-timeline', 'about-minimal', 'about-team'],
        defaultVariant: 'about-values',
        randomSelection: false, // 🎲 Random selection for variety
        constraints: {
          businessType: ['restaurant', 'food-service'],
          tone: ['warm', 'friendly', 'authentic', 'minimal', 'modern', 'luxury', 'casual']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-centered',
        randomSelection: true, // 🎲 Random selection for variety
        constraints: {
          businessType: ['restaurant', 'food-service'],
          tone: ['warm', 'friendly', 'minimal', 'modern', 'luxury', 'casual']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-list',
        randomSelection: true, // 🎲 Random selection for variety
        constraints: {
          businessType: ['restaurant', 'food-service'],
          tone: ['appetizing', 'organized', 'clear', 'minimal', 'modern', 'luxury', 'casual']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-split',
        randomSelection: true, // 🎲 Random selection for variety
        constraints: {
          businessType: ['restaurant', 'food-service'],
          tone: ['warm', 'friendly', 'professional', 'minimal', 'modern', 'luxury', 'casual']
        }
      }
    }
  }
  // Removed duplicate restaurant categories - now handled by variant pools
  // restaurant-modern, restaurant-luxury, restaurant-minimal, restaurant-casual
  // are now handled by the main 'restaurant' category with flexible variantPools
];