/**
 * Project Templates for Frontend-V2 Agent
 * Templates for complete project structures (Vite, React, TypeScript, etc.)
 */

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  framework: string;
  buildTool: string;
  styling: string;
  features: string[];
  files: Record<string, ProjectFileTemplate>;
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };
  scripts: Record<string, string>;
  configuration: Record<string, any>;
}

export interface ProjectFileTemplate {
  path: string;
  content: string;
  type: 'config' | 'component' | 'style' | 'page' | 'html' | 'typescript' | 'javascript';
  language: string;
  required: boolean;
  description: string;
}

// Project Template Definitions
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'vite-react-typescript',
    name: 'Vite + React + TypeScript',
    description: 'Modern React app with Vite, TypeScript, and Tailwind CSS',
    type: 'vite-react-typescript',
    framework: 'react',
    buildTool: 'vite',
    styling: 'tailwindcss',
    features: ['typescript', 'tailwindcss', 'eslint', 'prettier', 'react-router'],
    files: {
      'package.json': {
        path: 'package.json',
        content: `{
  "name": "{projectName}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 5173",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "axios": "^1.3.0"
  },
  "devDependencies": {
    "vite": "^4.5.0",
    "@vitejs/plugin-react": "^3.1.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.30.0",
    "eslint-plugin-react": "^7.32.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "prettier": "^2.8.0"
  },
  "eslintConfig": {
    "extends": [
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended"
    ],
    "rules": {
      "react/react-in-jsx-scope": "off"
    }
  },
  "prettier": {
    "singleQuote": true,
    "trailingComma": "all"
  },
  "browserslist": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ]
}`,
        type: 'config',
        language: 'json',
        required: true,
        description: 'Package configuration with dependencies and scripts'
      },
      'index.html': {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{projectTitle}</title>
    <link rel="stylesheet" href="/src/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    
    <!-- 🎨 Visual Edit Mode Script (Embedded) -->
    <script>
      (function() {
        let editModeEnabled = false;
        let selectedElement = null;

        console.log('🎨 Visual Edit script loaded (embedded)');

        // Listen for commands from parent window
        window.addEventListener('message', (event) => {
          if (event.data.type === 'TOGGLE_EDIT_MODE') {
            editModeEnabled = event.data.enabled;
            document.body.classList.toggle('midori-edit-mode', editModeEnabled);
            
            // 🔑 FREEZE หน้าเว็บเมื่อเข้า edit mode
            if (editModeEnabled) {
              document.body.style.pointerEvents = 'none';
              document.querySelectorAll('[data-editable]').forEach(el => {
                el.style.pointerEvents = 'auto';
              });
              console.log('🔒 Page frozen - only editable elements clickable');
            } else {
              document.body.style.pointerEvents = '';
              document.querySelectorAll('[data-editable]').forEach(el => {
                el.style.pointerEvents = '';
              });
              console.log('🔓 Page unfrozen');
            }
            
            console.log('🎨 Edit mode:', editModeEnabled ? 'ON' : 'OFF');
            
            if (!editModeEnabled && selectedElement) {
              selectedElement.classList.remove('midori-selected');
              selectedElement = null;
            }
          }
        });

        // Hover effect - ใช้ capture phase
        document.addEventListener('mouseover', (e) => {
          if (!editModeEnabled) return;
          const editable = e.target.closest('[data-editable]');
          if (editable && editable !== selectedElement) {
            editable.classList.add('midori-hover');
          }
        }, true);

        document.addEventListener('mouseout', (e) => {
          if (!editModeEnabled) return;
          const editable = e.target.closest('[data-editable]');
          if (editable) {
            editable.classList.remove('midori-hover');
          }
        }, true);

        // Click to select - ใช้ capture phase
        document.addEventListener('click', (e) => {
          if (!editModeEnabled) return;
          
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const editable = e.target.closest('[data-editable]');
          if (!editable) {
            console.log('⚠️ Clicked outside editable area');
            return;
          }

          console.log('🎯 Element clicked:', editable.dataset);

          if (selectedElement) {
            selectedElement.classList.remove('midori-selected');
          }

          editable.classList.add('midori-selected');
          selectedElement = editable;

          const data = {
            blockId: editable.dataset.blockId,
            field: editable.dataset.field,
            type: editable.dataset.type,
            itemIndex: editable.dataset.itemIndex,
            currentValue: (editable.dataset.type === 'image' 
              ? (editable.querySelector('img') || editable).src 
              : editable.textContent?.trim()) || '',
            rect: editable.getBoundingClientRect()
          };

          console.log('📤 Sending to parent:', data);

          window.parent.postMessage({
            type: 'ELEMENT_SELECTED',
            data
          }, '*');
        }, true);

        // Inject CSS
        const style = document.createElement('style');
        style.textContent = \`
          .midori-edit-mode { cursor: default !important; }
          .midori-edit-mode * { pointer-events: none !important; }
          .midori-edit-mode [data-editable] { pointer-events: auto !important; transition: all 0.2s ease; cursor: pointer !important; position: relative; }
          .midori-edit-mode [data-editable] * { pointer-events: auto !important; }
          .midori-edit-mode [data-editable]:hover { outline: 2px dashed #3b82f6 !important; outline-offset: 2px; background: rgba(59, 130, 246, 0.05) !important; z-index: 9999 !important; }
          [data-editable].midori-selected { outline: 2px solid #3b82f6 !important; outline-offset: 2px; background: rgba(59, 130, 246, 0.1) !important; z-index: 10000 !important; }
          .midori-edit-mode [data-editable]:hover::after { content: attr(data-field); position: absolute; top: -28px; left: 0; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: -apple-system, sans-serif; white-space: nowrap; z-index: 10001; pointer-events: none !important; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
          .midori-edit-mode [data-editable]:hover::before { content: ''; position: absolute; top: -8px; left: 10px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #3b82f6; z-index: 10001; pointer-events: none !important; }
          .midori-edit-mode [data-type="heading"]:hover { outline-color: #10b981 !important; background: rgba(16, 185, 129, 0.05) !important; }
          .midori-edit-mode [data-type="heading"].midori-selected { outline-color: #10b981 !important; background: rgba(16, 185, 129, 0.1) !important; }
          .midori-edit-mode [data-type="image"]:hover { outline-color: #f59e0b !important; background: rgba(245, 158, 11, 0.05) !important; }
          .midori-edit-mode [data-type="image"].midori-selected { outline-color: #f59e0b !important; background: rgba(245, 158, 11, 0.1) !important; }
        \`;
        document.head.appendChild(style);

        console.log('✅ Visual Edit script initialized (embedded)');
      })();
    </script>
  </body>
</html>`,
        type: 'html',
        language: 'html',
        required: true,
        description: 'HTML entry point with embedded visual edit script'
      },
      'vite.config.ts': {
        path: 'vite.config.ts',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});`,
        type: 'config',
        language: 'typescript',
        required: true,
        description: 'Vite configuration'
      },
      'tsconfig.json': {
        path: 'tsconfig.json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src", "index.html", "vite.config.ts", "*.json"]
}`,
        type: 'config',
        language: 'json',
        required: true,
        description: 'TypeScript configuration'
      },
      'postcss.config.cjs': {
        path: 'postcss.config.cjs',
        content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
        type: 'config',
        language: 'javascript',
        required: true,
        description: 'PostCSS configuration for Tailwind CSS'
      },
      'tailwind.config.js': {
        path: 'tailwind.config.js',
        content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '{primaryColor}',
        secondary: '{secondaryColor}',
        accent: '{accentColor}',
        background: '{backgroundColor}',
        text: {
          light: '#FFFFFF',
          dark: '#333333',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};`,
        type: 'config',
        language: 'javascript',
        required: true,
        description: 'Tailwind CSS configuration'
      },
      'src/main.tsx': {
        path: 'src/main.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`,
        type: 'typescript',
        language: 'typescript',
        required: true,
        description: 'React application entry point'
      },
      'src/App.tsx': {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './components/Menu';
import About from './components/About';
import Contact from './components/Contact';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-{bgTone}-50">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;`,
        type: 'component',
        language: 'typescript',
        required: true,
        description: 'Main App component with routing'
      },
      'src/pages/Home.tsx': {
        path: 'src/pages/Home.tsx',
        content: `import React from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Menu from '@/components/Menu';
import Contact from '@/components/Contact';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Menu />
      <Contact />
    </div>
  );
};

export default Home;`,
        type: 'page',
        language: 'typescript',
        required: true,
        description: 'Basic Home page scaffold'
      },
      'src/index.css': {
        path: 'src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 16px;
    line-height: 1.5;
    color: #3a3a3a;
    background-color: #fffaf0;
  }
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 600;
  }
  p {
    margin: 0;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg text-white bg-{primaryColor}-600 hover:bg-{primaryColor}-500 transition duration-300 ease-in-out;
  }
  .card {
    @apply bg-white shadow-md rounded-lg p-6 mb-4;
  }
  .header {
    @apply bg-{primaryColor}-600 text-white p-4;
  }
  .footer {
    @apply bg-gray-200 text-gray-700 p-4 text-center;
  }
}

