import React from 'react';
import { getPublicProjectsWithPreview } from '@/libs/services/projectService';
import { CardCommunity, HoverDetailCardGridProps } from './CardCommunity';

interface CardCommunityWrapperProps {
  columns?: number;
}

export const CardCommunityWrapper: React.FC<CardCommunityWrapperProps> = async ({
  columns = 4,
}) => {
  try {
    // Fetch real data from database - จำกัดที่ 12 cards สำหรับหน้าโฮม
    const response = await getPublicProjectsWithPreview({ page: 1, limit: 12 });
    const projects = response.projects || [];

    if (projects.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">no preview project</p>
        </div>
      );
    }

    return <CardCommunity columns={columns} projects={projects} />;
  } catch (error) {
    console.error('Error in CardCommunityWrapper:', error);
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">error in loading data</p>
        </div>
      </div>
    );
  }
};
