import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';

export const restaurantHandler: BusinessHandler = {
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
      { path: 'src/pages/Menu.tsx', type: 'page' },
      { path: 'src/pages/Reservation.tsx', type: 'page' },
      { path: 'src/pages/ChefProfile.tsx', type: 'page' },
      { path: 'src/pages/DishGallery.tsx', type: 'page' },
      { path: 'src/components/MenuCard.tsx', type: 'component' },
      { path: 'src/components/ReservationForm.tsx', type: 'component' },
      { path: 'src/pages/About.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
    ];
  },

  templates: {},

  getComponentRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const name = path.split('/').pop() || '';
    if (name.includes('Navbar')) {
      return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Add links: Home, Menu, Reservation, About, Contact`;
    }
    if (name.includes('MenuCard')) {
      return `
- Create menu card with image, name, price, CTA`;
    }
    if (name.includes('ReservationForm')) {
      return `
- Create reservation form with name, phone, date, time, guests`;
    }
    return `- Create ${name.replace('.tsx','')} component for restaurant website`;
  },

  getPageRequirements(path: string): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add featured dishes, why choose us`;
    }
    if (file.includes('menu')) {
      return `
- Create menu page with categories, prices, CTA`;
    }
    if (file.includes('reservation')) {
      return `
- Create reservation page with ReservationForm and info`;
    }
    return `- Create page ${path} for restaurant`;
  },
};


