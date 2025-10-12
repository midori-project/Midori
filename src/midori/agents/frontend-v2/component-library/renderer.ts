/**
 * Component Renderer
 * Renders components into actual files for the Component-Based System
 */

import { ComponentSelection, ComponentDefinition, ComponentVariant } from './types';

// Define missing types locally
interface ThemePack {
  name: string;
  colorPalette: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    accent: Record<string, string>;
    neutral: Record<string, string>;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
    };
  };
  spacing: Record<string, string>;
}

interface Blueprint {
  id: string;
  name: string;
}

interface LayoutConfig {
  type: string;
  config: any;
}

export interface RenderedFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'layout' | 'config' | 'style';
  language: 'tsx' | 'ts' | 'js' | 'css' | 'json' | 'html';
  dependencies?: string[];
}

export interface RenderedFiles {
  files: RenderedFile[];
  metadata: {
    totalFiles: number;
    totalSize: number;
    componentsUsed: string[];
    variantsUsed: string[];
    themePack: string;
    blueprint: string;
    renderedAt: string;
  };
}

export interface RenderOptions {
  projectType?: string;
  projectName?: string;
  includeDependencies?: boolean;
  minify?: boolean;
  addComments?: boolean;
}

export class ComponentRenderer {
  private static instance: ComponentRenderer;
  private componentRegistry: Map<string, ComponentDefinition> = new Map();

  private constructor() {}

  static getInstance(): ComponentRenderer {
    if (!ComponentRenderer.instance) {
      ComponentRenderer.instance = new ComponentRenderer();
    }
    return ComponentRenderer.instance;
  }

  /**
   * Register components for rendering
   */
  registerComponents(components: ComponentDefinition[]): void {
    components.forEach(component => {
      this.componentRegistry.set(component.id, component);
    });
  }

  /**
   * Register default components if none are registered
   */
  private ensureDefaultComponents(): void {
    if (this.componentRegistry.size === 0) {
      const defaultComponents = this.getDefaultComponents();
      this.registerComponents(defaultComponents);
    }
  }

