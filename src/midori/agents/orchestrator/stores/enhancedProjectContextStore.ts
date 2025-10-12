/**
 * Enhanced Project Context Store
 * Store for managing enhanced project context with caching
 */

import { EnhancedProjectContextService } from '../services/enhancedProjectContextService';
import type {
  EnhancedProjectContextData,
  CreateEnhancedProjectContextInput,
  UpdateEnhancedProjectContextInput,
  MigrationOptions,
  MigrationResult
} from '../types/enhancedProjectContext';

interface CacheEntry {
  context: EnhancedProjectContextData;
  timestamp: number;
}

export class EnhancedProjectContextStore {
  private static instance: EnhancedProjectContextStore;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  private constructor() {}
  
  static getInstance(): EnhancedProjectContextStore {
    if (!EnhancedProjectContextStore.instance) {
      EnhancedProjectContextStore.instance = new EnhancedProjectContextStore();
    }
    return EnhancedProjectContextStore.instance;
  }
  
  /**
   * Get enhanced project context (with caching)
   */
  async getEnhancedProjectContext(projectId: string): Promise<EnhancedProjectContextData | null> {
    // Check cache first
    const cached = this.cache.get(projectId);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log(`📦 Using cached enhanced project context for ${projectId}`);
      return cached.context;
    }
    
    // Load from database
    const context = await EnhancedProjectContextService.getEnhancedProjectContext(projectId);
    
    if (context) {
      // Update cache
      this.cache.set(projectId, {
        context,
        timestamp: Date.now()
      });
    }
    
    return context;
  }
  
  /**
   * Create enhanced project context
   */
  async createEnhancedProjectContext(
    input: CreateEnhancedProjectContextInput
  ): Promise<EnhancedProjectContextData> {
    const context = await EnhancedProjectContextService.createEnhancedProjectContext(input);
    
    // Update cache
    this.cache.set(input.projectId, {
      context,
      timestamp: Date.now()
    });
    
    return context;
  }
  
  /**
   * Update enhanced project context
   */
  async updateEnhancedProjectContext(
    input: UpdateEnhancedProjectContextInput
  ): Promise<EnhancedProjectContextData> {
    const context = await EnhancedProjectContextService.updateEnhancedProjectContext(input);
    
    // Update cache
    this.cache.set(input.projectId, {
      context,
      timestamp: Date.now()
    });
    
    return context;
  }
  
  /**
   * Migrate project to component-based
   */
  async migrateToComponentBased(
    projectId: string,
    options?: MigrationOptions
  ): Promise<MigrationResult> {
    const result = await EnhancedProjectContextService.migrateToComponentBased(projectId, options);
    
    if (result.success) {
      // Update cache
      this.cache.set(projectId, {
        context: result.migratedData,
        timestamp: Date.now()
      });
    }
    
    return result;
  }
  
  /**
   * Clear cache for specific project
   */
  clearCache(projectId: string): void {
    this.cache.delete(projectId);
  }
  
  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }
}

