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
 * Toolbar for controlling Preview
 * Contains various buttons such as Start Preview, Deployment Link
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
    <div className="bg-[#587638] p-2 sm:p-4 relative">
      <div className="flex items-center justify-between">
        {/* Left Section - Project Info */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <FolderOpenDot className="w-5 h-5 sm:w-6 sm:h-6 text-[#e5e48f] flex-shrink-0" />
          <h2 className="text-sm sm:text-lg font-bold text-[#e5e48f] truncate">
            {isLoading ? 'Loading...' : (
              <>
                <span className="hidden sm:inline">Project : </span>
                <span className="sm:hidden">P: </span>
                {projectName}
              </>
            )}
          </h2>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Deployment Link (เมื่อ Deploy สำเร็จ) */}
          {deploymentSuccess && (
            <a
              href={deploymentSuccess.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-[#e5e48f] font-bold rounded-md transition-colors flex items-center space-x-1 bg-gradient-to-r from-[#8aac8a] to-[#41a093] hover:shadow-lg hover:-translate-y-0.5"
              title={`เปิด ${deploymentSuccess.subdomain}`}
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Deployed: {deploymentSuccess.subdomain}</span>
              <span className="md:hidden">Live</span>
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#587638]/50 transition-colors hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 sm:w-7 sm:h-7 text-[#e5e48f]" />
            ) : (
              <Menu className="w-6 h-6 sm:w-7 sm:h-7 text-[#e5e48f]" />
            )}
          </button>
        </div>
      </div>

      {/* Hamburger Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-12 sm:top-16 right-0 mt-1 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-250">
          {/* User Info Section */}
          {isAuthenticated && user && (
            <div className="border-b border-gray-200 pb-3 mb-2">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#5ACCCC] to-[#98FC79] rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-800 font-medium hover:bg-green-50 transition-colors"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link
            href="/projects/workspace"
            className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-800 font-medium hover:bg-green-50 transition-colors"
            onClick={toggleMenu}
          >
            Workspace
          </Link>
          <Link
            href="/projects/featured"
            className="block px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-800 font-medium hover:bg-green-50 transition-colors"
            onClick={toggleMenu}
          >
            Community
          </Link>
        </div>
      )}
    </div>
  );
}

