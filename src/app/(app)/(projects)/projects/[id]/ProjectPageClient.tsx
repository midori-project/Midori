'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import ProjectPreview from '@/components/projects/ProjectPreview';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-gray-100 relative">
      {/* Mobile: Toggle between Chat and Preview */}
      <div className="flex flex-col h-full lg:flex-row">
        {/* Chat Section - Left Side (Desktop) / Toggle on Mobile */}
        <div
          className={`
            ${isChatOpen ? 'flex' : 'hidden lg:flex'}
            lg:flex
            ${isChatOpen ? 'w-full' : 'w-0 lg:w-0'}
            lg:${isChatOpen ? 'w-1/4' : 'w-0'}
            transition-all duration-300 ease-in-out
            border-r border-gray-300 bg-white flex-col
            ${isChatOpen ? 'opacity-100' : 'opacity-0 lg:overflow-hidden'}
            h-full
          `}
        >
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
        <div
          className={`
            ${!isChatOpen ? 'flex' : 'hidden lg:flex'}
            lg:flex
            ${isChatOpen ? 'w-full lg:w-3/4' : 'w-full'}
            transition-all duration-300 ease-in-out
            bg-gray-50
            h-full
            flex-col
          `}
        >
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

