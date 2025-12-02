/**
 * Daytona Configuration
 * 
 * วิธีตั้งค่า:
 * 1. ไปที่ https://www.daytona.io/docs/ และสร้าง API Key
 * 2. ตั้งค่า environment variable: DAYTONA_API_KEY
 * 3. ตั้งค่า DAYTONA_BASE_URL (ถ้าต้องการ)
 */

export const daytonaConfig = {
  // API Key - ตั้งค่าใน environment variable
  apiKey: process.env.DAYTONA_API_KEY,
  
  // Base URL สำหรับ Daytona API
  baseUrl: process.env.DAYTONA_BASE_URL || 'https://api.daytona.io',
  
  // Default sandbox configuration
  defaultSandboxConfig: {
    language: 'typescript',
    // template: 'react-vite', // ถ้ามี template สำหรับ React
  },
  
  // Limits
  limits: {
    maxUsagePerDay: 3600, // 1 ชั่วโมง (วินาที)
    maxConcurrentSandboxes: 1, // จำกัด 1 sandbox ต่อผู้ใช้
  },
  
  // Timeouts
  timeouts: {
    sandboxCreation: 300000, // 5 นาที
    buildProcess: 600000, // 10 นาที
    statusPolling: 10000, // 10 วินาที
  },
};

export function validateDaytonaConfig(): { isValid: boolean; error?: string } {
  if (!daytonaConfig.apiKey) {
    return {
      isValid: false,
      error: 'DAYTONA_API_KEY is not configured. Please set it in your environment variables.'
    };
  }
  
  return { isValid: true };
}

export function getDaytonaClient() {
  const validation = validateDaytonaConfig();
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  return {
    apiKey: daytonaConfig.apiKey!,
    baseUrl: daytonaConfig.baseUrl,
  };
}
