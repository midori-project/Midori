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

  templates: {
    'package.json': (project) => `{
  "name": "${project.name || 'restaurant-site'}",
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

    'index.html': (project) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name || 'Restaurant'}</title>
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
  --color-primary: #dc2626; /* fallback: red-600 */
  --color-secondary: #f97316; /* fallback: orange-500 */
  --color-accent: #0ea5e9; /* fallback: sky-500 */
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
import Menu from './pages/Menu.tsx';
import Reservation from './pages/Reservation.tsx';
import ChefProfile from './pages/ChefProfile.tsx';
import DishGallery from './pages/DishGallery.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/chef" element={<ChefProfile />} />
          <Route path="/gallery" element={<DishGallery />} />
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
  const active = 'bg-red-600 text-white';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-red-600">Restaurant</Link>
          <div className="flex space-x-2">
            <NavLink to="/" end className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Home</NavLink>
            <NavLink to="/menu" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Menu</NavLink>
            <NavLink to="/reservation" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Reservation</NavLink>
            <NavLink to="/chef" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Chef</NavLink>
            <NavLink to="/gallery" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Gallery</NavLink>
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
        <span>© {new Date().getFullYear()} Restaurant. All rights reserved.</span>
        <span>Open 24 hours • Call 02-123-4567</span>
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
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Fine Dining Experience</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">Discover exquisite flavors and unforgettable moments crafted by our master chefs.</p>
        <div className="space-x-3">
          <a href="/menu" className="btn-primary px-6 py-3 rounded-lg font-semibold">Explore Menu</a>
          <a href="/reservation" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">Reserve Now</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`,

    'src/components/MenuCard.tsx': () => `import React from 'react';

interface MenuCardProps {
  title: string;
  description?: string;
  price: number;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, description, price }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="w-full h-40 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">฿{price.toLocaleString()}</span>
        <button className="btn-primary px-4 py-2 rounded-lg transition-colors">Order</button>
      </div>
    </div>
  );
};

export default MenuCard;`,

    'src/components/ReservationForm.tsx': () => `import React, { useState } from 'react';

const ReservationForm: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Reservation submitted');
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input className="mt-1 w-full border rounded-md px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input className="mt-1 w-full border rounded-md px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" className="mt-1 w-full border rounded-md px-3 py-2" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <input type="time" className="mt-1 w-full border rounded-md px-3 py-2" value={time} onChange={e => setTime(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Guests</label>
        <input type="number" min="1" className="mt-1 w-full border rounded-md px-3 py-2" value={guests} onChange={e => setGuests(parseInt(e.target.value) || 1)} required />
      </div>
      <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Reserve</button>
    </form>
  );
};

export default ReservationForm;`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Menu Item 1]</h3>
              <p className="text-gray-600 mb-4">[Menu Description 1]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">฿1,890</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Order Now</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Menu Item 2]</h3>
              <p className="text-gray-600 mb-4">[Menu Description 2]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">฿890</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Order Now</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Menu Item 3]</h3>
              <p className="text-gray-600 mb-4">[Menu Description 3]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">฿290</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Order Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Feature 1]</h3>
              <p className="text-gray-600">[Feature Description 1]</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Feature 2]</h3>
              <p className="text-gray-600">[Feature Description 2]</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Feature 3]</h3>
              <p className="text-gray-600">[Feature Description 3]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`,

    'src/pages/Menu.tsx': (project) => `import React from 'react';
import MenuCard from '../components/MenuCard.tsx';

// AI NOTE: เมนูจะถูกเติมจาก promptJson (finalJson.menu.items)
// โครงสร้างที่คาดหวัง: finalJson.menu = { items: [{ title, description?, price }] }

type MenuItem = { title: string; description?: string; price: number };

// fallback เผื่อไม่มีข้อมูลจาก AI
const fallbackMenu: MenuItem[] = [
  { title: 'Signature Steak', price: 1890 },
  { title: 'Truffle Pasta', price: 890 },
  { title: 'Seafood Platter', price: 2990 },
];

// อ่านข้อมูลจาก window.__MIDORI_FINAL_JSON__ ที่ฝั่ง preview จะ inject ให้
function getMenuItems(): MenuItem[] {
  const w = globalThis as any;
  const data = w?.__MIDORI_FINAL_JSON__;
  const items = data?.menu?.items;
  if (Array.isArray(items) && items.length > 0) return items as MenuItem[];
  return fallbackMenu;
}

const Menu: React.FC = () => {
  const items = getMenuItems();
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((it, i) => (
            <MenuCard key={i} title={it.title} description={it.description} price={it.price} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;`,

    'src/pages/Reservation.tsx': () => `import React from 'react';
import ReservationForm from '../components/ReservationForm.tsx';

const Reservation: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Make a Reservation</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <ReservationForm />
        </div>
      </div>
    </div>
  );
};

export default Reservation;`,

    'src/pages/ChefProfile.tsx': () => `import React from 'react';

const ChefProfile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Meet Our Chef</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="w-full h-80 bg-red-100 rounded-xl" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Chef Somchai</h2>
            <p className="text-gray-700 leading-relaxed">With over 15 years of culinary experience and a passion for creating unforgettable flavors, Chef Somchai leads our kitchen with creativity and precision.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;`,

    'src/pages/DishGallery.tsx': () => `import React from 'react';

const DishGallery: React.FC = () => {
  const items = new Array(9).fill(0);
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Dish Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((_, i) => (
            <div key={i} className="aspect-square bg-gradient-to-br from-red-400 to-orange-400 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DishGallery;`,

    'src/pages/About.tsx': (project) => `import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Our Restaurant</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Restaurant History</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">Our restaurant has been serving customers for over 10 years with a commitment to providing high-quality food and friendly service to all our customers.</p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Head Chef</h3>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Chef Somchai</h4>
                  <p className="text-gray-600">Head Chef</p>
                </div>
              </div>
              <p className="text-gray-600">With over 15 years of culinary experience, graduated from a leading culinary institute.</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Features</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-center"><svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-gray-700">Fresh ingredients daily</span></div>
              <div className="flex items-center"><svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-gray-700">Over 100 diverse menu items</span></div>
              <div className="flex items-center"><svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-gray-700">24-hour service</span></div>
              <div className="flex items-center"><svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-gray-700">Convenient parking</span></div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-2 text-gray-600">
                <p>📍 123 Sukhumvit Road, Bangkok 10110</p>
                <p>📞 02-123-4567</p>
                <p>🕒 Open 24 hours</p>
              </div>
              <Link to="/contact" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium inline-block mt-4">Make Reservation</Link>
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
          <p>📍 123 Sukhumvit Road, Bangkok 10110</p>
          <p>📞 02-123-4567</p>
          <p>🕒 Open 24 hours</p>
          <p>✉️ contact@restaurant.local</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;`,
  },

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

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
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
    if (file.includes('chef')) {
      return `
- Create chef profile page with photo and bio`;
    }
    if (file.includes('gallery')) {
      return `
- Create image gallery grid of dishes`;
    }
    return `- Create page ${path} for restaurant`;
  },
};


