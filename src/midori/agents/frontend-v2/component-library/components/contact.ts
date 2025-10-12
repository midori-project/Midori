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
        maxLength: 80,
        description: 'Section title'
      },
      subtitle: {
        type: 'string',
        required: false,
        maxLength: 200,
        description: 'Section subtitle'
      },
      address: {
        type: 'string',
        required: false,
        maxLength: 200,
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
      hours: {
        type: 'string',
        required: false,
        maxLength: 100,
        description: 'Opening hours'
      },
      includeForm: {
        type: 'boolean',
        required: false,
        description: 'Include contact form'
      }
    },
    template: ``, // Base template
    variants: [
      {
        id: 'with-form',
        name: 'Contact with Form',
        description: 'Contact section with information and contact form',
        tags: ['modern', 'form', 'interactive'],
        template: `
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">ข้อมูลติดต่อ</h3>
                  <div className="space-y-4">
                    {address && (
                      <div className="flex items-start">
                        <span className="text-blue-500 mr-3">📍</span>
                        <div>
                          <p className="font-semibold text-gray-900">ที่อยู่</p>
                          <p className="text-gray-700">{address}</p>
                        </div>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-start">
                        <span className="text-blue-500 mr-3">📞</span>
                        <div>
                          <p className="font-semibold text-gray-900">โทรศัพท์</p>
                          <p className="text-gray-700">{phone}</p>
                        </div>
                      </div>
                    )}
                    {email && (
                      <div className="flex items-start">
                        <span className="text-blue-500 mr-3">✉️</span>
                        <div>
                          <p className="font-semibold text-gray-900">อีเมล</p>
                          <p className="text-gray-700">{email}</p>
                        </div>
                      </div>
                    )}
                    {hours && (
                      <div className="flex items-start">
                        <span className="text-blue-500 mr-3">🕐</span>
                        <div>
                          <p className="font-semibold text-gray-900">เวลาทำการ</p>
                          <p className="text-gray-700">{hours}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">ส่งข้อความถึงเรา</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">ชื่อ</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">อีเมล</label>
                      <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">ข้อความ</label>
                      <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
                      ส่งข้อความ
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        `,
        propsSchema: {
          includeForm: { required: false, defaultValue: true }
        }
      },
      {
        id: 'info-only',
        name: 'Contact Info Only',
        description: 'Contact section with information only, no form',
        tags: ['minimal', 'simple'],
        template: `
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
                      <span className="text-blue-500 text-2xl mr-4">📍</span>
                      <div>
                        <p className="font-bold text-gray-900 mb-2">ที่อยู่</p>
                        <p className="text-gray-700">{address}</p>
                      </div>
                    </div>
                  </div>
                )}
                {phone && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start">
                      <span className="text-blue-500 text-2xl mr-4">📞</span>
                      <div>
                        <p className="font-bold text-gray-900 mb-2">โทรศัพท์</p>
                        <p className="text-gray-700">{phone}</p>
                      </div>
                    </div>
                  </div>
                )}
                {email && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start">
                      <span className="text-blue-500 text-2xl mr-4">✉️</span>
                      <div>
                        <p className="font-bold text-gray-900 mb-2">อีเมล</p>
                        <p className="text-gray-700">{email}</p>
                      </div>
                    </div>
                  </div>
                )}
                {hours && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start">
                      <span className="text-blue-500 text-2xl mr-4">🕐</span>
                      <div>
                        <p className="font-bold text-gray-900 mb-2">เวลาทำการ</p>
                        <p className="text-gray-700">{hours}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        `,
        propsSchema: {
          includeForm: { required: false, defaultValue: false }
        }
      },
      {
        id: 'centered',
        name: 'Centered Contact',
        description: 'Centered contact section with clean design',
        tags: ['minimal', 'centered'],
        template: `
          <section className="py-16 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
              {subtitle && <p className="text-lg text-gray-600 mb-12">{subtitle}</p>}
              <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                {address && (
                  <div>
                    <p className="font-bold text-gray-900 mb-2">ที่อยู่</p>
                    <p className="text-gray-700">{address}</p>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-6">
                  {phone && <p className="text-gray-700 mb-2">โทร: {phone}</p>}
                  {email && <p className="text-gray-700">อีเมล: {email}</p>}
                </div>
                {hours && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="font-bold text-gray-900 mb-2">เวลาทำการ</p>
                    <p className="text-gray-700">{hours}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        `,
        propsSchema: {
          includeForm: { required: false, defaultValue: false }
        }
      }
    ],
    popularityScore: 0.92,
    performanceScore: 0.88,
    accessibilityScore: 0.85
  }
];

