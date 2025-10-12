/**
 * Color Detector
 * Detects colors from Thai/English keywords
 */

import type { ColorKeyword, DetectedColors } from './types';

export class ColorDetector {
  
  // Color keyword database
  private static readonly COLOR_KEYWORDS: Record<string, ColorKeyword> = {
    'blue': {
      th: ['ฟ้า', 'น้ำเงิน', 'คราม'],
      en: ['blue', 'azure', 'navy'],
      hexCodes: ['#3B82F6', '#2563EB', '#1E40AF'],
      tone: 'cool'
    },
    'red': {
      th: ['แดง', 'เลือดหมู'],
      en: ['red', 'crimson', 'scarlet'],
      hexCodes: ['#EF4444', '#DC2626', '#B91C1C'],
      tone: 'warm'
    },
    'orange': {
      th: ['ส้ม', 'ส้มแสด'],
      en: ['orange', 'tangerine'],
      hexCodes: ['#F97316', '#EA580C', '#C2410C'],
      tone: 'warm'
    },
    'yellow': {
      th: ['เหลือง', 'ทอง'],
      en: ['yellow', 'gold', 'golden'],
      hexCodes: ['#EAB308', '#CA8A04', '#A16207'],
      tone: 'warm'
    },
    'green': {
      th: ['เขียว', 'เขียวใบไม้'],
      en: ['green', 'emerald', 'lime'],
      hexCodes: ['#10B981', '#059669', '#047857'],
      tone: 'cool'
    },
    'purple': {
      th: ['ม่วง', 'ม่วงอมชมพู'],
      en: ['purple', 'violet', 'lavender'],
      hexCodes: ['#8B5CF6', '#7C3AED', '#6D28D9'],
      tone: 'cool'
    },
    'pink': {
      th: ['ชมพู', 'บานเย็น'],
      en: ['pink', 'rose'],
      hexCodes: ['#EC4899', '#DB2777', '#BE185D'],
      tone: 'warm'
    },
    'brown': {
      th: ['น้ำตาล', 'น้ำตาลอ่อน'],
      en: ['brown', 'chocolate', 'coffee'],
      hexCodes: ['#92400E', '#78350F', '#451A03'],
      tone: 'warm'
    },
    'gray': {
      th: ['เทา', 'เทาอ่อน'],
      en: ['gray', 'grey', 'silver'],
      hexCodes: ['#6B7280', '#4B5563', '#374151'],
      tone: 'neutral'
    },
    'black': {
      th: ['ดำ', 'ดำสนิท'],
      en: ['black', 'dark'],
      hexCodes: ['#111827', '#030712', '#000000'],
      tone: 'neutral'
    },
    'white': {
      th: ['ขาว', 'ขาวสะอาด'],
      en: ['white', 'light'],
      hexCodes: ['#FFFFFF', '#F9FAFB', '#F3F4F6'],
      tone: 'neutral'
    }
  };
  
  /**
   * Detect colors from keywords
   */
  static detect(keywords: string[]): DetectedColors {
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    const detectedColorKeys: string[] = [];
    
    // Find matching colors
    for (const [colorKey, colorData] of Object.entries(this.COLOR_KEYWORDS)) {
      const matched = lowerKeywords.some(keyword => 
        colorData.th.some(th => keyword.includes(th)) ||
        colorData.en.some(en => keyword.includes(en))
      );
      
      if (matched) {
        detectedColorKeys.push(colorKey);
      }
    }
    
    // Determine tone
    const tone = this.determineTone(detectedColorKeys, lowerKeywords);
    
    // Build color palette
    const result: DetectedColors = {
      tone,
      keywords: detectedColorKeys
    };
    
    if (detectedColorKeys.length > 0) {
      // Primary color = first detected
      const primaryKey = detectedColorKeys[0];
      result.primary = this.COLOR_KEYWORDS[primaryKey].hexCodes[0];
      
      // Secondary color = second detected or lighter shade of primary
      if (detectedColorKeys.length > 1) {
        const secondaryKey = detectedColorKeys[1];
        result.secondary = this.COLOR_KEYWORDS[secondaryKey].hexCodes[1];
      } else {
        result.secondary = this.COLOR_KEYWORDS[primaryKey].hexCodes[1];
      }
      
      // Accent color = third detected or darker shade
      if (detectedColorKeys.length > 2) {
        const accentKey = detectedColorKeys[2];
        result.accent = this.COLOR_KEYWORDS[accentKey].hexCodes[0];
      } else {
        result.accent = this.COLOR_KEYWORDS[primaryKey].hexCodes[2];
      }
    }
    
    return result;
  }
  
  /**
   * Determine color tone from keywords
   */
  private static determineTone(
    colorKeys: string[],
    keywords: string[]
  ): 'warm' | 'cool' | 'neutral' | 'vibrant' {
    
    // Check for explicit tone keywords
    if (keywords.some(k => k.includes('อุ่น') || k.includes('warm'))) {
      return 'warm';
    }
    if (keywords.some(k => k.includes('เย็น') || k.includes('cool'))) {
      return 'cool';
    }
    if (keywords.some(k => k.includes('สดใส') || k.includes('vibrant') || k.includes('colorful'))) {
      return 'vibrant';
    }
    
    // Determine from detected colors
    if (colorKeys.length === 0) {
      return 'neutral';
    }
    
    const tones = colorKeys.map(key => this.COLOR_KEYWORDS[key].tone);
    const warmCount = tones.filter(t => t === 'warm').length;
    const coolCount = tones.filter(t => t === 'cool').length;
    
    if (warmCount > coolCount) return 'warm';
    if (coolCount > warmCount) return 'cool';
    if (tones.every(t => t === 'neutral')) return 'neutral';
    
    return 'vibrant'; // Mixed colors
  }
  
  /**
   * Get color by name
   */
  static getColor(colorName: string): string | null {
    const colorData = this.COLOR_KEYWORDS[colorName.toLowerCase()];
    return colorData ? colorData.hexCodes[0] : null;
  }
  
  /**
   * Get all shades of a color
   */
  static getShades(colorName: string): string[] {
    const colorData = this.COLOR_KEYWORDS[colorName.toLowerCase()];
    return colorData ? colorData.hexCodes : [];
  }
}

