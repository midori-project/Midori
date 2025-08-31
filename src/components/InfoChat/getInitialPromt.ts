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

export async function getPromptJson(projectId: string): Promise<string | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        generations: true
      }
    });
    return project?.generations[0]?.promptJson as string | null;
  } catch (error) {
    console.error("Error fetching project description:", error);
    return null;
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
