import { CardCommunity } from "@/components/ui/CardCommunity";
import { Metadata } from "next";
import { navigateToCreateProject, navigateToFilter } from "./actions";

export const metadata: Metadata = {
  title: 'Community Projects - Midori',
  description: 'สำรวจโปรเจคสร้างสรรค์จากชุมชน Midori ที่น่าสนใจ',
};

export default function CommunityProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex flex-col max-w-full px-4 py-8 md:px-8 md:py-12 lg:px-20 lg:py-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              Community Projects
            </h1>
            <p className="text-lg text-gray-300">
              สำรวจโปรเจคสร้างสรรค์จากชุมชน Midori
            </p>
          </div>

          <div className="flex items-center gap-4">
            <form action={navigateToFilter}>
              <button type="submit" className="text-base md:text-lg text-white font-bold hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-600">
                Filter
              </button>
            </form>
            <form action={navigateToCreateProject}>
              <button type="submit" className="text-base md:text-lg text-white font-bold hover:bg-blue-600 bg-blue-500 px-4 py-2 rounded-lg transition-colors">
                Create Project
              </button>
            </form>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-1">Total Projects</h3>
            <p className="text-2xl font-bold text-blue-400">1,234+</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-1">Active Creators</h3>
            <p className="text-2xl font-bold text-green-400">567+</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-1">This Month</h3>
            <p className="text-2xl font-bold text-purple-400">89 New</p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="w-full">
          <CardCommunity columns={3} />
        </div>
      </div>
    </div>
  );
}