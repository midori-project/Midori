'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginSchema} from '@/schemas/auth/login';
import { getValidationErrors, isAuthError } from '@/libs/auth/authService';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // ดึง success message จาก URL parameters
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error เมื่อผู้ใช้เริ่มพิมพ์
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setValidationErrors({});
    clearError();

    // Client-side validation
    const validation = LoginSchema.safeParse(formData);
    
    if (!validation.success) {
      const errors: ValidationErrors = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string' && (field === 'email' || field === 'password')) {
          errors[field as keyof ValidationErrors] = issue.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    try {
      await login(formData.email, formData.password, formData.remember);
      
      // Redirect หลังจาก login สำเร็จ
      router.push('/');
    } catch (error) {
      // Handle validation errors from API
      if (isAuthError(error) && error.details) {
        const apiErrors = getValidationErrors(error);
        setValidationErrors(apiErrors as ValidationErrors);
      }
      // General error จะแสดงผ่าน AuthContext
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-white shadow-xl rounded-xl border border-gray-100 p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="mx-auto w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mb-3 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">เข้าสู่ระบบ</h1>
          <p className="text-xs text-gray-600">ยินดีต้อนรับกลับสู่ Midori</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-emerald-500 mr-1 text-sm">✅</span>
              <span className="text-xs text-emerald-700">{successMessage}</span>
            </div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-2 mb-3">
          <button
            type="button"
            className="w-full flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded-lg shadow-sm bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-3 h-3 mr-1.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          
          <button
            type="button"
            className="w-full flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded-lg shadow-sm bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>

        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-1 bg-white text-gray-500">หรือ</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* General Error */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex items-center">
                <span className="text-red-500 mr-1 text-sm">⚠️</span>
                <span className="text-xs text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                validationErrors.email 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              placeholder="example@email.com"
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-600 mt-0.5" role="alert">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                validationErrors.password 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              placeholder="รหัสผ่านของคุณ"
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p className="text-xs text-red-600 mt-0.5" role="alert">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleInputChange}
                className="h-3 w-3 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-1 text-gray-700">
                จำรหัส
              </label>
            </div>
            <a href="/forgot-password" className="text-emerald-600 hover:text-emerald-500">
              ลืมรหัสผ่าน?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-1.5 px-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังเข้าสู่ระบบ...
              </div>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-600">
            ยังไม่มีบัญชี?{' '}
            <a 
              href="/register" 
              className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
            >
              สมัครสมาชิก
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
