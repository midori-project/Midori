import { BusinessCategoryManifest } from "../index";

// Restaurant Business Categories
export const restaurantCategories: BusinessCategoryManifest[] = [
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
    id: 'restaurant-modern',
    name: 'Restaurant Modern',
    description: 'Modern restaurant with contemporary design',
    keywords: ['restaurant', 'modern', 'contemporary', 'trendy', 'ร้านอาหารโมเดิร์น', 'ร้านอาหารทันสมัย', 'สมัยใหม่', 'ร้านอาหาร', 'food'],
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
        variantId: 'hero-split',
        required: true,
        customizations: {
          badge: 'ร้านอาหารสไตล์โมเดิร์น',
          heading: 'ความอร่อยที่ทันสมัย',
          subheading: 'สัมผัสประสบการณ์รับประทานอาหารแบบใหม่ที่ผสมผสานความทันสมัยเข้ากับรสชาติดั้งเดิม',
          ctaLabel: 'ดูเมนู',
          secondaryCta: 'จองโต๊ะ'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'เกี่ยวกับเรา',
          description: 'ร้านอาหารสไตล์โมเดิร์นที่นำเสนออาหารคุณภาพในบรรยากาศร่วมสมัย',
          features: [
            { title: 'อาหารสดใหม่', description: 'คัดสรรวัตถุดิบคุณภาพ' },
            { title: 'บรรยากาศทันสมัย', description: 'การตกแต่งโมเดิร์น' },
            { title: 'บริการมืออาชีพ', description: 'ทีมงานที่พร้อมบริการ' }
          ],
          stats: [
            { number: '10+', label: 'ปีประสบการณ์' },
            { number: '500+', label: 'ลูกค้าพึงพอใจ' },
            { number: '40+', label: 'เมนูหลากหลาย' },
            { number: '24/7', label: 'บริการส่ง' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'เมนูแนะนำ',
          menuItems: [
            { name: 'Fusion Pasta', price: '150', description: 'พาสต้าผสมผสานสไตล์ไทย' },
            { name: 'Modern Thai Salad', price: '120', description: 'สลัดไทยสไตล์โมเดิร์น' },
            { name: 'Signature Steak', price: '450', description: 'สเต็กเนื้อชั้นเลิศ' },
            { name: 'Contemporary Sushi', price: '280', description: 'ซูชิสไตล์ร่วมสมัย' }
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
          email: 'info@modern-restaurant.com',
          businessHours: 'จันทร์-อาทิตย์ 10:00-22:00'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'Modern Restaurant',
          description: 'ร้านอาหารสไตล์โมเดิร์น อาหารอร่อย บรรยากาศดี',
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
          email: 'info@modern-restaurant.com'
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
        secondary: 'indigo',
        bgTone: '50'
      },
      tokens: {
        radius: '12px',
        spacing: '1rem'
      },
      tone: 'modern',
      reasoning: 'Blue and indigo create a clean, modern, professional atmosphere'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { required: true, maxLength: 40, description: 'Modern restaurant badge' },
          heading: { required: true, maxLength: 80, description: 'Modern restaurant heading' },
          subheading: { required: true, maxLength: 160, description: 'Modern restaurant description' }
        }
      }
    }
  },
  {
    id: 'restaurant-luxury',
    name: 'Restaurant Luxury',
    description: 'Luxury fine dining restaurant',
    keywords: ['restaurant', 'luxury', 'fine dining', 'premium', 'elegant', 'ร้านอาหารหรูหรา', 'ไฟน์ไดนิ่ง', 'พรีเมียม', 'ร้านอาหาร'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'Home', href: '/' },
            { label: 'Menu', href: '/menu' },
            { label: 'Experience', href: '/about' },
            { label: 'Reservation', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-fullscreen',
        required: true,
        customizations: {
          badge: 'Fine Dining Excellence',
          heading: 'Luxury Redefined',
          subheading: 'Experience culinary artistry in an atmosphere of timeless elegance and sophistication',
          ctaLabel: 'Reserve Now',
          secondaryCta: 'View Menu'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'Our Story',
          description: 'An unparalleled fine dining experience where culinary excellence meets luxury',
          features: [
            { title: 'Michelin Quality', description: 'Award-winning cuisine' },
            { title: 'Elegant Ambiance', description: 'Sophisticated atmosphere' },
            { title: 'Exclusive Service', description: 'Personalized attention' }
          ],
          stats: [
            { number: '25+', label: 'Years of Excellence' },
            { number: '3', label: 'Michelin Stars' },
            { number: '100+', label: 'Premium Wines' },
            { number: '5★', label: 'Guest Rating' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        variantId: 'menu-carousel',
        required: true,
        customizations: {
          title: 'Signature Dishes',
          menuItems: [
            { name: 'Wagyu Beef Tataki', price: '1,200', description: 'Premium Japanese wagyu' },
            { name: 'Lobster Thermidor', price: '1,800', description: 'Fresh Canadian lobster' },
            { name: 'Truffle Risotto', price: '900', description: 'Black truffle from Italy' },
            { name: 'Sea Bass en Papillote', price: '1,100', description: 'Mediterranean sea bass' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'Reservations',
          subtitle: 'We look forward to welcoming you',
          address: '456 Luxury Avenue, Bangkok 10500',
          phone: '02-987-6543',
          email: 'reservations@luxury-restaurant.com',
          businessHours: 'Dinner: 18:00-23:00 (Closed Mondays)'
        }
      },
      {
        blockId: 'footer-basic',
        variantId: 'footer-mega',
        required: true,
        customizations: {
          companyName: 'Luxury Restaurant',
          description: 'Fine dining excellence since 2010',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' }
          ],
          quickLinks: [
            { label: 'Home', href: '/' },
            { label: 'Menu', href: '/menu' },
            { label: 'Experience', href: '/about' },
            { label: 'Reservation', href: '/contact' }
          ],
          address: '456 Luxury Avenue, Bangkok 10500',
          phone: '02-987-6543',
          email: 'reservations@luxury-restaurant.com'
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
        primary: 'gray',
        secondary: 'amber',
        bgTone: '900'
      },
      tokens: {
        radius: '4px',
        spacing: '1.25rem'
      },
      tone: 'luxury',
      reasoning: 'Dark gray and gold amber create sophisticated, premium, luxury atmosphere'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { required: true, maxLength: 40, description: 'Luxury restaurant badge' },
          heading: { required: true, maxLength: 80, description: 'Luxury restaurant heading' },
          subheading: { required: true, maxLength: 160, description: 'Luxury restaurant description' }
        }
      }
    }
  },
  {
    id: 'restaurant-minimal',
    name: 'Restaurant Minimal',
    description: 'Minimalist restaurant with clean design',
    keywords: ['restaurant', 'minimal', 'simple', 'clean', 'minimalist', 'ร้านอาหารมินิมอล', 'เรียบง่าย', 'สะอาดตา', 'ร้านอาหาร'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เมนู', href: '/menu' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-minimal',
        required: true,
        customizations: {
          badge: 'Simple & Delicious',
          heading: 'Pure Taste',
          subheading: 'ความเรียบง่ายที่เต็มไปด้วยรสชาติแท้จริงของอาหาร',
          ctaLabel: 'ดูเมนู',
          secondaryCta: 'เรียนรู้เพิ่มเติม'
        }
      },
      {
        blockId: 'about-basic',
        required: false,
        customizations: {
          title: 'เกี่ยวกับเรา',
          description: 'ความเรียบง่ายที่ซ่อนความอร่อยไว้ในทุกจาน',
          features: [
            { title: 'วัตถุดิบคุณภาพ', description: 'คัดสรรอย่างพิถีพิถัน' },
            { title: 'ปรุงสดใหม่', description: 'ทำสดทุกออเดอร์' },
            { title: 'รสชาติแท้จริง', description: 'ไม่ปรุงแต่งเกินไป' }
          ],
          stats: [
            { number: '5+', label: 'ปีประสบการณ์' },
            { number: '200+', label: 'ลูกค้าประจำ' },
            { number: '15+', label: 'เมนูคุณภาพ' },
            { number: '100%', label: 'วัตถุดิบธรรมชาติ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'เมนู',
          menuItems: [
            { name: 'ข้าวผัด', price: '80', description: 'ข้าวผัดรสชาติต้นตำรับ' },
            { name: 'ผัดไทย', price: '70', description: 'ผัดไทยแท้' },
            { name: 'ต้มยำ', price: '120', description: 'ต้มยำกุ้งรสจัดจ้าน' },
            { name: 'แกงเขียวหวาน', price: '90', description: 'แกงเขียวหวานหอมกะทิ' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'ติดต่อ',
          subtitle: 'ยินดีต้อนรับ',
          address: '789 ถนนสาทร กรุงเทพฯ 10120',
          phone: '02-456-7890',
          email: 'hello@minimal-restaurant.com',
          businessHours: 'ทุกวัน 11:00-21:00'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'Minimal Restaurant',
          description: 'ความเรียบง่าย ความอร่อยแท้จริง',
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
          address: '789 ถนนสาทร กรุงเทพฯ 10120',
          phone: '02-456-7890',
          email: 'hello@minimal-restaurant.com'
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
        primary: 'gray',
        secondary: 'stone',
        bgTone: '100'
      },
      tokens: {
        radius: '4px',
        spacing: '1rem'
      },
      tone: 'minimal',
      reasoning: 'Neutral gray tones create clean, minimal, focused atmosphere'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { required: true, maxLength: 40, description: 'Minimal restaurant badge' },
          heading: { required: true, maxLength: 80, description: 'Minimal restaurant heading' },
          subheading: { required: true, maxLength: 160, description: 'Minimal restaurant description' }
        }
      }
    }
  },
  {
    id: 'restaurant-casual',
    name: 'Restaurant Casual',
    description: 'Casual dining restaurant with friendly atmosphere',
    keywords: ['restaurant', 'casual', 'friendly', 'family', 'cozy', 'ร้านอาหารสบายๆ', 'แคชชวล', 'เป็นกันเอง', 'ร้านอาหาร'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เมนู', href: '/menu' },
            { label: 'โปรโมชั่น', href: '/promotions' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        variantId: 'hero-cards',
        required: true,
        customizations: {
          badge: 'ร้านอาหารสบายๆ',
          heading: 'อาหารอร่อย บรรยากาศเป็นกันเอง',
          subheading: 'มาทานอาหารกับครอบครัวและเพื่อนฝูงในบรรยากาศที่อบอุ่น',
          ctaLabel: 'ดูเมนู',
          secondaryCta: 'โปรโมชั่น',
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
          title: 'เกี่ยวกับเรา',
          description: 'ร้านอาหารที่เหมาะสำหรับทุกคนในครอบครัว',
          features: [
            { title: 'บรรยากาศอบอุ่น', description: 'เหมาะกับครอบครัว' },
            { title: 'ราคาย่อมเยา', description: 'คุ้มค่าทุกเมนู' },
            { title: 'บริการเป็นมิตร', description: 'ยิ้มแย้มแจ่มใส' }
          ],
          stats: [
            { number: '15+', label: 'ปีประสบการณ์' },
            { number: '1000+', label: 'ลูกค้าพึงพอใจ' },
            { number: '50+', label: 'เมนูหลากหลาย' },
            { number: '4.8★', label: 'คะแนนรีวิว' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'เมนูยอดนิยม',
          menuItems: [
            { name: 'ข้าวมันไก่', price: '60', description: 'ข้าวมันไก่ไหหลำ' },
            { name: 'ก๋วยเตี๋ยว', price: '50', description: 'ก๋วยเตี๋ยวหมูน้ำตก' },
            { name: 'ข้าวขาหมู', price: '70', description: 'ข้าวขาหมูตุ๋นเปื่อย' },
            { name: 'ผัดกะเพรา', price: '55', description: 'ผัดกะเพราไก่สับ' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: false,
        customizations: {
          title: 'ติดต่อเรา',
          subtitle: 'เปิดทุกวัน',
          address: '321 ถนนพระราม 4 กรุงเทพฯ 10110',
          phone: '02-234-5678',
          email: 'info@casual-restaurant.com',
          businessHours: 'จันทร์-อาทิตย์ 10:00-22:00'
        }
      },
      {
        blockId: 'footer-basic',
        required: true,
        customizations: {
          companyName: 'Casual Restaurant',
          description: 'ร้านอาหารสบายๆ อาหารอร่อย ราคาเป็นมิตร',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'Line', url: 'https://line.me', icon: '💬' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เมนู', href: '/menu' },
            { label: 'โปรโมชั่น', href: '/promotions' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '321 ถนนพระราม 4 กรุงเทพฯ 10110',
          phone: '02-234-5678',
          email: 'info@casual-restaurant.com'
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
        bgTone: '100'
      },
      tokens: {
        radius: '8px',
        spacing: '1rem'
      },
      tone: 'warm',
      reasoning: 'Orange and yellow create warm, friendly, inviting atmosphere'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { required: true, maxLength: 40, description: 'Casual restaurant badge' },
          heading: { required: true, maxLength: 80, description: 'Casual restaurant heading' },
          subheading: { required: true, maxLength: 160, description: 'Casual restaurant description' },
          stat1: { required: true, maxLength: 20, description: 'First stat' },
          stat1Label: { required: true, maxLength: 40, description: 'First stat label' },
          stat2: { required: true, maxLength: 20, description: 'Second stat' },
          stat2Label: { required: true, maxLength: 40, description: 'Second stat label' },
          stat3: { required: true, maxLength: 20, description: 'Third stat' },
          stat3Label: { required: true, maxLength: 40, description: 'Third stat label' }
        }
      }
    }
  }
];

