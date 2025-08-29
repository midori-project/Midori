'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from "next/link";
import Image from "next/image";
import CodePreview from '@/components/preview/CodePreview';
import { GeneratedFile } from '@/types/sitegen';
import { useRouter } from 'next/navigation';

type Props = { 
  params: Promise<{ id: string }>;
};



export default function PreviewPage({ params }: Props) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const generationId = searchParams.get('generationId');
  
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [projectStructure, setProjectStructure] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลดข้อมูลโปรเจค
  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${resolvedParams.id}`);
        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
        } else {
          setError('ไม่พบโปรเจค');
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setError('เกิดข้อผิดพลาดในการโหลดโปรเจค');
      }
    };

    loadProject();
  }, [resolvedParams.id]);

  // ติดตามสถานะการสร้างไซต์
  useEffect(() => {
    if (!generationId) {
      setError('ไม่พบ Generation ID');
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        console.log('=== Checking generation status ===');
        console.log('Generation ID:', generationId);
        console.log('URL:', `/api/gensite?id=${generationId}`);
        
        const response = await fetch(`/api/gensite?id=${generationId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to check generation status');
        }

        const data = await response.json();
        
        if (data.success) {
          // ตรวจสอบสถานะจาก message
          const isCompleted = data.files && data.files.length > 0;
          const isFailed = data.message.includes('เกิดข้อผิดพลาด') || data.message.includes('failed');
          
          if (isCompleted) {
            setFiles(data.files);
            setProjectStructure(data.projectStructure);
            setLoading(false);
          } else if (isFailed) {
            setError(data.message || 'เกิดข้อผิดพลาดในการสร้างเว็บไซต์');
            setLoading(false);
          } else {
            // ยังไม่เสร็จ ให้เช็คอีกครั้งใน 2 วินาที
            setTimeout(checkStatus, 2000);
          }
        } else {
          setError(data.message || 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        setLoading(false);
      }
    };

    checkStatus();
  }, [generationId]);

  if (error) {
    return (
      <div className="relative w-full min-h-screen">
        <Image
          src="/img/background_home.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute left-4 top-4 z-50">
          <div aria-label="Midori home" className="flex items-center gap-3">
            <Image src="/img/logo.png" alt="Midori" width={56} height={56} />
            <span className="text-black font-semibold leading-none tracking-tight drop-shadow-sm text-base sm:text-lg md:text-2xl">
              Midori
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-green-300/50" aria-hidden="true" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/90 backdrop-blur rounded-xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/info/${resolvedParams.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-medium rounded-full hover:bg-emerald-600 transition-colors"
            >
              ← กลับไปหน้า Info
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative w-full min-h-screen">
        <Image
          src="/img/background_home.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute left-4 top-4 z-50">
          <div aria-label="Midori home" className="flex items-center gap-3">
            <Image src="/img/logo.png" alt="Midori" width={56} height={56} />
            <span className="text-black font-semibold leading-none tracking-tight drop-shadow-sm text-base sm:text-lg md:text-2xl">
              Midori
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-green-300/50" aria-hidden="true" />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/90 backdrop-blur rounded-xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">กำลังสร้างเว็บไซต์</h1>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">กำลังสร้างเว็บไซต์จากข้อมูลที่คุณให้มา...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                กรุณารอสักครู่...
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen">
      <Image
        src="/img/background_home.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute left-4 top-4 z-50">
        <div aria-label="Midori home" className="flex items-center gap-3">
          <Image src="/img/logo.png" alt="Midori" width={56} height={56} />
          <span className="text-black font-semibold leading-none tracking-tight drop-shadow-sm text-base sm:text-lg md:text-2xl">
            Midori
          </span>
        </div>
      </div>
      <div className="absolute inset-0 bg-green-300/50" aria-hidden="true" />
      <div className="relative z-10 p-4 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                พรีวิวโค้ดเว็บไซต์
              </h1>
              <p className="text-gray-600">
                โปรเจค: {project?.name || 'ไม่ระบุชื่อ'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/info/${resolvedParams.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← กลับไปหน้า Info
              </Link>
            </div>
          </div>

          {/* Code Preview */}
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-xl overflow-hidden">
            <div className="h-[80vh]">
              <CodePreview 
                files={files} 
                projectStructure={projectStructure} 
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{files.length}</div>
              <div className="text-sm text-gray-600">ไฟล์ทั้งหมด</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {files.filter(f => f.type === 'component').length}
              </div>
              <div className="text-sm text-gray-600">Components</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {files.filter(f => f.type === 'page').length}
              </div>
              <div className="text-sm text-gray-600">Pages</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {projectStructure?.framework || 'Next.js'}
              </div>
              <div className="text-sm text-gray-600">Framework</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
