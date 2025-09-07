import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

export const fashionHandler: BusinessHandler = {
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
      { path: 'src/pages/Collection.tsx', type: 'page' },
      { path: 'src/pages/ProductDetail.tsx', type: 'page' },
      { path: 'src/pages/StyleGuide.tsx', type: 'page' },
      { path: 'src/components/ProductCard.tsx', type: 'component' },
      { path: 'src/components/SizeGuide.tsx', type: 'component' },
      { path: 'src/pages/About.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
    ];
  },

  templates: {
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'fashion-site'}",
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
  --color-primary: #7c3aed; /* fallback: violet-600 */
  --color-secondary: #ec4899; /* fallback: pink-500 */
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
import Collection from './pages/Collection.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import StyleGuide from './pages/StyleGuide.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/style-guide" element={<StyleGuide />} />
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
  const active = 'bg-violet-600 text-white';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-violet-600">Fashion</Link>
          <div className="flex space-x-2">
            <NavLink to="/" end className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Home</NavLink>
            <NavLink to="/collection" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Collection</NavLink>
            <NavLink to="/style-guide" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Style Guide</NavLink>
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
        <span>© ${new Date().getFullYear()} Fashion Store. All rights reserved.</span>
        <span>Free shipping on orders over $20</span>
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
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Fashion Forward</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">Discover the latest trends and express your unique style with our curated collection.</p>
        <div className="space-x-3">
          <a href="/collection" className="btn-primary px-6 py-3 rounded-lg font-semibold">Shop Now</a>
          <a href="/style-guide" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">Style Guide</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`,

    'src/components/ProductCard.tsx': () => `import React from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, originalPrice, image, category, isNew, isSale }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <div className="w-full h-64 bg-gradient-to-r from-violet-400 to-pink-400" />
        {isNew && <span className="absolute top-2 left-2 badge-accent px-2 py-1 rounded-full text-xs">New</span>}
        {isSale && <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">Sale</span>}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{category}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">{name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">${price.toLocaleString()}</span>
            {originalPrice && <span className="text-sm text-gray-500 line-through">${originalPrice.toLocaleString()}</span>}
          </div>
          <button className="btn-primary px-4 py-2 rounded-lg text-sm transition-colors">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;`,

    'src/components/SizeGuide.tsx': () => `import React from 'react';

const SizeGuide: React.FC = () => {
  const sizes = [
    { size: 'XS', chest: '32-34"', waist: '24-26"', hip: '34-36"' },
    { size: 'S', chest: '34-36"', waist: '26-28"', hip: '36-38"' },
    { size: 'M', chest: '36-38"', waist: '28-30"', hip: '38-40"' },
    { size: 'L', chest: '38-40"', waist: '30-32"', hip: '40-42"' },
    { size: 'XL', chest: '40-42"', waist: '32-34"', hip: '42-44"' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Size Guide</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Size</th>
              <th className="text-left py-2">Chest</th>
              <th className="text-left py-2">Waist</th>
              <th className="text-left py-2">Hip</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2 font-medium">{item.size}</td>
                <td className="py-2">{item.chest}</td>
                <td className="py-2">{item.waist}</td>
                <td className="py-2">{item.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        * Measurements are in inches. For best fit, measure your body and compare with the size chart.
      </p>
    </div>
  );
};

export default SizeGuide;`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Collection Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="w-full h-64 bg-gradient-to-r from-violet-400 to-pink-400"></div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">[Product Name 1]</h3>
                <p className="text-gray-600 mb-4">[Product Description 1]</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-violet-600">$18.90</span>
                  <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">Add to Cart</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="w-full h-64 bg-gradient-to-r from-pink-400 to-rose-400"></div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">[Product Name 2]</h3>
                <p className="text-gray-600 mb-4">[Product Description 2]</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-violet-600">$24.90</span>
                  <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">Add to Cart</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="w-full h-64 bg-gradient-to-r from-purple-400 to-violet-400"></div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">[Product Name 3]</h3>
                <p className="text-gray-600 mb-4">[Product Description 3]</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-violet-600">$32.90</span>
                  <button className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Style Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 1]</h3>
              <p className="text-sm text-gray-600">[Item Count 1]</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 2]</h3>
              <p className="text-sm text-gray-600">[Item Count 2]</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 3]</h3>
              <p className="text-sm text-gray-600">[Item Count 3]</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 4]</h3>
              <p className="text-sm text-gray-600">[Item Count 4]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`,

    'src/pages/Collection.tsx': (project) => `import React from 'react';
import ProductCard from '../components/ProductCard.tsx';

// AI NOTE: Products will be filled from promptJson (finalJson.products.items)
// Expected structure: finalJson.products = { items: [{ name, price, originalPrice?, image, category, isNew?, isSale? }] }

type ProductItem = { name: string; price: number; originalPrice?: number; image: string; category: string; isNew?: boolean; isSale?: boolean };

// fallback in case no data from AI
const fallbackProducts: ProductItem[] = [
  { name: 'Elegant Dress', price: 1890, originalPrice: 2290, image: '/placeholder.jpg', category: 'Dresses', isSale: true },
  { name: 'Casual T-Shirt', price: 590, image: '/placeholder.jpg', category: 'Tops', isNew: true },
  { name: 'Designer Jeans', price: 2490, image: '/placeholder.jpg', category: 'Bottoms' },
];

