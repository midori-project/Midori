'use client';

import React, { useState, useEffect } from 'react';
import { BusinessCategoryManifest } from '@/midori/agents/frontend-v2/template-system/business-categories';
import { BlockVariant } from '@/midori/agents/frontend-v2/template-system/shared-blocks/index';

interface VariantPreviewProps {
  category: BusinessCategoryManifest;
  variant: BlockVariant;
  mode: 'code' | 'live';
}

export function VariantPreview({ category, variant, mode }: VariantPreviewProps) {
  const [renderedTemplate, setRenderedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for template rendering
  const mockData = {
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
  };

  useEffect(() => {
    if (mode === 'code') {
      setRenderedTemplate(variant.template || '');
      return;
    }

    setIsLoading(true);
    
    // Simulate template processing
    const processTemplate = async () => {
      try {
        let processedTemplate = variant.template || '';
        
        // Replace placeholders with mock data
        Object.entries(mockData).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
        });
        
        // Apply color variables
        processedTemplate = processedTemplate.replace(/\{primary\}/g, mockData.primary);
        processedTemplate = processedTemplate.replace(/\{secondary\}/g, mockData.secondary);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setRenderedTemplate(processedTemplate);
      } catch (error) {
        console.error('Template processing error:', error);
        setRenderedTemplate('Error processing template');
      } finally {
        setIsLoading(false);
      }
    };

    processTemplate();
  }, [category, variant, mode]);

  if (mode === 'code') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            💻 Template Code
          </h3>
          <p className="text-sm text-gray-600">
            {variant.name} - {category.name}
          </p>
        </div>
        
        <div className="flex-1 overflow-auto">
          <pre className="p-6 text-sm text-gray-800 whitespace-pre-wrap font-mono">
            {renderedTemplate}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🖥️ Live Preview
            </h3>
            <p className="text-sm text-gray-600">
              {variant.name} • {category.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full bg-${category.globalSettings.palette.primary}-500`}></div>
              <span className="text-xs text-gray-600">{category.globalSettings.palette.primary}</span>
            </div>
            {category.globalSettings.palette.secondary && (
              <div className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full bg-${category.globalSettings.palette.secondary}-500`}></div>
                <span className="text-xs text-gray-600">{category.globalSettings.palette.secondary}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing template...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Mock Preview Container */}
              <div className="relative">
                {/* Simulate the rendered component */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">
                      {variant.id === 'hero-stats' && '📊'}
                      {variant.id === 'hero-split' && '📱'}
                      {variant.id === 'hero-fullscreen' && '🖥️'}
                      {variant.id === 'hero-minimal' && '⚪'}
                      {variant.id === 'hero-cards' && '🃏'}
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900">
                      {mockData.heading}
                    </h1>
                    
                    <p className="text-gray-600 max-w-md">
                      {mockData.subheading}
                    </p>
                    
                    <div className="flex space-x-4 justify-center">
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                        {mockData.ctaLabel}
                      </button>
                      <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg">
                        {mockData.secondaryCta}
                      </button>
                    </div>
                    
                    {/* Stats for hero-stats variant */}
                    {variant.id === 'hero-stats' && (
                      <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{mockData.stat1}</div>
                          <div className="text-sm text-gray-600">{mockData.stat1Label}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{mockData.stat2}</div>
                          <div className="text-sm text-gray-600">{mockData.stat2Label}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{mockData.stat3}</div>
                          <div className="text-sm text-gray-600">{mockData.stat3Label}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Preview Info Overlay */}
                <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
                  <div className="flex items-center space-x-2">
                    <span>🎨 {category.globalSettings.tone}</span>
                    <span>•</span>
                    <span>🎭 {variant.id}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Template Info */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Category Settings</h4>
                <p className="text-blue-700">
                  Tone: {category.globalSettings.tone}
                </p>
                <p className="text-blue-700">
                  Colors: {category.globalSettings.palette.primary} + {category.globalSettings.palette.secondary || 'none'}
                </p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Variant Info</h4>
                <p className="text-green-700">
                  Type: {variant.name}
                </p>
                <p className="text-green-700">
                  Overrides: {Object.keys(variant.overrides || {}).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
