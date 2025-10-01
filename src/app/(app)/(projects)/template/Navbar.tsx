"use client";
import { useState } from "react";

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-{primary}-200/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-{primary}-500 to-{accentColor}-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{brandFirstChar}</span>
              </div>
              <span className="text-{primary}-700 font-bold text-xl">{brand}</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <ul className="flex items-center space-x-6">
                {menuItems}
              </ul>
              
              {/* CTA Button */}
              <button className="bg-gradient-to-r from-{primary}-500 to-{accentColor}-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
                {ctaButton}
              </button>
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
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="py-4 space-y-4 border-t border-{primary}-200/50">
              <ul className="space-y-3">
                {menuItems}
              </ul>
              
              {/* Mobile CTA Button */}
              <div className="pt-4">
                <button className="w-full bg-gradient-to-r from-{primary}-500 to-{accentColor}-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                  {ctaButton}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Line */}
        <div className="h-1 bg-gradient-to-r from-{primary}-500 via-{accentColor}-500 to-{primary}-500"></div>
      </nav>
    );
  }