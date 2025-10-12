/**
 * Component Library
 * Main entry point for component-based architecture
 */

// Export types
export * from './types';

// Export registry
export { ComponentRegistryManager } from './registry';

// Export selector
export { ComponentSelector } from './selector';

// Export renderer
export { ComponentRenderer } from './renderer';

// Export file storage
export { FileStorageService } from './fileStorage';

// Export components
export { HERO_COMPONENTS } from './components/hero';
export { NAVBAR_COMPONENTS } from './components/navbar';
export { FOOTER_COMPONENTS } from './components/footer';
export { MENU_COMPONENTS } from './components/menu';
export { ABOUT_COMPONENTS } from './components/about';
export { CONTACT_COMPONENTS } from './components/contact';

// Re-export for convenience
import { ComponentRegistryManager } from './registry';
import { ComponentSelector } from './selector';
import { ComponentRenderer } from './renderer';
import { FileStorageService } from './fileStorage';
import { HERO_COMPONENTS } from './components/hero';
import { NAVBAR_COMPONENTS } from './components/navbar';
import { FOOTER_COMPONENTS } from './components/footer';
import { MENU_COMPONENTS } from './components/menu';
import { ABOUT_COMPONENTS } from './components/about';
import { CONTACT_COMPONENTS } from './components/contact';

/**
 * Initialize component library
 */
export function initializeComponentLibrary(): void {
  const registry = ComponentRegistryManager.getInstance();
  
  // Register all component categories
  registry.registerComponents(HERO_COMPONENTS);
  registry.registerComponents(NAVBAR_COMPONENTS);
  registry.registerComponents(FOOTER_COMPONENTS);
  registry.registerComponents(MENU_COMPONENTS);
  registry.registerComponents(ABOUT_COMPONENTS);
  registry.registerComponents(CONTACT_COMPONENTS);
  
  // Log summary
  const metadata = registry.getMetadata();
  const categories = registry.getCategories();
  console.log('✅ Component Library initialized:', {
    components: metadata.totalComponents,
    variants: metadata.totalVariants,
    categories: Array.from(categories.keys())
  });
}

/**
 * Get component library instance
 */
export function getComponentLibrary() {
  return ComponentRegistryManager.getInstance();
}

/**
 * Get component selector instance
 */
export function getComponentSelector() {
  return new ComponentSelector();
}

/**
 * Get component renderer instance
 */
export function getComponentRenderer() {
  return ComponentRenderer.getInstance();
}

/**
 * Get file storage service instance
 */
export function getFileStorageService() {
  return FileStorageService.getInstance();
}

// Auto-initialize on import (optional)
// initializeComponentLibrary();

