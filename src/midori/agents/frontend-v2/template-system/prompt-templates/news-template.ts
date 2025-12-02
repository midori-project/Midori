/**
 * News Prompt Template
 * Template เฉพาะสำหรับ News/Media
 */

export const newsPromptTemplate = {
  systemPrompt: `You are a professional content generator for news websites and media outlets.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on news, information, and journalism-related content
- Use appropriate news categories: politics, economy, sports, entertainment, technology, world
- Generate 6 news categories with realistic news types in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=News+Category
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

CRITICAL: Text Length Limits:
- heading: MAX 80 characters (keep it newsworthy and impactful)
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
    const heroVariant = variantInfo?.variantsUsed?.['hero-basic'] || 'hero-minimal';
    const aboutVariant = variantInfo?.variantsUsed?.['about-basic'] || 'about-minimal';
    
    const generateHeroSection = (variant: string) => {
      switch (variant) {
        case 'hero-minimal':
          return `  "Hero": {
    "badge": "${isEnglish ? '[News]' : '[ข่าวสาร]'}",
    "heading": "${isEnglish ? '[Modern and Reliable News]' : '[ข่าวสารที่ทันสมัยและเชื่อถือได้]'}",
    "subheading": "${isEnglish ? '[Presenting accurate, complete and up-to-date news]' : '[นำเสนอข่าวสารที่ถูกต้อง ครบถ้วน และทันสมัย]'}",
    "ctaLabel": "${isEnglish ? '[Read News]' : '[อ่านข่าว]'}",
    "secondaryCta": "${isEnglish ? '[Follow Us]' : '[ติดตามเรา]'}"
  }`;
        case 'hero-split':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Breaking News]' : '[ข่าวด่วน]'}",
    "heading": "${isEnglish ? '[Stay Informed]' : '[ติดตามข่าวสาร]'}",
    "subheading": "${isEnglish ? '[Get the latest news and updates]' : '[รับข่าวสารและอัพเดทล่าสุด]'}",
    "ctaLabel": "${isEnglish ? '[Read Latest]' : '[อ่านล่าสุด]'}",
    "secondaryCta": "${isEnglish ? '[Subscribe]' : '[สมัครสมาชิก]'}"
  }`;
        case 'hero-fullscreen':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Media]' : '[สื่อ]'}",
    "heading": "${isEnglish ? '[Truth Matters]' : '[ความจริงสำคัญ]'}",
    "subheading": "${isEnglish ? '[Delivering news that matters]' : '[นำเสนอข่าวที่สำคัญ]'}",
    "ctaLabel": "${isEnglish ? '[Explore News]' : '[สำรวจข่าว]'}",
    "secondaryCta": "${isEnglish ? '[Get Updates]' : '[รับอัพเดท]'}"
  }`;
        default:
          return `  "Hero": {
    "badge": "${isEnglish ? '[News]' : '[ข่าวสาร]'}",
    "heading": "${isEnglish ? '[News Website]' : '[เว็บไซต์ข่าว]'}",
    "subheading": "${isEnglish ? '[Latest news and information]' : '[ข่าวสารและข้อมูลล่าสุด]'}",
    "ctaLabel": "${isEnglish ? '[Read News]' : '[อ่านข่าว]'}",
    "secondaryCta": "${isEnglish ? '[Follow Us]' : '[ติดตามเรา]'}"
  }`;
      }
    };

    const generateAboutSection = (variant: string) => {
      switch (variant) {
        case 'about-minimal':
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[We are a news media providing accurate, complete and up-to-date news]' : '[เราเป็นสื่อข่าวที่ให้บริการข่าวสารที่ถูกต้อง ครบถ้วน และทันสมัย]'}",
    "features": [
      {
        "title": "${isEnglish ? '[Up-to-date News]' : '[ข่าวทันสมัย]'}",
        "description": "${isEnglish ? '[News updated all the time]' : '[ข่าวสารที่อัพเดทตลอดเวลา]'}"
      },
      {
        "title": "${isEnglish ? '[Accurate Information]' : '[ข้อมูลถูกต้อง]'}",
        "description": "${isEnglish ? '[Thoroughly verified information]' : '[ตรวจสอบข้อมูลอย่างละเอียด]'}"
      },
      {
        "title": "${isEnglish ? '[Comprehensive Coverage]' : '[ครอบคลุมทุกด้าน]'}",
        "description": "${isEnglish ? '[All types of news]' : '[ข่าวสารทุกประเภท]'}"
      }
    ],
    "stats": [
      { "number": "1,000+", "label": "${isEnglish ? '[News per Day]' : '[ข่าวต่อวัน]'}" },
      { "number": "10+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "1M+", "label": "${isEnglish ? '[Readers]' : '[ผู้อ่าน]'}" }
    ]
  }`;
        default:
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[News media description]' : '[คำอธิบายสื่อข่าว]'}",
    "features": [
      { "title": "${isEnglish ? '[Feature 1]' : '[คุณสมบัติ 1]'}", "description": "${isEnglish ? '[Description 1]' : '[คำอธิบาย 1]'}" },
      { "title": "${isEnglish ? '[Feature 2]' : '[คุณสมบัติ 2]'}", "description": "${isEnglish ? '[Description 2]' : '[คำอธิบาย 2]'}" },
      { "title": "${isEnglish ? '[Feature 3]' : '[คุณสมบัติ 3]'}", "description": "${isEnglish ? '[Description 3]' : '[คำอธิบาย 3]'}" }
    ],
    "stats": [
      { "number": "1,000+", "label": "${isEnglish ? '[News per Day]' : '[ข่าวต่อวัน]'}" },
      { "number": "10+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "1M+", "label": "${isEnglish ? '[Readers]' : '[ผู้อ่าน]'}" }
    ]
  }`;
      }
    };
    
    let prompt: string = `News Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate news website JSON in ENGLISH with this structure:' : 
  'Generate news website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including news agency names, news categories, descriptions, and all other text content.'}
{
  "global": {
    "palette": {
      "primary": "red",
      "secondary": "blue",
      "bgTone": 50
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[News Agency]' : '[สื่อข่าว]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Subscribe]' : '[สมัครสมาชิก]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[News]' : '[ข่าว]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
${generateHeroSection(heroVariant)},
${generateAboutSection(aboutVariant)},
  "Menu": {
    "title": "${isEnglish ? '[Latest News]' : '[ข่าวล่าสุด]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Politics News]' : '[ข่าวการเมือง]'}",
        "price": "${isEnglish ? '[Free]' : '[ฟรี]'}",
        "description": "${isEnglish ? '[Political news and government policies]' : '[ข่าวการเมืองและนโยบายรัฐบาล]'}",
        "image": "https://via.placeholder.com/400x300?text=Politics+News",
        "imageAlt": "${isEnglish ? '[Politics News Image]' : '[รูปข่าวการเมือง]'}",
        "category": "politics"
      },
      {
        "name": "${isEnglish ? '[Economy News]' : '[ข่าวเศรษฐกิจ]'}",
        "price": "${isEnglish ? '[Free]' : '[ฟรี]'}",
        "description": "${isEnglish ? '[Economic and financial news]' : '[ข่าวเศรษฐกิจและการเงิน]'}",
        "image": "https://via.placeholder.com/400x300?text=Economy+News",
        "imageAlt": "${isEnglish ? '[Economy News Image]' : '[รูปข่าวเศรษฐกิจ]'}",
        "category": "economy"
      },
      {
        "name": "${isEnglish ? '[Sports News]' : '[ข่าวกีฬา]'}",
        "price": "${isEnglish ? '[Free]' : '[ฟรี]'}",
        "description": "${isEnglish ? '[Sports news and match results]' : '[ข่าวกีฬาและผลการแข่งขัน]'}",
        "image": "https://via.placeholder.com/400x300?text=Sports+News",
        "imageAlt": "${isEnglish ? '[Sports News Image]' : '[รูปข่าวกีฬา]'}",
        "category": "sports"
      },
      {
        "name": "${isEnglish ? '[Entertainment News]' : '[ข่าวบันเทิง]'}",
        "price": "${isEnglish ? '[Free]' : '[ฟรี]'}",
        "description": "${isEnglish ? '[Entertainment and celebrity news]' : '[ข่าวบันเทิงและดารา]'}",
        "image": "https://via.placeholder.com/400x300?text=Entertainment+News",
        "imageAlt": "${isEnglish ? '[Entertainment News Image]' : '[รูปข่าวบันเทิง]'}",
        "category": "entertainment"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact for News Submission]' : '[ติดต่อส่งข่าว]'}",
    "subtitle": "${isEnglish ? '[Ready to receive news every day]' : '[พร้อมรับข่าวสารทุกวัน]'}",
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "news@news.com",
    "businessHours": "${isEnglish ? '[24 hours]' : '[24 ชั่วโมง]'}",
    "contactFormTitle": "${isEnglish ? '[Submit News]' : '[ส่งข่าวสาร]'}",
    "contactFormCta": "${isEnglish ? '[Send News]' : '[ส่งข่าว]'}",
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
    "companyName": "${isEnglish ? '[Quality News Media]' : '[สื่อข่าวคุณภาพ]'}",
    "description": "${isEnglish ? '[News media providing accurate and up-to-date news]' : '[สื่อข่าวที่ให้บริการข่าวสารที่ถูกต้องและทันสมัย]'}",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Twitter", "url": "https://twitter.com", "icon": "🐦" },
      { "name": "YouTube", "url": "https://youtube.com", "icon": "📺" }
    ],
    "quickLinks": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[News]' : '[ข่าว]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ],
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@news.com"
  }
}`;

    return prompt;
  }
};
