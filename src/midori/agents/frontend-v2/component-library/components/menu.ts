/**
 * Menu Components
 * Menu/catalog display components for restaurants, shops, etc.
 */

import type { ComponentDefinition } from '../types';

export const MENU_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'menu',
    name: 'Menu Section',
    description: 'Product/menu catalog display',
    category: 'content',
    tags: ['menu', 'products', 'catalog', 'restaurant', 'ecommerce'],
    propsSchema: {
      title: {
        type: 'string',
        required: true,
        description: 'Menu section title',
        validation: {
          maxLength: 80
        }
      },
      subtitle: {
        type: 'string',
        required: false,
        description: 'Menu section subtitle/description',
        validation: {
          maxLength: 200
        }
      },
      categories: {
        type: 'array',
        required: true,
        description: 'Menu categories with items'
      }
    },
    variants: [
      {
        id: 'grid',
        name: 'Grid Menu',
        description: 'Menu items displayed in a grid layout',
        tags: ['modern', 'grid', 'restaurant', 'ecommerce'],
        template: `export default function Menu(props: any) {
  const { title, subtitle, categories } = props;
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
        {categories?.map((category: any, catIdx: number) => (
          <div key={catIdx} className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-primary-500 pb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items?.map((item: any, itemIdx: number) => (
                <div key={itemIdx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  {item.image && (
                    <img src={item.image} alt={item.imageAlt || item.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                      <span className="text-lg font-bold text-primary-600">฿{item.price.toFixed(2)}</span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}`,
        style: 'modern',
        layout: 'grid',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.9,
          usageCount: 0
        }
      },
      {
        id: 'list',
        name: 'List Menu',
        description: 'Menu items displayed in a list layout',
        tags: ['classic', 'list', 'restaurant'],
        template: `export default function Menu(props: any) {
  const { title, subtitle, categories } = props;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>
        {categories?.map((category: any, catIdx: number) => (
          <div key={catIdx} className="mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {category.name}
            </h3>
            <div className="space-y-4">
              {category.items?.map((item: any, itemIdx: number) => (
                <div key={itemIdx} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h4>
                      {item.description && (
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      )}
                    </div>
                    <span className="text-xl font-bold text-primary-600 ml-4">฿{item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}`,
        style: 'classic',
        layout: 'stacked',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.8,
          usageCount: 0
        }
      },
      {
        id: 'minimal',
        name: 'Minimal Menu',
        description: 'Simple, text-focused menu layout',
        tags: ['minimal', 'simple'],
        template: `export default function Menu(props: any) {
  const { title, subtitle, categories } = props;
  
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{title}</h2>
        {subtitle && <p className="text-gray-600 text-center mb-10">{subtitle}</p>}
        {categories?.map((category: any, catIdx: number) => (
          <div key={catIdx} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
              {category.name}
            </h3>
            <div className="space-y-3">
              {category.items?.map((item: any, itemIdx: number) => (
                <div key={itemIdx} className="flex justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">฿{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}`,
        style: 'minimal',
        layout: 'stacked',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.75,
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
      popularity: 0.85,
      rating: 4.5,
      downloads: 0,
      usageCount: 0
    }
  }
];

