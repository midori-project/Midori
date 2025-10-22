/**
 * E-commerce Prompt Template
 * Template เฉพาะสำหรับร้านค้าออนไลน์
 */

export const ecommercePromptTemplate = {
  systemPrompt: `You are an e-commerce website content generator. Generate JSON content for online stores.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on products, shopping, and retail-related content
- Use appropriate product categories: product, book, stationery, toy, clothing, electronics
- Generate 6 product items with realistic product names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Product+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- DO NOT use teal, cyan, or any other colors not listed above`,

  generateVariantAwarePrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): string => {
    const detectedLanguage = language || 'th';
    const isEnglish = detectedLanguage === 'en';
    
    // Extract variant information
    const heroVariant = variantInfo?.variantsUsed?.['hero-basic'] || 'hero-basic';
    const aboutVariant = variantInfo?.variantsUsed?.['about-basic'] || 'about-basic';
    
    // Dynamic Hero Section Generation
    const generateHeroSection = (variantId?: string) => {
      if (variantId === 'hero-stats') {
        return `"Hero": {
    "badge": "${isEnglish ? '[Store Badge]' : '[ป้ายร้านค้า]'}",
    "heading": "${isEnglish ? '[Main Heading]' : '[หัวข้อหลัก]'}",
    "subheading": "${isEnglish ? '[Subheading Description]' : '[คำอธิบายย่อย]'}",
    "ctaLabel": "${isEnglish ? '[Primary CTA]' : '[ปุ่มหลัก]'}",
    "secondaryCta": "${isEnglish ? '[Secondary CTA]' : '[ปุ่มรอง]'}",
    "heroImage": "https://via.placeholder.com/1920x1080?text=Hero+Image",
    "heroImageAlt": "${isEnglish ? '[Hero Image Description]' : '[คำอธิบายรูปหลัก]'}",
    "stat1": "[Stat Number 1]",
    "stat1Label": "${isEnglish ? '[Stat Label 1]' : '[ป้ายสถิติ 1]'}",
    "stat2": "[Stat Number 2]",
    "stat2Label": "${isEnglish ? '[Stat Label 2]' : '[ป้ายสถิติ 2]'}",
    "stat3": "[Stat Number 3]",
    "stat3Label": "${isEnglish ? '[Stat Label 3]' : '[ป้ายสถิติ 3]'}"
  }`;
      } else {
        return `"Hero": {
    "badge": "${isEnglish ? '[Store Badge]' : '[ป้ายร้านค้า]'}",
    "heading": "${isEnglish ? '[Main Heading]' : '[หัวข้อหลัก]'}",
    "subheading": "${isEnglish ? '[Subheading Description]' : '[คำอธิบายย่อย]'}",
    "ctaLabel": "${isEnglish ? '[Primary CTA]' : '[ปุ่มหลัก]'}",
    "secondaryCta": "${isEnglish ? '[Secondary CTA]' : '[ปุ่มรอง]'}",
    "heroImage": "https://via.placeholder.com/1920x1080?text=Hero+Image",
    "heroImageAlt": "${isEnglish ? '[Hero Image Description]' : '[คำอธิบายรูปหลัก]'}"
  }`;
      }
    };

    // Dynamic About Section Generation
    const generateAboutSection = (variantId?: string) => {
      if (variantId === 'about-split') {
        return `"About": {
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
    ],
    "aboutImage": "[E-commerce store image URL - will be generated dynamically]",
    "aboutImageAlt": "${isEnglish ? '[About Image Description]' : '[คำอธิบายรูปเกี่ยวกับ]'}"
  }`;
      } else if (variantId === 'about-hero') {
        return `"About": {
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
    ],
    "heroImage": "[E-commerce hero image URL - will be generated dynamically]",
    "heroImageAlt": "${isEnglish ? '[Hero Image Description]' : '[คำอธิบายรูปหลัก]'}"
  }`;
      } else if (variantId === 'about-timeline') {
        return `"About": {
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
    ],
    "timelineItems": [
      { "year": "${isEnglish ? '[Year 1]' : '[ปี 1]'}", "title": "${isEnglish ? '[Timeline Event 1]' : '[เหตุการณ์ไทม์ไลน์ 1]'}", "description": "${isEnglish ? '[Timeline Description 1]' : '[คำอธิบายไทม์ไลน์ 1]'}" },
      { "year": "${isEnglish ? '[Year 2]' : '[ปี 2]'}", "title": "${isEnglish ? '[Timeline Event 2]' : '[เหตุการณ์ไทม์ไลน์ 2]'}", "description": "${isEnglish ? '[Timeline Description 2]' : '[คำอธิบายไทม์ไลน์ 2]'}" },
      { "year": "${isEnglish ? '[Year 3]' : '[ปี 3]'}", "title": "${isEnglish ? '[Timeline Event 3]' : '[เหตุการณ์ไทม์ไลน์ 3]'}", "description": "${isEnglish ? '[Timeline Description 3]' : '[คำอธิบายไทม์ไลน์ 3]'}" }
    ]
  }`;
      } else if (variantId === 'about-story') {
        return `"About": {
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
    ],
    "storyItems": [
      { "year": "${isEnglish ? '[Year 1]' : '[ปี 1]'}", "title": "${isEnglish ? '[Story Event 1]' : '[เหตุการณ์เรื่องราว 1]'}", "description": "${isEnglish ? '[Story Description 1]' : '[คำอธิบายเรื่องราว 1]'}" },
      { "year": "${isEnglish ? '[Year 2]' : '[ปี 2]'}", "title": "${isEnglish ? '[Story Event 2]' : '[เหตุการณ์เรื่องราว 2]'}", "description": "${isEnglish ? '[Story Description 2]' : '[คำอธิบายเรื่องราว 2]'}" },
      { "year": "${isEnglish ? '[Year 3]' : '[ปี 3]'}", "title": "${isEnglish ? '[Story Event 3]' : '[เหตุการณ์เรื่องราว 3]'}", "description": "${isEnglish ? '[Story Description 3]' : '[คำอธิบายเรื่องราว 3]'}" }
    ],
    "values": [
      { "title": "${isEnglish ? '[Value 1 Title]' : '[คุณค่า 1]'}", "description": "${isEnglish ? '[Value 1 Description]' : '[คำอธิบายคุณค่า 1]'}" },
      { "title": "${isEnglish ? '[Value 2 Title]' : '[คุณค่า 2]'}", "description": "${isEnglish ? '[Value 2 Description]' : '[คำอธิบายคุณค่า 2]'}" },
      { "title": "${isEnglish ? '[Value 3 Title]' : '[คุณค่า 3]'}", "description": "${isEnglish ? '[Value 3 Description]' : '[คำอธิบายคุณค่า 3]'}" }
    ],
    "ctaLabel": "${isEnglish ? '[Call to Action Label]' : '[ปุ่มเรียกให้ดำเนินการ]'}"
  }`;
      } else if (variantId === 'about-values') {
        return `"About": {
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
    ],
    "values": [
      { "title": "${isEnglish ? '[Value 1 Title]' : '[คุณค่า 1]'}", "description": "${isEnglish ? '[Value 1 Description]' : '[คำอธิบายคุณค่า 1]'}" },
      { "title": "${isEnglish ? '[Value 2 Title]' : '[คุณค่า 2]'}", "description": "${isEnglish ? '[Value 2 Description]' : '[คำอธิบายคุณค่า 2]'}" },
      { "title": "${isEnglish ? '[Value 3 Title]' : '[คุณค่า 3]'}", "description": "${isEnglish ? '[Value 3 Description]' : '[คำอธิบายคุณค่า 3]'}" }
    ],
    "heroImage": "https://via.placeholder.com/600x400?text=Company+Values",
    "heroImageAlt": "${isEnglish ? '[Values Image Description]' : '[คำอธิบายรูปคุณค่า]'}"
  }`;
      } else if (variantId === 'about-team') {
        return `"About": {
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
    ],
    "teamTitle": "${isEnglish ? '[Team Section Title]' : '[หัวข้อทีม]'}",
    "teamSubtitle": "${isEnglish ? '[Team Section Subtitle]' : '[คำอธิบายทีม]'}",
    "teamMembers": [
      { "name": "${isEnglish ? '[Team Member 1 Name]' : '[ชื่อสมาชิกทีม 1]'}", "role": "${isEnglish ? '[Team Member 1 Role]' : '[ตำแหน่งสมาชิกทีม 1]'}", "image": "https://via.placeholder.com/400x400?text=Team+Member", "bio": "${isEnglish ? '[Team Member 1 Bio]' : '[ประวัติสมาชิกทีม 1]'}" },
      { "name": "${isEnglish ? '[Team Member 2 Name]' : '[ชื่อสมาชิกทีม 2]'}", "role": "${isEnglish ? '[Team Member 2 Role]' : '[ตำแหน่งสมาชิกทีม 2]'}", "image": "https://via.placeholder.com/400x400?text=Team+Member", "bio": "${isEnglish ? '[Team Member 2 Bio]' : '[ประวัติสมาชิกทีม 2]'}" },
      { "name": "${isEnglish ? '[Team Member 3 Name]' : '[ชื่อสมาชิกทีม 3]'}", "role": "${isEnglish ? '[Team Member 3 Role]' : '[ตำแหน่งสมาชิกทีม 3]'}", "image": "https://via.placeholder.com/400x400?text=Team+Member", "bio": "${isEnglish ? '[Team Member 3 Bio]' : '[ประวัติสมาชิกทีม 3]'}" }
    ]
  }`;
      } else if (variantId === 'about-team-showcase') {
        return `"About": {
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
    ],
    "teamMembers": [
      { "name": "${isEnglish ? '[Team Member 1 Name]' : '[ชื่อสมาชิกทีม 1]'}", "role": "${isEnglish ? '[Team Member 1 Role]' : '[ตำแหน่งสมาชิกทีม 1]'}", "image": "https://via.placeholder.com/400x400?text=Team+Member", "bio": "${isEnglish ? '[Team Member 1 Bio]' : '[ประวัติสมาชิกทีม 1]'}" },
      { "name": "${isEnglish ? '[Team Member 2 Name]' : '[ชื่อสมาชิกทีม 2]'}", "role": "${isEnglish ? '[Team Member 2 Role]' : '[ตำแหน่งสมาชิกทีม 2]'}", "image": "https://via.placeholder.com/400x400?text=Team+Member", "bio": "${isEnglish ? '[Team Member 2 Bio]' : '[ประวัติสมาชิกทีม 2]'}" },
      { "name": "${isEnglish ? '[Team Member 3 Name]' : '[ชื่อสมาชิกทีม 3]'}", "role": "${isEnglish ? '[Team Member 3 Role]' : '[ตำแหน่งสมาชิกทีม 3]'}", "image": "https://via.placeholder.com/400x400?text=Team+Member", "bio": "${isEnglish ? '[Team Member 3 Bio]' : '[ประวัติสมาชิกทีม 3]'}" }
    ],
    "missionTitle": "${isEnglish ? '[Mission Title]' : '[หัวข้อพันธกิจ]'}",
    "missionStatement": "${isEnglish ? '[Mission Statement]' : '[คำแถลงพันธกิจ]'}"
  }`;
      } else {
        return `"About": {
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
    ],
    "aboutImage": "[E-commerce store image URL - will be generated dynamically]",
    "aboutImageAlt": "${isEnglish ? '[About Image Description]' : '[คำอธิบายรูปเกี่ยวกับ]'}"
  }`;
      }
    };
    
    let prompt: string = `E-commerce Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate e-commerce website JSON in ENGLISH with this structure:' : 
  'Generate e-commerce website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including brand names, headings, descriptions, and product names.'}
{
  "global": {
    "palette": {
      "primary": "blue",
      "secondary": "blue",
      "bgTone": 100
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Store Name]' : '[ชื่อร้าน]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Shop Button]' : '[ปุ่มซื้อ]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Products]' : '[สินค้า]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
${generateHeroSection(heroVariant)},
${generateAboutSection(aboutVariant)},
  "Menu": {
    "title": "${isEnglish ? '[Products Title]' : '[หัวข้อสินค้า]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Product 1 Name]' : '[ชื่อสินค้า 1]'}",
        "price": "[Price 1]",
        "description": "${isEnglish ? '[Product 1 Description]' : '[คำอธิบายสินค้า 1]'}",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "${isEnglish ? '[Product 1 Image Alt]' : '[คำอธิบายรูปสินค้า 1]'}",
        "category": "product"
      },
      {
        "name": "${isEnglish ? '[Product 2 Name]' : '[ชื่อสินค้า 2]'}",
        "price": "[Price 2]",
        "description": "${isEnglish ? '[Product 2 Description]' : '[คำอธิบายสินค้า 2]'}",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "${isEnglish ? '[Product 2 Image Alt]' : '[คำอธิบายรูปสินค้า 2]'}",
        "category": "book"
      },
      {
        "name": "${isEnglish ? '[Product 3 Name]' : '[ชื่อสินค้า 3]'}",
        "price": "[Price 3]",
        "description": "${isEnglish ? '[Product 3 Description]' : '[คำอธิบายสินค้า 3]'}",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "${isEnglish ? '[Product 3 Image Alt]' : '[คำอธิบายรูปสินค้า 3]'}",
        "category": "stationery"
      },
      {
        "name": "${isEnglish ? '[Product 4 Name]' : '[ชื่อสินค้า 4]'}",
        "price": "[Price 4]",
        "description": "${isEnglish ? '[Product 4 Description]' : '[คำอธิบายสินค้า 4]'}",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "${isEnglish ? '[Product 4 Image Alt]' : '[คำอธิบายรูปสินค้า 4]'}",
        "category": "toy"
      },
      {
        "name": "${isEnglish ? '[Product 5 Name]' : '[ชื่อสินค้า 5]'}",
        "price": "[Price 5]",
        "description": "${isEnglish ? '[Product 5 Description]' : '[คำอธิบายสินค้า 5]'}",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "${isEnglish ? '[Product 5 Image Alt]' : '[คำอธิบายรูปสินค้า 5]'}",
        "category": "clothing"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact Title]' : '[หัวข้อติดต่อ]'}",
    "subtitle": "${isEnglish ? '[Contact Subtitle]' : '[คำอธิบายติดต่อ]'}",
    "address": "${isEnglish ? '[Store Address]' : '[ที่อยู่ร้าน]'}",
    "phone": "[Phone Number]",
    "email": "[Email Address]",
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
    "companyName": "${isEnglish ? '[Store Name]' : '[ชื่อร้าน]'}",
    "description": "${isEnglish ? '[Store Description]' : '[คำอธิบายร้าน]'}",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Line", "url": "https://line.me", "icon": "💬" }
    ],
    "quickLinks": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Products]' : '[สินค้า]'}", "href": "/products" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ],
    "address": "${isEnglish ? '[Store Address]' : '[ที่อยู่ร้าน]'}",
    "phone": "[Phone Number]",
    "email": "[Email Address]"
  },
  "Theme": {
    "radius": "8px",
    "spacing": "1rem"
  }
}`;

    // Add variant-specific instructions if needed
    if (variantInfo?.variantsUsed) {
      prompt += `\n\n🎯 VARIANT-SPECIFIC INSTRUCTIONS:`;
      
      for (const [blockId, variantId] of Object.entries(variantInfo.variantsUsed)) {
        const variantFields = variantInfo.variantSpecificFields?.[blockId] || [];
        
        if (variantFields.length > 0) {
          prompt += `\n\n⚠️ IMPORTANT: Block '${blockId}' uses variant '${variantId}' which REQUIRES these additional fields:`;
          
          if (variantId === 'hero-stats' && blockId === 'hero-basic') {
            prompt += `\n- stat1: "[Stat Number 1]" (number with + sign)
- stat1Label: "${isEnglish ? '[Stat Label 1]' : '[ป้ายสถิติ 1]'}" (label text)
- stat2: "[Stat Number 2]" (number with + sign)  
- stat2Label: "${isEnglish ? '[Stat Label 2]' : '[ป้ายสถิติ 2]'}" (label text)
- stat3: "[Stat Number 3]" (number with + sign)
- stat3Label: "${isEnglish ? '[Stat Label 3]' : '[ป้ายสถิติ 3]'}" (label text)`;
          } else if (variantId === 'hero-split' && blockId === 'hero-basic') {
            prompt += `\n- heroImage: "https://via.placeholder.com/1920x1080?text=Store+Interior" (landscape image)
- heroImageAlt: "${isEnglish ? '[Hero Image Description]' : '[คำอธิบายรูปหลัก]'}" (image description)
- ctaLabel: "${isEnglish ? '[Primary CTA]' : '[ปุ่มหลัก]'}" (primary CTA)
- secondaryCta: "${isEnglish ? '[Secondary CTA]' : '[ปุ่มรอง]'}" (secondary CTA)`;
          } else if (variantId === 'about-split' && blockId === 'about-basic') {
            prompt += `\n- aboutImage: "[Store interior image URL - will be generated dynamically]" (store interior image)
- aboutImageAlt: "${isEnglish ? '[About Image Description]' : '[คำอธิบายรูปเกี่ยวกับ]'}" (image description)`;
          } else if (variantId === 'about-team' && blockId === 'about-basic') {
            prompt += `\n- teamTitle: "${isEnglish ? '[Team Section Title]' : '[หัวข้อทีม]'}" (team section heading)
- teamSubtitle: "${isEnglish ? '[Team Section Subtitle]' : '[คำอธิบายทีม]'}" (team section description)
- teamMembers: [array of 3-4 team member objects with name, role, image, bio]`;
          } else if (variantId === 'about-timeline' && blockId === 'about-basic') {
            prompt += `\n- timelineItems: [array of 4-5 timeline objects with year, title, description]`;
          } else if (variantId === 'about-team-showcase' && blockId === 'about-basic') {
            prompt += `\n- teamMembers: [array of 3-4 team member objects with name, role, image, bio]
- missionTitle: "${isEnglish ? '[Mission Title]' : '[หัวข้อพันธกิจ]'}" (mission section heading)
- missionStatement: "${isEnglish ? '[Mission Statement]' : '[คำแถลงพันธกิจ]'}" (mission description)`;
          } else if (variantId === 'about-story' && blockId === 'about-basic') {
            prompt += `\n- storyItems: [array of 4-5 story objects with year, title, description]
- ctaLabel: "${isEnglish ? '[Call to Action Label]' : '[ปุ่มเรียกใช้]'}" (button text)`;
          } else if (variantId === 'about-values' && blockId === 'about-basic') {
            prompt += `\n- values: [array of 3-4 value objects with title, description]
- heroImage: "https://via.placeholder.com/600x400?text=Company+Values" (values section image)
- heroImageAlt: "${isEnglish ? '[Values Image Description]' : '[คำอธิบายรูปค่านิยม]'}" (image description)`;
          } else if (variantId === 'about-hero' && blockId === 'about-basic') {
            prompt += `\n- badge: "${isEnglish ? '[About Badge]' : '[ป้ายเกี่ยวกับ]'}" (badge text)
- ctaLabel: "${isEnglish ? '[Primary CTA]' : '[ปุ่มหลัก]'}" (primary button text)
- secondaryCta: "${isEnglish ? '[Secondary CTA]' : '[ปุ่มรอง]'}" (secondary button text)
- heroImage: "https://via.placeholder.com/600x400?text=About+Hero" (hero image)
- heroImageAlt: "${isEnglish ? '[About Hero Image Description]' : '[คำอธิบายรูปเกี่ยวกับ]'}" (image description)`;
          }
        }
      }
    }
    
    // Add final language enforcement
    if (!isEnglish) {
      prompt += `\n\n🇹🇭 CRITICAL: All text content MUST be in THAI language only. Do not use any English text in brand names, headings, descriptions, or any other text fields.`;
    }
    
    return prompt;
  },

  getOptimizedPrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string) => {
    return {
      systemPrompt: ecommercePromptTemplate.systemPrompt,
      userPrompt: ecommercePromptTemplate.generateVariantAwarePrompt(keywords, colorHint, concreteManifest, variantInfo, language)
    };
  }
};
