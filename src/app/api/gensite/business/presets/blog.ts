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
    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Articles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Articles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Article Title 1]</h3>
              <p className="text-gray-600 mb-4">[Article Description 1]</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By Admin</span>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
            </article>
            
            <article className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Article Title 2]</h3>
              <p className="text-gray-600 mb-4">[Article Description 2]</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By Writer</span>
                <span className="text-sm text-gray-500">5 days ago</span>
              </div>
            </article>
            
            <article className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Article Title 3]</h3>
              <p className="text-gray-600 mb-4">[Article Description 3]</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By Editor</span>
                <span className="text-sm text-gray-500">1 week ago</span>
              </div>
            </article>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Article Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 1]</h3>
              <p className="text-sm text-gray-600">[Article Count 1]</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 2]</h3>
              <p className="text-sm text-gray-600">[Article Count 2]</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 3]</h3>
              <p className="text-sm text-gray-600">[Article Count 3]</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 4]</h3>
              <p className="text-sm text-gray-600">[Article Count 4]</p>
            </div>
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


