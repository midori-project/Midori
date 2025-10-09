'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview';

interface LayoutVariant {
  id: string;
  name: string;
  category: string;
  variant: string;
  icon: string;
  colors: string;
  colorScheme: { primary: string; secondary: string };
  vibe: string;
  bestFor: string;
  keywords: string[];
  description: string;
}

const layoutVariants: LayoutVariant[] = [
  {
    id: 'restaurant-modern',
    name: 'Modern',
    category: 'restaurant-modern',
    variant: 'hero-split',
    icon: '🔷',
    colors: 'Blue & Indigo',
    colorScheme: { primary: 'blue', secondary: 'indigo' },
    vibe: 'ทันสมัย สะอาดตา',
    bestFor: 'Cafe, Fusion Restaurant',
    keywords: ['modern', 'contemporary', 'trendy'],
    description: 'Layout แบบแบ่งครึ่งจอ เนื้อหาด้านซ้าย รูปภาพด้านขวา ดูทันสมัยและมืออาชีพ'
  },
  {
    id: 'restaurant-luxury',
    name: 'Luxury',
    category: 'restaurant-luxury',
    variant: 'hero-fullscreen',
    icon: '💎',
    colors: 'Gray & Amber',
    colorScheme: { primary: 'gray', secondary: 'amber' },
    vibe: 'หรูหรา พรีเมียม',
    bestFor: 'Fine Dining, Michelin',
    keywords: ['luxury', 'fine dining', 'premium', 'elegant'],
    description: 'Layout เต็มจอพร้อม overlay สีเข้ม สร้างความประทับใจแบบหรูหรา'
  },
  {
    id: 'restaurant-minimal',
    name: 'Minimal',
    category: 'restaurant-minimal',
    variant: 'hero-minimal',
    icon: '⬜',
    colors: 'Gray & Stone',
    colorScheme: { primary: 'gray', secondary: 'stone' },
    vibe: 'เรียบง่าย สะอาด',
    bestFor: 'Japanese, Simple Cafe',
    keywords: ['minimal', 'simple', 'clean'],
    description: 'Layout เรียบง่าย เน้นเนื้อหาและ typography รูปภาพอยู่ด้านล่าง'
  },
  {
    id: 'restaurant-casual',
    name: 'Casual',
    category: 'restaurant-casual',
    variant: 'hero-cards',
    icon: '🍕',
    colors: 'Orange & Yellow',
    colorScheme: { primary: 'orange', secondary: 'yellow' },
    vibe: 'อบอุ่น เป็นกันเอง',
    bestFor: 'Family, Street Food',
    keywords: ['casual', 'friendly', 'family', 'cozy'],
    description: 'Layout พร้อม feature cards เน้นความเป็นกันเอง เหมาะกับครอบครัว'
  },
  {
    id: 'restaurant',
    name: 'Standard',
    category: 'restaurant',
    variant: 'hero-stats',
    icon: '🍽️',
    colors: 'Orange & Red',
    colorScheme: { primary: 'orange', secondary: 'red' },
    vibe: 'ทั่วไป มาตรฐาน',
    bestFor: 'ร้านอาหารทั่วไป',
    keywords: ['restaurant', 'food'],
    description: 'Layout มาตรฐานพร้อมส่วนแสดงสถิติ เหมาะกับทุกประเภท'
  }
];

