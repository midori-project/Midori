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
        description: 'Brand/company name',
        validation: {
          maxLength: 50
        }
      },
      description: {
        type: 'string',
        required: false,
        description: 'Company description',
        validation: {
          maxLength: 200
        }
      },
      address: {
        type: 'string',
        required: false,
        description: 'Physical address',
        validation: {
          maxLength: 150
        }
      },
      phone: {
        type: 'string',
        required: false,
        description: 'Contact phone number',
        validation: {
          maxLength: 20
        }
      },
      email: {
        type: 'string',
        required: false,
        description: 'Contact email',
        validation: {
          maxLength: 50
        }
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
        description: 'Copyright text',
        validation: {
          maxLength: 100
        }
      },
      contactTitle: {
        type: 'string',
        required: false,
        description: 'Contact section title (e.g., "Contact Us" or "ติดต่อเรา")',
        validation: {
          maxLength: 50
        }
      },
      phoneLabel: {
        type: 'string',
        required: false,
        description: 'Phone label (e.g., "Tel:" or "โทร:")',
        validation: {
          maxLength: 20
        }
      },
      emailLabel: {
        type: 'string',
        required: false,
        description: 'Email label (e.g., "Email:" or "อีเมล:")',
        validation: {
          maxLength: 20
        }
      }
    },
    variants: [
      {
        id: 'multi-column',
        name: 'Multi-Column Footer',
        description: 'Footer with multiple columns for links and information',
        tags: ['modern', 'detailed'],
        template: `export default function Footer(props: any) {
  const { 
    brandName, 
    description, 
    linkGroups, 
    address, 
    phone, 
    email, 
    copyright, 
    socialLinks,
    contactTitle = 'Contact Us',
    phoneLabel = 'Tel:',
    emailLabel = 'Email:'
  } = props;
  
  return (
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
            <h4 className="text-lg font-semibold mb-4">{contactTitle}</h4>
            {address && <p className="text-gray-400 text-sm mb-2">{address}</p>}
            {phone && <p className="text-gray-400 text-sm mb-2">{phoneLabel} {phone}</p>}
            {email && <p className="text-gray-400 text-sm">{emailLabel} {email}</p>}
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
          <p className="text-gray-400 text-sm">{copyright || \`© \${new Date().getFullYear()} \${brandName}. All rights reserved.\`}</p>
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
  );
}`,
        style: 'modern',
        layout: 'grid',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.85,
          usageCount: 0
        }
      },
      {
        id: 'simple',
        name: 'Simple Footer',
        description: 'Simple footer with basic information',
        tags: ['minimal', 'simple'],
        template: `export default function Footer(props: any) {
  const { 
    brandName, 
    description, 
    phone, 
    email, 
    copyright,
    phoneLabel = 'Tel:',
    emailLabel = 'Email:'
  } = props;
  
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-gray-900">{brandName}</h3>
            {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            {phone && <span className="text-gray-600 text-sm">{phoneLabel} {phone}</span>}
            {email && <span className="text-gray-600 text-sm">{emailLabel} {email}</span>}
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">{copyright || \`© \${new Date().getFullYear()} \${brandName}. All rights reserved.\`}</p>
        </div>
      </div>
    </footer>
  );
}`,
        style: 'minimal',
        layout: 'flex',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.75,
          usageCount: 0
        }
      },
      {
        id: 'centered',
        name: 'Centered Footer',
        description: 'Footer with centered content',
        tags: ['minimal', 'centered'],
        template: `export default function Footer(props: any) {
  const { brandName, description, socialLinks, copyright } = props;
  
  return (
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
          <p className="text-gray-500 text-sm">{copyright || \`© \${new Date().getFullYear()} \${brandName}. All rights reserved.\`}</p>
        </div>
      </div>
    </footer>
  );
}`,
        style: 'minimal',
        layout: 'centered',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.7,
          usageCount: 0
        }
      }
    ],
    dependencies: [],
    metadata: {
      version: '1.0.0',
      author: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      popularity: 0.9,
      rating: 4.7,
      downloads: 0,
      usageCount: 0
    }
  }
];