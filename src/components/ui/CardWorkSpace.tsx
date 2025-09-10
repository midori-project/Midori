import React from 'react';
import { getUserProjects } from '@/app/(app)/(projects)/projects/workspace/getUserProjects';
import { CardWorkspaceClient } from './CardWorkspaceClient';

interface CardWorkspaceProps {
  showLimited?: boolean;
}

export const CardWorkspace: React.FC<CardWorkspaceProps> = async ({ showLimited = false }) => {
  try {
    const result = await getUserProjects();
    
    if (!result.success) {
      return (
        <div className="p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{result.error}</p>
          </div>
        </div>
      );
    }

    const projects = result.projects || [];

    if (projects.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              no project
            </h3>
            <p className="text-gray-600">
              start creating your first project!
            </p>
          </div>
        </div>
      );
    }

    return <CardWorkspaceClient projects={projects} showLimited={showLimited} />;
  } catch (error) {
    console.error('Error in CardWorkspace:', error);
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">error in loading data</p>
        </div>
      </div>
    );
  }
};

