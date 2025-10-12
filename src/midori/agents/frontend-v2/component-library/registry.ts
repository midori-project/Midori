/**
 * Component Registry
 * Central registry for all available components
 */

import type {
  ComponentDefinition,
  ComponentVariant,
  ComponentRegistry,
  RegistryMetadata,
  RegistryStatistics
} from './types';

export class ComponentRegistryManager {
  private static instance: ComponentRegistryManager;
  private registry: ComponentRegistry;
  
  private constructor() {
    this.registry = {
      components: new Map(),
      variants: new Map(),
      categories: new Map(),
      tags: new Map(),
      metadata: {
        version: '1.0.0',
        totalComponents: 0,
        totalVariants: 0,
        lastUpdated: new Date().toISOString(),
        statistics: {
          mostPopular: [],
          highestRated: [],
          mostUsed: [],
          recentlyAdded: []
        }
      }
    };
  }
  
  static getInstance(): ComponentRegistryManager {
    if (!ComponentRegistryManager.instance) {
      ComponentRegistryManager.instance = new ComponentRegistryManager();
    }
    return ComponentRegistryManager.instance;
  }
  
  // ============================
  // Component Management
  // ============================
  
  /**
   * Register a new component
   */
  registerComponent(component: ComponentDefinition): void {
    // Validate component
    this.validateComponent(component);
    
    // Ensure component has complete metadata
    if (!component.metadata) {
      component.metadata = {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        author: 'system',
        popularity: 0.5,
        rating: 4.0,
        downloads: 0,
        usageCount: 0
      };
    }
    
    // Ensure variants have complete metadata
    if (component.variants) {
      component.variants.forEach(variant => {
        if (!variant.metadata) {
          variant.metadata = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0',
            popularity: 0.5,
            usageCount: 0
          };
        }
      });
    }
    
    // Add to components map
    this.registry.components.set(component.id, component);
    
    // Add variants
    this.registry.variants.set(component.id, component.variants);
    
    // Index by category
    if (!this.registry.categories.has(component.category)) {
      this.registry.categories.set(component.category, []);
    }
    this.registry.categories.get(component.category)!.push(component.id);
    
    // Index by tags
    component.tags.forEach(tag => {
      if (!this.registry.tags.has(tag)) {
        this.registry.tags.set(tag, []);
      }
      this.registry.tags.get(tag)!.push(component.id);
    });
    
    // Update metadata
    this.updateMetadata();
    
