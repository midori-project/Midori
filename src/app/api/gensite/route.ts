import { SITE_GEN_CONFIG } from '../../../utils/site-generator/config';
import { GeneratedFile, ProjectStructure, GenerationOptions, FileConfig } from '../../../utils/site-generator/types';
import { UserIntentAnalyzer } from '../../../utils/site-generator/user-intent-analyzer';
import { OpenAIService } from '../../../utils/site-generator/openai-service';

// เพิ่ม interfaces สำหรับ type safety
interface BusinessContext {
  industry: string;
  specificNiche: string;
  targetAudience: string;
  businessModel: string;
  keyDifferentiators: string[];
}

interface UserIntent {
  visualStyle: string;
  colorScheme: string;
  layoutPreference: string;
  tone: string;
  targetAudience: string;
  pages?: string[];
}

interface CodeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * File Generator - แก้ไขสำหรับ SandPack Compatibility
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
      
      // Critical Navigation validation for Navbar components
      if (componentName === 'Navbar' || filePath.includes('Navbar')) {
        if (content.includes('<a href="#"') || content.includes("<a href='#'")) {
          errors.push('Navbar must use React Router Link, not <a href="#">');
        }
        if (!content.includes('import { Link }') && !content.includes('from "react-router-dom"') && !content.includes("from 'react-router-dom'")) {
          errors.push('Navbar missing React Router Link import');
        }
      }
      
      // Critical Link usage validation
      if (content.includes('<Link to=') && (!content.includes('import { Link }') && !content.includes('from "react-router-dom"') && !content.includes("from 'react-router-dom'"))) {
        errors.push('Missing React Router Link import when using <Link>');
      }
      
      // Critical App.tsx routing validation
      if (componentName === 'App' || filePath.includes('App.tsx')) {
        if (content.includes('<Route path="/" element={<About') && content.includes('import Home from')) {
          errors.push('App.tsx MUST use Home as root page, not About when Home exists');
        }
        if (content.includes('<Route path="/" element={<About') && !content.includes('import About from')) {
          errors.push('App.tsx using About as root but About component not imported');
        }
      }
      
      // Critical Home page validation
      if (componentName === 'Home' || filePath.includes('Home.tsx')) {
        if (!content.includes('import HeroSection from') && !content.includes('from "../components/HeroSection')) {
          errors.push('Home page MUST import HeroSection component');
        }
        if (!content.includes('<HeroSection')) {
          errors.push('Home page MUST use <HeroSection /> component');
        }
      }
      
      // Critical Contact/About pages validation
      if ((componentName === 'Contact' || filePath.includes('Contact.tsx')) || 
          (componentName === 'About' || filePath.includes('About.tsx'))) {
        if (!content.includes('import { Link }') && !content.includes('from "react-router-dom"') && !content.includes("from 'react-router-dom'")) {
          errors.push(`${componentName} page MUST import Link from react-router-dom for navigation`);
        }
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
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Generate ESSENTIAL files only (10-15 files max) - SandPack Optimized
   */
  static async generateEssentialFilesOnly(
    finalJson: Record<string, unknown>,
    projectStructure: ProjectStructure,
    options: GenerationOptions
  ): Promise<GeneratedFile[]> {
    console.log('🎯 Starting ESSENTIAL files generation (SandPack Compatible)');
    const startTime = Date.now();
    
    // วิเคราะห์ business context
    const businessContext = await UserIntentAnalyzer.analyzeBusinessContext(finalJson);
    console.log('🏢 Business Context detected:', businessContext);
    
    // เลือกไฟล์ตาม business context
    const essentialFiles = this.getEssentialFilesByBusinessContext(businessContext, projectStructure);
    
    console.log(`📁 Generating ${essentialFiles.length} essential files for ${businessContext.industry} business`);
    console.log('📋 Files to generate:', essentialFiles.map(f => f.path));
    
    const files: GeneratedFile[] = [];
    
    // Generate files in batches
    const batchSize = 3;
    for (let i = 0; i < essentialFiles.length; i += batchSize) {
      const batch = essentialFiles.slice(i, i + batchSize);

      const batchPromises = batch.map((fileConfig) =>
        this.generateEssentialFile(fileConfig, projectStructure, businessContext, essentialFiles, finalJson).catch((error: unknown) => {
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
      // Core structure (6 files) - ใช้ Tailwind inline ไม่ต้องใช้ PostCSS
      { path: 'package.json', type: 'config' as const },
      { path: 'index.html', type: 'config' as const },
      { path: 'src/main.tsx', type: 'entry' as const },
      { path: 'src/App.tsx', type: 'app' as const },
      { path: 'src/index.css', type: 'style' as const },
      { path: 'vite.config.ts', type: 'config' as const },
    ];

    // Common pages that every website needs
    const commonFiles: FileConfig[] = [
      { path: 'src/pages/About.tsx', type: 'page' as const },
      { path: 'src/pages/Contact.tsx', type: 'page' as const },
      { path: 'src/components/Navbar.tsx', type: 'component' as const },
      { path: 'src/components/Footer.tsx', type: 'component' as const },
      { path: 'src/components/HeroSection.tsx', type: 'component' as const },
      { path: 'src/components/ContactForm.tsx', type: 'component' as const },
    ];

    const businessSpecificFiles = this.getBusinessSpecificFiles(businessContext);
    const utilityFiles: FileConfig[] = [
      { path: 'tailwind.config.js', type: 'config' as const },
      { path: 'src/types/index.ts', type: 'util' as const },
      { path: 'src/lib/utils.ts', type: 'util' as const }
    ];
    
    return [...baseFiles, ...commonFiles, ...businessSpecificFiles, ...utilityFiles];
  }

  /**
   * Get business-specific files based on industry
   */
  private static getBusinessSpecificFiles(businessContext: BusinessContext): FileConfig[] {
    const { industry } = businessContext;
    
    switch (industry) {
      case 'blog':
        return [
          { path: 'src/pages/Home.tsx', type: 'page' as const },
          { path: 'src/pages/Articles.tsx', type: 'page' as const },
          { path: 'src/pages/Article.tsx', type: 'page' as const },
          { path: 'src/pages/Categories.tsx', type: 'page' as const },
          { path: 'src/pages/AdminDashboard.tsx', type: 'page' as const },
          { path: 'src/components/ArticleList.tsx', type: 'component' as const },
          { path: 'src/components/ArticleCard.tsx', type: 'component' as const },
          { path: 'src/components/CommentSection.tsx', type: 'component' as const },
          { path: 'src/components/CategoryList.tsx', type: 'component' as const },
        ];
        
      case 'restaurant':
        return [
          { path: 'src/pages/Home.tsx', type: 'page' as const },
          { path: 'src/pages/Menu.tsx', type: 'page' as const },
          { path: 'src/pages/Reservation.tsx', type: 'page' as const },
          { path: 'src/pages/ChefProfile.tsx', type: 'page' as const },
          { path: 'src/pages/DishGallery.tsx', type: 'page' as const },
          { path: 'src/components/MenuCard.tsx', type: 'component' as const },
          { path: 'src/components/ReservationForm.tsx', type: 'component' as const },
        ];
        
      case 'cafe':
        return [
          { path: 'src/pages/Home.tsx', type: 'page' as const },
          { path: 'src/pages/CoffeeMenu.tsx', type: 'page' as const },
          { path: 'src/pages/BaristaProfile.tsx', type: 'page' as const },
          { path: 'src/pages/OrderTracking.tsx', type: 'page' as const },
          { path: 'src/pages/BeanOrigin.tsx', type: 'page' as const },
          { path: 'src/components/CoffeeCard.tsx', type: 'component' as const },
          { path: 'src/components/OrderStatus.tsx', type: 'component' as const },
        ];
        
      case 'fashion':
        return [
          { path: 'src/pages/Home.tsx', type: 'page' as const },
          { path: 'src/pages/Collection.tsx', type: 'page' as const },
          { path: 'src/pages/ProductDetail.tsx', type: 'page' as const },
          { path: 'src/pages/StyleGuide.tsx', type: 'page' as const },
          { path: 'src/components/ProductCard.tsx', type: 'component' as const },
          { path: 'src/components/SizeGuide.tsx', type: 'component' as const },
        ];
        
      case 'technology':
        return [
          { path: 'src/pages/Home.tsx', type: 'page' as const },
          { path: 'src/pages/Projects.tsx', type: 'page' as const },
          { path: 'src/pages/Services.tsx', type: 'page' as const },
          { path: 'src/pages/Team.tsx', type: 'page' as const },
          { path: 'src/components/ProjectCard.tsx', type: 'component' as const },
        ];
        
      default:
        return [
          { path: 'src/pages/Home.tsx', type: 'page' as const },
          { path: 'src/pages/Products.tsx', type: 'page' as const },
          { path: 'src/pages/Services.tsx', type: 'page' as const },
        ];
    }
  }

  /**
   * Generate a single essential file - SandPack Compatible
   */
  private static async generateEssentialFile(
    fileConfig: FileConfig,
    projectStructure: ProjectStructure,
    businessContext: BusinessContext,
    allFiles: FileConfig[],
    finalJson: Record<string, unknown>
  ): Promise<GeneratedFile> {
    const { path, type } = fileConfig;
    const projectName = projectStructure.name || 'Generated Project';
    
    // เพิ่มข้อมูลจาก finalJson
    const projectInfo = finalJson.project as any;
    const features = finalJson.features as any[];
    const targetAudience = finalJson.targetAudience as string[];
    const dataModel = finalJson.dataModel as any;
    
    console.log('📋 Generating file with finalJson data:', {
      file: path,
      projectType: projectInfo?.type,
      projectGoal: projectInfo?.goal,
      featuresCount: features?.length || 0
    });
    
    // เพิ่ม User Intent Analysis
    const userIntent = await UserIntentAnalyzer.analyzeUserIntent(projectStructure as any) as UserIntent;
    
    // 🚨 สำคัญ: สำหรับ App.tsx ต้องรู้ว่าจะสร้างไฟล์หน้าไหนบ้าง
    let prompt: string;
    
    if (path === 'src/App.tsx') {
      const pageFiles = allFiles.filter(f => f.type === 'page' && f.path !== 'src/App.tsx');
      const pageImports = pageFiles.map(f => {
        const pageName = f.path.split('/').pop()?.replace('.tsx', '') || '';
        return { name: pageName, path: f.path };
      });
      
      prompt = `Create a proper React App component for ${path}. 

**🚨 CRITICAL - SANDPACK COMPATIBILITY:**
- Use .tsx extension in ALL import paths
- ONLY import pages that exist in the file list below
- Use exact file paths as shown

**AVAILABLE PAGE IMPORTS:**
${pageImports.map(p => `import ${p.name} from './${p.path.replace('src/', '').replace('.tsx', '')}.tsx';`).join('\n')}

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}
- Target Audience: ${businessContext.targetAudience}

**🚨 CRITICAL ROUTING LOGIC:**
- Available pages: ${pageImports.map(p => p.name).join(', ')}
- Home page found: ${pageImports.find(p => p.name === 'Home') ? 'YES' : 'NO'}
- Root page MUST be: ${pageImports.find(p => p.name === 'Home')?.name || pageImports[0]?.name || 'About'}
- NEVER use About as root if Home exists!

**REQUIRED STRUCTURE:**
\`\`\`tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
${pageImports.map(p => `import ${p.name} from './${p.path.replace('src/', '').replace('.tsx', '')}.tsx';`).join('\n')}

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<${pageImports.find(p => p.name === 'Home')?.name || pageImports[0]?.name || 'About'} />} />
${pageImports.filter(p => p.name !== (pageImports.find(p => p.name === 'Home')?.name || pageImports[0]?.name)).map(p => {
  const routePath = p.name.toLowerCase().replace('profile', '-profile').replace('gallery', '-gallery').replace('menu', 'menu').replace('tracking', '-tracking').replace('origin', '-origin');
  return `          <Route path="/${routePath}" element={<${p.name} />} />`;
}).join('\n')}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
\`\`\`

Return only React code, no markdown headers or explanations.`;
    } else if (path.endsWith('.json')) {
      prompt = `Create a proper ${path} file for SandPack Vite React project with Tailwind CSS support.

**SANDPACK COMPATIBILITY REQUIREMENTS:**
- Use exact dependency versions (no ^ or ~ prefixes)
- Put in dependencies section: react, react-dom, react-router-dom
- Put in devDependencies section: tailwindcss, @types/react, @types/react-dom, typescript, @vitejs/plugin-react, vite
- Exact versions to use:
  Dependencies: react: "18.2.0", react-dom: "18.2.0", react-router-dom: "6.8.1"
  DevDependencies: @types/react: "18.2.15", @types/react-dom: "18.2.7", typescript: "5.1.6", tailwindcss: "3.3.3", @vitejs/plugin-react: "4.0.3", vite: "4.4.9"
- Use "type": "module" for ES modules
- Include scripts: dev, build (with tsc), preview

Return only valid JSON code, no markdown headers or explanations.`;
    } else if (path.endsWith('.html')) {
      prompt = `Create valid ${path} for a Vite + React app. Use <!doctype html>, include a <div id="root"></div> and <script type="module" src="/src/main.tsx"></script>. Return pure HTML only, no markdown, no explanations.`;
    } else if (type === 'entry') {
      prompt = `Create a proper React entry point for ${path}. 

**CRITICAL REQUIREMENTS:**
- Import ReactDOM from 'react-dom/client'
- Import BrowserRouter from 'react-router-dom'
- Import App component from './App.tsx'
- Import CSS: import './index.css'
- Use ReactDOM.createRoot for React 18
- Wrap App in React.StrictMode and BrowserRouter

Return only React code, no markdown headers or explanations.`;
    } else if (type === 'component') {
      const componentRequirements = this.getComponentSpecificRequirements(path, projectInfo, features, dataModel);
      
      prompt = `Create a proper React functional component for ${path}. 

**PROJECT CONTEXT:**
- Project: ${projectInfo?.name || projectName} (${projectInfo?.type || 'Website'})
- Goal: ${projectInfo?.goal || 'Create a functional website'}
- Features: ${features?.map(f => f.name || f.id).join(', ') || 'Basic features'}

**TARGET AUDIENCE:**
${targetAudience?.join(', ') || businessContext.targetAudience}

**COMPONENT-SPECIFIC REQUIREMENTS:**
${componentRequirements}

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}
- Target Audience: ${businessContext.targetAudience}

**🎨 TAILWIND CSS STYLING REQUIREMENTS:**
- EVERY element MUST have Tailwind CSS classes defined inline
- NO external CSS files or stylesheets
- Use comprehensive Tailwind classes for: padding, margin, colors, typography, layout, effects
- Apply responsive design classes (sm:, md:, lg:, xl:)
- Use hover: and focus: states where appropriate
- Include proper spacing, colors, and visual hierarchy

**STYLING EXAMPLES:**
- Navbar: className="bg-white shadow-lg px-6 py-4 border-b sticky top-0 z-50"
- Navigation: className="flex space-x-6 text-gray-700 hover:text-blue-600 transition-colors"
- Buttons: className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
- Cards: className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
- Text: className="text-2xl font-bold text-gray-900 mb-4"
- Forms: className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

**SANDPACK REQUIREMENTS:**
- Use .tsx extensions in imports
- Create self-contained components WITHOUT required props
- Use default values, constants, or hard-coded content when needed
- Return SINGLE root JSX element
- Component should work without receiving props from parent
- Do NOT include h1 tags if this is Navbar component (avoid duplicate welcome messages)

**IMPORTANT: DO NOT use required props - make components standalone**

Return only React code with Tailwind classes applied to ALL elements, no markdown headers or explanations.`;
    } else if (type === 'page') {
      const pageRequirements = this.getPageSpecificRequirements(path, projectInfo, features, dataModel);
      
      prompt = `Create a proper React page component for ${path}. 

**PROJECT CONTEXT:**
- Project: ${projectInfo?.name || projectName} (${projectInfo?.type || 'Website'})
- Goal: ${projectInfo?.goal || 'Create a functional website'}
- Features: ${features?.map(f => f.name || f.id).join(', ') || 'Basic features'}

**TARGET AUDIENCE:**
${targetAudience?.join(', ') || businessContext.targetAudience}

**PAGE-SPECIFIC REQUIREMENTS:**
${pageRequirements}

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}
- Target Audience: ${businessContext.targetAudience}

**🎨 TAILWIND CSS STYLING REQUIREMENTS:**
- EVERY element MUST have Tailwind CSS classes defined inline
- NO external CSS files or stylesheets  
- Use comprehensive Tailwind classes for: layout, typography, colors, spacing, effects
- Apply responsive design classes (sm:, md:, lg:, xl:)
- Use hover: and focus: states for interactive elements
- Create visually appealing layouts with proper spacing and hierarchy

**STYLING GUIDELINES:**
- Page containers: className="min-h-screen bg-gray-50 py-12"
- Sections: className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
- Headings: className="text-4xl font-bold text-gray-900 mb-6"
- Subheadings: className="text-2xl font-semibold text-gray-800 mb-4"
- Paragraphs: className="text-lg text-gray-600 mb-4 leading-relaxed"
- Buttons/Links: className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
- Cards/Boxes: className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
- Grid layouts: className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
- Images: className="w-full h-64 object-cover rounded-lg"

**REQUIREMENTS:**
- Use functional components with TypeScript
- Create self-contained pages WITHOUT required props
- Use default values or hard-coded content when needed
- Return SINGLE root JSX element
- Use React Router Link for navigation with proper Tailwind styling
- Page should work without receiving props from parent

**IMPORTANT: DO NOT use required props - make pages standalone**

Return only React code with Tailwind classes applied to ALL elements, no markdown headers or explanations.`;
    } else if (type === 'style') {
      prompt = `Create proper ${path} for Tailwind CSS inline mode (no @tailwind directives needed).

**USER PREFERENCES:**
- Visual Style: ${userIntent.visualStyle}
- Color Scheme: ${userIntent.colorScheme}

**REQUIREMENTS:**
- Use regular CSS, no @tailwind directives
- Include basic reset and typography styles
- Keep it minimal for SandPack compatibility

Return only CSS code, no markdown headers or explanations.`;
    } else if (type === 'config') {
      prompt = `Create a proper ${path} for a Vite + React + TypeScript project with Tailwind CSS inline support.

**SANDPACK COMPATIBILITY:**
- Simple configuration that works in browser environment
- No PostCSS configuration needed (Tailwind inline mode)
- Include essential plugins only
- Use ES module syntax

Return JavaScript/TypeScript code (not JSON), no markdown headers or explanations.`;
    } else {
      prompt = `Create proper TypeScript utilities and types for ${path}. Include interfaces, type definitions, and utility functions with proper typing. Return only TypeScript code, no markdown headers or explanations.`;
    }
    
    try {
      const completion = await OpenAIService.makeOpenAIRequestWithRetry({
        model: SITE_GEN_CONFIG.currentModel,
        messages: [
          { 
            role: 'system', 
            content: `You are an expert React developer creating SandPack-compatible code with comprehensive Tailwind CSS styling. 

**🚨 CRITICAL SANDPACK RULES:**
- ALL import paths MUST include .tsx/.ts/.js extensions
- Use relative paths: './components/Navbar.tsx' not './components/Navbar'
- NEVER import duplicate modules
- Every React component MUST return a SINGLE root JSX element
- Use <div> or React.Fragment as wrapper if needed
- No server-side code, only React/TypeScript

**🚨 CRITICAL REACT REQUIREMENTS:**
- ALWAYS import React: import React from 'react';
- Use React.FC type for functional components
- Ensure all JSX uses proper React syntax
- Include all necessary imports at the top of the file
- For ReactDOM operations, include proper null checks

**🎨 TAILWIND CSS REQUIREMENTS:**
- EVERY single HTML element MUST have Tailwind CSS classes
- NO inline styles, NO external CSS, ONLY Tailwind classes
- Use comprehensive class combinations for complete styling
- Apply responsive design (sm:, md:, lg:, xl:)
- Include hover:, focus:, and transition effects
- Use proper spacing (p-, m-, gap-), typography (text-, font-), colors (bg-, text-), and layout (flex, grid)

**✅ CORRECT REACT EXAMPLES:**
- import React from 'react';
- const Component: React.FC = () => { return <div>...</div>; };
- const root = ReactDOM.createRoot(rootElement!);

**✅ CORRECT STYLING EXAMPLES:**
- <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
- <h1 className="text-4xl font-bold text-gray-900 mb-6">
- <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
- <nav className="flex space-x-6 items-center">
- <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">

**✅ CORRECT IMPORT EXAMPLES:**
- import React from 'react';
- import ReactDOM from 'react-dom/client';
- import Navbar from './components/Navbar.tsx';
- import { Routes, Route, Link } from 'react-router-dom';

**🚨 CRITICAL NAVIGATION REQUIREMENTS:**
- ALWAYS use React Router Link for internal navigation: import { Link } from 'react-router-dom';
- NEVER use <a href="#"> for internal links
- Use <Link to="/path"> instead of <a href="/path">
- For navigation components (Navbar), ALWAYS import and use Link

**📝 CONFIG FILE REQUIREMENTS:**
For vite.config.ts:
- Use import { defineConfig } from 'vite';
- Use import react from '@vitejs/plugin-react';
- NO require() statements in ES modules

For tailwind.config.js:
- Must be proper Tailwind configuration
- Use export default with content, theme, plugins

**❌ WRONG EXAMPLES:**
- Missing import React from 'react'
- <React.StrictMode> without importing React
- require('@vitejs/plugin-react-refresh') in ES modules
- Wrong config content in tailwind.config.js
- <div style={{background: 'white'}}> (NO inline styles)
- <div> (NO unstyled elements)
- import Navbar from './components/Navbar'; (missing .tsx)
- <a href="#"> for internal navigation (USE <Link to="/path">)
- <a href="/page"> for React Router navigation (USE <Link to="/page">)
- Missing Link import when using navigation

Return ONLY code with complete imports and Tailwind styling, no explanations, no markdown blocks.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: type === 'config' ? 0.2 : 0.4,
      });
      
      const content = completion.choices[0]?.message?.content || '';
      const cleanedContent = OpenAIService.cleanCodeResponse(content);
      
      // Validate generated code
      const validation = this.validateGeneratedCode(cleanedContent, path);
      
      if (!validation.isValid) {
        console.warn(`⚠️ Validation failed for ${path}:`, validation.errors);
        console.log('🔄 Using template fallback due to validation failure');
        
        // Use template fallback when validation fails
        return this.createTemplateFile(fileConfig, projectStructure, businessContext, allFiles);
      }
      
      return {
        path,
        content: cleanedContent,
        type: this.mapFileType(type),
        language: this.getLanguage(path)
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to generate ${path}:`, message);
      console.log('🔄 Falling back to template for', path);
      
      // Enhanced fallback with business context
      return this.createTemplateFile(fileConfig, projectStructure, businessContext, allFiles);
    }
  }

  /**
   * Create template-based file for fallback - SandPack Compatible
   */
  private static createTemplateFile(
    fileConfig: FileConfig,
    projectStructure: ProjectStructure,
    businessContext: BusinessContext,
    allFiles: FileConfig[]
  ): GeneratedFile {
    const { path } = fileConfig;
    const projectName = projectStructure.name || 'Generated Project';
    
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
      
      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
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
      
      'src/App.tsx': (() => {
        const pageFiles = allFiles.filter(f => f.type === 'page' && f.path !== 'src/App.tsx');
        const pageImports = pageFiles.map(f => {
          const pageName = f.path.split('/').pop()?.replace('.tsx', '') || '';
          return { name: pageName, path: f.path };
        });
        
        // Find Home page or use first page as fallback
        const homePage = pageImports.find(p => p.name === 'Home');
        const rootPage = homePage ? 'Home' : (pageImports[0]?.name || 'About');
        
        return `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
${pageImports.map(p => `import ${p.name} from './${p.path.replace('src/', '').replace('.tsx', '')}.tsx';`).join('\n')}

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<${rootPage} />} />
${pageImports.filter(p => p.name !== rootPage).map(p => {
  const routePath = p.name.toLowerCase().replace('profile', '-profile').replace('gallery', '-gallery').replace('menu', 'menu').replace('tracking', '-tracking').replace('origin', '-origin');
  return `          <Route path="/${routePath}" element={<${p.name} />} />`;
}).join('\n')}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;`;
      })(),
      
      'src/index.css': `/* Tailwind CSS Inline Mode - ไม่ต้องใช้ @tailwind directives */

/* Base styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
  color: #111827;
}

* {
  box-sizing: border-box;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`,
      
      // เพิ่ม template ที่สมบูรณ์สำหรับไฟล์ที่ขาดหายไป
      'src/pages/Home.tsx': `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">ยินดีต้อนรับสู่ ${projectName}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">คุณสมบัติหลัก</h3>
              <p className="text-gray-600">ค้นพบคุณสมบัติที่น่าสนใจของเว็บไซต์เรา</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">บริการของเรา</h3>
              <p className="text-gray-600">บริการคุณภาพที่ตอบสนองความต้องการของคุณ</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ติดต่อเรา</h3>
              <p className="text-gray-600">พร้อมให้บริการและตอบคำถามของคุณ</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`,
      
      'src/pages/Contact.tsx': `import React from 'react';
import ContactForm from '../components/ContactForm.tsx';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">ติดต่อเรา</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          เราพร้อมรับฟังความคิดเห็นและคำแนะนำจากคุณ
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">ข้อมูลติดต่อ</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">contact@${projectName.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">+66 2 123 4567</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">กรุงเทพมหานคร, ประเทศไทย</span>
              </div>
            </div>
          </div>
          
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;`,

      'src/components/Navbar.tsx': `import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand/Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              ${projectName}
            </Link>
          </div>
          
          {/* Navigation Links - แสดงตลอดเวลา */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              หน้าแรก
            </Link>
            <Link to="/articles" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              บทความ
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              หมวดหมู่
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              เกี่ยวกับ
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              ติดต่อ
            </Link>
          </div>
          
          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="ค้นหา..." 
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              ค้นหา
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;`,
      
      'src/components/Footer.tsx': `import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="text-lg font-semibold text-gray-900 mb-4 hover:text-gray-700">
              ${projectName}
            </Link>
            <p className="text-gray-600 mb-4">
              เว็บไซต์สมัยใหม่ที่สร้างด้วย React และ TypeScript
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">เมนูด่วน</h4>
            <ul className="space-y-2 text-gray-600">
              <li><Link to="/" className="hover:text-gray-900">หน้าแรก</Link></li>
              <li><Link to="/about" className="hover:text-gray-900">เกี่ยวกับเรา</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900">ติดต่อ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">เทคโนโลยี</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
              <li>• Vite</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {currentYear} ${projectName}. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`,

      'src/components/HeroSection.tsx': `import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col justify-center items-center text-center p-6">
      <h2 className="text-5xl font-bold text-white mb-4">ยินดีต้อนรับสู่ ${projectName}</h2>
      <p className="text-lg text-white mb-6">เว็บไซต์สมัยใหม่ที่สร้างด้วยเทคโนโลยีล่าสุด</p>
      <button className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium mb-6">
        เริ่มต้นใช้งาน
      </button>
      <input 
        type="text" 
        placeholder="ค้นหา..." 
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-4"
      />
      <div className="text-white">
        <p className="text-sm">คุณสมบัติหลัก: 120+</p>
        <p className="text-sm">ผู้ใช้งาน: 1,500+</p>
      </div>
    </div>
  );
};

export default HeroSection;`,

      'src/components/ContactForm.tsx': `import React from 'react';

const ContactForm: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">ส่งข้อความถึงเรา</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">ชื่อ</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="text"
            id="name"
            placeholder="ชื่อของคุณ"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">อีเมล</label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="email"
            id="email"
            placeholder="อีเมลของคุณ"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">ข้อความ</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="message"
            rows={4}
            placeholder="ข้อความของคุณ"
            required
          ></textarea>
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          type="submit"
        >
          ส่งข้อความ
        </button>
      </form>
    </div>
  );
};

export default ContactForm;`,

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

      // เพิ่ม template สำหรับไฟล์อื่นๆ ที่อาจขาดหายไป
      'src/types/index.ts': `import { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
}

export type ApiResponse<T> = {
  data: T;
  error?: string;
};

export type Nullable<T> = T | null;

export type ChildrenProps = {
  children: ReactNode;
};

export const isNull = <T>(value: T): value is null => {
  return value === null;
};

export const isDefined = <T>(value: T): value is Exclude<T, undefined> => {
  return typeof value !== 'undefined';
};`,

      'src/lib/utils.ts': `import { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export type Nullable<T> = T | null;

export function isEmpty<T>(value: T): boolean {
  return value === null || value === undefined || (Array.isArray(value) && value.length === 0);
}

export function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => ({
      data,
      message: 'Fetch successful',
      status: 200,
    }));
}

export function renderWithFallback<T>(node: ReactNode, fallback: ReactNode): ReactNode {
  return isEmpty(node) ? fallback : node;
}`,

    };
    
    // ตรวจสอบว่ามี template หรือไม่ ถ้าไม่มีให้สร้าง template ที่สมบูรณ์
    if (templates[path]) {
      return {
        path,
        content: templates[path],
        type: this.mapFileType(fileConfig.type),
        language: this.getLanguage(path)
      };
    }
    
    // สร้าง template ที่สมบูรณ์สำหรับไฟล์ที่ไม่มี template
    const fileName = path.split('/').pop()?.replace('.tsx', '').replace('.ts', '').replace('.js', '').replace('.jsx', '') || '';
    const fileType = this.getLanguage(path);
    
    let fallbackContent = '';
    
    if (fileType === 'typescript' && path.includes('.tsx')) {
      // React component template
      fallbackContent = `import React from 'react';

const ${fileName}: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">${fileName}</h1>
        <p className="text-lg text-gray-600 mb-4">
          เนื้อหาของหน้า ${fileName} จะแสดงที่นี่
        </p>
      </div>
    </div>
  );
};

export default ${fileName};`;
    } else if (fileType === 'typescript' && path.includes('.ts')) {
      // TypeScript utility template
      fallbackContent = `// ${fileName} utility functions

export interface ${fileName}Config {
  // Add configuration interface here
}

export function create${fileName}(): void {
  // Add implementation here
}

export default {
  create${fileName}
};`;
    } else if (fileType === 'javascript') {
      // JavaScript template
      fallbackContent = `// ${fileName} JavaScript module

export function ${fileName}() {
  // Add implementation here
}

export default ${fileName};`;
    } else if (fileType === 'css') {
      // CSS template
      fallbackContent = `/* ${fileName} styles */

.${fileName.toLowerCase()} {
  /* Add styles here */
}`;
    } else {
      // Default template
      fallbackContent = `// ${fileName} - Generated file`;
    }
    
    return {
      path,
      content: fallbackContent,
      type: this.mapFileType(fileConfig.type),
      language: this.getLanguage(path)
    };
  }

  /**
   * Get component-specific requirements based on project info and finalJson
   */
  private static getComponentSpecificRequirements(
    path: string, 
    projectInfo: any, 
    features: any[], 
    dataModel: any
  ): string {
    const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
    const projectType = projectInfo?.type?.toLowerCase() || '';
    const projectGoal = projectInfo?.goal || '';
    
    // Blog-specific components
    if (projectType.includes('blog') || projectGoal.includes('บทความ')) {
      if (fileName.includes('Article') && fileName.includes('List')) {
        return `
- Create article listing component with title, excerpt, author, date, category
- Include pagination and filtering capabilities
- Add read more buttons and category tags
- Use responsive grid layout for article cards
- Include search functionality if search feature exists`;
      }
      
      if (fileName.includes('Article') && !fileName.includes('List')) {
        return `
- Create single article display with title, full content, author info, publication date
- Include category and tag display
- Add social sharing buttons
- Include related articles section
- Support markdown rendering if editor feature exists`;
      }
      
      if (fileName.includes('Comment')) {
        return `
- Create comment section with comment display, reply functionality
- Include user avatars, timestamps, nested replies
- Add comment submission form with validation
- Include moderation features for admin users
- Support real-time updates if applicable`;
      }
      
      if (fileName.includes('Category')) {
        return `
- Create category listing and management component
- Include category descriptions and article counts
- Add category creation/editing forms for admin
- Include hierarchical category support
- Show related categories and tags`;
      }
      
      if (fileName.includes('Admin') || fileName.includes('Dashboard')) {
        return `
- Create admin dashboard with statistics (total articles, comments, users)
- Include CRUD operations for articles, categories, tags
- Add user management interface with role assignments
- Include content moderation tools
- Add analytics and reporting features`;
      }
      
      // Header removed - use Navbar instead
    }
    
    // Default for other project types - REMOVED Header, use Navbar instead
    
    if (fileName.includes('Footer')) {
      return `- Create footer with links, contact info, and branding appropriate for ${projectType}`;
    }
    
    if (fileName.includes('Navbar')) {
      if (projectType.includes('blog') || projectGoal.includes('บทความ')) {
        return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Create sticky responsive navigation bar for blog website with modern design
- Include navigation items using Link components: หน้าแรก, บทความ, หมวดหมู่, เกี่ยวกับ, ติดต่อ
- Use <Link to="/"> for Home, <Link to="/articles"> for Articles, etc.
- NEVER use <a href="#"> - ALWAYS use <Link to="/path">
- Add search functionality with search icon that opens search modal
- Include user authentication menu (เข้าสู่ระบบ/ลงทะเบียน/โปรไฟล์)
- Add admin dashboard link for authorized users using <Link to="/admin">
- Implement mobile-responsive hamburger menu with smooth animations
- Style with Tailwind: sticky top-0 z-50, white background, shadow-md
- Include brand/logo section with project name: "${projectInfo?.name || 'BlogEase'}"
- Add hover effects, active states, and smooth transitions for all menu items`;
      }
      
      return `
- CRITICAL: Import React Router Link: import { Link } from 'react-router-dom';
- Create sticky responsive navigation bar for ${projectType} website
- Include main navigation items using Link components appropriate for the business type
- Use <Link to="/path"> for ALL internal navigation - NEVER <a href="#">
- Add brand/logo section with project name: "${projectInfo?.name || 'Website'}"
- Implement mobile-responsive hamburger menu with smooth animations
- Style with Tailwind CSS: sticky top-0 z-50, proper spacing, modern design
- Add hover effects, active states, and transitions
- Include CTA button or search functionality if relevant to business`;
    }
    
    if (fileName.includes('HeroSection')) {
      if (projectType.includes('blog') || projectGoal.includes('บทความ')) {
        return `
- Create impressive hero section as the main focal point of the homepage
- Include large compelling headline about the blog's purpose
- Add descriptive subtitle explaining what visitors can expect
- Include prominent CTA button (เริ่มอ่าน/สำรวจบทความ) linking to articles page
- Add search bar for finding articles quickly
- Use attractive background (gradient, image, or modern pattern)
- Style with Tailwind: min-h-screen or min-h-[80vh], centered content, responsive
- Include statistics if available (total articles, subscribers, etc.)
- Add subtle animations or effects to make it engaging`;
      }
      
      return `
- Create impressive hero section as the main focal point of the homepage
- Include large compelling headline related to the business goal: "${projectGoal}"
- Add descriptive subtitle explaining the value proposition
- Include prominent CTA button relevant to the business type
- Use attractive modern design with background styling
- Style with Tailwind: min-h-screen or min-h-[80vh], centered content, responsive
- Add engaging visual elements appropriate for ${projectType}
- Include key business highlights or features if applicable`;
    }
    
    return `- Create ${fileName} component that supports the project goal: "${projectGoal}"`;
  }

  /**
   * Get page-specific requirements based on project info and finalJson
   */
  private static getPageSpecificRequirements(
    path: string, 
    projectInfo: any, 
    features: any[], 
    dataModel: any
  ): string {
    const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
    const projectType = projectInfo?.type?.toLowerCase() || '';
    const projectGoal = projectInfo?.goal || '';
    
    // Blog-specific pages
    if (projectType.includes('blog') || projectGoal.includes('บทความ')) {
      if (fileName.toLowerCase().includes('home')) {
        return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Create stunning blog homepage with Hero Section as the main attraction
- Start with <HeroSection /> component as the FIRST element in the page
- Include featured/recent articles section with beautiful card layouts
- Add categories showcase with visual icons and descriptions
- Include newsletter subscription section with attractive design
- Add author spotlight or team introduction section
- Include site statistics or achievements section
- Use modern layout with proper spacing and visual hierarchy
- Implement responsive design for all devices
- Add smooth scrolling and subtle animations for engagement`;
      }
      
      if (fileName.toLowerCase().includes('article') && fileName.toLowerCase().includes('s')) {
        return `
- Create article listing page with comprehensive article grid/list
- Include advanced search and filtering (by category, tag, author, date)
- Add pagination with page numbers and load more options
- Include sorting options (newest, popular, most commented)
- Show article preview cards with title, excerpt, author, date, category
- Add breadcrumb navigation`;
      }
      
      if (fileName.toLowerCase().includes('article') && !fileName.toLowerCase().includes('s')) {
        return `
- Create single article page with full article content display
- Include article metadata (author, date, category, tags, reading time)
- Add social sharing buttons and bookmark functionality
- Include comment section with submission form
- Show related articles and category navigation
- Add print-friendly formatting`;
      }
      
      if (fileName.toLowerCase().includes('categor')) {
        return `
- Create category listing and browsing page
- Display all categories with descriptions and article counts
- Include articles filtered by selected category
- Add subcategory navigation if hierarchical categories exist
- Include category-specific search and filtering
- Show related tags for each category`;
      }
      
      if (fileName.toLowerCase().includes('admin') || fileName.toLowerCase().includes('dashboard')) {
        return `
- Create comprehensive admin dashboard with overview statistics
- Include article management (create, edit, delete, publish/unpublish)
- Add user management with role assignments (Reader, Writer, Editor, Admin)
- Include category and tag management interfaces
- Add comment moderation tools and spam detection
- Include site settings and theme customization options
- Add analytics dashboard with visitor stats and popular content`;
      }
      
      if (fileName.toLowerCase().includes('contact')) {
        return `
- Create contact page with contact form (name, email, subject, message)
- Include site admin contact information
- Add social media links and newsletter subscription
- Include FAQ section for common blogging questions
- Add submission success/error handling`;
      }
      
      if (fileName.toLowerCase().includes('about')) {
        return `
- Create about page describing the blog's purpose and mission
- Include information about the blogging platform and its features
- Add author/team information and bios
- Include blog statistics and achievements
- Add contact information and social media links`;
      }
    }
    
    // Default home page for other business types
    if (fileName.toLowerCase().includes('home')) {
      return `
- CRITICAL: Import HeroSection: import HeroSection from '../components/HeroSection.tsx';
- Create impressive homepage with Hero Section as the main focal point
- Start with <HeroSection /> component as the FIRST element in the page
- Include key business sections that highlight main services/products
- Add testimonials or social proof section
- Include call-to-action sections strategically placed
- Add about us preview or team introduction
- Include contact information or location if applicable
- Use modern responsive design with excellent visual hierarchy
- Implement smooth user experience with proper navigation flow`;
    }
    
    // Default for other project types
    return `- Create ${fileName} page that fulfills the project goal: "${projectGoal}" for ${projectType}`;
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
      'entry': 'page',
      'app': 'page'
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
    return 'typescript';
  }
}

// API Route Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { finalJson, projectId, options } = body;
    
    if (!finalJson) {
      return Response.json(
        { error: 'finalJson is required' },
        { status: 400 }
      );
    }
    
    console.log('🚀 Starting site generation for project:', projectId);
    console.log('📋 Final JSON:', finalJson);
    
    // เรียกใช้ SiteGeneratorService
    const { SiteGeneratorService } = await import('../../../utils/site-generator');
    const result = await SiteGeneratorService.generateSite(finalJson, options);
    
    console.log('✅ Site generation completed');
    console.log('📁 Generated files:', result.files.length);
    
    return Response.json({
      success: true,
      message: 'Site generated successfully',
      data: {
        files: result.files,
        projectStructure: result.projectStructure,
        fileCount: result.files.length
      }
    });
    
  } catch (error) {
    console.error('❌ Site generation failed:', error);
    
    return Response.json(
      { 
        success: false,
        error: 'Site generation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}