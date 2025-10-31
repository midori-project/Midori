import { BusinessCategoryManifest } from "../index";

// Portfolio Business Category
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
        required: true,
        customizations: {
          badge: 'Portfolio',
          heading: 'Creative Professional',
          subheading: 'แสดงผลงานและความสามารถในการสร้างสรรค์สิ่งใหม่ๆ',
          ctaLabel: 'ดูผลงาน',
          secondaryCta: 'ติดต่อ'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับฉัน',
          description: 'ฉันเป็นนักออกแบบและนักพัฒนาที่มีความหลงใหลในการสร้างสรรค์สิ่งใหม่ๆ',
          features: [
            { title: 'ออกแบบ', description: 'UI/UX Design' },
            { title: 'พัฒนา', description: 'Web Development' },
            { title: 'สร้างสรรค์', description: 'Creative Solutions' }
          ],
          stats: [
            { number: '50+', label: 'โปรเจค' },
            { number: '3+', label: 'ปีประสบการณ์' },
            { number: '100%', label: 'ความพึงพอใจ' },
            { number: '24/7', label: 'พร้อมทำงาน' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'ผลงานของฉัน',
          menuItems: [
            { name: 'Web Design', price: '15,000', description: 'ออกแบบเว็บไซต์สวยงาม' },
            { name: 'Mobile App', price: '25,000', description: 'พัฒนาแอปมือถือ' },
            { name: 'Logo Design', price: '5,000', description: 'ออกแบบโลโก้' },
            { name: 'Branding', price: '20,000', description: 'สร้างแบรนด์ครบวงจร' }
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
          businessHours: 'จันทร์-ศุกร์ 9:00-18:00',
          contactFormTitle: 'เริ่มโปรเจคใหม่',
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
        required: true,
        customizations: {
          companyName: 'Creative Portfolio',
          description: 'นักออกแบบและนักพัฒนาที่มีความหลงใหลในการสร้างสรรค์',
          socialLinks: [
            { name: 'GitHub', url: 'https://github.com', icon: '💻' },
            { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
            { name: 'Dribbble', url: 'https://dribbble.com', icon: '🎨' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'ผลงาน', href: '/portfolio' },
            { label: 'เกี่ยวกับ', href: '/about' },
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
        primary: 'purple',
        secondary: 'pink',
        bgTone: '100'
      },
      tokens: {
        radius: '10px',
        spacing: '1.25rem'
      },
      tone: 'creative',
      reasoning: 'Purple and pink convey creativity and innovation'
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
            description: 'Professional title or name' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Professional description or tagline' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูผลงาน", "Portfolio")' 
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
        randomSelection: true,
        constraints: {
          businessType: ['portfolio', 'creative', 'designer', 'developer', 'artist'],
          tone: ['creative', 'modern', 'minimal', 'professional']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team', 'about-timeline', 'about-story', 'about-values'],
        defaultVariant: 'about-split',
        randomSelection: true,
        constraints: {
          businessType: ['portfolio', 'creative'],
          tone: ['creative', 'personal', 'professional']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered'],
        defaultVariant: 'footer-minimal',
        randomSelection: true,
        constraints: {
          businessType: ['portfolio', 'creative'],
          tone: ['minimal', 'clean', 'professional']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry'],
        defaultVariant: 'menu-masonry',
        randomSelection: true,
        constraints: {
          businessType: ['portfolio', 'creative'],
          tone: ['creative', 'organized', 'showcase']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-minimal',
        randomSelection: true,
        constraints: {
          businessType: ['portfolio', 'creative', 'designer', 'developer', 'artist'],
          tone: ['creative', 'modern', 'minimal', 'professional', 'luxury', 'casual']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-sidebar', 'navbar-minimal', 'navbar-mega', 'navbar-sticky'],
        defaultVariant: 'navbar-minimal',
        randomSelection: true,
        constraints: {
          businessType: ['portfolio', 'creative', 'designer', 'developer', 'artist'],
          tone: ['creative', 'modern', 'minimal', 'professional', 'clean']
        }
      }
    }
  }
];

