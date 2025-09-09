import { SITE_GEN_CONFIG } from './config';
import { GeneratedFile, ProjectStructure, GenerationOptions, FileConfig } from './types';
import { UserIntentAnalyzer } from './user-intent-analyzer';
import { OpenAIService } from './openai-service';
import { getBusinessHandler } from '../../app/api/gensite/business';
import { TemplateReplacer } from '../template-replacer';

// เพิ่ม interfaces สำหรับ type safety
interface BusinessContext {
  industry: string;
  specificNiche: string;
  businessModel: string;
  keyDifferentiators: string[];
  targetAudience: string;
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
    
    // วิเคราะห์ Business Context ด้วย AI จาก finalJson โดยตรง
    console.log('🔍 Starting AI Business Context Analysis for template selection...');
    const businessContext = await UserIntentAnalyzer.analyzeBusinessContext(finalJson);
    console.log('🏢 Business Context detected (AI):', businessContext);

    // เลือกไฟล์ตาม business context ที่วิเคราะห์ได้
    console.log('🎯 Selecting Business Handler for industry (AI):', businessContext.industry);
    const handler = getBusinessHandler(businessContext.industry);
    const essentialFiles = handler.getEssentialFiles(projectStructure as any);
    console.log('📁 Essential Files Selected:', essentialFiles.map(f => f.path));

    // ทำ Enhanced Content Analysis ถ้า handler รองรับ
    let enhancedContent = null;
    let styleConfig = null;
    if (handler.getEnhancedContentAnalysis) {
      console.log('🎨 Performing Enhanced Content Analysis...');
      enhancedContent = handler.getEnhancedContentAnalysis(finalJson, businessContext);
      console.log('✅ Enhanced Content Analysis Complete:', {
        businessName: enhancedContent.businessName,
        contentStyle: enhancedContent.contentStyle,
        tone: enhancedContent.tone
      });
    }

    if (handler.getStyleConfiguration) {
      console.log('🎨 Getting Style Configuration...');
      styleConfig = handler.getStyleConfiguration(finalJson, businessContext);
      console.log('✅ Style Configuration Complete:', styleConfig.colorScheme);
    }
    
    console.log(`📁 Generating ${essentialFiles.length} essential files for ${businessContext.industry} business`);
    console.log('📋 Files to generate:', essentialFiles.map(f => f.path));
    
    const files: GeneratedFile[] = [];
    
