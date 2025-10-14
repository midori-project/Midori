'use client';

import React from 'react';
import { BusinessCategoryManifest } from '@/midori/agents/frontend-v2/template-system/business-categories';

interface BusinessCategorySelectorProps {
  categories: BusinessCategoryManifest[];
  selectedCategory: BusinessCategoryManifest;
  onCategoryChange: (category: BusinessCategoryManifest) => void;
}

export function BusinessCategorySelector({
  categories,
  selectedCategory,
  onCategoryChange
}: BusinessCategorySelectorProps) {
  
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: Record<string, string> = {
      'restaurant': '🍽️',
      'restaurant-modern': '🏢',
      'restaurant-luxury': '💎',
      'restaurant-minimal': '⚪',
      'restaurant-casual': '😊',
      'ecommerce': '🛒',
      'portfolio': '💼',
      'healthcare': '🏥'
    };
    return iconMap[categoryId] || '📄';
  };

  const getCategoryBadgeColor = (tone: string) => {
    const colorMap: Record<string, string> = {
      'warm': 'bg-orange-100 text-orange-800',
      'modern': 'bg-blue-100 text-blue-800',
      'luxury': 'bg-gray-100 text-gray-800',
      'minimal': 'bg-gray-100 text-gray-800',
      'professional': 'bg-blue-100 text-blue-800',
      'friendly': 'bg-green-100 text-green-800'
    };
    return colorMap[tone] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category.id}
          onClick={() => onCategoryChange(category)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
            selectedCategory.id === category.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">
              {getCategoryIcon(category.id)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {category.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(category.globalSettings.tone || 'default')}`}>
                  {category.globalSettings.tone || 'default'}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {category.description}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>
                  🎨 {category.globalSettings.palette.primary}
                  {category.globalSettings.palette.secondary && ` + ${category.globalSettings.palette.secondary}`}
                </span>
                <span>📦 {category.blocks.length} blocks</span>
              </div>
              
              {/* Hero Variant Info */}
              <div className="mt-2">
                {(() => {
                  const heroBlock = category.blocks.find(block => block.blockId === 'hero-basic');
                  if (heroBlock?.variantId) {
                    return (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        🎭 {heroBlock.variantId}
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      🎭 default
                    </span>
                  );
                })()}
              </div>
            </div>
            
            {/* Selection Indicator */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedCategory.id === category.id
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            }`}>
              {selectedCategory.id === category.id && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
