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
        
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {menuItems}
          </div>
          
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg">
            <span className="text-{primary}-600 font-bold text-lg">←</span>
          </div>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg">
            <span className="text-{primary}-600 font-bold text-lg">→</span>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "menu-grid",
    name: "Menu Grid",
    description: "Menu items in a clean grid layout",
    template: `export default function Menu() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-{primary}-700 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="w-24 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems}
        </div>
        
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-{primary}-600 text-white font-bold text-lg rounded-xl hover:bg-{primary}-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            {ctaLabel}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      subtitle: { type: "string", required: true, maxLength: 100 },
      ctaLabel: { type: "string", required: true, maxLength: 24 }
    }
  },
  {
    id: "menu-featured",
    name: "Menu Featured",
    description: "Menu with featured items and categories",
    template: `export default function Menu() {
  return (
    <section className="py-20 bg-gradient-to-br from-{primary}-50 via-white to-{secondary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-{primary}-700 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-8">{featuredTitle}</h3>
            <div className="space-y-6">
              {featuredItems}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-8">{regularTitle}</h3>
            <div className="grid grid-cols-1 gap-4">
              {regularItems}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button className="inline-flex items-center px-10 py-4 bg-{primary}-600 text-white font-bold text-lg rounded-xl hover:bg-{primary}-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      subtitle: { type: "string", required: true, maxLength: 100 },
      featuredTitle: { type: "string", required: true, maxLength: 40 },
      regularTitle: { type: "string", required: true, maxLength: 40 },
      featuredItems: { type: "array", required: true },
      regularItems: { type: "array", required: true },
      ctaLabel: { type: "string", required: true, maxLength: 24 }
    }
  }
];