// Read data from window.__MIDORI_FINAL_JSON__ that preview will inject
function getProducts(): ProductItem[] {
  const w = globalThis as any;
  const data = w?.__MIDORI_FINAL_JSON__;
  const items = data?.products?.items;
  if (Array.isArray(items) && items.length > 0) return items as ProductItem[];
  return fallbackProducts;
}

const Collection: React.FC = () => {
  const products = getProducts();
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Collection</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, i) => (
            <ProductCard key={i} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;`,

    'src/pages/ProductDetail.tsx': () => `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SizeGuide from '../components/SizeGuide.tsx';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="w-full h-96 bg-gradient-to-r from-violet-400 to-pink-400 rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-20 bg-gradient-to-r from-violet-300 to-pink-300 rounded"></div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Name</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-violet-600">$18.90</span>
              <span className="text-xl text-gray-500 line-through">$22.90</span>
              <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">Sale</span>
            </div>
            <p className="text-gray-600 mb-6">
              This is a beautiful product description that highlights the key features and benefits of the item.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="flex space-x-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={\`px-4 py-2 border rounded \${selectedSize === size ? 'border-violet-600 bg-violet-50 text-violet-600' : 'border-gray-300'}\`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border rounded"
                >
                  -
                </button>
                <span className="text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full btn-primary py-3 rounded-lg font-semibold">
                Add to Cart
              </button>
              <button className="w-full border border-violet-600 text-violet-600 py-3 rounded-lg font-semibold hover:bg-violet-50">
                Add to Wishlist
              </button>
            </div>

            <SizeGuide />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;`,

    'src/pages/StyleGuide.tsx': () => `import React from 'react';

const StyleGuide: React.FC = () => {
  const styleTips = [
    {
      title: 'Color Coordination',
      description: 'Learn how to mix and match colors for a cohesive look',
      image: 'gradient-to-r from-violet-400 to-pink-400'
    },
    {
      title: 'Layering Techniques',
      description: 'Master the art of layering for different seasons',
      image: 'gradient-to-r from-pink-400 to-rose-400'
    },
    {
      title: 'Accessory Styling',
      description: 'Complete your outfit with the right accessories',
      image: 'gradient-to-r from-purple-400 to-violet-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Style Guide</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {styleTips.map((tip, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className={\`w-full h-48 bg-\${tip.image}\`}></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fashion Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dress for Your Body Type</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Choose clothes that flatter your silhouette</li>
                <li>• Highlight your best features</li>
                <li>• Use accessories to create balance</li>
                <li>• Don't be afraid to experiment</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Styling</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Layer appropriately for the weather</li>
                <li>• Choose fabrics that suit the season</li>
                <li>• Adapt colors to seasonal trends</li>
                <li>• Invest in versatile pieces</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleGuide;`,

    'src/pages/About.tsx': () => `import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Our Brand</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Founded with a passion for fashion and a commitment to quality, our brand has been creating 
              beautiful, sustainable clothing that empowers individuals to express their unique style.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Values</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Sustainability</h4>
                <p className="text-gray-600">Committed to ethical and eco-friendly practices</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Quality</h4>
                <p className="text-gray-600">Premium materials and craftsmanship in every piece</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Brand Statistics</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-violet-600">5+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-pink-600">500+</div>
                <div className="text-gray-600">Products</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-600">10K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-amber-600">50+</div>
                <div className="text-gray-600">Countries</div>
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

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Contact Us</h1>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <p>📍 123 Fashion Street, Bangkok 10110</p>
          <p>📞 02-123-4567</p>
          <p>🕒 Open 10AM - 8PM Daily</p>
          <p>✉️ info@fashion.local</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;`,

    'src/types/index.ts': () => `export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  description: string;
  sizes: string[];
  colors: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  image: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
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

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function getSizeGuide(size: string): { chest: string; waist: string; hip: string } {
  const sizeGuide: Record<string, { chest: string; waist: string; hip: string }> = {
    'XS': { chest: '32-34"', waist: '24-26"', hip: '34-36"' },
    'S': { chest: '34-36"', waist: '26-28"', hip: '36-38"' },
    'M': { chest: '36-38"', waist: '28-30"', hip: '38-40"' },
    'L': { chest: '38-40"', waist: '30-32"', hip: '40-42"' },
    'XL': { chest: '40-42"', waist: '32-34"', hip: '42-44"' }
  };
  return sizeGuide[size] || { chest: 'N/A', waist: 'N/A', hip: 'N/A' };
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-yellow-600';
    case 'processing': return 'text-blue-600';
    case 'shipped': return 'text-purple-600';
    case 'delivered': return 'text-green-600';
    default: return 'text-gray-600';
  }
}

export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}`,
  },

  getComponentRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const name = path.split('/').pop() || '';
    if (name.includes('Navbar')) {
      return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Add links: Home, Collection, StyleGuide, About, Contact`;
    }
    if (name.includes('ProductCard')) {
      return `
- Product card with image, name, price, CTA`;
    }
    if (name.includes('SizeGuide')) {
      return `
- Size guide with measurements`;
    }
    return `- Create ${name.replace('.tsx','')} component for fashion website`;
  },

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add featured collection`;
    }
    if (file.includes('collection')) {
      return `
- Collection page with filters and cards`;
    }
    return `- Create page ${path} for fashion`;
  },
};
