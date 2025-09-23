/**
 * SSOT Integration Test
 * End-to-end testing of the complete SSOT implementation
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { projectContextStore } from '../../midori/agents/orchestrator/stores/projectContextStore';
import { projectContextSync } from '../../midori/agents/orchestrator/sync/projectContextSync';
import { ProjectContextValidator } from '../../midori/agents/orchestrator/validators/projectContextValidator';
import { dataConsistencyChecker } from '../../midori/agents/orchestrator/validators/dataConsistencyChecker';
import { projectContextMetrics } from '../../midori/agents/orchestrator/monitoring/projectContextMetrics';

describe('SSOT Integration Tests', () => {
  const testProjectId = 'integration-test-123';
  
  beforeEach(() => {
    // Clear all data before each test
    projectContextStore.clearCache();
    dataConsistencyChecker.clearHistory();
    projectContextMetrics.clearMetrics();
  });

  afterEach(() => {
    // Cleanup after each test
    projectContextStore.clearCache();
    dataConsistencyChecker.clearHistory();
    projectContextMetrics.clearMetrics();
  });

  describe('Complete SSOT Workflow', () => {
    test('should handle complete project lifecycle with SSOT', async () => {
      console.log('🚀 Starting complete SSOT workflow test');

      // Step 1: Create project context
      console.log('📝 Step 1: Creating project context');
      const initialContext = await projectContextStore.updateProjectContext(testProjectId, {
        status: 'created',
        projectType: 'coffee_shop',
        userPreferences: {
          language: 'th',
          theme: 'light'
        }
      });

      expect(initialContext).toBeTruthy();
      expect(initialContext?.status).toBe('created');
      expect(initialContext?.projectType).toBe('coffee_shop');

      // Step 2: Validate initial context
      console.log('🔍 Step 2: Validating initial context');
      const validationResult = ProjectContextValidator.validateProjectContext(initialContext!);
      expect(validationResult.isValid).toBe(true);

      // Step 3: Check consistency
      console.log('🔍 Step 3: Checking data consistency');
      const consistencyResult = await dataConsistencyChecker.checkProjectConsistency(testProjectId);
      expect(consistencyResult.isConsistent).toBe(true);

      // Step 4: Simulate template selection
      console.log('🎨 Step 4: Simulating template selection');
      const templateContext = await projectContextStore.updateProjectContext(testProjectId, {
        status: 'template_selected',
        components: [{
          id: 'template-1',
          componentId: 'template-1',
          name: 'Coffee Shop Template',
          type: 'template',
          props: [],
          styling: {
            colors: { primary: '#8B4513' },
            fonts: { heading: 'Inter' }
          },
          location: 'templates' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            version: '1.0.0',
            lastModified: new Date(),
            createdBy: 'frontend_agent',
            tags: ['template', 'coffee_shop']
          }
        }]
      });

      expect(templateContext).toBeTruthy();
      expect(templateContext?.status).toBe('template_selected');
      expect(templateContext?.components).toHaveLength(1);

      // Step 5: Validate after template selection
      console.log('🔍 Step 5: Validating after template selection');
      const templateValidationResult = ProjectContextValidator.validateProjectContext(templateContext!);
      expect(templateValidationResult.isValid).toBe(true);

      // Step 6: Simulate customization
      console.log('🎨 Step 6: Simulating template customization');
      const customizedContext = await projectContextStore.updateProjectContext(testProjectId, {
        status: 'customizing',
        styling: {
          theme: {
            name: 'coffee_shop_theme',
            primary: '#8B4513',
            secondary: '#D2691E',
            accent: '#F4A460'
          },
          colors: {},
          fonts: {},
          spacing: {},
          breakpoints: {}
        }
      });

      expect(customizedContext).toBeTruthy();
      expect(customizedContext?.status).toBe('customizing');

      // Step 7: Complete project
      console.log('✅ Step 7: Completing project');
      const completedContext = await projectContextStore.updateProjectContext(testProjectId, {
        status: 'completed',
        pages: [{
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
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      });

      expect(completedContext).toBeTruthy();
      expect(completedContext?.status).toBe('completed');
      expect(completedContext?.pages).toHaveLength(1);

      // Step 8: Final validation
      console.log('🔍 Step 8: Final validation');
      const finalValidationResult = ProjectContextValidator.validateProjectContext(completedContext!);
      expect(finalValidationResult.isValid).toBe(true);

      // Step 9: Final consistency check
      console.log('🔍 Step 9: Final consistency check');
      const finalConsistencyResult = await dataConsistencyChecker.checkProjectConsistency(testProjectId);
      expect(finalConsistencyResult.isConsistent).toBe(true);

      // Step 10: Verify metrics
      console.log('📊 Step 10: Verifying metrics');
      const metrics = projectContextMetrics.getPerformanceMetrics();
      expect(metrics.averageUpdateDuration).toBeGreaterThan(0);
      expect(metrics.errorRate).toBe(0);

      console.log('✅ Complete SSOT workflow test passed');
    });

    test('should handle real-time synchronization', async () => {
      console.log('🔄 Starting real-time sync test');

      const projectId = 'sync-test-123';
      let updateReceived = false;
      let receivedContext: any = null;

      // Subscribe to updates
      const unsubscribe = projectContextStore.subscribe(projectId, (context) => {
        updateReceived = true;
        receivedContext = context;
        console.log('📡 Received real-time update:', context.status);
      });

      // Create initial context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      // Wait for notification
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(updateReceived).toBe(true);
      expect(receivedContext).toBeTruthy();
      expect(receivedContext.status).toBe('created');

      // Update context
      updateReceived = false;
      await projectContextStore.updateProjectContext(projectId, {
        status: 'in_progress'
      });

      // Wait for notification
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(updateReceived).toBe(true);
      expect(receivedContext.status).toBe('in_progress');

      unsubscribe();
      console.log('✅ Real-time sync test passed');
    });

    test('should handle concurrent operations correctly', async () => {
      console.log('⚡ Starting concurrent operations test');

      const projectId = 'concurrent-test-123';
      const operationCount = 10;

      // Create initial context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      // Perform concurrent updates
      const updates = [];
      for (let i = 0; i < operationCount; i++) {
        updates.push(
          projectContextStore.updateProjectContext(projectId, {
            status: `update_${i}` as any
          })
        );
      }

      const results = await Promise.all(updates);
      const successfulUpdates = results.filter(r => r !== null);

      // At least some updates should succeed
      expect(successfulUpdates.length).toBeGreaterThan(0);

      // Final state should be consistent
      const finalContext = await projectContextStore.getProjectContext(projectId);
      expect(finalContext).toBeTruthy();
      expect(finalContext?.projectId).toBe(projectId);

      // Check consistency
      const consistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
      expect(consistencyResult.isConsistent).toBe(true);

      console.log('✅ Concurrent operations test passed');
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle invalid project IDs gracefully', async () => {
      console.log('❌ Testing invalid project ID handling');

      const invalidProjectId = 'invalid-project-123';
      
      // Try to get non-existent project
      const context = await projectContextStore.getProjectContext(invalidProjectId);
      expect(context).toBeNull();

      // Try to update non-existent project
      const updateResult = await projectContextStore.updateProjectContext(invalidProjectId, {
        status: 'updated'
      });
      expect(updateResult).toBeNull();

      console.log('✅ Invalid project ID handling test passed');
    });

    test('should handle validation errors gracefully', async () => {
      console.log('❌ Testing validation error handling');

      const projectId = 'validation-error-test-123';
      
      // Create context with validation errors
      const invalidContext = {
        projectId: '', // Invalid: empty projectId
        projectType: 'coffee_shop',
        status: 'created',
        components: [],
        pages: [],
        styling: {
          theme: { name: 'test' },
          colors: {},
          fonts: {},
          spacing: {},
          breakpoints: {}
        },
        conversationHistory: {
          messages: [],
          currentContext: '',
          lastIntent: '',
          lastAction: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        userPreferences: {
          language: 'th',
          theme: 'light',
          autoSave: true,
          notifications: true,
          customSettings: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        lastModified: new Date(),
        createdAt: new Date()
      };

      const validationResult = ProjectContextValidator.validateProjectContext(invalidContext as any);
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);

      console.log('✅ Validation error handling test passed');
    });

    test('should recover from consistency issues', async () => {
      console.log('🔧 Testing consistency recovery');

      const projectId = 'consistency-recovery-test-123';
      
      // Create valid context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      // Check initial consistency
      let consistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
      expect(consistencyResult.isConsistent).toBe(true);

      // Simulate data corruption (this would be caught by validation)
      const context = await projectContextStore.getProjectContext(projectId);
      if (context) {
        // This would normally be prevented by validation
        const corruptedContext = {
          ...context,
          status: 'completed' as any,
          components: [] // Inconsistent: completed but no components
        };

        const validationResult = ProjectContextValidator.validateProjectContext(corruptedContext);
        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.some(e => e.includes('Completed project must have at least one component'))).toBe(true);
      }

      console.log('✅ Consistency recovery test passed');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle high-frequency updates', async () => {
      console.log('⚡ Testing high-frequency updates');

      const projectId = 'high-frequency-test-123';
      const updateCount = 100;
      const startTime = Date.now();

      // Create initial context
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      // Perform high-frequency updates
      for (let i = 0; i < updateCount; i++) {
        await projectContextStore.updateProjectContext(projectId, {
          status: `update_${i}` as any
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Performed ${updateCount} updates in ${duration}ms`);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds

      // Verify final state
      const finalContext = await projectContextStore.getProjectContext(projectId);
      expect(finalContext).toBeTruthy();

      console.log('✅ High-frequency updates test passed');
    });

    test('should handle multiple projects simultaneously', async () => {
      console.log('🏢 Testing multiple projects simultaneously');

      const projectCount = 10;
      const projects = [];

      // Create multiple projects
      for (let i = 0; i < projectCount; i++) {
        const projectId = `multi-project-${i}`;
        projects.push(projectId);
        
        await projectContextStore.updateProjectContext(projectId, {
          status: 'created',
          projectType: 'coffee_shop'
        });
      }

      // Update all projects concurrently
      const updatePromises = projects.map(projectId =>
        projectContextStore.updateProjectContext(projectId, {
          status: 'in_progress'
        })
      );

      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(r => r !== null);

      expect(successfulUpdates.length).toBe(projectCount);

      // Verify all projects are updated
      for (const projectId of projects) {
        const context = await projectContextStore.getProjectContext(projectId);
        expect(context).toBeTruthy();
        expect(context?.status).toBe('in_progress');
      }

      console.log('✅ Multiple projects test passed');
    });
  });

  describe('Metrics and Monitoring', () => {
    test('should collect comprehensive metrics', async () => {
      console.log('📊 Testing metrics collection');

      const projectId = 'metrics-test-123';
      
      // Perform various operations
      await projectContextStore.getProjectContext(projectId); // Cache miss
      await projectContextStore.getProjectContext(projectId); // Cache hit
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });
      await projectContextStore.updateProjectContext(projectId, {
        status: 'in_progress'
      });

      // Check metrics
      const metrics = projectContextMetrics.getPerformanceMetrics();
      expect(metrics.averageGetDuration).toBeGreaterThan(0);
      expect(metrics.averageUpdateDuration).toBeGreaterThan(0);
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
      expect(metrics.errorRate).toBe(0);

      // Check operation counts
      const summary = projectContextMetrics.getMetricsSummary();
      expect(summary.totalOperations).toBeGreaterThan(0);
      expect(summary.successfulOperations).toBeGreaterThan(0);

      console.log('✅ Metrics collection test passed');
    });

    test('should track error rates correctly', async () => {
      console.log('📊 Testing error rate tracking');

      const projectId = 'error-tracking-test-123';
      
      // Perform operations that will fail
      await projectContextStore.getProjectContext('non-existent-project');
      await projectContextStore.updateProjectContext('non-existent-project', {
        status: 'updated'
      });

      // Perform successful operations
      await projectContextStore.updateProjectContext(projectId, {
        status: 'created',
        projectType: 'coffee_shop'
      });

      // Check error analysis
      const errorAnalysis = projectContextMetrics.getErrorAnalysis();
      expect(errorAnalysis.totalErrors).toBeGreaterThan(0);

      console.log('✅ Error rate tracking test passed');
    });
  });
});
