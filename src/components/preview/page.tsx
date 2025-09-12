'use client';

import React from 'react';
import { Button } from '@/components/Button/Button';
import { AlertCircle, CheckCircle, Clock, ExternalLink, Play, Square, Loader2 } from 'lucide-react';
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview';

interface DaytonaPreviewPageProps {
  projectId: string;
  promptJson?: Record<string, unknown>;
  userId?: string;
  className?: string;
}

export default function DaytonaPreviewPage({ 
  projectId, 
  promptJson, 
  userId,
  className = '' 
}: DaytonaPreviewPageProps) {
  const {
    sandboxState,
    isStarting,
    isStopping,
    startPreview,
    stopPreview,
  } = useDaytonaPreview(projectId, userId);

  const getStatusIcon = () => {
    switch (sandboxState.status) {
      case 'creating':
      case 'building':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (sandboxState.status) {
      case 'creating': return 'กำลังสร้าง Sandbox...';
      case 'building': return 'กำลัง Build โปรเจกต์...';
      case 'running': return 'พรีวิวพร้อมใช้งาน';
      case 'stopping': return 'กำลังหยุด...';
      case 'error': return 'เกิดข้อผิดพลาด';
      default: return 'ยังไม่ได้เริ่มพรีวิว';
    }
  };

  const usagePercent = ((sandboxState.usageToday ?? 0) / (sandboxState.maxUsagePerDay ?? 3600)) * 100;
  const usageMinutes = Math.round((sandboxState.usageToday ?? 0) / 60);
  const maxMinutes = Math.round((sandboxState.maxUsagePerDay ?? 3600) / 60);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getStatusIcon()}
            Daytona Preview
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            พรีวิวโปรเจกต์ในสภาพแวดล้อมแยกด้วย Daytona Sandbox
          </p>
        </div>
        <div className="px-6 py-4 space-y-4">
          {/* สถานะปัจจุบัน */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                sandboxState.status === 'running' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getStatusText()}
              </span>
              {sandboxState.sandboxId && (
                <span className="text-sm text-gray-500">
                  ID: {sandboxState.sandboxId.slice(0, 8)}...
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {sandboxState.status === 'idle' && (
                <Button 
                  onClick={() => startPreview(promptJson)}
                  disabled={isStarting || usagePercent >= 100}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isStarting ? 'กำลังเริ่ม...' : 'เริ่มพรีวิว'}
                </Button>
              )}
              
              {(sandboxState.status === 'running' || sandboxState.status === 'building') && (
                <Button 
                  variant="outline" 
                  onClick={() => stopPreview()}
                  disabled={isStopping}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  {isStopping ? 'กำลังหยุด...' : 'หยุดพรีวิว'}
                </Button>
              )}
            </div>
          </div>

          {/* ลิงก์พรีวิว */}
          {sandboxState.previewUrl && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  พรีวิวพร้อมใช้งาน:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(sandboxState.previewUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  เปิดพรีวิว
                </Button>
              </div>
              <p className="text-xs text-green-600 mt-1 break-all">
                {sandboxState.previewUrl}
              </p>
            </div>
          )}

          {/* ข้อผิดพลาด */}
          {sandboxState.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{sandboxState.error}</p>
            </div>
          )}

          {/* โควตาการใช้งาน */}
          {userId && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>การใช้งานวันนี้:</span>
                <span>{usageMinutes}/{maxMinutes} นาที</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    usagePercent >= 100 ? 'bg-red-500' : 
                    usagePercent >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                ></div>
              </div>
              {usagePercent >= 100 && (
                <p className="text-sm text-red-600">
                  คุณใช้เวลาพรีวิวครบโควตาวันนี้แล้ว
                </p>
              )}
            </div>
          )}

          {/* Logs (ถ้ามี) */}
          {sandboxState.logs && sandboxState.logs.length > 0 && (
            <details className="space-y-2">
              <summary className="text-sm font-medium cursor-pointer">
                ดู Logs ({sandboxState.logs.length} รายการ)
              </summary>
              <div className="bg-gray-50 border rounded-md p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {sandboxState.logs.join('\n')}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
