/**
 * Prompt Template System
 * จัดการ prompt templates แบบ modular
 */

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: (keywords: string[], colorHint: string) => string;
  schema: (blocks: any[]) => any;
}

export interface BusinessCategoryTemplate {
  restaurant: PromptTemplate;
  ecommerce: PromptTemplate;
  healthcare: PromptTemplate;
  portfolio: PromptTemplate;
}

/**
 * System Prompts (สั้น กระชับ)
 */
const systemPrompts = {
  base: `You are a website content generator. Generate JSON content for business websites.
Rules:
- Use Thai language for all text content
- Use ONLY English color names: blue, green, purple, pink, orange, red, yellow, indigo
- bgTone must be a NUMBER (50-900)
- Generate realistic content based on keywords
- All fields are REQUIRED - provide actual content, not placeholders`,

  restaurant: `You are a restaurant website content generator. Generate JSON content for restaurant websites.
Rules:
- Use Thai language for all text content
- Focus on food, dining, and restaurant-related content
- Use appropriate food categories: rice, noodles, soup, curry, meat, vegetarian
- Generate 4-6 menu items with realistic Thai food names
- Use placeholder images: https://via.placeholder.com/400x300?text=Item+Name
- All fields are REQUIRED - provide actual content, not placeholders`,

  ecommerce: `You are an e-commerce website content generator. Generate JSON content for online stores.
Rules:
- Use Thai language for all text content
- Focus on products, shopping, and retail-related content
- Use appropriate product categories: product, book, stationery, toy, clothing, electronics
- Generate 6 product items with realistic product names
- Use placeholder images: https://via.placeholder.com/400x300?text=Product+Name
- All fields are REQUIRED - provide actual content, not placeholders`
};

/**
 * User Prompt Generators
 */
const userPromptGenerators = {
  base: (keywords: string[], colorHint: string) => 
    `Keywords: ${keywords.join(", ")}
${colorHint}

Generate JSON with this structure:`,
    
  restaurant: (keywords: string[], colorHint: string) => 
    `Restaurant Keywords: ${keywords.join(", ")}
${colorHint}

Generate restaurant website JSON with this structure:`,
    
  ecommerce: (keywords: string[], colorHint: string) => 
    `E-commerce Keywords: ${keywords.join(", ")}
${colorHint}

Generate online store JSON with this structure:`
};

/**
 * Schema Generators
 */
const schemaGenerators = {
  base: (blocks: any[]) => {
    const schema: any = {
      global: {
        palette: {
          primary: "orange",
          secondary: "red", 
          bgTone: 100
        },
        tokens: {
          radius: "8px",
          spacing: "1rem"
        }
      }
    };

    // Add only essential blocks
    blocks.forEach(block => {
      const key = getBlockDataKey(block.id);
      schema[key] = getBlockSchema(block);
    });

    return schema;
  },

  restaurant: (blocks: any[]) => {
    const schema: any = {
      global: {
        palette: {
          primary: "orange",
          secondary: "red",
          bgTone: 100
        },
        tokens: {
          radius: "8px", 
          spacing: "1rem"
        }
      },
      "navbar-basic": {
        brand: "ร้านอาหาร",
        brandFirstChar: "ร",
        ctaButton: "จองโต๊ะ",
        menuItems: [
          { label: "หน้าแรก", href: "/" },
          { label: "เมนู", href: "/menu" },
          { label: "เกี่ยวกับเรา", href: "/about" },
          { label: "ติดต่อ", href: "/contact" }
        ]
      },
      "hero-basic": {
        badge: "ร้านอาหารคุณภาพ",
        heading: "อาหารอร่อย ราคาเป็นมิตร",
        subheading: "เราใช้ส่วนผสมคุณภาพสูง ปรุงสดใหม่ทุกวัน",
        ctaLabel: "ดูเมนู",
        secondaryCta: "จองโต๊ะ",
        heroImage: "https://via.placeholder.com/1920x1080?text=Hero+Image",
        heroImageAlt: "บรรยากาศร้านอาหาร",
        stat1: "15+",
        stat1Label: "ปีประสบการณ์",
        stat2: "1000+",
        stat2Label: "ลูกค้าพึงพอใจ",
        stat3: "50+",
        stat3Label: "เมนูหลากหลาย"
      }
    };

    // Add other blocks
    blocks.forEach(block => {
      if (block.id !== 'navbar-basic' && block.id !== 'hero-basic') {
        const key = getBlockDataKey(block.id);
        schema[key] = getBlockSchema(block);
      }
    });

    return schema;
  }
};

/**
 * Helper Functions
 */
function getBlockDataKey(blockId: string): string {
  const keyMap: Record<string, string> = {
    "hero-basic": "Hero",
    "navbar-basic": "Navbar",
    "theme-basic": "Theme", 
    "footer-basic": "Footer",
    "about-basic": "About",
    "contact-basic": "Contact",
    "menu-basic": "Menu"
  };
  return keyMap[blockId] || blockId.charAt(0).toUpperCase() + blockId.slice(1);
}

function getBlockSchema(block: any): any {
  // Generate minimal schema for each block
  const schema: any = {};
  
  for (const [placeholder, config] of Object.entries(block.placeholders)) {
    if (config.type === "array") {
      schema[placeholder] = getArrayExample(placeholder, block.id);
    } else {
      schema[placeholder] = config.description || `appropriate ${config.type} value`;
    }
  }
  
  return schema;
}

function getArrayExample(placeholder: string, blockId: string): string {
  // Return appropriate array examples based on placeholder and block
  if (placeholder === "menuItems") {
    return `[
      {
        "name": "ข้าวผัดกุ้ง",
        "price": "120", 
        "description": "ข้าวผัดกุ้งสด ใส่ผักสด",
        "image": "https://via.placeholder.com/400x300?text=ข้าวผัดกุ้ง",
        "imageAlt": "จานข้าวผัดกุ้ง",
        "category": "rice"
      }
    ]`;
  }
  
  if (placeholder === "features") {
    return `[
      { "title": "คุณสมบัติ 1", "description": "คำอธิบาย" },
      { "title": "คุณสมบัติ 2", "description": "คำอธิบาย" }
    ]`;
  }
  
  return `[]`;
}

/**
 * Business Category Templates
 */
export const businessCategoryTemplates: BusinessCategoryTemplate = {
  restaurant: {
    systemPrompt: systemPrompts.restaurant,
    userPrompt: userPromptGenerators.restaurant,
    schema: schemaGenerators.restaurant
  },
  
  ecommerce: {
    systemPrompt: systemPrompts.base,
    userPrompt: userPromptGenerators.ecommerce,
    schema: schemaGenerators.base
  },
  
  healthcare: {
    systemPrompt: systemPrompts.base,
    userPrompt: userPromptGenerators.base,
    schema: schemaGenerators.base
  },
  
  portfolio: {
    systemPrompt: systemPrompts.base,
    userPrompt: userPromptGenerators.base,
    schema: schemaGenerators.base
  }
};

/**
 * Generate Optimized Prompt
 */
export function generateOptimizedPrompt(
  businessCategory: any,
  keywords: string[],
  colorHint: string,
  blocks: any[]
): { systemPrompt: string; userPrompt: string } {
  const template = businessCategoryTemplates[businessCategory.id as keyof BusinessCategoryTemplate] 
    || businessCategoryTemplates.restaurant;
  
  const systemPrompt = template.systemPrompt;
  const userPrompt = template.userPrompt(keywords, colorHint) + 
    `\n\n${JSON.stringify(template.schema(blocks), null, 2)}`;
  
  return { systemPrompt, userPrompt };
}
