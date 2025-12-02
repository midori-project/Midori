/**
 * Travel Prompt Template
 * Template เฉพาะสำหรับ Travel/Tourism
 */

export const travelPromptTemplate = {
  systemPrompt: `You are a professional content generator for travel and tourism websites.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on adventure, exploration, and travel-related content
- Use appropriate travel categories: adventure, luxury, budget, family, cultural
- Generate 6 travel packages with realistic destination names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Destination+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

CRITICAL: Text Length Limits:
- heading: MAX 80 characters (keep it adventurous and inspiring)
- subheading: MAX 150 characters
- badge: MAX 40 characters
- menuItems[].name: MAX 50 characters
- menuItems[].description: MAX 120 characters
- description: MAX 200 characters
`,

  generateVariantAwarePrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): string => {
    const detectedLanguage = language || 'th';
    const isEnglish = detectedLanguage === 'en';
    
    // Get variant information
    const heroVariant = variantInfo?.variantsUsed?.['hero-basic'] || 'hero-fullscreen';
    const aboutVariant = variantInfo?.variantsUsed?.['about-basic'] || 'about-split';
    
    const generateHeroSection = (variant: string) => {
      switch (variant) {
        case 'hero-minimal':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Travel]' : '[ท่องเที่ยว]'}",
    "heading": "${isEnglish ? '[Travel Agency]' : '[เอเจนซี่ท่องเที่ยว]'}",
    "subheading": "${isEnglish ? '[Travel packages and tours]' : '[แพ็กเกจท่องเที่ยวและทัวร์]'}",
    "ctaLabel": "${isEnglish ? '[View Packages]' : '[ดูแพ็กเกจ]'}",
    "secondaryCta": "${isEnglish ? '[Contact Us]' : '[ติดต่อเรา]'}"
  }`;
        case 'hero-split':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Adventure]' : '[ผจญภัย]'}",
    "heading": "${isEnglish ? '[Discover New Worlds]' : '[เปิดโลกใหม่ด้วยการเดินทาง]'}",
    "subheading": "${isEnglish ? '[Quality travel packages with professional guides]' : '[แพ็กเกจท่องเที่ยวคุณภาพ พร้อมไกด์มืออาชีพ]'}",
    "ctaLabel": "${isEnglish ? '[View Packages]' : '[ดูแพ็กเกจ]'}",
    "secondaryCta": "${isEnglish ? '[Contact Inquiry]' : '[ติดต่อสอบถาม]'}"
  }`;
        case 'hero-fullscreen':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Explore]' : '[สำรวจ]'}",
    "heading": "${isEnglish ? '[Amazing Adventures Await]' : '[การผจญภัยที่น่าทึ่งรอคุณอยู่]'}",
    "subheading": "${isEnglish ? '[Create unforgettable memories]' : '[สร้างความทรงจำที่ไม่มีวันลืม]'}",
    "ctaLabel": "${isEnglish ? '[Start Journey]' : '[เริ่มต้นการเดินทาง]'}",
    "secondaryCta": "${isEnglish ? '[Learn More]' : '[เรียนรู้เพิ่มเติม]'}"
  }`;
        default:
          return `  "Hero": {
    "badge": "${isEnglish ? '[Travel]' : '[ท่องเที่ยว]'}",
    "heading": "${isEnglish ? '[Travel Agency]' : '[เอเจนซี่ท่องเที่ยว]'}",
    "subheading": "${isEnglish ? '[Travel packages and tours]' : '[แพ็กเกจท่องเที่ยวและทัวร์]'}",
    "ctaLabel": "${isEnglish ? '[View Packages]' : '[ดูแพ็กเกจ]'}",
    "secondaryCta": "${isEnglish ? '[Contact Us]' : '[ติดต่อเรา]'}"
  }`;
      }
    };

    const generateAboutSection = (variant: string) => {
      switch (variant) {
        case 'about-split':
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[We are a travel agency providing quality travel packages]' : '[เราเป็นเอเจนซี่ท่องเที่ยวที่ให้บริการแพ็กเกจท่องเที่ยวคุณภาพ]'}",
    "features": [
      {
        "title": "${isEnglish ? '[Quality Packages]' : '[แพ็กเกจคุณภาพ]'}",
        "description": "${isEnglish ? '[Carefully selected packages]' : '[แพ็กเกจท่องเที่ยวที่คัดสรรแล้ว]'}"
      },
      {
        "title": "${isEnglish ? '[Professional Guides]' : '[ไกด์มืออาชีพ]'}",
        "description": "${isEnglish ? '[Experienced guides]' : '[ไกด์ที่มีประสบการณ์]'}"
      },
      {
        "title": "${isEnglish ? '[Reasonable Prices]' : '[ราคาเหมาะสม]'}",
        "description": "${isEnglish ? '[Value for money]' : '[ราคาที่คุ้มค่า]'}"
      }
    ],
    "stats": [
      { "number": "500+", "label": "${isEnglish ? '[Packages]' : '[แพ็กเกจ]'}" },
      { "number": "10+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "98%", "label": "${isEnglish ? '[Satisfaction]' : '[ความพึงพอใจ]'}" }
    ]
  }`;
        default:
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[Travel agency description]' : '[คำอธิบายเอเจนซี่ท่องเที่ยว]'}",
    "features": [
      { "title": "${isEnglish ? '[Feature 1]' : '[คุณสมบัติ 1]'}", "description": "${isEnglish ? '[Description 1]' : '[คำอธิบาย 1]'}" },
      { "title": "${isEnglish ? '[Feature 2]' : '[คุณสมบัติ 2]'}", "description": "${isEnglish ? '[Description 2]' : '[คำอธิบาย 2]'}" },
      { "title": "${isEnglish ? '[Feature 3]' : '[คุณสมบัติ 3]'}", "description": "${isEnglish ? '[Description 3]' : '[คำอธิบาย 3]'}" }
    ],
    "stats": [
      { "number": "500+", "label": "${isEnglish ? '[Packages]' : '[แพ็กเกจ]'}" },
      { "number": "10+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "98%", "label": "${isEnglish ? '[Satisfaction]' : '[ความพึงพอใจ]'}" }
    ]
  }`;
      }
    };
    
    let prompt: string = `Travel Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate travel website JSON in ENGLISH with this structure:' : 
  'Generate travel website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including agency names, destination names, package descriptions, and all other text content.'}
{
  "global": {
    "palette": {
      "primary": "green",
      "secondary": "blue",
      "bgTone": 50
    },
    "tokens": {
      "radius": "12px",
      "spacing": "1.25rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Travel Agency]' : '[เอเจนซี่ท่องเที่ยว]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Contact Us]' : '[ติดต่อเรา]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Packages]' : '[แพ็กเกจ]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
${generateHeroSection(heroVariant)},
${generateAboutSection(aboutVariant)},
  "Menu": {
    "title": "${isEnglish ? '[Travel Packages]' : '[แพ็กเกจท่องเที่ยว]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Japan Tour]' : '[เที่ยวญี่ปุ่น]'}",
        "price": "25,000",
        "description": "${isEnglish ? '[Tokyo Kyoto 5 days 4 nights]' : '[เที่ยวโตเกียว เกียวโต 5 วัน 4 คืน]'}",
        "image": "https://via.placeholder.com/400x300?text=Japan+Tour",
        "imageAlt": "${isEnglish ? '[Japan Tour Image]' : '[รูปทัวร์ญี่ปุ่น]'}",
        "category": "cultural"
      },
      {
        "name": "${isEnglish ? '[Korea Tour]' : '[เที่ยวเกาหลี]'}",
        "price": "18,000",
        "description": "${isEnglish ? '[Seoul 4 days 3 nights]' : '[เที่ยวโซล 4 วัน 3 คืน]'}",
        "image": "https://via.placeholder.com/400x300?text=Korea+Tour",
        "imageAlt": "${isEnglish ? '[Korea Tour Image]' : '[รูปทัวร์เกาหลี]'}",
        "category": "cultural"
      },
      {
        "name": "${isEnglish ? '[Europe Tour]' : '[เที่ยวยุโรป]'}",
        "price": "80,000",
        "description": "${isEnglish ? '[France Italy 10 days 9 nights]' : '[เที่ยวฝรั่งเศส อิตาลี 10 วัน 9 คืน]'}",
        "image": "https://via.placeholder.com/400x300?text=Europe+Tour",
        "imageAlt": "${isEnglish ? '[Europe Tour Image]' : '[รูปทัวร์ยุโรป]'}",
        "category": "luxury"
      },
      {
        "name": "${isEnglish ? '[Domestic Tour]' : '[เที่ยวในประเทศ]'}",
        "price": "8,000",
        "description": "${isEnglish ? '[Chiang Mai 3 days 2 nights]' : '[เที่ยวเชียงใหม่ 3 วัน 2 คืน]'}",
        "image": "https://via.placeholder.com/400x300?text=Domestic+Tour",
        "imageAlt": "${isEnglish ? '[Domestic Tour Image]' : '[รูปทัวร์ในประเทศ]'}",
        "category": "adventure"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact for Package Inquiry]' : '[ติดต่อสอบถามแพ็กเกจ]'}",
    "subtitle": "${isEnglish ? '[Ready to advise every day]' : '[พร้อมให้คำปรึกษาทุกวัน]'}",
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@travel.com",
    "businessHours": "${isEnglish ? '[Mon-Fri 9:00-18:00]' : '[จันทร์-ศุกร์ 9:00-18:00]'}",
    "contactFormTitle": "${isEnglish ? '[Package Inquiry]' : '[สอบถามแพ็กเกจ]'}",
    "contactFormCta": "${isEnglish ? '[Send Question]' : '[ส่งคำถาม]'}",
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
    "companyName": "${isEnglish ? '[Travel Agency]' : '[เอเจนซี่ท่องเที่ยว]'}",
    "description": "${isEnglish ? '[Travel agency providing quality packages]' : '[เอเจนซี่ท่องเที่ยวที่ให้บริการแพ็กเกจคุณภาพ]'}",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "YouTube", "url": "https://youtube.com", "icon": "📺" }
    ],
    "quickLinks": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Packages]' : '[แพ็กเกจ]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ],
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@travel.com"
  }
}`;

    return prompt;
  }
};
