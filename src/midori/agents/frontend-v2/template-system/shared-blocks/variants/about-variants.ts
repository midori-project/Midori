import { BlockVariant } from "../index";

export const aboutVariants: BlockVariant[] = [
  {
    id: "about-basic",
    name: "Basic About",
    description: "Simple about section with features and stats",
    template: `export default function About() {
  return (
    <section className="py-16 bg-{primary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-{primary}-900 mb-6">{title}</h2>
          <p className="text-lg text-{primary}-700 mb-8 leading-relaxed">{description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {features}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats}
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "about-hero",
    name: "About Hero Style",
    description: "Hero-style about section with large heading and image",
    template: `export default function About() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-{primary}-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-{primary}-100 text-{primary}-700 text-sm font-semibold shadow-sm">
              <span className="w-2 h-2 bg-{primary}-500 rounded-full mr-2 animate-pulse"></span>
              {badge}
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-black text-{primary}-900 leading-tight">
              {title}
            </h2>
            
            <p className="text-xl text-{primary}-700 leading-relaxed">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center px-8 py-4 bg-{primary}-600 text-white font-bold text-lg rounded-xl hover:bg-{primary}-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                {ctaLabel}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-{primary}-300 text-{primary}-700 font-semibold text-lg rounded-xl hover:border-{primary}-600 hover:bg-{primary}-50 transition-all">
                {secondaryCta}
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="{heroImage}" 
                alt="{heroImageAlt}"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            
            <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-{primary}-300 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-{secondary}-300 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      badge: { type: "string", required: true, maxLength: 40 },
      ctaLabel: { type: "string", required: true, maxLength: 24 },
      secondaryCta: { type: "string", required: true, maxLength: 24 },
      heroImage: { type: "string", required: true },
      heroImageAlt: { type: "string", required: true, maxLength: 100 }
    }
  },
  {
    id: "about-team",
    name: "About with Team",
    description: "About section featuring team members",
    template: `export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6">{title}</h2>
          <p className="text-xl text-{primary}-700 mb-8 max-w-3xl mx-auto leading-relaxed">{description}</p>
          <div className="w-24 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers}
        </div>
        
        <div className="bg-{primary}-50 rounded-2xl p-8 md:p-12">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-{primary}-900 mb-6">{missionTitle}</h3>
            <p className="text-lg text-{primary}-700 mb-8 max-w-2xl mx-auto leading-relaxed">{missionStatement}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      teamMembers: { type: "array", required: true },
      missionTitle: { type: "string", required: true, maxLength: 60 },
      missionStatement: { type: "string", required: true, maxLength: 200 }
    }
  },
  {
    id: "about-story",
    name: "About Story Timeline",
    description: "About section with company story timeline",
    template: `export default function About() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-{primary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6">{title}</h2>
          <p className="text-xl text-{primary}-700 mb-8 max-w-3xl mx-auto leading-relaxed">{description}</p>
        </div>
        
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-{primary}-200 rounded-full"></div>
          
          <div className="space-y-12">
            {storyItems}
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <div className="inline-flex items-center px-8 py-4 bg-{primary}-600 text-white font-bold text-lg rounded-xl hover:bg-{primary}-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            {ctaLabel}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      storyItems: { type: "array", required: true },
      ctaLabel: { type: "string", required: true, maxLength: 24 }
    }
  },
  {
    id: "about-values",
    name: "About with Values",
    description: "About section highlighting company values",
    template: `export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6">{title}</h2>
            <p className="text-xl text-{primary}-700 mb-8 leading-relaxed">{description}</p>
            
            <div className="space-y-4">
              {values}
            </div>
          </div>
          
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="{heroImage}" 
                alt="{heroImageAlt}"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-{primary}-900 text-white rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats}
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      values: { type: "array", required: true },
      heroImage: { type: "string", required: true },
      heroImageAlt: { type: "string", required: true, maxLength: 100 }
    }
  }
];