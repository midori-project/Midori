import { getCurrentSession } from '@/libs/auth/session';
import { redirect } from 'next/navigation';
import { NextPage } from 'next';
import ChatInterface from '@/components/chat/ChatInterface';


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

  // ดึง projectId จาก params
  const { id: projectId } = await params;
  const initialMessage = `สวัสดีครับ! ผมคือ Midori AI ผู้ช่วยสร้างเว็บไซต์ 🎭`;
  // ใช้ projectId เพื่อดึง promptJson


  return (
    <div className="container mx-auto px-4 py-32">
      <h1>Project Page</h1>
      <h1>{projectId}</h1>
      <ChatInterface initialMessage={initialMessage} />
    </div>
  );
};

export default ProjectPage;