    // Generate files in batches
    const batchSize = 3;
    for (let i = 0; i < essentialFiles.length; i += batchSize) {
      const batch = essentialFiles.slice(i, i + batchSize);

      const batchPromises = batch.map((fileConfig) => {
        console.log(`🔄 Generating file: ${fileConfig.path} (${fileConfig.type})`);
        return this.generateEssentialFile(fileConfig, projectStructure, businessContext, essentialFiles, finalJson).catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`❌ Failed to generate ${fileConfig.path}:`, message);
          throw new Error(`[FileGenerator] Failed to generate ${fileConfig.path}: ${message}`);
        });
      });

      const batchResults = await Promise.allSettled(batchPromises);

      const failures = batchResults.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (failures.length > 0) {
        const errorMessages = failures.map((f) => String(f.reason)).join(' | ');
        throw new Error(`[FileGenerator] Batch generation failed: ${errorMessages}`);
      }

      (batchResults as PromiseFulfilledResult<GeneratedFile>[]).forEach((result) => {
        console.log(`✅ Generated file: ${result.value.path} (${result.value.type})`);
        files.push(result.value);
      });

      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} completed (${batch.length} files)`);
    }

    const duration = Date.now() - startTime;
    console.log(`🎯 Essential files generation completed in ${duration}ms - ${files.length} files`);
    
    return files;
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
    
    // ตรวจสอบว่ามี template หรือไม่
    const handler = getBusinessHandler(businessContext.industry);
    if (handler.templates[fileConfig.path]) {
      console.log(`📋 Using template for ${fileConfig.path}`);
      
      try {
        const template = await handler.templates[fileConfig.path](
          projectStructure, 
          finalJson, 
          businessContext
        );
        
        // ตรวจสอบความถูกต้องของ template
        const validation = TemplateReplacer.validateTemplate(template);
        if (!validation.isValid) {
          console.warn(`⚠️ Template validation errors for ${fileConfig.path}:`, validation.errors);
          // ถ้ามี error หนัก ให้ fallback ไป AI generation
          if (validation.errors.length > 0) {
            console.log(`🔄 Falling back to AI generation due to template errors`);
            // Continue to AI generation below
          }
        }
        if (validation.warnings.length > 0) {
          console.warn(`⚠️ Template validation warnings for ${fileConfig.path}:`, validation.warnings);
        }
        
        // ใช้ template แทน AI generation (ถ้าไม่มี error หนัก)
        if (validation.isValid || validation.errors.length === 0) {
          // ใช้ AI replacement สำหรับ template
          const userIntent = finalJson.userIntent as string || 'Create a professional website';
          const replacedTemplate = await TemplateReplacer.replacePlaceholders(
            template, 
            finalJson, 
            businessContext, 
            projectStructure.name,
            userIntent
          );
          
          return {
            path: fileConfig.path,
            content: replacedTemplate,
            type: this.mapFileType(fileConfig.type),
            language: this.getLanguage(fileConfig.path)
          };
        }
      } catch (error) {
        console.error(`❌ Template generation failed for ${fileConfig.path}:`, error);
        // Fallback to AI generation
      }
    }
    
    console.log(`🤖 Using AI generation for ${fileConfig.path}`);
    const { path, type } = fileConfig;
    const projectName = projectStructure.name || 'Generated Project';
    
    console.log(`🚀 Starting file generation: ${path} (${type})`);
    
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
    console.log('🎭 Analyzing User Intent...');
    const userIntent = await UserIntentAnalyzer.analyzeUserIntent(finalJson) as UserIntent;
    console.log('✅ User Intent Analysis Complete:', {
      visualStyle: userIntent.visualStyle,
      colorScheme: userIntent.colorScheme,
      tone: userIntent.tone
    });
    
    // 🚨 สำคัญ: สำหรับ App.tsx ต้องรู้ว่าจะสร้างไฟล์หน้าไหนบ้าง
    console.log('📝 Building prompt for file generation...');
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
      // วิเคราะห์เนื้อหาสำหรับ preset
      console.log('🔧 Starting Component Generation with Content Analysis...');
      console.log('📁 Component Path:', path);
      console.log('🏢 Business Context:', businessContext.industry);
      
      const contentAnalysis = await UserIntentAnalyzer.analyzeContentForPreset(finalJson, businessContext);
      console.log('✅ Content Analysis Complete for Component:', {
        businessName: contentAnalysis.businessName,
        tone: contentAnalysis.tone,
        navigationItems: contentAnalysis.navigationItems
      });
      
      const componentRequirements = UserIntentAnalyzer.generateEnhancedComponentRequirements(path, finalJson, projectStructure, businessContext, contentAnalysis);
      console.log('📋 Component Requirements Generated:', componentRequirements.substring(0, 200) + '...');
      
      prompt = `Create a proper React functional component for ${path}. 

**PROJECT CONTEXT:**
- Project: ${projectInfo?.name || projectName} (${projectInfo?.type || 'Website'})
- Features: ${features?.map(f => f.name || f.id).join(', ') || 'Basic features'}

