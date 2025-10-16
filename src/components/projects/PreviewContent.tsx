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
    <div className="flex-1 overflow-hidden bg-gray-100 p-4">
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
          className={`grid gap-4 h-full ${
            isCodeEditorVisible ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          {/* Code Editor Section */}
          {isCodeEditorVisible && (
            <div className="lg:col-span-2">
              <CodeEditor
                sandboxId={sandboxId}
                projectId={projectId}
                initialFiles={files}
                className="h-full"
              />
            </div>
          )}

          {/* Live Preview Section */}
          <div className={isCodeEditorVisible ? 'lg:col-span-1' : 'col-span-1'}>
            <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  🔴 Live Preview
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Connected
                  </span>
                  {!isCodeEditorVisible && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Full Screen
                    </span>
                  )}
                </h3>
              </div>

              <div className="h-full">
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
                      className="w-full h-full border-0"
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
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔄</div>
                      <div>Loading preview...</div>
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

