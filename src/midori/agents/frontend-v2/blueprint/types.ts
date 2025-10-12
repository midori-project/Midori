/**
 * Blueprint Types
 * Type definitions for website blueprints
 */

export interface BlueprintSection {
  id: string;
  name: string;
  componentCategory: 'navigation' | 'content' | 'layout';
  componentId: string;
  variantPreference?: string[];
  required: boolean;
  order: number;
  props?: Record<string, any>;
}

export interface BlueprintPage {
  id: string;
  name: string;
  route: string;
  title: string;
  sections: BlueprintSection[];
}

export interface BlueprintMetadata {
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  features: string[];
  estimatedComponents: number;
}

export interface SelectBlueprintInput {
  businessCategory: string;
  features: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  pageCount?: number;
  customRequirements?: string[];
}

