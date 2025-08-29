// src/libs/services/projectService.ts
// Business service for project-related operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProjectWithPreview {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  previewFile?: {
    id: string;
    content: string | null;
    path: string;
  } | null;
  projectCategories: {
    category: {
      key: string;
      label: string;
    };
  }[];
  createdAt: Date;
}

export async function getPublicProjectsWithPreview(): Promise<ProjectWithPreview[]> {
  try {
    const projects = await prisma.project.findMany({
      where: {
        visibility: 'public',
        previewFileId: { not: null },
      },
      include: {
        previewFile: {
          select: {
            id: true,
            content: true,
            path: true,
          },
        },
        projectCategories: {
          include: {
            category: {
              select: {
                key: true,
                label: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
    });
    
    return projects;
  } catch (error) {
    console.error('Error fetching projects with preview:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
