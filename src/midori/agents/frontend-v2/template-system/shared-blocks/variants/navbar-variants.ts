import { BlockVariant } from "../index";

export const navbarVariants: BlockVariant[] = [
  {
    id: "navbar-centered",
    name: "Centered Navigation",
    description: "Navigation bar with centered menu items and logo",
    template: `import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-{primary}-200/50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand - Left */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-{primary}-500 to-{secondary}-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{brandFirstChar}</span>
              </div>
              <span className="text-{primary}-700 font-bold text-xl">{brand}</span>
            </Link>

            {/* Center Menu */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <ul className="flex items-center space-x-8">
                {menuItems}
              </ul>
            </div>
            
            {/* Right Side - CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
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
    overrides: {}
  },
  {
    id: "navbar-transparent",
    name: "Transparent Navigation",
    description: "Transparent navigation bar that becomes solid on scroll",
    template: `import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    return (
      <nav className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-{primary}-200/50 shadow-sm' 
          : 'bg-transparent'
      }\`}>
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-{primary}-500 to-{secondary}-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{brandFirstChar}</span>
              </div>
              <span className={\`font-bold text-xl \${
                isScrolled ? 'text-{primary}-700' : 'text-white'
              }\`}>{brand}</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-6">
                {menuItems}
              </ul>
              
              {/* CTA Button */}
              <Link to="/contact" className={\`px-6 py-2 rounded-full font-semibold transition-all duration-300 \${
                isScrolled 
                  ? 'bg-gradient-to-r from-{primary}-500 to-{secondary}-500 text-white hover:shadow-lg transform hover:-translate-y-0.5' 
                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
              }\`}>
                {ctaButton}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={\`md:hidden p-2 rounded-lg transition-colors duration-200 \${
                isScrolled ? 'text-{primary}-700 hover:bg-{primary}-50' : 'text-white hover:bg-white/20'
              }\`}>
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
            <div className={\`py-4 space-y-4 \${
              isScrolled ? 'border-t border-{primary}-200/50' : 'border-t border-white/20'
            }\`}>
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
      </nav>
    );
  }`,
    overrides: {}
  },
  {
    id: "navbar-sidebar",
    name: "Sidebar Navigation",
    description: "Navigation with sliding sidebar menu",
    template: `import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-{primary}-200/50 shadow-sm">
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

              {/* Sidebar Menu Button - Hidden on desktop */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-lg text-{primary}-700 hover:bg-{primary}-50 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isSidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Gradient Line */}
          <div className="h-1 bg-gradient-to-r from-{primary}-500 via-{secondary}-500 to-{primary}-500"></div>
        </nav>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={\`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out \${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }\`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-{primary}-900">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <ul className="space-y-4 mb-8">
              {menuItems}
            </ul>
            
            <Link 
              to="/contact" 
              className="w-full inline-block text-center bg-gradient-to-r from-{primary}-500 to-{secondary}-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              onClick={() => setIsSidebarOpen(false)}
            >
              {ctaButton}
            </Link>
          </div>
        </div>
      </>
    );
  }`,
    overrides: {}
  },
  {
    id: "navbar-minimal",
    name: "Minimal Navigation",
    description: "Clean minimal navigation with simple design",
    template: `import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-{primary}-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{brandFirstChar}</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">{brand}</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-6">
                {menuItems}
              </ul>
              
              {/* CTA Button */}
              <Link to="/contact" className="bg-{primary}-600 text-white px-5 py-2 rounded-md font-medium hover:bg-{primary}-700 transition-colors duration-200">
                {ctaButton}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors duration-200"
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
            <div className="py-4 space-y-4 border-t border-gray-200">
              <ul className="space-y-3">
                {menuItems}
              </ul>
              
              {/* Mobile CTA Button */}
              <div className="pt-4">
                <Link to="/contact" className="w-full inline-block text-center bg-{primary}-600 text-white px-5 py-3 rounded-md font-medium hover:bg-{primary}-700 transition-colors duration-200">
                  {ctaButton}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }`,
    overrides: {}
  },
  {
    id: "navbar-mega",
    name: "Mega Menu Navigation",
    description: "Navigation with mega menu dropdown for complex sites",
    template: `import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRef = useRef(null);
    
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setActiveDropdown(null);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-{primary}-200">
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
            <div className="hidden lg:flex items-center space-x-8">
              <ul className="flex items-center space-x-6" ref={dropdownRef}>
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
              className="lg:hidden p-2 rounded-lg text-{primary}-700 hover:bg-{primary}-50 transition-colors duration-200"
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
          <div className={\`lg:hidden transition-all duration-300 ease-in-out \${
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

        {/* Mega Menu Dropdown */}
        {activeDropdown && (
          <div className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
            <div className="max-w-screen-2xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Mega menu content would go here */}
                <div>
                  <h3 className="font-bold text-{primary}-900 mb-4">Featured</h3>
                  <ul className="space-y-2">
                    <li><Link to="/featured" className="text-gray-600 hover:text-{primary}-600 transition-colors">New Arrivals</Link></li>
                    <li><Link to="/featured" className="text-gray-600 hover:text-{primary}-600 transition-colors">Best Sellers</Link></li>
                    <li><Link to="/featured" className="text-gray-600 hover:text-{primary}-600 transition-colors">Special Offers</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-{primary}-900 mb-4">Categories</h3>
                  <ul className="space-y-2">
                    <li><Link to="/categories" className="text-gray-600 hover:text-{primary}-600 transition-colors">Category 1</Link></li>
                    <li><Link to="/categories" className="text-gray-600 hover:text-{primary}-600 transition-colors">Category 2</Link></li>
                    <li><Link to="/categories" className="text-gray-600 hover:text-{primary}-600 transition-colors">Category 3</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-{primary}-900 mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li><Link to="/resources" className="text-gray-600 hover:text-{primary}-600 transition-colors">Blog</Link></li>
                    <li><Link to="/resources" className="text-gray-600 hover:text-{primary}-600 transition-colors">Help Center</Link></li>
                    <li><Link to="/resources" className="text-gray-600 hover:text-{primary}-600 transition-colors">Contact Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }`,
    overrides: {
      megaMenuContent: {
        type: "object",
        required: false,
        description: "Mega menu content structure"
      }
    }
  },
  {
    id: "navbar-sticky",
    name: "Sticky Navigation",
    description: "Navigation that stays visible and changes appearance on scroll",
    template: `import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
    
    useEffect(() => {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 50);
        setIsAtTop(scrollY <= 10);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    return (
      <nav className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${
        isAtTop 
          ? 'bg-transparent py-4' 
          : isScrolled 
            ? 'bg-white shadow-lg py-0' 
            : 'bg-white/95 backdrop-blur-sm py-0'
      }\`}>
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className={\`flex items-center justify-between transition-all duration-300 \${
            isAtTop ? 'h-20' : 'h-16'
          }\`}>
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2">
              <div className={\`transition-all duration-300 \${
                isAtTop ? 'w-10 h-10' : 'w-8 h-8'
              } bg-gradient-to-br from-{primary}-500 to-{secondary}-500 rounded-lg flex items-center justify-center\`}>
                <span className="text-white font-bold text-sm">{brandFirstChar}</span>
              </div>
              <span className={\`font-bold transition-all duration-300 \${
                isAtTop ? 'text-2xl' : 'text-xl'
              } \${
                isAtTop ? 'text-white' : 'text-{primary}-700'
              }\`}>{brand}</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className={\`flex items-center space-x-6 \${
                isAtTop ? 'text-white' : 'text-{primary}-700'
              }\`}>
                {menuItems}
              </ul>
              
              {/* CTA Button */}
              <Link to="/contact" className={\`transition-all duration-300 \${
                isAtTop 
                  ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-full font-semibold hover:bg-white/30' 
                  : 'bg-gradient-to-r from-{primary}-500 to-{secondary}-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5'
              }\`}>
                {ctaButton}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={\`md:hidden p-2 rounded-lg transition-colors duration-200 \${
                isAtTop ? 'text-white hover:bg-white/20' : 'text-{primary}-700 hover:bg-{primary}-50'
              }\`}>
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
            <div className={\`py-4 space-y-4 \${
              isAtTop ? 'border-t border-white/20' : 'border-t border-{primary}-200/50'
            }\`}>
              <ul className={\`space-y-3 \${
                isAtTop ? 'text-white' : 'text-{primary}-700'
              }\`}>
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
        {!isAtTop && (
          <div className="h-1 bg-gradient-to-r from-{primary}-500 via-{secondary}-500 to-{primary}-500"></div>
        )}
      </nav>
    );
  }`,
    overrides: {}
  }
];