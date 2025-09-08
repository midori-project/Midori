import { BusinessContext, BusinessHandler, FileConfigLite, ProjectLike, EnhancedContentAnalysis, StyleConfiguration } from '../types';
import { TemplateReplacer } from '../../../../../utils/template-replacer';

export const agencyHandler: BusinessHandler = {
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
      { path: 'src/pages/Services.tsx', type: 'page' },
      { path: 'src/pages/Portfolio.tsx', type: 'page' },
      { path: 'src/pages/Team.tsx', type: 'page' },
      { path: 'src/pages/Contact.tsx', type: 'page' },
      { path: 'src/components/Navbar.tsx', type: 'component' },
      { path: 'src/components/Footer.tsx', type: 'component' },
      { path: 'src/components/HeroSection.tsx', type: 'component' },
      { path: 'src/components/ServiceCard.tsx', type: 'component' },
      { path: 'src/components/TeamMember.tsx', type: 'component' },
      { path: 'src/components/CaseStudyCard.tsx', type: 'component' },
      { path: 'src/types/index.ts', type: 'util' },
      { path: 'src/lib/utils.ts', type: 'util' },
    ];
  },

  templates: {
    'package.json': (project, finalJson, ctx) => `{
  "name": "${project.name || 'agency-site'}",
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

    'src/components/HeroSection.tsx': (project, finalJson, ctx) => {
      const template = `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white bg-hero-gradient min-h-screen flex items-center">
      <img src="[HERO_IMAGE_URL]" alt="[HERO_IMAGE_ALT]" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">[HERO_TITLE]</h1>
          <p className="text-lg md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            [HERO_SUBTITLE]
          </p>
          <div className="space-x-4 mb-12">
            <a href="/services" className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">[MENU_BUTTON_TEXT]</a>
            <a href="/portfolio" className="bg-black/20 backdrop-blur px-8 py-4 rounded-lg font-semibold border border-white/30 text-lg">[LEARN_MORE_TEXT]</a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-lg opacity-80">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-80">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5+</div>
              <div className="text-lg opacity-80">Years Experience</div>
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

    'src/components/ServiceCard.tsx': () => `import React from 'react';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, features }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceCard;`,

    'src/pages/Home.tsx': (project) => `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';
import ServiceCard from '../components/ServiceCard.tsx';

const Home: React.FC = () => {
  const services = [
    {
      icon: '🎨',
      title: 'Brand Design',
      description: 'Create distinctive and memorable brand identity',
      features: ['Logo Design', 'Brand Guidelines', 'Visual Identity', 'Brand Strategy']
    },
    {
      icon: '💻',
      title: 'Digital Marketing',
      description: 'Drive business growth with effective digital marketing',
      features: ['Social Media Marketing', 'Google Ads', 'SEO', 'Content Marketing']
    },
    {
      icon: '🌐',
      title: 'Web Development',
      description: 'Develop websites that meet business needs',
      features: ['Responsive Design', 'E-commerce', 'CMS', 'Custom Development']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in providing comprehensive services from brand creation to digital marketing
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast</h3>
              <p className="text-gray-600">On-time delivery</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-600">High quality work</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Communication</h3>
              <p className="text-gray-600">Easy contact 24/7</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Value</h3>
              <p className="text-gray-600">Reasonable price</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start a New Project?</h2>
          <p className="text-xl mb-8 opacity-90">Free consultation! Let's talk about your needs</p>
          <a href="/contact" className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
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
- Create professional agency navigation
- Add links: Home, About, Services, Portfolio, Team, Contact`;
    }
    if (name.includes('ServiceCard')) {
      return `
- Service showcase card with icon, title, description, features list
- Professional styling with hover effects`;
    }
    if (name.includes('TeamMember')) {
      return `
- Team member card with photo, name, position, bio
- Social media links and contact info`;
    }
    return `- Create ${name.replace('.tsx','')} component for agency website`;
  },

  getPageRequirements(path: string, finalJson: Record<string, unknown>, project: ProjectLike, ctx: BusinessContext): string {
    const file = path.toLowerCase();
    if (file.includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Start with <HeroSection /> and add services, why choose us, CTA`;
    }
    if (file.includes('services')) {
      return `
- Services page with detailed service descriptions
- Pricing and packages if applicable`;
    }
    if (file.includes('portfolio')) {
      return `
- Portfolio/case studies with project details
- Filter by service type or industry`;
    }
    if (file.includes('team')) {
      return `
- Team page with member profiles
- Company culture and values`;
    }
    return `- Create page ${path} for agency`;
  },

  getEnhancedContentAnalysis(finalJson: Record<string, unknown>, ctx: BusinessContext): EnhancedContentAnalysis {
    const projectInfo = finalJson.project as any;
    return {
      businessName: projectInfo?.name || 'Agency',
      tagline: 'Creating Outstanding Brands',
      heroTitle: 'Creating Outstanding Brands',
      heroSubtitle: 'We are an agency with experience in brand creation, digital marketing and outstanding design',
      aboutText: 'We have more than 5 years of experience in providing brand creation and digital marketing services',
      tone: 'professional',
      language: 'en',
      contentStyle: 'modern',
      navigationItems: ['Home', 'About', 'Services', 'Portfolio', 'Team', 'Contact'],
      industrySpecificContent: {
        services: ['Brand Design', 'Digital Marketing', 'Web Development', 'Consulting'],
        expertise: ['Strategy', 'Creative', 'Technology', 'Analytics'],
        industries: ['Retail', 'F&B', 'Technology', 'Healthcare']
      },
      colorPreferences: ['blue', 'purple', 'professional'],
      layoutPreferences: ['modern', 'clean', 'professional'],
      contactInfo: {
        phone: '02-123-4567',
        email: 'contact@agency.com'
      }
    };
  },

  getStyleConfiguration(finalJson: Record<string, unknown>, ctx: BusinessContext): StyleConfiguration {
    return {
      colorScheme: {
        primary: '#3b82f6', // blue-500
        secondary: '#7c3aed', // purple-600
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
