'use client';

import React from 'react';
import { GeneratedFile } from '@/types/sitegen';
import LovablePreview from './LovablePreview';
import PreviewErrorBoundary from './PreviewErrorBoundary';

interface PreviewLayoutProps {
  files: GeneratedFile[];
  projectStructure: any;
  isGenerating: boolean;
}

const PreviewLayout: React.FC<PreviewLayoutProps> = ({
  files,
  projectStructure,
  isGenerating
}) => {
  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังสร้างเว็บไซต์...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ยังไม่มีเว็บไซต์ที่สร้าง
          </h3>
          <p className="text-gray-500">
            กดปุ่ม "สร้างเว็บ" เพื่อเริ่มสร้างเว็บไซต์จาก conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <PreviewErrorBoundary>
      <LovablePreview 
        files={files} 
        projectStructure={projectStructure} 
      />
    </PreviewErrorBoundary>
  );
};

export default PreviewLayout;
