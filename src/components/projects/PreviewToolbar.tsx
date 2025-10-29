import React from 'react';
import { 
  Eye, 
  ExternalLink, 
  CheckCircle 
} from 'lucide-react';
import type { DeploymentSuccess } from '@/hooks/useDeployment';

interface PreviewToolbarProps {
  projectName: string;
  isLoading: boolean;
  hasSnapshot: boolean;
  status: string;
  wsConnected: boolean;
  previewUrl: string | null;
  dataError: string | null;
  filesCount: number;
  loadingMessage: string;
  onRefresh: () => void;
  onStartPreview: () => void;
  onStopPreview: () => void;
  deploymentSuccess?: DeploymentSuccess | null;
}

/**
 * Toolbar สำหรับควบคุม Preview
 * ประกอบด้วยปุ่มต่างๆ เช่น Start Preview, Deployment Link
 */
export function PreviewToolbar({
  projectName,
  isLoading,
  hasSnapshot,
  status,
  wsConnected,
  previewUrl,
  dataError,
  filesCount,
  loadingMessage,
  onRefresh,
  onStartPreview,
  onStopPreview,
  deploymentSuccess,
  
}: PreviewToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Project Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'กำลังโหลด...' : projectName}
            </h2>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Stop Preview Button */}


          {/* Toggle Editor Button */}
          {/* ปุ่มที่เกี่ยวกับ Editor/Deploy ถูกย้ายไปที่ Footer */}

          {/* Deployment Link (เมื่อ Deploy สำเร็จ) */}
          {deploymentSuccess && (
            <a
              href={deploymentSuccess.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm text-[#384538] font-bold rounded-md transition-colors flex items-center space-x-1 bg-gradient-to-r from-[#8aac8a] to-[#41a093] hover:shadow-lg hover:-translate-y-0.5"
              title={`เปิด ${deploymentSuccess.subdomain}`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Deployed: {deploymentSuccess.subdomain}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

