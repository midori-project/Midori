'use client';

import React from 'react';
import { BlockVariant } from '@/midori/agents/frontend-v2/template-system/shared-blocks/index';

interface VariantSelectorProps {
  variants: BlockVariant[];
  selectedVariant: BlockVariant;
  onVariantChange: (variant: BlockVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange
}: VariantSelectorProps) {
  
  const getVariantIcon = (variantId: string) => {
    const iconMap: Record<string, string> = {
      'hero-stats': '📊',
      'hero-split': '📱',
      'hero-fullscreen': '🖥️',
      'hero-minimal': '⚪',
      'hero-cards': '🃏'
    };
    return iconMap[variantId] || '🎨';
  };

  const getVariantStyle = (variantId: string) => {
    const styleMap: Record<string, string> = {
      'hero-stats': 'Statistics-focused layout with prominent numbers',
      'hero-split': 'Modern split-screen design with image and content',
      'hero-fullscreen': 'Dramatic full-screen hero with overlay effects',
      'hero-minimal': 'Clean, minimal design with focus on typography',
      'hero-cards': 'Feature cards layout for engaging presentation'
    };
    return styleMap[variantId] || 'Custom variant design';
  };

  const getVariantBadgeColor = (variantId: string) => {
    const colorMap: Record<string, string> = {
      'hero-stats': 'bg-purple-100 text-purple-800',
      'hero-split': 'bg-blue-100 text-blue-800',
      'hero-fullscreen': 'bg-gray-100 text-gray-800',
      'hero-minimal': 'bg-green-100 text-green-800',
      'hero-cards': 'bg-orange-100 text-orange-800'
    };
    return colorMap[variantId] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div
          key={variant.id}
          onClick={() => onVariantChange(variant)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
            selectedVariant.id === variant.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">
              {getVariantIcon(variant.id)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {variant.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVariantBadgeColor(variant.id)}`}>
                  {variant.id}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {variant.description}
              </p>
              
              <p className="text-xs text-gray-500 mb-2">
                {getVariantStyle(variant.id)}
              </p>
              
              {/* Override Info */}
              <div className="mt-2">
                {Object.keys(variant.overrides || {}).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(variant.overrides || {}).slice(0, 3).map((override, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        {override}
                      </span>
                    ))}
                    {Object.keys(variant.overrides || {}).length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{Object.keys(variant.overrides || {}).length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    No overrides
                  </span>
                )}
              </div>
            </div>
            
            {/* Selection Indicator */}
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedVariant.id === variant.id
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            }`}>
              {selectedVariant.id === variant.id && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
