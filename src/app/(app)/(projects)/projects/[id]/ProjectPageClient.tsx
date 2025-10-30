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
    <div className="h-screen flex flex-col lg:flex-row bg-gray-100 relative">
      {/* Chat Section - Left Side */}
      <div
        className={`
          ${isChatOpen ? 'w-full lg:w-1/4' : 'w-0'}
          transition-all duration-300 ease-in-out
          border-r border-gray-300 bg-white flex flex-col
          ${isChatOpen ? 'opacity-100' : 'opacity-0 overflow-hidden'}
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

      {/* Preview Section - Right Side */}
      <div
        className={`
          ${isChatOpen ? 'w-full lg:w-3/4' : 'w-full'}
          transition-all duration-300 ease-in-out
          bg-gray-50
        `}
      >
        <ProjectPreview 
          projectId={projectId} 
          userId={userId} 
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
    </div>
  );
}

