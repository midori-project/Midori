"use client";
import { useState } from "react";

export default function Page() {
  const [files, setFiles] = useState<Record<string,string>|null>(null);
  const [keywords, setKeywords] = useState("fresh,organic,homemade");
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const gen = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/generate?keywords=${encodeURIComponent(keywords)}`);
      const data = await res.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Error generating:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Navbar Spacer */}
      <div className="h-16"></div>


      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Template Generator</h1>
          
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Keywords (comma-separated):
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="fresh,organic,homemade"
              className="w-full px-3 py-2 rounded border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={gen} 
            disabled={loading}
            className="px-6 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {files && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-4">Generated Files:</h2>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-white">
{Object.entries(files || {}).map(([p,c]) => `/* ${p} */\n${c}\n\n`).join("")}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
