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
            
            {/* Preview Mode Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Preview Mode:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('live')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'live'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🖥️ Live
                </button>
                <button
                  onClick={() => setPreviewMode('code')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Business Category Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🏢 Business Categories
              </h2>
              <BusinessCategorySelector
                categories={BUSINESS_CATEGORIES}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Hero Variant Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🎭 Hero Variants
              </h2>
              <VariantSelector
                variants={heroVariants}
                selectedVariant={selectedVariant}
                onVariantChange={handleVariantChange}
              />
            </div>

            {/* Category Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Category Info
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">ID:</span>
                  <p className="text-sm text-gray-900 font-mono">{selectedCategory.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-sm text-gray-900">{selectedCategory.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tone:</span>
                  <p className="text-sm text-gray-900 capitalize">{selectedCategory.globalSettings.tone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Colors:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-4 h-4 rounded bg-${selectedCategory.globalSettings.palette.primary}-500`}></div>
                    <span className="text-xs text-gray-600">{selectedCategory.globalSettings.palette.primary}</span>
                    {selectedCategory.globalSettings.palette.secondary && (
                      <>
                        <div className={`w-4 h-4 rounded bg-${selectedCategory.globalSettings.palette.secondary}-500`}></div>
                        <span className="text-xs text-gray-600">{selectedCategory.globalSettings.palette.secondary}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCategory.keywords.slice(0, 5).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700">
                        {keyword}
                      </span>
                    ))}
                    {selectedCategory.keywords.length > 5 && (
                      <span className="text-xs text-gray-500">+{selectedCategory.keywords.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            <VariantPreview
              category={selectedCategory}
              variant={selectedVariant}
              mode={previewMode}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
