import React, { useState } from 'react';
import { 
  Eye, 
  ExternalLink, 
  CheckCircle,
  FolderOpenDot,
  Menu,
  X
} from 'lucide-react';
import type { DeploymentSuccess } from '@/hooks/useDeployment';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="bg-[#587638] p-4 relative">
      <div className="flex items-center justify-between  ">
        {/* Left Section - Project Info */}
        <div className="flex items-center  space-x-3 ">
          <FolderOpenDot className="w-6 h-6 text-[#e5e48f]" />
          <h2 className="text-lg font-bold text-[#e5e48f]">
            {isLoading ? 'กำลังโหลด...' : 'Project : '+projectName}
          </h2>
        </div>

<div className="flex items-center space-x-2">
    {/* Deployment Link (เมื่อ Deploy สำเร็จ) */}
    {deploymentSuccess && (
            <a
              href={deploymentSuccess.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm text-[#e5e48f] font-bold rounded-md transition-colors flex items-center space-x-1 bg-gradient-to-r from-[#8aac8a] to-[#41a093] hover:shadow-lg hover:-translate-y-0.5"
              title={`เปิด ${deploymentSuccess.subdomain}`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Deployed: {deploymentSuccess.subdomain}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

        {/* Right Section - Action Buttons & Hamburger Menu */}
        <div className="flex items-center space-x-2 pr-2">
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-[#587638]/50 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-7 h-7 text-[#e5e48f]" />
            ) : (
              <Menu className="w-7 h-7 text-[#e5e48f]" />
            )}
          </button>
          {/* Stop Preview Button */}


          {/* Toggle Editor Button */}
          {/* ปุ่มที่เกี่ยวกับ Editor/Deploy ถูกย้ายไปที่ Footer */}

          </div>
        </div>
      </div>

      {/* Hamburger Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-16 right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-250">
          {/* User Info Section */}
          {isAuthenticated && user && (
            <div className="border-b border-gray-200 pb-3 mb-2">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 bg-gradient-to-r from-[#5ACCCC] to-[#98FC79] rounded-full flex items-center justify-center text-white font-semibold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="block px-4 py-2 text-base text-gray-800 font-medium hover:bg-green-50 transition-colors"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            href="/projects/workspace"
            className="block px-4 py-2 text-base text-gray-800 font-medium hover:bg-green-50 transition-colors"
            onClick={toggleMenu}
          >
            Workspace
          </Link>
          <Link
            href="/projects/featured"
            className="block px-4 py-2 text-base text-gray-800 font-medium hover:bg-green-50 transition-colors"
            onClick={toggleMenu}
          >
            Community
          </Link>
        </div>
      )}
    </div>
  );
}