@layer utilities {
  .text-warm-{primaryColor} {
    color: {primaryColorHex};
  }
  .bg-warm-{primaryColor} {
    background-color: {primaryColorHex};
  }
  @screen sm {
    .container {
      @apply max-w-sm mx-auto;
    }
  }
  @screen md {
    .container {
      @apply max-w-md mx-auto;
    }
  }
  @screen lg {
    .container {
      @apply max-w-lg mx-auto;
    }
  }
  @screen xl {
    .container {
      @apply max-w-xl mx-auto;
    }
  }
}`,
        type: 'style',
        language: 'css',
        required: true,
        description: 'Global CSS with Tailwind imports and custom styles'
      }
    },
    dependencies: {
      production: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.14.0',
        'axios': '^1.3.0'
      },
      development: {
        'vite': '^4.5.0',
        '@vitejs/plugin-react': '^3.1.0',
        'typescript': '^5.0.0',
        'tailwindcss': '^3.4.0',
        'postcss': '^8.4.0',
        'autoprefixer': '^10.4.0',
        'eslint': '^8.30.0',
        'eslint-plugin-react': '^7.32.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        'eslint-plugin-react-refresh': '^0.4.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'prettier': '^2.8.0'
      }
    },
    scripts: {
      'dev': 'vite --host 0.0.0.0 --port 5173',
      'build': 'vite build',
      'preview': 'vite preview --host 0.0.0.0 --port 5173',
      'lint': 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      'lint:fix': 'eslint . --ext ts,tsx --fix'
    },
    configuration: {
      eslint: {
        extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:prettier/recommended'],
        rules: {
          'react/react-in-jsx-scope': 'off'
        }
      },
      prettier: {
        singleQuote: true,
        trailingComma: 'all'
      },
      browserslist: ['>0.2%', 'not dead', 'not op_mini all']
    }
  }
];

export function getProjectTemplate(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(template => template.id === id);
}

export function getProjectTemplateByType(type: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(template => template.type === type);
}

export function getAllProjectTemplates(): ProjectTemplate[] {
  return PROJECT_TEMPLATES;
}
