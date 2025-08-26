import { getCurrentSession } from '@/libs/auth/session';
import { redirect } from 'next/navigation';
import { NextPage } from 'next';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ProjectPage: NextPage<ProjectPageProps> = async ({ params }) => {
  // ตรวจสอบ authentication
  const session = await getCurrentSession();
  
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          โปรเจค #{id}
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            ยินดีต้อนรับ, {session.user?.displayName}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              รายละเอียดโปรเจค
            </h2>
            <p className="text-gray-600">
              หน้านี้จะแสดงรายละเอียดของโปรเจค ID: {id}
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              แก้ไขโปรเจค
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              ดูตัวอย่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
