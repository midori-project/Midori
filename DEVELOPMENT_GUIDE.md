# 📚 Development Guide: Midori AI Website Generator

## 📋 สารบัญ

1. [ภาพรวมโปรเจค](#ภาพรวมโปรเจค)
2. [การตั้งค่าโปรเจค](#การตั้งค่าโปรเจค)
3. [กฎการพัฒนา](#กฎการพัฒนา)
4. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
5. [การเขียนโค้ด](#การเขียนโค้ด)
6. [การทดสอบ](#การทดสอบ)
7. [การ Deploy](#การ-deploy)
8. [การบำรุงรักษา](#การบำรุงรักษา)

---

## 🌟 ภาพรวมโปรเจค

**Midori** เป็น AI-powered website generator ที่ช่วยผู้ใช้สร้างเว็บไซต์จากข้อความธรรมชาติ ระบบใช้ AI ชื่อ Midori ที่จะช่วยวิเคราะห์ความต้องการและสร้างโค้ดเว็บไซต์ที่สมบูรณ์

### 🎯 เป้าหมายหลัก
- สร้างเว็บไซต์จากข้อความธรรมชาติ
- ประสบการณ์ผู้ใช้ที่ดีและใช้งานง่าย
- ความปลอดภัยและประสิทธิภาพสูง
- การเรียนรู้และพัฒนาต่อเนื่อง

### 🏗️ Tech Stack (ปัจจุบัน)
- **Frontend**: Next.js 15.4.5 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Local Database
- **AI**: OpenAI + DeepSeek
- **Editor**: Monaco Editor
- **Code Preview**: Sandpack
- **Database**: Local SQLite/PostgreSQL (Development)

### 🏗️ Tech Stack (แผนในอนาคต)
- **Frontend**: Next.js 15.4.5 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase/AWS
- **AI**: OpenAI + DeepSeek
- **Editor**: Monaco Editor
- **Code Preview**: Sandpack
- **Database**: Supabase (PostgreSQL) / AWS RDS

---

## ⚙️ การตั้งค่าโปรเจค

### Prerequisites
```bash
# Node.js 18+ และ npm
node --version
npm --version

# Git
git --version

# Local Database (optional)
# SQLite (built-in) หรือ PostgreSQL
```

### การติดตั้ง
```bash
# Clone โปรเจค
git clone <repository-url>
cd midori-production

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env.local
cp .env.example .env.local

# รันโปรเจค
npm run dev
```

### Environment Variables (Development)
```env
# AI Services
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key

# Local Development
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Local Database (optional)
DATABASE_URL=file:./dev.db
# หรือ
DATABASE_URL=postgresql://username:password@localhost:5432/midori_dev
```

### Environment Variables (Future Production)
```env
# Supabase (เมื่อ deploy)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key

# Production
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

---

## 📋 กฎการพัฒนา

### 1. การเขียนโค้ด
- ✅ ใช้ TypeScript เสมอ
- ✅ ห้ามใช้ type any (ต้องกำหนด type ที่ชัดเจน)
- ✅ ใช้ axios.method สำหรับ HTTP requests
- ✅ ใช้ Sandpack สำหรับ code preview
- ✅ ใช้ Zod สำหรับ validation
- ✅ ใช้ Tailwind CSS สำหรับ styling
- ✅ ปฏิบัติตาม ESLint rules
- ✅ เขียน JSDoc comments

### 2. การตั้งชื่อ
```typescript
// ✅ ดี - ใช้ PascalCase สำหรับ components
const UserProfile: React.FC = () => {};

// ✅ ดี - ใช้ camelCase สำหรับ functions
const getUserData = () => {};

// ✅ ดี - ใช้ UPPER_SNAKE_CASE สำหรับ constants
const API_ENDPOINTS = {
  USERS: '/api/users',
  PROJECTS: '/api/projects',
};

// ✅ ดี - ใช้ kebab-case สำหรับ files
// user-profile.tsx
// api-endpoints.ts
```

### 3. Type Safety
```typescript
// ❌ ไม่ดี - ใช้ any
const handleData = (data: any) => {
  return data.someProperty; // ไม่ปลอดภัย
};

// ✅ ดี - ใช้ unknown สำหรับข้อมูลที่ไม่ทราบ type
const handleData = (data: unknown) => {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return (data as { someProperty: string }).someProperty;
  }
  return 'default';
};

// ✅ ดี - ใช้ interface ที่ชัดเจน
interface UserData {
  id: string;
  name: string;
  email: string;
}

const handleUser = (user: UserData) => {
  return user.name; // ปลอดภัยและมี autocomplete
};

// ✅ ดี - ใช้ generic types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ✅ ดี - ใช้ axios.method
const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await axios.get<ApiResponse<T>>(url);
    return response.data;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
  }
};

const postData = async <T, D>(url: string, data: D): Promise<ApiResponse<T>> => {
  try {
    const response = await axios.post<ApiResponse<T>>(url, data);
    return response.data;
  } catch (error) {
    throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');
  }
};
```

### 3. การจัดการ State และ Context

#### Server Components - ไม่ใช้ State Management
```typescript
// ✅ ดี - Server Components ไม่ต้องการ state management
// ข้อมูลมาจาก props หรือ server-side data fetching
const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

#### Client Components - ใช้ State Management
```typescript
// ✅ ดี - ใช้ React Hooks สำหรับ local state
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(false);

// ✅ ดี - ใช้ Context สำหรับ global state
const UserContext = createContext<UserContextType | undefined>(undefined);

// ✅ ดี - ใช้ custom hooks
const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  // ... logic
  return { user, setUser, loading };
};
```

#### Context Provider (Client Component เท่านั้น)
```typescript
// ✅ ตัวอย่างที่ดี - Context Provider
// app/context/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

const UserUpdateSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร').optional(),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional(),
  avatar: z.string().url('URL ไม่ถูกต้อง').optional(),
});

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Validate input
      const validatedData = LoginSchema.parse({ email, password });

      const response = await axios.post('/api/auth/login', validatedData);
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('ข้อมูลไม่ถูกต้อง: ' + error.errors[0].message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      // Validate input
      const validatedData = UserUpdateSchema.parse(userData);

      const response = await axios.put('/api/auth/profile', validatedData);
      
      if (response.data.success) {
        setUser(prev => prev ? { ...prev, ...response.data.user } : null);
      } else {
        throw new Error(response.data.error || 'อัปเดตข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('ข้อมูลไม่ถูกต้อง: ' + error.errors[0].message);
      }
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

#### การใช้งาน Context ใน Layout
```typescript
// ✅ ตัวอย่างที่ดี - Root Layout ที่ใช้ Context Provider
// app/layout.tsx
import { UserProvider } from '@/context/UserContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

#### การใช้งาน Context ใน Client Components
```typescript
// ✅ ตัวอย่างที่ดี - Client Component ที่ใช้ Context
// app/components/client/UserMenu/UserMenu.tsx
'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';

const UserMenu: React.FC = () => {
  const { user, loading, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex space-x-2">
        <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
          เข้าสู่ระบบ
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          สมัครสมาชิก
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            onClick={() => {
              // Handle profile click
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            โปรไฟล์
          </button>
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
```

### 4. การจัดการ Error และ Error Boundaries

#### Server Components - Error Handling
```typescript
// ✅ ดี - Server Components ใช้ try-catch และ error.tsx
// app/components/server/UserProfile/UserProfile.tsx
const UserProfile: React.FC<{ userId: string }> = async ({ userId }) => {
  try {
    const userData = await getUserData(userId);
    
    if (!userData) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">{userData.name}</h2>
        <p className="text-gray-600">{userData.email}</p>
      </div>
    );
  } catch (error) {
    // Server Components จะ redirect ไปยัง error.tsx หรือ throw error
    throw error;
  }
};

// ✅ ดี - Global Error Boundary สำหรับ Server Components
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Server Component Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            เกิดข้อผิดพลาด
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'}
          </p>
          <div className="mt-6">
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Client Components - Error Boundaries
```typescript
// ✅ ดี - Error Boundary สำหรับ Client Components
// app/components/client/ErrorBoundary/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Client Component Error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                เกิดข้อผิดพลาด
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {this.state.error?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### การใช้งาน Error Boundaries
```typescript
// ✅ ตัวอย่างที่ดี - ใช้ Error Boundary ใน Client Components
// app/components/client/UserDashboard/UserDashboard.tsx
'use client';

import React from 'react';
import ErrorBoundary from '@/components/client/ErrorBoundary/ErrorBoundary';
import UserProfile from '@/components/server/UserProfile/UserProfile';
import ProjectList from '@/components/client/ProjectList/ProjectList';

const UserDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <div className="space-y-6">
      {/* Server Component - ไม่ต้องการ Error Boundary */}
      <UserProfile userId={userId} />
      
      {/* Client Component - ใช้ Error Boundary */}
      <ErrorBoundary
        fallback={
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              ไม่สามารถโหลดรายการโปรเจคได้ กรุณาลองใหม่อีกครั้ง
            </p>
          </div>
        }
        onError={(error, errorInfo) => {
          // ส่งข้อมูล error ไปยัง analytics service
          console.error('ProjectList Error:', error, errorInfo);
        }}
      >
        <ProjectList userId={userId} />
      </ErrorBoundary>
    </div>
  );
};

export default UserDashboard;
```

#### API Error Handling
```typescript
// ✅ ดี - ใช้ try-catch ใน API calls
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API Error:', error);
  
  // จัดการ error ตามประเภท
  if (error instanceof axios.AxiosError) {
    if (error.response?.status === 401) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    } else if (error.response?.status === 404) {
      throw new Error('ไม่พบข้อมูลที่ต้องการ');
    } else if (error.response?.status >= 500) {
      throw new Error('เกิดข้อผิดพลาดในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
    }
  }
  
  throw new Error('เกิดข้อผิดพลาดในการเรียก API');
}
```

---

## 🏗️ สถาปัตยกรรมระบบ

### โครงสร้างไฟล์
```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication APIs
│   │   ├── chat_history/   # Chat history APIs
│   │   ├── deepseek/       # DeepSeek AI APIs
│   │   ├── gensite/        # Site generation APIs
│   │   ├── openai/         # OpenAI APIs
│   │   ├── projects/       # Project management APIs
│   │   ├── prompts/        # Prompt management APIs
│   │   └── versions/       # Version control APIs
│   ├── component/          # React components
│   │   ├── navbar/         # Navigation components
│   │   ├── preview/        # Code preview components
│   │   ├── promptbox/      # Prompt input components
│   │   └── sitegen/        # Site generator components
│   ├── context/            # React contexts
│   ├── page/               # Pages
│   └── layout.tsx          # Root layout
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
└── utils/                  # Utility functions
```

### Data Flow (Development)
```
User Input → AI Analysis → Code Generation → Live Preview → Local Storage
     ↓              ↓              ↓              ↓              ↓
Chat Interface → Prompt Engine → AI Services → Monaco Editor → Local DB
```

### Data Flow (Future Production)
```
User Input → AI Analysis → Code Generation → Live Preview → Cloud Database
     ↓              ↓              ↓              ↓              ↓
Chat Interface → Prompt Engine → AI Services → Monaco Editor → Supabase/AWS
```

---

## 💻 การเขียนโค้ด

### 🎯 การแยก Client Components และ Server Components

ใน Next.js 15 App Router มีการแยก components เป็น 2 ประเภทหลัก:

#### 1. Server Components (ค่าเริ่มต้น)
- ✅ **ทำงานบน Server** - ไม่มี JavaScript ใน browser
- ✅ **Performance สูง** - ลด bundle size
- ✅ **SEO ดี** - เนื้อหาถูก render บน server
- ✅ **เข้าถึง Database โดยตรง** - ไม่ต้องผ่าน API
- ✅ **ใช้ได้กับ** - การแสดงข้อมูล, Layout, Static content

#### 2. Client Components
- ✅ **ทำงานบน Browser** - มี JavaScript และ interactivity
- ✅ **ใช้ได้กับ** - Event handlers, useState, useEffect, Browser APIs
- ✅ **ต้องใช้** - เมื่อต้องการ interactivity หรือ browser-specific features

### 📁 โครงสร้างการจัดไฟล์

```
src/
├── app/
│   ├── (routes)/           # Server Components (Pages)
│   │   ├── page.tsx       # Server Component
│   │   ├── layout.tsx     # Server Component
│   │   └── loading.tsx    # Server Component
│   └── components/
│       ├── server/        # Server Components
│       │   ├── Header/
│       │   ├── Footer/
│       │   └── Sidebar/
│       └── client/        # Client Components
│           ├── Button/
│           ├── Form/
│           └── Modal/
├── hooks/                 # Custom hooks (Client only)
└── utils/                 # Utility functions
```

### 🔧 การเขียน Server Components

```typescript
// ✅ ตัวอย่างที่ดี - Server Component
// app/components/server/UserProfile/UserProfile.tsx
import { z } from 'zod';
import { getUserData } from '@/utils/database';

// Types
interface UserProfileProps {
  userId: string;
}

// Validation schema
const UserProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Server Component - ไม่มี 'use client'
const UserProfile: React.FC<UserProfileProps> = async ({ userId }) => {
  // Validate props
  const validatedProps = UserProfileSchema.parse({ userId });

  // เรียกข้อมูลจาก Database โดยตรง (Server-side)
  const userData = await getUserData(validatedProps.userId);

  if (!userData) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">ไม่พบข้อมูลผู้ใช้</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-600">
            {userData.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {userData.name}
          </h2>
          <p className="text-gray-600">{userData.email}</p>
          <p className="text-sm text-gray-500">
            สมาชิกตั้งแต่ {new Date(userData.createdAt).toLocaleDateString('th-TH')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
```

### 🔧 การเขียน Client Components

```typescript
// ✅ ตัวอย่างที่ดี - Client Component
// app/components/client/InteractiveForm/InteractiveForm.tsx
'use client'; // ต้องมีบรรทัดนี้เสมอ

import React, { useState } from 'react';
import { z } from 'zod';
import axios from 'axios';

// Types
interface InteractiveFormProps {
  initialData?: {
    name: string;
    email: string;
  };
  onSubmit?: (data: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
}

// Validation schema
const FormDataSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
});

// Client Component - มี 'use client' และใช้ React hooks
const InteractiveForm: React.FC<InteractiveFormProps> = ({ 
  initialData, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = FormDataSchema.parse(formData);
      setErrors({});

      // Submit data
      if (onSubmit) {
        onSubmit(validatedData);
      } else {
        // Default API call
        await axios.post('/api/users', validatedData);
      }

      // Reset form
      setFormData({ name: '', email: '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Form submission error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          ชื่อ
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : ''
          }`}
          placeholder="กรอกชื่อของคุณ"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          อีเมล
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : ''
          }`}
          placeholder="กรอกอีเมลของคุณ"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูล'}
      </button>
    </form>
  );
};

export default InteractiveForm;
```

### 🔄 การผสม Server และ Client Components

```typescript
// ✅ ตัวอย่างที่ดี - Server Component ที่ใช้ Client Component
// app/components/server/UserDashboard/UserDashboard.tsx
import { getUserProjects } from '@/utils/database';
import InteractiveForm from '@/components/client/InteractiveForm/InteractiveForm';

interface UserDashboardProps {
  userId: string;
}

const UserDashboard: React.FC<UserDashboardProps> = async ({ userId }) => {
  // Server-side data fetching
  const projects = await getUserProjects(userId);

  return (
    <div className="space-y-6">
      {/* Server Component - แสดงข้อมูล static */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          โปรเจคของคุณ ({projects.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800">{project.name}</h3>
              <p className="text-gray-600 text-sm">{project.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                สร้างเมื่อ {new Date(project.createdAt).toLocaleDateString('th-TH')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Client Component - สำหรับ interactivity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          สร้างโปรเจคใหม่
        </h3>
        <InteractiveForm
          onSubmit={async (data) => {
            // Client-side form submission
            console.log('Creating new project:', data);
          }}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
```

### 📋 กฎการใช้งาน

#### Server Components ใช้เมื่อ:
- ✅ แสดงข้อมูล static หรือ dynamic ที่ไม่ต้องการ interactivity
- ✅ ต้องการเข้าถึง database หรือ API โดยตรง
- ✅ ต้องการ SEO ที่ดี
- ✅ ต้องการลด JavaScript bundle size
- ✅ ใช้ใน Layout หรือ Pages

#### Client Components ใช้เมื่อ:
- ✅ ต้องการ event handlers (onClick, onChange, etc.)
- ✅ ใช้ React hooks (useState, useEffect, etc.)
- ✅ ต้องการ browser APIs (localStorage, window, etc.)
- ✅ ต้องการ third-party libraries ที่ต้องทำงานบน client
- ✅ ต้องการ custom hooks

#### การตั้งชื่อไฟล์:
```typescript
// ✅ ดี - แยกโฟลเดอร์ชัดเจน
app/components/server/UserProfile/UserProfile.tsx
app/components/client/InteractiveForm/InteractiveForm.tsx

// ✅ ดี - ใช้ suffix เพื่อระบุประเภท
app/components/UserProfile.server.tsx
app/components/InteractiveForm.client.tsx

// ❌ ไม่ดี - ไม่แยกประเภท
app/components/UserProfile.tsx  // ไม่ชัดเจนว่าเป็น server หรือ client
```

### Component Structure
```typescript
// ✅ ตัวอย่างที่ดี
import React from 'react';
import { z } from 'zod';

// Types
interface ComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
  loading?: boolean;
}

// Validation schema
const ComponentPropsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  onAction: z.function().optional(),
  loading: z.boolean().optional(),
});

// Component
const Component: React.FC<ComponentProps> = ({ 
  title, 
  description, 
  onAction, 
  loading = false 
}) => {
  // Validate props
  const validatedProps = ComponentPropsSchema.parse({ 
    title, 
    description, 
    onAction, 
    loading 
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {validatedProps.title}
      </h2>
      
      {validatedProps.description && (
        <p className="text-gray-600 mb-4">
          {validatedProps.description}
        </p>
      )}
      
      {validatedProps.onAction && (
        <button
          onClick={validatedProps.onAction}
          disabled={validatedProps.loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {validatedProps.loading ? 'กำลังโหลด...' : 'ดำเนินการ'}
        </button>
      )}
    </div>
  );
};

export default Component;
```

### Sandpack Code Preview Component
```typescript
// ✅ ตัวอย่างที่ดี - Sandpack Integration
import { Sandpack } from '@codesandbox/sandpack-react';
import { z } from 'zod';

// Types
interface CodePreviewProps {
  files: Record<string, string>;
  template?: 'react' | 'vanilla' | 'vue' | 'angular';
  theme?: 'dark' | 'light';
  showNavigator?: boolean;
  showTabs?: boolean;
}

// Validation schema
const CodePreviewSchema = z.object({
  files: z.record(z.string()),
  template: z.enum(['react', 'vanilla', 'vue', 'angular']).default('react'),
  theme: z.enum(['dark', 'light']).default('dark'),
  showNavigator: z.boolean().default(true),
  showTabs: z.boolean().default(true),
});

// Component
const CodePreview: React.FC<CodePreviewProps> = ({ 
  files, 
  template = 'react', 
  theme = 'dark',
  showNavigator = true,
  showTabs = true
}) => {
  // Validate props
  const validatedProps = CodePreviewSchema.parse({ 
    files, 
    template, 
    theme, 
    showNavigator, 
    showTabs 
  });

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
      <Sandpack
        template={validatedProps.template}
        theme={validatedProps.theme}
        files={validatedProps.files}
        options={{
          showNavigator: validatedProps.showNavigator,
          showTabs: validatedProps.showTabs,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 400,
          autorun: true,
        }}
      />
    </div>
  );
};

// ✅ ตัวอย่างที่ดี - Website Preview Component
interface WebsitePreviewProps {
  html: string;
  css?: string;
  js?: string;
}

const WebsitePreview: React.FC<WebsitePreviewProps> = ({ html, css, js }) => {
  const files = {
    '/index.html': html,
    ...(css && { '/styles.css': css }),
    ...(js && { '/script.js': js }),
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
      <CodePreview 
        files={files} 
        template="vanilla" 
        theme="light"
        showNavigator={false}
      />
    </div>
  );
};

// ✅ ตัวอย่างที่ดี - React Component Preview
interface ReactPreviewProps {
  componentCode: string;
  dependencies?: Record<string, string>;
}

const ReactPreview: React.FC<ReactPreviewProps> = ({ 
  componentCode, 
  dependencies = {} 
}) => {
  const files = {
    '/App.js': componentCode,
    '/package.json': JSON.stringify({
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        ...dependencies,
      },
    }, null, 2),
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">React Component Demo</h3>
      <CodePreview 
        files={files} 
        template="react" 
        theme="dark"
      />
    </div>
  );
};
```

### API Route Structure
```typescript
// ✅ ตัวอย่างที่ดี
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Request schema
const RequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  options: z.object({
    framework: z.enum(['next', 'react', 'vue']).default('next'),
    typescript: z.boolean().default(true),
    styling: z.enum(['tailwind', 'css']).default('tailwind'),
  }).optional(),
});

// Response schema
const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(), // ใช้ unknown แทน any
  error: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication (local development)
    // ในอนาคตจะใช้ Supabase หรือ AWS Cognito
    const authToken = request.headers.get('authorization');
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // Process request
    const result = await processRequest(validatedData);

    // Validate response
    const response = ResponseSchema.parse({
      success: true,
      data: result,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ข้อมูลไม่ถูกต้อง: ' + error.errors[0].message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
```

### Custom Hook Structure (สำหรับ Client Components เท่านั้น)

```typescript
// ✅ ตัวอย่างที่ดี - Custom Hook สำหรับ Client Components
// hooks/useApi.ts
'use client'; // ต้องมีบรรทัดนี้เสมอสำหรับ hooks

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import axios from 'axios';

// Types
interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown; // ใช้ unknown แทน any
  schema?: z.ZodSchema<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  autoExecute?: boolean; // รันอัตโนมัติเมื่อ component mount
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
}

// Custom hook - ใช้ได้เฉพาะใน Client Components
export function useApi<T>(options: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ใช้ axios.method แทน fetch
      let response;
      switch (options.method) {
        case 'POST':
          response = await axios.post(options.url, options.body);
          break;
        case 'PUT':
          response = await axios.put(options.url, options.body);
          break;
        case 'DELETE':
          response = await axios.delete(options.url);
          break;
        default:
          response = await axios.get(options.url);
      }

      const result = response.data;

      // Validate response with schema if provided
      const validatedData = options.schema 
        ? options.schema.parse(result.data)
        : result.data;

      setData(validatedData);
      options.onSuccess?.(validatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Auto execute on mount if specified
  useEffect(() => {
    if (options.autoExecute) {
      execute();
    }
  }, [execute, options.autoExecute]);

  return { data, loading, error, execute, reset };
}

// ✅ ตัวอย่างที่ดี - Custom Hook สำหรับ Form Management
// hooks/useForm.ts
'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  loading: boolean;
  setValue: (field: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  isValid: boolean;
}

export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [errors]);

  const setValuesPartial = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = options.validationSchema.parse(values);
      setErrors({});

      // Submit data
      await options.onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Form submission error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [values, options]);

  const reset = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
    setLoading(false);
  }, [options.initialValues]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    loading,
    setValue,
    setValues: setValuesPartial,
    handleSubmit,
    reset,
    isValid,
  };
}

// ✅ ตัวอย่างที่ดี - Custom Hook สำหรับ Local Storage
// hooks/useLocalStorage.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}
```

### 🔧 การใช้งาน Custom Hooks ใน Client Components

```typescript
// ✅ ตัวอย่างที่ดี - ใช้ Custom Hooks ใน Client Component
// app/components/client/ProjectForm/ProjectForm.tsx
'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';

// Types
interface ProjectData {
  name: string;
  description: string;
  framework: 'next' | 'react' | 'vue';
}

// Validation schema
const ProjectSchema = z.object({
  name: z.string().min(3, 'ชื่อโปรเจคต้องมีอย่างน้อย 3 ตัวอักษร'),
  description: z.string().min(10, 'คำอธิบายต้องมีอย่างน้อย 10 ตัวอักษร'),
  framework: z.enum(['next', 'react', 'vue']),
});

// Client Component ที่ใช้ Custom Hooks
const ProjectForm: React.FC = () => {
  // ใช้ useForm hook
  const {
    values,
    errors,
    loading: formLoading,
    setValue,
    handleSubmit,
    reset,
    isValid,
  } = useForm<ProjectData>({
    initialValues: {
      name: '',
      description: '',
      framework: 'next',
    },
    validationSchema: ProjectSchema,
    onSubmit: async (data) => {
      // ใช้ useApi hook สำหรับการส่งข้อมูล
      await createProject.execute();
    },
  });

  // ใช้ useApi hook
  const createProject = useApi<{ id: string; name: string }>({
    url: '/api/projects',
    method: 'POST',
    body: values,
    onSuccess: (data) => {
      console.log('Project created:', data);
      reset();
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          ชื่อโปรเจค
        </label>
        <input
          type="text"
          id="name"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : ''
          }`}
          placeholder="กรอกชื่อโปรเจค"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          คำอธิบาย
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => setValue('description', e.target.value)}
          rows={3}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : ''
          }`}
          placeholder="อธิบายโปรเจคของคุณ"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="framework" className="block text-sm font-medium text-gray-700">
          Framework
        </label>
        <select
          id="framework"
          value={values.framework}
          onChange={(e) => setValue('framework', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="next">Next.js</option>
          <option value="react">React</option>
          <option value="vue">Vue.js</option>
        </select>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={!isValid || formLoading || createProject.loading}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {formLoading || createProject.loading ? 'กำลังสร้าง...' : 'สร้างโปรเจค'}
        </button>
        
        <button
          type="button"
          onClick={reset}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          รีเซ็ต
        </button>
      </div>

      {createProject.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{createProject.error}</p>
        </div>
      )}
    </form>
  );
};

export default ProjectForm;
```

