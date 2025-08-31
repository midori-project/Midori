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
      { path: 'src/components/Header.tsx', type: 'component' as const },
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

**REQUIRED STRUCTURE:**
\`\`\`tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
${pageImports.map(p => `import ${p.name} from './${p.path.replace('src/', '').replace('.tsx', '')}.tsx';`).join('\n')}

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<${pageImports[0]?.name || 'About'} />} />
${pageImports.map(p => `          <Route path="/${p.name.toLowerCase()}" element={<${p.name} />} />`).join('\n')}
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
- Header: className="bg-white shadow-lg px-6 py-4 border-b"
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
- Do NOT include h1 tags if this is Header component (avoid duplicate welcome messages)

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
- Use relative paths: './components/Header.tsx' not './components/Header'
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
- import Header from './components/Header.tsx';
- import { Routes, Route } from 'react-router-dom';

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
- import Header from './components/Header'; (missing .tsx)

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
        console.warn(`⚠️ Validation issues for ${path}:`, validation.errors);
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
        
        return `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
${pageImports.map(p => `import ${p.name} from './${p.path.replace('src/', '').replace('.tsx', '')}.tsx';`).join('\n')}

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<${pageImports.find(p => p.name === 'Home')?.name || pageImports[0]?.name || 'About'} />} />
${pageImports.filter(p => p.name !== 'Home').map(p => {
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
      
      'src/components/Header.tsx': `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
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
              หน้าแรก
            </Link>
            <Link 
              to="/about" 
              className={\`text-gray-600 hover:text-gray-900 transition-colors \${isActive('/about') ? 'text-blue-600 font-medium' : ''}\`}
            >
              เกี่ยวกับเรา
            </Link>
            <Link 
              to="/contact" 
              className={\`text-gray-600 hover:text-gray-900 transition-colors \${isActive('/contact') ? 'text-blue-600 font-medium' : ''}\`}
            >
              ติดต่อ
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

      'src/pages/Home.tsx': (() => {
        // สร้าง Home page ตาม business context
        const getBusinessHomeTemplate = (industry: string) => {
          const businessData = {
            restaurant: {
              title: 'ยินดีต้อนรับสู่ร้านอาหารของเรา',
              subtitle: 'อิ่มอร่อยกับอาหารรสเลิศที่ปรุงด้วยใจ',
              mainAction: 'ดูเมนู',
              mainPath: '/menu',
              bgColor: 'bg-orange-100',
              accentColor: 'bg-orange-600',
              features: [
                { icon: '🍽️', title: 'อาหารคุณภาพ', desc: 'วัตถุดิบสดใหม่ทุกวัน' },
                { icon: '👨‍🍳', title: 'เชฟมืออาชีพ', desc: 'ประสบการณ์กว่า 10 ปี' },
                { icon: '🏪', title: 'บรรยากาศอบอุ่น', desc: 'สถานที่สำหรับครอบครัว' }
              ]
            },
            cafe: {
              title: 'ต้อนรับสู่คาเฟ่ของเรา',
              subtitle: 'เริ่มต้นวันใหม่ด้วยกาแฟหอมกรุ่น',
              mainAction: 'ดูเมนูกาแฟ',
              mainPath: '/coffeemenu',
              bgColor: 'bg-amber-50',
              accentColor: 'bg-amber-600',
              features: [
                { icon: '☕', title: 'กาแฟคุณภาพ', desc: 'เมล็ดกาแฟพรีเมี่ยม' },
                { icon: '🎨', title: 'ลาเต้อาร์ต', desc: 'ฝีมือบาริสต้ามืออาชีพ' },
                { icon: '📚', title: 'พื้นที่แห่งการเรียนรู้', desc: 'เหมาะสำหรับทำงาน' }
              ]
            },
            fashion: {
              title: 'แฟชั่นล้ำสมัย',
              subtitle: 'สร้างสไตล์ของคุณด้วยแฟชั่นคุณภาพ',
              mainAction: 'ดูคอลเลกชัน',
              mainPath: '/collection',
              bgColor: 'bg-purple-50',
              accentColor: 'bg-purple-600',
              features: [
                { icon: '👗', title: 'แฟชั่นล่าสุด', desc: 'ทันเทรนด์สไตล์โลก' },
                { icon: '✨', title: 'คุณภาพพรีเมี่ยม', desc: 'วัสดุคัดสรรพิเศษ' },
                { icon: '🎯', title: 'สไตล์เฉพาะตัว', desc: 'ออกแบบเพื่อคุณ' }
              ]
            }
          };
          
          const data = businessData[industry as keyof typeof businessData] || businessData.cafe;
          
          return `import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen ${data.bgColor}">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            ${data.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ${data.subtitle}
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="${data.mainPath}" 
              className="${data.accentColor} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              ${data.mainAction}
            </Link>
            <Link 
              to="/about" 
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              เรียนรู้เพิ่มเติม
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ทำไมต้องเลือกเรา</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${data.features.map(feature => `
            <div className="text-center p-6">
              <div className="text-4xl mb-4">${feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">${feature.title}</h3>
              <p className="text-gray-600">${feature.desc}</p>
            </div>`).join('')}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 ${data.bgColor}">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">พร้อมที่จะเริ่มต้นแล้วหรือยัง?</h2>
          <p className="text-gray-600 mb-8">มาสัมผัสประสบการณ์ที่ดีที่สุดกับเรา</p>
          <Link 
            to="/contact" 
            className="${data.accentColor} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            ติดต่อเรา
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;`;
        };
        
        return getBusinessHomeTemplate(businessContext.industry);
      })(),

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


    };
    
    return {
      path,
      content: templates[path] || `// ${path} - Template file`,
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
      
      if (fileName.includes('Header') || fileName.includes('Nav')) {
        return `
- Include navigation for blog pages: Home, Articles, Categories, About, Contact
- Add search bar for article search
- Include user authentication status (Login/Logout)
- Add admin link for authorized users
- Make responsive with mobile hamburger menu`;
      }
    }
    
    // Default for other project types
    if (fileName.includes('Header')) {
      return `- Create navigation header appropriate for ${projectType} with main menu items and branding`;
    }
    
    if (fileName.includes('Footer')) {
      return `- Create footer with links, contact info, and branding appropriate for ${projectType}`;
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
- Create blog homepage with hero section featuring site name and description
- Include featured/recent articles grid with excerpts and thumbnails
- Add categories navigation and popular tags
- Include newsletter subscription form if RSS/newsletter feature exists
- Add search functionality for articles
- Display author highlights and site statistics`;
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