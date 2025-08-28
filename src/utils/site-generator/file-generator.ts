import { SITE_GEN_CONFIG } from './config';
import { GeneratedFile, ProjectStructure, GenerationOptions, FileConfig } from './types';
import { UserIntentAnalyzer } from './user-intent-analyzer';
import { OpenAIService } from './openai-service';
// import { CodeFormatter } from '../code-formatter';

// เพิ่ม interfaces สำหรับ type safety
interface BusinessContext {
  industry: string;
  specificNiche: string;
  targetAudience: string;
  businessModel: string;
}

interface UserIntent {
  visualStyle: string;
  colorScheme: string;
  layoutPreference: string;
  tone: string;
  targetAudience: string;
}

interface CodeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * File Generator
 * Handles generation of individual files for the website
 */
export class FileGenerator {

  /**
   * Validate generated code for common issues
   */
  private static validateGeneratedCode(content: string, filePath: string): CodeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic syntax checks
    if (!content || content.trim().length === 0) {
      errors.push('Empty content generated');
      return { isValid: false, errors, warnings };
    }
    
    // React component validation
    if (filePath.endsWith('.tsx')) {
      // Check for proper React imports
      if (!content.includes('import React') && !content.includes('from "react"') && !content.includes("from 'react'")) {
        errors.push('Missing React import');
      }
      
      // Check for export default
      if (!content.includes('export default')) {
        errors.push('Missing export default statement');
      }
      
      // Check for proper component function
      const componentName = filePath.split('/').pop()?.replace('.tsx', '') || '';
      if (componentName && !content.includes(`const ${componentName}`) && !content.includes(`function ${componentName}`)) {
        warnings.push(`Component name "${componentName}" not found in function declaration`);
      }
      
      // Check for JSX return
      if (!content.includes('return (') && !content.includes('return <')) {
        errors.push('No JSX return statement found');
      }
      
      // Check for unclosed JSX tags
      const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
      const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
      const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length;
      
      if (openTags !== closeTags + selfClosingTags) {
        errors.push('Potential unclosed JSX tags detected');
      }
    }
    
