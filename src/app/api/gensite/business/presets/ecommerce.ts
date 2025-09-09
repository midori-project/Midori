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

    'src/components/HeroSection.tsx': (project, finalJson, ctx) => {
      const template = `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white bg-hero-gradient">
      <img src="[HERO_IMAGE_URL]" alt="[HERO_IMAGE_ALT]" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">[HERO_TITLE]</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">[HERO_SUBTITLE]</p>
        <div className="space-x-3">
          <a href="/products" className="btn-primary px-6 py-3 rounded-lg font-semibold">[MENU_BUTTON_TEXT]</a>
          <a href="/about" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">[ABOUT_BUTTON_TEXT]</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/components/ProductCard.tsx': (project, finalJson, ctx) => {
      const template = `import React from 'react';
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
        <div className="w-full h-48 rounded-lg mb-4 relative overflow-hidden">
          <img src="[PRODUCT_IMAGE_URL]" alt="[PRODUCT_IMAGE_ALT]" className="w-full h-full object-cover" />
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

export default ProductCard;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

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

    'src/pages/Products.tsx': (project, finalJson, ctx) => {
      const template = `import React, { useState } from 'react';
import ProductCard from '../components/ProductCard.tsx';

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock products data
  const products = [
    { id: '1', name: 'Latest Smartphone', price: 15900, originalPrice: 18900, image: '', rating: 5, category: 'electronics' },
    { id: '2', name: 'Premium Wireless Headphones', price: 3500, originalPrice: 4500, image: '', rating: 4, category: 'electronics' },
    { id: '3', name: 'Work Laptop', price: 25900, originalPrice: 29900, image: '', rating: 5, category: 'electronics' },
    { id: '4', name: 'Designer T-Shirt', price: 890, originalPrice: 1200, image: '', rating: 4, category: 'fashion' },
    { id: '5', name: 'Skincare Set', price: 1500, originalPrice: 2000, image: '', rating: 5, category: 'beauty' },
    { id: '6', name: 'Garden Tools', price: 2500, originalPrice: 3000, image: '', rating: 4, category: 'home' }
  ];

  const categories = ['all', 'electronics', 'fashion', 'beauty', 'home'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              {/* Category Filter */}
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                  <option value="home">Home & Garden</option>
                </select>
              </div>
              
              {/* Sort */}
              <div className="md:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <p className="text-gray-600 mb-4">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>
        
        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/pages/ProductDetail.tsx': (project, finalJson, ctx) => {
      const template = `import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data
  const product = {
    id: id || '1',
    name: 'Latest Smartphone',
    price: 15900,
    originalPrice: 18900,
    rating: 5,
    reviews: 128,
    inStock: true,
    description: 'High-quality smartphone with advanced features and excellent performance.',
    features: [
      '6.1-inch Super Retina XDR display',
      'A15 Bionic chip with 6-core CPU',
      '12MP dual-camera system',
      'Face ID for secure authentication',
      'Up to 19 hours of video playback'
    ],
    images: [
      'https://via.placeholder.com/400x400?text=Product+Image+1',
      'https://via.placeholder.com/400x400?text=Product+Image+2',
      'https://via.placeholder.com/400x400?text=Product+Image+3'
    ]
  };

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', { productId: product.id, quantity });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="text-gray-500 hover:text-emerald-600">Home</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link to="/products" className="text-gray-500 hover:text-emerald-600">Products</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 font-medium">{product.name}</span></li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={\`aspect-square bg-white rounded-lg overflow-hidden border-2 \${
                    selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                  }\`}
                >
                  <img src={image} alt={\`\${product.name} \${index + 1}\`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={\`w-5 h-5 \${i < product.rating ? 'fill-current' : 'text-gray-300'}\`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-emerald-600">฿{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">฿{product.originalPrice.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">{product.description}</p>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Features:</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Add to Cart
                </button>
                <button className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/pages/Cart.tsx': (project, finalJson, ctx) => {
      const template = `import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', name: 'Latest Smartphone', price: 15900, originalPrice: 18900, image: '', quantity: 1 },
    { id: '2', name: 'Premium Wireless Headphones', price: 3500, originalPrice: 4500, image: '', quantity: 2 },
    { id: '3', name: 'Designer T-Shirt', price: 890, image: '', quantity: 3 }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started!</p>
            <Link 
              to="/products" 
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                    <img src={item.image || 'https://via.placeholder.com/80x80?text=Product'} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-lg font-bold text-emerald-600">฿{item.price.toLocaleString()}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">฿{item.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'Free' : \`฿\${shipping.toLocaleString()}\`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-emerald-600">฿{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link 
                  to="/checkout"
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>
                <Link 
                  to="/products"
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/pages/Checkout.tsx': (project, finalJson, ctx) => {
      const template = `import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Checkout: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [orderItems] = useState([
    { id: '1', name: 'Latest Smartphone', price: 15900, quantity: 1 },
    { id: '2', name: 'Premium Wireless Headphones', price: 3500, quantity: 2 }
  ]);

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle order submission
    console.log('Order submitted:', { formData, orderItems, total });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="credit-card">Credit Card</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="digital-wallet">Digital Wallet</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
                
                {formData.paymentMethod === 'credit-card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-emerald-600">฿{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Place Order
              </button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing this order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/pages/About.tsx': (project, finalJson, ctx) => {
      const template = `import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Us</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              We are passionate about providing quality products and exceptional service to our customers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2020, we started as a small team with a big dream: to make quality products 
                accessible to everyone. What began as a passion project has grown into a trusted 
                e-commerce platform serving customers across the globe.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that shopping should be simple, secure, and enjoyable. That's why we've 
                built our platform with cutting-edge technology and a customer-first approach, 
                ensuring every interaction is smooth and satisfying.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">50K+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">1000+</div>
                  <div className="text-gray-600">Products</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="https://via.placeholder.com/500x500?text=Our+Team" 
                  alt="Our Team" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and help us deliver exceptional experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality First</h3>
              <p className="text-gray-600">
                We carefully curate every product to ensure it meets our high standards for quality and value.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Care</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. We're here to help with any questions or concerns.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously improve our platform and services to provide the best shopping experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate people behind our success, dedicated to bringing you the best products and service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/128x128?text=CEO" 
                  alt="CEO" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Sarah Johnson</h3>
              <p className="text-emerald-600 font-medium mb-2">CEO & Founder</p>
              <p className="text-gray-600 text-sm">
                Passionate about creating exceptional customer experiences and building innovative solutions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/128x128?text=CTO" 
                  alt="CTO" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Michael Chen</h3>
              <p className="text-emerald-600 font-medium mb-2">Chief Technology Officer</p>
              <p className="text-gray-600 text-sm">
                Leading our technical innovation and ensuring our platform delivers seamless experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/128x128?text=CMO" 
                  alt="CMO" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Emily Rodriguez</h3>
              <p className="text-emerald-600 font-medium mb-2">Chief Marketing Officer</p>
              <p className="text-gray-600 text-sm">
                Building our brand and connecting with customers through meaningful marketing strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Shop?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Discover our amazing collection of products and experience the difference quality makes.
          </p>
          <a 
            href="/products" 
            className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Browse Products
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/pages/Contact.tsx': (project, finalJson, ctx) => {
      const template = `import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="order">Order Question</option>
                    <option value="return">Returns & Exchanges</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">+66 2-123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM (GMT+7)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">support@example.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600">
                        123 Business District<br />
                        Bangkok, Thailand 10110
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does shipping take?</h3>
                    <p className="text-gray-600">We offer free shipping nationwide with delivery within 2-5 business days.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What is your return policy?</h3>
                    <p className="text-gray-600">We offer a 30-day return policy for unused items in original packaging.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer customer support?</h3>
                    <p className="text-gray-600">Yes! Our customer support team is available Monday-Friday, 9AM-6PM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/components/CartItem.tsx': (project, finalJson, ctx) => {
      const template = `import React from 'react';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  quantity,
  onUpdateQuantity,
  onRemove
}) => {
  const subtotal = price * quantity;
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(id);
    } else {
      onUpdateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          <img 
            src={image || 'https://via.placeholder.com/80x80?text=Product'} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-lg font-bold text-emerald-600">฿{price.toLocaleString()}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">฿{originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                -{discount}%
              </span>
            )}
          </div>
        </div>
        
        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button 
              onClick={() => handleQuantityChange(quantity - 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center font-medium">
              {quantity}
            </span>
            <button 
              onClick={() => handleQuantityChange(quantity + 1)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors"
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {/* Subtotal */}
          <div className="text-right min-w-[6rem]">
            <div className="text-lg font-bold text-gray-900">
              ฿{subtotal.toLocaleString()}
            </div>
            {quantity > 1 && (
              <div className="text-sm text-gray-500">
                ฿{price.toLocaleString()} each
              </div>
            )}
          </div>
          
          {/* Remove Button */}
          <button 
            onClick={() => onRemove(id)}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove item from cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/components/CheckoutForm.tsx': (project, finalJson, ctx) => {
      const template = `import React, { useState } from 'react';

interface CheckoutFormProps {
  onSubmit: (formData: CheckoutFormData) => void;
  isLoading?: boolean;
}

interface CheckoutFormData {
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  payment: {
    method: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: ''
    },
    payment: {
      method: 'credit-card',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (section: 'shipping' | 'payment', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[\`\${section}.\${field}\`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[\`\${section}.\${field}\`];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate shipping information
    if (!formData.shipping.firstName.trim()) {
      newErrors['shipping.firstName'] = 'First name is required';
    }
    if (!formData.shipping.lastName.trim()) {
      newErrors['shipping.lastName'] = 'Last name is required';
    }
    if (!formData.shipping.email.trim()) {
      newErrors['shipping.email'] = 'Email is required';
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.shipping.email)) {
      newErrors['shipping.email'] = 'Please enter a valid email address';
    }
    if (!formData.shipping.phone.trim()) {
      newErrors['shipping.phone'] = 'Phone number is required';
    }
    if (!formData.shipping.address.trim()) {
      newErrors['shipping.address'] = 'Address is required';
    }
    if (!formData.shipping.city.trim()) {
      newErrors['shipping.city'] = 'City is required';
    }
    if (!formData.shipping.postalCode.trim()) {
      newErrors['shipping.postalCode'] = 'Postal code is required';
    }

    // Validate payment information
    if (formData.payment.method === 'credit-card') {
      if (!formData.payment.cardNumber?.trim()) {
        newErrors['payment.cardNumber'] = 'Card number is required';
      } else if (!/^[0-9\\s]{13,19}$/.test(formData.payment.cardNumber.replace(/\\s/g, ''))) {
        newErrors['payment.cardNumber'] = 'Please enter a valid card number';
      }
      if (!formData.payment.expiryDate?.trim()) {
        newErrors['payment.expiryDate'] = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\\/([0-9]{2})$/.test(formData.payment.expiryDate)) {
        newErrors['payment.expiryDate'] = 'Please enter a valid expiry date (MM/YY)';
      }
      if (!formData.payment.cvv?.trim()) {
        newErrors['payment.cvv'] = 'CVV is required';
      } else if (!/^[0-9]{3,4}$/.test(formData.payment.cvv)) {
        newErrors['payment.cvv'] = 'Please enter a valid CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shipping Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={formData.shipping.firstName}
              onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
              className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                errors['shipping.firstName'] ? 'border-red-300' : 'border-gray-300'
              }\`}
              placeholder="Enter your first name"
            />
            {errors['shipping.firstName'] && (
              <p className="text-red-500 text-sm mt-1">{errors['shipping.firstName']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={formData.shipping.lastName}
              onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
              className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                errors['shipping.lastName'] ? 'border-red-300' : 'border-gray-300'
              }\`}
              placeholder="Enter your last name"
            />
            {errors['shipping.lastName'] && (
              <p className="text-red-500 text-sm mt-1">{errors['shipping.lastName']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.shipping.email}
              onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
              className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                errors['shipping.email'] ? 'border-red-300' : 'border-gray-300'
              }\`}
              placeholder="your.email@example.com"
            />
            {errors['shipping.email'] && (
              <p className="text-red-500 text-sm mt-1">{errors['shipping.email']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.shipping.phone}
              onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
              className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                errors['shipping.phone'] ? 'border-red-300' : 'border-gray-300'
              }\`}
              placeholder="+66 2-123-4567"
            />
            {errors['shipping.phone'] && (
              <p className="text-red-500 text-sm mt-1">{errors['shipping.phone']}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={formData.shipping.address}
              onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
              className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                errors['shipping.address'] ? 'border-red-300' : 'border-gray-300'
              }\`}
              placeholder="Enter your full address"
            />
            {errors['shipping.address'] && (
              <p className="text-red-500 text-sm mt-1">{errors['shipping.address']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={formData.shipping.city}
              onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
              className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                errors['shipping.city'] ? 'border-red-300' : 'border-gray-300'
              }\`}
              placeholder="Enter your city"
            />
            {errors['shipping.city'] && (
              <p className="text-red-500 text-sm mt-1">{errors['shipping.city']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
            <input
              type="text"
              value={formData.shipping.postalCode}
              onChange={(e) => handleInputChange('shipping', 'postalCode', e.target.value)}
              className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                errors['shipping.postalCode'] ? 'border-red-300' : 'border-gray-300'
              }\`}
              placeholder="10110"
            />
            {errors['shipping.postalCode'] && (
              <p className="text-red-500 text-sm mt-1">{errors['shipping.postalCode']}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
            <select
              value={formData.payment.method}
              onChange={(e) => handleInputChange('payment', 'method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="credit-card">Credit Card</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="digital-wallet">Digital Wallet</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
          
          {formData.payment.method === 'credit-card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                <input
                  type="text"
                  value={formData.payment.cardNumber}
                  onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                  className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                    errors['payment.cardNumber'] ? 'border-red-300' : 'border-gray-300'
                  }\`}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
                {errors['payment.cardNumber'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['payment.cardNumber']}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="text"
                    value={formData.payment.expiryDate}
                    onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                    className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                      errors['payment.expiryDate'] ? 'border-red-300' : 'border-gray-300'
                    }\`}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors['payment.expiryDate'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['payment.expiryDate']}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                  <input
                    type="text"
                    value={formData.payment.cvv}
                    onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                    className={\`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 \${
                      errors['payment.cvv'] ? 'border-red-300' : 'border-gray-300'
                    }\`}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors['payment.cvv'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['payment.cvv']}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={\`px-8 py-3 rounded-lg font-semibold transition-colors \${
            isLoading 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }\`}
        >
          {isLoading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },
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
