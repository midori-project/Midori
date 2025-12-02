import { getCurrentSession } from '@/libs/auth/session';
import { redirect } from 'next/navigation';
import { NextPage } from 'next';
import ProjectPageClient from './ProjectPageClient';

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
    <ProjectPageClient
      projectId={projectId}
      userId={session.user.id}
      userEmail={session.user.email || undefined}
      initialMessage={initialMessage}
    />
  );
};

export default ProjectPage;
