/**
 * Hotel Prompt Template
 * Template เฉพาะสำหรับ Hotel/Accommodation
 */

export const hotelPromptTemplate = {
  systemPrompt: `You are a professional content generator for hotel and accommodation websites.

Rules:
- Use the specified language for all text content (Thai or English)
- Focus on luxury, comfort, and hospitality-related content
- Use appropriate accommodation categories: luxury, business, family, budget
- Generate 6 room types with realistic hotel room names in the specified language
- Use placeholder images: https://via.placeholder.com/400x300?text=Room+Name
- All fields are REQUIRED - provide actual content, not placeholders

Color Rules:
- Primary/Secondary colors: ONLY use blue, green, purple, pink, orange, red, yellow, indigo
- bgTone: ONLY use 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
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
    "badge": "${isEnglish ? '[Hotel Badge]' : '[ป้ายโรงแรม]'}",
    "heading": "${isEnglish ? '[Hotel Name]' : '[ชื่อโรงแรม]'}",
    "subheading": "${isEnglish ? '[Hotel Description]' : '[คำอธิบายโรงแรม]'}",
    "ctaLabel": "${isEnglish ? '[Book Now]' : '[จองห้องพัก]'}",
    "secondaryCta": "${isEnglish ? '[View Rooms]' : '[ดูห้องพัก]'}"
  }`;
        case 'hero-split':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Luxury Hotel]' : '[โรงแรมหรู]'}",
    "heading": "${isEnglish ? '[Perfect Stay Experience]' : '[ประสบการณ์การพักผ่อนที่สมบูรณ์แบบ]'}",
    "subheading": "${isEnglish ? '[Beautiful rooms, complete service, international standards]' : '[ห้องพักสวยงาม บริการครบครัน พร้อมให้บริการด้วยมาตรฐานสากล]'}",
    "ctaLabel": "${isEnglish ? '[Book Room]' : '[จองห้องพัก]'}",
    "secondaryCta": "${isEnglish ? '[View Rooms]' : '[ดูห้องพัก]'}"
  }`;
        case 'hero-fullscreen':
          return `  "Hero": {
    "badge": "${isEnglish ? '[Premium Hotel]' : '[โรงแรมพรีเมียม]'}",
    "heading": "${isEnglish ? '[Luxury Accommodation]' : '[ที่พักหรูหรา]'}",
    "subheading": "${isEnglish ? '[Experience luxury and comfort]' : '[สัมผัสความหรูหราและความสะดวกสบาย]'}",
    "ctaLabel": "${isEnglish ? '[Reserve Now]' : '[จองทันที]'}",
    "secondaryCta": "${isEnglish ? '[Explore]' : '[สำรวจ]'}"
  }`;
        default:
          return `  "Hero": {
    "badge": "${isEnglish ? '[Hotel]' : '[โรงแรม]'}",
    "heading": "${isEnglish ? '[Hotel Name]' : '[ชื่อโรงแรม]'}",
    "subheading": "${isEnglish ? '[Hotel Description]' : '[คำอธิบายโรงแรม]'}",
    "ctaLabel": "${isEnglish ? '[Book Now]' : '[จองห้องพัก]'}",
    "secondaryCta": "${isEnglish ? '[View Rooms]' : '[ดูห้องพัก]'}"
  }`;
      }
    };

    const generateAboutSection = (variant: string) => {
      switch (variant) {
        case 'about-split':
          return `  "About": {
    "title": "${isEnglish ? '[About Our Hotel]' : '[เกี่ยวกับโรงแรมของเรา]'}",
    "description": "${isEnglish ? '[We are a hotel providing accommodation with international standards]' : '[เราเป็นโรงแรมที่ให้บริการที่พักด้วยมาตรฐานสากล]'}",
    "features": [
      {
        "title": "${isEnglish ? '[Beautiful Rooms]' : '[ห้องพักสวยงาม]'}",
        "description": "${isEnglish ? '[Luxuriously decorated]' : '[ตกแต่งอย่างหรูหรา]'}"
      },
      {
        "title": "${isEnglish ? '[Complete Service]' : '[บริการครบครัน]'}",
        "description": "${isEnglish ? '[Full amenities]' : '[สิ่งอำนวยความสะดวกครบครัน]'}"
      },
      {
        "title": "${isEnglish ? '[Great Location]' : '[ที่ตั้งดีเยี่ยม]'}",
        "description": "${isEnglish ? '[Near important places]' : '[ใกล้สถานที่สำคัญ]'}"
      }
    ],
    "stats": [
      { "number": "100+", "label": "${isEnglish ? '[Rooms]' : '[ห้องพัก]'}" },
      { "number": "4.8", "label": "${isEnglish ? '[Rating]' : '[คะแนนรีวิว]'}" },
      { "number": "24/7", "label": "${isEnglish ? '[Service]' : '[บริการ]'}" }
    ]
  }`;
        default:
          return `  "About": {
    "title": "${isEnglish ? '[About Us]' : '[เกี่ยวกับเรา]'}",
    "description": "${isEnglish ? '[Hotel description]' : '[คำอธิบายโรงแรม]'}",
    "features": [
      { "title": "${isEnglish ? '[Feature 1]' : '[คุณสมบัติ 1]'}", "description": "${isEnglish ? '[Description 1]' : '[คำอธิบาย 1]'}" },
      { "title": "${isEnglish ? '[Feature 2]' : '[คุณสมบัติ 2]'}", "description": "${isEnglish ? '[Description 2]' : '[คำอธิบาย 2]'}" },
      { "title": "${isEnglish ? '[Feature 3]' : '[คุณสมบัติ 3]'}", "description": "${isEnglish ? '[Description 3]' : '[คำอธิบาย 3]'}" }
    ],
    "stats": [
      { "number": "100+", "label": "${isEnglish ? '[Rooms]' : '[ห้องพัก]'}" },
      { "number": "4.8", "label": "${isEnglish ? '[Rating]' : '[คะแนนรีวิว]'}" },
      { "number": "24/7", "label": "${isEnglish ? '[Service]' : '[บริการ]'}" }
    ]
  }`;
      }
    };
    
    let prompt: string = `Hotel Keywords: ${keywords.join(", ")}
