/**
 * Hero Component Definitions
 * Various hero section variants
 */

import type { ComponentDefinition } from '../types';

export const HERO_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'hero',
    name: 'Visual Hero',
    description: 'Hero section with large visual background',
    category: 'content',
    tags: ['hero', 'landing', 'visual', 'image', 'background'],
    variants: [
      {
        id: 'centered',
        name: 'Centered Visual Hero',
        description: 'Centered text with full-width background image',
        style: 'modern',
        layout: 'centered',
        template: `import { Link } from "react-router-dom";

export default function Hero(props: any) {
  const { heroImage, heroImageAlt, badge, heading, subheading, ctaLabel, secondaryCta } = props;
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt={heroImageAlt}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-primary-700/80"></div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative max-w-screen-2xl mx-auto text-center px-4 py-20">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/30 text-primary-700 text-sm font-medium mb-6 shadow-lg">
          <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
          {badge}
        </div>
        
        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
          <span className="bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
            {heading}
          </span>
        </h1>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          {subheading}
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/menu" 
            className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="relative z-10">{ctaLabel}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link 
            to="/about" 
            className="inline-flex items-center px-8 py-4 bg-white/90 backdrop-blur-sm border-2 border-white/50 text-primary-700 font-semibold text-lg rounded-full hover:bg-white hover:border-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}`,
        previewImage: '/previews/hero-visual-centered.png',
        tags: ['centered', 'full-width', 'gradient'],
        metadata: {
          version: '1.0.0',
          popularity: 0.95,
          usageCount: 150,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: 'left-image',
        name: 'Left Image Hero',
        description: 'Split layout with image on left, content on right',
        style: 'modern',
        layout: 'split',
        template: `import { Link } from "react-router-dom";

export default function Hero(props: any) {
  const { heroImage, heroImageAlt, badge, heading, subheading, ctaLabel, secondaryCta } = props;
  
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-{primary}-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-{primary}-100 text-{primary}-700 text-sm font-medium mb-6">
              {badge}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-{primary}-900 mb-6 leading-tight">
              {heading}
            </h1>
            
            <p className="text-xl text-{primary}-700 mb-8 leading-relaxed">
              {subheading}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/menu" 
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-{primary}-500 to-{primary}-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                {ctaLabel}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-{primary}-500 text-{primary}-700 font-semibold text-lg rounded-lg hover:bg-{primary}-50 transition-all duration-300"
              >
                {secondaryCta}
              </Link>
            </div>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-{primary}-400 to-{secondary}-400 rounded-2xl blur-2xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt={heroImageAlt}
                className="relative w-full h-auto rounded-2xl shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
        previewImage: '/previews/hero-visual-left-image.png',
        tags: ['split', 'two-column', 'image-left'],
        metadata: {
          version: '1.0.0',
          popularity: 0.88,
          usageCount: 120,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      },
      {
        id: 'minimal',
        name: 'Minimal Hero',
        description: 'Clean minimal hero with focus on typography',
        style: 'minimal',
        layout: 'centered',
        template: `import { Link } from "react-router-dom";

export default function Hero(props: any) {
  const { badge, heading, subheading, ctaLabel, secondaryCta } = props;
  
  return (
    <section className="relative py-32 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <span className="inline-block px-4 py-1 bg-{primary}-100 text-{primary}-700 text-sm font-medium rounded-full mb-6">
          {badge}
        </span>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          {heading}
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {subheading}
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            to="/menu" 
            className="px-8 py-3 bg-{primary}-600 text-white font-semibold rounded-lg hover:bg-{primary}-700 transition-colors"
          >
            {ctaLabel}
          </Link>
          
          <Link 
            to="/about" 
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}`,
        previewImage: '/previews/hero-visual-minimal.png',
        tags: ['minimal', 'clean', 'simple'],
        metadata: {
          version: '1.0.0',
          popularity: 0.75,
          usageCount: 90,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      }
    ],
    propsSchema: {
      badge: {
        type: 'string',
        required: true,
        defaultValue: 'New',
        description: 'Badge text',
        validation: {
          maxLength: 40
        },
        placeholder: 'Enter badge text',
        examples: ['New', 'Limited Offer', 'Special']
      },
      heading: {
        type: 'string',
        required: true,
        description: 'Main heading text',
        validation: {
          minLength: 5,
          maxLength: 100
        },
        placeholder: 'Enter main heading',
        examples: ['Welcome to Our Restaurant', 'Delicious Food Awaits']
      },
      subheading: {
        type: 'string',
        required: true,
        description: 'Subheading text',
        validation: {
          maxLength: 200
        },
        placeholder: 'Enter subheading',
        examples: ['Experience the finest cuisine']
      },
      ctaLabel: {
        type: 'string',
        required: true,
        defaultValue: 'Get Started',
        description: 'Primary CTA button text',
        validation: {
          maxLength: 24
        },
        examples: ['View Menu', 'Book Now', 'Learn More']
      },
      secondaryCta: {
        type: 'string',
        required: true,
        defaultValue: 'Learn More',
        description: 'Secondary CTA button text',
        validation: {
          maxLength: 24
        },
        examples: ['About Us', 'Contact', 'View Gallery']
      },
      heroImage: {
        type: 'image',
        required: true,
        description: 'Hero background image URL',
        placeholder: 'https://images.unsplash.com/...',
        examples: ['https://images.unsplash.com/photo-restaurant']
      },
      heroImageAlt: {
        type: 'string',
        required: true,
        description: 'Hero image alt text for accessibility',
        validation: {
          maxLength: 100
        },
        placeholder: 'Describe the image',
        examples: ['Restaurant interior with warm lighting']
      }
    },
    dependencies: [],
    preview: {
      thumbnail: '/previews/hero-visual-thumb.png',
      screenshots: [
        '/previews/hero-visual-desktop.png',
        '/previews/hero-visual-mobile.png'
      ],
      demoUrl: '/demo/hero-visual',
      codeExample: `<Hero
  badge="Quality Restaurant"
  heading="Delicious Food, Friendly Prices"
  subheading="We use high-quality ingredients"
  ctaLabel="View Menu"
  secondaryCta="Book Table"
  heroImage="https://images.unsplash.com/..."
  heroImageAlt="Restaurant Interior"
/>`
    },
    metadata: {
      version: '1.0.0',
      author: 'Midori Team',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      popularity: 0.95,
      rating: 4.8,
      downloads: 500,
      usageCount: 360
    }
  }
];

