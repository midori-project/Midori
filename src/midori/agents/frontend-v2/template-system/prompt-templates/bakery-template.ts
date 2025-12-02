/**
 * Bakery Prompt Template
 * Template เฉพาะสำหรับ Bakery/Pastry
 */

export const bakeryPromptTemplate = {
  systemPrompt: `You are a professional content generator for bakery and pastry shops.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on baked goods, sweets, and delicious treats content
- Use appropriate bakery categories: bread, cake, pastry, dessert, cookie, muffin
- Generate 6 bakery items with realistic product names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Product+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

CRITICAL: Text Length Limits:
- heading: MAX 80 characters (keep it sweet and tempting)
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
    const heroVariant = variantInfo?.variantsUsed?.['hero-basic'] || 'hero-split';
    const aboutVariant = variantInfo?.variantsUsed?.['about-basic'] || 'about-split';
    
    const generateHeroSection = (variant: string) => {
      switch (variant) {
        case 'hero-minimal':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Quality Bakery]' : '[เบเกอรี่คุณภาพ]'}",
    "heading": "${isEnglish ? '[Fresh Baked Daily]' : '[ความหอมหวานที่อบสดใหม่ทุกวัน]'}",
    "subheading": "${isEnglish ? '[Bread, cakes and sweets baked fresh daily]' : '[ขนมปัง เค้ก และของหวานคุณภาพ อบสดใหม่ทุกวัน]'}",
    "ctaLabel": "${isEnglish ? '[View Menu]' : '[ดูเมนู]'}",
    "secondaryCta": "${isEnglish ? '[Order Now]' : '[สั่งซื้อ]'}"
  }`;
        case 'hero-split':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Quality Bakery]' : '[เบเกอรี่คุณภาพ]'}",
    "heading": "${isEnglish ? '[Sweet Aromas Baked Fresh Daily]' : '[ความหอมหวานที่อบสดใหม่ทุกวัน]'}",
    "subheading": "${isEnglish ? '[Quality bread, cakes and sweets baked fresh daily with care]' : '[ขนมปัง เค้ก และของหวานคุณภาพ อบสดใหม่ทุกวันด้วยความใส่ใจ]'}",
    "ctaLabel": "${isEnglish ? '[View Menu]' : '[ดูเมนู]'}",
    "secondaryCta": "${isEnglish ? '[Order Now]' : '[สั่งซื้อ]'}"
  }`;
        case 'hero-fullscreen':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Artisan Bakery]' : '[เบเกอรี่หัตถกรรม]'}",
    "heading": "${isEnglish ? '[Handcrafted Delights]' : '[ของหวานหัตถกรรม]'}",
    "subheading": "${isEnglish ? '[Experience the art of baking]' : '[สัมผัสศิลปะการอบ]'}",
    "ctaLabel": "${isEnglish ? '[Taste Now]' : '[ชิมเลย]'}",
    "secondaryCta": "${isEnglish ? '[Visit Us]' : '[เยี่ยมเรา]'}"
  }`;
        default:
          return `  "Hero": {
    "badge": "${isEnglish ? '[Bakery]' : '[เบเกอรี่]'}",
    "heading": "${isEnglish ? '[Bakery Name]' : '[ชื่อเบเกอรี่]'}",
    "subheading": "${isEnglish ? '[Fresh baked goods and sweets]' : '[เบเกอรี่และของหวานสดใหม่]'}",
    "ctaLabel": "${isEnglish ? '[View Menu]' : '[ดูเมนู]'}",
    "secondaryCta": "${isEnglish ? '[Order Now]' : '[สั่งซื้อ]'}"
  }`;
      }
    };

    const generateAboutSection = (variant: string) => {
      switch (variant) {
        case 'about-split':
          return `  "About": {
    "title": "${isEnglish ? '[About Our Bakery]' : '[เกี่ยวกับร้านเบเกอรี่ของเรา]'}",
    "description": "${isEnglish ? '[We are a bakery providing quality bread, cakes and sweets baked fresh daily]' : '[เราเป็นร้านเบเกอรี่ที่ให้บริการขนมปัง เค้ก และของหวานคุณภาพ อบสดใหม่ทุกวัน]'}",
    "features": [
      {
        "title": "${isEnglish ? '[Fresh Daily]' : '[อบสดใหม่]'}",
        "description": "${isEnglish ? '[Baked fresh every day]' : '[อบสดใหม่ทุกวัน]'}"
      },
      {
        "title": "${isEnglish ? '[Quality Ingredients]' : '[คุณภาพดี]'}",
        "description": "${isEnglish ? '[Using high quality ingredients]' : '[ใช้ส่วนผสมคุณภาพสูง]'}"
      },
      {
        "title": "${isEnglish ? '[Great Taste]' : '[รสชาติดี]'}",
        "description": "${isEnglish ? '[Delicious taste that pleases]' : '[รสชาติที่อร่อยถูกใจ]'}"
      }
    ],
    "stats": [
      { "number": "50+", "label": "${isEnglish ? '[Menu Items]' : '[เมนู]'}" },
      { "number": "3+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "100%", "label": "${isEnglish ? '[Satisfaction]' : '[ความพึงพอใจ]'}" }
    ]
  }`;
        default:
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[Bakery description]' : '[คำอธิบายร้านเบเกอรี่]'}",
    "features": [
      { "title": "${isEnglish ? '[Feature 1]' : '[คุณสมบัติ 1]'}", "description": "${isEnglish ? '[Description 1]' : '[คำอธิบาย 1]'}" },
      { "title": "${isEnglish ? '[Feature 2]' : '[คุณสมบัติ 2]'}", "description": "${isEnglish ? '[Description 2]' : '[คำอธิบาย 2]'}" },
      { "title": "${isEnglish ? '[Feature 3]' : '[คุณสมบัติ 3]'}", "description": "${isEnglish ? '[Description 3]' : '[คำอธิบาย 3]'}" }
    ],
    "stats": [
      { "number": "50+", "label": "${isEnglish ? '[Menu Items]' : '[เมนู]'}" },
      { "number": "3+", "label": "${isEnglish ? '[Years Experience]' : '[ปีประสบการณ์]'}" },
      { "number": "100%", "label": "${isEnglish ? '[Satisfaction]' : '[ความพึงพอใจ]'}" }
    ]
  }`;
      }
    };
    
    let prompt: string = `Bakery Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate bakery website JSON in ENGLISH with this structure:' : 
  'Generate bakery website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including bakery names, product names, descriptions, and all other text content.'}
{
  "global": {
    "palette": {
      "primary": "orange",
      "secondary": "yellow",
      "bgTone": 50
    },
    "tokens": {
      "radius": "12px",
      "spacing": "1.25rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Bakery Name]' : '[ชื่อเบเกอรี่]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Order Now]' : '[สั่งซื้อ]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Menu]' : '[เมนู]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
${generateHeroSection(heroVariant)},
${generateAboutSection(aboutVariant)},
  "Menu": {
    "title": "${isEnglish ? '[Bakery Menu]' : '[เมนูเบเกอรี่]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[French Bread]' : '[ขนมปังฝรั่งเศส]'}",
        "price": "45",
        "description": "${isEnglish ? '[Crispy outside, soft inside French bread]' : '[ขนมปังฝรั่งเศสกรอบนอกนุ่มใน]'}",
        "image": "https://via.placeholder.com/400x300?text=French+Bread",
        "imageAlt": "${isEnglish ? '[French Bread Image]' : '[รูปขนมปังฝรั่งเศส]'}",
        "category": "bread"
      },
      {
        "name": "${isEnglish ? '[Chocolate Cake]' : '[เค้กช็อคโกแลต]'}",
        "price": "120",
        "description": "${isEnglish ? '[Rich chocolate cake]' : '[เค้กช็อคโกแลตเข้มข้น]'}",
        "image": "https://via.placeholder.com/400x300?text=Chocolate+Cake",
        "imageAlt": "${isEnglish ? '[Chocolate Cake Image]' : '[รูปเค้กช็อคโกแลต]'}",
        "category": "cake"
      },
      {
        "name": "${isEnglish ? '[Chocolate Cookies]' : '[คุกกี้ช็อคโกแลต]'}",
        "price": "25",
        "description": "${isEnglish ? '[Chocolate chip cookies]' : '[คุกกี้ช็อคโกแลตชิป]'}",
        "image": "https://via.placeholder.com/400x300?text=Chocolate+Cookies",
        "imageAlt": "${isEnglish ? '[Chocolate Cookies Image]' : '[รูปคุกกี้ช็อคโกแลต]'}",
        "category": "cookie"
      },
      {
        "name": "${isEnglish ? '[Blueberry Muffin]' : '[มัฟฟินบลูเบอร์รี่]'}",
        "price": "35",
        "description": "${isEnglish ? '[Fresh blueberry muffin]' : '[มัฟฟินบลูเบอร์รี่สด]'}",
        "image": "https://via.placeholder.com/400x300?text=Blueberry+Muffin",
        "imageAlt": "${isEnglish ? '[Blueberry Muffin Image]' : '[รูปมัฟฟินบลูเบอร์รี่]'}",
        "category": "muffin"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact for Orders]' : '[ติดต่อสั่งซื้อ]'}",
    "subtitle": "${isEnglish ? '[Ready to serve every day]' : '[พร้อมให้บริการทุกวัน]'}",
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@bakery.com",
    "businessHours": "${isEnglish ? '[Mon-Sun 6:00-20:00]' : '[จันทร์-อาทิตย์ 6:00-20:00]'}",
    "contactFormTitle": "${isEnglish ? '[Order Bakery Items]' : '[สั่งซื้อเบเกอรี่]'}",
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
    "companyName": "${isEnglish ? '[Quality Bakery]' : '[ร้านเบเกอรี่คุณภาพ]'}",
    "description": "${isEnglish ? '[Bakery providing quality bread, cakes and sweets]' : '[ร้านเบเกอรี่ที่ให้บริการขนมปัง เค้ก และของหวานคุณภาพ]'}",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Line", "url": "https://line.me", "icon": "💬" }
    ],
    "quickLinks": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Menu]' : '[เมนู]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ],
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@bakery.com"
  }
}`;

    return prompt;
  }
};
