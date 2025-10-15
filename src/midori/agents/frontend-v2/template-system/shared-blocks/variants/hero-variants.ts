import { BlockVariant } from "../index";

export const heroVariants: BlockVariant[] = [
  {
    id: "hero-stats",
    name: "Hero with Statistics",
    description: "Hero section with statistics section",
    template: `import { Link } from "react-router-dom";

export default function Hero(){
    return (
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="{heroImage}" 
            alt="{heroImageAlt}"
            className="w-full h-full object-cover"
            loading="eager"
            data-editable="true"
            data-block-id="hero-basic"
            data-field="heroImage"
            data-type="image"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-{primary}-900/80 via-{primary}-800/70 to-{primary}-700/80"></div>
        </div>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiN7cHJpbWFyeX0yMCIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-screen-2xl mx-auto text-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white/30 text-{primary}-700 text-sm font-medium mb-6 shadow-lg">
            <span className="w-2 h-2 bg-{primary}-500 rounded-full mr-2 animate-pulse"></span>
            {badge}
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            <span className="bg-gradient-to-r from-white to-{primary}-100 bg-clip-text text-transparent">
              {heading}
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            {subheading}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/menu" className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-{secondary}-500 to-{secondary}-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <span className="relative z-10">{ctaLabel}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-{secondary}-600 to-{secondary}-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link to="/about" className="inline-flex items-center px-8 py-4 bg-white/90 backdrop-blur-sm border-2 border-white/50 text-{primary}-700 font-semibold text-lg rounded-full hover:bg-white hover:border-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {secondaryCta}
            </Link>
          </div>
        
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-{primary}-600 mb-2">{stat1}</div>
              <div className="text-{primary}-700 font-medium">{stat1Label}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-{primary}-600 mb-2">{stat2}</div>
              <div className="text-{primary}-700 font-medium">{stat2Label}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-{primary}-600 mb-2">{stat3}</div>
              <div className="text-{primary}-700 font-medium">{stat3Label}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }`,
    overrides: {
      stat1: { type: "string", required: true, maxLength: 20 },
      stat1Label: { type: "string", required: true, maxLength: 40 },
      stat2: { type: "string", required: true, maxLength: 20 },
      stat2Label: { type: "string", required: true, maxLength: 40 },
      stat3: { type: "string", required: true, maxLength: 20 },
      stat3Label: { type: "string", required: true, maxLength: 40 },
    },
  },
  {
    id: "hero-split",
    name: "Hero Split Layout",
    description: "Hero section with split layout - modern and clean",
    template: `import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-white to-{primary}-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-{primary}-100 text-{primary}-700 text-sm font-semibold shadow-sm">
              <span className="w-2 h-2 bg-{primary}-500 rounded-full mr-2 animate-pulse"></span>
              {badge}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-{primary}-900 leading-tight">
              {heading}
            </h1>
            
            <p className="text-xl text-{primary}-700 leading-relaxed max-w-lg">
              {subheading}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu" className="group inline-flex items-center justify-center px-8 py-4 bg-{primary}-600 text-white font-bold text-lg rounded-xl hover:bg-{primary}-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                {ctaLabel}
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link to="/about" className="inline-flex items-center justify-center px-8 py-4 border-2 border-{primary}-300 text-{primary}-700 font-semibold text-lg rounded-xl hover:border-{primary}-600 hover:bg-{primary}-50 transition-all duration-300">
                {secondaryCta}
              </Link>
            </div>
          </div>
          
          {/* Image Side */}
          <div className="relative lg:h-[600px]">
            <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="{heroImage}" 
                alt="{heroImageAlt}"
                className="w-full h-full object-cover"
                loading="eager"
                data-editable="true"
                data-block-id="hero-basic"
                data-field="heroImage"
                data-type="image"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-{primary}-300 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-72 h-72 bg-{secondary}-300 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "hero-fullscreen",
    name: "Hero Fullscreen",
    description: "Dramatic fullscreen hero with overlay - luxury feel",
    template: `import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="{heroImage}" 
          alt="{heroImageAlt}"
          className="w-full h-full object-cover"
          loading="eager"
          data-editable="true"
          data-block-id="hero-basic"
          data-field="heroImage"
          data-type="image"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-{primary}-900/60"></div>
      </div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMyIgY3k9IjMiIHI9IjMiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-8">
          <span className="text-sm font-medium tracking-wider uppercase">{badge}</span>
        </div>
        
        <h1 className="text-6xl lg:text-8xl font-black mb-8 drop-shadow-2xl leading-tight">
          <span className="bg-gradient-to-r from-white via-white to-{primary}-200 bg-clip-text text-transparent">
            {heading}
          </span>
        </h1>
        
        <p className="text-2xl lg:text-3xl mb-12 drop-shadow-lg text-white/95 leading-relaxed max-w-3xl mx-auto">
          {subheading}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/menu" className="group inline-flex items-center justify-center px-10 py-5 bg-white text-{primary}-900 font-bold text-lg rounded-full hover:bg-{primary}-50 transition-all shadow-2xl hover:shadow-white/20 transform hover:scale-105">
            <span>{ctaLabel}</span>
            <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link to="/about" className="inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-lg text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all">
            {secondaryCta}
          </Link>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-white/70 animate-bounce">
          <span className="text-sm font-medium tracking-wider uppercase">Scroll</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "hero-minimal",
    name: "Hero Minimal",
    description: "Clean minimal hero - simple and elegant",
    template: `import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative py-32 lg:py-40 bg-white">
      <div className="max-w-5xl mx-auto text-center px-4">
        {/* Badge */}
        <span className="inline-block text-sm font-bold text-{primary}-600 tracking-widest uppercase mb-6 border-b-2 border-{primary}-600 pb-2">
          {badge}
        </span>
        
        {/* Heading */}
        <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
          {heading}
        </h1>
        
        {/* Subheading */}
        <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          {subheading}
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/menu" className="inline-flex items-center justify-center px-8 py-4 bg-{primary}-600 text-white font-medium rounded-lg hover:bg-{primary}-700 transition-colors shadow-sm">
            {ctaLabel}
          </Link>
          
          <Link to="/about" className="inline-flex items-center justify-center px-8 py-4 text-{primary}-600 font-medium border border-{primary}-300 rounded-lg hover:border-{primary}-600 hover:bg-{primary}-50 transition-all">
            {secondaryCta}
          </Link>
        </div>
        
        {/* Hero Image */}
        <div className="mt-20 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto border border-gray-100">
          <img 
            src="{heroImage}" 
            alt="{heroImageAlt}"
            className="w-full h-auto"
            loading="eager"
            data-editable="true"
            data-block-id="hero-basic"
            data-field="heroImage"
            data-type="image"
          />
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "hero-cards",
    name: "Hero with Feature Cards",
    description: "Hero with prominent feature cards - engaging layout",
    template: `import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-{primary}-50 via-white to-{secondary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Hero Content */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-5 py-2 rounded-full bg-white shadow-md text-{primary}-700 text-sm font-semibold mb-8 border border-{primary}-100">
            <span className="w-2 h-2 bg-{primary}-500 rounded-full mr-2 animate-pulse"></span>
            {badge}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-{primary}-900 mb-8 leading-tight">
            {heading}
          </h1>
          
          <p className="text-xl lg:text-2xl text-{primary}-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            {subheading}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/menu" className="inline-flex items-center justify-center px-10 py-4 bg-{primary}-600 text-white font-bold text-lg rounded-xl hover:bg-{primary}-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              {ctaLabel}
            </Link>
            
            <Link to="/about" className="inline-flex items-center justify-center px-10 py-4 bg-white text-{primary}-600 font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              {secondaryCta}
            </Link>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-{primary}-100">
            <div className="w-20 h-20 bg-gradient-to-br from-{primary}-100 to-{primary}-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl font-black text-{primary}-600">{stat1}</span>
            </div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-3">{stat1Label}</h3>
            <p className="text-{primary}-600">คุณภาพที่คุณไว้วางใจได้</p>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-{secondary}-100">
            <div className="w-20 h-20 bg-gradient-to-br from-{secondary}-100 to-{secondary}-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl font-black text-{secondary}-600">{stat2}</span>
            </div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-3">{stat2Label}</h3>
            <p className="text-{primary}-600">บริการที่เหนือระดับทุกครั้ง</p>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-{primary}-100">
            <div className="w-20 h-20 bg-gradient-to-br from-{primary}-100 to-{primary}-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl font-black text-{primary}-600">{stat3}</span>
            </div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-3">{stat3Label}</h3>
            <p className="text-{primary}-600">ความพึงพอใจสูงสุดของลูกค้า</p>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      stat1: { type: "string", required: true, maxLength: 20, description: "First statistic value" },
      stat1Label: { type: "string", required: true, maxLength: 40, description: "First statistic label" },
      stat2: { type: "string", required: true, maxLength: 20, description: "Second statistic value" },
      stat2Label: { type: "string", required: true, maxLength: 40, description: "Second statistic label" },
      stat3: { type: "string", required: true, maxLength: 20, description: "Third statistic value" },
      stat3Label: { type: "string", required: true, maxLength: 40, description: "Third statistic label" }
    }
  },
];

