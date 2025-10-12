/**
 * ThemePack Types
 * Type definitions for theme generation
 */

export interface ColorKeyword {
  th: string[];
  en: string[];
  hexCodes: string[];
  tone: 'warm' | 'cool' | 'neutral' | 'vibrant';
}

export interface DetectedColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  tone: 'warm' | 'cool' | 'neutral' | 'vibrant';
  keywords: string[];
}

export interface GenerateThemePackInput {
  businessCategory: string;
  keywords: string[];
  userInput: string;
  style?: 'modern' | 'classic' | 'minimal' | 'creative';
  tone?: 'friendly' | 'professional' | 'luxury' | 'playful';
}

export interface ThemePackMetadata {
  category: string;
  generatedAt: string;
  keywords: string[];
  detectedColors: DetectedColors;
}

