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
- Generate 4-6 service items with realistic medical service names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Service+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- DO NOT use teal, cyan, or any other colors not listed above`,

  generateUserPrompt: (keywords: string[], colorHint: string, language?: string) => {
    const detectedLanguage = language || 'en';
    const isEnglish = detectedLanguage === 'en';
    
    return `Healthcare Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate healthcare website JSON in ENGLISH with this structure:' : 
  'Generate healthcare website JSON in THAI with this structure:'}
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
    "brand": "[Clinic Name]",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "[Appointment Button]",
    "menuItems": [
      { "label": "[Home]", "href": "/" },
      { "label": "[Services]", "href": "/menu" },
      { "label": "[About]", "href": "/about" },
      { "label": "[Contact]", "href": "/contact" }
    ]
  },
  "Hero": {
    "badge": "[Clinic Badge]",
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
    "title": "[Services Title]",
    "menuItems": [
      {
        "name": "[Service 1 Name]",
        "price": "[Price 1]",
        "description": "[Service 1 Description]",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "[Service 1 Image Alt]",
        "category": "medicine"
      },
      {
        "name": "[Service 2 Name]",
        "price": "[Price 2]",
        "description": "[Service 2 Description]",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "[Service 2 Image Alt]",
        "category": "health"
      },
      {
        "name": "[Service 3 Name]",
        "price": "[Price 3]",
        "description": "[Service 3 Description]",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "[Service 3 Image Alt]",
        "category": "medical"
      },
      {
        "name": "[Service 4 Name]",
        "price": "[Price 4]",
        "description": "[Service 4 Description]",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "[Service 4 Image Alt]",
        "category": "pharmacy"
      },
      {
        "name": "[Service 5 Name]",
        "price": "[Price 5]",
        "description": "[Service 5 Description]",
        "image": "https://via.placeholder.com/400x300?text=Service+Name",
        "imageAlt": "[Service 5 Image Alt]",
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
  },

  getOptimizedPrompt: (keywords: string[], colorHint: string, concreteManifest?: any, variantInfo?: any, language?: string) => {
    return {
      systemPrompt: healthcarePromptTemplate.systemPrompt,
      userPrompt: healthcarePromptTemplate.generateUserPrompt(keywords, colorHint, language)
    };
  }
};
