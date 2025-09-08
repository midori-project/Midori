import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike, EnhancedContentAnalysis, StyleConfiguration } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

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

  templates: {
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'cafe-website'}",
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

    'index.html': (project, finalJson, ctx) => {
      const template = `<!doctype html>
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
</html>`;
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

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
  --color-primary: #8b4513; /* fallback: brown-600 */
  --color-secondary: #d2691e; /* fallback: chocolate */
  --color-accent: #f4a460; /* fallback: sandybrown */
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
import CoffeeMenu from './pages/CoffeeMenu.tsx';
import BaristaProfile from './pages/BaristaProfile.tsx';
import OrderTracking from './pages/OrderTracking.tsx';
import BeanOrigin from './pages/BeanOrigin.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<CoffeeMenu />} />
          <Route path="/barista" element={<BaristaProfile />} />
          <Route path="/tracking" element={<OrderTracking />} />
          <Route path="/beans" element={<BeanOrigin />} />
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
  const active = 'bg-amber-600 text-white';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-amber-600">Cafe</Link>
          <div className="flex space-x-2">
            <NavLink to="/" end className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50">Home</NavLink>
            <NavLink to="/menu" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50">Menu</NavLink>
            <NavLink to="/barista" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50">Barista</NavLink>
            <NavLink to="/tracking" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50">Track Order</NavLink>
            <NavLink to="/beans" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50">Bean Origin</NavLink>
            <NavLink to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50">About</NavLink>
            <NavLink to="/contact" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50">Contact</NavLink>
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
        <span>© ${new Date().getFullYear()} Cafe. All rights reserved.</span>
        <span>Open 7AM - 10PM • Call 02-123-4567</span>
      </div>
    </footer>
  );
};

export default Footer;`,

    'src/components/HeroSection.tsx': async (project, finalJson, ctx) => {
      const template = `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">[HERO_TITLE]</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">[HERO_SUBTITLE]</p>
        <div className="space-x-3">
          <a href="/menu" className="btn-primary px-6 py-3 rounded-lg font-semibold">[MENU_BUTTON_TEXT]</a>
          <a href="/tracking" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">Track Order</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`;
      
      return await TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/components/CoffeeCard.tsx': () => `import React from 'react';

interface CoffeeCardProps {
  name: string;
  description: string;
  price: number;
  origin: string;
  roast: string;
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ name, description, price, origin, roast }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="w-full h-40 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg mb-4" />
      <div className="flex items-center justify-between mb-2">
        <span className="badge-accent px-2 py-1 rounded-full text-xs">{roast}</span>
        <span className="text-sm text-gray-500">{origin}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">[COFFEE_PRICE]</span>
        <button className="btn-primary px-4 py-2 rounded-lg transition-colors">Order</button>
      </div>
    </div>
  );
};

export default CoffeeCard;`,

    'src/components/OrderStatus.tsx': () => `import React from 'react';

