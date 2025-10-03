/**
 * Example Usage of Frontend-V2 Agent
 * ตัวอย่างการใช้งาน Frontend-V2 Agent
 */

import { runFrontendAgentV2, healthCheck, getAvailableTemplates } from '../runners/run';
import { FrontendTaskV2 } from '../schemas/types';

/**
 * Example 1: สร้างเว็บไซต์ร้านอาหาร
 */
export async function createRestaurantWebsite() {
  console.log('🍽️ Creating restaurant website...');

  const task: FrontendTaskV2 = {
    taskId: 'restaurant-001',
    taskType: 'generate_website',
    businessCategory: 'restaurant',
    keywords: ['restaurant', 'food', 'thai', 'อร่อย'],
    customizations: {
      colors: ['orange', 'red'],
      theme: 'modern',
      layout: 'single-page',
      features: ['hero_section', 'about_section', 'contact_form', 'gallery']
    },
    includePreview: true,
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
      userId: 'user-123',
      projectId: 'project-456',
      timestamp: new Date().toISOString(),
      tags: ['restaurant', 'food', 'thai']
    }
  };

  try {
    const result = await runFrontendAgentV2(task);
    
    if (result.success) {
      console.log('✅ Restaurant website created successfully!');
      console.log(`📁 Files generated: ${result.files.length}`);
      console.log(`⏱️ Generation time: ${result.performance.generationTime}ms`);
      console.log(`📊 Total size: ${result.performance.totalSize}`);
      
      if (result.preview) {
        console.log(`👀 Preview available at: ${result.preview.url}`);
      }
      
      return result;
    } else {
      console.error('❌ Failed to create restaurant website:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating restaurant website:', error);
    return null;
  }
}

/**
 * Example 2: สร้างเว็บไซต์ E-commerce
 */
export async function createEcommerceWebsite() {
  console.log('🛒 Creating e-commerce website...');

  const task: FrontendTaskV2 = {
    taskId: 'ecommerce-001',
    taskType: 'generate_website',
    businessCategory: 'ecommerce',
    keywords: ['shop', 'online', 'store', 'ขายของ'],
    customizations: {
      colors: ['blue', 'purple'],
      theme: 'professional',
      layout: 'multi-page',
      features: ['hero_section', 'gallery', 'pricing', 'contact_form']
    },
    includePreview: true,
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
    
    if (result.success) {
      console.log('✅ E-commerce website created successfully!');
      console.log(`📁 Files generated: ${result.files.length}`);
      console.log(`🎨 Applied customizations: ${result.result.customizationsApplied.join(', ')}`);
      
      return result;
    } else {
      console.error('❌ Failed to create e-commerce website:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating e-commerce website:', error);
    return null;
  }
}

/**
 * Example 3: สร้างเว็บไซต์ Portfolio
 */
export async function createPortfolioWebsite() {
  console.log('🎨 Creating portfolio website...');

  const task: FrontendTaskV2 = {
    taskId: 'portfolio-001',
    taskType: 'generate_website',
    businessCategory: 'portfolio',
    keywords: ['portfolio', 'creative', 'design', 'ผลงาน'],
    customizations: {
      colors: ['purple', 'pink'],
      theme: 'creative',
      layout: 'single-page',
      features: ['hero_section', 'gallery', 'about_section', 'contact_form']
    },
    includePreview: true,
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
    
    if (result.success) {
      console.log('✅ Portfolio website created successfully!');
      console.log(`📁 Files generated: ${result.files.length}`);
      console.log(`🎯 Blocks generated: ${result.result.blocksGenerated.join(', ')}`);
      
      return result;
    } else {
      console.error('❌ Failed to create portfolio website:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating portfolio website:', error);
    return null;
  }
}

/**
 * Example 4: ทดสอบ Health Check
 */
export async function testHealthCheck() {
  console.log('🏥 Testing health check...');

  try {
    const health = await healthCheck();
    
    console.log('📊 Health Status:', {
      status: health.status,
      templateSystem: health.templateSystem,
      agent: health.agent
    });

    if (health.status === 'healthy') {
      console.log('✅ System is healthy!');
      return true;
    } else {
      console.log('❌ System is unhealthy!');
      return false;
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

/**
 * Example 5: ดู Available Templates
 */
export function showAvailableTemplates() {
  console.log('📋 Available Templates:');

  try {
    const templates = getAvailableTemplates();
    
    console.log('🧩 Shared Blocks:');
    templates.sharedBlocks.forEach(block => {
      console.log(`  - ${block.id}: ${block.name} (${block.category})`);
    });

    console.log('🏢 Business Categories:');
    templates.businessCategories.forEach(category => {
      console.log(`  - ${category.id}: ${category.name}`);
    });

    return templates;
  } catch (error) {
    console.error('❌ Failed to get templates:', error);
    return null;
  }
}

/**
 * Example 6: Batch Processing
 */
export async function batchCreateWebsites() {
  console.log('🚀 Creating multiple websites in batch...');

  const tasks: FrontendTaskV2[] = [
    {
      taskId: 'batch-001',
      taskType: 'generate_website',
      businessCategory: 'restaurant',
      keywords: ['restaurant', 'food'],
      includePreview: false
    },
    {
      taskId: 'batch-002',
      taskType: 'generate_website',
      businessCategory: 'ecommerce',
      keywords: ['shop', 'online'],
      includePreview: false
    },
    {
      taskId: 'batch-003',
      taskType: 'generate_website',
      businessCategory: 'portfolio',
      keywords: ['portfolio', 'creative'],
      includePreview: false
    }
  ];

  try {
    const results = [];
    
    for (const task of tasks) {
      console.log(`📋 Processing: ${task.taskId}`);
      const result = await runFrontendAgentV2(task);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${task.taskId} completed successfully`);
      } else {
        console.log(`❌ ${task.taskId} failed: ${result.error?.message}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`🎉 Batch processing completed: ${successCount}/${tasks.length} successful`);

    return results;
  } catch (error) {
    console.error('❌ Batch processing failed:', error);
    return [];
  }
}

/**
 * Main Example Function
 */
export async function runExamples() {
  console.log('🚀 Running Frontend-V2 Agent Examples...\n');

  // 1. Health Check
  await testHealthCheck();
  console.log('');

  // 2. Show Available Templates
  showAvailableTemplates();
  console.log('');

  // 3. Create Individual Websites
  await createRestaurantWebsite();
  console.log('');

  await createEcommerceWebsite();
  console.log('');

  await createPortfolioWebsite();
  console.log('');

  // 4. Batch Processing
  await batchCreateWebsites();
  console.log('');

  console.log('🎉 All examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
