'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { PromptJson } from '@/types/prompt';

interface AutoGenerateOnLoadProps {
  projectId: string;
  promptJson?: PromptJson | null;
  userId?: string;
}

// ดึงค่าแบบยืดหยุ่น รองรับหลายรูปแบบ/ตัวพิมพ์
function getBranding(value: unknown) {
  const v = (value || {}) as any;
  const get = (...paths: string[]) => {
    for (const p of paths) {
      const parts = p.split('.');
      let cur: any = v;
      let ok = true;
      for (const part of parts) {
        if (cur && typeof cur === 'object' && part in cur) {
          cur = cur[part];
        } else {
          ok = false;
          break;
        }
      }
      if (ok && (typeof cur === 'string' || typeof cur === 'number')) return String(cur);
    }
    return undefined;
  };
  return {
    name: get('Name', 'name', 'project.name', 'business.name'),
    business: get('Type', 'business.type', 'project.type'),
    theme: get('Design.Theme', 'design.theme', 'theme'),
    primaryColor: get('Design.PrimaryColor', 'design.primaryColor', 'primaryColor'),
    secondaryColor: get('Design.SecondaryColor', 'design.secondaryColor', 'secondaryColor'),
    background: get('Background', 'background')
  };
}


export default function AutoGenerateOnLoad({ projectId, promptJson, userId }: AutoGenerateOnLoadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedInfo, setGeneratedInfo] = useState<{ fileCount: number; name: string; isExisting?: boolean } | null>(null);
  const [skeleton, setSkeleton] = useState<any | null>(null);
  console.log(skeleton)
  const hasRunRef = useRef(false);
  
  useEffect(() => {
    if (!promptJson || hasRunRef.current) return;
    hasRunRef.current = true;

    const handleGenerateSite = async () => {
      try {
        setIsGenerating(true);
        setError(null);
        const branding = getBranding(promptJson);

        // เช็ค Generation ที่มีอยู่แล้วก่อน
        const checkExistingResponse = await fetch('/api/gensite/check-existing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: projectId,
            userId: userId
          })
        });

        const existingData = await checkExistingResponse.json();
        
        if (checkExistingResponse.ok && existingData.success) {
          // มี Generation อยู่แล้วและมีไฟล์ครบถ้วน ให้ดึงมาแสดง
          console.log('Found existing generation with valid files, loading...');
          console.log(`Files found: ${existingData.data.fileCount}`);
          setSkeleton(existingData.data.files);
          const previewData = {
            files: existingData.data.files,
            projectStructure: existingData.data.projectStructure,
            fileCount: existingData.data.fileCount,
            generatedAt: existingData.data.createdAt,
            generationId: existingData.data.generationId,
            isExisting: true
          };
          localStorage.setItem(`preview_${projectId}`, JSON.stringify(previewData));
          setGeneratedInfo({ 
            fileCount: existingData.data.fileCount, 
            name: existingData.data.projectStructure.name,
            isExisting: true
          });
          try { 
            alert(`โหลดเว็บไซต์ที่มีอยู่แล้ว: ${existingData.data.fileCount} ไฟล์ (Generation ID: ${existingData.data.generationId})`); 
          } catch {}
          setIsGenerating(false);
          return;
        } else {
          // ไม่มี Generation หรือไฟล์ไม่ครบถ้วน
          console.log('No valid existing generation found:', existingData.message || 'Unknown reason');
        }

        // ไม่มี Generation อยู่แล้ว ให้สร้างใหม่
        console.log('No existing generation found, creating new one...');
        const response = await fetch('/api/gensite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            finalJson: promptJson,
            projectId: projectId,
            userId: userId,
            options: {
              framework: 'react',
              styling: 'tailwind',
              typescript: true,
              name: branding.name,
              business: branding.business,
              theme: branding.theme,
              primaryColor: branding.primaryColor,
              secondaryColor: branding.secondaryColor,
              background: branding.background,
            }
          })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          // ตั้งค่าสเกเลตอนด้วยข้อมูลจาก /api/gensite
          setSkeleton(data.data.files);
          const previewData = {
            files: data.data.files,
            projectStructure: data.data.projectStructure,
            fileCount: data.data.fileCount,
            generatedAt: new Date().toISOString(),
            generationId: data.data.generationId // เพิ่ม generationId
          };
          localStorage.setItem(`preview_${projectId}`, JSON.stringify(previewData));
          setGeneratedInfo({ 
            fileCount: data.data.fileCount, 
            name: data.data.projectStructure.name,
            isExisting: false
          });
          // แจ้งเตือนสั้นๆ เพื่อบอกว่ากำลังพร้อมพรีวิว
          try { alert(`สร้างเว็บไซต์สำเร็จ: ${data.data.fileCount} ไฟล์ (Generation ID: ${data.data.generationId})`); } catch {}
        } else {
          setError(data.error || 'เกิดข้อผิดพลาดในการสร้างเว็บไซต์');
          setSkeleton(null);
        }
      } catch (err) {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        setSkeleton(null);
      } finally {
        setIsGenerating(false);
      }
    };

    handleGenerateSite();
  }, [projectId, promptJson, userId]);

  return (
    <div className="w-full">
      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600">กำลังสร้างเว็บไซต์อัตโนมัติ...</div>
      )}
      {generatedInfo && (
        <div className="mt-4 text-sm text-green-700">
          {generatedInfo.isExisting ? 'โหลดเว็บไซต์ที่มีอยู่แล้ว' : 'สร้างสำเร็จแล้ว'} 
          ({generatedInfo.fileCount} ไฟล์) • {generatedInfo.name}
        </div>
      )}
      {error && (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}


