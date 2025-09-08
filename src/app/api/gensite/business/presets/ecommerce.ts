import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike, EnhancedContentAnalysis, StyleConfiguration } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

export const ecommerceHandler: BusinessHandler = {
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
      { path: 'src/pages/Products.tsx', type: 'page' },
      { path: 'src/pages/ProductDetail.tsx', type: 'page' },
      { path: 'src/pages/Cart.tsx', type: 'page' },
      { path: 'src/pages/Checkout.tsx', type: 'page' },
      { path: 'src/pages/About.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
      { path: 'src/components/ProductCard.tsx', type: 'component' },
      { path: 'src/components/CartItem.tsx', type: 'component' },
      { path: 'src/components/CheckoutForm.tsx', type: 'component' },
      { path: 'src/types/index.ts', type: 'util' },
      { path: 'src/lib/utils.ts', type: 'util' },
    ];
  },

  templates: {
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'ecommerce-site'}",
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
<html lang="th">
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
  --color-primary: #059669; /* fallback: emerald-600 */
  --color-secondary: #3b82f6; /* fallback: blue-500 */
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
import Products from './pages/Products.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;`,

    'src/components/Navbar.tsx': (project, finalJson, ctx) => {
      const template = `import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [cartCount] = useState(3); // Mock cart count
  const base = 'px-3 py-2 rounded-md text-sm font-medium';
  const active = 'bg-emerald-600 text-white';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-emerald-600">[BUSINESS_NAME]</Link>
          <div className="flex space-x-2">
            <NavLink to="/" end className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Home</NavLink>
            <NavLink to="/products" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Products</NavLink>
            <NavLink to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">About</NavLink>
            <NavLink to="/contact" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Contact</NavLink>
            <Link to="/cart" className="relative text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/components/Footer.tsx': () => `import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
        <span>© {new Date().getFullYear()} Online Store. All rights reserved.</span>
        <span>Free shipping nationwide • Call 02-123-4567</span>
      </div>
    </footer>
  );
};

export default Footer;`,

    'src/components/HeroSection.tsx': () => `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white bg-hero-gradient">
      <img src="[HERO_IMAGE_URL]" alt="[HERO_IMAGE_ALT]" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Quality Online Shopping</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">Quality products, great prices, free shipping nationwide</p>
        <div className="space-x-3">
          <a href="/products" className="btn-primary px-6 py-3 rounded-lg font-semibold">View Products</a>
          <a href="/about" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">About Us</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`,

    'src/components/ProductCard.tsx': () => `import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  inStock?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  id, name, price, originalPrice, image, rating = 5, inStock = true 
}) => {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      <Link to={\`/product/\${id}\`}>
        <div className="w-full h-48 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg mb-4 relative">
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={\`w-4 h-4 \${i < rating ? 'fill-current' : 'text-gray-300'}\`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">({rating}.0)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-emerald-600">[PRODUCT_PRICE]</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">[ORIGINAL_PRICE]</span>
            )}
          </div>
          <button 
            className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
              inStock 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }\`}
            disabled={!inStock}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';
import ProductCard from '../components/ProductCard.tsx';

const Home: React.FC = () => {
  // Mock featured products
  const featuredProducts = [
    { id: '1', name: 'Latest Smartphone', price: 15900, originalPrice: 18900, image: '', rating: 5 },
    { id: '2', name: 'Premium Wireless Headphones', price: 3500, originalPrice: 4500, image: '', rating: 4 },
    { id: '3', name: 'Work Laptop', price: 25900, originalPrice: 29900, image: '', rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping nationwide for orders over $10</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Authentic</h3>
              <p className="text-gray-600">Guaranteed authentic products from manufacturers with certificates</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">After-Sales Service</h3>
              <p className="text-gray-600">Our team is ready to serve you 24/7</p>
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
- Create e-commerce navigation with cart icon and count
- Add links: Home, Products, About, Contact, Cart`;
    }
    if (name.includes('ProductCard')) {
      return `
- Product card with image, name, price, rating, stock status
- Add to cart functionality with proper styling`;
    }
    if (name.includes('CartItem')) {
      return `
- Cart item with quantity controls, remove button
- Show product info and subtotal`;
    }
    return `- Create ${name.replace('.tsx','')} component for e-commerce website`;
  },

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add featured products, benefits`;
    }
    if (file.includes('products')) {
      return `
- Product listing with filters, sorting, search
- Grid layout with ProductCard components`;
    }
    if (file.includes('cart')) {
      return `
- Shopping cart with items, quantities, totals
- Checkout button and continue shopping`;
    }
    return `- Create page ${path} for e-commerce`;
  },

  getEnhancedContentAnalysis(finalJson: Record<string, unknown>, ctx: BusinessContext): EnhancedContentAnalysis {
    const projectInfo = finalJson.project as any;
    return {
      businessName: projectInfo?.name || 'Online Store',
      tagline: 'Quality products, great prices, free shipping',
      heroTitle: 'Quality Online Shopping',
      heroSubtitle: 'Quality products, great prices, free shipping nationwide',
      aboutText: 'We are an online store that sells quality products at reasonable prices with fast and secure delivery service',
      tone: 'professional',
      language: 'en',
      contentStyle: 'modern',
      navigationItems: ['Home', 'Products', 'About', 'Contact', 'Cart'],
      industrySpecificContent: {
        productCategories: ['Electronics', 'Fashion', 'Beauty', 'Home & Garden'],
        paymentMethods: ['Bank Transfer', 'Credit Card', 'Digital Wallet', 'Cash on Delivery'],
        shippingOptions: ['Free Shipping', 'Express Delivery', 'Store Pickup']
      },
      colorPreferences: ['emerald', 'blue', 'green'],
      layoutPreferences: ['grid', 'card-based', 'modern'],
      contactInfo: {
        phone: '02-123-4567',
        email: 'contact@shop.com',
        hours: '24 hours'
      }
    };
  },

  getStyleConfiguration(finalJson: Record<string, unknown>, ctx: BusinessContext): StyleConfiguration {
    return {
      colorScheme: {
        primary: '#059669', // emerald-600
        secondary: '#3b82f6', // blue-500
        accent: '#f59e0b', // amber-500
        neutral: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db']
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: 'medium'
      },
      layout: {
        spacing: 'comfortable',
        borderRadius: 'medium',
        shadows: 'medium'
      }
    };
  }
};
