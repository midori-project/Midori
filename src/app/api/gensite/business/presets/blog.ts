import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

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
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'blog-website'}",
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
  --color-primary: #3b82f6; /* fallback: blue-500 */
  --color-secondary: #8b5cf6; /* fallback: violet-500 */
  --color-accent: #06b6d4; /* fallback: cyan-500 */
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
import Articles from './pages/Articles.tsx';
import Article from './pages/Article.tsx';
import Categories from './pages/Categories.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/admin" element={<AdminDashboard />} />
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
  const active = 'bg-blue-600 text-white';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">Blog</Link>
          <div className="flex space-x-2">
            <NavLink to="/" end className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Home</NavLink>
            <NavLink to="/articles" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Articles</NavLink>
            <NavLink to="/categories" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Categories</NavLink>
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
        <span>© ${new Date().getFullYear()} Blog. All rights reserved.</span>
        <span>Powered by React & TypeScript</span>
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
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to Our Blog</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">Discover insights, stories, and knowledge shared by our community of writers.</p>
        <div className="space-x-3">
          <a href="/articles" className="btn-primary px-6 py-3 rounded-lg font-semibold">Read Articles</a>
          <a href="/categories" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">Browse Categories</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`,

    'src/components/ArticleCard.tsx': () => `import React from 'react';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ title, excerpt, author, date, category, readTime }) => {
  return (
    <article className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4" />
      <div className="flex items-center justify-between mb-2">
        <span className="badge-accent px-2 py-1 rounded-full text-xs">{category}</span>
        <span className="text-sm text-gray-500">{readTime}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{excerpt}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">By {author}</span>
        <span className="text-sm text-gray-500">{date}</span>
      </div>
    </article>
  );
};

export default ArticleCard;`,

    'src/components/ArticleList.tsx': () => `import React from 'react';
import ArticleCard from './ArticleCard.tsx';

const ArticleList: React.FC = () => {
  const articles = [
    {
      title: 'Getting Started with React',
      excerpt: 'Learn the fundamentals of React development',
      author: 'John Doe',
      date: '2 days ago',
      category: 'React',
      readTime: '5 min read'
    },
    {
      title: 'CSS Grid vs Flexbox',
      excerpt: 'Understanding the differences and when to use each',
      author: 'Jane Smith',
      date: '1 week ago',
      category: 'CSS',
      readTime: '8 min read'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, index) => (
        <ArticleCard key={index} {...article} />
      ))}
    </div>
  );
};

export default ArticleList;`,

    'src/components/CommentSection.tsx': () => `import React, { useState } from 'react';

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState([
    { id: 1, author: 'Alice', text: 'Great article! Very informative.', date: '2 hours ago' },
    { id: 2, author: 'Bob', text: 'Thanks for sharing this knowledge.', date: '1 day ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([...comments, {
        id: comments.length + 1,
        author: 'Anonymous',
        text: newComment,
        date: 'now'
      }]);
      setNewComment('');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      <div className="space-y-4 mb-6">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{comment.author}</span>
              <span className="text-sm text-gray-500">{comment.date}</span>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={addComment} className="space-y-4">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
        <button type="submit" className="btn-primary px-4 py-2 rounded-lg">Post Comment</button>
      </form>
    </div>
  );
};

export default CommentSection;`,

    'src/components/CategoryList.tsx': () => `import React from 'react';

const CategoryList: React.FC = () => {
  const categories = [
    { name: 'Technology', count: 15, color: 'blue' },
    { name: 'Design', count: 8, color: 'green' },
    { name: 'Business', count: 12, color: 'purple' },
    { name: 'Lifestyle', count: 6, color: 'orange' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
          <p className="text-sm text-gray-600">{category.count} articles</p>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;`,

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
import ArticleList from '../components/ArticleList.tsx';
import CategoryList from '../components/CategoryList.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Articles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Articles</h2>
          <ArticleList />
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Article Categories</h2>
          <CategoryList />
        </div>
      </section>
    </div>
  );
};

export default Home;`,

    'src/pages/Articles.tsx': () => `import React from 'react';
import ArticleList from '../components/ArticleList.tsx';

const Articles: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">All Articles</h1>
        <ArticleList />
      </div>
    </div>
  );
};

export default Articles;`,

    'src/pages/Article.tsx': () => `import React from 'react';
import { useParams } from 'react-router-dom';
import CommentSection from '../components/CommentSection.tsx';

const Article: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Title</h1>
          <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
            <span>By Author Name</span>
            <span>Published on ${new Date().toLocaleDateString()}</span>
          </div>
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              This is the article content. It would be dynamically loaded based on the article ID: {id}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </article>
        <CommentSection />
      </div>
    </div>
  );
};

export default Article;`,

    'src/pages/Categories.tsx': () => `import React from 'react';
import CategoryList from '../components/CategoryList.tsx';

const Categories: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Article Categories</h1>
        <CategoryList />
      </div>
    </div>
  );
};

export default Categories;`,

    'src/pages/AdminDashboard.tsx': () => `import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Total Articles</h3>
            <p className="text-3xl font-bold text-blue-600">42</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Total Views</h3>
            <p className="text-3xl font-bold text-green-600">1,234</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <p className="text-3xl font-bold text-purple-600">89</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;`,

    'src/pages/About.tsx': () => `import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Our Blog</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We are passionate about sharing knowledge, insights, and stories that inspire and educate our readers.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Team</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Editorial Team</h4>
                <p className="text-gray-600">Curating and editing quality content</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Writing Team</h4>
                <p className="text-gray-600">Creating engaging and informative articles</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Blog Statistics</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-600">100+</div>
                <div className="text-gray-600">Articles</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">10K+</div>
                <div className="text-gray-600">Readers</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-600">5</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-600">2</div>
                <div className="text-gray-600">Years</div>
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

    'src/types/index.ts': () => `export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  readTime: string;
  views: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  color: string;
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: Date;
  approved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'reader';
  avatar?: string;
}`,

    'src/lib/utils.ts': () => `export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return \`\${minutes} min read\`;
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
}`,
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


