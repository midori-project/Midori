import { useState, useEffect, useCallback } from 'react';

/**
 * Interface สำหรับข้อมูล Project
 */
export interface ProjectData {
  snapshot: {
    id: string;
    label: string | null;
    createdAt: string;
  };
  project: {
    id: string;
    name: string;
    description: string | null;
  };
  templateData: any;
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  filesCount: number;
}

/**
 * Hook สำหรับจัดการข้อมูลโปรเจค
 * 
 * @param projectId - ID ของโปรเจคที่ต้องการดึงข้อมูล
 * @returns ข้อมูลโปรเจค, สถานะการโหลด, error และฟังก์ชัน refetch
 * 
 * @example
 * ```tsx
 * const { projectData, projectFiles, isLoading, error, refetch } = useProjectData(projectId);
 * ```
 */
export function useProjectData(projectId: string) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [projectFiles, setProjectFiles] = useState<Array<{ path: string; content: string; type: string }>>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSnapshot, setHasSnapshot] = useState<boolean>(false);

  /**
   * ฟังก์ชันดึงข้อมูลจาก API
   */
  const fetchProjectData = useCallback(async () => {
    if (!projectId) {
      setError('ไม่พบ Project ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/snapshot`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'ไม่สามารถดึงข้อมูลได้');
      }

      if (result.success && result.data) {
        setProjectData(result.data);
        setProjectFiles(result.data.files || []);
        setProjectName(result.data.project?.name || projectId);
        setHasSnapshot(result.hasSnapshot !== false);

        if (result.hasSnapshot) {
          console.log(`✅ โหลดข้อมูลจาก DB สำเร็จ: ${result.data.filesCount} ไฟล์`);
        } else {
          console.log(`⚠️ ${result.message}`);
        }
      } else {
        throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
      }
    } catch (err) {
      console.error('❌ Error fetching project data:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      setHasSnapshot(false);
      setProjectFiles([]);
      setProjectName(projectId);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // โหลดข้อมูลครั้งแรกเมื่อ component mount
  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  return {
    projectData,
    projectFiles,
    projectName,
    isLoading,
    error,
    hasSnapshot,
    refetch: fetchProjectData,
  };
}

