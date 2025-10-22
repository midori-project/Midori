"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useDaytonaPreview } from '@/hooks/useDaytonaPreview';
import { useProjectData } from '@/hooks/useProjectData';
import { useDeployment } from '@/hooks/useDeployment';
import { useProjectWebSocket } from '@/hooks/useProjectWebSocket';
import { useVisualEdit } from '@/hooks/useVisualEdit';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewContent } from './PreviewContent';
import { PreviewFooter } from './PreviewFooter';
import { DeploymentToast } from './DeploymentToast';
import { CustomDomainDialog } from './CustomDomainDialog';
import { VisualEditPanel } from './VisualEditPanel';

/**
 * ProjectPreview Component
 * 
 * Component หลักสำหรับแสดงและจัดการ Preview ของโปรเจค
 * 
 * ฟีเจอร์หลัก:
 * - แสดง Live Preview ผ่าน Daytona Sandbox
 * - Code Editor แบบ real-time
 * - WebSocket integration สำหรับ auto-refresh
 * - Deployment ไปยัง subdomain
 * - รองรับหลาย device types (desktop, tablet, mobile)
 * 
 * @param projectId - ID ของโปรเจคที่ต้องการแสดง Preview
 */

interface ProjectPreviewProps {
  projectId: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

const loadingMessages = [
  'กินกาแฟ...',
  'กินหมูปิ้ง 20 ไม้...',
  'กินข้าวกะเพรา...',
  'กินข้าวหมูกรอบ...',
  'กินข้าวกุ้งกะปิ...',
  'กินข้าวผัดกระเทียม...',
  'เกือบเสร็จแล้ว...',
  'กินข้าวผัดตะเข้...',
  'กินข้าวผัดหมู...',
];

const ProjectPreview: React.FC<ProjectPreviewProps> = ({ projectId }) => {
  // ==================== Local State ====================
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isCodeEditorVisible, setIsCodeEditorVisible] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);  // 🆕 Dialog state

  // ==================== Custom Hooks ====================
  
  // ดึงข้อมูลโปรเจค
  const {
    projectData,
    projectFiles,
    projectName,
    isLoading: isLoadingData,
    error: dataError,
    hasSnapshot,
    refetch: refetchProjectData,
  } = useProjectData(projectId);

  // จัดการ Deployment
  const {
    deploy,
    isDeploying,
    deploymentError,
    deploymentSuccess,
    clearError: clearDeploymentError,
    generateSubdomain,
  } = useDeployment(projectId, projectName);

  // WebSocket connection
  const { isConnected: wsConnected } = useProjectWebSocket(
    projectId,
    refetchProjectData
  );

  // Daytona Preview
  const {
    sandboxId,
    status,
    previewUrlWithToken,
    error,
    loading,
    startPreview,
    stopPreview,
  } = useDaytonaPreview({ 
    projectId: projectId,
    files: projectFiles,
  });

  // 🎨 Visual Edit Mode
  const {
    editMode,
    selectedElement,
    isSaving,
    savingProgress,
    toggleEditMode,
    saveEdit,
    cancelEdit
  } = useVisualEdit({ 
    projectId,
    sandboxId, // 🔑 ส่ง sandboxId เพื่อใช้ partial update API
    onSaveSuccess: () => {
      console.log('✅ Visual edit saved successfully');
      // Optionally refetch data or show success message
    },
    onSaveError: (error) => {
      console.error('❌ Visual edit save error:', error);
      // Optionally show error toast
    }
  });

  // ==================== Memoized Values ====================
  
  const templateFiles = useMemo(() => projectFiles, [projectFiles]);
  const previewUrl = previewUrlWithToken;

  // ==================== Effects ====================
  
  // Auto-start preview เมื่อมี snapshot
  useEffect(() => {
    if (hasSnapshot && templateFiles.length > 0 && status !== 'running' && !loading) {
      console.log('🚀 Auto-starting preview for available snapshot...');
      startPreview();
    }
  }, [hasSnapshot, templateFiles.length, status, loading, startPreview]);
  
  // Log ข้อมูลเมื่อโหลดเสร็จ
  useEffect(() => {
    if (!isLoadingData && templateFiles.length > 0) {
      console.log(`✅ ProjectPreview loaded ${templateFiles.length} files from database`);
      console.log(`📦 Project: ${projectName} (ID: ${projectId})`);
      if (projectData) {
        console.log(`📸 Snapshot ID: ${projectData.snapshot.id}`);
        console.log(`📅 Created: ${new Date(projectData.snapshot.createdAt).toLocaleString('th-TH')}`);
      }
    }
  }, [isLoadingData, templateFiles.length, projectName, projectId, projectData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+E หรือ Cmd+E เพื่อ toggle Code Editor
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setIsCodeEditorVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading message animation
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [loading]);

  // ==================== Helper Functions ====================
  
  const getCurrentLoadingMessage = () => {
    return loadingMessages[loadingMessageIndex] || 'กำลังโหลด...';
  };

  // ==================== Render ====================

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <PreviewToolbar
        projectName={projectName || projectId}
        isLoading={isLoadingData}
        hasSnapshot={hasSnapshot}
        status={status}
        deviceType={deviceType}
        wsConnected={wsConnected}
        previewUrl={previewUrl ?? null}
        dataError={dataError}
        filesCount={templateFiles.length}
        loadingMessage={loading ? getCurrentLoadingMessage() : 'Start Preview'}
        onDeviceChange={setDeviceType}
        onRefresh={refetchProjectData}
        onStartPreview={startPreview}
        onStopPreview={stopPreview}
        onToggleEditor={() => setIsCodeEditorVisible(!isCodeEditorVisible)}
        onDeploy={() => setIsDeployDialogOpen(true)}  // 🆕 เปิด dialog แทนที่จะ deploy ตรงๆ
        isDeploying={isDeploying}
        isCodeEditorVisible={isCodeEditorVisible}
        generateSubdomain={generateSubdomain}
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
      />

      {/* Content */}
      <PreviewContent
        isLoading={isLoadingData}
        error={dataError}
        hasSnapshot={hasSnapshot}
        status={status}
        previewUrl={previewUrl ?? null}
        sandboxId={sandboxId ?? null}
        projectId={projectId}
        files={templateFiles}
        deviceType={deviceType}
        isCodeEditorVisible={isCodeEditorVisible}
        loading={loading}
        onRefresh={refetchProjectData}
        onStartPreview={startPreview}
      />

      {/* Footer */}
      <PreviewFooter
        filesCount={templateFiles.length}
        status={status}
        sandboxId={sandboxId ?? null}
        deploymentSuccess={deploymentSuccess}
        isDeploying={isDeploying}
        hasSnapshot={hasSnapshot}
        onDeploy={() => setIsDeployDialogOpen(true)}  // 🆕 เปิด dialog ใน footer ด้วย
      />

      {/* Toast Notifications */}
      <DeploymentToast error={deploymentError} onClose={clearDeploymentError} />

      {/* 🆕 Custom Domain Dialog */}
      <CustomDomainDialog
        isOpen={isDeployDialogOpen}
        onClose={() => setIsDeployDialogOpen(false)}
        onDeploy={deploy}
        projectName={projectName || projectId}
        generateSubdomain={generateSubdomain}
        isDeploying={isDeploying}
      />

      {/* 🎨 Visual Edit Panel */}
      <VisualEditPanel
        selectedElement={selectedElement}
        projectId={projectId}
        isSaving={isSaving}
        savingProgress={savingProgress}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
};

export default ProjectPreview;
