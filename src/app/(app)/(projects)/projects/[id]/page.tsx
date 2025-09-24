import { getCurrentSession } from '@/libs/auth/session';
import { redirect } from 'next/navigation';
import { NextPage } from 'next';
import ChatInterface from '@/components/chat/ChatInterface';
import ProjectPreview from '@/components/projects/ProjectPreview';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ProjectPage: NextPage<ProjectPageProps> = async ({ params }) => {
  // ตรวจสอบ authentication
  const session = await getCurrentSession();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  // ดึง projectId จาก params
  const { id: projectId } = await params;
  const initialMessage = `สวัสดีครับ! ผมคือ Midori AI ผู้ช่วยสร้างเว็บไซต์ 🎭`;

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* Chat Section - Left Side (25%) */}
      <div className="w-full lg:w-1/4 border-r border-gray-300 bg-white flex flex-col">
        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            initialMessage={initialMessage}
            projectId={projectId}
            userId={session.user.id}
            userEmail={session.user.email || undefined}
          />
        </div>
      </div>

      {/* Preview Section - Right Side (75%) */}
      <div className="w-full lg:w-3/4 bg-gray-50">
        <ProjectPreview projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectPage;
