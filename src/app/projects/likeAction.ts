'use server';

import { getCurrentSession } from '@/libs/auth/session';
import { toggleProjectLike, getProjectLikeStatus } from '@/libs/services/projectLikeService';

export interface ToggleLikeResult {
  success: boolean;
  isLiked: boolean;
  likeCount: number;
  error?: string;
}

export async function toggleProjectLikeAction(projectId: string): Promise<ToggleLikeResult> {
  try {
    // ตรวจสอบการเข้าสู่ระบบ
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'กรุณาเข้าสู่ระบบก่อน',
      };
    }

    // Toggle การไลค์
    const result = await toggleProjectLike(projectId, session.userId);
    
    return result;
  } catch (error) {
    console.error('Error in toggleProjectLikeAction:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: 'เกิดข้อผิดพลาดในการจัดการการไลค์',
    };
  }
}

export async function getProjectLikeStatusAction(projectId: string) {
  try {
    // ดึงข้อมูลผู้ใช้ปัจจุบัน (ถ้ามี)
    const session = await getCurrentSession();
    
    // ดึงสถานะการไลค์
    const status = await getProjectLikeStatus(projectId, session?.userId);
    
    return {
      success: true,
      ...status,
    };
  } catch (error) {
    console.error('Error in getProjectLikeStatusAction:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการไลค์',
    };
  }
}