---

## 🧪 การทดสอบ

### Unit Tests

#### การทดสอบ Server Components
```typescript
// ✅ ตัวอย่างที่ดี - ทดสอบ Server Components
// __tests__/components/server/UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import UserProfile from '@/components/server/UserProfile/UserProfile';

// Mock database function
jest.mock('@/utils/database', () => ({
  getUserData: jest.fn(),
}));

import { getUserData } from '@/utils/database';

describe('UserProfile Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user data correctly', async () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2024-01-01T00:00:00Z',
    };

    (getUserData as jest.Mock).mockResolvedValue(mockUser);

    const UserProfileComponent = await UserProfile({ userId: '1' });
    render(UserProfileComponent);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText(/สมาชิกตั้งแต่/)).toBeInTheDocument();
  });

  it('shows error when user not found', async () => {
    (getUserData as jest.Mock).mockResolvedValue(null);

    const UserProfileComponent = await UserProfile({ userId: '999' });
    render(UserProfileComponent);

    expect(screen.getByText('ไม่พบข้อมูลผู้ใช้')).toBeInTheDocument();
  });

  it('handles database errors', async () => {
    (getUserData as jest.Mock).mockRejectedValue(new Error('Database error'));

    await expect(UserProfile({ userId: '1' })).rejects.toThrow('Database error');
  });
});
```

