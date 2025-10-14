import { BusinessCategoryManifest } from "../index";

// Portfolio Business Categories
export const portfolioCategories: BusinessCategoryManifest[] = [
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio and creative showcase websites',
    keywords: ['portfolio', 'creative', 'designer', 'developer', 'work', 'projects', 'personal', 'showcase', 'freelancer', 'creative work', 'design portfolio', 'developer portfolio', 'artist portfolio'],
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
          badge: 'Portfolio',
          heading: 'สวัสดี ฉันคือ [ชื่อ]',
          subheading: 'นักพัฒนาเว็บไซต์ที่มีประสบการณ์ในการสร้างเว็บไซต์ที่สวยงามและใช้งานง่าย',
          ctaLabel: 'ดูผลงาน',
          secondaryCta: 'ติดต่อฉัน'
        }
      },
      {
        blockId: 'about-basic',
        variantId: 'about-minimal',
        required: false,
        customizations: {
          title: 'เกี่ยวกับฉัน',
          description: 'ฉันเป็นนักพัฒนาเว็บไซต์ที่มีประสบการณ์ในการสร้างเว็บไซต์ที่สวยงามและใช้งานง่าย',
          features: [
            { title: 'Frontend Development', description: 'React, Vue, Angular' },
            { title: 'Backend Development', description: 'Node.js, Python, PHP' },
            { title: 'UI/UX Design', description: 'Figma, Adobe XD' }
          ],
          stats: [
            { number: '50+', label: 'โปรเจกต์' },
            { number: '3+', label: 'ปีประสบการณ์' },
            { number: '100%', label: 'ความพึงพอใจ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        variantId: 'menu-carousel',
        required: true,
        customizations: {
          title: 'ผลงานของฉัน',
          menuItems: [
            { name: 'E-commerce Website', price: 'Completed', description: 'เว็บไซต์ขายของออนไลน์' },
            { name: 'Restaurant Website', price: 'Completed', description: 'เว็บไซต์ร้านอาหาร' },
            { name: 'Portfolio Website', price: 'Completed', description: 'เว็บไซต์แสดงผลงาน' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อฉัน',
          subtitle: 'พร้อมรับงานใหม่',
          address: 'กรุงเทพฯ, ประเทศไทย',
          phone: '081-234-5678',
          email: 'hello@portfolio.com',
          businessHours: 'จันทร์-ศุกร์ 9:00-18:00'
        }
      },
      {
        blockId: 'footer-basic',
        variantId: 'footer-minimal',
        required: true,
        customizations: {
          companyName: 'Portfolio',
          description: 'นักพัฒนาเว็บไซต์ที่มีประสบการณ์',
          socialLinks: [
            { name: 'GitHub', url: 'https://github.com', icon: '💻' },
            { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
            { name: 'Email', url: 'mailto:hello@portfolio.com', icon: '📧' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ผลงาน', href: '/portfolio' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: 'กรุงเทพฯ, ประเทศไทย',
          phone: '081-234-5678',
          email: 'hello@portfolio.com'
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
        radius: '8px',
        spacing: '1rem'
      },
      tone: 'professional',
      reasoning: 'Blue conveys trust and professionalism, perfect for portfolios'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: {
            required: true,
            maxLength: 40,
            description: 'Portfolio badge text'
          },
          heading: {
            required: true,
            maxLength: 80,
            description: 'Portfolio main heading'
          },
          subheading: {
            required: true,
            maxLength: 160,
            description: 'Portfolio description'
          },
          ctaLabel: {
            required: true,
            maxLength: 24,
            description: 'Primary CTA (e.g., "ดูผลงาน", "ติดต่อ")'
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "ติดต่อ", "Contact")' 
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
          businessType: ['portfolio', 'creative', 'designer', 'developer', 'artist'],
          tone: ['creative', 'modern', 'minimal', 'professional']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['portfolio', 'creative'],
          tone: ['creative', 'personal', 'professional']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered'],
        defaultVariant: 'footer-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['portfolio', 'creative'],
          tone: ['minimal', 'clean', 'professional']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry'],
        defaultVariant: 'menu-masonry',
        randomSelection: false,
        constraints: {
          businessType: ['portfolio', 'creative'],
          tone: ['creative', 'organized', 'showcase']
        }
      }
    }
  }
];

