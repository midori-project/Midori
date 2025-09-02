'use server';

import { getCurrentSession } from '@/libs/auth/session';
import { 
  getUserProjectsWithPreview, 
  PaginatedUserProjectsResponse,
  PaginationOptions 
} from '@/libs/services/projectService';

export interface GetUserProjectsResult {
  success: boolean;
  data?: PaginatedUserProjectsResponse;
  error?: string;
}

export async function getUserProjectsPaginated(
  options: PaginationOptions = {}
): Promise<GetUserProjectsResult> {
  try {
    // ตรวจสอบการเข้าสู่ระบบ
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: 'กรุณาเข้าสู่ระบบก่อน',
      };
    }

    // ดึงโปรเจคของผู้ใช้แบบ pagination
    const result = await getUserProjectsWithPreview(session.userId, options);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค',
    };
  }
}

// Legacy function for backward compatibility
export async function getUserProjects(): Promise<{
  success: boolean;
  projects?: any[];
  error?: string;
}> {
  const result = await getUserProjectsPaginated({ page: 1, limit: 100 });
  
  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    projects: result.data?.projects || [],
  };
}
