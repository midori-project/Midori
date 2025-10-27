/**
 * Font Presets for Template System
 * Pre-configured fonts for different business types and tones
 */

export interface FontConfig {
  fontFamily: string;
  googleFont?: string;  // Google Fonts URL param
  fallback?: string[];
  category: string;
  description: string;
  tone: string[];  // Tones that work well with this font
}

export const FONT_PRESETS: Record<string, FontConfig> = {
  // Modern & Professional
  inter: {
    fontFamily: "Inter",
    googleFont: "Inter:wght@300;400;500;600;700",
    fallback: ["sans-serif"],
    category: "professional",
    description: "Modern, clean sans-serif for professional websites",
    tone: ["professional", "modern", "clean", "serious", "minimal"]
  },
  
  roboto: {
    fontFamily: "Roboto",
    googleFont: "Roboto:wght@300;400;500;700",
    fallback: ["sans-serif"],
    category: "professional",
    description: "Professional sans-serif for business and tech",
    tone: ["professional", "modern", "business", "minimal", "clean"]
  },
  
  // Elegant & Luxury
  playfair: {
    fontFamily: "Playfair Display",
    googleFont: "Playfair+Display:wght@400;700",
    fallback: ["serif"],
    category: "luxury",
    description: "Elegant serif for luxury restaurants and businesses",
    tone: ["luxury", "elegant", "sophisticated", "premium", "traditional"]
  },
  
  crimson: {
    fontFamily: "Crimson Pro",
    googleFont: "Crimson+Pro:wght@400;600;700",
    fallback: ["serif"],
    category: "luxury",
    description: "Classic serif for elegant and traditional websites",
    tone: ["luxury", "elegant", "traditional", "sophisticated"]
  },
  
  // Warm & Friendly
  poppins: {
    fontFamily: "Poppins",
    googleFont: "Poppins:wght@300;400;600;700",
    fallback: ["sans-serif"],
    category: "friendly",
    description: "Friendly rounded sans-serif for warm businesses",
    tone: ["warm", "friendly", "inviting", "casual", "welcoming"]
  },
  
  nunito: {
    fontFamily: "Nunito",
    googleFont: "Nunito:wght@300;400;600;700",
    fallback: ["sans-serif"],
    category: "friendly",
    description: "Rounded sans-serif for friendly and approachable websites",
    tone: ["warm", "friendly", "casual", "welcoming", "comfortable"]
  },
  
  // Minimal & Clean
  system: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'",
    fallback: ["sans-serif"],
    category: "minimal",
    description: "System fonts for minimal and fast-loading websites",
    tone: ["minimal", "clean", "simple", "fast", "system"]
  },
  
  // Artistic & Creative
  montserrat: {
    fontFamily: "Montserrat",
    googleFont: "Montserrat:wght@300;400;600;700",
    fallback: ["sans-serif"],
    category: "creative",
    description: "Geometric sans-serif for creative and artistic websites",
    tone: ["creative", "artistic", "modern", "bold", "unique"]
  },
  
  // Traditional & Serious
  lora: {
    fontFamily: "Lora",
    googleFont: "Lora:wght@400;700",
    fallback: ["serif"],
    category: "serious",
    description: "Reading-optimized serif for news and content-heavy sites",
    tone: ["serious", "intellectual", "traditional", "professional", "news"]
  },
  
  merriweather: {
    fontFamily: "Merriweather",
    googleFont: "Merriweather:wght@300;400;700",
    fallback: ["serif"],
    category: "serious",
    description: "Readable serif for long-form content and news",
    tone: ["serious", "intellectual", "traditional", "news", "content"]
  }
};

/**
 * Font Pool Definition
 * Similar to VariantPools, but for fonts
 */
export interface FontPool {
  allowedFonts: string[];  // Array of font preset keys (e.g., ['inter', 'roboto'])
  defaultFont?: string;
  randomSelection?: boolean;
  constraints?: {
    businessType?: string[];
    tone?: string[];
  };
}

/**
 * Get font config by preset key
 */
export function getFontConfig(fontKey: string): FontConfig | undefined {
  return FONT_PRESETS[fontKey];
}

/**
 * Get all fonts by category
 */
export function getFontsByCategory(category: string): FontConfig[] {
  return Object.values(FONT_PRESETS).filter(
    font => font.category === category
  );
}

/**
 * Get fonts by tone
 */
export function getFontsByTone(tone: string): FontConfig[] {
  return Object.values(FONT_PRESETS).filter(
    font => font.tone.includes(tone)
  );
}

/**
 * Get random font from allowed pool
 */
export function getRandomFontFromPool(allowedFonts: string[]): string | undefined {
  if (allowedFonts.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * allowedFonts.length);
  return allowedFonts[randomIndex];
}

/**
 * Select font based on tone (smart auto-selection)
 */
export function selectFontForTone(tone: string): string {
  // Map tone to most appropriate font
  const toneFontMap: Record<string, string> = {
    'professional': 'inter',
    'luxury': 'playfair',
    'warm': 'poppins',
    'minimal': 'system',
    'creative': 'montserrat',
    'serious': 'lora',
    'traditional': 'playfair',
    'friendly': 'poppins',
    'modern': 'inter',
    'elegant': 'playfair',
    'casual': 'nunito'
  };
  
  return toneFontMap[tone] || 'inter';
}

