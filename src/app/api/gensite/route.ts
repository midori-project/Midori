import { SITE_GEN_CONFIG } from '../../../utils/site-generator/config';
import { GeneratedFile, ProjectStructure, GenerationOptions, FileConfig } from '../../../utils/site-generator/types';
import { UserIntentAnalyzer } from '../../../utils/site-generator/user-intent-analyzer';
import { OpenAIService } from '../../../utils/site-generator/openai-service';
import { getBusinessHandler } from './business';

// เพิ่ม interfaces สำหรับ type safety
interface BusinessContext {
  industry: string;
  specificNiche: string;
  businessModel: string;
  keyDifferentiators: string[];
}

interface UserIntent {
  visualStyle: string;
  colorScheme: string;
  layoutPreference: string;
  tone: string;
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
    const handler = getBusinessHandler(businessContext.industry);
    const essentialFiles = handler.getEssentialFiles(projectStructure as any);
    
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
  // getEssentialFilesByBusinessContext ถูกแทนที่ด้วย handler.getEssentialFiles

  /**
   * Get business-specific files based on industry
   */
  // getBusinessSpecificFiles ถูกแทนที่ด้วย handler.getEssentialFiles

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
    
    const dataModel = finalJson.dataModel as any;
    
    console.log('📋 Generating file with finalJson data:', {
      file: path,
      projectType: projectInfo?.type,
      projectGoal: projectInfo?.goal,
      featuresCount: features?.length || 0
    });
    
    // เพิ่ม User Intent Analysis
    const userIntent = await UserIntentAnalyzer.analyzeUserIntent(finalJson) as UserIntent;
    
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
- Target Audience: 

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
      const componentRequirements = getBusinessHandler(businessContext.industry).getComponentRequirements(path, finalJson as any, projectStructure as any, businessContext);
      
