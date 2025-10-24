import { BusinessCategoryManifest } from "../index";

// Hotel Business Category
export const hotelCategories: BusinessCategoryManifest[] = [
  {
    id: 'hotel',
    name: 'Hotel',
    description: 'Hotel and accommodation booking websites',
    keywords: ['hotel', 'accommodation', 'booking', 'resort', 'hostel', 'motel', 'inn', 'lodging', 'stay', 'vacation', 'travel', 'tourism', 'โรงแรม', 'ที่พัก', 'จองห้องพัก', 'รีสอร์ท', 'โฮสเทล'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'ห้องพัก', href: '/menu' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        required: true,
        customizations: {
          badge: 'โรงแรมหรู',
          heading: 'ประสบการณ์การพักผ่อนที่สมบูรณ์แบบ',
          subheading: 'ห้องพักสวยงาม บริการครบครัน พร้อมให้บริการด้วยมาตรฐานสากล',
          ctaLabel: 'จองห้องพัก',
          secondaryCta: 'ดูห้องพัก'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับโรงแรมของเรา',
          description: 'เราเป็นโรงแรมที่ให้บริการที่พักด้วยมาตรฐานสากล พร้อมสิ่งอำนวยความสะดวกครบครัน',
          features: [
            { title: 'ห้องพักสวยงาม', description: 'ตกแต่งอย่างหรูหรา' },
            { title: 'บริการครบครัน', description: 'สิ่งอำนวยความสะดวกครบครัน' },
            { title: 'ที่ตั้งดีเยี่ยม', description: 'ใกล้สถานที่สำคัญ' }
          ],
          stats: [
            { number: '100+', label: 'ห้องพัก' },
            { number: '4.8', label: 'คะแนนรีวิว' },
            { number: '24/7', label: 'บริการ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'ห้องพักของเรา',
          menuItems: [
            { name: 'ห้องเดลักซ์', price: '2,500', description: 'ห้องพักสวยงามพร้อมวิวสวย' },
            { name: 'ห้องสวีท', price: '4,500', description: 'ห้องพักหรูหราพร้อมสิ่งอำนวยความสะดวก' },
            { name: 'ห้องครอบครัว', price: '3,500', description: 'เหมาะสำหรับครอบครัว' },
            { name: 'ห้องพรีเมียม', price: '6,000', description: 'ห้องพักระดับพรีเมียม' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อจองห้องพัก',
          subtitle: 'พร้อมให้บริการทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'reservation@hotel.com',
          businessHours: '24 ชั่วโมง',
          contactFormTitle: 'จองห้องพัก',
          contactFormCta: 'ส่งคำขอจอง',
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
          companyName: 'โรงแรมหรูหรา',
          description: 'โรงแรมที่ให้บริการที่พักด้วยมาตรฐานสากล',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'Instagram', url: 'https://instagram.com', icon: '📷' },
            { name: 'TripAdvisor', url: 'https://tripadvisor.com', icon: '🗺️' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'ห้องพัก', href: '/menu' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@hotel.com'
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
        secondary: 'gold',
        bgTone: '50'
      },
      tokens: {
        radius: '8px',
        spacing: '1rem'
      },
      tone: 'luxury',
      reasoning: 'Blue conveys trust and professionalism, gold adds luxury feel'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Hotel badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Hotel main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Hotel description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "จองห้องพัก", "Book Now")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ดูห้องพัก", "View Rooms")' 
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
          businessType: ['hotel', 'accommodation', 'resort'],
          tone: ['luxury', 'professional', 'modern', 'elegant']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team', 'about-timeline'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['hotel', 'accommodation'],
          tone: ['professional', 'luxury', 'trustworthy']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-mega',
        randomSelection: false,
        constraints: {
          businessType: ['hotel', 'accommodation'],
          tone: ['professional', 'luxury', 'comprehensive']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-masonry',
        randomSelection: false,
        constraints: {
          businessType: ['hotel', 'accommodation'],
          tone: ['luxury', 'organized', 'showcase']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-split',
        randomSelection: true,
        constraints: {
          businessType: ['hotel', 'accommodation', 'resort'],
          tone: ['professional', 'luxury', 'modern', 'elegant']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-minimal', 'navbar-sticky'],
        defaultVariant: 'navbar-transparent',
        randomSelection: false,
        constraints: {
          businessType: ['hotel', 'accommodation', 'resort'],
          tone: ['luxury', 'professional', 'elegant', 'modern']
        }
      }
    }
  }
];
