import { Metadata } from "next";
import { navigateToCreateProject, navigateToFilter, getPublicProjectsPaginated } from "./actions";
import { CommunityPagination } from "./CommunityPagination";

export const metadata: Metadata = {
  title: 'Community Projects - Midori',
  description: 'explore creative projects from the Midori community that are interesting',
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
            explore creative projects from the Midori community
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6">
        </div>

        {/* Projects Grid with Pagination */}
        <CommunityPagination initialData={result} />
      </div>
    </div>
  );
}