  /**
   * Get default components for rendering
   */
  private getDefaultComponents(): ComponentDefinition[] {
    return [
      {
        id: 'navbar',
        name: 'Navigation Bar',
        description: 'Main navigation component',
        category: 'navigation',
        tags: ['navigation', 'header', 'responsive'],
        propsSchema: {
          brandName: {
            type: 'string',
            required: true,
            description: 'Brand name to display in navigation',
            placeholder: 'Your Brand'
          },
          menuItems: {
            type: 'array',
            required: true,
            description: 'Array of menu items with label and link',
            examples: [[{ label: 'Home', link: '/' }]]
          }
        },
        metadata: {
          version: '1.0.0',
          popularity: 0.8,
          usageCount: 0,
          author: 'Midori Team',
          rating: 4.5,
          downloads: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variants: [
          {
            id: 'navbar-basic',
            name: 'Basic Navbar',
            description: 'Simple navigation bar with brand and menu items',
            template: `<nav className="bg-orange-600 text-white shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">{brandName}</h1>
      </div>
      <div className="hidden md:block">
        <div className="ml-10 flex items-baseline space-x-4">
          {menuItems?.map((item, index) => (
            <a key={index} href={item.link} className="text-white hover:bg-orange-700 px-3 py-2 rounded-md text-sm font-medium">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  </div>
</nav>`,
            style: 'modern',
            layout: 'flex',
            tags: ['navigation', 'header', 'responsive'],
            metadata: {
              version: '1.0.0',
              popularity: 0.8,
              usageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        ],
        dependencies: []
      },
      {
        id: 'hero',
        name: 'Hero Section',
        description: 'Hero banner component',
        category: 'visual',
        tags: ['hero', 'banner', 'cta'],
        propsSchema: {
          heading: {
            type: 'string',
            required: true,
            description: 'Main heading text',
            placeholder: 'Welcome to Our Restaurant'
          },
          subheading: {
            type: 'string',
            required: true,
            description: 'Subheading text',
            placeholder: 'Delicious food, warm atmosphere'
          },
          ctaLabel: {
            type: 'string',
            required: true,
            description: 'Call-to-action button text',
            placeholder: 'View Menu'
          }
        },
        metadata: {
          version: '1.0.0',
          popularity: 0.9,
          usageCount: 0,
          author: 'Midori Team',
          rating: 4.8,
          downloads: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variants: [
          {
            id: 'hero-basic',
            name: 'Basic Hero',
            description: 'Hero section with heading, subheading and CTA button',
            template: `<section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-5xl font-bold mb-6">{heading}</h1>
    <p className="text-xl mb-8">{subheading}</p>
    <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
      {ctaLabel}
    </button>
  </div>
</section>`,
            style: 'modern',
            layout: 'centered',
            tags: ['hero', 'banner', 'cta'],
            metadata: {
              version: '1.0.0',
              popularity: 0.9,
              usageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        ],
        dependencies: []
      },
      {
        id: 'about',
        name: 'About Section',
        description: 'About us section component',
        category: 'content',
        tags: ['about', 'features', 'content'],
        propsSchema: {
          title: {
            type: 'string',
            required: true,
            description: 'Section title',
            placeholder: 'About Us'
          },
          description: {
            type: 'string',
            required: true,
            description: 'Section description',
            placeholder: 'We serve the finest food with the best ingredients'
          },
          features: {
            type: 'array',
            required: true,
            description: 'Array of feature objects with title and description',
            examples: [[{ title: 'Fresh Ingredients', description: 'We use only the freshest ingredients' }]]
          }
        },
        metadata: {
          version: '1.0.0',
          popularity: 0.7,
          usageCount: 0,
          author: 'Midori Team',
          rating: 4.3,
          downloads: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variants: [
          {
            id: 'about-basic',
            name: 'Basic About',
            description: 'About section with title, description and feature cards',
            template: `<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-lg text-gray-600">{description}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features?.map((feature, index) => (
        <div key={index} className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⭐</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>`,
            style: 'modern',
            layout: 'grid',
            tags: ['about', 'features', 'content'],
            metadata: {
              version: '1.0.0',
              popularity: 0.7,
              usageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        ],
        dependencies: []
      },
      {
        id: 'contact',
        name: 'Contact Section',
        description: 'Contact information component',
        category: 'content',
        tags: ['contact', 'info', 'hours'],
        propsSchema: {
          title: {
            type: 'string',
            required: true,
            description: 'Section title',
            placeholder: 'Contact Us'
          },
          subtitle: {
            type: 'string',
            required: true,
            description: 'Section subtitle',
            placeholder: 'Get in touch with us'
          },
          address: {
            type: 'string',
            required: true,
            description: 'Business address',
            placeholder: '123 Main Street, City, State 12345'
          },
          phone: {
            type: 'string',
            required: true,
            description: 'Phone number',
            placeholder: '(555) 123-4567'
          },
          email: {
            type: 'string',
            required: true,
            description: 'Email address',
            placeholder: 'info@restaurant.com'
          }
        },
        metadata: {
          version: '1.0.0',
          popularity: 0.6,
          usageCount: 0,
          author: 'Midori Team',
          rating: 4.2,
          downloads: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variants: [
          {
            id: 'contact-basic',
            name: 'Basic Contact',
            description: 'Contact section with address, phone, email and hours',
            template: `<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-lg text-gray-600">{subtitle}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-2xl font-semibold mb-4">Visit Us</h3>
        <p className="text-gray-600 mb-4">{address}</p>
        <p className="text-gray-600 mb-4">Phone: {phone}</p>
        <p className="text-gray-600">Email: {email}</p>
      </div>
      <div>
        <h3 className="text-2xl font-semibold mb-4">Hours</h3>
        <p className="text-gray-600 mb-2">Monday - Friday: 11:00 AM - 10:00 PM</p>
        <p className="text-gray-600 mb-2">Saturday: 10:00 AM - 11:00 PM</p>
        <p className="text-gray-600">Sunday: 12:00 PM - 9:00 PM</p>
      </div>
    </div>
  </div>
</section>`,
            style: 'modern',
            layout: 'split',
            tags: ['contact', 'info', 'hours'],
            metadata: {
              version: '1.0.0',
              popularity: 0.6,
              usageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        ],
        dependencies: []
      },
      {
        id: 'footer',
        name: 'Footer Section',
        description: 'Footer component',
        category: 'layout',
        tags: ['footer', 'contact', 'copyright'],
        propsSchema: {
          brandName: {
            type: 'string',
            required: true,
            description: 'Brand name',
            placeholder: 'Restaurant'
          },
          description: {
            type: 'string',
            required: true,
            description: 'Brand description',
            placeholder: 'Delicious food, warm atmosphere'
          },
          address: {
            type: 'string',
            required: true,
            description: 'Business address',
            placeholder: '123 Main Street, City, State 12345'
          },
          phone: {
            type: 'string',
            required: true,
            description: 'Phone number',
            placeholder: '(555) 123-4567'
          },
          copyright: {
            type: 'string',
            required: true,
            description: 'Copyright text',
            placeholder: '© 2024 Restaurant. All rights reserved.'
          }
        },
        metadata: {
          version: '1.0.0',
          popularity: 0.8,
          usageCount: 0,
          author: 'Midori Team',
          rating: 4.4,
          downloads: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variants: [
          {
            id: 'footer-basic',
            name: 'Basic Footer',
            description: 'Footer with brand info, contact details and copyright',
            template: `<footer className="bg-gray-800 text-white py-8">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">{brandName}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
        <p className="text-gray-300">{address}</p>
        <p className="text-gray-300">{phone}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Hours</h3>
        <p className="text-gray-300">Mon-Fri: 11:00 AM - 10:00 PM</p>
        <p className="text-gray-300">Sat: 10:00 AM - 11:00 PM</p>
        <p className="text-gray-300">Sun: 12:00 PM - 9:00 PM</p>
      </div>
    </div>
    <div className="border-t border-gray-700 mt-8 pt-8 text-center">
      <p className="text-gray-300">{copyright}</p>
    </div>
  </div>
</footer>`,
            style: 'modern',
            layout: 'grid',
            tags: ['footer', 'contact', 'copyright'],
            metadata: {
              version: '1.0.0',
              popularity: 0.8,
              usageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        ],
        dependencies: []
      }
    ];
  }

  /**
   * Get default component selection when no components are selected
   */
  private getDefaultComponentSelection(): any[] {
    return [
      {
        componentId: 'navbar',
        variantId: 'navbar-basic',
        props: {
          brandName: 'Restaurant',
          menuItems: [
            { label: 'Home', link: '/' },
            { label: 'Menu', link: '/menu' },
            { label: 'About', link: '/about' },
            { label: 'Contact', link: '/contact' }
          ]
        }
      },
      {
        componentId: 'hero',
        variantId: 'hero-basic',
        props: {
          heading: 'Welcome to Our Restaurant',
          subheading: 'Delicious food, warm atmosphere',
          ctaLabel: 'View Menu'
        }
      },
      {
        componentId: 'about',
        variantId: 'about-basic',
        props: {
          title: 'About Us',
          description: 'We serve the finest food with the best ingredients',
          features: [
            {
              title: 'Fresh Ingredients',
              description: 'We use only the freshest ingredients for our dishes'
            },
            {
              title: 'Expert Chefs',
              description: 'Our experienced chefs create amazing flavors'
            },
            {
              title: 'Quality Service',
              description: 'We provide excellent service to all our customers'
            }
          ]
        }
      },
      {
        componentId: 'contact',
        variantId: 'contact-basic',
        props: {
          title: 'Contact Us',
          subtitle: 'Get in touch with us',
          address: '123 Main Street, City, State 12345',
          phone: '(555) 123-4567',
          email: 'info@restaurant.com'
        }
      },
      {
        componentId: 'footer',
        variantId: 'footer-basic',
        props: {
          brandName: 'Restaurant',
          description: 'Delicious food, warm atmosphere',
          address: '123 Main Street, City, State 12345',
          phone: '(555) 123-4567',
          copyright: '© 2024 Restaurant. All rights reserved.'
        }
      }
    ];
  }

  /**
   * Render components based on selection and theme pack
   */
  renderComponents(
    selection: ComponentSelection,
    themePack: ThemePack,
    blueprint: Blueprint,
    layout: LayoutConfig,
    options: RenderOptions = {},
    aiGeneratedData?: Record<string, any>
  ): RenderedFiles {
    console.log('🎨 Starting component rendering...');
    
    // Ensure default components are registered
    this.ensureDefaultComponents();
    
    const files: RenderedFile[] = [];
    const componentsUsed: string[] = [];
    const variantsUsed: string[] = [];

    // 1. Render main layout structure
    const layoutFiles = this.renderLayout(blueprint, layout, themePack, options);
    files.push(...layoutFiles);

    // 2. Render selected components or default components
    const componentsToRender = selection.selectedComponents.length > 0 
      ? selection.selectedComponents 
      : this.getDefaultComponentSelection();

    for (const selectedComponent of componentsToRender) {
      const component = this.componentRegistry.get(selectedComponent.componentId);
      if (!component) {
        console.warn(`⚠️ Component not found: ${selectedComponent.componentId}`);
        continue;
      }

      const variant = component.variants?.find(v => v.id === selectedComponent.variantId);
      if (!variant) {
        console.warn(`⚠️ Variant not found: ${selectedComponent.variantId} for component ${selectedComponent.componentId}`);
        continue;
      }

      // Render component file
      const componentFile = this.renderComponent(component, variant, selectedComponent, themePack, options, aiGeneratedData);
      files.push(componentFile);
      
      componentsUsed.push(component.id);
      variantsUsed.push(variant.id);

      // Render component dependencies
      if (options.includeDependencies && component.dependencies) {
        const dependencyFiles = this.renderDependencies(component.dependencies, themePack, options);
        files.push(...dependencyFiles);
      }
    }

    // 3. Render theme files
    const themeFiles = this.renderThemeFiles(themePack, options);
    files.push(...themeFiles);

    // 4. Render configuration files
    const configFiles = this.renderConfigFiles(blueprint, themePack, options);
    files.push(...configFiles);

    // 5. Render main App component
    const appFile = this.renderAppComponent(selection, blueprint, layout, options);
    files.push(appFile);

    // 6. Render main.tsx entry point
    const mainFile: RenderedFile = {
      path: 'src/main.tsx',
      content: this.generateMainComponent(),
      type: 'page',
      language: 'tsx',
      dependencies: ['react', 'react-dom', 'react-router-dom']
    };
    files.push(mainFile);

    // 7. Render index.html
    const indexHtmlFile: RenderedFile = {
      path: 'index.html',
      content: this.generateIndexHtml(options),
      type: 'config',
      language: 'html'
    };
    files.push(indexHtmlFile);

    // 8. Render src/index.css
    const indexCssFile: RenderedFile = {
      path: 'src/index.css',
      content: this.generateIndexCss(themePack),
      type: 'style',
      language: 'css'
    };
    files.push(indexCssFile);

    // 9. Render Menu.tsx (fallback component)
    const menuFile: RenderedFile = {
      path: 'src/components/Menu.tsx',
      content: this.generateMenuComponent(),
      type: 'component',
      language: 'tsx',
      dependencies: ['react']
    };
    files.push(menuFile);

    // 10. Render Home.tsx page
    const homeFile: RenderedFile = {
      path: 'src/pages/Home.tsx',
      content: this.generateHomePage(),
      type: 'page',
      language: 'tsx',
      dependencies: ['react']
    };
    files.push(homeFile);

    // Calculate total size for all files (in bytes)
    const toBytes = (s: string) => new TextEncoder().encode(s).length;
    const totalSize = files.reduce((sum, file) => sum + toBytes(file.content), 0);

    const result: RenderedFiles = {
      files,
      metadata: {
        totalFiles: files.length,
        totalSize,
        componentsUsed,
        variantsUsed,
        themePack: themePack.name,
        blueprint: blueprint.id,
        renderedAt: new Date().toISOString()
      }
    };

    console.log('✅ Component rendering completed:', {
      files: result.metadata.totalFiles,
      size: `${Math.round(result.metadata.totalSize / 1024)}KB`,
      components: result.metadata.componentsUsed.length
    });

    return result;
  }

  /**
   * Render main layout structure
   */
  private renderLayout(
    blueprint: Blueprint,
    layout: LayoutConfig,
    themePack: ThemePack,
    options: RenderOptions
  ): RenderedFile[] {
    const files: RenderedFile[] = [];

    // Main layout component
    const layoutContent = this.generateLayoutComponent(blueprint, layout, themePack, options);
    files.push({
      path: 'src/components/Layout.tsx',
      content: layoutContent,
      type: 'layout',
      language: 'tsx',
      dependencies: ['react', 'react-router-dom']
    });

    // Layout styles
    const layoutStyles = this.generateLayoutStyles(themePack, options);
    files.push({
      path: 'src/styles/layout.css',
      content: layoutStyles,
      type: 'style',
      language: 'css'
    });

    return files;
  }

  /**
   * Render individual component
   */
  private renderComponent(
    component: ComponentDefinition,
    variant: ComponentVariant,
    selectedComponent: any,
    themePack: ThemePack,
    options: RenderOptions,
    aiGeneratedData?: Record<string, any>
  ): RenderedFile {
    let content = variant.template;

    // Apply theme pack variables (colors, spacing, typography)
    content = this.applyThemeVariables(content, themePack);

    // ✅ แปลง template syntax ให้เป็น React syntax ก่อน
    content = this.convertTemplateToReact(content);

    // Apply component props and AI-generated data หลังแปลง JSX
    const componentData = {
      ...selectedComponent.props || {},
      ...this.extractComponentData(component.id, aiGeneratedData)
    };
    content = this.applyComponentProps(content, componentData);

    // Map component names to import names for consistency
    const componentNameMap: Record<string, string> = {
      'Navigation Bar': 'Navbar',
      'Visual Hero': 'Hero', 
      'About Section': 'About',
      'Contact Section': 'Contact',
      'Footer Section': 'Footer',
      'Menu Section': 'Menu',
      // Also support componentId format
      'navbar': 'Navbar',
      'hero': 'Hero',
      'herovisual': 'Hero',
      'hero-visual': 'Hero',
      'about': 'About',
      'contact': 'Contact',
      'footer': 'Footer',
      'menu': 'Menu'
    };

    const componentName = componentNameMap[component.name] || 
                         componentNameMap[component.id] || 
                         component.name.replace(/\s+/g, '');

    // ✅ แก้ไขปัญหา component content ไม่สมบูรณ์
    // ✅ ห้ามเพิ่ม comments หรือ TypeScript types ก่อน wrap ด้วย function
    // ✅ Wrap ด้วย function ก่อน แล้วค่อยเพิ่ม comments/types ทีหลัง
    
    // ตรวจสอบว่า content มี export default function หรือไม่
    if (!content.includes('export default function')) {
      // ตรวจสอบว่ามี import React อยู่แล้วหรือไม่ (multiline regex)
      const hasReactImport = /^import\s+React\s+from\s+['"]react['"];?\s*$/m.test(content);
      const hasInterface = /^interface\s+\w+Props\s*\{/m.test(content);
      
      let imports = '';
      if (!hasReactImport) {
        imports = `import React from 'react';\n\n`;
      }
      
      let interfaceDef = '';
      if (!hasInterface) {
        // Generate proper TypeScript interface based on component type
        const propsInterface = this.generatePropsInterface(componentName, component.id);
        interfaceDef = `${propsInterface}

`;
      }
      
      // ถ้าไม่มี export default function ให้สร้างใหม่
      content = `${imports}${interfaceDef}export default function ${componentName}(props: ${componentName}Props) {
  return (
    ${content.trim()}
  );
}`;
    }

    // Minify if requested
    if (options.minify) {
      content = this.minifyContent(content);
    }

    const fileName = componentNameMap[component.name] || component.name.replace(/\s+/g, '');
    
    return {
      path: `src/components/${fileName}.tsx`,
      content,
      type: 'component',
      language: 'tsx',
      dependencies: component.dependencies || []
    };
  }

  /**
   * Render component dependencies
   */
  private renderDependencies(
    dependencies: string[],
    themePack: ThemePack,
    options: RenderOptions
  ): RenderedFile[] {
    const files: RenderedFile[] = [];

    for (const depId of dependencies) {
      const depComponent = this.componentRegistry.get(depId);
      if (depComponent) {
        const depVariant = depComponent.variants?.[0]; // Use first variant
        if (depVariant) {
          const depFile = this.renderComponent(depComponent, depVariant, {}, themePack, options);
          files.push(depFile);
        }
      }
    }

    return files;
  }

  /**
   * Render theme files
   */
  private renderThemeFiles(themePack: ThemePack, options: RenderOptions): RenderedFile[] {
    const files: RenderedFile[] = [];

    // CSS variables
    const cssVars = this.generateCSSVariables(themePack);
    files.push({
      path: 'src/styles/theme.css',
      content: cssVars,
      type: 'style',
      language: 'css'
    });

    // Tailwind config
    const tailwindConfig = this.generateTailwindConfig(themePack);
    files.push({
      path: 'tailwind.config.js',
      content: tailwindConfig,
      type: 'config',
      language: 'js'
    });

    // Theme provider
    const themeProvider = this.generateThemeProvider(themePack);
    files.push({
      path: 'src/contexts/ThemeContext.tsx',
      content: themeProvider,
      type: 'component',
      language: 'tsx',
      dependencies: ['react']
    });

    return files;
  }

  /**
   * Render configuration files
   */
  private renderConfigFiles(
    blueprint: Blueprint,
    themePack: ThemePack,
    options: RenderOptions
  ): RenderedFile[] {
    const files: RenderedFile[] = [];

    // Package.json
    const packageJson = this.generatePackageJson(blueprint, themePack, options);
    files.push({
      path: 'package.json',
      content: packageJson,
      type: 'config',
      language: 'json'
    });

    // Vite config
    const viteConfig = this.generateViteConfig(options);
    files.push({
      path: 'vite.config.ts',
      content: viteConfig,
      type: 'config',
      language: 'ts'
    });

    // PostCSS config
    files.push({
      path: 'postcss.config.cjs',
      content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      type: 'config',
      language: 'js'
    });

    // TypeScript config
    if (options.projectType?.includes('typescript')) {
      const tsConfig = this.generateTSConfig();
      files.push({
        path: 'tsconfig.json',
        content: tsConfig,
        type: 'config',
        language: 'json'
      });

      // TypeScript node config for Vite
      const tsNodeConfig = this.generateTSNodeConfig();
      files.push({
        path: 'tsconfig.node.json',
        content: tsNodeConfig,
        type: 'config',
        language: 'json'
      });
    }

    return files;
  }

  /**
   * Render main App component
   */
  private renderAppComponent(
    selection: ComponentSelection,
    blueprint: Blueprint,
    layout: LayoutConfig,
    options: RenderOptions
  ): RenderedFile {
    const appContent = this.generateAppComponent(selection, blueprint, layout, options);
    
    return {
      path: 'src/App.tsx',
      content: appContent,
      type: 'page',
      language: 'tsx',
      dependencies: ['react', 'react-router-dom']
    };
  }

  // ============================
  // Helper Methods
  // ============================

  private applyThemeVariables(content: string, themePack: ThemePack): string {
    let result = content;

    // Replace color variables
    Object.entries(themePack.colorPalette).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([shade, color]) => {
          result = result.replace(new RegExp(`{${key}\\.${shade}}`, 'g'), color);
        });
      } else {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value);
      }
    });

    // Replace typography variables
    Object.entries(themePack.typography).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          result = result.replace(new RegExp(`{typography\\.${key}\\.${prop}}`, 'g'), val);
        });
      } else {
        result = result.replace(new RegExp(`{typography\\.${key}}`, 'g'), value);
      }
    });

    // Replace spacing variables
    Object.entries(themePack.spacing).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{spacing\\.${key}}`, 'g'), value);
    });

    return result;
  }

  private applyComponentProps(content: string, props: Record<string, any>): string {
    let result = content;

    Object.entries(props).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (result.includes(placeholder)) {
        result = result.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });

    return result;
  }

  private extractComponentData(componentId: string, aiGeneratedData?: Record<string, any>): Record<string, any> {
    if (!aiGeneratedData) return {};

    // Map component IDs to AI data keys
    const componentDataMap: Record<string, string> = {
      'footer': 'footer-basic',
      'navbar': 'navbar-basic', 
      'hero-visual': 'hero-basic',
      'about': 'about-basic',
      'contact': 'contact-basic',
      'menu': 'menu-basic'
    };

    const dataKey = componentDataMap[componentId];
    if (!dataKey || !aiGeneratedData[dataKey]) {
      return {};
    }

    const componentData = aiGeneratedData[dataKey];
    
    // Extract relevant data for the component
    const extractedData: Record<string, any> = {};
    
    if (componentId === 'footer') {
      extractedData.brandName = componentData.companyName || 'Company Name';
      extractedData.description = componentData.description || 'Company description';
      extractedData.address = componentData.address || '';
      extractedData.phone = componentData.phone || '';
      extractedData.email = componentData.email || '';
      extractedData.socialLinks = componentData.socialLinks || [];
      extractedData.quickLinks = componentData.quickLinks || [];
      extractedData.copyright = `© 2024 ${componentData.companyName || 'Company'}. All rights reserved.`;
    } else if (componentId === 'navbar') {
      extractedData.brandName = componentData.brand || 'Brand';
      extractedData.brandFirstChar = componentData.brandFirstChar || componentData.brand?.[0] || 'B';
      extractedData.ctaButton = componentData.ctaButton || 'Contact';
      extractedData.menuItems = componentData.menuItems || [];
    } else if (componentId === 'hero-visual') {
      extractedData.badge = componentData.badge || '';
      extractedData.heading = componentData.heading || 'Welcome';
      extractedData.subheading = componentData.subheading || 'Description';
      extractedData.ctaLabel = componentData.ctaLabel || 'Learn More';
      extractedData.secondaryCta = componentData.secondaryCta || 'Contact';
      extractedData.heroImage = componentData.heroImage || '';
      extractedData.heroImageAlt = componentData.heroImageAlt || 'Hero Image';
    } else if (componentId === 'about') {
      extractedData.title = componentData.title || 'About Us';
      extractedData.description = componentData.description || 'About description';
      extractedData.features = componentData.features || [];
      extractedData.stats = componentData.stats || [];
    } else if (componentId === 'contact') {
      extractedData.title = componentData.title || 'Contact Us';
      extractedData.subtitle = componentData.subtitle || 'Get in touch';
      extractedData.address = componentData.address || '';
      extractedData.phone = componentData.phone || '';
      extractedData.email = componentData.email || '';
      extractedData.businessHours = componentData.businessHours || '';
    } else if (componentId === 'menu') {
      extractedData.title = componentData.title || 'Menu';
      extractedData.menuItems = componentData.menuItems || [];
    }

    return extractedData;
  }



  private minifyContent(content: string): string {
    // Basic minification - remove extra whitespace but preserve JSX structure
    return content
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\{\s+/g, '{')  // Remove spaces after {
      .replace(/\s+\}/g, '}')  // Remove spaces before }
      .replace(/\{\s*"/g, '{"') // Fix {" "} patterns
      .replace(/"\s*\}/g, '"}') // Fix {" "} patterns
      .trim();
  }

  /**
   * Convert template syntax to React syntax
   * Simplified and more reliable approach
   */
  private convertTemplateToReact(content: string): string {
    let result = content;

    // Step 1: Convert template loops {#each} to React .map()
    result = result.replace(/\{#each\s+(\w+)\}/g, '{(props?.$1)?.map((item, index) => (');
    result = result.replace(/\{\/each\}/g, '))}');

    // Step 2: Convert template conditionals {#if} to React ternary
    result = result.replace(/\{#if\s+(\w+)\}/g, '{(props?.$1) ? (');
    result = result.replace(/\{\/if\}/g, ') : null}');

    // Step 3: Fix Tailwind class variables (e.g., bg-{primary}-500 -> bg-orange-500)
    result = result.replace(/bg-\{(\w+)\}-(\d+)/g, 'bg-orange-$2');
    result = result.replace(/text-\{(\w+)\}-(\d+)/g, 'text-orange-$2');
    result = result.replace(/border-\{(\w+)\}-(\d+)/g, 'border-orange-$2');
    result = result.replace(/hover:bg-\{(\w+)\}-(\d+)/g, 'hover:bg-orange-$2');
    result = result.replace(/focus:bg-\{(\w+)\}-(\d+)/g, 'focus:bg-orange-$2');

    // Step 4: Convert simple template variables to JSX expressions
    // Only replace {var} that are not inside strings
    result = result.replace(/\{(\w+)\}/g, (match, varName) => {
      // Skip if it's a number
      if (/^\d+$/.test(varName)) {
        return match;
      }
      
      // Skip common JSX attributes
      const jsxAttrs = ['key', 'ref', 'className', 'id', 'style', 'type', 'name', 'value', 'placeholder'];
      if (jsxAttrs.includes(varName)) {
        return match;
      }
      
      // Convert to JSX expression with fallback
      return `{(props?.${varName}) ?? ""}`;
    });

    // Step 5: Convert object property access (e.g., {item.name} -> {item?.name})
    result = result.replace(/\{(\w+)\.(\w+)\}/g, '{$1?.$2}');

    // Step 6: Convert attribute values with template variables
    result = result.replace(/="\{(\w+)\}"/g, '={(props?.$1) ?? ""}');
    result = result.replace(/=\{(\w+)\}/g, '={(props?.$1) ?? ""}');

    // Step 7: Fix common patterns
    result = result.replace(/href="\{(\w+)\.(\w+)\}"/g, 'href={$1?.$2 || ""}');
    result = result.replace(/src="\{(\w+)\.(\w+)\}"/g, 'src={$1?.$2 || ""}');
    result = result.replace(/alt="\{(\w+)\.(\w+)\}"/g, 'alt={$1?.$2 || ""}');

    // Step 8: Clean up any remaining template syntax
    result = result.replace(/\{\{(\w+)\}\}/g, '{$1}');

    return result;
  }

  // ============================
  // Generator Methods
  // ============================

  private generateLayoutComponent(blueprint: Blueprint, layout: LayoutConfig, themePack: ThemePack, options: RenderOptions): string {
    return `import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Restaurant</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-white hover:bg-orange-700 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="/menu" className="text-white hover:bg-orange-700 px-3 py-2 rounded-md text-sm font-medium">Menu</a>
                <a href="/about" className="text-white hover:bg-orange-700 px-3 py-2 rounded-md text-sm font-medium">About</a>
                <a href="/contact" className="text-white hover:bg-orange-700 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
              </div>
            </div>
            <div className="md:hidden">
              <button className="text-white hover:bg-orange-700 px-3 py-2 rounded-md text-sm font-medium">
                Menu
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Restaurant</h3>
              <p className="text-gray-300">Delicious food, warm atmosphere</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <p className="text-gray-300">123 Main Street</p>
              <p className="text-gray-300">City, State 12345</p>
              <p className="text-gray-300">(555) 123-4567</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hours</h3>
              <p className="text-gray-300">Mon-Fri: 11:00 AM - 10:00 PM</p>
              <p className="text-gray-300">Sat: 10:00 AM - 11:00 PM</p>
              <p className="text-gray-300">Sun: 12:00 PM - 9:00 PM</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2024 Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;`;
  }

  private generateLayoutStyles(themePack: ThemePack, options: RenderOptions): string {
    return `/* Layout Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Theme Variables */
:root {
  --primary: ${themePack.colorPalette.primary[500]};
  --secondary: ${themePack.colorPalette.secondary[500]};
  --accent: ${themePack.colorPalette.accent[500]};
  --neutral: ${themePack.colorPalette.neutral[500]};
}`;
  }

  private generateCSSVariables(themePack: ThemePack): string {
    let css = `/* Theme Variables */\n:root {\n`;
    
    Object.entries(themePack.colorPalette).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([shade, color]) => {
          css += `  --${key}-${shade}: ${color};\n`;
        });
      } else {
        css += `  --${key}: ${value};\n`;
      }
    });
    
    css += `}\n`;
    return css;
  }

  private generateTailwindConfig(themePack: ThemePack): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '${themePack.colorPalette.primary[50]}',
          100: '${themePack.colorPalette.primary[100]}',
          200: '${themePack.colorPalette.primary[200]}',
          300: '${themePack.colorPalette.primary[300]}',
          400: '${themePack.colorPalette.primary[400]}',
          500: '${themePack.colorPalette.primary[500]}',
          600: '${themePack.colorPalette.primary[600]}',
          700: '${themePack.colorPalette.primary[700]}',
          800: '${themePack.colorPalette.primary[800]}',
          900: '${themePack.colorPalette.primary[900]}',
        },
        secondary: {
          50: '${themePack.colorPalette.secondary[50]}',
          100: '${themePack.colorPalette.secondary[100]}',
          200: '${themePack.colorPalette.secondary[200]}',
          300: '${themePack.colorPalette.secondary[300]}',
          400: '${themePack.colorPalette.secondary[400]}',
          500: '${themePack.colorPalette.secondary[500]}',
          600: '${themePack.colorPalette.secondary[600]}',
          700: '${themePack.colorPalette.secondary[700]}',
          800: '${themePack.colorPalette.secondary[800]}',
          900: '${themePack.colorPalette.secondary[900]}',
        },
        accent: {
          50: '${themePack.colorPalette.accent[50]}',
          100: '${themePack.colorPalette.accent[100]}',
          200: '${themePack.colorPalette.accent[200]}',
          300: '${themePack.colorPalette.accent[300]}',
          400: '${themePack.colorPalette.accent[400]}',
          500: '${themePack.colorPalette.accent[500]}',
          600: '${themePack.colorPalette.accent[600]}',
          700: '${themePack.colorPalette.accent[700]}',
          800: '${themePack.colorPalette.accent[800]}',
          900: '${themePack.colorPalette.accent[900]}',
        }
      }
    },
  },
  plugins: [],
}`;
  }

  private generateThemeProvider(themePack: ThemePack): string {
    return `import React, { createContext, useContext, ReactNode } from 'react';

interface Theme {
  colorPalette: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    accent: Record<string, string>;
    neutral: Record<string, string>;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
    };
  };
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme: Theme = {
    colorPalette: {
      primary: {
        50: '${themePack.colorPalette.primary[50]}',
        100: '${themePack.colorPalette.primary[100]}',
        200: '${themePack.colorPalette.primary[200]}',
        300: '${themePack.colorPalette.primary[300]}',
        400: '${themePack.colorPalette.primary[400]}',
        500: '${themePack.colorPalette.primary[500]}',
        600: '${themePack.colorPalette.primary[600]}',
        700: '${themePack.colorPalette.primary[700]}',
        800: '${themePack.colorPalette.primary[800]}',
        900: '${themePack.colorPalette.primary[900]}',
      },
      secondary: {
        50: '${themePack.colorPalette.secondary[50]}',
        100: '${themePack.colorPalette.secondary[100]}',
        200: '${themePack.colorPalette.secondary[200]}',
        300: '${themePack.colorPalette.secondary[300]}',
        400: '${themePack.colorPalette.secondary[400]}',
        500: '${themePack.colorPalette.secondary[500]}',
        600: '${themePack.colorPalette.secondary[600]}',
        700: '${themePack.colorPalette.secondary[700]}',
        800: '${themePack.colorPalette.secondary[800]}',
        900: '${themePack.colorPalette.secondary[900]}',
      },
      accent: {
        50: '${themePack.colorPalette.accent[50]}',
        100: '${themePack.colorPalette.accent[100]}',
        200: '${themePack.colorPalette.accent[200]}',
        300: '${themePack.colorPalette.accent[300]}',
        400: '${themePack.colorPalette.accent[400]}',
        500: '${themePack.colorPalette.accent[500]}',
        600: '${themePack.colorPalette.accent[600]}',
        700: '${themePack.colorPalette.accent[700]}',
        800: '${themePack.colorPalette.accent[800]}',
        900: '${themePack.colorPalette.accent[900]}',
      },
      neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      }
    },
    typography: {
      fontFamily: {
        primary: 'Inter',
        secondary: 'Inter',
      }
    }
  };

  const toggleTheme = () => {
    // Implement theme toggle logic
    console.log('Theme toggle not implemented yet');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};`;
  }

  private generatePackageJson(blueprint: Blueprint, themePack: ThemePack, options: RenderOptions): string {
    const packageJson = {
      name: options.projectName?.toLowerCase().replace(/\s+/g, '-') || 'midori-app',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.8.1'
      },
      devDependencies: {
        '@types/react': '^18.2.15',
        '@types/react-dom': '^18.2.7',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        '@vitejs/plugin-react': '^4.0.3',
        'autoprefixer': '^10.4.14',
        'eslint': '^8.45.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        'eslint-plugin-react-refresh': '^0.4.3',
        'postcss': '^8.4.27',
        'tailwindcss': '^3.3.3',
        'typescript': '^5.0.2',
        'vite': '^4.4.5'
      }
    };

    return JSON.stringify(packageJson, null, 2);
  }

  private generateViteConfig(options: RenderOptions): string {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@/contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})`;
  }

  private generateTSConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/contexts/*": ["./src/contexts/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
  }

  private generateMainComponent(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`;
  }

  private generateAppComponent(
    selection: ComponentSelection,
    blueprint: Blueprint,
    layout: LayoutConfig,
    options: RenderOptions
  ): string {
    return `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './components/Menu';

function App() {
  return (
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
              <p className="text-lg text-gray-600">We are passionate about serving delicious food with the finest ingredients.</p>
            </div>
          </div>
        } />
        <Route path="/contact" element={
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
              <p className="text-lg text-gray-600">Get in touch with us for reservations or inquiries.</p>
            </div>
          </div>
        } />
        </Routes>
      </Layout>
  );
}

export default App;`;
  }

  private generateIndexHtml(options: RenderOptions): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${options.projectName || 'Midori App'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }

  private generateIndexCss(themePack: ThemePack): string {
    return `@import './styles/theme.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}`;
  }

  private generateTSNodeConfig(): string {
    return `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}`;
  }

  private generateMenuComponent(): string {
    return `import React from 'react';

export default function Menu() {
  const menuItems = [
    {
      id: 1,
      name: 'Grilled Salmon',
      description: 'Fresh salmon fillet grilled to perfection with herbs',
      price: '$18.99',
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'
    },
    {
      id: 2,
      name: 'Pasta Carbonara',
      description: 'Classic Italian pasta with creamy sauce and pancetta',
      price: '$16.99',
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400'
    },
    {
      id: 3,
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan and croutons',
      price: '$12.99',
      category: 'Appetizer',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'
    },
    {
      id: 4,
      name: 'Chocolate Lava Cake',
      description: 'Rich chocolate cake with molten center',
      price: '$8.99',
      category: 'Dessert',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'
    },
    {
      id: 5,
      name: 'Mojito',
      description: 'Refreshing cocktail with mint and lime',
      price: '$10.99',
      category: 'Beverage',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'
    },
    {
      id: 6,
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: '$9.99',
      category: 'Dessert',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <p className="text-lg text-gray-600">Discover our delicious dishes made with fresh ingredients</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gray-200">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <span className="text-orange-600 font-semibold">{item.price}</span>
                </div>
                <p className="text-gray-600 mb-3">{item.description}</p>
                <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
  }


  private generateHomePage(): string {
    return `import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Our Restaurant</h1>
          <p className="text-xl mb-8">Delicious food, warm atmosphere</p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
            View Menu
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Us</h2>
            <p className="text-lg text-gray-600">We serve the finest food with the best ingredients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600">We use only the freshest ingredients for our dishes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Chefs</h3>
              <p className="text-gray-600">Our experienced chefs create amazing flavors</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Service</h3>
              <p className="text-gray-600">We provide excellent service to all our customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h2>
            <p className="text-lg text-gray-600">Discover our delicious dishes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Main Course</h3>
                <p className="text-gray-600">Delicious main dishes</p>
                <p className="text-orange-600 font-semibold mt-2">$15.99</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Beverages</h3>
                <p className="text-gray-600">Refreshing drinks</p>
                <p className="text-orange-600 font-semibold mt-2">$5.99</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Desserts</h3>
                <p className="text-gray-600">Sweet treats</p>
                <p className="text-orange-600 font-semibold mt-2">$8.99</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600">Get in touch with us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Visit Us</h3>
              <p className="text-gray-600 mb-4">123 Main Street, City, State 12345</p>
              <p className="text-gray-600 mb-4">Phone: (555) 123-4567</p>
              <p className="text-gray-600">Email: info@restaurant.com</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Hours</h3>
              <p className="text-gray-600 mb-2">Monday - Friday: 11:00 AM - 10:00 PM</p>
              <p className="text-gray-600 mb-2">Saturday: 10:00 AM - 11:00 PM</p>
              <p className="text-gray-600">Sunday: 12:00 PM - 9:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;
  }

  private generatePropsInterface(componentName: string, componentId: string): string {
    const componentPropsMap: Record<string, string> = {
      'navbar': `interface ${componentName}Props {
  logo?: string;
  logoAlt?: string;
  brandName?: string;
  menuItems?: Array<{
    label: string;
    link: string;
  }>;
  ctaLabel?: string;
  ctaLink?: string;
}`,
      'hero': `interface ${componentName}Props {
  badge?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  secondaryCta?: string;
  heroImage?: string;
  heroImageAlt?: string;
}`,
      'about': `interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  features?: Array<{
    title: string;
    description: string;
  }>;
}`,
      'contact': `interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
}`,
      'footer': `interface ${componentName}Props {
  brandName?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  linkGroups?: Array<{
    title: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  }>;
  socialLinks?: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
  copyright?: string;
}`,
      'menu': `interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  menuItems?: Array<{
    name: string;
    description: string;
    price: number;
    image?: string;
    imageAlt?: string;
    category?: string;
  }>;
}`
    };

    return componentPropsMap[componentId] || `interface ${componentName}Props {
  // Add props here
}`;
  }

}

