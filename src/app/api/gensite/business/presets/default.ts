import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

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
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'default-website'}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}`,

    'index.html': (project, finalJson, ctx) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[BUSINESS_NAME]</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

    'vite.config.ts': () => `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,

    'tailwind.config.js': () => `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};`,

    'src/index.css': () => `@tailwind base;
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

    'src/main.tsx': () => `import React, { useEffect } from 'react';
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

    'src/App.tsx': () => `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;`,

    'src/components/Navbar.tsx': () => `import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const base = 'px-3 py-2 rounded-md text-sm font-medium';
  const active = 'bg-blue-500 text-white';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-500">Default Site</Link>
          <div className="flex space-x-2">
            <NavLink to="/" end className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Home</NavLink>
            <NavLink to="/about" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>About</NavLink>
            <NavLink to="/contact" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Contact</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`,

    'src/components/Footer.tsx': () => `import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <span>© ${new Date().getFullYear()} Default Site. All rights reserved.</span>
        <span>Built with React & TypeScript</span>
      </div>
    </footer>
  );
};

export default Footer;`,

    'src/components/HeroSection.tsx': () => `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to Our Site</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">Discover amazing features and services designed to meet your needs.</p>
        <div className="space-x-3">
          <a href="/about" className="btn-primary px-6 py-3 rounded-lg font-semibold">Learn More</a>
          <a href="/contact" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">Get Started</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`,

    'src/components/ContactForm.tsx': () => `import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        <input
          type="text"
          className="mt-1 w-full border rounded-md px-3 py-2"
          value={formData.subject}
          onChange={e => setFormData({...formData, subject: e.target.value})}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          className="mt-1 w-full border rounded-md px-3 py-2"
          rows={4}
          value={formData.message}
          onChange={e => setFormData({...formData, message: e.target.value})}
          required
        />
      </div>
      <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Send Message</button>
    </form>
  );
};

export default ContactForm;`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Welcome to ${project.name || 'Our Site'}</h2>
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

    'src/pages/About.tsx': () => `import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We are a company dedicated to providing excellent service and innovative solutions 
              to meet the needs of our customers.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To deliver high-quality products and services that exceed customer expectations 
              while maintaining the highest standards of integrity and professionalism.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Choose Us</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Quality Service</h4>
                <p className="text-gray-600">We provide top-notch service to all our customers</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Expert Team</h4>
                <p className="text-gray-600">Our experienced team is ready to help you</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Innovation</h4>
                <p className="text-gray-600">We continuously innovate to serve you better</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;`,

    'src/pages/Contact.tsx': () => `import React from 'react';
import ContactForm from '../components/ContactForm.tsx';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Contact Us</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;`,

    'src/types/index.ts': () => `export interface User {
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
  children: React.ReactNode;
};

export const isNull = <T>(value: T): value is null => {
  return value === null;
};

export const isDefined = <T>(value: T): value is Exclude<T, undefined> => {
  return typeof value !== 'undefined';
};`,

    'src/lib/utils.ts': () => `export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}`,
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


