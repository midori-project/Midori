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
  isOwner?: boolean; // ✅ เพิ่ม prop เพื่อเช็คว่าเป็นเจ้าของโปรเจ็คหรือไม่
  onToggleChat?: () => void; // ✅ เพิ่ม prop สำหรับ toggle chat
}

/**
 * Footer สำหรับแสดงข้อมูลสถานะและปุ่ม Deploy
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
}: PreviewFooterProps) {
  return (
    <div className="bg-gradient-to-r from-[#ecf39e] to-[#90a955] opacity-90  p-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Action Buttons */}
        <div className="flex items-center space-x-2 ">
          {/* ✅ แสดงปุ่มเฉพาะเจ้าของโปรเจ็ค */}
          {isOwner && (
            <>
            
          {/* Chat Button */}
          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className="px-4 py-2 text-sm rounded-md transition-all font-bold focus:outline-none flex items-center space-x-2 hover:outline-3 hover:outline-[#75c9a7] transform hover:shadow-xl hover:-translate-y-0.5 bg-[#8aac8a] text-[#384538] shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              
              <span>Call Midori</span>
            </button>
          )}

              {/* Toggle Editor Button */}
              <button
                onClick={onToggleEditor}
                className={`px-4 py-2 text-sm rounded-md transition-all font-bold focus:outline-none flex items-center space-x-2 hover:outline-3 hover:outline-[#75c9a7]
                  transform ${
                  isCodeEditorVisible
                    ? 'bg-[#79b426] text-[#e5e48f] hover:shadow-md hover:-translate-y-0.5 '
                    : 'bg-[#8aac8a] text-[#384538] hover:shadow-xl hover:-translate-y-0.5 shadow-lg'
                }`}
              >
                <PenLine className="w-4 h-4" />
                <span>{isCodeEditorVisible ? ' HideEditor ' : 'CodeEditor'}</span>
              </button>

              {/* 🎨 Visual Edit Mode Toggle */}
              {onToggleEditMode && (
                <button
                  onClick={onToggleEditMode}
                    className={`px-4 py-2 text-sm rounded-md transition-all font-bold focus:outline-none flex items-center space-x-2 hover:outline-3 hover:outline-[#75c9a7]
                    transform ${
                     editMode
                       ? 'bg-[#79b426] text-[#e5e48f] hover:shadow-md hover:-translate-y-0.5'
                       : 'bg-[#8aac8a] text-[#384538] shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                   }`}
                >
                  <Wallpaper className="w-4 h-4" />
                  <span>{editMode ? 'VisualEditor ' : 'VisualEditor '}</span>
                </button>
              )}
              
            
              {/* Deploy Button */}
              <button
                onClick={onDeploy}
                disabled={!hasSnapshot || isDeploying}
                className="px-4 py-2 rounded-md transition-colors transform transition-all text-sm font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 bg-[#8aac8a] text-[#384538] hover:outline-3 hover:outline-[#75c9a7]"
              >
                {isDeploying ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>กำลัง Deploy... </span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Deploy</span>
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
            >
              <Smartphone className="w-4 h-4" />
            </button>

          </div>

          
        </div>
        <div className='pr-8'>
            <img src="/img/projects-lotus-crop.png" alt="Projects Lotus" className="h-12 w-auto object-contain opacity-90" aria-hidden="true" />
          </div>
      </div>
    </div>
  );
}

