// Business Category Manifests
// Each business category defines which shared blocks to use and how to customize them

import { restaurantCategories } from "./categories/restaurants";
import { ecommerceCategories } from "./categories/ecommerce";
import { portfolioCategories } from "./categories/portfolio";
import { healthcareCategories } from "./categories/healthcare";

export interface BusinessCategoryManifest {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  blocks: BlockUsage[];
  globalSettings: GlobalSettings;
  overrides: CategoryOverrides;
}

export interface BlockUsage {
  blockId: string;
  variantId?: string;
  required: boolean;
  customizations: Record<string, any>;
}

export interface GlobalSettings {
  palette: {
    primary: string;
    secondary?: string;
    bgTone?: string;
  };
  tokens: {
    radius: string;
    spacing: string;
  };
  tone?: string;
  reasoning?: string;
}

export interface CategoryOverrides {
  [blockId: string]: {
    placeholders: Record<string, PlaceholderOverride>;
    template?: string;
  };
}

export interface PlaceholderOverride {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  enum?: string[];
  defaultValue?: any;
  description?: string;
}

// Business Category Definitions
export const BUSINESS_CATEGORIES: BusinessCategoryManifest[] = [
  ...restaurantCategories,
  ...ecommerceCategories,
  ...portfolioCategories,
  ...healthcareCategories
];
