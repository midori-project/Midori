/**
 * Portfolio Prompt Template
 * Template เฉพาะสำหรับ Portfolio/Creative
 */

export const portfolioPromptTemplate = {
  systemPrompt: `You are a portfolio website content generator. Generate JSON content for creative professionals.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on creative, design, and professional work-related content
- Use appropriate work categories: design, creative, development, art, professional
- Generate 4-6 portfolio items with realistic creative work names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Work+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- DO NOT use teal, cyan, or any other colors not listed above`,

  generateUserPrompt: (keywords: string[], colorHint: string, language?: string) => {
    const detectedLanguage = language || 'en';
    const isEnglish = detectedLanguage === 'en';
    
    return `Portfolio Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate portfolio website JSON in ENGLISH with this structure:' : 
  'Generate portfolio website JSON in THAI with this structure:'}
{
  "global": {
    "palette": {
      "primary": "purple",
      "secondary": "indigo",
      "bgTone": 100
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "[Company Name]",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "[Contact Button Text]",
    "menuItems": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Portfolio]", "href": "/menu" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ]
  },
  "Hero": {
    "badge": "[Badge Text]",
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
    "title": "[Portfolio Title]",
    "menuItems": [
      {
        "name": "[Project 1 Name]",
        "price": "[Price 1]",
        "description": "[Project 1 Description]",
        "image": "https://via.placeholder.com/400x300?text=Work+Name",
        "imageAlt": "[Project 1 Image Alt]",
        "category": "design"
      },
      {
        "name": "[Project 2 Name]",
        "price": "[Price 2]",
        "description": "[Project 2 Description]",
        "image": "https://via.placeholder.com/400x300?text=Work+Name",
        "imageAlt": "[Project 2 Image Alt]",
        "category": "development"
      },
      {
        "name": "[Project 3 Name]",
        "price": "[Price 3]",
        "description": "[Project 3 Description]",
        "image": "https://via.placeholder.com/400x300?text=Work+Name",
        "imageAlt": "[Project 3 Image Alt]",
        "category": "creative"
      },
      {
        "name": "[Project 4 Name]",
        "price": "[Price 4]",
        "description": "[Project 4 Description]",
        "image": "https://via.placeholder.com/400x300?text=Work+Name",
        "imageAlt": "[Project 4 Image Alt]",
        "category": "art"
      },
      {
        "name": "[Project 5 Name]",
        "price": "[Price 5]",
        "description": "[Project 5 Description]",
        "image": "https://via.placeholder.com/400x300?text=Work+Name",
        "imageAlt": "[Project 5 Image Alt]",
        "category": "professional"
      }
    ]
  },
  "Contact": {
    "title": "[Contact Title]",
    "subtitle": "[Contact Subtitle]",
    "address": "[Address]",
    "phone": "[Phone Number]",
    "email": "[Email Address]",
    "businessHours": "[Business Hours]"
  },
  "Footer": {
    "companyName": "[Company Name]",
    "description": "[Company Description]",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "Line", "url": "https://line.me", "icon": "💬" }
    ],
    "quickLinks": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Portfolio]", "href": "/portfolio" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ],
    "address": "[Address]",
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
      systemPrompt: portfolioPromptTemplate.systemPrompt,
      userPrompt: portfolioPromptTemplate.generateUserPrompt(keywords, colorHint, language)
    };
  }
};
