'use server';

import { redirect } from 'next/navigation';
import { getPublicProjectsWithPreview, PaginatedProjectsResponse, PaginationOptions } from '@/libs/services/projectService';

export async function navigateToCreateProject() {
  redirect('/');
}

export async function navigateToFilter() {
  // สำหรับอนาคต - อาจเพิ่มการกรองหรือการค้นหา
  // ปัจจุบันยังไม่ทำอะไร
}

export interface GetPublicProjectsResult {
  success: boolean;
  data?: PaginatedProjectsResponse;
  error?: string;
}

export async function getPublicProjectsPaginated(
  options: PaginationOptions = {}
): Promise<GetPublicProjectsResult> {
  try {
    const result = await getPublicProjectsWithPreview(options);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค',
    };
  }
}
