/**
 * SSOT (Single Source of Truth) Test Suite
 * Comprehensive tests for project context SSOT implementation
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { projectContextStore } from '../midori/agents/orchestrator/stores/projectContextStore';
import { projectContextSync } from '../midori/agents/orchestrator/sync/projectContextSync';
import { ProjectContextValidator } from '../midori/agents/orchestrator/validators/projectContextValidator';
import { dataConsistencyChecker } from '../midori/agents/orchestrator/validators/dataConsistencyChecker';
import { ProjectContextData } from '../midori/agents/orchestrator/types/projectContext';

// Mock data for testing
const mockProjectContext: ProjectContextData = {
  id: 'test-context-123',
  projectId: 'test-project-123',
  specBundleId: 'test-spec-123',
  projectType: 'coffee_shop',
  status: 'created',
  components: [
    {
      id: 'template-1',
      componentId: 'template-1',
      name: 'Coffee Shop Template',
      type: 'template',
      props: [],
      styling: {
        colors: { primary: '#8B4513', secondary: '#D2691E' },
        fonts: { heading: 'Inter', body: 'Inter' }
      },
      location: 'templates' as any,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      metadata: {
        version: '1.0.0',
        lastModified: new Date('2024-01-01'),
        createdBy: 'test',
        tags: ['template', 'coffee_shop']
      }
    }
  ],
  pages: [
    {
      id: 'home-page',
      pageId: 'home-page',
      name: 'Home',
      path: '/',
      type: 'page',
      components: ['template-1'],
      metadata: {
        title: 'Coffee Shop Home',
        description: 'Welcome to our coffee shop'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ],
  styling: {
    theme: {
      name: 'coffee_shop_theme',
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#F4A460',
      neutral: '#D2B48C',
      success: '#228B22',
      warning: '#FF8C00',
      error: '#DC143C'
    },
    colors: {},
    fonts: {},
    spacing: {},
    breakpoints: {}
  },
  conversationHistory: {
    messages: [],
    currentContext: 'Creating coffee shop website',
    lastIntent: 'create_website',
    lastAction: 'template_selection',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  userPreferences: {
    language: 'th',
    theme: 'light',
    autoSave: true,
    notifications: true,
    customSettings: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  lastModified: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01')
};

describe('SSOT Implementation Tests', () => {
  beforeEach(() => {
    // Clear any existing data
    projectContextStore.clearCache();
  });

  afterEach(() => {
    // Cleanup
    projectContextStore.clearCache();
  });

  describe('ProjectContextStore SSOT Tests', () => {
    test('should maintain single source of truth', async () => {
      // Test 1: Same data from multiple calls
      const context1 = await projectContextStore.getProjectContext('test-project-123');
      const context2 = await projectContextStore.getProjectContext('test-project-123');
      
      // Should return same reference (if cached) or same data
      expect(context1).toEqual(context2);
    });

    test('should update SSOT when context changes', async () => {
      // Create initial context
      const initialContext = await projectContextStore.updateProjectContext('test-project-123', {
        status: 'created',
        projectType: 'coffee_shop'
      });

      expect(initialContext).toBeTruthy();
      expect(initialContext?.status).toBe('created');

      // Update context
      const updatedContext = await projectContextStore.updateProjectContext('test-project-123', {
        status: 'in_progress'
      });

      expect(updatedContext).toBeTruthy();
      expect(updatedContext?.status).toBe('in_progress');

      // Verify SSOT is updated
      const retrievedContext = await projectContextStore.getProjectContext('test-project-123');
      expect(retrievedContext?.status).toBe('in_progress');
    });

    test('should handle concurrent updates correctly', async () => {
      const projectId = 'concurrent-test-123';
      
      // Create initial context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      // Simulate concurrent updates
      const update1 = projectContextStore.updateProjectContext(projectId, {
        status: 'in_progress'
      });

      const update2 = projectContextStore.updateProjectContext(projectId, {
        status: 'template_selected'
      });

      // Wait for both updates
      const [result1, result2] = await Promise.all([update1, update2]);

      // At least one should succeed
      expect(result1 || result2).toBeTruthy();

      // Final state should be consistent
      const finalContext = await projectContextStore.getProjectContext(projectId);
      expect(finalContext).toBeTruthy();
      expect(['in_progress', 'template_selected']).toContain(finalContext?.status);
    });

    test('should maintain cache consistency', async () => {
      const projectId = 'cache-test-123';
      
      // First call - should hit database
      const context1 = await projectContextStore.getProjectContext(projectId);
      
      // Second call - should hit cache
      const context2 = await projectContextStore.getProjectContext(projectId);
      
      // Should be same data
      expect(context1).toEqual(context2);
      
      // Update context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'updated'
      });
      
      // Next call should get updated data
      const context3 = await projectContextStore.getProjectContext(projectId);
      expect(context3?.status).toBe('updated');
    });
  });

  describe('Real-time Synchronization Tests', () => {
    test('should notify subscribers on context update', async () => {
      const projectId = 'subscriber-test-123';
      let updateReceived = false;
      let receivedContext: any = null;

      // Subscribe to updates
      const unsubscribe = projectContextStore.subscribe(projectId, (context) => {
        updateReceived = true;
        receivedContext = context;
      });

      // Update context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'updated',
        projectType: 'coffee_shop'
      });

      // Wait for notification
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(updateReceived).toBe(true);
      expect(receivedContext).toBeTruthy();
      expect(receivedContext.status).toBe('updated');

      unsubscribe();
    });

    test('should handle multiple subscribers', async () => {
      const projectId = 'multi-subscriber-test-123';
      const subscribers: any[] = [];
      let notificationCount = 0;

      // Create multiple subscribers
      for (let i = 0; i < 3; i++) {
        const unsubscribe = projectContextStore.subscribe(projectId, (context) => {
          notificationCount++;
          subscribers.push(context);
        });
      }

      // Update context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'updated'
      });

      // Wait for notifications
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notificationCount).toBe(3);
      expect(subscribers).toHaveLength(3);

      // All subscribers should receive same context
      subscribers.forEach(context => {
        expect(context.status).toBe('updated');
      });
    });
  });

  describe('Data Validation Tests', () => {
    test('should validate project context correctly', () => {
      const validationResult = ProjectContextValidator.validateProjectContext(mockProjectContext);
      
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
    });

    test('should catch validation errors', () => {
      const invalidContext = {
        ...mockProjectContext,
        projectId: '', // Invalid: empty projectId
        status: 'invalid_status' as any, // Invalid: unknown status
        components: [
          {
            ...mockProjectContext.components[0],
            id: '', // Invalid: empty component id
            type: 'invalid_type' as any // Invalid: unknown type
          }
        ]
      };

      const validationResult = ProjectContextValidator.validateProjectContext(invalidContext);
      
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
    });

    test('should validate business logic rules', () => {
      const incompleteContext = {
        ...mockProjectContext,
        status: 'completed' as any,
        components: [] // Invalid: completed project with no components
      };

      const validationResult = ProjectContextValidator.validateProjectContext(incompleteContext);
      
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(error => 
        error.includes('Completed project must have at least one component')
      )).toBe(true);
    });
  });

  describe('Data Consistency Tests', () => {
    test('should check data consistency', async () => {
      const projectId = 'consistency-test-123';
      
      // Create context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop',
        components: [mockProjectContext.components[0]]
      });

      // Check consistency
      const consistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
      
      expect(consistencyResult).toBeTruthy();
      expect(consistencyResult.timestamp).toBeTruthy();
    });

    test('should detect inconsistencies', async () => {
      const projectId = 'inconsistency-test-123';
      
      // Create context with inconsistencies
      await projectContextStore.updateProjectContext(projectId, {
        status: 'completed',
        projectType: 'coffee_shop',
        components: [] // Inconsistent: completed project with no components
      });

      // Check consistency
      const consistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
      
      expect(consistencyResult.isConsistent).toBe(false);
      expect(consistencyResult.inconsistencies.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple rapid updates', async () => {
      const projectId = 'performance-test-123';
      const updateCount = 100;
      const startTime = Date.now();

      // Create initial context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      // Perform multiple rapid updates
      const updates = [];
      for (let i = 0; i < updateCount; i++) {
        updates.push(
          projectContextStore.updateProjectContext(projectId, {
            status: `update_${i}` as any
          })
        );
      }

      await Promise.all(updates);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Performed ${updateCount} updates in ${duration}ms`);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify final state
      const finalContext = await projectContextStore.getProjectContext(projectId);
      expect(finalContext).toBeTruthy();
    });

    test('should handle concurrent reads efficiently', async () => {
      const projectId = 'concurrent-read-test-123';
      
      // Create context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      const readCount = 50;
      const startTime = Date.now();

      // Perform concurrent reads
      const reads = [];
      for (let i = 0; i < readCount; i++) {
        reads.push(projectContextStore.getProjectContext(projectId));
      }

      const results = await Promise.all(reads);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Performed ${readCount} reads in ${duration}ms`);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second

      // All reads should return same data
      results.forEach(result => {
        expect(result).toBeTruthy();
        expect(result?.projectId).toBe(projectId);
      });
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid project IDs gracefully', async () => {
      const invalidProjectId = 'invalid-project-123';
      
      const context = await projectContextStore.getProjectContext(invalidProjectId);
      expect(context).toBeNull();
    });

    test('should handle update errors gracefully', async () => {
      const projectId = 'error-test-123';
      
      // Try to update non-existent project
      const result = await projectContextStore.updateProjectContext(projectId, {
        status: 'updated'
      });

      // Should handle gracefully (either create or return null)
      expect(result).toBeDefined();
    });

    test('should handle validation errors gracefully', () => {
      const invalidContext = {
        ...mockProjectContext,
        projectId: null as any // Invalid type
      };

      expect(() => {
        ProjectContextValidator.validateProjectContext(invalidContext);
      }).not.toThrow();
    });
  });
});

describe('SSOT Integration Tests', () => {
  test('should maintain SSOT across all components', async () => {
    const projectId = 'integration-test-123';
    
    // Create context through store
    await projectContextStore.updateProjectContext(projectId, {
      status: 'created',
      projectType: 'coffee_shop',
      components: [mockProjectContext.components[0]]
    });

    // Validate through validator
    const context = await projectContextStore.getProjectContext(projectId);
    expect(context).toBeTruthy();
    
    const validationResult = ProjectContextValidator.validateProjectContext(context!);
    expect(validationResult.isValid).toBe(true);

    // Check consistency
    const consistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
    expect(consistencyResult.isConsistent).toBe(true);

    // Update and verify all components are in sync
    await projectContextStore.updateProjectContext(projectId, {
      status: 'in_progress'
    });

    const updatedContext = await projectContextStore.getProjectContext(projectId);
    expect(updatedContext?.status).toBe('in_progress');

    const updatedValidationResult = ProjectContextValidator.validateProjectContext(updatedContext!);
    expect(updatedValidationResult.isValid).toBe(true);

    const updatedConsistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
    expect(updatedConsistencyResult.isConsistent).toBe(true);
  });
});
