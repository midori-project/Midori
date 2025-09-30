"use client";
import { useState } from "react";

export default function Page() {
  const [files, setFiles] = useState<Record<string,string>|null>(null);
  const [keywords, setKeywords] = useState("fresh,organic,homemade");
  const [loading, setLoading] = useState(false);

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
    <main className="p-6 bg-black min-h-screen">
      <section className="py-16 bg-blue-100">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-blue-800">ยินดีต้อนรับสู่ครัวฟิวชั่นของเรา</h1>
          <p className="mt-4 text-blue-700">สำรวจเมนูจากวัตถุดิบสดใหม่ สไตล์ฟิวชั่นที่คุณจะหลงรัก</p>
          <a className="inline-block mt-6 px-6 py-3 rounded bg-orange-600 text-white">ดูเมนู</a>
        </div>
      </section>
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
            <pre className="whitespace-pre-wrap text-sm text-white bg-gray-900 p-4 rounded overflow-auto">
{Object.entries(files).map(([p,c]) => `/* ${p} */\n${c}\n\n`).join("")}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
