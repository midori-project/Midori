"use server";

import { getPublicProjectsWithPreview, ProjectWithPreview } from '@/libs/services/projectService';

/**
 * ✅ Server Action ที่ถูกต้อง - เป็นแค่ wrapper
 * จัดการ HTTP layer และ error handling
 * Business logic อยู่ใน projectService
 */
export async function getProjectsFromDatabase(): Promise<ProjectWithPreview[]> {
  try {
  // ✅ โหลดโปรเจค 12 รายการแรกโดยตรงจาก service (pagination)
  const response = await getPublicProjectsWithPreview({ page: 1, limit: 12 });
  return response.projects || [];
  } catch (error) {
    console.error('Error in getProjectsFromDatabase action:', error);
    // Return empty array เมื่อเกิด error
    return [];
  }
}

export default getProjectsFromDatabase;
