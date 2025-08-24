'use client';
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService, User, AuthError, isAuthError, getErrorMessage } from '@/libs/auth/authService';

// Types
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refetchUser: () => Promise<void>;
}

// Actions
type AuthAction =
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGIN_ERROR'; error: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; user: User }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.error,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: 'LOADING' });
      
      try {
        const response = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', user: response.user });
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, remember = false) => {
    dispatch({ type: 'LOADING' });

    try {
      const response = await authService.login({ email, password, remember });
      dispatch({ type: 'LOGIN_SUCCESS', user: response.user });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch({ type: 'LOGIN_ERROR', error: errorMessage });
      throw error; // Re-throw เพื่อให้ component จัดการ validation errors
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: 'LOADING' });

    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' });
      console.error('Logout error:', error);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refetch user data
  const refetchUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      dispatch({ type: 'SET_USER', user: response.user });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">กำลังโหลด...</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700">กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้</span>
            </div>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
