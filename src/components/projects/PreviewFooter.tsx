import React from 'react';
import { Loader, Rocket, PenLine, Wallpaper, Monitor, Tablet, Smartphone, MessageSquare } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewFooterProps {
  filesCount: number;
  status: string;
  sandboxId: string | null;
  isDeploying: boolean;
  hasSnapshot: boolean;
  onDeploy: () => void;
  isCodeEditorVisible: boolean;
  onToggleEditor: () => void;
  editMode?: boolean;
  onToggleEditMode?: () => void;
  deviceType: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  isOwner?: boolean; // ✅ Added prop to check if user is the project owner
  onToggleChat?: () => void; // ✅ Added prop for toggling chat
  isChatOpen?: boolean; // ✅ Added prop to check if chat is open
}

/**
 * Footer for displaying status information and Deploy button
 */
export function PreviewFooter({
  filesCount,
  status,
  sandboxId,
  isDeploying,
  hasSnapshot,
  onDeploy,
  isCodeEditorVisible,
  onToggleEditor,
  editMode,
  onToggleEditMode,
  deviceType,
  onDeviceChange,
  isOwner = true, // ✅ Default เป็น true (backward compatible)
  onToggleChat,
  isChatOpen = false, // ✅ Default เป็น false
}: PreviewFooterProps) {
  return (
    <div className="bg-gradient-to-r from-[#ecf39e] to-[#90a955] opacity-90 p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Section - Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start w-full md:w-auto">
          {/* ✅ แสดงปุ่มเฉพาะเจ้าของโปรเจ็ค */}
          {isOwner && (
            <>
            
          {/* Chat Button */}
          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className={`px-4 py-2 text-sm rounded-md transition-all font-bold focus:outline-none flex items-center justify-center hover:outline-3 hover:outline-[#75c9a7] transform hover:shadow-xl hover:-translate-y-0.5 shadow-lg
                ${isChatOpen 
                  ? 'bg-[#79b426] text-[#e5e48f]' 
                  : 'bg-[#8aac8a] text-[#384538]'
                }`}
              title="Call Wiivor"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Call Wiivor</span>
            </button>
          )}

              {/* Toggle Editor Button */}
              <button
                onClick={onToggleEditor}
                className={`px-4 py-2 text-sm rounded-md transition-all font-bold focus:outline-none flex items-center justify-center hover:outline-3 hover:outline-[#75c9a7] transform hover:shadow-xl hover:-translate-y-0.5 shadow-lg
                  ${isCodeEditorVisible
                    ? 'bg-[#79b426] text-[#e5e48f]'
                    : 'bg-[#8aac8a] text-[#384538]'
                }`}
                title={isCodeEditorVisible ? 'Hide Code Editor' : 'Show Code Editor'}
              >
                <PenLine className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">{isCodeEditorVisible ? 'HideEditor' : 'CodeEditor'}</span>
              </button>

              {/* 🎨 Visual Edit Mode Toggle */}
              {onToggleEditMode && (
                <button
                  onClick={onToggleEditMode}
                  className={`px-4 py-2 text-sm rounded-md transition-all font-bold focus:outline-none flex items-center justify-center hover:outline-3 hover:outline-[#75c9a7] transform hover:shadow-xl hover:-translate-y-0.5 shadow-lg
                    ${editMode
                      ? 'bg-[#79b426] text-[#e5e48f]'
                      : 'bg-[#8aac8a] text-[#384538]'
                  }`}
                  title="Visual Editor"
                >
                  <Wallpaper className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">VisualEditor</span>
                </button>
              )}
              
            
              {/* Deploy Button */}
              <button
                onClick={onDeploy}
                disabled={!hasSnapshot || isDeploying}
                className="px-4 py-2 rounded-md transition-colors transform transition-all text-sm font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 bg-[#8aac8a] text-[#384538] hover:outline-3 hover:outline-[#75c9a7] shadow-lg"
                title="Deploy Project"
              >
                {isDeploying ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline ml-2">กำลัง Deploy...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Deploy</span>
                  </>
                )}
              </button>
            </>
          )}
          
          {/* Device Type Selector */}
          <div className="flex bg-[#8aac8a] rounded-lg p-1 ml-2">
            <button
              onClick={() => onDeviceChange('desktop')}
              className={`p-2 rounded-md transition-colors ${
                deviceType === 'desktop'
                  ? 'bg-[#79b426] text-[#e5e48f] hover:shadow-md hover:-translate-y-0.5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceChange('tablet')}
              className={`p-2 rounded-md transition-colors ${
                deviceType === 'tablet'
                  ? 'bg-[#79b426] text-[#e5e48f] hover:shadow-md hover:-translate-y-0.5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeviceChange('mobile')}
              className={`p-2 rounded-md transition-colors ${
                deviceType === 'mobile'
                  ? 'bg-[#79b426] text-[#e5e48f] hover:shadow-md hover:-translate-y-0.5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Section - Logo */}
        <div className="hidden md:block pr-8">
          <img 
            src="/img/projects-lotus-crop.png" 
            alt="Projects Lotus" 
            className="h-12 w-auto object-contain opacity-90" 
            aria-hidden="true" 
          />
        </div>
      </div>
    </div>
  );
}

