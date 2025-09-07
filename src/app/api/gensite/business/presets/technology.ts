import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

export const technologyHandler: BusinessHandler = {
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
      { path: 'src/pages/Projects.tsx', type: 'page' },
      { path: 'src/pages/Services.tsx', type: 'page' },
      { path: 'src/pages/Team.tsx', type: 'page' },
      { path: 'src/components/ProjectCard.tsx', type: 'component' },
      { path: 'src/pages/About.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
    ];
  },

  templates: {
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'tech-site'}",
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
  --color-primary: #1e40af; /* fallback: blue-800 */
  --color-secondary: #059669; /* fallback: emerald-600 */
  --color-accent: #7c3aed; /* fallback: violet-600 */
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
import Projects from './pages/Projects.tsx';
import Services from './pages/Services.tsx';
import Team from './pages/Team.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/services" element={<Services />} />
          <Route path="/team" element={<Team />} />
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
  const active = 'bg-blue-800 text-white';
  const inactive = 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-800">TechCorp</Link>
          <div className="flex space-x-2">
            <NavLink to="/" end className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Home</NavLink>
            <NavLink to="/projects" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Projects</NavLink>
            <NavLink to="/services" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Services</NavLink>
            <NavLink to="/team" className={({isActive}) => \`$\{base} $\{isActive ? active : inactive}\`}>Team</NavLink>
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
        <span>© ${new Date().getFullYear()} TechCorp. All rights reserved.</span>
        <span>Innovating the Future</span>
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
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Innovation Meets Technology</h1>
        <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-2xl">We build cutting-edge solutions that transform businesses and drive digital transformation.</p>
        <div className="space-x-3">
          <a href="/services" className="btn-primary px-6 py-3 rounded-lg font-semibold">Our Services</a>
          <a href="/projects" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">View Projects</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`,

    'src/components/ProjectCard.tsx': () => `import React from 'react';

interface ProjectCardProps {
  title: string;
  description: string;
  techStack: string[];
  status: 'completed' | 'ongoing' | 'upcoming';
  image: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, techStack, status, image }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-lg mb-4" />
      <div className="flex items-center justify-between mb-2">
        <span className={\`px-2 py-1 rounded-full text-xs $\{getStatusColor(status)}\`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {techStack.map((tech, index) => (
          <span key={index} className="badge-accent px-2 py-1 rounded-full text-xs">{tech}</span>
        ))}
      </div>
      <button className="btn-primary px-4 py-2 rounded-lg transition-colors w-full">Learn More</button>
    </div>
  );
};

export default ProjectCard;`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Service 1]</h3>
              <p className="text-gray-600">[Service Description 1]</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Service 2]</h3>
              <p className="text-gray-600">[Service Description 2]</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Service 3]</h3>
              <p className="text-gray-600">[Service Description 3]</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Technologies Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technologies We Use</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Tech 1]</h3>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Tech 2]</h3>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Tech 3]</h3>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Tech 4]</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`,

    'src/pages/Projects.tsx': (project) => `import React from 'react';
import ProjectCard from '../components/ProjectCard.tsx';

// AI NOTE: Projects will be filled from promptJson (finalJson.projects.items)
// Expected structure: finalJson.projects = { items: [{ title, description, techStack, status, image }] }

type ProjectItem = { title: string; description: string; techStack: string[]; status: 'completed' | 'ongoing' | 'upcoming'; image: string };

// fallback in case no data from AI
const fallbackProjects: ProjectItem[] = [
  { title: 'E-Commerce Platform', description: 'Modern e-commerce solution', techStack: ['React', 'Node.js', 'MongoDB'], status: 'completed', image: '/placeholder.jpg' },
  { title: 'Mobile App', description: 'Cross-platform mobile application', techStack: ['React Native', 'Firebase'], status: 'ongoing', image: '/placeholder.jpg' },
  { title: 'AI Dashboard', description: 'Machine learning analytics dashboard', techStack: ['Python', 'TensorFlow', 'React'], status: 'upcoming', image: '/placeholder.jpg' },
];

// Read data from window.__MIDORI_FINAL_JSON__ that preview will inject
function getProjects(): ProjectItem[] {
  const w = globalThis as any;
  const data = w?.__MIDORI_FINAL_JSON__;
  const items = data?.projects?.items;
  if (Array.isArray(items) && items.length > 0) return items as ProjectItem[];
  return fallbackProjects;
}

const Projects: React.FC = () => {
  const projects = getProjects();
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={i} {...project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;`,

    'src/pages/Services.tsx': () => `import React from 'react';

const Services: React.FC = () => {
  const services = [
    {
      title: 'Web Development',
      description: 'Custom web applications built with modern technologies',
      features: ['Responsive Design', 'Performance Optimization', 'SEO Ready']
    },
    {
      title: 'Mobile Development',
      description: 'Native and cross-platform mobile applications',
      features: ['iOS & Android', 'Cross-platform', 'App Store Optimization']
    },
    {
      title: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure and deployment',
      features: ['AWS/Azure', 'DevOps', 'Auto Scaling']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-primary px-6 py-3 rounded-lg mt-6 w-full">Learn More</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;`,

    'src/pages/Team.tsx': () => `import React from 'react';

const Team: React.FC = () => {
  const teamMembers = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      bio: 'Visionary leader with 15+ years in tech',
      image: 'bg-blue-100'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      bio: 'Full-stack developer and system architect',
      image: 'bg-emerald-100'
    },
    {
      name: 'Mike Chen',
      role: 'Lead Developer',
      bio: 'Specialist in React and Node.js',
      image: 'bg-violet-100'
    },
    {
      name: 'Emily Davis',
      role: 'UI/UX Designer',
      bio: 'Creative designer focused on user experience',
      image: 'bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Meet Our Team</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;`,

    'src/pages/About.tsx': () => `import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About TechCorp</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We are dedicated to delivering innovative technology solutions that drive business growth 
              and digital transformation for our clients worldwide.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Values</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Innovation</h4>
                <p className="text-gray-600">Pushing boundaries with cutting-edge technology</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Quality</h4>
                <p className="text-gray-600">Delivering excellence in every project</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Company Stats</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600">Projects Completed</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-emerald-600">25+</div>
                <div className="text-gray-600">Happy Clients</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-violet-600">5+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-600">15</div>
                <div className="text-gray-600">Team Members</div>
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
          <p>📍 123 Tech Street, Silicon Valley, CA 94000</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>🕒 Monday - Friday: 9AM - 6PM</p>
          <p>✉️ contact@techcorp.com</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;`,
  },

  getComponentRequirements(path: string): string {
    const name = path.split('/').pop() || '';
    if (name.includes('Navbar')) {
      return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Add links: Home, Projects, Services, Team, About, Contact`;
    }
    if (name.includes('ProjectCard')) {
      return `
- Project card with title, tech stack, description`;
    }
    return `- Create ${name.replace('.tsx','')} component for technology website`;
  },

  getPageRequirements(path: string): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add services, technologies`;
    }
    if (file.includes('services')) {
      return `
- Services page with cards, CTA`;
    }
    return `- Create page ${path} for technology`;
  },
};