interface OrderStatusProps {
  orderId: string;
  status: 'preparing' | 'ready' | 'completed';
  estimatedTime: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ orderId, status, estimatedTime }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'text-yellow-600';
      case 'ready': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Order #{orderId}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <span className="font-semibold text-blue-600">
            [ORDER_STATUS]
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Estimated Time:</span>
          <span className="text-gray-600">{estimatedTime}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="h-2 rounded-full bg-blue-500" style={{width: '50%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;`,

    'src/pages/Home.tsx': async (project, finalJson, ctx) => {
      const template = `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Coffee Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">[FEATURED_SECTION_TITLE]</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[MENU_ITEM_1_NAME]</h3>
              <p className="text-gray-600 mb-4">[MENU_ITEM_1_DESCRIPTION]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">[MENU_ITEM_1_PRICE]</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">[ORDER_BUTTON_TEXT]</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[MENU_ITEM_2_NAME]</h3>
              <p className="text-gray-600 mb-4">[MENU_ITEM_2_DESCRIPTION]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">[MENU_ITEM_2_PRICE]</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">[ORDER_BUTTON_TEXT]</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[MENU_ITEM_3_NAME]</h3>
              <p className="text-gray-600 mb-4">[MENU_ITEM_3_DESCRIPTION]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">[MENU_ITEM_3_PRICE]</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">[ORDER_BUTTON_TEXT]</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Atmosphere Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">[ABOUT_SECTION_TITLE]</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[FEATURE_1_TITLE]</h3>
              <p className="text-gray-600">[FEATURE_1_DESCRIPTION]</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[FEATURE_2_TITLE]</h3>
              <p className="text-gray-600">[FEATURE_2_DESCRIPTION]</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[FEATURE_3_TITLE]</h3>
              <p className="text-gray-600">[FEATURE_3_DESCRIPTION]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;
      
      return await TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/pages/CoffeeMenu.tsx': (project) => `import React from 'react';
import CoffeeCard from '../components/CoffeeCard.tsx';

// AI NOTE: Menu will be filled from promptJson (finalJson.menu.items)
// Expected structure: finalJson.menu = { items: [{ name, description, price, origin, roast }] }

type CoffeeItem = { name: string; description: string; price: number; origin: string; roast: string };

// fallback in case no data from AI
const fallbackMenu: CoffeeItem[] = [
  { name: 'Espresso', description: 'Rich and bold', price: 80, origin: 'Colombia', roast: 'Dark' },
  { name: 'Cappuccino', description: 'Perfect balance', price: 120, origin: 'Ethiopia', roast: 'Medium' },
  { name: 'Latte', description: 'Smooth and creamy', price: 140, origin: 'Brazil', roast: 'Light' },
];

// Read data from window.__MIDORI_FINAL_JSON__ that preview will inject
function getCoffeeItems(): CoffeeItem[] {
  const w = globalThis as any;
  const data = w?.__MIDORI_FINAL_JSON__;
  const items = data?.menu?.items;
  if (Array.isArray(items) && items.length > 0) return items as CoffeeItem[];
  return fallbackMenu;
}

const CoffeeMenu: React.FC = () => {
  const items = getCoffeeItems();
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Coffee Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <CoffeeCard key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoffeeMenu;`,

    'src/pages/BaristaProfile.tsx': () => `import React from 'react';

const BaristaProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Meet Our Barista</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="w-full h-80 bg-amber-100 rounded-xl" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Barista Somchai</h2>
            <p className="text-gray-700 leading-relaxed">With over 8 years of experience in specialty coffee, Barista Somchai brings passion and expertise to every cup. Certified by the Specialty Coffee Association.</p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialties</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Latte Art</li>
                <li>• Espresso Extraction</li>
                <li>• Coffee Bean Roasting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaristaProfile;`,

    'src/pages/OrderTracking.tsx': () => `import React, { useState } from 'react';
import OrderStatus from '../components/OrderStatus.tsx';

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);

  const trackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock order data
    setOrder({
      orderId: orderId || 'CAFE001',
      status: 'preparing',
      estimatedTime: '5-10 minutes'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Track Your Order</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <form onSubmit={trackOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order ID</label>
              <input
                type="text"
                className="mt-1 w-full border rounded-md px-3 py-2"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                required
              />
            </div>
            <button type="submit" className="btn-primary px-4 py-2 rounded-lg w-full">Track Order</button>
          </form>
        </div>

        {order && <OrderStatus {...order} />}
      </div>
    </div>
  );
};

export default OrderTracking;`,

    'src/pages/BeanOrigin.tsx': () => `import React from 'react';

const BeanOrigin: React.FC = () => {
  const origins = [
    { name: 'Colombia', description: 'Rich and full-bodied', region: 'South America' },
    { name: 'Ethiopia', description: 'Fruity and floral', region: 'Africa' },
    { name: 'Brazil', description: 'Nutty and smooth', region: 'South America' },
    { name: 'Jamaica', description: 'Mild and balanced', region: 'Caribbean' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Coffee Bean Origins</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {origins.map((origin, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-32 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{origin.name}</h3>
              <p className="text-gray-600 mb-2">{origin.description}</p>
              <p className="text-sm text-gray-500">{origin.region}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BeanOrigin;`,

    'src/pages/About.tsx': () => `import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Our Cafe</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Founded in 2015, our cafe has been serving the community with passion and dedication. 
              We source the finest coffee beans from around the world and roast them to perfection.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide exceptional coffee experiences while fostering community connections and supporting sustainable practices.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cafe Information</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-amber-600">8+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-amber-600">50+</div>
                <div className="text-gray-600">Coffee Varieties</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-amber-600">1000+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-amber-600">15</div>
                <div className="text-gray-600">Hours Daily</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;`,

    'src/types/index.ts': () => `export interface CoffeeItem {
  id: string;
  name: string;
  description: string;
  price: number;
  origin: string;
  roast: string;
  category: string;
}

export interface Order {
  id: string;
  items: CoffeeItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
}

export interface Barista {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  certifications: string[];
}

export type ApiResponse<T> = {
  data: T;
  error?: string;
};

export type Nullable<T> = T | null;`,

    'src/lib/utils.ts': () => `export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(price);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function calculateOrderTotal(items: any[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-yellow-600';
    case 'preparing': return 'text-blue-600';
    case 'ready': return 'text-green-600';
    case 'completed': return 'text-gray-600';
    default: return 'text-gray-600';
  }
}`,

    'src/pages/Contact.tsx': async (project, finalJson, ctx) => {
      const template = `import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">[CONTACT_BUTTON_TEXT]</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <p>📍 [CONTACT_ADDRESS]</p>
          <p>📞 [CONTACT_PHONE]</p>
          <p>🕒 [CONTACT_HOURS]</p>
          <p>✉️ [CONTACT_EMAIL]</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;`;
      
      return await TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },
  },

  getComponentRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
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

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
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

  getEnhancedContentAnalysis(finalJson: Record<string, unknown>, ctx: BusinessContext): EnhancedContentAnalysis {
    const projectInfo = finalJson.project as any;
    return {
      businessName: projectInfo?.name || 'Cafe',
      tagline: 'Great Coffee, Great Atmosphere',
      heroTitle: 'Experience Exceptional Coffee',
      heroSubtitle: 'Premium quality coffee from freshly roasted beans every day',
      aboutText: 'We are a cafe dedicated to serving high-quality coffee in a warm and relaxing atmosphere',
      tone: 'warm',
      language: 'en',
      contentStyle: 'cozy',
      navigationItems: ['Home', 'Coffee Menu', 'Barista', 'Order Tracking', 'Bean Origin', 'About', 'Contact'],
      industrySpecificContent: {
        coffeeTypes: ['Espresso', 'Latte', 'Cappuccino', 'Americano'],
        origins: ['Ethiopia', 'Colombia', 'Brazil', 'Jamaica'],
        roastLevels: ['Light Roast', 'Medium Roast', 'Dark Roast'],
        atmosphere: ['City Center', 'Warm Atmosphere', 'Free WiFi']
      },
      colorPreferences: ['brown', 'amber', 'warm'],
      layoutPreferences: ['cozy', 'warm', 'comfortable'],
      contactInfo: {
        phone: '02-123-4567',
        hours: '7:00 - 22:00',
        email: 'info@cafe.com'
      }
    };
  },

  getStyleConfiguration(finalJson: Record<string, unknown>, ctx: BusinessContext): StyleConfiguration {
    return {
      colorScheme: {
        primary: '#8b4513', // brown-600
        secondary: '#d2691e', // chocolate
        accent: '#f4a460', // sandybrown
        neutral: ['#faf8f5', '#f5f1eb', '#e8e0d1', '#d4c4a8']
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: 'medium'
      },
      layout: {
        spacing: 'comfortable',
        borderRadius: 'medium',
        shadows: 'subtle'
      }
    };
  }
};
