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

  templates: {
    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Welcome to ${project.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center"><h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 1]</h3><p className="text-gray-600">[Feature Description 1]</p></div>
            <div className="bg-gray-50 rounded-xl p-6 text-center"><h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 2]</h3><p className="text-gray-600">[Feature Description 2]</p></div>
            <div className="bg-gray-50 rounded-xl p-6 text-center"><h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 3]</h3><p className="text-gray-600">[Feature Description 3]</p></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`,
  },

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


