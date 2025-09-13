'use client';

import React, { useState, useEffect } from 'react';

interface PreviewWindowProps {
  previewUrl?: string;
  previewToken?: string;
  isOpen: boolean;
  onClose: () => void;
  sandboxId?: string;
}

export default function PreviewWindow({ 
  previewUrl, 
  previewToken, 
  isOpen, 
  onClose, 
  sandboxId 
}: PreviewWindowProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // รีเซ็ต state เมื่อเปิด modal ใหม่
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setIframeKey(prev => prev + 1); // เปลี่ยน key เพื่อรีโหลด iframe
    }
  }, [isOpen, previewUrl]);

  // จัดการ keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // ป้องกันการ scroll ของ body เมื่อ modal เปิด
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // สร้าง URL พร้อม authentication token
  const getAuthenticatedUrl = () => {
    if (!previewUrl) return '';
    
    // ใช้ query parameter สำหรับ authentication
    const url = new URL(previewUrl);
    if (previewToken) {
      url.searchParams.set('DAYTONA_SANDBOX_AUTH_KEY', previewToken);
    }
    return url.toString();
  };

  // ตรวจสอบว่า URL และ token ถูกต้องหรือไม่
  const isValidPreview = () => {
    return previewUrl && previewToken && previewUrl.includes('proxy.daytona.works');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('ไม่สามารถโหลด preview ได้ กรุณาตรวจสอบ URL และ token');
  };

  // ตรวจสอบว่า iframe โหลดเสร็จหรือไม่
  useEffect(() => {
    if (isOpen && previewUrl) {
      const timer = setTimeout(() => {
        if (isLoading) {
          setError('การโหลดใช้เวลานานเกินไป กรุณาลองรีเฟรช');
          setIsLoading(false);
        }
      }, 30000); // 30 วินาที timeout

      return () => clearTimeout(timer);
    }
  }, [isOpen, previewUrl, isLoading]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setIframeKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(getAuthenticatedUrl(), '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-800">
              🖥️ Preview Sandbox
            </h2>
            {sandboxId && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {sandboxId}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* ปุ่ม Refresh */}
            <button
              onClick={handleRefresh}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              🔄 รีเฟรช
            </button>
            
            {/* ปุ่มเปิดในแท็บใหม่ */}
            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              🔗 เปิดในแท็บใหม่
            </button>
            
            {/* ปุ่มปิด */}
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ✕ ปิด
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {!isValidPreview() ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {!previewUrl ? 'ไม่มี Preview URL' : 'Preview URL ไม่ถูกต้อง'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {!previewUrl 
                    ? 'กรุณารอให้ sandbox สร้างเสร็จก่อน'
                    : 'กรุณาตรวจสอบ URL และ token'
                  }
                </p>
                {previewUrl && (
                  <div className="text-sm text-gray-400 bg-gray-100 p-3 rounded">
                    <p>URL: {previewUrl}</p>
                    <p>Token: {previewToken ? 'มี' : 'ไม่มี'}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      กำลังโหลด Preview...
                    </h3>
                    <p className="text-gray-500">
                      กรุณารอสักครู่
                    </p>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {error && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                  <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                      เกิดข้อผิดพลาด
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {error}
                    </p>
                    <div className="space-x-2">
                      <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        ลองใหม่
                      </button>
                      <button
                        onClick={handleOpenInNewTab}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        เปิดในแท็บใหม่
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview URL Info */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-20">
                <div className="font-mono break-all">
                  {getAuthenticatedUrl()}
                </div>
              </div>

              {/* Iframe */}
              <iframe
                key={iframeKey}
                src={getAuthenticatedUrl()}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Preview Sandbox"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Status: {isLoading ? 'Loading...' : error ? 'Error' : 'Ready'}</span>
              {previewToken && (
                <span>Token: {previewToken.substring(0, 8)}...</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              ใช้ ESC หรือคลิกปิดเพื่อปิดหน้าต่าง
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
