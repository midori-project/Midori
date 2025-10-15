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
- Generate 4-6 menu items with realistic food names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Item+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- DO NOT use teal, cyan, or any other colors not listed above`,

  generateVariantAwarePrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string): string => {
    const detectedLanguage = language || 'th';
    const isEnglish = detectedLanguage === 'en';
    
    let prompt: string = `Restaurant Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate restaurant website JSON in ENGLISH with this structure:' : 
  'Generate restaurant website JSON in THAI with this structure:'}
{
  "global": {
    "palette": {
      "primary": "orange",
      "secondary": "red",
      "bgTone": 100
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "[Restaurant Name]",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "[Reservation Button]",
    "menuItems": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Menu]", "href": "/menu" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ]
  },
  "Hero": {
    "badge": "[Restaurant Badge]",
    "heading": "[Main Heading]",
    "subheading": "[Subheading Description]",
    "ctaLabel": "[Primary CTA]",
    "secondaryCta": "[Secondary CTA]",
    "heroImage": "https://via.placeholder.com/1920x1080?text=Hero+Image",
    "heroImageAlt": "[Hero Image Description]",
    "stat1": "[Stat Number 1]",
    "stat1Label": "[Stat Label 1]",
    "stat2": "[Stat Number 2]",
    "stat2Label": "[Stat Label 2]",
    "stat3": "[Stat Number 3]",
    "stat3Label": "[Stat Label 3]"
  },
  "About": {
    "title": "[About Title]",
    "description": "[About Description]",
    "features": [
      { "title": "[Feature 1 Title]", "description": "[Feature 1 Description]" },
      { "title": "[Feature 2 Title]", "description": "[Feature 2 Description]" },
      { "title": "[Feature 3 Title]", "description": "[Feature 3 Description]" }
    ],
    "stats": [
      { "number": "[Stat 1 Number]", "label": "[Stat 1 Label]" },
      { "number": "[Stat 2 Number]", "label": "[Stat 2 Label]" },
      { "number": "[Stat 3 Number]", "label": "[Stat 3 Label]" },
      { "number": "[Stat 4 Number]", "label": "[Stat 4 Label]" }
    ],
    "aboutImage": "https://via.placeholder.com/400x300?text=About+Image",
    "aboutImageAlt": "[About Image Description]"
  },
  "Menu": {
    "title": "[Menu Title]",
    "menuItems": [
      {
        "name": "[Dish 1 Name]",
        "price": "[Price 1]",
        "description": "[Dish 1 Description]",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "[Dish 1 Image Alt]",
        "category": "rice"
      },
      {
        "name": "[Dish 2 Name]",
        "price": "[Price 2]",
        "description": "[Dish 2 Description]",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "[Dish 2 Image Alt]",
        "category": "noodles"
      },
      {
        "name": "[Dish 3 Name]",
        "price": "[Price 3]",
        "description": "[Dish 3 Description]",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "[Dish 3 Image Alt]",
        "category": "soup"
      },
      {
        "name": "[Dish 4 Name]",
        "price": "[Price 4]",
        "description": "[Dish 4 Description]",
        "image": "https://via.placeholder.com/400x300?text=Dish+Name",
        "imageAlt": "[Dish 4 Image Alt]",
        "category": "curry"
      }
    ]
  },
  "Contact": {
    "title": "[Contact Title]",
    "subtitle": "[Contact Subtitle]",
    "address": "[Restaurant Address]",
    "phone": "[Phone Number]",
    "email": "[Email Address]",
    "businessHours": "[Business Hours]"
  },
  "Footer": {
    "companyName": "[Restaurant Name]",
    "description": "[Restaurant Description]",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Line", "url": "https://line.me", "icon": "💬" }
    ],
    "quickLinks": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Menu]", "href": "/menu" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ],
    "address": "[Restaurant Address]",
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
            prompt += `\n- heroImage: "https://via.placeholder.com/1920x1080?text=Restaurant+Interior" (landscape image)
- heroImageAlt: "[Hero Image Description]" (image description)
- ctaLabel: "[Primary CTA]" (primary CTA)
- secondaryCta: "[Secondary CTA]" (secondary CTA)`;
          } else if (variantId === 'about-features' && blockId === 'about-basic') {
            prompt += `\n- features: [array of 3-4 feature objects with title and description]
- stats: [array of 3-4 stat objects with number and label]`;
          }
        }
      }
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
