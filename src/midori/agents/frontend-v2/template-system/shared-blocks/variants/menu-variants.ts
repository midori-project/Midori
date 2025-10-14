import { BlockVariant } from "../index";

export const menuVariants: BlockVariant[] = [
  {
    id: "menu-basic",
    name: "Basic Menu",
    description: "Simple menu grid layout",
    template: `export default function Menu() {
  return (
    <section className="py-20 bg-gradient-to-br from-{primary}-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
    description: "Menu items in a carousel/slider format",
    template: `import { useState } from "react";

export default function Menu() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  return (
    <section className="py-20 bg-gradient-to-br from-{primary}-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex transition-transform duration-300 ease-in-out"
               style={{ transform: \`translateX(-\${currentSlide * 100}%)\` }}>
            {menuItems}
          </div>
          
          <button 
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
          >
            ←
          </button>
          <button 
            onClick={() => setCurrentSlide(Math.min(menuItems.length - 1, currentSlide + 1))}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      carouselItems: { type: "array", required: true }
    }
  }
];