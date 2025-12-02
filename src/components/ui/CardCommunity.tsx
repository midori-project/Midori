"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { HoverDetailCard, HoverDetailCardData } from './hover-detail-card';
import { getProjectsFromDatabase } from '../../app/home/getProjects';

export interface HoverDetailCardGridProps {
  columns?: number;
}

export const CardCommunity: React.FC<HoverDetailCardGridProps> = ({
  columns = 4,
}) => {
  const router = useRouter();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch data on component mount
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectsFromDatabase();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  // ✅ จำกัดให้แสดงแค่ 12 cards ในหน้าโฮม
  const limitedProjects = projects.slice(0, 12);
  
  // Transform database projects to HoverDetailCardData format
  const items: HoverDetailCardData[] = limitedProjects.map((project: any) => {
    // ✅ ปรับปรุง logic ให้รองรับกรณีต่างๆ
    const hasValidPreviewContent = project.previewFile?.content && 
                                   project.previewFile.content.trim().length > 0 &&
                                   (project.previewFile.content.startsWith('http') || 
                                    project.previewFile.content.startsWith('data:'));
    
    const fallbackImage = 'https://coolbackgrounds.imgix.net/219VUMa1SOxASKqCE2OgT4/be1c810344587bd7f6f203337d23602a/ranger-4df6c1b6.png?w=3840&q=60&auto=format,compress';
    
    // ✅ ใช้ยอดไลค์จริงจากฐานข้อมูล
    const likeCount = project.likeCount || 0;
    const likesText = likeCount >= 1000 
      ? `${(likeCount / 1000).toFixed(1)}k likes`
      : `${likeCount} likes`;
    
    return {
      title: project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name,
      subtitle: likesText,
      images: hasValidPreviewContent ? [project.previewFile.content] : [fallbackImage],
      variant: 'home' as const,
      primaryButton: {
        text: "View Details",
        color: "bg-white/90",
        hoverColor: "hover:bg-white",
        textColor: "text-gray-900",
        onClick: () => router.push(`/projects/${project.id}`)
      },
      secondaryButton: {
        text: "Preview",
        color: "bg-blue-600",
        hoverColor: "hover:bg-blue-700",
        textColor: "text-white",
        onClick: () => router.push(`/projects/${project.id}`)
      },
      pills: {
        category: { 
          // ✅ แสดง category หลัก หรือข้อความพิเศษถ้ามีหลาย categories
          text: project.categories?.length > 1 
            ? `${project.categories[0]?.category?.label} +${project.categories.length - 1}`
            : project.categories?.[0]?.category?.label || "General", 
          color: "bg-blue-100", 
          textColor: "text-blue-800" 
        }
      },
      enableAnimations: true,
      // เพิ่ม widthClass และ orientation เพื่อความสม่ำเสมอ
      widthClass: 'w-full',
      orientation: 'horizontal' as const,
    };
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ไม่พบโปรเจคที่มีรูป preview</p>
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

  return (
    // mobile: 1, md: 2, >1640px: 4 (via custom .grid-cols-over-1640 rule)
    <div className={`grid grid-cols-1 md:grid-cols-2 grid-cols-over-1640 gap-6`}>
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
            widthClass={item.widthClass ?? widthClass}
            orientation={item.orientation ?? 'horizontal'}
            variant={item.variant ?? 'home'}
          />
        </div>
      ))}
    </div>
  );
};