      prompt = `Create a proper React functional component for ${path}. 

**PROJECT CONTEXT:**
- Project: ${projectInfo?.name || projectName} (${projectInfo?.type || 'Website'})
- Goal: ${projectInfo?.goal || 'Create a functional website'}
- Features: ${features?.map(f => f.name || f.id).join(', ') || 'Basic features'}

**TARGET AUDIENCE:**


**COMPONENT-SPECIFIC REQUIREMENTS:**
${componentRequirements}

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}
- Target Audience: 


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
      const pageRequirements = getBusinessHandler(businessContext.industry).getPageRequirements(path, finalJson as any, projectStructure as any, businessContext);
      
      prompt = `Create a proper React page component for ${path}. 

**PROJECT CONTEXT:**
- Project: ${projectInfo?.name || projectName} (${projectInfo?.type || 'Website'})
- Goal: ${projectInfo?.goal || 'Create a functional website'}
- Features: ${features?.map(f => f.name || f.id).join(', ') || 'Basic features'}

**TARGET AUDIENCE:**


**PAGE-SPECIFIC REQUIREMENTS:**
${pageRequirements}

**BUSINESS CONTEXT:**
- Industry: ${businessContext.industry}


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
   * Get default Home template based on business type
   */
  private static getDefaultHomeTemplate(projectName: string, businessContext: BusinessContext): string {
    const { industry } = businessContext;
    
    switch (industry) {
      case 'blog':
        return `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Articles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Articles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Article Title 1]</h3>
              <p className="text-gray-600 mb-4">[Article Description 1]</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By Admin</span>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
            </article>
            
            <article className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Article Title 2]</h3>
              <p className="text-gray-600 mb-4">[Article Description 2]</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By Writer</span>
                <span className="text-sm text-gray-500">5 days ago</span>
              </div>
            </article>
            
            <article className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Article Title 3]</h3>
              <p className="text-gray-600 mb-4">[Article Description 3]</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">By Editor</span>
                <span className="text-sm text-gray-500">1 week ago</span>
              </div>
            </article>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Article Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 1]</h3>
              <p className="text-sm text-gray-600">[Article Count 1]</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 2]</h3>
              <p className="text-sm text-gray-600">[Article Count 2]</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 3]</h3>
              <p className="text-sm text-gray-600">[Article Count 3]</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">[Category 4]</h3>
              <p className="text-sm text-gray-600">[Article Count 4]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;

      case 'restaurant':
        return `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Dishes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Menu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Menu Item 1]</h3>
              <p className="text-gray-600 mb-4">[Menu Description 1]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">฿1,890</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Order Now
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Menu Item 2]</h3>
              <p className="text-gray-600 mb-4">[Menu Description 2]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">฿890</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Order Now
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Menu Item 3]</h3>
              <p className="text-gray-600 mb-4">[Menu Description 3]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">฿290</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Restaurant Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Feature 1]</h3>
              <p className="text-gray-600">[Feature Description 1]</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Feature 2]</h3>
              <p className="text-gray-600">[Feature Description 2]</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Feature 3]</h3>
              <p className="text-gray-600">[Feature Description 3]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;

      case 'cafe':
        return `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Coffee Menu Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Coffee Menu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Coffee Name 1]</h3>
              <p className="text-gray-600 mb-4">[Coffee Description 1]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">฿120</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                  Order Now
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Coffee Name 2]</h3>
              <p className="text-gray-600 mb-4">[Coffee Description 2]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">฿95</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                  Order Now
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">[Coffee Name 3]</h3>
              <p className="text-gray-600 mb-4">[Coffee Description 3]</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-amber-600">฿110</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Cafe Atmosphere Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Cafe Atmosphere</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">[Atmosphere Topic 1]</h3>
              <p className="text-gray-600 mb-6">
                [Atmosphere Description 1]
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  WiFi ฟรีความเร็วสูง
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ปลั๊กไฟครบทุกโต๊ะ
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  โต๊ะทำงานขนาดใหญ่
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">[Atmosphere Topic 2]</h3>
              <p className="text-gray-600 mb-6">
                [Atmosphere Description 2]
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  เพลงเบาๆ ฟังสบาย
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ไฟสลัวสบายตา
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  เก้าอี้นั่งสบาย
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;

      case 'fashion':
        return `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Collection Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">New Collection</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-64 bg-gradient-to-r from-pink-500 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">[Product Name 1]</h3>
                <p className="text-gray-600 mb-4">[Product Description 1]</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-pink-600">฿2,490</span>
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">[Product Name 2]</h3>
                <p className="text-gray-600 mb-4">[Product Description 2]</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-pink-600">฿1,890</span>
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-64 bg-gradient-to-r from-green-500 to-teal-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">[Product Name 3]</h3>
                <p className="text-gray-600 mb-4">[Product Description 3]</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-pink-600">฿1,590</span>
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Style Guide Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Style Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">[Style Guide Topic 1]</h3>
              <p className="text-gray-600 mb-6">
                [Style Guide Description 1]
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">รอบอก</span>
                  <span className="text-gray-500">32-34 นิ้ว</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">รอบเอว</span>
                  <span className="text-gray-500">26-28 นิ้ว</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">รอบสะโพก</span>
                  <span className="text-gray-500">36-38 นิ้ว</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">[Style Guide Topic 2]</h3>
              <p className="text-gray-600 mb-6">
                [Style Guide Description 2]
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ซักด้วยน้ำเย็น
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ใช้ผงซักฟอกอ่อน
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ตากในที่ร่ม
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  รีดด้วยความร้อนต่ำ
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;

      case 'technology':
        return `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">พัฒนาเว็บไซต์</h3>
              <p className="text-gray-600 mb-4 text-center">พัฒนาเว็บไซต์ที่ทันสมัยและตอบสนองความต้องการของธุรกิจ</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React & Next.js</li>
                <li>• Responsive Design</li>
                <li>• SEO Optimization</li>
                <li>• Performance Tuning</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">แอปมือถือ</h3>
              <p className="text-gray-600 mb-4 text-center">พัฒนาแอปพลิเคชันมือถือสำหรับ iOS และ Android</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React Native</li>
                <li>• Flutter</li>
                <li>• Native Development</li>
                <li>• App Store Optimization</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">ระบบจัดการ</h3>
              <p className="text-gray-600 mb-4 text-center">พัฒนาระบบจัดการข้อมูลและระบบอัตโนมัติ</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Database Design</li>
                <li>• API Development</li>
                <li>• Cloud Integration</li>
                <li>• Security Implementation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Technology Stack Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technologies We Use</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">R</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">React</h3>
              <p className="text-sm text-gray-600">Frontend Framework</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">N</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Node.js</h3>
              <p className="text-sm text-gray-600">Backend Runtime</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">T</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">TypeScript</h3>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold text-lg">A</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AWS</h3>
              <p className="text-sm text-gray-600">Cloud Platform</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;

      default:
        return `import React from 'react';
