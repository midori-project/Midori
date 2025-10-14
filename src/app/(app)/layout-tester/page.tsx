'use client';

import React, { useState } from 'react';
import { VariantPreview } from '@/components/layout-tester/VariantPreview';
import { BUSINESS_CATEGORIES } from '@/midori/agents/frontend-v2/template-system/business-categories';
import { BLOCK_TYPES } from '@/components/layout-tester/BlockTypeConfig';

type ViewportType = 'mobile' | 'tablet' | 'desktop' | 'full';

const VIEWPORTS = {
  mobile: { width: 375, icon: '📱', label: 'Mobile' },
  tablet: { width: 768, icon: '📲', label: 'Tablet' },
  desktop: { width: 1440, icon: '🖥️', label: 'Desktop' },
  full: { width: '100%', icon: '📺', label: 'Full Width' }
};

export default function LayoutTesterPage() {
  const [selectedCategory, setSelectedCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [selectedBlockType, setSelectedBlockType] = useState(BLOCK_TYPES[0]);
  const [selectedVariant, setSelectedVariant] = useState(selectedBlockType.variants[0]);
  const [previewMode, setPreviewMode] = useState<'code' | 'live'>('live');
  const [viewport, setViewport] = useState<ViewportType>('full');
  const [compareMode, setCompareMode] = useState(false);
  const [compareVariants, setCompareVariants] = useState<typeof selectedVariant[]>([]);
  const [showMockEditor, setShowMockEditor] = useState(false);
  const [customMockData, setCustomMockData] = useState<Record<string, any>>(
    selectedBlockType.mockDataTemplate
  );

  const handleCategoryChange = (category: typeof BUSINESS_CATEGORIES[0]) => {
    setSelectedCategory(category);
    setCustomMockData({ ...customMockData, primary: category.globalSettings.palette.primary });
  };

  const handleBlockTypeChange = (blockType: typeof BLOCK_TYPES[0]) => {
    setSelectedBlockType(blockType);
    setSelectedVariant(blockType.variants[0]);
    setCustomMockData(blockType.mockDataTemplate);
    setCompareVariants([]);
  };

  const handleVariantChange = (variant: typeof selectedVariant) => {
    setSelectedVariant(variant);
  };

  const toggleCompareVariant = (variant: typeof selectedVariant) => {
    if (compareVariants.find(v => v.id === variant.id)) {
      setCompareVariants(compareVariants.filter(v => v.id !== variant.id));
    } else {
      setCompareVariants([...compareVariants, variant]);
    }
  };

  const handleMockDataChange = (key: string, value: string) => {
    setCustomMockData({ ...customMockData, [key]: value });
  };

  const resetMockData = () => {
    setCustomMockData(selectedBlockType.mockDataTemplate);
  };

  const copyCodeToClipboard = () => {
    const code = selectedVariant.template;
    navigator.clipboard.writeText(code);
    alert('✅ Code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎨 Advanced Variant System Tester
              </h1>
              <p className="mt-2 text-gray-600">
                ทดสอบ variants ทุกประเภท พร้อม responsive preview และ mock data editor
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  compareMode
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {compareMode ? '✓ Compare Mode' : '⚖️ Compare'}
              </button>
              <button
                onClick={() => setShowMockEditor(!showMockEditor)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showMockEditor
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showMockEditor ? '✓ Mock Editor' : '✏️ Edit Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar - Sticky Top */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          {/* Block Type Selector */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">📦 Block Type</h2>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map((blockType) => (
                <button
                  key={blockType.id}
                  onClick={() => handleBlockTypeChange(blockType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedBlockType.id === blockType.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {blockType.icon} {blockType.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Business Category Selector */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">🏢 Business Category</h2>
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

            {/* Variant Selector */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">🎭 {selectedBlockType.name}</h2>
              <div className="flex flex-wrap gap-2">
                {selectedBlockType.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(variant)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      selectedVariant.id === variant.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {variant.name}
                    {compareMode && (
                      <input
                        type="checkbox"
                        checked={compareVariants.some(v => v.id === variant.id)}
                        onChange={() => toggleCompareVariant(variant)}
                        className="ml-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              
              {/* Info */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedCategory.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Variant:</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedVariant.name}</span>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-4">
                
                {/* Viewport Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Viewport:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {Object.entries(VIEWPORTS).map(([key, { icon, label }]) => (
                      <button
                        key={key}
                        onClick={() => setViewport(key as ViewportType)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          viewport === key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title={label}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">Mode:</span>
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

                {/* Export Button */}
                <button
                  onClick={copyCodeToClipboard}
                  className="px-3 py-1 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors"
                >
                  📋 Copy Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          
          {/* Sidebar - Mock Data Editor */}
          {showMockEditor && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-32">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">✏️ Mock Data</h3>
                  <button
                    onClick={resetMockData}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {Object.entries(customMockData).map(([key, value]) => {
                    // Skip complex objects and arrays for now
                    if (typeof value === 'object') return null;
                    
                    return (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        {typeof value === 'string' && value.length > 50 ? (
                          <textarea
                            value={value}
                            onChange={(e) => handleMockDataChange(key, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleMockDataChange(key, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className="flex-1">
            {compareMode && compareVariants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {compareVariants.map((variant) => (
                  <div key={variant.id} style={{ maxWidth: VIEWPORTS[viewport].width, margin: '0 auto' }}>
                    <VariantPreview
                      category={selectedCategory}
                      variant={variant}
                      mode={previewMode}
                      customMockData={customMockData}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ maxWidth: VIEWPORTS[viewport].width, margin: '0 auto' }}>
                <VariantPreview
                  category={selectedCategory}
                  variant={selectedVariant}
                  mode={previewMode}
                  customMockData={customMockData}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
