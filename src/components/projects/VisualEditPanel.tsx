/**
 * Visual Edit Panel Component
 * แสดง panel สำหรับแก้ไข content ที่เลือก
 */

'use client';

import { useState, useEffect } from 'react';

interface SelectedElement {
  blockId: string;
  field: string;
  type: string;
  currentValue: string;
  itemIndex?: string;
}

interface VisualEditPanelProps {
  selectedElement: SelectedElement | null;
  isSaving: boolean;
  onSave: (value: any) => void;
  onCancel: () => void;
}

export function VisualEditPanel({
  selectedElement,
  isSaving,
  onSave,
  onCancel
}: VisualEditPanelProps) {
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (selectedElement) {
      setEditValue(selectedElement.currentValue);
    }
  }, [selectedElement]);

  if (!selectedElement) return null;

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="fixed right-4 top-20 w-80 bg-white shadow-2xl rounded-lg border border-gray-200 z-50 animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            ✏️ Edit Content
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-white/50 rounded"
            title="Close (Esc)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Block:</span> {selectedElement.blockId}
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Field:</span> {selectedElement.field}
          </p>
          {selectedElement.itemIndex && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Index:</span> {selectedElement.itemIndex}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Text/Heading Input */}
        {(selectedElement.type === 'text' || 
          selectedElement.type === 'heading' || 
          selectedElement.type === 'subheading' ||
          selectedElement.type === 'badge' ||
          selectedElement.type === 'button') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedElement.type === 'text' ? 'Text Content' : 
               selectedElement.type === 'heading' ? 'Heading' :
               selectedElement.type === 'subheading' ? 'Subheading' :
               selectedElement.type === 'badge' ? 'Badge Text' :
               'Button Label'}
            </label>
            {selectedElement.type === 'text' ? (
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-sans"
                rows={4}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter text..."
                autoFocus
              />
            ) : (
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter text..."
                autoFocus
              />
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {editValue.length} characters
              </p>
              {selectedElement.type === 'badge' && editValue.length > 40 && (
                <p className="text-xs text-orange-600">
                  ⚠️ Badge text should be under 40 chars
                </p>
              )}
            </div>
          </div>
        )}

        {/* Image Input */}
        {selectedElement.type === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://..."
              autoFocus
            />
            {editValue && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <div className="relative w-full h-32 bg-gray-100 rounded border overflow-hidden">
                  <img 
                    src={editValue} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Invalid+URL';
                    }}
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Use high-quality images for best results
            </p>
          </div>
        )}

        {/* Link Input */}
        {selectedElement.type === 'link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://..."
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Enter a valid URL (e.g., https://example.com)
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !editValue.trim()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              💾 Save
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
        <p className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">Ctrl/Cmd + Enter</kbd> 
          to save
        </p>
        <p className="flex items-center gap-2 mt-1">
          <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">Esc</kbd> 
          to cancel
        </p>
      </div>
    </div>
  );
}

