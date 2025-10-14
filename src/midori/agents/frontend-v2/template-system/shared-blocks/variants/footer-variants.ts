import { BlockVariant } from "../index";

export const footerVariants: BlockVariant[] = [
  {
    id: "footer-basic",
    name: "Basic Footer",
    description: "Simple footer with company info and links",
    template: `export default function Footer() {
  return (
    <footer className="bg-{primary}-900 text-white py-12">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">{companyName}</h3>
            <p className="mb-4">{description}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            {quickLinks}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              <p>{address}</p>
              <p>{phone}</p>
              <p>{email}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Social</h4>
            {socialLinks}
          </div>
        </div>
      </div>
    </footer>
  );
}`,
    overrides: {}
  },
  {
    id: "footer-mega",
    name: "Mega Footer",
    description: "Comprehensive footer with multiple sections",
    template: `export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{companyName}</h3>
            <p className="mb-6">{description}</p>
            <div className="flex space-x-4">
              {socialLinks}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            {productLinks}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            {companyLinks}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            {supportLinks}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="mb-4">{newsletterDescription}</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg"
              />
              <button className="px-4 py-2 bg-blue-600 rounded-r-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>&copy; 2024 {companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}`,
    overrides: {
      productLinks: { type: "array", required: true },
      companyLinks: { type: "array", required: true },
      supportLinks: { type: "array", required: true },
      newsletterDescription: { type: "string", required: true }
    }
  }
];