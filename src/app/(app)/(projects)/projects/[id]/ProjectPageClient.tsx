'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import ProjectPreview from '@/components/projects/ProjectPreview';


interface ProjectPageClientProps {
  projectId: string;
  userId: string;
  userEmail?: string;
  initialMessage: string;
}

export default function ProjectPageClient({
  projectId,
  userId,
  userEmail,
  initialMessage,
}: ProjectPageClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const chatPanelClasses = [
    'transition-all duration-300 ease-in-out   flex-col h-full',
    isChatOpen ? 'flex w-full opacity-100' : 'hidden w-0 opacity-0',
    'lg:flex',
    isChatOpen ? 'lg:w-1/4' : 'lg:w-0 lg:overflow-hidden',
  ].join(' ');

  const previewPanelClasses = [
    'transition-all duration-300 ease-in-out  h-full flex-col',
    isChatOpen ? 'hidden lg:flex' : 'flex',
    'lg:flex',
    isChatOpen ? 'w-full lg:w-3/4' : 'w-full',
  ].join(' ');

  return (
    <div className="h-screen flex flex-col bg-gray-100 relative">
      {/* Mobile: Toggle between Chat and Preview */}
      <div className="flex flex-col h-full lg:flex-row ">
        {/* Chat Section - Left Side (Desktop) / Toggle on Mobile */}
        <div className={chatPanelClasses}>
          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              initialMessage={initialMessage}
              projectId={projectId}
              userId={userId}
              userEmail={userEmail}
            />
          </div>
        </div>

        {/* Preview Section - Right Side (Desktop) / Default on Mobile */}
        <div className={previewPanelClasses}>
        <ProjectPreview 
          projectId={projectId} 
          userId={userId} 
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          isChatOpen={isChatOpen}
        />
        </div>
      </div>
    </div>
  );
}

