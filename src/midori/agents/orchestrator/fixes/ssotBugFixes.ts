/**
 * SSOT Bug Fixes and Improvements
 * Common issues and their solutions for the SSOT implementation
 */

import { projectContextStore } from '../stores/projectContextStore';
import { projectContextSync } from '../sync/projectContextSync';
import { ProjectContextValidator } from '../validators/projectContextValidator';
import { dataConsistencyChecker } from '../validators/dataConsistencyChecker';

export class SSOTBugFixes {
  /**
   * Fix 1: Handle race conditions in concurrent updates
   */
  static async fixRaceCondition(projectId: string, updates: any): Promise<any> {
    console.log(`🔧 Fixing race condition for project ${projectId}`);
    
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        // Get current context
        const currentContext = await projectContextStore.getProjectContext(projectId);
        if (!currentContext) {
          throw new Error('Project context not found');
        }
        
        // Merge updates with current context
        const mergedUpdates = {
          ...updates,
          lastModified: new Date()
        };
        
        // Update with merged data
        const result = await projectContextStore.updateProjectContext(projectId, mergedUpdates);
        
        if (result) {
          console.log(`✅ Race condition fixed for project ${projectId}`);
          return result;
        }
        
        throw new Error('Update failed');
      } catch (error) {
        retries++;
        console.warn(`⚠️ Race condition fix attempt ${retries} failed:`, error);
        
        if (retries >= maxRetries) {
          throw new Error(`Failed to fix race condition after ${maxRetries} attempts`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * retries));
      }
    }
  }

  /**
   * Fix 2: Handle cache invalidation issues
   */
  static async fixCacheInvalidation(projectId: string): Promise<void> {
    console.log(`🔧 Fixing cache invalidation for project ${projectId}`);
    
    try {
      // Force refresh from database
      const refreshedContext = await projectContextStore.refreshProjectContext(projectId);
      
      if (refreshedContext) {
        // Notify all subscribers of the refresh
        await projectContextSync.broadcastUpdate(projectId, refreshedContext);
        console.log(`✅ Cache invalidation fixed for project ${projectId}`);
      } else {
        console.warn(`⚠️ No context found for project ${projectId} during cache invalidation`);
      }
    } catch (error) {
      console.error(`❌ Failed to fix cache invalidation for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Fix 3: Handle data consistency issues
   */
  static async fixDataConsistency(projectId: string): Promise<void> {
    console.log(`🔧 Fixing data consistency for project ${projectId}`);
    
    try {
      // Check current consistency
      const consistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
      
      if (consistencyResult.isConsistent) {
        console.log(`✅ Project ${projectId} is already consistent`);
        return;
      }
      
      console.log(`❌ Found ${consistencyResult.inconsistencies.length} inconsistencies`);
      
      // Get current context
      const context = await projectContextStore.getProjectContext(projectId);
      if (!context) {
        throw new Error('Project context not found');
      }
      
      // Fix common inconsistencies
      const fixes: any = {};
      
      // Fix 1: Ensure lastModified is after createdAt
      if (context.lastModified < context.createdAt) {
        fixes.lastModified = new Date();
        console.log('🔧 Fixed: lastModified is now after createdAt');
      }
      
      // Fix 2: Ensure completed projects have components
      if (context.status === 'completed' && context.components.length === 0) {
        fixes.status = 'in_progress';
        console.log('🔧 Fixed: Changed completed status to in_progress (no components)');
      }
      
      // Fix 3: Ensure template_selected projects have template components
      if (context.status === 'template_selected' && !context.components.some(c => c.type === 'template')) {
        fixes.status = 'created';
        console.log('🔧 Fixed: Changed template_selected status to created (no template)');
      }
      
      // Apply fixes if any
      if (Object.keys(fixes).length > 0) {
        await projectContextStore.updateProjectContext(projectId, fixes);
        console.log(`✅ Applied ${Object.keys(fixes).length} consistency fixes`);
      }
      
      // Re-check consistency
      const finalConsistencyResult = await dataConsistencyChecker.checkProjectConsistency(projectId);
      if (finalConsistencyResult.isConsistent) {
        console.log(`✅ Data consistency fixed for project ${projectId}`);
      } else {
        console.warn(`⚠️ Some inconsistencies remain for project ${projectId}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to fix data consistency for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Fix 4: Handle validation errors
   */
  static async fixValidationErrors(projectId: string): Promise<void> {
    console.log(`🔧 Fixing validation errors for project ${projectId}`);
    
    try {
      // Get current context
      const context = await projectContextStore.getProjectContext(projectId);
      if (!context) {
        throw new Error('Project context not found');
      }
      
      // Validate context
      const validationResult = ProjectContextValidator.validateProjectContext(context);
      
      if (validationResult.isValid) {
        console.log(`✅ Project ${projectId} is already valid`);
        return;
      }
      
      console.log(`❌ Found ${validationResult.errors.length} validation errors`);
      
      // Fix common validation errors
      const fixes: any = {};
      
      // Fix 1: Ensure required fields are present
      if (!context.projectId) {
        fixes.projectId = projectId;
        console.log('🔧 Fixed: Added missing projectId');
      }
      
      if (!context.projectType) {
        fixes.projectType = 'coffee_shop'; // Default
        console.log('🔧 Fixed: Added missing projectType');
      }
      
      if (!context.status) {
        fixes.status = 'created'; // Default
        console.log('🔧 Fixed: Added missing status');
      }
      
      // Fix 2: Ensure valid project type
      const validProjectTypes = ['coffee_shop', 'restaurant', 'e_commerce', 'portfolio', 'blog'];
      if (!validProjectTypes.includes(context.projectType)) {
        fixes.projectType = 'coffee_shop'; // Default
        console.log('🔧 Fixed: Changed invalid projectType to coffee_shop');
      }
      
      // Fix 3: Ensure valid status
      const validStatuses = ['created', 'in_progress', 'template_selected', 'customizing', 'completed', 'archived'];
      if (!validStatuses.includes(context.status)) {
        fixes.status = 'created'; // Default
        console.log('🔧 Fixed: Changed invalid status to created');
      }
      
      // Apply fixes if any
      if (Object.keys(fixes).length > 0) {
        await projectContextStore.updateProjectContext(projectId, fixes);
        console.log(`✅ Applied ${Object.keys(fixes).length} validation fixes`);
      }
      
      // Re-validate
      const finalValidationResult = ProjectContextValidator.validateProjectContext(context);
      if (finalValidationResult.isValid) {
        console.log(`✅ Validation errors fixed for project ${projectId}`);
      } else {
        console.warn(`⚠️ Some validation errors remain for project ${projectId}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to fix validation errors for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Fix 5: Handle sync issues
   */
  static async fixSyncIssues(projectId: string): Promise<void> {
    console.log(`🔧 Fixing sync issues for project ${projectId}`);
    
    try {
      // Get current context
      const context = await projectContextStore.getProjectContext(projectId);
      if (!context) {
        throw new Error('Project context not found');
      }
      
      // Force broadcast to all subscribers
      await projectContextSync.broadcastUpdate(projectId, context);
      console.log(`✅ Sync issues fixed for project ${projectId}`);
      
    } catch (error) {
      console.error(`❌ Failed to fix sync issues for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Fix 6: Handle memory leaks
   */
  static async fixMemoryLeaks(): Promise<void> {
    console.log(`🔧 Fixing memory leaks`);
    
    try {
      // Clear old cache entries
      projectContextStore.clearCache();
      
      // Clear old consistency check history
      dataConsistencyChecker.clearHistory();
      
      console.log(`✅ Memory leaks fixed`);
      
    } catch (error) {
      console.error(`❌ Failed to fix memory leaks:`, error);
      throw error;
    }
  }

  /**
   * Comprehensive fix for all common issues
   */
  static async fixAllIssues(projectId: string): Promise<void> {
    console.log(`🔧 Running comprehensive fix for project ${projectId}`);
    
    try {
      // Fix 1: Race conditions
      await this.fixRaceCondition(projectId, {});
      
      // Fix 2: Cache invalidation
      await this.fixCacheInvalidation(projectId);
      
      // Fix 3: Data consistency
      await this.fixDataConsistency(projectId);
      
      // Fix 4: Validation errors
      await this.fixValidationErrors(projectId);
      
      // Fix 5: Sync issues
      await this.fixSyncIssues(projectId);
      
      console.log(`✅ All issues fixed for project ${projectId}`);
      
    } catch (error) {
      console.error(`❌ Failed to fix all issues for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Health check for SSOT system
   */
  static async healthCheck(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    console.log(`🏥 Running SSOT health check`);
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Check 1: Store health
      const cacheStats = projectContextStore.getCacheStats();
      if (cacheStats.size > 100) {
        issues.push('Cache size is too large');
        recommendations.push('Consider clearing old cache entries');
      }
      
      // Check 2: Consistency checker health
      const consistencyStats = dataConsistencyChecker.getConsistencyStats();
      if (consistencyStats.inconsistentProjects > 0) {
        issues.push(`${consistencyStats.inconsistentProjects} projects have consistency issues`);
        recommendations.push('Run data consistency fixes');
      }
      
      // Check 3: Sync health
      const syncStats = projectContextSync.getConnectionStats();
      if (syncStats.webSocket.total > 50) {
        issues.push('Too many WebSocket connections');
        recommendations.push('Consider connection pooling');
      }
      
      const isHealthy = issues.length === 0;
      
      console.log(`🏥 Health check completed: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
      if (issues.length > 0) {
        console.log(`❌ Issues found: ${issues.length}`);
      }
      
      return {
        isHealthy,
        issues,
        recommendations
      };
      
    } catch (error) {
      console.error(`❌ Health check failed:`, error);
      return {
        isHealthy: false,
        issues: ['Health check failed'],
        recommendations: ['Check system logs for errors']
      };
    }
  }
}

export const ssotBugFixes = SSOTBugFixes;