#### การทดสอบ Client Components
```typescript
// ✅ ตัวอย่างที่ดี - ทดสอบ Client Components
// __tests__/components/client/InteractiveForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InteractiveForm from '@/components/client/InteractiveForm/InteractiveForm';

// Mock axios
jest.mock('axios');
import axios from 'axios';

describe('InteractiveForm Client Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<InteractiveForm />);

    expect(screen.getByLabelText(/ชื่อ/)).toBeInTheDocument();
    expect(screen.getByLabelText(/อีเมล/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ส่งข้อมูล/ })).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    render(<InteractiveForm />);

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /ส่งข้อมูล/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ชื่อต้องมีอย่างน้อย 2 ตัวอักษร/)).toBeInTheDocument();
      expect(screen.getByText(/อีเมลไม่ถูกต้อง/)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    
    (axios.post as jest.Mock).mockResolvedValue({
      data: { success: true, data: { id: '1', name: 'Test User' } },
    });

    render(<InteractiveForm onSubmit={mockOnSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/ชื่อ/), 'Test User');
    await user.type(screen.getByLabelText(/อีเมล/), 'test@example.com');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /ส่งข้อมูล/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock slow API response
    (axios.post as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<InteractiveForm />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/ชื่อ/), 'Test User');
    await user.type(screen.getByLabelText(/อีเมล/), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }));

    // Check loading state
    expect(screen.getByText('กำลังส่งข้อมูล...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    
    (axios.post as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<InteractiveForm />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/ชื่อ/), 'Test User');
    await user.type(screen.getByLabelText(/อีเมล/), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }));

    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    });
  });
});
```

