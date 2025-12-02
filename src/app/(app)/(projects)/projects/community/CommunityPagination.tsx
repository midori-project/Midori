'use client';

import { useState } from 'react';
import { HoverDetailCard, HoverDetailCardData } from '@/components/ui/hover-detail-card';
import { getPublicProjectsPaginated, GetPublicProjectsResult } from './actions';
import type { ProjectWithPreview } from '@/libs/services/projectService';

interface CommunityPaginationProps {
  initialData: GetPublicProjectsResult;
}

export function CommunityPagination({ initialData }: CommunityPaginationProps) {
  const [allProjects, setAllProjects] = useState(initialData.data?.projects || []);
  const [paginationState, setPaginationState] = useState(initialData.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    if (loading || !paginationState.hasNextPage) return;

    setLoading(true);
    try {
      const nextPage = paginationState.currentPage + 1;
      const result = await getPublicProjectsPaginated({ page: nextPage, limit: 12 });
      
      if (result.success && result.data) {
        // เพิ่มโปรเจคใหม่เข้าไปในรายการที่มีอยู่
        setAllProjects(prev => [...prev, ...result.data!.projects]);
        
        // อัปเดต pagination state
        setPaginationState(result.data.pagination);
      }
    } catch (error) {
      console.error('Error loading more projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!initialData.success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-[#0B2604]/60 mb-4">
          {initialData.error || 'ไม่สามารถโหลดโปรเจคได้ กรุณาลองใหม่อีกครั้ง'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  // Transform projects to HoverDetailCardData format
  const items: HoverDetailCardData[] = allProjects.map((project: ProjectWithPreview) => {
    const hasValidPreviewContent = project.previewFile?.content && 
                                   project.previewFile.content.trim().length > 0 &&
                                   (project.previewFile.content.startsWith('http') || 
                                    project.previewFile.content.startsWith('data:'));
    
    const fallbackImage = 'https://coolbackgrounds.imgix.net/219VUMa1SOxASKqCE2OgT4/be1c810344587bd7f6f203337d23602a/ranger-4df6c1b6.png?w=3840&q=60&auto=format,compress';
    
    const likeCount = project.likeCount || 0;
    const likesText = likeCount >= 1000 
      ? `${(likeCount / 1000).toFixed(1)}k likes`
      : `${likeCount} likes`;
    
    // ✅ ตรวจสอบและแปลง images ให้เป็น string[] เสมอ
    const imageUrl = hasValidPreviewContent && project.previewFile?.content 
      ? project.previewFile.content 
      : fallbackImage;
    
    return {
      title: project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name,
      subtitle: likesText,
      images: [imageUrl], // ✅ เป็น string[] แน่นอน
      variant: 'home' as const,
      primaryButton: {
        text: "ดูรายละเอียด",
        color: "bg-white/90",
        hoverColor: "hover:bg-white",
        textColor: "text-gray-900"
      },
      secondaryButton: {
        text: "ดูตัวอย่าง",
        color: "bg-blue-600",
        hoverColor: "hover:bg-blue-700",
        textColor: "text-white"
      },
      pills: {
        category: { 
          text: project.categories?.length > 1 
            ? `${project.categories[0]?.category?.label} +${project.categories.length - 1}`
            : project.categories?.[0]?.category?.label || "General", 
          color: "bg-blue-100", 
          textColor: "text-blue-800" 
        }
      },
      enableAnimations: true,
      widthClass: 'w-full',
      orientation: 'horizontal' as const,
    };
  });

  return (
    <div className="space-y-8">
      {/* Loading Overlay */}
      {loading && (
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-[#0B2604]">กำลังโหลด...</span>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#0B2604]/60">ไม่พบโปรเจคที่มีรูป preview</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="w-full">
              <HoverDetailCard
                title={item.title}
                subtitle={item.subtitle}
                images={item.images}
                primaryButton={item.primaryButton}
                secondaryButton={item.secondaryButton}
                pills={item.pills}
                enableAnimations={item.enableAnimations}
                widthClass={item.widthClass ?? 'w-full'}
                orientation={item.orientation ?? 'horizontal'}
                variant={item.variant ?? 'home'}
              />
            </div>
          ))}
        </div>
      )}

      {/* View More Button */}
      {paginationState.hasNextPage && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-[#94D133] text-white rounded-lg hover:bg-[#94D133] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังโหลด...
              </>
            ) : (
              <>
                View more
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Info Text */}
      <div className="text-center text-sm text-gray-400 mt-4">
        แสดง {allProjects.length} จากทั้งหมด {paginationState.totalItems} โปรเจค
      </div>
    </div>
  );
}
