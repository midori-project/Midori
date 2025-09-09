"use server"
import { prisma } from "@/libs/prisma/prisma";

export async function getPromptJson(projectId: string) {
  // ดึงข้อมูล promptJson จากตาราง Generation ที่ล่าสุดของ project นี้
  const generation = await prisma.generation.findFirst({
    where: { projectId: projectId },
    select: { promptJson: true },
    orderBy: { createdAt: 'desc' }, // เอาล่าสุด
  });
  
  return generation?.promptJson;
}

