/**
 * Integration Tests for Frontend-V2 Agent
 * ทดสอบการเชื่อมต่อกับ Template System
 */

import { runFrontendAgentV2, healthCheck, getAvailableTemplates } from '../runners/run';
import { FrontendTaskV2 } from '../schemas/types';

describe('Frontend-V2 Agent Integration Tests', () => {
  
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const health = await healthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.templateSystem.available).toBe(true);
      expect(health.templateSystem.sharedBlocksCount).toBeGreaterThan(0);
      expect(health.templateSystem.businessCategoriesCount).toBeGreaterThan(0);
    });
  });

  describe('Template System Integration', () => {
    it('should get available templates', () => {
      const templates = getAvailableTemplates();
      
      expect(templates.sharedBlocks).toBeDefined();
      expect(templates.businessCategories).toBeDefined();
      expect(templates.sharedBlocks.length).toBeGreaterThan(0);
      expect(templates.businessCategories.length).toBeGreaterThan(0);
    });
  });

  describe('Website Generation', () => {
    const testTask: FrontendTaskV2 = {
      taskId: 'test-001',
      taskType: 'generate_website',
      businessCategory: 'restaurant',
      keywords: ['restaurant', 'food', 'thai'],
      customizations: {
        colors: ['orange', 'red'],
        theme: 'modern',
        layout: 'single-page',
        features: ['hero_section', 'about_section', 'contact_form']
      },
      includePreview: false,
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
      priority: 'medium',
      metadata: {
        userId: 'test-user',
        projectId: 'test-project',
        timestamp: new Date().toISOString(),
        tags: ['test', 'integration']
      }
    };

    it('should generate website successfully', async () => {
      const result = await runFrontendAgentV2(testTask);
      
      console.log('Result success:', result.success);
      console.log('Result error:', result.error);
      console.log('Result files keys:', Object.keys(result.files || {}));
      
      expect(result.success).toBe(true);
      expect(result.result.businessCategory).toBe('restaurant');
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.performance.generationTime).toBeGreaterThan(0);
    }, 30000); // 30 second timeout

    it('should generate files with correct structure', async () => {
      const result = await runFrontendAgentV2(testTask);
      
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      
      // Check file types
      const fileTypes = result.files.map(file => file.type);
      expect(fileTypes).toContain('component');
      
      // Check file paths
      result.files.forEach(file => {
        expect(file.path).toBeDefined();
        expect(file.content).toBeDefined();
        expect(typeof file.content).toBe('string');
        expect(file.content.length).toBeGreaterThan(0);
      });
    }, 30000);

    it('should include performance metrics', async () => {
      const result = await runFrontendAgentV2(testTask);
      
      expect(result.performance).toBeDefined();
      expect(result.performance.generationTime).toBeGreaterThan(0);
      expect(result.performance.totalFiles).toBeGreaterThan(0);
      expect(result.performance.totalSize).toBeDefined();
    }, 30000);

    it('should include validation results', async () => {
      const result = await runFrontendAgentV2(testTask);
      
      expect(result.validation).toBeDefined();
      expect(result.validation.isValid).toBe(true);
      expect(result.validation.accessibilityScore).toBeGreaterThan(0);
      expect(result.validation.typescriptErrors).toBe(0);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle invalid task gracefully', async () => {
      const invalidTask = {
        taskId: 'invalid-001',
        taskType: 'invalid_type' as any,
        businessCategory: 'restaurant',
        keywords: ['test']
      } as FrontendTaskV2;

      const result = await runFrontendAgentV2(invalidTask);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('TASK_VALIDATION_ERROR');
    });

    it('should handle missing business category', async () => {
      const taskWithoutCategory = {
        taskId: 'no-category-001',
        taskType: 'generate_website' as const,
        keywords: ['restaurant', 'food']
      } as FrontendTaskV2;

      const result = await runFrontendAgentV2(taskWithoutCategory);
      
      // Should still work with keyword detection
      expect(result.success).toBe(true);
    });
  });

  describe('Different Business Categories', () => {
    const categories = ['restaurant', 'ecommerce', 'portfolio', 'healthcare'];

    categories.forEach(category => {
      it(`should generate website for ${category} category`, async () => {
        const task: FrontendTaskV2 = {
          taskId: `test-${category}-001`,
          taskType: 'generate_website',
          businessCategory: category,
          keywords: [category, 'test'],
          includePreview: false
        };

        const result = await runFrontendAgentV2(task);
        
        expect(result.success).toBe(true);
        expect(result.result.businessCategory).toBe(category);
        expect(result.files.length).toBeGreaterThan(0);
      }, 30000);
    });
  });

  describe('Customization Options', () => {
    it('should apply color customizations', async () => {
      const task: FrontendTaskV2 = {
        taskId: 'custom-colors-001',
        taskType: 'generate_website',
        businessCategory: 'restaurant',
        keywords: ['restaurant', 'food'],
        customizations: {
          colors: ['blue', 'green'],
          theme: 'modern'
        },
        includePreview: false
      };

      const result = await runFrontendAgentV2(task);
      
      expect(result.success).toBe(true);
      expect(result.result.customizationsApplied).toContain('color_override');
    }, 30000);

    it('should apply feature customizations', async () => {
      const task: FrontendTaskV2 = {
        taskId: 'custom-features-001',
        taskType: 'generate_website',
        businessCategory: 'ecommerce',
        keywords: ['shop', 'online'],
        customizations: {
          features: ['hero_section', 'gallery', 'pricing'],
          layout: 'multi-page'
        },
        includePreview: false
      };

      const result = await runFrontendAgentV2(task);
      
      expect(result.success).toBe(true);
      expect(result.result.customizationsApplied).toContain('feature_override');
    }, 30000);
  });

  describe('AI Settings', () => {
    it('should use different AI models', async () => {
      const task: FrontendTaskV2 = {
        taskId: 'ai-model-001',
        taskType: 'generate_website',
        businessCategory: 'portfolio',
        keywords: ['portfolio', 'creative'],
        aiSettings: {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          language: 'en'
        },
        includePreview: false
      };

      const result = await runFrontendAgentV2(task);
      
      expect(result.success).toBe(true);
      expect(result.metadata.aiModelUsed).toBe('gpt-4o-mini');
    }, 30000);
  });
});
