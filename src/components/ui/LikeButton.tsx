"use client";

import React, { useState, useTransition } from 'react';
import { toggleProjectLikeAction } from '@/app/projects/likeAction';

interface LikeButtonProps {
  projectId: string;
  initialLiked?: boolean;
  initialCount?: number;
  className?: string;
  showCount?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  projectId,
  initialLiked = false,
  initialCount = 0,
  className = '',
  showCount = true,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    startTransition(async () => {
      try {
        const result = await toggleProjectLikeAction(projectId);
        
        if (result.success) {
          setIsLiked(result.isLiked);
          setLikeCount(result.likeCount);
        } else {
          // แสดง error แต่ไม่ crash
          console.error('Like failed:', result.error);
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    });
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
        isLiked 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${className}`}
    >
      {/* Heart Icon */}
      <svg 
        className={`w-4 h-4 transition-all duration-200 ${isLiked ? 'fill-current' : 'stroke-current'}`}
        viewBox="0 0 24 24"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      
      {showCount && (
        <span className="text-sm font-medium">
          {likeCount}
        </span>
      )}
      
      {isPending && (
        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
            fill="none"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
    </button>
  );
};
