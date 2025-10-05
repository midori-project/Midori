/**
 * Project Structure Generator for Frontend-V2 Agent
 * Generates complete project structures from component results
 */

import { ComponentResultV2 } from '../../schemas/types';
import { ProjectTemplate, getProjectTemplateByType } from '../project-templates';

export interface ProjectStructure {
  projectStructure: {
    name: string;
    type: string;
    description: string;
  };
  files: Array<{
    path: string;
    content: string;
    type: string;
    language: string;
  }>;
}

export class ProjectStructureGenerator {
  /**
   * Generate complete project structure from component result
   */
  generateProjectStructure(
    componentResult: ComponentResultV2,
    projectType: string = 'vite-react-typescript',
    projectName?: string
  ): ProjectStructure {
    const template = getProjectTemplateByType(projectType);
    if (!template) {
      throw new Error(`Project template '${projectType}' not found`);
    }

    const projectName_ = projectName || this.generateProjectName(componentResult);
    const projectTitle = this.generateProjectTitle(componentResult);
    
    // Generate project files
    const files = this.generateProjectFiles(template, componentResult, projectName_, projectTitle);
    
    return {
      projectStructure: {
        name: projectName_,
        type: projectType,
        description: this.generateProjectDescription(componentResult, projectName_)
      },
      files
    };
  }

  /**
   * Generate project files from template
   */
  private generateProjectFiles(
    template: ProjectTemplate,
    componentResult: ComponentResultV2,
    projectName: string,
    projectTitle: string
  ): Array<{ path: string; content: string; type: string; language: string }> {
    const files: Array<{ path: string; content: string; type: string; language: string }> = [];
    
    // Generate template files
    for (const [fileName, fileTemplate] of Object.entries(template.files)) {
      const content = this.processFileTemplate(fileTemplate, componentResult, projectName, projectTitle);
      files.push({
        path: fileTemplate.path,
        content,
        type: fileTemplate.type,
        language: fileTemplate.language
      });
    }

    // Generate component files from component result
    for (const file of componentResult.files) {
      files.push({
        path: file.path,
        content: file.content,
        type: this.mapFileType(file.type),
        language: this.getLanguageFromPath(file.path)
      });
    }

    return files;
  }

