'use client';

import React, { useState } from 'react';
import AutoGenerateOnLoad from '@/components/projects/AutoGenerateOnLoad';
import SitePreview from '@/components/projects/SitePreview';
import { ProjectGenerationLoading } from '@/components/projects/ProjectGenerationLoading';
import type { PromptJson } from '@/types/prompt';

interface ProjectPageClientProps {
  projectId: string;
  promptJson?: PromptJson | null;
}

export const ProjectPageClient: React.FC<ProjectPageClientProps> = ({
  projectId,
  promptJson
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // ดึงชื่อโปรเจคจาก promptJson
  const getProjectName = () => {
    if (!promptJson) return "โปรเจคของคุณ";
    
    // ลองดึงชื่อจากหลายที่ที่เป็นไปได้
    const data = promptJson as any;
    return data?.Name || 
           data?.name || 
           data?.project?.name || 
           data?.business?.name || 
           "โปรเจคของคุณ";
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {promptJson ? (
        <>
          {/* แสดง Loading State เมื่อกำลัง Generate */}
          {isGenerating ? (
            <ProjectGenerationLoading 
              projectName={getProjectName()}
              currentStep=""
            />
          ) : (
            <div className="space-y-6">
              {/* SandPack Preview */}
              <SitePreview projectId={projectId} />
            </div>
          )}
          
          {/* AutoGenerateOnLoad ทำงานใน background */}
          <AutoGenerateOnLoad 
            projectId={projectId}
            promptJson={promptJson}
            onLoadingChange={setIsGenerating}
          />
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">ไม่พบข้อมูล promptJson สำหรับโปรเจคนี้</p>
          <p className="text-sm text-yellow-600 mt-1">
            อาจเป็นเพราะโปรเจคยังไม่ได้ผ่านขั้นตอนการสร้างเนื้อหา
          </p>
        </div>
      )}
    </div>
  );
};