#### การทดสอบ Custom Hooks
```typescript
// ✅ ตัวอย่างที่ดี - ทดสอบ Custom Hooks
// __tests__/hooks/useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@/hooks/useApi';

// Mock axios
jest.mock('axios');
import axios from 'axios';

describe('useApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches data successfully', async () => {
    const mockData = { id: '1', name: 'Test' };
    (axios.get as jest.Mock).mockResolvedValue({
      data: { success: true, data: mockData },
    });

    const { result } = renderHook(() =>
      useApi({
        url: '/api/test',
        autoExecute: true,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });
  });

  it('handles API errors', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() =>
      useApi({
        url: '/api/test',
        autoExecute: true,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('เกิดข้อผิดพลาด');
    });
  });

  it('executes manually when autoExecute is false', async () => {
    const mockData = { id: '1', name: 'Test' };
    (axios.get as jest.Mock).mockResolvedValue({
      data: { success: true, data: mockData },
    });

    const { result } = renderHook(() =>
      useApi({
        url: '/api/test',
        autoExecute: false,
      })
    );

    // Initially no data
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);

    // Execute manually
    await result.current.execute();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

#### การทดสอบ Error Boundaries
```typescript
// ✅ ตัวอย่างที่ดี - ทดสอบ Error Boundaries
// __tests__/components/client/ErrorBoundary.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/client/ErrorBoundary/ErrorBoundary';

