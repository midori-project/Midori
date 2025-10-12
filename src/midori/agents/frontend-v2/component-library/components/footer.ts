/**
 * Footer Components
 * Footer section components with multiple variants
 */

import type { ComponentDefinition } from '../types';

export const FOOTER_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'footer',
    name: 'Footer Section',
    description: 'Website footer with links and information',
    category: 'layout',
    tags: ['footer', 'navigation', 'contact', 'social'],
    propsSchema: {
      brandName: {
        type: 'string',
        required: true,
        maxLength: 50,
        description: 'Brand/company name'
      },
      description: {
        type: 'string',
        required: false,
        maxLength: 200,
        description: 'Company description'
      },
      address: {
        type: 'string',
        required: false,
        maxLength: 150,
        description: 'Physical address'
      },
      phone: {
        type: 'string',
        required: false,
        maxLength: 20,
        description: 'Contact phone number'
      },
      email: {
        type: 'string',
        required: false,
        maxLength: 50,
        description: 'Contact email'
      },
      socialLinks: {
        type: 'array',
        required: false,
        description: 'Social media links'
      },
      linkGroups: {
        type: 'array',
        required: false,
        description: 'Groups of footer links'
      },
      copyright: {
        type: 'string',
        required: false,
        maxLength: 100,
        description: 'Copyright text'
      }
    },
    template: ``, // Base template
    variants: [
      {
        id: 'multi-column',
        name: 'Multi-Column Footer',
        description: 'Footer with multiple columns for links and information',
        tags: ['modern', 'detailed'],
        template: `
          <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1">
                  <h3 className="text-2xl font-bold mb-4">{brandName}</h3>
                  <p className="text-gray-400 text-sm">{description}</p>
                </div>
                {linkGroups && linkGroups.map((group, idx) => (
                  <div key={idx}>
                    <h4 className="text-lg font-semibold mb-4">{group.title}</h4>
                    <ul className="space-y-2">
                      {group.links.map((link, linkIdx) => (
                        <li key={linkIdx}>
                          <a href={link.url} className="text-gray-400 hover:text-white text-sm">
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
                  {address && <p className="text-gray-400 text-sm mb-2">{address}</p>}
                  {phone && <p className="text-gray-400 text-sm mb-2">โทร: {phone}</p>}
                  {email && <p className="text-gray-400 text-sm">อีเมล: {email}</p>}
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
                <p className="text-gray-400 text-sm">{copyright || \`© 2024 \${brandName}. All rights reserved.\`}</p>
                {socialLinks && (
                  <div className="flex space-x-4">
                    {socialLinks.map((social, idx) => (
                      <a key={idx} href={social.url} className="text-gray-400 hover:text-white">
                        {social.icon || social.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </footer>
        `,
        propsSchema: {}
      },
      {
        id: 'simple',
        name: 'Simple Footer',
        description: 'Simple footer with basic information',
        tags: ['minimal', 'simple'],
        template: `
          <footer className="bg-gray-100 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold text-gray-900">{brandName}</h3>
                  {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
                </div>
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                  {phone && <span className="text-gray-600 text-sm">โทร: {phone}</span>}
                  {email && <span className="text-gray-600 text-sm">อีเมล: {email}</span>}
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">{copyright || \`© 2024 \${brandName}. All rights reserved.\`}</p>
              </div>
            </div>
          </footer>
        `,
        propsSchema: {
          linkGroups: { required: false },
          address: { required: false },
          socialLinks: { required: false }
        }
      },
      {
        id: 'centered',
        name: 'Centered Footer',
        description: 'Footer with centered content',
        tags: ['minimal', 'centered'],
        template: `
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{brandName}</h3>
                {description && <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{description}</p>}
                {socialLinks && (
                  <div className="flex justify-center space-x-6 mb-6">
                    {socialLinks.map((social, idx) => (
                      <a key={idx} href={social.url} className="text-gray-600 hover:text-gray-900">
                        {social.icon || social.name}
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-sm">{copyright || \`© 2024 \${brandName}. All rights reserved.\`}</p>
              </div>
            </div>
          </footer>
        `,
        propsSchema: {
          linkGroups: { required: false },
          address: { required: false },
          phone: { required: false },
          email: { required: false }
        }
      }
    ],
    popularityScore: 0.9,
    performanceScore: 0.95,
    accessibilityScore: 0.9
  }
];

