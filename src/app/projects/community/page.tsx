import { Metadata } from "next";
import { navigateToCreateProject, navigateToFilter, getPublicProjectsPaginated } from "./actions";
import { CommunityPagination } from "./CommunityPagination";

export const metadata: Metadata = {
  title: 'Community Projects - Midori',
  description: 'สำรวจโปรเจคสร้างสรรค์จากชุมชน Midori ที่น่าสนใจ',
};

export default async function CommunityProjectsPage() {
  // ดึงข้อมูลหน้าแรก (page 1, 12 items)
  const result = await getPublicProjectsPaginated({ page: 1, limit: 12 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6fff2]/70 via-[#d4ffe6]/60 to-[#bff6e0]/70 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B2604] mb-2">Community Projects</h1>
          <p className="text-lg text-[#0B2604]/80">
            สำรวจโปรเจคสร้างสรรค์จากชุมชน Midori
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6">
        </div>

        {/* Stats Section */}
{/*         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-[#0B2604]/10">
            <h3 className="text-lg font-semibold text-[#0B2604] mb-1">Total Projects</h3>
            <p className="text-2xl font-bold text-blue-600">
              {result.success ? result.data?.pagination.totalItems || 0 : '0'}+
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-[#0B2604]/10">
            <h3 className="text-lg font-semibold text-[#0B2604] mb-1">Active Creators</h3>
            <p className="text-2xl font-bold text-green-600">567+</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-[#0B2604]/10">
            <h3 className="text-lg font-semibold text-[#0B2604] mb-1">This Month</h3>
            <p className="text-2xl font-bold text-purple-600">89 New</p>
          </div>
        </div> */}

        {/* Projects Grid with Pagination */}
        <CommunityPagination initialData={result} />
      </div>
    </div>
  );
}