import { useState, useCallback } from 'react';
import axios from 'axios';
import { 
  SiteGenRequest, 
  SiteGenResponse, 
  GeneratedFile,
  DEFAULT_GENERATION_OPTIONS 
} from '@/types/sitegen';

interface UseSiteGenReturn {
  // State
  isGenerating: boolean;
  generationId: string | null;
  progress: number;
  currentTask: string;
  files: GeneratedFile[];
  projectStructure: any;
  error: string | null;
  projectId?: string | null; // เพิ่ม projectId
  
  // Actions
  generateSite: (finalJson: any, options?: any) => Promise<void>;
  checkStatus: (id: string) => Promise<void>;
  downloadFiles: () => void;
  reset: () => void;
  emergencyStop: () => void; // เพิ่มฟังก์ชันหยุดฉุกเฉิน
  
  // Status
  isCompleted: boolean;
  isFailed: boolean;
  totalFiles: number;
}

/**
 * Hook for site generation functionality
 */
export function useSiteGen(): UseSiteGenReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [projectStructure, setProjectStructure] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Keep track of current polling interval
  const [currentPollingInterval, setCurrentPollingInterval] = useState<NodeJS.Timeout | null>(null);

  /**
   * Start site generation
   */
  const generateSite = useCallback(async (finalJson: any, options = {}) => {
    if (!finalJson) {
      setError('finalJson is required');
      return;
    }

    console.log('🚀 Starting site generation...');
    console.log('Final JSON:', finalJson);
    console.log('Options:', options);

    // Store projectId from options (if passed from useChat)
    const currentProjectId = (options as any)?.projectId || (options as any)?.sessionId;
    setProjectId(currentProjectId);
    
    console.log('🔧 Project ID for file saving:', currentProjectId);
    console.log('🔍 Options debug:', JSON.stringify(options, null, 2));

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setCurrentTask('Initializing...');
    setIsCompleted(false);
    setIsFailed(false);
    setFiles([]);
    setProjectStructure(null);

    try {
      const requestData: SiteGenRequest = {
        finalJson,
        options: { ...DEFAULT_GENERATION_OPTIONS, ...options }
      };

      console.log('📝 Sending request:', requestData);

      const response = await axios.post('/api/gensite', requestData);
      const data: SiteGenResponse = response.data;

      console.log('✅ Generation started:', data);

      if (data.success && data.generationId) {
        setGenerationId(data.generationId);
        setCurrentTask('Site generation started...');
    

        // Start polling for status updates
        console.log('🎯 Starting status polling for ID:', data.generationId);
        const intervalId = startStatusPolling(data.generationId);
        setCurrentPollingInterval(intervalId);
        console.log('⏰ Polling interval ID set:', intervalId);
      } else {
        throw new Error(data.error || 'Failed to start generation');
      }

    } catch (err) {
      console.error('❌ Site generation error:', err);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการสร้างเว็บไซต์';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 401) {
          errorMessage = 'กรุณาเข้าสู่ระบบก่อนใช้งาน';
        } else if (err.response?.status === 429) {
          errorMessage = 'เกินจำนวนการใช้งานที่กำหนด กรุณาลองใหม่ในภายหลัง';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsFailed(true);
      setIsGenerating(false);
    }
  }, []);

  /**
   * Check generation status
   */
  const checkStatus = useCallback(async (id: string) => {
    try {
      console.log('🔍 Checking status for generation:', id);
      
      const response = await axios.get(`/api/gensite?id=${id}`);
      const data: SiteGenResponse = response.data;

      console.log('📊 Status response:', data);

      if (data.success) {
        // Update UI based on status
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
          setProgress(100);
          setCurrentTask('Completed!');
          setIsCompleted(true);
          setIsGenerating(false);
          
          console.log('✅ Generation completed!');
          console.log(`📁 Generated ${data.files.length} files`);
          
          // Save generated files to database if we have a projectId
          if (projectId) {
            console.log('💾 Saving generated files to database...');
            console.log('📊 Project ID:', projectId);
            console.log('📁 Files to save:', data.files?.length || 0);
            console.log('📋 Files data:', data.files?.slice(0, 2)); // Show first 2 files for debug
            try {
              const response = await axios.post('/api/versions', {
                projectId: projectId,
                code: data.files // บันทึกไฟล์ทั้งหมดที่สร้าง
              });
              console.log('✅ Generated files saved to versions table', response.data);
            } catch (error) {
              console.error('❌ Failed to save generated files:', error);
              if (axios.isAxiosError(error)) {
                console.error('📝 Axios error details:', error.response?.data);
              }
            }
          } else {
            console.log('⚠️ No projectId available, skipping file save to database');
            console.log('🔍 Current projectId state:', projectId);
          }
        }

        if (data.projectStructure) {
          setProjectStructure(data.projectStructure);
        }

        if (data.totalFiles) {
          setTotalFiles(data.totalFiles);
        }

      } else {
        throw new Error(data.error || 'Failed to get status');
      }

    } catch (err) {
      console.error('❌ Status check error:', err);
      
      // Don't set error for status checks, just log
      // The polling will retry automatically
    }
  }, []);

  /**
   * Start polling for status updates
   */
  const startStatusPolling = useCallback((id: string) => {
    let pollCount = 0;
    const maxPolls = 600; // เพิ่มจาก 450 เป็น 600 (20 นาที)
    let intervalId: NodeJS.Timeout;
    let filesGeneratedSince = Date.now();
    const maxIdleTime = 600000; // เพิ่มจาก 3.5 นาที เป็น 10 นาที
    
    // Clear any existing polling first
    if (currentPollingInterval) {
      console.log('🧹 Clearing existing polling interval');
      clearInterval(currentPollingInterval);
      setCurrentPollingInterval(null);
    }
    
    console.log(`🚀 Starting Frontend-only polling for ID: ${id} (max ${maxPolls} polls, ${maxIdleTime}ms idle timeout)`);
    
    const pollFunction = async () => {
      pollCount++;
      
      try {
        console.log(`🔍 Polling attempt ${pollCount}/${maxPolls} for generation ${id}`);
        
        // แสดงข้อมูลความคืบหน้าให้ user เห็น
        if (pollCount <= 50) {
          setCurrentTask(`🤖 AI กำลังวิเคราะห์โปรเจกต์... (${pollCount}/210)`);
        } else if (pollCount <= 100) {
          setCurrentTask(`⚙️ กำลังสร้างไฟล์... (${pollCount}/210)`);
        } else if (pollCount <= 150) {
          setCurrentTask(`🔄 กำลังปรับปรุงและรวบรวมไฟล์... (${pollCount}/210)`);
        } else {
          setCurrentTask(`✨ กำลังสรุปผล... (${pollCount}/210)`);
        }
        
        const response = await axios.get(`/api/gensite?id=${id}`);
        const data = response.data;

        console.log('📊 Status response:', data);
        
        // 🆕 Debug info
        console.log('🔍 Debug Info:', {
          hasFiles: !!(data.files && data.files.length > 0),
          filesCount: data.files?.length || 0,
          status: data.status,
          message: data.message,
          pollCount: pollCount,
          totalFiles: data.totalFiles,
          idleTime: Date.now() - filesGeneratedSince
        });

        if (data.success) {
          // Check if files were generated recently
          if (data.totalFiles && data.totalFiles > 0) {
            filesGeneratedSince = Date.now();
          }

          // ✅ SUCCESS - Update UI and STOP polling
          if (data.files && data.files.length > 0) {
            setFiles(data.files);
            setProgress(100);
            setCurrentTask('Completed!');
            setIsCompleted(true);
            setIsGenerating(false);
            
            console.log('✅ Generation completed! Stopping polling.');
            console.log(`📁 Generated ${data.files.length} files`);
            
            // CRITICAL: STOP POLLING IMMEDIATELY
            if (intervalId) {
              console.log('🛑 Clearing interval ID:', intervalId);
              clearInterval(intervalId);
              setCurrentPollingInterval(null);
            }
            return; // Exit function completely
          }

          // 🆕 เพิ่มการตรวจสอบ status ที่ชัดเจนขึ้น
          if (data.status === 'completed' || data.message?.includes('completed') || data.message?.includes('เสร็จสิ้น')) {
            console.log('✅ Generation marked as completed, stopping polling');
            setProgress(100);
            setCurrentTask('Completed!');
            setIsCompleted(true);
            setIsGenerating(false);
            
            if (intervalId) {
              console.log('🛑 Clearing interval on completion:', intervalId);
              clearInterval(intervalId);
              setCurrentPollingInterval(null);
            }
            return; // Exit function completely
          }

          // 🆕 เพิ่มการตรวจสอบ error status
          if (data.status === 'failed' || data.message?.includes('Error') || data.message?.includes('ข้อผิดพลาด')) {
            console.log('❌ Generation failed based on status/message');
            setError(data.message || 'Generation failed');
            setIsFailed(true);
            setIsGenerating(false);
            
            if (intervalId) {
              console.log('🛑 Clearing interval on failure:', intervalId);
              clearInterval(intervalId);
              setCurrentPollingInterval(null);
            }
            return; // Exit function completely
          }

          // Update other data but continue polling if no files yet
          if (data.projectStructure) {
            setProjectStructure(data.projectStructure);
          }

          if (data.totalFiles) {
            setTotalFiles(data.totalFiles);
          }
          
          // Update progress for ongoing generation
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
          
          if (data.currentTask) {
            setCurrentTask(data.currentTask);
          }
          
          // 🆕 แสดง message ปัจจุบัน
          if (data.message) {
            setCurrentTask(data.message);
          }
          
        } else {
          // ❌ FAILURE - Stop polling
          console.log('❌ Generation failed, stopping polling');
          setError(data.error || 'Generation failed');
          setIsFailed(true);
          setIsGenerating(false);
          
          if (intervalId) {
            console.log('🛑 Clearing interval on failure:', intervalId);
            clearInterval(intervalId);
            setCurrentPollingInterval(null);
          }
          return; // Exit function completely
        }
        
        // ⏰ TIMEOUT CHECKS
        
        // 1. Max polls reached
        if (pollCount >= maxPolls) {
          console.log('⏰ Max polls reached, stopping');
          setError('การสร้างเว็บไซต์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
          setIsFailed(true);
          setIsGenerating(false);
          
          if (intervalId) {
            console.log('🛑 Clearing interval on timeout:', intervalId);
            clearInterval(intervalId);
            setCurrentPollingInterval(null);
          }
          return;
        }
        
        // 2. Idle timeout - no files generated for too long
        const idleTime = Date.now() - filesGeneratedSince;
        if (idleTime > maxIdleTime && pollCount > 20) {
          console.log(`⏰ Idle timeout: No files for ${idleTime}ms`);
          setError('Frontend generation ใช้เวลานานกว่าปกติ กรุณาลองใหม่อีกครั้ง');
          setIsFailed(true);
          setIsGenerating(false);
          
          if (intervalId) {
            console.log('🛑 Clearing interval on idle timeout:', intervalId);
            clearInterval(intervalId);
            setCurrentPollingInterval(null);
          }
          return;
        }
        
        // 3. Force stop - no files after 4 minutes (ปรับจาก 5 นาที)
        if (pollCount >= 120 && (!data.files || data.files.length === 0)) {
          console.log('🚫 Force stopping: No files after 4 minutes');
          setError('Frontend generation ใช้เวลานานกว่าปกติ กรุณาลองใหม่อีกครั้ง');
          setIsFailed(true);
          setIsGenerating(false);
          
          if (intervalId) {
            console.log('🛑 Clearing interval on force stop:', intervalId);
            clearInterval(intervalId);
            setCurrentPollingInterval(null);
          }
          return;
        }
        
      } catch (error) {
        console.error('❌ Polling error:', error);
        
        // Handle specific error types
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            console.log('📋 Generation session not found, it may have completed or expired');
            setError('Generation session หมดอายุ หรือเสร็จสิ้นแล้ว กรุณาลองสร้างใหม่');
            setIsFailed(true);
            setIsGenerating(false);
            
            if (intervalId) {
              console.log('🛑 Clearing interval on 404:', intervalId);
              clearInterval(intervalId);
              setCurrentPollingInterval(null);
            }
            return;
          }
        }
        
        // Stop polling on repeated network errors (more lenient)
        if (pollCount >= 10) {
          console.log('🚫 Too many network errors, stopping polling');
          setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
          setIsFailed(true);
          setIsGenerating(false);
          
          if (intervalId) {
            console.log('🛑 Clearing interval on network error:', intervalId);
            clearInterval(intervalId);
            setCurrentPollingInterval(null);
          }
          return; // Exit function completely
        }
        
        // For other errors, just log and continue polling
        console.log(`⚠️ Polling attempt ${pollCount} failed, will retry...`);
      }
    };

    // Start polling
    console.log('🚀 Starting new polling interval');
    intervalId = setInterval(pollFunction, 2000); // Poll every 2 seconds
    setCurrentPollingInterval(intervalId);
    
    // Auto-stop after 20 minutes (backup safety) - เพิ่มจาก 15 นาที
    setTimeout(() => {
      if (intervalId) {
        console.log('🕐 20 minute timeout, force stopping polling');
        clearInterval(intervalId);
        setCurrentPollingInterval(null);
        setError('การสร้างเว็บไซต์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
        setIsFailed(true);
        setIsGenerating(false);
      }
    }, 20 * 60 * 1000); // เพิ่มจาก 15 นาที เป็น 20 นาที

    return intervalId;
  }, [currentPollingInterval]); // Include dependency for proper cleanup

  /**
   * Download generated files as ZIP
   */
  const downloadFiles = useCallback(() => {
    if (!files || files.length === 0) {
      console.warn('No files to download');
      return;
    }

    try {
      console.log('📥 Preparing download...');
      
      // Create a simple download of all files as JSON
      // In production, you might want to create a ZIP file
      const dataStr = JSON.stringify({
        projectStructure,
        files: files.map(file => ({
          path: file.path,
          content: file.content,
          type: file.type,
          language: file.language
        }))
      }, null, 2);
      
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectStructure?.name || 'generated-website'}-files.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('✅ Download initiated');
      
    } catch (error) {
      console.error('❌ Download error:', error);
      setError('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
    }
  }, [files, projectStructure]);

  /**
   * Emergency stop function - หยุด polling ทันที
   */
  const emergencyStop = useCallback(() => {
    console.log('🚨 Emergency stop triggered!');
    
    // Stop any ongoing polling immediately
    if (currentPollingInterval) {
      console.log('🛑 Emergency: Clearing polling interval');
      clearInterval(currentPollingInterval);
      setCurrentPollingInterval(null);
    }
    
    // Reset generation state
    setIsGenerating(false);
    setError('การสร้างเว็บไซต์ถูกหยุดโดยผู้ใช้');
    setIsFailed(true);
    setCurrentTask('หยุดการทำงาน');
    
    console.log('✅ Emergency stop completed');
  }, [currentPollingInterval]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    console.log('🔄 Resetting site generation state');
    
    // Stop any ongoing polling FIRST
    if (currentPollingInterval) {
      console.log('🛑 Clearing existing polling interval');
      clearInterval(currentPollingInterval);
      setCurrentPollingInterval(null);
    }
    
    // Reset all states
    setIsGenerating(false);
    setGenerationId(null);
    setProgress(0);
    setCurrentTask('');
    setFiles([]);
    setProjectStructure(null);
    setError(null);
    setIsCompleted(false);
    setIsFailed(false);
    setTotalFiles(0);
    
    console.log('✅ Site generation state reset completed');
  }, [currentPollingInterval]);

  return {
    // State
    isGenerating,
    generationId,
    progress,
    currentTask,
    files,
    projectStructure,
    error,
    projectId,
    
    // Actions
    generateSite,
    checkStatus,
    downloadFiles,
    reset,
    emergencyStop, // เพิ่มฟังก์ชันหยุดฉุกเฉิน
    
    // Status
    isCompleted,
    isFailed,
    totalFiles,
  };
}
