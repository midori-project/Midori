import axios, { AxiosError } from 'axios';

// Types for auth HTTP service
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Session {
  id: string;
  createdAt: string;
  lastActiveAt: string | null;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  message: string;
  user: User;
}

export interface RegisterResponse {
  success: true;
  message: string;
  user: User;
}

export interface MeResponse {
  success: true;
  user: User & {
    createdAt: string;
    lastLoginAt: string | null;
  };
  session: Session;
}

export interface AuthError {
  success: false;
  error: string;
  details?: Record<string, string>;
}

/**
 * Auth HTTP Service - สำหรับเรียก external APIs และ internal APIs ผ่าน HTTP
 * ใช้ในกรณีที่ต้องการเรียก API ภายนอก หรือ mobile apps เรียก API ของเรา
 */
export class AuthHttpService {
  private baseURL: string;

  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * เข้าสู่ระบบด้วย email และ password ผ่าน API
   * ใช้สำหรับ external clients หรือกรณีที่ต้องการ HTTP call
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${this.baseURL}/api/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // สำคัญ: เพื่อส่ง cookies
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as AuthError;
      }
      throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  }

  /**
   * ลงทะเบียนผู้ใช้ใหม่ผ่าน API
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await axios.post<RegisterResponse>(`${this.baseURL}/api/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as AuthError;
      }
      throw new Error('เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }
  }

  /**
   * ออกจากระบบผ่าน API
   */
  async logout(): Promise<{ success: true; message: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as AuthError;
      }
      throw new Error('เกิดข้อผิดพลาดในการออกจากระบบ');
    }
  }

  /**
   * ดึงข้อมูลผู้ใช้ปัจจุบันผ่าน API
   */
  async getCurrentUser(): Promise<MeResponse> {
    try {
      const response = await axios.get<MeResponse>(`${this.baseURL}/api/auth/me`, {
        withCredentials: true,
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as AuthError;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    }
  }

  /**
   * ตรวจสอบว่าผู้ใช้ยัง login อยู่หรือไม่ผ่าน API
   */
  async checkAuth(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * เรียก external API สำหรับ OAuth หรือ third-party services
   */
  async callExternalAPI<T>(
    url: string, 
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', data, headers = {} } = options;
    
    try {
      const response = await axios.request<T>({
        url,
        method,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`External API Error: ${error.message}`);
      }
      throw new Error('เกิดข้อผิดพลาดในการเรียก external API');
    }
  }
}

// Export singleton instance สำหรับ HTTP calls
export const authHttpService = new AuthHttpService();

// Export utility functions
export const isAuthError = (error: unknown): error is AuthError => {
  return typeof error === 'object' && error !== null && 'success' in error && error.success === false;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAuthError(error)) {
    return error.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

export const getValidationErrors = (error: unknown): Record<string, string> => {
  if (isAuthError(error) && error.details) {
    return error.details;
  }
  return {};
};
