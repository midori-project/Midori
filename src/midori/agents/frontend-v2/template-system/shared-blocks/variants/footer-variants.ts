import { BlockVariant } from "../index";

export const footerVariants: BlockVariant[] = [
  {
    id: "footer-minimal",
    name: "Footer Minimal",
    description: "Minimal footer with essential info only",
    template: `import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Company Name */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-{primary}-900">{companyName}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          
          {/* Quick Links */}
          <div className="flex gap-6">
            {quickLinks}
          </div>
          
          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks}
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            &copy; 2024 {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}`,
    overrides: {}
  },
  {
    id: "footer-centered",
    name: "Footer Centered",
    description: "Centered footer layout - elegant and balanced",
    template: `import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-{primary}-900 to-{primary}-800 text-white py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Company Info */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-3 text-white">{companyName}</h3>
          <p className="text-{primary}-200 max-w-2xl mx-auto">{description}</p>
        </div>
        
        {/* Social Links */}
        <div className="flex justify-center gap-4 mb-8">
          {socialLinks}
        </div>
        
        {/* Quick Links */}
        <div className="flex justify-center gap-6 mb-8">
          {quickLinks}
        </div>
        
        {/* Contact Info */}
        <div className="space-y-2 mb-8">
          <p className="text-{primary}-200">📍 {address}</p>
          <p className="text-{primary}-200">📞 {phone}</p>
          <p className="text-{primary}-200">✉️ {email}</p>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-{primary}-700">
          <p className="text-{primary}-300 text-sm">
            &copy; 2024 {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}`,
    overrides: {}
  },
  {
    id: "footer-mega",
    name: "Footer Mega",
    description: "Large detailed footer - comprehensive information",
    template: `import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-{primary}-950 text-white py-16">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info - Larger */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-white">{companyName}</h3>
            <p className="text-{primary}-200 mb-6 leading-relaxed">{description}</p>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {socialLinks}
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-{primary}-300">
                <span className="mr-2">📍</span>
                <span>{address}</span>
              </div>
              <div className="flex items-center text-{primary}-300">
                <span className="mr-2">📞</span>
                <span>{phone}</span>
              </div>
              <div className="flex items-center text-{primary}-300">
                <span className="mr-2">✉️</span>
                <span>{email}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks}
            </ul>
          </div>
          
          {/* Additional Column 1 */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Services</h4>
            <ul className="space-y-3 text-{primary}-200">
              <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/testimonials" className="hover:text-white transition-colors">Testimonials</Link></li>
            </ul>
          </div>
          
          {/* Additional Column 2 */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Support</h4>
            <ul className="space-y-3 text-{primary}-200">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-{primary}-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-{primary}-300 text-sm">
              &copy; 2024 {companyName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-{primary}-300 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-{primary}-300 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-{primary}-300 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}`,
    overrides: {}
  }
];

