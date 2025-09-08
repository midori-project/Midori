import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike, EnhancedContentAnalysis, StyleConfiguration } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

export const portfolioHandler: BusinessHandler = {
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
      { path: 'src/pages/Portfolio.tsx', type: 'page' },
      { path: 'src/pages/ProjectDetail.tsx', type: 'page' },
      { path: 'src/pages/Services.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
      { path: 'src/components/ProjectCard.tsx', type: 'component' },
      { path: 'src/components/SkillBar.tsx', type: 'component' },
      { path: 'src/components/TestimonialCard.tsx', type: 'component' },
      { path: 'src/types/index.ts', type: 'util' },
      { path: 'src/lib/utils.ts', type: 'util' },
    ];
  },

  templates: {
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'portfolio-site'}",
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

    'src/components/HeroSection.tsx': (project, finalJson, ctx) => {
      const template = `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white bg-hero-gradient min-h-screen flex items-center">
      <img src="[HERO_IMAGE_URL]" alt="[HERO_IMAGE_ALT]" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">[HERO_TITLE]</h1>
            <p className="text-lg md:text-2xl mb-8 opacity-90">[HERO_SUBTITLE]</p>
            <p className="text-lg mb-8 opacity-80">[HERO_DESCRIPTION]</p>
            <div className="space-x-3">
              <a href="/portfolio" className="btn-primary px-6 py-3 rounded-lg font-semibold">[MENU_BUTTON_TEXT]</a>
              <a href="/contact" className="bg-black/20 backdrop-blur px-6 py-3 rounded-lg font-semibold border border-white/30">[CONTACT_BUTTON_TEXT]</a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-80 h-80 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;`;
      
      return TemplateReplacer.replacePlaceholders(template, finalJson, ctx, project.name);
    },

    'src/components/ProjectCard.tsx': () => `import React from 'react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  projectUrl?: string;
  githubUrl?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  id, title, description, technologies, imageUrl, projectUrl, githubUrl 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500"></div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
              {tech}
            </span>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <Link 
            to={\`/project/\${id}\`}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex-1 text-center"
          >
            View Details
          </Link>
          {projectUrl && (
            <a 
              href={projectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Demo
            </a>
          )}
          {githubUrl && (
            <a 
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;`,

    'src/components/SkillBar.tsx': () => `import React from 'react';

interface SkillBarProps {
  skill: string;
  percentage: number;
  color?: string;
}

const SkillBar: React.FC<SkillBarProps> = ({ skill, percentage, color = 'purple' }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-700">{skill}</span>
        <span className="text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={\`bg-\${color}-600 h-3 rounded-full transition-all duration-1000 ease-out\`}
          style={{ width: \`\${percentage}%\` }}
        ></div>
      </div>
    </div>
  );
};

export default SkillBar;`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';
import ProjectCard from '../components/ProjectCard.tsx';
import SkillBar from '../components/SkillBar.tsx';

const Home: React.FC = () => {
  // Mock data
  const featuredProjects = [
    {
      id: '1',
      title: 'E-commerce Website',
      description: 'Complete online store with product management and payment system',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      projectUrl: '#',
      githubUrl: '#'
    },
    {
      id: '2',
      title: 'Task Management App',
      description: 'Real-time task management application with notification system and collaboration features',
      technologies: ['Vue.js', 'Firebase', 'Vuetify'],
      projectUrl: '#',
      githubUrl: '#'
    },
    {
      id: '3',
      title: 'Corporate Website',
      description: 'Beautiful and responsive corporate presentation website',
      technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
      projectUrl: '#',
      githubUrl: '#'
    }
  ];

  const skills = [
    { skill: 'JavaScript/TypeScript', percentage: 90 },
    { skill: 'React & Next.js', percentage: 85 },
    { skill: 'Node.js & Express', percentage: 80 },
    { skill: 'UI/UX Design', percentage: 75 },
    { skill: 'Database Design', percentage: 70 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Projects Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
          <div className="text-center">
            <a href="/portfolio" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              View All Projects
            </a>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Development Technologies</h3>
              {skills.slice(0, 3).map((skill, index) => (
                <SkillBar key={index} {...skill} />
              ))}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Design & Others</h3>
              {skills.slice(3).map((skill, index) => (
                <SkillBar key={index} {...skill} color="blue" />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start a New Project?</h2>
          <p className="text-xl mb-8 opacity-90">Let's talk about your ideas</p>
          <a href="/contact" className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Contact Now
          </a>
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
- Create portfolio navigation with smooth scrolling
- Add links: Home, About, Portfolio, Services, Contact`;
    }
    if (name.includes('ProjectCard')) {
      return `
- Project showcase card with image, title, description, technologies
- Links to live demo and source code`;
    }
    if (name.includes('SkillBar')) {
      return `
- Animated skill progress bar with percentage
- Customizable colors and smooth animations`;
    }
    return `- Create ${name.replace('.tsx','')} component for portfolio website`;
  },

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add featured projects, skills, CTA`;
    }
    if (file.includes('portfolio')) {
      return `
- Portfolio gallery with project filtering and categories
- Grid layout with ProjectCard components`;
    }
    if (file.includes('about')) {
      return `
- Personal story, experience, education, achievements
- Skills and expertise overview`;
    }
    return `- Create page ${path} for portfolio`;
  },

  getEnhancedContentAnalysis(finalJson: Record<string, unknown>, ctx: BusinessContext): EnhancedContentAnalysis {
    const projectInfo = finalJson.project as any;
    return {
      businessName: projectInfo?.name || '[Your Name]',
      tagline: 'Web Developer & UI/UX Designer',
      heroTitle: 'Hello, I am [Name]',
      heroSubtitle: 'Web Developer & UI/UX Designer',
      aboutText: 'I am a developer with experience in creating beautiful and user-friendly websites and applications',
      tone: 'creative',
      language: 'en',
      contentStyle: 'modern',
      navigationItems: ['Home', 'About', 'Portfolio', 'Services', 'Contact'],
      industrySpecificContent: {
        skills: ['JavaScript/TypeScript', 'React', 'Node.js', 'UI/UX Design'],
        services: ['Web Development', 'UI/UX Design', 'Technical Consulting'],
        projectTypes: ['Corporate Website', 'E-commerce', 'Application', 'Management System']
      },
      colorPreferences: ['purple', 'blue', 'gradient'],
      layoutPreferences: ['modern', 'clean', 'portfolio'],
      contactInfo: {
        email: 'contact@portfolio.com'
      }
    };
  },

  getStyleConfiguration(finalJson: Record<string, unknown>, ctx: BusinessContext): StyleConfiguration {
    return {
      colorScheme: {
        primary: '#7c3aed', // purple-600
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
