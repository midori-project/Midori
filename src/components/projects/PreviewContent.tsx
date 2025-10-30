import React from 'react';
import { CodeEditor } from '@/components/CodeEditor/CodeEditor';
import {
  LoadingState,
  NoSnapshotState,
  ErrorState,
  PreviewLoadingState,
} from './EmptyStates';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewContentProps {
  isLoading: boolean;
  error: string | null;
  hasSnapshot: boolean;
  status: string;
  previewUrl: string | null;
  sandboxId: string | null;
  projectId: string;
  files: Array<{ path: string; content: string; type: string }>;
  deviceType: DeviceType;
  isCodeEditorVisible: boolean;
  loading: boolean;
  onRefresh: () => void;
  onStartPreview: () => void;
}

/**
 * Component แสดงเนื้อหาหลักของ Preview
 * รวม Code Editor และ Live Preview iframe
 */
export function PreviewContent({
  isLoading,
  error,
  hasSnapshot,
  status,
  previewUrl,
  sandboxId,
  projectId,
  files,
  deviceType,
  isCodeEditorVisible,
  loading,
  onRefresh,
  onStartPreview,
}: PreviewContentProps) {
  // Helper function สำหรับคำนวณความกว้างตาม device type
  const getDeviceWidth = () => {
    switch (deviceType) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '100%';
      default:
        return '100%';
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-[#407c4c] opacity-90 p-2 sm:p-4">
      {/* Loading State */}
      {isLoading ? (
        <LoadingState />
      ) : !hasSnapshot ? (
        /* No Snapshot State */
        <NoSnapshotState onRefresh={onRefresh} isLoading={isLoading} />
      ) : error ? (
        /* Error State */
        <ErrorState error={error} />
      ) : status !== 'running' ? (
        /* Preview Loading State */
        <PreviewLoadingState
          loading={loading}
          filesCount={files.length}
          onStartPreview={onStartPreview}
        />
      ) : (
        /* Main Content - Code Editor + Live Preview */
        <div
          className={`grid gap-2 sm:gap-4 h-full ${
            isCodeEditorVisible 
              ? 'grid-cols-1 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}
        >
          {/* Code Editor Section */}
          {isCodeEditorVisible && (
            <div className="xl:col-span-2 h-[50vh] xl:h-full">
              <CodeEditor
                sandboxId={sandboxId}
                projectId={projectId}
                initialFiles={files}
                className="h-full"
              />
            </div>
          )}

          {/* Live Preview Section */}
          <div className={`${
            isCodeEditorVisible 
              ? 'xl:col-span-1 h-[50vh] xl:h-full' 
              : 'col-span-1 h-full'
          }`}>
            <div className="h-full rounded-lg overflow-hidden">
              <div className="h-full flex items-center justify-center">
                {previewUrl ? (
                  <div
                    className="w-full h-full"
                    style={{
                      width: getDeviceWidth(),
                      maxWidth: deviceType === 'desktop' ? '100%' : getDeviceWidth(),
                      margin: '0 auto',
                    }}
                  >
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0 rounded-lg"
                      title="Project Preview"
                      data-preview="true"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      referrerPolicy="no-referrer"
                      allow="clipboard-read; clipboard-write"
                      onLoad={() => {
                        console.log('✅ Preview loaded:', previewUrl);
                        console.log('🎨 Visual edit script is embedded in generated HTML');
                      }}
                      onError={() => console.error('❌ Preview failed to load:', previewUrl)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center px-4">
                      <div className="text-2xl sm:text-3xl mb-2">🔄</div>
                      <div className="text-sm sm:text-base">Loading preview...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

