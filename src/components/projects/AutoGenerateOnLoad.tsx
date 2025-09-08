'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { PromptJson } from '@/types/prompt';

interface AutoGenerateOnLoadProps {
  projectId: string;
  promptJson?: PromptJson | null;
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


export default function AutoGenerateOnLoad({ projectId, promptJson }: AutoGenerateOnLoadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedInfo, setGeneratedInfo] = useState<{ fileCount: number; name: string } | null>(null);
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

        const response = await fetch('/api/gensite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            finalJson: promptJson,
            projectId: projectId,
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
            generatedAt: new Date().toISOString()
          };
          localStorage.setItem(`preview_${projectId}`, JSON.stringify(previewData));
          setGeneratedInfo({ fileCount: data.data.fileCount, name: data.data.projectStructure.name });
          // แจ้งเตือนสั้นๆ เพื่อบอกว่ากำลังพร้อมพรีวิว
          try { alert(`สร้างเว็บไซต์สำเร็จ: ${data.data.fileCount} ไฟล์`); } catch {}
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
  }, [projectId, promptJson]);

  return (
    <div className="w-full">
      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600">กำลังสร้างเว็บไซต์อัตโนมัติ...</div>
      )}
      {generatedInfo && (
        <div className="mt-4 text-sm text-green-700">สร้างสำเร็จแล้ว ({generatedInfo.fileCount} ไฟล์) • {generatedInfo.name}</div>
      )}
      {error && (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}


