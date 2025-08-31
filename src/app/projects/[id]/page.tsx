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
      
    </div>
  );
};

export default ProjectPage;