    // JSON validation
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(content);
      } catch (e) {
        errors.push('Invalid JSON syntax');
      }
    }
    
    // Check for common issues
    if (content.includes('undefined') && !content.includes('typeof undefined')) {
      warnings.push('Potential undefined value usage');
    }
    
    if (content.includes('console.log') || content.includes('console.error')) {
      warnings.push('Console statements found (consider removing for production)');
    }
    
    // Import path validation
    const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Check for proper relative path structure
        if (importPath.includes('//') || importPath.endsWith('/')) {
          warnings.push(`Suspicious import path: ${importPath}`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Generate ESSENTIAL files only (10-15 files max) - OPTIMIZED VERSION
   */
  static async generateEssentialFilesOnly(
    finalJson: Record<string, unknown>,
    projectStructure: ProjectStructure,
    options: GenerationOptions
  ): Promise<GeneratedFile[]> {
    console.log('🎯 Starting ESSENTIAL files generation (max 15 files)');
    const startTime = Date.now();
    
    // วิเคราะห์ business context เพื่อเลือกไฟล์ที่เหมาะสม
    const businessContext = await UserIntentAnalyzer.analyzeBusinessContext(finalJson);
    console.log('🏢 Business Context detected:', businessContext);
    
    // เลือกไฟล์ตาม business context
    const essentialFiles = this.getEssentialFilesByBusinessContext(businessContext, projectStructure);
    
    console.log(`📁 Generating ${essentialFiles.length} essential files for ${businessContext.industry} business`);
    console.log('📋 Files to generate:', essentialFiles.map(f => f.path));
    
    const files: GeneratedFile[] = [];
    
    // Generate files in batches to avoid too many concurrent requests
    const batchSize = 3;
    for (let i = 0; i < essentialFiles.length; i += batchSize) {
      const batch = essentialFiles.slice(i, i + batchSize);

      const batchPromises = batch.map((fileConfig) =>
        this.generateEssentialFile(fileConfig, projectStructure, businessContext).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`[FileGenerator] Failed to generate ${fileConfig.path}: ${message}`);
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      const failures = batchResults.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (failures.length > 0) {
        const errorMessages = failures.map((f) => String(f.reason)).join(' | ');
        throw new Error(`[FileGenerator] Batch generation failed: ${errorMessages}`);
      }

      (batchResults as PromiseFulfilledResult<GeneratedFile>[]).forEach((result) => {
        files.push(result.value);
      });

      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} completed (${batch.length} files)`);
    }

    const duration = Date.now() - startTime;
    console.log(`🎯 Essential files generation completed in ${duration}ms - ${files.length} files`);
    
    // Disabled code formatting to prevent malformed output
    return files;
  }

  /**
   * Get essential files based on business context
   */
  private static getEssentialFilesByBusinessContext(
    businessContext: BusinessContext, 
    projectStructure: ProjectStructure
  ): FileConfig[] {
    const baseFiles: FileConfig[] = [
      // Core structure (6 files)
      { path: 'package.json', type: 'config' as const },
      { path: 'index.html', type: 'config' as const },
      { path: 'src/main.tsx', type: 'entry' as const },
      { path: 'src/App.tsx', type: 'app' as const },
      { path: 'src/index.css', type: 'style' as const },
      { path: 'vite.config.ts', type: 'config' as const },

    ];

    const businessSpecificFiles = this.getBusinessSpecificFiles(businessContext);
    const utilityFiles: FileConfig[] = [
      { path: 'tailwind.config.js', type: 'config' as const },
      { path: 'src/types/index.ts', type: 'util' as const },
      { path: 'src/lib/utils.ts', type: 'util' as const }
    ];
    
    return [...baseFiles, ...businessSpecificFiles, ...utilityFiles];
  }

  /**
   * Get business-specific routes for App component
   */
  private static getBusinessSpecificRoutes(industry: string): string {
    switch (industry) {
      case 'restaurant':
        return `- /menu - เมนูอาหาร
- /reservation - จองโต๊ะ
- /chef-profile - โปรไฟล์เชฟ
- /dish-gallery - แกลเลอรี่อาหาร`;
      case 'cafe':
        return `- /coffee-menu - เมนูกาแฟ
- /barista-profile - โปรไฟล์บาริสต้า
- /order-tracking - ติดตามออเดอร์
- /bean-origin - แหล่งที่มาของเมล็ดกาแฟ`;
      case 'fashion':
        return `- /collection - คอลเลกชัน
- /product-detail - รายละเอียดสินค้า
- /style-guide - ไกด์สไตล์`;
      case 'technology':
        return `- /projects - โปรเจกต์
- /services - บริการ
- /team - ทีม`;
      default:
        return `- /products - สินค้า
- /services - บริการ`;
    }
  }

  /**
   * Get business-specific route elements for App component
   */
  private static getBusinessSpecificRouteElements(industry: string): string {
    switch (industry) {
      case 'restaurant':
        return `<Route path="/menu" element={<Menu />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/chef-profile" element={<ChefProfile />} />
          <Route path="/dish-gallery" element={<DishGallery />} />`;
      case 'cafe':
        return `<Route path="/coffee-menu" element={<CoffeeMenu />} />
          <Route path="/barista-profile" element={<BaristaProfile />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/bean-origin" element={<BeanOrigin />} />`;
      case 'fashion':
        return `<Route path="/collection" element={<Collection />} />
          <Route path="/product-detail" element={<ProductDetail />} />
          <Route path="/style-guide" element={<StyleGuide />} />`;
      case 'technology':
        return `<Route path="/projects" element={<Projects />} />
          <Route path="/services" element={<Services />} />
          <Route path="/team" element={<Team />} />`;
      default:
        return `<Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />`;
    }
  }

  /**
   * Get business-specific page content based on industry and file path
   */
  private static getBusinessSpecificPageContent(industry: string, filePath: string): string {
    const fileName = filePath.split('/').pop()?.replace('.tsx', '') || '';
    
    switch (industry) {
      case 'restaurant':
        switch (fileName) {
          case 'Menu':
            return `- Create a menu page with food categories (appetizers, main courses, desserts, beverages)
- Display food items with images, descriptions, and prices
- Include dietary information (vegetarian, gluten-free, etc.)
- Add a search/filter function for menu items`;
          case 'Reservation':
            return `- Create a reservation form with date, time, number of guests
- Include table selection and special requests
- Add confirmation and booking status
- Display available time slots`;
          case 'ChefProfile':
            return `- Show chef profiles with photos and biographies
- Display their specialties and cooking philosophy
- Include awards and recognition
- Show their signature dishes`;
          case 'DishGallery':
            return `- Display high-quality food photography
- Organize by categories (appetizers, main courses, desserts)
- Include dish descriptions and ingredients
- Add social sharing features`;
          default:
            return `- Create content appropriate for a restaurant website
- Use warm, inviting colors and food-related imagery
- Focus on dining experience and culinary excellence`;
        }
        
      case 'cafe':
        switch (fileName) {
          case 'CoffeeMenu':
            return `- Display coffee menu with different brewing methods
- Include coffee origins and flavor profiles
- Show pricing and customization options
- Add coffee education content`;
          case 'BaristaProfile':
            return `- Show barista profiles with their coffee expertise
- Display their certifications and specialties
- Include their favorite coffee recommendations
- Show their latte art skills`;
          case 'OrderTracking':
            return `- Create order status tracking system
- Show estimated preparation time
- Include order history and favorites
- Add notification system`;
          case 'BeanOrigin':
            return `- Display coffee bean origins and stories
- Show roasting profiles and flavor notes
- Include sustainability information
- Add coffee education content`;
          default:
            return `- Create content appropriate for a cafe website
- Use warm, coffee-themed colors and imagery
- Focus on coffee culture and community`;
        }
        
      case 'fashion':
        switch (fileName) {
          case 'Collection':
            return `- Display fashion collections with high-quality images
- Organize by seasons and categories
- Include size guides and availability
- Add wishlist and shopping features`;
          case 'ProductDetail':
            return `- Show detailed product information
- Include multiple product images and angles
- Display size charts and fit information
- Add reviews and ratings`;
          case 'StyleGuide':
            return `- Create style inspiration and tips
- Show outfit combinations and trends
- Include fashion advice and tutorials
- Add seasonal style guides`;
          default:
            return `- Create content appropriate for a fashion website
- Use elegant, fashion-forward colors and imagery
- Focus on style and trends`;
        }
        
      case 'technology':
        switch (fileName) {
          case 'Projects':
            return `- Display portfolio of technology projects
- Include project descriptions and technologies used
- Show case studies and results
- Add live demos and GitHub links`;
          case 'Services':
            return `- List technology services offered
- Include service descriptions and pricing
- Show expertise areas and technologies
- Add consultation booking`;
          case 'Team':
            return `- Show team member profiles and expertise
- Display skills and specializations
- Include professional backgrounds
- Add contact information`;
          default:
            return `- Create content appropriate for a technology website
- Use modern, tech-focused colors and imagery
- Focus on innovation and expertise`;
        }
        
      default:
        return `- Create general business content
- Use professional colors and imagery
- Focus on business value and services`;
    }
  }

  /**
   * Get business-specific component content based on industry and file path
   */
  private static getBusinessSpecificComponentContent(industry: string, filePath: string): string {
    const fileName = filePath.split('/').pop()?.replace('.tsx', '') || '';
    
    switch (industry) {
      case 'restaurant':
        switch (fileName) {
          case 'MenuCard':
            return `- Create a menu item card with image, name, description, price
- Include dietary badges (vegetarian, gluten-free, spicy)
- Add "Add to Order" or "View Details" button
- Show preparation time and availability`;
          case 'ReservationForm':
            return `- Create a reservation form with date picker, time slots, guest count
- Include table preferences and special requests
- Add form validation and confirmation
- Show available time slots dynamically`;
          case 'ChefCard':
            return `- Display chef profile with photo, name, specialties
- Show cooking philosophy and signature dishes
- Include awards and certifications
- Add "View Full Profile" link`;
          case 'DishCard':
            return `- Show dish image with overlay information
- Display dish name, ingredients, and price
- Include dietary information and allergens
- Add social sharing buttons`;
          default:
            return `- Create component appropriate for restaurant functionality
- Use warm, food-themed styling
- Focus on dining experience and culinary presentation`;
        }
        
      case 'cafe':
        switch (fileName) {
          case 'CoffeeCard':
            return `- Display coffee item with image, name, origin, flavor notes
- Show brewing method and price
- Include customization options (milk, sugar, size)
- Add "Add to Order" button`;
          case 'OrderStatus':
            return `- Show order progress with status indicators
- Display estimated completion time
- Include order details and tracking
- Add notification preferences`;
          case 'BaristaCard':
            return `- Display barista profile with photo, name, expertise
- Show coffee certifications and specialties
- Include favorite coffee recommendations
- Add "Chat with Barista" option`;
          case 'BeanOriginCard':
            return `- Show coffee bean origin with map and story
- Display roasting profile and flavor characteristics
- Include sustainability information
- Add "Learn More" link`;
          default:
            return `- Create component appropriate for cafe functionality
- Use warm, coffee-themed styling
- Focus on coffee culture and community`;
        }
        
      case 'fashion':
        switch (fileName) {
          case 'ProductCard':
            return `- Display fashion item with multiple images, name, price
- Show size availability and color options
- Include "Add to Wishlist" and "Quick View" buttons
- Display ratings and reviews`;
          case 'SizeGuide':
            return `- Create interactive size chart with measurements
- Show fit recommendations and tips
- Include international size conversions
- Add "How to Measure" guide`;
          case 'CollectionGrid':
            return `- Display fashion collection in grid layout
- Show collection name, season, and theme
- Include "View Collection" and "Shop Now" buttons
- Add filtering by category and price`;
          default:
            return `- Create component appropriate for fashion functionality
- Use elegant, fashion-forward styling
- Focus on style and trends`;
        }
        
      case 'technology':
        switch (fileName) {
          case 'ProjectCard':
            return `- Display project with image, title, description, technologies
- Show project status and completion date
- Include "View Demo" and "GitHub" links
- Display project metrics and results`;
          case 'ServiceCard':
            return `- Show service with icon, title, description, pricing
- Include service features and benefits
- Add "Learn More" and "Get Quote" buttons
- Display service availability`;
          case 'TeamCard':
            return `- Display team member with photo, name, role, expertise
- Show skills, experience, and specializations
- Include social media links and contact info
- Add "View Profile" and "Contact" buttons`;
          default:
            return `- Create component appropriate for technology functionality
- Use modern, tech-focused styling
- Focus on innovation and expertise`;
        }
        
      default:
        return `- Create general business component
- Use professional styling and colors
- Focus on business functionality and user experience`;
    }
  }

  /**
   * Get business-specific files based on industry
   */
  private static getBusinessSpecificFiles(businessContext: BusinessContext): FileConfig[] {
    const { industry, specificNiche, targetAudience } = businessContext;
    
    switch (industry) {
      case 'restaurant':
        return [
          // Restaurant-specific pages
          { path: 'src/pages/Menu.tsx', type: 'page' as const },
          { path: 'src/pages/Reservation.tsx', type: 'page' as const },
          { path: 'src/pages/ChefProfile.tsx', type: 'page' as const },
          { path: 'src/pages/DishGallery.tsx', type: 'page' as const },
          { path: 'src/pages/About.tsx', type: 'page' as const },
          { path: 'src/pages/Contact.tsx', type: 'page' as const },
          
          // Restaurant-specific components
          { path: 'src/components/Header.tsx', type: 'component' as const },
          { path: 'src/components/Footer.tsx', type: 'component' as const },
          { path: 'src/components/MenuCard.tsx', type: 'component' as const },
          { path: 'src/components/ReservationForm.tsx', type: 'component' as const },
          { path: 'src/components/ChefCard.tsx', type: 'component' as const },
          { path: 'src/components/DishCard.tsx', type: 'component' as const },
          { path: 'src/components/ContactForm.tsx', type: 'component' as const },
        ];
        
      case 'cafe':
        return [
          // Cafe-specific pages
          { path: 'src/pages/CoffeeMenu.tsx', type: 'page' as const },
          { path: 'src/pages/BaristaProfile.tsx', type: 'page' as const },
          { path: 'src/pages/OrderTracking.tsx', type: 'page' as const },
          { path: 'src/pages/BeanOrigin.tsx', type: 'page' as const },
          { path: 'src/pages/About.tsx', type: 'page' as const },
          { path: 'src/pages/Contact.tsx', type: 'page' as const },
          
          // Cafe-specific components
          { path: 'src/components/Header.tsx', type: 'component' as const },
          { path: 'src/components/Footer.tsx', type: 'component' as const },
          { path: 'src/components/CoffeeCard.tsx', type: 'component' as const },
          { path: 'src/components/OrderStatus.tsx', type: 'component' as const },
          { path: 'src/components/BaristaCard.tsx', type: 'component' as const },
          { path: 'src/components/BeanOriginCard.tsx', type: 'component' as const },
          { path: 'src/components/ContactForm.tsx', type: 'component' as const },
        ];
        
      case 'fashion':
        return [
          // Fashion-specific pages
          { path: 'src/pages/Collection.tsx', type: 'page' as const },
          { path: 'src/pages/ProductDetail.tsx', type: 'page' as const },
          { path: 'src/pages/StyleGuide.tsx', type: 'page' as const },
          { path: 'src/pages/About.tsx', type: 'page' as const },
          { path: 'src/pages/Contact.tsx', type: 'page' as const },
          
          // Fashion-specific components
          { path: 'src/components/Header.tsx', type: 'component' as const },
          { path: 'src/components/Footer.tsx', type: 'component' as const },
          { path: 'src/components/ProductCard.tsx', type: 'component' as const },
          { path: 'src/components/SizeGuide.tsx', type: 'component' as const },
          { path: 'src/components/CollectionGrid.tsx', type: 'component' as const },
          { path: 'src/components/ContactForm.tsx', type: 'component' as const },
        ];
        
      case 'technology':
        return [
          // Technology-specific pages
          { path: 'src/pages/Projects.tsx', type: 'page' as const },
          { path: 'src/pages/Services.tsx', type: 'page' as const },
          { path: 'src/pages/Team.tsx', type: 'page' as const },
          { path: 'src/pages/About.tsx', type: 'page' as const },
          { path: 'src/pages/Contact.tsx', type: 'page' as const },
          
          // Technology-specific components
          { path: 'src/components/Header.tsx', type: 'component' as const },
          { path: 'src/components/Footer.tsx', type: 'component' as const },
          { path: 'src/components/ProjectCard.tsx', type: 'component' as const },
          { path: 'src/components/ServiceCard.tsx', type: 'component' as const },
          { path: 'src/components/TeamCard.tsx', type: 'component' as const },
          { path: 'src/components/ContactForm.tsx', type: 'component' as const },
        ];
        
      default:
        // Generic business files
        return [
          { path: 'src/pages/Home.tsx', type: 'page' as const },
          { path: 'src/pages/About.tsx', type: 'page' as const },
          { path: 'src/pages/Contact.tsx', type: 'page' as const },
          { path: 'src/pages/Products.tsx', type: 'page' as const },
          { path: 'src/pages/Services.tsx', type: 'page' as const },
          
          { path: 'src/components/Header.tsx', type: 'component' as const },
          { path: 'src/components/Footer.tsx', type: 'component' as const },
          { path: 'src/components/Navigation.tsx', type: 'component' as const },
          { path: 'src/components/Hero.tsx', type: 'component' as const },
          { path: 'src/components/ProductCard.tsx', type: 'component' as const },
          { path: 'src/components/ContactForm.tsx', type: 'component' as const },
        ];
    }
  }

  /**
   * Generate a single essential file with proper React component structure
   */
  private static async generateEssentialFile(
    fileConfig: FileConfig,
    projectStructure: ProjectStructure,
    businessContext: BusinessContext
  ): Promise<GeneratedFile> {
    const { path, type } = fileConfig;
    const businessType = projectStructure.type || 'website';
    const projectName = projectStructure.name || 'Generated Project';
    
    // เพิ่ม User Intent Analysis
    const userIntent = await UserIntentAnalyzer.analyzeUserIntent(projectStructure as any) as UserIntent;
    
    // ทุกไฟล์จะถูกสร้างด้วย AI ตาม User Intent (ไม่มีการบังคับใช้เทมเพลตล่วงหน้า)

    // Create detailed prompts for proper React components with specific types
    const prompts = {
      // สำหรับไฟล์ config แยกเป็น JSON และ โค้ด JS/TS - SandPack Compatible
      configJson: `Create a proper ${path} file for ${projectName} Vite React project for SandPack environment. 

**SANDPACK COMPATIBILITY REQUIREMENTS:**
- Use exact dependency versions (no ^ or ~ prefixes)
- Include only SandPack-supported dependencies:
  - react: "18.2.0"
  - react-dom: "18.2.0" 
  - react-router-dom: "6.8.1"
- Use "type": "module" for ES modules
- Include essential scripts: dev, build, preview

Return only valid JSON code, no markdown headers or explanations.`,
      
      configCode: `Create a proper ${path} for a Vite + React + TypeScript project optimized for SandPack environment.

**SANDPACK COMPATIBILITY:**
- Simple configuration that works in browser environment
- No complex build optimizations
- Include essential plugins only
- Use ES module syntax

Return JavaScript/TypeScript code (not JSON), no markdown headers or explanations.`,
      
      // เพิ่ม prompt เฉพาะสำหรับ entry point
      entry: `Create a proper React entry point for ${path}. 

**CRITICAL REQUIREMENTS:**
- Import ReactDOM from 'react-dom/client'
- Import BrowserRouter from 'react-router-dom'
- Import App component from './App'
- Use ReactDOM.createRoot for React 18
- Wrap App in React.StrictMode and BrowserRouter
- DO NOT include Routes or Route components here

**CORRECT STRUCTURE EXAMPLE:**
\`\`\`tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
\`\`\`

Return only React code, no markdown headers or explanations.`,
      
      // เพิ่ม prompt เฉพาะสำหรับ app component
      app: `Create a proper React App component for ${path}. 

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}
- Specific Niche: ${businessContext.specificNiche}
- Target Audience: ${businessContext.targetAudience}
- Business Model: ${businessContext.businessModel}

**USER PREFERENCES:**
- Visual Style: ${userIntent.visualStyle}
- Color Scheme: ${userIntent.colorScheme}
- Layout: ${userIntent.layoutPreference}
- Tone: ${userIntent.tone}

**CRITICAL JSX STRUCTURE REQUIREMENTS:**
- MUST return a SINGLE root JSX element (either a <div> or React.Fragment <>...</>)
- DO NOT return multiple adjacent JSX elements at the top level
- Wrap all content in a single container element

**COMPONENT STRUCTURE:**
- Import React and React Router components
- Import page components based on business context
- Import Header and Footer components
- Set up React Router with Routes and Route components
- Return a single root element containing Header, main content with Routes, and Footer

**BUSINESS-SPECIFIC ROUTES:**
${this.getBusinessSpecificRoutes(businessContext.industry)}

**CORRECT STRUCTURE EXAMPLE:**
\`\`\`tsx
const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          ${this.getBusinessSpecificRouteElements(businessContext.industry)}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
\`\`\`

**CREATIVITY REQUIREMENTS:**
- Match the visual style and tone preferences
- Use appropriate color scheme for the business type
- Create engaging user experience
- Be creative but functional
- Match the business context and industry

**DO NOT DO:**
- Return multiple elements without a wrapper
- Use BrowserRouter (it's already in main.tsx)
- Create adjacent JSX elements at the root level
- Import duplicate modules
- Nest Router components

Return only React code, no markdown headers or explanations.`,
      
      // เพิ่ม prompt สำหรับไฟล์ HTML
      html: `Create valid ${path} for a Vite + React app. Use <!doctype html>, include a <div id="root"></div> and <script type="module" src="/src/main.tsx"></script>. Return pure HTML only, no markdown, no explanations.`,
      
      page: `Create a proper React page component for ${path}. 

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}
- Specific Niche: ${businessContext.specificNiche}
- Target Audience: ${businessContext.targetAudience}
- Business Model: ${businessContext.businessModel}

**USER PREFERENCES:**
- Visual Style: ${userIntent.visualStyle}
- Color Scheme: ${userIntent.colorScheme}
- Layout: ${userIntent.layoutPreference}
- Tone: ${userIntent.tone}
- Target Audience: ${userIntent.targetAudience}

**CRITICAL REQUIREMENTS:**
- Use functional components with TypeScript
- MUST return a SINGLE root JSX element
- Include proper TypeScript interfaces
- Use React Router Link for navigation
- Follow responsive design patterns

**BUSINESS-SPECIFIC CONTENT:**
${this.getBusinessSpecificPageContent(businessContext.industry, path)}

**CORRECT STRUCTURE EXAMPLE:**
\`\`\`tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface PageNameProps {}

const PageName: React.FC<PageNameProps> = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Page Title</h1>
        <p className="text-gray-600">Page content here</p>
        <Link to="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PageName;
\`\`\`

**CREATIVITY REQUIREMENTS:**
- Match user's visual preferences exactly
- Create engaging and appropriate content for the business type
- Use colors and styling that match user intent and business context
- Create content that is specific to the industry and business model

Return only React code, no markdown headers or explanations.`,
      
      component: `Create a proper React functional component for ${path}. 

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}
- Specific Niche: ${businessContext.specificNiche}
- Target Audience: ${businessContext.targetAudience}
- Business Model: ${businessContext.businessModel}

**USER PREFERENCES:**
- Visual Style: ${userIntent.visualStyle}
- Color Scheme: ${userIntent.colorScheme}
- Tone: ${userIntent.tone}
- Target Audience: ${userIntent.targetAudience}

**CRITICAL REQUIREMENTS:**
- Use TypeScript interfaces for props
- MUST return a SINGLE root JSX element
- Include proper prop validation
- Follow React best practices
- Use semantic HTML elements

**BUSINESS-SPECIFIC COMPONENT:**
${this.getBusinessSpecificComponentContent(businessContext.industry, path)}

**CORRECT STRUCTURE EXAMPLE:**
\`\`\`tsx
import React from 'react';

interface ComponentNameProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  title, 
  description, 
  onClick 
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
      {onClick && (
        <button 
          onClick={onClick}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Action
        </button>
      )}
    </div>
  );
};

export default ComponentName;
\`\`\`

**CREATIVITY REQUIREMENTS:**
- Match user's visual preferences
- Create unique and engaging component specific to the business type
- Use appropriate styling and colors for the industry
- Create component that serves the business purpose

Return only React code, no markdown headers or explanations.`,
      
      style: `Create proper ${path} with Tailwind CSS directives and custom styles.

**USER PREFERENCES:**
- Visual Style: ${userIntent.visualStyle}
- Color Scheme: ${userIntent.colorScheme}
- Tone: ${userIntent.tone}

**STYLING REQUIREMENTS:**
- Include base styles, component styles, and utility classes
- Use color scheme that matches user preferences
- Create visual style that matches user intent
- Include responsive design utilities
- Be creative with styling

Return only CSS code, no markdown headers or explanations.`,
      
      util: `Create proper TypeScript utilities and types for ${path}. Include interfaces, type definitions, and utility functions with proper typing. Return only TypeScript code, no markdown headers or explanations.`
    };
    
    // เลือกพรอมป์ตตาม path/ชนิดไฟล์ให้เหมาะสม
    let prompt: string;
    if (path.endsWith('.html')) {
      prompt = prompts.html;
    } else if (path.endsWith('package.json') || path.endsWith('.json')) {
      prompt = prompts.configJson;
    } else if (type === 'config') {
      prompt = prompts.configCode;
    } else {
      // Type-safe mapping without @ts-ignore
      const promptKey = type as keyof typeof prompts;
      if (promptKey in prompts) {
        prompt = prompts[promptKey];
      } else {
        prompt = `Create a proper ${path} file with correct structure and syntax.`;
      }
    }
    
    try {
      const completion = await OpenAIService.makeOpenAIRequestWithRetry({
        model: SITE_GEN_CONFIG.currentModel,
        messages: [
          { 
            role: 'system', 
            content: `You are an expert React developer. Create proper, working React components with:
- Functional components with TypeScript
- Proper imports and exports
- Clean JSX structure
- Proper prop interfaces
- React best practices
- No syntax errors
- Ready to use code

**🚨 CRITICAL JSX STRUCTURE RULES:**
- EVERY React component MUST return a SINGLE root JSX element
- Use <div> or React.Fragment <>...</> as wrapper
- NEVER return multiple adjacent JSX elements
- For App.tsx: DO NOT include BrowserRouter (it's in main.tsx)
- For App.tsx: Wrap Header, main content, and Footer in a single container

**🚨 CRITICAL IMPORT RULES:**
- NEVER import duplicate modules (e.g., Routes, Route twice)
- Use destructured imports: import { Routes, Route } from 'react-router-dom'
- DO NOT import BrowserRouter in App.tsx (only in main.tsx)
- Check for existing imports before adding new ones

**🚨 CRITICAL ROUTER RULES:**
- BrowserRouter should ONLY be in main.tsx
- App.tsx should ONLY contain Routes and Route components
- NEVER nest Router components
- Use proper Route syntax: <Route path="/" element={<Component />} />

**🚨 CRITICAL - REACT ONLY REQUIREMENTS:**
- ONLY generate React/TypeScript code
- NO server-side code (Node.js, Express, etc.)
- NO database queries or SQL
- NO API route handlers
- NO backend logic
- NO server components
- NO Next.js API routes
- NO database schemas
- NO authentication middleware
- NO file system operations
- NO environment variables for backend
- NO server configuration files

**✅ ALLOWED CONTENT:**
- React functional components
- TypeScript interfaces and types
- React hooks (useState, useEffect, etc.)
- React Router components and hooks
- Tailwind CSS classes
- Mock data and interfaces
- Client-side state management
- Frontend utility functions
- CSS/SCSS styles
- Configuration files (package.json, vite.config.ts, etc.)

**⚠️ IMPORTANT:**
- ตอบเฉพาะโค้ดเท่านั้น ไม่ใส่ markdown headers (###, ##, #)
- ไม่ใส่คำอธิบายหรือข้อความอื่นๆ
- ไม่ใส่ code block delimiters
- เริ่มต้นด้วยโค้ดทันที
- สำหรับ JSON files ต้องเป็น valid JSON เท่านั้น` 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: type === 'config' ? 600 : 1200,
        temperature: type === 'config' ? 0.2 : 0.4,
      });
      
      const content = completion.choices[0]?.message?.content || '';
      
      // เพิ่มการตรวจสอบและแก้ไข import paths
      const cleanedContent = OpenAIService.cleanCodeResponse(content);
      const validatedContent = this.validateImportPaths(cleanedContent, path);
      
      // Validate generated code
      const validation = this.validateGeneratedCode(validatedContent, path);
      
      if (!validation.isValid) {
        console.warn(`⚠️ Validation issues for ${path}:`, validation.errors);
        // Continue with generation but log issues
      }
      
      if (validation.warnings.length > 0) {
        console.log(`💡 Validation warnings for ${path}:`, validation.warnings);
      }
      
      return {
        path,
        content: validatedContent,
        type: this.mapFileType(type),
        language: this.getLanguage(path)
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to generate ${path}:`, message);
      console.log('🔄 Falling back to template for', path);
      
      // Enhanced fallback with business context
      return this.createEnhancedTemplateFile(fileConfig, projectStructure, businessContext);
    }
  }

  /**
   * Create enhanced template-based file for fallback with business context
   */
  private static createEnhancedTemplateFile(
    fileConfig: FileConfig,
    projectStructure: ProjectStructure,
    businessContext: BusinessContext
  ): GeneratedFile {
    const { path } = fileConfig;
    const projectName = projectStructure.name || 'Generated Project';
    const businessType = businessContext.industry || 'business';
    
    // Try to create business-specific template first
    const businessTemplate = this.createBusinessSpecificTemplate(path, projectName, businessContext);
    if (businessTemplate) {
      return {
        path,
        content: businessTemplate,
        type: this.mapFileType(fileConfig.type),
        language: this.getLanguage(path)
      };
    }
    
    // Fall back to generic template
    return this.createTemplateFile(fileConfig, projectStructure);
  }

  /**
   * Create business-specific template content
   */
  private static createBusinessSpecificTemplate(
    path: string, 
    projectName: string, 
    businessContext: BusinessContext
  ): string | null {
    const { industry } = businessContext;
    
    // Business-specific page templates
    if (path.endsWith('/Home.tsx')) {
      return this.createBusinessHomePage(projectName, businessContext);
    }
    
    if (path.endsWith('/About.tsx')) {
      return this.createBusinessAboutPage(projectName, businessContext);
    }
    
    if (path.endsWith('/Header.tsx')) {
      return this.createBusinessHeader(projectName, businessContext);
    }
    
    return null; // Use generic template
  }

  /**
   * Create business-specific home page
   */
  private static createBusinessHomePage(projectName: string, businessContext: BusinessContext): string {
    const { industry, specificNiche } = businessContext;
    
    const businessMessages = {
      restaurant: {
        title: 'ยินดีต้อนรับสู่ร้านอาหารของเรา',
        subtitle: 'อิ่มอร่อยกับอาหารรสเลิศที่ปรุงด้วยใจ',
        cta: 'ดูเมนู'
      },
      cafe: {
        title: 'ต้อนรับสู่คาเฟ่ของเรา',
        subtitle: 'เริ่มต้นวันใหม่ด้วยกาแฟหอมกรุ่น',
        cta: 'ดูเมนูกาแฟ'
      },
      fashion: {
        title: 'แฟชั่นล้ำสมัย',
        subtitle: 'สร้างสไตล์ของคุณด้วยแฟชั่นคุณภาพ',
        cta: 'ดูคอลเลกชัน'
      },
      technology: {
        title: 'นวัตกรรมเทคโนโลยี',
        subtitle: 'สร้างอนาคตด้วยเทคโนโลยีที่ทันสมัย',
        cta: 'ดูโปรเจกต์'
      }
    };
    
    const message = businessMessages[industry as keyof typeof businessMessages] || businessMessages.technology;
    
    return `import React from 'react';
import { Link } from 'react-router-dom';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            ${message.title}
          </h1>
          <p className="text-xl mb-8 opacity-90">
            ${message.subtitle}
          </p>
          <div className="space-x-4">
            <Link 
              to="/${industry === 'restaurant' ? 'menu' : industry === 'cafe' ? 'coffee-menu' : industry === 'fashion' ? 'collection' : 'projects'}" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              ${message.cta}
            </Link>
            <Link 
              to="/about" 
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              เรียนรู้เพิ่มเติม
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ทำไมต้องเลือกเรา</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${this.getBusinessFeatures(industry)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;
  }

  /**
   * Get business-specific features
   */
  private static getBusinessFeatures(industry: string): string {
    const features = {
      restaurant: `
            <div className="text-center">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">อาหารคุณภาพ</h3>
              <p className="text-gray-600">วัตถุดิบสดใหม่ทุกวัน</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold mb-2">เชฟมืออาชีพ</h3>
              <p className="text-gray-600">ประสบการณ์กว่า 10 ปี</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold mb-2">บรรยากาศอบอุ่น</h3>
              <p className="text-gray-600">สถานที่สำหรับครอบครัว</p>
            </div>`,
      cafe: `
            <div className="text-center">
              <div className="text-4xl mb-4">☕</div>
              <h3 className="text-xl font-semibold mb-2">กาแฟคุณภาพ</h3>
              <p className="text-gray-600">เมล็ดกาแฟพรีเมี่ยม</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">ลาเต้อาร์ต</h3>
              <p className="text-gray-600">ฝีมือบาริสต้ามืออาชีพ</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">พื้นที่แนะ</h3>
              <p className="text-gray-600">เหมาะสำหรับทำงาน</p>
            </div>`,
      fashion: `
            <div className="text-center">
              <div className="text-4xl mb-4">👗</div>
              <h3 className="text-xl font-semibold mb-2">แฟชั่นล่าสุด</h3>
              <p className="text-gray-600">ทันเทรนด์สไตล์โลก</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">คุณภาพพรีเมี่ยม</h3>
              <p className="text-gray-600">วัสดุคัดสรรพิเศษ</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">สไตล์เฉพาะตัว</h3>
              <p className="text-gray-600">ออกแบบเพื่อคุณ</p>
            </div>`,
      technology: `
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">เทคโนโลยีล่าสุด</h3>
              <p className="text-gray-600">ทันสมัยและมีประสิทธิภาพ</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">โซลูชั่นครบวงจร</h3>
              <p className="text-gray-600">ตอบโจทย์ทุกความต้องการ</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">สนับสนุน 24/7</h3>
              <p className="text-gray-600">ทีมผู้เชี่ยวชาญพร้อมช่วย</p>
            </div>`
    };
    
    return features[industry as keyof typeof features] || features.technology;
  }

  /**
   * Create business-specific about page
   */
  private static createBusinessAboutPage(projectName: string, businessContext: BusinessContext): string {
    const { industry } = businessContext;
    
    return `import React from 'react';
import { Link } from 'react-router-dom';

interface AboutProps {}

const About: React.FC<AboutProps> = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">เกี่ยวกับเรา</h1>
          <p className="text-xl text-gray-600">
            ${this.getBusinessMission(industry)}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">พันธกิจของเรา</h2>
            <p className="text-gray-600 mb-6">
              ${this.getBusinessDescription(industry)}
            </p>
            <Link 
              to="/contact" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ติดต่อเรา
            </Link>
          </div>
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">รูปภาพ ${industry}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;`;
  }

  /**
   * Get business mission statement
   */
  private static getBusinessMission(industry: string): string {
    const missions = {
      restaurant: 'มุ่งมั่นนำเสนออาหารรสเลิศที่สร้างความสุขให้ทุกครอบครัว',
      cafe: 'สร้างพื้นที่แห่งความสุขผ่านกาแฟและบรรยากาศที่อบอุ่น',
      fashion: 'นำเสนอแฟชั่นที่สะท้อนบุคลิกและสร้างความมั่นใจ',
      technology: 'พัฒนาเทคโนโลยีที่ช่วยยกระดับคุณภาพชีวิตของทุกคน'
    };
    
    return missions[industry as keyof typeof missions] || missions.technology;
  }

  /**
   * Get business description
   */
  private static getBusinessDescription(industry: string): string {
    const descriptions = {
      restaurant: 'ด้วยประสบการณ์กว่า 10 ปีในวงการอาหาร เราคัดสรรวัตถุดิบคุณภาพและปรุงแต่งด้วยความใส่ใจในทุกรายละเอียด เพื่อมอบประสบการณ์การรับประทานอาหารที่ดีที่สุดแก่ลูกค้า',
      cafe: 'เราเชื่อว่ากาแฟไม่ใช่เพียงเครื่องดื่ม แต่เป็นสื่อกลางที่เชื่อมโยงผู้คนเข้าด้วยกัน ด้วยเมล็ดกาแฟคุณภาพและฝีมือบาริสต้ามืออาชีพ เราสร้างพื้นที่ที่เอื้อต่อการพักผ่อนและทำงาน',
      fashion: 'แฟชั่นเป็นการแสดงออกถึงตัวตน เราออกแบบและคัดสรรเสื้อผ้าที่ไม่เพียงสวยงาม แต่ยังสะดวกสบายและสะท้อนบุคลิกของผู้สวมใส่ ด้วยวัสดุคุณภาพและการออกแบบที่ใส่ใจในรายละเอียด',
      technology: 'เทคโนโลยีมีพลังในการเปลี่ยนแปลงโลก เราพัฒนาโซลูชั่นที่ไม่เพียงทันสมัย แต่ยังใช้งานง่ายและตอบโจทย์ความต้องการของผู้ใช้งาน พร้อมการสนับสนุนที่ครบวงจร'
    };
    
    return descriptions[industry as keyof typeof descriptions] || descriptions.technology;
  }

  /**
   * Create business-specific header
   */
  private static createBusinessHeader(projectName: string, businessContext: BusinessContext): string {
    const { industry } = businessContext;
    
    const navItems = this.getBusinessNavItems(industry);
    
    return `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              ${projectName}
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            ${navItems}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;`;
  }

  /**
   * Get business-specific navigation items
   */
  private static getBusinessNavItems(industry: string): string {
    const navMaps = {
      restaurant: [
        { path: '/', label: 'หน้าแรก' },
        { path: '/menu', label: 'เมนู' },
        { path: '/reservation', label: 'จองโต๊ะ' },
        { path: '/about', label: 'เกี่ยวกับเรา' },
        { path: '/contact', label: 'ติดต่อ' }
      ],
      cafe: [
        { path: '/', label: 'หน้าแรก' },
        { path: '/coffee-menu', label: 'เมนูกาแฟ' },
        { path: '/barista-profile', label: 'บาริสต้า' },
        { path: '/about', label: 'เกี่ยวกับเรา' },
        { path: '/contact', label: 'ติดต่อ' }
      ],
      fashion: [
        { path: '/', label: 'หน้าแรก' },
        { path: '/collection', label: 'คอลเลกชัน' },
        { path: '/style-guide', label: 'ไกด์สไตล์' },
        { path: '/about', label: 'เกี่ยวกับเรา' },
        { path: '/contact', label: 'ติดต่อ' }
      ],
      technology: [
        { path: '/', label: 'หน้าแรก' },
        { path: '/projects', label: 'โปรเจกต์' },
        { path: '/services', label: 'บริการ' },
        { path: '/about', label: 'เกี่ยวกับเรา' },
        { path: '/contact', label: 'ติดต่อ' }
      ]
    };
    
    const navItems = navMaps[industry as keyof typeof navMaps] || navMaps.technology;
    
    return navItems.map(item => `
            <Link 
              to="${item.path}" 
              className={\`text-gray-600 hover:text-gray-900 transition-colors \${isActive('${item.path}') ? 'text-blue-600 font-medium' : ''}\`}
            >
              ${item.label}
            </Link>`).join('');
  }

  /**
   * Create template-based file for fallback with proper React structure
   */
  private static createTemplateFile(
    fileConfig: FileConfig,
    projectStructure: ProjectStructure
  ): GeneratedFile {
    const { path } = fileConfig;
    const projectName = projectStructure.name || 'Generated Project';
    const businessType = projectStructure.type || 'website';
    
    const templates: Record<string, string> = {
      'package.json': JSON.stringify({
        "name": projectName.toLowerCase().replace(/\s+/g, '-'),
        "version": "1.0.0",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview"
        },
        "dependencies": {
          "react": "18.2.0",
          "react-dom": "18.2.0",
          "react-router-dom": "6.8.1"
        },
        "devDependencies": {
          "@types/react": "18.2.15",
          "@types/react-dom": "18.2.7",
          "@vitejs/plugin-react": "4.0.3",
          "autoprefixer": "10.4.14",
          "postcss": "8.4.27",
          "tailwindcss": "3.3.3",
          "typescript": "5.1.6",
          "vite": "4.4.9"
        }
      }, null, 2),
      
      'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      
      // Entry point template
      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);`,
      
      // App component template
      'src/App.tsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import Services from './pages/Services';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;`,
      
      'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900;
}

h1, h2, h3, h4, h5, h6 {
  @apply font-bold;
}

a {
  @apply text-blue-500 hover:text-blue-700;
}

button {
  @apply bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700;`,
      
      'src/components/Header.tsx': `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              ${projectName}
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={\`text-gray-600 hover:text-gray-900 transition-colors \${isActive('/') ? 'text-blue-600 font-medium' : ''}\`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={\`text-gray-600 hover:text-gray-900 transition-colors \${isActive('/about') ? 'text-blue-600 font-medium' : ''}\`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={\`text-gray-600 hover:text-gray-900 transition-colors \${isActive('/contact') ? 'text-blue-600 font-medium' : ''}\`}
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;`,
      
      'src/components/Footer.tsx': `import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="text-lg font-semibold text-gray-900 mb-4 hover:text-gray-700">
              ${projectName}
            </Link>
            <p className="text-gray-600 mb-4">
              A modern ${businessType} website built with React, TypeScript, and Tailwind CSS.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/" className="hover:text-gray-900">Home</Link></li>
              <li><Link to="/about" className="hover:text-gray-900">About</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Technologies</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Vite</li>
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• React Router</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {currentYear} ${projectName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`,
      
      'src/pages/Home.tsx': `import React from 'react';
import { Link } from 'react-router-dom';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to ${projectName}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your modern ${businessType} website built with React and TypeScript.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/about" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Learn More
            </Link>
            <Link 
              to="/contact" 
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🎨 Modern Features</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✅ React 18 with TypeScript</li>
              <li>✅ Tailwind CSS Styling</li>
              <li>✅ React Router Navigation</li>
              <li>✅ Responsive Design</li>
              <li>✅ Component-Based Architecture</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">🚀 Ready to Deploy</h2>
            <ul className="space-y-2 text-gray-600">
              <li>📡 API Integration Ready</li>
              <li>🔐 Authentication Prepared</li>
              <li>💾 State Management Ready</li>
              <li>📱 Mobile Optimized</li>
              <li>⚡ Fast Performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;`,
      
      'src/pages/About.tsx': `import React from 'react';
import { Link } from 'react-router-dom';

interface AboutProps {}

const About: React.FC<AboutProps> = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
          <p className="text-xl text-gray-600">
            Learn more about our mission and values.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            We are dedicated to creating innovative ${businessType} solutions that help businesses 
            thrive in the digital age. Our team combines technical expertise with 
            creative problem-solving to deliver exceptional user experiences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Innovation</h3>
              <p className="text-sm text-gray-600">Cutting-edge technology solutions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="font-semibold mb-2">Collaboration</h3>
              <p className="text-sm text-gray-600">Working together for success</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-semibold mb-2">Excellence</h3>
              <p className="text-sm text-gray-600">Quality in everything we do</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            to="/contact" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;`,
      
      'src/pages/Contact.tsx': `import React, { useState } from 'react';

interface ContactProps {}

interface FormData {
  name: string;
  email: string;
  message: string;
}

const Contact: React.FC<ContactProps> = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Get in touch with us. We'd love to hear from you!
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your message..."
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;`,
      
      'src/pages/Products.tsx': `import React from 'react';

interface ProductsProps {}

const Products: React.FC<ProductsProps> = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Products</h1>
        <p className="text-gray-600">Our product list will appear here.</p>
      </div>
    </div>
  );
};

export default Products;`,

      'src/pages/Services.tsx': `import React from 'react';

interface ServicesProps {}

const Services: React.FC<ServicesProps> = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Services</h1>
        <p className="text-gray-600">Our service offerings will appear here.</p>
      </div>
    </div>
  );
};

export default Services;`,

      'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    port: 3000
  }
});`,

      'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`,

      'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`
    };
    
    return {
      path,
      content: templates[path] || `// ${path} - Template file with proper React structure`,
      type: this.mapFileType(fileConfig.type),
      language: this.getLanguage(path)
    };
  }

  /**
   * Map string type to GeneratedFile type
   */
  private static mapFileType(type: string): "component" | "page" | "api" | "config" | "style" | "util" {
    const mapping: Record<string, "component" | "page" | "api" | "config" | "style" | "util"> = {
      'config': 'config',
      'page': 'page', 
      'component': 'component',
      'style': 'style',
      'util': 'util',
      'entry': 'page', // entry point เป็น page type
      'app': 'page'    // app component เป็น page type
    };
    return mapping[type] || 'page';
  }

  /**
   * Get language for file extension
   */
  private static getLanguage(path: string): "typescript" | "javascript" | "css" | "html" | "json" | "markdown" {
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.md')) return 'markdown';
    return 'typescript'; // default
  }

  /**
   * Validate and fix import paths in generated content - Simplified version
   */
  private static validateImportPaths(content: string, filePath: string): string {
    // Remove duplicate imports first
    let validatedContent = this.removeDuplicateImports(content);
    
    // Apply specific validation based on file type
    if (filePath === 'src/main.tsx') {
      validatedContent = this.validateMainTsxImports(validatedContent);
    } else if (filePath === 'src/App.tsx') {
      validatedContent = this.validateAppTsxImports(validatedContent);
    } else if (filePath.includes('/pages/')) {
      validatedContent = this.validatePageImports(validatedContent, filePath);
    } else if (filePath.includes('/components/')) {
      validatedContent = this.validateComponentImports(validatedContent, filePath);
    }
    
    return validatedContent;
  }

  /**
   * Validate main.tsx imports
   */
  private static validateMainTsxImports(content: string): string {
    let result = content;
    
    // Ensure essential imports are present
    const requiredImports = [
      { check: 'import React', line: "import React from 'react';" },
      { check: 'import ReactDOM', line: "import ReactDOM from 'react-dom/client';" },
      { check: 'import { BrowserRouter }', line: "import { BrowserRouter } from 'react-router-dom';" },
      { check: 'import App', line: "import App from './App';" },
      { check: "import './index.css'", line: "import './index.css';" }
    ];
    
    // Add missing imports
    for (const { check, line } of requiredImports) {
      if (!result.includes(check)) {
        result = line + '\n' + result;
      }
    }
    
    return result;
  }

  /**
   * Validate App.tsx imports
   */
  private static validateAppTsxImports(content: string): string {
    let result = content;
    
    // Remove BrowserRouter from App.tsx (it should be in main.tsx)
    result = result.replace(/import\s*{\s*[^}]*BrowserRouter[^}]*}\s*from\s*['"]react-router-dom['"];?\s*/g, '');
    result = result.replace(/<BrowserRouter[^>]*>([\s\S]*?)<\/BrowserRouter>/g, '$1');
    
    // Ensure Routes and Route imports
    if (!result.includes('import { Routes, Route }')) {
      result = "import { Routes, Route } from 'react-router-dom';\n" + result;
    }
    
    // Add missing page imports based on Route usage
    const routeComponents = this.extractRouteComponents(result);
    for (const component of routeComponents) {
      if (!result.includes(`import ${component}`) && !['Routes', 'Route'].includes(component)) {
        result = `import ${component} from './pages/${component}';\n` + result;
      }
    }
    
    return result;
  }

  /**
   * Validate page component imports
   */
  private static validatePageImports(content: string, filePath: string): string {
    let result = content;
    const pageName = filePath.split('/').pop()?.replace('.tsx', '') || 'Page';
    
    // Ensure React import
    if (!result.includes('import React')) {
      result = "import React from 'react';\n" + result;
    }
    
    // Add React Router imports if needed
    if (result.includes('Link') && !result.includes('import { Link }')) {
      result = "import { Link } from 'react-router-dom';\n" + result;
    }
    
    // Ensure interface and export
    if (!result.includes(`interface ${pageName}Props`)) {
      result = result.replace(
        /import React from ['"]react['"];?/,
        `import React from 'react';\n\ninterface ${pageName}Props {}\n`
      );
    }
    
    if (!result.includes(`export default ${pageName}`)) {
      result += `\n\nexport default ${pageName};`;
    }
    
    return result;
  }

  /**
   * Validate component imports
   */
  private static validateComponentImports(content: string, filePath: string): string {
    let result = content;
    const componentName = filePath.split('/').pop()?.replace('.tsx', '') || 'Component';
    
    // Ensure React import
    if (!result.includes('import React')) {
      result = "import React from 'react';\n" + result;
    }
    
    // Add React Router imports if needed
    if (result.includes('Link') && !result.includes('import { Link }')) {
      result = "import { Link } from 'react-router-dom';\n" + result;
    }
    
    if (result.includes('useLocation') && !result.includes('import { useLocation }')) {
      result = result.replace(
        /import \{ Link \}/,
        'import { Link, useLocation }'
      );
    }
    
    // Ensure interface and export
    const interfaceName = `${componentName}Props`;
    if (!result.includes(`interface ${interfaceName}`)) {
      result = result.replace(
        /import React from ['"]react['"];?/,
        `import React from 'react';\n\ninterface ${interfaceName} {}\n`
      );
    }
    
    if (!result.includes(`export default ${componentName}`)) {
      result += `\n\nexport default ${componentName};`;
    }
    
    // Footer-specific safety: guard against undefined links when mapping
    if (filePath.endsWith('/Footer.tsx') || filePath === 'src/components/Footer.tsx') {
      result = result.replace(/\{\s*links\.map\(/g, '{ (Array.isArray(links) ? links : []).map(');
    }
    
    return result;
  }

  /**
   * Extract component names from Route elements
   */
  private static extractRouteComponents(content: string): string[] {
    const routeElementRegex = /element=\{<\s*([A-Z][A-Za-z0-9_]*)\b[^>]*>\s*\/?\s*\}/g;
    const components: string[] = [];
    let match;
    
    while ((match = routeElementRegex.exec(content)) !== null) {
      components.push(match[1]);
    }
    
    return [...new Set(components)]; // Remove duplicates
  }

  /**
   * Remove duplicate import statements
   */
  private static removeDuplicateImports(content: string): string {
    const importLines = content.split('\n');
    const uniqueImports: string[] = [];
    const seenImports = new Set<string>();
    
    for (const line of importLines) {
      if (line.trim().startsWith('import')) {
        const importKey = line.trim();
        if (!seenImports.has(importKey)) {
          uniqueImports.push(line);
          seenImports.add(importKey);
        }
      } else {
        uniqueImports.push(line);
      }
    }
    
    return uniqueImports.join('\n');
  }

  /**
   * Enhanced User Intent Analysis
   */
  private static async analyzeUserIntentEnhanced(finalJson: Record<string, unknown>): Promise<UserIntent> {
    const json = finalJson as any;
    
    // วิเคราะห์จาก design preferences
    const designStyle = this.mapDesignStyle(json.design?.designStyle);
    const colorScheme = this.mapColorScheme(json.design?.primaryColors);
    const layoutPreference = this.mapLayoutPreference(json.content?.pages);
    
    // วิเคราะห์จาก target audience
    const targetAudience = json.targetAudience?.primaryAudience || 'general-public';
    const tone = this.mapTone(targetAudience, json.projectObjective?.primaryGoal);
    
    return {
      visualStyle: designStyle,
      colorScheme,
      layoutPreference,
      pages: json.content?.pages || ['home', 'about', 'contact'],
      targetAudience,
      tone
    };
  }
}
