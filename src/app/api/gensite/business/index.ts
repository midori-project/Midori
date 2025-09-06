import { BusinessHandler } from './types';
import { blogHandler } from './presets/blog';
import { restaurantHandler } from './presets/restaurant';
import { cafeHandler } from './presets/cafe_new';
import { fashionHandler } from './presets/fashion_new';
import { technologyHandler } from './presets/technology';
import { defaultHandler } from './presets/default';
import { fallbackHandler } from './presets/fallback';

const BUSINESS_HANDLERS: Record<string, BusinessHandler> = {
  blog: blogHandler,
  restaurant: restaurantHandler,
  cafe: cafeHandler,
  fashion: fashionHandler,
  technology: technologyHandler,
  default: defaultHandler,
  fallback: fallbackHandler,
};

export function getBusinessHandler(industry?: string): BusinessHandler {
  const key = (industry || '').toLowerCase();
  return BUSINESS_HANDLERS[key] || BUSINESS_HANDLERS.fallback;
}


