import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';

export const blogHandler: BusinessHandler = {
  getEssentialFiles(project: ProjectLike): FileConfigLite[] {
    return [
      { path: 'package.json', type: 'config' },
      { path: 'index.html', type: 'config' },
      { path: 'src/main.tsx', type: 'entry' },
      { path: 'src/App.tsx', type: 'app' },
      { path: 'src/index.css', type: 'style' },
      { path: 'vite.config.ts', type: 'config' },
      { path: 'tailwind.config.js', type: 'config' },
      { path: 'src/pages/About.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
      { path: 'src/components/ContactForm.tsx', type: 'component' },
      { path: 'src/pages/Home.tsx', type: 'page' },
      { path: 'src/pages/Articles.tsx', type: 'page' },
      { path: 'src/pages/Article.tsx', type: 'page' },
      { path: 'src/pages/Categories.tsx', type: 'page' },
      { path: 'src/pages/AdminDashboard.tsx', type: 'page' },
      { path: 'src/components/ArticleList.tsx', type: 'component' },
      { path: 'src/components/ArticleCard.tsx', type: 'component' },
      { path: 'src/components/CommentSection.tsx', type: 'component' },
      { path: 'src/components/CategoryList.tsx', type: 'component' },
      { path: 'src/types/index.ts', type: 'util' },
      { path: 'src/lib/utils.ts', type: 'util' },
    ];
  },

  templates: {
    // ใช้ให้ route.ts ดึงก่อนค่อย fallback ถ้าไม่มี
    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
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
- Create sticky responsive navigation bar for blog website with modern design
- Use <Link to="/">, <Link to="/articles">, <Link to="/categories">, <Link to="/about">, <Link to="/contact">`;
    }
    if (name.includes('HeroSection')) {
      return `
- Create impressive hero section for blog
- Include CTA and search bar`;
    }
    if (name.includes('Article') && name.includes('List')) {
      return `
- Article listing with pagination, filtering, tags`;
    }
    return `- Create ${name.replace('.tsx','')} component for blog website`;
  },

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start page with <HeroSection /> and add featured articles, categories`;
    }
    if (file.includes('articles') && !file.endsWith('article.tsx')) {
      return `
- Articles listing page with search, filters, pagination`;
    }
    if (file.endsWith('article.tsx')) {
      return `
- Single article page with full content, metadata, sharing, comments`;
    }
    return `- Create page ${path} for blog`;
  },
};