// Component that throws error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('ลองใหม่อีกครั้ง')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error state when retry button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error should be shown
    expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByText('ลองใหม่อีกครั้ง'));

    // Error should be cleared
    expect(screen.queryByText('เกิดข้อผิดพลาด')).not.toBeInTheDocument();
  });
});
```

### API Tests
```typescript
// ✅ ตัวอย่างที่ดี
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('API Route', () => {
  it('returns success for valid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: JSON.stringify({ 
        prompt: 'Create a simple website' 
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('returns error for invalid request', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: JSON.stringify({ 
        prompt: '' // Empty prompt should fail
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Prompt is required');
  });
});
```

---

## 🚀 การ Deploy

### Development (ปัจจุบัน)
```bash
# รันในโหมด development
npm run dev

# รันในโหมด production locally
npm run build
npm start

# ทดสอบใน local environment
npm run test
npm run lint
```

### Local Production Testing
```bash
# Build สำหรับ production
npm run build

# รัน production build ใน local
npm start

# ตรวจสอบ performance
npm run analyze
```

### Future Production Deployment (แผนในอนาคต)
```bash
# Build สำหรับ production
npm run build

# Deploy ไปยัง Vercel
vercel --prod

# หรือ deploy ไปยัง platform อื่น
npm run deploy
```

### Environment Setup

#### Development Environment (ปัจจุบัน)
```bash
# Development environment variables
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
```

#### Future Production Environment (แผนในอนาคต)
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

---

## 🔧 การบำรุงรักษา

### การ Update Dependencies
```bash
# ตรวจสอบ dependencies ที่ล้าสมัย
npm outdated

# Update dependencies
npm update

# Update major versions (ระวัง breaking changes)
npx npm-check-updates -u
npm install

# ตรวจสอบ vulnerabilities
npm audit
npm audit fix
```

### การ Monitor Performance (Development)

#### Server Components Performance
```typescript
// ✅ ตัวอย่างที่ดี - Server Components Performance monitoring
// app/components/server/UserProfile/UserProfile.tsx
const UserProfile: React.FC<{ userId: string }> = async ({ userId }) => {
  const startTime = performance.now();
  
  try {
    const userData = await getUserData(userId);
    
    const endTime = performance.now();
    console.log(`UserProfile render took ${endTime - startTime}ms`);
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">{userData.name}</h2>
        <p className="text-gray-600">{userData.email}</p>
      </div>
    );
  } catch (error) {
    const endTime = performance.now();
    console.error(`UserProfile error took ${endTime - startTime}ms:`, error);
    throw error;
  }
};
```

#### Client Components Performance
```typescript
// ✅ ตัวอย่างที่ดี - Client Components Performance monitoring
// app/components/client/InteractiveForm/InteractiveForm.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';

const InteractiveForm: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);

  // Track render performance
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`InteractiveForm render took ${endTime - startTime}ms`);
    };
  });

  // Track form submission performance
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = performance.now();
    
    try {
      // Form submission logic
      await submitForm();
      
      const endTime = performance.now();
      console.log(`Form submission took ${endTime - startTime}ms`);
    } catch (error) {
      const endTime = performance.now();
      console.error(`Form submission error took ${endTime - startTime}ms:`, error);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

#### Bundle Size Monitoring
```typescript
// ✅ ตัวอย่างที่ดี - Bundle size monitoring
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Enable bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@codesandbox/sandpack-react', 'axios'],
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
```

#### Performance Best Practices

##### Server Components
```typescript
// ✅ ดี - ใช้ Suspense สำหรับ loading states
// app/components/server/UserDashboard/UserDashboard.tsx
import { Suspense } from 'react';
import UserProfile from '@/components/server/UserProfile/UserProfile';
import ProjectList from '@/components/server/ProjectList/ProjectList';

const UserDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>กำลังโหลดข้อมูลผู้ใช้...</div>}>
        <UserProfile userId={userId} />
      </Suspense>
      
      <Suspense fallback={<div>กำลังโหลดรายการโปรเจค...</div>}>
        <ProjectList userId={userId} />
      </Suspense>
    </div>
  );
};

// ✅ ดี - ใช้ Parallel Data Fetching
// app/components/server/UserDashboard/UserDashboard.tsx
const UserDashboard: React.FC<{ userId: string }> = async ({ userId }) => {
  // Fetch data in parallel
  const [userData, projectData] = await Promise.all([
    getUserData(userId),
    getProjectData(userId),
  ]);

  return (
    <div className="space-y-6">
      <UserProfile user={userData} />
      <ProjectList projects={projectData} />
    </div>
  );
};
```

##### Client Components
```typescript
// ✅ ดี - ใช้ React.memo สำหรับ expensive components
// app/components/client/ExpensiveChart/ExpensiveChart.tsx
'use client';

import React from 'react';

interface ExpensiveChartProps {
  data: Array<{ x: number; y: number }>;
  width: number;
  height: number;
}

const ExpensiveChart: React.FC<ExpensiveChartProps> = React.memo(({ data, width, height }) => {
  // Expensive chart rendering logic
  return (
    <svg width={width} height={height}>
      {/* Chart rendering */}
    </svg>
  );
});

ExpensiveChart.displayName = 'ExpensiveChart';

// ✅ ดี - ใช้ useMemo และ useCallback สำหรับ expensive calculations
// app/components/client/DataTable/DataTable.tsx
'use client';

import React, { useMemo, useCallback } from 'react';

interface DataTableProps {
  data: Array<Record<string, unknown>>;
  sortBy?: string;
  filterBy?: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, sortBy, filterBy }) => {
  // Memoize filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];
    
    if (filterBy) {
      result = result.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(filterBy.toLowerCase())
        )
      );
    }
    
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
    }
    
    return result;
  }, [data, sortBy, filterBy]);

  // Memoize event handlers
  const handleSort = useCallback((column: string) => {
    // Sort logic
  }, []);

  const handleFilter = useCallback((value: string) => {
    // Filter logic
  }, []);

  return (
    <table>
      {/* Table rendering */}
    </table>
  );
};
```

#### Memory Management
```typescript
// ✅ ดี - Cleanup ใน useEffect
// app/components/client/DataFetcher/DataFetcher.tsx
'use client';

import React, { useState, useEffect } from 'react';

const DataFetcher: React.FC = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await axios.get('/api/data', {
          signal: abortController.signal,
        });
        
        if (isMounted) {
          setData(response.data);
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  return (
    <div>
      {/* Render data */}
    </div>
  );
};
```

### การ Backup และ Recovery (Development)
```bash
# Backup local database
cp dev.db dev.db.backup

# Backup files
tar -czf backup.tar.gz src/ public/ package.json

# Restore from backup
cp dev.db.backup dev.db
```

### การ Monitor Performance (Future Production)
```typescript
// ✅ ตัวอย่างที่ดี - Production Performance monitoring
const trackPerformance = (action: string, duration: number) => {
  // ส่งข้อมูลไปยัง analytics service
  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, duration, timestamp: Date.now() }),
  });
};
```

---

## 💰 Cost Management Strategy

### Development Phase (ปัจจุบัน)
- **Local Development**: ใช้ทรัพยากร local เพื่อประหยัดค่าใช้จ่าย
- **Free Tier Services**: ใช้บริการฟรีของ AI providers
- **Open Source Tools**: ใช้เครื่องมือ open source
- **Minimal Infrastructure**: โครงสร้างพื้นฐานน้อยที่สุด

### Production Phase (แผนในอนาคต)
- **Gradual Scaling**: ขยายระบบทีละขั้นตามความต้องการ
- **Cost Monitoring**: ติดตามค่าใช้จ่ายอย่างใกล้ชิด
- **Resource Optimization**: ปรับแต่งการใช้ทรัพยากรให้เหมาะสม
- **Revenue Generation**: สร้างรายได้เพื่อรองรับค่าใช้จ่าย

---

## 📚 เอกสารเพิ่มเติม

### ไฟล์ที่เกี่ยวข้อง
- [AGENT_RULES.md](./AGENT_RULES.md) - Rules สำหรับ AI agent
- [AI_AGENT_RULES.md](./AI_AGENT_RULES.md) - Rules เฉพาะสำหรับ AI development
- [PROJECT_BACKGROUND.md](./PROJECT_BACKGROUND.md) - ข้อมูลเบื้องหลังโปรเจค
- [README.md](./README.md) - เอกสารหลักของโปรเจค

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev/)

