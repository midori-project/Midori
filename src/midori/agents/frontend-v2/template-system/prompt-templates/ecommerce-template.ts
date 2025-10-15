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
- Generate 4-6 product items with realistic product names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Product+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- DO NOT use teal, cyan, or any other colors not listed above`,

  generateUserPrompt: (keywords: string[], colorHint: string, language?: string) => {
    const detectedLanguage = language || 'en';
    const isEnglish = detectedLanguage === 'en';
    
    return `E-commerce Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate e-commerce website JSON in ENGLISH with this structure:' : 
  'Generate e-commerce website JSON in THAI with this structure:'}
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
    "brand": "[Store Name]",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "[Shop Button]",
    "menuItems": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Products]", "href": "/menu" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ]
  },
  "Hero": {
    "badge": "[Store Badge]",
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
    "title": "[Products Title]",
    "menuItems": [
      {
        "name": "[Product 1 Name]",
        "price": "[Price 1]",
        "description": "[Product 1 Description]",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "[Product 1 Image Alt]",
        "category": "product"
      },
      {
        "name": "[Product 2 Name]",
        "price": "[Price 2]",
        "description": "[Product 2 Description]",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "[Product 2 Image Alt]",
        "category": "book"
      },
      {
        "name": "[Product 3 Name]",
        "price": "[Price 3]",
        "description": "[Product 3 Description]",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "[Product 3 Image Alt]",
        "category": "stationery"
      },
      {
        "name": "[Product 4 Name]",
        "price": "[Price 4]",
        "description": "[Product 4 Description]",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "[Product 4 Image Alt]",
        "category": "toy"
      },
      {
        "name": "[Product 5 Name]",
        "price": "[Price 5]",
        "description": "[Product 5 Description]",
        "image": "https://via.placeholder.com/400x300?text=Product+Name",
        "imageAlt": "[Product 5 Image Alt]",
        "category": "clothing"
      }
    ]
  },
  "Contact": {
    "title": "[Contact Title]",
    "subtitle": "[Contact Subtitle]",
    "address": "[Store Address]",
    "phone": "[Phone Number]",
    "email": "[Email Address]",
    "businessHours": "[Business Hours]"
  },
  "Footer": {
    "companyName": "[Store Name]",
    "description": "[Store Description]",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Line", "url": "https://line.me", "icon": "💬" }
    ],
    "quickLinks": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Products]", "href": "/products" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ],
    "address": "[Store Address]",
    "phone": "[Phone Number]",
    "email": "[Email Address]"
  },
  "Theme": {
    "radius": "8px",
    "spacing": "1rem"
  }
}`;
  },

  getOptimizedPrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string) => {
    return {
      systemPrompt: ecommercePromptTemplate.systemPrompt,
      userPrompt: ecommercePromptTemplate.generateUserPrompt(keywords, colorHint, language)
    };
  }
};
