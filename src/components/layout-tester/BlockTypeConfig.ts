// Block Type Configuration
// รวม variants ทุกประเภทไว้ที่เดียว

import { BlockVariant } from '@/midori/agents/frontend-v2/template-system/shared-blocks/index';
import { heroVariants } from '@/midori/agents/frontend-v2/template-system/shared-blocks/variants/hero-variants';
import { footerVariants } from '@/midori/agents/frontend-v2/template-system/shared-blocks/variants/footer-variants';
import { aboutVariants } from '@/midori/agents/frontend-v2/template-system/shared-blocks/variants/about-variants';
import { menuVariants } from '@/midori/agents/frontend-v2/template-system/shared-blocks/variants/menu-variants';

export interface BlockType {
  id: string;
  name: string;
  icon: string;
  variants: BlockVariant[];
  mockDataTemplate: Record<string, any>;
}

export const BLOCK_TYPES: BlockType[] = [
  {
    id: 'hero',
    name: 'Hero Sections',
    icon: '🎯',
    variants: heroVariants,
    mockDataTemplate: {
      badge: 'New Release',
      heading: 'Welcome to Our Amazing Product',
      subheading: 'Experience the next generation of innovation with our cutting-edge solution designed for modern businesses.',
      ctaLabel: 'Get Started',
      secondaryCta: 'Learn More',
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      heroImageAlt: 'Hero background image',
      stat1: '100+',
      stat1Label: 'Happy Customers',
      stat2: '24/7',
      stat2Label: 'Support Available',
      stat3: '5★',
      stat3Label: 'Average Rating',
    }
  },
  {
    id: 'footer',
    name: 'Footer Sections',
    icon: '📄',
    variants: footerVariants,
    mockDataTemplate: {
      companyName: 'Your Company',
      description: 'We provide excellent services to help your business grow and succeed in the digital age.',
      address: '123 Main Street, Bangkok, Thailand 10110',
      phone: '02-123-4567',
      email: 'info@yourcompany.com',
      quickLinks: '<ul className="space-y-2"><li><a href="/about" className="hover:text-white transition-colors">About</a></li><li><a href="/services" className="hover:text-white transition-colors">Services</a></li><li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li></ul>',
      socialLinks: '<div className="flex space-x-4"><a href="#" className="hover:text-white transition-colors">Facebook</a><a href="#" className="hover:text-white transition-colors">Twitter</a><a href="#" className="hover:text-white transition-colors">Instagram</a></div>',
      quickLinksTitle: 'Quick Links',
      contactTitle: 'Contact Us',
      newsletterTitle: 'Newsletter',
      newsletterSubtitle: 'Subscribe to get updates',
      newsletterEmailPlaceholder: 'Enter your email',
      newsletterCta: 'Subscribe',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      productLinks: '<ul className="space-y-2"><li><a href="#" className="hover:text-white transition-colors">Product 1</a></li><li><a href="#" className="hover:text-white transition-colors">Product 2</a></li><li><a href="#" className="hover:text-white transition-colors">Product 3</a></li></ul>',
      companyLinks: '<ul className="space-y-2"><li><a href="#" className="hover:text-white transition-colors">About</a></li><li><a href="#" className="hover:text-white transition-colors">Team</a></li><li><a href="#" className="hover:text-white transition-colors">Careers</a></li></ul>',
      supportLinks: '<ul className="space-y-2"><li><a href="#" className="hover:text-white transition-colors">Help Center</a></li><li><a href="#" className="hover:text-white transition-colors">Contact</a></li><li><a href="#" className="hover:text-white transition-colors">FAQ</a></li></ul>',
      newsletterDescription: 'Get the latest updates and news delivered to your inbox.',
    }
  },
  {
    id: 'about',
    name: 'About Sections',
    icon: '📖',
    variants: aboutVariants,
    mockDataTemplate: {
      title: 'About Our Company',
      description: 'We are dedicated to providing the best service to our customers with passion and expertise.',
      badge: 'Since 2020',
      ctaLabel: 'Learn More',
      secondaryCta: 'Contact Us',
      heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      heroImageAlt: 'Our team working together',
      features: '<div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">🎯</span></div><h3 className="font-bold mb-2 text-lg">Quality First</h3><p className="text-gray-600">We prioritize quality in everything we do</p></div>',
      stats: '<div className="text-center"><div className="text-3xl font-bold text-blue-600">100+</div><div className="text-sm text-gray-600">Happy Clients</div></div>',
      teamMembers: '<div className="bg-white rounded-lg p-6 shadow-sm text-center hover:shadow-md transition-shadow"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" alt="Team member" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"/><h4 className="font-bold text-lg">John Doe</h4><p className="text-gray-600">CEO & Founder</p></div>',
      missionTitle: 'Our Mission',
      missionStatement: 'To deliver exceptional value and create lasting relationships with our clients through innovative solutions.',
      storyItems: '<div className="flex items-center space-x-8"><div className="flex-shrink-0"><div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">2020</div></div><div className="bg-white rounded-lg p-6 shadow-sm"><h4 className="font-bold text-lg mb-2">Company Founded</h4><p className="text-gray-600">Started our journey with a vision to revolutionize the industry</p></div></div>',
      values: '<div className="flex items-start space-x-4"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><span className="text-green-600 text-sm">✓</span></div><div><h4 className="font-semibold">Integrity</h4><p className="text-gray-600 text-sm">We maintain the highest ethical standards</p></div></div>',
    }
  },
  {
    id: 'menu',
    name: 'Menu/Product Sections',
    icon: '🍽️',
    variants: menuVariants,
    mockDataTemplate: {
      title: 'Our Menu',
      subtitle: 'Discover our delicious selection of carefully crafted dishes',
      ctaLabel: 'View Full Menu',
      featuredTitle: 'Featured Items',
      regularTitle: 'All Items',
      menuItems: `
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" alt="Caesar Salad" className="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 className="font-bold text-xl mb-2">Caesar Salad</h3>
          <p className="text-gray-600 mb-4">Fresh romaine lettuce with parmesan cheese and croutons</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">$12.99</span>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Order</button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop" alt="Margherita Pizza" className="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 className="font-bold text-xl mb-2">Margherita Pizza</h3>
          <p className="text-gray-600 mb-4">Classic Italian pizza with fresh mozzarella and basil</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">$18.99</span>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Order</button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop" alt="Beef Burger" className="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 className="font-bold text-xl mb-2">Classic Beef Burger</h3>
          <p className="text-gray-600 mb-4">Juicy beef patty with lettuce, tomato, and special sauce</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">$15.99</span>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Order</button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop" alt="Pancakes" className="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 className="font-bold text-xl mb-2">Fluffy Pancakes</h3>
          <p className="text-gray-600 mb-4">Stack of fluffy pancakes with maple syrup and butter</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">$9.99</span>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Order</button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" alt="Pasta Carbonara" className="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 className="font-bold text-xl mb-2">Pasta Carbonara</h3>
          <p className="text-gray-600 mb-4">Creamy pasta with bacon, eggs, and parmesan cheese</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">$16.99</span>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Order</button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop" alt="Grilled Salmon" className="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 className="font-bold text-xl mb-2">Grilled Salmon</h3>
          <p className="text-gray-600 mb-4">Fresh Atlantic salmon grilled to perfection</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">$22.99</span>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Order</button>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop" alt="Chocolate Cake" className="w-full h-48 object-cover rounded-lg mb-4"/>
          <h3 className="font-bold text-xl mb-2">Chocolate Lava Cake</h3>
          <p className="text-gray-600 mb-4">Rich chocolate cake with molten center and vanilla ice cream</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">$8.99</span>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Order</button>
          </div>
        </div>
      `,
      featuredItems: `
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <img src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&h=100&fit=crop" alt="Grilled Salmon" className="w-16 h-16 rounded-lg object-cover"/>
          <div className="flex-1">
            <h4 className="font-bold">Grilled Salmon</h4>
            <p className="text-gray-600 text-sm">Fresh Atlantic salmon</p>
          </div>
          <span className="font-bold text-blue-600">$22.99</span>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop" alt="Margherita Pizza" className="w-16 h-16 rounded-lg object-cover"/>
          <div className="flex-1">
            <h4 className="font-bold">Margherita Pizza</h4>
            <p className="text-gray-600 text-sm">Classic Italian style</p>
          </div>
          <span className="font-bold text-blue-600">$18.99</span>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <img src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=100&h=100&fit=crop" alt="Chocolate Cake" className="w-16 h-16 rounded-lg object-cover"/>
          <div className="flex-1">
            <h4 className="font-bold">Chocolate Lava Cake</h4>
            <p className="text-gray-600 text-sm">Rich and decadent</p>
          </div>
          <span className="font-bold text-blue-600">$8.99</span>
        </div>
      `,
      regularItems: `
        <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div>
            <h4 className="font-semibold">Caesar Salad</h4>
            <p className="text-gray-600 text-sm">Fresh romaine lettuce</p>
          </div>
          <span className="font-bold">$12.99</span>
        </div>
        <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div>
            <h4 className="font-semibold">Beef Burger</h4>
            <p className="text-gray-600 text-sm">Classic beef patty</p>
          </div>
          <span className="font-bold">$15.99</span>
        </div>
        <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div>
            <h4 className="font-semibold">Fluffy Pancakes</h4>
            <p className="text-gray-600 text-sm">Stack of pancakes</p>
          </div>
          <span className="font-bold">$9.99</span>
        </div>
        <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div>
            <h4 className="font-semibold">Pasta Carbonara</h4>
            <p className="text-gray-600 text-sm">Creamy pasta dish</p>
          </div>
          <span className="font-bold">$16.99</span>
        </div>
      `,
    }
  }
];

export function getBlockType(id: string): BlockType | undefined {
  return BLOCK_TYPES.find(type => type.id === id);
}

export function getVariantById(blockTypeId: string, variantId: string): BlockVariant | undefined {
  const blockType = getBlockType(blockTypeId);
  return blockType?.variants.find(v => v.id === variantId);
}

