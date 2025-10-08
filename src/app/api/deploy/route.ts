import { NextRequest, NextResponse } from 'next/server';
import { deployStaticSite } from '../../../libs/services/vercelDeploymentService';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { subdomain, projectType = 'vite-react' } = await req.json();

    if (!subdomain || !/^[a-z0-9-]{1,50}$/.test(subdomain))
      return NextResponse.json({ error: 'invalid subdomain' }, { status: 400 });

    console.log(`🚀 Starting deployment for subdomain: ${subdomain}`);

    // โหลดไฟล์จาก test-cafe-complete.json
    const cafeProject = await import('../../../components/preview/test/exportedJson.json');
    const files = cafeProject.default.exportedJson.files;

    console.log(`📁 Loaded ${files.length} files from café project`);

    // แปลงไฟล์เป็น Vercel format
    const vercelFiles = files.map((file: any) => ({
      file: file.path,
      data: file.content
    }));

    console.log(`📦 Prepared files for deployment:`, vercelFiles.map(f => f.file));

    const result = await deployStaticSite(subdomain, vercelFiles);
    
    console.log(`✅ Deployment successful: ${result.url}`);

    return NextResponse.json({ 
      success: true, 
      url: result.url,
      projectName: 'Café Delight',
      description: 'Food delivery and table reservation app',
      features: ['Menu', 'Reservation', 'Chef Profile', 'Dish Gallery'],
      framework: 'Vite + React + TypeScript + Tailwind CSS'
    });
  } catch (e: any) {
    console.error('❌ Deployment failed:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
