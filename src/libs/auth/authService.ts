import axios, { AxiosError } from 'axios';

// Types for auth service
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

export class AuthService {
  private baseURL: string;

  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * เข้าสู่ระบบด้วย email และ password
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
   * ลงทะเบียนผู้ใช้ใหม่
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await axios.post<RegisterResponse>(`${this.baseURL}/api/auth/register`, data, {
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
   * ออกจากระบบ
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
   * ดึงข้อมูลผู้ใช้ปัจจุบัน
   */
  async getCurrentUser(): Promise<MeResponse> {
    try {
      // ใช้ validate endpoint แทน me endpoint เพราะไม่มี me route
      const response = await axios.get(`${this.baseURL}/api/auth/validate`, {
        withCredentials: true,
      });
      
      const data = response.data;
      
      if (!data.valid || !data.user) {
        throw new Error('Invalid session');
      }
      
      // แปลง response ให้ตรงกับ MeResponse format
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.displayName || null,
          avatarUrl: data.user.avatarUrl || null,
          createdAt: data.user.createdAt,
          lastLoginAt: data.user.lastLoginAt
        },
        session: {
          id: '', // ไม่มีข้อมูล session id ใน validate response
          createdAt: '',
          lastActiveAt: null,
          expiresAt: '',
        }
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as AuthError;
      }
      throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    }
  }

  /**
   * ตรวจสอบว่าผู้ใช้ยัง login อยู่หรือไม่
   */
  async checkAuth(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

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
