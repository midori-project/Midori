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

  // บันทึกการแก้ไข
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
    try {
      // 🔑 ใช้ Visual Edit API
      const success = await visualEditService.updateField({
        projectId,
        blockId: selectedElement.blockId,
        field: selectedElement.field,
        value: newValue,
        type: selectedElement.type as any,
        itemIndex: selectedElement.itemIndex ? parseInt(selectedElement.itemIndex) : undefined
      }, sandboxId);

      if (success) {
        console.log('✅ Save successful to database via partial update');
        
        // ไม่ต้อง reload iframe เพราะ partial update จะอัปเดตใน sandbox ทันที
        // แค่ปิด panel
        setSelectedElement(null);
        
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        console.error('❌ Save failed');
        if (onSaveError) {
          onSaveError('Failed to save changes');
        }
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      if (onSaveError) {
        onSaveError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setIsSaving(false);
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
    toggleEditMode,
    saveEdit,
    cancelEdit
  };
}