---

## 🎯 สรุป

Development Guide นี้เป็นคู่มือสำหรับการพัฒนาโปรเจค Midori ให้ปฏิบัติตาม rules และ guidelines ที่กำหนดไว้เพื่อให้ได้ผลลัพธ์ที่มีคุณภาพสูง ปลอดภัย และบำรุงรักษาง่าย

### 📋 Checklist การแยก Server/Client Components

#### ✅ Server Components Checklist
- [ ] ไม่มี `'use client'` directive
- [ ] ไม่ใช้ React hooks (useState, useEffect, etc.)
- [ ] ไม่ใช้ event handlers (onClick, onChange, etc.)
- [ ] ไม่ใช้ browser APIs (window, localStorage, etc.)
- [ ] ใช้ async/await สำหรับ data fetching
- [ ] ใช้ try-catch สำหรับ error handling
- [ ] ใช้ Suspense สำหรับ loading states
- [ ] ใช้ Parallel Data Fetching เมื่อเป็นไปได้
- [ ] ตั้งชื่อไฟล์ให้ชัดเจน (เช่น `.server.tsx` หรืออยู่ใน `/server/` folder)

#### ✅ Client Components Checklist
- [ ] มี `'use client'` directive ที่บรรทัดแรก
- [ ] ใช้ React hooks เมื่อจำเป็น
- [ ] ใช้ event handlers สำหรับ interactivity
- [ ] ใช้ browser APIs เมื่อจำเป็น
- [ ] ใช้ Error Boundaries สำหรับ error handling
- [ ] ใช้ React.memo สำหรับ expensive components
- [ ] ใช้ useMemo และ useCallback สำหรับ optimization
- [ ] ตั้งชื่อไฟล์ให้ชัดเจน (เช่น `.client.tsx` หรืออยู่ใน `/client/` folder)

