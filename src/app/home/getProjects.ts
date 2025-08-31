"use server";

import { getPublicProjectsWithPreview, ProjectWithPreview } from '@/libs/services/projectService';

/**
 * ✅ Server Action ที่ถูกต้อง - เป็นแค่ wrapper
 * จัดการ HTTP layer และ error handling
 * Business logic อยู่ใน projectService
 */
export async function getProjectsFromDatabase(): Promise<ProjectWithPreview[]> {
  try {
    // เรียก Business Service (business logic อยู่ที่นี่)
    const projects = await getPublicProjectsWithPreview();
    
    return projects;
  } catch (error) {
    console.error('Error in getProjectsFromDatabase action:', error);
    // Return empty array เมื่อเกิด error
    return [];
  }
}

export default getProjectsFromDatabase;
