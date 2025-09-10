"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HoverDetailCard, HoverDetailCardData } from './hover-detail-card';
import { UserProject } from '@/libs/services/projectService';

export interface CardWorkspaceClientProps {
  projects: UserProject[];
  columns?: number;
  showLimited?: boolean; // เพิ่ม prop สำหรับแสดงแค่ 1 แถว
  showPagination?: boolean; // เพิ่ม prop สำหรับแสดง pagination
}

export const CardWorkspaceClient: React.FC<CardWorkspaceClientProps> = ({
  projects,
  columns = 4,
  showLimited = false, // default ไม่จำกัด
  showPagination = false, // default ไม่แสดง pagination
}) => {
  const router = useRouter();
  // State สำหรับ pagination
  const [visibleRows, setVisibleRows] = useState(3); // เริ่มต้นแสดง 3 แถว

  // Transform UserProject to HoverDetailCardData format (same as CardCommunity)
  const items: HoverDetailCardData[] = projects.map((project) => {
    // ✅ ปรับปรุง logic ให้รองรับกรณีต่างๆ (same logic as CardCommunity)
    const hasValidPreviewContent = project.preview_file && 
                                   project.preview_file.trim().length > 0 &&
                                   (project.preview_file.startsWith('http') || 
                                    project.preview_file.startsWith('data:'));
    
    const fallbackImage = 'https://coolbackgrounds.imgix.net/219VUMa1SOxASKqCE2OgT4/be1c810344587bd7f6f203337d23602a/ranger-4df6c1b6.png?w=3840&q=60&auto=format,compress';

    // ✅ ใช้ยอดไลค์จริงจากฐานข้อมูล
    const likeCount = project.likeCount || 0;
    const likesText = likeCount >= 1000 
      ? `${(likeCount / 1000).toFixed(1)}k likes`
      : `${likeCount} likes`;

    return {
      title: project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name,
      subtitle: likesText,
      images: hasValidPreviewContent ? [project.preview_file!] : [fallbackImage],
      variant: 'workspace' as const,
      primaryButton: {
        text: "detail",
        color: "bg-white/90",
        hoverColor: "hover:bg-white",
        textColor: "text-gray-900"
      },
      secondaryButton: {
        text: "preview",
        color: "bg-blue-600",
        hoverColor: "hover:bg-blue-700",
        textColor: "text-white"
      },
      pills: {
        category: { 
          // ✅ แสดง category หลัก หรือข้อความพิเศษถ้ามีหลาย categories (same logic as CardCommunity)
          text: project.categories?.length > 1 
            ? `${project.categories[0]?.category?.name} +${project.categories.length - 1}`
            : project.categories?.[0]?.category?.name || "General", 
          color: "bg-blue-100", 
          textColor: "text-blue-800" 
        }
      },
      enableAnimations: true,
      // เพิ่ม widthClass และ orientation เหมือน CardCommunity
      widthClass: 'w-full',
      orientation: 'horizontal' as const,
      // เพิ่ม onClick handlers
      onPrimaryClick: () => {
        router.push(`/projects/${project.id}`);
      },
      onSecondaryClick: () => {
        // TODO: เพิ่ม preview functionality
        console.log('Preview project:', project.id);
      },
    };
  });

  // จำกัดจำนวน items ตามโหมดการแสดงผล
  let displayItems = items;
  let hasMoreItems = false;
  
  if (showLimited) {
    // แสดงแค่ 1 แถว
    displayItems = items.slice(0, columns);
    hasMoreItems = false; // ไม่แสดงปุ่ม View More ในโหมด limited
  } else if (showPagination) {
    // แสดงตามจำนวนแถวที่กำหนด (pagination mode)
    const itemsPerPage = visibleRows * columns;
    displayItems = items.slice(0, itemsPerPage);
    hasMoreItems = items.length > itemsPerPage;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">no project</p>
      </div>
    );
  }

  const safeCols = Math.max(1, Math.min(columns, 6));

  // Map columns -> sensible width classes for each card so they align in a column layout.
  // These width classes are tuned for narrow column cards used in the design.
  const widthClassMap: Record<number, string> = {
    1: 'w-full max-w-md',
    2: 'w-64 sm:w-72 md:w-80',
    3: 'w-full max-w-md',
    4: 'w-full max-w-md',
  };

  // Let grid cells control width on responsive layouts; default each card to full width of its cell
  const widthClass = 'w-full';

  // Handler สำหรับปุ่ม View More
  const handleViewMore = () => {
    setVisibleRows(prev => prev + 3); // เพิ่มอีก 3 แถว
  };

  return (
    <div>
      {/* Grid สำหรับ cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 grid-cols-over-1640 gap-6`}>
        {displayItems.map((item, idx) => (
          <div key={idx} className="w-full">
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
              onPrimaryClick={item.onPrimaryClick}
              onSecondaryClick={item.onSecondaryClick}
            />
          </div>
        ))}
      </div>

      {/* View More button สำหรับ pagination mode */}
      {showPagination && hasMoreItems && (
        <div className="mt-8 text-center">
          <button
            onClick={handleViewMore}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            view more ({items.length - displayItems.length} project left)
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
