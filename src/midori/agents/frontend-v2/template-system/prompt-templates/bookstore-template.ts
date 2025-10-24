/**
 * Book Store Prompt Template
 * Template เฉพาะสำหรับ Book Store/Library
 */

export const bookstorePromptTemplate = {
  systemPrompt: `You are a professional content generator for book stores and online book retailers.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on books, reading, and knowledge-related content
- Use appropriate book categories: fiction, non-fiction, children, academic, magazines
- Generate 6 book types with realistic book names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Book+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
`,

  generateVariantAwarePrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): string => {
    const detectedLanguage = language || 'th';
    const isEnglish = detectedLanguage === 'en';
    
    // Get variant information
    const heroVariant = variantInfo?.variantsUsed?.['hero-basic'] || 'hero-minimal';
    const aboutVariant = variantInfo?.variantsUsed?.['about-basic'] || 'about-minimal';
    
    const generateHeroSection = (variant: string) => {
      switch (variant) {
        case 'hero-minimal':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Quality Bookstore]' : '[ร้านหนังสือคุณภาพ]'}",
    "heading": "${isEnglish ? '[Discover Worlds of Knowledge and Imagination]' : '[ค้นพบโลกแห่งความรู้และจินตนาการ]'}",
    "subheading": "${isEnglish ? '[Various books, friendly prices, home delivery service]' : '[หนังสือหลากหลายประเภท ราคาเป็นมิตร พร้อมบริการส่งถึงบ้าน]'}",
    "ctaLabel": "${isEnglish ? '[Browse Books]' : '[ดูหนังสือ]'}",
    "secondaryCta": "${isEnglish ? '[Search Books]' : '[ค้นหาหนังสือ]'}"
  }`;
        case 'hero-split':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Book Lovers]' : '[คนรักหนังสือ]'}",
    "heading": "${isEnglish ? '[Your Gateway to Knowledge]' : '[ประตูสู่ความรู้ของคุณ]'}",
    "subheading": "${isEnglish ? '[Curated collection of books for every reader]' : '[คอลเลกชันหนังสือที่คัดสรรสำหรับทุกคน]'}",
    "ctaLabel": "${isEnglish ? '[Explore Collection]' : '[สำรวจคอลเลกชัน]'}",
    "secondaryCta": "${isEnglish ? '[Find Your Book]' : '[หาหนังสือของคุณ]'}"
  }`;
        case 'hero-fullscreen':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Reading Paradise]' : '[สวรรค์แห่งการอ่าน]'}",
    "heading": "${isEnglish ? '[Where Stories Come to Life]' : '[ที่ที่เรื่องราวมีชีวิต]'}",
    "subheading": "${isEnglish ? '[Immerse yourself in the world of books]' : '[จมดิ่งสู่โลกของหนังสือ]'}",
    "ctaLabel": "${isEnglish ? '[Start Reading]' : '[เริ่มอ่าน]'}",
    "secondaryCta": "${isEnglish ? '[Browse Now]' : '[ดูเลย]'}"
  }`;
        default:
          return `  "Hero": {
    "badge": "${isEnglish ? '[Bookstore]' : '[ร้านหนังสือ]'}",
    "heading": "${isEnglish ? '[Bookstore Name]' : '[ชื่อร้านหนังสือ]'}",
    "subheading": "${isEnglish ? '[Books and reading materials]' : '[หนังสือและสื่อการอ่าน]'}",
    "ctaLabel": "${isEnglish ? '[Browse Books]' : '[ดูหนังสือ]'}",
    "secondaryCta": "${isEnglish ? '[Search Books]' : '[ค้นหาหนังสือ]'}"
  }`;
      }
    };

    const generateAboutSection = (variant: string) => {
      switch (variant) {
        case 'about-minimal':
          return `  "About": {
    "title": "${isEnglish ? '[About Our Bookstore]' : '[เกี่ยวกับร้านหนังสือของเรา]'}",
    "description": "${isEnglish ? '[We are a bookstore providing various types of books at friendly prices]' : '[เราเป็นร้านหนังสือที่ให้บริการหนังสือหลากหลายประเภท ราคาเป็นมิตร]'}",
    "features": [
      {
        "title": "${isEnglish ? '[Various Books]' : '[หนังสือหลากหลาย]'}",
        "description": "${isEnglish ? '[Books for all ages]' : '[หนังสือทุกประเภททุกวัย]'}"
      },
      {
        "title": "${isEnglish ? '[Friendly Prices]' : '[ราคาเป็นมิตร]'}",
        "description": "${isEnglish ? '[Reasonable prices]' : '[ราคาที่เหมาะสม]'}"
      },
      {
        "title": "${isEnglish ? '[Home Delivery]' : '[บริการส่งถึงบ้าน]'}",
        "description": "${isEnglish ? '[Delivery nationwide]' : '[ส่งถึงบ้านทั่วประเทศ]'}"
      }
    ],
    "stats": [
      { "number": "10,000+", "label": "${isEnglish ? '[Books]' : '[หนังสือ]'}" },
      { "number": "5+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "99%", "label": "${isEnglish ? '[Satisfaction]' : '[ความพึงพอใจ]'}" }
    ]
  }`;
        default:
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[Bookstore description]' : '[คำอธิบายร้านหนังสือ]'}",
    "features": [
      { "title": "${isEnglish ? '[Feature 1]' : '[คุณสมบัติ 1]'}", "description": "${isEnglish ? '[Description 1]' : '[คำอธิบาย 1]'}" },
      { "title": "${isEnglish ? '[Feature 2]' : '[คุณสมบัติ 2]'}", "description": "${isEnglish ? '[Description 2]' : '[คำอธิบาย 2]'}" },
      { "title": "${isEnglish ? '[Feature 3]' : '[คุณสมบัติ 3]'}", "description": "${isEnglish ? '[Description 3]' : '[คำอธิบาย 3]'}" }
    ],
    "stats": [
      { "number": "10,000+", "label": "${isEnglish ? '[Books]' : '[หนังสือ]'}" },
      { "number": "5+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "99%", "label": "${isEnglish ? '[Satisfaction]' : '[ความพึงพอใจ]'}" }
    ]
  }`;
      }
    };
    
    let prompt: string = `Bookstore Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate bookstore website JSON in ENGLISH with this structure:' : 
  'Generate bookstore website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including bookstore names, book titles, descriptions, and all other text content.'}
{
  "global": {
    "palette": {
      "primary": "brown",
      "secondary": "orange",
      "bgTone": 50
    },
    "tokens": {
      "radius": "6px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Bookstore Name]' : '[ชื่อร้านหนังสือ]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Search Books]' : '[ค้นหาหนังสือ]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Books]' : '[หนังสือ]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
${generateHeroSection(heroVariant)},
${generateAboutSection(aboutVariant)},
  "Menu": {
    "title": "${isEnglish ? '[Recommended Books]' : '[หนังสือแนะนำ]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Thai Novels]' : '[นิยายไทย]'}",
        "price": "250",
        "description": "${isEnglish ? '[Classic and contemporary Thai novels]' : '[นิยายไทยคลาสสิกและร่วมสมัย]'}",
        "image": "https://via.placeholder.com/400x300?text=Thai+Novels",
        "imageAlt": "${isEnglish ? '[Thai Novels Image]' : '[รูปนิยายไทย]'}",
        "category": "fiction"
      },
      {
        "name": "${isEnglish ? '[Foreign Novels]' : '[นิยายต่างประเทศ]'}",
        "price": "350",
        "description": "${isEnglish ? '[Translated novels from abroad]' : '[นิยายแปลจากต่างประเทศ]'}",
        "image": "https://via.placeholder.com/400x300?text=Foreign+Novels",
        "imageAlt": "${isEnglish ? '[Foreign Novels Image]' : '[รูปนิยายต่างประเทศ]'}",
        "category": "fiction"
      },
      {
        "name": "${isEnglish ? '[Children Books]' : '[หนังสือเด็ก]'}",
        "price": "150",
        "description": "${isEnglish ? '[Picture books and fairy tales for children]' : '[หนังสือภาพและนิทานสำหรับเด็ก]'}",
        "image": "https://via.placeholder.com/400x300?text=Children+Books",
        "imageAlt": "${isEnglish ? '[Children Books Image]' : '[รูปหนังสือเด็ก]'}",
        "category": "children"
      },
      {
        "name": "${isEnglish ? '[Textbooks]' : '[ตำราเรียน]'}",
        "price": "450",
        "description": "${isEnglish ? '[Textbooks and academic books]' : '[ตำราเรียนและหนังสือวิชาการ]'}",
        "image": "https://via.placeholder.com/400x300?text=Textbooks",
        "imageAlt": "${isEnglish ? '[Textbooks Image]' : '[รูปตำราเรียน]'}",
        "category": "academic"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact for Book Orders]' : '[ติดต่อสั่งซื้อหนังสือ]'}",
    "subtitle": "${isEnglish ? '[Ready to serve every day]' : '[พร้อมให้บริการทุกวัน]'}",
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@bookstore.com",
    "businessHours": "${isEnglish ? '[Mon-Sun 9:00-21:00]' : '[จันทร์-อาทิตย์ 9:00-21:00]'}",
    "contactFormTitle": "${isEnglish ? '[Order Books]' : '[สั่งซื้อหนังสือ]'}",
    "contactFormCta": "${isEnglish ? '[Send Order]' : '[ส่งคำสั่งซื้อ]'}",
    "contactFormDescription": "${isEnglish ? '[Please fill in the information below, we will contact you soon]' : '[กรุณากรอกข้อมูลด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด]'}",
    "contactInfoTitle": "${isEnglish ? '[Contact Information]' : '[ข้อมูลติดต่อ]'}",
    "contactInfoDescription": "${isEnglish ? '[We are ready to serve and answer all questions]' : '[เราพร้อมให้บริการและตอบคำถามทุกข้อสงสัย]'}",
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
    "companyName": "${isEnglish ? '[Quality Bookstore]' : '[ร้านหนังสือคุณภาพ]'}",
    "description": "${isEnglish ? '[Bookstore providing various types of books]' : '[ร้านหนังสือที่ให้บริการหนังสือหลากหลายประเภท]'}",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Twitter", "url": "https://twitter.com", "icon": "🐦" }
    ],
    "quickLinks": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Books]' : '[หนังสือ]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ],
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@bookstore.com"
  }
}`;

    return prompt;
  }
};
