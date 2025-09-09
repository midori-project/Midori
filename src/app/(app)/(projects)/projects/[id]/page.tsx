import { getCurrentSession } from '@/libs/auth/session';
import { redirect } from 'next/navigation';
import { NextPage } from 'next';
import { getPromptJson } from '@/components/projects/getProject';
import { ProjectPageClient } from './ProjectPageClient';

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
  
  // ใช้ projectId เพื่อดึง promptJson
  const promptJson = await getPromptJson(projectId);

  return (
    <ProjectPageClient 
      projectId={projectId}
      promptJson={promptJson}
    />
  );
};

export default ProjectPage;
