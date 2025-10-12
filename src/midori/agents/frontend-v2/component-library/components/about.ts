/**
 * About Components
 * About/company information section components
 */

import type { ComponentDefinition } from '../types';

export const ABOUT_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'about',
    name: 'About Section',
    description: 'Company/business information section',
    category: 'content',
    tags: ['about', 'company', 'story', 'mission'],
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
      description: {
        type: 'string',
        required: true,
        maxLength: 1000,
        description: 'Main description text'
      },
      image: {
        type: 'string',
        required: false,
        description: 'About image URL'
      },
      imageAlt: {
        type: 'string',
        required: false,
        description: 'Image alt text'
      },
      features: {
        type: 'array',
        required: false,
        description: 'Key features or values'
      }
    },
    template: ``, // Base template
    variants: [
      {
        id: 'side-by-side',
        name: 'Side-by-Side About',
        description: 'About section with image and text side by side',
        tags: ['modern', 'visual'],
        template: `
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {image && (
                  <div className="order-2 lg:order-1">
                    <img src="{image}" alt="{imageAlt}" className="rounded-lg shadow-lg w-full h-auto object-cover" />
                  </div>
                )}
                <div className="order-1 lg:order-2">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                  {subtitle && <p className="text-xl text-gray-600 mb-6">{subtitle}</p>}
                  <p className="text-gray-700 leading-relaxed mb-6">{description}</p>
                  {features && (
                    <div className="grid grid-cols-2 gap-4">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-2">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        `,
        propsSchema: {
          image: { required: true },
          imageAlt: { required: true }
        }
      },
      {
        id: 'centered',
        name: 'Centered About',
        description: 'About section with centered content',
        tags: ['minimal', 'centered'],
        template: `
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                {subtitle && <p className="text-xl text-gray-600 mb-8">{subtitle}</p>}
                {image && (
                  <img src="{image}" alt="{imageAlt}" className="rounded-lg shadow-lg mx-auto mb-8 max-w-2xl w-full" />
                )}
                <p className="text-gray-700 text-lg leading-relaxed mb-8">{description}</p>
                {features && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                        <p className="text-gray-900 font-semibold">{feature}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        `,
        propsSchema: {}
      },
      {
        id: 'story',
        name: 'Story About',
        description: 'About section telling a story',
        tags: ['narrative', 'detailed'],
        template: `
          <section className="py-16 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                {subtitle && <p className="text-xl text-gray-600">{subtitle}</p>}
              </div>
              {image && (
                <div className="mb-12">
                  <img src="{image}" alt="{imageAlt}" className="rounded-lg shadow-xl w-full h-96 object-cover" />
                </div>
              )}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">{description}</p>
              </div>
              {features && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start p-6 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{feature}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        `,
        propsSchema: {}
      }
    ],
    popularityScore: 0.88,
    performanceScore: 0.92,
    accessibilityScore: 0.9
  }
];