    console.log(`✅ Registered component: ${component.id}`);
  }
  
  /**
   * Register multiple components
   */
  registerComponents(components: ComponentDefinition[]): void {
    components.forEach(component => this.registerComponent(component));
  }
  
  /**
   * Get component by ID
   */
  getComponent(id: string): ComponentDefinition | undefined {
    return this.registry.components.get(id);
  }
  
  /**
   * Get all components
   */
  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.registry.components.values());
  }
  
  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentDefinition[] {
    const componentIds = this.registry.categories.get(category) || [];
    return componentIds
      .map(id => this.registry.components.get(id))
      .filter(Boolean) as ComponentDefinition[];
  }
  
  /**
   * Get components by tag
   */
  getComponentsByTag(tag: string): ComponentDefinition[] {
    const componentIds = this.registry.tags.get(tag) || [];
    return componentIds
      .map(id => this.registry.components.get(id))
      .filter(Boolean) as ComponentDefinition[];
  }
  
  /**
   * Search components
   */
  searchComponents(query: string): ComponentDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllComponents().filter(component => 
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // ============================
  // Variant Management
  // ============================
  
  /**
   * Get variants for a component
   */
  getVariants(componentId: string): ComponentVariant[] {
    return this.registry.variants.get(componentId) || [];
  }
  
  /**
   * Get specific variant
   */
  getVariant(componentId: string, variantId: string): ComponentVariant | undefined {
    const variants = this.getVariants(componentId);
    return variants.find(v => v.id === variantId);
  }
  
  /**
   * Add variant to component
   */
  addVariant(componentId: string, variant: ComponentVariant): void {
    const component = this.getComponent(componentId);
    if (!component) {
      throw new Error(`Component not found: ${componentId}`);
    }
    
    // Add to component
    component.variants.push(variant);
    
    // Update variants map
    const variants = this.registry.variants.get(componentId) || [];
    variants.push(variant);
    this.registry.variants.set(componentId, variants);
    
    // Update metadata
    this.updateMetadata();
    
    console.log(`✅ Added variant ${variant.id} to component ${componentId}`);
  }
  
  // ============================
  // Statistics & Analytics
  // ============================
  
  /**
   * Get registry statistics
   */
  getStatistics(): RegistryStatistics {
    // Get most popular components
    const componentsByPopularity = this.getAllComponents()
      .sort((a, b) => (b.metadata?.popularity || 0) - (a.metadata?.popularity || 0))
      .slice(0, 10)
      .map(c => c.id);
    
    // Get highest rated components
    const componentsByRating = this.getAllComponents()
      .sort((a, b) => (b.metadata?.rating || 0) - (a.metadata?.rating || 0))
      .slice(0, 10)
      .map(c => c.id);
    
    // Get most used components
    const componentsByUsage = this.getAllComponents()
      .sort((a, b) => (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0))
      .slice(0, 10)
      .map(c => c.id);
    
    // Get recently added components
    const componentsByDate = this.getAllComponents()
      .sort((a, b) => 
        new Date(b.metadata?.createdAt || 0).getTime() - new Date(a.metadata?.createdAt || 0).getTime()
      )
      .slice(0, 10)
      .map(c => c.id);
    
    return {
      mostPopular: componentsByPopularity,
      highestRated: componentsByRating,
      mostUsed: componentsByUsage,
      recentlyAdded: componentsByDate
    };
  }
  
  /**
   * Get metadata
   */
  getMetadata(): RegistryMetadata {
    return { ...this.registry.metadata };
  }
  
  /**
   * Get categories map
   */
  getCategories(): Map<string, string[]> {
    return this.registry.categories;
  }
  
  /**
   * Track component usage
   */
  trackUsage(componentId: string, variantId?: string): void {
    const component = this.getComponent(componentId);
    if (!component) return;
    
    // Update component usage count
    component.metadata.usageCount++;
    
    // Update variant usage count
    if (variantId) {
      const variant = this.getVariant(componentId, variantId);
      if (variant) {
        variant.metadata.usageCount++;
      }
    }
    
    // Update statistics
    this.registry.metadata.statistics = this.getStatistics();
  }
  
  /**
   * Rate component
   */
  rateComponent(componentId: string, rating: number): void {
    const component = this.getComponent(componentId);
    if (!component) return;
    
    // Update rating (simple average for now)
    const currentRating = component.metadata.rating;
    const totalRatings = component.metadata.downloads || 1;
    component.metadata.rating = (currentRating * totalRatings + rating) / (totalRatings + 1);
    
    // Update statistics
    this.registry.metadata.statistics = this.getStatistics();
  }
  
  // ============================
  // Validation
  // ============================
  
  private validateComponent(component: ComponentDefinition): void {
    if (!component.id) {
      throw new Error('Component ID is required');
    }
    
    if (!component.name) {
      throw new Error('Component name is required');
    }
    
    if (!component.category) {
      throw new Error('Component category is required');
    }
    
    if (!component.variants || component.variants.length === 0) {
      throw new Error('Component must have at least one variant');
    }
    
    // Validate variants
    component.variants.forEach((variant, index) => {
      if (!variant.id) {
        throw new Error(`Variant ${index} is missing ID`);
      }
      if (!variant.template) {
        throw new Error(`Variant ${variant.id} is missing template`);
      }
    });
  }
  
  private updateMetadata(): void {
    this.registry.metadata.totalComponents = this.registry.components.size;
    this.registry.metadata.totalVariants = Array.from(this.registry.variants.values())
      .reduce((sum, variants) => sum + variants.length, 0);
    this.registry.metadata.lastUpdated = new Date().toISOString();
    this.registry.metadata.statistics = this.getStatistics();
  }
  
  // ============================
  // Export/Import
  // ============================
  
  /**
   * Export registry as JSON
   */
  exportRegistry(): string {
    const exportData = {
      components: Array.from(this.registry.components.entries()),
      metadata: this.registry.metadata
    };
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Import registry from JSON
   */
  importRegistry(json: string): void {
    try {
      const data = JSON.parse(json);
      
      // Clear current registry
      this.registry.components.clear();
      this.registry.variants.clear();
      this.registry.categories.clear();
      this.registry.tags.clear();
      
      // Import components
      data.components.forEach(([id, component]: [string, ComponentDefinition]) => {
        this.registerComponent(component);
      });
      
      console.log(`✅ Imported ${this.registry.components.size} components`);
    } catch (error) {
      console.error('Failed to import registry:', error);
      throw error;
    }
  }
  
  /**
   * Reset registry
   */
  reset(): void {
    this.registry.components.clear();
    this.registry.variants.clear();
    this.registry.categories.clear();
    this.registry.tags.clear();
    this.updateMetadata();
  }
}

