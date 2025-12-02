import { getUserProjectsPaginated } from './getUserProjects';
import { WorkspacePagination } from './WorkspacePagination';

export default async function WorkSpacePage() {
    // ดึงข้อมูลหน้าแรก (page 1, 12 items)
    const result = await getUserProjectsPaginated({ page: 1, limit: 12 });
    
    if (!result.success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-white mb-4">เกิดข้อผิดพลาด</h1>
                        <p className="text-gray-300 mb-4">
                            {result.error || 'ไม่สามารถโหลดโปรเจคได้ กรุณาลองใหม่อีกครั้ง'}
                        </p>
                        <a 
                            href="/login" 
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            เข้าสู่ระบบ
                        </a>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70 pt-20">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0B2604] mb-2">My Workspace</h1>
                </div>
                <WorkspacePagination initialData={result} />
            </div>
        </div>
    );
}
