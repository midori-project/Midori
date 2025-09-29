/**
 * Theme System Type Definitions
 */

export interface Theme {
  name: string;
  displayName: string;
  description: string;
  colors: ColorScheme;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  breakpoints: BreakpointConfig;
}

export interface ColorScheme {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
}

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export interface TypographyConfig {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: FontSizeConfig;
  fontWeight: FontWeightConfig;
  lineHeight: LineHeightConfig;
}

export interface FontSizeConfig {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface FontWeightConfig {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeightConfig {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface BorderRadiusConfig {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ShadowConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface BreakpointConfig {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeMapping {
  [themeName: string]: string;
}

export interface ThemeContext {
  currentTheme: string;
  availableThemes: string[];
  customizations: ThemeCustomizations;
}

export interface ThemeCustomizations {
  colors?: Partial<ColorScheme>;
  typography?: Partial<TypographyConfig>;
  spacing?: Partial<SpacingConfig>;
  borderRadius?: Partial<BorderRadiusConfig>;
  shadows?: Partial<ShadowConfig>;
}

export interface ThemeProcessor {
  applyTheme(content: string, theme: Theme): string;
  generateCSS(theme: Theme): string;
  validateTheme(theme: Theme): boolean;
}

export interface ThemeRegistry {
  register(name: string, theme: Theme): void;
  get(name: string): Theme | undefined;
  list(): string[];
  apply(content: string, themeName: string): string;
}