**CONTENT ANALYSIS:**
- Business Name: ${contentAnalysis.businessName}
- Tagline: ${contentAnalysis.tagline}
- Tone: ${contentAnalysis.tone}
- Language: ${contentAnalysis.language}

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
      // วิเคราะห์เนื้อหาสำหรับ preset
      console.log('📄 Starting Page Generation with Content Analysis...');
      console.log('📁 Page Path:', path);
      console.log('🏢 Business Context:', businessContext.industry);
      
      const contentAnalysis = await UserIntentAnalyzer.analyzeContentForPreset(finalJson, businessContext);
      console.log('✅ Content Analysis Complete for Page:', {
        businessName: contentAnalysis.businessName,
        heroTitle: contentAnalysis.heroTitle,
        tone: contentAnalysis.tone,
        industryContent: Object.keys(contentAnalysis.industrySpecificContent)
      });
      
      const pageRequirements = UserIntentAnalyzer.generateEnhancedPageRequirements(path, finalJson, projectStructure, businessContext, contentAnalysis);
      console.log('📋 Page Requirements Generated:', pageRequirements.substring(0, 200) + '...');
      
      prompt = `Create a proper React page component for ${path}. 

**PROJECT CONTEXT:**
- Project: ${projectInfo?.name || projectName} (${projectInfo?.type || 'Website'})
- Goal: ${projectInfo?.goal || 'Create a functional website'}
- Features: ${features?.map(f => f.name || f.id).join(', ') || 'Basic features'}

**CONTENT ANALYSIS:**
- Business Name: ${contentAnalysis.businessName}
- Tagline: ${contentAnalysis.tagline}
- Hero Title: ${contentAnalysis.heroTitle}
- Hero Subtitle: ${contentAnalysis.heroSubtitle}
- About Text: ${contentAnalysis.aboutText}
- Tone: ${contentAnalysis.tone}
- Language: ${contentAnalysis.language}
- Industry Content: ${JSON.stringify(contentAnalysis.industrySpecificContent)}

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
      console.log('🤖 Sending request to OpenAI for file generation...');
      console.log('📝 Prompt length:', prompt.length);
      console.log('🎯 File type:', type);
      
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
      console.log('📄 OpenAI Response received, length:', content.length);
      
      const cleanedContent = OpenAIService.cleanCodeResponse(content);
      console.log('🧹 Content cleaned, final length:', cleanedContent.length);
      
      // Validate generated code
      console.log('🔍 Validating generated code...');
      const validation = this.validateGeneratedCode(cleanedContent, path);
      
      if (!validation.isValid) {
        console.warn(`⚠️ Validation failed for ${path}:`, validation.errors);
        console.log('🔄 Using template fallback due to validation failure');
        
        // Use template fallback when validation fails
        return await this.createTemplateFile(fileConfig, projectStructure, businessContext, allFiles, finalJson);
      }
      
      console.log('✅ Code validation passed for:', path);
      console.log('📊 Generated file stats:', {
        path,
        type: this.mapFileType(type),
        language: this.getLanguage(path),
        contentLength: cleanedContent.length
      });
      
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
      return await this.createTemplateFile(fileConfig, projectStructure, businessContext, allFiles, finalJson);
    }
  }

  /**
   * Create template-based file for fallback - SandPack Compatible
   */
  private static async createTemplateFile(
    fileConfig: FileConfig,
    projectStructure: ProjectStructure,
    businessContext: BusinessContext,
    allFiles: FileConfig[],
    finalJson: Record<string, unknown>
  ): Promise<GeneratedFile> {
    const { path } = fileConfig;
    const projectName = projectStructure.name || 'Generated Project';
    
    // ใช้ templates จาก business handler ก่อน
    const handler = getBusinessHandler(businessContext.industry);
    const handlerTemplate = handler.templates[path];
    
    if (handlerTemplate) {
      return {
        path,
        content: typeof handlerTemplate === 'function' ? await handlerTemplate(projectStructure, finalJson, businessContext) : handlerTemplate,
        type: this.mapFileType(fileConfig.type),
        language: this.getLanguage(path)
      };
    }
    
    // ถ้าไม่มี template ใน handler ให้ใช้ fallback templates
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
