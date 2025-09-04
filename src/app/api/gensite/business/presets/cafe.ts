import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';

export const cafeHandler: BusinessHandler = {
  getEssentialFiles(project: ProjectLike): FileConfigLite[] {
    return [
      { path: 'package.json', type: 'config' },
      { path: 'index.html', type: 'config' },
      { path: 'src/main.tsx', type: 'entry' },
      { path: 'src/App.tsx', type: 'app' },
      { path: 'src/index.css', type: 'style' },
      { path: 'vite.config.ts', type: 'config' },
      { path: 'tailwind.config.js', type: 'config' },
      { path: 'src/pages/Home.tsx', type: 'page' },
      { path: 'src/pages/CoffeeMenu.tsx', type: 'page' },
      { path: 'src/pages/BaristaProfile.tsx', type: 'page' },
      { path: 'src/pages/OrderTracking.tsx', type: 'page' },
      { path: 'src/pages/BeanOrigin.tsx', type: 'page' },
      { path: 'src/components/CoffeeCard.tsx', type: 'component' },
      { path: 'src/components/OrderStatus.tsx', type: 'component' },
      { path: 'src/pages/About.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
    ];
  },

  templates: {},

  getComponentRequirements(path: string): string {
    const name = path.split('/').pop() || '';
    if (name.includes('Navbar')) {
      return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Add links: Home, CoffeeMenu, About, Contact`;
    }
    if (name.includes('CoffeeCard')) {
      return `
- Coffee card with image, name, price, CTA`;
    }
    if (name.includes('OrderStatus')) {
      return `
- Order status widget with steps`;
    }
    return `- Create ${name.replace('.tsx','')} component for cafe website`;
  },

  getPageRequirements(path: string): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add featured coffee, atmosphere`;
    }
    if (file.includes('coffeemenu')) {
      return `
- Menu page with categories and prices`;
    }
    return `- Create page ${path} for cafe`;
  },
};


