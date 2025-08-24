
'use client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/Button/Button';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            สร้างเว็บไซต์ด้วย
            <span className="text-blue-600"> AI</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Midori ใช้ AI ที่ทรงพลังช่วยให้คุณสร้างเว็บไซต์ที่สวยงามและใช้งานได้จริงได้ในเวลาเพียงไม่กี่นาที
          </p>
          
          {isAuthenticated && user ? (
            <div className="mt-10">
              <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                <div className="flex items-center space-x-4 mb-4">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName || user.email}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user.displayName?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      ยินดีต้อนรับ {user.displayName || user.email}!
                    </h3>
                    <p className="text-gray-600">พร้อมสร้างเว็บไซต์ใหม่แล้วหรือยัง?</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link href="/projects">
                    <Button className="w-full">
                      ดูโปรเจคของฉัน
                    </Button>
                  </Link>
                  <Link href="/create">
                    <Button variant="secondary" className="w-full">
                      สร้างเว็บไซต์ใหม่
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  เริ่มต้นใช้งานฟรี
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              ทำไมต้องเลือก Midori?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              เครื่องมือสร้างเว็บไซต์ที่ขับเคลื่อนด้วย AI เพื่อประสบการณ์ที่ดีที่สุด
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">รวดเร็วเหมือนฟ้าแลบ</h3>
              <p className="text-gray-600">สร้างเว็บไซต์ได้ในเวลาเพียงไม่กี่นาที ด้วยพลัง AI ที่ทันสมัย</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ใช้งานง่าย</h3>
              <p className="text-gray-600">ไม่ต้องมีความรู้ด้านโปรแกรม แค่บอก AI ว่าคุณต้องการอะไร</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">คุณภาพสูง</h3>
              <p className="text-gray-600">เว็บไซต์ที่สร้างขึ้นมีคุณภาพระดับมืออาชีพ พร้อมใช้งานจริง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

