/**
 * Data Consistency Checker
 * Ensures data consistency across different sources and states
 */

import { ProjectContextData } from '../types/projectContext';
import { projectContextStore } from '../stores/projectContextStore';

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  inconsistencies: ConsistencyIssue[];
  suggestions: string[];
  timestamp: string;
}

export interface ConsistencyIssue {
  type: 'data_mismatch' | 'missing_reference' | 'invalid_state' | 'cache_inconsistency';
  severity: 'error' | 'warning' | 'info';
  description: string;
  affectedFields: string[];
  suggestedFix?: string;
}

export class DataConsistencyChecker {
  private static instance: DataConsistencyChecker;
  private checkHistory: Map<string, ConsistencyCheckResult[]> = new Map();

  private constructor() {
    console.log('🔍 DataConsistencyChecker initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): DataConsistencyChecker {
    if (!DataConsistencyChecker.instance) {
      DataConsistencyChecker.instance = new DataConsistencyChecker();
    }
    return DataConsistencyChecker.instance;
  }

  /**
   * Check data consistency for a project
   */
  async checkProjectConsistency(projectId: string): Promise<ConsistencyCheckResult> {
    console.log(`🔍 Checking data consistency for project ${projectId}`);

    const result: ConsistencyCheckResult = {
      isConsistent: true,
      inconsistencies: [],
      suggestions: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Get current project context from SSOT
      const context = await projectContextStore.getProjectContext(projectId);
      if (!context) {
        result.inconsistencies.push({
          type: 'missing_reference',
          severity: 'error',
          description: 'Project context not found in database',
          affectedFields: ['projectId']
        });
        result.isConsistent = false;
        return result;
      }

      // Run consistency checks
      await this.checkInternalConsistency(context, result);
      await this.checkExternalConsistency(context, result);
      await this.checkStateConsistency(context, result);
      await this.checkReferenceConsistency(context, result);

      // Store check result
      this.storeCheckResult(projectId, result);

      console.log(`✅ Consistency check completed for ${projectId}: ${result.isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}`);
      if (result.inconsistencies.length > 0) {
        console.log(`❌ Found ${result.inconsistencies.length} inconsistencies`);
      }

      return result;
    } catch (error) {
      console.error(`❌ Error checking consistency for ${projectId}:`, error);
      result.inconsistencies.push({
        type: 'data_mismatch',
        severity: 'error',
        description: `Consistency check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedFields: ['all']
      });
      result.isConsistent = false;
      return result;
    }
  }

  /**
   * Check internal data consistency
   */
  private async checkInternalConsistency(context: ProjectContextData, result: ConsistencyCheckResult): Promise<void> {
    // Check required fields
    if (!context.projectId || !context.projectType || !context.status) {
      result.inconsistencies.push({
        type: 'data_mismatch',
        severity: 'error',
        description: 'Missing required fields',
        affectedFields: ['projectId', 'projectType', 'status'],
        suggestedFix: 'Ensure all required fields are populated'
      });
      result.isConsistent = false;
    }

    // Check timestamp consistency
    if (context.lastModified < context.createdAt) {
      result.inconsistencies.push({
        type: 'data_mismatch',
        severity: 'error',
        description: 'lastModified is earlier than createdAt',
        affectedFields: ['lastModified', 'createdAt'],
        suggestedFix: 'Update lastModified to be after createdAt'
      });
      result.isConsistent = false;
    }

    // Check component consistency
    for (const component of context.components) {
      if (!component.id || !component.name) {
        result.inconsistencies.push({
          type: 'data_mismatch',
          severity: 'warning',
          description: `Component missing required fields: ${component.id || 'unknown'}`,
          affectedFields: ['components'],
          suggestedFix: 'Ensure all components have id and name'
        });
      }

      // Check metadata consistency
      if (component.metadata) {
        if (component.metadata.lastModified && component.metadata.lastModified > context.lastModified) {
          result.inconsistencies.push({
            type: 'data_mismatch',
            severity: 'warning',
            description: `Component ${component.id} metadata is newer than project context`,
            affectedFields: ['components', 'lastModified'],
            suggestedFix: 'Update project lastModified or component metadata'
          });
        }
      }
    }

    // Check page consistency
    for (const page of context.pages) {
      if (!page.id || !page.name || !page.path) {
        result.inconsistencies.push({
          type: 'data_mismatch',
          severity: 'warning',
          description: `Page missing required fields: ${page.id || 'unknown'}`,
          affectedFields: ['pages'],
          suggestedFix: 'Ensure all pages have id, name, and path'
        });
      }
    }
  }

  /**
   * Check external consistency (with other systems)
   */
  private async checkExternalConsistency(context: ProjectContextData, result: ConsistencyCheckResult): Promise<void> {
    // Check if project exists in database
    try {
      const dbContext = await projectContextStore.getProjectContext(context.projectId);
      if (!dbContext) {
        result.inconsistencies.push({
          type: 'missing_reference',
          severity: 'error',
          description: 'Project not found in database',
          affectedFields: ['projectId'],
          suggestedFix: 'Create project in database or check projectId'
        });
        result.isConsistent = false;
        return;
      }

      // Compare with database version
      if (dbContext.lastModified.getTime() !== context.lastModified.getTime()) {
        result.inconsistencies.push({
          type: 'cache_inconsistency',
          severity: 'warning',
          description: 'Project context is out of sync with database',
          affectedFields: ['lastModified'],
          suggestedFix: 'Refresh project context from database'
        });
      }
    } catch (error) {
      result.inconsistencies.push({
        type: 'data_mismatch',
        severity: 'error',
        description: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        affectedFields: ['database'],
        suggestedFix: 'Check database connection and project existence'
      });
      result.isConsistent = false;
    }
  }

  /**
   * Check state consistency
   */
  private async checkStateConsistency(context: ProjectContextData, result: ConsistencyCheckResult): Promise<void> {
    // Check status consistency
    if (context.status === 'completed' && context.components.length === 0) {
      result.inconsistencies.push({
        type: 'invalid_state',
        severity: 'error',
        description: 'Completed project has no components',
        affectedFields: ['status', 'components'],
        suggestedFix: 'Add components or change status to in_progress'
      });
      result.isConsistent = false;
    }

    // Note: ComponentType doesn't include 'template', so we check for custom components instead
    // template_selected status can have any component types, so we just verify components exist
    if (context.status === 'template_selected' && context.components.length === 0) {
      result.inconsistencies.push({
        type: 'invalid_state',
        severity: 'warning',
        description: 'Template selected status without template component',
        affectedFields: ['status', 'components'],
        suggestedFix: 'Add template component or change status'
      });
      result.isConsistent = false;
    }

    // Check conversation history consistency
    if (context.conversationHistory) {
      if (context.conversationHistory.lastAction && !context.conversationHistory.lastIntent) {
        result.inconsistencies.push({
          type: 'data_mismatch',
          severity: 'warning',
          description: 'Conversation has lastAction but no lastIntent',
          affectedFields: ['conversationHistory'],
          suggestedFix: 'Ensure lastIntent is set when lastAction is set'
        });
      }
    }

    // Check user preferences consistency
    if (context.userPreferences) {
      if (context.userPreferences.language === 'th' && context.userPreferences.theme === 'dark') {
        result.suggestions.push('Consider using light theme for Thai language content');
      }
    }
  }

  /**
   * Check reference consistency
   */
  private async checkReferenceConsistency(context: ProjectContextData, result: ConsistencyCheckResult): Promise<void> {
    // Check component references in pages
    const componentIds = new Set(context.components.map(c => c.id));
    
    for (const page of context.pages) {
      if (page.components) {
        for (const componentId of page.components) {
          if (!componentIds.has(componentId)) {
            result.inconsistencies.push({
              type: 'missing_reference',
              severity: 'error',
              description: `Page ${page.id} references non-existent component ${componentId}`,
              affectedFields: ['pages', 'components'],
              suggestedFix: 'Remove reference or create missing component'
            });
            result.isConsistent = false;
          }
        }
      }
    }

    // Check for orphaned components
    const referencedComponentIds = new Set<string>();
    context.pages.forEach(page => {
      if (page.components) {
        page.components.forEach(id => referencedComponentIds.add(id));
      }
    });

    const orphanedComponents = context.components.filter(c => !referencedComponentIds.has(c.id));
    if (orphanedComponents.length > 0) {
      result.inconsistencies.push({
        type: 'data_mismatch',
        severity: 'warning',
        description: `Orphaned components found: ${orphanedComponents.map(c => c.name).join(', ')}`,
        affectedFields: ['components'],
        suggestedFix: 'Add components to pages or remove unused components'
      });
    }
  }

  /**
   * Store check result
   */
  private storeCheckResult(projectId: string, result: ConsistencyCheckResult): void {
    if (!this.checkHistory.has(projectId)) {
      this.checkHistory.set(projectId, []);
    }
    
    const history = this.checkHistory.get(projectId)!;
    history.push(result);
    
    // Keep only last 10 checks
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Get check history for a project
   */
  getCheckHistory(projectId: string): ConsistencyCheckResult[] {
    return this.checkHistory.get(projectId) || [];
  }

  /**
   * Get consistency statistics
   */
  getConsistencyStats(): {
    totalChecks: number;
    consistentProjects: number;
    inconsistentProjects: number;
    averageIssuesPerProject: number;
  } {
    let totalChecks = 0;
    let consistentProjects = 0;
    let inconsistentProjects = 0;
    let totalIssues = 0;

    for (const [projectId, history] of this.checkHistory) {
      const latestCheck = history[history.length - 1];
      if (latestCheck) {
        totalChecks++;
        if (latestCheck.isConsistent) {
          consistentProjects++;
        } else {
          inconsistentProjects++;
        }
        totalIssues += latestCheck.inconsistencies.length;
      }
    }

    return {
      totalChecks,
      consistentProjects,
      inconsistentProjects,
      averageIssuesPerProject: totalChecks > 0 ? totalIssues / totalChecks : 0
    };
  }

  /**
   * Clear check history
   */
  clearHistory(projectId?: string): void {
    if (projectId) {
      this.checkHistory.delete(projectId);
      console.log(`🗑️ Cleared check history for project ${projectId}`);
    } else {
      this.checkHistory.clear();
      console.log(`🗑️ Cleared all check history`);
    }
  }
}

// Export singleton instance
export const dataConsistencyChecker = DataConsistencyChecker.getInstance();
