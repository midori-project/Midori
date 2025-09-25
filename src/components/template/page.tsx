'use client';

import React, { useState, useEffect } from 'react';
import TemplateToolsIntegration from './TemplateToolsIntegration';

// ตัวอย่างข้อมูลจาก test.json
const testCafeData = {
  "name": "daytona-react-vite-sample",
  "files": [
    { "path": "package.json", "content": "{\n  \"name\": \"cafe-delight-shop\",\n  \"version\": \"1.0.0\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"vite --host 0.0.0.0 --port 5173\",\n    \"build\": \"vite build\",\n    \"preview\": \"vite preview --host 0.0.0.0 --port 5173\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\",\n    \"react-router-dom\": \"^6.14.0\",\n    \"axios\": \"^1.3.0\"\n  },\n  \"devDependencies\": {\n    \"vite\": \"^4.5.0\",\n    \"@vitejs/plugin-react\": \"^3.1.0\",\n    \"typescript\": \"^5.0.0\",\n    \"tailwindcss\": \"^3.4.0\",\n    \"postcss\": \"^8.4.0\",\n    \"autoprefixer\": \"^10.4.0\"\n  }\n}" },
    { "path": "index.html", "content": "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Café Delight</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>\n" },
    { "path": "tsconfig.json", "content": "{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"useDefineForClassFields\": true,\n    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n    \"jsx\": \"react-jsx\",\n    \"moduleResolution\": \"bundler\",\n    \"resolveJsonModule\": true,\n    \"isolatedModules\": true,\n    \"noEmit\": true,\n    \"esModuleInterop\": true,\n    \"strict\": true\n  },\n  \"include\": [\"src\"]\n}\n" },
    { "path": "vite.config.ts", "content": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n" },
    { "path": "tailwind.config.js", "content": "module.exports = {\n  content: [\"./index.html\", \"./src/**/*.{js,ts,jsx,tsx}\"],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\n" },
    { "path": "src/main.tsx", "content": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { BrowserRouter } from 'react-router-dom';\nimport App from './App';\nimport './index.css';\n\nconst rootElement = document.getElementById('root');\nif (!rootElement) throw new Error('Failed to find the root element');\n\nconst root = ReactDOM.createRoot(rootElement);\nroot.render(\n  <React.StrictMode>\n    <BrowserRouter>\n      <App />\n    </BrowserRouter>\n  </React.StrictMode>\n);" },
    { "path": "src/App.tsx", "content": "import React from 'react';\nimport { Routes, Route } from 'react-router-dom';\nimport Header from './components/Header';\nimport Footer from './components/Footer';\nimport Home from './pages/Home';\nimport Products from './pages/Products';\nimport ProductDetail from './pages/ProductDetail';\nimport Cart from './pages/Cart';\nimport Checkout from './pages/Checkout';\n\nconst App: React.FC = () => {\n  return (\n    <div className=\"min-h-screen flex flex-col bg-gray-50\">\n      <Header brandName=\"Café Delight\" tagline=\"กาแฟสดใหม่ทุกวัน\" />\n      <main className=\"flex-1\">\n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/products\" element={<Products />} />\n          <Route path=\"/products/:slug\" element={<ProductDetail />} />\n          <Route path=\"/cart\" element={<Cart />} />\n          <Route path=\"/checkout\" element={<Checkout />} />\n        </Routes>\n      </main>\n      <Footer columns={[{\"title\":\"เกี่ยวกับเรา\",\"links\":[{\"label\":\"ประวัติ\",\"href\":\"/about\"},{\"label\":\"ทีมงาน\",\"href\":\"/team\"}]},{\"title\":\"บริการ\",\"links\":[{\"label\":\"จัดส่ง\",\"href\":\"/delivery\"},{\"label\":\"ติดต่อ\",\"href\":\"/contact\"}]},{\"title\":\"ข้อมูล\",\"links\":[{\"label\":\"เงื่อนไข\",\"href\":\"/terms\"},{\"label\":\"นโยบาย\",\"href\":\"/privacy\"}]}]} newsletter={{\"enabled\":true}} brandName=\"Café Delight\" />\n    </div>\n  );\n};\n\nexport default App;" }
  ]
};

// ตัวอย่างข้อมูลจาก test-cafe-complete.json
const testCafeCompleteData = {
  "projectStructure": {
    "name": "food-delivery-table-reservation",
    "type": "vite-react-typescript",
    "description": "Food delivery and table reservation app with Vite + React + TypeScript + Tailwind CSS"
  },
  "files": [
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"food-delivery-table-reservation\",\n  \"version\": \"1.0.0\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"vite --host 0.0.0.0 --port 5173\",\n    \"build\": \"vite build\",\n    \"preview\": \"vite preview --host 0.0.0.0 --port 5173\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\",\n    \"react-router-dom\": \"^6.14.0\",\n    \"axios\": \"^1.3.0\"\n  },\n  \"devDependencies\": {\n    \"vite\": \"^4.5.0\",\n    \"@vitejs/plugin-react\": \"^3.1.0\",\n    \"typescript\": \"^5.0.0\",\n    \"tailwindcss\": \"^3.4.0\",\n    \"postcss\": \"^8.4.0\",\n    \"autoprefixer\": \"^10.4.0\",\n    \"eslint\": \"^8.30.0\",\n    \"eslint-plugin-react\": \"^7.32.0\",\n    \"prettier\": \"^2.8.0\"\n  }\n}"
    },
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\nimport { Routes, Route } from 'react-router-dom';\nimport Header from './components/Header';\nimport Footer from './components/Footer';\nimport Home from './pages/Home';\nimport Menu from './pages/Menu';\nimport Reservation from './pages/Reservation';\nimport ChefProfile from './pages/ChefProfile';\nimport DishGallery from './pages/DishGallery';\n\nconst App: React.FC = () => {\n  return (\n    <div className=\"min-h-screen flex flex-col bg-orange-50\">\n      <Header restaurantName=\"Café Delight\" tagline=\"Delicious food, warm atmosphere\" />\n      <main className=\"flex-1\">\n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/menu\" element={<Menu />} />\n          <Route path=\"/reservation\" element={<Reservation availableSlots={['12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']} />} />\n          <Route path=\"/chef-profile\" element={<ChefProfile name=\"Chef Maria\" photo=\"https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200\" biography=\"A passionate chef with 15 years of experience\" specialties={['Italian Cuisine', 'Mediterranean']} philosophy=\"Fresh ingredients make the best dishes\" awards={['Best Chef 2023']} signatureDishes={['Pasta Carbonara', 'Tiramisu']} />} />\n          <Route path=\"/dish-gallery\" element={<DishGallery />} />\n        </Routes>\n      </main>\n      <Footer restaurantName=\"Café Delight\" address=\"123 Main St, City\" phone=\"+1 234 567 890\" socialLinks={[{ platform: 'Facebook', url: '#' }, { platform: 'Instagram', url: '#' }]} />\n    </div>\n  );\n};\n\nexport default App;"
    }
  ]
};

export default function TemplatePage() {
  const [selectedSample, setSelectedSample] = useState<'cafe' | 'complete'>('cafe');

  const getSampleData = () => {
    return selectedSample === 'cafe' ? testCafeData : testCafeCompleteData;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sample Data Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🛠️ Template Tools Demo</h1>
          
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedSample('cafe')}
              className={`px-4 py-2 rounded-lg ${
                selectedSample === 'cafe' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ☕ Cafe Sample (test.json)
            </button>
            
            <button
              onClick={() => setSelectedSample('complete')}
              className={`px-4 py-2 rounded-lg ${
                selectedSample === 'complete' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🍽️ Complete Sample (test-cafe-complete.json)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <TemplateToolsIntegration sampleData={getSampleData()} />
    </div>
  );
}
