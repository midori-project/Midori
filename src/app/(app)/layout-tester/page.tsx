'use client';

import React, { useState } from 'react';
import { BusinessCategorySelector } from '@/components/layout-tester/BusinessCategorySelector';
import { VariantPreview } from '@/components/layout-tester/VariantPreview';
import { VariantSelector } from '@/components/layout-tester/VariantSelector';
import { BUSINESS_CATEGORIES } from '@/midori/agents/frontend-v2/template-system/business-categories';
import { heroVariants } from '@/midori/agents/frontend-v2/template-system/shared-blocks/variants/hero-variants';

export default function LayoutTesterPage() {
  const [selectedCategory, setSelectedCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [selectedVariant, setSelectedVariant] = useState(heroVariants[0]);
  const [previewMode, setPreviewMode] = useState<'code' | 'live'>('live');

  const handleCategoryChange = (category: typeof BUSINESS_CATEGORIES[0]) => {
    setSelectedCategory(category);
    
    // Auto-select corresponding hero variant if exists
    const heroBlock = category.blocks.find(block => block.blockId === 'hero-basic');
    if (heroBlock?.variantId) {
      const matchingVariant = heroVariants.find(v => v.id === heroBlock.variantId);
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      }
    }
  };

  const handleVariantChange = (variant: typeof heroVariants[0]) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎨 Variant System Tester
              </h1>
              <p className="mt-2 text-gray-600">
                ทดสอบการทำงานของ Business Categories และ Hero Variants
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Controls Bar - Sticky Top */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Business Category Selector - Compact */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                🏢 Business Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory.id === category.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Variant Selector - Compact */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                🎭 Hero Variants
              </h2>
              <div className="flex flex-wrap gap-2">
                {heroVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedVariant.id === variant.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Selected Info Bar */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedCategory.name}</span>
                  <div className={`w-3 h-3 rounded-full bg-${selectedCategory.globalSettings.palette.primary}-500`}></div>
                  <span className="text-xs text-gray-600 capitalize">{selectedCategory.globalSettings.tone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Variant:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedVariant.name}</span>
                </div>
              </div>
              
              {/* Preview Mode Toggle - Moved here */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Preview:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('live')}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      previewMode === 'live'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🖥️ Live
                  </button>
                  <button
                    onClick={() => setPreviewMode('code')}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      previewMode === 'code'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    💻 Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VariantPreview
          category={selectedCategory}
          variant={selectedVariant}
          mode={previewMode}
        />
      </div>
    </div>
  );
}
