// src/libs/services/projectLikeService.ts
// Business service for project like operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProjectLikeResult {
  success: boolean;
  isLiked: boolean;
  likeCount: number;
  error?: string;
}

export interface ProjectLikeStatus {
  isLiked: boolean;
  likeCount: number;
}

/**
 * Business Service: Toggle like/unlike สำหรับ Project
 * Hybrid approach: อัปเดตทั้ง ProjectLike table และ likeCount ใน Project
 */
export async function toggleProjectLike(
  projectId: string,
  userId: string
): Promise<ProjectLikeResult> {
  try {
    // ตรวจสอบว่าผู้ใช้ไลค์โปรเจคนี้แล้วหรือยัง
    const existingLike = await prisma.projectLike.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike: ลบการไลค์และลด likeCount
      await prisma.$transaction(async (tx) => {
        // ลบ ProjectLike record
        await tx.projectLike.delete({
          where: {
            id: existingLike.id,
          },
        });

        // ลด likeCount ใน Project
        await tx.project.update({
          where: { id: projectId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      });

      // ดึงข้อมูลใหม่หลังอัปเดต
      const updatedProject = await prisma.project.findUnique({
        where: { id: projectId },
        select: { likeCount: true },
      });

      return {
        success: true,
        isLiked: false,
        likeCount: updatedProject?.likeCount || 0,
      };
    } else {
      // Like: สร้างการไลค์ใหม่และเพิ่ม likeCount
      await prisma.$transaction(async (tx) => {
        // สร้าง ProjectLike record
        await tx.projectLike.create({
          data: {
            projectId,
            userId,
          },
        });

        // เพิ่ม likeCount ใน Project
        await tx.project.update({
          where: { id: projectId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });
      });

      // ดึงข้อมูลใหม่หลังอัปเดต
      const updatedProject = await prisma.project.findUnique({
        where: { id: projectId },
        select: { likeCount: true },
      });

      return {
        success: true,
        isLiked: true,
        likeCount: updatedProject?.likeCount || 1,
      };
    }
  } catch (error) {
    console.error('Error toggling project like:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: 'เกิดข้อผิดพลาดในการจัดการการไลค์',
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Business Service: ดึงสถานะการไลค์ของโปรเจค
 */
export async function getProjectLikeStatus(
  projectId: string,
  userId?: string
): Promise<ProjectLikeStatus> {
  try {
    // ดึงข้อมูลโปรเจคและการไลค์
    const projectData = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        likeCount: true,
        likes: userId ? {
          where: { userId },
          select: { id: true },
          take: 1,
        } : false,
      },
    });

    if (!projectData) {
      return {
        isLiked: false,
        likeCount: 0,
      };
    }

    const isLiked = userId && projectData.likes && projectData.likes.length > 0;

    return {
      isLiked: Boolean(isLiked),
      likeCount: projectData.likeCount,
    };
  } catch (error) {
    console.error('Error getting project like status:', error);
    return {
      isLiked: false,
      likeCount: 0,
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Business Service: ดึงโปรเจคที่ผู้ใช้ไลค์
 */
export async function getUserLikedProjects(userId: string) {
  try {
    const likedProjects = await prisma.projectLike.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            categories: {
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
            previewFile: {
              select: {
                id: true,
                content: true,
                path: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return likedProjects.map(like => like.project);
  } catch (error) {
    console.error('Error fetching user liked projects:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Utility: ซิงค์ likeCount จากจำนวน ProjectLike จริง (สำหรับ maintenance)
 */
export async function syncProjectLikeCounts() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    for (const project of projects) {
      const actualLikeCount = project._count.likes;
      
      if (project.likeCount !== actualLikeCount) {
        await prisma.project.update({
          where: { id: project.id },
          data: { likeCount: actualLikeCount },
        });
      }
    }

    console.log('Project like counts synced successfully');
  } catch (error) {
    console.error('Error syncing project like counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}
