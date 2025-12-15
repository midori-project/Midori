"use server"
import { prisma } from "@/libs/prisma/prisma";

export async function getPromptJson(projectId: string) {
  // Fetch promptJson from the latest Generation record of this project
  const generation = await prisma.generation.findFirst({
    where: { projectId: projectId },
    select: { promptJson: true },
    orderBy: { createdAt: 'desc' }, // Get the latest
  });
  
  return generation?.promptJson;
}