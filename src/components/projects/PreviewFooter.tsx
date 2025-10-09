import React from 'react';
import { CheckCircle, ExternalLink, Loader, Rocket } from 'lucide-react';
import { DeploymentSuccess } from '@/hooks/useDeployment';

interface PreviewFooterProps {
  filesCount: number;
  status: string;
  sandboxId: string | null;
  deploymentSuccess: DeploymentSuccess | null;
  isDeploying: boolean;
  hasSnapshot: boolean;
  onDeploy: () => void;
}

/**
 * Footer สำหรับแสดงข้อมูลสถานะและปุ่ม Deploy
 */
export function PreviewFooter({
  filesCount,
  status,
  sandboxId,
  deploymentSuccess,
  isDeploying,
  hasSnapshot,
  onDeploy,
}: PreviewFooterProps) {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Action Buttons */}
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Invite
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
            Upgrade
          </button>

          {/* Deployment Status */}
          {deploymentSuccess ? (
            <a
              href={deploymentSuccess.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Deployed: {deploymentSuccess.subdomain}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={onDeploy}
              disabled={!hasSnapshot || isDeploying}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>กำลัง Deploy...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Deploy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Section - Status Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Files:</span> {filesCount} |
            <span className="font-medium ml-2">Status:</span> {status}
            {sandboxId && (
              <>
                {' '}
                | <span className="font-medium ml-2">Sandbox:</span>{' '}
                {sandboxId.substring(0, 12)}...
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

