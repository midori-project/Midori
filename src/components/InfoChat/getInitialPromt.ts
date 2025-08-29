"use server"

import { prisma } from "@/libs/prisma/prisma";

export async function getProjectName(projectId: string): Promise<string | null> {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      select: {
        name: true
      }
    });

    return project?.name || null;
  } catch (error) {
    console.error("Error fetching project name:", error);
    return null;
  }
}

export async function getProjectDetails(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      select: {
        id: true,
        name: true,
        description: true,
        options: true,
        visibility: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return project;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
}

export async function saveFinalJsonToGeneration(
  projectId: string,
  userId: string,
  finalJson: Record<string, unknown>,
  sessionId?: string
) {
  try {
    // สร้าง generation ใหม่
    const generation = await prisma.generation.create({
      data: {
        projectId: projectId,
        userId: userId,
        promptJson: finalJson,
        options: {
          sessionId: sessionId,
          source: "info-chat",
          completedAt: new Date().toISOString()
        }
      }
    });

    console.log("บันทึก finalJson ลงในตาราง generation สำเร็จ:", generation.id);
    return generation;
  } catch (error) {
    console.error("Error saving finalJson to generation:", error);
    throw error;
  }
}

export async function getUserIdFromSession(sessionId: string): Promise<string | null> {
  try {
    // ค้นหา session และ user ที่เกี่ยวข้อง
    const session = await prisma.session.findUnique({
      where: {
        sessionTokenHash: sessionId
      },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });

    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting userId from session:", error);
    return null;
  }
}

