/**
 * Deployment Dispatcher for Orchestrator
 * Handles deployment tasks and integrates with Vercel API
 */

import axios from 'axios';
import { DeployWebsiteRequest } from '@/app/api/deploy-website/schemas';

export interface DeploymentTask {
  taskId: string;
  agent: 'devops';
  action: 'deploy_website';
  payload: {
    projectId: string;
    files: Array<{
      path: string;
      content: string;
      type: 'code' | 'text' | 'asset';
    }>;
    subdomain?: string;
    buildCommand?: string;
    outputDirectory?: string;
    environmentVariables?: Record<string, string>;
  };
  priority: number;
  dependencies?: string[];
}

export interface DeploymentResult {
  success: boolean;
  deploymentId?: string;
  url?: string;
  state?: 'queued' | 'building' | 'ready' | 'failed';
  error?: string;
  vercelDeploymentId?: string;
  executionTime: number;
}

/**
 * Dispatch deployment task to Vercel
 */
export async function dispatchDeploymentTask(task: DeploymentTask): Promise<{
  success: boolean;
  result?: DeploymentResult;
  error?: string;
  dispatchId?: string;
}> {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Dispatching deployment task: ${task.taskId}`);
    
    // Prepare deployment request
    const deploymentRequest: DeployWebsiteRequest = {
      projectId: task.payload.projectId,
      files: task.payload.files,
      subdomain: task.payload.subdomain,
      buildCommand: task.payload.buildCommand || 'npm run build',
      outputDirectory: task.payload.outputDirectory || '.next',
      environmentVariables: task.payload.environmentVariables || {}
    };

    // Call deployment API
    const response = await axios.post('/api/deploy-website', deploymentRequest, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      const result: DeploymentResult = {
        success: true,
        deploymentId: response.data.data.deploymentId,
        url: response.data.data.url,
        state: response.data.data.state,
        vercelDeploymentId: response.data.data.vercelDeploymentId,
        executionTime: Date.now() - startTime
      };

      console.log(`✅ Deployment successful: ${result.url}`);
      
      return {
        success: true,
        result,
        dispatchId: `deploy-${task.taskId}-${Date.now()}`
      };
    } else {
      throw new Error(response.data.error || 'Deployment failed');
    }

  } catch (error: any) {
    console.error(`❌ Deployment task ${task.taskId} failed:`, error);
    
    const result: DeploymentResult = {
      success: false,
      error: error.response?.data?.error || error.message || 'Unknown deployment error',
      executionTime: Date.now() - startTime
    };

    return {
      success: false,
      result,
      error: result.error
    };
  }
}

/**
 * Check deployment status
 */
export async function checkDeploymentStatus(deploymentId: string): Promise<{
  success: boolean;
  status?: {
    state: 'queued' | 'building' | 'ready' | 'failed';
    url?: string;
    progress?: number;
  };
  error?: string;
}> {
  try {
    const response = await axios.get(`/api/deploy-website?deploymentId=${deploymentId}`);
    
    if (response.data.success) {
      return {
        success: true,
        status: {
          state: response.data.data.state,
          url: response.data.data.url,
          progress: response.data.data.state === 'ready' ? 100 : 
                   response.data.data.state === 'building' ? 50 : 0
        }
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Failed to check deployment status'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Unknown error'
    };
  }
}

/**
 * Create deployment task for orchestrator
 */
export function createDeploymentTask(
  projectId: string,
  files: Array<{ path: string; content: string; type: 'code' | 'text' | 'asset' }>,
  options: {
    subdomain?: string;
    buildCommand?: string;
    outputDirectory?: string;
    environmentVariables?: Record<string, string>;
    priority?: number;
    dependencies?: string[];
  } = {}
): DeploymentTask {
  return {
    taskId: `deploy-${projectId}-${Date.now()}`,
    agent: 'devops',
    action: 'deploy_website',
    payload: {
      projectId,
      files,
      subdomain: options.subdomain,
      buildCommand: options.buildCommand,
      outputDirectory: options.outputDirectory,
      environmentVariables: options.environmentVariables
    },
    priority: options.priority || 1,
    dependencies: options.dependencies
  };
}

/**
 * Generate deployment summary for user
 */
export function generateDeploymentSummary(result: DeploymentResult): string {
  if (result.success) {
    return `🚀 **เว็บไซต์ deploy สำเร็จ!**

📍 **URL**: ${result.url || 'กำลังสร้าง...'}
🆔 **Deployment ID**: ${result.deploymentId}
📊 **สถานะ**: ${getStateDescription(result.state)}
⏱️ **เวลาที่ใช้**: ${(result.executionTime / 1000).toFixed(1)} วินาที

เว็บไซต์ของคุณพร้อมใช้งานแล้ว! คุณสามารถเข้าถึงได้ผ่าน URL ด้านบน`;
  } else {
    return `❌ **การ deploy ล้มเหลว**

🚨 **ข้อผิดพลาด**: ${result.error}
⏱️ **เวลาที่ใช้**: ${(result.executionTime / 1000).toFixed(1)} วินาที

กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมสนับสนุนหากปัญหายังคงมีอยู่`;
  }
}

function getStateDescription(state?: string): string {
  switch (state) {
    case 'queued': return 'รอการประมวลผล';
    case 'building': return 'กำลังสร้างเว็บไซต์';
    case 'ready': return 'พร้อมใช้งาน';
    case 'failed': return 'ล้มเหลว';
    default: return 'ไม่ทราบสถานะ';
  }
}
