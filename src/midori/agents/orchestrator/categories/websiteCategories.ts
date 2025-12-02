/**
 * Website Categories Definition
 * ระบบกำหนดประเภทเว็บไซต์ที่ครอบคลุมและยืดหยุ่น
 */

export interface WebsiteCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  examples: string[];
  features: string[];
  techStack: string[];
  priority: number; // 1-10, สูง = สำคัญกว่า
}

export const WEBSITE_CATEGORIES: WebsiteCategory[] = [
  // E-commerce Categories
  {
    id: 'e_commerce_food',
    name: 'E-commerce Food',
    description: 'เว็บไซต์ขายอาหารออนไลน์',
    keywords: ['ขายอาหาร', 'ขายไก่', 'ขายหมู', 'ขายปลา', 'ขายผัก', 'ขายผลไม้', 'food delivery', 'chicken shop', 'restaurant online'],
    examples: ['ขายไก่ทอด', 'ขายอาหารไทย', 'ขายอาหารญี่ปุ่น', 'ขายอาหารจีน'],
    features: ['shopping_cart', 'payment', 'delivery', 'inventory', 'reviews'],
    techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    priority: 9
  },
  {
    id: 'e_commerce_fashion',
    name: 'E-commerce Fashion',
    description: 'เว็บไซต์ขายเสื้อผ้าและแฟชั่น',
    keywords: ['ขายเสื้อผ้า', 'ขายรองเท้า', 'ขายกระเป๋า', 'แฟชั่น', 'fashion', 'clothing', 'shoes', 'bags'],
    examples: ['ขายเสื้อผ้าสตรี', 'ขายรองเท้า', 'ขายกระเป๋าแบรนด์'],
    features: ['size_guide', 'color_variants', 'wishlist', 'reviews', 'shipping'],
    techStack: ['React', 'Next.js', 'Shopify', 'WooCommerce'],
    priority: 8
  },
  {
    id: 'e_commerce_general',
    name: 'E-commerce General',
    description: 'เว็บไซต์ขายของทั่วไป',
    keywords: ['ขายของ', 'ขายสินค้า', 'ร้านค้า', 'shop', 'store', 'ecommerce', 'ขายหนังสือ', 'ขายของมือสอง'],
    examples: ['ขายหนังสือ', 'ขายของมือสอง', 'ขายเครื่องใช้ไฟฟ้า', 'ขายของเล่น'],
    features: ['catalog', 'search', 'filters', 'reviews', 'recommendations'],
    techStack: ['React', 'Vue.js', 'Laravel', 'PostgreSQL'],
    priority: 7
  },

  // Service Categories
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'เว็บไซต์ร้านอาหาร (ไม่ขายออนไลน์)',
    keywords: ['ร้านอาหาร', 'restaurant', 'อาหาร', 'food', 'เมนู', 'menu', 'จองโต๊ะ', 'booking'],
    examples: ['ร้านอาหารไทย', 'ร้านอาหารญี่ปุ่น', 'ร้านอาหารจีน', 'ร้านกาแฟ'],
    features: ['menu', 'reservation', 'location', 'reviews', 'gallery'],
    techStack: ['React', 'Next.js', 'Tailwind', 'Framer Motion'],
    priority: 8
  },
  {
    id: 'coffee_shop',
    name: 'Coffee Shop',
    description: 'เว็บไซต์ร้านกาแฟ',
    keywords: ['ร้านกาแฟ', 'coffee', 'กาแฟ', 'cafe', 'คาเฟ่', 'coffee shop'],
    examples: ['ร้านกาแฟสตาร์บัคส์', 'ร้านกาแฟท้องถิ่น', 'คาเฟ่'],
    features: ['menu', 'location', 'atmosphere', 'reviews', 'events'],
    techStack: ['React', 'Next.js', 'Tailwind', 'Stripe'],
    priority: 7
  },

  // Business Categories
  {
    id: 'business',
    name: 'Business',
    description: 'เว็บไซต์ธุรกิจทั่วไป',
    keywords: ['ธุรกิจ', 'business', 'บริษัท', 'company', 'องค์กร', 'organization'],
    examples: ['เว็บไซต์บริษัท', 'เว็บไซต์องค์กร', 'เว็บไซต์ธุรกิจ'],
    features: ['about', 'services', 'contact', 'team', 'news'],
    techStack: ['React', 'Next.js', 'Contentful', 'Netlify'],
    priority: 6
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'เว็บไซต์แสดงผลงาน',
    keywords: ['ผลงาน', 'portfolio', 'งาน', 'work', 'creative', 'designer', 'developer'],
    examples: ['ผลงานนักออกแบบ', 'ผลงานโปรแกรมเมอร์', 'ผลงานศิลปิน'],
    features: ['gallery', 'projects', 'skills', 'contact', 'resume'],
    techStack: ['React', 'Next.js', 'Framer Motion', 'Three.js'],
    priority: 5
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'เว็บไซต์บล็อก',
    keywords: ['บล็อก', 'blog', 'เขียน', 'write', 'บทความ', 'article', 'ข่าว', 'news'],
    examples: ['บล็อกส่วนตัว', 'บล็อกข่าว', 'บล็อกเทคโนโลยี'],
    features: ['posts', 'categories', 'search', 'comments', 'rss'],
    techStack: ['Next.js', 'MDX', 'Contentful', 'Vercel'],
    priority: 4
  },

  // Specialized Categories
  {
    id: 'landing_page',
    name: 'Landing Page',
    description: 'หน้าเว็บเดียวสำหรับโปรโมท',
    keywords: ['หน้าแรก', 'landing', 'โปรโมท', 'promote', 'ขาย', 'sale', 'campaign'],
    examples: ['หน้าโปรโมทสินค้า', 'หน้าโปรโมทบริการ', 'หน้าโปรโมทอีเวนต์'],
    features: ['hero', 'cta', 'testimonials', 'contact', 'social_proof'],
    techStack: ['React', 'Next.js', 'Tailwind', 'AOS'],
    priority: 6
  },
  {
    id: 'education',
    name: 'Education',
    description: 'เว็บไซต์การศึกษา',
    keywords: ['การศึกษา', 'education', 'เรียน', 'learn', 'คอร์ส', 'course', 'โรงเรียน', 'school'],
    examples: ['เว็บไซต์โรงเรียน', 'เว็บไซต์มหาวิทยาลัย', 'เว็บไซต์คอร์สออนไลน์'],
    features: ['courses', 'enrollment', 'progress', 'certificates', 'discussions'],
    techStack: ['React', 'Next.js', 'MongoDB', 'Stripe'],
    priority: 5
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'เว็บไซต์สุขภาพและการแพทย์',
    keywords: ['สุขภาพ', 'health', 'แพทย์', 'doctor', 'โรงพยาบาล', 'hospital', 'คลินิก', 'clinic'],
    examples: ['เว็บไซต์โรงพยาบาล', 'เว็บไซต์คลินิก', 'เว็บไซต์สุขภาพ'],
    features: ['appointment', 'services', 'doctors', 'patient_portal', 'emergency'],
    techStack: ['React', 'Next.js', 'PostgreSQL', 'Auth0'],
    priority: 8
  }
];

/**
 * Get category by ID
 */
export function getCategoryById(id: string): WebsiteCategory | undefined {
  return WEBSITE_CATEGORIES.find(category => category.id === id);
}

/**
 * Get all categories
 */
export function getAllCategories(): WebsiteCategory[] {
  return WEBSITE_CATEGORIES;
}

/**
 * Get categories by priority
 */
export function getCategoriesByPriority(minPriority: number = 1): WebsiteCategory[] {
  return WEBSITE_CATEGORIES.filter(category => category.priority >= minPriority);
}

/**
 * Get categories by feature
 */
export function getCategoriesByFeature(feature: string): WebsiteCategory[] {
  return WEBSITE_CATEGORIES.filter(category => 
    category.features.includes(feature)
  );
}