${colorHint}

Language: ${detectedLanguage}

${isEnglish ? 
  'Generate hotel website JSON in ENGLISH with this structure:' : 
  'Generate hotel website JSON in THAI with this structure:'}

IMPORTANT: ${isEnglish ? 
  'All text content must be in ENGLISH only.' : 
  'All text content must be in THAI only. Use Thai language for all text fields including hotel names, room types, descriptions, and all other text content.'}
{
  "global": {
    "palette": {
      "primary": "blue",
      "secondary": "gold",
      "bgTone": 50
    },
    "tokens": {
      "radius": "8px",
      "spacing": "1rem"
    }
  },
  "Navbar": {
    "brand": "${isEnglish ? '[Hotel Name]' : '[ชื่อโรงแรม]'}",
    "brandFirstChar": "[First Letter]",
    "ctaButton": "${isEnglish ? '[Book Now]' : '[จองห้องพัก]'}",
    "menuItems": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Rooms]' : '[ห้องพัก]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ]
  },
${generateHeroSection(heroVariant)},
${generateAboutSection(aboutVariant)},
  "Menu": {
    "title": "${isEnglish ? '[Our Rooms]' : '[ห้องพักของเรา]'}",
    "menuItems": [
      {
        "name": "${isEnglish ? '[Deluxe Room]' : '[ห้องเดลักซ์]'}",
        "price": "2,500",
        "description": "${isEnglish ? '[Beautiful room with great view]' : '[ห้องพักสวยงามพร้อมวิวสวย]'}",
        "image": "https://via.placeholder.com/400x300?text=Deluxe+Room",
        "imageAlt": "${isEnglish ? '[Deluxe Room Image]' : '[รูปห้องเดลักซ์]'}",
        "category": "luxury"
      },
      {
        "name": "${isEnglish ? '[Suite Room]' : '[ห้องสวีท]'}",
        "price": "4,500",
        "description": "${isEnglish ? '[Luxury room with amenities]' : '[ห้องพักหรูหราพร้อมสิ่งอำนวยความสะดวก]'}",
        "image": "https://via.placeholder.com/400x300?text=Suite+Room",
        "imageAlt": "${isEnglish ? '[Suite Room Image]' : '[รูปห้องสวีท]'}",
        "category": "luxury"
      },
      {
        "name": "${isEnglish ? '[Family Room]' : '[ห้องครอบครัว]'}",
        "price": "3,500",
        "description": "${isEnglish ? '[Perfect for families]' : '[เหมาะสำหรับครอบครัว]'}",
        "image": "https://via.placeholder.com/400x300?text=Family+Room",
        "imageAlt": "${isEnglish ? '[Family Room Image]' : '[รูปห้องครอบครัว]'}",
        "category": "family"
      },
      {
        "name": "${isEnglish ? '[Premium Room]' : '[ห้องพรีเมียม]'}",
        "price": "6,000",
        "description": "${isEnglish ? '[Premium level room]' : '[ห้องพักระดับพรีเมียม]'}",
        "image": "https://via.placeholder.com/400x300?text=Premium+Room",
        "imageAlt": "${isEnglish ? '[Premium Room Image]' : '[รูปห้องพรีเมียม]'}",
        "category": "premium"
      }
    ]
  },
  "Contact": {
    "title": "${isEnglish ? '[Contact for Booking]' : '[ติดต่อจองห้องพัก]'}",
    "subtitle": "${isEnglish ? '[Ready to serve every day]' : '[พร้อมให้บริการทุกวัน]'}",
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "reservation@hotel.com",
    "businessHours": "${isEnglish ? '[24 hours]' : '[24 ชั่วโมง]'}",
    "contactFormTitle": "${isEnglish ? '[Book Room]' : '[จองห้องพัก]'}",
    "contactFormCta": "${isEnglish ? '[Send Booking Request]' : '[ส่งคำขอจอง]'}",
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
    "companyName": "${isEnglish ? '[Luxury Hotel]' : '[โรงแรมหรูหรา]'}",
    "description": "${isEnglish ? '[Hotel providing accommodation with international standards]' : '[โรงแรมที่ให้บริการที่พักด้วยมาตรฐานสากล]'}",
    "socialLinks": [
      { "name": "Facebook", "url": "https://facebook.com", "icon": "📘" },
      { "name": "Instagram", "url": "https://instagram.com", "icon": "📷" },
      { "name": "TripAdvisor", "url": "https://tripadvisor.com", "icon": "🗺️" }
    ],
    "quickLinks": [
      { "label": "${isEnglish ? '[Home]' : '[หน้าแรก]'}", "href": "/" },
      { "label": "${isEnglish ? '[Rooms]' : '[ห้องพัก]'}", "href": "/menu" },
      { "label": "${isEnglish ? '[About]' : '[เกี่ยวกับ]'}", "href": "/about" },
      { "label": "${isEnglish ? '[Contact]' : '[ติดต่อ]'}", "href": "/contact" }
    ],
    "address": "${isEnglish ? '[123 Sukhumvit Road, Bangkok 10110]' : '[123 ถนนสุขุมวิท กรุงเทพฯ 10110]'}",
    "phone": "02-123-4567",
    "email": "info@hotel.com"
  }
}`;

    return prompt;
  }
};
