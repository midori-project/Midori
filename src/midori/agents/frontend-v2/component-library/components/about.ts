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
      description: {
        type: 'string',
        required: true,
        description: 'Main description text',
        validation: {
          maxLength: 1000
        }
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
    variants: [
      {
        id: 'side-by-side',
        name: 'Side-by-Side About',
        description: 'About section with image and text side by side',
        tags: ['modern', 'visual'],
        template: `export default function About(props: any) {
  const { title, subtitle, description, image, imageAlt, features } = props;
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {image && (
            <div className="order-2 lg:order-1">
              <img src={image} alt={imageAlt} className="rounded-lg shadow-lg w-full h-auto object-cover" />
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
                    <span className="text-primary-500 mr-2">✓</span>
                    <div>
                      <h4 className="text-gray-900 font-semibold">{feature.title}</h4>
                      <p className="text-gray-700 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        id: 'centered',
        name: 'Centered About',
        description: 'About section with centered content',
        tags: ['minimal', 'centered'],
        template: `export default function About(props: any) {
  const { title, subtitle, description, image, imageAlt, features } = props;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-xl text-gray-600 mb-8">{subtitle}</p>}
          {image && (
            <img src={image} alt={imageAlt} className="rounded-lg shadow-lg mx-auto mb-8 max-w-2xl w-full" />
          )}
          <p className="text-gray-700 text-lg leading-relaxed mb-8">{description}</p>
          {features && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-gray-900 font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
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
          popularity: 0.85,
          usageCount: 0
        }
      },
      {
        id: 'story',
        name: 'Story About',
        description: 'About section telling a story',
        tags: ['narrative', 'detailed'],
        template: `export default function About(props: any) {
  const { title, subtitle, description, image, imageAlt, features } = props;
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-xl text-gray-600">{subtitle}</p>}
        </div>
        {image && (
          <div className="mb-12">
            <img src={image} alt={imageAlt} className="rounded-lg shadow-xl w-full h-96 object-cover" />
          </div>
        )}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed">{description}</p>
        </div>
        {features && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {idx + 1}
                </div>
                <p className="text-gray-700 flex-1">{feature}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}`,
        style: 'modern',
        layout: 'stacked',
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
      popularity: 0.88,
      rating: 4.6,
      downloads: 0,
      usageCount: 0
    }
  }
];

