// app/preview/daytona/page.tsx
"use client"

import * as React from 'react'
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview'
import testCafeData from '@/components/preview/test/test-cafe-complete.json'

export default function DaytonaPreviewPage() {
  // Mock Project ID และใช้ไฟล์จาก test-cafe-complete.json โดยตรง
  const mockProjectId = "mock-project-123"
  const projectName = testCafeData.projectStructure.name
  
  // แปลงไฟล์จาก JSON เป็นรูปแบบที่ API ต้องการ
  const templateFiles = React.useMemo(() => {
    return testCafeData.files.map((f: any) => ({
      path: f.path,
      content: f.content,
      type: f.type || f.language,
    }))
  }, [])
  
  const {
    sandboxId,
    status,
    previewUrlWithToken, // มีโทเคนใน query (เหมาะเปิดในแท็บใหม่)
    error,
    loading,
    startPreview,
    stopPreview,
    updateFiles,
  } = useDaytonaPreview({ 
    projectId: mockProjectId,
    files: templateFiles 
  })

  // State สำหรับการทดสอบอัปเดตไฟล์
  const [updateResult, setUpdateResult] = React.useState<string>('')
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Log ข้อมูลเมื่อโหลดหน้า
  React.useEffect(() => {
    console.log(`✅ Loaded ${templateFiles.length} files from test-cafe-complete.json`)
    console.log(`📦 Project: ${projectName}`)
  }, [templateFiles.length, projectName])

  // ฟังก์ชันสำหรับทดสอบ File Comparison
  const testFileComparison = React.useCallback(async () => {
    if (!updateFiles || status !== 'running') {
      setUpdateResult('❌ No active sandbox to test')
      return
    }

    setIsUpdating(true)
    setUpdateResult('🔄 Testing file comparison...')

    try {
      // สร้างไฟล์ที่มีการเปลี่ยนแปลงและไม่เปลี่ยนแปลง
      const testFiles = [
        {
          path: 'src/pages/Home.tsx',
          content: `import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen p-8 bg-orange-50">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 text-red-600">
          🎉 Welcome to Café Delight - COMPARISON TEST!
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          This file was changed to test file comparison
        </p>
      </div>
    </div>
  );
};

export default Home;`,
          type: 'typescript'
        },
        {
          path: 'src/index.css',
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 16px;
    line-height: 1.5;
    color: #3a3a3a;
    background-color: #fffaf0;
  }
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg text-white bg-orange-600 hover:bg-orange-500 transition duration-300 ease-in-out;
  }
  
  /* This file was NOT changed - should be skipped */
}`,
          type: 'css'
        }
      ]

      const result = await updateFiles(testFiles)
      
      if (result?.success) {
        const message = `🧪 File Comparison Test: Updated ${result.updatedFiles} files, skipped ${result.skippedFiles} unchanged files!`
        setUpdateResult(message)
      } else {
        setUpdateResult(`❌ Comparison test failed: ${result?.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      setUpdateResult(`❌ Comparison test error: ${error?.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }, [updateFiles, status])

  // ฟังก์ชันสำหรับทดสอบการอัปเดตไฟล์
  const testUpdateFiles = React.useCallback(async () => {
    if (!updateFiles || status !== 'running') {
      setUpdateResult('❌ No active sandbox to update')
      return
    }

    setIsUpdating(true)
    setUpdateResult('🔄 Updating files...')

    try {
      // สร้างไฟล์ทดสอบที่มีการเปลี่ยนแปลง
      const testFiles = [
        {
          path: 'src/pages/Home.tsx',
          content: `import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen p-8 bg-orange-50">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 text-red-600">
          🎉 Welcome to Café Delight - UPDATED!
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Experience the finest dining with our delicious menu and warm atmosphere
          <br />
          <span className="text-sm text-blue-600 font-semibold">
            ✨ This page was updated via API!
          </span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-orange-600">Our Menu</h2>
            <p className="text-gray-600 mb-4">
              Discover our carefully crafted dishes made with fresh, local ingredients
            </p>
            <Link to="/menu" className="btn">
              View Menu
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-orange-600">Make a Reservation</h2>
            <p className="text-gray-600 mb-4">
              Book your table for a memorable dining experience
            </p>
            <Link to="/reservation" className="btn">
              Reserve Table
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-orange-600">Meet Our Chef</h2>
            <p className="text-gray-600 mb-4">
              Learn about our passionate chef and culinary philosophy
            </p>
            <Link to="/chef-profile" className="btn">
              Chef Profile
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4 text-orange-600">Special Offers</h2>
          <p className="text-lg text-gray-700 mb-6">
            Join us for happy hour every day from 4-6 PM with 20% off on selected drinks
          </p>
          <Link to="/menu" className="btn text-lg px-8 py-3">
            Explore Offers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;`,
          type: 'typescript'
        },
        {
          path: 'src/index.css',
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 16px;
    line-height: 1.5;
    color: #3a3a3a;
    background-color: #fffaf0;
  }
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 600;
  }
  p {
    margin: 0;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg text-white bg-orange-600 hover:bg-orange-500 transition duration-300 ease-in-out;
  }
  .card {
    @apply bg-white shadow-md rounded-lg p-6 mb-4;
  }
  .header {
    @apply bg-orange-600 text-white p-4;
  }
  .footer {
    @apply bg-gray-200 text-gray-700 p-4 text-center;
  }
  
  /* ✨ NEW: Updated styles for testing */
  .btn:hover {
    @apply transform scale-105 shadow-lg;
  }
}

@layer utilities {
  .text-warm-orange {
    color: #ff6f20;
  }
  .bg-warm-orange {
    background-color: #ff6f20;
  }
  
  /* ✨ NEW: Animation utilities */
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @screen sm {
    .container {
      @apply max-w-sm mx-auto;
    }
  }
  @screen md {
    .container {
      @apply max-w-md mx-auto;
    }
  }
  @screen lg {
    .container {
      @apply max-w-lg mx-auto;
    }
  }
  @screen xl {
    .container {
      @apply max-w-xl mx-auto;
    }
  }
}`,
          type: 'css'
        }
      ]

      const result = await updateFiles(testFiles)
      
      if (result?.success) {
        const message = result.skippedFiles > 0 
          ? `✅ Updated ${result.updatedFiles} files, skipped ${result.skippedFiles} unchanged files! Check the preview to see changes.`
          : `✅ Successfully updated ${result.updatedFiles} files! Check the preview to see changes.`
        setUpdateResult(message)
      } else {
        setUpdateResult(`❌ Update failed: ${result?.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      setUpdateResult(`❌ Update error: ${error?.message || 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }, [updateFiles, status])

  // ถ้าคุณทำ sandbox เป็น public: ใช้ previewUrlPublic แทน (ไม่มี token)
  // ณ ที่นี้เราจะใช้ previewUrlWithToken ไปก่อน แต่ **แนะนำ** ให้ฝัง iframe เฉพาะกรณี public
  const iframeSrc = previewUrlWithToken

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Daytona Preview</h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={startPreview}
            disabled={loading || status === 'running' || templateFiles.length === 0}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
          >
            {status === 'running' ? 'Running' : loading ? 'Starting...' : 'Start Preview'}
          </button>

          <button
            onClick={stopPreview}
            disabled={loading || status !== 'running'}
            className="px-4 py-2 rounded-lg bg-rose-600 text-white disabled:opacity-50"
          >
            Stop Preview
          </button>

          <button
            onClick={testUpdateFiles}
            disabled={loading || status !== 'running' || isUpdating}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Test Update Files'}
          </button>

          <button
            onClick={testFileComparison}
            disabled={loading || status !== 'running' || isUpdating}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50"
          >
            {isUpdating ? 'Testing...' : 'Test File Comparison'}
          </button>

          <span className="px-3 py-2 rounded-lg bg-neutral-200 text-neutral-700">
            Status: {status}
          </span>
        </div>


        <div className="bg-white p-4 rounded-lg border border-neutral-200 space-y-2">
          <h2 className="font-semibold text-neutral-800 mb-2">📦 Project Information</h2>
          <div className="text-sm text-neutral-600 space-y-1">
            <div>Project ID: <code className="font-mono">{mockProjectId}</code></div>
            <div>Project Name: <code className="font-mono">{projectName}</code></div>
            <div>Type: <code className="font-mono">{testCafeData.projectStructure.type}</code></div>
            <div>Description: <span className="text-neutral-500">{testCafeData.projectStructure.description}</span></div>
            <div>Files Ready: <code className="font-mono bg-green-100 text-green-700 px-2 py-1 rounded">{templateFiles.length} files</code></div>
          </div>
        </div>

        {/* แสดงรายการไฟล์ */}
        <details className="bg-white p-4 rounded-lg border border-neutral-200">
          <summary className="font-semibold text-neutral-800 cursor-pointer">📁 Files Preview ({templateFiles.length} files)</summary>
          <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
            {templateFiles.map((file, index) => (
              <div key={index} className="text-xs text-neutral-600 font-mono py-1 px-2 hover:bg-neutral-50 rounded">
                <span className="text-blue-600">{file.path}</span>
                <span className="text-neutral-400 ml-2">({file.type})</span>
              </div>
            ))}
          </div>
        </details>

        {/* คำอธิบายการใช้งานฟีเจอร์อัปเดต */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <h2 className="font-semibold text-neutral-800 mb-2">🔄 File Update Testing</h2>
          <div className="text-sm text-neutral-600 space-y-2">
            <p>
              <strong>วิธีทดสอบ:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>คลิก <span className="font-mono bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Start Preview</span> เพื่อสร้าง sandbox</li>
              <li>รอให้สถานะเป็น <span className="font-mono bg-green-100 text-green-700 px-2 py-1 rounded">running</span></li>
              <li>คลิก <span className="font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">Test Update Files</span> เพื่อทดสอบการอัปเดตปกติ</li>
              <li>คลิก <span className="font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded">Test File Comparison</span> เพื่อทดสอบระบบเปรียบเทียบไฟล์</li>
              <li>ดูการเปลี่ยนแปลงใน iframe หรือเปิดแท็บใหม่</li>
            </ol>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>🧪 File Comparison Test:</strong> จะทดสอบการเปรียบเทียบไฟล์โดยส่งไฟล์ที่มีการเปลี่ยนแปลงและไม่เปลี่ยนแปลง 
                ระบบจะอัปเดตเฉพาะไฟล์ที่เปลี่ยนแปลงและข้ามไฟล์ที่ไม่เปลี่ยนแปลง
              </p>
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              <strong>หมายเหตุ:</strong> การทดสอบจะอัปเดตไฟล์ <code>src/pages/Home.tsx</code> และ <code>src/index.css</code> 
              ด้วยเนื้อหาที่มีข้อความ "UPDATED!" และเอฟเฟกต์ hover ใหม่
            </p>
          </div>
        </div>

        {sandboxId && (
          <div className="text-sm text-neutral-600">
            Sandbox ID: <code className="font-mono">{sandboxId}</code>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {updateResult && (
          <div className={`p-3 rounded-lg border ${
            updateResult.includes('✅') 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : updateResult.includes('❌')
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-blue-100 text-blue-700 border-blue-200'
          }`}>
            <h3 className="font-semibold mb-1">🔄 Update Test Result:</h3>
            <p className="text-sm">{updateResult}</p>
          </div>
        )}

        {iframeSrc && status === 'running' && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {/* เปิดในแท็บใหม่: เหมาะสำหรับ private เพื่อให้เบราว์เซอร์ตั้งคุกกี้ first-party */}
              <a
                href={iframeSrc}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Open Preview in New Tab
              </a>

              <code className="text-xs bg-neutral-200 px-2 py-1 rounded break-all">
                {iframeSrc}
              </code>
            </div>

            <div className="mt-4 border rounded-lg overflow-hidden bg-white">
              <iframe
                key={iframeSrc} // reload เมื่อ URL เปลี่ยน
                src={iframeSrc}
                title="Daytona Preview"
                className="w-full h-[70vh]"
                // ถ้าเป็น public preview การตั้งค่าด้านล่างก็พอใช้ได้
                // ถ้าเป็น private + ต้องฝังจริง แนะนำทำ proxy ฝั่งเซิร์ฟเวอร์แทน
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="no-referrer"
                allow="clipboard-read; clipboard-write"
                loading="lazy"
              />
            </div>

          </>
        )}
      </div>
    </div>
  )
}
