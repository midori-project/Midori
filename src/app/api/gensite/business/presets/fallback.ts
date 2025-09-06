import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';

export const fallbackHandler: BusinessHandler = {
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
    'package.json': (project) => JSON.stringify({
      "name": project.name?.toLowerCase().replace(/\s+/g, '-') || 'generated-project',
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "react-router-dom": "6.8.1"
      },
      "devDependencies": {
        "@types/react": "18.2.15",
        "@types/react-dom": "18.2.7",
        "@vitejs/plugin-react": "4.0.3",
        "tailwindcss": "3.3.3",
        "typescript": "5.1.6",
        "vite": "4.4.9"
      }
    }, null, 2),

    'index.html': (project) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name || 'Generated Project'}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

    'src/main.tsx': (project) => `import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

function ThemeBootstrapper() {
  useEffect(() => {
    const w = globalThis as any;
    const data = w?.__MIDORI_FINAL_JSON__;
    const colors = data?.brand?.colors || data?.theme?.colors;
    if (colors) {
      const root = document.documentElement;
      if (colors.primary) root.style.setProperty('--color-primary', colors.primary);
      if (colors.secondary) root.style.setProperty('--color-secondary', colors.secondary);
      if (colors.accent) root.style.setProperty('--color-accent', colors.accent);
    }
  }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeBootstrapper />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);`,

    'src/index.css': (project) => `@tailwind base;
@tailwind components;
@tailwind utilities;

/* THEME VARIABLES (AI: override from finalJson.brand.colors if provided) */
:root {
  --color-primary: #3b82f6; /* fallback: blue-500 */
  --color-secondary: #10b981; /* fallback: emerald-500 */
  --color-accent: #f59e0b; /* fallback: amber-500 */
}

/* Utilities using CSS variables */
.text-primary { color: var(--color-primary); }
.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.btn-primary { background-color: var(--color-primary); color: #fff; }
.btn-primary:hover { filter: brightness(0.9); }
.badge-accent { background-color: var(--color-accent); color: #fff; }
.bg-hero-gradient { background-image: linear-gradient(90deg, var(--color-primary), var(--color-secondary)); }

html, body, #root { height: 100%; }`,

    'vite.config.ts': (project) => `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    port: 3000
  }
});`,

    'tailwind.config.js': (project) => `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Welcome to ${project.name || 'Our Website'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 1]</h3>
              <p className="text-gray-600">[Feature Description 1]</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 2]</h3>
              <p className="text-gray-600">[Feature Description 2]</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 3]</h3>
              <p className="text-gray-600">[Feature Description 3]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`,

    'src/pages/About.tsx': (project) => `import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About ${project.name || 'Our Company'}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We are committed to providing high-quality service and meeting the needs of all our customers 
              with an experienced and professional team.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Team</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Management Team</h4>
                <p className="text-gray-600">Oversee operations and strategic planning</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Operations Team</h4>
                <p className="text-gray-600">Execute plans and provide customer service</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Company Information</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-600">5+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">1,000+</div>
                <div className="text-gray-600">Customers</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-600">50+</div>
                <div className="text-gray-600">Employees</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">Service</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions or need more information
              </p>
              <Link 
                to="/contact" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;`,

    'src/pages/Contact.tsx': (project) => `import React from 'react';
import ContactForm from '../components/ContactForm.tsx';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">ติดต่อเรา</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          เราพร้อมรับฟังความคิดเห็นและคำแนะนำจากคุณ
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">ข้อมูลติดต่อ</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">contact@${project.name?.toLowerCase().replace(/\s+/g, '') || 'company'}.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">+66 2 123 4567</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">กรุงเทพมหานคร, ประเทศไทย</span>
              </div>
            </div>
          </div>
          
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;`,

    'src/components/Navbar.tsx': (project) => `import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand/Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              ${project.name || 'Website'}
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              หน้าแรก
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              เกี่ยวกับ
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              ติดต่อ
            </Link>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="ค้นหา..." 
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              ค้นหา
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`,

    'src/components/Footer.tsx': (project) => `import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="text-lg font-semibold text-gray-900 mb-4 hover:text-gray-700">
              ${project.name || 'Website'}
            </Link>
            <p className="text-gray-600 mb-4">
              เว็บไซต์สมัยใหม่ที่สร้างด้วย React และ TypeScript
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">เมนูด่วน</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/" className="hover:text-gray-900">หน้าแรก</Link></li>
              <li><Link to="/about" className="hover:text-gray-900">เกี่ยวกับเรา</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900">ติดต่อ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">เทคโนโลยี</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Vite</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {currentYear} ${project.name || 'Website'}. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`,

    'src/components/HeroSection.tsx': (project) => `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">ยินดีต้อนรับสู่ ${project.name || 'เว็บไซต์ของเรา'}</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">เว็บไซต์สมัยใหม่ที่สร้างด้วยเทคโนโลยีล่าสุด</p>
        <div className="space-x-3">
          <a href="/about" className="btn-primary px-6 py-3 rounded-lg font-semibold">เริ่มต้นใช้งาน</a>
          <a href="/contact" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">ติดต่อเรา</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`,

    'src/components/ContactForm.tsx': (project) => `import React from 'react';

const ContactForm: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">ส่งข้อความถึงเรา</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">ชื่อ</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="text"
            id="name"
            placeholder="ชื่อของคุณ"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">อีเมล</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="email"
            id="email"
            placeholder="อีเมลของคุณ"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">ข้อความ</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="message"
            rows={4}
            placeholder="ข้อความของคุณ"
            required
          ></textarea>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          type="submit"
        >
          ส่งข้อความ
        </button>
      </form>
    </div>
  );
};

export default ContactForm;`,

    'src/types/index.ts': (project) => `import { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
}

export type ApiResponse<T> = {
  data: T;
  error?: string;
};

export type Nullable<T> = T | null;

export type ChildrenProps = {
  children: ReactNode;
};

export const isNull = <T>(value: T): value is null => {
  return value === null;
};

export const isDefined = <T>(value: T): value is Exclude<T, undefined> => {
  return typeof value !== 'undefined';
};`,

    'src/lib/utils.ts': (project) => `import { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export type Nullable<T> = T | null;

export function isEmpty<T>(value: T): boolean {
  return value === null || value === undefined || (Array.isArray(value) && value.length === 0);
}

export function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => ({
      data,
      message: 'Fetch successful',
      status: 200,
    }));
}

export function renderWithFallback<T>(node: ReactNode, fallback: ReactNode): ReactNode {
  return isEmpty(node) ? fallback : node;
}`,
  },

  getComponentRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const name = path.split('/').pop() || '';
    if (name.includes('Navbar')) {
      return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Create sticky responsive navigation bar with modern design
- Use <Link to="/">, <Link to="/about">, <Link to="/contact">`;
    }
    if (name.includes('HeroSection')) {
      return `
- Create impressive hero section as the main focal point
- Include CTA and search functionality`;
    }
    return `- Create ${name.replace('.tsx','')} component with modern design`;
  },

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add key sections`;
    }
    return `- Create page ${path} with modern design and functionality`;
  },
};
