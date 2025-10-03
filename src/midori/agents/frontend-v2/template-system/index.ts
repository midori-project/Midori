/**
 * Template System for Frontend-V2 Agent
 * Self-contained template system without external dependencies
 */

// Re-export everything from override-system
export * from './override-system';

// Re-export shared blocks
export * from './shared-blocks';

// Re-export business categories
export * from './business-categories';

// Main exports for easy access
export { OverrideSystem, createOverrideSystem } from './override-system';
export { SHARED_BLOCKS } from './shared-blocks';
export { 
  BUSINESS_CATEGORIES
} from './business-categories';
