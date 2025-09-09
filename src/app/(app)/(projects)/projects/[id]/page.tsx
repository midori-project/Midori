import { getCurrentSession } from '@/libs/auth/session';
import { redirect } from 'next/navigation';
import { NextPage } from 'next';
import { getPromptJson } from '@/components/projects/getProject';
import AutoGenerateOnLoad from '@/components/projects/AutoGenerateOnLoad';
import SitePreview from '@/components/projects/SitePreview';

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
    <div className="container mx-auto px-4 py-16">

      
      {promptJson ? (
        <div className="space-y-6">
          {/* <div className="bg-white p-6 rounded-lg shadow"> */}
            {/* <h2 className="text-xl font-semibold mb-4">ข้อมูลโปรเจค</h2> */}
            {/* สร้างเว็บไซต์อัตโนมัติเมื่อเข้าหน้า */}
            <AutoGenerateOnLoad 
              projectId={projectId}
              promptJson={promptJson}
            />
          {/* </div> */}
          
          {/* SandPack Preview */}
          <SitePreview projectId={projectId} />
          
          {/* <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">ข้อมูลเต็ม (JSON)</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(promptJson, null, 2)}
            </pre>
          </div> */}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">ไม่พบข้อมูล promptJson สำหรับโปรเจคนี้</p>
          <p className="text-sm text-yellow-600 mt-1">
            อาจเป็นเพราะโปรเจคยังไม่ได้ผ่านขั้นตอนการสร้างเนื้อหา
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
