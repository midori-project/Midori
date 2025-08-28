"use client";

import React from 'react';
import { HoverDetailCard, HoverDetailCardData } from './hover-detail-card';
import { hoverDetailCardMocks } from './hover-detail-card.mock';

export interface HoverDetailCardGridProps {
  items?: HoverDetailCardData[];
  columns?: number;
}

export const HoverDetailCardGrid: React.FC<HoverDetailCardGridProps> = ({
  items = hoverDetailCardMocks,
  columns = 4,
}) => {
  const safeCols = Math.max(1, Math.min(columns, 6));

  // Map columns -> sensible width classes for each card so they align in a column layout.
  // These width classes are tuned for narrow column cards used in the design.
  const widthClassMap: Record<number, string> = {
    1: 'w-full max-w-md',
    2: 'w-64 sm:w-72 md:w-80',
    3: 'w-full max-w-md',
    4: 'w-full max-w-md',
  };

  // Let grid cells control width on responsive layouts; default each card to full width of its cell
  const widthClass = 'w-full';

  return (
    // mobile: 1, md: 2, >1640px: 4 (via custom .grid-cols-over-1640 rule)
    <div className={`grid grid-cols-1 md:grid-cols-2 grid-cols-over-1640 gap-6`}>
      {items.map((item, idx) => (
        <div key={idx} className="">
          <HoverDetailCard
            title={item.title}
            subtitle={item.subtitle}
            images={item.images}
            primaryButton={item.primaryButton}
            secondaryButton={item.secondaryButton}
            pills={item.pills}
            enableAnimations={item.enableAnimations}
            widthClass={item.widthClass ?? widthClass}
            orientation={item.orientation ?? 'horizontal'}
          />
        </div>
      ))}
    </div>
  );
};

export default HoverDetailCardGrid;
