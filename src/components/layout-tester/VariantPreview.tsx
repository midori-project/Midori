'use client';

import React, { useState, useEffect } from 'react';
import { BusinessCategoryManifest } from '@/midori/agents/frontend-v2/template-system/business-categories';
import { BlockVariant } from '@/midori/agents/frontend-v2/template-system/shared-blocks/index';
import { EnhancedTemplateRenderer } from './TemplateRenderer';

interface VariantPreviewProps {
  category: BusinessCategoryManifest;
  variant: BlockVariant;
  mode: 'code' | 'live';
  customMockData?: Record<string, any>;
}

export function VariantPreview({ category, variant, mode, customMockData }: VariantPreviewProps) {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[700px] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
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
          <div className="h-full">
            {/* Real Template Preview */}
            <EnhancedTemplateRenderer 
              category={category}
              variant={variant}
              customMockData={customMockData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
