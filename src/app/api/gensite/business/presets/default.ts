import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';

export const defaultHandler: BusinessHandler = {
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
      { path: 'src/pages/About.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
      { path: 'src/components/ContactForm.tsx', type: 'component' },
      { path: 'src/types/index.ts', type: 'util' },
      { path: 'src/lib/utils.ts', type: 'util' },
    ];
  },

  templates: {},

  getComponentRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const name = path.split('/').pop() || '';
    if (name.includes('Navbar')) {
      return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Create sticky responsive navigation bar`;
    }
    if (name.includes('HeroSection')) {
      return `
- Create impressive hero section as the main focal point`;
    }
    return `- Create ${name.replace('.tsx','')} component`;
  },

  getPageRequirements(path: string): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add key sections`;
    }
    return `- Create page ${path}`;
  },
};


