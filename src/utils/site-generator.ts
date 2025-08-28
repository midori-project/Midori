// This file is now deprecated. Please use the refactored modules in ./site-generator/ directory.
// For backward compatibility, we re-export the new SiteGeneratorService.

export { SiteGeneratorService } from './site-generator/index';
export { DEFAULT_GENERATION_OPTIONS } from './site-generator/config';

// Re-export types for backward compatibility
export type { GeneratedFile, SiteGenSession, ProjectTemplate } from '@/types/sitegen';
