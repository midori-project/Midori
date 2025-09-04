import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';

export const fashionHandler: BusinessHandler = {
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
      { path: 'src/pages/Collection.tsx', type: 'page' },
      { path: 'src/pages/ProductDetail.tsx', type: 'page' },
      { path: 'src/pages/StyleGuide.tsx', type: 'page' },
      { path: 'src/components/ProductCard.tsx', type: 'component' },
      { path: 'src/components/SizeGuide.tsx', type: 'component' },
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
- Add links: Home, Collection, StyleGuide, About, Contact`;
    }
    if (name.includes('ProductCard')) {
      return `
- Product card with image, name, price, CTA`;
    }
    if (name.includes('SizeGuide')) {
      return `
- Size guide with measurements`;
    }
    return `- Create ${name.replace('.tsx','')} component for fashion website`;
  },

  getPageRequirements(path: string): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add featured collection`;
    }
    if (file.includes('collection')) {
      return `
- Collection page with filters and cards`;
    }
    return `- Create page ${path} for fashion`;
  },
};