import HeroSection from '../components/HeroSection.tsx';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Welcome to ${projectName}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 1]</h3>
            <p className="text-gray-600">[Feature Description 1]</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 2]</h3>
              <p className="text-gray-600">[Feature Description 2]</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">[Feature Title 3]</h3>
              <p className="text-gray-600">[Feature Description 3]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;`;
    }
  }

  /**
   * Get default About template based on business type
   */
  private static getDefaultAboutTemplate(projectName: string, businessContext: BusinessContext): string {
    const { industry } = businessContext;
    
    switch (industry) {
      case 'blog':
        return `import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Our Blog</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">[Mission Title]</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              [Mission Description]
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">[Team Title]</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">[Team Position 1]</h4>
                <p className="text-gray-600">[Team Description 1]</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">[Team Position 2]</h4>
                <p className="text-gray-600">[Team Description 2]</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">[Team Position 3]</h4>
                <p className="text-gray-600">[Team Description 3]</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">[Statistics Title]</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-600">[Statistic Number 1]</div>
                <div className="text-gray-600">[Statistic Description 1]</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">[Statistic Number 2]</div>
                <div className="text-gray-600">[Statistic Description 2]</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-600">[Statistic Number 3]</div>
                <div className="text-gray-600">[Statistic Description 3]</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-600">[Statistic Number 4]</div>
                <div className="text-gray-600">[Statistic Description 4]</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">[Contact Title]</h3>
              <p className="text-gray-600 mb-4">
                [Contact Description]
              </p>
              <Link 
                to="/contact" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
              >
                Contact Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;`;

      case 'restaurant':
        return `import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About Our Restaurant</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Restaurant History</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Our restaurant has been serving customers for over 10 years with a commitment to providing 
              high-quality food and friendly service to all our customers.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Head Chef</h3>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Chef Somchai</h4>
                  <p className="text-gray-600">Head Chef</p>
                </div>
              </div>
              <p className="text-gray-600">
                With over 15 years of culinary experience, graduated from a leading culinary institute.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Features</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Fresh ingredients daily</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Over 100 diverse menu items</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">24-hour service</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Convenient parking</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-2 text-gray-600">
                <p>📍 123 Sukhumvit Road, Bangkok 10110</p>
                <p>📞 02-123-4567</p>
                <p>🕒 Open 24 hours</p>
              </div>
              <Link 
                to="/contact" 
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium inline-block mt-4"
              >
                Make Reservation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;`;

      default:
        return `import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">About ${projectName}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We are committed to providing high-quality service and meeting the needs of all our customers 
              with an experienced and professional team.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Team</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Management Team</h4>
                <p className="text-gray-600">Oversee operations and strategic planning</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900">Operations Team</h4>
                <p className="text-gray-600">Execute plans and provide customer service</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Company Information</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-blue-600">5+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">1,000+</div>
                <div className="text-gray-600">Customers</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-600">50+</div>
                <div className="text-gray-600">Employees</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">Service</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions or need more information
              </p>
              <Link 
                to="/contact" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;`;
    }
  }

  /**
   * Get default Products template based on business type
   */
  private static getDefaultProductsTemplate(projectName: string, businessContext: BusinessContext): string {
    const { industry } = businessContext;
    
    switch (industry) {
      case 'fashion':
        return `import React from 'react';

const Products: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="w-full h-64 bg-gradient-to-r from-pink-500 to-purple-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ชุดเดรสสไตล์โมเดิร์น</h3>
              <p className="text-gray-600 mb-4">ชุดเดรสที่ทันสมัย เหมาะสำหรับโอกาสพิเศษ</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-pink-600">฿2,490</span>
                <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  เพิ่มในตะกร้า
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">เสื้อเชิ้ตแฟชั่น</h3>
              <p className="text-gray-600 mb-4">เสื้อเชิ้ตที่ใส่สบาย เหมาะสำหรับทุกโอกาส</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-pink-600">฿1,890</span>
                <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  เพิ่มในตะกร้า
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="w-full h-64 bg-gradient-to-r from-green-500 to-teal-600"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">กางเกงยีนส์สไตล์</h3>
              <p className="text-gray-600 mb-4">กางเกงยีนส์ที่ทันสมัย ใส่สบาย</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-pink-600">฿1,590</span>
                <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  เพิ่มในตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;`;

      default:
        return `import React from 'react';

