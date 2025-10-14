'use client';

import React from 'react';
import { BusinessCategoryManifest } from '@/midori/agents/frontend-v2/template-system/business-categories';
import { BlockVariant } from '@/midori/agents/frontend-v2/template-system/shared-blocks/index';

interface TemplateRendererProps {
  category: BusinessCategoryManifest;
  variant: BlockVariant;
}

// Mock data ที่ใช้แทน placeholders
const getMockData = (category: BusinessCategoryManifest) => ({
  badge: 'Sample Badge',
  heading: 'Sample Heading',
  subheading: 'This is a sample subheading that demonstrates how the template would look with real content.',
  ctaLabel: 'Get Started',
  secondaryCta: 'Learn More',
  heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
  heroImageAlt: 'Sample hero image',
  stat1: '100+',
  stat1Label: 'Happy Customers',
  stat2: '24/7',
  stat2Label: 'Support',
  stat3: '5★',
  stat3Label: 'Rating',
  primary: category.globalSettings.palette.primary,
  secondary: category.globalSettings.palette.secondary || category.globalSettings.palette.primary
});

// Component สำหรับ render template จริง
export function TemplateRenderer({ category, variant }: TemplateRendererProps) {
  const mockData = getMockData(category);
  
  // Process template - replace placeholders with mock data
  let processedTemplate = variant.template;
  
  // Replace placeholders
  Object.entries(mockData).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  // Apply color variables
  processedTemplate = processedTemplate.replace(/\{primary\}/g, mockData.primary);
  processedTemplate = processedTemplate.replace(/\{secondary\}/g, mockData.secondary);
  
  // Convert React Router Link to regular anchor for preview
  processedTemplate = processedTemplate.replace(/Link to="/g, 'a href="');
  processedTemplate = processedTemplate.replace(/<\/Link>/g, '</a>');
  
  // Remove import statements for preview
  processedTemplate = processedTemplate.replace(/import.*?from.*?;?\n/g, '');
  processedTemplate = processedTemplate.replace(/export default function.*?{/, 'function HeroComponent() {');
  
  // Create a safe component by wrapping in a container
  const SafeComponent = () => {
    try {
      // Create a function that returns the JSX
      const ComponentFunction = new Function('React', `
        const { useState, useEffect } = React;
        return ${processedTemplate.replace('function HeroComponent() {', 'function HeroComponent() {')}
      `);
      
      const Component = ComponentFunction(React);
      return Component();
    } catch (error) {
      console.error('Template render error:', error);
      return (
        <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Template Render Error</h3>
            <p className="text-sm text-red-700">Unable to render template: {variant.name}</p>
            <p className="text-xs text-red-600 mt-2">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full">
      <SafeComponent />
    </div>
  );
}

// Alternative: Static HTML renderer (safer approach)
export function StaticTemplateRenderer({ category, variant }: TemplateRendererProps) {
  const mockData = getMockData(category);
  
  // Process template for static rendering
  let htmlTemplate = variant.template;
  
  // Replace placeholders
  Object.entries(mockData).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    htmlTemplate = htmlTemplate.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  // Apply color variables
  htmlTemplate = htmlTemplate.replace(/\{primary\}/g, mockData.primary);
  htmlTemplate = htmlTemplate.replace(/\{secondary\}/g, mockData.secondary);
  
  // Convert React Router Link to regular anchor
  htmlTemplate = htmlTemplate.replace(/Link to="/g, 'a href="');
  htmlTemplate = htmlTemplate.replace(/<\/Link>/g, '</a>');
  
  // Remove React imports and exports
  htmlTemplate = htmlTemplate.replace(/import.*?from.*?;?\n/g, '');
  htmlTemplate = htmlTemplate.replace(/export default function.*?{/, '');
  htmlTemplate = htmlTemplate.replace(/export default function.*?{/, '');
  
  // Extract JSX content (between return and closing brace)
  const jsxMatch = htmlTemplate.match(/return\s*\((.*?)\)\s*;?\s*}\s*;?\s*$/s);
  const jsxContent = jsxMatch ? jsxMatch[1] : htmlTemplate;
  
  // Convert JSX to HTML
  let htmlContent = jsxContent
    .replace(/className=/g, 'class=')
    .replace(/\/>/g, '/>')
    .replace(/\{([^}]+)\}/g, (match, content) => {
      // Handle simple expressions
      if (content.includes('&&')) {
        return ''; // Remove conditional rendering for static preview
      }
      return content;
    });

  return (
    <div 
      className="w-full h-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

// Enhanced renderer with better error handling
export function EnhancedTemplateRenderer({ category, variant }: TemplateRendererProps) {
  const mockData = getMockData(category);
  
  // Get the hero block customization from category
  const heroBlock = category.blocks.find(block => block.blockId === 'hero-basic');
  const customizations = heroBlock?.customizations || {};
  
  // Merge customizations with mock data
  const finalData = {
    ...mockData,
    ...customizations,
    // Override with category-specific data
    badge: customizations.badge || mockData.badge,
    heading: customizations.heading || mockData.heading,
    subheading: customizations.subheading || mockData.subheading,
    ctaLabel: customizations.ctaLabel || mockData.ctaLabel,
    secondaryCta: customizations.secondaryCta || mockData.secondaryCta,
  };
  
  // Process template
  let processedTemplate = variant.template;
  
  // Replace placeholders
  Object.entries(finalData).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  // Apply color variables
  processedTemplate = processedTemplate.replace(/\{primary\}/g, finalData.primary);
  processedTemplate = processedTemplate.replace(/\{secondary\}/g, finalData.secondary);
  
  // Convert React Router Link to regular anchor
  processedTemplate = processedTemplate.replace(/Link to="/g, 'a href="');
  processedTemplate = processedTemplate.replace(/<\/Link>/g, '</a>');
  
  // Clean up template
  processedTemplate = processedTemplate.replace(/import.*?from.*?;?\n/g, '');
  processedTemplate = processedTemplate.replace(/export default function.*?{/, '');
  
  // Extract JSX content
  const jsxMatch = processedTemplate.match(/return\s*\((.*?)\)\s*;?\s*}\s*;?\s*$/s);
  const jsxContent = jsxMatch ? jsxMatch[1] : processedTemplate;
  
  // Convert JSX to HTML
  let htmlContent = jsxContent
    .replace(/className=/g, 'class=')
    .replace(/\/>/g, '/>')
    .replace(/\{([^}]+)\}/g, (match, content) => {
      // Handle simple expressions
      if (content.includes('&&')) {
        return ''; // Remove conditional rendering for static preview
      }
      return content;
    });

  // Fallback to mock preview if template processing fails
  const renderFallbackPreview = () => (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-full flex items-center justify-center">
      <div className="text-center space-y-6 max-w-4xl mx-auto px-8">
        <div className="text-8xl mb-6">
          {variant.id === 'hero-stats' && '📊'}
          {variant.id === 'hero-split' && '📱'}
          {variant.id === 'hero-fullscreen' && '🖥️'}
          {variant.id === 'hero-minimal' && '⚪'}
          {variant.id === 'hero-cards' && '🃏'}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          {finalData.heading}
        </h1>
        
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {finalData.subheading}
        </p>
        
        <div className="flex space-x-4 justify-center">
          <button className={`px-8 py-3 bg-${finalData.primary}-600 text-white rounded-lg font-semibold`}>
            {finalData.ctaLabel}
          </button>
          <button className={`px-8 py-3 border border-${finalData.primary}-300 text-${finalData.primary}-700 rounded-lg font-semibold`}>
            {finalData.secondaryCta}
          </button>
        </div>
        
        {/* Stats for hero-stats variant */}
        {variant.id === 'hero-stats' && (
          <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className={`text-4xl font-bold text-${finalData.primary}-600`}>100+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold text-${finalData.primary}-600`}>24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold text-${finalData.primary}-600`}>5★</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-full">
          {htmlContent ? (
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            renderFallbackPreview()
          )}
          
          {/* Template Info Overlay */}
          <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
            <div className="flex items-center space-x-2">
              <span>🎨 {category.globalSettings.tone}</span>
              <span>•</span>
              <span>🎭 {variant.id}</span>
              <span>•</span>
              <span className={`w-2 h-2 rounded-full bg-${category.globalSettings.palette.primary}-500`}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
