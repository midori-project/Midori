import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';

export const technologyHandler: BusinessHandler = {
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
      { path: 'src/pages/Projects.tsx', type: 'page' },
      { path: 'src/pages/Services.tsx', type: 'page' },
      { path: 'src/pages/Team.tsx', type: 'page' },
      { path: 'src/components/ProjectCard.tsx', type: 'component' },
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
- Add links: Home, Projects, Services, Team, About, Contact`;
    }
    if (name.includes('ProjectCard')) {
      return `
- Project card with title, tech stack, description`;
    }
    return `- Create ${name.replace('.tsx','')} component for technology website`;
  },

  getPageRequirements(path: string): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add services, technologies`;
    }
    if (file.includes('services')) {
      return `
- Services page with cards, CTA`;
    }
    return `- Create page ${path} for technology`;
  },
};


