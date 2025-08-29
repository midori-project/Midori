import React from 'react';
import { HoverDetailCard, HoverDetailCardData } from './hover-detail-card';

export interface HoverDetailCardGridProps {
  columns?: number;
}

// Helper function to generate mock likes count
function generateMockLikes(): string {
  const likes = Math.floor(Math.random() * 5000) + 100;
  if (likes >= 1000) {
    return `${(likes / 1000).toFixed(1)}k likes`;
  }
  return `${likes} likes`;
}

// Server action to fetch projects from database
async function getProjectsFromDatabase() {
  "use server";
  
  try {
    // Import the Prisma client from the correct path
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    const projects = await prisma.project.findMany({
      where: {
        visibility: 'public',
        NOT: {
          previewFileId: null,
        },
      },
      include: {
        previewFile: true,
        projectCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
    });

    await prisma.$disconnect();
    return projects;
  } catch (error) {
    console.error('Error fetching projects from database:', error);
    return [];
  }
}

export const CardCommunity: React.FC<HoverDetailCardGridProps> = async ({
  columns = 4,
}) => {
  // Fetch real data from database
  const projects = await getProjectsFromDatabase();
  
  // Transform database projects to HoverDetailCardData format
  const items: HoverDetailCardData[] = projects.map((project: any) => ({
    title: project.name,
    subtitle: generateMockLikes(),
    images: project.previewFile?.content ? [project.previewFile.content] : ['https://via.placeholder.com/300.png'],
    primaryButton: {
      text: "View Details",
      color: "bg-white/90",
      hoverColor: "hover:bg-white",
      textColor: "text-gray-900"
    },
    secondaryButton: {
      text: "Preview",
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      textColor: "text-white"
    },
    pills: {
      left: { 
        text: project.projectCategories?.[0]?.category?.label || "General", 
        color: "bg-blue-100", 
        textColor: "text-blue-800" 
      },
      sparkle: { show: true, color: "bg-purple-100 text-purple-800" },
      right: { 
        text: "Published", 
        color: "bg-green-100", 
        textColor: "text-green-800" 
      }
    },
    enableAnimations: true,
  }));

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ไม่พบโปรเจคที่มีรูป preview</p>
      </div>
    );
  }

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
        <div key={idx} className="">
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
          />
        </div>
      ))}
    </div>
  );
};

