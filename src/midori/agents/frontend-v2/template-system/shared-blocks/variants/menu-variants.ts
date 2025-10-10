import { BlockVariant } from "../index";

export const menuVariants: BlockVariant[] = [
  {
    id: "menu-list",
    name: "Menu List Layout",
    description: "Simple list layout - clean and minimal",
    template: `export default function Menu() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-{primary}-900 mb-2">
            {title}
          </h2>
          <div className="w-20 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-6">
          {menuItems}
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "menu-masonry",
    name: "Menu Masonry Grid",
    description: "Masonry grid layout - dynamic and modern",
    template: `export default function Menu() {
  return (
    <section className="py-20 bg-gradient-to-br from-{primary}-50 via-white to-{secondary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
        </div>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {menuItems}
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "menu-carousel",
    name: "Menu Carousel",
    description: "Horizontal scrolling menu carousel with navigation buttons",
    template: `import { useRef, useState } from "react";

export default function Menu() {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };
  
  return (
    <section className="py-20 bg-{primary}-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-{secondary}-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="relative group">
          {/* Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-{primary}-900 hover:bg-{secondary}-100 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-{primary}-900 hover:bg-{secondary}-100 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          <div 
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto pb-4" 
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-6 min-w-max">
              {menuItems}
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-6 opacity-50">
            <div className="h-1 w-8 bg-{secondary}-500 rounded-full"></div>
            <div className="h-1 w-8 bg-{primary}-400 rounded-full"></div>
            <div className="h-1 w-8 bg-{primary}-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  }
];

