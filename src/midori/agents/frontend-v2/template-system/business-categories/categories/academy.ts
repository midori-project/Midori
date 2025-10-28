import { BusinessCategoryManifest } from "../index";

// Academy Business Category
export const academyCategories: BusinessCategoryManifest[] = [
  {
    id: 'academy',
    name: 'Academy',
    description: 'Educational institutions and training centers',
    keywords: ['academy', 'education', 'school', 'university', 'college', 'training', 'course', 'learning', 'study', 'student', 'teacher', 'institute', 'academic', 'knowledge', 'skill', 'สถาบัน', 'การศึกษา', 'โรงเรียน', 'มหาวิทยาลัย', 'คอร์ส', 'เรียน', 'ฝึกอบรม'],
    blocks: [
      {
        blockId: 'navbar-basic',
        required: true,
        customizations: {
          menuItems: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'คอร์สเรียน', href: '/menu' },
            { label: 'เกี่ยวกับเรา', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ]
        }
      },
      {
        blockId: 'hero-basic',
        required: true,
        customizations: {
          badge: 'สถาบันการศึกษา',
          heading: 'พัฒนาทักษะและความรู้อย่างมืออาชีพ',
          subheading: 'คอร์สเรียนคุณภาพ สอนโดยผู้เชี่ยวชาญ พร้อมใบรับรองที่ได้รับการยอมรับ',
          ctaLabel: 'ดูคอร์สเรียน',
          secondaryCta: 'สมัครเรียน'
        }
      },
      {
        blockId: 'about-basic',
        required: true,
        customizations: {
          title: 'เกี่ยวกับสถาบันของเรา',
          description: 'เราเป็นสถาบันการศึกษาที่ให้บริการคอร์สเรียนคุณภาพ สอนโดยผู้เชี่ยวชาญในสาขาต่างๆ',
          features: [
            { title: 'คอร์สคุณภาพ', description: 'คอร์สเรียนที่ได้รับการออกแบบอย่างมืออาชีพ' },
            { title: 'ผู้เชี่ยวชาญ', description: 'สอนโดยผู้เชี่ยวชาญในสาขาต่างๆ' },
            { title: 'ใบรับรอง', description: 'ได้รับใบรับรองที่ได้รับการยอมรับ' }
          ],
          stats: [
            { number: '50+', label: 'คอร์สเรียน' },
            { number: '1,000+', label: 'นักเรียน' },
            { number: '95%', label: 'อัตราสำเร็จ' }
          ]
        }
      },
      {
        blockId: 'menu-basic',
        required: true,
        customizations: {
          title: 'คอร์สเรียนของเรา',
          menuItems: [
            { name: 'คอร์สโปรแกรมมิ่ง', price: '15,000', description: 'เรียนเขียนโปรแกรมตั้งแต่พื้นฐาน' },
            { name: 'คอร์สออกแบบ', price: '12,000', description: 'เรียนออกแบบกราฟิกและ UI/UX' },
            { name: 'คอร์สภาษา', price: '8,000', description: 'เรียนภาษาอังกฤษเพื่อการทำงาน' },
            { name: 'คอร์สธุรกิจ', price: '10,000', description: 'เรียนการจัดการธุรกิจและการตลาด' }
          ]
        }
      },
      {
        blockId: 'contact-basic',
        required: true,
        customizations: {
          title: 'ติดต่อสมัครเรียน',
          subtitle: 'พร้อมให้คำปรึกษาทุกวัน',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@academy.com',
          businessHours: 'จันทร์-ศุกร์ 9:00-18:00',
          contactFormTitle: 'สมัครเรียน',
          contactFormCta: 'ส่งใบสมัคร',
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
          companyName: 'สถาบันการศึกษา',
          description: 'สถาบันการศึกษาที่ให้บริการคอร์สเรียนคุณภาพ',
          socialLinks: [
            { name: 'Facebook', url: 'https://facebook.com', icon: '📘' },
            { name: 'YouTube', url: 'https://youtube.com', icon: '📺' },
            { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' }
          ],
          quickLinks: [
            { label: 'หน้าแรก', href: '/' },
            { label: 'คอร์สเรียน', href: '/menu' },
            { label: 'เกี่ยวกับ', href: '/about' },
            { label: 'ติดต่อ', href: '/contact' }
          ],
          address: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          phone: '02-123-4567',
          email: 'info@academy.com'
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
        primary: 'indigo',
        secondary: 'blue',
        bgTone: '50'
      },
      tokens: {
        radius: '8px',
        spacing: '1rem'
      },
      tone: 'professional',
      reasoning: 'Indigo and blue convey knowledge, trust, and professionalism'
    },
    overrides: {
      'hero-basic': {
        placeholders: {
          badge: { 
            required: true, 
            maxLength: 40, 
            description: 'Academy badge text' 
          },
          heading: { 
            required: true, 
            maxLength: 80, 
            description: 'Academy main heading' 
          },
          subheading: { 
            required: true, 
            maxLength: 160, 
            description: 'Academy description' 
          },
          ctaLabel: { 
            required: true, 
            maxLength: 24, 
            description: 'Primary CTA (e.g., "ดูคอร์สเรียน", "View Courses")' 
          },
          secondaryCta: { 
            required: true, 
            maxLength: 24, 
            description: 'Secondary CTA (e.g., "สมัครเรียน", "Enroll Now")' 
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
          businessType: ['academy', 'education', 'school'],
          tone: ['professional', 'academic', 'modern', 'trustworthy']
        }
      },
      'about-basic': {
        allowedVariants: ['about-split', 'about-minimal', 'about-team', 'about-timeline'],
        defaultVariant: 'about-split',
        randomSelection: false,
        constraints: {
          businessType: ['academy', 'education'],
          tone: ['professional', 'academic', 'trustworthy']
        }
      },
      'footer-basic': {
        allowedVariants: ['footer-minimal', 'footer-centered', 'footer-mega'],
        defaultVariant: 'footer-mega',
        randomSelection: false,
        constraints: {
          businessType: ['academy', 'education'],
          tone: ['professional', 'academic', 'comprehensive']
        }
      },
      'menu-basic': {
        allowedVariants: ['menu-list', 'menu-masonry', 'menu-carousel'],
        defaultVariant: 'menu-list',
        randomSelection: false,
        constraints: {
          businessType: ['academy', 'education'],
          tone: ['professional', 'organized', 'academic']
        }
      },
      'contact-basic': {
        allowedVariants: ['contact-split', 'contact-minimal', 'contact-cards', 'contact-fullscreen'],
        defaultVariant: 'contact-split',
        randomSelection: true,
        constraints: {
          businessType: ['academy', 'education', 'school'],
          tone: ['professional', 'academic', 'modern', 'trustworthy']
        }
      },
      'navbar-basic': {
        allowedVariants: ['navbar-centered', 'navbar-transparent', 'navbar-minimal', 'navbar-sticky'],
        defaultVariant: 'navbar-minimal',
        randomSelection: false,
        constraints: {
          businessType: ['academy', 'education', 'school'],
          tone: ['professional', 'academic', 'clean', 'modern']
        }
      }
    }
  }
];
