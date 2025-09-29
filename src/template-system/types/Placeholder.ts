/**
 * Placeholder System Type Definitions
 */

export interface Placeholder {
  type: PlaceholderType;
  content: string;
  position: number;
  context?: PlaceholderContext;
}

export type PlaceholderType = 'tw' | 'text' | 'img' | 'data' | 'slot';

export interface PlaceholderContext {
  file: string;
  line: number;
  component?: string;
  element?: string;
}

export interface PlaceholderMatch {
  fullMatch: string;
  type: PlaceholderType;
  key?: string;
  attributes?: Record<string, string>;
  position: number;
  context: PlaceholderContext;
}

export interface PlaceholderReplacement {
  original: string;
  replacement: string;
  type: PlaceholderType;
  success: boolean;
  error?: string;
}

export interface PlaceholderConfig {
  type: PlaceholderType;
  pattern: RegExp;
  processor: (match: PlaceholderMatch, data: any) => string;
  validator?: (value: any) => boolean;
}

export interface TailwindPlaceholder {
  type: 'tw';
  classes: string[];
  context: {
    element: string;
    component: string;
    theme: string;
  };
}

export interface TextPlaceholder {
  type: 'text';
  content: string;
  context: {
    field: string;
    slot: string;
    language: string;
  };
}

export interface ImagePlaceholder {
  type: 'img';
  url: string;
  alt: string;
  context: {
    slot: string;
    field: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export interface DataPlaceholder {
  type: 'data';
  key: string;
  value: any;
  context: {
    source: string;
    type: string;
  };
}

export interface SlotPlaceholder {
  type: 'slot';
  slotName: string;
  fieldName: string;
  value: any;
  context: {
    component: string;
    slot: string;
  };
}

export interface PlaceholderProcessor {
  process(match: PlaceholderMatch, data: any): Promise<PlaceholderReplacement>;
  validate(value: any): boolean;
}

export interface PlaceholderRegistry {
  register(type: PlaceholderType, processor: PlaceholderProcessor): void;
  get(type: PlaceholderType): PlaceholderProcessor | undefined;
  process(match: PlaceholderMatch, data: any): Promise<PlaceholderReplacement>;
}
