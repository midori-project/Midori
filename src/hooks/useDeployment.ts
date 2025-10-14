import { useState, useEffect, useCallback } from 'react';

/**
 * Interface สำหรับข้อมูล Deployment
 */
export interface DeploymentSuccess {
  url: string;
  subdomain: string;
  deployedAt: string;
}

export interface DeploymentHistoryItem {
  id: string;
  url: string;
  state: string;
  meta: any;
  createdAt: string;
}

/**
 * Hook สำหรับจัดการ Deployment
 * 
 * @param projectId - ID ของโปรเจคที่ต้องการ deploy
 * @param projectName - ชื่อโปรเจคสำหรับสร้าง subdomain
 * @returns ฟังก์ชัน deploy, สถานะ และประวัติ deployment
 * 
 * @example
 * ```tsx
 * const { deploy, isDeploying, deploymentSuccess, deploymentError, history } = useDeployment(projectId, projectName);
 * ```
 */
export function useDeployment(projectId: string, projectName: string) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentSuccess, setDeploymentSuccess] = useState<DeploymentSuccess | null>(null);
  const [history, setHistory] = useState<DeploymentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  /**
   * แปลงชื่อโปรเจคเป็น subdomain format
   */
  const generateSubdomain = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)
      .replace(/^-|-$/g, '');
  };

  /**
   * ดึงประวัติ deployment
   */
  const fetchHistory = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoadingHistory(true);
      const response = await fetch(`/api/projects/${projectId}/deploy`);
      const result = await response.json();

      if (result.success && result.deployments) {
        setHistory(result.deployments);

        // ตั้งค่า deployment ที่สำเร็จล่าสุดเป็น default
        const latestSuccess = result.deployments.find((d: any) => d.state === 'ready');
        if (latestSuccess && latestSuccess.meta?.subdomain) {
          setDeploymentSuccess({
            url: latestSuccess.url,
            subdomain: latestSuccess.meta.subdomain,
            deployedAt: latestSuccess.createdAt,
          });
        }
      }
    } catch (err) {
      console.error('❌ Error fetching deployment history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectId]);

  /**
   * Deploy โปรเจค
   * @param customDomain - (Optional) custom domain ของผู้ใช้ เช่น www.mawza.lol
   */
  const deploy = useCallback(async (customDomain?: string) => {
    const autoSubdomain = generateSubdomain(projectName || projectId);

    if (!autoSubdomain) {
      setDeploymentError('ไม่สามารถสร้าง subdomain จากชื่อโปรเจคได้');
      return;
    }

    setIsDeploying(true);
    setDeploymentError(null);
    setDeploymentSuccess(null);

    try {
      const deployDomain = customDomain || `${autoSubdomain}.midori.lol`;
      console.log(`🚀 Starting deployment for ${projectId} with subdomain: ${autoSubdomain}`);
      if (customDomain) console.log(`🌐 Custom domain: ${customDomain}`);

      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subdomain: autoSubdomain,
          customDomain: customDomain || undefined,  // 🆕 ส่ง customDomain ไปด้วย
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการ deploy');
      }

      console.log('✅ Deployment successful:', result);

      setDeploymentSuccess({
        url: result.deployment.url,
        subdomain: result.deployment.customDomain || result.deployment.subdomain,  // แสดง custom domain ถ้ามี
        deployedAt: result.deployment.deployedAt,
      });

      // รีเฟรชประวัติ deployment
      await fetchHistory();
    } catch (err: any) {
      console.error('❌ Deployment failed:', err);
      setDeploymentError(err.message || 'เกิดข้อผิดพลาดในการ deploy');
    } finally {
      setIsDeploying(false);
    }
  }, [projectId, projectName, fetchHistory]);

  // โหลดประวัติเมื่อ component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    deploy,
    isDeploying,
    deploymentError,
    deploymentSuccess,
    history,
    isLoadingHistory,
    clearError: () => setDeploymentError(null),
    generateSubdomain,
  };
}

