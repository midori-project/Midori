/**
 * Project Context Store
 * Centralized state management for project context (SSOT)
 * Single Source of Truth for all project-related data
 */

import { ProjectContextData, UpdateProjectContextInput } from '../types/projectContext';
import { ProjectContextService } from '../services/projectContextService';
import { projectContextMetrics } from '../monitoring/projectContextMetrics';

export type ProjectContextSubscriber = (context: ProjectContextData) => void;

export class ProjectContextStore {
  private static instance: ProjectContextStore;
  private subscribers: Map<string, Set<ProjectContextSubscriber>> = new Map();
  private cache: Map<string, { context: ProjectContextData; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    console.log('🏪 ProjectContextStore initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProjectContextStore {
    if (!ProjectContextStore.instance) {
      ProjectContextStore.instance = new ProjectContextStore();
    }
    return ProjectContextStore.instance;
  }

  /**
   * Get project context from SSOT (database)
   * Always fetch from database to ensure data consistency
   */
  async getProjectContext(projectId: string): Promise<ProjectContextData | null> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      console.log(`🔍 Getting project context for ${projectId} from SSOT`);
      
      // Check cache first (for performance)
      const cached = this.cache.get(projectId);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        console.log(`📦 Using cached project context for ${projectId}`);
        projectContextMetrics.trackCacheOperation('hit', projectId, Date.now() - startTime);
        success = true;
        return cached.context;
      }

      // Always get from database (SSOT)
      const context = await ProjectContextService.getProjectContext(projectId);
      
      if (context) {
        // Update cache
        this.cache.set(projectId, {
          context,
          timestamp: Date.now()
        });
        console.log(`✅ Project context loaded from SSOT for ${projectId}`);
        success = true;
      } else {
        console.log(`⚠️ No project context found for ${projectId}`);
        success = true; // Not an error, just no data
      }

      return context;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Failed to get project context for ${projectId}:`, err);
      return null;
    } finally {
      const duration = Date.now() - startTime;
      projectContextMetrics.trackGetProjectContext(projectId, duration, success, error);
    }
  }

  /**
   * Update project context in SSOT (database)
   * This is the only way to update project context
   */
  async updateProjectContext(
    projectId: string, 
    updates: UpdateProjectContextInput['updates']
  ): Promise<ProjectContextData | null> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      console.log(`🔄 Updating project context for ${projectId} in SSOT`);
      
      // Update database first (SSOT)
      const updatedContext = await ProjectContextService.updateProjectContext({
        projectId,
        updates
      });

      if (updatedContext) {
        // Update cache
        this.cache.set(projectId, {
          context: updatedContext,
          timestamp: Date.now()
        });

        // Notify all subscribers immediately
        this.notifySubscribers(projectId, updatedContext);
        
        console.log(`✅ Project context updated in SSOT for ${projectId}`);
        success = true;
      }

      return updatedContext;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Failed to update project context for ${projectId}:`, err);
      return null;
    } finally {
      const duration = Date.now() - startTime;
      projectContextMetrics.trackUpdateProjectContext(projectId, duration, success, error, updates);
    }
  }

  /**
   * Subscribe to project context changes
   */
  subscribe(projectId: string, callback: ProjectContextSubscriber): () => void {
    if (!this.subscribers.has(projectId)) {
      this.subscribers.set(projectId, new Set());
    }
    
    this.subscribers.get(projectId)!.add(callback);
    console.log(`📡 Subscribed to project context changes for ${projectId}`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(projectId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(projectId);
        }
      }
      console.log(`📡 Unsubscribed from project context changes for ${projectId}`);
    };
  }

  /**
   * Notify all subscribers of project context changes
   */
  private notifySubscribers(projectId: string, context: ProjectContextData): void {
    const callbacks = this.subscribers.get(projectId);
    if (callbacks) {
      console.log(`📢 Notifying ${callbacks.size} subscribers for ${projectId}`);
      callbacks.forEach(callback => {
        try {
          callback(context);
        } catch (error) {
          console.error(`❌ Error notifying subscriber for ${projectId}:`, error);
        }
      });
    }
  }

  /**
   * Invalidate cache for a project
   */
  invalidateCache(projectId: string): void {
    this.cache.delete(projectId);
    console.log(`🗑️ Cache invalidated for ${projectId}`);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log(`🗑️ All cache cleared`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; projects: string[] } {
    return {
      size: this.cache.size,
      projects: Array.from(this.cache.keys())
    };
  }

  /**
   * Force refresh project context from database
   */
  async refreshProjectContext(projectId: string): Promise<ProjectContextData | null> {
    this.invalidateCache(projectId);
    return await this.getProjectContext(projectId);
  }
}

// Export singleton instance
export const projectContextStore = ProjectContextStore.getInstance();
