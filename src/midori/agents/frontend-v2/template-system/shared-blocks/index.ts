// Shared Blocks System
// Reusable components that can be used across different business categories

export interface SharedBlock {
  id: string;
  name: string;
  description: string;
  category: "layout" | "content" | "navigation" | "interaction" | "visual";
  template: string;
  placeholders: Record<string, PlaceholderConfig>;
  dependencies?: string[]; // Other block IDs this block depends on
  variants?: BlockVariant[];
}

export interface PlaceholderConfig {
  type: "string" | "number" | "boolean" | "array" | "object" | "enum";
  required: boolean;
  maxLength?: number;
  minLength?: number;
  enum?: string[];
  description: string;
  defaultValue?: any;
}

export interface BlockVariant {
  id: string;
  name: string;
  description: string;
  template: string;
  overrides: Record<string, any>;
}

// Shared Block Definitions
export const SHARED_BLOCKS: SharedBlock[] = [
  {
    id: "hero-basic",
    name: "Basic Hero Section",
    description:
      "Standard hero section with heading, subheading, and CTA buttons",
    category: "content",
    template: `import { Link } from "react-router-dom";

export default function Hero(){
    return (
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="{heroImage}" 
            alt="{heroImageAlt}"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-{primary}-900/80 via-{primary}-800/70 to-{primary}-700/80"></div>
        </div>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiN7cHJpbWFyeX0yMCIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-screen-2xl mx-auto text-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/30 text-{primary}-700 text-sm font-medium mb-6 shadow-lg">
            <span className="w-2 h-2 bg-{primary}-500 rounded-full mr-2 animate-pulse"></span>
            {badge}
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            <span className="bg-gradient-to-r from-white to-{primary}-100 bg-clip-text text-transparent">
              {heading}
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            {subheading}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/menu" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-{secondary}-500 to-{secondary}-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <span className="relative z-10">{ctaLabel}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-{secondary}-600 to-{secondary}-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link to="/about" className="inline-flex items-center px-8 py-4 bg-white/90 backdrop-blur-sm border-2 border-white/50 text-{primary}-700 font-semibold text-lg rounded-full hover:bg-white hover:border-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
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
    placeholders: {
      badge: {
        type: "string",
        required: true,
        maxLength: 40,
        description: "Hero badge text",
      },
      heading: {
        type: "string",
        required: true,
        maxLength: 80,
        description: "Main hero heading",
      },
      subheading: {
        type: "string",
        required: true,
        maxLength: 160,
        description: "Hero subheading",
      },
      ctaLabel: {
        type: "string",
        required: true,
        maxLength: 24,
        description: "Primary CTA button text",
      },
      secondaryCta: {
        type: "string",
        required: true,
        maxLength: 24,
        description: "Secondary CTA button text",
      },
      heroImage: {
        type: "string",
        required: true,
        description: "Hero background image URL from Unsplash",
      },
      heroImageAlt: {
        type: "string",
        required: true,
        maxLength: 100,
        description: "Hero image alt text for accessibility",
      },
    },
    variants: [
      {
        id: "hero-stats",
        name: "Hero with Statistics",
        description: "Hero section with statistics section",
        template: `{hero-basic}
          
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-{primary}-600 mb-2">{stat1}</div>
              <div className="text-{primary}-700 font-medium">{stat1Label}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-{primary}-600 mb-2">{stat2}</div>
              <div className="text-{primary}-700 font-medium">{stat2Label}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-{primary}-600 mb-2">{stat3}</div>
              <div className="text-{primary}-700 font-medium">{stat3Label}</div>
            </div>
          </div>`,
        overrides: {
          stat1: { type: "string", required: true, maxLength: 20 },
          stat1Label: { type: "string", required: true, maxLength: 40 },
          stat2: { type: "string", required: true, maxLength: 20 },
          stat2Label: { type: "string", required: true, maxLength: 40 },
          stat3: { type: "string", required: true, maxLength: 20 },
          stat3Label: { type: "string", required: true, maxLength: 40 },
        },
      },
    ],
  },
  {
    id: "navbar-basic",
    name: "Basic Navigation",
    description: "Standard navigation bar with logo, menu, and CTA button",
    category: "navigation",
    template: `import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-{primary}-200/50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-{primary}-500 to-{secondary}-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{brandFirstChar}</span>
              </div>
              <span className="text-{primary}-700 font-bold text-xl">{brand}</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-6">
                {menuItems}
              </ul>
              
              {/* CTA Button */}
              <Link to="/contact" className="bg-gradient-to-r from-{primary}-500 to-{secondary}-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                {ctaButton}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-{primary}-700 hover:bg-{primary}-50 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={\`md:hidden transition-all duration-300 ease-in-out \${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden\`}>
            <div className="py-4 space-y-4 border-t border-{primary}-200/50">
              <ul className="space-y-3">
                {menuItems}
              </ul>
              
              {/* Mobile CTA Button */}
              <div className="pt-4">
                <Link to="/contact" className="w-full inline-block text-center bg-gradient-to-r from-{primary}-500 to-{secondary}-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                  {ctaButton}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Line */}
        <div className="h-1 bg-gradient-to-r from-{primary}-500 via-{secondary}-500 to-{primary}-500"></div>
      </nav>
    );
  }`,
    placeholders: {
      brand: {
        type: "string",
        required: true,
        minLength: 1,
        description: "Brand name",
      },
      brandFirstChar: {
        type: "string",
        required: true,
        minLength: 1,
        description: "First character of brand name",
      },
      ctaButton: {
        type: "string",
        required: true,
        maxLength: 20,
        description: "CTA button text",
      },
      menuItems: {
        type: "array",
        required: true,
        description: "Menu items array",
      },
    },
  },
  {
    id: "footer-basic",
    name: "Basic Footer",
    description: "Basic footer with company info, links, and contact details",
    category: "layout",
    template: `import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-{primary}-900 text-white py-12">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-{primary}-100">{companyName}</h3>
            <p className="text-{primary}-200 mb-4">{description}</p>
            <div className="flex space-x-4">
              {socialLinks}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-{primary}-100">{quickLinksTitle}</h4>
            <ul className="space-y-2">
              {quickLinks}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-{primary}-100">{contactTitle}</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-{primary}-400 mr-3 mt-1">📍</span>
                <span className="text-{primary}-200">{address}</span>
              </div>
              <div className="flex items-center">
                <span className="text-{primary}-400 mr-3">📞</span>
                <span className="text-{primary}-200">{phone}</span>
              </div>
              <div className="flex items-center">
                <span className="text-{primary}-400 mr-3">✉️</span>
                <span className="text-{primary}-200">{email}</span>
              </div>
            </div>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-{primary}-100">{newsletterTitle}</h4>
            <p className="text-{primary}-200 mb-4">{newsletterSubtitle}</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="{newsletterEmailPlaceholder}" 
                className="flex-1 px-3 py-2 bg-{primary}-800 border border-{primary}-700 rounded-l-lg text-white placeholder-{primary}-300 focus:outline-none focus:ring-2 focus:ring-{secondary}-500"
              />
              <button className="px-4 py-2 bg-{secondary}-600 hover:bg-{secondary}-700 text-white rounded-r-lg transition-colors">
                {newsletterCta}
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-{primary}-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-{primary}-300 text-sm">
              &copy; 2024 {companyName}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-{primary}-300 hover:text-white text-sm transition-colors">{privacyPolicy}</Link>
              <Link to="/terms" className="text-{primary}-300 hover:text-white text-sm transition-colors">{termsOfUse}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}`,
    placeholders: {
      companyName: {
        type: "string",
        required: true,
        description: "Company name",
      },
      description: {
        type: "string",
        required: true,
        description: "Company description",
      },
      socialLinks: {
        type: "array",
        required: true,
        description: "Social media links",
      },
      quickLinks: {
        type: "array",
        required: true,
        description: "Quick links array",
      },
      address: {
        type: "string",
        required: true,
        description: "Company address",
      },
      phone: { type: "string", required: true, description: "Phone number" },
      email: { type: "string", required: true, description: "Email address" },
    },
  },
  {
    id: "about-basic",
    name: "Basic About Section",
    description: "Basic about section with company info and features",
    category: "content",
    template: `export default function About() {
  return (
    <section className="py-16 bg-{primary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-{primary}-900 mb-6">{title}</h2>
          <p className="text-lg text-{primary}-700 mb-8 leading-relaxed">{description}</p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {features}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats}
          </div>
        </div>
      </div>
    </section>
  );
}`,
    placeholders: {
      title: {
        type: "string",
        required: true,
        description: "About section title",
      },
      description: {
        type: "string",
        required: true,
        description: "About description",
      },
      features: {
        type: "array",
        required: true,
        description: "Features array",
      },
      stats: { type: "array", required: true, description: "Statistics array" },
    },
  },
  {
    id: "contact-basic",
    name: "Basic Contact Section",
    description: "Basic contact section with contact info and form",
    category: "content",
    template: `import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-{primary}-900 mb-4">{title}</h2>
            <p className="text-lg text-{primary}-700">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-{primary}-900">ข้อมูลติดต่อ</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-{primary}-600 text-xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-{primary}-900">ที่อยู่</h4>
                    <p className="text-{primary}-700">{address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-{primary}-600 text-xl">📞</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-{primary}-900">โทรศัพท์</h4>
                    <p className="text-{primary}-700">{phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-{primary}-600 text-xl">✉️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-{primary}-900">อีเมล</h4>
                    <p className="text-{primary}-700">{email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-{primary}-600 text-xl">🕒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-{primary}-900">เวลาทำการ</h4>
                    <p className="text-{primary}-700">{businessHours}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-{primary}-900">{contactFormTitle}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-{primary}-700 mb-2">ชื่อ</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-{primary}-300 rounded-lg focus:ring-2 focus:ring-{primary}-500 focus:border-transparent" 
                    placeholder="ชื่อของคุณ"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-{primary}-700 mb-2">อีเมล</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-{primary}-300 rounded-lg focus:ring-2 focus:ring-{primary}-500 focus:border-transparent" 
                    placeholder="อีเมลของคุณ"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-{primary}-700 mb-2">ข้อความ</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4} 
                    className="w-full p-3 border border-{primary}-300 rounded-lg focus:ring-2 focus:ring-{primary}-500 focus:border-transparent" 
                    placeholder="ข้อความของคุณ"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-{primary}-600 text-white py-3 px-6 rounded-lg hover:bg-{primary}-700 transition-colors font-semibold"
                >
                  {contactFormCta}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    placeholders: {
      title: {
        type: "string",
        required: true,
        description: "Contact section title",
      },
      subtitle: {
        type: "string",
        required: true,
        description: "Contact section subtitle",
      },
      address: {
        type: "string",
        required: true,
        description: "Company address",
      },
      phone: { type: "string", required: true, description: "Phone number" },
      email: { type: "string", required: true, description: "Email address" },
      businessHours: {
        type: "string",
        required: true,
        description: "Business hours",
      },
    },
  },
  {
    id: "menu-basic",
    name: "Basic Menu Section",
    description:
      "Menu/product listing section with items, categories, and images",
    category: "content",
    template: `export default function Menu() {
    return (
      <section className="py-20 bg-gradient-to-br from-{primary}-50 to-white">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-4">
              {title}
            </h2>
            <div className="w-24 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {menuItems}
          </div>
        </div>
      </section>
    );
  }`,
    placeholders: {
      title: {
        type: "string",
        required: true,
        description: "Menu section title",
      },
      menuItems: {
        type: "array",
        required: true,
        description: "Array of menu items with images",
      },
    },
  },
  {
    id: "theme-basic",
    name: "Basic Theme",
    description: "Basic CSS theme with color palette and spacing tokens",
    category: "visual",
    template: `:root {
  --radius: {radius};
  --spacing: {spacing};
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`,
    placeholders: {
      radius: {
        type: "enum",
        required: true,
        enum: ["6px", "8px", "10px"],
        defaultValue: "8px",
        description: "Border radius",
      },
      spacing: {
        type: "enum",
        required: true,
        enum: ["0.75rem", "1rem", "1.25rem"],
        defaultValue: "1rem",
        description: "Base spacing unit",
      },
    },
  },
];

export function getSharedBlock(id: string): SharedBlock | undefined {
  return SHARED_BLOCKS.find((block) => block.id === id);
}

export function getSharedBlocksByCategory(category: string): SharedBlock[] {
  return SHARED_BLOCKS.filter((block) => block.category === category);
}
