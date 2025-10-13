/**
 * Test Project Structure Generation
 * ทดสอบการสร้าง project structure แบบ Vite + React + TypeScript
 */

import { runFrontendAgentV2 } from '../runners/run';
import { FrontendTaskV2 } from '../schemas/types';

/**
 * Test: สร้างโปรเจคแบบ Vite + React + TypeScript สำหรับร้านอาหาร
 */
export async function testViteReactProjectGeneration() {
  console.log('🧪 Testing Vite + React + TypeScript project generation...');

  const task: FrontendTaskV2 = {
    taskId: 'test-vite-project-001',
    taskType: 'generate_website',
    businessCategory: 'restaurant',
    keywords: ['restaurant', 'food', 'thai', 'อร่อย', 'orange', 'red'],
    customizations: {
      colors: ['orange', 'red'],
      theme: 'modern',
      layout: 'multi-page',
      features: ['hero_section', 'about_section', 'contact_form', 'gallery', 'menu']
    },
    includePreview: true,
    includeProjectStructure: true,
    projectType: 'vite-react-typescript',
    validation: {
      enabled: true,
      strictMode: true,
      accessibilityLevel: 'AA'
    },
    aiSettings: {
      model: 'gpt-5-nano',
      temperature: 1,
      language: 'th'
    },
    priority: 'high',
    metadata: {
      userId: 'test-user-123',
      projectId: 'test-project-456',
      timestamp: new Date().toISOString(),
      tags: ['restaurant', 'food', 'thai', 'test']
    }
  };

  try {
    console.log('🚀 Starting frontend generation with project structure...');
    const result = await runFrontendAgentV2(task);
    
    if (result.success) {
      console.log('✅ Frontend generation successful!');
      console.log('📊 Results:', {
        filesGenerated: result.files.length,
        executionTime: result.metadata.executionTime,
        totalSize: result.performance.totalSize,
        businessCategory: result.result.businessCategory,
        projectType: result.result.projectType
      });

      // Check if project structure was generated
      if (result.projectStructure) {
        console.log('🏗️ Project structure generated!');
        console.log('📁 Project details:', {
          name: result.projectStructure.projectStructure.name,
          type: result.projectStructure.projectStructure.type,
          description: result.projectStructure.projectStructure.description,
          filesCount: result.projectStructure.files.length
        });

        // Check for key project files
        const projectFiles = result.projectStructure.files;
        const keyFiles = [
          'package.json',
          'vite.config.ts',
          'tsconfig.json',
          'tailwind.config.js',
          'postcss.config.js',
          'index.html',
          'src/main.tsx',
          'src/App.tsx',
          'src/index.css'
        ];

        console.log('🔍 Checking for key project files...');
        for (const keyFile of keyFiles) {
          const found = projectFiles.find(file => file.path === keyFile);
          if (found) {
            console.log(`✅ Found: ${keyFile} (${found.language})`);
          } else {
            console.log(`❌ Missing: ${keyFile}`);
          }
        }

        // Check for component files
        console.log('🔍 Checking for component files...');
        const componentFiles = projectFiles.filter(file => 
          file.path.includes('src/') && 
          (file.path.endsWith('.tsx') || file.path.endsWith('.ts'))
        );
        console.log(`📦 Component files: ${componentFiles.length}`);
        componentFiles.forEach(file => {
          console.log(`  - ${file.path} (${file.language})`);
        });

        return {
          success: true,
          projectStructure: result.projectStructure,
          componentFiles: result.files,
          stats: {
            totalFiles: projectFiles.length,
            componentFiles: componentFiles.length,
            executionTime: result.metadata.executionTime
          }
        };
      } else {
        console.log('❌ Project structure not generated');
        return { success: false, error: 'Project structure not generated' };
      }
    } else {
      console.error('❌ Frontend generation failed:', result.error);
      return { success: false, error: result.error?.message || 'Unknown error' };
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Test: สร้างโปรเจคแบบ E-commerce
 */
export async function testEcommerceProjectGeneration() {
  console.log('🧪 Testing E-commerce project generation...');

  const task: FrontendTaskV2 = {
    taskId: 'test-ecommerce-project-001',
    taskType: 'generate_website',
    businessCategory: 'ecommerce',
    keywords: ['shop', 'online', 'store', 'ขายของ', 'blue', 'purple'],
    customizations: {
      colors: ['blue', 'purple'],
      theme: 'professional',
      layout: 'multi-page',
      features: ['hero_section', 'gallery', 'pricing', 'contact_form']
    },
    includePreview: true,
    includeProjectStructure: true,
    projectType: 'vite-react-typescript',
    validation: {
      enabled: true,
      strictMode: true,
      accessibilityLevel: 'AA'
    },
    aiSettings: {
      model: 'gpt-5-nano',
      temperature: 0.8,
      language: 'th'
    },
    priority: 'medium'
  };

  try {
    const result = await runFrontendAgentV2(task);
    
    if (result.success && result.projectStructure) {
      console.log('✅ E-commerce project generated successfully!');
      console.log('📊 Project stats:', {
        name: result.projectStructure.projectStructure.name,
        type: result.projectStructure.projectStructure.type,
        filesCount: result.projectStructure.files.length
      });
      return { success: true, result };
    } else {
      console.error('❌ E-commerce project generation failed');
      return { success: false, error: 'Generation failed' };
    }
  } catch (error) {
    console.error('❌ E-commerce test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Test: สร้างโปรเจคแบบ Portfolio
 */
export async function testPortfolioProjectGeneration() {
  console.log('🧪 Testing Portfolio project generation...');

  const task: FrontendTaskV2 = {
    taskId: 'test-portfolio-project-001',
    taskType: 'generate_website',
    businessCategory: 'portfolio',
    keywords: ['portfolio', 'creative', 'design', 'ผลงาน', 'purple', 'pink'],
    customizations: {
      colors: ['purple', 'pink'],
      theme: 'creative',
      layout: 'single-page',
      features: ['hero_section', 'gallery', 'about_section', 'contact_form']
    },
    includePreview: true,
    includeProjectStructure: true,
    projectType: 'vite-react-typescript',
    validation: {
      enabled: true,
      strictMode: false,
      accessibilityLevel: 'A'
    },
    aiSettings: {
      model: 'gpt-4o-mini',
      temperature: 1.2,
      language: 'th'
    },
    priority: 'medium'
  };

  try {
    const result = await runFrontendAgentV2(task);
    
    if (result.success && result.projectStructure) {
      console.log('✅ Portfolio project generated successfully!');
      console.log('📊 Project stats:', {
        name: result.projectStructure.projectStructure.name,
        type: result.projectStructure.projectStructure.type,
        filesCount: result.projectStructure.files.length
      });
      return { success: true, result };
    } else {
      console.error('❌ Portfolio project generation failed');
      return { success: false, error: 'Generation failed' };
    }
  } catch (error) {
    console.error('❌ Portfolio test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Test: Batch generation of different project types
 */
export async function testBatchProjectGeneration() {
  console.log('🧪 Testing batch project generation...');

  const tasks: FrontendTaskV2[] = [
    {
      taskId: 'batch-restaurant-001',
      taskType: 'generate_website',
      businessCategory: 'restaurant',
      keywords: ['restaurant', 'food'],
      includeProjectStructure: true,
      projectType: 'vite-react-typescript'
    },
    {
      taskId: 'batch-ecommerce-001',
      taskType: 'generate_website',
      businessCategory: 'ecommerce',
      keywords: ['shop', 'online'],
      includeProjectStructure: true,
      projectType: 'vite-react-typescript'
    },
    {
      taskId: 'batch-portfolio-001',
      taskType: 'generate_website',
      businessCategory: 'portfolio',
      keywords: ['portfolio', 'creative'],
      includeProjectStructure: true,
      projectType: 'vite-react-typescript'
    }
  ];

  try {
    const results = [];
    
    for (const task of tasks) {
      console.log(`📋 Processing: ${task.taskId}`);
      const result = await runFrontendAgentV2(task);
      results.push(result);
      
      if (result.success && result.projectStructure) {
        console.log(`✅ ${task.taskId} completed successfully`);
        console.log(`  - Project: ${result.projectStructure.projectStructure.name}`);
        console.log(`  - Files: ${result.projectStructure.files.length}`);
      } else {
        console.log(`❌ ${task.taskId} failed: ${result.error?.message || 'Unknown error'}`);
      }
    }

    const successCount = results.filter(r => r.success && r.projectStructure).length;
    console.log(`🎉 Batch processing completed: ${successCount}/${tasks.length} successful`);

    return {
      success: successCount > 0,
      results,
      successCount,
      totalCount: tasks.length
    };
  } catch (error) {
    console.error('❌ Batch test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Main test function
 */
export async function runProjectStructureTests() {
  console.log('🚀 Running Project Structure Tests...\n');

  // Test 1: Vite + React + TypeScript for Restaurant
  console.log('=== Test 1: Restaurant Project ===');
  const restaurantTest = await testViteReactProjectGeneration();
  console.log('');

  // Test 2: E-commerce Project
  console.log('=== Test 2: E-commerce Project ===');
  const ecommerceTest = await testEcommerceProjectGeneration();
  console.log('');

  // Test 3: Portfolio Project
  console.log('=== Test 3: Portfolio Project ===');
  const portfolioTest = await testPortfolioProjectGeneration();
  console.log('');

  // Test 4: Batch Generation
  console.log('=== Test 4: Batch Generation ===');
  const batchTest = await testBatchProjectGeneration();
  console.log('');

  // Summary
  console.log('📊 Test Summary:');
  console.log(`Restaurant: ${restaurantTest.success ? '✅' : '❌'}`);
  console.log(`E-commerce: ${ecommerceTest.success ? '✅' : '❌'}`);
  console.log(`Portfolio: ${portfolioTest.success ? '✅' : '❌'}`);
  console.log(`Batch: ${batchTest.success ? '✅' : '❌'}`);

  const totalSuccess = [restaurantTest, ecommerceTest, portfolioTest, batchTest].filter(t => t.success).length;
  console.log(`\n🎉 Overall: ${totalSuccess}/4 tests passed`);

  return {
    restaurantTest,
    ecommerceTest,
    portfolioTest,
    batchTest,
    totalSuccess,
    totalTests: 4
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runProjectStructureTests().catch(console.error);
}
