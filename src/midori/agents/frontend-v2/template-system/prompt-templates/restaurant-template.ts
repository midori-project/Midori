/**
 * Restaurant Prompt Template
 * Template เฉพาะสำหรับร้านอาหาร + Variant Support
 */

export const restaurantPromptTemplate = {
  systemPrompt: `You are a restaurant website content generator. Generate JSON content for restaurant websites.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on food, dining, and restaurant-related content
- Use appropriate food categories: rice, noodles, soup, curry, meat, vegetarian
- Generate 6 menu items with realistic food names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Item+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- DO NOT use teal, cyan, or any other colors not listed above`,

  generateVariantAwarePrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): string => {
    const detectedLanguage = language || 'th';
    const isEnglish = detectedLanguage === 'en';
    
    // Generate dynamic Hero section based on selected variant
    const generateHeroSection = (variantId?: string) => {
      let heroSection = `  "Hero": {
    "badge": "${isEnglish ? '[Restaurant Badge]' : '[ป้ายร้านอาหาร]'}",
    "heading": "${isEnglish ? '[Main Heading]' : '[หัวข้อหลัก]'}",
    "subheading": "${isEnglish ? '[Subheading Description]' : '[คำอธิบายย่อย]'}",
    "ctaLabel": "${isEnglish ? '[Primary CTA]' : '[ปุ่มหลัก]'}",
    "secondaryCta": "${isEnglish ? '[Secondary CTA]' : '[ปุ่มรอง]'}"`;

      // Add variant-specific fields
      if (variantId === 'hero-stats' || variantId === 'hero-cards') {
        heroSection += `,
    "stat1": "[Stat Number 1]",
    "stat1Label": "${isEnglish ? '[Stat Label 1]' : '[ป้ายสถิติ 1]'}",
    "stat2": "[Stat Number 2]",
    "stat2Label": "${isEnglish ? '[Stat Label 2]' : '[ป้ายสถิติ 2]'}",
    "stat3": "[Stat Number 3]",
    "stat3Label": "${isEnglish ? '[Stat Label 3]' : '[ป้ายสถิติ 3]'}"`;
      } else if (variantId === 'hero-split' || variantId === 'hero-fullscreen' || variantId === 'hero-minimal') {
        heroSection += `,
    "heroImage": "https://via.placeholder.com/1920x1080?text=Hero+Image",
    "heroImageAlt": "${isEnglish ? '[Hero Image Description]' : '[คำอธิบายรูปหลัก]'}"`;
      }

      heroSection += `\n  }`;
      return heroSection;
    };

    // Generate dynamic About section based on selected variant
    const generateAboutSection = (variantId?: string) => {
      let aboutSection = `  "About": {
    "title": "${isEnglish ? '[About Title]' : '[หัวข้อเกี่ยวกับ]'}",
    "description": "${isEnglish ? '[About Description]' : '[คำอธิบายเกี่ยวกับ]'}",
    "features": [
      { "title": "${isEnglish ? '[Feature 1 Title]' : '[คุณสมบัติ 1]'}", "description": "${isEnglish ? '[Feature 1 Description]' : '[คำอธิบายคุณสมบัติ 1]'}" },
      { "title": "${isEnglish ? '[Feature 2 Title]' : '[คุณสมบัติ 2]'}", "description": "${isEnglish ? '[Feature 2 Description]' : '[คำอธิบายคุณสมบัติ 2]'}" },
      { "title": "${isEnglish ? '[Feature 3 Title]' : '[คุณสมบัติ 3]'}", "description": "${isEnglish ? '[Feature 3 Description]' : '[คำอธิบายคุณสมบัติ 3]'}" }
    ],
    "stats": [
      { "number": "[Stat 1 Number]", "label": "${isEnglish ? '[Stat 1 Label]' : '[ป้ายสถิติ 1]'}" },
      { "number": "[Stat 2 Number]", "label": "${isEnglish ? '[Stat 2 Label]' : '[ป้ายสถิติ 2]'}" },
      { "number": "[Stat 3 Number]", "label": "${isEnglish ? '[Stat 3 Label]' : '[ป้ายสถิติ 3]'}" },
      { "number": "[Stat 4 Number]", "label": "${isEnglish ? '[Stat 4 Label]' : '[ป้ายสถิติ 4]'}" }
    ]`;

      // Add variant-specific fields
      if (variantId === 'about-split') {
        aboutSection += `,
    "aboutImage": "[Restaurant interior image URL - will be generated dynamically]",
    "aboutImageAlt": "${isEnglish ? '[About Image Description]' : '[คำอธิบายรูปเกี่ยวกับ]'}"`;
      } else if (variantId === 'about-team') {
        aboutSection += `,
    "teamTitle": "${isEnglish ? '[Team Section Title]' : '[หัวข้อทีม]'}",
    "teamSubtitle": "${isEnglish ? '[Team Section Subtitle]' : '[คำอธิบายทีม]'}",
    "teamMembers": [
      {
        "name": "${isEnglish ? '[Team Member 1 Name]' : '[ชื่อสมาชิกทีม 1]'}",
        "role": "${isEnglish ? '[Team Member 1 Role]' : '[ตำแหน่งสมาชิกทีม 1]'}",
        "image": "https://via.placeholder.com/400x400?text=Team+Member",
        "bio": "${isEnglish ? '[Team Member 1 Bio]' : '[ประวัติสมาชิกทีม 1]'}"
      },
      {
        "name": "${isEnglish ? '[Team Member 2 Name]' : '[ชื่อสมาชิกทีม 2]'}",
        "role": "${isEnglish ? '[Team Member 2 Role]' : '[ตำแหน่งสมาชิกทีม 2]'}",
        "image": "https://via.placeholder.com/400x400?text=Team+Member",
        "bio": "${isEnglish ? '[Team Member 2 Bio]' : '[ประวัติสมาชิกทีม 2]'}"
      },
      {
        "name": "${isEnglish ? '[Team Member 3 Name]' : '[ชื่อสมาชิกทีม 3]'}",
        "role": "${isEnglish ? '[Team Member 3 Role]' : '[ตำแหน่งสมาชิกทีม 3]'}",
        "image": "https://via.placeholder.com/400x400?text=Team+Member",
        "bio": "${isEnglish ? '[Team Member 3 Bio]' : '[ประวัติสมาชิกทีม 3]'}"
      }
    ]`;
      } else if (variantId === 'about-timeline') {
        aboutSection += `,
    "timelineItems": [
      {
        "year": "${isEnglish ? '[Year 1]' : '[ปี 1]'}",
        "title": "${isEnglish ? '[Timeline Title 1]' : '[หัวข้อไทม์ไลน์ 1]'}",
        "description": "${isEnglish ? '[Timeline Description 1]' : '[คำอธิบายไทม์ไลน์ 1]'}"
      },
      {
        "year": "${isEnglish ? '[Year 2]' : '[ปี 2]'}",
        "title": "${isEnglish ? '[Timeline Title 2]' : '[หัวข้อไทม์ไลน์ 2]'}",
        "description": "${isEnglish ? '[Timeline Description 2]' : '[คำอธิบายไทม์ไลน์ 2]'}"
      },
      {
        "year": "${isEnglish ? '[Year 3]' : '[ปี 3]'}",
        "title": "${isEnglish ? '[Timeline Title 3]' : '[หัวข้อไทม์ไลน์ 3]'}",
        "description": "${isEnglish ? '[Timeline Description 3]' : '[คำอธิบายไทม์ไลน์ 3]'}"
      }
    ]`;
      } else if (variantId === 'about-story') {
        aboutSection += `,
    "storyItems": [
      {
        "year": "${isEnglish ? '[Story Year 1]' : '[ปีเรื่องราว 1]'}",
        "title": "${isEnglish ? '[Story Title 1]' : '[หัวข้อเรื่องราว 1]'}",
        "description": "${isEnglish ? '[Story Description 1]' : '[คำอธิบายเรื่องราว 1]'}"
      },
      {
        "year": "${isEnglish ? '[Story Year 2]' : '[ปีเรื่องราว 2]'}",
        "title": "${isEnglish ? '[Story Title 2]' : '[หัวข้อเรื่องราว 2]'}",
        "description": "${isEnglish ? '[Story Description 2]' : '[คำอธิบายเรื่องราว 2]'}"
      }
    ],
    "ctaLabel": "${isEnglish ? '[Call to Action Label]' : '[ปุ่มเรียกให้ดำเนินการ]'}"`;
      } else if (variantId === 'about-values') {
        aboutSection += `,
    "values": [
      {
        "title": "${isEnglish ? '[Value 1 Title]' : '[คุณค่า 1]'}",
        "description": "${isEnglish ? '[Value 1 Description]' : '[คำอธิบายคุณค่า 1]'}"
      },
      {
        "title": "${isEnglish ? '[Value 2 Title]' : '[คุณค่า 2]'}",
        "description": "${isEnglish ? '[Value 2 Description]' : '[คำอธิบายคุณค่า 2]'}"
      },
      {
        "title": "${isEnglish ? '[Value 3 Title]' : '[คุณค่า 3]'}",
        "description": "${isEnglish ? '[Value 3 Description]' : '[คำอธิบายคุณค่า 3]'}"
      }
    ],
    "heroImage": "https://via.placeholder.com/600x400?text=Company+Values",
    "heroImageAlt": "${isEnglish ? '[Values Image Description]' : '[คำอธิบายรูปคุณค่า]'}"`;
      } else if (variantId === 'about-team-showcase') {
        aboutSection += `,
    "teamMembers": [
      {
        "name": "${isEnglish ? '[Team Member 1 Name]' : '[ชื่อสมาชิกทีม 1]'}",
        "role": "${isEnglish ? '[Team Member 1 Role]' : '[ตำแหน่งสมาชิกทีม 1]'}",
        "image": "https://via.placeholder.com/400x400?text=Team+Member",
        "bio": "${isEnglish ? '[Team Member 1 Bio]' : '[ประวัติสมาชิกทีม 1]'}"
      },
      {
        "name": "${isEnglish ? '[Team Member 2 Name]' : '[ชื่อสมาชิกทีม 2]'}",
        "role": "${isEnglish ? '[Team Member 2 Role]' : '[ตำแหน่งสมาชิกทีม 2]'}",
        "image": "https://via.placeholder.com/400x400?text=Team+Member",
        "bio": "${isEnglish ? '[Team Member 2 Bio]' : '[ประวัติสมาชิกทีม 2]'}"
      },
      {
        "name": "${isEnglish ? '[Team Member 3 Name]' : '[ชื่อสมาชิกทีม 3]'}",
        "role": "${isEnglish ? '[Team Member 3 Role]' : '[ตำแหน่งสมาชิกทีม 3]'}",
        "image": "https://via.placeholder.com/400x400?text=Team+Member",
        "bio": "${isEnglish ? '[Team Member 3 Bio]' : '[ประวัติสมาชิกทีม 3]'}"
      }
    ],
    "missionTitle": "${isEnglish ? '[Mission Title]' : '[หัวข้อพันธกิจ]'}",
    "missionStatement": "${isEnglish ? '[Mission Statement]' : '[คำแถลงพันธกิจ]'}"`;
      } else if (variantId === 'about-hero') {
        aboutSection += `,
    "badge": "${isEnglish ? '[About Badge]' : '[ป้ายเกี่ยวกับ]'}",
    "ctaLabel": "${isEnglish ? '[Primary CTA]' : '[ปุ่มหลัก]'}",
    "secondaryCta": "${isEnglish ? '[Secondary CTA]' : '[ปุ่มรอง]'}",
    "heroImage": "https://via.placeholder.com/600x400?text=About+Hero",
    "heroImageAlt": "${isEnglish ? '[About Hero Image Description]' : '[คำอธิบายรูปเกี่ยวกับ]'}"`;
      }

      aboutSection += `\n  }`;
      return aboutSection;
    };

    // Get the selected variants
    const heroVariant = variantInfo?.variantsUsed?.['hero-basic'] || 'hero-stats';
    const aboutVariant = variantInfo?.variantsUsed?.['about-basic'] || 'about-split';
    
    let prompt: string = `Restaurant Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate restaurant website JSON in ENGLISH with this structure:' : 
  'Generate restaurant website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only.'}
{
  "global": {
    "palette": {
      "primary": "orange",
      "secondary": "orange",
      "bgTone": 100
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Restaurant Name]' : '[ชื่อร้านอาหาร]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Reservation Button]' : '[ปุ่มจองโต๊ะ]'}",
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
    "title": "${isEnglish ? '[Menu Title]' : '[หัวข้อเมนู]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Dish 1 Name]' : '[ชื่ออาหาร 1]'}",
        "price": "[Price 1]",
        "description": "${isEnglish ? '[Dish 1 Description]' : '[คำอธิบายอาหาร 1]'}",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "${isEnglish ? '[Dish 1 Image Alt]' : '[คำอธิบายรูปอาหาร 1]'}",
        "category": "rice"
      },
      {
        "name": "${isEnglish ? '[Dish 2 Name]' : '[ชื่ออาหาร 2]'}",
        "price": "[Price 2]",
        "description": "${isEnglish ? '[Dish 2 Description]' : '[คำอธิบายอาหาร 2]'}",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "${isEnglish ? '[Dish 2 Image Alt]' : '[คำอธิบายรูปอาหาร 2]'}",
        "category": "noodles"
      },
      {
        "name": "${isEnglish ? '[Dish 3 Name]' : '[ชื่ออาหาร 3]'}",
        "price": "[Price 3]",
        "description": "${isEnglish ? '[Dish 3 Description]' : '[คำอธิบายอาหาร 3]'}",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "${isEnglish ? '[Dish 3 Image Alt]' : '[คำอธิบายรูปอาหาร 3]'}",
        "category": "soup"
      },
      {
        "name": "${isEnglish ? '[Dish 4 Name]' : '[ชื่ออาหาร 4]'}",
        "price": "[Price 4]",
        "description": "${isEnglish ? '[Dish 4 Description]' : '[คำอธิบายอาหาร 4]'}",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "${isEnglish ? '[Dish 4 Image Alt]' : '[คำอธิบายรูปอาหาร 4]'}",
        "category": "curry"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact Title]' : '[ติดต่อเรา]'}",
    "subtitle": "${isEnglish ? '[Contact Subtitle]' : '[พร้อมให้บริการทุกวัน]'}",
    "address": "${isEnglish ? '[Restaurant Address]' : '[ที่อยู่ร้านอาหาร]'}",
    "phone": "${isEnglish ? '[Phone Number]' : '[เบอร์โทรศัพท์]'}",
    "email": "${isEnglish ? '[Email Address]' : '[อีเมล]'}",
    "businessHours": "${isEnglish ? '[Business Hours]' : '[เวลาทำการ]'}",
    "contactFormTitle": "${isEnglish ? '[Contact Form Title]' : '[หัวข้อแบบฟอร์มติดต่อ]'}",
    "contactFormCta": "${isEnglish ? '[Contact Form Button]' : '[ปุ่มส่งข้อความ]'}",
    "contactFormDescription": "${isEnglish ? '[Contact Form Description]' : '[คำอธิบายแบบฟอร์มติดต่อ]'}",
    "contactInfoTitle": "${isEnglish ? '[Contact Info Title]' : '[หัวข้อข้อมูลติดต่อ]'}",
    "contactInfoDescription": "${isEnglish ? '[Contact Info Description]' : '[คำอธิบายข้อมูลติดต่อ]'}",
    "nameLabel": "${isEnglish ? '[Name Label]' : '[ป้ายชื่อ]'}",
    "namePlaceholder": "${isEnglish ? '[Name Placeholder]' : '[ข้อความแนะนำชื่อ]'}",
    "emailLabel": "${isEnglish ? '[Email Label]' : '[ป้ายอีเมล]'}",
    "emailPlaceholder": "${isEnglish ? '[Email Placeholder]' : '[ข้อความแนะนำอีเมล]'}",
    "messageLabel": "${isEnglish ? '[Message Label]' : '[ป้ายข้อความ]'}",
    "messagePlaceholder": "${isEnglish ? '[Message Placeholder]' : '[ข้อความแนะนำข้อความ]'}",
    "addressLabel": "${isEnglish ? '[Address Label]' : '[ป้ายที่อยู่]'}",
    "phoneLabel": "${isEnglish ? '[Phone Label]' : '[ป้ายโทรศัพท์]'}",
    "businessHoursLabel": "${isEnglish ? '[Business Hours Label]' : '[ป้ายเวลาทำการ]'}"
  },
  "Footer": {
    "companyName": "${isEnglish ? '[Restaurant Name]' : '[ชื่อร้านอาหาร]'}",
    "description": "${isEnglish ? '[Restaurant Description]' : '[คำอธิบายร้านอาหาร]'}",
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
    "address": "${isEnglish ? '[Restaurant Address]' : '[ที่อยู่ร้านอาหาร]'}",
    "phone": "${isEnglish ? '[Phone Number]' : '[เบอร์โทรศัพท์]'}",
    "email": "${isEnglish ? '[Email Address]' : '[อีเมล]'}"
  },
  "Theme": {
    "radius": "8px",
    "spacing": "1rem"
  }
}`;

    // Note: Variant-specific instructions are not needed for content generation
    // AI only needs to generate content according to the template structure
    // Layout and styling are handled by the frontend renderer
    
    // Add final language enforcement
    if (!isEnglish) {
      prompt += `\n\n🇹🇭 CRITICAL: All text content MUST be in THAI language only.`;
    }
    
    return prompt;
  },

  getOptimizedPrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): { systemPrompt: string; userPrompt: string } => {
    return {
      systemPrompt: restaurantPromptTemplate.systemPrompt,
      userPrompt: restaurantPromptTemplate.generateVariantAwarePrompt(keywords, colorHint, concreteManifest, variantInfo, language)
    };
  }
};
