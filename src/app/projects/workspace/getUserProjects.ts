'use server';

import { getCurrentSession } from '@/libs/auth/session';
import { getUserProjectsWithPreview, UserProject } from '@/libs/services/projectService';

export async function getUserProjects(): Promise<{
  success: boolean;
  projects?: UserProject[];
  error?: string;
}> {
  try {
    // ตรวจสอบการเข้าสู่ระบบ
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: 'กรุณาเข้าสู่ระบบก่อน',
      };
    }

    // ดึงโปรเจคของผู้ใช้
    const projects = await getUserProjectsWithPreview(session.userId);

    return {
      success: true,
      projects,
    };
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return {
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจค',
    };
  }
}
