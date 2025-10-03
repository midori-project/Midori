"use client";
import { useState } from "react";

interface GenerationResult {
  files: Record<string, string>;
  businessCategory: string;
  concreteManifest: {
    businessCategoryId: string;
    totalBlocks: number;
    appliedOverrides: string[];
  };
  appliedOverrides: string[];
  processingTime: number;
  validationResults?: {
    isValid: boolean;
    errors: any[];
    warnings: any[];
    summary: {
      totalFields: number;
      validFields: number;
      errorFields: number;
      warningFields: number;
      successRate: number;
    };
  };
}

export default function Page() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [keywords, setKeywords] = useState("restaurant,food,thai");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const businessCategories = [
    { id: "restaurant", name: "Restaurant", description: "ร้านอาหารและบริการอาหาร" },
    { id: "ecommerce", name: "E-commerce", description: "ร้านค้าออนไลน์" },
    { id: "portfolio", name: "Portfolio", description: "ผลงานและงานสร้างสรรค์" },
    { id: "healthcare", name: "Healthcare", description: "บริการสุขภาพและการแพทย์" }
  ];

  const gen = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/generate?keywords=${encodeURIComponent(keywords)}`);
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error generating:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Fixed Navbar Spacer */}
      <div className="h-16"></div>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 Shared Blocks + Override System
            </h1>
            <p className="text-gray-300 text-lg">
              Generate websites using reusable shared blocks with business category overrides
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Keywords (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="restaurant,food,thai"
                    className="w-full px-3 py-2 rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Business Category:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Auto-detect from keywords</option>
                    {businessCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} - {cat.description}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={gen} 
                  disabled={loading}
                  className="w-full px-6 py-3 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? "Generating..." : "Generate Website"}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Generated Website</h2>
              
              {result ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Business Category:</h3>
                    <p className="text-white font-semibold capitalize">{result.businessCategory}</p>
                  </div>

                  <div className="bg-gray-700 rounded p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Concrete Manifest:</h3>
                    <div className="space-y-1 text-sm text-white">
                      <div>Total Blocks: {result.concreteManifest.totalBlocks}</div>
                      <div>Applied Overrides: {result.concreteManifest.appliedOverrides.length}</div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Processing Time:</h3>
                    <p className="text-white text-sm">{result.processingTime}ms</p>
                  </div>

                  <div className="bg-gray-700 rounded p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Validation Results:</h3>
                    {result.validationResults ? (
                      <div className="space-y-1 text-sm">
                        <div className={`flex items-center gap-2 ${result.validationResults.isValid ? 'text-green-400' : 'text-red-400'}`}>
                          <span>{result.validationResults.isValid ? '✓' : '✗'}</span>
                          <span>
                            {result.validationResults.isValid ? 'Valid' : 'Invalid'} 
                            ({result.validationResults.summary.successRate.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="text-gray-300">
                          {result.validationResults.summary.validFields}/{result.validationResults.summary.totalFields} fields valid
                        </div>
                        {result.validationResults.errors.length > 0 && (
                          <div className="text-red-400 text-xs">
                            {result.validationResults.errors.length} errors
                          </div>
                        )}
                        {result.validationResults.warnings.length > 0 && (
                          <div className="text-yellow-400 text-xs">
                            {result.validationResults.warnings.length} warnings
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No validation data</p>
                    )}
                  </div>

                  <div className="bg-gray-700 rounded p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Applied Overrides:</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.appliedOverrides.map((override, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          {override}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded p-3">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Generated Files:</h3>
                    <div className="space-y-2">
                      {Object.keys(result.files).map((filename) => (
                        <div key={filename} className="flex items-center justify-between">
                          <span className="text-white text-sm">{filename}</span>
                          <span className="text-green-400 text-xs">✓ Generated</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Enter keywords and click "Generate Website" to see results
                </div>
              )}
            </div>
          </div>

          {/* Generated Code Display */}
          {result && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Generated Code:</h2>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-white">
{Object.entries(result.files).map(([filename, content]) => `/* ${filename} */\n${content}\n\n`).join("")}
                </pre>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🧩</div>
              <h3 className="text-lg font-semibold text-white mb-2">Shared Blocks</h3>
              <p className="text-gray-300 text-sm">
                Reusable components that can be customized for different business types
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Override System</h3>
              <p className="text-gray-300 text-sm">
                Flexible customization system for adapting shared blocks to specific needs
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-lg font-semibold text-white mb-2">Business Categories</h3>
              <p className="text-gray-300 text-sm">
                Pre-configured manifests for different industries and use cases
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