  /**
   * Process file template with placeholders
   */
  private processFileTemplate(
    fileTemplate: any,
    componentResult: ComponentResultV2,
    projectName: string,
    projectTitle: string
  ): string {
    let content = fileTemplate.content;
    
    // Replace placeholders
    const placeholders = {
      '{projectName}': projectName,
      '{projectTitle}': projectTitle,
      '{primaryColor}': this.getPrimaryColor(componentResult),
      '{secondaryColor}': this.getSecondaryColor(componentResult),
      '{accentColor}': this.getAccentColor(componentResult),
      '{backgroundColor}': this.getBackgroundColor(componentResult),
      '{primaryColorHex}': this.getPrimaryColorHex(componentResult),
      '{bgTone}': this.getBgTone(componentResult),
      '{businessName}': this.getBusinessName(componentResult),
      '{tagline}': this.getTagline(componentResult),
      '{address}': this.getAddress(componentResult),
      '{phone}': this.getPhone(componentResult),
      '{appRoutes}': this.generateAppRoutes(componentResult),
      '{routeElements}': this.generateRouteElements(componentResult)
    };

    for (const [placeholder, value] of Object.entries(placeholders)) {
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    return content;
  }

  /**
   * Generate project name from component result
   */
  private generateProjectName(componentResult: ComponentResultV2): string {
    const businessCategory = componentResult.result.businessCategory;
    const categoryMap: Record<string, string> = {
      'restaurant': 'food-delivery-table-reservation',
      'ecommerce': 'online-store-ecommerce',
      'portfolio': 'creative-portfolio-showcase',
      'healthcare': 'medical-clinic-website',
      'pharmacy': 'pharmacy-drugstore-website'
    };
    
    return categoryMap[businessCategory] || 'modern-website-project';
  }

  /**
   * Generate project title
   */
  private generateProjectTitle(componentResult: ComponentResultV2): string {
    const businessCategory = componentResult.result.businessCategory;
    const categoryMap: Record<string, string> = {
      'restaurant': 'Food Delivery & Table Reservation',
      'ecommerce': 'Online Store & E-commerce',
      'portfolio': 'Creative Portfolio Showcase',
      'healthcare': 'Medical Clinic Website',
      'pharmacy': 'Pharmacy & Drugstore Website'
    };
    
    return categoryMap[businessCategory] || 'Modern Website';
  }

  /**
   * Generate project description
   */
  private generateProjectDescription(componentResult: ComponentResultV2, projectName: string): string {
    const businessCategory = componentResult.result.businessCategory;
    const framework = 'Vite + React + TypeScript + Tailwind CSS';
    
    const categoryMap: Record<string, string> = {
      'restaurant': `Food delivery and table reservation app with ${framework}`,
      'ecommerce': `Online store and e-commerce website with ${framework}`,
      'portfolio': `Creative portfolio and showcase website with ${framework}`,
      'healthcare': `Medical clinic and healthcare website with ${framework}`,
      'pharmacy': `Pharmacy and drugstore website with ${framework}`
    };
    
    return categoryMap[businessCategory] || `Modern website with ${framework}`;
  }

  /**
   * Get primary color from AI-generated content or business category
   */
  private getPrimaryColor(componentResult: ComponentResultV2): string {
    // Try to get from AI-generated content first
    const aiData = this.extractAIData(componentResult);
    if (aiData?.global?.palette?.primary) {
      return aiData.global.palette.primary;
    }
    
    // Fallback to business category default
    const businessCategory = componentResult.result.businessCategory;
    const colorMap: Record<string, string> = {
      'restaurant': 'orange',
      'ecommerce': 'blue',
      'portfolio': 'purple',
      'healthcare': 'green',
      'pharmacy': 'blue'
    };
    
    return colorMap[businessCategory] || 'blue';
  }

  /**
   * Get secondary color from AI-generated content or business category
   */
  private getSecondaryColor(componentResult: ComponentResultV2): string {
    // Try to get from AI-generated content first
    const aiData = this.extractAIData(componentResult);
    if (aiData?.global?.palette?.secondary) {
      return aiData.global.palette.secondary;
    }
    
    // Fallback to business category default
    const businessCategory = componentResult.result.businessCategory;
    const colorMap: Record<string, string> = {
      'restaurant': 'red',
      'ecommerce': 'purple',
      'portfolio': 'pink',
      'healthcare': 'blue',
      'pharmacy': 'green'
    };
    
    return colorMap[businessCategory] || 'purple';
  }

  /**
   * Get accent color
   */
  private getAccentColor(componentResult: ComponentResultV2): string {
    return 'yellow';
  }

  /**
   * Get background color
   */
  private getBackgroundColor(componentResult: ComponentResultV2): string {
    return '#F9F9F9';
  }

  /**
   * Get primary color hex
   */
  private getPrimaryColorHex(componentResult: ComponentResultV2): string {
    const primaryColor = this.getPrimaryColor(componentResult);
    const colorMap: Record<string, string> = {
      'orange': '#FF6347',
      'blue': '#3B82F6',
      'purple': '#8B5CF6',
      'green': '#10B981',
      'red': '#EF4444'
    };
    
    return colorMap[primaryColor] || '#3B82F6';
  }

  /**
   * Get background tone
   */
  private getBgTone(componentResult: ComponentResultV2): string {
    return 'orange';
  }

  /**
   * Get business name from AI-generated content
   */
  private getBusinessName(componentResult: ComponentResultV2): string {
    // Try to get from AI-generated content first
    const aiData = this.extractAIData(componentResult);
    if (aiData?.navbar?.brand) {
      return aiData.navbar.brand;
    }
    
    // Fallback to business category default
    const businessCategory = componentResult.result.businessCategory;
    const businessNames: Record<string, string> = {
      'restaurant': 'Café Delight',
      'ecommerce': 'Online Store Pro',
      'portfolio': 'Creative Portfolio',
      'healthcare': 'HealthCare Plus',
      'pharmacy': 'PharmaCare Store'
    };
    
    return businessNames[businessCategory] || 'Business Name';
  }

  /**
   * Get tagline from AI-generated content
   */
  private getTagline(componentResult: ComponentResultV2): string {
    // Try to get from AI-generated content first
    const aiData = this.extractAIData(componentResult);
    if (aiData?.hero?.subheading) {
      return aiData.hero.subheading;
    }
    
    // Fallback to business category default
    const businessCategory = componentResult.result.businessCategory;
    const taglines: Record<string, string> = {
      'restaurant': 'Delicious food, warm atmosphere',
      'ecommerce': 'Quality products, great prices',
      'portfolio': 'Creative solutions, professional results',
      'healthcare': 'Your health, our priority',
      'pharmacy': 'Quality care, trusted service'
    };
    
    return taglines[businessCategory] || 'Professional service';
  }

  /**
   * Get address from AI-generated content or business category
   */
  private getAddress(componentResult: ComponentResultV2): string {
    // Try to get from AI-generated content first
    const aiData = this.extractAIData(componentResult);
    if (aiData?.contact?.address) {
      return aiData.contact.address;
    }
    
    // Fallback to business category default
    const businessCategory = componentResult.result.businessCategory;
    const addresses: Record<string, string> = {
      'restaurant': '123 Main St, City',
      'ecommerce': '456 Business Ave, City',
      'portfolio': '789 Creative St, City',
      'healthcare': '321 Health Plaza, City',
      'pharmacy': '654 Medical Center, City'
    };
    
    return addresses[businessCategory] || '123 Business St, City';
  }

  /**
   * Get phone from AI-generated content or business category
   */
  private getPhone(componentResult: ComponentResultV2): string {
    // Try to get from AI-generated content first
    const aiData = this.extractAIData(componentResult);
    if (aiData?.contact?.phone) {
      return aiData.contact.phone;
    }
    
    // Fallback to business category default
    const businessCategory = componentResult.result.businessCategory;
    const phones: Record<string, string> = {
      'restaurant': '+1 234 567 890',
      'ecommerce': '+1 234 567 891',
      'portfolio': '+1 234 567 892',
      'healthcare': '+1 234 567 893',
      'pharmacy': '+1 234 567 894'
    };
    
    return phones[businessCategory] || '+1 234 567 890';
  }

  /**
   * Generate app routes (dynamic based on category)
   */
  private generateAppRoutes(componentResult: ComponentResultV2): string {
    const businessCategory = componentResult.result.businessCategory;
    
    const routeImports: Record<string, string> = {
      'restaurant': `import Menu from './pages/Menu';
import Reservation from './pages/Reservation';
import ChefProfile from './pages/ChefProfile';
import DishGallery from './pages/DishGallery';`,
      'ecommerce': `import Products from './pages/Products';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';`,
      'portfolio': `import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Projects from './pages/Projects';`,
      'healthcare': `import Services from './pages/Services';
import Doctors from './pages/Doctors';
import Appointment from './pages/Appointment';
import Contact from './pages/Contact';`,
      'pharmacy': `import Products from './pages/Products';
import Services from './pages/Services';
import Contact from './pages/Contact';
import About from './pages/About';`
    };
    
    return routeImports[businessCategory] || '';
  }

  /**
   * Generate route elements (dynamic based on category)
   */
  private generateRouteElements(componentResult: ComponentResultV2): string {
    const businessCategory = componentResult.result.businessCategory;
    
    const routeElements: Record<string, string> = {
      'restaurant': `<Route path="/menu" element={<Menu />} />
          <Route path="/reservation" element={<Reservation availableSlots={['12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']} />} />
          <Route path="/chef-profile" element={<ChefProfile name="Chef Maria" photo="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200" biography="A passionate chef with 15 years of experience" specialties={['Italian Cuisine', 'Mediterranean']} philosophy="Fresh ingredients make the best dishes" awards={['Best Chef 2023']} signatureDishes={['Pasta Carbonara', 'Tiramisu']} />} />
          <Route path="/dish-gallery" element={<DishGallery />} />`,
      'ecommerce': `<Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />`,
      'portfolio': `<Route path="/portfolio" element={<Portfolio />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/projects" element={<Projects />} />`,
      'healthcare': `<Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/contact" element={<Contact />} />`,
      'pharmacy': `<Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />`
    };
    
    return routeElements[businessCategory] || '';
  }

  /**
   * Map file type
   */
  private mapFileType(type: string): string {
    const typeMap: Record<string, string> = {
      'component': 'component',
      'style': 'style',
      'config': 'config',
      'test': 'test',
      'documentation': 'documentation'
    };
    
    return typeMap[type] || 'component';
  }

  /**
   * Get language from file path
   */
  private getLanguageFromPath(path: string): string {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.json')) return 'json';
    return 'typescript';
  }

  /**
   * Extract AI-generated data from component result
   */
  private extractAIData(componentResult: ComponentResultV2): any {
    // Try to extract AI data from component result metadata
    // This would contain the AI-generated content from the template system
    if (componentResult.metadata && 'aiGeneratedData' in componentResult.metadata) {
      return (componentResult.metadata as any).aiGeneratedData;
    }
    
    // Try to extract from component files if they contain AI data
    for (const file of componentResult.files) {
      if (file.path.includes('ai-data') || file.content.includes('aiGeneratedData')) {
        try {
          return JSON.parse(file.content);
        } catch (error) {
          console.warn('Failed to parse AI data from file:', file.path);
        }
      }
    }
    
    return null;
  }
}

export function createProjectStructureGenerator(): ProjectStructureGenerator {
  return new ProjectStructureGenerator();
}
