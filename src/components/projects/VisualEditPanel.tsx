/**
 * Visual Edit Panel Component
 * แสดง panel สำหรับแก้ไข content ที่เลือก
 */

'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

interface SelectedElement {
  blockId: string;
  field: string;
  type: string;
  currentValue: string;
  itemIndex?: string;
}

interface VisualEditPanelProps {
  selectedElement: SelectedElement | null;
  projectId: string;
  isSaving: boolean;
  onSave: (value: any) => void;
  onCancel: () => void;
}

export function VisualEditPanel({
  selectedElement,
  projectId,
  isSaving,
  onSave,
  onCancel
}: VisualEditPanelProps) {
  const [editValue, setEditValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
    reduction: number;
  } | null>(null);

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

  // Handle image upload with compression
  const handleImageUpload = async (file: File) => {
    if (!selectedElement) return;
    
    const originalSize = file.size;
    console.log('🖼️ [UI] Starting image upload...', file.name);
    console.log('📁 [UI] Original size:', (originalSize / 1024 / 1024).toFixed(2), 'MB');
    
    setUploadingImage(true);
    setUploadError(null);
    setCompressionStatus(null);
    setCompressionInfo(null);
    
    try {
      let fileToUpload = file;
      
      // Only compress if file is an image and larger than 500KB
      if (file.type.startsWith('image/') && file.size > 500 * 1024) {
        setCompressionStatus('กำลังเพิ่มประสิทธิภาพรูปภาพ...');
        console.log('🔄 [UI] Compressing image...');
        
        // Compression options
        const options = {
          maxSizeMB: 1,           // บีบอัดให้เหลือไม่เกิน 1MB
          maxWidthOrHeight: 1920, // ขนาดสูงสุด 1920px
          useWebWorker: true,     // ใช้ Web Worker (ไม่ block UI)
          fileType: 'image/webp', // Convert เป็น WebP
          initialQuality: 0.85    // Quality 85%
        };
        
        try {
          // Compress image
          const compressedFile = await imageCompression(file, options);
          const compressedSize = compressedFile.size;
          const reduction = ((1 - compressedSize / originalSize) * 100);
          
          console.log('✅ [UI] Compressed size:', (compressedSize / 1024 / 1024).toFixed(2), 'MB');
          console.log('📉 [UI] Size reduced:', reduction.toFixed(1), '%');
          
          // Store compression info
          setCompressionInfo({
            originalSize,
            compressedSize,
            reduction
          });
          
          fileToUpload = compressedFile;
          setCompressionStatus(`ลดขนาด ${reduction.toFixed(0)}% (${(compressedSize / 1024 / 1024).toFixed(2)} MB)`);
          
        } catch (compressionError) {
          console.warn('⚠️ [UI] Compression failed, uploading original:', compressionError);
          setCompressionStatus('ใช้รูปภาพต้นฉบับ');
          // Fallback: use original file
        }
      } else {
        console.log('ℹ️ [UI] File too small or not an image, skipping compression');
      }
      
      // Create FormData
      setCompressionStatus('กำลังอัปโหลด...');
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('projectId', projectId);
      formData.append('blockId', selectedElement.blockId);
      formData.append('field', selectedElement.field);
      
      // Add compression metadata
      if (compressionInfo) {
        formData.append('originalSize', originalSize.toString());
        formData.append('compressed', 'true');
      }
      
      console.log('📤 [UI] Uploading to API...');
      
      // Upload to API
      const response = await fetch('/api/visual-edit/upload-image', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      console.log('✅ [UI] Upload successful!', result.url);
      
      // Set the R2 URL as the edit value
      setEditValue(result.url);
      setUploadError(null);
      setCompressionStatus('อัปโหลดสำเร็จ!');
      
      // Clear compression status after 3 seconds
      setTimeout(() => {
        setCompressionStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('❌ [UI] Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setCompressionStatus(null);
      setCompressionInfo(null);
    } finally {
      setUploadingImage(false);
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
        {/* Text/Heading/Icon Input */}
        {(selectedElement.type === 'text' || 
          selectedElement.type === 'heading' || 
          selectedElement.type === 'subheading' ||
          selectedElement.type === 'badge' ||
          selectedElement.type === 'button' ||
          selectedElement.type === 'icon') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedElement.type === 'text' ? 'Text Content' : 
               selectedElement.type === 'heading' ? 'Heading' :
               selectedElement.type === 'subheading' ? 'Subheading' :
               selectedElement.type === 'badge' ? 'Badge Text' :
               selectedElement.type === 'icon' ? 'Icon/Emoji' :
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
                placeholder={selectedElement.type === 'icon' ? "ใส่ emoji หรือ icon (เช่น ✨, 🎯, ⭐)" : "Enter text..."}
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
              {selectedElement.type === 'icon' && editValue.length > 10 && (
                <p className="text-xs text-orange-600">
                  ⚠️ Icon should be 1-2 characters (emoji/symbol)
                </p>
              )}
            </div>
            
            {/* Icon Tips */}
            {selectedElement.type === 'icon' && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="space-y-1">
                  <p className="text-xs text-blue-700 font-semibold">
                    💡 คำแนะนำสำหรับ Icon:
                  </p>
                  <p className="text-xs text-blue-600">
                    • ใช้ emoji เดียว (เช่น ✨, 🎯, ⭐, 💫)
                  </p>
                  <p className="text-xs text-blue-600">
                    • หรือใช้ Unicode symbols (เช่น ★, ♦, ▲, ●)
                  </p>
                  <p className="text-xs text-blue-600">
                    • หลีกเลี่ยงข้อความยาว
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Input */}
        {selectedElement.type === 'image' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              รูปภาพ
            </label>
            
            {/* Image Preview */}
            {editValue && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img 
                  src={editValue} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
                  }}
                />
              </div>
            )}
            
            {/* Upload Error */}
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <span>❌</span>
                  <span>{uploadError}</span>
                </p>
              </div>
            )}
            
            {/* Compression Status */}
            {compressionStatus && (
              <div className={`p-3 rounded-lg border ${
                compressionStatus.includes('สำเร็จ') 
                  ? 'bg-green-50 border-green-200'
                  : compressionStatus.includes('ต้นฉบับ')
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm flex items-center gap-2 ${
                  compressionStatus.includes('สำเร็จ')
                    ? 'text-green-700'
                    : compressionStatus.includes('ต้นฉบับ')
                    ? 'text-yellow-700'
                    : 'text-blue-700'
                }`}>
                  <span>
                    {compressionStatus.includes('สำเร็จ') 
                      ? '✅' 
                      : compressionStatus.includes('ต้นฉบับ')
                      ? '⚠️'
                      : '⚙️'}
                  </span>
                  <span>{compressionStatus}</span>
                </p>
              </div>
            )}
            
            {/* Compression Info */}
            {compressionInfo && !uploadingImage && (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-green-800 flex items-center gap-1">
                    <span>📊</span>
                    <span>สถิติการบีบอัด</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">ต้นฉบับ:</span>
                      <span className="ml-1 font-medium text-gray-800">
                        {(compressionInfo.originalSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">หลังบีบอัด:</span>
                      <span className="ml-1 font-medium text-green-700">
                        {(compressionInfo.compressedSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">ลดขนาด:</span>
                      <span className="font-bold text-green-700">
                        {compressionInfo.reduction.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${compressionInfo.reduction}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingImage}
                  className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.currentTarget.previousElementSibling?.dispatchEvent(new MouseEvent('click'));
                  }}
                >
                  {uploadingImage ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>กำลังอัปโหลด...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>อัปโหลดรูปภาพ</span>
                    </>
                  )}
                </button>
              </label>
              
              {/* URL Toggle Button */}
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                title="ใช้ URL แทน"
              >
                🔗
              </button>
            </div>
            
            {/* URL Input (Toggle) */}
            {showUrlInput && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-600">
                  หรือวาง URL รูปภาพ
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
            
            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="space-y-1">
                <p className="text-xs text-blue-700">
                  💡 <strong>คำแนะนำ:</strong> ใช้รูปภาพคุณภาพสูง (JPEG, PNG, WEBP) ไม่เกิน 10MB
                </p>
                <p className="text-xs text-blue-600">
                  ⚡ <strong>Auto-Optimize:</strong> ระบบจะบีบอัดรูปภาพอัตโนมัติเพื่อความเร็วที่ดีขึ้น
                </p>
              </div>
            </div>
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