export default function LayoutTesterPage() {
  const [selectedLayout, setSelectedLayout] = useState<LayoutVariant | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [generatedProjectId, setGeneratedProjectId] = useState<string>('');
  
  // Daytona Preview Hook
  const {
    sandboxId,
    status: previewStatus,
    previewUrl,
    previewUrlWithToken,
    error: previewError,
    loading: previewLoading,
    startPreview,
    stopPreview,
  } = useDaytonaPreview({
    projectId: generatedProjectId,
    files: generationResult?.projectStructure?.files || []
  });

  const handleGenerateWebsite = async (layout: LayoutVariant) => {
    setIsGenerating(true);
    setGenerationResult(null);
    
    // Reset preview state
    if (sandboxId) {
      await stopPreview();
    }

    const keywords = [
      ...layout.keywords,
      ...additionalKeywords.split(',').map(k => k.trim()).filter(Boolean)
    ];
    
    const projectId = `layout-test-${layout.id}-${Date.now()}`;
    setGeneratedProjectId(projectId);

    try {
      const response = await fetch('/api/frontend-v2/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: projectId,
          taskType: 'generate_website',
          businessCategory: layout.category,
          keywords: keywords,
          customizations: {
            theme: 'modern',
            layout: 'single-page'
          },
          includePreview: false, // เราจะใช้ Daytona แทน
          includeProjectStructure: true,
          aiSettings: {
            model: 'gpt-5-nano',
            temperature: 1,
            language: 'th'
          },
          metadata: {
            projectId: projectId
          }
        })
      });

      const result = await response.json();
      setGenerationResult(result);
      
      // Auto-start Daytona preview หลังจาก generate สำเร็จ
      if (result.success && result.projectStructure?.files) {
        console.log('🚀 Auto-starting Daytona preview...');
        // รอสักครู่ให้ state update ก่อน
        setTimeout(() => {
          handleCreatePreview();
        }, 500);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationResult({
        success: false,
        error: { message: 'Failed to generate website' }
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCreatePreview = async () => {
    if (!generationResult?.projectStructure?.files) {
      console.error('No files to preview');
      return;
    }
    
    console.log('🚀 Creating Daytona preview...');
    await startPreview();
  };
  
  const handleStopPreview = async () => {
    console.log('🛑 Stopping Daytona preview...');
    await stopPreview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🎨 Layout Variants Tester
          </h1>
          <p className="text-gray-600 mt-2">
            เลือก layout variant เพื่อทดสอบการสร้างเว็บไซต์
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {layoutVariants.map((layout) => (
            <motion.div
              key={layout.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                bg-white rounded-xl shadow-md overflow-hidden cursor-pointer
                border-2 transition-all duration-200
                ${selectedLayout?.id === layout.id 
                  ? 'border-blue-500 ring-4 ring-blue-100' 
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
              onClick={() => setSelectedLayout(layout)}
            >
              <div className={`
                h-32 bg-gradient-to-br flex items-center justify-center
                ${layout.id === 'restaurant-modern' ? 'from-blue-500 to-indigo-600' : ''}
                ${layout.id === 'restaurant-luxury' ? 'from-gray-700 to-amber-600' : ''}
                ${layout.id === 'restaurant-minimal' ? 'from-gray-400 to-stone-500' : ''}
                ${layout.id === 'restaurant-casual' ? 'from-orange-500 to-yellow-500' : ''}
                ${layout.id === 'restaurant' ? 'from-orange-600 to-red-600' : ''}
              `}>
                <span className="text-6xl">{layout.icon}</span>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {layout.name}
                  </h3>
                  {selectedLayout?.id === layout.id && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Variant:</span>
                    <span className="text-gray-700 font-medium">{layout.variant}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Colors:</span>
                    <span className="text-gray-700">{layout.colors}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Vibe:</span>
                    <span className="text-gray-700">{layout.vibe}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 flex-shrink-0">Best For:</span>
                    <span className="text-gray-700">{layout.bestFor}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  {layout.description}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-1">
                  {layout.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Generate Section */}
        <AnimatePresence>
          {selectedLayout && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                สร้างเว็บไซต์ด้วย {selectedLayout.name} Layout
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords เพิ่มเติม (คั่นด้วยเครื่องหมายจุลภาค)
                </label>
                <input
                  type="text"
                  value={additionalKeywords}
                  onChange={(e) => setAdditionalKeywords(e.target.value)}
                  placeholder="เช่น: vegan, organic, cozy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Keywords หลัก: {selectedLayout.keywords.join(', ')}
                </p>
              </div>

              <button
                onClick={() => handleGenerateWebsite(selectedLayout)}
                disabled={isGenerating}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold text-white
                  transition-all duration-200
                  ${isGenerating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังสร้างเว็บไซต์...
                  </span>
                ) : (
                  '🚀 สร้างเว็บไซต์เลย'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {generationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              {generationResult.success ? (
                <div>
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">✅</span>
                    <div>
                      <h3 className="text-2xl font-bold text-green-600">
                        สร้างเว็บไซต์สำเร็จ!
                      </h3>
                      <p className="text-gray-600">
                        สร้างเสร็จใน {generationResult.metadata?.executionTime ? 
                          (generationResult.metadata.executionTime / 1000).toFixed(2) : '?'} วินาที
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {generationResult.files?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">ไฟล์ที่สร้าง</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-600">
                        {generationResult.performance?.totalSize || '0KB'}
                      </div>
                      <div className="text-sm text-gray-600">ขนาดรวม</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-purple-600">
                        {generationResult.result?.blocksGenerated?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Blocks</div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-amber-600">
                        {generationResult.result?.aiContentGenerated ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-gray-600">AI Content</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">รายละเอียด:</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex">
                        <span className="text-gray-600 w-40">Business Category:</span>
                        <span className="text-gray-900 font-medium">
                          {generationResult.result?.businessCategory}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-40">Template Used:</span>
                        <span className="text-gray-900 font-medium">
                          {generationResult.result?.templateUsed}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-40">Blocks:</span>
                        <span className="text-gray-900 font-medium">
                          {generationResult.result?.blocksGenerated?.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {generationResult.files && generationResult.files.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">ไฟล์ที่สร้าง:</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <div className="space-y-1 text-sm font-mono">
                          {generationResult.files.slice(0, 15).map((file: any, index: number) => (
                            <div key={index} className="flex items-center text-gray-700">
                              <span className="text-blue-500 mr-2">📄</span>
                              <span className="flex-1">{file.path}</span>
                              <span className="text-gray-500 text-xs ml-2">
                                {file.size ? `${(file.size / 1024).toFixed(1)}KB` : ''}
                              </span>
                            </div>
                          ))}
                          {generationResult.files.length > 15 && (
                            <div className="text-gray-500 italic">
                              ... และอีก {generationResult.files.length - 15} ไฟล์
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Daytona Preview Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">👀</span>
                      Daytona Preview
                    </h4>

                    {/* Preview Status */}
                    {previewStatus !== 'idle' && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">สถานะ:</span>
                          {previewStatus === 'creating' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              กำลังสร้าง Preview...
                            </span>
                          )}
                          {previewStatus === 'running' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                              พร้อมใช้งาน
                            </span>
                          )}
                          {previewStatus === 'error' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm">
                              ❌ เกิดข้อผิดพลาด
                            </span>
                          )}
                        </div>
                        
                        {sandboxId && (
                          <p className="text-xs text-gray-500 mt-2">
                            Sandbox ID: <code className="bg-gray-100 px-2 py-0.5 rounded">{sandboxId}</code>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Preview URL */}
                    {previewUrlWithToken && previewStatus === 'running' && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">🌐</span>
                          <div className="flex-1">
                            <h5 className="font-semibold text-green-900 mb-2">Preview URL พร้อมใช้งาน!</h5>
                            <a
                              href={previewUrlWithToken}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-medium"
                            >
                              <span className="text-sm break-all">{previewUrl}</span>
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {previewError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">⚠️</span>
                          <div>
                            <h5 className="font-semibold text-red-900 mb-1">Preview Error</h5>
                            <p className="text-sm text-red-700">{previewError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview Actions */}
                    <div className="flex gap-3">
                      {previewStatus === 'idle' && generationResult?.projectStructure?.files && (
                        <button
                          onClick={handleCreatePreview}
                          disabled={previewLoading}
                          className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {previewLoading ? '⏳ กำลังสร้าง...' : '🚀 สร้าง Daytona Preview'}
                        </button>
                      )}
                      
                      {previewStatus === 'creating' && (
                        <div className="flex-1 py-2 px-4 bg-yellow-100 text-yellow-800 font-medium rounded-lg text-center">
                          <span className="inline-flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            กำลังสร้าง Daytona Preview...
                          </span>
                        </div>
                      )}
                      
                      {previewStatus === 'running' && (
                        <>
                          <a
                            href={previewUrlWithToken}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all text-center"
                          >
                            🌐 เปิด Preview ในแท็บใหม่
                          </a>
                          
                          <button
                            onClick={handleStopPreview}
                            disabled={previewLoading}
                            className="py-2 px-4 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            🛑 Stop
                          </button>
                        </>
                      )}
                      
                      {previewStatus === 'error' && (
                        <button
                          onClick={handleCreatePreview}
                          disabled={previewLoading}
                          className="flex-1 py-2 px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🔄 ลองใหม่อีกครั้ง
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      💡 Preview จะถูกสร้างอัตโนมัติหลังจาก generate website สำเร็จ
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">❌</span>
                    <div>
                      <h3 className="text-2xl font-bold text-red-600">
                        การสร้างล้มเหลว
                      </h3>
                      <p className="text-gray-600">
                        {generationResult.error?.message || 'เกิดข้อผิดพลาด'}
                      </p>
                    </div>
                  </div>
                  
                  {generationResult.error?.details && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <pre className="text-sm text-red-800 overflow-auto">
                        {generationResult.error.details}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

