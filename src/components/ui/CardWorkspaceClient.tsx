"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { HoverDetailCard, HoverDetailCardData } from './hover-detail-card';
import { UserProject } from '@/libs/services/projectService';

export interface CardWorkspaceClientProps {
  projects: UserProject[];
  columns?: number;
}

export const CardWorkspaceClient: React.FC<CardWorkspaceClientProps> = ({
  projects,
  columns = 4,
}) => {
  const router = useRouter();

  // แปลง UserProject เป็น HoverDetailCardData
  const items: HoverDetailCardData[] = projects.map((project) => {
    // หา category แรกเพื่อแสดง (เหมือน CardCommunity)
    const firstCategory = project.categories?.[0]?.category;

    // ✅ ใช้ยอดไลค์จริงจากฐานข้อมูล
    const likeCount = project.likeCount || 0;
    const likesText = likeCount >= 1000 
      ? `${(likeCount / 1000).toFixed(1)}k likes`
      : `${likeCount} likes`;

    return {
      title: project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name,
      subtitle: likesText,
      images: project.preview_file ? [project.preview_file] : ['/img/frame.png'],
      variant: 'workspace' as const,
      primaryButton: {
        text: 'เปิดโปรเจค',
        color: '#3B82F6',
        hoverColor: '#2563EB',
        textColor: '#FFFFFF',
      },
      secondaryButton: {
        text: 'แก้ไข',
        color: '#6B7280',
        hoverColor: '#4B5563',
        textColor: '#FFFFFF',
      },
      pills: firstCategory ? {
        category: {
          text: firstCategory.name,
          color: firstCategory.color,
          textColor: '#FFFFFF',
        },
      } : undefined,
      enableAnimations: true,
      widthClass: 'w-full',
      orientation: 'vertical' as const,
    };
  });

  const safeCols = Math.max(1, Math.min(columns, 6));

  // Let grid cells control width on responsive layouts; default each card to full width of its cell
  const widthClass = 'w-full';

  const handleCardClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleEditClick = (projectId: string) => {
    router.push(`/projects/${projectId}/edit`);
  };

  return (
    <div>
      {items.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ยังไม่มีโปรเจค
            </h3>
            <p className="text-gray-600">
              เริ่มสร้างโปรเจคแรกของคุณได้เลย!
            </p>
          </div>
        </div>
      ) : (
        // mobile: 1, md: 2, >1640px: 4 (via custom .grid-cols-over-1640 rule)
        <div className={`grid grid-cols-1 md:grid-cols-2 grid-cols-over-1640 gap-6`}>
          {items.map((item, idx) => (
            <div key={projects[idx].id} className="w-full cursor-pointer" onClick={() => handleCardClick(projects[idx].id)}>
              <HoverDetailCard
                title={item.title}
                subtitle={item.subtitle}
                images={item.images}
                primaryButton={item.primaryButton}
                secondaryButton={item.secondaryButton}
                pills={item.pills}
                enableAnimations={item.enableAnimations}
                widthClass={item.widthClass ?? widthClass}
                orientation={item.orientation ?? 'horizontal'}
                variant={item.variant ?? 'workspace'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
