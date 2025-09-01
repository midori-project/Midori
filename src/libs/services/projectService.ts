// src/libs/services/projectService.ts
// Business service for project-related operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProjectWithPreview {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  likeCount?: number;
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

export interface CreateProjectData {
  name: string;
  description?: string;
  visibility: 'private' | 'unlisted' | 'public';
  categories?: string[];
  userId: string;
}

export interface CreateProjectResult {
  projectId: string;
}

/**
 * Business Service: สร้าง Project พร้อม Categories
 * Pure business logic + database operations
 */
export async function createProjectWithCategories(
  data: CreateProjectData
): Promise<CreateProjectResult> {
  const { name, description, visibility, categories = [], userId } = data;

  try {
    // 1) สร้าง project
    const project = await prisma.project.create({
      data: {
        name,
        description: description ?? undefined,
        visibility,
        user: { connect: { id: userId } },
      },
      select: { id: true },
    });

    // 2) สร้าง default preview file เพื่อให้แสดงใน CardCommunity
    const defaultPreviewUrl = 'https://coolbackgrounds.imgix.net/219VUMa1SOxASKqCE2OgT4/be1c810344587bd7f6f203337d23602a/ranger-4df6c1b6.png?w=3840&q=60&auto=format,compress';
    
    const previewFile = await prisma.file.create({
      data: {
        projectId: project.id,
        path: `preview-${project.id}.png`,
        type: 'asset',
        isBinary: false,
        content: defaultPreviewUrl,
      },
      select: { id: true },
    });

    // 3) อัปเดต project ให้มี previewFileId
    await prisma.project.update({
      where: { id: project.id },
      data: { previewFileId: previewFile.id },
    });

    // 4) จัดการ categories
    let finalCategories = categories || [];
    
    // ✅ ถ้าไม่มี categories ส่งมา ให้ใช้ default category
    if (finalCategories.length === 0) {
      // ดึง default category แรกจากฐานข้อมูล (เรียงตาม createdAt)
      const defaultCategory = await prisma.category.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { key: true, label: true }
      });
      
      if (defaultCategory) {
        finalCategories = [defaultCategory.label];
      } else {
        // ถ้าไม่มี category ใดๆ ให้สร้าง "General" 
        finalCategories = ["General"];
      }
    }

    if (finalCategories.length > 0) {
      const upserted = await Promise.all(
        finalCategories.map(async (cat: string) => {
          const key = cat.trim().toLowerCase().replace(/\s+/g, '-');
          return (prisma as any).category.upsert({
            where: { key },
            create: { key, label: cat },
            update: { label: cat },
          });
        })
      );

      // สร้าง join rows
      const joinData = upserted.map((c: any) => ({ 
        projectId: project.id, 
        categoryId: c.id 
      }));
      
      await (prisma as any).projectCategory.createMany({ 
        data: joinData, 
        skipDuplicates: true 
      });
    }

    return { projectId: project.id };
  } catch (error) {
    throw new Error(`Failed to create project: ${(error as Error).message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Pagination options interface
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Paginated response interface
export interface PaginatedProjectsResponse {
  projects: ProjectWithPreview[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getPublicProjectsWithPreview(
  options: PaginationOptions = {}
): Promise<PaginatedProjectsResponse> {
  const { page = 1, limit = 12 } = options;
  const skip = (page - 1) * limit;

  try {
    // Count total items for pagination info
    const totalItems = await (prisma as any).project.count({
      where: {
        visibility: 'public',
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Fetch projects with pagination
    const projects = await (prisma as any).project.findMany({
      where: {
        visibility: 'public',
        // ✅ เอาเงื่อนไข previewFileId ออก เพื่อให้โปรเจคใหม่แสดงได้
      },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        likeCount: true,
        createdAt: true,
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
      skip,
      take: limit,
    });
    
    return {
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error('Error fetching projects with preview:', error);
    return {
      projects: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Legacy function for backward compatibility (no pagination)
export async function getPublicProjectsWithPreviewLegacy(): Promise<ProjectWithPreview[]> {
  const response = await getPublicProjectsWithPreview({ page: 1, limit: 50 });
  return response.projects;
}

// User projects paginated response interface
export interface PaginatedUserProjectsResponse {
  projects: UserProject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Business Service: ดึง Projects ของผู้ใช้เฉพาะ พร้อม Preview และ Categories (แบบ Pagination)
 * สำหรับแสดงใน Workspace
 */
export async function getUserProjectsWithPreview(
  userId: string,
  options: PaginationOptions = {}
): Promise<PaginatedUserProjectsResponse> {
  const { page = 1, limit = 12 } = options;
  const skip = (page - 1) * limit;

  try {
    // Count total items for pagination info
    const totalItems = await (prisma as any).project.count({
      where: {
        userId: userId,
      },
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Fetch projects with pagination
    const projects = await (prisma as any).project.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        likeCount: true,
        previewFileId: true,
        createdAt: true,
        updatedAt: true,
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
                id: true,
                key: true,
                label: true,
                meta: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const mappedProjects = projects.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      likeCount: project.likeCount || 0,
      preview_file: project.previewFile?.content || null,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      categories: project.projectCategories.map((pc: any) => ({
        category: {
          id: pc.category.id,
          name: pc.category.label,
          color: (pc.category.meta as { color?: string })?.color || '#3B82F6',
        },
      })),
    }));

    return {
      projects: mappedProjects,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error('Error fetching user projects with preview:', error);
    return {
      projects: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Legacy function for backward compatibility (no pagination)
export async function getUserProjectsWithPreviewLegacy(userId: string): Promise<UserProject[]> {
  const response = await getUserProjectsWithPreview(userId, { page: 1, limit: 100 });
  return response.projects;
}

// Export UserProject interface for use in server actions
export interface UserProject {
  id: string;
  name: string;
  description: string | null;
  likeCount: number;
  preview_file: string | null;
  created_at: Date;
  updated_at: Date;
  categories: {
    category: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}
