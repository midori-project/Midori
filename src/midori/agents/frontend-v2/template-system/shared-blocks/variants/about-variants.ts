import { BlockVariant } from "../index";

export const aboutVariants: BlockVariant[] = [
  {
    id: "about-split",
    name: "About with Image Split",
    description: "About section with split layout - image on one side, content on the other",
    template: `export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="{aboutImage}" 
                alt="{aboutImageAlt}"
                className="w-full h-[600px] object-cover"
                data-editable="true"
                data-block-id="about-basic"
                data-field="aboutImage"
                data-type="image"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -z-10 -top-8 -left-8 w-64 h-64 bg-{primary}-300 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-{secondary}-300 rounded-full blur-3xl opacity-30"></div>
          </div>
          
          {/* Content Side */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-{primary}-900 mb-6">
                {title}
              </h2>
              <p className="text-xl text-{primary}-700 leading-relaxed">
                {description}
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-6">
              {features}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-{primary}-200">
              {stats}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      aboutImage: {
        type: "string",
        required: true,
        description: "About section image URL from Unsplash"
      },
      aboutImageAlt: {
        type: "string",
        required: true,
        maxLength: 100,
        description: "About image alt text for accessibility"
      }
    }
  },
  {
    id: "about-team",
    name: "About with Team",
    description: "About section with team members showcase - builds trust",
    template: `export default function About() {
  return (
    <section className="py-20 bg-gradient-to-br from-{primary}-50 via-white to-{secondary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* About Content */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-{primary}-700 leading-relaxed mb-12">
            {description}
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features}
          </div>
        </div>
        
        {/* Team Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-{primary}-900 mb-3">
              {teamTitle}
            </h3>
            <p className="text-lg text-{primary}-600">
              {teamSubtitle}
            </p>
          </div>
          
          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers}
          </div>
        </div>
        
        {/* Stats */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white rounded-3xl shadow-lg p-8">
            {stats}
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      teamTitle: {
        type: "string",
        required: true,
        maxLength: 60,
        description: "Team section title"
      },
      teamSubtitle: {
        type: "string",
        required: true,
        maxLength: 120,
        description: "Team section subtitle"
      },
      teamMembers: {
        type: "array",
        required: true,
        description: "Array of team member objects"
      }
    }
  },
  {
    id: "about-timeline",
    name: "About with Timeline",
    description: "About section with company history timeline - storytelling approach",
    template: `export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6">
            {title}
          </h2>
          <p className="text-xl text-{primary}-700 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Timeline */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-{primary}-400 via-{primary}-500 to-{primary}-600 hidden lg:block"></div>
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {timelineItems}
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features}
          </div>
        </div>
        
        {/* Stats */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-{primary}-900 to-{primary}-800 rounded-3xl shadow-2xl p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      timelineItems: {
        type: "array",
        required: true,
        description: "Array of timeline milestone objects with year, title, and description"
      }
    }
  },
  {
    id: "about-minimal",
    name: "About Minimal",
    description: "Clean minimal about section - simple and elegant",
    template: `export default function About() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-bold text-{primary}-600 tracking-widest uppercase mb-4 border-b-2 border-{primary}-600 pb-2">
            About Us
          </span>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            {title}
          </h2>
          <p className="text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {features}
        </div>
        
        {/* Stats Bar */}
        <div className="border-t border-b border-gray-200 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats}
          </div>
        </div>
        
        {/* Additional Content */}
        <div className="mt-20 text-center">
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            {additionalContent}
          </p>
          <div className="inline-flex items-center gap-2 text-{primary}-600 font-semibold">
            <span>Learn more about our journey</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      additionalContent: {
        type: "string",
        required: false,
        maxLength: 300,
        description: "Additional content text (optional)",
        defaultValue: "We're committed to delivering excellence in everything we do."
      }
    }
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
              data-editable="true"
              data-block-id="about-basic"
              data-field="heroImage"
              data-type="image"
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
      badge: { 
        type: "string", 
        required: true, 
        maxLength: 40 
      },
      ctaLabel: { 
        type: "string", 
        required: true, 
        maxLength: 24 
      },
      secondaryCta: { 
        type: "string", 
        required: true, 
        maxLength: 24 
      },
      heroImage: { 
        type: "string", 
        required: true 
      },
      heroImageAlt: { 
        type: "string", 
        required: true, 
        maxLength: 100 
      }
    }
  },
  {
    id: "about-team-showcase",
    name: "About with Team Showcase",
    description: "About section featuring team members showcase",
    template: `export default function About() {
return (
  <section className="py-20 bg-white">
    <div className="max-w-screen-2xl mx-auto px-4">
      <div className="text-center mb-16">
        <h2 
          className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-6"
          data-editable="true"
          data-block-id="about-team-showcase"
          data-field="title"
          data-type="heading"
        >
          {title}
        </h2>
        <p 
          className="text-xl text-{primary}-700 mb-8 max-w-3xl mx-auto leading-relaxed"
          data-editable="true"
          data-block-id="about-team-showcase"
          data-field="description"
          data-type="text"
        >
          {description}
        </p>
        <div className="w-24 h-1 bg-{primary}-500 mx-auto rounded-full"></div>
      </div>
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        data-editable="true"
        data-block-id="about-team-showcase"
        data-field="teamMembers"
        data-type="array"
      >
        {teamMembers}
      </div>
      
      <div className="bg-{primary}-50 rounded-2xl p-8 md:p-12">
        <div className="text-center">
          <h3 
            className="text-3xl font-bold text-{primary}-900 mb-6"
            data-editable="true"
            data-block-id="about-team-showcase"
            data-field="missionTitle"
            data-type="heading"
          >
            {missionTitle}
          </h3>
          <p 
            className="text-lg text-{primary}-700 mb-8 max-w-2xl mx-auto leading-relaxed"
            data-editable="true"
            data-block-id="about-team-showcase"
            data-field="missionStatement"
            data-type="text"
          >
            {missionStatement}
          </p>
          
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            data-editable="true"
            data-block-id="about-team-showcase"
            data-field="stats"
            data-type="array"
          >
            {stats}
          </div>
        </div>
      </div>
    </div>
  </section>
);
}`,
    overrides: {
      teamMembers: { 
        type: "array", 
        required: true 
      },
      missionTitle: { 
        type: "string", 
        required: true, 
        maxLength: 60 
      },
      missionStatement: { 
        type: "string", 
        required: true, 
        maxLength: 200 
      }
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
      storyItems: { 
        type: "array", 
        required: true 
      },
      ctaLabel: { 
        type: "string", 
        required: true, 
        maxLength: 24 
      }
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
              data-editable="true"
              data-block-id="about-basic"
              data-field="heroImage"
              data-type="image"
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
      values: { 
        type: "array", 
        required: true 
      },
      heroImage: { 
        type: "string", 
        required: true 
      },
      heroImageAlt: { 
        type: "string", 
        required: true, 
        maxLength: 100 
      }
    }
  }
];

