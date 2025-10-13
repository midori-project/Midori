/**
 * Component Renderer
 * Renders components into actual files for the Component-Based System
 */

import {
  ComponentSelection,
  ComponentDefinition,
  ComponentVariant,
} from "./types";

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
  type: "component" | "page" | "layout" | "config" | "style";
  language: "tsx" | "ts" | "js" | "css" | "json" | "html";
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
    components.forEach((component) => {
      this.componentRegistry.set(component.id, component);
    });
  }

  /**
   * Ensure components are registered (should be done by ComponentAdapter)
   */
  private ensureDefaultComponents(): void {
    if (this.componentRegistry.size === 0) {
      console.warn(
        "⚠️ No components registered in registry. Components should be registered by ComponentAdapter."
      );
    }
  }

  /**
   * Get default component selection when no components are selected
   * Uses components from registry instead of hardcoded values
   */
  private getDefaultComponentSelection(
    aiGeneratedData?: Record<string, any>
  ): any[] {
    // Debug: Log AI data structure
    console.log("🔍 getDefaultComponentSelection - AI Data:", {
      hasAiData: !!aiGeneratedData,
      aiDataKeys: aiGeneratedData ? Object.keys(aiGeneratedData) : [],
      navbarBasic: aiGeneratedData?.["navbar-basic"],
      heroBasic: aiGeneratedData?.["hero-basic"],
      aboutBasic: aiGeneratedData?.["about-basic"],
    });

    // Get available components from registry
    const availableComponents = Array.from(this.componentRegistry.values());
    console.log(
      "🔍 Available components from registry:",
      availableComponents.map((c) => c.id)
    );

    // Default component selection based on available components
    const defaultSelection: any[] = [];

    // Try to find components by ID
    const componentIds = ["navbar", "hero", "about", "contact", "footer"];

    for (const componentId of componentIds) {
      const component = this.componentRegistry.get(componentId);
      if (component && component.variants && component.variants.length > 0) {
        // Use the first variant as default
        const defaultVariant = component.variants[0];
        if (defaultVariant) {
          // Extract AI data for this component
          const aiData = this.extractComponentData(
            componentId,
            aiGeneratedData
          );

          defaultSelection.push({
            componentId: component.id,
            variantId: defaultVariant.id,
            props: {
              ...aiData,
              // Add fallback props if AI data is not available
              ...this.getFallbackProps(componentId, component),
            },
          });
        }
      }
    }

    console.log("🔍 Default component selection:", defaultSelection);
    return defaultSelection;
  }

  /**
   * Get fallback props for a component when AI data is not available
   */
  private getFallbackProps(
    componentId: string,
    component: ComponentDefinition
  ): Record<string, any> {
    const fallbackProps: Record<string, any> = {};

    // Set fallback values based on component type
    switch (componentId) {
      case "navbar":
        fallbackProps.brandName = "Your Business";
        fallbackProps.menuItems = [
          { label: "Home", link: "/" },
          { label: "About", link: "/about" },
          { label: "Contact", link: "/contact" },
        ];
        break;
      case "hero":
        fallbackProps.heading = "Welcome to Our Business";
        fallbackProps.subheading = "We provide excellent services";
        fallbackProps.ctaLabel = "Learn More";
        break;
      case "about":
        fallbackProps.title = "About Us";
        fallbackProps.description =
          "We are committed to providing quality services";
        fallbackProps.features = [
          {
            title: "Quality Service",
            description: "We provide excellent service to all our customers",
          },
        ];
        break;
      case "contact":
        fallbackProps.title = "Contact Us";
        fallbackProps.subtitle = "Get in touch with us";
        fallbackProps.address = "Your Address";
        fallbackProps.phone = "Your Phone";
        fallbackProps.email = "your@email.com";
        break;
      case "footer":
        fallbackProps.brandName = "Your Business";
        fallbackProps.description = "We provide excellent services";
        fallbackProps.address = "Your Address";
        fallbackProps.phone = "Your Phone";
        fallbackProps.copyright = "© 2024 Your Business. All rights reserved.";
        break;
    }

    return fallbackProps;
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
    console.log("🎨 Starting component rendering...");

    // Ensure default components are registered
    this.ensureDefaultComponents();
    
    const files: RenderedFile[] = [];
    const componentsUsed: string[] = [];
    const variantsUsed: string[] = [];

    // 1. Render main layout structure
    const layoutFiles = this.renderLayout(
      blueprint,
      layout,
      themePack,
      options,
      aiGeneratedData
    );
    files.push(...layoutFiles);

    // 2. Render selected components or default components
    const componentsToRender =
      selection.selectedComponents.length > 0
        ? selection.selectedComponents
        : this.getDefaultComponentSelection(aiGeneratedData);

    for (const selectedComponent of componentsToRender) {
      const component = this.componentRegistry.get(
        selectedComponent.componentId
      );
      if (!component) {
        console.warn(
          `⚠️ Component not found: ${selectedComponent.componentId}`
        );
        continue;
      }

      const variant = component.variants?.find(
        (v) => v.id === selectedComponent.variantId
      );
      if (!variant) {
        console.warn(
          `⚠️ Variant not found: ${selectedComponent.variantId} for component ${selectedComponent.componentId}`
        );
        continue;
      }

      // Render component file
      const componentFile = this.renderComponent(
        component,
        variant,
        selectedComponent,
        themePack,
        options,
        aiGeneratedData
      );
      files.push(componentFile);
      
      componentsUsed.push(component.id);
      variantsUsed.push(variant.id);

      // Render component dependencies
      if (options.includeDependencies && component.dependencies) {
        const dependencyFiles = this.renderDependencies(
          component.dependencies,
          themePack,
          options
        );
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
    const appFile = this.renderAppComponent(
      selection,
      blueprint,
      layout,
      options
    );
    files.push(appFile);

    // 6. Render main.tsx entry point
    const mainFile: RenderedFile = {
      path: "src/main.tsx",
      content: this.generateMainComponent(options),
      type: "page",
      language: "tsx",
      dependencies: ["react", "react-dom", "react-router-dom"],
    };
    files.push(mainFile);

    // 7. Render index.html
    const indexHtmlFile: RenderedFile = {
      path: "index.html",
      content: this.generateIndexHtml(options),
      type: "config",
      language: "html",
    };
    files.push(indexHtmlFile);

    // 8. Render src/index.css
    const indexCssFile: RenderedFile = {
      path: "src/index.css",
      content: this.generateIndexCss(themePack),
      type: "style",
      language: "css",
    };
    files.push(indexCssFile);

    // 9. Render Menu.tsx (fallback component)
    const menuFile: RenderedFile = {
      path: "src/components/Menu.tsx",
      content: this.generateMenuComponent(aiGeneratedData),
      type: "component",
      language: "tsx",
      dependencies: ["react"],
    };
    files.push(menuFile);

    // 10. Render About.tsx component (using existing component definition)
    const aboutFile = this.renderComponentFromDefinition(
      "about",
      aiGeneratedData
    );
    if (aboutFile) files.push(aboutFile);

    // 11. Render Contact.tsx component (using existing component definition)
    const contactFile = this.renderComponentFromDefinition(
      "contact",
      aiGeneratedData
    );
    if (contactFile) files.push(contactFile);

    // 12. Render Home.tsx page
    const homeFile: RenderedFile = {
      path: "src/pages/Home.tsx",
      content: this.generateHomePage(aiGeneratedData),
      type: "page",
      language: "tsx",
      dependencies: ["react"],
    };
    files.push(homeFile);

    // Calculate total size for all files (in bytes)
    const toBytes = (s: string) => new TextEncoder().encode(s).length;
    const totalSize = files.reduce(
      (sum, file) => sum + toBytes(file.content),
      0
    );

    const result: RenderedFiles = {
      files,
      metadata: {
        totalFiles: files.length,
        totalSize,
        componentsUsed,
        variantsUsed,
        themePack: themePack.name,
        blueprint: blueprint.id,
        renderedAt: new Date().toISOString(),
      },
    };

    console.log("✅ Component rendering completed:", {
      files: result.metadata.totalFiles,
      size: `${Math.round(result.metadata.totalSize / 1024)}KB`,
      components: result.metadata.componentsUsed.length,
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
    options: RenderOptions,
    aiGeneratedData?: Record<string, any>
  ): RenderedFile[] {
    const files: RenderedFile[] = [];

    // Main layout component
    const layoutContent = this.generateLayoutComponent(
      blueprint,
      layout,
      themePack,
      options,
      aiGeneratedData
    );
    files.push({
      path: "src/components/Layout.tsx",
      content: layoutContent,
      type: "layout",
      language: "tsx",
      dependencies: ["react", "react-router-dom"],
    });

    // Layout styles removed - not used anywhere, theme.css already has CSS variables

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

    // Templates now use direct React syntax - no conversion needed

    // Map component names to import names for consistency
    const componentNameMap: Record<string, string> = {
      "Navigation Bar": "Navbar",
      "Visual Hero": "Hero",
      "About Section": "About",
      "Contact Section": "Contact",
      "Footer Section": "Footer",
      "Menu Section": "Menu",
      // Also support componentId format
      navbar: "Navbar",
      hero: "Hero",
      about: "About",
      contact: "Contact",
      footer: "Footer",
      menu: "Menu",
    };

    const componentName =
      componentNameMap[component.name] ||
                         componentNameMap[component.id] || 
      component.name.replace(/\s+/g, "");

    // ✅ แก้ไขปัญหา component content ไม่สมบูรณ์
    // ✅ ห้ามเพิ่ม comments หรือ TypeScript types ก่อน wrap ด้วย function
    // ✅ Wrap ด้วย function ก่อน แล้วค่อยเพิ่ม comments/types ทีหลัง
    
    // ตรวจสอบว่า content มี export default อยู่แล้วหรือไม่ (ครอบคลุมทุกรูปแบบ)
    const hasDefaultExport =
      /export\s+default\s+(function|class)\s+\w+/.test(content) ||
      /export\s+default\s+const\s+\w+\s*=/.test(content) ||
      /export\s+default\s*\(.*=>/.test(content);
    
    if (!hasDefaultExport) {
      // ตรวจสอบว่ามี import React อยู่แล้วหรือไม่ (ครอบคลุมทุกรูปแบบ)
      const hasReactImport = /from\s+['"]react['"]/.test(content);
      const hasInterface = /^interface\s+\w+Props\s*\{/m.test(content);
      
      let imports = "";
      // React 17+ ไม่จำเป็นต้อง import React สำหรับ JSX
      // แต่ยังคงใส่เพื่อความชัดเจน
      if (!hasReactImport) {
        imports = `import React from 'react';\n\n`;
      }
      
      let interfaceDef = "";
      if (!hasInterface) {
        // Generate proper TypeScript interface based on component type
        const propsInterface = this.generatePropsInterface(
          componentName,
          component.id
        );
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

    const fileName =
      componentNameMap[component.name] || component.name.replace(/\s+/g, "");
    
    return {
      path: `src/components/${fileName}.tsx`,
      content,
      type: "component",
      language: "tsx",
      dependencies: component.dependencies || [],
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
          const depFile = this.renderComponent(
            depComponent,
            depVariant,
            {},
            themePack,
            options
          );
          files.push(depFile);
        }
      }
    }

    return files;
  }

  /**
   * Render theme files
   */
  private renderThemeFiles(
    themePack: ThemePack,
    options: RenderOptions
  ): RenderedFile[] {
    const files: RenderedFile[] = [];

    // CSS variables
    const cssVars = this.generateCSSVariables(themePack);
    files.push({
      path: "src/styles/theme.css",
      content: cssVars,
      type: "style",
      language: "css",
    });

    // Tailwind config
    const tailwindConfig = this.generateTailwindConfig(themePack);
    files.push({
      path: "tailwind.config.js",
      content: tailwindConfig,
      type: "config",
      language: "js",
    });

    // Theme provider
    const themeProvider = this.generateThemeProvider(themePack);
    files.push({
      path: "src/contexts/ThemeContext.tsx",
      content: themeProvider,
      type: "component",
      language: "tsx",
      dependencies: ["react"],
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
      path: "package.json",
      content: packageJson,
      type: "config",
      language: "json",
    });

    // Vite config
    const viteConfig = this.generateViteConfig(options);
    files.push({
      path: "vite.config.ts",
      content: viteConfig,
      type: "config",
      language: "ts",
    });

    // PostCSS config (ESM only)
    files.push({
      path: "postcss.config.js",
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
      type: "config",
      language: "js",
    });

    // TypeScript config
    if (options.projectType?.includes("typescript")) {
      const tsConfig = this.generateTSConfig();
      files.push({
        path: "tsconfig.json",
        content: tsConfig,
        type: "config",
        language: "json",
      });

      // TypeScript node config for Vite
      const tsNodeConfig = this.generateTSNodeConfig();
      files.push({
        path: "tsconfig.node.json",
        content: tsNodeConfig,
        type: "config",
        language: "json",
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
    const appContent = this.generateAppComponent(
      selection,
      blueprint,
      layout,
      options
    );
    
    return {
      path: "src/App.tsx",
      content: appContent,
      type: "page",
      language: "tsx",
      dependencies: ["react", "react-router-dom"],
    };
  }

  // ============================
  // Helper Methods
  // ============================



  private extractComponentData(
    componentId: string,
    aiGeneratedData?: Record<string, any>
  ): Record<string, any> {
    if (!aiGeneratedData) return {};

    // Check if it's component-based response format
    if (aiGeneratedData.components && aiGeneratedData.components[componentId]) {
      console.log(
        `✅ Using component-based data for ${componentId}:`,
        aiGeneratedData.components[componentId]
      );
      return aiGeneratedData.components[componentId].props || {};
    }

    // Fallback to legacy template-based format
    const componentDataMap: Record<string, string> = {
      footer: "footer-basic",
      navbar: "navbar-basic",
      hero: "hero-basic",
      about: "about-basic",
      contact: "contact-basic",
      menu: "menu-basic",
    };

    const dataKey = componentDataMap[componentId];
    if (!dataKey || !aiGeneratedData[dataKey]) {
      console.log(`⚠️ No AI data found for component ${componentId}`);
      return {};
    }

    const componentData = aiGeneratedData[dataKey];
    
    // Extract relevant data for the component
    const extractedData: Record<string, any> = {};
    
    if (componentId === "footer") {
      extractedData.brandName = componentData.companyName || "Company Name";
      extractedData.description =
        componentData.description || "Company description";
      extractedData.address = componentData.address || "";
      extractedData.phone = componentData.phone || "";
      extractedData.email = componentData.email || "";
      extractedData.socialLinks = componentData.socialLinks || [];
      extractedData.quickLinks = componentData.quickLinks || [];
      extractedData.copyright = `© 2024 ${
        componentData.companyName || "Company"
      }. All rights reserved.`;
    } else if (componentId === "navbar") {
      extractedData.brandName = componentData.brand || "Brand";
      extractedData.brandFirstChar =
        componentData.brandFirstChar || componentData.brand?.[0] || "B";
      extractedData.ctaButton = componentData.ctaButton || "Contact";
      extractedData.menuItems = componentData.menuItems || [];
    } else if (componentId === "hero") {
      extractedData.badge = componentData.badge || "";
      extractedData.heading = componentData.heading || "Welcome";
      extractedData.subheading = componentData.subheading || "Description";
      extractedData.ctaLabel = componentData.ctaLabel || "Learn More";
      extractedData.secondaryCta = componentData.secondaryCta || "Contact";
      extractedData.heroImage = componentData.heroImage || "";
      extractedData.heroImageAlt = componentData.heroImageAlt || "Hero Image";
    } else if (componentId === "about") {
      extractedData.title = componentData.title || "About Us";
      extractedData.description =
        componentData.description || "About description";
      extractedData.features = componentData.features || [];
      extractedData.stats = componentData.stats || [];
    } else if (componentId === "contact") {
      extractedData.title = componentData.title || "Contact Us";
      extractedData.subtitle = componentData.subtitle || "Get in touch";
      extractedData.address = componentData.address || "";
      extractedData.phone = componentData.phone || "";
      extractedData.email = componentData.email || "";
      extractedData.businessHours = componentData.businessHours || "";
    } else if (componentId === "menu") {
      extractedData.title = componentData.title || "Menu";
      extractedData.menuItems = componentData.menuItems || [];
    }

    return extractedData;
  }

  private minifyContent(content: string): string {
    // Disabled minification to prevent JSX corruption
    // Use Prettier/TS compiler for proper formatting instead
    return content;
  }


  // ============================
  // Helper Methods
  // ============================

  /**
   * Fill missing color shades with fallbacks
   */
  private fillColorScale(scale?: Record<string, string>, fallback = '#f97316'): Record<string, string> {
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const base = scale?.['500'] ?? Object.values(scale ?? {})[0] ?? fallback;
    const result: Record<string, string> = {};
    
    for (const shade of shades) {
      result[shade] = scale?.[shade] ?? base;
    }

    return result;
  }

  // ============================
  // Generator Methods
  // ============================

  private generateLayoutComponent(
    blueprint: Blueprint,
    layout: LayoutConfig,
    themePack: ThemePack,
    options: RenderOptions,
    aiGeneratedData?: Record<string, any>
  ): string {
    console.log("🔍 generateLayoutComponent - AI Data:", {
      hasAiData: !!aiGeneratedData,
      navbarBasic: aiGeneratedData?.["navbar-basic"],
      footerBasic: aiGeneratedData?.["footer-basic"],
    });

    return `import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        brandName="${
          aiGeneratedData?.components?.navbar?.props?.brandName ||
          aiGeneratedData?.["navbar-basic"]?.brand ||
          "Your Business"
        }"
        menuItems={[
          { label: 'Home', link: '/' },
          { label: 'Menu', link: '/menu' },
          { label: 'About', link: '/about' },
          { label: 'Contact', link: '/contact' }
        ]}
      />

      <main className="flex-1">
        {children}
      </main>

      <Footer 
        brandName="${
          aiGeneratedData?.components?.footer?.props?.brandName ||
          aiGeneratedData?.["footer-basic"]?.companyName ||
          "Your Business"
        }"
        description="${
          aiGeneratedData?.components?.footer?.props?.description ||
          aiGeneratedData?.["footer-basic"]?.description ||
          "We provide quality services"
        }"
        address="${
          aiGeneratedData?.components?.contact?.props?.address ||
          aiGeneratedData?.["contact-basic"]?.address ||
          "123 Main St, City"
        }"
        phone="${
          aiGeneratedData?.components?.contact?.props?.phone ||
          aiGeneratedData?.["contact-basic"]?.phone ||
          "123-456-7890"
        }"
        email="${
          aiGeneratedData?.components?.contact?.props?.email ||
          aiGeneratedData?.["contact-basic"]?.email ||
          "hello@business.com"
        }"
      />
    </div>
  );
};

export default Layout;`;
  }

  private generateOldFooter(aiGeneratedData?: Record<string, any>): string {
    // Keep old footer code for reference if needed
    return `      {/* Old Footer - replaced by Footer component */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">${
                aiGeneratedData?.components?.footer?.props?.brandName ||
                aiGeneratedData?.["footer-basic"]?.companyName ||
                "Your Business"
              }</h3>
              <p className="text-gray-300">${
                aiGeneratedData?.components?.footer?.props?.description ||
                aiGeneratedData?.["footer-basic"]?.description ||
                "We provide excellent services"
              }</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <p className="text-gray-300">${
                aiGeneratedData?.components?.contact?.props?.address ||
                aiGeneratedData?.["contact-basic"]?.address ||
                "123 Main Street"
              }</p>
              <p className="text-gray-300">${
                aiGeneratedData?.components?.contact?.props?.phone ||
                aiGeneratedData?.["contact-basic"]?.phone ||
                "(555) 123-4567"
              }</p>
              <p className="text-gray-300">${
                aiGeneratedData?.components?.contact?.props?.email ||
                aiGeneratedData?.["contact-basic"]?.email ||
                "contact@example.com"
              }</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hours</h3>
              <p className="text-gray-300">${
                aiGeneratedData?.components?.contact?.props?.businessHours ||
                aiGeneratedData?.["contact-basic"]?.businessHours ||
                "Mon-Fri: 11:00 AM - 10:00 PM"
              }</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">&copy; 2024 ${
              aiGeneratedData?.components?.footer?.props?.brandName ||
              aiGeneratedData?.["footer-basic"]?.companyName ||
              "Your Business"
            }. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;`;
  }


  private generateCSSVariables(themePack: ThemePack): string {
    let css = `/* Theme Variables */\n:root {\n`;
    
    Object.entries(themePack.colorPalette).forEach(([key, value]) => {
      if (typeof value === "object") {
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
    const primary = this.fillColorScale(themePack.colorPalette.primary, '#f97316');
    const secondary = this.fillColorScale(themePack.colorPalette.secondary, '#dc2626');
    const accent = this.fillColorScale(themePack.colorPalette.accent, '#f59e0b');

    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: ${JSON.stringify(primary)},
        secondary: ${JSON.stringify(secondary)},
        accent: ${JSON.stringify(accent)}
      }
    },
  },
  plugins: [],
}`;
  }

  private generateThemeProvider(themePack: ThemePack): string {
    const primary = this.fillColorScale(themePack.colorPalette.primary, '#f97316');
    const secondary = this.fillColorScale(themePack.colorPalette.secondary, '#dc2626');
    const accent = this.fillColorScale(themePack.colorPalette.accent, '#f59e0b');
    const neutral = this.fillColorScale(themePack.colorPalette.neutral, '#6b7280');

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
      primary: ${JSON.stringify(primary)},
      secondary: ${JSON.stringify(secondary)},
      accent: ${JSON.stringify(accent)},
      neutral: ${JSON.stringify(neutral)}
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

  private generatePackageJson(
    blueprint: Blueprint,
    themePack: ThemePack,
    options: RenderOptions
  ): string {
    const packageJson = {
      name:
        options.projectName?.toLowerCase().replace(/\s+/g, "-") || "midori-app",
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
        lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.8.1",
      },
      devDependencies: {
        "@types/react": "^18.2.15",
        "@types/react-dom": "^18.2.7",
        "@typescript-eslint/eslint-plugin": "^6.0.0",
        "@typescript-eslint/parser": "^6.0.0",
        "@vitejs/plugin-react": "^4.0.3",
        autoprefixer: "^10.4.14",
        eslint: "^8.45.0",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-react-refresh": "^0.4.3",
        postcss: "^8.4.32",
        tailwindcss: "^3.4.0",
        typescript: "^5.3.0",
        vite: "^5.0.0",
      },
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

  private generateMainComponent(options: RenderOptions = {}): string {
    return `import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './index.css';

const projectName = "${options.projectName || "Midori App"}";

function Root() {
  useEffect(() => {
    document.title = projectName;
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);`;
  }

  private generateAppComponent(
    selection: ComponentSelection,
    blueprint: Blueprint,
    layout: LayoutConfig,
    options: RenderOptions
  ): string {
    // Generate imports for selected components
    const componentImports = this.generateComponentImports(selection);

    return `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './components/Menu';
${componentImports}

function App() {
  return (
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
  );
}

export default App;`;
  }

  private generateIndexHtml(options: RenderOptions): string {
    const projectName = options.projectName || "Midori App";
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
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

  private generateMenuComponent(aiGeneratedData?: Record<string, any>): string {
    return `import React from 'react';

export default function Menu() {
  const menuItems = ${JSON.stringify(
    aiGeneratedData?.components?.menu?.props?.menuItems ||
      aiGeneratedData?.["menu-basic"]?.menuItems || [
        {
          id: 1,
          name: "Main Course",
          description: "Delicious main dishes",
          price: "15.99",
          category: "Main Course",
          image: "https://via.placeholder.com/400x300?text=Main+Course",
          imageAlt: "Main Course",
        },
        {
          id: 2,
          name: "Beverages",
          description: "Refreshing drinks",
          price: "5.99",
          category: "Beverage",
          image: "https://via.placeholder.com/400x300?text=Beverages",
          imageAlt: "Beverages",
        },
        {
          id: 3,
          name: "Desserts",
          description: "Sweet treats",
          price: "8.99",
          category: "Dessert",
          image: "https://via.placeholder.com/400x300?text=Desserts",
          imageAlt: "Desserts",
        },
      ]
  )};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">${
            aiGeneratedData?.components?.menu?.props?.title ||
            aiGeneratedData?.["menu-basic"]?.title ||
            "Our Menu"
          }</h1>
          <p className="text-lg text-gray-600">${
            aiGeneratedData?.components?.menu?.props?.subtitle ||
            aiGeneratedData?.["menu-basic"]?.subtitle ||
            "Discover our products and services"
          }</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <div key={item.id ?? (item.name + '-' + item.price)} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                  <span className="text-primary-600 font-semibold">
                    {'฿' + (typeof item.price === 'number' ? item.price.toFixed(0) : Number(item.price ?? 0).toFixed(0))}
                  </span>
            </div>
                <p className="text-gray-600 mb-3">{item.description}</p>
                <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded-full">
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

  private generateHomePage(aiGeneratedData?: Record<string, any>): string {
    console.log("🔍 generateHomePage - AI Data:", {
      hasAiData: !!aiGeneratedData,
      heroBasic: aiGeneratedData?.["hero-basic"],
      aboutBasic: aiGeneratedData?.["about-basic"],
      menuBasic: aiGeneratedData?.["menu-basic"],
      contactBasic: aiGeneratedData?.["contact-basic"],
    });

    return `import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">${
            aiGeneratedData?.components?.hero?.props?.heading ||
            aiGeneratedData?.["hero-basic"]?.heading ||
            "Welcome to Our Business"
          }</h1>
          <p className="text-xl mb-8">${
            aiGeneratedData?.components?.hero?.props?.subheading ||
            aiGeneratedData?.["hero-basic"]?.subheading ||
            "We provide excellent services"
          }</p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
            ${
              aiGeneratedData?.components?.hero?.props?.ctaLabel ||
              aiGeneratedData?.["hero-basic"]?.ctaLabel ||
              "Learn More"
            }
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">${
              aiGeneratedData?.components?.about?.props?.title ||
              aiGeneratedData?.["about-basic"]?.title ||
              "About Us"
            }</h2>
            <p className="text-lg text-gray-600">${
              aiGeneratedData?.components?.about?.props?.description ||
              aiGeneratedData?.["about-basic"]?.description ||
              "We are committed to providing quality services"
            }</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${(
              aiGeneratedData?.components?.about?.props?.features ||
              aiGeneratedData?.["about-basic"]?.features || [
                {
                  title: "Quality Service",
                  description:
                    "We provide excellent service to all our customers",
                },
              ]
            )
              .map(
                (feature: any, index: number) => `
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">${
                  ["🍽️", "👨‍🍳", "⭐"][index] || "⭐"
                }</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">${feature.title}</h3>
              <p className="text-gray-600">${feature.description}</p>
            </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">${
              aiGeneratedData?.components?.menu?.props?.title ||
              aiGeneratedData?.["menu-basic"]?.title ||
              "Our Menu"
            }</h2>
            <p className="text-lg text-gray-600">${
              aiGeneratedData?.components?.menu?.props?.subtitle ||
              aiGeneratedData?.["menu-basic"]?.subtitle ||
              "Discover our products and services"
            }</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${(
              aiGeneratedData?.components?.menu?.props?.menuItems ||
              aiGeneratedData?.["menu-basic"]?.menuItems || [
                {
                  name: "Main Course",
                  price: "15.99",
                  description: "Delicious main dishes",
                  image: "https://via.placeholder.com/400x300?text=Main+Course",
                  imageAlt: "Main Course",
                },
                {
                  name: "Beverages",
                  price: "5.99",
                  description: "Refreshing drinks",
                  image: "https://via.placeholder.com/400x300?text=Beverages",
                  imageAlt: "Beverages",
                },
                {
                  name: "Desserts",
                  price: "8.99",
                  description: "Sweet treats",
                  image: "https://via.placeholder.com/400x300?text=Desserts",
                  imageAlt: "Desserts",
                },
              ]
            )
              .map(
                (item: any) => `
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200">
                <img src="${item.image}" alt="${item.imageAlt}" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">${item.name}</h3>
                <p className="text-gray-600">${item.description}</p>
                <p className="text-primary-600 font-semibold mt-2">฿${item.price}</p>
              </div>
            </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">${
              aiGeneratedData?.components?.contact?.props?.title ||
              aiGeneratedData?.["contact-basic"]?.title ||
              "Contact Us"
            }</h2>
            <p className="text-lg text-gray-600">${
              aiGeneratedData?.components?.contact?.props?.subtitle ||
              aiGeneratedData?.["contact-basic"]?.subtitle ||
              "Get in touch with us"
            }</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Visit Us</h3>
              <p className="text-gray-600 mb-4">${
                aiGeneratedData?.components?.contact?.props?.address ||
                aiGeneratedData?.["contact-basic"]?.address ||
                "Your Address"
              }</p>
              <p className="text-gray-600 mb-4">Phone: ${
                aiGeneratedData?.components?.contact?.props?.phone ||
                aiGeneratedData?.["contact-basic"]?.phone ||
                "Your Phone"
              }</p>
              <p className="text-gray-600">Email: ${
                aiGeneratedData?.components?.contact?.props?.email ||
                aiGeneratedData?.["contact-basic"]?.email ||
                "your@email.com"
              }</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Hours</h3>
              <p className="text-gray-600 mb-2">${
                aiGeneratedData?.components?.contact?.props?.businessHours ||
                aiGeneratedData?.["contact-basic"]?.businessHours ||
                "Monday - Friday: 9:00 AM - 6:00 PM"
              }</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;
  }

  private generatePropsInterface(
    componentName: string,
    componentId: string
  ): string {
    const componentPropsMap: Record<string, string> = {
      navbar: `interface ${componentName}Props {
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
      hero: `interface ${componentName}Props {
  badge?: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  secondaryCta?: string;
  heroImage?: string;
  heroImageAlt?: string;
}`,
      about: `interface ${componentName}Props {
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
       contact: `interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
   businessHours?: string;
}`,
      footer: `interface ${componentName}Props {
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
      menu: `interface ${componentName}Props {
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
}`,
    };

    return (
      componentPropsMap[componentId] ||
      `interface ${componentName}Props {
  // Add props here
}`
    );
  }

  private generateComponentImports(selection: ComponentSelection): string {
    const componentIds = new Set(selection.selectedComponents.map(s => s.componentId));
    
    const componentNameMap: Record<string, string> = {
      navbar: 'Navbar',
      hero: 'Hero',
      about: 'About',
      contact: 'Contact',
      footer: 'Footer',
      menu: 'Menu',
    };

    const imports: string[] = [];
    
    // Only import components that are actually used in App.tsx routes
    // Layout, Home, Menu are imported directly at the top
    // Navbar, Hero, Footer are used inside Layout/Home, not in App.tsx
    imports.push(`import About from './components/About';`);
    imports.push(`import Contact from './components/Contact';`);

    return imports.join('\n');
  }

  private renderComponentFromDefinition(
    componentId: string,
    aiGeneratedData?: Record<string, any>
  ): RenderedFile | null {
    const component = this.componentRegistry.get(componentId);
    if (!component || !component.variants || component.variants.length === 0) {
      console.warn(`⚠️ Component not found or no variants: ${componentId}`);
      return null;
    }

    // Use the first variant as default
    const variant = component.variants[0];
    if (!variant) {
      console.warn(`⚠️ No variant found for component: ${componentId}`);
      return null;
    }

    // Extract AI data for this component
    const aiData = this.extractComponentData(componentId, aiGeneratedData);

    // Create a mock selected component with AI data
    const selectedComponent = {
      componentId: component.id,
      variantId: variant.id,
      props: {
        ...aiData,
        ...this.getFallbackProps(componentId, component),
      },
    };

    // Render the component using existing renderComponent method
    return this.renderComponent(
      component,
      variant,
      selectedComponent,
      {
        name: "default",
        colorPalette: {
          primary: { 500: "#f97316", 600: "#ea580c" },
          secondary: { 500: "#dc2626", 600: "#b91c1c" },
          accent: { 500: "#f59e0b", 600: "#d97706" },
          neutral: { 500: "#6b7280", 600: "#4b5563" },
        },
        typography: {
          fontFamily: { primary: "Inter", secondary: "Inter" },
        },
        spacing: { sm: "0.5rem", md: "1rem", lg: "1.5rem" },
      },
      { projectName: "default", includeDependencies: true, addComments: true },
      aiGeneratedData
    );
  }
}
