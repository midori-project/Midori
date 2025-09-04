"use server"

import { prisma } from "@/libs/prisma/prisma";
import type { Prisma } from "@prisma/client";
import { getCurrentSession } from "@/libs/auth/session";


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
  data: {
    finalJson: Prisma.InputJsonValue,
    prompt: Prisma.InputJsonValue
  },
  model: string = "gpt-5-nano"
): Promise<{ id: string } | { ok: false; error: string }> {
  try {
    const session = await getCurrentSession();
  if (!session || !session.user || !session.user.id) {
    return { ok: false, error: 'Unauthenticated' };
  }
    // สร้าง generation ใหม่
    const generation = await prisma.generation.create({
      data: {
        projectId: projectId,
        userId: session.user.id,
        // Prisma ต้องการ prompt เป็น String เสมอ
        prompt: typeof data.finalJson === "string" ? data.finalJson : JSON.stringify(data.finalJson),
        model: model,
        promptJson: data.finalJson
      }
    });

    console.log("บันทึก finalJson ลงในตาราง generation สำเร็จ:", generation.id);
    // ส่งคืนเฉพาะข้อมูล primitive ที่ serialize ได้
    return { id: generation.id };
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
