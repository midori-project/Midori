export default function Hero(){
    return (
      <section className="relative py-20 bg-gradient-to-br from-{primary}-50 via-{primary}-100 to-{primary}-200 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiN7cHJpbWFyeX0yMCIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-{primary}-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-{accentColor}-300 rounded-full opacity-25 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-{primary}-400 rounded-full opacity-30 animate-pulse"></div>
        
        <div className="relative container mx-auto text-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-{primary}-200 text-{primary}-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-{primary}-500 rounded-full mr-2 animate-pulse"></span>
            {badge}
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-{primary}-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-{primary}-600 to-{accentColor}-600 bg-clip-text text-transparent">
              {heading}
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-{primary}-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            {subheading}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-{accentColor}-500 to-{accentColor}-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <span className="relative z-10">{ctaLabel}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-{accentColor}-600 to-{accentColor}-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            
            <a className="inline-flex items-center px-8 py-4 border-2 border-{primary}-300 text-{primary}-700 font-semibold text-lg rounded-full hover:bg-{primary}-50 hover:border-{primary}-400 transition-all duration-300">
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {secondaryCta}
            </a>
          </div>
          
          {/* Stats or Features */}
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
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" className="text-{primary}-100"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" className="text-{primary}-200"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" className="text-{primary}-300"></path>
          </svg>
        </div>
      </section>
    );
  }