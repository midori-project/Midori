/**
 * useVisualEdit Hook
 * จัดการ visual edit mode state และ communication กับ iframe
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { visualEditService } from '@/libs/services/visualEditService';

interface SelectedElement {
  blockId: string;
  field: string;
  type: string;
  itemIndex?: string;
  currentValue: string;
  rect: DOMRect;
}

interface UseVisualEditOptions {
  projectId: string;
  sandboxId?: string | null; // 🔑 ต้องมี sandboxId
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export function useVisualEdit({ 
  projectId,
  sandboxId,
  onSaveSuccess,
  onSaveError 
}: UseVisualEditOptions) {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // รับ message จาก iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_SELECTED') {
        console.log('📥 Received from iframe:', event.data.data);
        setSelectedElement(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // หา iframe reference - retry ทุก 500ms จนกว่าจะเจอ
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const findIframe = () => {
      const iframe = document.querySelector('iframe[data-preview]') as HTMLIFrameElement;
      if (iframe) {
        iframeRef.current = iframe;
        console.log('✅ Found iframe with data-preview attribute');
        return true;
      }
      
      // ลองหา iframe ทั่วไป
      const anyIframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (anyIframe) {
        iframeRef.current = anyIframe;
        console.log('✅ Found iframe (fallback - no data-preview attribute)');
        return true;
      }
      
      return false;
    };
    
    // ลองหาทันที
    if (findIframe()) return;
    
    // ถ้าไม่เจอ retry ทุก 500ms
    const interval = setInterval(() => {
      attempts++;
      console.log(`🔍 Looking for iframe... (attempt ${attempts}/${maxAttempts})`);
      
      if (findIframe()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.error('❌ Could not find iframe after', maxAttempts, 'attempts');
        clearInterval(interval);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    const newMode = !editMode;
    setEditMode(newMode);
    
    console.log('🎨 Toggle edit mode:', newMode);
    
    // ลองหา iframe ใหม่ทุกครั้ง (เผื่อ iframe reload)
    const iframe = document.querySelector('iframe[data-preview]') as HTMLIFrameElement 
                 || document.querySelector('iframe') as HTMLIFrameElement;
    
    if (iframe) {
      iframeRef.current = iframe;
    }
    
    // ส่งคำสั่งไปยัง iframe
    if (iframeRef.current?.contentWindow) {
      console.log('📤 Sending TOGGLE_EDIT_MODE to iframe:', newMode);
      iframeRef.current.contentWindow.postMessage({
        type: 'TOGGLE_EDIT_MODE',
        enabled: newMode
      }, '*');
      console.log('✅ Message sent to iframe');
    } else {
      console.error('❌ Iframe not found or no contentWindow');
      console.log('🔍 iframe element:', iframeRef.current);
      console.log('🔍 contentWindow:', iframeRef.current?.contentWindow);
    }
    
    if (!newMode) {
      setSelectedElement(null);
    }
  }, [editMode]);

  // บันทึกการแก้ไข (พร้อม Progress Stages)
  const saveEdit = useCallback(async (newValue: any) => {
    if (!selectedElement) {
      console.warn('No element selected');
      return;
    }
    
    if (!sandboxId) {
      console.error('❌ No sandboxId - cannot save (preview not running)');
      if (onSaveError) {
        onSaveError('Preview is not running. Please start preview first.');
      }
      return;
    }

    console.log('💾 Saving edit:', {
      projectId,
      sandboxId,
      blockId: selectedElement.blockId,
      field: selectedElement.field,
      value: newValue
    });

    setIsSaving(true);
    const startTime = Date.now();
    
    try {
      // 📊 Progress Bar Animation (0% → 100% ใน 2 วินาที)
      const totalDuration = 2000; // 2 วินาที
      const steps = 20; // อัปเดต progress 20 ครั้ง
      const stepDuration = totalDuration / steps; // ~100ms per step
      
      // เริ่ม progress animation
      const progressInterval = setInterval(() => {
        setSavingProgress(prev => {
          const next = prev + (100 / steps);
          return next >= 100 ? 100 : next;
        });
      }, stepDuration);
      
      // 🔑 ใช้ Visual Edit API (พร้อมกับ progress bar)
      const success = await visualEditService.updateField({
        projectId,
        blockId: selectedElement.blockId,
        field: selectedElement.field,
        value: newValue,
        type: selectedElement.type as any,
        itemIndex: selectedElement.itemIndex ? parseInt(selectedElement.itemIndex) : undefined
      }, sandboxId);

      if (!success) {
        clearInterval(progressInterval);
        throw new Error('Save operation failed');
      }
      
      console.log('✅ Save API successful');
      
      // รอให้ progress bar ครบ 100%
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      
      if (remaining > 0) {
        await new Promise(r => setTimeout(r, remaining));
      }
      
      // Force progress to 100%
      clearInterval(progressInterval);
      setSavingProgress(100);
      
      // แสดง success สักครู่
      await new Promise(r => setTimeout(r, 300));
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Save completed in ${totalTime}ms`);
      
      // ปิด panel
      setSelectedElement(null);
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
    } catch (error) {
      console.error('❌ Save error:', error);
      setSavingProgress(0);
      if (onSaveError) {
        onSaveError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsSaving(false);
      setSavingProgress(0);
    }
  }, [selectedElement, projectId, sandboxId, onSaveSuccess, onSaveError]);

  // ยกเลิกการแก้ไข
  const cancelEdit = useCallback(() => {
    console.log('❌ Edit cancelled');
    setSelectedElement(null);
  }, []);

  // Keyboard shortcut: Alt + E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'e') {
        e.preventDefault();
        toggleEditMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleEditMode]);

  return {
    editMode,
    selectedElement,
    isSaving,
    savingProgress,
    toggleEditMode,
    saveEdit,
    cancelEdit
  };
}

