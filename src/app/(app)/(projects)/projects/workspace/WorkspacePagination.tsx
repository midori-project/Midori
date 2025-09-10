'use client';

import { useState, useEffect } from 'react';
import { CardWorkspaceClient } from '@/components/ui/CardWorkspaceClient';
import { getUserProjectsPaginated, GetUserProjectsResult } from './getUserProjects';


interface WorkspacePaginationProps {
  initialData: GetUserProjectsResult;
}

export function WorkspacePagination({ initialData }: WorkspacePaginationProps) {
  const [data, setData] = useState(initialData);
  const [allProjects, setAllProjects] = useState(initialData.success ? initialData.data!.projects : []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleLoadMore = async () => {
    if (loading || !data.success) return;

    const nextPage = currentPage + 1;
    setLoading(true);
    try {
      const result = await getUserProjectsPaginated({ page: nextPage, limit: 12 });
      if (result.success) {
        // ✅ สะสมข้อมูลแทนการแทนที่
        setAllProjects(prev => [...prev, ...result.data!.projects]);
        setData(result);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!data.success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-4">error</h2>
        <p className="text-gray-600 mb-4">
          {data.error || 'cannot load project, please try again'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          try again
        </button>
      </div>
    );
  }

  const { projects, pagination } = data.data!;

  return (
    <div className="space-y-6">


      {/* Loading Overlay */}
      {loading && (
        <div className="relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-700">loading...</span>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <CardWorkspaceClient projects={allProjects} columns={4} showPagination={false} />

      {/* View More Button */}
      {pagination.hasNextPage && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-[#94D133] text-white rounded-lg hover:bg-[#94D133] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                loading...
              </>
            ) : (
              <>
                View More 
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Info Text */}
      <div className="text-center text-sm text-gray-400 mt-4">
        show {allProjects.length} from {pagination.totalItems} projects
      </div>
    </div>
  );
}