const Products: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">[Product Name 1]</h3>
            <p className="text-gray-600 mb-4">[Product Description 1]</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">฿1,000</span>
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">[Product Name 2]</h3>
            <p className="text-gray-600 mb-4">[Product Description 2]</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">฿1,500</span>
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-full h-48 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">[Product Name 3]</h3>
            <p className="text-gray-600 mb-4">[Product Description 3]</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">฿2,000</span>
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;`;
    }
  }

  /**
   * Get default Services template based on business type
   */
  private static getDefaultServicesTemplate(projectName: string, businessContext: BusinessContext): string {
    const { industry } = businessContext;
    
    switch (industry) {
      case 'technology':
        return `import React from 'react';

const Services: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Services</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">[Service Name 1]</h3>
            <p className="text-gray-600 mb-4 text-center">[Service Description 1]</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• React & Next.js</li>
              <li>• Responsive Design</li>
              <li>• SEO Optimization</li>
              <li>• Performance Tuning</li>
            </ul>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">[Service Name 2]</h3>
            <p className="text-gray-600 mb-4 text-center">[Service Description 2]</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• React Native</li>
              <li>• Flutter</li>
              <li>• Native Development</li>
              <li>• App Store Optimization</li>
            </ul>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              เริ่มต้นใช้งาน
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">[Service Name 3]</h3>
            <p className="text-gray-600 mb-4 text-center">[Service Description 3]</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Database Design</li>
              <li>• API Development</li>
              <li>• Cloud Integration</li>
              <li>• Security Implementation</li>
            </ul>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              เริ่มต้นใช้งาน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;`;

      default:
        return `import React from 'react';

const Services: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Services</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">[Service Name 1]</h3>
            <p className="text-gray-600 mb-4 text-center">[Service Description 1]</p>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">[Service Name 2]</h3>
            <p className="text-gray-600 mb-4 text-center">[Service Description 2]</p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              เริ่มต้นใช้งาน
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">[Service Name 3]</h3>
            <p className="text-gray-600 mb-4 text-center">[Service Description 3]</p>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              เริ่มต้นใช้งาน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;`;
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
      
      // เพิ่ม template ที่สมบูรณ์สำหรับไฟล์ที่ขาดหายไป - แบ่งตามประเภทธุรกิจ
      'src/pages/Home.tsx': (() => {
        const h = getBusinessHandler(businessContext.industry);
        if (h.templates['src/pages/Home.tsx']) {
          return h.templates['src/pages/Home.tsx'](projectStructure);
        }
        return this.getDefaultHomeTemplate(projectName, businessContext);
      })(),
      
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

      // เพิ่ม template สำหรับหน้า default อื่นๆ ตามประเภทธุรกิจ
      'src/pages/About.tsx': (() => {
        const h = getBusinessHandler(businessContext.industry);
        if (h.templates['src/pages/About.tsx']) {
          return h.templates['src/pages/About.tsx'](projectStructure);
        }
        return this.getDefaultAboutTemplate(projectName, businessContext);
      })(),
      'src/pages/Products.tsx': (() => {
        const h = getBusinessHandler(businessContext.industry);
        if (h.templates['src/pages/Products.tsx']) {
          return h.templates['src/pages/Products.tsx'](projectStructure);
        }
        return this.getDefaultProductsTemplate(projectName, businessContext);
      })(),
      'src/pages/Services.tsx': (() => {
        const h = getBusinessHandler(businessContext.industry);
        if (h.templates['src/pages/Services.tsx']) {
          return h.templates['src/pages/Services.tsx'](projectStructure);
        }
        return this.getDefaultServicesTemplate(projectName, businessContext);
      })(),
      
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
  // getComponentSpecificRequirements ถูกแทนที่ด้วย handler.getComponentRequirements

  /**
   * Get page-specific requirements based on project info and finalJson
   */
  // getPageSpecificRequirements ถูกแทนที่ด้วย handler.getPageRequirements

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