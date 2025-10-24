/**
 * Academy Prompt Template
 * Template เฉพาะสำหรับ Academy/Education
 */

export const academyPromptTemplate = {
  systemPrompt: `You are a professional content generator for educational institutions and training centers.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on education, learning, and skill development content
- Use appropriate education categories: programming, design, language, business, technical
- Generate 6 courses with realistic course names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Course+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
`,

  generateVariantAwarePrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): string => {
    const detectedLanguage = language || 'th';
    const isEnglish = detectedLanguage === 'en';
    
    // Get variant information
    const heroVariant = variantInfo?.variantsUsed?.['hero-basic'] || 'hero-split';
    const aboutVariant = variantInfo?.variantsUsed?.['about-basic'] || 'about-split';
    
    const generateHeroSection = (variant: string) => {
      switch (variant) {
        case 'hero-minimal':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Education]' : '[การศึกษา]'}",
    "heading": "${isEnglish ? '[Academy Name]' : '[ชื่อสถาบัน]'}",
    "subheading": "${isEnglish ? '[Professional courses and training]' : '[คอร์สเรียนและฝึกอบรมมืออาชีพ]'}",
    "ctaLabel": "${isEnglish ? '[View Courses]' : '[ดูคอร์สเรียน]'}",
    "secondaryCta": "${isEnglish ? '[Enroll Now]' : '[สมัครเรียน]'}"
  }`;
        case 'hero-split':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Educational Institution]' : '[สถาบันการศึกษา]'}",
    "heading": "${isEnglish ? '[Develop Skills and Knowledge Professionally]' : '[พัฒนาทักษะและความรู้อย่างมืออาชีพ]'}",
    "subheading": "${isEnglish ? '[Quality courses taught by experts with recognized certificates]' : '[คอร์สเรียนคุณภาพ สอนโดยผู้เชี่ยวชาญ พร้อมใบรับรองที่ได้รับการยอมรับ]'}",
    "ctaLabel": "${isEnglish ? '[View Courses]' : '[ดูคอร์สเรียน]'}",
    "secondaryCta": "${isEnglish ? '[Enroll Now]' : '[สมัครเรียน]'}"
  }`;
        case 'hero-fullscreen':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Learning Center]' : '[ศูนย์การเรียนรู้]'}",
    "heading": "${isEnglish ? '[Unlock Your Potential]' : '[ปลดล็อกศักยภาพของคุณ]'}",
    "subheading": "${isEnglish ? '[Transform your future with quality education]' : '[เปลี่ยนอนาคตของคุณด้วยการศึกษาคุณภาพ]'}",
    "ctaLabel": "${isEnglish ? '[Start Learning]' : '[เริ่มเรียน]'}",
    "secondaryCta": "${isEnglish ? '[Explore Courses]' : '[สำรวจคอร์ส]'}"
  }`;
        default:
          return `  "Hero": {
    "badge": "${isEnglish ? '[Education]' : '[การศึกษา]'}",
    "heading": "${isEnglish ? '[Academy Name]' : '[ชื่อสถาบัน]'}",
    "subheading": "${isEnglish ? '[Professional courses and training]' : '[คอร์สเรียนและฝึกอบรมมืออาชีพ]'}",
    "ctaLabel": "${isEnglish ? '[View Courses]' : '[ดูคอร์สเรียน]'}",
    "secondaryCta": "${isEnglish ? '[Enroll Now]' : '[สมัครเรียน]'}"
  }`;
      }
    };

    const generateAboutSection = (variant: string) => {
      switch (variant) {
        case 'about-split':
          return `  "About": {
    "title": "${isEnglish ? '[About Our Academy]' : '[เกี่ยวกับสถาบันของเรา]'}",
    "description": "${isEnglish ? '[We are an educational institution providing quality courses taught by experts]' : '[เราเป็นสถาบันการศึกษาที่ให้บริการคอร์สเรียนคุณภาพ สอนโดยผู้เชี่ยวชาญในสาขาต่างๆ]'}",
    "features": [
      {
        "title": "${isEnglish ? '[Quality Courses]' : '[คอร์สคุณภาพ]'}",
        "description": "${isEnglish ? '[Professionally designed courses]' : '[คอร์สเรียนที่ได้รับการออกแบบอย่างมืออาชีพ]'}"
      },
      {
        "title": "${isEnglish ? '[Expert Instructors]' : '[ผู้เชี่ยวชาญ]'}",
        "description": "${isEnglish ? '[Taught by experts in various fields]' : '[สอนโดยผู้เชี่ยวชาญในสาขาต่างๆ]'}"
      },
      {
        "title": "${isEnglish ? '[Certificates]' : '[ใบรับรอง]'}",
        "description": "${isEnglish ? '[Recognized certificates]' : '[ได้รับใบรับรองที่ได้รับการยอมรับ]'}"
      }
    ],
    "stats": [
      { "number": "50+", "label": "${isEnglish ? '[Courses]' : '[คอร์สเรียน]'}" },
      { "number": "1,000+", "label": "${isEnglish ? '[Students]' : '[นักเรียน]'}" },
      { "number": "95%", "label": "${isEnglish ? '[Success Rate]' : '[อัตราสำเร็จ]'}" }
    ]
  }`;
        default:
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[Educational institution description]' : '[คำอธิบายสถาบันการศึกษา]'}",
    "features": [
      { "title": "${isEnglish ? '[Feature 1]' : '[คุณสมบัติ 1]'}", "description": "${isEnglish ? '[Description 1]' : '[คำอธิบาย 1]'}" },
      { "title": "${isEnglish ? '[Feature 2]' : '[คุณสมบัติ 2]'}", "description": "${isEnglish ? '[Description 2]' : '[คำอธิบาย 2]'}" },
      { "title": "${isEnglish ? '[Feature 3]' : '[คุณสมบัติ 3]'}", "description": "${isEnglish ? '[Description 3]' : '[คำอธิบาย 3]'}" }
    ],
    "stats": [
      { "number": "50+", "label": "${isEnglish ? '[Courses]' : '[คอร์สเรียน]'}" },
      { "number": "1,000+", "label": "${isEnglish ? '[Students]' : '[นักเรียน]'}" },
      { "number": "95%", "label": "${isEnglish ? '[Success Rate]' : '[อัตราสำเร็จ]'}" }
    ]
  }`;
      }
    };
    
    let prompt: string = `Academy Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate academy website JSON in ENGLISH with this structure:' : 
  'Generate academy website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including academy names, course names, descriptions, and all other text content.'}
{
  "global": {
    "palette": {
      "primary": "indigo",
      "secondary": "blue",
      "bgTone": 50
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Academy Name]' : '[ชื่อสถาบัน]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Enroll Now]' : '[สมัครเรียน]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Courses]' : '[คอร์สเรียน]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
${generateHeroSection(heroVariant)},
${generateAboutSection(aboutVariant)},
  "Menu": {
    "title": "${isEnglish ? '[Our Courses]' : '[คอร์สเรียนของเรา]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Programming Course]' : '[คอร์สโปรแกรมมิ่ง]'}",
        "price": "15,000",
        "description": "${isEnglish ? '[Learn programming from basics]' : '[เรียนเขียนโปรแกรมตั้งแต่พื้นฐาน]'}",
        "image": "https://via.placeholder.com/400x300?text=Programming+Course",
        "imageAlt": "${isEnglish ? '[Programming Course Image]' : '[รูปคอร์สโปรแกรมมิ่ง]'}",
        "category": "technical"
      },
      {
        "name": "${isEnglish ? '[Design Course]' : '[คอร์สออกแบบ]'}",
        "price": "12,000",
        "description": "${isEnglish ? '[Learn graphic design and UI/UX]' : '[เรียนออกแบบกราฟิกและ UI/UX]'}",
        "image": "https://via.placeholder.com/400x300?text=Design+Course",
        "imageAlt": "${isEnglish ? '[Design Course Image]' : '[รูปคอร์สออกแบบ]'}",
        "category": "creative"
      },
      {
        "name": "${isEnglish ? '[Language Course]' : '[คอร์สภาษา]'}",
        "price": "8,000",
        "description": "${isEnglish ? '[Learn English for work]' : '[เรียนภาษาอังกฤษเพื่อการทำงาน]'}",
        "image": "https://via.placeholder.com/400x300?text=Language+Course",
        "imageAlt": "${isEnglish ? '[Language Course Image]' : '[รูปคอร์สภาษา]'}",
        "category": "language"
      },
      {
        "name": "${isEnglish ? '[Business Course]' : '[คอร์สธุรกิจ]'}",
        "price": "10,000",
        "description": "${isEnglish ? '[Learn business management and marketing]' : '[เรียนการจัดการธุรกิจและการตลาด]'}",
        "image": "https://via.placeholder.com/400x300?text=Business+Course",
        "imageAlt": "${isEnglish ? '[Business Course Image]' : '[รูปคอร์สธุรกิจ]'}",
        "category": "business"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact for Enrollment]' : '[ติดต่อสมัครเรียน]'}",
    "subtitle": "${isEnglish ? '[Ready to advise every day]' : '[พร้อมให้คำปรึกษาทุกวัน]'}",
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@academy.com",
    "businessHours": "${isEnglish ? '[Mon-Fri 9:00-18:00]' : '[จันทร์-ศุกร์ 9:00-18:00]'}",
    "contactFormTitle": "${isEnglish ? '[Enroll Now]' : '[สมัครเรียน]'}",
    "contactFormCta": "${isEnglish ? '[Send Application]' : '[ส่งใบสมัคร]'}",
    "contactFormDescription": "${isEnglish ? '[Please fill in the information below, we will contact you soon]' : '[กรุณากรอกข้อมูลด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด]'}",
    "contactInfoTitle": "${isEnglish ? '[Contact Information]' : '[ข้อมูลติดต่อ]'}",
    "contactInfoDescription": "${isEnglish ? '[We are ready to advise and answer all questions]' : '[เราพร้อมให้คำปรึกษาและตอบคำถามทุกข้อสงสัย]'}",
    "nameLabel": "${isEnglish ? '[Full Name]' : '[ชื่อ-นามสกุล]'}",
    "namePlaceholder": "${isEnglish ? '[Please enter your full name]' : '[กรุณากรอกชื่อ-นามสกุล]'}",
    "emailLabel": "${isEnglish ? '[Email]' : '[อีเมล]'}",
    "emailPlaceholder": "${isEnglish ? '[Please enter your email]' : '[กรุณากรอกอีเมล]'}",
    "messageLabel": "${isEnglish ? '[Message]' : '[ข้อความ]'}",
    "messagePlaceholder": "${isEnglish ? '[Please write your message]' : '[กรุณาเขียนข้อความที่ต้องการติดต่อ]'}",
    "addressLabel": "${isEnglish ? '[Address]' : '[ที่อยู่]'}",
    "phoneLabel": "${isEnglish ? '[Phone]' : '[โทรศัพท์]'}",
    "businessHoursLabel": "${isEnglish ? '[Business Hours]' : '[เวลาทำการ]'}"
  },
  "Footer": {
    "companyName": "${isEnglish ? '[Educational Institution]' : '[สถาบันการศึกษา]'}",
    "description": "${isEnglish ? '[Educational institution providing quality courses]' : '[สถาบันการศึกษาที่ให้บริการคอร์สเรียนคุณภาพ]'}",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "YouTube", "url": "https://youtube.com", "icon": "📺" },
      { "name": "LinkedIn", "url": "https://linkedin.com", "icon": "💼" }
    ],
    "quickLinks": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Courses]' : '[คอร์สเรียน]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ],
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@academy.com"
  }
}`;

    return prompt;
  }
};
