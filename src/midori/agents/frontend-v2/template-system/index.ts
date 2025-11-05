/**
 * Template System for Frontend-V2 Agent
 * Self-contained template system without external dependencies
 */

// Re-export everything from override-system
export * from './override-system';

// Re-export shared blocks (excluding FontPool to avoid conflict)
export type {
  SharedBlock,
  PlaceholderConfig,
  BlockVariant
} from './shared-blocks';

export {
  SHARED_BLOCKS,
  getSharedBlock,
  getSharedBlocksByCategory
} from './shared-blocks';

// Re-export font presets (excluding FontPool)
export {
  FONT_PRESETS,
  getFontConfig,
  getFontsByCategory,
  getFontsByTone,
  selectFontForTone,
  getRandomFontFromPool
} from './shared-blocks';

// Re-export business categories
export * from './business-categories';

// Re-export project templates
export * from './project-templates';

// Re-export project structure generator
export * from './project-structure-generator';

// Main exports for easy access
export { OverrideSystem, createOverrideSystem } from './override-system';
export { 
  BUSINESS_CATEGORIES
} from './business-categories';
export { PROJECT_TEMPLATES, getProjectTemplate, getProjectTemplateByType } from './project-templates';
export { ProjectStructureGenerator, createProjectStructureGenerator } from './project-structure-generator';
