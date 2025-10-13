/**
 * Contact Components
 * Contact information and form section components
 */

import type { ComponentDefinition } from '../types';

export const CONTACT_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'contact',
    name: 'Contact Section',
    description: 'Contact information and/or contact form',
    category: 'content',
    tags: ['contact', 'form', 'information', 'communication'],
    propsSchema: {
      title: {
        type: 'string',
        required: true,
        description: 'Section title',
        validation: {
          maxLength: 80
        }
      },
      subtitle: {
        type: 'string',
        required: false,
        description: 'Section subtitle',
        validation: {
          maxLength: 200
        }
      },
      address: {
        type: 'string',
        required: false,
        description: 'Physical address',
        validation: {
          maxLength: 200
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
      businessHours: {
        type: 'string',
        required: false,
        description: 'Opening hours',
        validation: {
          maxLength: 100
        }
      },
      includeForm: {
        type: 'boolean',
        required: false,
        description: 'Include contact form'
      },
      contactInfoTitle: {
        type: 'string',
        required: false,
        description: 'Contact info section title (e.g., "Contact Information" or "ข้อมูลติดต่อ")',
        validation: {
          maxLength: 50
        }
      },
      addressLabel: {
        type: 'string',
        required: false,
        description: 'Address label (e.g., "Address" or "ที่อยู่")',
        validation: {
          maxLength: 30
        }
      },
      phoneLabel: {
        type: 'string',
        required: false,
        description: 'Phone label (e.g., "Phone" or "โทรศัพท์")',
        validation: {
          maxLength: 30
        }
      },
      emailLabel: {
        type: 'string',
        required: false,
        description: 'Email label (e.g., "Email" or "อีเมล")',
        validation: {
          maxLength: 30
        }
      },
      hoursLabel: {
        type: 'string',
        required: false,
        description: 'Business hours label (e.g., "Business Hours" or "เวลาทำการ")',
        validation: {
          maxLength: 30
        }
      },
      formTitle: {
        type: 'string',
        required: false,
        description: 'Contact form title (e.g., "Send Us a Message" or "ส่งข้อความถึงเรา")',
        validation: {
          maxLength: 50
        }
      }
    },
    variants: [
      {
        id: 'with-form',
        name: 'Contact with Form',
        description: 'Contact section with information and contact form',
        tags: ['modern', 'form', 'interactive'],
        template: `export default function Contact(props: any) {
  const { 
    title, 
    subtitle, 
    address, 
    phone, 
    email, 
    businessHours,
    contactInfoTitle = 'Contact Information',
    addressLabel = 'Address',
    phoneLabel = 'Phone',
    emailLabel = 'Email',
    hoursLabel = 'Business Hours',
    formTitle = 'Send Us a Message'
  } = props;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{contactInfoTitle}</h3>
            <div className="space-y-4">
              {address && (
                <div className="flex items-start">
                  <span className="text-primary-500 mr-3">📍</span>
                  <div>
                    <p className="font-semibold text-gray-900">{addressLabel}</p>
                    <p className="text-gray-700">{address}</p>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-start">
                  <span className="text-primary-500 mr-3">📞</span>
                  <div>
                    <p className="font-semibold text-gray-900">{phoneLabel}</p>
                    <p className="text-gray-700">{phone}</p>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-start">
                  <span className="text-primary-500 mr-3">✉️</span>
                  <div>
                    <p className="font-semibold text-gray-900">{emailLabel}</p>
                    <p className="text-gray-700">{email}</p>
                  </div>
                </div>
              )}
              {businessHours && (
                <div className="flex items-start">
                  <span className="text-primary-500 mr-3">🕐</span>
                  <div>
                    <p className="font-semibold text-gray-900">{hoursLabel}</p>
                    <p className="text-gray-700">{businessHours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{formTitle}</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ชื่อ</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">อีเมล</label>
                <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ข้อความ</label>
                <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg">
                ส่งข้อความ
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}`,
        style: 'modern',
        layout: 'split',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.9,
          usageCount: 0
        }
      },
      {
        id: 'info-only',
        name: 'Contact Info Only',
        description: 'Contact section with information only, no form',
        tags: ['minimal', 'simple'],
        template: `export default function Contact(props: any) {
  const { 
    title, 
    subtitle, 
    address, 
    phone, 
    email, 
    businessHours,
    addressLabel = 'Address',
    phoneLabel = 'Phone',
    emailLabel = 'Email',
    hoursLabel = 'Business Hours'
  } = props;
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {address && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start">
                <span className="text-primary-500 text-2xl mr-4">📍</span>
                <div>
                  <p className="font-bold text-gray-900 mb-2">{addressLabel}</p>
                  <p className="text-gray-700">{address}</p>
                </div>
              </div>
            </div>
          )}
          {phone && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start">
                <span className="text-primary-500 text-2xl mr-4">📞</span>
                <div>
                  <p className="font-bold text-gray-900 mb-2">{phoneLabel}</p>
                  <p className="text-gray-700">{phone}</p>
                </div>
              </div>
            </div>
          )}
          {email && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start">
                <span className="text-primary-500 text-2xl mr-4">✉️</span>
                <div>
                  <p className="font-bold text-gray-900 mb-2">{emailLabel}</p>
                  <p className="text-gray-700">{email}</p>
                </div>
              </div>
            </div>
          )}
          {businessHours && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start">
                <span className="text-primary-500 text-2xl mr-4">🕐</span>
                <div>
                  <p className="font-bold text-gray-900 mb-2">{hoursLabel}</p>
                  <p className="text-gray-700">{businessHours}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}`,
        style: 'minimal',
        layout: 'grid',
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
        name: 'Centered Contact',
        description: 'Centered contact section with clean design',
        tags: ['minimal', 'centered'],
        template: `export default function Contact(props: any) {
  const { 
    title, 
    subtitle, 
    address, 
    phone, 
    email, 
    businessHours,
    addressLabel = 'Address',
    phoneLabel = 'Tel:',
    emailLabel = 'Email:',
    hoursLabel = 'Business Hours'
  } = props;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        {subtitle && <p className="text-lg text-gray-600 mb-12">{subtitle}</p>}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {address && (
            <div>
              <p className="font-bold text-gray-900 mb-2">{addressLabel}</p>
              <p className="text-gray-700">{address}</p>
            </div>
          )}
          <div className="border-t border-gray-200 pt-6">
            {phone && <p className="text-gray-700 mb-2">{phoneLabel} {phone}</p>}
            {email && <p className="text-gray-700">{emailLabel} {email}</p>}
          </div>
          {businessHours && (
            <div className="border-t border-gray-200 pt-6">
              <p className="font-bold text-gray-900 mb-2">{hoursLabel}</p>
              <p className="text-gray-700">{businessHours}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}`,
        style: 'minimal',
        layout: 'centered',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.8,
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
      popularity: 0.92,
      rating: 4.5,
      downloads: 0,
      usageCount: 0
    }
  }
];

