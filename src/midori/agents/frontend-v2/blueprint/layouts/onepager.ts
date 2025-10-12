/**
 * Onepager Blueprint
 * Single page website layout
 */

import type { Blueprint } from '@/midori/agents/orchestrator/types/enhancedProjectContext';

/**
 * Restaurant Onepager Blueprint
 */
export const RESTAURANT_ONEPAGER: Blueprint = {
  id: 'restaurant-onepager-v1',
  name: 'Restaurant One Page',
  description: 'Single page restaurant website with all sections',
  type: 'onepager',
  category: 'restaurant',
  pages: [
    {
      id: 'home',
      name: 'Home',
      route: '/',
      title: 'Home',
      sections: [
        {
          id: 'navbar',
          name: 'Navigation Bar',
          componentCategory: 'navigation',
          componentId: 'navbar',
          variantPreference: ['horizontal', 'minimal'],
          required: true,
          order: 0
        },
        {
          id: 'hero',
          name: 'Hero Section',
          componentCategory: 'content',
          componentId: 'hero',
          variantPreference: ['centered', 'left-image'],
          required: true,
          order: 1
        },
        {
          id: 'about',
          name: 'About Section',
          componentCategory: 'content',
          componentId: 'about',
          variantPreference: ['side-by-side', 'centered'],
          required: true,
          order: 2
        },
        {
          id: 'menu',
          name: 'Menu Section',
          componentCategory: 'content',
          componentId: 'menu',
          variantPreference: ['grid', 'list'],
          required: true,
          order: 3
        },
        {
          id: 'contact',
          name: 'Contact Section',
          componentCategory: 'content',
          componentId: 'contact',
          variantPreference: ['with-form', 'info-only'],
          required: true,
          order: 4
        },
        {
          id: 'footer',
          name: 'Footer',
          componentCategory: 'layout',
          componentId: 'footer',
          variantPreference: ['simple', 'multi-column'],
          required: true,
          order: 5
        }
      ]
    }
  ],
  layout: {
    type: 'onepager',
    sections: ['navbar', 'hero', 'about', 'menu', 'contact', 'footer'],
    navigation: {
      type: 'smooth-scroll',
      anchors: true
    }
  },
  components: [
    { category: 'navigation', required: true, min: 1, max: 1 },
    { category: 'content', required: true, min: 3, max: 6 },
    { category: 'layout', required: true, min: 1, max: 1 }
  ],
  metadata: {
    complexity: 'moderate',
    estimatedComponents: 6,
    features: ['menu', 'contact', 'about'],
    targetDevices: ['desktop', 'mobile']
  }
};

/**
 * E-commerce Onepager Blueprint
 */
export const ECOMMERCE_ONEPAGER: Blueprint = {
  id: 'ecommerce-onepager-v1',
  name: 'E-commerce One Page',
  description: 'Single page e-commerce website',
  type: 'onepager',
  category: 'ecommerce',
  pages: [
    {
      id: 'home',
      name: 'Home',
      route: '/',
      title: 'Home',
      sections: [
        {
          id: 'navbar',
          name: 'Navigation Bar',
          componentCategory: 'navigation',
          componentId: 'navbar',
          variantPreference: ['horizontal'],
          required: true,
          order: 0
        },
        {
          id: 'hero',
          name: 'Hero Section',
          componentCategory: 'content',
          componentId: 'hero',
          variantPreference: ['centered', 'minimal'],
          required: true,
          order: 1
        },
        {
          id: 'products',
          name: 'Products Section',
          componentCategory: 'content',
          componentId: 'menu', // Reuse menu component for products
          variantPreference: ['grid'],
          required: true,
          order: 2
        },
        {
          id: 'about',
          name: 'About Section',
          componentCategory: 'content',
          componentId: 'about',
          variantPreference: ['centered'],
          required: false,
          order: 3
        },
        {
          id: 'contact',
          name: 'Contact Section',
          componentCategory: 'content',
          componentId: 'contact',
          variantPreference: ['info-only'],
          required: true,
          order: 4
        },
        {
          id: 'footer',
          name: 'Footer',
          componentCategory: 'layout',
          componentId: 'footer',
          variantPreference: ['multi-column'],
          required: true,
          order: 5
        }
      ]
    }
  ],
  layout: {
    type: 'onepager',
    sections: ['navbar', 'hero', 'products', 'about', 'contact', 'footer'],
    navigation: {
      type: 'smooth-scroll',
      anchors: true
    }
  },
  components: [
    { category: 'navigation', required: true, min: 1, max: 1 },
    { category: 'content', required: true, min: 3, max: 5 },
    { category: 'layout', required: true, min: 1, max: 1 }
  ],
  metadata: {
    complexity: 'moderate',
    estimatedComponents: 6,
    features: ['products', 'cart', 'contact'],
    targetDevices: ['desktop', 'mobile']
  }
};

/**
 * Portfolio Onepager Blueprint
 */
export const PORTFOLIO_ONEPAGER: Blueprint = {
  id: 'portfolio-onepager-v1',
  name: 'Portfolio One Page',
  description: 'Single page portfolio website',
  type: 'onepager',
  category: 'portfolio',
  pages: [
    {
      id: 'home',
      name: 'Home',
      route: '/',
      title: 'Home',
      sections: [
        {
          id: 'navbar',
          name: 'Navigation Bar',
          componentCategory: 'navigation',
          componentId: 'navbar',
          variantPreference: ['minimal', 'centered'],
          required: true,
          order: 0
        },
        {
          id: 'hero',
          name: 'Hero Section',
          componentCategory: 'content',
          componentId: 'hero',
          variantPreference: ['minimal', 'centered'],
          required: true,
          order: 1
        },
        {
          id: 'about',
          name: 'About Section',
          componentCategory: 'content',
          componentId: 'about',
          variantPreference: ['story', 'centered'],
          required: true,
          order: 2
        },
        {
          id: 'contact',
          name: 'Contact Section',
          componentCategory: 'content',
          componentId: 'contact',
          variantPreference: ['centered', 'info-only'],
          required: true,
          order: 3
        },
        {
          id: 'footer',
          name: 'Footer',
          componentCategory: 'layout',
          componentId: 'footer',
          variantPreference: ['centered', 'simple'],
          required: true,
          order: 4
        }
      ]
    }
  ],
  layout: {
    type: 'onepager',
    sections: ['navbar', 'hero', 'about', 'contact', 'footer'],
    navigation: {
      type: 'smooth-scroll',
      anchors: true
    }
  },
  components: [
    { category: 'navigation', required: true, min: 1, max: 1 },
    { category: 'content', required: true, min: 3, max: 4 },
    { category: 'layout', required: true, min: 1, max: 1 }
  ],
  metadata: {
    complexity: 'simple',
    estimatedComponents: 5,
    features: ['portfolio', 'about', 'contact'],
    targetDevices: ['desktop', 'mobile']
  }
};

/**
 * All onepager blueprints
 */
export const ONEPAGER_BLUEPRINTS = {
  restaurant: RESTAURANT_ONEPAGER,
  ecommerce: ECOMMERCE_ONEPAGER,
  portfolio: PORTFOLIO_ONEPAGER
};

