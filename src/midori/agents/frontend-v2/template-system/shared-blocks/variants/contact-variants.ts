import { BlockVariant } from "../index";

export const contactVariants: BlockVariant[] = [
  {
    id: "contact-split",
    name: "Contact Split Layout",
    description: "Contact section with split layout - form on one side, info on the other",
    template: `import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-{primary}-50 to-white">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-4">{title}</h2>
          <p className="text-xl text-{primary}-700 max-w-3xl mx-auto">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info Side */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-{primary}-900 mb-6">{contactInfoTitle}</h3>
              <p className="text-lg text-{primary}-700 mb-8">{contactInfoDescription}</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start group">
                <div className="w-14 h-14 bg-gradient-to-br from-{primary}-500 to-{primary}-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <span className="text-white text-2xl">📍</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-{primary}-900 mb-2">{addressLabel}</h4>
                  <p className="text-{primary}-700 text-lg">{address}</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-14 h-14 bg-gradient-to-br from-{secondary}-500 to-{secondary}-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <span className="text-white text-2xl">📞</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-{primary}-900 mb-2">{phoneLabel}</h4>
                  <p className="text-{primary}-700 text-lg">{phone}</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-14 h-14 bg-gradient-to-br from-{primary}-500 to-{secondary}-500 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <span className="text-white text-2xl">✉️</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-{primary}-900 mb-2">{emailLabel}</h4>
                  <p className="text-{primary}-700 text-lg">{email}</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-14 h-14 bg-gradient-to-br from-{primary}-600 to-{primary}-700 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <span className="text-white text-2xl">🕒</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-{primary}-900 mb-2">{businessHoursLabel}</h4>
                  <p className="text-{primary}-700 text-lg">{businessHours}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form Side */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <h3 className="text-3xl font-bold text-{primary}-900 mb-6">{contactFormTitle}</h3>
            <p className="text-{primary}-600 mb-8">{contactFormDescription}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-{primary}-700 mb-3">{nameLabel}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 border-2 border-{primary}-200 rounded-xl focus:ring-2 focus:ring-{primary}-500 focus:border-transparent transition-all" 
                  placeholder="{namePlaceholder}"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-{primary}-700 mb-3">{emailLabel}</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-4 border-2 border-{primary}-200 rounded-xl focus:ring-2 focus:ring-{primary}-500 focus:border-transparent transition-all" 
                  placeholder="{emailPlaceholder}"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-{primary}-700 mb-3">{messageLabel}</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5} 
                  className="w-full p-4 border-2 border-{primary}-200 rounded-xl focus:ring-2 focus:ring-{primary}-500 focus:border-transparent transition-all resize-none" 
                  placeholder="{messagePlaceholder}"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-{primary}-600 to-{secondary}-600 text-white py-4 px-8 rounded-xl hover:from-{primary}-700 hover:to-{secondary}-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {contactFormCta}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "contact-minimal",
    name: "Contact Minimal",
    description: "Clean minimal contact section - simple and elegant",
    template: `import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-bold text-{primary}-600 tracking-widest uppercase mb-4 border-b-2 border-{primary}-600 pb-2">
            ติดต่อเรา
          </span>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            {title}
          </h2>
          <p className="text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{contactInfoTitle}</h3>
              <p className="text-lg text-gray-600 mb-8">{contactInfoDescription}</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-{primary}-600 text-xl">📍</span>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="font-bold text-gray-900">{addressLabel}</h4>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-{primary}-600 text-xl">📞</span>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="font-bold text-gray-900">{phoneLabel}</h4>
                  <p className="text-gray-600">{phone}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-{primary}-600 text-xl">✉️</span>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="font-bold text-gray-900">{emailLabel}</h4>
                  <p className="text-gray-600">{email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-12 h-12 bg-{primary}-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-{primary}-600 text-xl">🕒</span>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="font-bold text-gray-900">{businessHoursLabel}</h4>
                  <p className="text-gray-600">{businessHours}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">{contactFormTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{nameLabel}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-{primary}-500 focus:border-transparent" 
                  placeholder="{namePlaceholder}"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{emailLabel}</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-{primary}-500 focus:border-transparent" 
                  placeholder="{emailPlaceholder}"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{messageLabel}</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-{primary}-500 focus:border-transparent" 
                  placeholder="{messagePlaceholder}"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-{primary}-600 text-white py-3 px-6 rounded-lg hover:bg-{primary}-700 transition-colors font-semibold"
              >
                {contactFormCta}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "contact-cards",
    name: "Contact with Cards",
    description: "Contact section with feature cards - engaging layout",
    template: `import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-{primary}-50 via-white to-{secondary}-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-{primary}-900 mb-4">{title}</h2>
          <p className="text-xl text-{primary}-700 max-w-3xl mx-auto">{subtitle}</p>
        </div>
        
        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-{primary}-100">
            <div className="w-16 h-16 bg-gradient-to-br from-{primary}-500 to-{primary}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-white text-3xl">📍</span>
            </div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-4">{addressLabel}</h3>
            <p className="text-{primary}-700 text-lg leading-relaxed">{address}</p>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-{secondary}-100">
            <div className="w-16 h-16 bg-gradient-to-br from-{secondary}-500 to-{secondary}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-white text-3xl">📞</span>
            </div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-4">{phoneLabel}</h3>
            <p className="text-{primary}-700 text-lg">{phone}</p>
          </div>
          
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-{primary}-100">
            <div className="w-16 h-16 bg-gradient-to-br from-{primary}-500 to-{secondary}-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-white text-3xl">✉️</span>
            </div>
            <h3 className="text-2xl font-bold text-{primary}-900 mb-4">{emailLabel}</h3>
            <p className="text-{primary}-700 text-lg">{email}</p>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-{primary}-900 mb-4">{contactFormTitle}</h3>
              <p className="text-{primary}-600 text-lg">{contactFormDescription}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-{primary}-700 mb-3">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 border-2 border-{primary}-200 rounded-xl focus:ring-2 focus:ring-{primary}-500 focus:border-transparent transition-all" 
                    placeholder="{namePlaceholder}"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-{primary}-700 mb-3">อีเมล</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-4 border-2 border-{primary}-200 rounded-xl focus:ring-2 focus:ring-{primary}-500 focus:border-transparent transition-all" 
                    placeholder="{emailPlaceholder}"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-{primary}-700 mb-3">{messageLabel}</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5} 
                  className="w-full p-4 border-2 border-{primary}-200 rounded-xl focus:ring-2 focus:ring-{primary}-500 focus:border-transparent transition-all resize-none" 
                  placeholder="{messagePlaceholder}"
                  required
                ></textarea>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit"
                  className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-{primary}-600 to-{secondary}-600 text-white font-bold text-lg rounded-xl hover:from-{primary}-700 hover:to-{secondary}-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  {contactFormCta}
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {}
  },
  {
    id: "contact-fullscreen",
    name: "Contact Fullscreen",
    description: "Dramatic fullscreen contact with background image - luxury feel",
    template: `import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-{primary}-900 via-{primary}-800 to-{secondary}-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="{contactImage}" 
          alt="{contactImageAlt}"
          className="w-full h-full object-cover"
          loading="eager"
          data-editable="true"
          data-block-id="contact-basic"
          data-field="contactImage"
          data-type="image"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-{primary}-900/80 via-{primary}-800/70 to-{secondary}-900/80"></div>
      </div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative max-w-screen-2xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-8">
            <span className="text-sm font-medium tracking-wider uppercase text-white">ติดต่อเรา</span>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 drop-shadow-2xl leading-tight">
            {title}
          </h2>
          
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">{contactInfoTitle}</h3>
              <p className="text-xl text-white/80 mb-8">{contactInfoDescription}</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start group">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform border border-white/30">
                  <span className="text-white text-3xl">📍</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">{addressLabel}</h4>
                  <p className="text-white/80 text-lg">{address}</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform border border-white/30">
                  <span className="text-white text-3xl">📞</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">{phoneLabel}</h4>
                  <p className="text-white/80 text-lg">{phone}</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform border border-white/30">
                  <span className="text-white text-3xl">✉️</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">{emailLabel}</h4>
                  <p className="text-white/80 text-lg">{email}</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform border border-white/30">
                  <span className="text-white text-3xl">🕒</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">{businessHoursLabel}</h4>
                  <p className="text-white/80 text-lg">{businessHours}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-6">{contactFormTitle}</h3>
            <p className="text-white/80 mb-8 text-lg">{contactFormDescription}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white mb-3">{nameLabel}</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all text-white placeholder-white/60" 
                  placeholder="{namePlaceholder}"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-white mb-3">{emailLabel}</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all text-white placeholder-white/60" 
                  placeholder="{emailPlaceholder}"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-white mb-3">{messageLabel}</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5} 
                  className="w-full p-4 bg-white/20 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all resize-none text-white placeholder-white/60" 
                  placeholder="{messagePlaceholder}"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-white text-{primary}-900 py-4 px-8 rounded-xl hover:bg-white/90 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {contactFormCta}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    overrides: {
      contactImage: {
        type: "string",
        required: true,
        description: "Contact section background image URL from Unsplash"
      },
      contactImageAlt: {
        type: "string",
        required: true,
        maxLength: 100,
        description: "Contact image alt text for accessibility"
      }
    }
  }
];
