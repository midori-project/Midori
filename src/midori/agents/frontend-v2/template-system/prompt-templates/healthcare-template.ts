/**
 * Healthcare Prompt Template
 * Template เฉพาะสำหรับสถานพยาบาล
 */

export const healthcarePromptTemplate = {
  systemPrompt: `You are a healthcare website content generator. Generate JSON content for medical facilities.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on health, medical, and wellness-related content
- Use appropriate service categories: medicine, health, medical, pharmacy, wellness
- Generate 6 service items with realistic medical service names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Service+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- DO NOT use teal, cyan, or any other colors not listed above`,

  generateVariantAwarePrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): string => {
    const detectedLanguage = language || 'th';
    const isEnglish = detectedLanguage === 'en';
    
    let prompt: string = `Healthcare Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate healthcare website JSON in ENGLISH with this structure:' : 
  'Generate healthcare website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including clinic names, service descriptions, and all other text content.'}
{
  "global": {
    "palette": {
      "primary": "green",
      "secondary": "blue",
      "bgTone": 100
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Clinic Name]' : '[ชื่อคลินิก]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Appointment Button]' : '[ปุ่มนัดหมาย]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Services]' : '[บริการ]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
  "Hero": {
    "badge": "${isEnglish ? '[Clinic Badge]' : '[ป้ายคลินิก]'}",
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
  },
  "About": {
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
    "aboutImage": "[Medical facility image URL - will be generated dynamically]",
    "aboutImageAlt": "${isEnglish ? '[About Image Description]' : '[คำอธิบายรูปเกี่ยวกับ]'}",
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
    ]
  },
  "Menu": {
    "title": "${isEnglish ? '[Services Title]' : '[หัวข้อบริการ]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Service 1 Name]' : '[ชื่อบริการ 1]'}",
        "price": "[Price 1]",
        "description": "${isEnglish ? '[Service 1 Description]' : '[คำอธิบายบริการ 1]'}",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "${isEnglish ? '[Service 1 Image Alt]' : '[คำอธิบายรูปบริการ 1]'}",
        "category": "medicine"
      },
      {
        "name": "${isEnglish ? '[Service 2 Name]' : '[ชื่อบริการ 2]'}",
        "price": "[Price 2]",
        "description": "${isEnglish ? '[Service 2 Description]' : '[คำอธิบายบริการ 2]'}",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "${isEnglish ? '[Service 2 Image Alt]' : '[คำอธิบายรูปบริการ 2]'}",
        "category": "health"
      },
      {
        "name": "${isEnglish ? '[Service 3 Name]' : '[ชื่อบริการ 3]'}",
        "price": "[Price 3]",
        "description": "${isEnglish ? '[Service 3 Description]' : '[คำอธิบายบริการ 3]'}",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "${isEnglish ? '[Service 3 Image Alt]' : '[คำอธิบายรูปบริการ 3]'}",
        "category": "medical"
      },
      {
        "name": "${isEnglish ? '[Service 4 Name]' : '[ชื่อบริการ 4]'}",
        "price": "[Price 4]",
        "description": "${isEnglish ? '[Service 4 Description]' : '[คำอธิบายบริการ 4]'}",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "${isEnglish ? '[Service 4 Image Alt]' : '[คำอธิบายรูปบริการ 4]'}",
        "category": "pharmacy"
      },
      {
        "name": "${isEnglish ? '[Service 5 Name]' : '[ชื่อบริการ 5]'}",
        "price": "[Price 5]",
        "description": "${isEnglish ? '[Service 5 Description]' : '[คำอธิบายบริการ 5]'}",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "${isEnglish ? '[Service 5 Image Alt]' : '[คำอธิบายรูปบริการ 5]'}",
        "category": "wellness"
      }
    ]
  },
  "Contact": {
    "title": "[Contact Title]",
    "subtitle": "[Contact Subtitle]",
    "address": "[Clinic Address]",
    "phone": "[Phone Number]",
    "email": "[Email Address]",
    "businessHours": "[Business Hours]"
  },
  "Footer": {
    "companyName": "[Clinic Name]",
    "description": "[Clinic Description]",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Line", "url": "https://line.me", "icon": "💬" }
    ],
    "quickLinks": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Services]", "href": "/services" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ],
    "address": "[Clinic Address]",
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
- stat1Label: "[Stat Label 1]" (label text)
- stat2: "[Stat Number 2]" (number with + sign)  
- stat2Label: "[Stat Label 2]" (label text)
- stat3: "[Stat Number 3]" (number with + sign)
- stat3Label: "[Stat Label 3]" (label text)`;
          } else if (variantId === 'hero-split' && blockId === 'hero-basic') {
            prompt += `\n- heroImage: "https://via.placeholder.com/1920x1080?text=Medical+Facility" (landscape image)
- heroImageAlt: "[Hero Image Description]" (image description)
- ctaLabel: "[Primary CTA]" (primary CTA)
- secondaryCta: "[Secondary CTA]" (secondary CTA)`;
          } else if (variantId === 'about-split' && blockId === 'about-basic') {
            prompt += `\n- aboutImage: "[Medical facility image URL - will be generated dynamically]" (medical facility image)
- aboutImageAlt: "[About Image Description]" (image description)`;
          } else if (variantId === 'about-team' && blockId === 'about-basic') {
            prompt += `\n- teamTitle: "[Team Section Title]" (team section heading)
- teamSubtitle: "[Team Section Subtitle]" (team section description)
- teamMembers: [array of 3-4 team member objects with name, role, image, bio]`;
          } else if (variantId === 'about-timeline' && blockId === 'about-basic') {
            prompt += `\n- timelineItems: [array of 4-5 timeline objects with year, title, description]`;
          } else if (variantId === 'about-team-showcase' && blockId === 'about-basic') {
            prompt += `\n- teamMembers: [array of 3-4 team member objects with name, role, image, bio]
- missionTitle: "[Mission Title]" (mission section heading)
- missionStatement: "[Mission Statement]" (mission description)`;
          } else if (variantId === 'about-story' && blockId === 'about-basic') {
            prompt += `\n- storyItems: [array of 4-5 story objects with year, title, description]
- ctaLabel: "[Call to Action Label]" (button text)`;
          } else if (variantId === 'about-values' && blockId === 'about-basic') {
            prompt += `\n- values: [array of 3-4 value objects with title, description]
- heroImage: "https://via.placeholder.com/600x400?text=Company+Values" (values section image)
- heroImageAlt: "[Values Image Description]" (image description)`;
          } else if (variantId === 'about-hero' && blockId === 'about-basic') {
            prompt += `\n- badge: "[About Badge]" (badge text)
- ctaLabel: "[Primary CTA]" (primary button text)
- secondaryCta: "[Secondary CTA]" (secondary button text)
- heroImage: "https://via.placeholder.com/600x400?text=About+Hero" (hero image)
- heroImageAlt: "[About Hero Image Description]" (image description)`;
          }
        }
      }
    }
    
    // Add final language enforcement
    if (!isEnglish) {
      prompt += `\n\n🇹🇭 CRITICAL: All text content MUST be in THAI language only. Do not use any English text in clinic names, service descriptions, or any other text fields.`;
    }
    
    return prompt;
  },

  getOptimizedPrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string) => {
    return {
      systemPrompt: healthcarePromptTemplate.systemPrompt,
      userPrompt: healthcarePromptTemplate.generateVariantAwarePrompt(keywords, colorHint, concreteManifest, variantInfo, language)
    };
  }
};