#### ✅ Custom Hooks Checklist
- [ ] มี `'use client'` directive
- [ ] ใช้ได้เฉพาะใน Client Components
- [ ] มี TypeScript types ที่ชัดเจน
- [ ] ใช้ Zod สำหรับ validation
- [ ] มี error handling ที่เหมาะสม
- [ ] มี cleanup functions ใน useEffect

#### ✅ Context Checklist
- [ ] Provider เป็น Client Component
- [ ] ใช้ได้เฉพาะใน Client Components
- [ ] มี TypeScript types ที่ชัดเจน
- [ ] มี error handling ที่เหมาะสม
- [ ] มี loading states

#### ✅ Testing Checklist
- [ ] ทดสอบ Server Components แยกจาก Client Components
- [ ] Mock dependencies อย่างเหมาะสม
- [ ] ทดสอบ error scenarios
- [ ] ทดสอบ loading states
- [ ] ทดสอบ user interactions
- [ ] ทดสอบ performance

### 🚀 Best Practices Summary

#### Server Components
- **Performance**: ใช้ Server Components เป็นค่าเริ่มต้น
- **SEO**: ใช้สำหรับ content ที่ต้องการ SEO
- **Data**: เข้าถึง database โดยตรง
- **Bundle Size**: ลด JavaScript bundle size

#### Client Components
- **Interactivity**: ใช้เมื่อต้องการ user interactions
- **State**: ใช้สำหรับ local state management
- **Browser APIs**: ใช้เมื่อต้องการ browser features
- **Third-party**: ใช้สำหรับ libraries ที่ต้องทำงานบน client

#### Architecture
- **Separation**: แยก Server และ Client Components ชัดเจน
- **Composition**: ใช้ Server Components ครอบ Client Components
- **Performance**: ใช้ Suspense และ Parallel Data Fetching
- **Error Handling**: ใช้ Error Boundaries และ try-catch

**ปัจจุบัน** ระบบอยู่ในขั้นตอนการพัฒนาบน local environment เพื่อประหยัดค่าใช้จ่ายและทดสอบฟีเจอร์ต่างๆ ให้สมบูรณ์

**แผนในอนาคต** เมื่อระบบพร้อมและมีงบประมาณ จะ deploy ไปยัง production environment พร้อมกับระบบฐานข้อมูลและโครงสร้างพื้นฐานที่เหมาะสม

หากมีคำถามหรือต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อทีมพัฒนา
