/**
 * Navbar Components
 * Navigation bar components with multiple variants
 */

import type { ComponentDefinition } from '../types';

export const NAVBAR_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'navbar',
    name: 'Navigation Bar',
    description: 'Main navigation bar for the website',
    category: 'navigation',
    tags: ['navbar', 'navigation', 'menu', 'header'],
    propsSchema: {
      logo: {
        type: 'string',
        required: false,
        description: 'Logo image URL'
      },
      logoAlt: {
        type: 'string',
        required: false,
        description: 'Logo alt text'
      },
      brandName: {
        type: 'string',
        required: true,
        description: 'Brand/company name'
      },
      menuItems: {
        type: 'array',
        required: true,
        description: 'Navigation menu items'
      },
      ctaLabel: {
        type: 'string',
        required: false,
        description: 'Call-to-action button text'
      },
      ctaLink: {
        type: 'string',
        required: false,
        description: 'Call-to-action button URL'
      }
    },
    variants: [
      {
        id: 'horizontal',
        name: 'Horizontal Navbar',
        description: 'Standard horizontal navigation bar with logo and menu items',
        style: 'modern',
        layout: 'flex',
        tags: ['modern', 'horizontal'],
        template: `
          <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  {logo && <img src="{logo}" alt="{logoAlt}" className="h-8 w-auto" />}
                  <span className="ml-2 text-xl font-bold text-gray-800">{brandName}</span>
                </div>
                <div className="hidden md:flex space-x-8">
                  {#each menuItems}
                    <a href="{item.link}" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                      {item.label}
                    </a>
                  {/each}
                </div>
                {#if ctaLabel}
                  <a href="{ctaLink}" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    {ctaLabel}
                  </a>
                {/if}
              </div>
            </div>
          </nav>
        `,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          popularity: 0.8,
          usageCount: 0
        }
      },
      {
        id: 'centered',
        name: 'Centered Navbar',
        description: 'Navigation bar with centered logo and menu items on both sides',
        style: 'modern',
        layout: 'centered',
        tags: ['modern', 'centered'],
        template: `
          <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex space-x-4">
                  {#each menuItems}
                    {#if index < menuItems.length / 2}
                      <a href="{item.link}" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                        {item.label}
                      </a>
                    {/if}
                  {/each}
                </div>
                <div className="flex items-center">
                  {#if logo}
                    <img src="{logo}" alt="{logoAlt}" className="h-10 w-auto" />
                  {/if}
                  <span className="ml-2 text-2xl font-bold text-gray-800">{brandName}</span>
                </div>
                <div className="flex space-x-4">
                  {#each menuItems}
                    {#if index >= menuItems.length / 2}
                      <a href="{item.link}" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                        {item.label}
                      </a>
                    {/if}
                  {/each}
                </div>
              </div>
            </div>
          </nav>
        `,
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
        name: 'Minimal Navbar',
        description: 'Minimalist navigation bar with simple design',
        style: 'minimal',
        layout: 'flex',
        tags: ['minimal', 'clean'],
        template: `
          <nav className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14">
                <span className="text-lg font-semibold text-gray-900">{brandName}</span>
                <div className="flex space-x-6">
                  {#each menuItems}
                    <a href="{item.link}" className="text-gray-600 hover:text-gray-900 text-sm">
                      {item.label}
                    </a>
                  {/each}
                </div>
              </div>
            </div>
          </nav>
        `,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      author: 'system',
      popularity: 0.9,
      rating: 4.5,
      downloads: 0,
      usageCount: 0
    }
  }
];

